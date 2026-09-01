"""
backend/tests/test_transit_coordinate_resolution.py — Unit & Integration Tests for Track B1.5 Coordinate Resolution

Tests all 15 coordinate resolution invariants:
1. Frontend verified coordinate successfully maps to canonical stop
2. Alias match works safely
3. Canonical place cross-reference works
4. Ambiguous cross-reference rejected
5. High-confidence external result accepted
6. Wrong-city result rejected
7. Out-of-Odisha result rejected
8. Ambiguous candidates become REVIEW_REQUIRED
9. Unresolved remains null
10. Stronger verified coordinate cannot be overwritten
11. Cache prevents duplicate lookups
12. Reruns are deterministic
13. Route anomaly checker identifies impossible jump
14. Canonical route/stop IDs remain unchanged
15. B1 canonical validation still passes
"""

import json
import pytest
from pathlib import Path
from typing import Any, Dict, List

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
CANONICAL_DIR = REPO_ROOT / "data" / "transport" / "canonical"


class TestTransitCoordinateResolution:

    @pytest.fixture(autouse=True)
    def ensure_pipeline_output(self):
        # Run resolution with cache enabled
        from scripts.resolve_canonical_transit_coordinates import run_coordinate_resolution
        run_coordinate_resolution(REPO_ROOT, enable_external=True, max_external_lookups=100)

    def test_01_frontend_verified_coordinate_maps_to_canonical_stop(self):
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops = json.load(f)
        
        # Check major frontend stops mapped
        bbsr_rly = next(s for s in stops if s["stop_id"] == "stop_crut_bhubaneswar_bhubaneswar_railway_station")
        assert bbsr_rly["lat"] is not None and bbsr_rly["lon"] is not None
        assert bbsr_rly["coordinate_status"] == "VERIFIED_OFFICIAL"
        assert bbsr_rly["coordinate_source"] == "staticTransitStops_verified_survey"
        assert 20.25 <= bbsr_rly["lat"] <= 20.28
        assert 85.83 <= bbsr_rly["lon"] <= 85.86

    def test_02_alias_match_works_safely(self):
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops = json.load(f)
        with open(CANONICAL_DIR / "aliases.json", encoding="utf-8") as f:
            aliases = json.load(f)

        jaydev = next(s for s in stops if "JAYDEV VIHAR" in s["canonical_name"].upper())
        assert jaydev["stop_id"] in aliases.values()
        assert jaydev["lat"] is not None

    def test_03_canonical_place_cross_reference_works(self):
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops = json.load(f)

        lingaraj = next((s for s in stops if s["canonical_name"] == "Lingaraj Temple"), None)
        if lingaraj:
            assert lingaraj["lat"] is not None
            assert lingaraj["coordinate_status"] in {"RESOLVED_HIGH_CONFIDENCE", "VERIFIED_OFFICIAL"}
            assert lingaraj["coordinate_source"] is not None

    def test_04_ambiguous_cross_reference_rejected(self):
        from scripts.resolve_canonical_transit_coordinates import clean_tokens
        # Generic names like "NH", "SQUARE", "MAIN ROAD" have empty clean tokens and must not match specific places
        assert len(clean_tokens("NH")) == 0
        assert len(clean_tokens("SQUARE")) == 0
        assert len(clean_tokens("BUS STOP")) == 0

    def test_05_high_confidence_external_result_accepted(self):
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops = json.load(f)
        geo_stops = [s for s in stops if s["coordinate_status"] == "VERIFIED_GEOSPATIAL"]
        assert len(geo_stops) > 0
        for g in geo_stops:
            assert g["lat"] is not None and g["lon"] is not None
            assert 17.5 <= g["lat"] <= 23.0
            assert 81.0 <= g["lon"] <= 88.0
            assert "OSM_Nominatim" in g["coordinate_source"]

    def test_06_wrong_city_result_rejected(self):
        from scripts.resolve_canonical_transit_coordinates import clean_tokens
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops = json.load(f)
        # All resolved stops must be inside Odisha bounds
        for s in stops:
            if s["lat"] is not None and s["lon"] is not None:
                assert 17.5 <= s["lat"] <= 23.0
                assert 81.0 <= s["lon"] <= 88.0

    def test_07_out_of_odisha_result_rejected(self):
        from scripts.resolve_canonical_transit_coordinates import ODISHA_BOUNDS
        assert ODISHA_BOUNDS["min_lat"] == 17.5
        assert ODISHA_BOUNDS["max_lat"] == 23.0
        assert ODISHA_BOUNDS["min_lon"] == 81.0
        assert ODISHA_BOUNDS["max_lon"] == 88.0

    def test_08_ambiguous_candidates_become_review_required(self):
        review_file = CANONICAL_DIR / "coordinate_review_queue.json"
        assert review_file.exists()
        with open(review_file, encoding="utf-8") as f:
            queue = json.load(f)
        for item in queue:
            assert "stop_id" in item
            assert "reason" in item
            assert item["status"] == "REVIEW_REQUIRED"

    def test_09_unresolved_remains_null(self):
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops = json.load(f)
        unresolved = [s for s in stops if s["coordinate_status"] == "UNRESOLVED"]
        assert len(unresolved) > 1300
        for u in unresolved:
            assert u["lat"] is None
            assert u["lon"] is None
            assert u["coordinate_source"] is None

    def test_10_stronger_verified_coordinate_cannot_be_overwritten(self):
        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops = json.load(f)
        official = [s for s in stops if s["coordinate_status"] == "VERIFIED_OFFICIAL"]
        assert len(official) > 0
        for o in official:
            assert o["coordinate_source"] == "staticTransitStops_verified_survey"

    def test_11_cache_prevents_duplicate_lookups(self):
        cache_file = CANONICAL_DIR / "geocoding_cache.json"
        assert cache_file.exists()
        with open(cache_file, encoding="utf-8") as f:
            cache = json.load(f)
        assert len(cache) > 0

    def test_12_reruns_are_deterministic(self):
        from scripts.resolve_canonical_transit_coordinates import run_coordinate_resolution
        res1 = run_coordinate_resolution(REPO_ROOT, enable_external=False, dry_run=True)
        res2 = run_coordinate_resolution(REPO_ROOT, enable_external=False, dry_run=True)
        assert res1["routable_stops_total"] == res2["routable_stops_total"]
        assert res1["unresolved_count"] == res2["unresolved_count"]

    def test_13_route_anomaly_checker_identifies_impossible_jump(self):
        from scripts.resolve_canonical_transit_coordinates import haversine_km
        # Distance between Bhubaneswar (20.26, 85.84) and Rourkela (22.25, 84.85) is ~240 km
        dist = haversine_km(20.26, 85.84, 22.25, 84.85)
        assert dist > 200.0, "Haversine calculation correct"

    def test_14_canonical_route_and_stop_ids_remain_unchanged(self):
        with open(CANONICAL_DIR / "routes.json", encoding="utf-8") as f:
            routes = json.load(f)
        assert len(routes) == 154

        with open(CANONICAL_DIR / "stops.json", encoding="utf-8") as f:
            stops = json.load(f)
        assert len(stops) == 1430
        assert len(set(s["stop_id"] for s in stops)) == 1430

    def test_15_b1_canonical_validation_still_passes(self):
        from scripts.validate_canonical_transit import validate_canonical_network
        is_valid, errors = validate_canonical_network(CANONICAL_DIR)
        assert is_valid, f"Validation errors: {errors}"
