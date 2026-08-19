"""Unit and integration tests for Image Ingestion Pipeline and Provenance Engine."""
import io
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import MagicMock
import pytest
from PIL import Image

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

scripts_dir = backend_dir.parent / "scripts"
if str(scripts_dir) not in sys.path:
    sys.path.insert(0, str(scripts_dir))

from ingest_place_images import (
    ImageIngestionPipeline,
    IngestionReport,
    ManifestEntry,
)
from app.models.category import Category
from app.models.place import Place
from app.models.place_image import PlaceImage
from app.storage.base import StoredAsset
from app.storage.downloader import DownloadError, MockImageDownloader
from app.storage.local import LocalImageStorage
from app.storage.azure_blob import AzureBlobImageStorage
from app.storage.processor import ImageProcessor, ImageProcessingError


def create_test_image_bytes(width: int = 400, height: int = 300, color: str = "blue", fmt: str = "JPEG") -> bytes:
    """Helper to generate in-memory test image bytes."""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


class MockQuery:
    def __init__(self, model, items):
        self.model = model
        self.items = list(items)

    def filter(self, *expressions):
        filtered = []
        for item in self.items:
            match = True
            for expr in expressions:
                try:
                    left = getattr(expr, "left", None)
                    right = getattr(expr, "right", None)
                    if left is not None and right is not None:
                        col_name = getattr(left, "key", getattr(left, "name", None))
                        val = getattr(right, "value", right)
                        item_val = getattr(item, col_name, None)
                        if str(item_val) != str(val):
                            match = False
                            break
                except Exception:
                    pass
            if match:
                filtered.append(item)
        return MockQuery(self.model, filtered)

    def first(self):
        return self.items[0] if self.items else None

    def all(self):
        return list(self.items)


class MockSession:
    def __init__(self, places=None, images=None):
        self.places = list(places or [])
        self.images = list(images or [])
        self.added = []

    def query(self, model):
        if model == Place:
            return MockQuery(Place, self.places)
        if model == PlaceImage:
            return MockQuery(PlaceImage, self.images)
        return MockQuery(model, [])


    def add(self, obj):
        self.added.append(obj)
        if isinstance(obj, PlaceImage):
            self.images.append(obj)

    def commit(self):
        pass

    def close(self):
        pass


def test_manifest_entry_valid_provenance():
    """Verify ManifestEntry validates permissible licenses and required provenance."""
    data = {
        "place_id": "place_bbsr_001",
        "source_url": "https://commons.wikimedia.org/wiki/File:Lingaraj.jpg",
        "source_name": "Wikimedia Commons",
        "creator": "Subhashree Dash",
        "license": "CC BY-SA 4.0",
        "attribution": "Photo by Subhashree Dash / Wikimedia Commons / CC BY-SA 4.0",
        "title": "Lingaraj Temple",
        "alt_text": "Ancient stone temple",
        "is_primary": True,
    }
    entry = ManifestEntry.model_validate(data)
    assert entry.place_id == "place_bbsr_001"
    assert entry.license == "CC BY-SA 4.0"
    assert entry.is_primary is True


def test_manifest_entry_rejects_unapproved_license():
    """Verify ManifestEntry rejects non-permissive or ambiguous licenses."""
    data = {
        "place_id": "place_bbsr_001",
        "source_url": "https://example.com/img.jpg",
        "source_name": "Unknown Blog",
        "creator": "John Doe",
        "license": "All Rights Reserved (Commercial)",
        "attribution": "Copyright John Doe",
    }
    with pytest.raises(Exception) as exc:
        ManifestEntry.model_validate(data)
    assert "not in the approved license set" in str(exc.value)


def test_manifest_entry_rejects_missing_creator_or_attribution():
    """Verify ManifestEntry enforces non-empty creator and attribution."""
    data = {
        "place_id": "place_bbsr_001",
        "source_url": "https://example.com/img.jpg",
        "source_name": "Wikimedia Commons",
        "creator": "",
        "license": "CC0",
        "attribution": "Attribution",
    }
    with pytest.raises(Exception):
        ManifestEntry.model_validate(data)


def test_image_processor_validates_and_opens_image():
    """Verify ImageProcessor decodes valid image bytes and extracts dimensions."""
    data = create_test_image_bytes(800, 600, "green", "JPEG")
    processor = ImageProcessor()
    img, fmt, w, h = processor.validate_and_open(data)
    assert fmt == "JPEG"
    assert w == 800
    assert h == 600


def test_image_processor_rejects_corrupted_data():
    """Verify ImageProcessor rejects invalid byte stream."""
    processor = ImageProcessor()
    with pytest.raises(ImageProcessingError):
        processor.validate_and_open(b"not_an_image_corrupted_payload_data_here")


def test_image_processor_rejects_tiny_images():
    """Verify ImageProcessor rejects images below minimum resolution threshold."""
    data = create_test_image_bytes(50, 40, "red", "PNG")
    processor = ImageProcessor(min_width=100, min_height=100)
    with pytest.raises(ImageProcessingError) as exc:
        processor.validate_and_open(data)
    assert "dimensions (50x40) below minimum required" in str(exc.value)


def test_image_processor_generates_variants_preserving_aspect_ratio():
    """Verify variant generation produces WebP buffers and preserves aspect ratio."""
    data = create_test_image_bytes(1600, 1200, "yellow", "JPEG")  # 4:3 aspect ratio
    processor = ImageProcessor()
    img, _, orig_w, orig_h = processor.validate_and_open(data)
    variants = processor.generate_variants(img)

    assert "hero" in variants
    assert "card" in variants
    assert "thumbnail" in variants
    assert "original" in variants

    # Check thumbnail dimensions (max 320x240 for 4:3 -> 320x240)
    thumb_bytes, thumb_w, thumb_h = variants["thumbnail"]
    assert thumb_w <= 320 and thumb_h <= 240
    assert abs((thumb_w / thumb_h) - (orig_w / orig_h)) < 0.05
    assert thumb_bytes.startswith(b"RIFF") or len(thumb_bytes) > 0  # WebP signature


def test_pipeline_end_to_end_local_storage(tmp_path):
    """Verify complete ingestion pipeline with MockDownloader and LocalImageStorage."""
    place_uuid = uuid.uuid4()
    mock_place = Place(
        id=place_uuid,
        research_id="place_bbsr_001",
        name="Lingaraj Temple",
        category_id=uuid.uuid4(),
        source="https://odishatourism.gov.in",
    )
    db = MockSession(places=[mock_place])
    storage = LocalImageStorage(base_path=str(tmp_path), base_url="/static/images")

    test_bytes = create_test_image_bytes(1000, 750, "blue", "JPEG")
    url = "https://example.com/lingaraj.jpg"
    downloader = MockImageDownloader({url: test_bytes})

    pipeline = ImageIngestionPipeline(
        db_session=db,
        storage=storage,
        downloader=downloader,
    )

    raw_entry = {
        "place_id": "place_bbsr_001",
        "source_url": url,
        "source_name": "Wikimedia Commons",
        "creator": "Subhashree Dash",
        "license": "CC BY-SA 4.0",
        "attribution": "Photo by Subhashree Dash / CC BY-SA 4.0",
        "title": "Lingaraj Temple",
        "is_primary": True,
    }

    report = IngestionReport(total_entries=1)
    success = pipeline.ingest_entry(raw_entry, report)

    assert success is True
    assert report.uploaded == 1
    assert report.rejected == 0
    assert report.failed == 0
    assert len(db.added) == 1

    added_img = db.added[0]
    assert added_img.place_id == place_uuid
    assert added_img.license == "CC BY-SA 4.0"
    assert added_img.is_primary is True
    assert added_img.content_sha256 is not None
    assert "/static/images/places/place_bbsr_001/" in added_img.url


def test_pipeline_idempotent_duplicate_skip(tmp_path):
    """Verify pipeline skips existing image if SHA-256 hash matches unless forced."""
    place_uuid = uuid.uuid4()
    mock_place = Place(id=place_uuid, research_id="place_puri_001", name="Puri Beach", category_id=uuid.uuid4(), source="ASI")

    test_bytes = create_test_image_bytes(800, 600, "cyan", "JPEG")
    import hashlib
    sha = hashlib.sha256(test_bytes).hexdigest()

    existing_img = PlaceImage(
        id=uuid.uuid4(),
        place_id=place_uuid,
        url="/static/images/hero.webp",
        source_name="Test Source",
        license="CC0",
        attribution="Test Attribution",
        content_sha256=sha,
    )

    db = MockSession(places=[mock_place], images=[existing_img])
    storage = LocalImageStorage(base_path=str(tmp_path))
    downloader = MockImageDownloader({"https://example.com/puri.jpg": test_bytes})

    pipeline = ImageIngestionPipeline(
        db_session=db,
        storage=storage,
        downloader=downloader,
        force=False,
    )

    entry = {
        "place_id": "place_puri_001",
        "source_url": "https://example.com/puri.jpg",
        "source_name": "Test Source",
        "creator": "Author",
        "license": "CC0",
        "attribution": "Public Domain",
    }

    report = IngestionReport(total_entries=1)
    pipeline.ingest_entry(entry, report)

    assert report.skipped == 1
    assert report.uploaded == 0
    assert len(db.added) == 0


def test_pipeline_dry_run_mode(tmp_path):
    """Verify dry_run mode does not write files or persist to database."""
    mock_place = Place(id=uuid.uuid4(), research_id="place_konark_001", name="Konark Sun Temple", category_id=uuid.uuid4(), source="UNESCO")
    db = MockSession(places=[mock_place])
    storage = LocalImageStorage(base_path=str(tmp_path))
    test_bytes = create_test_image_bytes(800, 600, "orange", "JPEG")
    downloader = MockImageDownloader({"https://example.com/konark.jpg": test_bytes})

    pipeline = ImageIngestionPipeline(
        db_session=db,
        storage=storage,
        downloader=downloader,
        dry_run=True,
    )

    entry = {
        "place_id": "place_konark_001",
        "source_url": "https://example.com/konark.jpg",
        "source_name": "UNESCO",
        "creator": "ASI",
        "license": "CC0",
        "attribution": "UNESCO Heritage",
    }

    report = IngestionReport(total_entries=1)
    pipeline.ingest_entry(entry, report)

    assert report.uploaded == 1
    assert len(db.added) == 0  # Not added in dry-run
    # Ensure no storage files were written
    assert len(list(tmp_path.glob("**/*.*"))) == 0


def test_pipeline_handles_unknown_place_gracefully():
    """Verify pipeline rejects manifest item with unknown place ID without aborting."""
    db = MockSession(places=[])  # Empty places
    storage = LocalImageStorage(base_path="./tmp")
    pipeline = ImageIngestionPipeline(db_session=db, storage=storage)

    entry = {
        "place_id": "nonexistent_place_999",
        "source_url": "https://example.com/img.jpg",
        "source_name": "Test",
        "creator": "Test",
        "license": "CC0",
        "attribution": "Test",
    }

    report = IngestionReport(total_entries=1)
    success = pipeline.ingest_entry(entry, report)

    assert success is False
    assert report.rejected == 1
    assert len(report.rejections) == 1
    assert "not found in database" in report.rejections[0][2]


def test_pipeline_mocked_azure_storage_ingestion():
    """Verify ingestion pipeline functions seamlessly with AzureBlobImageStorage."""
    mock_client = MagicMock()
    mock_client.account_name = "azureotravelz"
    mock_container = MagicMock()
    mock_blob = MagicMock()
    mock_client.get_container_client.return_value = mock_container
    mock_container.get_blob_client.return_value = mock_blob

    azure_storage = AzureBlobImageStorage(
        container_name="test-container",
        cdn_base_url="https://cdn.o-travelz.com",
        client=mock_client,
    )

    mock_place = Place(id=uuid.uuid4(), research_id="place_similipal_001", name="Similipal National Park", category_id=uuid.uuid4(), source="Forest Dept")
    db = MockSession(places=[mock_place])
    test_bytes = create_test_image_bytes(1200, 800, "green", "JPEG")
    downloader = MockImageDownloader({"https://example.com/similipal.jpg": test_bytes})

    pipeline = ImageIngestionPipeline(
        db_session=db,
        storage=azure_storage,
        downloader=downloader,
    )

    entry = {
        "place_id": "place_similipal_001",
        "source_url": "https://example.com/similipal.jpg",
        "source_name": "Forest Dept Archive",
        "creator": "Officer in Charge",
        "license": "CC BY 4.0",
        "attribution": "Photo by Forest Dept Archive / CC BY 4.0",
    }

    report = IngestionReport(total_entries=1)
    pipeline.ingest_entry(entry, report)

    assert report.uploaded == 1
    assert len(db.added) == 1
    added_img = db.added[0]
    assert added_img.url.startswith("https://cdn.o-travelz.com/places/place_similipal_001/")


def test_manifest_entry_rejects_incomplete_unsplash_provenance():
    """Verify Unsplash URLs with missing creator, license, or attribution are strictly rejected."""
    # Case 1: Unsplash URL with empty creator
    with pytest.raises(Exception):
        ManifestEntry.model_validate({
            "place_id": "place_puri_001",
            "source_url": "https://images.unsplash.com/photo-1507525428034",
            "source_name": "Unsplash",
            "creator": "",  # Missing creator
            "license": "Unsplash Free License",
            "attribution": "Photo by on Unsplash",
        })

    # Case 2: Unsplash URL with missing attribution
    with pytest.raises(Exception):
        ManifestEntry.model_validate({
            "place_id": "place_puri_001",
            "source_url": "https://images.unsplash.com/photo-1507525428034",
            "source_name": "Unsplash",
            "creator": "Sean Oulashin",
            "license": "Unsplash Free License",
            "attribution": "   ",  # Blank attribution
        })

    # Case 3: Unsplash URL with unknown/unapproved license
    with pytest.raises(Exception):
        ManifestEntry.model_validate({
            "place_id": "place_puri_001",
            "source_url": "https://images.unsplash.com/photo-1507525428034",
            "source_name": "Unsplash",
            "creator": "Sean Oulashin",
            "license": "Unknown Proprietary",
            "attribution": "Photo by Sean Oulashin on Unsplash",
        })


def test_manifest_entry_accepts_complete_explicit_unsplash_provenance():
    """Verify Unsplash entries with complete explicit provenance are accepted."""
    entry = ManifestEntry.model_validate({
        "place_id": "place_puri_001",
        "source_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        "source_name": "Unsplash",
        "creator": "Sean Oulashin",
        "license": "Unsplash Free License",
        "attribution": "Photo by Sean Oulashin on Unsplash",
    })
    assert entry.creator == "Sean Oulashin"
    assert entry.license == "Unsplash Free License"


def test_controlled_multi_region_whole_odisha_ingestion(tmp_path):
    """Controlled multi-region whole-Odisha ingestion test across all 6 geographical zones."""
    regions_test_matrix = [
        ("place_puri_001", "Puri Jagannath Temple", "Puri & Coastal"),
        ("place_konark_001", "Konark Sun Temple", "Konark & Marine"),
        ("place_bbsr_001", "Lingaraj Temple", "Bhubaneswar & Central"),
        ("place_cuttack_001", "Barabati Fort", "Cuttack & Mahanadi"),
        ("place_chilika_001", "Chilika Lake - Satapada", "Chilika & Southern Coast"),
        ("place_daringbadi_001", "Daringbadi Hill Station", "Kandhamal & Southern Hills"),
        ("place_sambalpur_001", "Hirakud Dam & Reservoir", "Sambalpur & Western Odisha"),
        ("place_mayurbhanj_001", "Similipal National Park", "Northern Odisha & Wildlife"),
        ("place_kendrapara_001", "Bhitarkanika National Park", "Northern Odisha & Wildlife"),
        ("place_koraput_001", "Gupteswar Cave Temple", "Koraput & Tribal Highlands"),
        ("place_koraput_003", "Deomali Peak", "Koraput & Tribal Highlands"),
    ]

    places = []
    fixtures = {}
    manifest_entries = []

    for idx, (p_id, name, region) in enumerate(regions_test_matrix):
        p_uuid = uuid.uuid4()
        places.append(Place(id=p_uuid, research_id=p_id, name=name, category_id=uuid.uuid4(), source="Official Sourced"))
        img_url = f"https://sources.example.com/{p_id}.jpg"
        fixtures[img_url] = create_test_image_bytes(800 + idx * 10, 600, color="teal", fmt="JPEG")
        manifest_entries.append({
            "place_id": p_id,
            "source_url": img_url,
            "source_name": "Wikimedia Commons",
            "creator": f"Verified Contributor {idx + 1}",
            "license": "CC BY-SA 4.0",
            "attribution": f"Photo by Contributor {idx + 1} / Wikimedia Commons / CC BY-SA 4.0",
            "title": name,
            "is_primary": True,
            "sort_order": 1,
        })

    db = MockSession(places=places)
    storage = LocalImageStorage(base_path=str(tmp_path), base_url="/static/images")
    downloader = MockImageDownloader(fixtures)

    pipeline = ImageIngestionPipeline(
        db_session=db,
        storage=storage,
        downloader=downloader,
    )

    report = IngestionReport(total_entries=len(manifest_entries))
    for entry in manifest_entries:
        pipeline.ingest_entry(entry, report)

    assert report.total_entries == len(regions_test_matrix)
    assert report.uploaded == len(regions_test_matrix)
    assert report.rejected == 0
    assert report.failed == 0
    assert len(db.added) == len(regions_test_matrix)

    # Verify all distinct region destination keys are in storage
    stored_keys = {img.storage_key for img in db.added}
    assert len(stored_keys) == len(regions_test_matrix)
    for p_id, _, _ in regions_test_matrix:
        assert any(f"places/{p_id}/" in k for k in stored_keys)
