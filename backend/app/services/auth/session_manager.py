"""Session and User Lifecycle Management Service.

Handles:
1. High-entropy session token generation.
2. SHA-256 hashed session persistence (never persists raw tokens).
3. Session verification, expiry, and revocation checks.
4. Google profile to local User entity resolution and safe upsert.
"""
from __future__ import annotations

import datetime
from datetime import timezone
import hashlib
import logging
import secrets
import uuid
from typing import Optional, Tuple
from sqlalchemy.orm import Session, joinedload

logger = logging.getLogger(__name__)

from app.models.session import UserSession
from app.models.user import User
from app.services.auth.google_oauth import GoogleProfile


def utc_now() -> datetime.datetime:
    """Return timezone-aware UTC datetime."""
    return datetime.datetime.now(timezone.utc)


def hash_session_token(raw_token: str) -> str:
    """Compute SHA-256 hex digest of raw session token."""
    return hashlib.sha256(raw_token.strip().strip('"').encode("utf-8")).hexdigest()


def create_session(
    db: Session,
    user: User,
    expire_days: int = 30,
) -> Tuple[str, UserSession]:
    """
    Generate high-entropy session token, persist its SHA-256 hash, and return (raw_token, session_record).
    """
    now = utc_now()
    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_session_token(raw_token)
    expires_at = now + datetime.timedelta(days=expire_days)

    session_record = UserSession(
        id=uuid.uuid4(),
        user_id=user.id,
        session_token_hash=token_hash,
        expires_at=expires_at,
        created_at=now,
        revoked_at=None,
    )
    db.add(session_record)
    db.commit()
    db.refresh(session_record)

    return raw_token, session_record


def verify_session(
    db: Session,
    session_token: Optional[str],
) -> Optional[User]:
    """
    Verify raw session token against database hash and return active User or None.
    Rejects missing, expired, or revoked sessions.
    """
    if not session_token:
        logger.warning("[SESSION_VERIFY] No token provided — unauthenticated")
        return None

    clean_token = session_token.strip().strip('"')
    if len(clean_token) < 16:
        logger.warning("[SESSION_VERIFY] Token too short (len=%d) — rejecting", len(clean_token))
        return None

    token_hash = hash_session_token(clean_token)
    now = utc_now()

    logger.warning(
        "[SESSION_VERIFY] Looking up session: token_len=%d hash_prefix=%s",
        len(clean_token),
        token_hash[:8],
    )

    session_record = (
        db.query(UserSession)
        .options(joinedload(UserSession.user))
        .filter(
            UserSession.session_token_hash == token_hash,
            UserSession.revoked_at.is_(None),
        )
        .first()
    )

    if not session_record:
        logger.warning("[SESSION_VERIFY] No matching session record found for hash_prefix=%s", token_hash[:8])
        return None

    if not session_record.user:
        logger.error(
            "[SESSION_VERIFY] Session found (id=%s) but user relationship is None — user_id=%s",
            session_record.id,
            session_record.user_id,
        )
        return None

    # Timezone-safe timestamp comparison across PostgreSQL naive timestamps and SQLite
    record_expires = session_record.expires_at
    if record_expires is not None:
        if record_expires.tzinfo is None:
            record_expires = record_expires.replace(tzinfo=timezone.utc)
        if record_expires <= now:
            logger.warning(
                "[SESSION_VERIFY] Session expired: session_id=%s expired_at=%s now=%s",
                session_record.id,
                record_expires,
                now,
            )
            return None

    logger.warning(
        "[SESSION_VERIFY] Session OK: session_id=%s user_id=%s email=%s",
        session_record.id,
        session_record.user_id,
        session_record.user.email,
    )
    return session_record.user


def revoke_session(
    db: Session,
    session_token: Optional[str],
) -> bool:
    """
    Mark session as revoked by token hash. Idempotent.
    """
    if not session_token:
        return False

    token_hash = hash_session_token(session_token)
    session_record = (
        db.query(UserSession)
        .filter(UserSession.session_token_hash == token_hash)
        .first()
    )

    if session_record and session_record.revoked_at is None:
        session_record.revoked_at = utc_now()
        db.commit()
        return True

    return False


def resolve_or_create_user(
    db: Session,
    profile: GoogleProfile,
) -> User:
    """
    Resolve existing user by immutable (provider='google', provider_subject=profile.sub)
    or create new user.
    """
    now = utc_now()

    # 1. Lookup by immutable Google subject anchor
    user = (
        db.query(User)
        .filter(
            User.provider == "google",
            User.provider_subject == profile.sub,
        )
        .first()
    )

    if user:
        # Update mutable profile metadata
        if profile.name:
            user.name = profile.name
        if profile.display_name:
            user.display_name = profile.display_name
        if profile.avatar_url:
            user.avatar_url = profile.avatar_url
        user.email = profile.email
        user.last_login_at = now
        user.updated_at = now
        db.commit()
        db.refresh(user)
        return user

    # 2. Check if email already exists with another provider or unlinked
    existing_by_email = db.query(User).filter(User.email == profile.email).first()
    if existing_by_email:
        # If existing record has no provider_subject (legacy unauthenticated user), link it
        if not existing_by_email.provider_subject:
            existing_by_email.provider = "google"
            existing_by_email.provider_subject = profile.sub
            existing_by_email.name = profile.name or existing_by_email.name
            existing_by_email.display_name = profile.display_name or existing_by_email.display_name
            existing_by_email.avatar_url = profile.avatar_url or existing_by_email.avatar_url
            existing_by_email.last_login_at = now
            existing_by_email.updated_at = now
            db.commit()
            db.refresh(existing_by_email)
            return existing_by_email
        else:
            # Different subject with same email - reject collision safely
            raise RuntimeError(
                f"Account collision: email {profile.email} is already associated with another identity."
            )

    # 3. Create new user
    new_user = User(
        id=uuid.uuid4(),
        provider="google",
        provider_subject=profile.sub,
        email=profile.email,
        name=profile.name,
        display_name=profile.display_name,
        avatar_url=profile.avatar_url,
        created_at=now,
        updated_at=now,
        last_login_at=now,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
