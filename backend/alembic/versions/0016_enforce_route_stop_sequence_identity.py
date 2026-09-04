"""Wave C4.2: Enforce NOT NULL and UNIQUE on route_stop sequence identity.

Enforces:
- route_stops.sequence_id NOT NULL
- Index ix_route_stops_sequence_id on sequence_id
- Unique constraint uq_route_stop_sequence_order on (route_id, sequence_id, sequence_order)

Revision ID: 0016_enforce_route_stop_sequence_identity
Revises: 0015_add_route_stop_sequence_columns
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0016_enforce_route_stop_sequence_identity"
down_revision: Union[str, None] = "0015_add_route_stop_sequence_columns"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enforce sequence_id NOT NULL
    op.alter_column("route_stops", "sequence_id", nullable=False)

    # 2. Add sequence_id index
    op.create_index("ix_route_stops_sequence_id", "route_stops", ["sequence_id"])

    # 3. Add uniqueness constraint on (route_id, sequence_id, sequence_order)
    op.create_unique_constraint(
        "uq_route_stop_sequence_order",
        "route_stops",
        ["route_id", "sequence_id", "sequence_order"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_route_stop_sequence_order", "route_stops", type_="unique")
    op.drop_index("ix_route_stops_sequence_id", table_name="route_stops")
    op.alter_column("route_stops", "sequence_id", nullable=True)
