"""PlaceImage model for canonical destination photography and asset provenance.
Owner: Smarak.
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
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class PlaceImage(Base):
    __tablename__ = "place_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    place_id = Column(UUID(as_uuid=True), ForeignKey("places.id", ondelete="CASCADE"), nullable=False, index=True)

    # Provider-neutral storage key (e.g. "places/place_bbsr_001/01_hero.webp")
    storage_key = Column(String, nullable=True)

    # Public delivery URLs (CDN or direct/local)
    url = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    card_url = Column(String, nullable=True)

    # Accessibility & presentation
    alt_text = Column(String, nullable=True)
    title = Column(String, nullable=True)

    # Source & Provenance
    source_url = Column(String, nullable=True)
    source_name = Column(String, nullable=False)  # e.g. "Wikimedia Commons", "Unsplash", "ASI"
    creator = Column(String, nullable=True)        # Photographer or contributor name
    license = Column(String, nullable=False)       # e.g. "CC BY-SA 4.0", "CC0", "Unsplash Free License"
    attribution = Column(Text, nullable=False)     # Complete required legal attribution statement
    retrieval_timestamp = Column(DateTime, nullable=True)

    # Dimensions & technical metadata
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    aspect_ratio = Column(Float, nullable=True)
    content_sha256 = Column(String(64), nullable=True)
    content_type = Column(String(64), nullable=True, default="image/webp")
    size_bytes = Column(Integer, nullable=True)

    # Lifecycle & status
    status = Column(String, nullable=False, default="verified")  # verified, pending, processing, failed
    sort_order = Column(Integer, nullable=False, default=0)
    is_primary = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    place = relationship("Place", back_populates="images")
