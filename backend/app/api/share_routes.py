"""Public and Authenticated Shareable Trip Snapshot API Routes.

Provides:
- POST /api/v1/trips/share: Authenticated creation of immutable read-only trip snapshots.
- GET /api/v1/trips/shared/{share_id}: Public read-only retrieval of shared trip snapshots.
"""
from __future__ import annotations

import json
import logging
import secrets
from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.ai.rate_limit import rate_limiter
from app.api.auth_routes import get_required_user
from app.core.config import settings
from app.db.session import get_db
from app.models.session import SharedTripSnapshot
from app.models.user import User
from app.schemas.share import (
    CreateShareTripRequest,
    CreateShareTripResponse,
    PublicSharedTripResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_client_ip(request: Request) -> str:
    """Extract client IP safely from forwarded headers or connection."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


def _enforce_share_create_rate_limit(user_id: Any) -> None:
    """Enforce maximum 20 share snapshot creations per hour per authenticated user."""
    key = f"share_create_{str(user_id)}"
    allowed, retry_after = rate_limiter.check_custom_limit(
        key=key,
        max_requests=settings.share_rate_limit_requests,
        window_seconds=settings.share_rate_limit_window_seconds,
    )
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limited",
                "message": "Too many share requests. Please wait before creating new share links.",
                "retry_after_seconds": retry_after,
            },
            headers={"Retry-After": str(retry_after)},
        )


def _enforce_share_read_rate_limit(client_ip: str) -> None:
    """Enforce abuse protection on public snapshot lookups (120/min per IP)."""
    key = f"share_read_{client_ip}"
    allowed, retry_after = rate_limiter.check_custom_limit(
        key=key,
        max_requests=120,
        window_seconds=60,
    )
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limited",
                "message": "Too many requests. Please wait before accessing shared trips.",
                "retry_after_seconds": retry_after,
            },
            headers={"Retry-After": str(retry_after)},
        )


@router.post(
    "/api/v1/trips/share",
    response_model=CreateShareTripResponse,
    summary="Create an immutable read-only shared trip snapshot",
)
def create_shared_trip(
    payload: CreateShareTripRequest,
    current_user: User = Depends(get_required_user),
    db: Session = Depends(get_db),
) -> CreateShareTripResponse:
    """
    Authenticated endpoint to generate an immutable public snapshot of an itinerary.
    Derives ownership strictly from server-side session.
    """
    _enforce_share_create_rate_limit(current_user.id)

    # Validate payload size limits
    raw_payload_bytes = json.dumps(payload.model_dump()).encode("utf-8")
    if len(raw_payload_bytes) > settings.share_max_payload_bytes:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "payload_too_large",
                "message": f"Snapshot payload exceeds maximum allowed size of {settings.share_max_payload_bytes} bytes.",
            },
        )

    # Generate unguessable 22-char URL-safe share token
    share_id = secrets.token_urlsafe(16)

    # Ensure title is trimmed
    clean_title = payload.title.strip() or "Odisha Trip Itinerary"

    # Package snapshot payload
    snapshot_data = {
        "title": clean_title,
        "itinerary": payload.itinerary,
        "constraints": payload.constraints,
    }

    now_utc = datetime.now(timezone.utc)
    snapshot = SharedTripSnapshot(
        share_id=share_id,
        user_id=current_user.id,
        title=clean_title,
        snapshot_data=snapshot_data,
        created_at=now_utc,
        expires_at=None,
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    created_at_ms = int(snapshot.created_at.timestamp() * 1000)
    share_url = f"/#trip/shared/{share_id}"

    return CreateShareTripResponse(
        share_id=share_id,
        share_url=share_url,
        created_at=created_at_ms,
    )


@router.get(
    "/api/v1/trips/shared/{share_id}",
    response_model=PublicSharedTripResponse,
    summary="Retrieve a public read-only trip snapshot by share ID",
)
def get_shared_trip(
    share_id: str,
    request: Request,
    db: Session = Depends(get_db),
) -> PublicSharedTripResponse:
    """
    Public read-only endpoint. Does NOT require authentication.
    Returns immutable trip snapshot without owner ID, email, or session tokens.
    """
    client_ip = _get_client_ip(request)
    _enforce_share_read_rate_limit(client_ip)

    clean_share_id = share_id.strip()
    if not clean_share_id or len(clean_share_id) > 64:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "not_found",
                "message": "Shared trip not found or link has expired.",
            },
        )

    snapshot = (
        db.query(SharedTripSnapshot)
        .filter(SharedTripSnapshot.share_id == clean_share_id)
        .first()
    )

    if not snapshot:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "not_found",
                "message": "Shared trip not found or link has expired.",
            },
        )

    # Check expiration if present
    now_utc = datetime.now(timezone.utc)
    if snapshot.expires_at:
        exp = snapshot.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < now_utc:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "expired",
                    "message": "This shared trip link has expired.",
                },
            )

    created_dt = snapshot.created_at
    if created_dt and created_dt.tzinfo is None:
        created_dt = created_dt.replace(tzinfo=timezone.utc)
    created_at_ms = (
        int(created_dt.timestamp() * 1000) if created_dt else int(now_utc.timestamp() * 1000)
    )

    expires_at_ms = None
    if snapshot.expires_at:
        exp_dt = snapshot.expires_at
        if exp_dt.tzinfo is None:
            exp_dt = exp_dt.replace(tzinfo=timezone.utc)
        expires_at_ms = int(exp_dt.timestamp() * 1000)

    snapshot_content = snapshot.snapshot_data or {}
    itinerary = snapshot_content.get("itinerary", {})
    constraints = snapshot_content.get("constraints")

    return PublicSharedTripResponse(
        share_id=snapshot.share_id,
        title=snapshot.title,
        itinerary=itinerary,
        constraints=constraints,
        created_at=created_at_ms,
        expires_at=expires_at_ms,
    )
