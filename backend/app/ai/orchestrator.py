"""Provider-neutral orchestration over validated deterministic tools."""
from __future__ import annotations

from typing import Any

from pydantic import ValidationError

from app.ai.grounding import GroundingBoundary, GroundingContext
from app.ai.model import ModelAdapter
from app.ai.schemas import (
    AIIntent,
    AIResponse,
    AIStatus,
    Clarification,
    IntentKind,
    PlanningConstraints,
)
from app.ai.schemas import ModelResponse
from app.ai.tools import BuildItineraryTool, GetProviderStatusTool, PlanTransportHopTool, SearchPlacesTool, ToolStatus


class AIOrchestrator:
    SUPPORTED_CONSTRAINT_FIELDS = {"days", "interests", "dates", "start"}

    def __init__(
        self,
        model: ModelAdapter,
        *,
        build_itinerary: BuildItineraryTool,
        plan_transport_hop: PlanTransportHopTool,
        get_provider_status: GetProviderStatusTool,
        search_places: SearchPlacesTool | None = None,
        grounding: GroundingBoundary | None = None,
    ):
        self.model = model
        self.tools: dict[str, Any] = {
            "build_itinerary": build_itinerary,
            "plan_transport_hop": plan_transport_hop,
            "get_provider_status": get_provider_status,
        }
        if search_places is not None:
            self.tools["search_places"] = search_places
        self.grounding = grounding or GroundingBoundary()

    def orchestrate(
        self,
        user_message: str,
        existing_constraints: PlanningConstraints | None = None,
    ) -> AIResponse:
        context = GroundingContext()
        try:
            raw_intent = self.model.parse_intent(user_message, existing_constraints)
        except Exception:
            return AIResponse(
                status=AIStatus.ERROR,
                message="The model adapter failed while parsing intent, so no deterministic action was taken.",
            )
        try:
            intent = AIIntent.model_validate(raw_intent)
        except (ValidationError, TypeError, ValueError):
            return AIResponse(
                status=AIStatus.ERROR,
                message="The model returned invalid structured intent, so no deterministic action was taken.",
            )

        if intent.kind is IntentKind.CLARIFICATION:
            return AIResponse(
                status=AIStatus.CLARIFICATION,
                message=intent.clarification.question,
                clarification=intent.clarification,
            )
        if intent.kind is IntentKind.UNSUPPORTED:
            clarification = Clarification(
                question="Would you like to continue with the supported planner options?",
                reason=intent.reason,
            )
            return AIResponse(status=AIStatus.UNSUPPORTED, message=intent.reason or "That capability is not supported.", clarification=clarification)

        effective, constraint_error = self._effective_constraints(intent, existing_constraints)
        if constraint_error:
            return AIResponse(status=AIStatus.UNSUPPORTED, message=constraint_error)

        has_approved_tool = any(call.name in self.tools for call in intent.tool_calls)
        if not has_approved_tool:
            return AIResponse(
                status=AIStatus.CLARIFICATION,
                message="I need a validated tool decision before I can fulfill this request.",
                clarification=Clarification(
                    question="Should I build an itinerary or search places with these supported constraints?",
                    reason="The model did not select an approved tool.",
                ),
            )

        for call in intent.tool_calls:
            if call.name not in self.tools:
                continue
            raw_args: Any = call.arguments
            if call.name == "build_itinerary":
                # Canonicalize constraints at the orchestration boundary.
                raw_args = {"constraints": effective.model_dump(mode="json"), "candidate_places": []}
            result = self.tools[call.name].execute(raw_args)
            context.record(result)
            if result.status in {ToolStatus.INVALID, ToolStatus.ERROR}:
                status = AIStatus.CLARIFICATION if result.status is ToolStatus.INVALID else AIStatus.ERROR
                return AIResponse(status=status, message=result.reason or "The deterministic planner could not complete the request.")


        try:
            raw_response = self.model.generate_response(context.snapshot())
        except Exception:
            return AIResponse(
                status=AIStatus.ERROR,
                message="The model adapter failed while generating a response.",
            )
        try:
            draft = ModelResponse.model_validate(raw_response)
        except (ValidationError, TypeError, ValueError):
            return AIResponse(status=AIStatus.ERROR, message="The model returned invalid structured response data.")

        itinerary = context.itinerary
        message = self.grounding.ground(draft, context)
        return AIResponse(
            status=AIStatus.SUCCESS,
            message=message,
            itinerary=itinerary,
            changed_constraints=effective if intent.kind is IntentKind.REFINEMENT else None,
        )

    def _effective_constraints(
        self,
        intent: AIIntent,
        existing_constraints: PlanningConstraints | None,
    ) -> tuple[PlanningConstraints, str | None]:
        if intent.kind is IntentKind.PLANNING:
            constraints = intent.constraints
        else:
            if existing_constraints is None:
                return PlanningConstraints(days=1), "A refinement needs an existing itinerary or its constraints."
            update = intent.constraint_update
            values = existing_constraints.model_dump(mode="python")
            values.update(update.model_dump(mode="python", exclude_unset=True))
            constraints = PlanningConstraints.model_validate(values)

        unsupported = [
            field
            for field in ("pace", "budget_transport_per_day", "mobility")
            if getattr(constraints, field) not in (None, [], "")
        ]
        if unsupported:
            return constraints, "The current planner cannot optimize these preferences yet: " + ", ".join(unsupported) + "."
        return constraints, None
