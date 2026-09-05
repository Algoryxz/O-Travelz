"""Wave A3b: Enforce media orthogonal constraints and indexes (Phase 2).

Enforces:
- media_assets.content_kind NOT NULL (server_default="FIELD_PHOTOGRAPH")
- entity_media.display_role NOT NULL (server_default="HERO")
- Index ix_media_assets_content_kind
- Index ix_entity_media_display_role

Revision ID: 0019_enforce_media_orthogonal_constraints
Revises: 0018_add_media_orthogonal_dimensions
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0019_enforce_media_orthogonal_constraints"
down_revision: Union[str, None] = "0018_add_media_orthogonal_dimensions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "media_assets",
        "content_kind",
        nullable=False,
        server_default="FIELD_PHOTOGRAPH",
    )
    op.alter_column(
        "entity_media",
        "display_role",
        nullable=False,
        server_default="HERO",
    )
    op.create_index(
        "ix_media_assets_content_kind",
        "media_assets",
        ["content_kind"],
    )
    op.create_index(
        "ix_entity_media_display_role",
        "entity_media",
        ["display_role"],
    )


def downgrade() -> None:
    op.drop_index("ix_entity_media_display_role", table_name="entity_media")
    op.drop_index("ix_media_assets_content_kind", table_name="media_assets")
    op.alter_column(
        "entity_media",
        "display_role",
        nullable=True,
        server_default=None,
    )
    op.alter_column(
        "media_assets",
        "content_kind",
        nullable=True,
        server_default=None,
    )
