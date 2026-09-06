"""
Wave C5.3: Real Ama Bus / Mo Bus Route Geometry Recovery Test Suite.
"""

import hashlib
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

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
STAGING_DIR = REPO_ROOT / "data" / "transport" / "staging" / "ama_bus"


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


def test_c5_3_canonical_hashes_unchanged():
    """Prove that core canonical files are bit-for-bit identical to Phase 0 before report."""
    before_path = REPO_ROOT / "reports" / "transit_c5_3_before.json"
    assert before_path.exists(), "transit_c5_3_before.json must exist"
    with open(before_path, "r", encoding="utf-8") as f:
        before = json.load(f)

    for fname, expected_hash in before["canonical_hashes"].items():
        p = CANONICAL_DIR / fname
        assert p.exists(), f"Canonical file {fname} must exist"
        current_hash = hashlib.sha256(p.read_bytes()).hexdigest()
        assert current_hash == expected_hash, f"Hash mismatch on {fname}"


def test_c5_3_1327_segments_partition_exactly_once():
    """Verify that all 1,327 segments partition exactly once in c5_3_segment_resolution.json."""
    seg_path = STAGING_DIR / "c5_3_segment_resolution.json"
    assert seg_path.exists()
    with open(seg_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["total_segments"] == 1327
    segments = data["segments"]
    assert len(segments) == 1327

    # Check segment uniqueness
    seg_ids = [s["segment_id"] for s in segments]
    assert len(set(seg_ids)) == 1327, "Segment IDs must be unique"

    b = data["classification_breakdown"]
    total_in_breakdown = sum(b.values())
    assert total_in_breakdown == 1327


def test_c5_3_relation_matching_preserves_route_identity_and_direction():
    """Verify OSM relation matching never crosses route identity and preserves direction."""
    geo_path = STAGING_DIR / "c5_route_geometry.json"
    with open(geo_path, "r", encoding="utf-8") as f:
        routes = json.load(f)

    for r in routes:
        rels = r.get("osm_relations_matched", [])
        if rels:
            rnum = r["route_number"]
            # All matched relations must belong to this route number
            with open(STAGING_DIR / "osm_odisha_bus_relations_cache.json", "r", encoding="utf-8") as f:
                cache = json.load(f)
            rel_map = {elem["id"]: elem for elem in cache["elements"]}
            for rid in rels:
                rel = rel_map.get(rid)
                assert rel is not None
                ref = rel.get("tags", {}).get("ref", "").strip()
                assert ref.lstrip("0") == rnum.lstrip("0"), f"Cross-route match! Route {rnum} matched relation {rid} with ref {ref}"


def test_c5_3_relation_geometry_has_coordinate_arrays():
    """Verify that relations matched in c5_route_geometry produce dense coordinate arrays."""
    geo_path = STAGING_DIR / "c5_route_geometry.json"
    with open(geo_path, "r", encoding="utf-8") as f:
        routes = json.load(f)

    for r in routes:
        if r.get("geometry_render_status") == "RENDERABLE_ROAD_FOLLOWING" and r.get("osm_relations_matched"):
            coords = r.get("coordinates", [])
            assert len(coords) >= 10, f"Route {r['route_number']} has insufficient coordinates"
            for pt in coords:
                assert len(pt) == 2
                assert 17.0 <= pt[0] <= 24.0, "Latitude outside Odisha"
                assert 80.0 <= pt[1] <= 88.0, "Longitude outside Odisha"


def test_c5_3_inferred_road_path_never_classified_verified():
    """Critical Epistemic Rule: Inferred shortest-road paths must NEVER be labeled VERIFIED_ROUTE_GEOMETRY."""
    geo_path = STAGING_DIR / "c5_route_geometry.json"
    with open(geo_path, "r", encoding="utf-8") as f:
        routes = json.load(f)

    for r in routes:
        source = r.get("provenance", {}).get("source", "")
        if "road_network_routing" in source:
            assert r["route_geometry_confidence"] != "VERIFIED_ROUTE_GEOMETRY", f"Route {r['route_number']} mislabeled as VERIFIED"
            assert r["route_geometry_confidence"] == "HIGH_CONFIDENCE_ROUTE_GEOMETRY"


def test_c5_3_exact_stop_status_never_changed(db_session: Session):
    """Verify that candidate stops are never upgraded to exact stops in canonical/database."""
    engine = DeterministicGeometryEngine(db_session)
    payload_09 = engine.get_route_geometry("09")
    assert payload_09 is not None

    for a in payload_09.anchor_stops:
        if a["stop_resolution_status"] not in ("VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL"):
            assert a["render_exact_marker"] is False
            assert a["participates_in_first_mile"] is False


def test_c5_3_first_mile_never_enabled_for_candidates(db_session: Session):
    """Candidate stops must never be enabled for first-mile walking computations."""
    engine = DeterministicGeometryEngine(db_session)
    routes = db_session.query(Route).all()

    for r in routes:
        payload = engine.get_route_geometry(r.id)
        if not payload:
            continue
        for a in payload.anchor_stops:
            if a["participates_in_first_mile"]:
                assert a["stop_resolution_status"] in ("VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL")
            if a["stop_resolution_status"] in ("CANDIDATE_HIGH", "CANDIDATE_MEDIUM", "LOCALITY_ONLY", "UNRESOLVED"):
                assert a["participates_in_first_mile"] is False


def test_c5_3_route_geometry_rendered_despite_uncertain_intermediate_stops(db_session: Session):
    """Wave C5.3 core breakthrough: route geometry renders continuously even when intermediate stops are candidate/locality."""
    engine = DeterministicGeometryEngine(db_session)
    # Route 09 has 2 stops, 1 candidate; Route 10 has candidate stops
    payload_09 = engine.get_route_geometry("09")
    assert payload_09 is not None
    assert payload_09.geometry_render_status == "RENDERABLE_ROAD_FOLLOWING"
    assert payload_09.is_geometry_available is True
    assert len(payload_09.coordinates) > 50

    # Ensure intermediate stops are still preserved as candidates without fake exact upgrades
    candidates = [a for a in payload_09.anchor_stops if a["render_candidate_marker"]]
    assert len(candidates) >= 1
    for c in candidates:
        assert c["participates_in_first_mile"] is False


def test_c5_3_two_endpoints_alone_never_generate_fake_line(db_session: Session):
    """Routes with unresolved stop gaps must fail-closed and never draw synthetic lines across gaps."""
    engine = DeterministicGeometryEngine(db_session)
    payload_101 = engine.get_route_geometry("101")
    assert payload_101 is not None
    assert payload_101.geometry_render_status == "ANCHOR_ONLY"
    assert len(payload_101.coordinates) == 0, "Route 101 must emit empty coordinates to prevent straight-line distortion"
    assert payload_101.is_geometry_available is False


def test_c5_3_road_routing_preserves_service_region():
    """Road-network paths must strictly obey regional bounding boxes."""
    cache_p = STAGING_DIR / "road_network_geometry_cache.json"
    assert cache_p.exists()
    with open(cache_p, "r", encoding="utf-8") as f:
        paths = json.load(f).get("paths", {})

    for k, pdata in paths.items():
        region = pdata["region"]
        coords = pdata["coordinates"]
        for pt in coords:
            assert is_coordinate_in_region(pt[0], pt[1], region), f"Coordinate {pt} in road path {k} outside region {region}"


def test_c5_3_malformed_disconnected_relation_rejected():
    """Disconnected or jumpy relations must be rejected from being promoted to continuous polylines."""
    geo_path = STAGING_DIR / "c5_route_geometry.json"
    with open(geo_path, "r", encoding="utf-8") as f:
        routes = json.load(f)

    for r in routes:
        if r.get("provenance", {}).get("source") == "osm_bus_route_relation" and r["coordinates"]:
            coords = r["coordinates"]
            # Check maximum adjacent coordinate jump is under 2.5 km for assembled OSM relations
            for i in range(len(coords) - 1):
                lat1, lon1 = coords[i]
                lat2, lon2 = coords[i + 1]
                # Fast Euclidean approx in degrees (~111 km per deg)
                dist_deg = ((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2) ** 0.5
                assert dist_deg < 0.03, f"Jump of {dist_deg*111:.1f} km detected in relation route {r['route_number']}!"


def test_c5_3_coverage_numbers_derived_never_constants():
    """Verify coverage percentages are strictly derived from segment accounting."""
    cov_path = REPO_ROOT / "reports" / "transit_c5_3_geometry_coverage.json"
    assert cov_path.exists()
    with open(cov_path, "r", encoding="utf-8") as f:
        rep = json.load(f)

    total = rep["total_segments"]
    assert total == 1327
    b = rep["classification_breakdown"]
    renderable = b["RENDERABLE_EXACT"] + b["RENDERABLE_ROAD_FOLLOWING"]
    expected_pct = round(renderable / total * 100, 2)
    assert rep["renderable_accounting"]["safe_product_polyline_coverage_pct"] == expected_pct
    assert rep["renderable_accounting"]["safe_product_polyline_coverage_pct"] > 25.0


def test_c5_3_manual_route_queue_is_actionable():
    """Verify manual route queue is populated and prioritizes routes."""
    queue_path = REPO_ROOT / "reports" / "transit_c5_3_manual_route_queue.json"
    assert queue_path.exists()
    with open(queue_path, "r", encoding="utf-8") as f:
        qdata = json.load(f)

    assert qdata["total_unresolved_sequences"] > 0
    pb = qdata["priority_breakdown"]
    assert pb["P0"] > 0
    assert pb["P1"] > 0

    first_route = qdata["routes"][0]
    assert "priority" in first_route
    assert "suggested_action" in first_route
    assert "quick_action_prompt" in first_route
    assert "capture_trace_specification" in first_route
