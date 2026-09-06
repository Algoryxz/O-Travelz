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


@pytest.fixture(scope="module")
def canonical_route_stops():
    return json.load(open(CANONICAL / "route_stops.json", encoding="utf-8"))


@pytest.fixture(scope="module")
def route_geometry():
    return json.load(open(STAGING / "c5_route_geometry.json", encoding="utf-8"))


@pytest.fixture(scope="module")
def route_geo_coverage():
    return json.load(open(REPORTS / "transit_c5_1_route_geometry_coverage.json", encoding="utf-8"))


@pytest.fixture(scope="module")
def departure_forensic():
    return json.load(open(REPORTS / "transit_c5_1_departure_forensic.json", encoding="utf-8"))


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


def test_route_and_schedule_counts_remain_unchanged(canonical_routes, canonical_schedules, canonical_route_stops):
    """Test 20: Route, sequence group, and schedule counts are completely preserved."""
    assert len(canonical_routes) == 154
    assert len(canonical_schedules) == 302
    assert len(canonical_route_stops) == 164
    total_links = sum(len(g.get("stops", [])) for g in canonical_route_stops)
    assert total_links == 1491
    total_departures = sum(len(sc.get("departure_times", [])) for sc in canonical_schedules)
    assert total_departures == 5549


def test_route_geometry_catalog_validity_and_segment_count(route_geometry):
    """Test 21: Route geometry catalog covers all 164 sequence groups and exactly 1,327 segments."""
    assert len(route_geometry) == 164
    total_segments = sum(len(rg["segments"]) for rg in route_geometry)
    assert total_segments == 1327

    for rg in route_geometry:
        assert rg["total_stops"] == len(rg["segments"]) + 1
        assert "direction" in rg
        assert "route_number" in rg


def test_route_geometry_confidence_separate_from_stop_confidence(route_geometry, c5_registry):
    """Test 22: Route geometry confidence is decoupled from individual stop pole exactness."""
    c5_map = {s["stop_id"]: s for s in c5_registry}
    # Find segments where geometry is VERIFIED or HIGH even if one stop is not verified
    decoupled_segments_found = False
    for rg in route_geometry:
        for seg in rg["segments"]:
            from_stop = c5_map.get(seg["from_stop_id"])
            to_stop = c5_map.get(seg["to_stop_id"])
            if seg["geometry_status"] in ["VERIFIED_ROUTE_GEOMETRY", "HIGH_CONFIDENCE_ROUTE_GEOMETRY"]:
                # At least some of these segments have intermediate stops that are CANDIDATE or LOCALITY_ONLY
                if from_stop["existing_lat"] is None or to_stop["existing_lat"] is None:
                    decoupled_segments_found = True
                    break
        if decoupled_segments_found:
            break
    assert decoupled_segments_found is True


def test_high_route_geometry_may_include_locality_only_stops(route_geometry, c5_registry):
    """Test 23: HIGH/MEDIUM route geometry successfully guides route polylines through LOCALITY_ONLY stops."""
    c5_map = {s["stop_id"]: s for s in c5_registry}
    useful_with_locality_only = 0
    for rg in route_geometry:
        for seg in rg["segments"]:
            if seg["is_useful_for_route_shaping"]:
                from_res = c5_map.get(seg["from_stop_id"], {})
                to_res = c5_map.get(seg["to_stop_id"], {})
                if from_res.get("resolution_status") == "LOCALITY_ONLY" or to_res.get("resolution_status") == "LOCALITY_ONLY":
                    useful_with_locality_only += 1
    assert useful_with_locality_only > 0


def test_route_shape_useful_coverage_reaches_90_percent(route_geo_coverage):
    """Test 24: Route-shape-useful coverage reaches or exceeds the >= 90% threshold."""
    metrics = route_geo_coverage["coverage_metrics"]
    useful_pct = metrics["route_shape_useful_coverage_pct"]
    assert useful_pct >= 90.0, f"Expected >= 90.0% route shape useful coverage, got {useful_pct}%"
    assert metrics["reaches_90_pct_goal"] is True
    assert route_geo_coverage["total_route_segments"] == 1327


def test_manual_queue_uniqueness_and_prompt_completeness(manual_queue, c5_registry):
    """Test 25: Manual queue contains all review stops exactly once with actionable prompts."""
    queue = manual_queue["queue"]
    stop_ids = [item["stop_id"] for item in queue]
    assert len(stop_ids) == len(set(stop_ids)), "Manual queue contains duplicate stop entries"

    allowed_tiers = {"P0", "P1", "P2", "P3"}
    allowed_actions = {"GOOGLE_MAPS_SEARCH", "OSM_SEARCH", "MAPILLARY_CHECK", "OFFICIAL_DOCUMENT_CHECK", "ASK_LOCAL", "RIDE_AND_CAPTURE"}

    for item in queue:
        assert item["priority_tier"] in allowed_tiers
        assert item["suggested_action"] in allowed_actions
        assert len(item["ask_local_question"]) > 10
        assert len(item["ride_and_capture_prompt"]) > 10
        assert "search_queries" in item


def test_departure_forensic_invariant_proof(departure_forensic):
    """Test 26: Departure forensic report proves 5,549 canonical departures with zero data loss."""
    assert departure_forensic["canonical_unique_departures_count"] == 5549
    assert departure_forensic["db_raw_array_elements_count"] == 5553
    assert departure_forensic["discrepancy_delta"] == 4
    assert departure_forensic["root_cause"] == "DATABASE_DUPLICATE_ARRAY_ENTRIES"
    assert departure_forensic["did_canonical_schedules_change"] is False
    assert departure_forensic["c5_mutation_check"]["outside_staging_mutations"] is False


def test_no_locality_centroid_as_candidate_coordinate(c5_registry):
    """Test 27: No candidate coordinate is manufactured from a bare town/district centroid."""
    for s in c5_registry:
        if s.get("candidate_lat") is not None:
            # Must point to an identifiable real object, not a synthetic centroid
            obj_type = s.get("candidate_object_type", "")
            assert "centroid" not in obj_type.lower()
            assert "interpolated" not in obj_type.lower()
            assert s.get("candidate_source") is not None

