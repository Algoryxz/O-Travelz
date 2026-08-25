"""Create interests and place_interests tables for normalized traveler-facing themes.

Revision ID: 0006_interests_and_place_interests
Revises: 0005_place_images
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0006_interests_and_place_interests"
down_revision: Union[str, None] = "0005_place_images"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "interests",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("display_name", sa.String(), nullable=True),
        sa.Column("description", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="uq_interests_name"),
    )
    op.create_index("ix_interests_name", "interests", ["name"])

    op.create_table(
        "place_interests",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("place_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("interest_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["place_id"], ["places.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["interest_id"], ["interests.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("place_id", "interest_id", name="uq_place_interests_place_interest"),
    )
    op.create_index("ix_place_interests_place_id", "place_interests", ["place_id"])
    op.create_index("ix_place_interests_interest_id", "place_interests", ["interest_id"])


def downgrade() -> None:
    op.drop_index("ix_place_interests_interest_id", table_name="place_interests")
    op.drop_index("ix_place_interests_place_id", table_name="place_interests")
    op.drop_table("place_interests")
    op.drop_index("ix_interests_name", table_name="interests")
    op.drop_table("interests")
