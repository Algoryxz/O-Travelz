"""Pydantic schemas for place image assets and provenance metadata."""
from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PlaceImageBase(BaseModel):
    storage_key: Optional[str] = Field(None, description="Provider-neutral storage key/path")
    url: str = Field(..., description="Publicly accessible delivery URL or relative path")
    thumbnail_url: Optional[str] = Field(None, description="Thumbnail variant URL")
    card_url: Optional[str] = Field(None, description="Card variant URL")
    alt_text: Optional[str] = Field(None, description="Accessible alt text")
    title: Optional[str] = Field(None, description="Image title / label")
    source_url: Optional[str] = Field(None, description="Original upstream source link")
    source_name: str = Field(..., description="Name of the image provider, archive, or department")
    creator: Optional[str] = Field(None, description="Photographer or author name")
    license: str = Field(..., description="Applicable license (e.g. CC BY-SA 4.0, Public Domain)")
    attribution: str = Field(..., description="Complete required legal attribution statement")
    retrieval_timestamp: Optional[datetime] = None
    width: Optional[int] = Field(None, gt=0, description="Image pixel width")
    height: Optional[int] = Field(None, gt=0, description="Image pixel height")
    aspect_ratio: Optional[float] = Field(None, gt=0, description="Aspect ratio (width / height)")
    content_sha256: Optional[str] = Field(None, description="SHA-256 hash of image content")
    content_type: Optional[str] = Field("image/webp", description="MIME content type")
    size_bytes: Optional[int] = Field(None, ge=0, description="Size in bytes")
    status: str = Field("verified", description="Image lifecycle status: verified, pending, processing, failed")
    sort_order: int = Field(0, ge=0, description="Sort order within destination gallery")
    is_primary: bool = Field(False, description="Whether this is the primary hero image for the place")

    @field_validator("content_sha256")
    @classmethod
    def validate_sha256(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_clean = v.strip().lower()
            if len(v_clean) != 64 or not all(c in "0123456789abcdef" for c in v_clean):
                raise ValueError("content_sha256 must be a 64-character lowercase hex string")
            return v_clean
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"verified", "pending", "processing", "failed"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()


class PlaceImageCreate(PlaceImageBase):
    place_id: UUID


class PlaceImageUpdate(BaseModel):
    storage_key: Optional[str] = None
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    card_url: Optional[str] = None
    alt_text: Optional[str] = None
    title: Optional[str] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    creator: Optional[str] = None
    license: Optional[str] = None
    attribution: Optional[str] = None
    retrieval_timestamp: Optional[datetime] = None
    width: Optional[int] = Field(None, gt=0)
    height: Optional[int] = Field(None, gt=0)
    aspect_ratio: Optional[float] = Field(None, gt=0)
    content_sha256: Optional[str] = None
    content_type: Optional[str] = None
    size_bytes: Optional[int] = Field(None, ge=0)
    status: Optional[str] = None
    sort_order: Optional[int] = Field(None, ge=0)
    is_primary: Optional[bool] = None

    @field_validator("content_sha256")
    @classmethod
    def validate_sha256(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_clean = v.strip().lower()
            if len(v_clean) != 64 or not all(c in "0123456789abcdef" for c in v_clean):
                raise ValueError("content_sha256 must be a 64-character lowercase hex string")
            return v_clean
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"verified", "pending", "processing", "failed"}
            if v.lower() not in allowed:
                raise ValueError(f"status must be one of {allowed}")
            return v.lower()
        return v


class PlaceImageResponse(PlaceImageBase):
    id: UUID
    place_id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
