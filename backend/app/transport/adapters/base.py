"""
Common interface every provider adapter implements. Owner: Rudra.
See docs/transportation/00-transport-model.md.

An adapter's job is to normalize whatever data actually exists for a provider (static
topology, a real timetable, or -- only if verified in docs/transportation/01-providers.md
-- live status) into this shape. Adapters must report their data_tier honestly; a
provider verified as static/estimate-only must not implement get_live_status.
"""
from abc import ABC, abstractmethod

from app.models.transport import DataTier


class TransportAdapter(ABC):
    provider_name: str

    @abstractmethod
    def get_stops(self) -> list:
        """Return this provider's known stops."""

    @abstractmethod
    def get_routes(self) -> list:
        """Return this provider's known routes (topology: ordered stop sequence)."""

    @abstractmethod
    def get_data_tier(self) -> DataTier:
        """Return the honest data tier for this provider, per docs/transportation/01-providers.md."""

    @abstractmethod
    def estimate_fare(self, from_stop, to_stop) -> dict:
        """Return {"amount": float, "currency": "INR", "basis": str}."""

    # Intentionally NOT abstract: only implement in a subclass if the provider is
    # verified to expose live data in docs/transportation/01-providers.md.
    def get_live_status(self):
        raise NotImplementedError(
            f"{self.provider_name} has no verified live data source; "
            "see docs/transportation/01-providers.md before implementing this."
        )
