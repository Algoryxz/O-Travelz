"""Wave A3b: Add nullable media orthogonal dimensions (Phase 1).

Adds:
- media_assets.content_kind (VARCHAR(32), nullable=True)
- entity_media.display_role (VARCHAR(32), nullable=True)

Revision ID: 0018_add_media_orthogonal_dimensions
Revises: 0017_enforce_route_stops_direction_not_null
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0018_add_media_orthogonal_dimensions"
down_revision: Union[str, None] = "0017_enforce_route_stops_direction_not_null"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "media_assets",
        sa.Column("content_kind", sa.String(length=32), nullable=True),
    )
    op.add_column(
        "entity_media",
        sa.Column("display_role", sa.String(length=32), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("entity_media", "display_role")
    op.drop_column("media_assets", "content_kind")
