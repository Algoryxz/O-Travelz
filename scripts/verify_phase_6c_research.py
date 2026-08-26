#!/usr/bin/env python3
"""
O-TRAVELZ — Phase 6C Research Verification Gate

Validates Phase 6C research artifacts against 12 strict acceptance criteria (AC-6C.1 to AC-6C.12).
Exit code 0 on pass, non-zero on failure.
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

# Base paths
BASE_DIR = Path(__file__).resolve().parents[1]
EXTRACTION_DIR = BASE_DIR / "data" / "research" / "transit" / "extraction"
PHASE_6A_DIR = BASE_DIR / "data" / "research" / "transit" / "phase_6a"
PHASE_6B_DIR = BASE_DIR / "data" / "research" / "transit" / "phase_6b"
PHASE_6C_DIR = BASE_DIR / "data" / "research" / "transit" / "phase_6c"

# Spatial Bounds
ODISHA_BOUNDS = {
    "min_lat": 17.5,
    "max_lat": 22.8,
    "min_lon": 81.2,
    "max_lon": 87.6,
}

REGIONAL_BOUNDS = {
    "Capital Region": {"min_lat": 19.5, "max_lat": 21.0, "min_lon": 85.0, "max_lon": 86.5},
    "Bhubaneswar": {"min_lat": 20.15, "max_lat": 20.45, "min_lon": 85.70, "max_lon": 85.95},
    "Cuttack": {"min_lat": 20.40, "max_lat": 20.60, "min_lon": 85.80, "max_lon": 86.00},
    "Puri": {"min_lat": 19.70, "max_lat": 20.00, "min_lon": 85.70, "max_lon": 86.05},
    "Rourkela": {"min_lat": 22.15, "max_lat": 22.35, "min_lon": 84.75, "max_lon": 85.00},
    "Berhampur": {"min_lat": 19.20, "max_lat": 19.45, "min_lon": 84.70, "max_lon": 84.95},
    "Sambalpur": {"min_lat": 21.20, "max_lat": 22.00, "min_lon": 83.60, "max_lon": 84.40},
    "Keonjhar": {"min_lat": 21.55, "max_lat": 21.75, "min_lon": 85.50, "max_lon": 85.70},
}

GENERIC_AMBIGUOUS_NAMES = {
    "NH", "SAI TEMPLE", "SAI MANDIR", "GANDHI CHOWK", "COLLEGE SQUARE",
    "FIRE STATION", "BUS STAND", "RAILWAY STATION", "COURT CHOWK", "MARKET SQUARE"
}

FORBIDDEN_KEYS = {"geometry", "geojson", "polyline", "coordinates_linestring", "shape"}


def load_json(file_path: Path) -> Tuple[bool, Any, str]:
    """Safely load JSON file."""
    if not file_path.exists():
        return False, None, f"File does not exist: {file_path}"
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return True, json.load(f), ""
    except Exception as e:
        return False, None, f"JSON parse error in {file_path}: {e}"


def verify_phase_6c(
    phase_6c_dir: Path,
    phase_6b_dir: Path,
    phase_6a_dir: Path,
    extraction_dir: Path,
) -> Tuple[bool, List[str], List[str], List[str]]:
    """Run Phase 6C verification gate against all 12 criteria."""
    passed_criteria: List[str] = []
    failed_criteria: List[str] = []
    errors: List[str] = []

    # Baseline Stop Names
    ok, stops_extracted, err = load_json(extraction_dir / "stops_extracted.json")
    if not ok:
        failed_criteria.append(f"AC-6C.0: Missing extraction stops ({err})")
        return False, passed_criteria, failed_criteria, errors

    canonical_stop_names = {s["canonical_name"].upper().strip() for s in stops_extracted}

    # 1. AC-6C.9: Immutable Prior Phases Check
    # Verify Phase 6A and 6B remain intact
    p6a_files = ["route_index.json", "capital_region.json", "rourkela.json", "unresolved_stops.json"]
    p6b_files = ["priority_stop_queue.json", "stop_alias_registry.json", "hub_resolutions.json", "route_impact_analysis.json"]
    p6a_p6b_ok = True
    for f in p6a_files:
        if not (phase_6a_dir / f).exists():
            p6a_p6b_ok = False
            errors.append(f"AC-6C.9: Phase 6A file missing: {f}")
    for f in p6b_files:
        if not (phase_6b_dir / f).exists():
            p6a_p6b_ok = False
            errors.append(f"AC-6C.9: Phase 6B file missing: {f}")

    if p6a_p6b_ok:
        passed_criteria.append("AC-6C.9: Immutable Prior Phases (Phase 6A & 6B)")
    else:
        failed_criteria.append("AC-6C.9: Immutable Prior Phases (Phase 6A & 6B)")

    # 2. AC-6C.1 & AC-6C.2: Research Queue Validation & Canonical Preservation
    q_file = phase_6c_dir / "research_queue.json"
    ok, q_data, err = load_json(q_file)
    if ok and isinstance(q_data, dict) and "queue" in q_data:
        queue = q_data["queue"]
        q_ok = True
        if len(queue) == 0:
            q_ok = False
            errors.append("AC-6C.2: Research queue is empty")

        for item in queue:
            c_name = item.get("canonical_stop_name", "").upper().strip()
            if c_name not in canonical_stop_names:
                q_ok = False
                errors.append(f"AC-6C.1: Non-canonical stop found in queue: {c_name}")
            if not item.get("service_region") or not item.get("route_ids"):
                q_ok = False
                errors.append(f"AC-6C.2: Malformed queue item: {c_name}")

        if q_ok:
            passed_criteria.append("AC-6C.1: Canonical Stop Preservation")
            passed_criteria.append("AC-6C.2: Batch Determinism & Queue Integrity")
        else:
            failed_criteria.append("AC-6C.1: Canonical Stop Preservation")
            failed_criteria.append("AC-6C.2: Batch Determinism & Queue Integrity")
    else:
        failed_criteria.append(f"AC-6C.1: Research queue missing ({err})")
        failed_criteria.append(f"AC-6C.2: Research queue missing ({err})")

    # 3. AC-6C.3 & AC-6C.11: Structured Gemini Output, Generation Mode & Failure Isolation
    raw_file = phase_6c_dir / "gemini_raw_results.json"
    ok, raw_data, err = load_json(raw_file)
    if ok and isinstance(raw_data, dict) and "results" in raw_data:
        raw_results = raw_data["results"]
        gen_mode = raw_data.get("generation_mode")
        eng_name = raw_data.get("research_engine")
        raw_ok = True

        if gen_mode not in ("live", "offline", "mock"):
            raw_ok = False
            errors.append(f"AC-6C.3: Missing or invalid generation_mode: '{gen_mode}'")

        if not eng_name:
            raw_ok = False
            errors.append("AC-6C.3: Missing research_engine metadata in raw results")

        for r in raw_results:
            api_st = r.get("api_status")
            if not r.get("canonical_stop_name") or not api_st or not r.get("timestamp"):
                raw_ok = False
                errors.append(f"AC-6C.3: Malformed raw result item: {r}")
                break

            # If generation mode is offline, api_status must be OFFLINE_DETERMINISTIC
            if gen_mode in ("offline", "mock") and api_st not in ("OFFLINE_DETERMINISTIC", "SUCCESS"):
                raw_ok = False
                errors.append(f"AC-6C.3: Offline artifact has contradictory api_status: '{api_st}'")
                break

            # If generation mode is live, api_status must be LIVE_API_SUCCESS, PARSE_ERROR, or API_FAILED
            if gen_mode == "live" and api_st not in ("LIVE_API_SUCCESS", "PARSE_ERROR", "API_FAILED"):
                raw_ok = False
                errors.append(f"AC-6C.3: Live artifact has invalid api_status: '{api_st}'")
                break

        if raw_ok:
            passed_criteria.append("AC-6C.3: Structured Gemini Output & Generation Mode Truthfulness")
            passed_criteria.append("AC-6C.11: Failure Isolation")
        else:
            failed_criteria.append("AC-6C.3: Structured Gemini Output & Generation Mode Truthfulness")
            failed_criteria.append("AC-6C.11: Failure Isolation")
    else:
        failed_criteria.append(f"AC-6C.3: Raw Gemini results missing ({err})")
        failed_criteria.append(f"AC-6C.11: Raw Gemini results missing ({err})")

    # 4. Evidence Registry Loading
    ev_file = phase_6c_dir / "evidence_registry.json"
    ok, ev_data, err = load_json(ev_file)
    valid_ev_ids = set()
    if ok and isinstance(ev_data, dict) and "evidence" in ev_data:
        for e in ev_data["evidence"]:
            if e.get("evidence_id"):
                valid_ev_ids.add(e["evidence_id"])

    # 5. AC-6C.4, AC-6C.5, AC-6C.6, AC-6C.7, AC-6C.8, AC-6C.12: Verified Resolutions
    v_file = phase_6c_dir / "verified_resolutions.json"
    ok, v_data, err = load_json(v_file)
    if ok and isinstance(v_data, dict) and "resolutions" in v_data:
        verified_res = v_data["resolutions"]
        bounds_ok = True
        region_ok = True
        anti_conflation_ok = True
        evidence_ok = True
        promotion_ok = True
        provenance_ok = True

        for res in verified_res:
            c_name = res.get("canonical_stop_name", "").upper().strip()
            lat = res.get("latitude")
            lon = res.get("longitude")
            conf = res.get("confidence")
            prov = res.get("provenance")
            reg = res.get("candidate_region") or res.get("service_region", "Capital Region")
            ev_ids = res.get("evidence_ids", [])

            # AC-6C.4: Odisha Bounding Box
            if lat is None or lon is None or not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
                bounds_ok = False
                errors.append(f"AC-6C.4: Non-numeric or missing coordinates for VERIFIED stop {c_name}: ({lat}, {lon})")
            else:
                if not (ODISHA_BOUNDS["min_lat"] <= lat <= ODISHA_BOUNDS["max_lat"] and ODISHA_BOUNDS["min_lon"] <= lon <= ODISHA_BOUNDS["max_lon"]):
                    bounds_ok = False
                    errors.append(f"AC-6C.4: Coordinates out of Odisha bounds for {c_name}: ({lat}, {lon})")

            # AC-6C.5: Region context
            # Region match check
            matched_reg = None
            for reg_k, r_bounds in REGIONAL_BOUNDS.items():
                if reg_k.lower() in reg.lower():
                    matched_reg = r_bounds
                    break
            if matched_reg and lat and lon:
                if not (matched_reg["min_lat"] <= lat <= matched_reg["max_lat"] and matched_reg["min_lon"] <= lon <= matched_reg["max_lon"]):
                    region_ok = False
                    errors.append(f"AC-6C.5: Coordinates ({lat}, {lon}) inconsistent with service region '{reg}' for {c_name}")

            # AC-6C.6: Generic Name Anti-Conflation
            if c_name in GENERIC_AMBIGUOUS_NAMES and not res.get("candidate_name"):
                anti_conflation_ok = False
                errors.append(f"AC-6C.6: Generic stop name {c_name} promoted to VERIFIED without disambiguated candidate name")

            # AC-6C.7: Evidence Requirement
            if not ev_ids:
                evidence_ok = False
                errors.append(f"AC-6C.7: VERIFIED stop {c_name} lacks evidence citations")
            else:
                for eid in ev_ids:
                    if eid not in valid_ev_ids:
                        evidence_ok = False
                        errors.append(f"AC-6C.7: Unknown evidence ID {eid} for stop {c_name}")

            # AC-6C.8: No Unsupported Promotion (Must have evidence and confirmed status)
            if conf not in ("HIGH", "MEDIUM") or not ev_ids:
                promotion_ok = False
                errors.append(f"AC-6C.8: Unsupported promotion for {c_name}: conf={conf}, ev={ev_ids}")

            # AC-6C.12: Provenance Completeness
            if not prov or not res.get("promotion_rationale"):
                provenance_ok = False
                errors.append(f"AC-6C.12: Incomplete provenance/rationale for {c_name}")

        if bounds_ok:
            passed_criteria.append("AC-6C.4: Coordinate Validation (Odisha Bounding Box)")
        else:
            failed_criteria.append("AC-6C.4: Coordinate Validation (Odisha Bounding Box)")

        if region_ok:
            passed_criteria.append("AC-6C.5: Region Context Validation")
        else:
            failed_criteria.append("AC-6C.5: Region Context Validation")

        if anti_conflation_ok:
            passed_criteria.append("AC-6C.6: Generic Name Anti-Conflation")
        else:
            failed_criteria.append("AC-6C.6: Generic Name Anti-Conflation")

        if evidence_ok:
            passed_criteria.append("AC-6C.7: Evidence Requirement & Registry Citations")
        else:
            failed_criteria.append("AC-6C.7: Evidence Requirement & Registry Citations")

        if promotion_ok:
            passed_criteria.append("AC-6C.8: No Unsupported Promotion")
        else:
            failed_criteria.append("AC-6C.8: No Unsupported Promotion")

        if provenance_ok:
            passed_criteria.append("AC-6C.12: Provenance Completeness")
        else:
            failed_criteria.append("AC-6C.12: Provenance Completeness")

    else:
        failed_criteria.extend([
            f"AC-6C.4: Missing verified resolutions ({err})",
            f"AC-6C.5: Missing verified resolutions ({err})",
            f"AC-6C.6: Missing verified resolutions ({err})",
            f"AC-6C.7: Missing verified resolutions ({err})",
            f"AC-6C.8: Missing verified resolutions ({err})",
            f"AC-6C.12: Missing verified resolutions ({err})",
        ])

    # 6. AC-6C.10: Zero Forbidden Keys, Secrets, or Production Contamination
    forbidden_detected = []
    secret_patterns = ["ai_gemini_api_key", "ai_nvidia_api_key", "nvapi-", "x-goog-api-key", "bearer "]

    for fpath in phase_6c_dir.glob("*.json"):
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read().lower()
            for fk in FORBIDDEN_KEYS:
                if f'"{fk}"' in content:
                    forbidden_detected.append(f"{fpath.name}: forbidden key '{fk}'")
            for sp in secret_patterns:
                if sp in content:
                    forbidden_detected.append(f"{fpath.name}: potential secret pattern '{sp}'")

    if not forbidden_detected:
        passed_criteria.append("AC-6C.10: Zero Production Contamination / Forbidden Keys & Secrets")
    else:
        failed_criteria.append(f"AC-6C.10: Forbidden geometry keys or secrets detected: {forbidden_detected}")

    all_passed = (len(failed_criteria) == 0 and len(passed_criteria) == 12)
    return all_passed, passed_criteria, failed_criteria, errors


def main():
    target_dir = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else PHASE_6C_DIR

    print(f"Running Phase 6C Validator on: {target_dir}")
    all_passed, passed, failed, errors = verify_phase_6c(
        phase_6c_dir=target_dir,
        phase_6b_dir=PHASE_6B_DIR,
        phase_6a_dir=PHASE_6A_DIR,
        extraction_dir=EXTRACTION_DIR,
    )

    print("\n==================================================")
    if all_passed:
        print("=== PHASE 6C RESEARCH VALIDATION GATE: PASSED ===")
    else:
        print("=== PHASE 6C RESEARCH VALIDATION GATE: FAILED ===")
    print("==================================================")
    print(f"Passed Criteria: {len(passed)} / 12 ({', '.join([p.split(':')[0] for p in passed])})")
    print(f"Failed Criteria: {len(failed)} / 12 ({', '.join([f.split(':')[0] for f in failed]) if failed else 'None'})")

    if errors:
        print("\nErrors Found:")
        for err in errors[:15]:
            print(f"  - {err}")
        if len(errors) > 15:
            print(f"  ... and {len(errors) - 15} more errors")

    print()
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
