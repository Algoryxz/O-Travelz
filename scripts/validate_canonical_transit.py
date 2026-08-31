#!/usr/bin/env python3
"""
scripts/validate_canonical_transit.py — Canonical Transit Network Integrity Validator

Validates the integrity, topology, schemas, coordinate bounds, and schedule semantics
of the canonical transit datasets in data/transport/canonical/.

Exit Codes:
- 0: All canonical datasets pass validation checks.
- 1: Validation failure or data integrity violation detected.
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

ODISHA_BOUNDS = {
    "min_lat": 17.5,
    "max_lat": 23.0,
    "min_lon": 81.0,
    "max_lon": 88.0,
}

TIME_HHMM_REGEX = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")


def validate_canonical_network(canonical_dir: Path) -> Tuple[bool, List[str]]:
    """Validate all files in data/transport/canonical/."""
    errors: List[str] = []
    
    stops_file = canonical_dir / "stops.json"
    routes_file = canonical_dir / "routes.json"
    route_stops_file = canonical_dir / "route_stops.json"
    schedules_file = canonical_dir / "schedules.json"
    aliases_file = canonical_dir / "aliases.json"
    build_report_file = canonical_dir / "build_report.json"
    
    for f in [stops_file, routes_file, route_stops_file, schedules_file, aliases_file, build_report_file]:
        if not f.exists():
            errors.append(f"Missing canonical file: {f.name}")
            return False, errors
            
    # Load files
    with open(stops_file, encoding="utf-8") as fh:
        stops: List[Dict[str, Any]] = json.load(fh)
    with open(routes_file, encoding="utf-8") as fh:
        routes: List[Dict[str, Any]] = json.load(fh)
    with open(route_stops_file, encoding="utf-8") as fh:
        route_stops: List[Dict[str, Any]] = json.load(fh)
    with open(schedules_file, encoding="utf-8") as fh:
        schedules: List[Dict[str, Any]] = json.load(fh)
    with open(aliases_file, encoding="utf-8") as fh:
        aliases: Dict[str, str] = json.load(fh)
    with open(build_report_file, encoding="utf-8") as fh:
        build_report: Dict[str, Any] = json.load(fh)
        
    # -------------------------------------------------------------
    # 1. VALIDATE STOPS
    # -------------------------------------------------------------
    stop_ids: Set[str] = set()
    for idx, s in enumerate(stops):
        sid = s.get("stop_id")
        if not sid:
            errors.append(f"Stop record {idx} missing 'stop_id'")
            continue
        if sid in stop_ids:
            errors.append(f"Duplicate stop_id detected: {sid}")
        stop_ids.add(sid)
        
        c_name = s.get("canonical_name")
        if not c_name or not str(c_name).strip():
            errors.append(f"Stop {sid} missing 'canonical_name'")
            
        lat = s.get("lat")
        lon = s.get("lon")
        c_status = s.get("coordinate_status")
        
        if c_status == "UNRESOLVED":
            if lat is not None or lon is not None:
                errors.append(f"Stop {sid} has status UNRESOLVED but contains non-null coordinates: lat={lat}, lon={lon}")
        if c_status in {"VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL", "RESOLVED_HIGH_CONFIDENCE"}:
            if lat is None or lon is None:
                errors.append(f"Stop {sid} has status {c_status} but coordinates are null")
            elif not s.get("coordinate_source"):
                errors.append(f"Stop {sid} has coordinates but missing 'coordinate_source'")
            else:
                if not (ODISHA_BOUNDS["min_lat"] <= lat <= ODISHA_BOUNDS["max_lat"] and
                        ODISHA_BOUNDS["min_lon"] <= lon <= ODISHA_BOUNDS["max_lon"]):
                    errors.append(f"Stop {sid} coordinates out of Odisha bounds: ({lat}, {lon})")
        elif c_status == "UNRESOLVED":
            if lat is not None or lon is not None:
                errors.append(f"Stop {sid} has status UNRESOLVED but contains non-null coordinates: lat={lat}, lon={lon}")
        else:
            errors.append(f"Stop {sid} has unrecognized coordinate_status: {c_status}")
            
    # -------------------------------------------------------------
    # 2. VALIDATE ROUTES
    # -------------------------------------------------------------
    route_ids: Set[str] = set()
    route_numbers: Set[str] = set()
    
    for idx, r in enumerate(routes):
        rid = r.get("route_id")
        rnum = str(r.get("route_number", "")).strip()
        
        if not rid:
            errors.append(f"Route record {idx} missing 'route_id'")
            continue
        if rid in route_ids:
            errors.append(f"Duplicate route_id detected: {rid}")
        route_ids.add(rid)
        
        if not rnum:
            errors.append(f"Route {rid} missing 'route_number'")
        elif rnum in route_numbers:
            errors.append(f"Duplicate route_number detected: {rnum}")
        route_numbers.add(rnum)
        
        if not r.get("operator"):
            errors.append(f"Route {rid} missing 'operator'")
            
    # -------------------------------------------------------------
    # 3. VALIDATE ROUTE STOPS (SEQUENCES)
    # -------------------------------------------------------------
    rs_route_ids: Set[str] = set()
    for rs in route_stops:
        rid = rs.get("route_id")
        if not rid:
            errors.append("Route stop sequence record missing 'route_id'")
            continue
        if rid not in route_ids:
            errors.append(f"Route stop sequence references unknown route_id: {rid}")
        rs_route_ids.add(rid)
        
        seq_list = rs.get("stops", [])
        seen_seq_nums: Set[int] = set()
        
        for item in seq_list:
            seq_num = item.get("sequence")
            if seq_num is None:
                errors.append(f"Route {rid} sequence item missing 'sequence' number")
            elif seq_num in seen_seq_nums:
                errors.append(f"Route {rid} contains duplicate sequence position: {seq_num}")
            seen_seq_nums.add(seq_num)
            
            sid = item.get("stop_id")
            if not sid:
                errors.append(f"Route {rid} sequence item at pos {seq_num} missing 'stop_id'")
            elif sid not in stop_ids and not sid.startswith("stop_crut_unresolved_"):
                errors.append(f"Route {rid} sequence item references unknown stop_id: {sid}")
                
    # -------------------------------------------------------------
    # 4. VALIDATE SCHEDULES
    # -------------------------------------------------------------
    total_validated_departures = 0
    for idx, sched in enumerate(schedules):
        sid = sched.get("schedule_id")
        rid = sched.get("route_id")
        
        if not sid:
            errors.append(f"Schedule record {idx} missing 'schedule_id'")
        if not rid:
            errors.append(f"Schedule record {idx} missing 'route_id'")
        elif rid not in route_ids:
            errors.append(f"Schedule {sid} references unknown route_id: {rid}")
            
        deps = sched.get("departure_times", [])
        total_validated_departures += len(deps)
        
        for t in deps:
            if not TIME_HHMM_REGEX.match(str(t)):
                errors.append(f"Schedule {sid} contains invalid HH:MM departure time: {t}")
                
        # Check ascending order
        if deps != sorted(deps):
            errors.append(f"Schedule {sid} departure times are not sorted in ascending order")
            
    # -------------------------------------------------------------
    # 5. VALIDATE ALIASES
    # -------------------------------------------------------------
    for alias_name, sid in aliases.items():
        if not alias_name:
            errors.append("Empty alias name detected")
        if sid not in stop_ids:
            errors.append(f"Alias '{alias_name}' points to non-existent stop_id '{sid}'")
            
    # -------------------------------------------------------------
    # 6. VALIDATE BUILD REPORT INTEGRITY
    # -------------------------------------------------------------
    rep_outputs = build_report.get("outputs", {})
    if rep_outputs.get("unique_routes") and rep_outputs.get("unique_routes") != len(routes):
        errors.append(f"Build report unique_routes ({rep_outputs.get('unique_routes')}) does not match routes.json count ({len(routes)})")

    rep_logical = rep_outputs.get("logical_canonical_stops") or rep_outputs.get("logical_stops_total")
    if rep_logical and rep_logical != len(stops):
        errors.append(f"Build report logical stops count ({rep_logical}) does not match stops.json count ({len(stops)})")

    if rep_outputs.get("schedule_records_count") and rep_outputs.get("schedule_records_count") != len(schedules):
        errors.append(f"Build report schedule_records_count ({rep_outputs.get('schedule_records_count')}) does not match schedules.json count ({len(schedules)})")
    if rep_outputs.get("individual_departure_time_count") and rep_outputs.get("individual_departure_time_count") != total_validated_departures:
        errors.append(f"Build report individual_departure_time_count ({rep_outputs.get('individual_departure_time_count')}) does not match departure count ({total_validated_departures})")
        
    return len(errors) == 0, errors


def main():
    parser = argparse.ArgumentParser(description="Validate canonical transit datasets.")
    parser.add_argument("--dir", type=str, default=None, help="Directory containing canonical transit JSON files.")
    args = parser.parse_args()
    
    repo_root = Path(__file__).resolve().parent.parent
    canonical_dir = Path(args.dir) if args.dir else repo_root / "data" / "transport" / "canonical"
    
    print(f"Validating canonical transit datasets in: {canonical_dir}")
    is_valid, errors = validate_canonical_network(canonical_dir)
    
    if is_valid:
        print("=" * 60)
        print(" [PASS] ALL CANONICAL TRANSIT VALIDATION CHECKS PASSED")
        print("=" * 60)
        sys.exit(0)
    else:
        print("=" * 60)
        print(f" [FAIL] {len(errors)} VALIDATION ERRORS DETECTED:")
        print("=" * 60)
        for e in errors[:25]:
            print(f"  - {e}")
        if len(errors) > 25:
            print(f"  ... and {len(errors) - 25} more errors.")
        sys.exit(1)


if __name__ == "__main__":
    main()
