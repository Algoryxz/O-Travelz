"""Add district column to places table.

Revision ID: 0007_add_place_district
Revises: 0006_interests_and_place_interests
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0007_add_place_district"
down_revision: Union[str, None] = "0006_interests_and_place_interests"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("places", sa.Column("district", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("places", "district")
