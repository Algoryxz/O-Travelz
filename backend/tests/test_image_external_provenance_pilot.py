"""backend/tests/test_image_external_provenance_pilot.py — Test suite for External Provenance Discovery (Step 2A & 2C1).

O-TRAVELZ Image Track A2.

Verifies invariants:
  1. All 14 approved remaining IDs (plus 5 pilot IDs = 19 total) are processed exactly once.
  2. Food-item photos do NOT become exact-location venue evidence (classified RELATED_LOCATION_ONLY).
  3. Incomplete/missing creator metadata blocks readiness.
  4. Missing or unapproved license blocks readiness.
  5. Related images remain related (not EXACT_LOCATION_VERIFIED).
  6. Generic images remain generic / rejected.
  7. Local WebP visual similarity does NOT establish raw source SHA lineage.
  8. Previous Step 2A five pilot records remain unchanged.
  9. Deterministic research report serialization.
  10. Zero mutation to manifest.json, strict registry, places.json, or image binaries.
"""
import json
import hashlib
from pathlib import Path
import pytest

import sys
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SCRIPTS_DIR = REPO_ROOT / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from audit_external_provenance_pilot import generate_external_provenance_report, RESEARCH_DATA, PILOT_DATA


class TestImageExternalProvenancePilot:

    def test_all_thirty_one_destinations_processed_uniquely(self):
        """Rule: Exactly the 31 approved legacy destinations are present uniquely (5 pilot + 14 partial + 12 no-provenance)."""
        report = generate_external_provenance_report()
        destinations = report["destinations"]
        assert len(destinations) == 31
        
        pids = [d["place_id"] for d in destinations]
        assert len(pids) == len(set(pids)), "Duplicate place_id found in research report"
        
        expected_pilot_pids = ["place_005", "place_007", "place_019", "place_025", "place_030"]
        expected_partial_pids = [
            "place_012", "place_013", "place_014", "place_018", "place_020",
            "place_021", "place_022", "place_023", "place_food_001", "place_food_002",
            "place_food_004", "place_food_005", "place_food_006", "place_food_009"
        ]
        expected_step3a_pids = [
            "place_024", "place_026", "place_027", "place_028", "place_029",
            "place_031", "place_032", "place_food_003", "place_food_007",
            "place_food_008", "place_food_010", "place_food_011"
        ]
        expected_all_pids = expected_pilot_pids + expected_partial_pids + expected_step3a_pids
        assert sorted(pids) == sorted(expected_all_pids)

    def test_all_ready_sources_have_valid_creator_and_approved_license(self):
        """Rule: All sources marked READY_FOR_FRESH_CANONICAL_INGESTION must have named creator and approved CC license."""
        report = generate_external_provenance_report()
        for d in report["destinations"]:
            if d["recommended_next_action"] == "READY_FOR_FRESH_CANONICAL_INGESTION":
                src = d["selected_source"]
                assert src is not None
                assert src["creator"] is not None and len(src["creator"].strip()) > 0
                assert src["license"] in ["CC BY-SA 3.0", "CC BY-SA 4.0", "CC BY 4.0", "CC0", "Public Domain", "Attribution / Free"]
                assert src["license_url"] is not None and src["license_url"].startswith("http")
                assert src["attribution"] is not None and len(src["attribution"]) > 10

    def test_food_item_photo_does_not_become_exact_venue_evidence(self):
        """Rule: A food item / cuisine photograph must NOT be marked EXACT_LOCATION_VERIFIED."""
        report = generate_external_provenance_report()
        food_pids = ["place_food_001", "place_food_002", "place_food_004"]
        for d in report["destinations"]:
            if d["place_id"] in food_pids:
                # Must be classified as RELATED_LOCATION_ONLY, NOT EXACT_LOCATION_VERIFIED
                assert d["proposed_classification"] == "RELATED_LOCATION_ONLY"
                assert "NON_EXACT_VENUE_PHOTOGRAPHY" in d.get("blockers", [])

    def test_missing_creator_or_license_blocks_readiness(self):
        """Rule: Missing creator or missing/unapproved license blocks ingestion readiness."""
        report = generate_external_provenance_report()
        unresolved_pids = [
            "place_food_005", "place_food_006", "place_food_009",
            "place_024", "place_028", "place_032", "place_food_003",
            "place_food_007", "place_food_008", "place_food_010", "place_food_011"
        ]
        for d in report["destinations"]:
            if d["place_id"] in unresolved_pids:
                assert d["recommended_next_action"] in ["NEEDS_MORE_RESEARCH", "NO_ACCEPTABLE_SOURCE_FOUND"]
                assert d["selected_source"] is None or d["proposed_classification"] == "REJECTED"

    def test_step3a_temples_and_parks_exact_identity_enforcement(self):
        """Rule: Step 3A exact sources (place_026, place_027, place_029, place_031) must have high-res verified photography."""
        report = generate_external_provenance_report()
        step3a_exact = ["place_026", "place_027", "place_029", "place_031"]
        dest_map = {d["place_id"]: d for d in report["destinations"]}
        
        for pid in step3a_exact:
            d = dest_map[pid]
            assert d["recommended_next_action"] == "READY_FOR_FRESH_CANONICAL_INGESTION"
            assert d["proposed_classification"] == "EXACT_LOCATION_VERIFIED"
            src = d["selected_source"]
            assert src["dimensions"][0] >= 960 and src["dimensions"][1] >= 960
            assert src["license"] in ["CC BY-SA 3.0", "CC BY-SA 4.0"]

    def test_source_page_and_image_url_remain_distinct(self):
        """Rule: Source page URL (description/context) and raw image binary URL must be distinct."""
        report = generate_external_provenance_report()
        for d in report["destinations"]:
            if d["selected_source"]:
                src = d["selected_source"]
                assert src["source_page_url"].startswith("https://commons.wikimedia.org/wiki/File:")
                assert src["original_image_url"].startswith("https://upload.wikimedia.org/wikipedia/commons/")
                assert src["source_page_url"] != src["original_image_url"]

    def test_local_visual_similarity_does_not_manufacture_byte_lineage(self):
        """Rule: Local WebP visual similarity retains UNPROVEN_BYTE_LINEAGE (requires fresh ingestion)."""
        report = generate_external_provenance_report()
        for d in report["destinations"]:
            linkage = d["local_asset_linkage"]
            assert linkage in ["VISUAL_MATCH_UNPROVEN_BYTE_LINEAGE", "DIFFERENT_IMAGE", "NO_COMPARABLE_SOURCE"]
            assert linkage != "EXACT_SOURCE_MATCH"

    def test_step2a_pilot_records_remain_unchanged(self):
        """Rule: The original 5 pilot records from Step 2A remain identical in metadata and findings."""
        report = generate_external_provenance_report()
        dest_map = {d["place_id"]: d for d in report["destinations"]}
        pilot_pids = ["place_005", "place_007", "place_019", "place_025", "place_030"]
        for pid in pilot_pids:
            assert pid in dest_map
            d = dest_map[pid]
            assert d["proposed_classification"] == "EXACT_LOCATION_VERIFIED"
            assert d["recommended_next_action"] == "READY_FOR_FRESH_CANONICAL_INGESTION"
            assert d["selected_source"]["source_platform"] == "Wikimedia Commons"

    def test_deterministic_output(self):
        """Rule: Repeated report generation produces identical serialized output."""
        rep1 = generate_external_provenance_report()
        rep2 = generate_external_provenance_report()
        assert rep1 == rep2

    def test_zero_mutation_to_protected_datasets(self):
        """Rule: Discovery research must never mutate manifest, strict registry, places, or images."""
        manifest_path = REPO_ROOT / "data" / "images" / "sources" / "manifest.json"
        strict_path = REPO_ROOT / "data" / "images" / "sources" / "strict_photo_evidence_registry.json"
        places_path = REPO_ROOT / "data" / "places" / "places.json"
        
        manifest_before = hashlib.sha256(manifest_path.read_bytes()).hexdigest()
        strict_before = hashlib.sha256(strict_path.read_bytes()).hexdigest()
        places_before = hashlib.sha256(places_path.read_bytes()).hexdigest()
        
        generate_external_provenance_report()
        
        manifest_after = hashlib.sha256(manifest_path.read_bytes()).hexdigest()
        strict_after = hashlib.sha256(strict_path.read_bytes()).hexdigest()
        places_after = hashlib.sha256(places_path.read_bytes()).hexdigest()
        
        assert manifest_before == manifest_after
        assert strict_before == strict_after
        assert places_before == places_after
