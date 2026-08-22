"""Odisha knowledge base expansion schema migration.

Adds optional rating, operational hours provenance, structured source URL,
verification status, contact/emergency metadata, and query indexes to places.

Revision ID: 0008_odisha_knowledge_base_expansion
Revises: 0007_add_place_district
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0008_odisha_knowledge_base_expansion"
down_revision: Union[str, None] = "0007_add_place_district"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add nullable columns to places table
    op.add_column("places", sa.Column("rating", sa.Float(), nullable=True))
    op.add_column("places", sa.Column("rating_count", sa.Integer(), nullable=True))
    op.add_column("places", sa.Column("rating_source", sa.String(), nullable=True))
    op.add_column("places", sa.Column("opening_hours_source", sa.String(), nullable=True))
    op.add_column("places", sa.Column("source_url", sa.String(), nullable=True))
    op.add_column("places", sa.Column("verification_status", sa.String(), nullable=True))
    op.add_column("places", sa.Column("contact_phone", sa.String(), nullable=True))
    op.add_column("places", sa.Column("emergency_phone", sa.String(), nullable=True))
    op.add_column("places", sa.Column("address", sa.String(), nullable=True))

    # 2. Add performance & search query indexes
    op.create_index("ix_places_district", "places", ["district"])
    op.create_index("ix_places_name", "places", ["name"])
    op.create_index("ix_places_category_id", "places", ["category_id"])
    op.create_index("ix_places_verification_status", "places", ["verification_status"])


def downgrade() -> None:
    # 1. Drop indexes
    op.drop_index("ix_places_verification_status", table_name="places")
    op.drop_index("ix_places_category_id", table_name="places")
    op.drop_index("ix_places_name", table_name="places")
    op.drop_index("ix_places_district", table_name="places")

    # 2. Drop columns in reverse order
    op.drop_column("places", "address")
    op.drop_column("places", "emergency_phone")
    op.drop_column("places", "contact_phone")
    op.drop_column("places", "verification_status")
    op.drop_column("places", "source_url")
    op.drop_column("places", "opening_hours_source")
    op.drop_column("places", "rating_source")
    op.drop_column("places", "rating_count")
    op.drop_column("places", "rating")
