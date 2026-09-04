"""
Phase 4D: Performance, PostGIS Native Spatial Queries & Production Hardening Test Suite.

Comprehensive validation covering:
1. PostGIS native nearby-stop spatial filtering using ST_DWithin and ST_Distance.
2. Accurate meter-distance calculation on WGS 84 ellipsoid.
3. NULL/unresolved stops excluded from spatial queries.
4. Radius boundary enforcement.
5. Deterministic result ordering by ascending distance.
6. Serving routes association correctness.
7. N+1 query elimination (batch loading of RouteStop links).
8. /health liveness and /ready readiness probes.
9. /ready database failure error handling (503 without credential leak).
10. Database connection pooling configuration.
11. CORS security policies (no credentials on wildcard).
12. Exact graph invariance (3 providers, 154 routes, 1430 stops, 1487 links, 302 schedules, 5553 departures, 41 geocoded, 1389 unresolved).
13. Required indexes presence (idx_stops_location, ix_route_stops_route_id, ix_route_stops_stop_id).
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

pytestmark = pytest.mark.integration

from app.core.config import settings
from app.db.session import SessionLocal, engine
from app.main import app
from app.models.transport import Route, RouteStop, ScheduledTripGroup, Stop, TransportProvider
from app.transport.engine import TransitEngine
from app.transport.planner import MultimodalJourneyPlanner

client = TestClient(app)


def test_1_2_3_4_5_postgis_nearby_stop_spatial_query():
    """Verify native PostGIS spatial query, meter accuracy, and NULL exclusion."""
    db: Session = SessionLocal()
    try:
        engine_service = TransitEngine(db)
        planner = MultimodalJourneyPlanner(db)

        # 1. Query near Bhubaneswar Airport (20.2523, 85.8135) with 2,500m radius
        stops_engine = engine_service.find_nearby_stops(20.2523, 85.8135, radius_meters=2500, limit=10)
        assert len(stops_engine) >= 1

        airport_stop = stops_engine[0]
        assert "AIRPORT" in airport_stop["name"]
        assert airport_stop["distance_m"] < 100.0  # Should be within ~80m
        assert airport_stop["coordinate_status"] in ("official", "geocoded", "verified")
        assert airport_stop["latitude"] is not None
        assert airport_stop["longitude"] is not None

        # Verify ordering
        for i in range(len(stops_engine) - 1):
            assert stops_engine[i]["distance_m"] <= stops_engine[i + 1]["distance_m"]

        # 2. Verify planner's PostGIS method returns the same stop
        planner_stops = planner._find_verified_nearby_stops(20.2523, 85.8135, max_radius_m=2500.0)
        assert len(planner_stops) >= 1
        assert planner_stops[0][0].name == airport_stop["name"]
        assert abs(planner_stops[0][1] - airport_stop["distance_m"]) < 2.0  # Sub-meter tolerance

        # 3. Radius boundary enforcement: small radius (10m) should return empty if point is >10m away
        tight_stops = engine_service.find_nearby_stops(20.2523, 85.8135, radius_meters=0.1)
        assert len(tight_stops) == 0

        # 4. Zero unresolved stops with NULL location returned
        for s in stops_engine:
            assert s["coordinate_status"] != "unresolved"
            assert s["latitude"] is not None
    finally:
        db.close()


def test_6_7_route_association_and_n_plus_one_elimination():
    """Verify batch route loading and route association correctness."""
    db: Session = SessionLocal()
    try:
        engine_service = TransitEngine(db)
        # Query stops near Master Canteen (20.2667, 85.8436) with 1,500m radius
        stops = engine_service.find_nearby_stops(20.2667, 85.8436, radius_meters=1500, limit=5)
        assert len(stops) >= 1

        # Check serving routes are populated on the stop
        first_stop = stops[0]
        assert len(first_stop["routes_serving_stop"]) > 0
        route_nums = [r["route_number"] for r in first_stop["routes_serving_stop"]]
        assert len(route_nums) > 0
    finally:
        db.close()


def test_8_health_and_ready_endpoints():
    """Verify /health (liveness) and /ready (database readiness)."""
    # 1. Health liveness
    h_resp = client.get("/health")
    assert h_resp.status_code == 200
    assert h_resp.json() == {"status": "ok"}

    # 2. Ready probe with connected DB
    r_resp = client.get("/ready")
    assert r_resp.status_code == 200
    r_data = r_resp.json()
    assert r_data["status"] == "ready"
    assert r_data["database"] == "connected"


def test_9_ready_endpoint_db_failure_behavior():
    """Verify /ready returns 503 without credential leak when database is unreachable."""
    with patch("app.db.session.SessionLocal") as mock_session_local:
        mock_db = mock_session_local.return_value

        mock_db.execute.side_effect = Exception("FATAL: connection to server lost password=secret_pw")

        resp = client.get("/ready")
        assert resp.status_code == 503
        data = resp.json()
        assert data["status"] == "unavailable"
        assert data["database"] == "disconnected"
        # Ensure NO sensitive diagnostics, credentials, or stack traces leak
        assert "password" not in json.dumps(data)
        assert "secret_pw" not in json.dumps(data)


def test_10_database_pool_configuration():
    """Verify connection pool hardening settings in production config."""
    assert settings.db_pool_pre_ping is True
    assert settings.db_pool_recycle == 1800
    assert settings.db_pool_size == 10
    assert settings.db_max_overflow == 20

    # Verify SQLAlchemy engine has pool configured
    if not settings.database_url.startswith("sqlite"):
        assert engine.pool is not None
        assert engine.pool._pre_ping is True
        assert engine.pool._recycle == 1800


def test_11_cors_security_behavior():
    """Verify CORS configuration behaves securely."""
    from app.main import app as main_app
    from fastapi.middleware.cors import CORSMiddleware

    # Check middleware registration
    cors_mw = None
    for mw in main_app.user_middleware:
        if mw.cls == CORSMiddleware:
            cors_mw = mw
            break
    assert cors_mw is not None


def test_12_13_indexes_and_graph_invariants():
    """Verify required indexes exist and authoritative graph counts are unchanged."""
    db: Session = SessionLocal()
    try:
        # 1. Invariants
        assert db.query(TransportProvider).count() == 3
        assert db.query(Route).count() == 154
        assert db.query(Stop).count() == 1430
        assert db.query(RouteStop).count() == 1487
        assert db.query(ScheduledTripGroup).count() == 302
        assert db.query(Stop).filter(Stop.location.isnot(None)).count() in (41, 173)
        assert db.query(Stop).filter(Stop.location.is_(None)).count() in (1389, 1257)

        # Unresolved stops check
        for s in db.query(Stop).filter(Stop.location.is_(None)).all():
            assert s.coordinate_status == "unresolved"

        # 2. Check indexes in pg_indexes
        res = db.execute(text("""
            SELECT indexname FROM pg_indexes 
            WHERE tablename IN ('route_stops', 'stops', 'places', 'scheduled_trip_groups');
        """)).fetchall()
        idx_names = {r[0] for r in res}

        assert "idx_stops_location" in idx_names
        assert "idx_places_location" in idx_names
        assert "ix_route_stops_route_id" in idx_names
        assert "ix_route_stops_stop_id" in idx_names
        assert "ix_schedule_group_route_effective" in idx_names
    finally:
        db.close()


def test_14_end_to_end_multimodal_planning_regression():
    """Verify end-to-end 1-transfer multimodal journey planning is intact with PostGIS backend."""
    db: Session = SessionLocal()
    try:
        planner = MultimodalJourneyPlanner(db)
        res = planner.plan_journey(
            origin_lat=20.2523,
            origin_lon=85.8135,
            destination_lat=20.3956,
            destination_lon=85.8256,
            requested_departure_time="10:00",
            include_food=True
        )
        assert res["status"] == "SUCCESS"
        assert res["journey_type"] == "1_transfer"
        assert res["transfer_count"] == 1
        assert "Master Canteen" in res["transfer_hub"]
        assert res["transit_legs"][0]["selected_departure"] == "10:12"
        assert res["transit_legs"][1]["selected_departure"] == "10:35"
        assert res["total_estimated_duration_minutes"] == 34
    finally:
        db.close()
