"""Unit and contract tests for PlaceImage model, metadata schemas, and database definitions."""
import uuid
from datetime import datetime, timezone
import pytest
from pydantic import ValidationError

from app.db.base import Base
from app.models.category import Category
from app.models.place import Place
from app.models.place_image import PlaceImage
from app.schemas.image import PlaceImageCreate, PlaceImageResponse, PlaceImageUpdate
from app.api.places_routes import PlaceDetailResponse


def test_place_image_table_registered_in_metadata():
    """Verify place_images table is properly registered in Base metadata with all expected columns."""
    assert "place_images" in Base.metadata.tables
    table = Base.metadata.tables["place_images"]

    expected_columns = {
        "id",
        "place_id",
        "storage_key",
        "url",
        "thumbnail_url",
        "card_url",
        "alt_text",
        "title",
        "source_url",
        "source_name",
        "creator",
        "license",
        "attribution",
        "retrieval_timestamp",
        "width",
        "height",
        "aspect_ratio",
        "content_sha256",
        "content_type",
        "size_bytes",
        "status",
        "sort_order",
        "is_primary",
        "created_at",
        "updated_at",
    }
    columns = {col.name for col in table.columns}
    assert expected_columns.issubset(columns)

    # Check foreign key to places.id
    fk_targets = {fk.target_fullname for fk in table.foreign_keys}
    assert "places.id" in fk_targets


def test_place_image_schema_validation_valid():
    """Verify PlaceImageBase validates correct fields with SHA-256 and positive dimensions."""
    valid_sha = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    data = {
        "place_id": uuid.uuid4(),
        "url": "https://cdn.example.com/places/lingaraj/01.webp",
        "thumbnail_url": "https://cdn.example.com/places/lingaraj/01_thumb.webp",
        "card_url": "https://cdn.example.com/places/lingaraj/01_card.webp",
        "alt_text": "Magnificent Kalinga temple tower of Lingaraj",
        "title": "Lingaraj Temple Main Sanctum",
        "source_url": "https://commons.wikimedia.org/wiki/File:Lingaraj.jpg",
        "source_name": "Wikimedia Commons",
        "creator": "Subhashree Dash",
        "license": "CC BY-SA 4.0",
        "attribution": "Photo by Subhashree Dash / Wikimedia Commons / CC BY-SA 4.0",
        "retrieval_timestamp": datetime.now(timezone.utc),
        "width": 1920,
        "height": 1080,
        "aspect_ratio": 1.7778,
        "content_sha256": valid_sha,
        "content_type": "image/webp",
        "size_bytes": 1048576,
        "status": "verified",
        "sort_order": 1,
        "is_primary": True,
    }
    schema = PlaceImageCreate(**data)
    assert schema.url == "https://cdn.example.com/places/lingaraj/01.webp"
    assert schema.license == "CC BY-SA 4.0"
    assert schema.attribution.startswith("Photo by Subhashree Dash")
    assert schema.content_sha256 == valid_sha
    assert schema.is_primary is True


def test_place_image_schema_rejects_invalid_sha256():
    """Verify schema rejects non-64 hex SHA-256 strings."""
    with pytest.raises(ValidationError) as exc:
        PlaceImageCreate(
            place_id=uuid.uuid4(),
            url="https://example.com/img.jpg",
            source_name="Test Source",
            license="CC0",
            attribution="Test Attribution",
            content_sha256="invalid_short_hash",
        )
    assert "content_sha256" in str(exc.value)


def test_place_image_schema_rejects_invalid_status():
    """Verify schema rejects unknown status states."""
    with pytest.raises(ValidationError) as exc:
        PlaceImageCreate(
            place_id=uuid.uuid4(),
            url="https://example.com/img.jpg",
            source_name="Test Source",
            license="CC0",
            attribution="Test Attribution",
            status="unapproved_random_state",
        )
    assert "status" in str(exc.value)


def test_place_image_schema_rejects_non_positive_dimensions():
    """Verify schema rejects zero or negative width/height."""
    with pytest.raises(ValidationError) as exc:
        PlaceImageCreate(
            place_id=uuid.uuid4(),
            url="https://example.com/img.jpg",
            source_name="Test Source",
            license="CC0",
            attribution="Test Attribution",
            width=0,
        )
    assert "width" in str(exc.value)


def test_place_image_orm_model_instantiation():
    """Verify PlaceImage ORM model instantiation and attributes."""
    place_id = uuid.uuid4()
    img = PlaceImage(
        id=uuid.uuid4(),
        place_id=place_id,
        storage_key="places/bbsr/01.webp",
        url="https://cdn.example.com/01.webp",
        source_name="Odisha Tourism",
        license="CC BY 4.0",
        attribution="Odisha Tourism Archive",
        status="verified",
        sort_order=1,
        is_primary=True,
    )
    assert img.place_id == place_id
    assert img.source_name == "Odisha Tourism"
    assert img.license == "CC BY 4.0"
    assert img.is_primary is True


def test_place_detail_response_backward_compatibility():
    """Verify PlaceDetailResponse maintains backwards compatibility with default empty images."""
    data = {
        "id": "place-123",
        "name": "Konark Sun Temple",
        "category": "monument",
        "description": "13th century temple",
        "lat": 19.88,
        "lon": 86.09,
        "price_tier": "Paid",
        "source": "ASI",
    }
    response = PlaceDetailResponse(**data)
    assert response.images == []
    assert response.name == "Konark Sun Temple"


def test_place_detail_response_with_images():
    """Verify PlaceDetailResponse serializes attached PlaceImageResponse models."""
    place_id = uuid.uuid4()
    img_data = {
        "id": uuid.uuid4(),
        "place_id": place_id,
        "url": "https://cdn.example.com/konark.webp",
        "source_name": "UNESCO",
        "license": "CC0",
        "attribution": "UNESCO Heritage Documentation",
    }
    img_resp = PlaceImageResponse(**img_data)
    place_resp = PlaceDetailResponse(
        id=str(place_id),
        name="Konark Sun Temple",
        category="monument",
        images=[img_resp],
    )
    assert len(place_resp.images) == 1
    assert place_resp.images[0].url == "https://cdn.example.com/konark.webp"
    assert place_resp.images[0].license == "CC0"
