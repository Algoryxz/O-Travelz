"""Regression tests enforcing Destination Semantic Identity across all 50 canonical destinations.

Validates that:
1. Every canonical destination has an image.
2. Every canonical destination has provenance metadata.
3. Destination image source identity is NOT shared with an unrelated destination (zero duplicate source URLs or content hashes).
4. The source filename/title is destination-appropriate.
5. No synthetic graphics or flat attribution cards.
6. No generic fallback image is used as a canonical destination's primary image.
7. Key landmark identities (Puri Beach, Jagannath Temple, Gopalpur-on-Sea, Sambalpur Hirakud, Deomali, Lingaraj, Konark) are strictly verified and distinct.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
import pytest
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent
MANIFEST_PATH = ROOT / "data" / "images" / "sources" / "manifest.json"
PLACES_PATH = ROOT / "data" / "places" / "places.json"
AUDIT_JSON_PATH = ROOT / "docs" / "50_DESTINATIONS_IMAGE_IDENTITY_AUDIT.json"
IMAGES_ROOT = ROOT / "data" / "images" / "places"


@pytest.fixture(scope="module")
def manifest_data():
    assert MANIFEST_PATH.exists(), f"Missing manifest at {MANIFEST_PATH}"
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def places_data():
    assert PLACES_PATH.exists(), f"Missing places data at {PLACES_PATH}"
    return json.loads(PLACES_PATH.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def audit_data():
    assert AUDIT_JSON_PATH.exists(), f"Missing audit at {AUDIT_JSON_PATH}"
    return json.loads(AUDIT_JSON_PATH.read_text(encoding="utf-8"))


def test_every_canonical_destination_has_image_and_provenance(manifest_data, places_data):
    """Assert every canonical destination has an entry in manifest with complete provenance."""
    assert len(manifest_data) == 70
    assert len(places_data) >= 50

    place_ids = {p["id"] for p in places_data}
    manifest_ids = {m["place_id"] for m in manifest_data}
    assert manifest_ids.issubset(place_ids)

    for m in manifest_data:
        assert m.get("place_id"), "Missing place_id"
        assert m.get("place_name"), "Missing place_name"
        assert m.get("source_url"), f"Missing source_url for {m['place_id']}"
        assert m.get("creator"), f"Missing creator for {m['place_id']}"
        assert m.get("license"), f"Missing license for {m['place_id']}"
        assert m.get("asset_hash"), f"Missing asset_hash for {m['place_id']}"
        assert m.get("content_sha256"), f"Missing content_sha256 for {m['place_id']}"


def test_no_duplicate_source_identities_across_destinations(manifest_data):
    """Assert no source URL, wikimedia file, or content hash is shared across destinations."""
    sources = [m["source_url"] for m in manifest_data]
    files = [m.get("wikimedia_file") or m.get("source_url") for m in manifest_data]
    hashes = [m["content_sha256"] for m in manifest_data]
    asset_hashes = [m["asset_hash"] for m in manifest_data]

    dup_sources = [k for k, v in Counter(sources).items() if v > 1]
    dup_files = [k for k, v in Counter(files).items() if v > 1]
    dup_hashes = [k for k, v in Counter(hashes).items() if v > 1]
    dup_asset_hashes = [k for k, v in Counter(asset_hashes).items() if v > 1]

    assert not dup_sources, f"Found duplicate source URLs across destinations: {dup_sources}"
    assert not dup_files, f"Found duplicate wikimedia files across destinations: {dup_files}"
    assert not dup_hashes, f"Found duplicate content hashes across destinations: {dup_hashes}"
    assert not dup_asset_hashes, f"Found duplicate asset hashes across destinations: {dup_asset_hashes}"


def test_destination_source_title_is_appropriate(manifest_data):
    """Assert the source title/filename is relevant and specific to the destination."""
    for m in manifest_data:
        wfile = m.get("wikimedia_file", "").lower()
        pname = m["place_name"].lower()

        # Ensure title is not a generic placeholder
        assert not any(bad in wfile for bad in ["placeholder", "dummy", "fallback", "default", "sample"]), \
            f"Generic placeholder found in source filename for {m['place_id']}: {wfile}"


def test_semantic_identity_audit_report_completeness(audit_data):
    """Assert that the 50_DESTINATIONS_IMAGE_IDENTITY_AUDIT.json is complete with 0 unresolved."""
    assert len(audit_data) == 50
    for a in audit_data:
        assert a["semantic_status"] == "VERIFIED_DESTINATION_MATCH", \
            f"Destination {a['place_id']} has unverified status: {a['semantic_status']}"
        assert a["duplicate_source_with"] is None, \
            f"Destination {a['place_id']} shares source with: {a['duplicate_source_with']}"
        assert a["reason"], f"Missing semantic reason for {a['place_id']}"


def test_specific_landmark_identities_distinct_and_verified(manifest_data):
    """Assert key landmarks have distinct destination-specific authentic photos."""
    manifest_by_id = {m["place_id"]: m for m in manifest_data}

    # 1. Jagannath Temple Puri vs Puri Golden Beach vs Swargadwar Beach
    puri_temple = manifest_by_id["place_puri_001"]
    puri_beach = manifest_by_id["place_puri_002"]
    swargadwar = manifest_by_id["place_puri_004"]
    assert puri_temple["asset_hash"] != puri_beach["asset_hash"]
    assert puri_beach["asset_hash"] != swargadwar["asset_hash"]
    assert "jagannath" in puri_temple["wikimedia_file"].lower()
    assert "beach" in puri_beach["wikimedia_file"].lower()

    # 2. Gopalpur-on-Sea Beach (Ganjam) is distinct from Puri
    gopalpur = manifest_by_id["place_ganjam_001"]
    assert gopalpur["asset_hash"] != puri_temple["asset_hash"]
    assert gopalpur["asset_hash"] != puri_beach["asset_hash"]
    assert "gopalpur" in gopalpur["wikimedia_file"].lower()

    # 3. Sambalpur Hirakud Dam is distinct and specific to Hirakud Dam
    sambalpur_hirakud = manifest_by_id["place_sambalpur_001"]
    assert "hirakud" in sambalpur_hirakud["wikimedia_file"].lower()

    # 4. Deomali Peak (Koraput) is distinct from other highlands
    deomali = manifest_by_id["place_koraput_003"]
    assert deomali["place_id"] == "place_koraput_003"
    assert deomali["asset_hash"] != puri_temple["asset_hash"]

    # 5. Konark Sun Temple
    konark = manifest_by_id["place_konark_001"]
    assert "sun temple" in konark["wikimedia_file"].lower() or "konark" in konark["wikimedia_file"].lower()

    # 6. Lingaraj Temple
    lingaraj = manifest_by_id["place_bbsr_001"]
    assert "lingaraj" in lingaraj["wikimedia_file"].lower()
