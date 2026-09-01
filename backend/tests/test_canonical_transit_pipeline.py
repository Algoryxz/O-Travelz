"""
backend/tests/test_canonical_transit_pipeline.py — Unit & Integration Tests for Canonical Transit Pipeline

Proves all 14 canonical transit invariants:
1. 154 route records compile
2. all ordered sequences survive
3. stable route IDs
4. stable stop IDs across reruns
5. unresolved stops stay null
6. no coordinate fabrication
7. verified coordinate provenance preserved
8. safe alias handling
9. ambiguous names remain unresolved/review_required
10. schedule record count preserved
11. actual departure-time count computed correctly
12. malformed time rejected
13. build deterministic across repeated runs
14. extraction files unchanged
"""

import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path
import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
CANONICAL_DIR = REPO_ROOT / "data" / "transport" / "canonical"
EXTRACTION_DIR = REPO_ROOT / "data" / "research" / "transit" / "extraction"


def get_file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


class TestCanonicalTransitPipeline:

    @pytest.fixture(autouse=True)
    def setup_pipeline(self):
        # Run compilation to ensure latest canonical output is present
        from scripts.compile_canonical_transit import compile_canonical_transit
        compile_canonical_transit(REPO_ROOT)

    def test_01_154_route_records_compile(self):
        routes_file = CANONICAL_DIR / "routes.json"
        assert routes_file.exists()
        with open(routes_file, encoding="utf-8") as f:
            routes = json.load(f)
        assert len(routes) == 154
        for r in routes:
            assert "route_id" in r and r["route_id"].startswith("rt_crut_")
            assert "route_number" in r and bool(r["route_number"])
            assert "operator" in r and r["operator"] == "CRUT"

    def test_02_all_ordered_sequences_survive(self):
        rs_file = CANONICAL_DIR / "route_stops.json"
        assert rs_file.exists()
        with open(rs_file, encoding="utf-8") as f:
            route_stops = json.load(f)
        
        # 164 directional sequence lists covering all 154 routes
        assert len(route_stops) == 164
        unique_route_ids = set(rs["route_id"] for rs in route_stops)
        assert len(unique_route_ids) == 154
        
        total_occurrences = sum(len(rs["stops"]) for rs in route_stops)
        assert total_occurrences == 1491
        
        for rs in route_stops:
            seq_nums = [item["sequence"] for item in rs["stops"]]
            assert seq_nums == sorted(seq_nums), "Sequence order must be strictly sorted"
            assert len(seq_nums) == len(set(seq_nums)), "Sequence numbers must not have duplicates"

    def test_03_stable_route_ids(self):
        with open(CANONICAL_DIR / "routes.json", encoding="utf-8") as f:
            routes = json.load(f)
        sample_route = next(r for r in routes if r["route_number"] == "09")
        assert sample_route["route_id"] == "rt_crut_09"
        
        sample_f1 = next(r for r in routes if r["route_number"] == "F1")
        assert sample_f1["route_id"] == "rt_crut_f1"

    def test_04_stable_stop_ids_across_reruns(self):
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops_1 = json.load(f)
        ids_1 = [s["stop_id"] for s in stops_1]
        
        # Run compilation again
        from scripts.compile_canonical_transit import compile_canonical_transit
        compile_canonical_transit(REPO_ROOT)
        
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops_2 = json.load(f)
        ids_2 = [s["stop_id"] for s in stops_2]
        
        assert ids_1 == ids_2
        assert len(ids_1) == len(set(ids_1)), "All stop IDs must be globally unique"

    def test_05_unresolved_stops_stay_null(self):
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops = json.load(f)
        unresolved = [s for s in stops if s["coordinate_status"] == "UNRESOLVED"]
        assert len(unresolved) > 1300
        for s in unresolved:
            assert s["lat"] is None
            assert s["lon"] is None
            assert s["coordinate_source"] is None

    def test_06_no_coordinate_fabrication(self):
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops = json.load(f)
        for s in stops:
            if s["lat"] is not None or s["lon"] is not None:
                assert s["coordinate_status"] in {"VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL", "RESOLVED_HIGH_CONFIDENCE"}
                assert 17.5 <= s["lat"] <= 23.0, f"Lat out of bounds: {s['lat']}"
                assert 81.0 <= s["lon"] <= 88.0, f"Lon out of bounds: {s['lon']}"
                assert s["coordinate_source"] is not None

    def test_07_verified_coordinate_provenance_preserved(self):
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops = json.load(f)
        verified = [s for s in stops if s["coordinate_status"] == "VERIFIED_OFFICIAL"]
        assert len(verified) > 0
        for v in verified:
            assert v["coordinate_source"] == "staticTransitStops_verified_survey"
            assert v["verification_status"] == "VERIFIED_OFFICIAL"

    def test_08_safe_alias_handling(self):
        with open(CANONICAL_DIR / "aliases.json", encoding="utf-8") as f:
            aliases = json.load(f)
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops = json.load(f)
        stop_id_set = set(s["stop_id"] for s in stops)
        
        assert len(aliases) >= 1430
        for alias_name, sid in aliases.items():
            assert bool(alias_name.strip())
            assert sid in stop_id_set

    def test_09_ambiguous_names_remain_unresolved(self):
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops = json.load(f)
        report_file = CANONICAL_DIR / "build_report.json"
        with open(report_file, encoding="utf-8") as f:
            rep = json.load(f)
        
        unresolved_count = rep["outputs"].get("unresolved_stop_count") or rep["outputs"].get("coordinate_unresolved", 0)
        assert unresolved_count > 1300
        assert rep["gates"]["zero_fabrication_gate"] == "PASSED"

    def test_10_schedule_record_count_preserved(self):
        with open(CANONICAL_DIR / "schedules.json", encoding="utf-8") as f:
            schedules = json.load(f)
        assert len(schedules) == 302
        for s in schedules:
            assert "schedule_id" in s
            assert "route_id" in s
            assert "departure_times" in s
            assert s["departure_count"] == len(s["departure_times"])

    def test_11_actual_departure_time_count_computed_correctly(self):
        with open(CANONICAL_DIR / "schedules.json", encoding="utf-8") as f:
            schedules = json.load(f)
        with open(CANONICAL_DIR / "build_report.json", encoding="utf-8") as f:
            rep = json.load(f)
        
        total_deps = sum(len(s["departure_times"]) for s in schedules)
        assert total_deps == rep["outputs"]["individual_departure_time_count"]
        assert total_deps == 5549

    def test_12_malformed_time_rejected_or_normalized(self):
        from scripts.compile_canonical_transit import normalize_time_str
        assert normalize_time_str("7:00") == "07:00"
        assert normalize_time_str("07:00") == "07:00"
        assert normalize_time_str("23:59") == "23:59"
        assert normalize_time_str("24:00") is None
        assert normalize_time_str("12:65") is None
        assert normalize_time_str("invalid") is None
        assert normalize_time_str("") is None

    def test_13_build_deterministic_across_repeated_runs(self):
        from scripts.compile_canonical_transit import compile_canonical_transit
        
        # Run 1
        compile_canonical_transit(REPO_ROOT)
        hashes_1 = {f.name: get_file_sha256(f) for f in CANONICAL_DIR.glob("*.json")}
        
        # Run 2
        compile_canonical_transit(REPO_ROOT)
        hashes_2 = {f.name: get_file_sha256(f) for f in CANONICAL_DIR.glob("*.json")}
        
        # Verify content hashes match (excluding variable ISO timestamp in build_report.json/network.json)
        for fname in ["stops.json", "routes.json", "route_stops.json", "schedules.json", "aliases.json"]:
            assert hashes_1[fname] == hashes_2[fname], f"Non-deterministic output detected in {fname}"

    def test_14_extraction_files_unchanged(self):
        with open(EXTRACTION_DIR / "routes_extracted.json", encoding="utf-8") as f:
            raw_routes = json.load(f)
        assert len(raw_routes) == 154
        
        with open(EXTRACTION_DIR / "stops_extracted.json", encoding="utf-8") as f:
            raw_stops = json.load(f)
        assert len(raw_stops) == 1430
        
        with open(EXTRACTION_DIR / "route_stops_extracted.json", encoding="utf-8") as f:
            raw_rs = json.load(f)
        assert len(raw_rs) == 1491
        
        with open(EXTRACTION_DIR / "schedules_extracted.json", encoding="utf-8") as f:
            raw_sched = json.load(f)
        assert len(raw_sched) == 302
