"""Itinerary request/response contracts. Owner: Smarak."""
from __future__ import annotations

from datetime import date as date_type

from pydantic import Field

from app.schemas.common import ContractModel, PlaceSummary, PlanningConstraints
from app.schemas.transport import TransportHopContract


class ItineraryStopContract(ContractModel):
    sequence: int = Field(ge=1)
    place: PlaceSummary
    planned_arrival: str | None = None
    planned_departure: str | None = None


class ItineraryDayContract(ContractModel):
    day_number: int = Field(ge=1)
    date: date_type | None = None
    stops: list[ItineraryStopContract] = Field(default_factory=list)
    hops: list[TransportHopContract] = Field(default_factory=list)


class ItineraryPlanRequest(PlanningConstraints):
    """Phase 0 request boundary for POST /itinerary/plan.

    The endpoint itself remains a later-phase implementation. API versioning,
    authentication, and error-envelope policy remain OPEN DECISION items.
    """


class ItineraryResponse(ContractModel):
    itinerary_id: str
    constraints: PlanningConstraints
    days: list[ItineraryDayContract] = Field(default_factory=list)
    explanation: str
