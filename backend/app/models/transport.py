"""
Transport entities: Provider, Stop, Route, RouteStop, ScheduledTrip, FareRule.
See docs/architecture/02-database.md and docs/transportation/00-transport-model.md.
Owner: Smarak (database schema and data semantics), with backend/provider requirements
from Rudra.
"""
import enum
import uuid

from geoalchemy2 import Geography
from sqlalchemy import Column, ForeignKey, Integer, String, Float, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


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


class Stop(Base):
    __tablename__ = "stops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("transport_providers.id"), nullable=False)
    name = Column(String, nullable=False)
    location = Column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    external_ref = Column(String, nullable=True)


class Route(Base):
    __tablename__ = "routes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("transport_providers.id"), nullable=False)
    name = Column(String, nullable=False)  # e.g. route number/name
    geometry = Column(Geography(geometry_type="LINESTRING", srid=4326), nullable=True)


class RouteStop(Base):
    __tablename__ = "route_stops"

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


class FareRule(Base):
    __tablename__ = "fare_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("transport_providers.id"), nullable=False)
    rule_type = Column(String, nullable=False)  # flat / distance_banded / route_specific
    amount = Column(Float, nullable=True)
    source = Column(String, nullable=False)
    verified_at = Column(DateTime, nullable=True)
