"""
Itinerary entities: Itinerary, ItineraryDay, ItineraryStop, TransportHop.
See docs/architecture/02-database.md and docs/architecture/05-contracts.md.
Owner: Smarak (database semantics and itinerary logic), with transport-hop requirements
provided by Rudra.
"""
import uuid

from sqlalchemy import Column, ForeignKey, Integer, String, Float, Date, DateTime, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base
from app.models.transport import DataTier, _data_tier_values


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    constraints = Column(JSON, nullable=False)  # dates, interests, pace, budget, start
    created_at = Column(DateTime, nullable=False)


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    itinerary_id = Column(UUID(as_uuid=True), ForeignKey("itineraries.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    date = Column(Date, nullable=True)


class ItineraryStop(Base):
    __tablename__ = "itinerary_stops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    itinerary_day_id = Column(UUID(as_uuid=True), ForeignKey("itinerary_days.id"), nullable=False)
    place_id = Column(UUID(as_uuid=True), ForeignKey("places.id"), nullable=False)
    sequence_order = Column(Integer, nullable=False)
    planned_arrival = Column(String, nullable=True)  # "HH:MM"
    planned_departure = Column(String, nullable=True)


class TransportHop(Base):
    __tablename__ = "transport_hops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_itinerary_stop_id = Column(UUID(as_uuid=True), ForeignKey("itinerary_stops.id"), nullable=False)
    to_itinerary_stop_id = Column(UUID(as_uuid=True), ForeignKey("itinerary_stops.id"), nullable=False)
    mode = Column(String, nullable=False)  # e.g. "walk+bus", "auto", "unavailable"
    provider_id = Column(UUID(as_uuid=True), ForeignKey("transport_providers.id"), nullable=True)
    route_id = Column(UUID(as_uuid=True), ForeignKey("routes.id"), nullable=True)
    estimated_minutes = Column(Integer, nullable=True)
    estimated_cost = Column(Float, nullable=True)
    # Structured leg-by-leg instructions matching docs/architecture/05-contracts.md
    legs = Column(JSON, nullable=False, default=list)
    data_tier = Column(
        Enum(DataTier, values_callable=_data_tier_values, name="datatier"),
        nullable=False,
    )
