"""Transport-hop planning against verified locations and normalized adapters."""
from dataclasses import dataclass
from typing import Protocol

from app.ai.schemas import GetProviderStatusArgs, PlanTransportHopArgs
from app.db.base import Base as _ModelBase  # noqa: F401
from app.models.transport import DataTier as ModelDataTier
from app.schemas.transport import DataTier, ProviderStatusContract, TransportHopContract, TransportLeg
from app.transport.adapters.base import TransportAdapter
from app.transport.adapters.mo_bus import MoBusAdapter
from app.transport.adapters.mo_e_ride import MoERideAdapter
from app.transport.adapters.walking import Coordinate
from app.transport.graph import GraphNode, build_graph, find_path


@dataclass(frozen=True)
class ResolvedPlace:
    id: str
    coordinate: Coordinate | None


class PlaceResolver(Protocol):
    def resolve(self, place_id: str) -> ResolvedPlace | None: ...


class MappingPlaceResolver:
    """Small resolver used by deterministic services and tests."""

    def __init__(self, places: dict[str, Coordinate | None]):
        self._places = places

    def resolve(self, place_id: str) -> ResolvedPlace | None:
        return ResolvedPlace(place_id, self._places[place_id]) if place_id in self._places else None


class SQLAlchemyPlaceResolver:
    """Resolve a persisted Place without supplying a replacement coordinate."""

    def __init__(self, session):
        self._session = session

    def resolve(self, place_id: str) -> ResolvedPlace | None:
        from app.models.place import Place

        place = self._session.get(Place, place_id)
        if place is None:
            return None
        if place.location is None:
            return ResolvedPlace(place_id, None)
        try:
            from geoalchemy2.shape import to_shape

            point = to_shape(place.location)
            return ResolvedPlace(place_id, Coordinate(point.y, point.x))
        except Exception:
            # A malformed/unreadable persisted geometry must not become a route.
            return ResolvedPlace(place_id, None)


def _schema_tier(tier: ModelDataTier) -> DataTier:
    return DataTier(tier.value)


def aggregate_data_tier(tiers: list[ModelDataTier]) -> DataTier:
    """Conservatively preserve the lowest-confidence supporting tier."""
    order = {ModelDataTier.STATIC: 0, ModelDataTier.SCHEDULED: 1, ModelDataTier.LIVE: 2}
    return _schema_tier(min(tiers, key=lambda tier: order[tier])) if tiers else DataTier.STATIC


class ProviderNotAvailableError(LookupError):
    """Public schema cannot truthfully represent an unknown provider capability."""


class TransportService:
    def __init__(self, resolver: PlaceResolver, adapters: list[TransportAdapter] | None = None):
        self.resolver = resolver
        self.adapters = adapters if adapters is not None else [MoBusAdapter(), MoERideAdapter()]

    def get_provider_status(self, args: GetProviderStatusArgs) -> ProviderStatusContract:
        adapter = next((item for item in self.adapters if item.provider_name == args.provider_id), None)
        if adapter is None:
            raise ProviderNotAvailableError(
                f"Provider '{args.provider_id}' is unsupported or has no safely representable verified capability."
            )
        notes = {
            "ama-bus": "Verified static/scheduled source layer; confirmed stops lack routing coordinates and topology.",
            "mo-e-ride": "Verified static/scheduled research only; stop coordinates are unresolved, so routing is unavailable.",
        }.get(adapter.provider_name, "No verified live source is available.")
        try:
            return ProviderStatusContract(provider_id=adapter.provider_name, data_tier=_schema_tier(adapter.get_data_tier()), notes=notes)
        except Exception as error:
            raise ProviderNotAvailableError(
                f"Provider '{adapter.provider_name}' data could not be read; its status is unavailable."
            ) from error

    def plan_transport_hop(self, args: PlanTransportHopArgs) -> TransportHopContract:
        origin = self.resolver.resolve(args.from_place.id)
        destination = self.resolver.resolve(args.to_place.id)
        if origin is None or destination is None:
            return self._unavailable(
                "One or both requested places could not be resolved from verified place data.",
                args.from_sequence,
                args.to_sequence,
            )
        if origin.coordinate is None or destination.coordinate is None:
            return self._unavailable(
                "Routing is unavailable because one or both places have no verified coordinates.",
                args.from_sequence,
                args.to_sequence,
            )

        unsupported_constraints = self._unsupported_transport_constraints(args)
        if unsupported_constraints:
            return self._unavailable(
                "Transport routing cannot yet evaluate these constraints: "
                + ", ".join(unsupported_constraints)
                + ".",
                args.from_sequence,
                args.to_sequence,
            )

        usable: list[TransportAdapter] = []
        failures: list[str] = []
        for adapter in self.adapters:
            try:
                adapter.get_stops()
                adapter.get_routes()
                adapter.get_data_tier()
                usable.append(adapter)
            except Exception:
                failures.append(adapter.provider_name)
        graph = build_graph(GraphNode("place:from", origin.coordinate), GraphNode("place:to", destination.coordinate), usable)
        path = find_path(graph, "place:from", "place:to")
        if path is None:
            suffix = f" Provider data failed for: {', '.join(sorted(failures))}." if failures else ""
            return self._unavailable(
                "No verified transport path connects these places." + suffix,
                args.from_sequence,
                args.to_sequence,
            )
        tiers = [edge.data_tier for edge in path.edges]
        total_minutes = sum(edge.estimated_minutes for edge in path.edges) if all(edge.estimated_minutes is not None for edge in path.edges) else None
        legs = [TransportLeg(mode=edge.mode, detail=edge.detail, provider=edge.provider, route=edge.route) for edge in path.edges]
        modes = [edge.mode for edge in path.edges]
        mode = modes[0] if len(set(modes)) == 1 else "+".join(dict.fromkeys(modes))
        return TransportHopContract(
            from_sequence=args.from_sequence,
            to_sequence=args.to_sequence,
            mode=mode,
            estimated_minutes=total_minutes,
            estimated_cost=None,
            legs=legs,
            data_tier=aggregate_data_tier(tiers),
        )

    @staticmethod
    def _unsupported_transport_constraints(args: PlanTransportHopArgs) -> tuple[str, ...]:
        """Fail closed for transport constraints whose semantics are not approved.

        The shared constraint contract also carries itinerary/ranking inputs such as
        days, interests, dates, and start. Those are intentionally outside this hop
        service. The transport-relevant fields below have no approved cost, mobility,
        or walking-preference semantics, so returning unavailable is safer than
        claiming that the planner enforced them.
        """
        constraints = args.constraints
        unsupported: list[str] = []
        if constraints.budget_transport_per_day is not None:
            unsupported.append("budget_transport_per_day")
        if constraints.mobility:
            unsupported.append("mobility")
        if constraints.pace:
            unsupported.append("pace")
        return tuple(unsupported)

    @staticmethod
    def _unavailable(reason: str, from_sequence: int, to_sequence: int) -> TransportHopContract:
        return TransportHopContract(
            from_sequence=from_sequence,
            to_sequence=to_sequence,
            mode="unavailable",
            estimated_minutes=None,
            estimated_cost=None,
            legs=[],
            data_tier=DataTier.UNKNOWN,
            reason=reason,
        )
