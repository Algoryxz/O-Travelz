"""Local filesystem image storage adapter."""
from __future__ import annotations

from pathlib import Path
from typing import Dict, Optional

from app.storage.base import ImageStorage, ImageStorageError, StoredAsset


class LocalImageStorage(ImageStorage):
    """Stores image assets on the local filesystem with seed directory fallback."""

    def __init__(
        self,
        base_path: str = "./data/images",
        base_url: str = "/static/images",
        auto_bootstrap: bool = False,
    ):
        # Resolve authoritative data/images root dynamically
        candidates = [
            (Path(__file__).resolve().parent.parent.parent.parent / "data" / "images").resolve(),
            Path("../data/images").resolve(),
            Path("./data/images").resolve(),
            Path(base_path).resolve(),
        ]
        seed_dir = None
        for c in candidates:
            if (c / "places").is_dir():
                seed_dir = c
                break

        resolved_path = Path(base_path).resolve()
        resolved_path.mkdir(parents=True, exist_ok=True)

        self.seed_dir = seed_dir
        self.base_path = resolved_path
        self.base_url = base_url.rstrip("/")

        if auto_bootstrap and seed_dir and seed_dir != resolved_path and not (resolved_path / "places").is_dir():
            import shutil
            try:
                shutil.copytree(seed_dir, resolved_path, dirs_exist_ok=True)
            except Exception:
                pass

    def _get_file_path(self, key: str) -> Path:
        clean_key = key.lstrip("/\\")
        full_path = (self.base_path / clean_key).resolve()
        try:
            full_path.relative_to(self.base_path)
        except ValueError:
            raise ImageStorageError(f"Invalid storage key path traversal: {key}")
        return full_path

    def save_image(
        self,
        key: str,
        data: bytes,
        content_type: str = "image/webp",
        metadata: Optional[Dict[str, str]] = None,
    ) -> StoredAsset:
        try:
            target_path = self._get_file_path(key)
            target_path.parent.mkdir(parents=True, exist_ok=True)
            target_path.write_bytes(data)
            sha256 = self.calculate_sha256(data)
            clean_key = key.lstrip("/\\").replace("\\", "/")
            url = f"{self.base_url}/{clean_key}"
            return StoredAsset(
                key=clean_key,
                url=url,
                content_type=content_type,
                size_bytes=len(data),
                content_sha256=sha256,
                metadata=metadata or {},
            )
        except Exception as e:
            if isinstance(e, ImageStorageError):
                raise
            raise ImageStorageError(f"Failed to save local image {key}: {e}") from e

    def get_image(self, key: str) -> Optional[bytes]:
        try:
            target_path = self._get_file_path(key)
            if target_path.is_file():
                return target_path.read_bytes()
            if self.seed_dir and self.seed_dir != self.base_path:
                clean_key = key.lstrip("/\\")
                seed_path = (self.seed_dir / clean_key).resolve()
                if seed_path.is_file():
                    return seed_path.read_bytes()
            return None
        except Exception as e:
            if isinstance(e, ImageStorageError):
                raise
            raise ImageStorageError(f"Failed to read local image {key}: {e}") from e

    def get_url(self, key: str) -> str:
        clean_key = key.lstrip("/\\").replace("\\", "/")
        return f"{self.base_url}/{clean_key}"

    def delete_image(self, key: str) -> bool:
        try:
            target_path = self._get_file_path(key)
            if target_path.is_file():
                target_path.unlink()
                return True
            return False
        except Exception as e:
            if isinstance(e, ImageStorageError):
                raise
            raise ImageStorageError(f"Failed to delete local image {key}: {e}") from e

    def exists(self, key: str) -> bool:
        try:
            target_path = self._get_file_path(key)
            if target_path.is_file():
                return True
            if self.seed_dir and self.seed_dir != self.base_path:
                clean_key = key.lstrip("/\\")
                seed_path = (self.seed_dir / clean_key).resolve()
                return seed_path.is_file()
            return False
        except Exception:
            return False
