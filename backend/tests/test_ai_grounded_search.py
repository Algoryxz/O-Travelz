"""Tests for AI Grounding and SearchService Integration in Phase 11 Step 6."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, List
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.ai.grounding import GroundingBoundary, GroundingContext, GroundingFact
from app.ai.model import RuleBasedModelAdapter
from app.ai.orchestrator import AIOrchestrator
from app.ai.schemas import (
    AIIntent,
    AIPlanRequest,
    AIResponse,
    AIStatus,
    IntentKind,
    ModelClaim,
    ModelResponse,
    PlanningConstraints,
    SearchPlacesArgs,
)
from app.ai.tools import BuildItineraryTool, GetProviderStatusTool, PlanTransportHopTool, SearchPlacesTool, ToolResult, ToolStatus
from app.api.ai_routes import get_ai_orchestrator
from app.data.odisha_districts import ODISHA_DISTRICTS
from app.db.session import get_db
from app.main import app
from app.models.category import Category
from app.models.place import Place
from app.models.interest import Interest, PlaceInterest
from app.schemas.common import PlaceSummary
from app.schemas.transport import DataTier, TransportHopContract
from app.services.itinerary import ItineraryService
from app.services.ranking import InMemoryPlaceRepository, VerifiedPlace
from app.services.search import CompactKnowledgeRecord, SearchService
from app.transport.adapters.walking import Coordinate
from app.transport.service import ProviderNotAvailableError, TransportService


class MockPoint:
    def __init__(self, lat: float, lon: float):
        self.y = lat
        self.x = lon


class MockSearchQuery:
    def __init__(self, items: List[tuple[Place, Category]]):
        self.items = items

    def join(self, *args, **kwargs):
        return self

    def options(self, *args, **kwargs):
        return self

    def filter(self, *criteria):
        filtered = self.items
        for crit in criteria:
            crit_str = str(crit).lower()
            if hasattr(crit, "left") and hasattr(crit, "right"):
                col_name = getattr(crit.left, "name", None)
                val = getattr(crit.right, "value", None)
                if col_name == "district":
                    val_clean = str(val).strip("%").lower() if val else ""
                    filtered = [(p, c) for p, c in filtered if getattr(p, "district", "") and val_clean in getattr(p, "district", "").lower()]
                elif col_name == "name" and "categories" in crit_str:
                    val_clean = str(val).strip("%").lower() if val else ""
                    filtered = [(p, c) for p, c in filtered if c and val_clean == c.name.lower()]
                elif col_name == "verification_status":
                    val_clean = str(val).strip("%").lower() if val else ""
                    filtered = [(p, c) for p, c in filtered if getattr(p, "verification_status", "") and val_clean == getattr(p, "verification_status", "").lower()]
            elif "categories.name" in crit_str:
                try:
                    val = str(crit.right.value).strip("%").lower()
                    filtered = [(p, c) for p, c in filtered if c and val == c.name.lower()]
                except Exception:
                    pass
            elif "places.district" in crit_str:
                try:
                    val = str(crit.right.value).strip("%").lower()
                    filtered = [(p, c) for p, c in filtered if getattr(p, "district", "") and val in getattr(p, "district", "").lower()]
                except Exception:
                    pass
        return MockSearchQuery(filtered)

    def all(self):
        return self.items


class MockPlacesDB:
    def __init__(self):
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


class RecordingTransport:
    def plan_transport_hop(self, args):
        return TransportHopContract(
            from_sequence=args.from_sequence,
            to_sequence=args.to_sequence,
            mode="walk",
            estimated_minutes=7,
            estimated_cost=None,
            data_tier=DataTier.STATIC,
            legs=[{"mode": "walk", "detail": "Verified walking route"}],
        )

    def get_provider_status(self, args):
        raise ProviderNotAvailableError(f"Provider '{args.provider_id}' is unknown.")


@pytest.fixture
def override_db():
    mock_db = MockPlacesDB()

    def _get_db_override():
        yield mock_db

    app.dependency_overrides[get_db] = _get_db_override
    yield mock_db
    app.dependency_overrides.clear()


client = TestClient(app)


# ==============================================================================
# 1. SearchPlacesTool Direct Execution Tests
# ==============================================================================

def test_search_places_tool_basic(override_db):
    tool = SearchPlacesTool(override_db)
    result = tool.execute({"query": "Jagannath Temple, Puri", "limit": 5})
    assert result.status == ToolStatus.OK
    assert len(result.data) >= 1
    assert any("Jagannath Temple" in r.name for r in result.data)


def test_search_places_tool_district(override_db):
    tool = SearchPlacesTool(override_db)
    result = tool.execute({"district": "Koraput", "limit": 10})
    assert result.status == ToolStatus.OK
    assert len(result.data) >= 1
    for r in result.data:
        assert r.district == "Koraput"


def test_search_places_tool_medical_isolation(override_db):
    tool = SearchPlacesTool(override_db)
    
    # 1. Leisure query in Cuttack must NOT return SCB Medical College
    res_leisure = tool.execute({"district": "Cuttack", "limit": 10})
    assert res_leisure.status == ToolStatus.OK
    assert all(r.category != "hospital" for r in res_leisure.data)

    # 2. Explicit medical query in Cuttack MUST return SCB Medical College
    res_medical = tool.execute({"district": "Cuttack", "is_medical": True, "limit": 5})
    assert res_medical.status == ToolStatus.OK
    assert any("SCB Medical College" in r.name for r in res_medical.data)


# ==============================================================================
# 2. RuleBasedModelAdapter 30-District Dynamic Resolution Tests
# ==============================================================================

def test_adapter_resolves_all_30_districts_as_start():
    adapter = RuleBasedModelAdapter()
    for district in ODISHA_DISTRICTS:
        intent_raw = adapter.parse_intent(f"Plan a 2-day trip starting from {district}")
        intent = AIIntent.model_validate(intent_raw)
        assert intent.kind == IntentKind.PLANNING
        assert intent.constraints.start == district


def test_adapter_resolves_verified_aliases():
    adapter = RuleBasedModelAdapter()
    
    # BBI -> Biju Patnaik International Airport
    intent_bbi = AIIntent.model_validate(adapter.parse_intent("Plan 3 days starting at BBI for heritage"))
    assert intent_bbi.constraints.start == "Biju Patnaik International Airport"

    # BBS -> Bhubaneswar Railway Station
    intent_bbs = AIIntent.model_validate(adapter.parse_intent("Start at BBS for 2 days"))
    assert intent_bbs.constraints.start == "Bhubaneswar Railway Station"

    # Kashmir of Odisha -> Daringbadi Hill Station
    intent_kashmir = AIIntent.model_validate(adapter.parse_intent("Trip to Kashmir of Odisha for 2 days"))
    assert intent_kashmir.constraints.start == "Daringbadi Hill Station"


# ==============================================================================
# 3. Grounding Context & Anti-Hallucination Claim Validation Tests
# ==============================================================================

def test_grounding_context_records_search_results():
    context = GroundingContext()
    records = [
        CompactKnowledgeRecord(
            id="p1",
            name="Konark Sun Temple",
            district="Puri",
            region="Konark & Marine",
            category="monument",
            description="UNESCO World Heritage Site",
            interests=["heritage", "architecture"],
            lat=19.8876,
            lon=86.0945,
            verification_status="verified",
            source="ASI",
        )
    ]
    tool_result = ToolResult(tool_name="search_places", status=ToolStatus.OK, data=records)
    context.record(tool_result)

    assert "search.results.count" in context.facts
    assert "search.place.p1" in context.facts
    assert context.facts["search.place.p1"].rendered.startswith("Konark Sun Temple in Puri (monument)")


def test_grounding_boundary_rejects_hallucinated_claims():
    context = GroundingContext()
    boundary = GroundingBoundary()

    context.facts["search.results.count"] = GroundingFact("search.results.count", 1, "Found 1 verified place.")
    
    valid_claim = ModelClaim(fact_id="search.results.count", value=1)
    fabricated_claim = ModelClaim(fact_id="search.place.fake123", value="Fake 7-star resort")

    draft = ModelResponse(claims=[valid_claim, fabricated_claim])
    grounded_msg = boundary.ground(draft, context)

    # Grounded message must ONLY contain the verified fact
    assert "Found 1 verified place." in grounded_msg
    assert "Fake 7-star resort" not in grounded_msg


# ==============================================================================
# 4. AI Orchestrator Execution with Search & Itinerary
# ==============================================================================

def test_orchestrator_with_search_places_tool(override_db):
    verified_places = [
        VerifiedPlace(
            database_id="p-sambalpur-1",
            category_id="temple",
            name="Samaleswari Temple, Sambalpur",
            coordinate=Coordinate(21.4678, 83.9634),
        ),
        VerifiedPlace(
            database_id="p-sambalpur-2",
            category_id="dam",
            name="Hirakud Dam & Reservoir",
            coordinate=Coordinate(21.5333, 83.8750),
        ),
    ]
    repo = InMemoryPlaceRepository(verified_places)
    transport = RecordingTransport()
    itinerary_service = ItineraryService(repo, transport)
    
    orchestrator = AIOrchestrator(
        RuleBasedModelAdapter(),
        build_itinerary=BuildItineraryTool(itinerary_service),
        plan_transport_hop=PlanTransportHopTool(transport),
        get_provider_status=GetProviderStatusTool(transport),
        search_places=SearchPlacesTool(override_db),
    )

    response = orchestrator.orchestrate("Plan a 1-day trip starting from Sambalpur for heritage")
    assert response.status == AIStatus.SUCCESS
    assert response.itinerary is not None
    assert len(response.itinerary.days) == 1
