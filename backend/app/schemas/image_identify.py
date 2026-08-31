"""Pydantic schemas for AI Image Identification and Visual Landmark Discovery."""
from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field

from app.ai.contracts import EvidenceItem


class ImageIdentifyRequest(BaseModel):
    image_data: Optional[str] = Field(None, description="Base64 data URI or raw base64 string of the uploaded image")
    image_url: Optional[str] = Field(None, description="Direct URL of the image to analyze")
    file_name: Optional[str] = Field(None, description="Original filename for client-side hint extraction")


class PlaceMatchCandidate(BaseModel):
    place_id: str
    name: str
    district: str
    category: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    confidence_tier: str = Field(..., description="Likely Match | Possible Match | Uncertain | Could not confidently identify this place")
    reason: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    image_url: Optional[str] = None


class ImageIdentifyResponse(BaseModel):
    query_type: str = "image"
    status: str = Field(..., description="verified_match | success | uncertain | no_match | provider_unavailable | invalid_image")
    mode: str = Field(default="heuristic_fallback", description="real_multimodal | heuristic_fallback | unavailable")
    message: str
    candidate_name: Optional[str] = None
    canonical_place_id: Optional[str] = None
    confidence: Optional[float] = None
    top_match: Optional[PlaceMatchCandidate] = None
    candidates: List[PlaceMatchCandidate] = []
    alternatives: List[PlaceMatchCandidate] = []
    evidence: List[EvidenceItem] = []
    confidence_summary: Optional[str] = None
