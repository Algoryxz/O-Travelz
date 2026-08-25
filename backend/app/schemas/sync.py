"""Pydantic schemas for Cloud Synchronization API."""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class SyncPlaceItem(BaseModel):
    """Schema for a synchronized saved place item."""
    place_id: str = Field(..., min_length=1, max_length=100, description="Canonical place ID, UUID, or research ID")
    place_name: Optional[str] = Field(None, max_length=255)
    place_data: Dict[str, Any] = Field(default_factory=dict, description="Safe snapshot place attributes")
    saved_at: int = Field(..., ge=0, description="Unix millisecond timestamp of save")
    updated_at: int = Field(..., ge=0, description="Unix millisecond timestamp of update")
    is_deleted: bool = Field(default=False, description="Tombstone flag for deletions")

    @field_validator("place_id")
    def validate_place_id(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("place_id cannot be empty or whitespace")
        return clean


class SyncSavedPlacesRequest(BaseModel):
    """Batch upsert request for saved places."""
    items: List[SyncPlaceItem] = Field(..., max_length=100)


class SyncSavedPlacesResponse(BaseModel):
    """Response containing current synced state of saved places."""
    synced_count: int
    items: List[SyncPlaceItem]


class SyncTripItem(BaseModel):
    """Schema for a synchronized trip / itinerary plan."""
    id: str = Field(..., min_length=1, max_length=100, description="Client-generated unique trip ID")
    title: str = Field(..., min_length=1, max_length=255)
    history: List[Dict[str, Any]] = Field(default_factory=list, description="Conversation turns")
    constraints: Optional[Dict[str, Any]] = Field(default=None, description="Planning constraints")
    itinerary: Optional[Dict[str, Any]] = Field(default=None, description="Structured itinerary response")
    timestamp: int = Field(..., ge=0, description="Unix millisecond timestamp of trip creation")
    updated_at: int = Field(..., ge=0, description="Unix millisecond timestamp of update")
    is_deleted: bool = Field(default=False, description="Tombstone flag for deletions")

    @field_validator("id")
    def validate_trip_id(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Trip id cannot be empty or whitespace")
        return clean


class SyncTripsRequest(BaseModel):
    """Batch upsert request for trips."""
    items: List[SyncTripItem] = Field(..., max_length=50)


class SyncTripsResponse(BaseModel):
    """Response containing current synced state of trips."""
    synced_count: int
    items: List[SyncTripItem]
