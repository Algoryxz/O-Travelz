"""
Transit Intelligence Domain Models for Phase 6A.

Provides normalized, provenance-bearing relational structures for Phase 6A
route intelligence, corridor descriptions, stop intelligence, and evidence citations
without mutating existing authoritative production transport entities (routes, stops, route_stops).
"""
import uuid
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
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class EvidenceCitation(Base):
    """Normalized citation record for transit research claims."""
    __tablename__ = "evidence_citations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidence_id = Column(String, nullable=False, unique=True, index=True)
    source = Column(String, nullable=False)
    source_type = Column(String, nullable=False)  # OFFICIAL_DOCUMENT, OFFICIAL_MAP, OSM, RESEARCH, INFERENCE
    document = Column(String, nullable=True)
    page = Column(String, nullable=True)
    url = Column(String, nullable=True)
    claim = Column(Text, nullable=True)
    reliability = Column(String, nullable=False)  # HIGH, MEDIUM, LOW
    accessed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)


class RouteIntelligence(Base):
    """Normalized research and corridor intelligence for an official transit route."""
    __tablename__ = "route_intelligence"
    __table_args__ = (
        UniqueConstraint("route_number", "region", name="uq_route_intel_num_region"),
        Index("ix_route_intel_route_number", "route_number"),
        Index("ix_route_intel_region", "region"),
        Index("ix_route_intel_geometry_status", "geometry_status"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_id = Column(UUID(as_uuid=True), ForeignKey("routes.id", ondelete="SET NULL"), nullable=True)
    route_number = Column(String, nullable=False)
    route_code = Column(String, nullable=True)
    region = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    via = Column(String, nullable=True)
    direction = Column(String, nullable=False, default="bidirectional")
    overall_confidence = Column(String, nullable=False)  # CONFIRMED, SUPPORTED, INFERRED, UNKNOWN
    geometry_status = Column(String, nullable=False)  # EXACT, CORRIDOR, PARTIAL, NONE
    has_detailed_stops = Column(Boolean, nullable=False, default=False)
    stop_count_database = Column(Integer, nullable=False, default=0)
    stop_count_research = Column(Integer, nullable=False, default=0)
    route_level_evidence = Column(JSON, nullable=False, default=list)
    conflicts = Column(JSON, nullable=False, default=list)
    notes = Column(JSON, nullable=True)

    corridors = relationship(
        "RouteCorridorIntelligence",
        back_populates="route_intelligence",
        cascade="all, delete-orphan",
        order_by="RouteCorridorIntelligence.sequence",
    )


class RouteCorridorIntelligence(Base):
    """Geographic corridor segment and arterial highway intelligence for a route."""
    __tablename__ = "route_corridor_intelligence"
    __table_args__ = (
        Index("ix_corridor_intel_route_seq", "route_intelligence_id", "sequence"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_intelligence_id = Column(
        UUID(as_uuid=True),
        ForeignKey("route_intelligence.id", ondelete="CASCADE"),
        nullable=False,
    )
    sequence = Column(Integer, nullable=False, default=1)
    from_label = Column(String, nullable=True)
    to_label = Column(String, nullable=True)
    road_names = Column(JSON, nullable=False, default=list)
    major_junctions = Column(JSON, nullable=False, default=list)
    landmarks = Column(JSON, nullable=False, default=list)
    status = Column(String, nullable=False)  # VERIFIED_GEOGRAPHY, STRONGLY_INFERRED, WEAKLY_INFERRED, UNKNOWN
    confidence = Column(String, nullable=False)  # CONFIRMED, SUPPORTED, INFERRED, UNKNOWN
    evidence = Column(JSON, nullable=False, default=list)
    notes = Column(Text, nullable=True)

    route_intelligence = relationship("RouteIntelligence", back_populates="corridors")


class StopIntelligence(Base):
    """Normalized research intelligence and coordinate provenance for a transit stop."""
    __tablename__ = "stop_intelligence"
    __table_args__ = (
        Index("ix_stop_intel_stop_name", "stop_name"),
        Index("ix_stop_intel_route_seq", "route_number", "sequence_order"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stop_id = Column(UUID(as_uuid=True), ForeignKey("stops.id", ondelete="SET NULL"), nullable=True)
    stop_name = Column(String, nullable=False)
    normalized_name = Column(String, nullable=True)
    route_number = Column(String, nullable=True)
    route_context = Column(String, nullable=True)
    sequence_order = Column(Integer, nullable=False, default=1)
    geographic_status = Column(String, nullable=False)  # verified, approximate, identified_no_coordinate, unresolved
    resolved_latitude = Column(Float, nullable=True)
    resolved_longitude = Column(Float, nullable=True)
    coordinate_provenance = Column(String, nullable=True)  # official_source, geocoded, osm_verified, research_approximate
    road = Column(String, nullable=True)
    locality = Column(String, nullable=True)
    landmark = Column(String, nullable=True)
    city = Column(String, nullable=True)
    district = Column(String, nullable=True)
    confidence = Column(String, nullable=False)  # CONFIRMED, SUPPORTED, INFERRED, UNKNOWN
    evidence = Column(JSON, nullable=False, default=list)
    notes = Column(Text, nullable=True)


class StopAlias(Base):
    """Documented semantic aliases and naming variations across transit datasets."""
    __tablename__ = "stop_aliases"
    __table_args__ = (
        UniqueConstraint("primary_name", "alias_name", name="uq_stop_alias_pair"),
        Index("ix_stop_alias_primary", "primary_name"),
        Index("ix_stop_alias_alias", "alias_name"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    primary_name = Column(String, nullable=False)
    alias_name = Column(String, nullable=False)
    city = Column(String, nullable=True)
    alias_type = Column(String, nullable=False)  # naming_variant, spelling_variant, canonical_hub
    confidence = Column(String, nullable=False)
    evidence_id = Column(String, nullable=True)
    notes = Column(Text, nullable=True)


class UnresolvedStopRegistry(Base):
    """Persistent catalog of transit stops requiring future geospatial resolution."""
    __tablename__ = "unresolved_stops_registry"
    __table_args__ = (
        Index("ix_unresolved_stop_name", "stop_name"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    canonical_stop_id = Column(String, nullable=True)
    stop_name = Column(String, nullable=False, unique=True)
    city = Column(String, nullable=True)
    district = Column(String, nullable=True)
    geographic_status = Column(String, nullable=False, default="unresolved")
    reason_unresolved = Column(Text, nullable=True)
    query_attempted = Column(Text, nullable=True)
    potential_corridor = Column(Text, nullable=True)
    serving_routes = Column(JSON, nullable=False, default=list)
