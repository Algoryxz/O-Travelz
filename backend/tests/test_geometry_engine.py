"""
Tests for Phase 6A Deterministic Snap-to-Road Geometry Engine and API.

Verifies:
- Geometry classification: EXACT, CORRIDOR, PARTIAL, NONE.
- PROHIBITION: Straight-line interpolation across unverified stops is NEVER generated.
- API endpoints expose geometry_status, confidence, corridors, and verified coordinates.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.main import app
from app.models.transport import Route
from app.transport.geometry_engine import DeterministicGeometryEngine


@pytest.fixture(scope="module")
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def test_geometry_engine_route_evaluation(db_session: Session):
    """Test evaluating deterministic geometry for all routes."""
    engine = DeterministicGeometryEngine(db_session)
    routes = db_session.query(Route).all()
    assert len(routes) == 154

    status_counts = {"EXACT": 0, "CORRIDOR": 0, "PARTIAL": 0, "NONE": 0}
    for r in routes:
        payload = engine.get_route_geometry(r.id)
        assert payload is not None
        assert payload.geometry_status in ("EXACT", "CORRIDOR", "PARTIAL", "NONE")
        assert payload.confidence in ("CONFIRMED", "SUPPORTED", "INFERRED", "UNKNOWN")
        status_counts[payload.geometry_status] += 1

        # PROHIBITION ASSERTION: CORRIDOR and NONE routes must never emit fake polyline coordinates
        if payload.geometry_status in ("CORRIDOR", "NONE"):
            assert len(payload.coordinates) == 0, f"Route {r.name} has {payload.geometry_status} but emitted {len(payload.coordinates)} coordinates"
            assert payload.is_geometry_available is False

    assert status_counts["EXACT"] >= 1
    assert status_counts["CORRIDOR"] >= 10
    assert status_counts["NONE"] >= 50


def test_api_transport_map_enriches_geometry_status(client: TestClient):
    """Test that /api/transport/map exposes geometry_status, confidence, and corridors."""
    response = client.get("/api/transport/map")
    assert response.status_code == 200
    data = response.json()

    assert "routes" in data
    assert "stops" in data
    assert data["total_routes"] == 154

    sample_route = data["routes"][0]
    assert "geometry_status" in sample_route
    assert "overall_confidence" in sample_route
    assert "corridors" in sample_route
    assert sample_route["geometry_status"] in ("EXACT", "CORRIDOR", "PARTIAL", "NONE")


def test_api_route_geometry_endpoint(client: TestClient, db_session: Session):
    """Test /api/transport/routes/{route_id}/geometry endpoint."""
    route = db_session.query(Route).first()
    assert route is not None

    response = client.get(f"/api/transport/routes/{route.id}/geometry")
    assert response.status_code == 200
    payload = response.json()

    assert payload["route_id"] == str(route.id)
    assert payload["route_number"] == route.name
    assert "geometry_status" in payload
    assert "confidence" in payload
    assert "is_geometry_available" in payload
    assert "corridors" in payload
    assert "anchor_stops" in payload
