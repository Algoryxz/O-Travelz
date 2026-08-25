"""Shared Phase 0 contract primitives. Owner: Smarak."""
from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class ContractModel(BaseModel):
    """Base for boundary models: reject undocumented fields by default."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class PlanningConstraints(ContractModel):
    """Constraint fields already described by the repository documentation."""

    days: int = Field(ge=1)
    interests: list[str] = Field(default_factory=list)
    dates: list[date] | None = None
    pace: str | None = None
    budget_transport_per_day: float | None = Field(default=None, ge=0)
    start: str | None = None
    mobility: str | None = None


class PlaceSummary(ContractModel):
    """The compact place object used by the itinerary response contract."""

    id: str
    name: str
    category: str
