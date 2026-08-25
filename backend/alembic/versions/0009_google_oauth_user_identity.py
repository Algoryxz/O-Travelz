"""Google OAuth, user identity, sessions, and cloud sync migration.

Extends the users table with provider subject identity, display name, avatar, and audit timestamps.
Creates user_sessions, user_saved_places, and user_saved_trips tables.

Revision ID: 0009_google_oauth_user_identity
Revises: 0008_odisha_knowledge_base_expansion
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0009_google_oauth_user_identity"
down_revision: Union[str, None] = "0008_odisha_knowledge_base_expansion"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Extend existing users table
    op.add_column(
        "users",
        sa.Column("provider", sa.String(), nullable=False, server_default="google"),
    )
    op.add_column(
        "users",
        sa.Column("provider_subject", sa.String(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("display_name", sa.String(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("avatar_url", sa.String(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.add_column(
        "users",
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.add_column(
        "users",
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
    )

    op.create_unique_constraint(
        "uq_user_provider_subject",
        "users",
        ["provider", "provider_subject"],
    )
    op.create_index(
        "ix_users_provider_subject",
        "users",
        ["provider_subject"],
    )

    # 2. Create user_sessions table
    op.create_table(
        "user_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("session_token_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_token_hash"),
    )
    op.create_index(
        "ix_user_sessions_session_token_hash",
        "user_sessions",
        ["session_token_hash"],
    )
    op.create_index(
        "ix_user_sessions_user_id_revoked_at",
        "user_sessions",
        ["user_id", "revoked_at"],
    )

    # 3. Create user_saved_places table
    op.create_table(
        "user_saved_places",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("place_id", sa.String(), nullable=False),
        sa.Column("place_name", sa.String(), nullable=False),
        sa.Column("place_data", sa.JSON(), nullable=False),
        sa.Column("saved_at", sa.BigInteger(), nullable=False),
        sa.Column("updated_at", sa.BigInteger(), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_user_saved_places_user_id_place_id",
        "user_saved_places",
        ["user_id", "place_id"],
    )
    op.create_index(
        "ix_user_saved_places_user_id_is_deleted",
        "user_saved_places",
        ["user_id", "is_deleted"],
    )

    # 4. Create user_saved_trips table
    op.create_table(
        "user_saved_trips",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("history", sa.JSON(), nullable=False),
        sa.Column("constraints", sa.JSON(), nullable=True),
        sa.Column("itinerary", sa.JSON(), nullable=True),
        sa.Column("timestamp", sa.BigInteger(), nullable=False),
        sa.Column("updated_at", sa.BigInteger(), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_user_saved_trips_user_id_is_deleted",
        "user_saved_trips",
        ["user_id", "is_deleted"],
    )


def downgrade() -> None:
    # Drop tables in reverse dependency order
    op.drop_index("ix_user_saved_trips_user_id_is_deleted", table_name="user_saved_trips")
    op.drop_table("user_saved_trips")

    op.drop_index("ix_user_saved_places_user_id_is_deleted", table_name="user_saved_places")
    op.drop_index("ix_user_saved_places_user_id_place_id", table_name="user_saved_places")
    op.drop_table("user_saved_places")

    op.drop_index("ix_user_sessions_user_id_revoked_at", table_name="user_sessions")
    op.drop_index("ix_user_sessions_session_token_hash", table_name="user_sessions")
    op.drop_table("user_sessions")

    op.drop_index("ix_users_provider_subject", table_name="users")
    op.drop_constraint("uq_user_provider_subject", "users", type_="unique")

    op.drop_column("users", "last_login_at")
    op.drop_column("users", "updated_at")
    op.drop_column("users", "created_at")
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "display_name")
    op.drop_column("users", "provider_subject")
    op.drop_column("users", "provider")
