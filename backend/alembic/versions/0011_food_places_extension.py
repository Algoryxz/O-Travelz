"""Additive food places extension schema migration.

Adds optional cuisine, dietary_tags, speciality_dishes, highway_corridor,
and food_category metadata to the places table without breaking canonical identity.

Revision ID: 0011_food_places_extension
Revises: 0010_shared_trip_snapshots
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0011_food_places_extension"
down_revision: Union[str, None] = "0010_shared_trip_snapshots"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add nullable food extension columns to places
    op.add_column("places", sa.Column("cuisine", sa.String(), nullable=True))
    op.add_column("places", sa.Column("dietary_tags", sa.JSON(), nullable=True))
    op.add_column("places", sa.Column("speciality_dishes", sa.JSON(), nullable=True))
    op.add_column("places", sa.Column("highway_corridor", sa.String(), nullable=True))
    op.add_column("places", sa.Column("food_category", sa.String(), nullable=True))

    # 2. Add performance query indexes
    op.create_index("ix_places_cuisine", "places", ["cuisine"])
    op.create_index("ix_places_highway_corridor", "places", ["highway_corridor"])
    op.create_index("ix_places_food_category", "places", ["food_category"])


def downgrade() -> None:
    # 1. Drop indexes
    op.drop_index("ix_places_food_category", table_name="places")
    op.drop_index("ix_places_highway_corridor", table_name="places")
    op.drop_index("ix_places_cuisine", table_name="places")

    # 2. Drop columns in reverse order
    op.drop_column("places", "food_category")
    op.drop_column("places", "highway_corridor")
    op.drop_column("places", "speciality_dishes")
    op.drop_column("places", "dietary_tags")
    op.drop_column("places", "cuisine")
