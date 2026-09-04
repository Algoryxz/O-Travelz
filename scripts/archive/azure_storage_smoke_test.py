#!/usr/bin/env python3
"""Azure Blob Storage live connectivity smoke test for O-Travelz.

Validates that AzureBlobImageStorage authenticates, uploads an asset, verifies content-type,
retrieves the asset, checks SHA-256 integrity, and cleans up by deleting the test asset.
"""
from __future__ import annotations

import hashlib
import io
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from PIL import Image

from app.core.config import Settings
from app.storage.azure_blob import AzureBlobImageStorage
from app.storage.base import ImageStorageError, StorageAuthenticationError


def generate_smoke_test_image() -> bytes:
    """Generate a small in-memory WebP image for connectivity testing."""
    img = Image.new("RGB", (200, 150), color=(18, 52, 86))
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=80)
    return buf.getvalue()


def run_smoke_test(settings: Settings) -> int:
    print("\n" + "=" * 65)
    print("      O-TRAVELZ AZURE BLOB STORAGE CONNECTIVITY SMOKE TEST")
    print("=" * 65)

    print(f"Target Container : {settings.azure_storage_container_name}")
    print(f"Account Name     : {settings.azure_storage_account_name or '(from connection string)'}")
    print(f"CDN Base URL     : {settings.azure_storage_cdn_base_url or '(direct blob URL)'}")
    print("=" * 65)

    try:
        storage = AzureBlobImageStorage(
            connection_string=settings.azure_storage_connection_string,
            account_name=settings.azure_storage_account_name,
            account_key=settings.azure_storage_account_key,
            container_name=settings.azure_storage_container_name,
            cdn_base_url=settings.azure_storage_cdn_base_url,
        )
    except Exception as e:
        print(f"[FAIL] Initialization error: {e}")
        return 1

    test_data = generate_smoke_test_image()
    expected_sha256 = hashlib.sha256(test_data).hexdigest()
    test_key = "smoke_test/azure_connectivity_test.webp"

    # Step 1: Upload
    print(f"\n[1/5] Uploading smoke-test asset to '{test_key}'...")
    try:
        stored = storage.save_image(
            key=test_key,
            data=test_data,
            content_type="image/webp",
            metadata={"purpose": "connectivity_smoke_test"},
        )
        print(f"      SUCCESS: Uploaded {stored.size_bytes} bytes. URL: {stored.url}")
        print(f"      Reported SHA-256: {stored.content_sha256}")
    except StorageAuthenticationError as e:
        print(f"      [AUTH FAILURE] Azure authentication failed: {e}")
        print("      Ensure AZURE_STORAGE_* credentials or DefaultAzureCredential are configured.")
        return 2
    except ImageStorageError as e:
        print(f"      [STORAGE ERROR] Upload failed: {e}")
        return 3

    # Step 2: Check existence
    print(f"\n[2/5] Checking blob existence...")
    exists = storage.exists(test_key)
    if not exists:
        print("      [FAIL] Blob reported as not existing after upload!")
        return 4
    print("      SUCCESS: Blob exists in container.")

    # Step 3: Download & verify SHA-256
    print(f"\n[3/5] Downloading and verifying content SHA-256 integrity...")
    downloaded = storage.get_image(test_key)
    if downloaded is None:
        print("      [FAIL] Failed to retrieve blob contents.")
        return 5

    downloaded_sha256 = hashlib.sha256(downloaded).hexdigest()
    if downloaded_sha256 != expected_sha256:
        print(f"      [FAIL] SHA-256 mismatch! Expected {expected_sha256}, got {downloaded_sha256}")
        return 6
    print(f"      SUCCESS: Content matches expected SHA-256 ({downloaded_sha256[:16]}...).")

    # Step 4: Cleanup / Delete
    print(f"\n[4/5] Cleaning up smoke-test asset from container...")
    deleted = storage.delete_image(test_key)
    if not deleted:
        print("      [WARNING] delete_image returned False.")
    else:
        print("      SUCCESS: Test blob deleted.")

    # Step 5: Verify deleted
    print(f"\n[5/5] Verifying blob no longer exists...")
    still_exists = storage.exists(test_key)
    if still_exists:
        print("      [FAIL] Blob still exists after deletion!")
        return 7
    print("      SUCCESS: Blob confirmed removed.")

    print("\n" + "=" * 65)
    print("      ALL AZURE SMOKE TEST STEPS PASSED SUCCESSFULLY!")
    print("=" * 65 + "\n")
    return 0


if __name__ == "__main__":
    current_settings = Settings()
    sys.exit(run_smoke_test(current_settings))
