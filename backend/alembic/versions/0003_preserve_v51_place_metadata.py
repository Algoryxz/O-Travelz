"""Preserve v5.1 research identifiers and audit/provenance metadata.

Revision ID: 0003_preserve_v51_place_metadata
Revises: 0002_make_place_location_nullable
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0003_preserve_v51_place_metadata"
down_revision: Union[str, None] = "0002_make_place_location_nullable"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("categories", sa.Column("display_name", sa.String(), nullable=True))
    op.add_column("categories", sa.Column("description", sa.String(), nullable=True))

    op.add_column("places", sa.Column("research_id", sa.String(), nullable=True))
    op.add_column("places", sa.Column("source_provenance_note", sa.String(), nullable=True))
    op.add_column("places", sa.Column("coordinate_verification", sa.String(), nullable=True))
    op.add_column("places", sa.Column("coordinate_audit_status", sa.String(), nullable=True))
    op.add_column("places", sa.Column("audit_status", sa.String(), nullable=True))
    op.create_unique_constraint("uq_places_research_id", "places", ["research_id"])
    op.create_unique_constraint(
        "uq_places_canonical_identity", "places", ["name", "category_id", "source"]
    )


def downgrade() -> None:
    op.drop_constraint("uq_places_canonical_identity", "places", type_="unique")
    op.drop_constraint("uq_places_research_id", "places", type_="unique")
    op.drop_column("places", "audit_status")
    op.drop_column("places", "coordinate_audit_status")
    op.drop_column("places", "coordinate_verification")
    op.drop_column("places", "source_provenance_note")
    op.drop_column("places", "research_id")
    op.drop_column("categories", "description")
    op.drop_column("categories", "display_name")
