"""Provider-Neutral Multilingual Grounded AI Conversation Orchestrator.

Integrates:
- Canonical Conversation Contracts (ChatMessage, ToolCall, ToolResult, AdapterResponse)
- ToolRegistry & ToolExecutionBoundary (Phase 12 Step 4)
- Multilingual Grounding & Intent Resolution (Odia, Hindi, English, Mixed)
- Deterministic Domain Services (SearchService, ItineraryService, TransportService)
- Zero-Fabrication & Strict Grounding Invariants
"""
from __future__ import annotations

import logging
from typing import Any, List, Optional, Sequence, Union

from pydantic import BaseModel, Field

from app.ai.adapter import AIProviderAdapter, MockProviderAdapter
from app.ai.boundary import ToolExecutionBoundary
from app.ai.contracts import (
    AdapterResponse,
    ChatMessage,
    ChatRole,
    FinishReason,
    ToolCall,
    ToolDefinition,
    ToolResult,
    ToolStatus,
)
from app.ai.grounding import GroundingBoundary, GroundingContext
from app.ai.model import ModelAdapter, RuleBasedModelAdapter
from app.ai.multilingual import (
    detect_language,
    extract_multilingual_days,
    extract_multilingual_interests,
    generate_grounded_itinerary_message,
    generate_grounded_search_message,
    is_refinement_query,
    resolve_multilingual_location,
)
from app.ai.registry import ToolRegistry
from app.ai.schemas import (
    AIIntent,
    AIPlanRequest,
    AIResponse,
    AIStatus,
    AppContextPayload,
    Clarification,
    IntentKind,
    PlanningConstraints,
)
from app.schemas.itinerary import ItineraryResponse
from app.schemas.transport import ProviderStatusContract, TransportHopContract
from app.services.search.search_models import CompactKnowledgeRecord


logger = logging.getLogger(__name__)


class GroundedConversationResponse(BaseModel):
    """Rich structured grounded response returned by the conversational orchestrator."""
    message: str
    status: AIStatus = AIStatus.SUCCESS
    language: str = "en"
    itinerary: Optional[ItineraryResponse] = None
    places: List[Any] = Field(default_factory=list)
    transport: List[TransportHopContract] = Field(default_factory=list)
    provider_status: List[ProviderStatusContract] = Field(default_factory=list)
    tool_calls: List[ToolCall] = Field(default_factory=list)
    tool_results: List[ToolResult] = Field(default_factory=list)
    clarification: Optional[Clarification] = None
    changed_constraints: Optional[PlanningConstraints] = None
    is_grounded: bool = True
    verified_claims: List[str] = Field(default_factory=list)
    unverified_claims: List[str] = Field(default_factory=list)
    grounding_sources: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)



class GroundedConversationOrchestrator:
    """Provider-neutral conversation orchestrator managing multi-turn multilingual travel assistance."""

    def __init__(
        self,
        registry: ToolRegistry,
        boundary: Optional[ToolExecutionBoundary] = None,
        provider_adapter: Optional[AIProviderAdapter] = None,
        model_adapter: Optional[ModelAdapter] = None,
        grounding_boundary: Optional[GroundingBoundary] = None,
    ):
        self.registry = registry
        self.boundary = boundary or ToolExecutionBoundary(registry)
        self.provider_adapter = provider_adapter or MockProviderAdapter()
        self.model_adapter = model_adapter or RuleBasedModelAdapter()
        self.grounding = grounding_boundary or GroundingBoundary()

    def converse(
        self,
        messages: List[ChatMessage],
        existing_constraints: Optional[PlanningConstraints] = None,
        max_tool_turns: int = 5,
        app_context: Optional[AppContextPayload] = None,
    ) -> GroundedConversationResponse:
        """
        Execute a full grounded conversation turn with optional multi-step tool calling and page context.
        """
        if not messages:
            return GroundedConversationResponse(
                message="Please provide a message to begin planning.",
                status=AIStatus.ERROR,
                is_grounded=True,
            )

        # Defend against oversized payloads
        total_len = sum(len(m.content or "") for m in messages)
        if total_len > 100_000:
            return GroundedConversationResponse(
                message="Request payload exceeds maximum allowed size (100,000 characters).",
                status=AIStatus.ERROR,
                is_grounded=True,
            )

        # Extract latest user message
        last_user_msg = next((m.content for m in reversed(messages) if m.role == ChatRole.USER), "")
        if not last_user_msg.strip():
            return GroundedConversationResponse(
                message="Please provide a message to begin planning.",
                status=AIStatus.ERROR,
                is_grounded=True,
            )

        # Resolve initial constraints from planner app_context if not explicitly passed
        if existing_constraints is None and app_context is not None and app_context.planner is not None:
            planner = app_context.planner
            if planner.days or planner.start or planner.interests:
                existing_constraints = PlanningConstraints(
                    days=planner.days or 2,
                    start=planner.start,
                    interests=planner.interests or [],
                )

        detected_lang = detect_language(last_user_msg)

        # 1. Parse intent through model adapter or provider adapter
        try:
            raw_intent = self.model_adapter.parse_intent(last_user_msg, existing_constraints, app_context=app_context)
            intent = AIIntent.model_validate(raw_intent)


        except AIProviderError as p_err:
            logger.warning(f"AI Provider error during intent parsing: {p_err}")
            return GroundedConversationResponse(
                message=p_err.message,
                status=AIStatus.ERROR,
                language=detected_lang,
                is_grounded=True,
            )
        except Exception as err:
            logger.warning(f"Intent parsing error: {err}")
            return GroundedConversationResponse(
                message="The conversation assistant could not parse the request.",
                status=AIStatus.ERROR,
                language=detected_lang,
                is_grounded=False,
            )


        # 2. Handle clarification & unsupported intents
        if intent.kind is IntentKind.CLARIFICATION:
            return GroundedConversationResponse(
                message=intent.clarification.question,
                status=AIStatus.CLARIFICATION,
                language=detected_lang,
                clarification=intent.clarification,
                is_grounded=True,
            )
        if intent.kind is IntentKind.UNSUPPORTED:
            clarification = Clarification(
                question="Would you like to continue with supported options?",
                reason=intent.reason,
            )
            return GroundedConversationResponse(
                message=intent.reason or "That capability is not supported.",
                status=AIStatus.UNSUPPORTED,
                language=detected_lang,
                clarification=clarification,
                is_grounded=True,
            )

        # 3. Resolve effective constraints
        effective_constraints, constraint_err = self._resolve_constraints(intent, existing_constraints)
        if constraint_err:
            return GroundedConversationResponse(
                message=constraint_err,
                status=AIStatus.UNSUPPORTED,
                language=detected_lang,
                is_grounded=True,
            )

        # 4. Execute tool calls through ToolExecutionBoundary
        tool_calls_executed: List[ToolCall] = []
        tool_results_obtained: List[ToolResult] = []
        context = GroundingContext()

        # Build initial tool calls from intent
        calls_to_run: List[ToolCall] = []
        for tc in intent.tool_calls:
            call_name = tc.name
            call_args = tc.arguments or {}
            if call_name == "build_itinerary":
                call_args = {"constraints": effective_constraints.model_dump(mode="json"), "candidate_places": []}
            calls_to_run.append(ToolCall(name=call_name, arguments=call_args))

        # If no tool calls in intent, check if search or itinerary should be triggered
        if not calls_to_run:
            if effective_constraints and (effective_constraints.days > 0 or effective_constraints.interests):
                calls_to_run.append(
                    ToolCall(
                        name="build_itinerary",
                        arguments={"constraints": effective_constraints.model_dump(mode="json"), "candidate_places": []},
                    )
                )

        # Execute all calls safely
        for tc in calls_to_run:
            tool_calls_executed.append(tc)
            res = self.boundary.execute(tc)
            tool_results_obtained.append(res)
            context.record(res)

            if res.status in (ToolStatus.INVALID, ToolStatus.ERROR):
                err_msg = res.reason or res.error or "Tool execution failed."
                return GroundedConversationResponse(
                    message=err_msg,
                    status=AIStatus.CLARIFICATION if res.status == ToolStatus.INVALID else AIStatus.ERROR,
                    language=detected_lang,
                    tool_calls=tool_calls_executed,
                    tool_results=tool_results_obtained,
                    is_grounded=True,
                )

        # 5. Extract domain payloads
        itinerary = context.itinerary
        places = list(context.search_results)
        transport = list(context.transport_results)
        provider_status = list(context.provider_status_results)
        warnings = list(context.warnings)

        # 6. Generate grounded response message in target language
        if itinerary is not None:
            stop_count = sum(len(d.stops) for d in itinerary.days)
            grounded_msg = generate_grounded_itinerary_message(
                language=detected_lang,
                days=len(itinerary.days),
                stop_count=stop_count,
                start_place=effective_constraints.start,
                interests=effective_constraints.interests,
            )
        elif places:
            grounded_msg = generate_grounded_search_message(
                language=detected_lang,
                place_count=len(places),
            )
        elif tool_results_obtained and any(r.tool_name == "get_provider_status" for r in tool_results_obtained):
            p_res = next(r for r in tool_results_obtained if r.tool_name == "get_provider_status")
            grounded_msg = f"Provider status: {p_res.status.value}. {p_res.reason or ''}"
        elif tool_results_obtained and any(r.tool_name == "plan_transport_hop" for r in tool_results_obtained):
            h_res = next(r for r in tool_results_obtained if r.tool_name == "plan_transport_hop")
            grounded_msg = f"Transport hop planned: mode={getattr(h_res.data, 'mode', 'unknown')}."
        # 7. Final Fact Verification & Zero-Fabrication Safety Pass
        try:
            from app.ai.grounding_verifier import GroundingVerifier
            verification = GroundingVerifier.verify_response(
                message=grounded_msg,
                itinerary=itinerary,
                places=places,
                transport=transport,
            )
            grounded_msg = verification.sanitized_message
            verified_claims = verification.verified_claims
            unverified_claims = verification.unverified_claims
            grounding_sources = verification.grounding_sources
            is_grounded = verification.is_grounded
            warnings.extend(verification.warnings)
        except Exception as exc:
            logger.warning(f"Grounding verification exception: {exc}")
            verified_claims = []
            unverified_claims = ["Verification pass encountered an unexpected error."]
            grounding_sources = []
            is_grounded = False
            warnings.append("Grounding verification encountered an internal error.")


        return GroundedConversationResponse(
            message=grounded_msg,
            status=AIStatus.SUCCESS,
            language=detected_lang,
            itinerary=itinerary,
            places=places,
            transport=transport,
            provider_status=provider_status,
            tool_calls=tool_calls_executed,
            tool_results=tool_results_obtained,
            changed_constraints=effective_constraints if intent.kind is IntentKind.REFINEMENT else None,
            is_grounded=is_grounded,
            verified_claims=verified_claims,
            unverified_claims=unverified_claims,
            grounding_sources=grounding_sources,
            warnings=warnings,
        )


    def plan_with_ai(
        self,
        user_message: str,
        existing_constraints: Optional[PlanningConstraints] = None,
    ) -> AIResponse:
        """
        Backward-compatible endpoint method returning standard AIResponse.
        """
        chat_msg = ChatMessage(role=ChatRole.USER, content=user_message)
        conv_res = self.converse([chat_msg], existing_constraints)
        return AIResponse(
            status=conv_res.status,
            message=conv_res.message,
            itinerary=conv_res.itinerary,
            clarification=conv_res.clarification,
            changed_constraints=conv_res.changed_constraints,
        )

    def _resolve_constraints(
        self,
        intent: AIIntent,
        existing_constraints: Optional[PlanningConstraints],
    ) -> tuple[PlanningConstraints, Optional[str]]:
        """Resolve active planning constraints combining initial request and refinements."""
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
