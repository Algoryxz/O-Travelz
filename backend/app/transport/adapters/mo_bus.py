"""AMA Bus / Mo Bus normalization for verified canonical transit network."""
from app.db.base import Base as _ModelBase  # noqa: F401
from app.models.transport import DataTier
from app.transport.adapters.base import NormalizedRoute, NormalizedStop, TransportAdapter


class MoBusAdapter(TransportAdapter):
    provider_name = "ama-bus"

    def __init__(self, stops: list[NormalizedStop] | None = None, routes: list[NormalizedRoute] | None = None):
        if stops is not None or routes is not None:
            self._stops = list(stops or [])
            self._routes = list(routes or [])
        else:
            try:
                from app.transport.canonical_repository import get_canonical_transit_repository
                repo = get_canonical_transit_repository()
                self._stops = [
                    NormalizedStop(
                        id=s.stop_id,
                        name=s.canonical_name,
                        latitude=s.lat,
                        longitude=s.lon,
                    )
                    for s in repo.stops_by_id.values()
                ]
                self._routes = []
                for r_id, seq_list in repo.sequences_by_route_id.items():
                    r = repo.get_route(r_id)
                    r_name = r.route_name if r else r_id
                    for s in seq_list:
                        self._routes.append(
                            NormalizedRoute(
                                id=s.sequence_id,
                                name=f"Route {s.route_number} ({r_name})",
                                stop_ids=tuple(item.stop_id for item in s.stops),
                                estimated_minutes_per_segment=3,
                            )
                        )
            except Exception:
                self._stops = []
                self._routes = []

    def get_stops(self) -> list[NormalizedStop]:
        return list(self._stops)

    def get_routes(self) -> list[NormalizedRoute]:
        return list(self._routes)

    def get_data_tier(self) -> DataTier:
        return DataTier.SCHEDULED

    def estimate_fare(self, from_stop: str, to_stop: str) -> dict | None:
        return None
