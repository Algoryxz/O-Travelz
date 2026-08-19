"""Provider-neutral image storage interfaces and models."""
from __future__ import annotations

import hashlib
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass(frozen=True)
class StoredAsset:
    """Immutable representation of a stored image asset."""

    key: str
    url: str
    content_type: str
    size_bytes: int
    content_sha256: str
    metadata: Dict[str, str] = field(default_factory=dict)


class ImageStorageError(Exception):
    """Base exception for storage operations."""

    pass


class StorageAuthenticationError(ImageStorageError):
    """Raised when storage credentials are missing or invalid."""

    pass


class ImageStorage(ABC):
    """Abstract interface for image asset persistence."""

    @abstractmethod
    def save_image(
        self,
        key: str,
        data: bytes,
        content_type: str = "image/webp",
        metadata: Optional[Dict[str, str]] = None,
    ) -> StoredAsset:
        """Store image bytes under the specified key and return asset metadata."""
        pass

    @abstractmethod
    def get_image(self, key: str) -> Optional[bytes]:
        """Retrieve raw image bytes for a key, or None if not found."""
        pass

    @abstractmethod
    def get_url(self, key: str) -> str:
        """Get the public or relative URL for a key."""
        pass

    @abstractmethod
    def delete_image(self, key: str) -> bool:
        """Delete an image asset if it exists. Return True if deleted, False otherwise."""
        pass

    @abstractmethod
    def exists(self, key: str) -> bool:
        """Check if an image asset exists."""
        pass

    @staticmethod
    def calculate_sha256(data: bytes) -> str:
        """Calculate SHA-256 hex digest for binary data."""
        return hashlib.sha256(data).hexdigest()
