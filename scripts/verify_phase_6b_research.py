#!/usr/bin/env python3
"""
O-TRAVELZ — Phase 6B Research Verification Gate

Validates Phase 6B research artifacts against 10 strict acceptance criteria (AC-6B.1 to AC-6B.10).
Exit code 0 on pass, non-zero on failure.
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

BASE_DIR = Path(__file__).resolve().parents[1]
EXTRACTION_DIR = BASE_DIR / "data" / "research" / "transit" / "extraction"
PHASE_6B_DIR = BASE_DIR / "data" / "research" / "transit" / "phase_6b"

# Bounds
ODISHA_BOUNDS = {
    "min_lat": 17.5,
    "max_lat": 22.8,
    "min_lon": 81.2,
    "max_lon": 87.6,
}

VALID_STATUSES = {"VERIFIED", "CANDIDATE", "AMBIGUOUS", "UNRESOLVED"}
VALID_CONFIDENCES = {"CONFIRMED", "SUPPORTED", "INFERRED", "UNKNOWN"}
VALID_PROVENANCES = {"official_source", "geocoded", "osm_verified", "research_approximate"}
VALID_GEOMETRY_STATUSES = {"EXACT", "CORRIDOR", "PARTIAL", "NONE"}

FORBIDDEN_GEOMETRY_KEYS = {
    "geometry", "geojson", "polyline", "coordinates_linestring",
    "shape", "linestring", "path_coordinates"
}

GENERIC_AMBIGUOUS_NAMES = {
    "GANDHI CHOWK", "COLLEGE SQUARE", "FIRE STATION", "BUS STAND",
    "RAILWAY STATION", "COURT CHOWK", "MARKET SQUARE"
}


def load_json(file_path: Path) -> Tuple[bool, Any, str]:
    """Safely load JSON file."""
    if not file_path.exists():
        return False, None, f"File does not exist: {file_path}"
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return True, json.load(f), ""
    except Exception as e:
        return False, None, f"JSON parse error in {file_path}: {e}"


def verify_phase_6b(phase_6b_dir: Path, extraction_dir: Path) -> Tuple[bool, List[str], List[str]]:
    """Run Phase 6B verification gate."""
    passed_criteria: List[str] = []
    failed_criteria: List[str] = []
    errors: List[str] = []

    # Load baseline
    ok, stops_extracted, err = load_json(extraction_dir / "stops_extracted.json")
    if not ok:
        failed_criteria.append(f"AC-6B.0: Missing extraction stops ({err})")
        return False, passed_criteria, failed_criteria

    ok, routes_extracted, err = load_json(extraction_dir / "routes_extracted.json")
    if not ok:
        failed_criteria.append(f"AC-6B.0: Missing extraction routes ({err})")
        return False, passed_criteria, failed_criteria

    canonical_stop_names = {s["canonical_name"].upper().strip() for s in stops_extracted}
    canonical_route_numbers = {r["route_number"] for r in routes_extracted}
    baseline_coords = {
        s["canonical_name"].upper().strip(): (s["latitude"], s["longitude"])
        for s in stops_extracted
        if s.get("latitude") is not None and s.get("longitude") is not None
    }

    # Load Evidence Registry
    ev_file = phase_6b_dir / "evidence_registry.json"
    ok, ev_data, err = load_json(ev_file)
    valid_evidence_ids: Set[str] = set()
    if ok and isinstance(ev_data, dict) and "evidence" in ev_data:
        ev_items = ev_data["evidence"]
        ev_valid = True
        for e in ev_items:
            if not e.get("evidence_id") or not e.get("source") or not e.get("reliability"):
                ev_valid = False
                errors.append(f"AC-6B.9: Malformed evidence item: {e}")
            else:
                valid_evidence_ids.add(e["evidence_id"])
        if ev_valid and len(valid_evidence_ids) >= 3:
            passed_criteria.append("AC-6B.9: Evidence Registry Integrity")
        else:
            failed_criteria.append("AC-6B.9: Evidence Registry Integrity")
    else:
        failed_criteria.append(f"AC-6B.9: Evidence Registry missing or malformed ({err})")

    # 1. AC-6B.1: Priority Stop Queue
    q_file = phase_6b_dir / "priority_stop_queue.json"
    ok, q_data, err = load_json(q_file)
    if ok and isinstance(q_data, dict) and "queue" in q_data:
        queue = q_data["queue"]
        q_names = {item.get("canonical_stop_name", "").upper().strip() for item in queue}
        q_ok = True

        if len(queue) != len(canonical_stop_names):
            q_ok = False
            errors.append(f"AC-6B.1: Queue stop count mismatch (expected {len(canonical_stop_names)}, got {len(queue)})")

        if q_names != canonical_stop_names:
            q_ok = False
            errors.append("AC-6B.1: Queue canonical stop names do not match baseline")

        # Check sorting
        scores = [item.get("priority_score", 0) for item in queue]
        if scores != sorted(scores, reverse=True):
            q_ok = False
            errors.append("AC-6B.1: Priority queue is not sorted descending by score")

        for item in queue:
            if item.get("priority_score", -1) < 0 or not item.get("reason_for_priority"):
                q_ok = False
                errors.append(f"AC-6B.1: Invalid queue record: {item.get('canonical_stop_name')}")
                break

        if q_ok:
            passed_criteria.append("AC-6B.1: Priority Stop Queue Completeness & Determinism")
        else:
            failed_criteria.append("AC-6B.1: Priority Stop Queue Completeness & Determinism")
    else:
        failed_criteria.append(f"AC-6B.1: Priority Stop Queue missing ({err})")

    # 2. AC-6B.2: Stop Alias Registry
    a_file = phase_6b_dir / "stop_alias_registry.json"
    ok, a_data, err = load_json(a_file)
    if ok and isinstance(a_data, dict) and "aliases" in a_data:
        aliases = a_data["aliases"]
        a_names = {item.get("canonical_stop_name", "").upper().strip() for item in aliases}
        a_ok = True

        if len(aliases) != len(canonical_stop_names):
            a_ok = False
            errors.append(f"AC-6B.2: Alias count mismatch (expected {len(canonical_stop_names)}, got {len(aliases)})")

        if a_names != canonical_stop_names:
            a_ok = False
            errors.append("AC-6B.2: Alias registry canonical names do not match baseline")

        for item in aliases:
            if (
                "verified_aliases" not in item
                or "candidate_aliases" not in item
                or "rejected_aliases" not in item
                or not item.get("normalized_spelling")
            ):
                a_ok = False
                errors.append(f"AC-6B.2: Malformed alias item: {item.get('canonical_stop_name')}")
                break

        if a_ok:
            passed_criteria.append("AC-6B.2: Alias Registry 1-to-1 Mapping & Integrity")
        else:
            failed_criteria.append("AC-6B.2: Alias Registry 1-to-1 Mapping & Integrity")
    else:
        failed_criteria.append(f"AC-6B.2: Stop Alias Registry missing ({err})")

    # 3. AC-6B.3, AC-6B.4, AC-6B.5, AC-6B.6, AC-6B.7: Hub Resolutions
    h_file = phase_6b_dir / "hub_resolutions.json"
    ok, h_data, err = load_json(h_file)
    if ok and isinstance(h_data, dict) and "resolutions" in h_data:
        resolutions = h_data["resolutions"]
        h_ok = True
        bounds_ok = True
        prov_ok = True
        no_overwrite_ok = True
        ambiguity_ok = True

        if len(resolutions) < 100:
            h_ok = False
            errors.append(f"AC-6B.3: Insufficient hub research depth (got {len(resolutions)}, expected >= 100)")

        for res in resolutions:
            c_name = res.get("canonical_stop_name", "").upper().strip()
            status = res.get("status")
            conf = res.get("confidence")
            lat = res.get("proposed_latitude")
            lon = res.get("proposed_longitude")
            prov = res.get("coordinate_provenance")
            ev_list = res.get("evidence_ids", [])

            # Status and confidence check
            if status not in VALID_STATUSES or conf not in VALID_CONFIDENCES:
                h_ok = False
                errors.append(f"AC-6B.3: Invalid status/confidence at stop {c_name}: {status}/{conf}")

            # Evidence ID validity check
            for ev in ev_list:
                if ev not in valid_evidence_ids:
                    h_ok = False
                    errors.append(f"AC-6B.3: Unknown evidence ID '{ev}' at stop {c_name}")

            # Bounds & Coordinate check
            if status == "VERIFIED":
                if lat is None or lon is None:
                    bounds_ok = False
                    errors.append(f"AC-6B.4: VERIFIED stop {c_name} missing coordinates")
                else:
                    if not (ODISHA_BOUNDS["min_lat"] <= lat <= ODISHA_BOUNDS["max_lat"] and ODISHA_BOUNDS["min_lon"] <= lon <= ODISHA_BOUNDS["max_lon"]):
                        bounds_ok = False
                        errors.append(f"AC-6B.4: Out of Odisha bounds coordinates at stop {c_name}: ({lat}, {lon})")

                # Provenance check
                if prov not in VALID_PROVENANCES:
                    prov_ok = False
                    errors.append(f"AC-6B.5: Invalid provenance '{prov}' for VERIFIED stop {c_name}")

                # Generic Ambiguity check
                if c_name in GENERIC_AMBIGUOUS_NAMES and not res.get("locality"):
                    ambiguity_ok = False
                    errors.append(f"AC-6B.7: Generic ambiguous stop {c_name} marked VERIFIED without locality context")

            elif status in ("UNRESOLVED", "AMBIGUOUS"):
                if lat is not None or lon is not None:
                    bounds_ok = False
                    errors.append(f"AC-6B.4: UNRESOLVED/AMBIGUOUS stop {c_name} has unexpected coordinates")
                if prov is not None:
                    prov_ok = False
                    errors.append(f"AC-6B.5: UNRESOLVED/AMBIGUOUS stop {c_name} has non-null provenance '{prov}'")

            # Check baseline overwrite safety
            if c_name in baseline_coords:
                b_lat, b_lon = baseline_coords[c_name]
                if lat is not None and lon is not None:
                    if round(lat, 4) != round(b_lat, 4) or round(lon, 4) != round(b_lon, 4):
                        no_overwrite_ok = False
                        errors.append(f"AC-6B.6: Baseline coordinate mutated at stop {c_name} (baseline: {b_lat},{b_lon}, proposed: {lat},{lon})")

        # Record gate evaluations
        if h_ok:
            passed_criteria.append("AC-6B.3: Hub Resolutions Schema & Status Constraints")
        else:
            failed_criteria.append("AC-6B.3: Hub Resolutions Schema & Status Constraints")

        if bounds_ok:
            passed_criteria.append("AC-6B.4: Spatial Bounding Box Enforcement")
        else:
            failed_criteria.append("AC-6B.4: Spatial Bounding Box Enforcement")

        if prov_ok:
            passed_criteria.append("AC-6B.5: Coordinate Provenance Consistency")
        else:
            failed_criteria.append("AC-6B.5: Coordinate Provenance Consistency")

        if no_overwrite_ok:
            passed_criteria.append("AC-6B.6: Zero Baseline Overwrite / Mutation")
        else:
            failed_criteria.append("AC-6B.6: Zero Baseline Overwrite / Mutation")

        if ambiguity_ok:
            passed_criteria.append("AC-6B.7: Generic Name Ambiguity Enforcement")
        else:
            failed_criteria.append("AC-6B.7: Generic Name Ambiguity Enforcement")

    else:
        failed_criteria.extend([
            "AC-6B.3: Hub Resolutions missing",
            "AC-6B.4: Spatial Bounding Box missing",
            "AC-6B.5: Coordinate Provenance missing",
            "AC-6B.6: Zero Baseline Overwrite missing",
            "AC-6B.7: Generic Ambiguity missing",
        ])

    # 4. AC-6B.8: Route Impact Analysis
    imp_file = phase_6b_dir / "route_impact_analysis.json"
    ok, imp_data, err = load_json(imp_file)
    if ok and isinstance(imp_data, dict) and "routes" in imp_data:
        routes_impact = imp_data["routes"]
        imp_ok = True

        if len(routes_impact) != len(canonical_route_numbers):
            imp_ok = False
            errors.append(f"AC-6B.8: Route count mismatch in impact analysis (expected {len(canonical_route_numbers)}, got {len(routes_impact)})")

        for r_eval in routes_impact:
            rn = r_eval.get("route_number")
            if rn not in canonical_route_numbers:
                imp_ok = False
                errors.append(f"AC-6B.8: Unknown route number in impact analysis: {rn}")
            b_status = r_eval.get("baseline", {}).get("geometry_status")
            p_status = r_eval.get("phase_6b_proposed", {}).get("geometry_status")
            if b_status not in VALID_GEOMETRY_STATUSES or p_status not in VALID_GEOMETRY_STATUSES:
                imp_ok = False
                errors.append(f"AC-6B.8: Invalid geometry status in route {rn}: {b_status} -> {p_status}")

        if imp_ok:
            passed_criteria.append("AC-6B.8: Route Impact Analysis Completeness & Integrity")
        else:
            failed_criteria.append("AC-6B.8: Route Impact Analysis Completeness & Integrity")
    else:
        failed_criteria.append(f"AC-6B.8: Route Impact Analysis missing ({err})")

    # 5. AC-6B.10: Zero Forbidden Geometry Payloads
    forbidden_keys_found = []
    for f_path in [q_file, a_file, h_file, imp_file, ev_file]:
        if f_path.exists():
            with open(f_path, "r", encoding="utf-8") as f:
                content = f.read().lower()
                for fk in FORBIDDEN_GEOMETRY_KEYS:
                    if f'"{fk}"' in content:
                        forbidden_keys_found.append(f"{f_path.name}: {fk}")

    if not forbidden_keys_found:
        passed_criteria.append("AC-6B.10: Zero Forbidden Geometry Payloads & Contamination")
    else:
        failed_criteria.append(f"AC-6B.10: Forbidden geometry keys detected: {forbidden_keys_found}")

    all_passed = len(failed_criteria) == 0 and len(passed_criteria) == 10
    return all_passed, passed_criteria, failed_criteria, errors


def main():
    if len(sys.argv) > 1:
        target_dir = Path(sys.argv[1]).resolve()
    else:
        target_dir = PHASE_6B_DIR

    extraction_dir = EXTRACTION_DIR

    print(f"Running Phase 6B Validator on: {target_dir}")
    all_passed, passed, failed, errors = verify_phase_6b(target_dir, extraction_dir)

    print("\n==================================================")
    if all_passed:
        print("=== PHASE 6B RESEARCH VALIDATION GATE: PASSED ===")
    else:
        print("=== PHASE 6B RESEARCH VALIDATION GATE: FAILED ===")
    print("==================================================")
    print(f"Passed Criteria: {len(passed)} / 10 ({', '.join([p.split(':')[0] for p in passed])})")
    print(f"Failed Criteria: {len(failed)} / 10 ({', '.join([f.split(':')[0] for f in failed]) if failed else 'None'})")

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
