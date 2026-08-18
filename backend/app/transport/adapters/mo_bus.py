"""AMA Bus / Mo Bus normalization for verified, supplied source records.

The Phase 2 AMA import intentionally contains no coordinate-bearing route topology, so
the default adapter is available for status only and contributes no routing edges.
"""
from app.db.base import Base as _ModelBase  # noqa: F401
from app.models.transport import DataTier
from app.transport.adapters.base import NormalizedRoute, NormalizedStop, TransportAdapter


class MoBusAdapter(TransportAdapter):
    provider_name = "ama-bus"

    def __init__(self, stops: list[NormalizedStop] | None = None, routes: list[NormalizedRoute] | None = None):
        self._stops = list(stops or [])
        self._routes = list(routes or [])

    def get_stops(self) -> list[NormalizedStop]:
        return list(self._stops)

    def get_routes(self) -> list[NormalizedRoute]:
        return list(self._routes)

    def get_data_tier(self) -> DataTier:
        return DataTier.SCHEDULED

    def estimate_fare(self, from_stop: str, to_stop: str) -> dict | None:
        return None
