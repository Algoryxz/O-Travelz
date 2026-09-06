"""Wave C5.4: Add transit ride and stop observation tables.

Creates:
- transit_ride_sessions
- transit_ride_samples
- transit_stop_observations

Revision ID: 0020_transit_ride_observations
Revises: 0019_enforce_media_orthogonal_constraints
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0020_transit_ride_observations"
down_revision: Union[str, None] = "0019_enforce_media_orthogonal_constraints"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. transit_ride_sessions
    op.create_table(
        "transit_ride_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("route_number", sa.String(32), nullable=False),
        sa.Column("sequence_id", sa.String(64), nullable=True),
        sa.Column("direction", sa.String(32), nullable=True),
        sa.Column("session_hash", sa.String(64), nullable=False),
        sa.Column("consent_version", sa.String(32), nullable=False, server_default="1.0"),
        sa.Column("status", sa.String(32), nullable=False, server_default="ACTIVE"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sample_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("quarantine_reason", sa.Text(), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("is_test_fixture", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_ride_sessions_route_seq", "transit_ride_sessions", ["route_number", "sequence_id"])
    op.create_index("ix_ride_sessions_status", "transit_ride_sessions", ["status"])
    op.create_index("ix_ride_sessions_started_at", "transit_ride_sessions", ["started_at"])
    op.create_index("ix_ride_sessions_session_hash", "transit_ride_sessions", ["session_hash"])

    # 2. transit_ride_samples
    op.create_table(
        "transit_ride_samples",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "session_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("transit_ride_sessions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("accuracy_m", sa.Float(), nullable=False),
        sa.Column("speed_mps", sa.Float(), nullable=True),
        sa.Column("heading_deg", sa.Float(), nullable=True),
        sa.Column("is_filtered", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("filter_reason", sa.String(64), nullable=True),
    )
    op.create_index("ix_ride_samples_session_time", "transit_ride_samples", ["session_id", "timestamp"])
    op.create_index("ix_ride_samples_geo", "transit_ride_samples", ["latitude", "longitude"])

    # 3. transit_stop_observations
    op.create_table(
        "transit_stop_observations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "session_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("transit_ride_sessions.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("canonical_stop_id", sa.String(64), nullable=True),
        sa.Column("route_number", sa.String(32), nullable=False),
        sa.Column("sequence_id", sa.String(64), nullable=True),
        sa.Column("direction", sa.String(32), nullable=True),
        sa.Column("observation_type", sa.String(32), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("accuracy_m", sa.Float(), nullable=True),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("contributor_hash", sa.String(64), nullable=False),
        sa.Column("evidence_pointer", sa.Text(), nullable=True),
        sa.Column("confirmation_value", sa.String(16), nullable=True),
        sa.Column("consensus_status", sa.String(32), nullable=False, server_default="OBSERVED_ONCE"),
        sa.Column("stop_association_status", sa.String(32), nullable=True),
        sa.Column("is_test_fixture", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_stop_obs_canonical_stop", "transit_stop_observations", ["canonical_stop_id"])
    op.create_index("ix_stop_obs_route_seq", "transit_stop_observations", ["route_number", "sequence_id"])
    op.create_index("ix_stop_obs_consensus", "transit_stop_observations", ["consensus_status"])
    op.create_index("ix_stop_obs_contributor", "transit_stop_observations", ["contributor_hash"])


def downgrade() -> None:
    op.drop_table("transit_stop_observations")
    op.drop_table("transit_ride_samples")
    op.drop_table("transit_ride_sessions")
