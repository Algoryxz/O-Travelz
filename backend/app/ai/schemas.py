"""Provider-neutral AI boundary contracts.

The models in this module are deliberately small.  They describe the AI
orchestration boundary, while itinerary and transport facts remain owned by
the shared deterministic contracts.
"""
from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Any, Literal

from pydantic import Field, model_validator

from app.schemas.common import ContractModel, PlaceSummary, PlanningConstraints
from app.schemas.itinerary import ItineraryResponse
from app.schemas.transport import ProviderStatusContract, TransportHopContract


class SearchPlacesArgs(ContractModel):
    interests: list[str] = Field(default_factory=list)
    area: str | None = None
    query: str | None = None
    district: str | None = None
    category: str | None = None
    is_medical: bool | None = None
    is_transit: bool | None = None
    near_lat: float | None = None
    near_lon: float | None = None
    radius_km: float | None = None
    limit: int = 10
    constraints: PlanningConstraints | None = None



class SearchPlacesResult(ContractModel):
    places: list[PlaceSummary] = Field(default_factory=list)


class BuildItineraryArgs(ContractModel):
    constraints: PlanningConstraints
    candidate_places: list[PlaceSummary] = Field(default_factory=list)


class BuildItineraryResult(ItineraryResponse):
    """Structured result supplied to the explanation layer."""


class PlanTransportHopArgs(ContractModel):
    from_place: PlaceSummary
    to_place: PlaceSummary
    constraints: PlanningConstraints
    # Defaults preserve the Phase 3 two-stop tool call while allowing itinerary
    # generation to propagate its actual sequence context.
    from_sequence: int = Field(default=1, ge=0)
    to_sequence: int = Field(default=2, ge=1)


class PlanTransportHopResult(TransportHopContract):
    """Structured transport result supplied to the explanation layer."""


class GetPlaceDetailsArgs(ContractModel):
    place_id: str


class GetProviderStatusArgs(ContractModel):
    provider_id: str


class GetProviderStatusResult(ProviderStatusContract):
    """Provider status result supplied to the explanation layer."""


class GetWeatherArgs(ContractModel):
    location: str | None = None
    lat: float | None = None
    lon: float | None = None
    date: str | None = None


class EstimateCrowdArgs(ContractModel):
    place_id: str | None = None
    place_name: str | None = None
    arrival_datetime: str | None = None
    arrival_time: str | None = None
    avoid_crowds: bool | None = None
    weather_context: dict[str, Any] | None = None


class GetTransitOptionsArgs(ContractModel):
    origin_id: str | None = None
    destination_id: str | None = None
    origin_name: str | None = None
    destination_name: str | None = None
    preferred_mode: str | None = None


class ReplaceItineraryStopArgs(ContractModel):
    itinerary: dict[str, Any] | None = None
    day_number: int = 1
    stop_sequence: int = 1
    reason: str = "user_request"
    preference_overrides: dict[str, Any] | None = None


class GetNearbyServicesArgs(ContractModel):
    lat: float
    lon: float
    category: str | None = None
    subcategory: str | None = None
    radius_km: float = 5.0
    limit: int = 10


class GetDestinationSafetyArgs(ContractModel):
    destination_id_or_name: str


class AIStatus(str, Enum):
    SUCCESS = "success"
    CLARIFICATION = "clarification"
    UNSUPPORTED = "unsupported"
    ERROR = "error"


class ResponseFraming(str, Enum):
    """Finite non-factual framing choices for the grounded response."""

    GROUNDED_RESULT = "grounded_result"
    GROUNDED_TRANSPORT = "grounded_transport"


class IntentKind(str, Enum):
    PLANNING = "planning"
    REFINEMENT = "refinement"
    CLARIFICATION = "clarification"
    UNSUPPORTED = "unsupported"


class Clarification(ContractModel):
    question: str = Field(min_length=1)
    reason: str | None = None


class ConstraintUpdate(ContractModel):
    """Patch-shaped constraints used only for refinement.

    ``exclude_unset`` lets a refinement explicitly clear nullable fields while
    keeping omitted fields unchanged.
    """

    days: int | None = Field(default=None, ge=1)
    interests: list[str] | None = None
    dates: list[date] | None = None
    start: str | None = None
    pace: str | None = None
    budget_transport_per_day: float | None = Field(default=None, ge=0)
    mobility: str | None = None
    avoid_crowds: bool | None = None
    low_walking: bool | None = None
    vegetarian: bool | None = None
    budget_conscious: bool | None = None
    public_transport_preferred: bool | None = None
    travel_party: str | None = None


class ToolCall(ContractModel):
    name: Literal[
        "build_itinerary",
        "plan_transport_hop",
        "get_provider_status",
        "search_places",
        "get_weather",
        "estimate_crowd",
        "get_transit_options",
        "replace_itinerary_stop",
    ]
    arguments: dict[str, Any] = Field(default_factory=dict)





class AIIntent(ContractModel):
    kind: IntentKind
    constraints: PlanningConstraints | None = None
    constraint_update: ConstraintUpdate | None = None
    tool_calls: list[ToolCall] = Field(default_factory=list)
    clarification: Clarification | None = None
    reason: str | None = None

    @model_validator(mode="after")
    def validate_kind_payload(self):
        if self.kind is IntentKind.PLANNING and self.constraints is None:
            raise ValueError("planning intents require constraints")
        if self.kind is IntentKind.REFINEMENT and self.constraint_update is None:
            raise ValueError("refinement intents require a constraint_update")
        if self.kind is IntentKind.CLARIFICATION and self.clarification is None:
            raise ValueError("clarification intents require clarification details")
        if self.kind is IntentKind.UNSUPPORTED and not self.reason:
            raise ValueError("unsupported intents require a reason")
        return self


class AIResponse(ContractModel):
    """Conversational envelope; the itinerary is the canonical shared model."""

    message: str
    itinerary: ItineraryResponse | None = None
    clarification: Clarification | None = None
    status: AIStatus
    changed_constraints: PlanningConstraints | None = None


class AIPlanRequest(ContractModel):
    message: str = Field(min_length=1)
    constraints: PlanningConstraints | None = None
    current_constraints: PlanningConstraints | None = None

    @model_validator(mode="after")
    def resolve_constraints_alias(self) -> AIPlanRequest:
        if self.constraints is None and self.current_constraints is not None:
            self.constraints = self.current_constraints
        return self




class ModelClaim(ContractModel):
    """A model-selected fact that must be checked against current-turn context."""

    fact_id: str
    value: Any


class ModelResponse(ContractModel):
    """Structured final response from a provider-neutral model.

    Factual content is represented only by ``claims``.  ``framing`` is a finite
    non-factual choice rendered by the grounding boundary.  ``message`` is kept
    as an accepted, untrusted compatibility input for scripted models, but is
    deliberately ignored and never reaches the public response.
    """

    framing: ResponseFraming = ResponseFraming.GROUNDED_RESULT
    message: str | None = None
    claims: list[ModelClaim] = Field(default_factory=list)


class AppDestinationContext(ContractModel):
    id: str | None = Field(default=None, max_length=100)
    name: str | None = Field(default=None, max_length=200)
    category: str | None = Field(default=None, max_length=100)
    district: str | None = Field(default=None, max_length=100)
    region: str | None = Field(default=None, max_length=100)


class AppMapContext(ContractModel):
    mode: str | None = Field(default=None, max_length=50)
    selected_place: AppDestinationContext | None = None
    selected_route_id: str | None = Field(default=None, max_length=100)
    selected_route_name: str | None = Field(default=None, max_length=200)
    selected_stop_id: str | None = Field(default=None, max_length=100)
    selected_stop_name: str | None = Field(default=None, max_length=200)
    region: str | None = Field(default=None, max_length=100)


class AppPlannerContext(ContractModel):
    days: int | None = Field(default=None, ge=1, le=30)
    start: str | None = Field(default=None, max_length=200)
    interests: list[str] = Field(default_factory=list)
    anchor_place: AppDestinationContext | None = None


class AppLocationContext(ContractModel):
    locality: str | None = Field(default=None, max_length=200)
    city: str | None = Field(default=None, max_length=100)
    district: str | None = Field(default=None, max_length=100)
    location_type: str | None = Field(default=None, max_length=50)


class AppSavedSummaryContext(ContractModel):
    saved_count: int = Field(default=0, ge=0)
    sample_places: list[str] = Field(default_factory=list)


class AppContextPayload(ContractModel):
    page: str | None = Field(default=None, max_length=100)
    destination: AppDestinationContext | None = None
    map: AppMapContext | None = None
    planner: AppPlannerContext | None = None
    location: AppLocationContext | None = None
    saved: AppSavedSummaryContext | None = None
