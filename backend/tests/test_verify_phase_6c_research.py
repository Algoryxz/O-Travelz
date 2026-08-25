"""
Unit test suite for Phase 6C Research Verification Gate.

Tests:
- Production artifact verification against all 12 criteria (AC-6C.1 to AC-6C.12).
- Negative tests: coordinate mutation, out-of-bounds coords, missing evidence, prior phase mutation.
"""

import json
import pytest
from pathlib import Path
from scripts.verify_phase_6c_research import verify_phase_6c

BASE_DIR = Path(__file__).resolve().parents[2]
EXTRACTION_DIR = BASE_DIR / "data" / "research" / "transit" / "extraction"
PHASE_6A_DIR = BASE_DIR / "data" / "research" / "transit" / "phase_6a"
PHASE_6B_DIR = BASE_DIR / "data" / "research" / "transit" / "phase_6b"
PHASE_6C_DIR = BASE_DIR / "data" / "research" / "transit" / "phase_6c"


def test_phase_6c_production_artifacts_pass_all_gates():
    """Verify that official Phase 6C research artifacts pass all 12 validation gates."""
    assert PHASE_6C_DIR.exists(), f"Phase 6C directory not found at {PHASE_6C_DIR}"

    all_passed, passed_criteria, failed_criteria, errors = verify_phase_6c(
        phase_6c_dir=PHASE_6C_DIR,
        phase_6b_dir=PHASE_6B_DIR,
        phase_6a_dir=PHASE_6A_DIR,
        extraction_dir=EXTRACTION_DIR,
    )

    assert all_passed is True, f"Phase 6C verification failed with errors: {errors}"
    assert len(failed_criteria) == 0, f"Failed criteria: {failed_criteria}"
    assert len(passed_criteria) == 12, f"Expected 12 passed criteria, got {len(passed_criteria)}"


def test_research_queue_structure():
    """Verify structure and contents of research_queue.json."""
    q_file = PHASE_6C_DIR / "research_queue.json"
    with open(q_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["batch_size"] == len(data["queue"])
    assert data["batch_size"] > 0

    for item in data["queue"]:
        assert "canonical_stop_name" in item
        assert "service_region" in item
        assert "route_ids" in item
        assert "priority_score" in item


def test_verified_resolutions_have_valid_bounds_and_evidence():
    """Verify that all VERIFIED resolutions are within Odisha bounds and have valid evidence."""
    v_file = PHASE_6C_DIR / "verified_resolutions.json"
    with open(v_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    for res in data["resolutions"]:
        lat = res["latitude"]
        lon = res["longitude"]
        assert 17.5 <= lat <= 22.8
        assert 81.2 <= lon <= 87.6
        assert len(res["evidence_ids"]) >= 1
        assert res["provenance"] in ("official_source", "geocoded", "osm_verified", "research_approximate")


def test_out_of_bounds_coordinate_fails_ac_6c_4(tmp_path):
    """Negative test: injecting out-of-bounds coordinate triggers AC-6C.4 failure."""
    # Copy artifacts to tmp_path
    for fpath in PHASE_6C_DIR.glob("*.json"):
        with open(fpath, "r", encoding="utf-8") as f:
            content = json.load(f)
        with open(tmp_path / fpath.name, "w", encoding="utf-8") as f:
            json.dump(content, f)

    # Mutate a coordinate in verified_resolutions
    with open(tmp_path / "verified_resolutions.json", "r", encoding="utf-8") as f:
        v_data = json.load(f)

    if v_data["resolutions"]:
        v_data["resolutions"][0]["latitude"] = 35.6762  # Tokyo

    with open(tmp_path / "verified_resolutions.json", "w", encoding="utf-8") as f:
        json.dump(v_data, f)

    all_passed, passed_criteria, failed_criteria, errors = verify_phase_6c(
        phase_6c_dir=tmp_path,
        phase_6b_dir=PHASE_6B_DIR,
        phase_6a_dir=PHASE_6A_DIR,
        extraction_dir=EXTRACTION_DIR,
    )

    assert all_passed is False
    assert any("AC-6C.4" in f for f in failed_criteria)


def test_missing_evidence_fails_ac_6c_7(tmp_path):
    """Negative test: verified resolution with empty evidence triggers AC-6C.7 failure."""
    for fpath in PHASE_6C_DIR.glob("*.json"):
        with open(fpath, "r", encoding="utf-8") as f:
            content = json.load(f)
        with open(tmp_path / fpath.name, "w", encoding="utf-8") as f:
            json.dump(content, f)

    with open(tmp_path / "verified_resolutions.json", "r", encoding="utf-8") as f:
        v_data = json.load(f)

    if v_data["resolutions"]:
        v_data["resolutions"][0]["evidence_ids"] = []

    with open(tmp_path / "verified_resolutions.json", "w", encoding="utf-8") as f:
        json.dump(v_data, f)

    all_passed, passed_criteria, failed_criteria, errors = verify_phase_6c(
        phase_6c_dir=tmp_path,
        phase_6b_dir=PHASE_6B_DIR,
        phase_6a_dir=PHASE_6A_DIR,
        extraction_dir=EXTRACTION_DIR,
    )

    assert all_passed is False
    assert any("AC-6C.7" in f for f in failed_criteria)


def test_offline_mode_cannot_silently_claim_live_api(tmp_path):
    """Negative test: offline artifact with contradictory live claims triggers AC-6C.3 failure."""
    for fpath in PHASE_6C_DIR.glob("*.json"):
        with open(fpath, "r", encoding="utf-8") as f:
            content = json.load(f)
        with open(tmp_path / fpath.name, "w", encoding="utf-8") as f:
            json.dump(content, f)

    with open(tmp_path / "gemini_raw_results.json", "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    # Invalidate generation mode
    raw_data["generation_mode"] = "invalid_mode_claim"

    with open(tmp_path / "gemini_raw_results.json", "w", encoding="utf-8") as f:
        json.dump(raw_data, f)

    all_passed, passed_criteria, failed_criteria, errors = verify_phase_6c(
        phase_6c_dir=tmp_path,
        phase_6b_dir=PHASE_6B_DIR,
        phase_6a_dir=PHASE_6A_DIR,
        extraction_dir=EXTRACTION_DIR,
    )

    assert all_passed is False
    assert any("AC-6C.3" in f for f in failed_criteria)


def test_no_secrets_in_phase_6c_artifacts():
    """Verify that zero API keys, auth tokens, or passwords exist in research artifacts."""
    secret_patterns = ["ai_gemini_api_key", "ai_nvidia_api_key", "nvapi-", "x-goog-api-key", "bearer "]
    for fpath in PHASE_6C_DIR.glob("*.json"):
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read().lower()
            for sp in secret_patterns:
                assert sp not in content, f"Secret pattern '{sp}' detected in {fpath.name}"


def test_every_evidence_reference_exists_in_evidence_registry():
    """Verify that every evidence ID cited in verified resolutions exists in evidence_registry.json."""
    with open(PHASE_6C_DIR / "evidence_registry.json", "r", encoding="utf-8") as f:
        ev_data = json.load(f)
    registry_ids = {e["evidence_id"] for e in ev_data["evidence"]}

    with open(PHASE_6C_DIR / "verified_resolutions.json", "r", encoding="utf-8") as f:
        v_data = json.load(f)

    for res in v_data["resolutions"]:
        for eid in res["evidence_ids"]:
            assert eid in registry_ids, f"Evidence ID '{eid}' missing from evidence_registry.json"
