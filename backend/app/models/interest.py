"""Interest and PlaceInterest models for normalized M:N traveler-facing thematic attributes."""
import uuid
from sqlalchemy import Column, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base



class Interest(Base):
    __tablename__ = "interests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Canonical normalized identifier (e.g. "heritage", "food", "spirituality")
    name = Column(String, nullable=False, unique=True, index=True)
    display_name = Column(String, nullable=True)
    description = Column(String, nullable=True)

    place_associations = relationship(
        "PlaceInterest",
        back_populates="interest",
        cascade="all, delete-orphan",
    )


class PlaceInterest(Base):
    __tablename__ = "place_interests"
    __table_args__ = (
        UniqueConstraint("place_id", "interest_id", name="uq_place_interests_place_interest"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    place_id = Column(UUID(as_uuid=True), ForeignKey("places.id", ondelete="CASCADE"), nullable=False, index=True)
    interest_id = Column(UUID(as_uuid=True), ForeignKey("interests.id", ondelete="CASCADE"), nullable=False, index=True)

    place = relationship("Place", back_populates="interest_associations")
    interest = relationship("Interest", back_populates="place_associations")
