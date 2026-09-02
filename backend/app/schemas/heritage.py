"""Authoritative Heritage 3D Reconstruction Schemas and Provenance Models for O-Travelz."""
from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class HeritageSceneType(str, Enum):
    REAL_3D_RECONSTRUCTION = "REAL_3D_RECONSTRUCTION"
    REFERENCE_VIRTUAL_EXPERIENCE = "REFERENCE_VIRTUAL_EXPERIENCE"
    RECONSTRUCTION_IN_PROGRESS = "RECONSTRUCTION_IN_PROGRESS"


class HeritageStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    LOADING = "LOADING"
    PROCESSING = "PROCESSING"
    REFERENCE_ONLY = "REFERENCE_ONLY"
    UNAVAILABLE = "UNAVAILABLE"


class HeritageHotspot(BaseModel):
    id: str
    title: str
    odia_title: Optional[str] = None
    description: str
    architectural_significance: str
    position: List[float] = Field(description="[x, y, z] 3D coordinates relative to monument center")
    look_at: Optional[List[float]] = None
    camera_offset: Optional[List[float]] = None
    dimension: Optional[str] = None
    material: Optional[str] = None
    source_provenance: Optional[str] = None


class HeritageSource(BaseModel):
    title: str
    source: str
    license: str
    url: Optional[str] = None
    access_date: str
    content_type: str = Field(description="Capture methodology (e.g. Photogrammetry, SfM, Government Survey, Museum Reference)")
    attribution: Optional[str] = None


class CameraPreset(BaseModel):
    position: List[float] = [0.0, 2.0, 5.0]
    target: List[float] = [0.0, 1.0, 0.0]
    min_distance: float = 1.5
    max_distance: float = 18.0
    fov: float = 45.0


class AssetMetadata(BaseModel):
    model_config = {"protected_namespaces": ()}
    format: str = "photogrammetric_splat_webgl"
    model_url: Optional[str] = None
    splat_url: Optional[str] = None
    progressive_low_res_url: Optional[str] = None
    point_count: Optional[int] = None
    mesh_quality: str = "high_fidelity"
    coordinate_system: str = "Y-Up"
    file_size_bytes: Optional[int] = None


class HeritageSceneResponse(BaseModel):
    id: str
    name: str
    odia_name: str
    district: str
    century: str
    category: str
    description: str
    scene_type: HeritageSceneType
    status: HeritageStatus
    asset: AssetMetadata
    thumbnail: str
    hero_banner: Optional[str] = None
    hotspots: List[HeritageHotspot] = []
    sources: List[HeritageSource] = []
    reconstruction_notes: str
    camera_preset: CameraPreset = Field(default_factory=CameraPreset)
    lighting_preset: str = "golden_hour"
    surrounding_environment: Optional[str] = None
    is_canonical: bool = True
    dimensions: Optional[Dict[str, str]] = None
    materials: Optional[Dict[str, str]] = None
