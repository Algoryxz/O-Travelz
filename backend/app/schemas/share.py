"""Pydantic schemas for shareable trip snapshot creation and public retrieval.
"""
from __future__ import annotations

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class CreateShareTripRequest(BaseModel):
    """Payload for creating a public read-only trip snapshot."""
    title: str = Field(..., min_length=1, max_length=255, description="Trip title")
    itinerary: Dict[str, Any] = Field(..., description="Itinerary plan structure containing days and stops")
    constraints: Optional[Dict[str, Any]] = Field(default=None, description="Optional trip constraints")


class CreateShareTripResponse(BaseModel):
    """Response returned upon successful creation of a share snapshot."""
    share_id: str
    share_url: str
    created_at: int


class PublicSharedTripResponse(BaseModel):
    """Public read-only response for shared itinerary snapshot (0 private metadata)."""
    share_id: str
    title: str
    itinerary: Dict[str, Any]
    constraints: Optional[Dict[str, Any]] = None
    created_at: int
    expires_at: Optional[int] = None
