"""Backend image proxy for secure private Azure Blob and Local storage asset delivery."""
from __future__ import annotations

import re
from fastapi import APIRouter, HTTPException, Response
from app.storage.factory import get_image_storage

router = APIRouter()

# Safe pattern: alphanumeric, dashes, underscores, slashes, periods
SAFE_KEY_PATTERN = re.compile(r"^[a-zA-Z0-9_\-\./]+$")


@router.get("/{storage_key:path}")
def get_image_asset(storage_key: str) -> Response:
    """Stream verified image bytes from private storage (Azure Blob or Local).

    Guarantees:
    - Path traversal protection (rejection of '..' and absolute paths)
    - Correct image/webp content-type
    - Immutable caching headers for performance
    - Zero cloud credential exposure to the browser
    """
    clean_key = storage_key.lstrip("/\\").replace("\\", "/")

    # Path traversal and format validation
    if ".." in clean_key or not SAFE_KEY_PATTERN.match(clean_key):
        raise HTTPException(status_code=400, detail="Invalid storage key format")

    storage = get_image_storage()
    try:
        data = storage.get_image(clean_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage retrieval error: {str(e)}")

    if not data:
        raise HTTPException(status_code=404, detail="Image not found")

    content_type = "image/webp" if clean_key.endswith(".webp") else "application/octet-stream"

    return Response(
        content=data,
        media_type=content_type,
        headers={
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
        },
    )
