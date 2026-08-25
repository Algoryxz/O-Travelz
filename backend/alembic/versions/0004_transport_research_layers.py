"""Preserve transport research identities, source layers, and schedule groups.

Revision ID: 0004_transport_research_layers
Revises: 0003_preserve_v51_place_metadata
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from geoalchemy2 import Geography


revision: str = "0004_transport_research_layers"
down_revision: Union[str, None] = "0003_preserve_v51_place_metadata"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _tier_enum():
    return postgresql.ENUM(
        "static", "scheduled", "live", name="datatier", create_type=False
    )


def upgrade() -> None:
    op.create_table(
        "transport_provider_sources",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("provider_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("data_tier", _tier_enum(), nullable=False),
        sa.Column("source", sa.String(), nullable=False),
        sa.Column("effective_from", sa.Date(), nullable=True),
        sa.Column("verified_at", sa.DateTime(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["provider_id"], ["transport_providers.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "provider_id", "data_tier", "source", name="uq_provider_source_tier"
        ),
    )
    op.create_index(
        "ix_provider_source_provider_tier",
        "transport_provider_sources",
        ["provider_id", "data_tier"],
    )

    op.alter_column(
        "stops", "location", existing_type=Geography(geometry_type="POINT", srid=4326), nullable=True
    )
    for name, column in (
        ("published_name", sa.String()),
        ("matched_name", sa.String()),
        ("research_id", sa.String()),
        ("canonical_stop_id", sa.String()),
        ("coordinate_status", sa.String()),
        ("reconciliation_status", sa.String()),
        ("source", sa.String()),
        ("effective_date", sa.Date()),
        ("verified_at", sa.DateTime()),
        ("notes", sa.Text()),
    ):
        op.add_column("stops", sa.Column(name, column, nullable=True))
    op.create_unique_constraint(
        "uq_stop_provider_research_id", "stops", ["provider_id", "research_id"]
    )
    op.create_unique_constraint(
        "uq_stop_provider_canonical_id", "stops", ["provider_id", "canonical_stop_id"]
    )
    op.create_index(
        "ix_stop_provider_reconciliation",
        "stops",
        ["provider_id", "reconciliation_status"],
    )

    for name, column in (
        ("route_code", sa.String()),
        ("route_name", sa.String()),
        ("source", sa.String()),
        ("source_page", sa.String()),
        ("effective_date", sa.Date()),
        ("verified_at", sa.DateTime()),
        ("notes", sa.Text()),
    ):
        op.add_column("routes", sa.Column(name, column, nullable=True))
    op.create_unique_constraint("uq_route_provider_code", "routes", ["provider_id", "route_code"])
    op.create_index("ix_route_provider_effective", "routes", ["provider_id", "effective_date"])

    op.create_table(
        "scheduled_trip_groups",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("route_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("group_label", sa.String(), nullable=False),
        sa.Column("source", sa.String(), nullable=False),
        sa.Column("source_page", sa.String(), nullable=True),
        sa.Column("effective_date", sa.Date(), nullable=True),
        sa.Column("data_tier", _tier_enum(), nullable=False),
        sa.Column("verified_at", sa.DateTime(), nullable=True),
        sa.Column("departure_times_source_order_raw", sa.JSON(), nullable=False),
        sa.Column("departure_times_source_order", sa.JSON(), nullable=False),
        sa.Column("departure_times_chronological", sa.JSON(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["route_id"], ["routes.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "route_id", "group_label", "source", name="uq_schedule_group_route_label_source"
        ),
    )
    op.create_index(
        "ix_schedule_group_route_effective",
        "scheduled_trip_groups",
        ["route_id", "effective_date"],
    )

    op.add_column("fare_rules", sa.Column("status", sa.String(), nullable=True))
    op.add_column("fare_rules", sa.Column("currency", sa.String(), nullable=True))
    op.add_column("fare_rules", sa.Column("verification_note", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("fare_rules", "verification_note")
    op.drop_column("fare_rules", "currency")
    op.drop_column("fare_rules", "status")
    op.drop_index("ix_schedule_group_route_effective", table_name="scheduled_trip_groups")
    op.drop_table("scheduled_trip_groups")
    op.drop_index("ix_route_provider_effective", table_name="routes")
    op.drop_constraint("uq_route_provider_code", "routes", type_="unique")
    for name in ("notes", "verified_at", "effective_date", "source_page", "source", "route_name", "route_code"):
        op.drop_column("routes", name)
    op.drop_index("ix_stop_provider_reconciliation", table_name="stops")
    op.drop_constraint("uq_stop_provider_canonical_id", "stops", type_="unique")
    op.drop_constraint("uq_stop_provider_research_id", "stops", type_="unique")
    for name in ("notes", "verified_at", "effective_date", "source", "reconciliation_status", "coordinate_status", "canonical_stop_id", "research_id", "matched_name", "published_name"):
        op.drop_column("stops", name)
    op.alter_column(
        "stops", "location", existing_type=Geography(geometry_type="POINT", srid=4326), nullable=False
    )
    op.drop_index("ix_provider_source_provider_tier", table_name="transport_provider_sources")
    op.drop_table("transport_provider_sources")
