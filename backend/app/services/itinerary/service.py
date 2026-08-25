"""Deterministic facts-only itinerary generation for Phase 4."""
from __future__ import annotations

import hashlib
import json
from datetime import date
from typing import Protocol

from app.ai.schemas import PlanTransportHopArgs
from app.schemas.common import PlaceSummary, PlanningConstraints
from app.schemas.itinerary import ItineraryDayContract, ItineraryResponse, ItineraryStopContract
from app.schemas.transport import TransportHopContract
from app.services.ranking import PlaceRepository, RankingService, RankedPlace, VerifiedPlace


class TransportHopPlanner(Protocol):
    def plan_transport_hop(self, args: PlanTransportHopArgs) -> TransportHopContract: ...


class ItineraryPlanningError(RuntimeError):
    """A complete planning failure, distinct from an unavailable individual hop."""

    def __init__(self, code: str, message: str, field: str | None = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.field = field


class ItineraryService:
    MAX_STOPS_PER_DAY = 3

    def __init__(
        self,
        repository: PlaceRepository,
        transport_service: TransportHopPlanner,
        ranking_service: RankingService | None = None,
    ):
        self.repository = repository
        self.transport_service = transport_service
        self.ranking_service = ranking_service or RankingService()

    def plan(self, constraints: PlanningConstraints) -> ItineraryResponse:
        all_places = self.repository.list_verified_places()
        ranked = self.ranking_service.rank(
            constraints,
            all_places,
        )
        eligible = self._unique_coordinate_places(ranked)
        selected = eligible[: constraints.days * self.MAX_STOPS_PER_DAY]
        if not selected:
            # Fallback to general verified coordinate places if interest filtering was too narrow
            all_coords = [p for p in all_places if p.coordinate is not None]
            if all_coords:
                from app.services.ranking import RankedPlace
                fallback_ranked = tuple(RankedPlace(place=p, relevance=0) for p in all_coords)
                eligible = self._unique_coordinate_places(fallback_ranked)
                selected = eligible[: constraints.days * self.MAX_STOPS_PER_DAY]

        if not selected:
            raise ItineraryPlanningError(
                "no_feasible_candidates",
                "No verified coordinate-bearing places are available for a routed itinerary.",
            )

        start = self._resolve_start(constraints.start)
        days = [
            ItineraryDayContract(
                day_number=day_number,
                date=self._date_for_day(constraints, day_number),
                stops=[],
                hops=[],
            )
            for day_number in range(1, constraints.days + 1)
        ]

        for index, ranked_place in enumerate(selected):
            day = days[index // self.MAX_STOPS_PER_DAY]
            sequence = (index % self.MAX_STOPS_PER_DAY) + 1
            day.stops.append(
                ItineraryStopContract(
                    sequence=sequence,
                    place=ranked_place.place.to_summary(),
                    planned_arrival=None,
                    planned_departure=None,
                )
            )

        if start is not None:
            first = days[0].stops[0]
            days[0].hops.append(
                self._plan_hop(
                    from_place=start.to_summary(),
                    to_place=first.place,
                    constraints=constraints,
                    from_sequence=0,
                    to_sequence=first.sequence,
                )
            )

        for day in days:
            for previous, following in zip(day.stops, day.stops[1:]):
                day.hops.append(
                    self._plan_hop(
                        from_place=previous.place,
                        to_place=following.place,
                        constraints=constraints,
                        from_sequence=previous.sequence,
                        to_sequence=following.sequence,
                    )
                )

        return ItineraryResponse(
            itinerary_id=self._itinerary_id(constraints, selected, start),
            constraints=constraints,
            days=days,
            # Phase 4 is facts-only. Phase 5 may later populate grounded prose.
            explanation="",
        )

    def _resolve_start(self, value: str | None) -> VerifiedPlace | None:
        if value is None:
            return None
        origin = self.repository.resolve_origin(value)
        if origin is None:
            raise ItineraryPlanningError(
                "invalid_start",
                "The requested start location could not be resolved to one verified place.",
                field="start",
            )
        if origin.coordinate is None:
            raise ItineraryPlanningError(
                "invalid_start",
                "The requested start location has no verified coordinates.",
                field="start",
            )
        return origin

    @staticmethod
    def _unique_coordinate_places(ranked: tuple[RankedPlace, ...]) -> list[RankedPlace]:
        selected: list[RankedPlace] = []
        seen: set[str] = set()
        for candidate in ranked:
            if candidate.place.coordinate is None or candidate.place.database_id in seen:
                continue
            seen.add(candidate.place.database_id)
            selected.append(candidate)
        return selected

    @staticmethod
    def _date_for_day(constraints: PlanningConstraints, day_number: int) -> date | None:
        if constraints.dates is None or day_number > len(constraints.dates):
            return None
        return constraints.dates[day_number - 1]

    def _plan_hop(
        self,
        *,
        from_place: PlaceSummary,
        to_place: PlaceSummary,
        constraints: PlanningConstraints,
        from_sequence: int,
        to_sequence: int,
    ) -> TransportHopContract:
        hop = self.transport_service.plan_transport_hop(
            PlanTransportHopArgs(
                from_place=from_place,
                to_place=to_place,
                constraints=constraints,
                from_sequence=from_sequence,
                to_sequence=to_sequence,
            )
        )
        if (hop.from_sequence, hop.to_sequence) != (from_sequence, to_sequence):
            raise ItineraryPlanningError(
                "transport_contract_mismatch",
                "Transport service returned a hop with incorrect itinerary sequence context.",
            )
        return hop

    @staticmethod
    def _itinerary_id(
        constraints: PlanningConstraints,
        selected: list[RankedPlace],
        start: VerifiedPlace | None,
    ) -> str:
        payload = {
            "constraints": constraints.model_dump(mode="json"),
            "selected": [candidate.place.database_id for candidate in selected],
            "start": start.database_id if start is not None else None,
        }
        encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        return "itinerary-" + hashlib.sha256(encoded).hexdigest()[:24]


def build_itinerary(
    constraints: PlanningConstraints,
    repository: PlaceRepository,
    transport_service: TransportHopPlanner,
) -> ItineraryResponse:
    return ItineraryService(repository, transport_service).plan(constraints)
