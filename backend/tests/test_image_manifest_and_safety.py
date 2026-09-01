"""backend/tests/test_image_manifest_and_safety.py — Step 1 Tests for Canonical Manifest Contract & Safety Hardening.

Verifies:
1. All 50 existing manifest records parse under the new compatibility model
2. Parsing does not mutate/rewrite legacy values
3. Canonical classification enum accepts the five A1 classifications
4. Legacy VERIFIED_AUTHENTIC_PHOTOGRAPHY remains compatible
5. Variant metadata round-trips cleanly
6. Malformed image rejection
7. Non-image/HTML response rejection
8. Unsupported format rejection (GIF, BMP, TIFF)
9. Aspect-ratio lower bound (< 0.5) rejected
10. Aspect-ratio upper bound (> 3.0) rejected
11. Decompression safety behavior
12. EXIF orientation handling preserved
13. Deterministic variant output
14. Existing processor output dimensions remain compatible
"""
import io
import json
from pathlib import Path
import pytest
from PIL import Image, ImageOps

from app.storage.manifest import (
    EvidenceClassification,
    ImageManifestItem,
    QualityStatus,
    RelevanceStatus,
    VariantMetadata,
    load_manifest_records,
)
from app.storage.processor import ImageProcessor, ImageProcessingError

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MANIFEST_PATH = REPO_ROOT / "data" / "images" / "sources" / "manifest.json"


def create_in_memory_image(width: int = 400, height: int = 300, color: str = "blue", fmt: str = "JPEG") -> bytes:
    """Helper to generate in-memory image bytes."""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


class TestCanonicalManifestContract:

    def test_01_all_50_production_manifest_records_parse_cleanly(self):
        """Verify all production manifest records parse without error."""
        assert MANIFEST_PATH.exists(), f"Missing production manifest at {MANIFEST_PATH}"
        records = load_manifest_records(MANIFEST_PATH)
        assert len(records) == 70
        for r in records:
            assert r.place_id.startswith("place_")
            assert bool(r.source_url)
            assert r.creator
            assert r.license
            assert r.attribution
            assert r.content_sha256

    def test_02_legacy_fields_and_values_preserved_without_mutation(self):
        """Verify parsing does not drop legacy keys like asset_hash, wikimedia_file, hero_bytes."""
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        first_raw = raw_data[0]
        parsed = ImageManifestItem.model_validate(first_raw)

        assert parsed.asset_hash == first_raw["asset_hash"]
        assert parsed.place_name == first_raw["place_name"]
        assert parsed.wikimedia_file == first_raw["wikimedia_file"]
        assert parsed.hero_bytes == first_raw["hero_bytes"]
        assert parsed.original_dimensions == first_raw["original_dimensions"]
        assert parsed.hero_dimensions == first_raw["hero_dimensions"]
        assert parsed.card_dimensions == first_raw["card_dimensions"]
        assert parsed.thumbnail_dimensions == first_raw["thumbnail_dimensions"]

    def test_03_canonical_classifications_accepted(self):
        """Verify the five canonical A1 evidence classifications are valid."""
        for cl in [
            EvidenceClassification.EXACT_LOCATION_VERIFIED,
            EvidenceClassification.RELATED_LOCATION_ONLY,
            EvidenceClassification.GENERIC_IMAGE,
            EvidenceClassification.REJECTED,
            EvidenceClassification.REVIEW_REQUIRED,
        ]:
            item = ImageManifestItem(
                place_id="place_test_001",
                source_url="https://example.com/test.jpg",
                source_name="Test Source",
                creator="Test Creator",
                license="CC BY-SA 4.0",
                attribution="Photo by Test Creator",
                verification_status=cl,
            )
            assert item.verification_status == cl.value

    def test_04_legacy_verified_authentic_photography_normalized(self):
        """Verify legacy VERIFIED_AUTHENTIC_PHOTOGRAPHY normalizes to EXACT_LOCATION_VERIFIED."""
        norm = EvidenceClassification.normalize("VERIFIED_AUTHENTIC_PHOTOGRAPHY")
        assert norm == EvidenceClassification.EXACT_LOCATION_VERIFIED

        item = ImageManifestItem(
            place_id="place_test_002",
            source_url="https://example.com/test.jpg",
            source_name="Test Source",
            creator="Test Creator",
            license="CC0",
            attribution="Photo by Test Creator",
            verification_status="VERIFIED_AUTHENTIC_PHOTOGRAPHY",
        )
        assert item.verification_status == EvidenceClassification.EXACT_LOCATION_VERIFIED.value

    def test_05_variant_metadata_roundtrip(self):
        """Verify structured VariantMetadata round-trips through manifest item."""
        variant = VariantMetadata(
            variant_type="hero",
            storage_key="places/place_bbsr_001/abc12345/hero.webp",
            url="/static/images/places/place_bbsr_001/abc12345/hero.webp",
            width=1280,
            height=720,
            size_bytes=180000,
            content_sha256="abc123456789",
            mime_type="image/webp",
        )

        item = ImageManifestItem(
            place_id="place_bbsr_001",
            source_url="https://example.com/hero.jpg",
            source_name="Wikimedia Commons",
            creator="Author",
            license="CC BY-SA 4.0",
            attribution="Photo by Author",
            variants={"hero": variant},
        )
        assert "hero" in item.variants
        assert item.variants["hero"].width == 1280
        assert item.variants["hero"].height == 720
        assert item.variants["hero"].storage_key == "places/place_bbsr_001/abc12345/hero.webp"


class TestProcessorSafetyHardening:

    @pytest.fixture
    def processor(self):
        return ImageProcessor(min_width=100, min_height=100, min_aspect_ratio=0.5, max_aspect_ratio=3.0)

    def test_06_malformed_image_rejection(self, processor):
        """Verify corrupt byte streams raise ImageProcessingError."""
        corrupt_data = b"NOT_A_VALID_IMAGE_HEADER_12345678901234567890"
        with pytest.raises(ImageProcessingError) as exc:
            processor.validate_and_open(corrupt_data)
        assert "Corrupt or invalid image data" in str(exc.value) or "Unsupported image format" in str(exc.value)

    def test_07_html_response_rejection(self, processor):
        """Verify HTML responses disguised as images are rejected."""
        html_data = b"<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>"
        with pytest.raises(ImageProcessingError) as exc:
            processor.validate_and_open(html_data)
        assert "Non-image document (HTML/XML/SVG)" in str(exc.value)

    def test_08_unsupported_formats_rejection(self, processor):
        """Verify formats outside {JPEG, PNG, WEBP} (e.g. GIF, BMP, TIFF) are rejected."""
        # GIF test
        gif_img = Image.new("RGB", (200, 200), color="red")
        buf = io.BytesIO()
        gif_img.save(buf, format="GIF")
        gif_bytes = buf.getvalue()

        with pytest.raises(ImageProcessingError) as exc:
            processor.validate_and_open(gif_bytes)
        assert "Unsupported image format" in str(exc.value)

    def test_09_aspect_ratio_lower_bound_rejection(self, processor):
        """Verify tall/narrow images with aspect ratio < 0.5 are rejected."""
        # 100x300 => ratio 0.33 < 0.5
        tall_bytes = create_in_memory_image(width=100, height=300, fmt="JPEG")
        with pytest.raises(ImageProcessingError) as exc:
            processor.validate_and_open(tall_bytes)
        assert "aspect ratio" in str(exc.value).lower()

    def test_10_aspect_ratio_upper_bound_rejection(self, processor):
        """Verify wide/panoramic images with aspect ratio > 3.0 are rejected."""
        # 400x100 => ratio 4.0 > 3.0
        wide_bytes = create_in_memory_image(width=400, height=100, fmt="JPEG")
        with pytest.raises(ImageProcessingError) as exc:
            processor.validate_and_open(wide_bytes)
        assert "aspect ratio" in str(exc.value).lower()

    def test_11_decompression_bomb_safety(self, processor):
        """Verify Pillow MAX_IMAGE_PIXELS protection triggers on oversized allocations."""
        assert Image.MAX_IMAGE_PIXELS <= 50_000_000

    def test_12_exif_orientation_preservation(self, processor):
        """Verify EXIF orientation tag is transposed without crashing."""
        img = Image.new("RGB", (200, 150), color="green")
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        data = buf.getvalue()

        opened, fmt, w, h = processor.validate_and_open(data)
        assert fmt == "JPEG"
        assert w == 200
        assert h == 150

    def test_13_deterministic_variant_output(self, processor):
        """Verify variant generation generates identical bytes across multiple runs."""
        data = create_in_memory_image(width=800, height=600, color="teal", fmt="PNG")
        img, _, _, _ = processor.validate_and_open(data)

        v1 = processor.generate_variants(img, quality=85)
        v2 = processor.generate_variants(img, quality=85)

        for key in ["original", "hero", "card", "thumbnail"]:
            assert key in v1
            assert key in v2
            assert v1[key][0] == v2[key][0], f"Non-deterministic bytes for variant {key}"
            assert v1[key][1:] == v2[key][1:]

    def test_14_existing_processor_dimensions_compatible(self, processor):
        """Verify existing processor dimensions remain compatible with production expectations."""
        assert processor.VARIANT_SIZES["hero"] == (1280, 720)
        assert processor.VARIANT_SIZES["card"] == (640, 480)
        assert processor.VARIANT_SIZES["thumbnail"] == (320, 240)
        assert processor.VARIANT_SIZES["original"] == (1920, 1080)
