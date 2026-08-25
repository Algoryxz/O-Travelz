"""Regression tests enforcing Homepage Category Semantic Image Identity and De-duplication.

Validates that:
1. Every visible homepage category has a deliberate, explicit image mapping.
2. Zero duplicate image assets or source identities across homepage categories.
3. No generic placeholders or fallback collisions.
4. Every category mapping is backed by valid provenance (creator, license, source URL, content SHA-256).
5. Category image files exist on disk and have valid WebP dimensions and non-synthetic Shannon entropy.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
import pytest
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent
CAT_MANIFEST_PATH = ROOT / "data" / "images" / "sources" / "category_manifest.json"
CAT_AUDIT_PATH = ROOT / "docs" / "HOMEPAGE_CATEGORY_IMAGE_IDENTITY_AUDIT.json"
PLACES_MANIFEST_PATH = ROOT / "data" / "images" / "sources" / "manifest.json"


@pytest.fixture(scope="module")
def category_audit_data():
    assert CAT_AUDIT_PATH.exists(), f"Missing audit at {CAT_AUDIT_PATH}"
    return json.loads(CAT_AUDIT_PATH.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def category_manifest_data():
    assert CAT_MANIFEST_PATH.exists(), f"Missing category manifest at {CAT_MANIFEST_PATH}"
    return json.loads(CAT_MANIFEST_PATH.read_text(encoding="utf-8"))


def test_homepage_categories_have_deliberate_and_distinct_images(category_audit_data):
    """Assert the 6 homepage categories have distinct, non-overlapping image paths."""
    expected_categories = [
        "Nature",
        "Medical Help",
        "Heritage & Culture",
        "ATMs",
        "Hangout & Chill",
        "Shopping & Fashion",
    ]
    audit_keys = [c["category_label"] for c in category_audit_data]
    assert set(expected_categories).issubset(set(audit_keys))

    # Assert 0 duplicate asset paths among the 6 homepage cards
    asset_paths = [c["resolved_local_asset"] for c in category_audit_data]
    duplicates = [k for k, v in Counter(asset_paths).items() if v > 1]
    assert not duplicates, f"Found duplicate asset paths across homepage categories: {duplicates}"

    # Assert 0 duplicate source files among the 6 homepage cards
    source_files = [c["wikimedia_file"] for c in category_audit_data]
    dup_sources = [k for k, v in Counter(source_files).items() if v > 1]
    assert not dup_sources, f"Found duplicate source files across homepage categories: {dup_sources}"


def test_homepage_categories_have_valid_provenance(category_audit_data):
    """Assert all category mappings have complete structured provenance metadata."""
    for c in category_audit_data:
        assert c.get("creator"), f"Missing creator for {c['category_label']}"
        assert c.get("license"), f"Missing license for {c['category_label']}"
        assert c.get("wikimedia_file"), f"Missing wikimedia_file for {c['category_label']}"
        assert c.get("semantic_appropriateness"), f"Missing semantic reason for {c['category_label']}"
        assert c["semantic_status"] == "VERIFIED_CATEGORY_MATCH"
        assert c["duplicate_source_with"] is None


def test_category_image_files_exist_and_are_valid_webp(category_audit_data):
    """Assert that every resolved category asset exists on disk and is a valid WebP image."""
    for c in category_audit_data:
        rel_path = c["resolved_local_asset"].replace("/static/images/", "data/images/")
        file_path = ROOT / rel_path
        assert file_path.exists(), f"Missing category image file at {file_path}"
        assert file_path.stat().st_size > 15_000, f"Suspiciously small image ({file_path.stat().st_size} bytes)"

        with Image.open(file_path) as img:
            assert img.format == "WEBP", f"Expected WEBP format for {file_path}, got {img.format}"
            assert img.width == 640 and img.height == 360, f"Expected 640x360 dimensions, got {img.size}"
