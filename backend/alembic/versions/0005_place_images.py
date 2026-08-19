"""Create place_images table for multi-image destination assets and provenance.

Revision ID: 0005_place_images
Revises: 0004_transport_research_layers
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0005_place_images"
down_revision: Union[str, None] = "0004_transport_research_layers"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "place_images",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("place_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("storage_key", sa.String(), nullable=True),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("thumbnail_url", sa.String(), nullable=True),
        sa.Column("card_url", sa.String(), nullable=True),
        sa.Column("alt_text", sa.String(), nullable=True),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("source_url", sa.String(), nullable=True),
        sa.Column("source_name", sa.String(), nullable=False),
        sa.Column("creator", sa.String(), nullable=True),
        sa.Column("license", sa.String(), nullable=False),
        sa.Column("attribution", sa.Text(), nullable=False),
        sa.Column("retrieval_timestamp", sa.DateTime(), nullable=True),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("aspect_ratio", sa.Float(), nullable=True),
        sa.Column("content_sha256", sa.String(length=64), nullable=True),
        sa.Column("content_type", sa.String(length=64), nullable=True),
        sa.Column("size_bytes", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="verified"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["place_id"], ["places.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_place_images_place_id", "place_images", ["place_id"])
    op.create_index("ix_place_images_status", "place_images", ["status"])


def downgrade() -> None:
    op.drop_index("ix_place_images_status", table_name="place_images")
    op.drop_index("ix_place_images_place_id", table_name="place_images")
    op.drop_table("place_images")
