"""
Tests for Official Transit Importer, Geospatial Engine, Graph Integrity, and API Endpoints.
Phase 2.5 validation suite.
"""
from __future__ import annotations

import json
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

pytestmark = pytest.mark.integration

from app.db.session import SessionLocal
from app.main import app
from app.models.transport import (
    DataTier,
    Route,
    RouteStop,
    ScheduledTripGroup,
    Stop,
    TransportProvider,
)
from app.transport.engine import TransitEngine, haversine_distance_meters, walking_time_minutes
from app.transport.geocoding import (
    build_geocoding_query,
    evaluate_geocoding_confidence,
    is_generic_stop_name,
)
from app.transport.importer import OfficialTransitImporter


@pytest.fixture(scope="module")
def db_session():
    session = SessionLocal()
    try:
        importer = OfficialTransitImporter(session)
        importer.run_import()
        yield session
    finally:
        session.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


# ─── 1. Importer Idempotency & Row Counts ───────────────────────────

def test_importer_idempotency(db_session: Session):
    """Running import twice must not create duplicates."""
    importer = OfficialTransitImporter(db_session)
    summary1 = importer.run_import()
    summary2 = importer.run_import()

    assert summary1.routes_upserted == summary2.routes_upserted
    assert summary1.stops_upserted == summary2.stops_upserted
    assert summary1.route_stops_upserted == summary2.route_stops_upserted
    assert summary1.schedules_upserted == summary2.schedules_upserted

    provider_count = db_session.query(TransportProvider).count()
    route_count = db_session.query(Route).count()
    stop_count = db_session.query(Stop).count()
    route_stop_count = db_session.query(RouteStop).count()
    schedule_count = db_session.query(ScheduledTripGroup).count()

    assert provider_count == 3
    assert route_count == 154
    assert stop_count == 1430
    assert route_stop_count == 1487
    assert schedule_count == 302


def test_transport_providers_seeded(db_session: Session):
    """Transport providers must match official CRUT and regional entities."""
    providers = db_session.query(TransportProvider).all()
    names = {p.name for p in providers}
    assert "CRUT / Mo Bus" in names
    assert "AMA Bus" in names
    assert "Mo E-Ride" in names

    for p in providers:
        assert p.data_tier == DataTier.SCHEDULED
        assert p.notes_on_verification is not None


# ─── 2. Route & Stop Provenance ─────────────────────────────────────

def test_routes_provenance(db_session: Session):
    """All 154 routes must retain source document and provenance notes."""
    routes = db_session.query(Route).all()
    assert len(routes) == 154

    for r in routes:
        assert r.source is not None
        assert len(r.source) > 0
        assert r.notes is not None
        notes = json.loads(r.notes)
        assert "service_area" in notes
        assert "confidence" in notes
        assert notes["confidence"] == "high"


def test_stops_provenance_and_coordinates(db_session: Session):
    """All stops must retain source provenance and valid coordinate status."""
    stops = db_session.query(Stop).all()
    assert len(stops) == 1430

    valid_statuses = {"official", "geocoded", "ambiguous", "unresolved"}
    geocoded_count = 0
    unresolved_count = 0

    for s in stops:
        assert s.source is not None
        assert s.coordinate_status in valid_statuses
        assert s.canonical_stop_id is not None
        assert s.research_id is not None

        if s.coordinate_status in ("official", "geocoded"):
            assert s.location is not None
            geocoded_count += 1
        else:
            assert s.location is None
            unresolved_count += 1

    assert geocoded_count in (41, 173)
    assert unresolved_count in (1389, 1257)
    assert geocoded_count + unresolved_count == 1430


# ─── 3. Graph Integrity & Traversal ─────────────────────────────────

def test_graph_route_to_stops(db_session: Session):
    """A. Given a route_id: route -> RouteStop -> Stop works for all routes."""
    routes = db_session.query(Route).all()
    assert len(routes) == 154

    for r in routes:
        stops = (
            db_session.query(Stop)
            .join(RouteStop, RouteStop.stop_id == Stop.id)
            .filter(RouteStop.route_id == r.id)
            .order_by(RouteStop.sequence_order)
            .all()
        )
        assert len(stops) > 0, f"Route {r.name} has no connected stops"


def test_graph_stop_to_routes(db_session: Session):
    """B. Given a stop_id: stop -> RouteStop -> Route works."""
    bbsr_stn = db_session.query(Stop).filter(Stop.name == "BHUBANESWAR RAILWAY STATION").first()
    assert bbsr_stn is not None

    serving_routes = (
        db_session.query(Route)
        .join(RouteStop, RouteStop.route_id == Route.id)
        .filter(RouteStop.stop_id == bbsr_stn.id)
        .all()
    )
    assert len(serving_routes) == 30
    route_nums = {r.name for r in serving_routes}
    assert "09" in route_nums
    assert "11" in route_nums
    assert "12" in route_nums
    assert "DD1" in route_nums


def test_graph_coordinates_to_nearest_serving_routes(db_session: Session):
    """C. Given coordinates: coordinates -> nearest Stop -> RouteStop -> Route works."""
    engine = TransitEngine(db_session)
    # Master Canteen / BBSR Railway Station coords
    nearby = engine.find_nearby_stops(latitude=20.2667, longitude=85.8436, radius_meters=1000.0, limit=5)
    assert len(nearby) > 0
    first = nearby[0]
    assert first["name"] == "BHUBANESWAR RAILWAY STATION"
    assert len(first["routes_serving_stop"]) == 30
    first_serving = first["routes_serving_stop"][0]
    assert "route_id" in first_serving
    assert "route_number" in first_serving
    assert "route_name" in first_serving


def test_graph_region_to_routes_to_stops(db_session: Session):
    """D. Map: region -> routes -> route stops works."""
    engine = TransitEngine(db_session)
    map_data = engine.get_transport_map_data(region="Capital Region")
    assert map_data["total_routes"] == 96
    assert map_data["total_stops"] > 0

    for r in map_data["routes"]:
        assert r["stops_count"] > 0
        assert len(r["stops"]) == r["stops_count"]
        # Stops must be sorted by sequence_order
        seqs = [s["sequence_order"] for s in r["stops"]]
        assert seqs == sorted(seqs)


def test_route_stop_foreign_key_integrity(db_session: Session):
    """Every RouteStop references an existing Route and Stop."""
    links = db_session.query(RouteStop).all()
    assert len(links) == 1487

    route_ids = {r.id for r in db_session.query(Route.id).all()}
    stop_ids = {s.id for s in db_session.query(Stop.id).all()}

    for link in links:
        assert link.route_id in route_ids
        assert link.stop_id in stop_ids
        assert link.sequence_order >= 1


# ─── 4. Schedule Integrity ──────────────────────────────────────────

def test_schedules_integrity(db_session: Session):
    """Schedules must have valid departure times array and provenance."""
    schedules = db_session.query(ScheduledTripGroup).all()
    assert len(schedules) == 302

    total_departures = 0
    for sc in schedules:
        assert sc.source is not None
        assert sc.departure_times_source_order is not None
        assert isinstance(sc.departure_times_source_order, list)
        assert len(sc.departure_times_source_order) > 0
        total_departures += len(sc.departure_times_source_order)

    assert total_departures == 5553


# ─── 5. Geospatial & Nearest Stop Engine ────────────────────────────

def test_haversine_and_walking_time():
    """Distance calculation and walking pace estimation."""
    dist = haversine_distance_meters(20.2667, 85.8436, 20.3000, 85.8250)
    assert 3500 <= dist <= 5500
    walk_mins = walking_time_minutes(dist)
    assert 40 <= walk_mins <= 70


def test_nearby_stops_query_sorting(db_session: Session):
    """Stops must be sorted by distance ascending."""
    engine = TransitEngine(db_session)
    nearby = engine.find_nearby_stops(latitude=20.2667, longitude=85.8436, radius_meters=10000.0, limit=10)
    assert len(nearby) > 0
    for i in range(len(nearby) - 1):
        assert nearby[i]["distance_m"] <= nearby[i + 1]["distance_m"]


# ─── 6. Geocoding Safety & Confidence ───────────────────────────────

def test_geocoding_safety_generic_names():
    """Generic names must be flagged and queries must include context."""
    assert is_generic_stop_name("SQUARE") is True
    assert is_generic_stop_name("BUS STAND") is True
    assert is_generic_stop_name("MASTER CANTEEN") is False
    assert is_generic_stop_name("ACHARYA VIHAR SQUARE") is False

    query = build_geocoding_query("Jaydev Vihar", None, "Bhubaneswar", "Khordha")
    assert "Jaydev Vihar" in query
    assert "Bhubaneswar" in query
    assert "Odisha" in query
    assert "India" in query


def test_evaluate_geocoding_confidence():
    """Points inside city bounds are validated; outside are flagged."""
    status, conf = evaluate_geocoding_confidence(20.27, 85.84, "Bhubaneswar", "Master Canteen")
    assert status == "geocoded"
    assert conf == "high"

    status, conf = evaluate_geocoding_confidence(12.97, 77.59, "Bhubaneswar", "Bangalore Point")
    assert status == "unresolved"
    assert conf == "none"


# ─── 7. API Endpoints Contract ──────────────────────────────────────

def test_api_providers_endpoint(client: TestClient):
    """GET /transport/providers returns all providers."""
    res = client.get("/transport/providers")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3
    assert any(p["name"] == "CRUT / Mo Bus" for p in data)


def test_api_nearby_stops_endpoint(client: TestClient):
    """GET /transport/stops/nearby returns distance-sorted stops with serving routes."""
    res = client.get("/transport/stops/nearby?lat=20.2667&lon=85.8436&radius_m=3000&limit=5")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first = data[0]
    assert first["name"] == "BHUBANESWAR RAILWAY STATION"
    assert "distance_m" in first
    assert "walking_estimate_mins" in first
    assert len(first["routes_serving_stop"]) == 30


def test_api_map_endpoint(client: TestClient):
    """GET /transport/map returns map contract with routes and stops."""
    res = client.get("/transport/map?region=Capital Region")
    assert res.status_code == 200
    data = res.json()
    assert data["total_routes"] == 96
    assert data["total_stops"] > 0
    for r in data["routes"]:
        assert r["stops_count"] > 0
        assert len(r["stops"]) == r["stops_count"]


def test_api_routes_and_detail_endpoint(client: TestClient):
    """GET /transport/routes and GET /transport/routes/{route_id}."""
    res = client.get("/transport/routes?limit=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 154
    assert len(data["routes"]) == 10

    first_route_id = data["routes"][0]["route_id"]
    detail_res = client.get(f"/transport/routes/{first_route_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["route_id"] == first_route_id
    assert "stops" in detail
    assert len(detail["stops"]) > 0
    assert "schedules" in detail
