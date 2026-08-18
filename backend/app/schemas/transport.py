"""Transport boundary contracts. Owner: Rudra; semantics: Smarak."""
from enum import Enum

from pydantic import Field, model_validator

from app.schemas.common import ContractModel


class DataTier(str, Enum):
    """Transport freshness tiers plus honest unavailable/unknown state."""

    STATIC = "static"
    SCHEDULED = "scheduled"
    LIVE = "live"
    UNKNOWN = "unknown"


class TransportLeg(ContractModel):
    mode: str
    detail: str
    provider: str | None = None
    route: str | None = None


class TransportHopContract(ContractModel):
    """One planning unit between two itinerary stops."""

    # ``0`` is the deterministic sentinel for a non-itinerary start origin.
    from_sequence: int = Field(ge=0)
    to_sequence: int = Field(ge=1)
    mode: str
    estimated_minutes: int | None = Field(default=None, ge=0)
    estimated_cost: float | None = Field(default=None, ge=0)
    legs: list[TransportLeg] = Field(default_factory=list)
    data_tier: DataTier
    reason: str | None = None

    @model_validator(mode="after")
    def unavailable_hop_requires_reason(self):
        """Keep the executable contract aligned with the documented failure state."""
        if self.mode == "unavailable" and not self.reason:
            raise ValueError("unavailable transport hops require a reason")
        return self


class ProviderStatusContract(ContractModel):
    provider_id: str
    data_tier: DataTier
    notes: str | None = None
