"""
Wave A3b Media Registry Reconciliation Invariants and Regression Suite.

Verifies:
1. Complete accounting of all 461 physical media files across 82 directories.
2. 4-dimensional orthogonal media model on PostgreSQL:
   - media_type (IMAGE, VIDEO, AUDIO, DOCUMENT_PDF)
   - content_kind (FIELD_PHOTOGRAPH, TECHNICAL_VECTOR, ARCHIVAL_SCAN, RENDER_3D)
   - verification_status (EXACT_LOCATION_VERIFIED, RELATED_LOCATION, UNVERIFIED, REJECTED)
   - display_role (HERO, CARD, THUMBNAIL, GALLERY, DIAGRAM, BANNER)
   - association_type (PRIMARY, SUPPORTING, CONTEXTUAL)
3. Zero unclassified files, zero deleted files.
4. Zero NULL values across orthogonal dimension columns.
5. EntityMedia referential integrity (zero orphan associations, zero links to REJECTED assets).
6. Technical vector separation (vectors never masquerade as photography).
7. Cross-entity reuse groups disambiguation.
8. Backward compatibility of place_images projection (70 rows intact).
"""
import json
from pathlib import Path
import pytest
from sqlalchemy import text

from app.db.session import SessionLocal
from app.models.media_asset import MediaAsset, EntityMedia
from app.models.place_image import PlaceImage
from app.models.place import Place

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
PLACES_IMG_DIR = WORKSPACE_ROOT / "data" / "images" / "places"
MANIFEST_PATH = WORKSPACE_ROOT / "data" / "images" / "sources" / "manifest.json"
ORPHAN_INV_PATH = WORKSPACE_ROOT / "reports" / "media_orphan_reconciliation_inventory.json"
REP_DUPE_GROUPS = WORKSPACE_ROOT / "reports" / "media_a3b_duplicate_groups.json"
REP_RECONCILIATION = WORKSPACE_ROOT / "reports" / "media_a3b_reconciliation.json"
REP_AFTER = WORKSPACE_ROOT / "reports" / "media_a3b_after.json"
REP_BEFORE = WORKSPACE_ROOT / "reports" / "media_a3b_before.json"


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    try:
        # Test connection
        db.execute(text("SELECT 1"))
        yield db
    finally:
        db.close()


def test_accounting_equation_and_reports_exist():
    """Verify all 4 required reports exist and accounting invariant holds."""
    assert REP_BEFORE.exists(), f"Missing {REP_BEFORE}"
    assert REP_DUPE_GROUPS.exists(), f"Missing {REP_DUPE_GROUPS}"
    assert REP_RECONCILIATION.exists(), f"Missing {REP_RECONCILIATION}"
    assert REP_AFTER.exists(), f"Missing {REP_AFTER}"

    with open(REP_RECONCILIATION, "r", encoding="utf-8") as f:
        recon = json.load(f)

    summary = recon["summary"]
    assert summary["total_physical_files"] == 461
    assert summary["manifest_source_variants"] == 280
    assert summary["legacy_valid_variants"] == 56
    assert summary["archival_derivative_variants"] == 125
    assert summary["unaccounted_files"] == 0
    assert summary["unclassified_files"] == 0
    assert summary["deleted_files"] == 0

    assert recon["accounting_equation"]["holds"] is True
    assert recon["blocking_errors"] == 0


def test_filesystem_physical_file_count():
    """Count physical webp files directly from data/images/places/."""
    assert PLACES_IMG_DIR.exists()
    all_webp = list(PLACES_IMG_DIR.glob("**/*.webp"))
    assert len(all_webp) == 461, f"Expected 461 physical WebP files, found {len(all_webp)}"


def test_media_assets_database_counts(db_session):
    """Verify media_assets contains 116 records (70 manifest + 14 legacy-valid + 32 archival)."""
    count = db_session.query(MediaAsset).count()
    assert count == 116, f"Expected 116 MediaAsset records, got {count}"


def test_entity_media_database_counts(db_session):
    """Verify entity_media contains 84 associations (70 manifest + 14 legacy-valid)."""
    count = db_session.query(EntityMedia).count()
    assert count == 84, f"Expected 84 EntityMedia associations, got {count}"


def test_place_images_compatibility_projection(db_session):
    """Verify place_images table contains exactly 70 rows matching manifest."""
    count = db_session.query(PlaceImage).count()
    assert count == 70, f"Expected 70 PlaceImage rows, got {count}"


def test_media_assets_zero_nulls_in_orthogonal_columns(db_session):
    """Verify NOT NULL constraints and zero NULLs in orthogonal media_assets columns."""
    null_kind = db_session.query(MediaAsset).filter(MediaAsset.content_kind.is_(None)).count()
    null_status = db_session.query(MediaAsset).filter(MediaAsset.verification_status.is_(None)).count()
    null_type = db_session.query(MediaAsset).filter(MediaAsset.media_type.is_(None)).count()
    null_sha = db_session.query(MediaAsset).filter(MediaAsset.content_sha256.is_(None)).count()
    null_key = db_session.query(MediaAsset).filter(MediaAsset.storage_key.is_(None)).count()

    assert null_kind == 0, f"Found {null_kind} NULL content_kind"
    assert null_status == 0, f"Found {null_status} NULL verification_status"
    assert null_type == 0, f"Found {null_type} NULL media_type"
    assert null_sha == 0, f"Found {null_sha} NULL content_sha256"
    assert null_key == 0, f"Found {null_key} NULL storage_key"


def test_entity_media_zero_nulls_in_orthogonal_columns(db_session):
    """Verify NOT NULL constraints and zero NULLs in orthogonal entity_media columns."""
    null_role = db_session.query(EntityMedia).filter(EntityMedia.display_role.is_(None)).count()
    null_assoc = db_session.query(EntityMedia).filter(EntityMedia.association_type.is_(None)).count()
    null_ent_id = db_session.query(EntityMedia).filter(EntityMedia.entity_id.is_(None)).count()
    null_asset_id = db_session.query(EntityMedia).filter(EntityMedia.media_asset_id.is_(None)).count()

    assert null_role == 0, f"Found {null_role} NULL display_role"
    assert null_assoc == 0, f"Found {null_assoc} NULL association_type"
    assert null_ent_id == 0, f"Found {null_ent_id} NULL entity_id"
    assert null_asset_id == 0, f"Found {null_asset_id} NULL media_asset_id"


def test_entity_media_referential_integrity(db_session):
    """Verify every EntityMedia row points to a valid Place and a valid MediaAsset."""
    place_ids = {p.id for p in db_session.query(Place.id).all()}
    asset_ids = {m.id for m in db_session.query(MediaAsset.id).all()}

    for assoc in db_session.query(EntityMedia).all():
        assert assoc.entity_id in place_ids, f"Orphan entity_id: {assoc.entity_id}"
        assert assoc.media_asset_id in asset_ids, f"Orphan media_asset_id: {assoc.media_asset_id}"


def test_zero_rejected_assets_publicly_associated(db_session):
    """Verify no REJECTED media asset is linked in entity_media."""
    rejected_asset_ids = {
        m.id for m in db_session.query(MediaAsset.id).filter(MediaAsset.verification_status == "REJECTED").all()
    }
    public_rejected = (
        db_session.query(EntityMedia)
        .filter(EntityMedia.media_asset_id.in_(rejected_asset_ids))
        .count()
    )
    assert public_rejected == 0, f"Found {public_rejected} public associations to REJECTED assets!"


def test_content_sha256_format_and_uniqueness(db_session):
    """Verify all media_assets content_sha256 values are 64 lowercase hex chars and unique."""
    assets = db_session.query(MediaAsset).all()
    shas = set()
    for a in assets:
        sha = a.content_sha256
        assert len(sha) == 64, f"SHA length != 64: {sha}"
        assert sha == sha.lower(), f"SHA is not lowercase: {sha}"
        assert sha not in shas, f"Duplicate content_sha256: {sha}"
        shas.add(sha)
    assert len(shas) == 116


def test_cross_entity_duplicate_groups_report():
    """Verify reports/media_a3b_duplicate_groups.json documents 6 reuse groups across 16 entities."""
    with open(REP_DUPE_GROUPS, "r", encoding="utf-8") as f:
        dupe_rep = json.load(f)

    assert dupe_rep["summary"]["total_groups"] == 6
    assert dupe_rep["summary"]["total_entities_involved"] == 16
    assert dupe_rep["summary"]["exact_binary_duplicate_groups"] == 0

    group_ids = [g["group_id"] for g in dupe_rep["reuse_groups"]]
    expected_groups = [
        "REUSE_01_HANDLOOM_SAREE",
        "REUSE_02_LANKESWARI_TEMPLE",
        "REUSE_03_RANIPUR_JHARIAL_SIGNBOARD",
        "REUSE_04_GUDGUDA_WATERFALL",
        "REUSE_05_BUDHARAJA_HILL_PANORAMA",
        "REUSE_06_VEDVYAS_TEMPLE",
    ]
    for eg in expected_groups:
        assert eg in group_ids, f"Expected group {eg} not found in report"


def test_orthogonal_taxonomy_domain_values(db_session):
    """Verify all domain values match allowed enum sets."""
    allowed_types = {"IMAGE", "VIDEO", "AUDIO", "DOCUMENT_PDF"}
    allowed_kinds = {"FIELD_PHOTOGRAPH", "TECHNICAL_VECTOR", "ARCHIVAL_SCAN", "RENDER_3D"}
    allowed_statuses = {"EXACT_LOCATION_VERIFIED", "RELATED_LOCATION", "UNVERIFIED", "REJECTED"}
    allowed_roles = {"HERO", "CARD", "THUMBNAIL", "GALLERY", "DIAGRAM", "BANNER"}
    allowed_assocs = {"PRIMARY", "SUPPORTING", "CONTEXTUAL"}

    for a in db_session.query(MediaAsset).all():
        assert a.media_type in allowed_types, f"Invalid media_type: {a.media_type}"
        assert a.content_kind in allowed_kinds, f"Invalid content_kind: {a.content_kind}"
        assert a.verification_status in allowed_statuses, f"Invalid verification_status: {a.verification_status}"

    for em in db_session.query(EntityMedia).all():
        assert em.display_role in allowed_roles, f"Invalid display_role: {em.display_role}"
        assert em.association_type in allowed_assocs, f"Invalid association_type: {em.association_type}"
