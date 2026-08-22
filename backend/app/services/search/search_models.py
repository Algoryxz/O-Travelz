"""Typed contracts and data models for Search & Knowledge Retrieval."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, List, Optional
from pydantic import BaseModel, Field


class SearchQueryParams(BaseModel):
    """Normalized query parameters for search and retrieval."""
    search: Optional[str] = Field(None, description="Free-text search query across names, descriptions, districts, categories, and aliases")
    district: Optional[str] = Field(None, description="Filter by administrative district")
    region: Optional[str] = Field(None, description="Filter by canonical travel region")
    category: Optional[str] = Field(None, description="Filter by physical place category")
    interest: Optional[str] = Field(None, description="Filter by thematic traveler interest")
    verification_status: Optional[str] = Field(None, description="Filter by verification status (e.g. verified)")
    is_medical: Optional[bool] = Field(None, description="Explicit flag to filter medical facilities")
    is_transit: Optional[bool] = Field(None, description="Explicit flag to filter transit hubs")
    near_lat: Optional[float] = Field(None, ge=17.0, le=23.5, description="Reference latitude for proximity retrieval")
    near_lon: Optional[float] = Field(None, ge=81.0, le=88.0, description="Reference longitude for proximity retrieval")
    radius_km: Optional[float] = Field(None, gt=0, le=500.0, description="Proximity search radius in kilometers")
    limit: int = Field(50, ge=1, le=200, description="Maximum number of items to return (max 200)")
    offset: int = Field(0, ge=0, description="Number of items to skip for pagination")


@dataclass
class ScoredPlaceCandidate:
    """Internal candidate representation with ranking metadata."""
    place: Any
    category_name: str
    score: float = 0.0
    distance_km: Optional[float] = None
    match_reasons: List[str] = field(default_factory=list)


class CompactKnowledgeRecord(BaseModel):
    """Compact, structured knowledge record for AI assistant grounding and prompt injection."""
    id: str
    name: str
    district: str
    region: str
    category: str
    description: Optional[str] = None
    interests: List[str] = []
    lat: Optional[float] = None
    lon: Optional[float] = None
    address: Optional[str] = None
    verification_status: Optional[str] = None
    source: Optional[str] = None
    is_medical: bool = False
    is_transit: bool = False
    contact_phone: Optional[str] = None
    emergency_phone: Optional[str] = None
    distance_km: Optional[float] = None


class SearchPageResponse(BaseModel):
    """Paginated search response metadata."""
    items: List[Any]
    total_count: int
    limit: int
    offset: int
