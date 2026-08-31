"""Comprehensive test suite for Phase 12 Step 5 — Multilingual Grounded AI Conversations & Itinerary Integration.

Verifies:
1. Grounded Conversation Orchestration (ChatMessage -> ToolRegistry -> Boundary -> Domain Service -> Grounded Response)
2. Multilingual Grounding across English, Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), and mixed queries
3. Conversational Itinerary Integration & Multi-turn Refinement
4. Strict Grounding Invariants (zero fabricated places, zero fabricated attributes, domain isolation)
5. Tool Selection Safety & Security Injection Containment
6. API endpoint integration (/ai/plan and /ai/converse)
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, List, Optional
import pytest
from pydantic import BaseModel
from fastapi.testclient import TestClient

from app.ai.adapter import MockProviderAdapter
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
from app.ai.conversation import GroundedConversationOrchestrator, GroundedConversationResponse
from app.ai.grounding import GroundingBoundary, GroundingContext
from app.ai.model import RuleBasedModelAdapter
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
from app.ai.schemas import AIIntent, AIPlanRequest, AIResponse, AIStatus, Clarification, IntentKind, PlanningConstraints
from app.ai.tools.adapters import (
    BuildItineraryToolAdapter,
    GetProviderStatusToolAdapter,
    PlanTransportHopToolAdapter,
    SearchPlacesToolAdapter,
    create_default_tool_registry,
)
from app.main import app
from app.schemas.common import PlaceSummary
from app.schemas.transport import DataTier, ProviderStatusContract, TransportHopContract
from app.services.itinerary import ItineraryService
from app.services.ranking import InMemoryPlaceRepository, VerifiedPlace
from app.transport.adapters.walking import Coordinate


# ---------------------------------------------------------------------------
# Test Fixtures & Mocks
# ---------------------------------------------------------------------------

class MockPlaceModel:
    def __init__(
        self,
        id: str,
        name: str,
        district: str,
        category: str,
        interests: list[str],
        region: str = "Central",
        description: str = "",
        is_medical: bool = False,
        is_transit: bool = False,
    ):
        self.id = id
        self.name = name
        self.district = district
        self.category_id = category
        self.category = type("Cat", (), {"name": category, "canonical_name": category})()
        self.interests = [type("Int", (), {"name": i, "canonical_name": i})() for i in interests]
        self.region = region
        self.description = description
        self.latitude = 20.2961
        self.longitude = 85.8245
        self.address = f"{name}, {district}, Odisha"
        self.verification_status = "verified"
        self.source = "official_dataset"
        self.is_medical = is_medical
        self.is_transit = is_transit
        self.contact_phone = None
        self.emergency_phone = None


class MockPlacesDB:
    def __init__(self, places: list[MockPlaceModel]):
        self._places = places

    def query(self, *args, **kwargs):
        return self

    def join(self, *args, **kwargs):
        return self

    def options(self, *args, **kwargs):
        return self

    def filter(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
        return self

    def offset(self, n: int):
        return self

    def limit(self, n: int):
        return self

    def all(self):
        return self._places

    def first(self):
        return self._places[0] if self._places else None


class MockTransportHopPlanner:
    def plan_transport_hop(self, args: Any) -> TransportHopContract:
        return TransportHopContract(
            from_sequence=getattr(args, "from_sequence", 0),
            to_sequence=getattr(args, "to_sequence", 1),
            mode="walk",
            estimated_minutes=12,
            estimated_cost=None,
            legs=[{"mode": "walk", "detail": "Verified walking trail"}],
            data_tier=DataTier.STATIC,
        )

    def get_provider_status(self, args: Any) -> ProviderStatusContract:
        prov_id = getattr(args, "provider_id", None) or (args.get("provider_id") if isinstance(args, dict) else "ama-bus")
        return ProviderStatusContract(
            provider_id=prov_id,
            data_tier=DataTier.STATIC,
            notes="Operational static timetable",
        )



@pytest.fixture
def mock_places():
    return [
        MockPlaceModel("p1", "Jagannath Temple, Puri", "Puri", "temple", ["spirituality", "heritage"]),
        MockPlaceModel("p2", "Puri Golden Beach", "Puri", "beach", ["beach", "relaxation"]),
        MockPlaceModel("p3", "Konark Sun Temple", "Puri", "monument", ["heritage", "architecture"]),
        MockPlaceModel("p4", "Lingaraj Temple", "Khordha", "temple", ["spirituality", "heritage"]),
        MockPlaceModel("p5", "Udayagiri Caves", "Khordha", "monument", ["heritage"]),
        MockPlaceModel("p6", "Daringbadi Hill Station", "Kandhamal", "nature", ["nature", "relaxation"]),
        MockPlaceModel("p7", "Barehipani Waterfall", "Mayurbhanj", "waterfall", ["waterfall", "nature"]),
        MockPlaceModel("p8", "Barabati Fort", "Cuttack", "monument", ["heritage", "architecture"]),
        # Emergency & Transit places (domain isolation)
        MockPlaceModel("h1", "District Hospital Puri", "Puri", "hospital", [], is_medical=True),
        MockPlaceModel("t1", "Puri Railway Station", "Puri", "transit_hub", [], is_transit=True),
    ]


@pytest.fixture
def test_orchestrator(mock_places):
    db = MockPlacesDB(mock_places)
    verified_places = [
        VerifiedPlace(
            database_id=p.id,
            category_id=p.category_id,
            name=p.name,
            coordinate=Coordinate(p.latitude, p.longitude),
            interests=tuple(i.name for i in p.interests),
        )
        for p in mock_places
        if not p.is_medical and not p.is_transit
    ]
    repo = InMemoryPlaceRepository(verified_places)
    transport = MockTransportHopPlanner()
    itinerary_service = ItineraryService(repo, transport)

    registry = create_default_tool_registry(db, itinerary_service, transport)
    boundary = ToolExecutionBoundary(registry)
    return GroundedConversationOrchestrator(
        registry=registry,
        boundary=boundary,
        model_adapter=RuleBasedModelAdapter(),
    )


# ---------------------------------------------------------------------------
# 1. Multilingual Utilities & Detection Tests
# ---------------------------------------------------------------------------

def test_language_detection():
    assert detect_language("Hello, plan a trip to Puri") == "en"
    assert detect_language("ପୁରୀ ପାଇଁ ୩ ଦିନର ଯାତ୍ରା ଯୋଜନା କର") == "or"
    assert detect_language("पुरी के लिए 3 दिन का itinerary बनाओ") == "hi"
    assert detect_language("Show temples in ପୁରୀ") == "or"
    assert detect_language("Waterfalls in मयूरଭଞ୍ଜ") in ("or", "hi")
    assert detect_language("") == "en"
    assert detect_language(None) == "en"


def test_multilingual_days_extraction():
    # English
    assert extract_multilingual_days("Plan a 3 day trip") == 3
    assert extract_multilingual_days("2-day itinerary") == 2
    assert extract_multilingual_days("four days in Konark") == 4

    # Odia (numerals & words)
    assert extract_multilingual_days("ପୁରୀ ପାଇଁ ୩ ଦିନର ଯାତ୍ରା") == 3
    assert extract_multilingual_days("୨ ଦିନ ଯୋଜନା") == 2
    assert extract_multilingual_days("ଚାରି ଦିନ ଭ୍ରମଣ") == 4
    assert extract_multilingual_days("୧ ଦିନ") == 1

    # Hindi (numerals & words)
    assert extract_multilingual_days("पुरी के लिए ३ दिन का ट्रिप") == 3
    assert extract_multilingual_days("२ दिन का यात्रा कार्यक्रम") == 2
    assert extract_multilingual_days("चार दिन का प्लान") == 4
    assert extract_multilingual_days("5 दिन") == 5


def test_multilingual_interests_extraction():
    # English
    assert "heritage" in extract_multilingual_interests("heritage sites in Puri")
    assert "beach" in extract_multilingual_interests("relaxing on the beach")

    # Odia
    assert "spirituality" in extract_multilingual_interests("ପୁରୀର ମନ୍ଦିର")
    assert "heritage" in extract_multilingual_interests("କଟକର ଐତିହ୍ୟ")
    assert "waterfall" in extract_multilingual_interests("ଜଳପ୍ରପାତ ଦେଖିବା")

    # Hindi
    assert "spirituality" in extract_multilingual_interests("पुरी के मंदिर")
    assert "heritage" in extract_multilingual_interests("कटक की विरासत")
    assert "waterfall" in extract_multilingual_interests("सुंदर जलप्रपात")


def test_multilingual_location_resolution():
    # Canonical & localized districts
    assert resolve_multilingual_location("Trip to Puri") == "Puri"
    assert resolve_multilingual_location("ପୁରୀ ଭ୍ରମଣ") == "Puri"
    assert resolve_multilingual_location("पुरी दर्शन") == "Puri"
    assert resolve_multilingual_location("କଟକ") == "Cuttack"
    assert resolve_multilingual_location("मयूरभंज") == "Mayurbhanj"

    # Multilingual aliases
    assert resolve_multilingual_location("ରୂପା ସହର ଯାତ୍ରା") == "Cuttack"
    assert resolve_multilingual_location("चांदी का शहर") == "Cuttack"
    assert resolve_multilingual_location("Silver City tour") == "Cuttack"


# ---------------------------------------------------------------------------
# 2. Grounded Conversation Orchestrator Tests
# ---------------------------------------------------------------------------

def test_simple_grounded_planning_english(test_orchestrator):
    messages = [ChatMessage(role=ChatRole.USER, content="Plan a 2 day trip to Puri with heritage and temples")]
    res = test_orchestrator.converse(messages)

    assert res.status == AIStatus.SUCCESS


    assert res.language == "en"
    assert res.is_grounded is True
    assert res.itinerary is not None
    assert len(res.itinerary.days) == 2
    assert "verified" in res.message.lower() or "itinerary" in res.message.lower()
    assert len(res.tool_calls) >= 1
    assert res.tool_calls[0].name == "build_itinerary"


def test_grounded_planning_odia(test_orchestrator):
    messages = [ChatMessage(role=ChatRole.USER, content="ପୁରୀ ପାଇଁ ୩ ଦିନର ଯାତ୍ରା ଯୋଜନା କର")]
    res = test_orchestrator.converse(messages)

    assert res.status == AIStatus.SUCCESS
    assert res.language == "or"
    assert res.is_grounded is True
    assert res.itinerary is not None
    assert len(res.itinerary.days) == 3
    # Grounded message in Odia
    assert "ଯାଞ୍ଚିତ ଯାତ୍ରା ଯୋଜନା" in res.message
    assert "୩" in res.message or "3" in res.message


def test_grounded_planning_hindi(test_orchestrator):
    messages = [ChatMessage(role=ChatRole.USER, content="पुरी के लिए 2 दिन का itinerary बनाओ")]
    res = test_orchestrator.converse(messages)

    assert res.status == AIStatus.SUCCESS
    assert res.language == "hi"
    assert res.is_grounded is True
    assert res.itinerary is not None
    assert len(res.itinerary.days) == 2
    # Grounded message in Hindi
    assert "सत्यापित यात्रा कार्यक्रम" in res.message
    assert "2" in res.message or "२" in res.message


def test_mixed_language_queries(test_orchestrator):
    # Mixed English + Odia
    messages = [ChatMessage(role=ChatRole.USER, content="Show temples in ପୁରୀ")]
    res = test_orchestrator.converse(messages)
    assert res.status == AIStatus.SUCCESS
    assert res.is_grounded is True

    # Mixed English + Hindi
    messages2 = [ChatMessage(role=ChatRole.USER, content="Waterfalls in मयूरଭଞ୍ଜ for 2 days")]
    res2 = test_orchestrator.converse(messages2)
    assert res2.status == AIStatus.SUCCESS
    assert res2.is_grounded is True
    assert res2.itinerary is not None


# ---------------------------------------------------------------------------
# 3. Multi-turn Conversational Refinement
# ---------------------------------------------------------------------------

def test_multiturn_conversational_refinement(test_orchestrator):
    # Turn 1: Initial plan
    msg1 = [ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri")]
    res1 = test_orchestrator.converse(msg1)
    assert res1.status == AIStatus.SUCCESS
    assert res1.itinerary is not None
    assert len(res1.itinerary.days) == 2
    current_constraints = res1.itinerary.constraints

    # Turn 2: Refinement (add heritage)
    msg2 = [
        ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri"),
        ChatMessage(role=ChatRole.ASSISTANT, content=res1.message),
        ChatMessage(role=ChatRole.USER, content="Make it more heritage focused"),
    ]
    res2 = test_orchestrator.converse(msg2, existing_constraints=current_constraints)
    assert res2.status == AIStatus.SUCCESS
    assert res2.itinerary is not None
    assert "heritage" in res2.itinerary.constraints.interests

    # Turn 3: Refinement in Odia (extend to 3 days)
    current_constraints_2 = res2.itinerary.constraints
    msg3 = [
        ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri"),
        ChatMessage(role=ChatRole.ASSISTANT, content=res1.message),
        ChatMessage(role=ChatRole.USER, content="Make it more heritage focused"),
        ChatMessage(role=ChatRole.ASSISTANT, content=res2.message),
        ChatMessage(role=ChatRole.USER, content="ଏହାକୁ ୩ ଦିନ କରନ୍ତୁ"),
    ]
    res3 = test_orchestrator.converse(msg3, existing_constraints=current_constraints_2)
    assert res3.status == AIStatus.SUCCESS
    assert res3.itinerary is not None
    assert len(res3.itinerary.days) == 3
    assert "heritage" in res3.itinerary.constraints.interests


# ---------------------------------------------------------------------------
# 4. Strict Grounding & Anti-Hallucination Invariants
# ---------------------------------------------------------------------------

def test_zero_fabricated_places_invariant(test_orchestrator):
    """Ensure every place in an itinerary originates strictly from verified DB records."""
    messages = [ChatMessage(role=ChatRole.USER, content="Plan a 2 day trip to Daringbadi")]
    res = test_orchestrator.converse(messages)

    assert res.status == AIStatus.SUCCESS
    assert res.itinerary is not None
    verified_ids = {"p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"}
    for day in res.itinerary.days:
        for stop in day.stops:
            assert stop.place.id in verified_ids


def test_domain_isolation_invariant(test_orchestrator):
    """Ensure medical facilities and transit hubs are not included in leisure itineraries."""
    messages = [ChatMessage(role=ChatRole.USER, content="Plan 3 days in Puri with relaxation")]
    res = test_orchestrator.converse(messages)

    assert res.status == AIStatus.SUCCESS
    assert res.itinerary is not None
    for day in res.itinerary.days:
        for stop in day.stops:
            assert stop.place.id not in ("h1", "t1")
            assert stop.place.category not in ("hospital", "emergency_facility", "transit_hub")


def test_empty_or_unsupported_queries_honest_handling(test_orchestrator):
    # Empty message
    res_empty = test_orchestrator.converse([ChatMessage(role=ChatRole.USER, content="   ")])
    assert res_empty.status == AIStatus.ERROR

    # Supported preference (low walking) succeeds
    res_walking = test_orchestrator.converse([ChatMessage(role=ChatRole.USER, content="Plan 2 days with less walking")])
    assert res_walking.status == AIStatus.SUCCESS
    assert res_walking.constraints.low_walking is True

    # Unsupported preference (e.g. pace) is handled honestly
    res_unsupported = test_orchestrator.converse(
        [ChatMessage(role=ChatRole.USER, content="Plan 2 days in Puri")],
        existing_constraints=PlanningConstraints(days=2, pace="ultra-fast"),
    )
    assert res_unsupported.status == AIStatus.UNSUPPORTED
    assert "cannot optimize these preferences yet: pace" in res_unsupported.message

    # Ambiguous general question needing clarification
    res_clarify = test_orchestrator.converse([ChatMessage(role=ChatRole.USER, content="hello")])
    assert res_clarify.status == AIStatus.CLARIFICATION
    assert res_clarify.clarification is not None


# ---------------------------------------------------------------------------
# 5. Tool Selection Safety & Security Injection Boundary
# ---------------------------------------------------------------------------

def test_security_cannot_execute_injected_callables(test_orchestrator):
    boundary = test_orchestrator.boundary

    for malicious in ("eval", "exec", "os.system", "__import__", "subprocess.call"):
        tc = ToolCall(name=malicious, arguments={"x": 1})
        res = boundary.execute(tc)
        assert res.status == ToolStatus.UNKNOWN
        assert "not recognized" in (res.reason or "") or "Unknown tool" in (res.error or "")



def test_tool_call_id_preservation_lifecycle(test_orchestrator):
    boundary = test_orchestrator.boundary
    tc = ToolCall(id="call_lifecycle_999", name="get_provider_status", arguments={"provider_id": "ama-bus"})
    res = boundary.execute(tc)

    assert res.tool_call_id == "call_lifecycle_999"
    assert res.tool_name == "get_provider_status"
    assert res.status == ToolStatus.OK


# ---------------------------------------------------------------------------
# 6. Backward Compatibility & API Routes Tests
# ---------------------------------------------------------------------------

def test_plan_with_ai_backward_compatibility(test_orchestrator):
    ai_res = test_orchestrator.plan_with_ai("Plan 2 days in Puri with heritage")
    assert isinstance(ai_res, AIResponse)
    assert ai_res.status == AIStatus.SUCCESS
    assert ai_res.itinerary is not None
    assert len(ai_res.itinerary.days) == 2


def test_api_routes_integration(test_orchestrator):
    from app.api.ai_routes import get_ai_orchestrator, get_grounded_orchestrator
    
    class MockAIOrchestrator:
        def __init__(self, orch):
            self.orch = orch
        def orchestrate(self, message, constraints=None):
            return self.orch.plan_with_ai(message, constraints)

    app.dependency_overrides[get_ai_orchestrator] = lambda: MockAIOrchestrator(test_orchestrator)
    app.dependency_overrides[get_grounded_orchestrator] = lambda: test_orchestrator
    try:
        client = TestClient(app)

        # 1. POST /ai/plan (English)
        resp_en = client.post("/ai/plan", json={"message": "Plan a 2 day trip to Puri with heritage"})
        assert resp_en.status_code == 200
        data_en = resp_en.json()
        assert data_en["status"] == "success"
        assert "message" in data_en
        assert data_en["itinerary"] is not None

        # 2. POST /ai/plan (Odia)
        resp_or = client.post("/ai/plan", json={"message": "ପୁରୀ ପାଇଁ ୨ ଦିନର ଯାତ୍ରା ଯୋଜନା କର"})
        assert resp_or.status_code == 200
        data_or = resp_or.json()
        assert data_or["status"] == "success"
        assert data_or["itinerary"] is not None

        # 3. POST /ai/converse (Multi-turn request)
        conv_payload = {
            "messages": [
                {"role": "user", "content": "ପୁରୀ ପାଇଁ ୩ ଦିନର ଯାତ୍ରା ଯୋଜନା କର"}
            ]
        }
        resp_conv = client.post("/ai/converse", json=conv_payload)
        assert resp_conv.status_code == 200
        data_conv = resp_conv.json()
        assert data_conv["status"] == "success"
        assert data_conv["language"] == "or"
        assert data_conv["is_grounded"] is True
        assert data_conv["itinerary"] is not None
        assert len(data_conv["itinerary"]["days"]) == 3
    finally:
        app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# 7. AI Checkpoint 1 P0 Stability & No-Tool Conversational Fallback Tests
# ---------------------------------------------------------------------------

class TestP0ConversationalStability:
    """Explicit regression tests for no-tool conversational handling and crash prevention."""

    def test_hello_conversational_turn(self, test_orchestrator):
        """A. 'Hello' should return a safe, non-empty response without unassigned variable crash."""
        res = test_orchestrator.converse([ChatMessage(role=ChatRole.USER, content="Hello")])
        assert res.status in (AIStatus.SUCCESS, AIStatus.CLARIFICATION)
        assert res.message is not None and len(res.message.strip()) > 0
        assert res.is_grounded is True
        assert res.itinerary is None

    def test_what_can_you_do_query(self, test_orchestrator):
        """B. 'What can you do?' returns a safe capability overview without exception."""
        res = test_orchestrator.converse([ChatMessage(role=ChatRole.USER, content="What can you do?")])
        assert res.status in (AIStatus.SUCCESS, AIStatus.CLARIFICATION)
        assert res.message is not None and len(res.message.strip()) > 0
        assert res.is_grounded is True

    def test_normal_place_query_unchanged(self, test_orchestrator):
        """C. Normal place query behavior is preserved with grounded place results."""
        res = test_orchestrator.converse([ChatMessage(role=ChatRole.USER, content="Show me temples in Puri")])
        assert res.status == AIStatus.SUCCESS
        assert len(res.places) > 0 or res.itinerary is not None
        assert res.is_grounded is True

    def test_normal_itinerary_query_unchanged(self, test_orchestrator):
        """D. Normal itinerary generation is unchanged."""
        res = test_orchestrator.converse([ChatMessage(role=ChatRole.USER, content="Plan a 2 day trip to Puri")])
        assert res.status == AIStatus.SUCCESS
        assert res.itinerary is not None
        assert len(res.itinerary.days) == 2
        assert res.is_grounded is True

    def test_transport_request_unchanged(self, test_orchestrator):
        """E. Transit/transport tool behavior is unchanged."""
        res = test_orchestrator.converse([ChatMessage(role=ChatRole.USER, content="Tell me about Mo Bus transit status")])
        assert res.status == AIStatus.SUCCESS
        assert len(res.provider_status) > 0 or len(res.transport) > 0 or "status" in res.message.lower()
        assert res.is_grounded is True

    def test_grounding_verifier_failure_path_never_unbound_error(self, test_orchestrator, monkeypatch):
        """F. Grounding verifier failure path produces a controlled error without UnboundLocalError."""
        from app.ai.grounding_verifier import GroundingVerifier
        def mock_verify_fail(*args, **kwargs):
            raise RuntimeError("Simulated internal verifier failure")
        monkeypatch.setattr(GroundingVerifier, "verify_response", mock_verify_fail)

        res = test_orchestrator.converse([ChatMessage(role=ChatRole.USER, content="Plan a 2 day trip to Puri")])
        assert res.status == AIStatus.SUCCESS
        assert res.is_grounded is False
        assert any("internal error" in w.lower() for w in res.warnings)

    def test_multilingual_no_tool_conversational_odia(self, test_orchestrator):
        """G1. Odia conversational input preserves language handling without crash."""
        res = test_orchestrator.converse([ChatMessage(role=ChatRole.USER, content="ନମସ୍କାର, ଆପଣ କିପରି ସାହାଯ୍ୟ କରିପାରିବେ?")])
        assert res.status in (AIStatus.SUCCESS, AIStatus.CLARIFICATION)
        assert res.language == "or"
        assert res.message is not None and len(res.message.strip()) > 0
        assert res.is_grounded is True

    def test_multilingual_no_tool_conversational_hindi(self, test_orchestrator):
        """G2. Hindi conversational input preserves language handling without crash."""
        res = test_orchestrator.converse([ChatMessage(role=ChatRole.USER, content="नमस्ते, आप मेरी क्या मदद कर सकते हैं?")])
        assert res.status in (AIStatus.SUCCESS, AIStatus.CLARIFICATION)
        assert res.language == "hi"
        assert res.message is not None and len(res.message.strip()) > 0
        assert res.is_grounded is True

    def test_no_tool_conversational_fallback_when_no_domain_results(self, test_orchestrator):
        """H. Conversation where tool execution produces no domain results falls back to safe message without crash."""
        from app.ai.registry import BaseToolAdapter
        class EmptyToolAdapter(BaseToolAdapter):
            @property
            def definition(self):
                return ToolDefinition(name="search_places", description="Mock empty search")
            def execute(self, arguments, tool_call_id=None):
                return ToolResult(tool_call_id=tool_call_id, tool_name="search_places", status=ToolStatus.OK, data=[])

        test_orchestrator.registry._tools["search_places"] = EmptyToolAdapter()
        res = test_orchestrator.converse([ChatMessage(role=ChatRole.USER, content="Just chatting with you")])
        assert res.status in (AIStatus.SUCCESS, AIStatus.CLARIFICATION)
        assert res.message is not None and len(res.message.strip()) > 0
        assert res.is_grounded is True




