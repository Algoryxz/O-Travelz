"""Place model. See docs/architecture/02-database.md. Owner: Smarak."""
import uuid

from geoalchemy2 import Geography
from sqlalchemy import Column, ForeignKey, Integer, String, JSON, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Place(Base):
    __tablename__ = "places"

    __table_args__ = (
        UniqueConstraint("research_id", name="uq_places_research_id"),
        UniqueConstraint(
            "name", "category_id", "source", name="uq_places_canonical_identity"
        ),
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
    avg_visit_minutes = Column(Integer, nullable=True)
    price_tier = Column(String, nullable=True)  # e.g. free / low / medium / high
    source = Column(String, nullable=False)  # URL or "on-the-ground, verified <date>"
    verified_at = Column(DateTime, nullable=True)
    source_provenance_note = Column(String, nullable=True)
    coordinate_verification = Column(String, nullable=True)
    coordinate_audit_status = Column(String, nullable=True)
    audit_status = Column(String, nullable=True)

    # Category relationship
    category = relationship("Category")

    # 1:N relationship to PlaceImage
    images = relationship(
        "PlaceImage",
        back_populates="place",
        cascade="all, delete-orphan",
        order_by="PlaceImage.sort_order",
    )
