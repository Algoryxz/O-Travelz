"""Wave C4.2.1: Enforce route_stops.direction NOT NULL.

Revision ID: 0017_enforce_route_stops_direction_not_null
Revises: 0016_enforce_route_stop_sequence_identity
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0017_enforce_route_stops_direction_not_null"
down_revision: Union[str, None] = "0016_enforce_route_stop_sequence_identity"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("route_stops", "direction", nullable=False)


def downgrade() -> None:
    op.alter_column("route_stops", "direction", nullable=True)
