"""Authoritative Digital Heritage 3D Reconstruction HTTP Endpoints for O-Travelz."""
from __future__ import annotations

from typing import List
from fastapi import APIRouter, HTTPException, Path

from app.schemas.heritage import (
    HeritageSceneResponse,
    HeritageHotspot,
    HeritageSource,
    AssetMetadata,
)
from app.services.heritage_service import get_heritage_service

router = APIRouter()


@router.get("/scenes", response_model=List[HeritageSceneResponse])
def get_all_scenes() -> List[HeritageSceneResponse]:
    """Retrieve catalog of all verified digital heritage 3D reconstructions."""
    service = get_heritage_service()
    return service.get_all_scenes()


@router.get("/scenes/{scene_id}", response_model=HeritageSceneResponse)
def get_scene(
    scene_id: str = Path(..., description="Canonical ID of the heritage scene (e.g. konark-sun-temple)"),
) -> HeritageSceneResponse:
    """Retrieve full 3D reconstruction and metadata for a specific heritage monument."""
    service = get_heritage_service()
    scene = service.get_scene_by_id(scene_id)
    if not scene:
        raise HTTPException(status_code=404, detail=f"Heritage scene '{scene_id}' not found.")
    return scene


@router.get("/scenes/{scene_id}/asset", response_model=AssetMetadata)
def get_scene_asset(
    scene_id: str = Path(..., description="Canonical ID of the heritage scene"),
) -> AssetMetadata:
    """Retrieve photogrammetric asset stream URL, format, and resolution metadata."""
    service = get_heritage_service()
    asset = service.get_scene_asset(scene_id)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset for heritage scene '{scene_id}' not found.")
    return asset


@router.get("/scenes/{scene_id}/hotspots", response_model=List[HeritageHotspot])
def get_scene_hotspots(
    scene_id: str = Path(..., description="Canonical ID of the heritage scene"),
) -> List[HeritageHotspot]:
    """Retrieve interactive 3D hotspots pinned to authentic architectural features."""
    service = get_heritage_service()
    hotspots = service.get_scene_hotspots(scene_id)
    if hotspots is None:
        raise HTTPException(status_code=404, detail=f"Hotspots for heritage scene '{scene_id}' not found.")
    return hotspots


@router.get("/scenes/{scene_id}/sources", response_model=List[HeritageSource])
def get_scene_sources(
    scene_id: str = Path(..., description="Canonical ID of the heritage scene"),
) -> List[HeritageSource]:
    """Retrieve provenance, survey datasets, and legal licensing attributions."""
    service = get_heritage_service()
    sources = service.get_scene_sources(scene_id)
    if sources is None:
        raise HTTPException(status_code=404, detail=f"Sources for heritage scene '{scene_id}' not found.")
    return sources
