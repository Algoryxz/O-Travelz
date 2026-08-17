"""Category model. See docs/architecture/02-database.md. Owner: Smarak."""
import uuid

from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # ``name`` stores the canonical research identifier (for example, ``temple``).
    # The v5.1 handoff's display label is retained separately.
    name = Column(String, nullable=False, unique=True)
    display_name = Column(String, nullable=True)
    description = Column(String, nullable=True)
