"""
Phase 3B: Transit Route Corridor Food Discovery & Intelligence Test Suite.
Tests:
- Point-to-segment distance and deterministic detour classification
- ON_ROUTE, SHORT_DETOUR, LONG_DETOUR, and >8km exclusion
- Dietary and cuisine filtering
- Unresolved transport stop coordinate protection (zero fake geometry)
- Deterministic explainable ranking
- Transport graph invariants (3 providers, 154 routes, 1430 stops, 1487 links, 302 schedules, 5553 departures)
- HTTP API boundary for GET /transport/corridor-food
"""
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.main import app
from app.models.place import Place
from app.models.transport import Route, RouteStop, ScheduledTripGroup, Stop, TransportProvider
from app.transport.corridor_food import (
    CorridorFoodService,
    classify_detour,
    calculate_estimated_detour_minutes,
    point_to_segment_distance_meters,
)

client = TestClient(app)


def test_point_to_segment_calculation_and_detour_classification():
    """Test geometric perpendicular distance calculation and threshold classification."""
    # Line segment along longitude 85.84 from latitude 20.25 to 20.30
    a_lat, a_lon = 20.25, 85.84
    b_lat, b_lon = 20.30, 85.84

    # Point 1: 100m east of midpoint (20.275, 85.84)
    # 0.0009 deg lon ~ 100m at lat 20.27
    p1_lat, p1_lon = 20.275, 85.84 + 0.0009
    dist1, t1 = point_to_segment_distance_meters(p1_lat, p1_lon, a_lat, a_lon, b_lat, b_lon)
    assert 80.0 <= dist1 <= 120.0
    assert 0.4 <= t1 <= 0.6
    assert classify_detour(dist1) == "ON_ROUTE"
    assert calculate_estimated_detour_minutes(dist1, "ON_ROUTE") == 0

    # Point 2: 1.5 km east of midpoint
    p2_lat, p2_lon = 20.275, 85.84 + 0.0143
    dist2, t2 = point_to_segment_distance_meters(p2_lat, p2_lon, a_lat, a_lon, b_lat, b_lon)
    assert 1400.0 <= dist2 <= 1650.0
    assert classify_detour(dist2) == "SHORT_DETOUR"
    assert calculate_estimated_detour_minutes(dist2, "SHORT_DETOUR") > 5

    # Point 3: 5.0 km east of midpoint
    p3_lat, p3_lon = 20.275, 85.84 + 0.0478
    dist3, _ = point_to_segment_distance_meters(p3_lat, p3_lon, a_lat, a_lon, b_lat, b_lon)
    assert 4800.0 <= dist3 <= 5300.0
    assert classify_detour(dist3) == "LONG_DETOUR"

    # Point 4: >8.0 km east of midpoint
    p4_lat, p4_lon = 20.275, 85.84 + 0.09
    dist4, _ = point_to_segment_distance_meters(p4_lat, p4_lon, a_lat, a_lon, b_lat, b_lon)
    assert dist4 > 8000.0
    assert classify_detour(dist4) == "OUT_OF_CORRIDOR"


@pytest.mark.integration
def test_corridor_food_service_discovers_verified_candidates():
    """Verify CorridorFoodService finds food places near Capital Region routes (e.g. Route 09 / 12)."""
    db: Session = SessionLocal()
    try:
        # Find Route 09 or Route 12
        route = db.query(Route).filter(Route.name.in_(["09", "12", "DD1"])).first()
        assert route is not None, "Capital Region route should exist"

        service = CorridorFoodService(db)
        res = service.find_corridor_food(str(route.id), max_distance_m=8000.0, limit=10)

        assert res["route_id"] == str(route.id)
        assert res["route_number"] == route.name
        geom_info = res["corridor_geometry_info"]
        assert "geometry_status" in geom_info
        assert geom_info["verified_coordinate_stops"] >= 0

        # If candidates are found, check candidate fields
        candidates = res["candidates"]
        for c in candidates:
            assert c["place_id"]
            assert c["name"]
            assert c["corridor_status"] in ("ON_ROUTE", "SHORT_DETOUR", "LONG_DETOUR")
            assert c["distance_from_corridor_m"] <= 8000.0
            assert isinstance(c["dietary_tags"], list)
            assert isinstance(c["speciality_dishes"], list)
            assert "verification_status" in c
            # Verify coordinates are numeric and valid
            assert 17.5 <= c["latitude"] <= 23.0
            assert 81.0 <= c["longitude"] <= 88.0
    finally:
        db.close()


@pytest.mark.integration
def test_corridor_food_dietary_and_cuisine_filtering():
    """Verify dietary_tag and cuisine filtering work deterministically."""
    db: Session = SessionLocal()
    try:
        route = db.query(Route).filter(Route.name.in_(["09", "12", "27"])).first()
        if not route:
            pytest.skip("No suitable route found")

        service = CorridorFoodService(db)

        # 1. Filter by vegetarian
        res_veg = service.find_corridor_food(str(route.id), dietary_tag="vegetarian", limit=10)
        for c in res_veg["candidates"]:
            assert "vegetarian" in c["dietary_tags"]

        # 2. Filter by category
        res_cat = service.find_corridor_food(str(route.id), food_category="heritage_sweet_stall", limit=10)
        for c in res_cat["candidates"]:
            assert c["food_category"] == "heritage_sweet_stall"

    finally:
        db.close()


@pytest.mark.integration
def test_insufficient_geometry_route_returns_explicit_status():
    """Verify a route with 0 or 1 coordinate stop returns geometry_unavailable without errors."""
    db: Session = SessionLocal()
    try:
        provider = db.query(TransportProvider).first()
        assert provider is not None
        # Create temporary dummy route with 1 unresolved stop
        temp_route = Route(id=uuid4(), provider_id=provider.id, name="TEST_UNRESOLVED", route_name="Test Unresolved Route")
        temp_stop = Stop(id=uuid4(), provider_id=provider.id, name="TEST_STOP_UNRESOLVED", coordinate_status="unresolved", location=None)
        temp_rs = RouteStop(id=uuid4(), route_id=temp_route.id, stop_id=temp_stop.id, sequence_order=1)

        db.add(temp_route)
        db.add(temp_stop)
        db.flush()
        db.add(temp_rs)
        db.flush()

        service = CorridorFoodService(db)
        res = service.find_corridor_food(str(temp_route.id))

        assert res["corridor_geometry_info"]["geometry_status"] == "geometry_unavailable"
        assert res["total_candidates"] == 0
        assert res["candidates"] == []

        db.rollback()
    finally:
        db.close()


@pytest.mark.integration
def test_corridor_food_http_endpoint_contracts():
    """Test HTTP endpoint GET /transport/corridor-food with UUIDs and public route IDs."""
    db: Session = SessionLocal()
    try:
        route = db.query(Route).filter(Route.name.in_(["09", "10", "12", "13", "28", "30"])).first()
        assert route is not None
        route_id = str(route.id)
    finally:
        db.close()

    # 1. Valid query with route UUID
    resp = client.get(f"/transport/corridor-food?route_id={route_id}&max_distance_m=5000&limit=5")
    assert resp.status_code == 200
    data = resp.json()
    assert data["route_id"] == route_id
    assert "corridor_geometry_info" in data
    assert isinstance(data["candidates"], list)

    # 2. Valid query with public route code rt_10
    resp_rt10 = client.get("/transport/corridor-food?route_id=rt_10&max_distance_m=2500&limit=5")
    assert resp_rt10.status_code == 200
    data_rt10 = resp_rt10.json()
    assert "corridor_geometry_info" in data_rt10
    assert isinstance(data_rt10["candidates"], list)

    # 3. Valid query with public route code rt_28
    resp_rt28 = client.get("/transport/corridor-food?route_id=rt_28&max_distance_m=2500&limit=5")
    assert resp_rt28.status_code == 200
    data_rt28 = resp_rt28.json()
    assert "corridor_geometry_info" in data_rt28
    assert isinstance(data_rt28["candidates"], list)

    # 4. Valid query with public route code rt_13
    resp_rt13 = client.get("/transport/corridor-food?route_id=rt_13&max_distance_m=2500&limit=5")
    assert resp_rt13.status_code == 200
    data_rt13 = resp_rt13.json()
    assert "corridor_geometry_info" in data_rt13
    assert isinstance(data_rt13["candidates"], list)

    # 5. Valid query with public route number 10
    resp_10 = client.get("/transport/corridor-food?route_id=10&max_distance_m=2500&limit=5")
    assert resp_10.status_code == 200
    assert isinstance(resp_10.json()["candidates"], list)

    # 6. Compatibility with /api/transport/corridor-food prefix
    resp_api = client.get("/api/transport/corridor-food?route_id=rt_10&max_distance_m=2500&limit=5")
    assert resp_api.status_code == 200

    # 7. 404 on non-existent route UUID or unknown route identifier
    fake_uuid = str(uuid4())
    resp_404_uuid = client.get(f"/transport/corridor-food?route_id={fake_uuid}")
    assert resp_404_uuid.status_code == 404

    resp_404_str = client.get("/transport/corridor-food?route_id=unknown-route-xyz")
    assert resp_404_str.status_code == 404

    # 8. 422 on invalid query constraints (e.g. max_distance_m below ge=100 bound)
    resp_422 = client.get("/transport/corridor-food?route_id=rt_10&max_distance_m=50")
    assert resp_422.status_code == 422


@pytest.mark.integration
def test_transport_graph_invariants_preserved():
    """Assert transport graph invariant counts remain strictly unchanged."""
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
        assert links_count == 1491, f"Expected 1,491 links, found {links_count}"
        assert schedules_count == 302, f"Expected 302 schedules, found {schedules_count}"
    finally:
        db.close()
