"""backend/tests/test_image_auditor_and_publishability.py — Comprehensive Tests for Step 3 Image Auditor & Publishability Engine.

Verifies:
1. Fully compliant destination becomes shadow_publishable=true
2. Missing exact verified image becomes shadow_publishable=false
3. GENERIC_IMAGE is never sufficient for publishability
4. RELATED_LOCATION_ONLY is never sufficient
5. REVIEW_REQUIRED is never sufficient
6. Missing variant blocks publishability
7. Missing provenance blocks publishability
8. Invalid/missing coordinates block publishability
9. Invalid district blocks publishability
10. Invalid category blocks publishability
11. Short description (<50 chars) blocks publishability
12. Multiple blockers are all reported
13. Reason ordering is deterministic
14. Exact duplicate groups reported
15. Cross-place duplicate groups reported
16. Orphan directory detection works
17. Manifest record for nonexistent place reported
18. District summary calculations correct
19. Regional candidate summary uses real candidate schema
20. Audit run does NOT modify input datasets (places.json, candidates.json)
21. authentic_image_audit.json schema compatibility preserved
22. Rerunning produces deterministic output
"""
import io
import json
import os
import shutil
from pathlib import Path
from unittest.mock import patch
import pytest

import sys
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SCRIPTS_DIR = REPO_ROOT / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from audit_destination_images import (
    DestinationImageAuditor,
    ImageAuditEntry,
    PublishabilityDecision,
    REQUIRED_VARIANTS,
)


@pytest.fixture
def mock_audit_env(tmp_path):
    """Create an isolated temporary environment with mock datasets."""
    data_dir = tmp_path / "data"
    places_dir = data_dir / "places"
    images_dir = data_dir / "images"
    manifest_dir = images_dir / "sources"
    places_img_dir = images_dir / "places"
    research_dir = data_dir / "research" / "round2"

    for d in [places_dir, manifest_dir, places_img_dir, research_dir / "southern"]:
        d.mkdir(parents=True, exist_ok=True)

    places_file = places_dir / "places.json"
    manifest_file = manifest_dir / "manifest.json"
    strict_file = manifest_dir / "strict_photo_evidence_registry.json"
    categories_file = places_dir / "categories.json"
    audit_output_file = manifest_dir / "authentic_image_audit.json"
    pub_output_file = manifest_dir / "publishability_report.json"

    # Default valid place
    places_data = [
        {
            "id": "place_valid_001",
            "name": "Lingaraj Temple",
            "district": "Khordha",
            "category": "temple",
            "lat": 20.2382,
            "lon": 85.8336,
            "description": "Historic 11th century temple dedicated to Lord Shiva with Kalinga architecture in Bhubaneswar.",
            "source": "https://odishatourism.gov.in/content/tourism/en/discover/attractions/temples/lingaraj.html",
        }
    ]
    places_file.write_text(json.dumps(places_data, indent=2), encoding="utf-8")

    # Default valid manifest entry
    manifest_data = [
        {
            "place_id": "place_valid_001",
            "place_name": "Lingaraj Temple",
            "asset_hash": "06a456469886",
            "source_url": "https://upload.wikimedia.org/lingaraj.jpg",
            "download_url": "/static/images/places/place_valid_001/06a456469886/hero.webp",
            "source_name": "Wikimedia Commons",
            "creator": "Photographer",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Photographer via Wikimedia Commons",
            "content_sha256": "06a45646988632673d6a3eb0598d3cbbccc70c55fe34b1c8b6642db022840850",
            "verification_status": "EXACT_LOCATION_VERIFIED",
            "original_dimensions": [1280, 960],
            "hero_dimensions": [1080, 720],
            "card_dimensions": [640, 360],
            "thumbnail_dimensions": [240, 160],
        }
    ]
    manifest_file.write_text(json.dumps(manifest_data, indent=2), encoding="utf-8")

    # Strict evidence registry
    strict_data = [
        {
            "research_id": "place_valid_001",
            "name": "Lingaraj Temple",
            "classification": "exact_location_verified",
        }
    ]
    strict_file.write_text(json.dumps(strict_data, indent=2), encoding="utf-8")

    # Categories
    categories_data = [{"id": "temple", "name": "temple"}]
    categories_file.write_text(json.dumps(categories_data, indent=2), encoding="utf-8")

    # On-disk variants for place_valid_001
    asset_dir = places_img_dir / "place_valid_001" / "06a456469886"
    asset_dir.mkdir(parents=True, exist_ok=True)
    for v in REQUIRED_VARIANTS:
        (asset_dir / f"{v}.webp").write_bytes(b"MOCK_WEBP_DATA")

    # Regional candidates
    candidates_file = research_dir / "southern" / "candidates.json"
    candidates_data = [
        {
            "research_id": "round2_south_001",
            "name": "Jirang Monastery",
            "district": "Gajapati",
            "region": "southern",
            "category": "heritage",
            "image_source_url": "https://upload.wikimedia.org/jirang.jpg",
            "image_status": "verified",
            "coordinate_verification_status": "verified",
        }
    ]
    candidates_file.write_text(json.dumps(candidates_data, indent=2), encoding="utf-8")

    return {
        "places_file": places_file,
        "manifest_file": manifest_file,
        "strict_file": strict_file,
        "storage_dir": images_dir,
        "categories_file": categories_file,
        "candidates_dirs": [research_dir / "southern"],
        "audit_output_file": audit_output_file,
        "pub_output_file": pub_output_file,
    }


class TestDestinationImageAuditor:

    def test_01_fully_compliant_destination_is_publishable(self, mock_audit_env):
        """Verify fully compliant place satisfies all criteria and gets shadow_publishable=true."""
        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
            output_audit_path=mock_audit_env["audit_output_file"],
            output_publishability_path=mock_audit_env["pub_output_file"],
        )
        audit_entries, report = auditor.run_full_audit()

        assert len(report["decisions"]) == 1
        d = report["decisions"][0]
        assert d["shadow_publishable"] is True
        assert "PUBLISHABLE" in d["reason_codes"]
        assert len(d["reason_codes"]) == 1
        assert report["summary"]["shadow_publishable_count"] == 1

    def test_02_missing_exact_verified_image_blocks_publishability(self, mock_audit_env):
        """Verify missing image manifest blocks publishability."""
        # Empty the manifest
        mock_audit_env["manifest_file"].write_text("[]", encoding="utf-8")
        mock_audit_env["strict_file"].write_text("[]", encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["shadow_publishable"] is False
        assert "NO_IMAGE_MANIFEST" in d["reason_codes"]

    def test_03_generic_image_is_never_sufficient(self, mock_audit_env):
        """Verify classification GENERIC_IMAGE blocks shadow publishability."""
        strict_data = [{"research_id": "place_valid_001", "classification": "generic_image"}]
        mock_audit_env["strict_file"].write_text(json.dumps(strict_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["shadow_publishable"] is False
        assert "NO_EXACT_VERIFIED_IMAGE" in d["reason_codes"]

    def test_04_related_location_only_is_never_sufficient(self, mock_audit_env):
        """Verify classification RELATED_LOCATION_ONLY blocks shadow publishability."""
        strict_data = [{"research_id": "place_valid_001", "classification": "related_location_only"}]
        mock_audit_env["strict_file"].write_text(json.dumps(strict_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["shadow_publishable"] is False
        assert "NO_EXACT_VERIFIED_IMAGE" in d["reason_codes"]

    def test_05_review_required_is_never_sufficient(self, mock_audit_env):
        """Verify classification REVIEW_REQUIRED blocks shadow publishability."""
        strict_data = [{"research_id": "place_valid_001", "classification": "review_required"}]
        mock_audit_env["strict_file"].write_text(json.dumps(strict_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["shadow_publishable"] is False
        assert "NO_EXACT_VERIFIED_IMAGE" in d["reason_codes"]

    def test_06_missing_variant_blocks_publishability(self, mock_audit_env):
        """Verify missing thumbnail.webp variant blocks shadow publishability."""
        thumb_file = mock_audit_env["storage_dir"] / "places" / "place_valid_001" / "06a456469886" / "thumbnail.webp"
        if thumb_file.exists():
            thumb_file.unlink()

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["shadow_publishable"] is False
        assert "MISSING_THUMBNAIL_VARIANT" in d["reason_codes"]

    def test_07_missing_provenance_blocks_publishability(self, mock_audit_env):
        """Verify missing license in manifest blocks shadow publishability."""
        manifest_data = json.loads(mock_audit_env["manifest_file"].read_text(encoding="utf-8"))
        manifest_data[0]["license"] = ""
        mock_audit_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["shadow_publishable"] is False
        assert "MISSING_IMAGE_PROVENANCE" in d["reason_codes"]

    def test_08_invalid_coordinates_block_publishability(self, mock_audit_env):
        """Verify coordinates outside Odisha bounding box block publishability."""
        places_data = json.loads(mock_audit_env["places_file"].read_text(encoding="utf-8"))
        places_data[0]["lat"] = 28.6139  # Delhi
        places_data[0]["lon"] = 77.2090
        mock_audit_env["places_file"].write_text(json.dumps(places_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["shadow_publishable"] is False
        assert "OUTSIDE_ODISHA_BOUNDS" in d["reason_codes"]

    def test_09_invalid_district_blocks_publishability(self, mock_audit_env):
        """Verify non-Odisha district blocks publishability."""
        places_data = json.loads(mock_audit_env["places_file"].read_text(encoding="utf-8"))
        places_data[0]["district"] = "Varanasi"
        mock_audit_env["places_file"].write_text(json.dumps(places_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["shadow_publishable"] is False
        assert "INVALID_DISTRICT" in d["reason_codes"]

    def test_10_invalid_category_blocks_publishability(self, mock_audit_env):
        """Verify unrecognized category taxonomy blocks publishability."""
        places_data = json.loads(mock_audit_env["places_file"].read_text(encoding="utf-8"))
        places_data[0]["category"] = "unsupported_random_category"
        mock_audit_env["places_file"].write_text(json.dumps(places_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["shadow_publishable"] is False
        assert "INVALID_CATEGORY" in d["reason_codes"]

    def test_11_short_description_blocks_publishability(self, mock_audit_env):
        """Verify description under 50 characters blocks publishability."""
        places_data = json.loads(mock_audit_env["places_file"].read_text(encoding="utf-8"))
        places_data[0]["description"] = "Short desc."  # 11 chars
        mock_audit_env["places_file"].write_text(json.dumps(places_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["shadow_publishable"] is False
        assert "DESCRIPTION_TOO_SHORT" in d["reason_codes"]

    def test_12_multiple_blockers_all_reported(self, mock_audit_env):
        """Verify multiple simultaneous blockers are all reported."""
        places_data = json.loads(mock_audit_env["places_file"].read_text(encoding="utf-8"))
        places_data[0]["description"] = "Short"
        places_data[0]["district"] = "NonexistentDistrict"
        places_data[0]["lat"] = None
        mock_audit_env["places_file"].write_text(json.dumps(places_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert "DESCRIPTION_TOO_SHORT" in d["reason_codes"]
        assert "INVALID_DISTRICT" in d["reason_codes"]
        assert "MISSING_COORDINATES" in d["reason_codes"]

    def test_13_reason_ordering_is_deterministic(self, mock_audit_env):
        """Verify reason codes are sorted alphabetically."""
        places_data = json.loads(mock_audit_env["places_file"].read_text(encoding="utf-8"))
        places_data[0]["description"] = "Short"
        places_data[0]["district"] = "NonexistentDistrict"
        mock_audit_env["places_file"].write_text(json.dumps(places_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["reason_codes"] == sorted(d["reason_codes"])

    def test_14_exact_duplicate_groups_reported(self, mock_audit_env):
        """Verify duplicate SHA-256 entries are indexed in integrity findings."""
        manifest_data = json.loads(mock_audit_env["manifest_file"].read_text(encoding="utf-8"))
        # Add duplicate with same SHA
        dup_entry = dict(manifest_data[0])
        dup_entry["place_id"] = "place_dup_002"
        manifest_data.append(dup_entry)
        mock_audit_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        cross_dups = report["integrity_findings"]["cross_place_duplicate_groups"]
        assert len(cross_dups) == 1

    def test_15_cross_place_duplicate_flag_added_to_reasons(self, mock_audit_env):
        """Verify place sharing an exact SHA with another place receives CROSS_PLACE_DUPLICATE_REVIEW."""
        places_data = json.loads(mock_audit_env["places_file"].read_text(encoding="utf-8"))
        places_data.append({
            "id": "place_other_002",
            "name": "Other Temple",
            "district": "Puri",
            "category": "temple",
            "lat": 19.8,
            "lon": 85.8,
            "description": "Another historic temple in Puri district with traditional architecture.",
            "source": "https://odishatourism.gov.in",
        })
        mock_audit_env["places_file"].write_text(json.dumps(places_data), encoding="utf-8")

        manifest_data = json.loads(mock_audit_env["manifest_file"].read_text(encoding="utf-8"))
        dup = dict(manifest_data[0])
        dup["place_id"] = "place_other_002"
        manifest_data.append(dup)
        mock_audit_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        for d in report["decisions"]:
            assert "CROSS_PLACE_DUPLICATE_REVIEW" in d["reason_codes"]

    def test_16_orphan_directory_detection(self, mock_audit_env):
        """Verify directories on disk without matching place_id are flagged as orphans."""
        orphan_dir = mock_audit_env["storage_dir"] / "places" / "unlinked_legacy_folder"
        orphan_dir.mkdir(parents=True, exist_ok=True)

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        assert "unlinked_legacy_folder" in report["integrity_findings"]["orphan_image_directories"]

    def test_17_manifest_record_for_nonexistent_place_reported(self, mock_audit_env):
        """Verify manifest records referencing place IDs not in places.json are flagged."""
        manifest_data = json.loads(mock_audit_env["manifest_file"].read_text(encoding="utf-8"))
        ghost_entry = dict(manifest_data[0])
        ghost_entry["place_id"] = "place_nonexistent_ghost"
        manifest_data.append(ghost_entry)
        mock_audit_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        assert "place_nonexistent_ghost" in report["integrity_findings"]["manifest_nonexistent_places"]

    def test_18_district_summary_is_correct(self, mock_audit_env):
        """Verify per-district aggregation in publishability report."""
        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        assert "Khordha" in report["district_summary"]
        k_metric = report["district_summary"]["Khordha"]
        assert k_metric["total_places"] == 1
        assert k_metric["publishable_places"] == 1

    def test_19_regional_candidate_summary_uses_real_schema(self, mock_audit_env):
        """Verify candidate summary counts verified vs review leads."""
        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        south = report["regional_candidates_summary"]["southern"]
        assert south["total_candidates"] == 1
        assert south["candidates_with_images"] == 1
        assert south["exact_verified_leads"] == 1

    def test_20_audit_run_does_not_modify_input_datasets(self, mock_audit_env):
        """Verify places.json and manifest.json are not altered by the audit run."""
        places_before = mock_audit_env["places_file"].read_bytes()
        manifest_before = mock_audit_env["manifest_file"].read_bytes()

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
            output_audit_path=mock_audit_env["audit_output_file"],
            output_publishability_path=mock_audit_env["pub_output_file"],
        )
        entries, report = auditor.run_full_audit()
        auditor.save_reports(entries, report)

        assert mock_audit_env["places_file"].read_bytes() == places_before
        assert mock_audit_env["manifest_file"].read_bytes() == manifest_before

    def test_21_authentic_image_audit_compatibility_preserved(self, mock_audit_env):
        """Verify authentic_image_audit.json schema fields match existing consumer expectations."""
        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
            output_audit_path=mock_audit_env["audit_output_file"],
            output_publishability_path=mock_audit_env["pub_output_file"],
        )
        entries, report = auditor.run_full_audit()
        auditor.save_reports(entries, report)

        audit_data = json.loads(mock_audit_env["audit_output_file"].read_text(encoding="utf-8"))
        assert len(audit_data) == 1
        item = audit_data[0]
        for expected_key in [
            "place_id", "research_id", "place_name", "district", "category",
            "status", "final_image_url", "source_type", "verification_notes",
            "confidence", "all_variants_present", "has_exact_verified_image",
            "audit_reasons"
        ]:
            assert expected_key in item

    def test_22_rerunning_produces_deterministic_output(self, mock_audit_env):
        """Verify repeated audit runs produce identical decision reports."""
        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, r1 = auditor.run_full_audit()
        _, r2 = auditor.run_full_audit()

        assert r1["summary"] == r2["summary"]
        assert r1["decisions"] == r2["decisions"]
        assert r1["district_summary"] == r2["district_summary"]

    def test_23_exact_verified_image_with_short_description_is_not_publishable(self, mock_audit_env):
        """Verify place with exact verified image but short description fails publishability."""
        places_data = json.loads(mock_audit_env["places_file"].read_text(encoding="utf-8"))
        places_data[0]["description"] = "Too short."  # 10 chars
        mock_audit_env["places_file"].write_text(json.dumps(places_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["has_exact_verified_image"] is True
        assert d["shadow_publishable"] is False
        assert "DESCRIPTION_TOO_SHORT" in d["reason_codes"]
        assert report["summary"]["exact_verified_image_count"] == 1
        assert report["summary"]["shadow_publishable_count"] == 0

    def test_24_strict_registry_precedence_over_manifest(self, mock_audit_env):
        """Verify strict evidence registry classification overrides legacy manifest status."""
        strict_data = [
            {
                "research_id": "place_valid_001",
                "classification": "related_location_only",
            }
        ]
        mock_audit_env["strict_file"].write_text(json.dumps(strict_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["classification"] == "RELATED_LOCATION_ONLY"
        assert d["has_exact_verified_image"] is False
        assert "NO_EXACT_VERIFIED_IMAGE" in d["reason_codes"]

    def test_25_destination_provenance_cannot_substitute_image_provenance(self, mock_audit_env):
        """Verify destination source URL in places.json does not satisfy image license requirement."""
        manifest_data = json.loads(mock_audit_env["manifest_file"].read_text(encoding="utf-8"))
        manifest_data[0]["license"] = ""  # Strip image license
        mock_audit_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
        )
        _, report = auditor.run_full_audit()
        d = report["decisions"][0]
        assert d["shadow_publishable"] is False
        assert "MISSING_IMAGE_PROVENANCE" in d["reason_codes"]

    def test_26_input_datasets_immutable_sha256_check(self, mock_audit_env):
        """Verify byte-for-byte SHA256 immutability of all input files during audit."""
        import hashlib

        input_files = [
            mock_audit_env["places_file"],
            mock_audit_env["manifest_file"],
            mock_audit_env["strict_file"],
            mock_audit_env["categories_file"],
        ]

        hashes_before = {f: hashlib.sha256(f.read_bytes()).hexdigest() for f in input_files}

        auditor = DestinationImageAuditor(
            places_path=mock_audit_env["places_file"],
            manifest_path=mock_audit_env["manifest_file"],
            strict_registry_path=mock_audit_env["strict_file"],
            storage_dir=mock_audit_env["storage_dir"],
            categories_path=mock_audit_env["categories_file"],
            candidates_dirs=mock_audit_env["candidates_dirs"],
            output_audit_path=mock_audit_env["audit_output_file"],
            output_publishability_path=mock_audit_env["pub_output_file"],
        )
        entries, report = auditor.run_full_audit()
        auditor.save_reports(entries, report)

        hashes_after = {f: hashlib.sha256(f.read_bytes()).hexdigest() for f in input_files}

        assert hashes_before == hashes_after

