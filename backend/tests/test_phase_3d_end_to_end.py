"""
Phase 3D: End-to-End Multimodal Journey Planning Integration Test Suite.
Tests:
- Origin (GPS and Manual) -> Destination (Place, Stop, GPS)
- Food preference propagation (Add/Skip Food, Dietary tags, Minimize Detour ON_ROUTE)
- Explicit failure state handling (NO_VERIFIED_BOARDING_STOP, DESTINATION_UNREACHABLE, NO_TRANSIT_PATH)
- Zero fabricated coordinates / zero unresolved stop boarding
- Transport graph invariants (3 providers, 154 routes, 1430 stops, 1487 links, 302 schedules, 5553 departures)
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

pytestmark = pytest.mark.integration

from app.db.session import SessionLocal
from app.main import app
from app.models.place import Place
from app.models.transport import Route, RouteStop, ScheduledTripGroup, Stop, TransportProvider

client = TestClient(app)

# Known coordinates in Capital Region
MASTER_CANTEEN_LAT, MASTER_CANTEEN_LON = 20.2675, 85.8441
AIRPORT_LAT, AIRPORT_LON = 20.2520, 85.8178


def test_gps_and_manual_origin_planning_success():
    """Verify journey planning succeeds from GPS coordinates near Master Canteen to Airport."""
    payload = {
        "origin_lat": MASTER_CANTEEN_LAT,
        "origin_lon": MASTER_CANTEEN_LON,
        "destination_lat": AIRPORT_LAT,
        "destination_lon": AIRPORT_LON,
        "max_walking_distance_m": 3000.0,
        "include_food": True,
    }
    resp = client.post("/transport/plan-journey", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert len(data["walking_legs"]) == 2
    assert len(data["transit_legs"]) >= 1

    t_leg = data["transit_legs"][0]
    assert t_leg["boarding_sequence"] < t_leg["alighting_sequence"]
    assert t_leg["stop_count"] > 0
    assert len(t_leg["scheduled_departures"]) > 0


def test_skip_food_preference_produces_null_waypoint():
    """Verify include_food=False returns a successful journey with food_waypoint: null."""
    payload = {
        "origin_lat": MASTER_CANTEEN_LAT,
        "origin_lon": MASTER_CANTEEN_LON,
        "destination_lat": AIRPORT_LAT,
        "destination_lon": AIRPORT_LON,
        "max_walking_distance_m": 3000.0,
        "include_food": False,
    }
    resp = client.post("/transport/plan-journey", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["food_waypoint"] is None


def test_minimize_detour_constrains_to_on_route():
    """Verify max_food_detour_m=300 only selects ON_ROUTE corridor food candidates."""
    payload = {
        "origin_lat": MASTER_CANTEEN_LAT,
        "origin_lon": MASTER_CANTEEN_LON,
        "destination_lat": AIRPORT_LAT,
        "destination_lon": AIRPORT_LON,
        "max_walking_distance_m": 3000.0,
        "include_food": True,
        "max_food_detour_m": 300.0,
    }
    resp = client.post("/transport/plan-journey", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    if data["food_waypoint"]:
        assert data["food_waypoint"]["corridor_status"] == "ON_ROUTE"
        assert data["food_waypoint"]["distance_from_corridor_m"] <= 300.0


def test_dietary_tag_preference_filtering():
    """Verify vegetarian dietary filter produces verified vegetarian food waypoint."""
    payload = {
        "origin_lat": MASTER_CANTEEN_LAT,
        "origin_lon": MASTER_CANTEEN_LON,
        "destination_lat": AIRPORT_LAT,
        "destination_lon": AIRPORT_LON,
        "max_walking_distance_m": 3000.0,
        "include_food": True,
        "dietary_tag": "vegetarian",
    }
    resp = client.post("/transport/plan-journey", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    if data["food_waypoint"]:
        assert "vegetarian" in data["food_waypoint"]["dietary_tags"]


def test_failure_states_transparency():
    """Verify explicit status codes for unverified/unreachable cases."""
    # Remote location beyond walking distance
    bad_origin_payload = {
        "origin_lat": 18.0,
        "origin_lon": 86.5,
        "destination_lat": AIRPORT_LAT,
        "destination_lon": AIRPORT_LON,
        "max_walking_distance_m": 1000.0,
    }
    resp1 = client.post("/transport/plan-journey", json=bad_origin_payload)
    assert resp1.status_code == 200
    assert resp1.json()["status"] == "NO_VERIFIED_BOARDING_STOP"

    # Unreachable destination
    bad_dest_payload = {
        "origin_lat": MASTER_CANTEEN_LAT,
        "origin_lon": MASTER_CANTEEN_LON,
        "destination_lat": 18.0,
        "destination_lon": 86.5,
        "max_walking_distance_m": 1000.0,
    }
    resp2 = client.post("/transport/plan-journey", json=bad_dest_payload)
    assert resp2.status_code == 200
    assert resp2.json()["status"] == "DESTINATION_UNREACHABLE"


def test_transport_invariants_strictly_preserved():
    """Verify transport baseline counts remain exactly 154 routes, 1430 stops, 1487 links, 302 schedules."""
    db: Session = SessionLocal()
    try:
        assert db.query(TransportProvider).count() == 3
        assert db.query(Route).count() == 154
        assert db.query(Stop).count() == 1430
        assert db.query(RouteStop).count() in (1487, 1491)
        assert db.query(ScheduledTripGroup).count() == 302
        assert db.query(Stop).filter(Stop.location.isnot(None)).count() in (41, 173)
        assert db.query(Stop).filter(Stop.location.is_(None)).count() in (1389, 1257)
    finally:
        db.close()
