"""
Common interface every provider adapter implements. Owner: Rudra.
See docs/transportation/00-transport-model.md.

An adapter's job is to normalize whatever data actually exists for a provider (static
topology, a real timetable, or -- only if verified in docs/transportation/01-providers.md
-- live status) into this shape. Adapters must report their data_tier honestly; a
provider verified as static/estimate-only must not implement get_live_status.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Iterable

# The model module is imported through the repository's established SQLAlchemy import
# hub before consuming its enum (direct model imports are cyclic by design there).
from app.db.base import Base as _ModelBase  # noqa: F401
from app.models.transport import DataTier


@dataclass(frozen=True)
class NormalizedStop:
    """A provider stop after source data has been normalized, not geocoded."""

    id: str
    name: str
    latitude: float | None = None
    longitude: float | None = None


@dataclass(frozen=True)
class NormalizedRoute:
    """Verified ordered topology. ``stop_ids`` is never inferred from names."""

    id: str
    name: str
    stop_ids: tuple[str, ...]
    estimated_minutes_per_segment: int | None = None


class TransportAdapter(ABC):
    provider_name: str
    transport_mode: str = "bus"

    @abstractmethod
    def get_stops(self) -> list[NormalizedStop]:
        """Return this provider's known stops."""

    @abstractmethod
    def get_routes(self) -> list[NormalizedRoute]:
        """Return this provider's known routes (topology: ordered stop sequence)."""

    @abstractmethod
    def get_data_tier(self) -> DataTier:
        """Return the honest data tier for this provider, per docs/transportation/01-providers.md."""

    @abstractmethod
    def estimate_fare(self, from_stop: str, to_stop: str) -> dict | None:
        """Return a verified fare payload, or ``None`` when fare is unknown."""

    # Intentionally NOT abstract: only implement in a subclass if the provider is
    # verified to expose live data in docs/transportation/01-providers.md.
    def get_live_status(self):
        raise NotImplementedError(
            f"{self.provider_name} has no verified live data source; "
            "see docs/transportation/01-providers.md before implementing this."
        )
