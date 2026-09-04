"""
Wave A1 Test Suite: Localized Identity, Normalized Relationships, and Canonical Media Registry.
"""
import uuid
import pytest
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError

from app.schemas.localization import LocalizedNames
from app.models.entity_relationship import EntityRelationship
from app.models.media_asset import MediaAsset, EntityMedia
from app.models.place import Place
from app.models.transport import Stop, TransportProvider
from app.api.places_routes import PlaceDetailResponse, _to_place_detail_response
from app.db.session import SessionLocal


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



# =============================================================================
# 1. LocalizedNames Contract Unit Tests
# =============================================================================

def test_localized_names_basic():
    loc = LocalizedNames(en="Konark Sun Temple")
    assert loc.en == "Konark Sun Temple"
    assert loc.or_ is None
    assert loc.hi is None
    assert loc.resolve("en") == "Konark Sun Temple"
    assert loc.resolve("or") == "Konark Sun Temple"  # Falls back to en
    assert loc.resolve("hi") == "Konark Sun Temple"  # Falls back to en


def test_localized_names_multi_script():
    loc = LocalizedNames(
        en="Konark Sun Temple",
        **{"or": "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର", "hi": "कोणार्क सूर्य मंदिर"}
    )
    assert loc.en == "Konark Sun Temple"
    assert loc.or_ == "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର"
    assert loc.hi == "कोणार्क सूर्य मंदिर"

    # Resolution tests
    assert loc.resolve("en") == "Konark Sun Temple"
    assert loc.resolve("or") == "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର"
    assert loc.resolve("odia") == "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର"
    assert loc.resolve("hi") == "कोणार्क सूर्य मंदिर"
    assert loc.resolve("hindi") == "कोणार्क सूर्य मंदिर"
    assert loc.resolve("fr") == "Konark Sun Temple"  # Unknown falls back to en


def test_localized_names_serialization():
    loc = LocalizedNames(
        en="Puri Beach",
        **{"or": "ପୁରୀ ବେଳାଭୂମି"}
    )
    data = loc.to_dict()
    assert data["en"] == "Puri Beach"
    assert data["or"] == "ପୁରୀ ବେଳାଭୂମି"
    assert data["hi"] is None

    # Roundtrip from dict
    restored = LocalizedNames.model_validate(data)
    assert restored.en == "Puri Beach"
    assert restored.or_ == "ପୁରୀ ବେଳାଭୂମି"


def test_localized_names_from_record():
    loc = LocalizedNames.from_record("Dhauli Stupa", {"or": "ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ"})
    assert loc.en == "Dhauli Stupa"
    assert loc.or_ == "ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ"


# =============================================================================
# 2. Database Normalized Entity Relationships Tests
# =============================================================================

def test_entity_relationship_creation(db_session):
    place_id = uuid.uuid4()
    stop_id = uuid.uuid4()

    rel = EntityRelationship(
        source_entity_type="place",
        source_entity_id=place_id,
        target_entity_type="stop",
        target_entity_id=stop_id,
        relationship_type="nearest_transit_stop",
        confidence="HIGH",
        provenance="on_the_ground_survey",
        properties={"distance_meters": 350, "walk_time_minutes": 4},
    )
    db_session.add(rel)
    db_session.commit()

    # Query from source
    queried = (
        db_session.query(EntityRelationship)
        .filter_by(
            source_entity_type="place",
            source_entity_id=place_id,
            relationship_type="nearest_transit_stop",
        )
        .first()
    )
    assert queried is not None
    assert queried.target_entity_id == stop_id
    assert queried.confidence == "HIGH"
    assert queried.properties["distance_meters"] == 350
    assert queried.created_at is not None

    # Query from target (reverse direction traversal)
    reverse = (
        db_session.query(EntityRelationship)
        .filter_by(
            target_entity_type="stop",
            target_entity_id=stop_id,
        )
        .first()
    )
    assert reverse is not None
    assert reverse.source_entity_id == place_id

    # Cleanup
    db_session.delete(rel)
    db_session.commit()


def test_entity_relationship_confidence_not_defaulted(db_session):
    rel = EntityRelationship(
        source_entity_type="place",
        source_entity_id=uuid.uuid4(),
        target_entity_type="craft_tradition",
        target_entity_id=uuid.uuid4(),
        relationship_type="cultural_origin",
        # confidence intentionally omitted
    )
    db_session.add(rel)
    db_session.commit()

    queried = db_session.query(EntityRelationship).filter_by(id=rel.id).first()
    assert queried.confidence is None  # MUST NOT default to HIGH or any other value

    db_session.delete(rel)
    db_session.commit()


def test_entity_relationship_uniqueness(db_session):
    src_id = uuid.uuid4()
    tgt_id = uuid.uuid4()

    rel1 = EntityRelationship(
        source_entity_type="place",
        source_entity_id=src_id,
        target_entity_type="artisan_cluster",
        target_entity_id=tgt_id,
        relationship_type="artisan_hub",
    )
    db_session.add(rel1)
    db_session.commit()

    # Attempting to add the exact duplicate relationship should violate unique constraint
    rel2 = EntityRelationship(
        source_entity_type="place",
        source_entity_id=src_id,
        target_entity_type="artisan_cluster",
        target_entity_id=tgt_id,
        relationship_type="artisan_hub",
    )
    db_session.add(rel2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()

    # Clean up rel1
    db_session.delete(rel1)
    db_session.commit()


# =============================================================================
# 3. Canonical Media Registry & EntityMedia Tests
# =============================================================================

def test_media_asset_and_entity_media(db_session):
    sha = "test_sha256_" + uuid.uuid4().hex[:16]
    key = "places/test/" + uuid.uuid4().hex[:8]

    asset = MediaAsset(
        media_type="image",
        content_sha256=sha,
        mime_type="image/webp",
        width=1920,
        height=1080,
        storage_backend="local",
        storage_key=key,
        variants={"hero": f"/static/{key}/hero.webp", "thumb": f"/static/{key}/thumb.webp"},
        verification_status="EXACT_LOCATION_VERIFIED",
        creator="Odisha Tourism Archive",
        license="CC-BY-4.0",
        attribution="Government of Odisha",
    )
    db_session.add(asset)
    db_session.commit()

    place_id = uuid.uuid4()
    assoc = EntityMedia(
        entity_type="place",
        entity_id=place_id,
        media_asset_id=asset.id,
        association_type="primary",
        sort_order=0,
        alt_text="Magnificent view of Sun Temple Konark",
        caption="Sun Temple morning light",
    )
    db_session.add(assoc)
    db_session.commit()

    # Query back
    queried_assoc = (
        db_session.query(EntityMedia)
        .filter_by(entity_type="place", entity_id=place_id)
        .first()
    )
    assert queried_assoc is not None
    assert queried_assoc.asset.content_sha256 == sha
    assert queried_assoc.asset.verification_status == "EXACT_LOCATION_VERIFIED"
    assert queried_assoc.asset.width == 1920
    assert queried_assoc.alt_text == "Magnificent view of Sun Temple Konark"

    # Cascade delete check
    db_session.delete(asset)
    db_session.commit()

    # EntityMedia should be deleted via cascade
    remaining_assoc = db_session.query(EntityMedia).filter_by(id=assoc.id).first()
    assert remaining_assoc is None


def test_media_asset_unique_constraints(db_session):
    sha = "unique_sha_" + uuid.uuid4().hex[:16]
    key1 = "places/key1_" + uuid.uuid4().hex[:8]
    key2 = "places/key2_" + uuid.uuid4().hex[:8]

    asset1 = MediaAsset(
        media_type="image",
        content_sha256=sha,
        mime_type="image/webp",
        storage_key=key1,
    )
    db_session.add(asset1)
    db_session.commit()

    # Duplicate SHA
    asset2 = MediaAsset(
        media_type="image",
        content_sha256=sha,
        mime_type="image/webp",
        storage_key=key2,
    )
    db_session.add(asset2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()

    db_session.delete(asset1)
    db_session.commit()


# =============================================================================
# 4. Model Additions & API Response Serialization Tests
# =============================================================================

def test_place_wave_a1_fields(db_session):
    # Fetch an existing place
    place = db_session.query(Place).first()
    assert place is not None

    original_loc = place.localized_names
    original_conf = place.confidence
    original_lva = place.last_verified_at

    now = datetime.now(timezone.utc)
    place.localized_names = {"en": place.name, "or": "ଓଡ଼ିଶା ଐତିହ୍ୟ"}
    place.confidence = "HIGH"
    place.last_verified_at = now
    db_session.commit()

    refreshed = db_session.query(Place).filter_by(id=place.id).first()
    assert refreshed.localized_names["or"] == "ଓଡ଼ିଶା ଐତିହ୍ୟ"
    assert refreshed.confidence == "HIGH"
    assert refreshed.last_verified_at is not None

    # Test serialization to PlaceDetailResponse
    resp = _to_place_detail_response(refreshed, "Heritage")
    assert resp.name == refreshed.name
    assert resp.localized_names is not None
    assert resp.localized_names.en == refreshed.name
    assert resp.localized_names.or_ == "ଓଡ଼ିଶା ଐତିହ୍ୟ"
    assert resp.confidence == "HIGH"
    assert resp.last_verified_at is not None

    # Restore original state
    place.localized_names = original_loc
    place.confidence = original_conf
    place.last_verified_at = original_lva
    db_session.commit()


def test_stop_wave_a1_localized_names(db_session):
    stop = db_session.query(Stop).first()
    assert stop is not None

    original_loc = stop.localized_names
    stop.localized_names = {"en": stop.name, "or": "ବସ ଷ୍ଟପ"}
    db_session.commit()

    refreshed = db_session.query(Stop).filter_by(id=stop.id).first()
    assert refreshed.localized_names["or"] == "ବସ ଷ୍ଟପ"

    stop.localized_names = original_loc
    db_session.commit()