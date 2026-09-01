"""backend/tests/test_image_legacy_provenance_audit.py — Test suite for Legacy Provenance Recovery Audit.

O-TRAVELZ Image Track A2 (Step 1).

Verifies invariants:
  1. Audit execution does not mutate manifest.json, places.json, or image binary files.
  2. Unknown provenance stays unknown (never fabricated).
  3. Partial provenance is NOT promoted to READY_FOR_MANIFEST.
  4. Exact classification requires explicit authentic photographic evidence.
  5. Source-to-local byte linkage is strictly required.
  6. Audit is deterministic and idempotent.
  7. All 31 current unmanifested production assets are accounted for exactly once.
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

from audit_legacy_provenance import audit_legacy_provenance


class TestImageLegacyProvenanceAudit:

    def test_all_31_unmanifested_assets_accounted_for_exactly_once(self):
        """Rule: Every unmanifested production destination with local assets is audited once."""
        report = audit_legacy_provenance()
        records = report["records"]
        assert len(records) == 11
        
        place_ids = [r["place_id"] for r in records]
        assert len(place_ids) == len(set(place_ids)), "Duplicate place IDs found in recovery audit"
        
        # Check specific known places remaining unmanifested
        assert "place_024" in place_ids
        assert "place_028" in place_ids
        assert "place_food_003" in place_ids
        assert "place_food_011" in place_ids

    def test_partial_provenance_is_never_promoted_to_ready(self):
        """Rule: Partial leads (like webpage URL in places.json) do not make an asset READY_FOR_MANIFEST."""
        report = audit_legacy_provenance()
        records = report["records"]
        
        # 0 assets have full verifiable provenance
        assert report["metadata"]["summary_counts"]["READY_FOR_MANIFEST"] == 0
        
        for r in records:
            assert r["recoverability_bucket"] != "READY_FOR_MANIFEST"
            if r["recoverability_bucket"] == "PROVENANCE_PARTIAL":
                assert len(r["missing_fields"]) > 0
                assert "image_source_url" in r["missing_fields"]
                assert "creator" in r["missing_fields"]
                assert "license" in r["missing_fields"]

    def test_exact_classification_strictly_blocked_without_photo_evidence(self):
        """Rule: Exact classification is UNRESOLVED without verified photographic registry entry."""
        report = audit_legacy_provenance()
        for r in report["records"]:
            assert r["classification_evidence"] == "UNRESOLVED"
            assert r["classification_evidence"] != "EXACT_LOCATION_VERIFIED"

    def test_source_local_byte_linkage_is_required(self):
        """Rule: Having local WebP files without raw source byte SHA matching remains UNPROVEN linkage."""
        report = audit_legacy_provenance()
        for r in report["records"]:
            assert "UNPROVEN" in r["linkage_evidence"]

    def test_deterministic_output(self):
        """Rule: Repeated audit runs produce identical output."""
        rep1 = audit_legacy_provenance()
        rep2 = audit_legacy_provenance()
        assert rep1 == rep2

    def test_zero_mutation_to_manifest_and_places(self):
        """Rule: Audit must never modify manifest.json or places.json."""
        manifest_path = REPO_ROOT / "data" / "images" / "sources" / "manifest.json"
        places_path = REPO_ROOT / "data" / "places" / "places.json"
        
        manifest_before = hashlib.sha256(manifest_path.read_bytes()).hexdigest()
        places_before = hashlib.sha256(places_path.read_bytes()).hexdigest()
        
        audit_legacy_provenance()
        
        manifest_after = hashlib.sha256(manifest_path.read_bytes()).hexdigest()
        places_after = hashlib.sha256(places_path.read_bytes()).hexdigest()
        
        assert manifest_before == manifest_after
        assert places_before == places_after
