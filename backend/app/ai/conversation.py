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
    AIProviderError,
    ChatMessage,
    ChatRole,
    ClaimType,
    EvidenceItem,
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
    generate_conversational_fallback_message,
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
    intent: Optional[str] = None
    constraints: Optional[PlanningConstraints] = None
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
    evidence_items: List[EvidenceItem] = Field(default_factory=list)
    degraded_services: List[str] = Field(default_factory=list)
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
            if tc.name == "replace_itinerary_stop" and not tc.arguments.get("itinerary"):
                base_plan = self.boundary.execute(
                    ToolCall(
                        name="build_itinerary",
                        arguments={"constraints": (effective_constraints or PlanningConstraints(days=1)).model_dump(mode="json"), "candidate_places": []},
                    )
                )
                if base_plan.status == ToolStatus.OK and base_plan.data:
                    tc.arguments["itinerary"] = base_plan.data.model_dump(mode="json") if hasattr(base_plan.data, "model_dump") else base_plan.data


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
        grounded_msg = generate_conversational_fallback_message(language=detected_lang)
        if tool_results_obtained and any(r.tool_name == "replace_itinerary_stop" for r in tool_results_obtained):
            rep_res = next(r for r in tool_results_obtained if r.tool_name == "replace_itinerary_stop")
            rep_data = rep_res.data if isinstance(rep_res.data, dict) else {}
            if rep_data.get("available"):
                grounded_msg = rep_data.get("message", "Successfully replaced itinerary stop.")
                if rep_data.get("updated_itinerary"):
                    from app.schemas.itinerary import ItineraryResponse
                    itinerary = ItineraryResponse.model_validate(rep_data["updated_itinerary"])
            else:
                grounded_msg = rep_data.get("message", "No suitable verified replacement is available for this time window.")
        elif itinerary is not None:
            stop_count = sum(len(d.stops) for d in itinerary.days)
            grounded_msg = generate_grounded_itinerary_message(
                language=detected_lang,
                days=len(itinerary.days),
                stop_count=stop_count,
                start_place=effective_constraints.start if effective_constraints else None,
                interests=effective_constraints.interests if effective_constraints else None,
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
        elif tool_results_obtained and any(r.tool_name == "get_weather" for r in tool_results_obtained):
            w_res = next(r for r in tool_results_obtained if r.tool_name == "get_weather")
            w_data = w_res.data if isinstance(w_res.data, dict) else {}
            loc = w_data.get("location", "Odisha")
            temp = w_data.get("temperature_c")
            cond = w_data.get("condition", "Current conditions")
            precip = w_data.get("precipitation_probability_pct") or w_data.get("precipitation_probability") or 0
            grounded_msg = f"Weather in {loc}: {temp}°C, {cond} with {precip}% precipitation probability."
        elif tool_results_obtained and any(r.tool_name == "estimate_crowd" for r in tool_results_obtained):
            c_res = next(r for r in tool_results_obtained if r.tool_name == "estimate_crowd")
            c_data = c_res.data if isinstance(c_res.data, dict) else {}
            lvl = c_data.get("level", "moderate")
            rec = c_data.get("recommended_window")
            rec_str = f" Recommended visit window: {rec.get('start')}-{rec.get('end')}." if rec else ""
            grounded_msg = f"Expected crowd level is {lvl}.{rec_str}"
        elif tool_results_obtained and any(r.tool_name == "get_transit_options" for r in tool_results_obtained):
            t_res = next(r for r in tool_results_obtained if r.tool_name == "get_transit_options")
            t_data = t_res.data if isinstance(t_res.data, dict) else {}
            if t_data.get("available"):
                grounded_msg = f"Verified transit available: mode={t_data.get('mode')}, estimated {t_data.get('estimated_minutes')} mins."
            else:
                grounded_msg = t_data.get("message", "No verified public-transit option is currently available for this leg.")
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


        # Build compact structured evidence items from verified domain records
        evidence_items: List[EvidenceItem] = []
        if itinerary is not None:
            total_stops = sum(len(d.stops) for d in itinerary.days)
            evidence_items.append(
                EvidenceItem(
                    title=f"Verified {len(itinerary.days)}-Day Route",
                    rationale=f"Deterministic itinerary sequence with {total_stops} verified stops across Odisha",
                    claim_type=ClaimType.VERIFIED,
                    source="itinerary_service:deterministic_sequencing",
                    confidence="high",
                )
            )
        if places:
            evidence_items.append(
                EvidenceItem(
                    title="Verified Catalog Places",
                    rationale=f"{len(places)} destination(s) verified from Odisha canonical catalog",
                    claim_type=ClaimType.VERIFIED,
                    source="search_service:canonical_places_db",
                    confidence="high",
                )
            )
        if transport:
            evidence_items.append(
                EvidenceItem(
                    title="Transit & Hop Plan",
                    rationale=f"{len(transport)} transport connection(s) evaluated via Dijkstra graph",
                    claim_type=ClaimType.SCHEDULED,
                    source="transport_service:dijkstra_graph",
                    confidence="high",
                )
            )
        if provider_status:
            evidence_items.append(
                EvidenceItem(
                    title="Transit Provider Status",
                    rationale="Verified timetable & schedule availability for regional transit",
                    claim_type=ClaimType.SCHEDULED,
                    source="transport_service:ama-bus",
                    confidence="high",
                )
            )

        # Domain tool specific evidence items
        for r in tool_results_obtained:
            if r.tool_name == "get_weather" and isinstance(r.data, dict):
                w_data = r.data
                loc = w_data.get("location", "Odisha")
                temp = w_data.get("temperature_c")
                cond = w_data.get("condition", "Weather conditions")
                precip = w_data.get("precipitation_probability_pct", 0)
                evidence_items.append(
                    EvidenceItem(
                        title="Current weather",
                        rationale=f"{w_data.get('source', 'Open-Meteo')} reports {temp}°C, {cond}, rain probability of {precip}% for {loc}",
                        claim_type=ClaimType.LIVE,
                        source=w_data.get("source", "Open-Meteo"),
                        confidence="high",
                    )
                )
            elif r.tool_name == "estimate_crowd" and isinstance(r.data, dict):
                c_data = r.data
                level = c_data.get("level", "moderate")
                factors = c_data.get("factors", [])
                rationale_text = "; ".join(factors) if factors else f"Estimated {level} crowd based on category priors and time"
                evidence_items.append(
                    EvidenceItem(
                        title="Expected crowd",
                        rationale=rationale_text,
                        claim_type=ClaimType.ESTIMATED,
                        source=c_data.get("source", "O-TRAVELZ crowd heuristic"),
                        confidence=c_data.get("confidence", "medium"),
                    )
                )
            elif r.tool_name == "get_transit_options" and isinstance(r.data, dict):
                t_data = r.data
                if t_data.get("available"):
                    mode = t_data.get("mode", "bus")
                    mins = t_data.get("estimated_minutes")
                    evidence_items.append(
                        EvidenceItem(
                            title="Scheduled departure",
                            rationale=f"Verified public transit ({mode}) with estimated travel time of {mins} minutes",
                            claim_type=ClaimType.SCHEDULED,
                            source=t_data.get("source", "CRUT Mo Bus timetable"),
                            confidence="high",
                        )
                    )
                else:
                    evidence_items.append(
                        EvidenceItem(
                            title="Transit options unavailable",
                            rationale=t_data.get("message", "No verified public-transit option is currently available for this leg."),
                            claim_type=ClaimType.UNKNOWN,
                            source=t_data.get("source", "O-Travelz transit graph"),
                            confidence="low",
                        )
                    )
            elif r.tool_name == "replace_itinerary_stop" and isinstance(r.data, dict):
                for e in r.data.get("evidence_items", []):
                    if isinstance(e, dict):
                        evidence_items.append(EvidenceItem.model_validate(e))
                    elif isinstance(e, EvidenceItem):
                        evidence_items.append(e)

        return GroundedConversationResponse(
            message=grounded_msg,
            status=AIStatus.SUCCESS,
            language=detected_lang,
            intent=intent.kind.value if intent else None,
            constraints=effective_constraints,
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
            evidence_items=evidence_items,
            degraded_services=[],
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
