"""
Transport entities and provenance-preserving static/scheduled source layers.
See docs/architecture/02-database.md and docs/transportation/00-transport-model.md.
Owner: Smarak (database schema and data semantics), with backend/provider requirements
from Rudra.
"""
import enum
import uuid

from geoalchemy2 import Geography
from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum,
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

from app.db.base_class import Base


class DataTier(str, enum.Enum):
    STATIC = "static"
    SCHEDULED = "scheduled"
    LIVE = "live"


def _data_tier_values(enum_type):
    return [member.value for member in enum_type]


class TransportProvider(Base):
    __tablename__ = "transport_providers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)  # e.g. "Mo Bus"
    mode = Column(String, nullable=False)  # bus / rail / paratransit / walk / cab
    data_tier = Column(
        Enum(DataTier, values_callable=_data_tier_values, name="datatier"),
        nullable=False,
        default=DataTier.STATIC,
    )
    notes_on_verification = Column(String, nullable=True)


class TransportProviderSource(Base):
    """A provenance-bearing source layer for a provider and canonical data tier."""

    __tablename__ = "transport_provider_sources"
    __table_args__ = (
        UniqueConstraint("provider_id", "data_tier", "source", name="uq_provider_source_tier"),
        Index("ix_provider_source_provider_tier", "provider_id", "data_tier"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("transport_providers.id"), nullable=False)
    data_tier = Column(
        Enum(DataTier, values_callable=_data_tier_values, name="datatier", create_type=False),
        nullable=False,
    )
    source = Column(String, nullable=False)
    effective_from = Column(Date, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)


class Stop(Base):
    __tablename__ = "stops"
    __table_args__ = (
        UniqueConstraint("provider_id", "research_id", name="uq_stop_provider_research_id"),
        UniqueConstraint("provider_id", "canonical_stop_id", name="uq_stop_provider_canonical_id"),
        Index("ix_stop_provider_reconciliation", "provider_id", "reconciliation_status"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("transport_providers.id"), nullable=False)
    name = Column(String, nullable=False)
    published_name = Column(String, nullable=True)
    matched_name = Column(String, nullable=True)
    location = Column(Geography(geometry_type="POINT", srid=4326), nullable=True)
    external_ref = Column(String, nullable=True)
    research_id = Column(String, nullable=True)
    canonical_stop_id = Column(String, nullable=True)
    coordinate_status = Column(String, nullable=True)
    reconciliation_status = Column(String, nullable=True)
    source = Column(String, nullable=True)
    effective_date = Column(Date, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    localized_names = Column(JSON, nullable=True)


class Route(Base):
    __tablename__ = "routes"
    __table_args__ = (
        UniqueConstraint("provider_id", "route_code", name="uq_route_provider_code"),
        Index("ix_route_provider_effective", "provider_id", "effective_date"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("transport_providers.id"), nullable=False)
    name = Column(String, nullable=False)  # e.g. route number/name
    route_code = Column(String, nullable=True)
    route_name = Column(String, nullable=True)
    source = Column(String, nullable=True)
    source_page = Column(String, nullable=True)
    effective_date = Column(Date, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    geometry = Column(Geography(geometry_type="LINESTRING", srid=4326), nullable=True)


class RouteStop(Base):
    __tablename__ = "route_stops"
    __table_args__ = (
        Index("ix_route_stops_route_id", "route_id"),
        Index("ix_route_stops_stop_id", "stop_id"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_id = Column(UUID(as_uuid=True), ForeignKey("routes.id"), nullable=False)
    stop_id = Column(UUID(as_uuid=True), ForeignKey("stops.id"), nullable=False)
    sequence_order = Column(Integer, nullable=False)



class ScheduledTrip(Base):
    __tablename__ = "scheduled_trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_id = Column(UUID(as_uuid=True), ForeignKey("routes.id"), nullable=False)
    # Populate only what's actually verified -- either a headway range, or explicit times.
    headway_minutes_min = Column(Integer, nullable=True)
    headway_minutes_max = Column(Integer, nullable=True)
    explicit_departure_times = Column(String, nullable=True)  # CSV of HH:MM if known


class ScheduledTripGroup(Base):
    """A source schedule group whose three time orderings remain independently auditable."""

    __tablename__ = "scheduled_trip_groups"
    __table_args__ = (
        UniqueConstraint("route_id", "group_label", "source", name="uq_schedule_group_route_label_source"),
        Index("ix_schedule_group_route_effective", "route_id", "effective_date"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_id = Column(UUID(as_uuid=True), ForeignKey("routes.id"), nullable=False)
    group_label = Column(String, nullable=False)
    source = Column(String, nullable=False)
    source_page = Column(String, nullable=True)
    effective_date = Column(Date, nullable=True)
    data_tier = Column(
        Enum(DataTier, values_callable=_data_tier_values, name="datatier", create_type=False),
        nullable=False,
    )
    verified_at = Column(DateTime, nullable=True)
    departure_times_source_order_raw = Column(JSON, nullable=False)
    departure_times_source_order = Column(JSON, nullable=False)
    departure_times_chronological = Column(JSON, nullable=False)
    notes = Column(Text, nullable=True)


class FareRule(Base):
    __tablename__ = "fare_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("transport_providers.id"), nullable=False)
    rule_type = Column(String, nullable=False)  # flat / distance_banded / route_specific
    amount = Column(Float, nullable=True)
    source = Column(String, nullable=False)
    verified_at = Column(DateTime, nullable=True)
    status = Column(String, nullable=True)
    currency = Column(String, nullable=True)
    verification_note = Column(Text, nullable=True)
