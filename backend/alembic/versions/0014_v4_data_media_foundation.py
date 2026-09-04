"""Wave A1: Add Localized Identity, Normalized Entity Relationships, and Canonical Media Registry.

Creates:
- places.localized_names (JSON)
- places.confidence (VARCHAR(16))
- places.last_verified_at (TIMESTAMPTZ)
- stops.localized_names (JSON)
- entity_relationships table
- media_assets table
- entity_media table

Revision ID: 0014_v4_data_media_foundation
Revises: 0013_transit_intelligence_layer
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0014_v4_data_media_foundation"
down_revision: Union[str, None] = "0013_transit_intelligence_layer"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Additive columns to places
    op.add_column("places", sa.Column("localized_names", sa.JSON(), nullable=True))
    op.add_column("places", sa.Column("confidence", sa.String(length=16), nullable=True))
    op.add_column("places", sa.Column("last_verified_at", sa.DateTime(timezone=True), nullable=True))

    # 2. Additive columns to stops
    op.add_column("stops", sa.Column("localized_names", sa.JSON(), nullable=True))

    # 3. entity_relationships table
    op.create_table(
        "entity_relationships",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("source_entity_type", sa.String(length=32), nullable=False),
        sa.Column("source_entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("target_entity_type", sa.String(length=32), nullable=False),
        sa.Column("target_entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("relationship_type", sa.String(length=64), nullable=False),
        sa.Column("confidence", sa.String(length=16), nullable=True),
        sa.Column("provenance", sa.String(length=255), nullable=True),
        sa.Column("properties", sa.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "source_entity_type",
            "source_entity_id",
            "target_entity_type",
            "target_entity_id",
            "relationship_type",
            name="uq_entity_relationship",
        ),
    )
    op.create_index(
        "ix_entity_rel_source",
        "entity_relationships",
        ["source_entity_type", "source_entity_id"],
    )
    op.create_index(
        "ix_entity_rel_target",
        "entity_relationships",
        ["target_entity_type", "target_entity_id"],
    )
    op.create_index(
        "ix_entity_rel_type",
        "entity_relationships",
        ["relationship_type"],
    )

    # 4. media_assets canonical registry table
    op.create_table(
        "media_assets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("media_type", sa.String(length=16), server_default="image", nullable=False),
        sa.Column("content_sha256", sa.String(length=64), nullable=False),
        sa.Column("mime_type", sa.String(length=64), nullable=False),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("storage_backend", sa.String(length=32), server_default="local", nullable=False),
        sa.Column("storage_key", sa.String(length=255), nullable=False),
        sa.Column("variants", sa.JSON(), nullable=True),
        sa.Column("perceptual_hash", sa.String(length=64), nullable=True),
        sa.Column("license", sa.String(length=64), nullable=True),
        sa.Column("creator", sa.String(length=128), nullable=True),
        sa.Column("attribution", sa.String(length=255), nullable=True),
        sa.Column("source_url", sa.String(length=512), nullable=True),
        sa.Column(
            "verification_status",
            sa.String(length=32),
            server_default="UNVERIFIED",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("content_sha256", name="uq_media_assets_content_sha256"),
        sa.UniqueConstraint("storage_key", name="uq_media_assets_storage_key"),
    )
    op.create_index("ix_media_assets_content_sha256", "media_assets", ["content_sha256"])
    op.create_index("ix_media_assets_storage_key", "media_assets", ["storage_key"])

    # 5. entity_media association table
    op.create_table(
        "entity_media",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("entity_type", sa.String(length=32), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "media_asset_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("media_assets.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("association_type", sa.String(length=32), server_default="primary", nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("alt_text", sa.String(length=255), nullable=True),
        sa.Column("caption", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "entity_type",
            "entity_id",
            "media_asset_id",
            "association_type",
            name="uq_entity_media_assoc",
        ),
    )
    op.create_index("ix_entity_media_entity", "entity_media", ["entity_type", "entity_id"])
    op.create_index("ix_entity_media_asset", "entity_media", ["media_asset_id"])


def downgrade() -> None:
    op.drop_table("entity_media")
    op.drop_table("media_assets")
    op.drop_table("entity_relationships")
    op.drop_column("stops", "localized_names")
    op.drop_column("places", "last_verified_at")
    op.drop_column("places", "confidence")
    op.drop_column("places", "localized_names")