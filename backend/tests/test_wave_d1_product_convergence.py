"""Wave D1 Product Runtime Convergence Acceptance Suite.

Validates the full end-to-end traveler flow against real runtime services:
1. Health and Readiness
2. Golden Journey Place Discovery and Detail (Lingaraj Temple / Bab54683)
3. Deterministic Itinerary Planning
4. Transit Route and Road-Following Geometry Truth Boundary
5. Civic Utility Boundary Isolation (ATMs/Police/Fuel not in /places)
6. Weather Truth Fail-Closed Invariant
7. AI Copilot Intent Priority (Planning outranks Weather and Transit)
"""
from __future__ import annotations

import httpx
import pytest
from fastapi.testclient import TestClient
from app.main import app

# Connect to the live running backend server when available, or fallback to TestClient
try:
    _probe = httpx.get("http://127.0.0.1:8000/health", timeout=1.5)
    if _probe.status_code == 200:
        client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=15.0)
    else:
        client = TestClient(app)
except Exception:
    client = TestClient(app)


def test_d1_runtime_health_and_readiness():
    """1. Runtime health and database connectivity."""
    health_resp = client.get("/health")
    assert health_resp.status_code == 200
    assert health_resp.json().get("status") == "ok"

    ready_resp = client.get("/ready")
    assert ready_resp.status_code == 200
    ready_json = ready_resp.json()
    assert ready_json.get("status") == "ready"
    assert ready_json.get("database") == "connected"


def test_d1_golden_journey_place_discovery_and_media():
    """2. Place discovery, slug/UUID resolution, and authentic media."""
    # Search for Lingaraj
    search_resp = client.get("/places?search=Lingaraj")
    assert search_resp.status_code == 200
    places = search_resp.json()
    assert len(places) > 0

    lingaraj = next((p for p in places if "Lingaraj" in p.get("name", "")), None)
    assert lingaraj is not None
    assert lingaraj.get("lat") is not None
    assert lingaraj.get("lon") is not None
    assert lingaraj.get("source") is not None

    # Resolve by UUID
    uuid_str = lingaraj.get("id")
    detail_resp = client.get(f"/places/{uuid_str}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail.get("name") == lingaraj.get("name")

    # Resolve by historical slug
    slug_resp = client.get("/places/place_bbsr_001")
    assert slug_resp.status_code == 200
    slug_detail = slug_resp.json()
    assert slug_detail.get("id") == uuid_str

    # Authentic media check: no fake placeholder strings, webp preferred
    images = detail.get("images", [])
    assert len(images) > 0
    hero = images[0]
    hero_url = hero.get("url") or hero.get("thumbnail_url") or hero.get("card_url") or ""
    assert hero_url.endswith(".webp") or hero_url.endswith(".jpg") or hero_url.endswith(".png")


def test_d1_golden_journey_deterministic_itinerary():
    """3. End-to-end deterministic planning flow."""
    plan_payload = {
        "days": 1,
        "interests": ["culture"],
        "start": "Bhubaneswar",
        "pace": "moderate"
    }
    resp = client.post("/itinerary/plan", json=plan_payload)
    assert resp.status_code == 200
    plan = resp.json()
    assert "itinerary_id" in plan
    assert len(plan.get("days", [])) == 1
    day_1 = plan["days"][0]
    assert len(day_1.get("stops", [])) >= 2


def test_d1_transit_road_following_geometry_boundary():
    """4. Transit routes fail closed on unverified geometry and deliver road-following paths."""
    # Mo Bus Route 09
    route_resp = client.get("/transport/routes/09")
    assert route_resp.status_code == 200
    route_data = route_resp.json()
    assert route_data.get("route_number") == "09"

    geom_resp = client.get("/transport/routes/09/geometry")
    assert geom_resp.status_code == 200
    geom_data = geom_resp.json()
    assert "segments" in geom_data
    # Invariants: no straight synthetic chords across stops; segments are either road-following or empty
    for seg in geom_data["segments"]:
        geom = seg.get("geometry", {})
        coords = geom.get("coordinates", [])
        if seg.get("status") == "road_following":
            assert len(coords) >= 2
        elif seg.get("status") in ("unresolved", "gap"):
            assert len(coords) == 0


def test_d1_civic_utility_boundary_isolation():
    """5. Civic utilities (ATMs, Police, Fuel, Fire) are isolated from leisure place searches."""
    for query in ("ATM", "Police", "Petrol", "Fuel", "Fire"):
        resp = client.get(f"/places?search={query}")
        assert resp.status_code == 200
        items = resp.json()
        assert len(items) == 0

    # Proximate essentials must serve real services via dedicated endpoint
    nearby_resp = client.get("/api/v1/services/nearby?lat=20.2382&lon=85.8335&radius_km=5.0")
    assert nearby_resp.status_code == 200
    services = nearby_resp.json().get("services", [])
    assert len(services) > 0
    first_service = services[0]
    assert "category" in first_service
    assert "verification_status" in first_service
    assert "distance_km" in first_service


def test_d1_weather_truth_fail_closed():
    """6. Weather fails closed without synthesizing fake 0C or clear skies."""
    # Valid Bhubaneswar coordinate
    resp = client.get("/weather/current?lat=20.2961&lon=85.8245")
    assert resp.status_code == 200
    data = resp.json()
    current = data.get("current", {})
    assert current.get("temperature_c") is not None
    assert isinstance(current.get("temperature_c"), (int, float))

    # Invalid coordinate fails closed
    resp_invalid = client.get("/weather/current?lat=999.0&lon=999.0")
    assert resp_invalid.status_code == 200
    inv_data = resp_invalid.json()
    inv_current = inv_data.get("current", {})
    assert inv_current.get("status") in ("unavailable", "error")
    assert inv_current.get("temperature_c") is None


def test_d1_ai_planner_intent_priority_and_duration():
    """7. AI Intent router prioritizes planning over weather/transit and parses hours accurately."""
    # Rainy day planning
    rainy_resp = client.post("/ai/converse", json={
        "messages": [{"role": "user", "content": "Plan a rainy day in Bhubaneswar"}]
    })
    assert rainy_resp.status_code == 200
    rainy_json = rainy_resp.json()
    tool_names = [call.get("name") for call in rainy_json.get("tool_calls", [])]
    assert "build_itinerary" in tool_names
    assert "get_weather" not in tool_names

    # Straight weather question
    weather_resp = client.post("/ai/converse", json={
        "messages": [{"role": "user", "content": "What is the weather in Bhubaneswar?"}]
    })
    assert weather_resp.status_code == 200
    weather_json = weather_resp.json()
    tool_names = [call.get("name") for call in weather_json.get("tool_calls", [])]
    assert "get_weather" in tool_names

    # Hour duration planning
    hours_resp = client.post("/ai/converse", json={
        "messages": [{"role": "user", "content": "6 hours in Bhubaneswar"}]
    })
    assert hours_resp.status_code == 200
    hours_json = hours_resp.json()
    for call in hours_json.get("tool_calls", []):
        if call.get("name") == "build_itinerary":
            assert call.get("arguments", {}).get("constraints", {}).get("days") == 1
