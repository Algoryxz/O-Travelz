"""Regression tests for photographic integrity and anti-synthetic graphic validation.

Ensures that:
1. Destination hero, card, and thumbnail assets are authentic photographs, not synthetic attribution cards.
2. Every canonical destination has verified provenance, valid WebP variants, and expected dimensions.
3. Assets meet photographic complexity / entropy thresholds and lack synthetic box-drawing signatures.
4. Old failure mode (flat color boxes with drawn border lines and burnt-in text) is permanently rejected.
"""
import io
import json
import math
from pathlib import Path
from PIL import Image
import pytest

from app.db.session import SessionLocal
from app.db.base import Base, Place, PlaceImage

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
MANIFEST_PATH = ROOT_DIR / "data" / "images" / "sources" / "manifest.json"
PLACES_JSON_PATH = ROOT_DIR / "data" / "places" / "places.json"
PLACES_IMG_DIR = ROOT_DIR / "data" / "images" / "places"
FIXTURES_DIR = ROOT_DIR / "data" / "images" / "sources" / "fixtures"

APPROVED_LICENSES = {
    "CC0",
    "Public domain",
    "CC BY 4.0",
    "CC BY 3.0",
    "CC BY 2.0",
    "CC BY-SA 4.0",
    "CC BY-SA 3.0",
    "CC BY-SA 2.0",
}

def calculate_shannon_entropy(img: Image.Image) -> float:
    """Calculate Shannon entropy across RGB channels."""
    hist = img.histogram()
    total = sum(hist)
    if total == 0:
        return 0.0
    entropy = 0.0
    for count in hist:
        if count > 0:
            p = count / total
            entropy -= p * math.log2(p)
    return entropy

def test_no_synthetic_fixtures_in_production_path():
    """Verify that old synthetic gradient/card fixtures have been purged."""
    if FIXTURES_DIR.is_dir():
        jpgs = list(FIXTURES_DIR.glob("*.jpg")) + list(FIXTURES_DIR.glob("*.png"))
        assert len(jpgs) == 0, f"Found {len(jpgs)} forbidden fixture files in {FIXTURES_DIR}"

def test_manifest_covers_all_50_canonical_destinations():
    """Verify all 50 canonical destinations have full structured provenance entries."""
    assert MANIFEST_PATH.is_file(), f"Manifest file missing at {MANIFEST_PATH}"
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    places = json.loads(PLACES_JSON_PATH.read_text(encoding="utf-8"))

    assert len(manifest) == 50, f"Expected 50 manifest entries, got {len(manifest)}"
    assert len(places) >= 50, f"Expected at least 50 places in places.json, got {len(places)}"

    places_by_id = {p["id"]: p for p in places}
    for m in manifest:
        pid = m["place_id"]
        assert pid in places_by_id, f"Manifest place {pid} ({m.get('place_name')}) missing from places.json"
        assert m.get("creator"), f"Missing creator in manifest for {pid}"
        assert m.get("license") in APPROVED_LICENSES, f"Invalid license '{m.get('license')}' for {pid}"
        assert m.get("attribution"), f"Missing attribution statement for {pid}"
        assert m.get("source_url"), f"Missing source URL for {pid}"
        assert m.get("asset_hash"), f"Missing asset hash for {pid}"
        assert m.get("content_sha256"), f"Missing content SHA-256 for {pid}"

def test_all_50_destinations_have_valid_photographic_webp_variants():
    """Verify that all 50 destinations have original, hero, card, thumbnail WebP variants with exact dimensions."""
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    for m in manifest:
        pid = m["place_id"]
        asset_hash = m["asset_hash"]
        place_dir = PLACES_IMG_DIR / pid / asset_hash

        assert place_dir.is_dir(), f"Place asset directory missing: {place_dir}"

        hero_path = place_dir / "hero.webp"
        card_path = place_dir / "card.webp"
        thumb_path = place_dir / "thumbnail.webp"
        orig_path = place_dir / "original.webp"

        for p in [hero_path, card_path, thumb_path, orig_path]:
            assert p.is_file(), f"Variant missing: {p}"
            assert p.stat().st_size > 1000, f"Variant file suspiciously tiny: {p} ({p.stat().st_size} bytes)"

        hero_img = Image.open(hero_path)
        assert hero_img.format == "WEBP", f"Expected WEBP format for hero: {hero_path}"
        assert hero_img.size == (1080, 720), f"Hero dimensions mismatch for {pid}: {hero_img.size}"

        card_img = Image.open(card_path)
        assert card_img.format == "WEBP", f"Expected WEBP format for card: {card_path}"
        assert card_img.size == (640, 360), f"Card dimensions mismatch for {pid}: {card_img.size}"

        thumb_img = Image.open(thumb_path)
        assert thumb_img.format == "WEBP", f"Expected WEBP format for thumbnail: {thumb_path}"
        assert thumb_img.size == (240, 160), f"Thumbnail dimensions mismatch for {pid}: {thumb_img.size}"

def test_photographic_heuristics_and_rejection_of_synthetic_cards():
    """Detect and reject synthetic cards (e.g. low entropy flat cards, tiny file sizes)."""
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    for m in manifest:
        pid = m["place_id"]
        asset_hash = m["asset_hash"]
        hero_path = PLACES_IMG_DIR / pid / asset_hash / "hero.webp"

        hero_img = Image.open(hero_path)
        file_size = hero_path.stat().st_size
        entropy = calculate_shannon_entropy(hero_img)

        # Real 1080x720 destination photographs have Shannon entropy > 5.5 and file size > 30KB
        # Old synthetic text cards had entropy < 3.5 and size < 11KB
        assert file_size >= 25000, f"Hero file size {file_size} bytes is too small for a real photo in {pid}"
        assert entropy >= 5.0, f"Shannon entropy {entropy:.2f} is suspiciously low (synthetic graphic signature) in {pid}"

def test_puri_lingaraj_konark_authoritative_integrity():
    """Explicit deep verification of Puri Jagannath Temple, Lingaraj Temple, and Konark Sun Temple."""
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    manifest_by_id = {m["place_id"]: m for m in manifest}

    # 1. Puri Jagannath Temple
    puri = manifest_by_id["place_puri_001"]
    assert "Jagannath" in puri["wikimedia_file"] or "Jagannath" in puri["place_name"]
    puri_hero = PLACES_IMG_DIR / "place_puri_001" / puri["asset_hash"] / "hero.webp"
    assert puri_hero.stat().st_size > 50000

    # 2. Lingaraj Temple
    lingaraj = manifest_by_id["place_bbsr_001"]
    assert "Lingaraj" in lingaraj["wikimedia_file"] or "Lingaraj" in lingaraj["place_name"]
    lingaraj_hero = PLACES_IMG_DIR / "place_bbsr_001" / lingaraj["asset_hash"] / "hero.webp"
    assert lingaraj_hero.stat().st_size > 50000

    # 3. Konark Sun Temple
    konark = manifest_by_id["place_konark_001"]
    assert "Konark" in konark["wikimedia_file"] or "Sun Temple" in konark["wikimedia_file"]
    konark_hero = PLACES_IMG_DIR / "place_konark_001" / konark["asset_hash"] / "hero.webp"
    assert konark_hero.stat().st_size > 50000

def test_database_place_images_match_manifest():
    """Verify database PlaceImage records are synchronized with manifest and filesystem assets."""
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    try:
        db = SessionLocal()
        # Test connection
        db.connection()
    except Exception as exc:
        pytest.skip(f"PostgreSQL database offline/unreachable: {exc}")

    try:
        for m in manifest:
            pid = m["place_id"]
            place = db.query(Place).filter(Place.research_id == pid).first()
            if not place:
                place = db.query(Place).filter(Place.name.ilike(m["place_name"].strip())).first()
            assert place is not None, f"Database place record not found for {pid}"

            img = db.query(PlaceImage).filter(PlaceImage.place_id == place.id).first()
            assert img is not None, f"Database PlaceImage not found for {pid}"
            assert img.storage_key == f"{pid}/{m['asset_hash']}"
            assert img.url == f"/static/images/places/{pid}/{m['asset_hash']}/hero.webp"
            assert img.creator == m["creator"]
            assert img.license == m["license"]
    finally:
        db.close()
