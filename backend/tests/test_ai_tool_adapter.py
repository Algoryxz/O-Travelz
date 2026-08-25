"""Tests for the provider-neutral AI tool-calling adapter architecture (Phase 12 Step 4)."""
from __future__ import annotations

from typing import Any
import pytest
from sqlalchemy.orm import Session

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
from app.ai.registry import (
    BaseToolAdapter,
    DuplicateToolError,
    FunctionalToolAdapter,
    ToolRegistry,
    ToolRegistryError,
    UnknownToolError,
)
from app.ai.tools.adapters import (
    BuildItineraryToolAdapter,
    GetProviderStatusToolAdapter,
    PlanTransportHopToolAdapter,
    SearchPlacesToolAdapter,
    create_default_tool_registry,
)
from app.ai.schemas import GetProviderStatusArgs, PlanTransportHopArgs
from app.schemas.common import PlaceSummary, PlanningConstraints
from app.schemas.transport import DataTier, ProviderStatusContract, TransportHopContract
from app.services.itinerary import ItineraryService
from app.services.ranking.repository import SQLAlchemyPlaceRepository
from app.transport.service import SQLAlchemyPlaceResolver, TransportService



# ---------------------------------------------------------------------------
# 1. Contract Tests
# ---------------------------------------------------------------------------


def test_tool_definition_contract():
    defn = ToolDefinition(
        name="lookup_weather",
        description="Lookup current weather for an Odisha hub.",
        input_schema={
            "type": "object",
            "required": ["hub"],
            "properties": {"hub": {"type": "string"}},
        },
    )
    assert defn.name == "lookup_weather"
    assert "hub" in defn.input_schema["properties"]
    dump = defn.model_dump(mode="json")
    assert dump["name"] == "lookup_weather"


def test_tool_call_contract():
    call = ToolCall(name="search_places", arguments={"query": "Puri temples"})
    assert call.name == "search_places"
    assert call.id.startswith("call_")
    assert call.arguments == {"query": "Puri temples"}


def test_tool_result_contract():
    res = ToolResult(
        tool_call_id="call_123",
        tool_name="search_places",
        status=ToolStatus.OK,
        data=[{"name": "Lingaraj Temple"}],
        warnings=["Non-fatal warning"],
    )
    assert res.tool_call_id == "call_123"
    assert res.status == ToolStatus.OK
    assert len(res.data) == 1
    assert len(res.warnings) == 1


def test_chat_message_and_adapter_response():
    msg = ChatMessage(
        role=ChatRole.USER,
        content="Show me temples in Bhubaneswar",
    )
    assert msg.role == ChatRole.USER
    assert msg.content == "Show me temples in Bhubaneswar"

    resp = AdapterResponse(
        content=None,
        tool_calls=[ToolCall(name="search_places", arguments={"district": "Khordha"})],
        finish_reason=FinishReason.TOOL_CALLS,
        metadata={"model": "test-provider"},
    )
    assert resp.finish_reason == FinishReason.TOOL_CALLS
    assert len(resp.tool_calls) == 1
    assert resp.tool_calls[0].name == "search_places"


# ---------------------------------------------------------------------------
# 2. Registry Tests
# ---------------------------------------------------------------------------


class DummyEchoTool(BaseToolAdapter):
    def __init__(self, name: str = "echo_tool"):
        self._name = name

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name=self._name,
            description="Echoes input arguments.",
            input_schema={"type": "object", "properties": {"message": {"type": "string"}}},
        )

    def execute(self, arguments: dict[str, Any], tool_call_id: str | None = None) -> ToolResult:
        return ToolResult(
            tool_call_id=tool_call_id,
            tool_name=self._name,
            status=ToolStatus.OK,
            data={"echo": arguments.get("message", "")},
        )


def test_registry_registration_and_retrieval():
    registry = ToolRegistry()
    tool = DummyEchoTool("echo_service")
    registry.register(tool)

    assert registry.has_tool("echo_service") is True
    assert registry.has_tool("non_existent") is False
    assert len(registry) == 1

    retrieved = registry.get("echo_service")
    assert retrieved is tool
    assert retrieved.definition.name == "echo_service"

    definitions = registry.list_definitions()
    assert len(definitions) == 1
    assert definitions[0].name == "echo_service"


def test_registry_functional_registration():
    registry = ToolRegistry()
    defn = ToolDefinition(name="add_numbers", description="Adds two numbers.")

    def add_executor(args: dict[str, Any]) -> ToolResult:
        a = args.get("a", 0)
        b = args.get("b", 0)
        return ToolResult(tool_name="add_numbers", status=ToolStatus.OK, data={"sum": a + b})

    registry.register(definition=defn, executor=add_executor)
    assert registry.has_tool("add_numbers") is True

    tool = registry.get_or_raise("add_numbers")
    res = tool.execute({"a": 5, "b": 7}, tool_call_id="call_add")
    assert res.status == ToolStatus.OK
    assert res.data == {"sum": 12}
    assert res.tool_call_id == "call_add"


def test_registry_duplicate_rejection():
    registry = ToolRegistry()
    registry.register(DummyEchoTool("duplicate_tool"))

    with pytest.raises(DuplicateToolError) as exc_info:
        registry.register(DummyEchoTool("duplicate_tool"))
    assert "already registered" in str(exc_info.value)


def test_registry_unknown_tool_rejection():
    registry = ToolRegistry()
    assert registry.get("unknown_tool") is None

    with pytest.raises(UnknownToolError) as exc_info:
        registry.get_or_raise("unknown_tool")
    assert "not registered" in str(exc_info.value)


def test_registry_unregister_and_clear():
    registry = ToolRegistry()
    registry.register(DummyEchoTool("tool_a"))
    registry.register(DummyEchoTool("tool_b"))
    assert len(registry) == 2

    assert registry.unregister("tool_a") is True
    assert registry.unregister("tool_a") is False
    assert len(registry) == 1
    assert registry.list_tool_names() == ["tool_b"]

    registry.clear()
    assert len(registry) == 0


# ---------------------------------------------------------------------------
# 3. Execution Boundary Tests
# ---------------------------------------------------------------------------


def test_execution_boundary_valid_call():
    registry = ToolRegistry()
    registry.register(DummyEchoTool("echo_test"))
    boundary = ToolExecutionBoundary(registry)

    call = ToolCall(id="call_abc123", name="echo_test", arguments={"message": "Hello Odisha"})
    result = boundary.execute(call)

    assert result.tool_call_id == "call_abc123"
    assert result.tool_name == "echo_test"
    assert result.status == ToolStatus.OK
    assert result.data == {"echo": "Hello Odisha"}


def test_execution_boundary_dict_input():
    registry = ToolRegistry()
    registry.register(DummyEchoTool("echo_test"))
    boundary = ToolExecutionBoundary(registry)

    raw_call = {"id": "call_raw", "name": "echo_test", "arguments": {"message": "Direct dict"}}
    result = boundary.execute(raw_call)

    assert result.tool_call_id == "call_raw"
    assert result.status == ToolStatus.OK
    assert result.data == {"echo": "Direct dict"}


def test_execution_boundary_unknown_tool():
    registry = ToolRegistry()
    registry.register(DummyEchoTool("registered_tool"))
    boundary = ToolExecutionBoundary(registry)

    call = ToolCall(name="unregistered_tool", arguments={})
    result = boundary.execute(call)

    assert result.status == ToolStatus.UNKNOWN
    assert "not recognized" in (result.reason or "")
    assert "registered_tool" in (result.error or "")


def test_execution_boundary_exception_containment():
    class FailingTool(BaseToolAdapter):
        @property
        def definition(self) -> ToolDefinition:
            return ToolDefinition(name="failing_tool", description="Always raises an error.")

        def execute(self, arguments: dict[str, Any], tool_call_id: str | None = None) -> ToolResult:
            raise RuntimeError("Database connection timeout simulation")

    registry = ToolRegistry()
    registry.register(FailingTool())
    boundary = ToolExecutionBoundary(registry)

    call = ToolCall(id="call_fail", name="failing_tool", arguments={})
    result = boundary.execute(call)

    assert result.status == ToolStatus.ERROR
    assert result.tool_call_id == "call_fail"
    assert "Database connection timeout simulation" in (result.error or "")


def test_execution_boundary_execute_all():
    registry = ToolRegistry()
    registry.register(DummyEchoTool("tool_1"))
    registry.register(DummyEchoTool("tool_2"))
    boundary = ToolExecutionBoundary(registry)

    calls = [
        ToolCall(id="c1", name="tool_1", arguments={"message": "First"}),
        ToolCall(id="c2", name="tool_2", arguments={"message": "Second"}),
        ToolCall(id="c3", name="unknown", arguments={}),
    ]
    results = boundary.execute_all(calls)
    assert len(results) == 3
    assert results[0].status == ToolStatus.OK
    assert results[1].status == ToolStatus.OK
    assert results[2].status == ToolStatus.UNKNOWN


# ---------------------------------------------------------------------------
# 4. Provider Adapter Interface & Mock Adapter Tests
# ---------------------------------------------------------------------------


def test_mock_provider_adapter_default_text():
    adapter = MockProviderAdapter(default_response="Custom greeting from O-Travelz AI.")
    messages = [ChatMessage(role=ChatRole.USER, content="Hello there")]

    response = adapter.generate(messages)
    assert response.finish_reason == FinishReason.STOP
    assert response.content == "Custom greeting from O-Travelz AI."
    assert len(response.tool_calls) == 0
    assert len(adapter.call_history) == 1


def test_mock_provider_adapter_simulated_tool_call():
    adapter = MockProviderAdapter()
    messages = [ChatMessage(role=ChatRole.USER, content="Find temples in Puri")]

    response = adapter.generate(messages)
    assert response.finish_reason == FinishReason.TOOL_CALLS
    assert len(response.tool_calls) == 1
    assert response.tool_calls[0].name == "search_places"
    assert "Puri" in response.tool_calls[0].arguments.get("query", "")


def test_mock_provider_adapter_canned_tool_calls():
    canned = [
        ToolCall(id="canned_1", name="search_places", arguments={"district": "Khordha"}),
        ToolCall(id="canned_2", name="build_itinerary", arguments={"constraints": {"days": 2, "interests": ["heritage"]}}),
    ]
    adapter = MockProviderAdapter(canned_tool_calls=canned)
    messages = [ChatMessage(role=ChatRole.USER, content="Plan a 2-day heritage trip")]

    response = adapter.generate(messages)
    assert response.finish_reason == FinishReason.TOOL_CALLS
    assert len(response.tool_calls) == 2
    assert response.tool_calls[0].name == "search_places"
    assert response.tool_calls[1].name == "build_itinerary"


# ---------------------------------------------------------------------------
# 5. Domain Tool Adapter Integration Tests
# ---------------------------------------------------------------------------

class MockPoint:
    def __init__(self, lat: float, lon: float):
        self.y = lat
        self.x = lon


class MockPlacesDB:
    """In-memory mock database seeded from canonical data/places JSON files."""

    def __init__(self):
        import json
        from pathlib import Path
        from uuid import uuid4
        from app.models.category import Category
        from app.models.place import Place
        from app.models.interest import Interest, PlaceInterest

        data_dir = Path(__file__).resolve().parents[2] / "data" / "places"
        with open(data_dir / "categories.json", encoding="utf-8") as f:
            cat_data = json.load(f)
        with open(data_dir / "interests.json", encoding="utf-8") as f:
            int_data = json.load(f)
        with open(data_dir / "places.json", encoding="utf-8") as f:
            place_data = json.load(f)

        self.categories = {}
        for c in cat_data:
            cat_id = uuid4()
            cat = Category(id=cat_id, name=c["name"], description=c.get("description", ""))
            self.categories[c["name"]] = cat
            self.categories[str(cat_id)] = cat

        self.interests = {}
        for i in int_data:
            int_id = uuid4()
            interest = Interest(id=int_id, name=i["name"], description=i.get("description", ""))
            self.interests[i["name"]] = interest

        self.places = []
        for p in place_data:
            cat = self.categories.get(p["category"])
            place_id = uuid4()
            mock_loc = MockPoint(p["lat"], p["lon"])
            place = Place(
                id=place_id,
                name=p["name"],
                district=p.get("district"),
                category_id=cat.id if cat else uuid4(),
                description=p.get("description"),
                avg_visit_minutes=p.get("avg_visit_minutes", 60),
                price_tier=p.get("price_tier", "moderate"),
                source=p.get("source", "verified_curated"),
                verified_at="2026-08-19T00:00:00Z",
                verification_status=p.get("verification_status", "verified"),
                contact_phone=p.get("contact_phone"),
                emergency_phone=p.get("emergency_phone"),
                address=p.get("address"),
            )
            place.location = mock_loc
            place.lat = p["lat"]
            place.lon = p["lon"]
            place.research_id = p.get("id") or p.get("research_id", p["name"])

            place.interest_associations = []
            for int_name in p.get("interests", []):
                if int_name in self.interests:
                    assoc = PlaceInterest(
                        place_id=place_id,
                        interest_id=self.interests[int_name].id,
                    )
                    assoc.interest = self.interests[int_name]
                    place.interest_associations.append(assoc)

            self.places.append((place, cat or Category(id=place.category_id, name=p["category"])))

    def query(self, *models):
        return MockSearchQuery(self.places)

    def get(self, model, ident):
        for place, cat in self.places:
            if str(place.id) == str(ident):
                return place
        return None


class MockSearchQuery:
    def __init__(self, items: list):
        self.items = items

    def join(self, *args, **kwargs):
        return self

    def options(self, *args, **kwargs):
        return self

    def filter(self, *criteria):
        filtered = self.items
        for crit in criteria:
            crit_str = str(crit).lower()
            if "district" in crit_str and "=" in crit_str:
                val = getattr(crit.right, "value", None) if hasattr(crit, "right") else None
                if val:
                    filtered = [item for item in filtered if (item[0].district or "").lower() == str(val).lower()]
            if "categories.name" in crit_str:
                val = getattr(crit.right, "value", None) if hasattr(crit, "right") else None
                if val:
                    filtered = [item for item in filtered if item[1].name.lower() == str(val).lower()]
            if "not in" in crit_str or "notin" in crit_str:
                from app.services.ranking.repository import NON_LEISURE_CATEGORIES
                filtered = [item for item in filtered if item[1].name not in NON_LEISURE_CATEGORIES]
        return MockSearchQuery(filtered)

    def all(self):
        return self.items


class RecordingTransport:
    def plan_transport_hop(self, args: PlanTransportHopArgs) -> TransportHopContract:
        return TransportHopContract(
            from_sequence=args.from_sequence,
            to_sequence=args.to_sequence,
            mode="walk",
            estimated_minutes=15,
            estimated_cost=None,
            legs=[{"mode": "walk", "detail": "Verified walking fallback"}],
            data_tier=DataTier.STATIC,
        )

    def get_provider_status(self, args: GetProviderStatusArgs) -> ProviderStatusContract:
        return ProviderStatusContract(
            provider_id=args.provider_id,
            data_tier=DataTier.SCHEDULED,
            notes="Mock test status",
        )


@pytest.fixture
def mock_db():
    return MockPlacesDB()


def test_search_places_tool_adapter(mock_db):
    adapter = SearchPlacesToolAdapter(mock_db)
    assert adapter.definition.name == "search_places"
    assert "properties" in adapter.definition.input_schema

    # Execute search for Puri district
    res = adapter.execute({"district": "Puri", "limit": 5}, tool_call_id="call_puri")
    assert res.status == ToolStatus.OK
    assert res.tool_call_id == "call_puri"
    assert isinstance(res.data, list)
    assert len(res.data) > 0
    assert any("Puri" in (p.district or "") for p in res.data)


def test_search_places_tool_adapter_medical_domain_isolation(mock_db):
    adapter = SearchPlacesToolAdapter(mock_db)
    # Search with is_medical=True
    res = adapter.execute({"is_medical": True, "limit": 5})
    assert res.status == ToolStatus.OK
    assert isinstance(res.data, list)
    for p in res.data:
        assert p.is_medical is True or p.category in ("hospital", "emergency_facility")


def test_build_itinerary_tool_adapter():
    from app.services.ranking import InMemoryPlaceRepository, VerifiedPlace
    from app.transport.adapters.walking import Coordinate

    places = [
        VerifiedPlace(
            database_id=f"place-{i}",
            category_id="temple",
            name=f"Temple {i}",
            coordinate=Coordinate(20.2, 85.8 + i / 1000),
            interests=("heritage", "spirituality"),
        )
        for i in range(1, 8)
    ]
    repo = InMemoryPlaceRepository(places)
    transport = RecordingTransport()
    itinerary_service = ItineraryService(repo, transport)
    adapter = BuildItineraryToolAdapter(itinerary_service)
    assert adapter.definition.name == "build_itinerary"

    # Valid itinerary request
    valid_args = {
        "constraints": {
            "days": 2,
            "interests": ["heritage"],
            "start": "Temple 1",
        }
    }
    res = adapter.execute(valid_args, tool_call_id="call_itin")
    assert res.status == ToolStatus.OK
    assert res.tool_call_id == "call_itin"
    assert res.data is not None
    assert len(res.data.days) == 2

    # Invalid constraints (e.g. days=0)
    invalid_args = {"constraints": {"days": 0, "interests": ["heritage"]}}
    res_invalid = adapter.execute(invalid_args)
    assert res_invalid.status in (ToolStatus.INVALID, ToolStatus.ERROR)



def test_plan_transport_hop_tool_adapter():
    transport = RecordingTransport()
    adapter = PlanTransportHopToolAdapter(transport)
    assert adapter.definition.name == "plan_transport_hop"

    from_p = PlaceSummary(id="p1", name="Lingaraj Temple", category="temple")
    to_p = PlaceSummary(id="p2", name="Mukteswar Temple", category="temple")
    constraints = PlanningConstraints(days=1, interests=["heritage"])

    args = {
        "from_place": from_p.model_dump(mode="json"),
        "to_place": to_p.model_dump(mode="json"),
        "constraints": constraints.model_dump(mode="json"),
    }
    res = adapter.execute(args, tool_call_id="call_hop")
    assert res.status == ToolStatus.OK
    assert res.tool_call_id == "call_hop"
    assert res.data is not None


def test_get_provider_status_tool_adapter():
    transport = RecordingTransport()
    adapter = GetProviderStatusToolAdapter(transport)
    assert adapter.definition.name == "get_provider_status"

    args = {"provider_id": "ama-bus"}
    res = adapter.execute(args, tool_call_id="call_prov")
    assert res.status == ToolStatus.OK
    assert res.tool_call_id == "call_prov"
    assert res.data is not None


def test_create_default_tool_registry(mock_db):
    registry = create_default_tool_registry(mock_db)
    assert len(registry) == 4
    assert registry.has_tool("search_places") is True
    assert registry.has_tool("build_itinerary") is True
    assert registry.has_tool("plan_transport_hop") is True
    assert registry.has_tool("get_provider_status") is True

    boundary = ToolExecutionBoundary(registry)
    res = boundary.execute(ToolCall(name="search_places", arguments={"query": "Konark"}))
    assert res.status == ToolStatus.OK
    assert len(res.data) > 0

    assert len(res.data) > 0



# ---------------------------------------------------------------------------
# 6. Security & Trust Boundary Tests
# ---------------------------------------------------------------------------


def test_security_cannot_execute_arbitrary_callables():
    registry = ToolRegistry()
    registry.register(DummyEchoTool("safe_tool"))
    boundary = ToolExecutionBoundary(registry)

    # Attempt to call built-in or dangerous functions
    dangerous_names = ["eval", "exec", "os.system", "__import__", "subprocess.Popen"]
    for dangerous in dangerous_names:
        res = boundary.execute(ToolCall(name=dangerous, arguments={"cmd": "ls"}))
        assert res.status == ToolStatus.UNKNOWN
        assert "not recognized" in (res.reason or "")


def test_security_malformed_arguments_rejected():
    registry = ToolRegistry()
    defn = ToolDefinition(
        name="strict_tool",
        description="Requires integer count.",
        input_schema={"type": "object", "properties": {"count": {"type": "integer"}}},
    )

    def strict_executor(args: dict[str, Any]) -> ToolResult:
        if not isinstance(args.get("count"), int):
            return ToolResult(tool_name="strict_tool", status=ToolStatus.INVALID, reason="count must be integer")
        return ToolResult(tool_name="strict_tool", status=ToolStatus.OK, data={"count": args["count"]})

    registry.register(definition=defn, executor=strict_executor)
    boundary = ToolExecutionBoundary(registry)

    # Pass malformed string argument
    res = boundary.execute(ToolCall(name="strict_tool", arguments={"count": "not_an_int"}))
    assert res.status == ToolStatus.INVALID
