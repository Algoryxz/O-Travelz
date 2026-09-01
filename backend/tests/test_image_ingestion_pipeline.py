"""backend/tests/test_image_ingestion_pipeline.py — Comprehensive Unit Tests for Step 2 Unified Image Ingestion CLI.

Verifies:
1. Valid JPEG URL ingestion
2. Valid PNG / local-file ingestion
3. Malformed image rejection
4. HTML response rejection
5. Undersized source rejection (< 800x450)
6. SHA-256 calculation correctness
7. Same-place exact duplicate idempotency
8. Different-place exact duplicate detection
9. Deterministic canonical output path
10. All 4 variants written (original, hero, card, thumbnail)
11. Variant metadata populated
12. Manifest append
13. Manifest rerun without duplicate rows
14. Provenance required (missing place_id/source rejected)
15. Missing/invalid license rejected
16. --dry-run produces zero filesystem mutation
17. EXACT_LOCATION_VERIFIED retained when explicitly supplied
18. GENERIC_IMAGE never promoted
19. RELATED_LOCATION_ONLY never promoted
20. Batch item isolation
21. Rerun idempotency
22. Azure upload failure preserves local success
"""
import io
import json
import shutil
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch
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
    IngestionSummary,
    parse_candidates_file,
)
from app.storage.downloader import MockImageDownloader
from app.storage.manifest import (
    EvidenceClassification,
    ImageManifestItem,
    load_manifest_records,
)
from app.storage.processor import ImageProcessor


def create_in_memory_image_bytes(width: int = 1200, height: int = 800, color: str = "blue", fmt: str = "JPEG") -> bytes:
    """Helper to generate high-resolution in-memory image bytes."""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


@pytest.fixture
def temp_workspace(tmp_path):
    """Fixture providing isolated storage directory and manifest path."""
    storage_dir = tmp_path / "images"
    manifest_path = storage_dir / "sources" / "manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text("[]", encoding="utf-8")
    return {
        "root": tmp_path,
        "storage_dir": storage_dir,
        "manifest_path": manifest_path,
    }


class TestImageIngestionPipeline:

    def test_01_valid_jpeg_url_ingestion(self, temp_workspace):
        """Verify valid JPEG URL is downloaded, decoded, processed, and persisted."""
        mock_bytes = create_in_memory_image_bytes(1280, 720, color="orange", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/konark.jpg": mock_bytes})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        item_spec = {
            "place_id": "place_konark_001",
            "place_name": "Konark Sun Temple",
            "source_url": "https://example.com/konark.jpg",
            "source_name": "Wikimedia Commons",
            "creator": "Test Photographer",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Test Photographer via Wikimedia Commons",
            "classification": "EXACT_LOCATION_VERIFIED",
        }

        res = service.ingest_single_candidate(item_spec)
        assert res.status == "SUCCEEDED"
        assert res.asset_hash is not None
        assert res.content_sha256 is not None
        assert res.classification == "EXACT_LOCATION_VERIFIED"
        assert len(res.variants_written) == 4

        # Verify manifest entry created
        records = load_manifest_records(temp_workspace["manifest_path"])
        assert len(records) == 1
        assert records[0].place_id == "place_konark_001"
        assert records[0].content_sha256 == res.content_sha256

    def test_02_valid_png_local_file_ingestion(self, temp_workspace):
        """Verify valid local PNG file is ingested from local filesystem."""
        mock_bytes = create_in_memory_image_bytes(900, 600, color="green", fmt="PNG")
        local_png = temp_workspace["root"] / "source.png"
        local_png.write_bytes(mock_bytes)

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
        )

        item_spec = {
            "place_id": "place_puri_001",
            "place_name": "Jagannath Temple",
            "file": str(local_png),
            "source_name": "O-Travelz Field Team",
            "creator": "Field Photographer",
            "license": "CC0",
            "attribution": "Photo by Field Photographer",
            "classification": "EXACT_LOCATION_VERIFIED",
        }

        res = service.ingest_single_candidate(item_spec)
        assert res.status == "SUCCEEDED"
        assert len(res.variants_written) == 4
        records = load_manifest_records(temp_workspace["manifest_path"])
        assert len(records) == 1
        assert records[0].place_id == "place_puri_001"

    def test_03_malformed_image_rejection(self, temp_workspace):
        """Verify corrupt image bytes are rejected."""
        corrupt_bytes = b"CORRUPT_HEADER_STREAM_12345678901234567890"
        downloader = MockImageDownloader({"https://example.com/bad.jpg": corrupt_bytes})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        res = service.ingest_single_candidate({
            "place_id": "place_test_bad",
            "source_url": "https://example.com/bad.jpg",
            "license": "CC BY 4.0",
        })
        assert res.status == "REJECTED"
        assert "decoding/safety failure" in res.reason.lower()

    def test_04_html_response_rejection(self, temp_workspace):
        """Verify HTML error page returned as image is rejected."""
        html_bytes = b"<!DOCTYPE html><html><body>Error 404</body></html>"
        downloader = MockImageDownloader({"https://example.com/not_image.jpg": html_bytes})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        res = service.ingest_single_candidate({
            "place_id": "place_test_html",
            "source_url": "https://example.com/not_image.jpg",
            "license": "CC BY 4.0",
        })
        assert res.status == "REJECTED"
        assert "non-image" in res.reason.lower()

    def test_05_undersized_source_rejection(self, temp_workspace):
        """Verify source images below 800x450 are rejected by default A1 threshold."""
        small_bytes = create_in_memory_image_bytes(500, 300, color="purple", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/small.jpg": small_bytes})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
            min_width=800,
            min_height=450,
        )

        res = service.ingest_single_candidate({
            "place_id": "place_small_001",
            "source_url": "https://example.com/small.jpg",
            "license": "CC BY 4.0",
        })
        assert res.status == "REJECTED"
        assert "below required threshold" in res.reason.lower()

    def test_06_sha256_correctness(self, temp_workspace):
        """Verify SHA-256 calculation matches actual byte digest."""
        import hashlib
        data = create_in_memory_image_bytes(1000, 700, color="magenta", fmt="PNG")
        expected_sha = hashlib.sha256(data).hexdigest()

        downloader = MockImageDownloader({"https://example.com/sha.png": data})
        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        res = service.ingest_single_candidate({
            "place_id": "place_sha_001",
            "source_url": "https://example.com/sha.png",
            "license": "CC0",
        })
        assert res.status == "SUCCEEDED"
        assert res.content_sha256 == expected_sha
        assert res.asset_hash == expected_sha[:12]

    def test_07_same_place_exact_duplicate_idempotency(self, temp_workspace):
        """Verify re-ingesting the exact same image for the same place returns ALREADY_EXISTS."""
        data = create_in_memory_image_bytes(1280, 720, color="cyan", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/dup.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        spec = {
            "place_id": "place_dup_001",
            "source_url": "https://example.com/dup.jpg",
            "license": "CC BY-SA 4.0",
            "creator": "Photographer",
            "attribution": "Photo by Photographer",
        }

        res1 = service.ingest_single_candidate(spec)
        assert res1.status == "SUCCEEDED"

        # Rerun
        res2 = service.ingest_single_candidate(spec)
        assert res2.status == "ALREADY_EXISTS"

        records = load_manifest_records(temp_workspace["manifest_path"])
        assert len(records) == 1

    def test_08_different_place_exact_duplicate_detection(self, temp_workspace):
        """Verify same image ingested for a DIFFERENT place is flagged REVIEW_REQUIRED as duplicate."""
        data = create_in_memory_image_bytes(1280, 720, color="navy", fmt="JPEG")
        downloader = MockImageDownloader({
            "https://example.com/shared.jpg": data,
        })

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        spec1 = {
            "place_id": "place_orig_001",
            "source_url": "https://example.com/shared.jpg",
            "license": "CC BY 4.0",
            "classification": "EXACT_LOCATION_VERIFIED",
        }
        res1 = service.ingest_single_candidate(spec1)
        assert res1.status == "SUCCEEDED"

        spec2 = {
            "place_id": "place_diff_002",
            "source_url": "https://example.com/shared.jpg",
            "license": "CC BY 4.0",
            "classification": "EXACT_LOCATION_VERIFIED",
        }
        res2 = service.ingest_single_candidate(spec2)
        assert res2.status == "SUCCEEDED"
        assert res2.classification == "REVIEW_REQUIRED"

    def test_09_deterministic_canonical_output_path(self, temp_workspace):
        """Verify files are written to data/images/places/<place_id>/<asset_hash>/."""
        data = create_in_memory_image_bytes(1280, 720, color="yellow", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/path.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        res = service.ingest_single_candidate({
            "place_id": "place_path_001",
            "source_url": "https://example.com/path.jpg",
            "license": "CC0",
        })
        target_dir = Path(res.target_dir)
        assert target_dir.parent.name == "place_path_001"
        assert target_dir.name == res.asset_hash

    def test_10_all_4_variants_written(self, temp_workspace):
        """Verify original, hero, card, thumbnail WebP files exist on disk."""
        data = create_in_memory_image_bytes(1280, 720, color="pink", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/v4.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        res = service.ingest_single_candidate({
            "place_id": "place_v4_001",
            "source_url": "https://example.com/v4.jpg",
            "license": "CC BY 4.0",
        })
        target_dir = Path(res.target_dir)
        for var in ["original.webp", "hero.webp", "card.webp", "thumbnail.webp"]:
            assert (target_dir / var).is_file()
            assert (target_dir / var).stat().st_size > 0

    def test_11_variant_metadata_populated(self, temp_workspace):
        """Verify VariantMetadata objects are populated in manifest item."""
        data = create_in_memory_image_bytes(1280, 720, color="gray", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/vmeta.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        service.ingest_single_candidate({
            "place_id": "place_vmeta_001",
            "source_url": "https://example.com/vmeta.jpg",
            "license": "CC BY-SA 4.0",
        })

        records = load_manifest_records(temp_workspace["manifest_path"])
        r = records[0]
        assert "hero" in r.variants
        assert r.variants["hero"].width == 1280
        assert r.variants["hero"].height == 720
        assert r.variants["hero"].storage_key.endswith("hero.webp")

    def test_12_manifest_append(self, temp_workspace):
        """Verify multiple distinct images append correctly to manifest."""
        data1 = create_in_memory_image_bytes(1280, 720, color="red", fmt="JPEG")
        data2 = create_in_memory_image_bytes(1280, 720, color="blue", fmt="JPEG")
        downloader = MockImageDownloader({
            "https://example.com/img1.jpg": data1,
            "https://example.com/img2.jpg": data2,
        })

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        service.ingest_single_candidate({"place_id": "place_1", "source_url": "https://example.com/img1.jpg", "license": "CC0"})
        service.ingest_single_candidate({"place_id": "place_2", "source_url": "https://example.com/img2.jpg", "license": "CC0"})

        records = load_manifest_records(temp_workspace["manifest_path"])
        assert len(records) == 2
        assert records[0].place_id == "place_1"
        assert records[1].place_id == "place_2"

    def test_13_manifest_rerun_without_duplication(self, temp_workspace):
        """Verify running ingestion multiple times maintains exactly one manifest row."""
        data = create_in_memory_image_bytes(1280, 720, color="brown", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/rerun.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        spec = {"place_id": "place_rerun_001", "source_url": "https://example.com/rerun.jpg", "license": "CC BY-SA 4.0"}
        service.ingest_single_candidate(spec)
        service.ingest_single_candidate(spec)
        service.ingest_single_candidate(spec)

        records = load_manifest_records(temp_workspace["manifest_path"])
        assert len(records) == 1

    def test_14_provenance_required(self, temp_workspace):
        """Verify candidate with missing place_id or source is rejected."""
        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
        )

        res1 = service.ingest_single_candidate({"source_url": "https://example.com/a.jpg"})
        assert res1.status == "REJECTED"
        assert "place_id" in res1.reason

        res2 = service.ingest_single_candidate({"place_id": "place_no_src"})
        assert res2.status == "REJECTED"
        assert "source_url" in res2.reason

    def test_15_invalid_license_rejected(self, temp_workspace):
        """Verify non-permissive/unknown license is rejected."""
        data = create_in_memory_image_bytes(1280, 720, fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/bad_lic.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        res = service.ingest_single_candidate({
            "place_id": "place_bad_lic",
            "source_url": "https://example.com/bad_lic.jpg",
            "license": "All Rights Reserved - Copyright 2026",
        })
        assert res.status == "REJECTED"
        assert "license" in res.reason.lower()

    def test_16_dry_run_produces_zero_filesystem_mutation(self, temp_workspace):
        """Verify --dry-run executes full validation without writing any files or manifest rows."""
        data = create_in_memory_image_bytes(1280, 720, color="teal", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/dry.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
            dry_run=True,
        )

        res = service.ingest_single_candidate({
            "place_id": "place_dry_001",
            "source_url": "https://example.com/dry.jpg",
            "license": "CC0",
        })
        assert res.status == "SUCCEEDED"
        assert "[DRY-RUN]" in res.reason

        # Ensure zero files written
        target_dir = Path(res.target_dir)
        assert not target_dir.exists()

        records = load_manifest_records(temp_workspace["manifest_path"])
        assert len(records) == 0

    def test_17_exact_location_verified_retained_when_supplied(self, temp_workspace):
        """Verify explicit EXACT_LOCATION_VERIFIED is preserved."""
        data = create_in_memory_image_bytes(1280, 720, color="gold", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/exact.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        res = service.ingest_single_candidate({
            "place_id": "place_exact_001",
            "source_url": "https://example.com/exact.jpg",
            "license": "CC BY-SA 4.0",
            "classification": "EXACT_LOCATION_VERIFIED",
        })
        assert res.classification == "EXACT_LOCATION_VERIFIED"
        records = load_manifest_records(temp_workspace["manifest_path"])
        assert records[0].verification_status == "EXACT_LOCATION_VERIFIED"

    def test_18_generic_image_never_promoted(self, temp_workspace):
        """Verify generic_image is NOT promoted to EXACT_LOCATION_VERIFIED."""
        data = create_in_memory_image_bytes(1280, 720, color="khaki", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/gen.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        res = service.ingest_single_candidate({
            "place_id": "place_gen_001",
            "source_url": "https://example.com/gen.jpg",
            "license": "CC0",
            "classification": "GENERIC_IMAGE",
        })
        assert res.classification == "GENERIC_IMAGE"
        records = load_manifest_records(temp_workspace["manifest_path"])
        assert records[0].verification_status == "GENERIC_IMAGE"

    def test_19_related_location_only_never_promoted(self, temp_workspace):
        """Verify related_location_only is NOT promoted to EXACT_LOCATION_VERIFIED."""
        data = create_in_memory_image_bytes(1280, 720, color="olive", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/rel.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        res = service.ingest_single_candidate({
            "place_id": "place_rel_001",
            "source_url": "https://example.com/rel.jpg",
            "license": "CC BY 4.0",
            "classification": "RELATED_LOCATION_ONLY",
        })
        assert res.classification == "RELATED_LOCATION_ONLY"
        records = load_manifest_records(temp_workspace["manifest_path"])
        assert records[0].verification_status == "RELATED_LOCATION_ONLY"

    def test_20_batch_item_isolation(self, temp_workspace):
        """Verify failure in one item does not prevent other valid batch items from succeeding."""
        good_data = create_in_memory_image_bytes(1280, 720, color="blue", fmt="JPEG")
        downloader = MockImageDownloader({
            "https://example.com/good1.jpg": good_data,
            "https://example.com/good2.jpg": good_data,
            "https://example.com/bad.jpg": b"corrupt",
        })

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        batch_specs = [
            {"place_id": "place_good_1", "source_url": "https://example.com/good1.jpg", "license": "CC0"},
            {"place_id": "place_bad_1", "source_url": "https://example.com/bad.jpg", "license": "CC0"},
            {"place_id": "place_good_2", "source_url": "https://example.com/good2.jpg", "license": "CC0"},
        ]

        summary = service.ingest_batch(batch_specs)
        assert summary.total == 3
        assert summary.succeeded >= 1
        assert summary.rejected >= 1 or summary.failed >= 1

        records = load_manifest_records(temp_workspace["manifest_path"])
        place_ids = {r.place_id for r in records}
        assert "place_good_1" in place_ids
        assert "place_bad_1" not in place_ids

    def test_21_rerun_idempotency(self, temp_workspace):
        """Verify multiple batch runs produce idempotent summary and manifest state."""
        data = create_in_memory_image_bytes(1280, 720, color="coral", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/coral.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        batch = [{"place_id": "place_coral_001", "source_url": "https://example.com/coral.jpg", "license": "CC BY-SA 4.0"}]
        sum1 = service.ingest_batch(batch)
        assert sum1.succeeded == 1

        sum2 = service.ingest_batch(batch)
        assert sum2.already_exists == 1

    def test_22_azure_failure_preserves_local_success(self, temp_workspace):
        """Verify Azure upload exception does not fail or roll back local image persistence."""
        data = create_in_memory_image_bytes(1280, 720, color="indigo", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/azure.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
            upload_azure=True,
        )

        with patch("ingest_destination_images.AzureBlobImageStorage") as mock_azure_cls:
            mock_inst = MagicMock()
            mock_inst.save_image.side_effect = Exception("Azure network timeout")
            mock_azure_cls.return_value = mock_inst

            res = service.ingest_single_candidate({
                "place_id": "place_azure_001",
                "source_url": "https://example.com/azure.jpg",
                "license": "CC0",
            })
            # Local ingestion still succeeds!
            assert res.status == "SUCCEEDED"
            assert res.azure_uploaded is False

            # Files exist locally
            target_dir = Path(res.target_dir)
            assert (target_dir / "hero.webp").exists()

            records = load_manifest_records(temp_workspace["manifest_path"])
            assert len(records) == 1

    def test_23_cross_place_duplicate_preserves_supplied_classification_in_notes(self, temp_workspace):
        """Verify cross-place duplicate sets status REVIEW_REQUIRED but retains supplied classification in notes."""
        data = create_in_memory_image_bytes(1280, 720, color="teal", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/same_sha.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        # First place
        service.ingest_single_candidate({
            "place_id": "place_a_001",
            "source_url": "https://example.com/same_sha.jpg",
            "license": "CC BY-SA 4.0",
            "classification": "EXACT_LOCATION_VERIFIED",
        })

        # Second place with same image
        res2 = service.ingest_single_candidate({
            "place_id": "place_b_002",
            "source_url": "https://example.com/same_sha.jpg",
            "license": "CC BY-SA 4.0",
            "classification": "EXACT_LOCATION_VERIFIED",
        })

        assert res2.classification == "REVIEW_REQUIRED"
        records = load_manifest_records(temp_workspace["manifest_path"])
        item_b = next(r for r in records if r.place_id == "place_b_002")
        assert item_b.verification_status == "REVIEW_REQUIRED"
        assert "Cross-place duplicate with place_a_001" in item_b.notes
        assert "EXACT_LOCATION_VERIFIED" in item_b.notes

    def test_24_atomicity_case_b_manifest_failure_rollback_no_orphan_dir(self, temp_workspace):
        """Verify that if manifest update fails, written variant files are rolled back (no orphan dir)."""
        data = create_in_memory_image_bytes(1280, 720, color="violet", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/orphan_test.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        with patch.object(service, "_atomic_manifest_update", side_effect=IOError("Simulated disk error")):
            res = service.ingest_single_candidate({
                "place_id": "place_orphan_001",
                "source_url": "https://example.com/orphan_test.jpg",
                "license": "CC0",
            })
            assert res.status == "FAILED"
            assert "Manifest update failed" in res.reason

            # Verify no orphan directory remains
            place_dir = temp_workspace["storage_dir"] / "places" / "place_orphan_001"
            assert not place_dir.exists()

    def test_25_atomicity_case_a_variant_gen_failure_no_files_written(self, temp_workspace):
        """Verify that if variant generation fails, no files or manifest updates occur."""
        data = create_in_memory_image_bytes(1280, 720, color="gray", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/v_fail.jpg": data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=temp_workspace["manifest_path"],
            downloader=downloader,
        )

        with patch.object(service.processor, "generate_variants", side_effect=RuntimeError("LANCZOS failure")):
            res = service.ingest_single_candidate({
                "place_id": "place_vfail_001",
                "source_url": "https://example.com/v_fail.jpg",
                "license": "CC0",
            })
            assert res.status == "FAILED"
            assert "Variant generation failed" in res.reason

            place_dir = temp_workspace["storage_dir"] / "places" / "place_vfail_001"
            assert not place_dir.exists()
            records = load_manifest_records(temp_workspace["manifest_path"])
            assert len(records) == 0

    def test_26_real_azure_storage_integration_seam(self):
        """Verify real AzureBlobImageStorage class can be imported and initialized unauthenticated."""
        from app.storage.azure_blob import AzureBlobImageStorage

        storage = AzureBlobImageStorage(account_name=None, connection_string=None)
        assert storage._client is None
        assert storage.container_name == "otravelz-images"

    def test_27_candidate_parser_unverified_lead_never_promoted(self, tmp_path):
        """Verify candidates with image_status='pending' parse to REVIEW_REQUIRED."""
        candidates_json = tmp_path / "candidates.json"
        candidates_data = [
            {
                "research_id": "round2_south_001",
                "name": "Padmasambhava Monastery",
                "district": "Gajapati",
                "region": "southern",
                "category": "heritage",
                "image_source_url": "https://upload.wikimedia.org/wikipedia/commons/a/a4/test.jpg",
                "image_source_domain": "commons.wikimedia.org",
                "image_license_note": "CC BY-SA 3.0",
                "image_status": "pending",
                "coordinate_verification_status": "cross_checked",
                "researcher": "Susmita",
                "verification_status": "staging",
                "notes": "Research note",
            }
        ]
        candidates_json.write_text(json.dumps(candidates_data), encoding="utf-8")

        parsed = parse_candidates_file(candidates_json)
        assert len(parsed) == 1
        assert parsed[0]["place_id"] == "round2_south_001"
        assert parsed[0]["classification"] == "REVIEW_REQUIRED"

    def test_28_manifest_diff_preservation_raw_json(self, temp_workspace):
        """Verify ingesting a new record leaves all raw JSON dicts of untouched legacy entries identical."""
        # Create a mock manifest with two legacy records containing specific legacy fields
        legacy_record_1 = {
            "place_id": "place_legacy_001",
            "place_name": "Legacy Temple One",
            "asset_hash": "111111111111",
            "source_url": "https://upload.wikimedia.org/legacy1.jpg",
            "download_url": "/static/images/places/place_legacy_001/111111111111/hero.webp",
            "wikimedia_file": "File:Legacy1.jpg",
            "source_name": "Wikimedia Commons",
            "creator": "Legacy Author One",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Legacy Author One",
            "is_primary": True,
            "sort_order": 1,
            "content_sha256": "1111111111112222222222223333333333334444444444445555555555556666",
            "original_dimensions": [1280, 960],
            "hero_dimensions": [1080, 720],
            "card_dimensions": [640, 360],
            "thumbnail_dimensions": [240, 160],
            "hero_bytes": 182190,
            "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY",
        }
        legacy_record_2 = {
            "place_id": "place_legacy_002",
            "place_name": "Legacy Temple Two",
            "asset_hash": "222222222222",
            "source_url": "https://upload.wikimedia.org/legacy2.jpg",
            "download_url": "/static/images/places/place_legacy_002/222222222222/hero.webp",
            "wikimedia_file": "File:Legacy2.jpg",
            "source_name": "Wikimedia Commons",
            "creator": "Legacy Author Two",
            "license": "CC0",
            "attribution": "Photo by Legacy Author Two",
            "is_primary": True,
            "sort_order": 2,
            "content_sha256": "2222222222223333333333334444444444445555555555556666666666667777",
            "original_dimensions": [1024, 768],
            "hero_dimensions": [1080, 720],
            "card_dimensions": [640, 360],
            "thumbnail_dimensions": [240, 160],
            "hero_bytes": 145000,
            "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY",
        }

        manifest_file = temp_workspace["manifest_path"]
        manifest_file.write_text(json.dumps([legacy_record_1, legacy_record_2], indent=2), encoding="utf-8")

        # Ingest a brand new 3rd place
        new_data = create_in_memory_image_bytes(1280, 720, color="pink", fmt="JPEG")
        downloader = MockImageDownloader({"https://example.com/new_place.jpg": new_data})

        service = DestinationImageIngestionService(
            storage_base_dir=temp_workspace["storage_dir"],
            manifest_path=manifest_file,
            downloader=downloader,
        )

        res = service.ingest_single_candidate({
            "place_id": "place_new_003",
            "place_name": "New Place Three",
            "source_url": "https://example.com/new_place.jpg",
            "license": "CC BY 4.0",
            "creator": "New Author",
            "attribution": "Photo by New Author",
        })
        assert res.status == "SUCCEEDED"

        # Read the raw JSON from disk
        with open(manifest_file, "r", encoding="utf-8") as f:
            raw_after = json.load(f)

        assert len(raw_after) == 3

        # Untouched records must be identical in raw keys and values
        assert raw_after[0] == legacy_record_1
        assert raw_after[1] == legacy_record_2
        assert raw_after[2]["place_id"] == "place_new_003"

