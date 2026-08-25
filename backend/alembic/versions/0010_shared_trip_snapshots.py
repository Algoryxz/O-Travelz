"""Shared trip snapshots migration for public read-only trip deep-linking.

Creates shared_trip_snapshots table with unique unguessable share_id and payload persistence.

Revision ID: 0010_shared_trip_snapshots
Revises: 0009_google_oauth_user_identity
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0010_shared_trip_snapshots"
down_revision: Union[str, None] = "0009_google_oauth_user_identity"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "shared_trip_snapshots",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("share_id", sa.String(length=32), nullable=False),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("snapshot_data", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("share_id"),
    )
    op.create_index(
        "ix_shared_trip_snapshots_share_id",
        "shared_trip_snapshots",
        ["share_id"],
    )
    op.create_index(
        "ix_shared_trip_snapshots_user_id",
        "shared_trip_snapshots",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_shared_trip_snapshots_user_id", table_name="shared_trip_snapshots")
    op.drop_index("ix_shared_trip_snapshots_share_id", table_name="shared_trip_snapshots")
    op.drop_table("shared_trip_snapshots")
