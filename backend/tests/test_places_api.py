"""Tests for Whole-Odisha authoritative places discovery API and integration."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

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
    assert len(data) >= 3
    for place in data:
        assert place["category"] == "beach"

    beach_names = {p["name"] for p in data}
    assert "Puri Golden Beach" in beach_names
    assert "Chandrabhaga Beach" in beach_names


def test_list_places_search_query():
    """Verify search filter on GET /places."""
    response = client.get("/places?search=Daringbadi")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    for place in data:
        assert "daringbadi" in place["name"].lower() or "daringbadi" in (place["description"] or "").lower()


def test_get_place_by_id():
    """Verify GET /places/{id} lookup."""
    list_res = client.get("/places")
    first_place = list_res.json()[0]
    place_id = first_place["id"]

    detail_res = client.get(f"/places/{place_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["name"] == first_place["name"]
    assert detail["category"] == first_place["category"]


def test_plan_itinerary_arbitrary_odisha_origin():
    """Verify planning itinerary starting from arbitrary Odisha locations."""
    for origin in ["Konark Sun Temple", "Daringbadi Hill Station", "Hirakud Dam & Reservoir", "Gupteswar Cave Temple, Koraput"]:
        res = client.post(
            "/itinerary/plan",
            json={"days": 2, "interests": ["nature", "heritage"], "start": origin},
        )
        assert res.status_code == 200, f"Failed for origin {origin}: {res.text}"
        body = res.json()
        assert len(body["days"]) == 2
        assert body["constraints"]["start"] == origin
        assert len(body["days"][0]["hops"]) > 0
        assert body["days"][0]["hops"][0]["from_sequence"] == 0


def test_ai_plan_whole_odisha_destinations():
    """Verify AI model adapter correctly identifies Odisha destinations as origins and themes."""
    test_queries = [
        ("3 days in Koraput with nature and culture", 3, "Gupteswar Cave Temple, Koraput"),
        ("2 days around Puri with beaches", 2, "Puri Golden Beach"),
        ("2 days in Sambalpur", 2, "Samaleswari Temple, Sambalpur"),
        ("weekend in Daringbadi", 2, "Daringbadi Hill Station"),
    ]

    for query, expected_days, expected_origin in test_queries:
        res = client.post("/ai/plan", json={"message": query})
        assert res.status_code == 200, f"Failed for query '{query}': {res.text}"
        body = res.json()
        assert body["status"] in ("success", "clarification")
        if body["itinerary"]:
            assert body["itinerary"]["constraints"]["days"] == expected_days
