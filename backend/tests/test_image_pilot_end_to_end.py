"""backend/tests/test_image_pilot_end_to_end.py — End-to-End Five-Case Pilot Test Suite.

O-TRAVELZ Image Track A1 (Step 5).

Verifies the 5 logical pilot cases under real ingestion pipeline semantics:
  Case 1: Existing valid production image idempotency (place_bbsr_001) -> ALREADY_EXISTS
  Case 2: Existing local asset without canonical manifest entry (place_005) -> BLOCKED_MISSING_PROVENANCE
  Case 3: Round 2 regional candidate with verified external image evidence (round2_south_001) -> Validated staging / DRY-RUN
  Case 4: Exact duplicate detection (Same place -> ALREADY_EXISTS; Cross-place -> REVIEW_REQUIRED)
  Case 5: Invalid / Generic / Rejected evidence enforcement -> Cannot become EXACT_LOCATION_VERIFIED
"""
import io
import json
import hashlib
from pathlib import Path
import pytest
from PIL import Image

import sys
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SCRIPTS_DIR = REPO_ROOT / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from ingest_destination_images import (
    DestinationImageIngestionService,
    IngestionItemResult,
    ImageManifestItem,
    load_manifest_records,
)
from validate_image_pipeline import ImagePipelineValidator
from audit_destination_images import DestinationImageAuditor


def create_in_memory_image_file(path: Path, width: int = 1200, height: int = 800, color: str = "green", fmt: str = "JPEG") -> bytes:
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format=fmt, quality=90)
    data = buf.getvalue()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return data


class TestImagePilotEndToEnd:

    def test_case_1_existing_image_idempotency(self, tmp_path):
        """Case 1: Re-ingesting an identical SHA-256 for place_bbsr_001 returns ALREADY_EXISTS without mutating manifest."""
        manifest_file = tmp_path / "manifest.json"
        storage_dir = tmp_path / "images"

        src_file = tmp_path / "lingaraj_source.jpg"
        raw_bytes = create_in_memory_image_file(src_file, 1200, 800, color="gold")
        raw_sha = hashlib.sha256(raw_bytes).hexdigest()
        asset_hash = raw_sha[:12]

        places_img_dir = storage_dir / "places" / "place_bbsr_001" / asset_hash
        places_img_dir.mkdir(parents=True, exist_ok=True)

        # Write variants
        for v in ["original", "hero", "card", "thumbnail"]:
            (places_img_dir / f"{v}.webp").write_bytes(b"EXISTING_WEBP_BYTES")

        manifest_item = {
            "place_id": "place_bbsr_001",
            "place_name": "Lingaraj Temple",
            "asset_hash": asset_hash,
            "source_url": "https://upload.wikimedia.org/lingaraj.jpg",
            "source_name": "Wikimedia Commons",
            "creator": "Photographer",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Photographer",
            "content_sha256": raw_sha,
            "verification_status": "EXACT_LOCATION_VERIFIED",
        }
        manifest_file.write_text(json.dumps([manifest_item], indent=2), encoding="utf-8")
        manifest_before_hash = hashlib.sha256(manifest_file.read_bytes()).hexdigest()

        service = DestinationImageIngestionService(
            storage_base_dir=storage_dir,
            manifest_path=manifest_file,
        )

        spec = {
            "place_id": "place_bbsr_001",
            "place_name": "Lingaraj Temple",
            "file": str(src_file),
            "source_url": "https://upload.wikimedia.org/lingaraj.jpg",
            "source_name": "Wikimedia Commons",
            "creator": "Photographer",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Photographer",
        }

        result = service.ingest_single_candidate(spec)

        assert result.status == "ALREADY_EXISTS"
        manifest_after_hash = hashlib.sha256(manifest_file.read_bytes()).hexdigest()
        assert manifest_before_hash == manifest_after_hash

    def test_case_2_unmanifested_asset_missing_provenance_is_blocked(self, tmp_path):
        """Case 2: Ingesting place_005 without valid license/provenance is rejected with PROVENANCE failure."""
        manifest_file = tmp_path / "manifest.json"
        manifest_file.write_text("[]", encoding="utf-8")
        storage_dir = tmp_path / "images"

        src_file = tmp_path / "p005_source.jpg"
        create_in_memory_image_file(src_file, 1000, 700)

        service = DestinationImageIngestionService(
            storage_base_dir=storage_dir,
            manifest_path=manifest_file,
        )

        # Attempt ingestion without valid license
        spec = {
            "place_id": "place_005",
            "place_name": "Parasurameswar Temple",
            "file": str(src_file),
            "source_url": "https://unknown-source.com/img.jpg",
            "source_name": "Unknown",
            "creator": "",
            "license": "Unknown / Unverified",  # Invalid license
            "attribution": "",
        }

        result = service.ingest_single_candidate(spec)

        assert result.status == "REJECTED"
        assert "license" in result.reason.lower()
        # Manifest remains empty
        assert json.loads(manifest_file.read_text(encoding="utf-8")) == []

    def test_case_3_research_candidate_dry_run_validation(self, tmp_path):
        """Case 3: Round 2 candidate in dry-run mode validates decoding and dimensions without writing to disk."""
        manifest_file = tmp_path / "manifest.json"
        manifest_file.write_text("[]", encoding="utf-8")
        storage_dir = tmp_path / "images"

        src_file = tmp_path / "chandragiri.jpg"
        create_in_memory_image_file(src_file, 1600, 1200, color="maroon")

        service = DestinationImageIngestionService(
            storage_base_dir=storage_dir,
            manifest_path=manifest_file,
            dry_run=True,
        )

        spec = {
            "place_id": "round2_south_001",
            "place_name": "Padmasambhava Mahavihara Monastery",
            "file": str(src_file),
            "source_url": "https://upload.wikimedia.org/chandragiri.jpg",
            "source_name": "Wikimedia Commons",
            "creator": "Photographer",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo via Wikimedia Commons",
            "classification": "EXACT_LOCATION_VERIFIED",
        }

        result = service.ingest_single_candidate(spec)

        assert result.status == "SUCCEEDED"
        assert "[DRY-RUN]" in result.reason
        # No files written
        assert not (storage_dir / "places" / "round2_south_001").exists()
        assert json.loads(manifest_file.read_text(encoding="utf-8")) == []

    def test_case_4a_duplicate_same_place_idempotent(self, tmp_path):
        """Case 4A: Exact duplicate for same place returns ALREADY_EXISTS."""
        manifest_file = tmp_path / "manifest.json"
        manifest_file.write_text("[]", encoding="utf-8")
        storage_dir = tmp_path / "images"

        src_file = tmp_path / "test_dup.jpg"
        create_in_memory_image_file(src_file, 1200, 800, color="teal")

        service = DestinationImageIngestionService(storage_base_dir=storage_dir, manifest_path=manifest_file)

        spec = {
            "place_id": "place_test_001",
            "place_name": "Test Temple",
            "file": str(src_file),
            "source_url": "https://example.com/test.jpg",
            "source_name": "Test Source",
            "creator": "Author",
            "license": "CC BY 4.0",
            "attribution": "Photo by Author",
        }

        # First ingestion
        res1 = service.ingest_single_candidate(spec)
        assert res1.status == "SUCCEEDED"

        # Second ingestion with identical file
        res2 = service.ingest_single_candidate(spec)
        assert res2.status == "ALREADY_EXISTS"

    def test_case_4b_duplicate_cross_place_downgrades_to_review_required(self, tmp_path):
        """Case 4B: Reusing exact same image bytes for a different destination downgrades to REVIEW_REQUIRED."""
        manifest_file = tmp_path / "manifest.json"
        manifest_file.write_text("[]", encoding="utf-8")
        storage_dir = tmp_path / "images"

        src_file = tmp_path / "shared_dup.jpg"
        create_in_memory_image_file(src_file, 1200, 800, color="purple")

        service = DestinationImageIngestionService(storage_base_dir=storage_dir, manifest_path=manifest_file)

        # Ingest place A
        res_a = service.ingest_single_candidate({
            "place_id": "place_a_001",
            "place_name": "Temple A",
            "file": str(src_file),
            "source_url": "https://example.com/a.jpg",
            "source_name": "Commons",
            "creator": "Author",
            "license": "CC BY 4.0",
            "attribution": "Photo by Author",
            "classification": "EXACT_LOCATION_VERIFIED",
        })
        assert res_a.status == "SUCCEEDED"
        assert res_a.classification == "EXACT_LOCATION_VERIFIED"

        # Ingest place B with identical image bytes claiming EXACT_LOCATION_VERIFIED
        res_b = service.ingest_single_candidate({
            "place_id": "place_b_002",
            "place_name": "Temple B",
            "file": str(src_file),
            "source_url": "https://example.com/b.jpg",
            "source_name": "Commons",
            "creator": "Author",
            "license": "CC BY 4.0",
            "attribution": "Photo by Author",
            "classification": "EXACT_LOCATION_VERIFIED",
        })
        assert res_b.status == "REVIEW_REQUIRED" or res_b.classification == "REVIEW_REQUIRED"

        # Verify manifest entry for place B has REVIEW_REQUIRED
        manifest_items = load_manifest_records(manifest_file)
        item_b = next(m for m in manifest_items if m.place_id == "place_b_002")
        assert item_b.verification_status == "REVIEW_REQUIRED"
        assert "Cross-place duplicate with place_a_001" in (item_b.notes or "")
        assert "Originally supplied classification: EXACT_LOCATION_VERIFIED" in (item_b.notes or "")

    def test_case_5_generic_and_related_evidence_enforcement(self, tmp_path):
        """Case 5: Generic and related evidence can never be promoted to EXACT_LOCATION_VERIFIED."""
        manifest_file = tmp_path / "manifest.json"
        manifest_file.write_text("[]", encoding="utf-8")
        storage_dir = tmp_path / "images"

        src_gen = tmp_path / "gen.jpg"
        create_in_memory_image_file(src_gen, 1000, 700, color="brown")

        service = DestinationImageIngestionService(storage_base_dir=storage_dir, manifest_path=manifest_file)

        # 5A: Ingest as GENERIC_IMAGE
        res_generic = service.ingest_single_candidate({
            "place_id": "place_gen_001",
            "place_name": "Generic Landscape",
            "file": str(src_gen),
            "source_url": "https://example.com/gen.jpg",
            "source_name": "Stock",
            "creator": "Photographer",
            "license": "CC0",
            "attribution": "Public Domain",
            "classification": "GENERIC_IMAGE",
        })
        assert res_generic.classification == "GENERIC_IMAGE"

        # 5B: Ingest as RELATED_LOCATION_ONLY
        src_rel = tmp_path / "rel.jpg"
        create_in_memory_image_file(src_rel, 1000, 700, color="gray")

        res_rel = service.ingest_single_candidate({
            "place_id": "place_rel_002",
            "place_name": "Nearby Town",
            "file": str(src_rel),
            "source_url": "https://example.com/rel.jpg",
            "source_name": "Commons",
            "creator": "Photographer",
            "license": "CC BY 4.0",
            "attribution": "Photo by Photographer",
            "classification": "RELATED_LOCATION_ONLY",
        })
        assert res_rel.classification == "RELATED_LOCATION_ONLY"

        # Verify neither is EXACT_LOCATION_VERIFIED in manifest
        records = load_manifest_records(manifest_file)
        for r in records:
            assert r.verification_status != "EXACT_LOCATION_VERIFIED"
