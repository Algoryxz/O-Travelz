"""Allow verified places without defensibly verified coordinates.

Revision ID: 0002_make_place_location_nullable
Revises: 0001_initial_schema
"""
from typing import Sequence, Union

from alembic import op
import geoalchemy2
import sqlalchemy as sa


revision: str = "0002_make_place_location_nullable"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Alembic's default version_num is VARCHAR(32), but this canonical revision
    # identifier is 33 characters long. Widen the bookkeeping column before
    # Alembic records this revision; this is migration metadata, not product data.
    op.alter_column(
        "alembic_version",
        "version_num",
        existing_type=sa.String(length=32),
        type_=sa.String(length=128),
        existing_nullable=False,
    )
    op.alter_column(
        "places",
        "location",
        existing_type=geoalchemy2.types.Geography(geometry_type="POINT", srid=4326),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "places",
        "location",
        existing_type=geoalchemy2.types.Geography(geometry_type="POINT", srid=4326),
        nullable=False,
    )
    op.alter_column(
        "alembic_version",
        "version_num",
        existing_type=sa.String(length=128),
        type_=sa.String(length=32),
        existing_nullable=False,
    )
