"""Wave C4.2: Add sequence identity columns to route_stops.

Adds:
- route_stops.direction (VARCHAR(64), nullable=True)
- route_stops.sequence_id (VARCHAR(128), nullable=True)

Pure DDL: No dependency on repository JSON at migration runtime.

Revision ID: 0015_add_route_stop_sequence_columns
Revises: 0014_v4_data_media_foundation
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0015_add_route_stop_sequence_columns"
down_revision: Union[str, None] = "0014_v4_data_media_foundation"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("route_stops", sa.Column("direction", sa.String(length=64), nullable=True))
    op.add_column("route_stops", sa.Column("sequence_id", sa.String(length=128), nullable=True))


def downgrade() -> None:
    op.drop_column("route_stops", "sequence_id")
    op.drop_column("route_stops", "direction")
