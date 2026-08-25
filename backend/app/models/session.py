"""
User Session and Cloud Synchronization ORM Models.

Defines:
- UserSession: Secure, server-side authenticated sessions.
- UserSavedPlace: Cloud-synchronized user saved places with tombstone support.
- UserSavedTrip: Cloud-synchronized user trip conversations/plans with tombstone support.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    JSON,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class UserSession(Base):
    """Authenticated application session, stored by token hash."""

    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    session_token_hash = Column(String(64), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    revoked_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="sessions")


class UserSavedPlace(Base):
    """Cloud-synchronized user saved destination/place."""

    __tablename__ = "user_saved_places"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    place_id = Column(String, nullable=False)
    place_name = Column(String, nullable=False)
    place_data = Column(JSON, nullable=False)
    saved_at = Column(BigInteger, nullable=False)
    updated_at = Column(BigInteger, nullable=False)
    is_deleted = Column(Boolean, nullable=False, default=False)

    user = relationship("User", back_populates="saved_places")


class UserSavedTrip(Base):
    """Cloud-synchronized user trip conversation and itinerary plan."""

    __tablename__ = "user_saved_trips"

    id = Column(String, primary_key=True)  # Client-side trip ID (e.g. trip_12345_abc)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String, nullable=False)
    history = Column(JSON, nullable=False)
    constraints = Column(JSON, nullable=True)
    itinerary = Column(JSON, nullable=True)
    timestamp = Column(BigInteger, nullable=False)
    updated_at = Column(BigInteger, nullable=False)
    is_deleted = Column(Boolean, nullable=False, default=False)

    user = relationship("User", back_populates="saved_trips")


class SharedTripSnapshot(Base):
    """Immutable public read-only shared trip snapshot."""

    __tablename__ = "shared_trip_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    share_id = Column(String(32), unique=True, index=True, nullable=False)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=False)
    snapshot_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="shared_snapshots")

