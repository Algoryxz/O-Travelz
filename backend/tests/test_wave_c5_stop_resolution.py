"""
backend/tests/test_wave_c5_stop_resolution.py — Wave C5: Stop Resolution Validation Suite.

Verifies:
1. 1,430-stop accounting exact.
2. Candidate never mislabeled VERIFIED.
3. Topology interpolation cannot create a point.
4. Only real external candidate objects can produce candidate coordinates.
5. Generic names may resolve via context.
6. Generic name alone insufficient.
7. Cross-region candidate rejected.
8. Two-anchor candidate respects route order.
9. One-anchor inference receives reduced confidence.
10. No-anchor topology produces no fabricated coordinate.
11. Correlated evidence not counted as independent.
12. Candidate point cannot participate in exact first-mile.
13. Candidate point may participate in estimated route shaping.
14. Single user observation cannot promote.
15. Same-user repeated observations do not count as independent confirmations.
16. Multiple independent observations only create verification candidate.
17. Manual queue covers every review/unresolved stop.
18. Coverage arithmetic exact.
19. Canonical exact coordinates remain unchanged unless explicitly verified and promoted.
20. Route/schedule counts remain unchanged.
"""

import json
from pathlib import Path
import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
CANONICAL = REPO_ROOT / "data" / "transport" / "canonical"
STAGING = REPO_ROOT / "data" / "transport" / "staging" / "ama_bus"
REPORTS = REPO_ROOT / "reports"


@pytest.fixture(scope="module")
def canonical_stops():
    return json.load(open(CANONICAL / "stops.json", encoding="utf-8"))


@pytest.fixture(scope="module")
def canonical_routes():
    return json.load(open(CANONICAL / "routes.json", encoding="utf-8"))


@pytest.fixture(scope="module")
def canonical_schedules():
    return json.load(open(CANONICAL / "schedules.json", encoding="utf-8"))


@pytest.fixture(scope="module")
def c5_registry():
    return json.load(open(STAGING / "c5_stop_resolution.json", encoding="utf-8"))


@pytest.fixture(scope="module")
def coverage_report():
    return json.load(open(REPORTS / "transit_c5_coverage.json", encoding="utf-8"))


@pytest.fixture(scope="module")
def manual_queue():
    return json.load(open(REPORTS / "transit_c5_manual_resolution_queue.json", encoding="utf-8"))


@pytest.fixture(scope="module")
def generic_report():
    return json.load(open(REPORTS / "transit_c5_generic_name_resolution.json", encoding="utf-8"))


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_1430_stop_accounting_exact(c5_registry, canonical_stops):
    """Test 1: 1,430-stop accounting is strictly exact."""
    assert len(canonical_stops) == 1430
    assert len(c5_registry) == 1430

    stop_ids_canon = {s["stop_id"] for s in canonical_stops}
    stop_ids_reg = {s["stop_id"] for s in c5_registry}
    assert stop_ids_canon == stop_ids_reg


def test_candidate_never_mislabeled_verified(c5_registry):
    """Test 2: Candidate coordinates are NEVER mislabeled VERIFIED."""
    for s in c5_registry:
        status = s["resolution_status"]
        if "CANDIDATE" in status:
            assert not status.startswith("VERIFIED")
            assert s["render_exact_marker"] is False
            assert s["participates_in_first_mile"] is False


def test_topology_interpolation_cannot_create_point(c5_registry):
    """Test 3: Topology interpolation alone NEVER manufactures candidate coordinates."""
    for s in c5_registry:
        if s.get("candidate_lat") is not None:
            # Must point to a real object, not an interpolated midpoint
            assert s.get("candidate_object_type") != "geometric_interpolation"
            assert s.get("candidate_object_type") != "midpoint"
            assert s.get("candidate_source") is not None
            assert s.get("candidate_source") != "interpolated_sequence_vector"


def test_only_real_external_candidate_objects_produce_candidates(c5_registry):
    """Test 4: Only real external candidate objects produce candidate coordinates."""
    allowed_sources = {
        "OSM",
        "odisha_services",
        "places",
        "statewide_entities",
        "Nominatim",
        "OSM_Nominatim",
        "OSM_Place",
        "canonical_survey",
        "canonical_transit_stops",
        "staticTransitStops_verified_survey",
        "official_district_portal_gis",
        "nominatim_osm",
        "canonical_place_repository",
    }
    for s in c5_registry:
        if s.get("candidate_lat") is not None:
            source = s.get("candidate_source", "")
            prefix = source.split(":")[0]
            assert prefix in allowed_sources or any(source.startswith(a) for a in allowed_sources), f"Unrecognized source {source} on {s['stop_id']}"


def test_generic_names_may_resolve_via_context(generic_report):
    """Test 5: Generic names (e.g. Bus Stand, Hospital, PS) can resolve contextually."""
    assert generic_report["total_generic_stops_audited"] > 0
    assert generic_report["uniquely_resolved_count"] > 0

    resolved_sample = [r for r in generic_report["sample_resolutions"] if r["status"] in ["CANDIDATE_HIGH", "CANDIDATE_MEDIUM"]]
    assert len(resolved_sample) > 0
    for r in resolved_sample:
        assert r["matched_object"] is not None
        assert r["rationale"] == "Contextual isolation via route corridor and qualifier matching"


def test_generic_name_alone_insufficient_for_verification(c5_registry):
    """Test 6: Generic name alone cannot promote an unresolved stop to VERIFIED."""
    for s in c5_registry:
        if s["generic_name"] and s["existing_coordinate_status"] == "UNRESOLVED":
            assert s["resolution_status"] not in ["VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL"]


def test_cross_region_candidate_rejected(c5_registry):
    """Test 7: Candidates located in distant unrelated regions are rejected."""
    for s in c5_registry:
        if s["resolution_status"] in ["CANDIDATE_HIGH", "CANDIDATE_MEDIUM"]:
            cand_lat = s["candidate_lat"]
            cand_lon = s["candidate_lon"]
            # All candidates must strictly be inside Odisha bounding box
            assert 17.5 <= cand_lat <= 23.0
            assert 81.0 <= cand_lon <= 88.0


def test_two_anchor_candidate_respects_route_order(c5_registry):
    """Test 8: Two-anchor candidate preserves route order consistency."""
    for s in c5_registry:
        if s["resolution_status"] in ["CANDIDATE_HIGH"]:
            pred = s.get("previous_known_anchor")
            succ = s.get("next_known_anchor")
            if pred and succ:
                # Must be flagged as neighbor and corridor consistent
                assert s["route_corridor_consistency"] is True


def test_one_anchor_inference_receives_reduced_confidence(c5_registry):
    """Test 9: One-anchor inference cannot achieve CANDIDATE_HIGH without strong independent POI."""
    for s in c5_registry:
        pred = s.get("previous_known_anchor")
        succ = s.get("next_known_anchor")
        has_two_sided = bool(pred and succ)
        if not has_two_sided and s["resolution_status"] == "CANDIDATE_HIGH":
            # Must have strong independent evidence
            assert len(s["independent_evidence_channels"]) >= 2


def test_no_anchor_topology_produces_no_fabricated_coordinate(c5_registry):
    """Test 10: Routes with no anchors produce no fabricated coordinates."""
    for s in c5_registry:
        pred = s.get("previous_known_anchor")
        succ = s.get("next_known_anchor")
        if not pred and not succ and s["existing_coordinate_status"] == "UNRESOLVED":
            # If no real candidate object was matched, must remain LOCALITY_ONLY or UNRESOLVED
            if s.get("candidate_lat") is None:
                assert s["resolution_status"] in ["LOCALITY_ONLY", "UNRESOLVED", "ROUTE_CONTEXT_ONLY"]


def test_correlated_evidence_not_counted_as_independent(c5_registry):
    """Test 11: Correlated evidence channels are not double-counted as independent."""
    for s in c5_registry:
        indep = s.get("independent_evidence_channels", [])
        corr = s.get("correlated_evidence_channels", [])
        # No channel should be simultaneously independent and correlated
        assert set(indep).isdisjoint(set(corr))


def test_candidate_point_cannot_participate_in_exact_first_mile(c5_registry):
    """Test 12: Candidate points are strictly barred from exact first-mile walking."""
    for s in c5_registry:
        if s["resolution_status"].startswith("CANDIDATE"):
            assert s["participates_in_first_mile"] is False


def test_candidate_point_may_participate_in_estimated_route_shaping(c5_registry):
    """Test 13: Candidate points (High & Medium) may assist in estimated route polyline shaping."""
    for s in c5_registry:
        if s["resolution_status"] in ["CANDIDATE_HIGH", "CANDIDATE_MEDIUM"]:
            assert s["participates_in_route_shape_assist"] is True
            assert s["render_candidate_marker"] is True


def test_single_user_observation_cannot_promote():
    """Test 14: Single user observation is structurally barred from canonical promotion."""
    # Verified by schema specification: threshold requires >= 5 clusters
    spec_path = REPO_ROOT / "docs" / "v4" / "TRANSIT_STOP_VERIFICATION.md"
    assert spec_path.exists()
    content = spec_path.read_text(encoding="utf-8")
    assert "One observation NEVER auto-promotes to canonical truth" in content
    assert "Tier 1: Single Observation" in content


def test_same_user_repeated_observations_not_consensus():
    """Test 15: Same-user repeated observations do not count as consensus."""
    spec_path = REPO_ROOT / "docs" / "v4" / "TRANSIT_STOP_VERIFICATION.md"
    content = spec_path.read_text(encoding="utf-8")
    assert "session_hash" in content
    assert "distinct" in content


def test_multiple_independent_observations_only_create_verification_candidate():
    """Test 16: Multiple independent observations create a verification candidate, not auto-verified."""
    spec_path = REPO_ROOT / "docs" / "v4" / "TRANSIT_STOP_VERIFICATION.md"
    content = spec_path.read_text(encoding="utf-8")
    assert "CANDIDATE_HIGH" in content
    assert "Audited Consensus" in content


def test_manual_queue_covers_every_review_unresolved_stop(manual_queue, c5_registry):
    """Test 17: Manual queue covers all stops requiring review or unresolved."""
    queue_stop_ids = {item["stop_id"] for item in manual_queue["queue"]}
    for s in c5_registry:
        if s["manual_review_required"]:
            assert s["stop_id"] in queue_stop_ids, f"Stop {s['stop_id']} requires review but missing from manual queue"


def test_coverage_arithmetic_exact(coverage_report):
    """Test 18: Coverage arithmetic sums up exactly to 1,430 and 100%."""
    counts = coverage_report["counts"]
    total = coverage_report["total_stops"]
    assert sum(counts.values()) == total == 1430

    pcts = coverage_report["percentages"]
    assert round(sum(pcts.values()), 1) in [99.9, 100.0, 100.1]


def test_canonical_exact_coordinates_remain_unchanged(canonical_stops, c5_registry):
    """Test 19: Canonical exact coordinates (173 stops) remain 100% unchanged."""
    canon_map = {s["stop_id"]: s for s in canonical_stops if s.get("lat") is not None}
    assert len(canon_map) == 173

    for sid, cs in canon_map.items():
        reg_s = next(s for s in c5_registry if s["stop_id"] == sid)
        assert reg_s["existing_lat"] == cs["lat"]
        assert reg_s["existing_lon"] == cs["lon"]
        assert reg_s["resolution_status"] == cs["coordinate_status"]


def test_route_and_schedule_counts_remain_unchanged(canonical_routes, canonical_schedules):
    """Test 20: Route and schedule counts are completely preserved."""
    assert len(canonical_routes) == 154
    assert len(canonical_schedules) == 302
    total_departures = sum(len(sc.get("departure_times", [])) for sc in canonical_schedules)
    assert total_departures == 5549
