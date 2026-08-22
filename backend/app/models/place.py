"""Place model. See docs/architecture/02-database.md. Owner: Smarak."""
import uuid

from geoalchemy2 import Geography
from sqlalchemy import Column, ForeignKey, Integer, Float, String, JSON, DateTime, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base



class Place(Base):
    __tablename__ = "places"

    __table_args__ = (
        UniqueConstraint("research_id", name="uq_places_research_id"),
        UniqueConstraint(
            "name", "category_id", "source", name="uq_places_canonical_identity"
        ),
        Index("ix_places_district", "district"),
        Index("ix_places_name", "name"),
        Index("ix_places_category_id", "category_id"),
        Index("ix_places_verification_status", "verification_status"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Research IDs are traceability identifiers from the handoff, not database PKs.
    research_id = Column(String, nullable=True)
    name = Column(String, nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    location = Column(Geography(geometry_type="POINT", srid=4326), nullable=True)
    description = Column(String, nullable=True)
    # Structured opening hours; null when genuinely unknown -- never guessed.
    opening_hours = Column(JSON, nullable=True)
    opening_hours_source = Column(String, nullable=True)
    avg_visit_minutes = Column(Integer, nullable=True)
    price_tier = Column(String, nullable=True)  # e.g. free / low / medium / high
    rating = Column(Float, nullable=True)
    rating_count = Column(Integer, nullable=True)
    rating_source = Column(String, nullable=True)
    source = Column(String, nullable=False)  # URL or "on-the-ground, verified <date>"
    source_url = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verification_status = Column(String, nullable=True)  # VERIFIED / UNVERIFIED / UNAVAILABLE
    source_provenance_note = Column(String, nullable=True)
    coordinate_verification = Column(String, nullable=True)
    coordinate_audit_status = Column(String, nullable=True)
    audit_status = Column(String, nullable=True)
    district = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    emergency_phone = Column(String, nullable=True)
    address = Column(String, nullable=True)

    # Category relationship
    category = relationship("Category")

    # 1:N relationship to PlaceImage
    images = relationship(
        "PlaceImage",
        back_populates="place",
        cascade="all, delete-orphan",
        order_by="PlaceImage.sort_order",
    )

    # M:N relationship to Interest via PlaceInterest
    interest_associations = relationship(
        "PlaceInterest",
        back_populates="place",
        cascade="all, delete-orphan",
    )
