"""
Canonical Media Registry and Entity Association Models.

Fulfills Wave A1 Media Registry architecture:
- media_assets: Canonical media registry (single source of truth for all media)
- entity_media: Normalized entity-to-media association table
- place_images: Deprecated compatibility view/table maintained for legacy endpoints
"""
import uuid
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    media_type = Column(String(16), nullable=False, default="image")  # image | video | audio
    content_sha256 = Column(String(64), nullable=False, unique=True, index=True)
    mime_type = Column(String(64), nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    storage_backend = Column(String(32), nullable=False, default="local")
    storage_key = Column(String(255), nullable=False, unique=True, index=True)
    variants = Column(JSON, nullable=True)  # {"hero": "...", "card": "...", "thumbnail": "..."}
    perceptual_hash = Column(String(64), nullable=True)
    license = Column(String(64), nullable=True)
    creator = Column(String(128), nullable=True)
    attribution = Column(String(255), nullable=True)
    source_url = Column(String(512), nullable=True)
    verification_status = Column(
        String(32),
        nullable=False,
        default="UNVERIFIED",
    )  # EXACT_LOCATION_VERIFIED | RELATED_LOCATION | TECHNICAL_VECTOR | UNVERIFIED | REJECTED
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    associations = relationship(
        "EntityMedia",
        back_populates="asset",
        cascade="all, delete-orphan",
    )


class EntityMedia(Base):
    __tablename__ = "entity_media"

    __table_args__ = (
        UniqueConstraint(
            "entity_type",
            "entity_id",
            "media_asset_id",
            "association_type",
            name="uq_entity_media_assoc",
        ),
        Index("ix_entity_media_entity", "entity_type", "entity_id"),
        Index("ix_entity_media_asset", "media_asset_id"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String(32), nullable=False)  # place | stop | artisan_cluster | etc.
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    media_asset_id = Column(
        UUID(as_uuid=True),
        ForeignKey("media_assets.id", ondelete="CASCADE"),
        nullable=False,
    )
    association_type = Column(
        String(32),
        nullable=False,
        default="primary",
    )  # primary | gallery | hero | thumbnail | floorplan
    sort_order = Column(Integer, nullable=False, default=0)
    alt_text = Column(String(255), nullable=True)
    caption = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    asset = relationship("MediaAsset", back_populates="associations")