"""
Unit test suite for Phase 6B Research Verification Gate.

Tests deterministic validation of:
- priority_stop_queue.json
- stop_alias_registry.json
- hub_resolutions.json
- route_impact_analysis.json
- evidence_registry.json
"""

import json
import pytest
from pathlib import Path

from scripts.verify_phase_6b_research import verify_phase_6b

BASE_DIR = Path(__file__).resolve().parents[2]
EXTRACTION_DIR = BASE_DIR / "data" / "research" / "transit" / "extraction"
PHASE_6B_DIR = BASE_DIR / "data" / "research" / "transit" / "phase_6b"


def test_phase_6b_production_artifacts_pass_all_gates():
    """Verify that the official Phase 6B research artifacts pass all 10 validation gates."""
    assert PHASE_6B_DIR.exists(), f"Phase 6B directory not found at {PHASE_6B_DIR}"
    all_passed, passed_criteria, failed_criteria, errors = verify_phase_6b(PHASE_6B_DIR, EXTRACTION_DIR)

    assert all_passed is True, f"Phase 6B verification failed with errors: {errors}"
    assert len(failed_criteria) == 0, f"Failed criteria: {failed_criteria}"
    assert len(passed_criteria) == 10, f"Expected 10 passed criteria, got {len(passed_criteria)}"


def test_priority_queue_schema_and_ordering():
    """Verify that priority_stop_queue.json contains all 1,430 stops sorted descending by score."""
    q_file = PHASE_6B_DIR / "priority_stop_queue.json"
    with open(q_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["total_canonical_stops"] == 1430
    queue = data["queue"]
    assert len(queue) == 1430

    scores = [item["priority_score"] for item in queue]
    assert scores == sorted(scores, reverse=True), "Queue must be sorted descending by priority score"

    # Top items must have high priority scores and valid reasons
    top_stop = queue[0]
    assert top_stop["priority_score"] > 50
    assert len(top_stop["reason_for_priority"]) > 0


def test_stop_alias_registry_1to1_mapping():
    """Verify that stop_alias_registry.json maps 1-to-1 with canonical stop baseline."""
    a_file = PHASE_6B_DIR / "stop_alias_registry.json"
    with open(a_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    with open(EXTRACTION_DIR / "stops_extracted.json", "r", encoding="utf-8") as f:
        stops_extracted = json.load(f)

    canonical_names = {s["canonical_name"].upper().strip() for s in stops_extracted}
    alias_names = {item["canonical_stop_name"].upper().strip() for item in data["aliases"]}

    assert len(data["aliases"]) == 1430
    assert alias_names == canonical_names


def test_hub_resolutions_status_and_evidence():
    """Verify that hub resolutions have valid statuses, confidences, and traceable evidence."""
    h_file = PHASE_6B_DIR / "hub_resolutions.json"
    with open(h_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    ev_file = PHASE_6B_DIR / "evidence_registry.json"
    with open(ev_file, "r", encoding="utf-8") as f:
        ev_data = json.load(f)
    valid_ev_ids = {e["evidence_id"] for e in ev_data["evidence"]}

    assert data["total_stops_researched"] >= 100
    for res in data["resolutions"]:
        assert res["status"] in ("VERIFIED", "CANDIDATE", "AMBIGUOUS", "UNRESOLVED")
        assert res["confidence"] in ("CONFIRMED", "SUPPORTED", "INFERRED", "UNKNOWN")
        for ev in res.get("evidence_ids", []):
            assert ev in valid_ev_ids, f"Unknown evidence ID {ev} in resolution"


def test_out_of_bounds_coordinate_fails_validation(tmp_path):
    """Negative test: an out-of-bounds coordinate must trigger AC-6B.4 failure."""
    # Copy valid artifacts to tmp_path
    for fname in ["priority_stop_queue.json", "stop_alias_registry.json", "hub_resolutions.json", "route_impact_analysis.json", "evidence_registry.json"]:
        with open(PHASE_6B_DIR / fname, "r", encoding="utf-8") as f:
            content = json.load(f)
        with open(tmp_path / fname, "w", encoding="utf-8") as f:
            json.dump(content, f)

    # Mutate a coordinate in hub_resolutions to be outside Odisha
    with open(tmp_path / "hub_resolutions.json", "r", encoding="utf-8") as f:
        hub_data = json.load(f)

    # Inject out-of-bounds lat (e.g. 51.5 in London)
    for res in hub_data["resolutions"]:
        if res["status"] == "VERIFIED":
            res["proposed_latitude"] = 51.5074
            break

    with open(tmp_path / "hub_resolutions.json", "w", encoding="utf-8") as f:
        json.dump(hub_data, f)

    all_passed, passed_criteria, failed_criteria, errors = verify_phase_6b(tmp_path, EXTRACTION_DIR)
    assert all_passed is False
    assert any("AC-6B.4" in f for f in failed_criteria)


def test_missing_provenance_fails_validation(tmp_path):
    """Negative test: a VERIFIED coordinate with null provenance must trigger AC-6B.5 failure."""
    for fname in ["priority_stop_queue.json", "stop_alias_registry.json", "hub_resolutions.json", "route_impact_analysis.json", "evidence_registry.json"]:
        with open(PHASE_6B_DIR / fname, "r", encoding="utf-8") as f:
            content = json.load(f)
        with open(tmp_path / fname, "w", encoding="utf-8") as f:
            json.dump(content, f)

    with open(tmp_path / "hub_resolutions.json", "r", encoding="utf-8") as f:
        hub_data = json.load(f)

    for res in hub_data["resolutions"]:
        if res["status"] == "VERIFIED":
            res["coordinate_provenance"] = None
            break

    with open(tmp_path / "hub_resolutions.json", "w", encoding="utf-8") as f:
        json.dump(hub_data, f)

    all_passed, passed_criteria, failed_criteria, errors = verify_phase_6b(tmp_path, EXTRACTION_DIR)
    assert all_passed is False
    assert any("AC-6B.5" in f for f in failed_criteria)


def test_baseline_overwrite_fails_validation(tmp_path):
    """Negative test: modifying an existing Phase 6A verified coordinate must trigger AC-6B.6 failure."""
    for fname in ["priority_stop_queue.json", "stop_alias_registry.json", "hub_resolutions.json", "route_impact_analysis.json", "evidence_registry.json"]:
        with open(PHASE_6B_DIR / fname, "r", encoding="utf-8") as f:
            content = json.load(f)
        with open(tmp_path / fname, "w", encoding="utf-8") as f:
            json.dump(content, f)

    with open(tmp_path / "hub_resolutions.json", "r", encoding="utf-8") as f:
        hub_data = json.load(f)

    # Mutate a baseline coordinate
    for res in hub_data["resolutions"]:
        if res["status"] == "VERIFIED" and res["proposed_latitude"]:
            res["proposed_latitude"] += 0.05
            break

    with open(tmp_path / "hub_resolutions.json", "w", encoding="utf-8") as f:
        json.dump(hub_data, f)

    all_passed, passed_criteria, failed_criteria, errors = verify_phase_6b(tmp_path, EXTRACTION_DIR)
    assert all_passed is False
    assert any("AC-6B.6" in f for f in failed_criteria)


def test_generic_ambiguous_stop_marked_verified_fails_validation(tmp_path):
    """Negative test: marking a generic stop like GANDHI CHOWK as VERIFIED without locality must fail AC-6B.7."""
    for fname in ["priority_stop_queue.json", "stop_alias_registry.json", "hub_resolutions.json", "route_impact_analysis.json", "evidence_registry.json"]:
        with open(PHASE_6B_DIR / fname, "r", encoding="utf-8") as f:
            content = json.load(f)
        with open(tmp_path / fname, "w", encoding="utf-8") as f:
            json.dump(content, f)

    with open(tmp_path / "hub_resolutions.json", "r", encoding="utf-8") as f:
        hub_data = json.load(f)

    for res in hub_data["resolutions"]:
        if res["canonical_stop_name"] == "GANDHI CHOWK":
            res["status"] = "VERIFIED"
            res["proposed_latitude"] = 20.25
            res["proposed_longitude"] = 85.82
            res["coordinate_provenance"] = "geocoded"
            res["locality"] = None
            break

    with open(tmp_path / "hub_resolutions.json", "w", encoding="utf-8") as f:
        json.dump(hub_data, f)

    all_passed, passed_criteria, failed_criteria, errors = verify_phase_6b(tmp_path, EXTRACTION_DIR)
    assert all_passed is False
    assert any("AC-6B.7" in f for f in failed_criteria)


def test_route_impact_analysis_covers_all_154_routes():
    """Verify that route_impact_analysis.json evaluates all 154 routes with valid geometry statuses."""
    imp_file = PHASE_6B_DIR / "route_impact_analysis.json"
    with open(imp_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["total_routes_evaluated"] == 154
    assert len(data["routes"]) == 154
    assert data["total_routes_improved"] >= 50

    for r_eval in data["routes"]:
        assert r_eval["baseline"]["geometry_status"] in ("EXACT", "CORRIDOR", "PARTIAL", "NONE")
        assert r_eval["phase_6b_proposed"]["geometry_status"] in ("EXACT", "CORRIDOR", "PARTIAL", "NONE")
        assert r_eval["phase_6b_proposed"]["new_anchors_gained"] >= 0
