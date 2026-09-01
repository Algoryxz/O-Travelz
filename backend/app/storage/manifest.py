"""backend/app/storage/manifest.py — Canonical Image Manifest & Variant Contract.

Defines authoritative typed models for destination image manifest records,
variant metadata, quality status, relevance status, and evidence classification.

Guarantees 100% backward compatibility with existing production manifest records
(data/images/sources/manifest.json) while standardizing canonical classifications
(EXACT_LOCATION_VERIFIED, RELATED_LOCATION_ONLY, GENERIC_IMAGE, REJECTED, REVIEW_REQUIRED).
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
from pydantic import BaseModel, Field, field_validator, model_validator


class EvidenceClassification(str, Enum):
    """Canonical photographic evidence classification."""

    EXACT_LOCATION_VERIFIED = "EXACT_LOCATION_VERIFIED"
    RELATED_LOCATION_ONLY = "RELATED_LOCATION_ONLY"
    GENERIC_IMAGE = "GENERIC_IMAGE"
    REJECTED = "REJECTED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"

    @classmethod
    def normalize(cls, value: Union[str, "EvidenceClassification", None]) -> "EvidenceClassification":
        """Normalize legacy strings or case variations to canonical classification."""
        if not value:
            return cls.EXACT_LOCATION_VERIFIED

        if isinstance(value, cls):
            return value

        cleaned = str(value).strip().upper()
        if cleaned in ("EXACT_LOCATION_VERIFIED", "VERIFIED_AUTHENTIC_PHOTOGRAPHY", "VERIFIED"):
            return cls.EXACT_LOCATION_VERIFIED
        if cleaned in ("RELATED_LOCATION_ONLY", "RELATED_LOCATION", "RELATED"):
            return cls.RELATED_LOCATION_ONLY
        if cleaned in ("GENERIC_IMAGE", "GENERIC"):
            return cls.GENERIC_IMAGE
        if cleaned in ("REJECTED", "INVALID"):
            return cls.REJECTED
        if cleaned in ("REVIEW_REQUIRED", "NEEDS_REVIEW", "PENDING", "SUSPECT"):
            return cls.REVIEW_REQUIRED

        # Fallback to exact match or REVIEW_REQUIRED
        try:
            return cls(cleaned)
        except ValueError:
            return cls.REVIEW_REQUIRED


class QualityStatus(str, Enum):
    """Technical quality of the image asset."""

    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    UNKNOWN = "UNKNOWN"

    @classmethod
    def normalize(cls, value: Union[str, "QualityStatus", None]) -> "QualityStatus":
        if not value:
            return cls.VERIFIED
        if isinstance(value, cls):
            return value
        cleaned = str(value).strip().upper()
        if cleaned in ("VERIFIED", "PASSED", "OK"):
            return cls.VERIFIED
        if cleaned in ("REJECTED", "FAILED", "CORRUPT"):
            return cls.REJECTED
        if cleaned in ("NEEDS_REVIEW", "REVIEW_REQUIRED"):
            return cls.NEEDS_REVIEW
        return cls.UNKNOWN


class RelevanceStatus(str, Enum):
    """Subject matter relevance to destination."""

    RELEVANT = "RELEVANT"
    SUSPECT = "SUSPECT"
    REJECTED = "REJECTED"
    UNKNOWN = "UNKNOWN"

    @classmethod
    def normalize(cls, value: Union[str, "RelevanceStatus", None]) -> "RelevanceStatus":
        if not value:
            return cls.RELEVANT
        if isinstance(value, cls):
            return value
        cleaned = str(value).strip().upper()
        if cleaned in ("RELEVANT", "EXACT"):
            return cls.RELEVANT
        if cleaned in ("SUSPECT", "RELATED", "AMBIGUOUS"):
            return cls.SUSPECT
        if cleaned in ("REJECTED", "UNRELATED"):
            return cls.REJECTED
        return cls.UNKNOWN


class VariantMetadata(BaseModel):
    """Metadata for a standardized image variant."""

    variant_type: str = Field(..., description="Variant identifier: original | hero | card | thumbnail")
    storage_key: Optional[str] = Field(None, description="Storage key or path relative to base")
    url: Optional[str] = Field(None, description="Direct or CDN URL")
    width: int = Field(..., description="Image width in pixels")
    height: int = Field(..., description="Image height in pixels")
    size_bytes: Optional[int] = Field(None, description="File size in bytes")
    content_sha256: Optional[str] = Field(None, description="SHA-256 hash of this variant")
    mime_type: str = Field("image/webp", description="MIME type")

    model_config = {
        "extra": "ignore",
    }


class ImageManifestItem(BaseModel):
    """Canonical destination image manifest record.

    Fully compatible with legacy data/images/sources/manifest.json and the
    strict photographic evidence registry.
    """

    place_id: str = Field(..., description="Canonical place identifier (e.g. place_bbsr_001)")
    place_name: Optional[str] = Field(None, description="Human-readable destination name")
    asset_hash: Optional[str] = Field(None, description="Short hex asset hash or directory name")
    source_url: str = Field(..., description="Original upstream image URL")
    download_url: Optional[str] = Field(None, description="Direct download or thumbnail source URL")
    source_name: str = Field(..., description="Source institution or archive (e.g. Wikimedia Commons)")
    creator: str = Field(..., description="Photographer or author attribution name")
    license: str = Field(..., description="License identifier (e.g. CC BY-SA 4.0, CC0, Public Domain)")
    license_url: Optional[str] = Field(None, description="Link to license text if available")
    attribution: str = Field(..., description="Full legal attribution statement")
    wikimedia_file: Optional[str] = Field(None, description="Wikimedia Commons file title if applicable")
    title: Optional[str] = Field(None, description="Title of the photograph")
    alt_text: Optional[str] = Field(None, description="Descriptive alt text for accessibility")
    description: Optional[str] = Field(None, description="Extended caption or provenance note")
    is_primary: bool = Field(True, description="Whether this is the primary destination image")
    sort_order: int = Field(1, description="Display order ranking")
    retrieval_timestamp: Optional[str] = Field(None, description="ISO-8601 retrieval timestamp")
    content_sha256: Optional[str] = Field(None, description="SHA-256 digest of the original image")

    # Technical Dimensions & Formats
    width: Optional[int] = Field(None, description="Original width in pixels")
    height: Optional[int] = Field(None, description="Original height in pixels")
    mime_type: Optional[str] = Field(None, description="MIME content type")

    # Three Separated Dimensions of Evaluation
    quality_status: QualityStatus = Field(QualityStatus.VERIFIED, description="Technical quality status")
    relevance_status: RelevanceStatus = Field(RelevanceStatus.RELEVANT, description="Location relevance status")
    verification_status: EvidenceClassification = Field(
        EvidenceClassification.EXACT_LOCATION_VERIFIED,
        description="Authoritative evidence classification"
    )

    # Granular Variants Structure
    variants: Optional[Dict[str, VariantMetadata]] = Field(
        default_factory=dict,
        description="Map of variant_type -> VariantMetadata"
    )

    # Legacy Manifest Flat Dimension & Metric Compatibility
    original_dimensions: Optional[Union[List[int], Tuple[int, int]]] = Field(None, description="Legacy [width, height]")
    hero_dimensions: Optional[Union[List[int], Tuple[int, int]]] = Field(None, description="Legacy hero [width, height]")
    card_dimensions: Optional[Union[List[int], Tuple[int, int]]] = Field(None, description="Legacy card [width, height]")
    thumbnail_dimensions: Optional[Union[List[int], Tuple[int, int]]] = Field(None, description="Legacy thumb [width, height]")
    hero_bytes: Optional[int] = Field(None, description="Legacy hero file size in bytes")

    # Additional Governance & Audit Metadata
    notes: Optional[str] = Field(None, description="Audit or evidence notes")
    rejection_reason: Optional[str] = Field(None, description="Reason for rejection if applicable")
    verified_at: Optional[str] = Field(None, description="Verification timestamp")
    reviewer: Optional[str] = Field(None, description="Auditor or reviewer name")

    model_config = {
        "extra": "ignore",
        "use_enum_values": True,
    }

    @field_validator("verification_status", mode="before")
    @classmethod
    def validate_verification_status(cls, v: Any) -> str:
        return EvidenceClassification.normalize(v).value

    @field_validator("quality_status", mode="before")
    @classmethod
    def validate_quality_status(cls, v: Any) -> str:
        return QualityStatus.normalize(v).value

    @field_validator("relevance_status", mode="before")
    @classmethod
    def validate_relevance_status(cls, v: Any) -> str:
        return RelevanceStatus.normalize(v).value

    @model_validator(mode="after")
    def populate_dimensional_compatibility(self) -> "ImageManifestItem":
        """Synchronize flat dimension fields with width/height and variants."""
        # Infer width/height from original_dimensions if not explicitly given
        if (self.width is None or self.height is None) and self.original_dimensions:
            if len(self.original_dimensions) >= 2:
                self.width = self.original_dimensions[0]
                self.height = self.original_dimensions[1]

        # Infer original_dimensions from width/height if not given
        if self.original_dimensions is None and self.width and self.height:
            self.original_dimensions = [self.width, self.height]

        return self

    def to_legacy_dict(self) -> Dict[str, Any]:
        """Export as a clean dict matching legacy manifest.json schema."""
        raw = self.model_dump(exclude_none=True)
        # Ensure verification_status is serializable
        if "verification_status" in raw and isinstance(raw["verification_status"], Enum):
            raw["verification_status"] = raw["verification_status"].value
        return raw


def load_manifest_records(manifest_path: Union[Path, str]) -> List[ImageManifestItem]:
    """Load and parse image manifest records from a JSON file."""
    path = Path(manifest_path)
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError(f"Expected top-level list in manifest: {manifest_path}")
    return [ImageManifestItem.model_validate(item) for item in data]


def save_manifest_records(records: List[ImageManifestItem], manifest_path: Union[Path, str]) -> None:
    """Save image manifest records to a JSON file preserving formatting."""
    path = Path(manifest_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = [record.to_legacy_dict() for record in records]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
