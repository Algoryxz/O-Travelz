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
    constraints: PlanningConstraints


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


class ToolCall(ContractModel):
    name: Literal["build_itinerary", "plan_transport_hop", "get_provider_status"]
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
