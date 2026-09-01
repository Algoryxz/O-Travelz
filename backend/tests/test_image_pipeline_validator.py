"""backend/tests/test_image_pipeline_validator.py — Comprehensive Unit Tests for Step 4 Image Pipeline Integrity Validator.

Verifies:
1. Valid legacy manifest record + complete files passes validation
2. Valid canonical manifest / variants metadata passes validation
3. Malformed manifest entry triggers ERROR
4. Nonexistent place_id in places.json triggers ERROR
5. Missing required variant triggers ERROR
6. Zero-byte variant file triggers ERROR
7. Corrupt WebP binary triggers ERROR
8. Wrong actual file format triggers ERROR
9. Variant dimension mismatch triggers ERROR
10. Variant byte count mismatch triggers ERROR
11. Variant SHA mismatch triggers ERROR
12. Legacy missing variant SHA is INFO/WARNING, not ERROR
13. Invalid content_sha256 structure triggers ERROR
14. Source SHA is not incorrectly compared to transcoded original.webp
15. Duplicate (place_id, asset_hash) record triggers ERROR
16. Multiple primary assets for one place triggers ERROR
17. Strict evidence classification conflict is reported as WARNING
18. Unknown verification status normalizes or triggers error
19. Unmanifested known-production asset directory is reported as WARNING
20. Orphan destination folder is reported as WARNING
21. Orphan nested asset directory is reported as WARNING
22. Unsupported / unverified license triggers ERROR
23. Validator never mutates manifest.json
24. Validator never mutates image binary files
25. Deterministic validation results across repeated runs
"""
import io
import json
import os
import shutil
from pathlib import Path
import pytest
from PIL import Image

import sys
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SCRIPTS_DIR = REPO_ROOT / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from validate_image_pipeline import (
    ImagePipelineValidator,
    REQUIRED_VARIANTS,
    ValidationReport,
)


def create_in_memory_webp_bytes(width: int = 1280, height: int = 720, color: str = "blue") -> bytes:
    """Helper to generate valid in-memory WebP image bytes."""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=85)
    return buf.getvalue()


@pytest.fixture
def mock_validator_env(tmp_path):
    """Isolated environment with places.json, manifest.json, and data/images/places/."""
    places_file = tmp_path / "places.json"
    manifest_file = tmp_path / "manifest.json"
    strict_file = tmp_path / "strict_photo_evidence_registry.json"
    storage_dir = tmp_path / "images"
    places_img_dir = storage_dir / "places"

    places_img_dir.mkdir(parents=True, exist_ok=True)

    # 1. Valid place in places.json
    places_data = [
        {"id": "place_valid_001", "name": "Lingaraj Temple", "district": "Khordha", "category": "temple"}
    ]
    places_file.write_text(json.dumps(places_data, indent=2), encoding="utf-8")

    # 2. Valid WebP variants on disk
    asset_dir = places_img_dir / "place_valid_001" / "06a456469886"
    asset_dir.mkdir(parents=True, exist_ok=True)

    webp_bytes = create_in_memory_webp_bytes(1280, 720, color="orange")
    for v in REQUIRED_VARIANTS:
        (asset_dir / f"{v}.webp").write_bytes(webp_bytes)

    # 3. Valid manifest record
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
            "attribution": "Photo by Photographer",
            "is_primary": True,
            "content_sha256": "06a45646988632673d6a3eb0598d3cbbccc70c55fe34b1c8b6642db022840850",
            "verification_status": "EXACT_LOCATION_VERIFIED",
            "original_dimensions": [1280, 720],
            "hero_dimensions": [1280, 720],
            "card_dimensions": [1280, 720],
            "thumbnail_dimensions": [1280, 720],
        }
    ]
    manifest_file.write_text(json.dumps(manifest_data, indent=2), encoding="utf-8")

    # 4. Strict evidence
    strict_data = [
        {"research_id": "place_valid_001", "classification": "exact_location_verified"}
    ]
    strict_file.write_text(json.dumps(strict_data, indent=2), encoding="utf-8")

    return {
        "places_file": places_file,
        "manifest_file": manifest_file,
        "strict_file": strict_file,
        "storage_dir": storage_dir,
    }


class TestImagePipelineValidator:

    def test_01_valid_legacy_manifest_record_passes(self, mock_validator_env):
        """Verify compliant legacy record with complete WebP files passes with 0 errors."""
        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
            strict_registry_path=mock_validator_env["strict_file"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is True
        assert report.error_count == 0

    def test_02_valid_canonical_variants_metadata_passes(self, mock_validator_env):
        """Verify record with structured VariantMetadata passes with exact dimensions and SHAs."""
        import hashlib
        webp_bytes = create_in_memory_webp_bytes(1280, 720, color="navy")
        var_sha = hashlib.sha256(webp_bytes).hexdigest()

        asset_dir = mock_validator_env["storage_dir"] / "places" / "place_valid_001" / "06a456469886"
        for v in REQUIRED_VARIANTS:
            (asset_dir / f"{v}.webp").write_bytes(webp_bytes)

        manifest_data = [
            {
                "place_id": "place_valid_001",
                "asset_hash": "06a456469886",
                "source_url": "https://upload.wikimedia.org/test.jpg",
                "source_name": "Wikimedia Commons",
                "creator": "Author",
                "license": "CC0",
                "attribution": "Photo by Author",
                "is_primary": True,
                "content_sha256": "06a45646988632673d6a3eb0598d3cbbccc70c55fe34b1c8b6642db022840850",
                "verification_status": "EXACT_LOCATION_VERIFIED",
                "variants": {
                    v: {
                        "variant_type": v,
                        "storage_key": f"places/place_valid_001/06a456469886/{v}.webp",
                        "width": 1280,
                        "height": 720,
                        "size_bytes": len(webp_bytes),
                        "content_sha256": var_sha,
                        "mime_type": "image/webp",
                    }
                    for v in REQUIRED_VARIANTS
                },
            }
        ]
        mock_validator_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
            strict_registry_path=mock_validator_env["strict_file"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is True
        assert report.error_count == 0

    def test_03_malformed_manifest_entry_fails(self, mock_validator_env):
        """Verify missing place_id raises ERROR."""
        mock_validator_env["manifest_file"].write_text(
            json.dumps([{"source_url": "https://example.com/bad.jpg"}]), encoding="utf-8"
        )
        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is False
        assert any(i.category == "MANIFEST_SCHEMA" for i in report.issues)

    def test_04_nonexistent_place_id_fails(self, mock_validator_env):
        """Verify manifest record referencing a nonexistent place_id triggers ERROR."""
        manifest_data = json.loads(mock_validator_env["manifest_file"].read_text(encoding="utf-8"))
        manifest_data[0]["place_id"] = "place_ghost_999"
        mock_validator_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is False
        assert any(i.category == "MANIFEST_ORPHAN" for i in report.issues)

    def test_05_missing_required_variant_fails(self, mock_validator_env):
        """Verify missing thumbnail.webp variant triggers ERROR."""
        thumb = mock_validator_env["storage_dir"] / "places" / "place_valid_001" / "06a456469886" / "thumbnail.webp"
        thumb.unlink()

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is False
        assert any(i.category == "VARIANT_MISSING" for i in report.issues)

    def test_06_zero_byte_variant_fails(self, mock_validator_env):
        """Verify 0-byte variant file triggers ERROR."""
        card = mock_validator_env["storage_dir"] / "places" / "place_valid_001" / "06a456469886" / "card.webp"
        card.write_bytes(b"")

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is False
        assert any(i.category == "VARIANT_CORRUPT" for i in report.issues)

    def test_07_corrupt_webp_fails(self, mock_validator_env):
        """Verify corrupted image binary triggers ERROR."""
        hero = mock_validator_env["storage_dir"] / "places" / "place_valid_001" / "06a456469886" / "hero.webp"
        hero.write_bytes(b"CORRUPT_BYTES_HEADER_12345678901234567890")

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is False
        assert any(i.category == "VARIANT_DECODE" for i in report.issues)

    def test_08_wrong_actual_file_format_fails(self, mock_validator_env):
        """Verify JPEG file disguised with .webp extension triggers ERROR."""
        img = Image.new("RGB", (400, 300), color="red")
        buf = io.BytesIO()
        img.save(buf, format="JPEG")

        orig = mock_validator_env["storage_dir"] / "places" / "place_valid_001" / "06a456469886" / "original.webp"
        orig.write_bytes(buf.getvalue())

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is False
        assert any(i.category == "VARIANT_FORMAT" for i in report.issues)

    def test_09_variant_dimension_mismatch_fails(self, mock_validator_env):
        """Verify metadata recording (1920x1080) when file is (1280x720) triggers ERROR."""
        manifest_data = json.loads(mock_validator_env["manifest_file"].read_text(encoding="utf-8"))
        manifest_data[0]["variants"] = {
            "hero": {
                "variant_type": "hero",
                "width": 1920,  # mismatch!
                "height": 1080,
                "mime_type": "image/webp",
            }
        }
        mock_validator_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is False
        assert any(i.category == "METADATA_MISMATCH" for i in report.issues)

    def test_10_variant_byte_count_mismatch_fails(self, mock_validator_env):
        """Verify metadata recording size_bytes=999999 when file is different size triggers ERROR."""
        manifest_data = json.loads(mock_validator_env["manifest_file"].read_text(encoding="utf-8"))
        manifest_data[0]["variants"] = {
            "hero": {
                "variant_type": "hero",
                "width": 1280,
                "height": 720,
                "size_bytes": 999999,  # mismatch!
                "mime_type": "image/webp",
            }
        }
        mock_validator_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is False
        assert any(i.category == "METADATA_MISMATCH" for i in report.issues)

    def test_11_variant_sha_mismatch_fails(self, mock_validator_env):
        """Verify recorded variant SHA mismatch triggers ERROR."""
        manifest_data = json.loads(mock_validator_env["manifest_file"].read_text(encoding="utf-8"))
        manifest_data[0]["variants"] = {
            "hero": {
                "variant_type": "hero",
                "width": 1280,
                "height": 720,
                "content_sha256": "0000000000000000000000000000000000000000000000000000000000000000",
                "mime_type": "image/webp",
            }
        }
        mock_validator_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is False
        assert any(i.category == "SHA_MISMATCH" for i in report.issues)

    def test_12_legacy_missing_variant_sha_is_info_not_error(self, mock_validator_env):
        """Verify legacy record lacking per-variant SHA metadata does not fail validation."""
        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is True
        assert any(i.category == "LEGACY_RECORD" and i.level == "INFO" for i in report.issues)

    def test_13_invalid_content_sha256_structure_fails(self, mock_validator_env):
        """Verify non-64-character SHA triggers ERROR."""
        manifest_data = json.loads(mock_validator_env["manifest_file"].read_text(encoding="utf-8"))
        manifest_data[0]["content_sha256"] = "invalid_short_sha"
        mock_validator_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is False
        assert any(i.category == "MANIFEST_SHA" for i in report.issues)

    def test_14_source_sha_not_compared_to_transcoded_webp(self, mock_validator_env):
        """Verify original source content_sha256 is not falsely compared to derivative original.webp."""
        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        # Should not have any SHA_MISMATCH error for content_sha256
        assert not any(i.category == "SHA_MISMATCH" for i in report.issues)

    def test_15_duplicate_same_place_asset_fails(self, mock_validator_env):
        """Verify duplicate (place_id, asset_hash) in manifest triggers ERROR."""
        manifest_data = json.loads(mock_validator_env["manifest_file"].read_text(encoding="utf-8"))
        dup_entry = dict(manifest_data[0])
        manifest_data.append(dup_entry)
        mock_validator_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is False
        assert any(i.category == "MANIFEST_DUPLICATE" for i in report.issues)

    def test_16_multiple_primary_assets_fail(self, mock_validator_env):
        """Verify multiple is_primary=true records for the same place_id triggers ERROR."""
        manifest_data = json.loads(mock_validator_env["manifest_file"].read_text(encoding="utf-8"))
        second_entry = dict(manifest_data[0])
        second_entry["asset_hash"] = "999999999999"
        second_entry["content_sha256"] = "9999999999999999999999999999999999999999999999999999999999999999"
        manifest_data.append(second_entry)
        mock_validator_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is False
        assert any(i.category == "PRIMARY_CONFLICT" for i in report.issues)

    def test_17_strict_registry_classification_conflict_reported(self, mock_validator_env):
        """Verify strict registry (related) vs manifest (exact) is reported as WARNING."""
        strict_data = [
            {"research_id": "place_valid_001", "classification": "related_location_only"}
        ]
        mock_validator_env["strict_file"].write_text(json.dumps(strict_data), encoding="utf-8")

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
            strict_registry_path=mock_validator_env["strict_file"],
        )
        report = validator.run_all_validations()
        assert any(i.category == "CLASSIFICATION_CONFLICT" and i.level == "WARNING" for i in report.issues)

    def test_18_unknown_verification_status_normalizes_or_reports(self, mock_validator_env):
        """Verify manifest verification_status is parsed safely."""
        manifest_data = json.loads(mock_validator_env["manifest_file"].read_text(encoding="utf-8"))
        manifest_data[0]["verification_status"] = "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
        mock_validator_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is True

    def test_19_unmanifested_production_asset_dir_reported_as_warning(self, mock_validator_env):
        """Verify place with files on disk but no manifest entry is categorized as UNMANIFESTED_PRODUCTION_ASSET."""
        # Add place_unmanifested to places.json and storage
        places_data = json.loads(mock_validator_env["places_file"].read_text(encoding="utf-8"))
        places_data.append({"id": "place_unman_002", "name": "Unmanifested Place", "district": "Puri", "category": "temple"})
        mock_validator_env["places_file"].write_text(json.dumps(places_data), encoding="utf-8")

        unman_dir = mock_validator_env["storage_dir"] / "places" / "place_unman_002" / "123456789012"
        unman_dir.mkdir(parents=True, exist_ok=True)
        for v in REQUIRED_VARIANTS:
            (unman_dir / f"{v}.webp").write_bytes(create_in_memory_webp_bytes(640, 480))

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        # Informational warning, not fatal error
        assert any(i.category == "UNMANIFESTED_PRODUCTION_ASSET" and i.level == "WARNING" for i in report.issues)
        assert report.filesystem_summary["unmanifested_production_assets"] == 1

    def test_20_orphan_destination_folder_reported_as_warning(self, mock_validator_env):
        """Verify folder on disk not in places.json is categorized as ORPHAN_DESTINATION_DIR."""
        orphan_dir = mock_validator_env["storage_dir"] / "places" / "lingaraj"
        orphan_dir.mkdir(parents=True, exist_ok=True)

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert any(i.category == "ORPHAN_DESTINATION_DIR" and i.level == "WARNING" for i in report.issues)
        assert report.filesystem_summary["orphan_destination_dirs"] == 1

    def test_21_orphan_nested_asset_directory_reported(self, mock_validator_env):
        """Verify unreferenced second asset directory under a valid place is reported as ORPHAN_ASSET_DIR."""
        second_sub = mock_validator_env["storage_dir"] / "places" / "place_valid_001" / "unmanifested_sub_123456"
        second_sub.mkdir(parents=True, exist_ok=True)

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert any(i.category == "ORPHAN_ASSET_DIR" and i.level == "WARNING" for i in report.issues)

    def test_22_unapproved_license_triggers_error(self, mock_validator_env):
        """Verify unapproved license outside verified allowlist triggers ERROR."""
        manifest_data = json.loads(mock_validator_env["manifest_file"].read_text(encoding="utf-8"))
        manifest_data[0]["license"] = "All Rights Reserved - Copyright 2026"
        mock_validator_env["manifest_file"].write_text(json.dumps(manifest_data), encoding="utf-8")

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        report = validator.run_all_validations()
        assert report.is_valid is False
        assert any(i.category == "MANIFEST_LICENSE" for i in report.issues)

    def test_23_validator_never_mutates_manifest(self, mock_validator_env):
        """Verify manifest.json is identical byte-for-byte before and after validation."""
        import hashlib
        before_hash = hashlib.sha256(mock_validator_env["manifest_file"].read_bytes()).hexdigest()

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        validator.run_all_validations()

        after_hash = hashlib.sha256(mock_validator_env["manifest_file"].read_bytes()).hexdigest()
        assert before_hash == after_hash

    def test_24_validator_never_mutates_image_files(self, mock_validator_env):
        """Verify image binary files on disk are identical byte-for-byte before and after validation."""
        import hashlib
        hero_file = mock_validator_env["storage_dir"] / "places" / "place_valid_001" / "06a456469886" / "hero.webp"
        before_hash = hashlib.sha256(hero_file.read_bytes()).hexdigest()

        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        validator.run_all_validations()

        after_hash = hashlib.sha256(hero_file.read_bytes()).hexdigest()
        assert before_hash == after_hash

    def test_25_deterministic_validation_results(self, mock_validator_env):
        """Verify repeated validation runs produce equivalent results."""
        validator = ImagePipelineValidator(
            manifest_path=mock_validator_env["manifest_file"],
            places_path=mock_validator_env["places_file"],
            storage_dir=mock_validator_env["storage_dir"],
        )
        r1 = validator.run_all_validations()
        r2 = validator.run_all_validations()

        assert r1.is_valid == r2.is_valid
        assert r1.error_count == r2.error_count
        assert r1.warning_count == r2.warning_count
        assert r1.manifest_summary == r2.manifest_summary
        assert r1.filesystem_summary == r2.filesystem_summary
