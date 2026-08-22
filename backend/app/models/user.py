"""User model for Google OAuth identity, application sessions, and cloud sync."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider = Column(String, nullable=False, default="google")
    provider_subject = Column(String, nullable=True, index=True)
    name = Column(String, nullable=True)
    display_name = Column(String, nullable=True)
    email = Column(String, nullable=True, unique=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_login_at = Column(DateTime, nullable=True)

    __table_args__ = (
        UniqueConstraint("provider", "provider_subject", name="uq_user_provider_subject"),
    )

    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    saved_places = relationship("UserSavedPlace", back_populates="user", cascade="all, delete-orphan")
    saved_trips = relationship("UserSavedTrip", back_populates="user", cascade="all, delete-orphan")
    shared_snapshots = relationship("SharedTripSnapshot", back_populates="user", cascade="all, delete-orphan")
