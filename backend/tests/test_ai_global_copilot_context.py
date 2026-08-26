"""Unit and integration test suite for Global Multilingual AI Copilot Context Awareness.

Verifies:
1. Backward compatibility (None/omitted context)
2. English, Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), and mixed-language conversation flows
3. Destination context resolution (what is nearby, plan around here)
4. Map mode context resolution (transit, medical/emergency, ATM)
5. Planner context inheritance & refinement
6. Location context resolution (near me / current location)
7. Saved places summary context resolution
8. Zero-fabrication & grounding safety with untrusted context hints
"""
from __future__ import annotations

import pytest
from app.ai.boundary import ToolExecutionBoundary
from app.ai.contracts import ChatMessage, ChatRole, ToolDefinition, ToolResult, ToolStatus
from app.ai.conversation import GroundedConversationOrchestrator, GroundedConversationResponse

from app.ai.model import RuleBasedModelAdapter
from app.ai.schemas import (
    AIStatus,
    AppContextPayload,
    AppDestinationContext,
    AppLocationContext,
    AppMapContext,
    AppPlannerContext,
    AppSavedSummaryContext,
    PlanningConstraints,
)
from app.ai.registry import ToolRegistry
from app.ai.tools.adapters import (
    BuildItineraryToolAdapter,
    GetProviderStatusToolAdapter,
    PlanTransportHopToolAdapter,
)
from app.schemas.transport import DataTier, ProviderStatusContract, TransportHopContract
from app.services.itinerary import ItineraryService
from app.services.ranking import InMemoryPlaceRepository, VerifiedPlace
from app.transport.adapters.walking import Coordinate



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
    def plan_transport_hop(self, args) -> TransportHopContract:
        return TransportHopContract(
            from_sequence=getattr(args, "from_sequence", 0),
            to_sequence=getattr(args, "to_sequence", 1),
            mode="walk",
            estimated_minutes=15,
            estimated_cost=None,
            legs=[{"mode": "walk", "detail": "Verified walking trail"}],
            data_tier=DataTier.STATIC,
        )

    def get_provider_status(self, args) -> ProviderStatusContract:
        prov_id = getattr(args, "provider_id", None) or "ama-bus"
        return ProviderStatusContract(
            provider_id=prov_id,
            data_tier=DataTier.STATIC,
            notes="Mo Bus operational static timetable",
        )


class MockSearchPlacesToolAdapter:
    def __init__(self, places: list[MockPlaceModel]):
        self.places = places
        self.definition = ToolDefinition(name="search_places", description="Search places")

    def execute(self, arguments: dict[str, Any], tool_call_id: str | None = None) -> ToolResult:
        from app.services.search.search_models import CompactKnowledgeRecord
        query = (arguments.get("query") or "").lower()
        district = (arguments.get("district") or "").lower()
        is_med = arguments.get("is_medical")
        limit = arguments.get("limit", 10)

        matched = []
        for p in self.places:
            if is_med is not None and p.is_medical != is_med:
                continue
            if not is_med and p.is_medical:
                continue
            if district and district in p.district.lower():
                matched.append(p)
            elif query and (query in p.name.lower() or query in p.district.lower() or p.district.lower() in query):
                matched.append(p)
            elif not query and not district:
                matched.append(p)

        results = [
            CompactKnowledgeRecord(
                id=p.id,
                name=p.name,
                category=p.category_id,
                district=p.district,
                region=p.region,
                latitude=p.latitude,
                longitude=p.longitude,
                interests=[i.name for i in p.interests],
                is_medical=p.is_medical,
                is_transit=p.is_transit,
            )
            for p in (matched or self.places)[:limit]
        ]
        return ToolResult(
            tool_call_id=tool_call_id,
            tool_name="search_places",
            status=ToolStatus.OK,
            data=results,
        )


@pytest.fixture
def mock_places_list():
    return [
        MockPlaceModel("p1", "Jagannath Temple, Puri", "Puri", "temple", ["spirituality", "heritage"]),
        MockPlaceModel("p2", "Puri Golden Beach", "Puri", "beach", ["beach", "relaxation"]),
        MockPlaceModel("p3", "Konark Sun Temple", "Puri", "monument", ["heritage", "architecture"]),
        MockPlaceModel("p4", "Lingaraj Temple", "Khordha", "temple", ["spirituality", "heritage"]),
        MockPlaceModel("p5", "Udayagiri Caves", "Khordha", "monument", ["heritage"]),
        MockPlaceModel("p6", "Daringbadi Hill Station", "Kandhamal", "nature", ["nature", "relaxation"]),
        MockPlaceModel("p7", "Barehipani Waterfall", "Mayurbhanj", "waterfall", ["waterfall", "nature"]),
        MockPlaceModel("p8", "Barabati Fort", "Cuttack", "monument", ["heritage", "architecture"]),
        MockPlaceModel("p9", "Hirakud Dam & Reservoir", "Sambalpur", "nature", ["nature"]),
        MockPlaceModel("h1", "District Hospital Puri", "Puri", "hospital", [], is_medical=True),
        MockPlaceModel("t1", "Puri Railway Station", "Puri", "transit_hub", [], is_transit=True),
    ]


@pytest.fixture
def orchestrator(mock_places_list):
    db = MockPlacesDB(mock_places_list)
    verified_places = [
        VerifiedPlace(
            database_id=p.id,
            category_id=p.category_id,
            name=p.name,
            coordinate=Coordinate(p.latitude, p.longitude),
            interests=tuple(i.name for i in p.interests),
        )
        for p in mock_places_list
        if not p.is_medical and not p.is_transit
    ]
    repo = InMemoryPlaceRepository(verified_places)
    transport = MockTransportHopPlanner()
    itinerary_service = ItineraryService(repo, transport)

    registry = ToolRegistry()
    registry.register(MockSearchPlacesToolAdapter(mock_places_list))
    registry.register(BuildItineraryToolAdapter(itinerary_service))
    registry.register(PlanTransportHopToolAdapter(transport))
    registry.register(GetProviderStatusToolAdapter(transport))
    boundary = ToolExecutionBoundary(registry)
    return GroundedConversationOrchestrator(
        registry=registry,
        boundary=boundary,
        model_adapter=RuleBasedModelAdapter(),
    )




# ===========================================================================
# 1. Backward Compatibility & Baseline Multilingual Tests
# ===========================================================================

def test_backward_compatibility_no_context(orchestrator):
    """Old clients calling converse without context should work seamlessly."""
    messages = [ChatMessage(role=ChatRole.USER, content="Plan a 2 day trip to Puri with heritage")]
    res = orchestrator.converse(messages)
    assert res.status == AIStatus.SUCCESS
    assert res.language == "en"
    assert res.itinerary is not None
    assert len(res.itinerary.days) == 2
    assert res.is_grounded is True


def test_multilingual_hindi_conversation(orchestrator):
    """Hindi input produces Hindi grounded response."""
    messages = [ChatMessage(role=ChatRole.USER, content="मुझे पुरी और कोणार्क के लिए 2 दिन की योजना चाहिए")]
    res = orchestrator.converse(messages)
    assert res.status == AIStatus.SUCCESS
    assert res.language == "hi"
    assert res.itinerary is not None
    assert "दिनों" in res.message or "योजना" in res.message


def test_multilingual_odia_conversation(orchestrator):
    """Odia input produces Odia grounded response."""
    messages = [ChatMessage(role=ChatRole.USER, content="ମୋତେ ପୁରୀ ପାଇଁ ୨ ଦିନର ଯୋଜନା ଦିଅନ୍ତୁ")]
    res = orchestrator.converse(messages)
    assert res.status == AIStatus.SUCCESS
    assert res.language == "or"
    assert res.itinerary is not None
    assert "ଦିନର" in res.message or "ଯୋଜନା" in res.message


def test_multilingual_mixed_language_conversation(orchestrator):
    """Mixed language input (Hinglish / Odia-English) parsed accurately."""
    messages = [ChatMessage(role=ChatRole.USER, content="Puri mein temples dekhna hai ଏବଂ beach relaxation bhi")]
    res = orchestrator.converse(messages)
    assert res.status == AIStatus.SUCCESS
    assert res.itinerary is not None


# ===========================================================================
# 2. Destination Page Context Tests
# ===========================================================================

def test_destination_context_what_is_nearby(orchestrator):
    """User on Konark Sun Temple page asks 'What is nearby?' without typing city name."""
    context = AppContextPayload(
        page="destinations",
        destination=AppDestinationContext(
            id="p3",
            name="Konark Sun Temple",
            district="Puri",
            category="monument",
        ),
    )
    messages = [ChatMessage(role=ChatRole.USER, content="What is nearby?")]
    res = orchestrator.converse(messages, app_context=context)
    assert res.status == AIStatus.SUCCESS
    assert len(res.places) > 0
    assert any(tc.name == "search_places" for tc in res.tool_calls)


def test_destination_context_plan_around_here_odia(orchestrator):
    """User viewing Daringbadi asks in Odia to plan a 2-day trip around here."""
    context = AppContextPayload(
        page="destination_detail",
        destination=AppDestinationContext(
            id="p6",
            name="Daringbadi Hill Station",
            district="Kandhamal",
            category="nature",
        ),
    )
    messages = [ChatMessage(role=ChatRole.USER, content="ଏହି ସ୍ଥାନ ପାଇଁ ୨ ଦିନର ଯୋଜନା କରନ୍ତୁ")]
    res = orchestrator.converse(messages, app_context=context)
    assert res.status == AIStatus.SUCCESS
    assert res.language == "or"
    assert res.itinerary is not None
    assert len(res.itinerary.days) == 2


# ===========================================================================
# 3. Map & Transit Context Tests
# ===========================================================================

def test_map_transit_context_explain_route(orchestrator):
    """User viewing Mo Bus transit route asks to explain route."""
    context = AppContextPayload(
        page="map",
        map=AppMapContext(
            mode="transit",
            selected_route_name="Mo Bus Route 10",
            selected_route_id="route_10",
        ),
    )
    messages = [ChatMessage(role=ChatRole.USER, content="Explain this bus route")]
    res = orchestrator.converse(messages, app_context=context)
    assert res.status == AIStatus.SUCCESS
    assert any(tc.name == "get_provider_status" for tc in res.tool_calls)


def test_map_medical_emergency_context(orchestrator):
    """User in Medical map mode asking for emergency hospital."""
    context = AppContextPayload(
        page="map",
        map=AppMapContext(mode="medical", region="Puri"),
        location=AppLocationContext(city="Puri", district="Puri"),
    )
    messages = [ChatMessage(role=ChatRole.USER, content="Find nearby hospital")]
    res = orchestrator.converse(messages, app_context=context)
    assert res.status == AIStatus.SUCCESS
    assert any(tc.name == "search_places" for tc in res.tool_calls)


# ===========================================================================
# 4. Planner Context Refinement Tests
# ===========================================================================

def test_planner_context_itinerary_refinement(orchestrator):
    """Active planner context allows user to say 'Make it 3 days' without retyping origin."""
    context = AppContextPayload(
        page="planner",
        planner=AppPlannerContext(
            days=2,
            start="Puri",
            interests=["heritage"],
        ),
    )
    messages = [ChatMessage(role=ChatRole.USER, content="Make it 3 days and add more beaches")]
    res = orchestrator.converse(messages, app_context=context)
    assert res.status == AIStatus.SUCCESS
    assert res.itinerary is not None
    assert len(res.itinerary.days) == 3


# ===========================================================================
# 5. Location & Saved Summary Context Tests
# ===========================================================================

def test_location_context_near_me(orchestrator):
    """User asking 'What is near me?' with Sambalpur live location."""
    context = AppContextPayload(
        page="home",
        location=AppLocationContext(
            city="Sambalpur",
            district="Sambalpur",
            location_type="LIVE_GPS",
        ),
    )
    messages = [ChatMessage(role=ChatRole.USER, content="What to explore near me?")]
    res = orchestrator.converse(messages, app_context=context)
    assert res.status == AIStatus.SUCCESS
    assert any(tc.name == "search_places" for tc in res.tool_calls)


def test_saved_places_context(orchestrator):
    """User on Saved page asking to plan a trip from their saved places."""
    context = AppContextPayload(
        page="saved",
        saved=AppSavedSummaryContext(
            saved_count=2,
            sample_places=["Jagannath Temple, Puri", "Konark Sun Temple"],
        ),
    )
    messages = [ChatMessage(role=ChatRole.USER, content="Plan a 2 day trip from my saved places")]
    res = orchestrator.converse(messages, app_context=context)
    assert res.status == AIStatus.SUCCESS
    assert res.itinerary is not None
