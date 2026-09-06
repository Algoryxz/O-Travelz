"""
Wave C5.2: Product Route Rendering and Visual Truth Validation Test Suite.
"""
import hashlib
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

pytestmark = pytest.mark.integration

from app.db.session import SessionLocal
from app.main import app
from app.models.transport import Route
from app.transport.geometry_engine import (
    DeterministicGeometryEngine,
    REGION_BOUNDS,
    is_coordinate_in_region,
)

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
CANONICAL_DIR = REPO_ROOT / "data" / "transport" / "canonical"


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


def test_c5_2_canonical_transit_hashes_unchanged():
    before_report_path = REPO_ROOT / "reports" / "transit_c5_2_before.json"
    assert before_report_path.exists(), "transit_c5_2_before.json must exist"
    with open(before_report_path, "r", encoding="utf-8") as f:
        before = json.load(f)

    for fname, expected_hash in before["canonical_file_hashes"].items():
        p = CANONICAL_DIR / fname
        assert p.exists()
        with open(p, "rb") as fp:
            current_hash = hashlib.sha256(fp.read()).hexdigest()
        assert current_hash == expected_hash, f"Hash mismatch for canonical file {fname}"


def test_c5_2_invariants_preserved(db_session: Session):
    routes = db_session.query(Route).all()
    assert len(routes) == 154

    with open(CANONICAL_DIR / "stops.json", "r", encoding="utf-8") as f:
        stops = json.load(f)
    assert len(stops) == 1430

    with open(CANONICAL_DIR / "route_stops.json", "r", encoding="utf-8") as f:
        route_stops = json.load(f)
    assert len(route_stops) == 164
    total_links = sum(len(rs.get("stops", [])) for rs in route_stops)
    assert total_links == 1491


def test_c5_2_engine_loads_staging_deterministically(db_session: Session):
    engine = DeterministicGeometryEngine(db_session)
    payload_09 = engine.get_route_geometry("09")
    assert payload_09 is not None
    assert payload_09.route_number == "09"
    assert payload_09.route_geometry_confidence in ("VERIFIED_ROUTE_GEOMETRY", "HIGH_CONFIDENCE_ROUTE_GEOMETRY")
    assert len(payload_09.segments) >= 1
    assert 16340500 in payload_09.osm_relations_matched


def test_c5_2_decoupled_epistemic_truth(db_session: Session):
    engine = DeterministicGeometryEngine(db_session)
    payload_09 = engine.get_route_geometry("09")
    assert payload_09 is not None

    for anchor in payload_09.anchor_stops:
        if anchor["stop_resolution_status"] not in ("VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL"):
            assert anchor["render_exact_marker"] is False
            assert anchor["participates_in_first_mile"] is False


def test_c5_2_first_mile_gated_strictly_on_verified_stops(db_session: Session):
    engine = DeterministicGeometryEngine(db_session)
    # Test representative routes across all regions
    sample_route_nums = ["08", "09", "10", "11", "70", "94", "100", "101", "102", "200", "201", "202", "300", "301", "302", "400", "401"]
    routes = db_session.query(Route).filter(Route.name.in_(sample_route_nums)).all()

    for r in routes:
        payload = engine.get_route_geometry(r.id)
        if not payload:
            continue
        for a in payload.anchor_stops:
            if a["participates_in_first_mile"]:
                assert a["stop_resolution_status"] in ("VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL")
                assert a["latitude"] is not None
                assert a["longitude"] is not None
            else:
                if a["stop_resolution_status"] in ("CANDIDATE_HIGH", "CANDIDATE_MEDIUM", "CANDIDATE_LOW", "LOCALITY_ONLY", "UNRESOLVED"):
                    assert a["participates_in_first_mile"] is False


def test_c5_2_candidate_high_visual_differentiation(db_session: Session):
    engine = DeterministicGeometryEngine(db_session)
    payload_300 = engine.get_route_geometry("300")
    assert payload_300 is not None

    cand_high = [a for a in payload_300.anchor_stops if a["stop_resolution_status"] == "CANDIDATE_HIGH"]
    assert len(cand_high) > 0, "Expected CANDIDATE_HIGH stops on route 300"
    for c in cand_high:
        assert c["render_exact_marker"] is False
        assert c["render_candidate_marker"] is True
        assert c["participates_in_first_mile"] is False
        assert c["latitude"] is not None
        assert c["longitude"] is not None


def test_c5_2_regional_outlier_suppression_rourkela_101(db_session: Session):
    engine = DeterministicGeometryEngine(db_session)
    payload_101 = engine.get_route_geometry("101")
    assert payload_101 is not None

    assert len(payload_101.suppressed_outliers) == 1
    outlier = payload_101.suppressed_outliers[0]
    assert outlier["name"] == "AIRPORT"
    assert outlier["sequence_order"] == 5
    assert "outside Rourkela bounds" in outlier["suppression_reason"]

    stop5 = next(a for a in payload_101.anchor_stops if a["sequence_order"] == 5)
    assert stop5["latitude"] is None
    assert stop5["longitude"] is None
    assert stop5["render_exact_marker"] is False
    assert stop5["render_candidate_marker"] is False
    assert stop5["participates_in_first_mile"] is False
    assert stop5["coordinate_source"] == "suppressed_outlier"


def test_c5_2_fail_closed_no_straight_lines_across_gaps(db_session: Session):
    engine = DeterministicGeometryEngine(db_session)
    # Routes with unresolved gaps must emit empty coordinates
    for rnum in ["101", "300", "400"]:
        payload = engine.get_route_geometry(rnum)
        assert payload is not None
        assert payload.geometry_render_status in ("ANCHOR_ONLY", "CORRIDOR_ONLY")
        assert len(payload.coordinates) == 0, f"Route {rnum} emitted coordinates despite render_status {payload.geometry_render_status}"
        assert payload.is_geometry_available is False


def test_c5_2_api_route_geometry_endpoint(client: TestClient):
    resp = client.get("/api/transport/routes/09/geometry")
    assert resp.status_code == 200
    data = resp.json()
    assert "route_geometry_confidence" in data
    assert "geometry_render_status" in data
    assert "segments" in data
    assert "osm_relations_matched" in data
    assert "suppressed_outliers" in data
    assert data["route_geometry_confidence"] in ("VERIFIED_ROUTE_GEOMETRY", "HIGH_CONFIDENCE_ROUTE_GEOMETRY")
    assert len(data["anchor_stops"]) >= 2
    assert "participates_in_first_mile" in data["anchor_stops"][0]


def test_c5_2_api_transport_map_endpoint(client: TestClient):
    resp = client.get("/api/transport/map?region=Rourkela")
    assert resp.status_code == 200
    data = resp.json()
    assert "routes" in data
    assert "stops" in data
    assert len(data["routes"]) > 0

    route101 = next(r for r in data["routes"] if r["route_number"] == "101")
    assert route101["route_geometry_confidence"] in ("VERIFIED_ROUTE_GEOMETRY", "HIGH_CONFIDENCE_ROUTE_GEOMETRY")
    assert len(route101["suppressed_outliers"]) == 1
    assert len(route101["segments"]) >= 1


def test_c5_2_safe_product_polyline_coverage_derived():
    audit_p = REPO_ROOT / "reports" / "transit_c5_2_segment_renderability.json"
    assert audit_p.exists()
    with open(audit_p, "r", encoding="utf-8") as f:
        rep = json.load(f)

    b = rep["classification_breakdown"]
    total = rep["total_segments"]
    renderable = b["RENDERABLE_EXACT"] + b["RENDERABLE_ROAD_FOLLOWING"]
    calc_cov = round(renderable / total * 100, 2)
    assert rep["safe_product_polyline_coverage_pct"] == calc_cov
    assert calc_cov < 10.0
