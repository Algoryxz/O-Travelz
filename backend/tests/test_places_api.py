"""Tests for Whole-Odisha authoritative places discovery API and integration."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, List, Optional
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app
from app.models.category import Category
from app.models.place import Place
from app.services.ranking import InMemoryPlaceRepository, VerifiedPlace
from app.transport.adapters.walking import Coordinate
from app.transport.service import TransportService


class MockPoint:
    def __init__(self, lat: float, lon: float):
        self.y = lat
        self.x = lon


class MockPlacesDB:
    def __init__(self):
        data_dir = Path(__file__).resolve().parents[2] / "data" / "places"
        with open(data_dir / "categories.json", encoding="utf-8") as f:
            cat_data = json.load(f)
        with open(data_dir / "places.json", encoding="utf-8") as f:
            place_data = json.load(f)

        self.categories = {}
        for c in cat_data:
            cat_id = uuid4()
            cat = Category(id=cat_id, name=c["name"], description=c.get("description", ""))
            self.categories[c["name"]] = cat
            self.categories[str(cat_id)] = cat

        self.places = []
        for p in place_data:
            cat = self.categories.get(p["category"])
            place_id = uuid4()
            mock_loc = MockPoint(p["lat"], p["lon"])
            place = Place(
                id=place_id,
                name=p["name"],
                category_id=cat.id if cat else uuid4(),
                description=p.get("description"),
                avg_visit_minutes=p.get("avg_visit_minutes", 60),
                price_tier=p.get("price_tier", "moderate"),
                source=p.get("source", "verified_curated"),
                verified_at="2026-08-19T00:00:00Z",
            )
            # Attach location and mock shape
            place.location = mock_loc
            place.research_id = p.get("id") or p.get("research_id", p["name"])
            self.places.append((place, cat or Category(id=place.category_id, name=p["category"])))

    def query(self, *models):
        return MockQuery(self.places)


class MockQuery:
    def __init__(self, items: List[tuple[Place, Category]]):
        self.items = items

    def join(self, *args, **kwargs):
        return self

    def filter(self, *criteria):
        filtered = self.items
        for crit in criteria:
            if hasattr(crit, "left") and hasattr(crit, "right"):
                col_name = getattr(crit.left, "name", None)
                val = getattr(crit.right, "value", None)
                if col_name == "id":
                    filtered = [(p, c) for p, c in filtered if str(p.id) == str(val)]
                elif col_name == "research_id":
                    filtered = [(p, c) for p, c in filtered if str(getattr(p, "research_id", "")) == str(val)]
                elif col_name == "category_id":
                    filtered = [(p, c) for p, c in filtered if str(p.category_id) == str(val)]
            else:
                crit_str = str(crit).lower()
                if "places.id" in crit_str or "place.id" in crit_str:
                    pass
        return MockQuery(filtered)

    def filter_by_category(self, cat_name: str):
        return MockQuery([
            (p, c) for p, c in self.items
            if c.name.lower() == cat_name.lower()
        ])

    def filter_by_search(self, term: str):
        term = term.lower()
        return MockQuery([
            (p, c) for p, c in self.items
            if term in p.name.lower() or (p.description and term in p.description.lower())
        ])

    def filter_by_id(self, place_id: str):
        return MockQuery([
            (p, c) for p, c in self.items
            if str(p.id) == place_id or getattr(p, "research_id", None) == place_id
        ])

    def order_by(self, *args):
        return self

    def all(self):
        return self.items

    def first(self):
        return self.items[0] if self.items else None


@pytest.fixture(autouse=True)
def override_database():
    mock_db = MockPlacesDB()

    def _get_db_override():
        yield mock_db

    app.dependency_overrides[get_db] = _get_db_override
    yield
    app.dependency_overrides.clear()


client = TestClient(app)


def test_list_places_whole_odisha():
    """Verify GET /places returns all 50+ verified places across Odisha."""
    response = client.get("/places")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 50

    names = {p["name"] for p in data}
    assert "Lingaraj Temple" in names
    assert "Jagannath Temple, Puri" in names
    assert "Konark Sun Temple" in names
    assert "Daringbadi Hill Station" in names
    assert "Hirakud Dam & Reservoir" in names
    assert "Similipal National Park" in names
    assert "Gupteswar Cave Temple, Koraput" in names
    assert "Barabati Fort" in names
    assert "Chilika Lake - Satapada" in names


def test_list_places_filter_by_category():
    """Verify category filtering on GET /places."""
    response = client.get("/places?category=beach")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_list_places_search_query():
    """Verify search filter on GET /places."""
    response = client.get("/places?search=Daringbadi")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_get_place_by_id():
    """Verify GET /places/{id} lookup with UUID, research_id, and invalid IDs."""
    list_res = client.get("/places")
    first_place = list_res.json()[0]
    place_id = first_place["id"]

    # 1. Look up by UUID
    detail_res = client.get(f"/places/{place_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["name"] == first_place["name"]
    assert detail["category"] == first_place["category"]

    # 2. Look up by non-UUID research_id / slug
    res_slug = client.get("/places/place_013")
    assert res_slug.status_code == 200
    assert "Museum of Tribal Arts" in res_slug.json()["name"]

    # 3. Non-existent non-UUID identifier returns clean 404
    missing_res = client.get("/places/non-existent-place-slug")
    assert missing_res.status_code == 404
    assert missing_res.json() == {"detail": "Place not found"}


def test_ai_plan_whole_odisha_destinations():
    """Verify AI model adapter correctly identifies Odisha destinations as origins and themes."""
    test_queries = [
        ("3 days in Koraput with nature and culture", 3),
        ("2 days around Puri with beaches", 2),
        ("2 days in Sambalpur", 2),
        ("weekend in Daringbadi", 2),
    ]

    for query, expected_days in test_queries:
        res = client.post("/ai/plan", json={"message": query})
        assert res.status_code == 200, f"Failed for query '{query}': {res.text}"
        body = res.json()
        assert body["status"] in ("success", "clarification")
        if body.get("itinerary"):
            assert body["itinerary"]["constraints"]["days"] == expected_days


def test_ai_refinement_and_clarification_handling():
    """Verify AI model adapter correctly handles multi-turn refinement and clarification flows."""
    from app.ai.model import RuleBasedModelAdapter
    from app.ai.schemas import PlanningConstraints, IntentKind

    adapter = RuleBasedModelAdapter()
    base_constraints = PlanningConstraints(
        days=3,
        interests=["heritage", "temple"],
        start="Bhubaneswar",
    )

    # 1. Refinement with existing constraints: 'Make it 3 days'
    res_days = adapter.parse_intent("Make it 3 days", base_constraints)
    assert res_days["kind"] == IntentKind.REFINEMENT.value
    assert res_days["constraint_update"]["days"] == 3

    # 2. Refinement with existing constraints: 'Extend this trip to 3 days and add wildlife interests'
    res_ext = adapter.parse_intent("Extend this trip to 3 days and add wildlife interests", base_constraints)
    assert res_ext["kind"] == IntentKind.REFINEMENT.value
    assert res_ext["constraint_update"]["days"] == 3
    assert "wildlife" in res_ext["constraint_update"]["interests"]

    # 3. Refinement with existing constraints: 'Make it more food focused'
    res_food = adapter.parse_intent("Make it more food focused", base_constraints)
    assert res_food["kind"] == IntentKind.REFINEMENT.value
    assert "food" in res_food["constraint_update"]["interests"]

    # 4. Refinement with existing constraints: 'Change this to a 2-day itinerary starting from Puri with beach and heritage'
    res_change = adapter.parse_intent(
        "Change this to a 2-day itinerary starting from Puri with beach and heritage",
        base_constraints,
    )
    assert res_change["kind"] == IntentKind.REFINEMENT.value
    assert res_change["constraint_update"]["days"] == 2
    assert "Puri" in res_change["constraint_update"]["start"]

    # 5. Clarification on ambiguous query with existing constraints: 'tell me about nature'
    res_ambig = adapter.parse_intent("tell me about nature", base_constraints)
    assert res_ambig["kind"] == IntentKind.CLARIFICATION.value

    # 6. Refinement keyword without existing constraints -> Clarification 'Which existing itinerary should I refine?'
    res_no_ctx = adapter.parse_intent("Make it more food focused", None)
    assert res_no_ctx["kind"] == IntentKind.CLARIFICATION.value
    assert "Which existing itinerary should I refine?" in res_no_ctx["clarification"]["question"]
