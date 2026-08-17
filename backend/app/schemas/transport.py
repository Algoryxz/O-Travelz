"""Transport boundary contracts. Owner: Rudra; semantics: Smarak."""
from enum import Enum

from pydantic import Field

from app.schemas.common import ContractModel


class DataTier(str, Enum):
    """The only approved transport freshness tiers."""

    STATIC = "static"
    SCHEDULED = "scheduled"
    LIVE = "live"


class TransportLeg(ContractModel):
    mode: str
    detail: str
    provider: str | None = None
    route: str | None = None


class TransportHopContract(ContractModel):
    """One planning unit between two itinerary stops."""

    from_sequence: int = Field(ge=1)
    to_sequence: int = Field(ge=1)
    mode: str
    estimated_minutes: int | None = Field(default=None, ge=0)
    estimated_cost: float | None = Field(default=None, ge=0)
    legs: list[TransportLeg] = Field(default_factory=list)
    data_tier: DataTier
    reason: str | None = None


class ProviderStatusContract(ContractModel):
    provider_id: str
    data_tier: DataTier
    notes: str | None = None
