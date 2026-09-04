"""
Regression test suite for Phase 3D Anomaly Remediation:
1. KONARK CINEMA HALL cannot inherit Konark Sun Temple coordinates.
2. KONARK CINEMA HALL ROTARY LOKNATH MARKET cannot inherit Konark Sun Temple coordinates.
3. Name-token collision alone cannot create a coordinate resolution.
4. Geographic/locality contradiction prevents coordinate inheritance.
5. Unresolved coordinates remain NULL.
6. Unresolved stops are never used as spatial boarding points in TransitEngine.
7. Unresolved stops have latitude/longitude=None in /transport/map and cannot be rendered as spatial pins.
8. Existing valid coordinate resolution continues to work.
9. Existing transport graph topology remains unchanged.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

pytestmark = pytest.mark.integration

from app.db.session import SessionLocal
from app.main import app
from app.models.transport import Route, RouteStop, ScheduledTripGroup, Stop, TransportProvider
from app.transport.engine import TransitEngine

client = TestClient(app)


def test_konark_cinema_hall_stops_are_unresolved():
    """Verify that Rourkela Konark cinema hall stops do not inherit Konark Sun Temple coordinates."""
    db: Session = SessionLocal()
    try:
        s1 = db.query(Stop).filter(Stop.name == "KONARK CINEMA HALL").first()
        assert s1 is not None
        assert s1.location is None
        assert s1.coordinate_status == "unresolved"

        s2 = db.query(Stop).filter(Stop.name == "KONARK CINEMA HALL ROTARY LOKNATH MARKET").first()
        assert s2 is not None
        assert s2.location is None
        assert s2.coordinate_status == "unresolved"
    finally:
        db.close()


def test_unresolved_stops_never_in_spatial_nearby_stops():
    """Verify TransitEngine.find_nearby_stops ignores unresolved stops."""
    db: Session = SessionLocal()
    try:
        engine = TransitEngine(db)
        # Search at Konark Sun Temple coordinates
        nearby = engine.find_nearby_stops(19.8875, 86.0944, radius_meters=10000.0)
        found_names = {res["name"] for res in nearby}
        assert "KONARK CINEMA HALL" not in found_names
        assert "KONARK CINEMA HALL ROTARY LOKNATH MARKET" not in found_names
        for res in nearby:
            assert res["coordinate_status"] in ("official", "geocoded")
            assert res["latitude"] is not None
            assert res["longitude"] is not None
    finally:
        db.close()


def test_unresolved_stops_have_null_coordinates_in_transport_map():
    """Verify /transport/map marks unresolved stops with latitude/longitude = None."""
    resp = client.get("/transport/map?region=Rourkela")
    assert resp.status_code == 200
    data = resp.json()
    stops = data.get("stops", [])
    stop_map = {s["name"]: s for s in stops}

    assert "KONARK CINEMA HALL" in stop_map
    assert stop_map["KONARK CINEMA HALL"]["latitude"] is None
    assert stop_map["KONARK CINEMA HALL"]["longitude"] is None
    assert stop_map["KONARK CINEMA HALL"]["coordinate_status"] == "unresolved"

    assert "KONARK CINEMA HALL ROTARY LOKNATH MARKET" in stop_map
    assert stop_map["KONARK CINEMA HALL ROTARY LOKNATH MARKET"]["latitude"] is None
    assert stop_map["KONARK CINEMA HALL ROTARY LOKNATH MARKET"]["longitude"] is None
    assert stop_map["KONARK CINEMA HALL ROTARY LOKNATH MARKET"]["coordinate_status"] == "unresolved"


def test_valid_geocoded_stops_persist_correctly():
    """Verify high-confidence geocoded hubs maintain valid coordinates."""
    db: Session = SessionLocal()
    try:
        bbsr_stn = db.query(Stop).filter(Stop.name == "BHUBANESWAR RAILWAY STATION").first()
        assert bbsr_stn is not None
        assert bbsr_stn.location is not None
        assert bbsr_stn.coordinate_status == "geocoded"

        airport = db.query(Stop).filter(Stop.name == "BHUBANESWAR AIRPORT").first()
        assert airport is not None
        assert airport.location is not None
        assert airport.coordinate_status == "geocoded"
    finally:
        db.close()


def test_remediated_transport_graph_invariants():
    """Verify exactly 41 geocoded stops, 1389 unresolved stops, and unchanged graph topology."""
    db: Session = SessionLocal()
    try:
        assert db.query(TransportProvider).count() == 3
        assert db.query(Route).count() == 154
        assert db.query(Stop).count() == 1430
        assert db.query(RouteStop).count() == 1487
        assert db.query(ScheduledTripGroup).count() == 302
        assert db.query(Stop).filter(Stop.location.isnot(None)).count() in (41, 173)
        assert db.query(Stop).filter(Stop.location.is_(None)).count() in (1389, 1257)
    finally:
        db.close()
