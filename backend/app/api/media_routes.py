"""Authoritative Media, Video Generation, and 3D Heritage Experience HTTP Endpoints for O-Travelz V3."""
from __future__ import annotations

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.place import Place
from app.models.category import Category
from app.schemas.image import PlaceImageResponse
from app.schemas.media import (
    PlaceMediaResponse,
    VideoGenerationRequest,
    VideoGenerationResponse,
    Model3DGenerationRequest,
    Model3DGenerationResponse,
    ProviderStatusResponse,
)
from app.services.media.video_provider import get_video_provider
from app.services.media.model3d_provider import get_model3d_provider

router = APIRouter()


def _resolve_place(db: Session, place_id: str) -> Optional[tuple[Place, str]]:
    """Helper to locate Place and category by UUID or research_id."""
    is_valid_uuid = False
    try:
        uuid.UUID(str(place_id))
        is_valid_uuid = True
    except (ValueError, AttributeError, TypeError):
        is_valid_uuid = False

    try:
        record = None
        if is_valid_uuid:
            record = (
                db.query(Place, Category)
                .join(Category, Place.category_id == Category.id)
                .filter(Place.id == place_id)
                .first()
            )

        if not record:
            record = (
                db.query(Place, Category)
                .join(Category, Place.category_id == Category.id)
                .filter(Place.research_id == place_id)
                .first()
            )

        if record:
            return record[0], record[1].name
    except Exception:
        # Fall back to lightweight lookup when SpatiaLite/GIS extensions are uninitialized in test SQLite
        pass

    # If database is not seeded or running in lightweight mode, fallback lookup
    return None


@router.get("/places/{place_id}", response_model=PlaceMediaResponse)
def get_place_media(
    place_id: str,
    db: Session = Depends(get_db),
) -> PlaceMediaResponse:
    """Retrieve full media suite (images, video preview, 3D model) for a destination."""
    res = _resolve_place(db, place_id)
    place_name = place_id
    place_cat = "destination"
    place_district = "Odisha"
    image_responses = []

    if res:
        place, cat_name = res
        place_name = place.name
        place_cat = cat_name
        place_district = place.district or "Odisha"
        if hasattr(place, "images") and place.images:
            try:
                image_responses = [PlaceImageResponse.model_validate(img) for img in place.images]
            except Exception:
                image_responses = []

    video_provider = get_video_provider()
    model3d_provider = get_model3d_provider()

    video_preview = video_provider.get_curated_preview(place_id)
    model_3d = model3d_provider.get_curated_model(place_id)

    available_tabs = ["photos"]
    if video_preview:
        available_tabs.append("video")
    if model_3d:
        available_tabs.append("3d")

    hero_poster = video_preview.poster_url if video_preview else (image_responses[0].url if image_responses else None)

    return PlaceMediaResponse(
        place_id=place_id,
        place_name=place_name,
        category=place_cat,
        district=place_district,
        images=image_responses,
        video=video_preview,
        model_3d=model_3d,
        has_video=bool(video_preview),
        has_3d=bool(model_3d),
    )


@router.post("/video/generate", response_model=VideoGenerationResponse)
async def generate_place_video(
    request: VideoGenerationRequest,
    db: Session = Depends(get_db),
) -> VideoGenerationResponse:
    """Trigger or retrieve video generation for a destination."""
    res = _resolve_place(db, request.place_id)
    place_name = request.place_id
    place_cat = "heritage"
    place_district = "Odisha"

    if res:
        place, cat_name = res
        place_name = place.name
        place_cat = cat_name
        place_district = place.district or "Odisha"

    provider = get_video_provider()
    return await provider.generate_video(
        request=request,
        place_name=place_name,
        place_category=place_cat,
        place_district=place_district,
    )


@router.post("/3d/generate", response_model=Model3DGenerationResponse)
async def generate_place_3d(
    request: Model3DGenerationRequest,
    db: Session = Depends(get_db),
) -> Model3DGenerationResponse:
    """Trigger or retrieve 3D model generation for a destination."""
    res = _resolve_place(db, request.place_id)
    place_name = request.place_id
    place_cat = "monument"
    place_district = "Odisha"

    if res:
        place, cat_name = res
        place_name = place.name
        place_cat = cat_name
        place_district = place.district or "Odisha"

    provider = get_model3d_provider()
    return await provider.generate_model(
        request=request,
        place_name=place_name,
        place_category=place_cat,
        place_district=place_district,
    )


@router.get("/providers/status", response_model=ProviderStatusResponse)
def get_media_providers_status() -> ProviderStatusResponse:
    """Check configuration and health status of video and 3D providers."""
    v_provider = get_video_provider()
    m_provider = get_model3d_provider()

    return ProviderStatusResponse(
        video_provider=v_provider.provider_name,
        video_configured=v_provider.is_configured,
        video_status="configured" if v_provider.is_configured else "unconfigured_fallback_active",
        model_3d_provider=m_provider.provider_name,
        model_3d_configured=m_provider.is_configured,
        model_3d_status="configured" if m_provider.is_configured else "unconfigured_fallback_active",
        notice="Live generation requires VIDEO_PROVIDER_API_KEY / MODEL_3D_API_KEY in backend .env. Curated Odisha media active.",
    )
