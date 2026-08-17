"""Create the canonical Phase 0 database schema.

Revision ID: 0001_initial_schema
Revises:
"""
from typing import Sequence, Union

from alembic import op
import geoalchemy2
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    data_tier = postgresql.ENUM("static", "scheduled", "live", name="datatier")
    data_tier.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_table(
        "categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_table(
        "transport_providers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("mode", sa.String(), nullable=False),
        sa.Column("data_tier", data_tier, nullable=False),
        sa.Column("notes_on_verification", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_table(
        "places",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("location", geoalchemy2.types.Geography(geometry_type="POINT", srid=4326), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("opening_hours", sa.JSON(), nullable=True),
        sa.Column("avg_visit_minutes", sa.Integer(), nullable=True),
        sa.Column("price_tier", sa.String(), nullable=True),
        sa.Column("source", sa.String(), nullable=False),
        sa.Column("verified_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "stops",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("provider_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("location", geoalchemy2.types.Geography(geometry_type="POINT", srid=4326), nullable=False),
        sa.Column("external_ref", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["provider_id"], ["transport_providers.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "routes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("provider_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("geometry", geoalchemy2.types.Geography(geometry_type="LINESTRING", srid=4326), nullable=True),
        sa.ForeignKeyConstraint(["provider_id"], ["transport_providers.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "route_stops",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("route_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("stop_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sequence_order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["route_id"], ["routes.id"]),
        sa.ForeignKeyConstraint(["stop_id"], ["stops.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "scheduled_trips",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("route_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("headway_minutes_min", sa.Integer(), nullable=True),
        sa.Column("headway_minutes_max", sa.Integer(), nullable=True),
        sa.Column("explicit_departure_times", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["route_id"], ["routes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "fare_rules",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("provider_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("rule_type", sa.String(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=True),
        sa.Column("source", sa.String(), nullable=False),
        sa.Column("verified_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["provider_id"], ["transport_providers.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "itineraries",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("constraints", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "itinerary_days",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("itinerary_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("day_number", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(["itinerary_id"], ["itineraries.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "itinerary_stops",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("itinerary_day_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("place_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sequence_order", sa.Integer(), nullable=False),
        sa.Column("planned_arrival", sa.String(), nullable=True),
        sa.Column("planned_departure", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["itinerary_day_id"], ["itinerary_days.id"]),
        sa.ForeignKeyConstraint(["place_id"], ["places.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "transport_hops",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("from_itinerary_stop_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("to_itinerary_stop_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("mode", sa.String(), nullable=False),
        sa.Column("provider_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("route_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("estimated_minutes", sa.Integer(), nullable=True),
        sa.Column("estimated_cost", sa.Float(), nullable=True),
        sa.Column("legs", sa.JSON(), nullable=False),
        sa.Column("data_tier", data_tier, nullable=False),
        sa.ForeignKeyConstraint(["from_itinerary_stop_id"], ["itinerary_stops.id"]),
        sa.ForeignKeyConstraint(["to_itinerary_stop_id"], ["itinerary_stops.id"]),
        sa.ForeignKeyConstraint(["provider_id"], ["transport_providers.id"]),
        sa.ForeignKeyConstraint(["route_id"], ["routes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("transport_hops")
    op.drop_table("itinerary_stops")
    op.drop_table("itinerary_days")
    op.drop_table("itineraries")
    op.drop_table("fare_rules")
    op.drop_table("scheduled_trips")
    op.drop_table("route_stops")
    op.drop_table("routes")
    op.drop_table("stops")
    op.drop_table("places")
    op.drop_table("transport_providers")
    op.drop_table("categories")
    op.drop_table("users")
    postgresql.ENUM("static", "scheduled", "live", name="datatier").drop(
        op.get_bind(), checkfirst=True
    )
