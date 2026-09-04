"""
Normalized Cross-Entity Relationship Graph Model.

Replaces unstructured JSONB relationship blobs with first-class, normalized,
typed, bi-directional queryable edges between domain entities (Place, Stop,
ArtisanCluster, CraftTradition, RailwayStation, etc.).
"""
import uuid
from sqlalchemy import (
    Column,
    DateTime,
    Index,
    JSON,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID

from app.db.base_class import Base


class EntityRelationship(Base):
    __tablename__ = "entity_relationships"

    __table_args__ = (
        UniqueConstraint(
            "source_entity_type",
            "source_entity_id",
            "target_entity_type",
            "target_entity_id",
            "relationship_type",
            name="uq_entity_relationship",
        ),
        Index("ix_entity_rel_source", "source_entity_type", "source_entity_id"),
        Index("ix_entity_rel_target", "target_entity_type", "target_entity_id"),
        Index("ix_entity_rel_type", "relationship_type"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_entity_type = Column(String(32), nullable=False)
    source_entity_id = Column(UUID(as_uuid=True), nullable=False)
    target_entity_type = Column(String(32), nullable=False)
    target_entity_id = Column(UUID(as_uuid=True), nullable=False)
    relationship_type = Column(String(64), nullable=False)
    confidence = Column(String(16), nullable=True)
    provenance = Column(String(255), nullable=True)
    properties = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)