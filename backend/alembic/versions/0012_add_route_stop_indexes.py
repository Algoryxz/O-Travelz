"""Performance hardening: Add indexes for route_stops.route_id and route_stops.stop_id.

Eliminates sequential scans across route_stops during serving route lookups and graph traversal.

Revision ID: 0012_add_route_stop_indexes
Revises: 0011_food_places_extension
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0012_add_route_stop_indexes"
down_revision: Union[str, None] = "0011_food_places_extension"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_route_stops_route_id", "route_stops", ["route_id"])
    op.create_index("ix_route_stops_stop_id", "route_stops", ["stop_id"])


def downgrade() -> None:
    op.drop_index("ix_route_stops_stop_id", table_name="route_stops")
    op.drop_index("ix_route_stops_route_id", table_name="route_stops")
