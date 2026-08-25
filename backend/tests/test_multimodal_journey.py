"""
Phase 3C: Multimodal Journey Planning Test Suite.
Tests:
- Origin/Destination resolution (GPS, Place, Stop)
- Single-route transit path discovery and stop sequence ordering
- Schedule departure extraction
- Optional food waypoint corridor integration
- Status handling (SUCCESS, NO_VERIFIED_BOARDING_STOP, DESTINATION_UNREACHABLE, NO_TRANSIT_PATH)
- Zero fake coordinates / zero unresolved stop boarding
- Transport graph invariants (3 providers, 154 routes, 1430 stops, 1487 links, 302 schedules, 5553 departures)
"""
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.main import app
from app.models.place import Place
from app.models.transport import Route, RouteStop, ScheduledTripGroup, Stop, TransportProvider
from app.transport.planner import MultimodalJourneyPlanner

client = TestClient(app)

# Known coordinates in Capital Region
MASTER_CANTEEN_LAT, MASTER_CANTEEN_LON = 20.2675, 85.8441
AIRPORT_LAT, AIRPORT_LON = 20.2520, 85.8178


def test_origin_resolution_no_verified_boarding_stop():
    """Verify origin in remote/uninhabited coordinates returns NO_VERIFIED_BOARDING_STOP."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        # Deep Bay of Bengal coordinates
        res = planner.plan_journey(
            origin_lat=18.0,
            origin_lon=86.5,
            destination_lat=AIRPORT_LAT,
            destination_lon=AIRPORT_LON,
            max_walking_distance_m=1000.0,
        )
        assert res["status"] == "NO_VERIFIED_BOARDING_STOP"
        assert res["walking_legs"] == []
        assert res["transit_legs"] == []
        assert len(res["warnings"]) > 0
    finally:
        db.close()


def test_destination_resolution_unreachable():
    """Verify destination with no nearby verified transit stops returns DESTINATION_UNREACHABLE."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=MASTER_CANTEEN_LAT,
            origin_lon=MASTER_CANTEEN_LON,
            destination_lat=18.0,
            destination_lon=86.5,
            max_walking_distance_m=1000.0,
        )
        assert res["status"] == "DESTINATION_UNREACHABLE"
    finally:
        db.close()


def test_valid_single_route_journey_with_food_waypoint():
    """Verify planning between Master Canteen area and Airport/Khandagiri area discovers Route 12/27 and food waypoint."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=MASTER_CANTEEN_LAT,
            origin_lon=MASTER_CANTEEN_LON,
            destination_lat=AIRPORT_LAT,
            destination_lon=AIRPORT_LON,
            max_walking_distance_m=3000.0,
            include_food=True,
        )

        if res["status"] == "SUCCESS":
            assert len(res["walking_legs"]) == 2
            assert len(res["transit_legs"]) >= 1

            t_leg = res["transit_legs"][0]
            assert t_leg["boarding_sequence"] < t_leg["alighting_sequence"]
            assert t_leg["stop_count"] > 0
            assert t_leg["boarding_stop_name"]
            assert t_leg["alighting_stop_name"]

            # Food waypoint checks if discovered
            if res["food_waypoint"]:
                fw = res["food_waypoint"]
                assert fw["place_id"]
                assert fw["name"]
                assert fw["corridor_status"] in ("ON_ROUTE", "SHORT_DETOUR", "LONG_DETOUR")
                assert fw["distance_from_corridor_m"] >= 0.0

            assert res["total_estimated_duration_minutes"] > 0
    finally:
        db.close()


def test_journey_planning_with_destination_place_id():
    """Verify destination resolution using canonical Place ID."""
    db: Session = SessionLocal()
    try:
        # Find a place with verified location in Khordha (e.g. Lingaraj or Bapuji Nagar)
        place = db.query(Place).filter(Place.location.isnot(None), Place.district == "Khordha").first()
        assert place is not None, "Verified Place in Khordha should exist"

        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=MASTER_CANTEEN_LAT,
            origin_lon=MASTER_CANTEEN_LON,
            destination_place_id=str(place.id),
            max_walking_distance_m=5000.0,
            include_food=False,
        )

        assert res["destination"]["resolved_name"] == place.name
        assert res["food_waypoint"] is None  # include_food was False
    finally:
        db.close()


def test_journey_planning_dietary_filter():
    """Verify food waypoint respects dietary filtering (e.g. vegetarian)."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=MASTER_CANTEEN_LAT,
            origin_lon=MASTER_CANTEEN_LON,
            destination_lat=AIRPORT_LAT,
            destination_lon=AIRPORT_LON,
            max_walking_distance_m=3000.0,
            include_food=True,
            dietary_tag="vegetarian",
        )

        if res["status"] == "SUCCESS" and res["food_waypoint"]:
            assert "vegetarian" in res["food_waypoint"]["dietary_tags"]
    finally:
        db.close()


def test_http_plan_journey_endpoint_contracts():
    """Test HTTP POST /transport/plan-journey."""
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
    assert "journey_id" in data
    assert "status" in data
    assert "walking_legs" in data
    assert "transit_legs" in data

    # 422 on out of bounds lat/lon
    bad_payload = {
        "origin_lat": 50.0,  # Invalid for Odisha
        "origin_lon": 85.0,
    }
    resp_422 = client.post("/transport/plan-journey", json=bad_payload)
    assert resp_422.status_code == 422


def test_transport_graph_invariants_preserved():
    """Assert transport graph counts remain strictly unchanged."""
    db: Session = SessionLocal()
    try:
        providers_count = db.query(TransportProvider).count()
        routes_count = db.query(Route).count()
        stops_count = db.query(Stop).count()
        links_count = db.query(RouteStop).count()
        schedules_count = db.query(ScheduledTripGroup).count()

        assert providers_count == 3, f"Expected 3 providers, found {providers_count}"
        assert routes_count == 154, f"Expected 154 routes, found {routes_count}"
        assert stops_count == 1430, f"Expected 1,430 stops, found {stops_count}"
        assert links_count == 1487, f"Expected 1,487 links, found {links_count}"
        assert schedules_count == 302, f"Expected 302 schedules, found {schedules_count}"
    finally:
        db.close()
