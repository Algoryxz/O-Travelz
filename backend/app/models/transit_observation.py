"""
Transit Ride and Stop Observation Domain Models for Wave C5.4.

Stores passenger ride sessions, GPS telemetry samples, and stop observations
completely separate from canonical transit truth.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class TransitRideSession(Base):
    """Pseudonymous transit ride recording session."""

    __tablename__ = "transit_ride_sessions"
    __table_args__ = (
        Index("ix_ride_sessions_route_seq", "route_number", "sequence_id"),
        Index("ix_ride_sessions_status", "status"),
        Index("ix_ride_sessions_started_at", "started_at"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_number = Column(String(32), nullable=False, index=True)
    sequence_id = Column(String(64), nullable=True, index=True)
    direction = Column(String(32), nullable=True)
    session_hash = Column(String(64), nullable=False, index=True)
    consent_version = Column(String(32), nullable=False, default="1.0")
    status = Column(String(32), nullable=False, default="ACTIVE")  # ACTIVE, COMPLETED, QUARANTINED, DISCARDED
    started_at = Column(DateTime(timezone=True), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    sample_count = Column(Integer, nullable=False, default=0)
    quarantine_reason = Column(Text, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    is_test_fixture = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    samples = relationship("TransitRideSample", back_populates="session", cascade="all, delete-orphan")
    observations = relationship("TransitStopObservation", back_populates="session")


class TransitRideSample(Base):
    """High-frequency GPS sample captured during a ride verification session."""

    __tablename__ = "transit_ride_samples"
    __table_args__ = (
        Index("ix_ride_samples_session_time", "session_id", "timestamp"),
        Index("ix_ride_samples_geo", "latitude", "longitude"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("transit_ride_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy_m = Column(Float, nullable=False)
    speed_mps = Column(Float, nullable=True)
    heading_deg = Column(Float, nullable=True)
    is_filtered = Column(Boolean, nullable=False, default=False)
    filter_reason = Column(String(64), nullable=True)

    session = relationship("TransitRideSession", back_populates="samples")


class TransitStopObservation(Base):
    """Ground-truth transit stop observation (boarding, alighting, stopped, local confirmation)."""

    __tablename__ = "transit_stop_observations"
    __table_args__ = (
        Index("ix_stop_obs_canonical_stop", "canonical_stop_id"),
        Index("ix_stop_obs_route_seq", "route_number", "sequence_id"),
        Index("ix_stop_obs_consensus", "consensus_status"),
        Index("ix_stop_obs_contributor", "contributor_hash"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("transit_ride_sessions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    canonical_stop_id = Column(String(64), nullable=True, index=True)
    route_number = Column(String(32), nullable=False, index=True)
    sequence_id = Column(String(64), nullable=True, index=True)
    direction = Column(String(32), nullable=True)
    observation_type = Column(String(32), nullable=False)  # BOARDING, ALIGHTING, BUS_STOPPED, LOCAL_CONFIRMATION
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    accuracy_m = Column(Float, nullable=True)
    observed_at = Column(DateTime(timezone=True), nullable=False)
    contributor_hash = Column(String(64), nullable=False, index=True)
    evidence_pointer = Column(Text, nullable=True)
    confirmation_value = Column(String(16), nullable=True)  # YES, NO, UNSURE
    consensus_status = Column(String(32), nullable=False, default="OBSERVED_ONCE")  # OBSERVED_ONCE, COMMUNITY_SUPPORTED, PROMOTION_REVIEW_READY
    stop_association_status = Column(String(32), nullable=True)  # CONFIRMS_EXISTING_EXACT, SUPPORTS_CANDIDATE, NEW_LOCATION_HYPOTHESIS, AMBIGUOUS_STOP_ASSOCIATION, CONTRADICTS_CURRENT_CANDIDATE
    is_test_fixture = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    session = relationship("TransitRideSession", back_populates="observations")
