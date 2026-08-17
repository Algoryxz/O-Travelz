"""Place model. See docs/architecture/02-database.md. Owner: Smarak."""
import uuid

from geoalchemy2 import Geography
from sqlalchemy import Column, ForeignKey, Integer, String, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Place(Base):
    __tablename__ = "places"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    location = Column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    description = Column(String, nullable=True)
    # Structured opening hours; null when genuinely unknown -- never guessed.
    opening_hours = Column(JSON, nullable=True)
    avg_visit_minutes = Column(Integer, nullable=True)
    price_tier = Column(String, nullable=True)  # e.g. free / low / medium / high
    source = Column(String, nullable=False)  # URL or "on-the-ground, verified <date>"
    verified_at = Column(DateTime, nullable=True)
