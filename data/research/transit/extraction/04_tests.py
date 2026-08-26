#!/usr/bin/env python3
"""
O-TRAVELZ Transit Data Ingestion — Phase 16: Tests
====================================================
Validates extracted transit data for:
  - No route without provenance
  - No stop without provenance
  - No duplicate canonical IDs
  - Route-stop relationships reference valid routes/stops
  - Sequence values are valid
  - Schedule records reference valid routes
  - Unresolved data is explicitly marked
  - No fabricated coordinates
  - Document provenance is preserved
"""

import json
import re
import sys
from pathlib import Path
from collections import defaultdict, Counter
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent

def load_json(filename: str):
    filepath = SCRIPT_DIR / filename
    if filepath.exists():
        with open(filepath, encoding="utf-8") as f:
            return json.load(f)
    return []


class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []

    def assert_true(self, condition: bool, message: str):
        if condition:
            self.passed += 1
        else:
            self.failed += 1
            self.errors.append(f"FAIL: {message}")
            print(f"  [FAIL] {message}")

    def assert_equal(self, actual: Any, expected: Any, message: str):
        if actual == expected:
            self.passed += 1
        else:
            self.failed += 1
            self.errors.append(f"FAIL: {message} (expected={expected}, actual={actual})")
            print(f"  [FAIL] {message} (expected={expected}, actual={actual})")

    def assert_greater(self, actual: Any, threshold: Any, message: str):
        if actual > threshold:
            self.passed += 1
        else:
            self.failed += 1
            self.errors.append(f"FAIL: {message} (got {actual}, need > {threshold})")
            print(f"  [FAIL] {message} (got {actual}, need > {threshold})")

    def print_summary(self):
        print(f"\n{'='*60}")
        print(f"TEST RESULTS: {self.passed} passed, {self.failed} failed")
        print(f"{'='*60}")
        if self.errors:
            print("\nFailed tests:")
            for e in self.errors:
                print(f"  {e}")


def main():
    print("=" * 60)
    print("O-TRAVELZ Transit Data Ingestion — Phase 16: Tests")
    print("=" * 60)

    routes = load_json("routes_extracted.json")
    stops = load_json("stops_extracted.json")
    route_stops = load_json("route_stops_extracted.json")
    schedules = load_json("schedules_extracted.json")
    fares = load_json("fares_extracted.json")
    inventory = load_json("transit_document_inventory.json")
    conflicts = load_json("conflicts.json")
    unresolved = load_json("unresolved.json")

    t = TestResults()

    # ─── T1: Data exists ─────────────────────────────────────────
    print("\n--- T1: Data Existence ---")
    t.assert_greater(len(routes), 0, "Routes extracted")
    t.assert_greater(len(stops), 0, "Stops extracted")
    t.assert_greater(len(route_stops), 0, "Route-stop relationships extracted")
    t.assert_greater(len(schedules), 0, "Schedules extracted")
    t.assert_true(isinstance(inventory, dict), "Inventory is a dict")
    t.assert_greater(len(inventory.get("documents", [])), 0, "Inventory contains documents")

    # ─── T2: No route without provenance ─────────────────────────
    print("\n--- T2: Route Provenance ---")
    routes_without_source = [r for r in routes if not r.get("source_document")]
    t.assert_equal(len(routes_without_source), 0, "All routes have source_document")

    routes_without_operator = [r for r in routes if not r.get("operator")]
    t.assert_equal(len(routes_without_operator), 0, "All routes have operator")

    routes_without_number = [r for r in routes if not r.get("route_number")]
    t.assert_equal(len(routes_without_number), 0, "All routes have route_number")

    routes_without_verification = [r for r in routes if not r.get("verification_status")]
    t.assert_equal(len(routes_without_verification), 0, "All routes have verification_status")

    # ─── T3: No stop without provenance ──────────────────────────
    print("\n--- T3: Stop Provenance ---")
    stops_without_source = [s for s in stops if not s.get("source_document")]
    t.assert_equal(len(stops_without_source), 0, "All stops have source_document")

    stops_without_name = [s for s in stops if not s.get("canonical_name")]
    t.assert_equal(len(stops_without_name), 0, "All stops have canonical_name")

    stops_without_verification = [s for s in stops if not s.get("verification_status")]
    t.assert_equal(len(stops_without_verification), 0, "All stops have verification_status")

    # ─── T4: No duplicate canonical IDs ──────────────────────────
    print("\n--- T4: No Duplicate Canonical Names ---")
    canonical_names = [s["canonical_name"] for s in stops]
    name_counts = Counter(canonical_names)
    duplicates = {name: count for name, count in name_counts.items() if count > 1}
    t.assert_equal(len(duplicates), 0, f"No duplicate canonical stop names (found {len(duplicates)} duplicates)")
    if duplicates:
        for name, count in list(duplicates.items())[:5]:
            print(f"    Duplicate: '{name}' appears {count} times")

    # ─── T5: Route-stop relationships reference valid data ───────
    print("\n--- T5: Route-Stop Relationship Integrity ---")
    route_numbers = {r["route_number"] for r in routes}
    stop_names = {s["canonical_name"] for s in stops}

    invalid_route_refs = [rs for rs in route_stops if rs["route_number"] not in route_numbers]
    t.assert_equal(len(invalid_route_refs), 0,
                   f"All route-stop route_numbers reference valid routes (invalid: {len(invalid_route_refs)})")

    invalid_stop_refs = [rs for rs in route_stops if rs["stop_name"] not in stop_names]
    t.assert_equal(len(invalid_stop_refs), 0,
                   f"All route-stop stop_names reference valid stops (invalid: {len(invalid_stop_refs)})")

    # ─── T6: Sequence values are valid ───────────────────────────
    print("\n--- T6: Sequence Values ---")
    for rs in route_stops:
        if rs.get("sequence_order") is not None:
            t.assert_greater(rs["sequence_order"], 0,
                           f"Route {rs['route_number']} stop {rs['stop_name']} has positive sequence")

    # Check for sequence gaps within a route
    route_sequences = {}
    for rs in route_stops:
        key = (rs["route_number"], rs.get("direction", "forward"))
        if key not in route_sequences:
            route_sequences[key] = []
        route_sequences[key].append(rs["sequence_order"])

    for key, seqs in route_sequences.items():
        sorted_seqs = sorted(seqs)
        expected = list(range(1, len(sorted_seqs) + 1))
        t.assert_true(sorted_seqs == expected,
                     f"Route {key[0]} ({key[1]}) has contiguous sequence (got {sorted_seqs[:5]}...)")

    # ─── T7: Schedule records reference valid routes ─────────────
    print("\n--- T7: Schedule Route References ---")
    schedule_route_nums = {s["route_number"] for s in schedules}
    invalid_schedule_routes = schedule_route_nums - route_numbers
    t.assert_equal(len(invalid_schedule_routes), 0,
                   f"All schedule route numbers reference valid routes (invalid: {invalid_schedule_routes})")

    # ─── T8: Schedule data validity ──────────────────────────────
    print("\n--- T8: Schedule Data Validity ---")
    for s in schedules:
        t.assert_greater(len(s.get("departure_times", [])), 0,
                        f"Route {s['route_number']} has departure times")
        t.assert_true(s.get("source_document") is not None,
                     f"Route {s['route_number']} schedule has source_document")
        t.assert_true(s.get("source_page") is not None,
                     f"Route {s['route_number']} schedule has source_page")

    # Validate time format
    import re
    time_pattern = re.compile(r'^\d{1,2}:\d{2}$')
    invalid_times = []
    for s in schedules:
        for time_val in s.get("departure_times", []):
            if not time_pattern.match(time_val):
                invalid_times.append((s["route_number"], time_val))
    t.assert_equal(len(invalid_times), 0,
                   f"All departure times are valid HH:MM format (invalid: {len(invalid_times)})")
    if invalid_times:
        for rt, tv in invalid_times[:5]:
            print(f"    Invalid time: Route {rt}: '{tv}'")

    # ─── T9: No fabricated coordinates ───────────────────────────
    print("\n--- T9: No Fabricated Coordinates ---")
    stops_with_coords = [s for s in stops
                        if s.get("coordinate_status") not in ("unresolved", None)]
    official_coords = [s for s in stops_with_coords
                      if s.get("coordinate_status") == "official"]
    t.assert_equal(len(official_coords), 0,
                   "No stops claim 'official' coordinates (none are in the PDFs)")

    # ─── T10: Document provenance preserved ──────────────────────
    print("\n--- T10: Document Provenance ---")
    all_source_docs = set()
    for r in routes:
        if r.get("source_document"):
            all_source_docs.add(r["source_document"])
    for s in stops:
        if s.get("source_document"):
            all_source_docs.add(s["source_document"])
    for sc in schedules:
        if sc.get("source_document"):
            all_source_docs.add(sc["source_document"])

    inventory_docs = {d["filename"] for d in inventory.get("documents", [])}
    orphan_sources = all_source_docs - inventory_docs
    t.assert_equal(len(orphan_sources), 0,
                   f"All source_documents exist in inventory (orphans: {orphan_sources})")

    # ─── T11: Unresolved data explicitly marked ──────────────────
    print("\n--- T11: Unresolved Data Marking ---")
    t.assert_true(isinstance(unresolved, dict), "Unresolved data file exists and is a dict")
    if isinstance(unresolved, dict):
        t.assert_true("mobus_network_map_not_extracted" in unresolved,
                      "Mo Bus network map marked as unresolved")
        t.assert_true("routes_without_schedules" in unresolved,
                      "Routes without schedules are tracked")
        t.assert_true("routes_without_stop_sequences" in unresolved,
                      "Routes without stop sequences are tracked")

    # ─── T12: Route numbers are unique within a region ───────────
    print("\n--- T12: Route Number Uniqueness ---")
    region_route_pairs = [(r["service_area"], r["route_number"]) for r in routes]
    pair_counts = Counter(region_route_pairs)
    duplicated_pairs = {pair: count for pair, count in pair_counts.items() if count > 1}
    t.assert_equal(len(duplicated_pairs), 0,
                   f"Route numbers are unique per region (duplicates: {len(duplicated_pairs)})")
    if duplicated_pairs:
        for pair, count in list(duplicated_pairs.items())[:5]:
            print(f"    Duplicate: {pair[0]}/{pair[1]} appears {count} times")

    # ─── Summary ─────────────────────────────────────────────────
    t.print_summary()

    return t.passed, t.failed


if __name__ == "__main__":
    passed, failed = main()
    sys.exit(0 if failed == 0 else 1)
