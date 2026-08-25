"""Cloud Synchronization API Routes.

Provides authenticated endpoints for:
1. Synchronizing saved places (/api/v1/sync/saved-places) with canonical place validation.
2. Synchronizing saved trips (/api/v1/sync/trips) with payload size bounds and conflict resolution.
"""
from __future__ import annotations

import json
import logging
import uuid
from typing import Any, Dict, List, Optional, Set
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.ai.rate_limit import rate_limiter
from app.api.auth_routes import get_required_user
from app.core.config import settings
from app.data.multilingual_taxonomy import MULTILINGUAL_ALIASES
from app.db.session import get_db
from app.models.place import Place
from app.models.session import UserSavedPlace, UserSavedTrip
from app.models.user import User
from app.schemas.sync import (
    SyncPlaceItem,
    SyncSavedPlacesRequest,
    SyncSavedPlacesResponse,
    SyncTripItem,
    SyncTripsRequest,
    SyncTripsResponse,
)
from app.services.search.search_normalizer import normalize_text


logger = logging.getLogger(__name__)

router = APIRouter()


def _enforce_sync_rate_limit(user_id: Any, action: str) -> None:
    """Enforce 30 requests/minute per authenticated user."""
    key = f"sync_{action}_{str(user_id)}"
    allowed, retry_after = rate_limiter.check_and_record(key)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limited",
                "message": "Too many sync requests. Please wait before retrying.",
                "retry_after_seconds": retry_after,
            },
            headers={"Retry-After": str(retry_after)},
        )


def _validate_and_resolve_canonical_places(
    place_ids: List[str],
    db: Session,
) -> Dict[str, str]:
    """
    Batch validate place IDs against canonical places table and taxonomy.
    Returns mapping: incoming_place_id -> canonical_display_name.
    Unknown place IDs are omitted from the map.
    """
    resolved: Dict[str, str] = {}
    if not place_ids:
        return resolved

    # 1. Parse possible UUIDs
    uuid_candidates: List[uuid.UUID] = []
    for pid in place_ids:
        try:
            uuid_candidates.append(uuid.UUID(pid))
        except (ValueError, TypeError):
            pass

    # 2. Query places by ID, research_id, or name
    query = db.query(Place.id, Place.research_id, Place.name)
    conditions = []
    if uuid_candidates:
        conditions.append(Place.id.in_(uuid_candidates))

    # Add research_id and name matches
    conditions.append(Place.research_id.in_(place_ids))
    conditions.append(Place.name.in_(place_ids))

    places = query.filter(or_(*conditions)).all()

    for p_id, p_research_id, p_name in places:
        p_id_str = str(p_id)
        for pid in place_ids:
            if pid == p_id_str or pid == p_research_id or pid.lower() == p_name.lower():
                resolved[pid] = p_name

    # 3. Fallback check against multilingual aliases / normalized place catalog
    for pid in place_ids:
        if pid in resolved:
            continue
        norm = normalize_text(pid)
        # Check alias keys
        if norm in MULTILINGUAL_ALIASES:
            resolved[pid] = MULTILINGUAL_ALIASES[norm][0]
        else:
            # Query by normalized name
            matching = db.query(Place.name).all()
            for (db_p_name,) in matching:
                if normalize_text(db_p_name) == norm:
                    resolved[pid] = db_p_name
                    break

    return resolved


# =============================================================================
# Saved Places Synchronization
# =============================================================================

@router.get("/saved-places", response_model=SyncSavedPlacesResponse)
def get_saved_places(
    current_user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
) -> SyncSavedPlacesResponse:
    """Retrieve all synchronized saved places (including tombstones) for current user."""
    _enforce_sync_rate_limit(current_user.id, "get_places")

    records = (
        db.query(UserSavedPlace)
        .filter(UserSavedPlace.user_id == current_user.id)
        .order_by(UserSavedPlace.saved_at.desc())
        .all()
    )

    items = [
        SyncPlaceItem(
            place_id=r.place_id,
            place_name=r.place_name,
            place_data=r.place_data,
            saved_at=r.saved_at,
            updated_at=r.updated_at,
            is_deleted=r.is_deleted,
        )
        for r in records
    ]

    return SyncSavedPlacesResponse(synced_count=len(items), items=items)


@router.post("/saved-places", response_model=SyncSavedPlacesResponse)
def sync_saved_places(
    payload: SyncSavedPlacesRequest,
    current_user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
) -> SyncSavedPlacesResponse:
    """
    Batch upsert saved places with canonical place validation and timestamp conflict resolution.
    """
    _enforce_sync_rate_limit(current_user.id, "post_places")

    if len(payload.items) > settings.sync_max_places_batch:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "batch_limit_exceeded",
                "message": f"Maximum {settings.sync_max_places_batch} places per request.",
            },
        )

    # 1. Validate canonical place IDs
    place_ids = [item.place_id for item in payload.items]
    canonical_map = _validate_and_resolve_canonical_places(place_ids, db)

    for item in payload.items:
        if item.place_id not in canonical_map:
            raise HTTPException(
                status_code=422,
                detail={
                    "error": "unknown_place_id",
                    "message": f"Place '{item.place_id}' does not match any authoritative canonical destination.",
                },
            )

    # 2. Fetch existing records for this user
    existing_records = (
        db.query(UserSavedPlace)
        .filter(
            UserSavedPlace.user_id == current_user.id,
            UserSavedPlace.place_id.in_(place_ids),
        )
        .all()
    )
    existing_map = {r.place_id: r for r in existing_records}

    # 3. Deterministic conflict resolution
    for item in payload.items:
        canonical_name = canonical_map[item.place_id]
        existing = existing_map.get(item.place_id)

        if existing:
            if item.updated_at > existing.updated_at:
                existing.place_name = canonical_name
                existing.place_data = item.place_data
                existing.saved_at = item.saved_at
                existing.updated_at = item.updated_at
                existing.is_deleted = item.is_deleted
            elif item.updated_at == existing.updated_at:
                # Deterministic tie-breaker: tombstone wins
                if item.is_deleted and not existing.is_deleted:
                    existing.is_deleted = True
                    existing.updated_at = item.updated_at
        else:
            new_record = UserSavedPlace(
                id=uuid.uuid4(),
                user_id=current_user.id,
                place_id=item.place_id,
                place_name=canonical_name,
                place_data=item.place_data,
                saved_at=item.saved_at,
                updated_at=item.updated_at,
                is_deleted=item.is_deleted,
            )
            db.add(new_record)

    db.commit()

    # 4. Return all current records for user
    all_records = (
        db.query(UserSavedPlace)
        .filter(UserSavedPlace.user_id == current_user.id)
        .order_by(UserSavedPlace.saved_at.desc())
        .all()
    )

    items = [
        SyncPlaceItem(
            place_id=r.place_id,
            place_name=r.place_name,
            place_data=r.place_data,
            saved_at=r.saved_at,
            updated_at=r.updated_at,
            is_deleted=r.is_deleted,
        )
        for r in all_records
    ]

    return SyncSavedPlacesResponse(synced_count=len(items), items=items)


# =============================================================================
# Saved Trips Synchronization
# =============================================================================

@router.get("/trips", response_model=SyncTripsResponse)
def get_saved_trips(
    current_user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
) -> SyncTripsResponse:
    """Retrieve all synchronized trips (including tombstones) for current user."""
    _enforce_sync_rate_limit(current_user.id, "get_trips")

    records = (
        db.query(UserSavedTrip)
        .filter(UserSavedTrip.user_id == current_user.id)
        .order_by(UserSavedTrip.timestamp.desc())
        .all()
    )

    items = [
        SyncTripItem(
            id=r.id,
            title=r.title,
            history=r.history,
            constraints=r.constraints,
            itinerary=r.itinerary,
            timestamp=r.timestamp,
            updated_at=r.updated_at,
            is_deleted=r.is_deleted,
        )
        for r in records
    ]

    return SyncTripsResponse(synced_count=len(items), items=items)


@router.post("/trips", response_model=SyncTripsResponse)
def sync_saved_trips(
    payload: SyncTripsRequest,
    current_user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
) -> SyncTripsResponse:
    """
    Batch upsert saved trips with payload size bounds and conflict resolution.
    """
    _enforce_sync_rate_limit(current_user.id, "post_trips")

    if len(payload.items) > settings.sync_max_trips_batch:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "batch_limit_exceeded",
                "message": f"Maximum {settings.sync_max_trips_batch} trips per request.",
            },
        )

    # 1. Enforce payload size per trip item (max 50KB)
    for item in payload.items:
        raw_size = len(json.dumps(item.model_dump()).encode("utf-8"))
        if raw_size > settings.sync_max_trip_payload_bytes:
            raise HTTPException(
                status_code=422,
                detail={
                    "error": "trip_payload_too_large",
                    "message": f"Trip '{item.id}' payload exceeds {settings.sync_max_trip_payload_bytes} bytes.",
                },
            )

    # 2. Fetch existing records for this user
    trip_ids = [item.id for item in payload.items]
    existing_records = (
        db.query(UserSavedTrip)
        .filter(
            UserSavedTrip.user_id == current_user.id,
            UserSavedTrip.id.in_(trip_ids),
        )
        .all()
    )
    existing_map = {r.id: r for r in existing_records}

    # 3. Deterministic conflict resolution
    for item in payload.items:
        existing = existing_map.get(item.id)

        if existing:
            if item.updated_at > existing.updated_at:
                existing.title = item.title
                existing.history = item.history
                existing.constraints = item.constraints
                existing.itinerary = item.itinerary
                existing.timestamp = item.timestamp
                existing.updated_at = item.updated_at
                existing.is_deleted = item.is_deleted
            elif item.updated_at == existing.updated_at:
                # Deterministic tie-breaker: tombstone wins
                if item.is_deleted and not existing.is_deleted:
                    existing.is_deleted = True
                    existing.updated_at = item.updated_at
        else:
            new_trip = UserSavedTrip(
                id=item.id,
                user_id=current_user.id,
                title=item.title,
                history=item.history,
                constraints=item.constraints,
                itinerary=item.itinerary,
                timestamp=item.timestamp,
                updated_at=item.updated_at,
                is_deleted=item.is_deleted,
            )
            db.add(new_trip)

    db.commit()

    # 4. Return all current records for user
    all_records = (
        db.query(UserSavedTrip)
        .filter(UserSavedTrip.user_id == current_user.id)
        .order_by(UserSavedTrip.timestamp.desc())
        .all()
    )

    items = [
        SyncTripItem(
            id=r.id,
            title=r.title,
            history=r.history,
            constraints=r.constraints,
            itinerary=r.itinerary,
            timestamp=r.timestamp,
            updated_at=r.updated_at,
            is_deleted=r.is_deleted,
        )
        for r in all_records
    ]

    return SyncTripsResponse(synced_count=len(items), items=items)
