"""Phase 6A: Add Transit Intelligence research and normalization layer tables.

Creates:
- evidence_citations
- route_intelligence
- route_corridor_intelligence
- stop_intelligence
- stop_aliases
- unresolved_stops_registry

Revision ID: 0013_transit_intelligence_layer
Revises: 0012_add_route_stop_indexes
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0013_transit_intelligence_layer"
down_revision: Union[str, None] = "0012_add_route_stop_indexes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. evidence_citations
    op.create_table(
        "evidence_citations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("evidence_id", sa.String(), nullable=False),
        sa.Column("source", sa.String(), nullable=False),
        sa.Column("source_type", sa.String(), nullable=False),
        sa.Column("document", sa.String(), nullable=True),
        sa.Column("page", sa.String(), nullable=True),
        sa.Column("url", sa.String(), nullable=True),
        sa.Column("claim", sa.Text(), nullable=True),
        sa.Column("reliability", sa.String(), nullable=False),
        sa.Column("accessed_at", sa.DateTime(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.UniqueConstraint("evidence_id", name="uq_evidence_citations_evidence_id"),
    )
    op.create_index("ix_evidence_citations_evidence_id", "evidence_citations", ["evidence_id"])

    # 2. route_intelligence
    op.create_table(
        "route_intelligence",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("route_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("routes.id", ondelete="SET NULL"), nullable=True),
        sa.Column("route_number", sa.String(), nullable=False),
        sa.Column("route_code", sa.String(), nullable=True),
        sa.Column("region", sa.String(), nullable=False),
        sa.Column("origin", sa.String(), nullable=False),
        sa.Column("destination", sa.String(), nullable=False),
        sa.Column("via", sa.String(), nullable=True),
        sa.Column("direction", sa.String(), nullable=False, server_default="bidirectional"),
        sa.Column("overall_confidence", sa.String(), nullable=False),
        sa.Column("geometry_status", sa.String(), nullable=False),
        sa.Column("has_detailed_stops", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("stop_count_database", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("stop_count_research", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("route_level_evidence", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("conflicts", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("notes", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.UniqueConstraint("route_number", "region", name="uq_route_intel_num_region"),
    )
    op.create_index("ix_route_intel_route_number", "route_intelligence", ["route_number"])
    op.create_index("ix_route_intel_region", "route_intelligence", ["region"])
    op.create_index("ix_route_intel_geometry_status", "route_intelligence", ["geometry_status"])

    # 3. route_corridor_intelligence
    op.create_table(
        "route_corridor_intelligence",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("route_intelligence_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("route_intelligence.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sequence", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("from_label", sa.String(), nullable=True),
        sa.Column("to_label", sa.String(), nullable=True),
        sa.Column("road_names", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("major_junctions", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("landmarks", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("confidence", sa.String(), nullable=False),
        sa.Column("evidence", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("notes", sa.Text(), nullable=True),
    )
    op.create_index("ix_corridor_intel_route_seq", "route_corridor_intelligence", ["route_intelligence_id", "sequence"])

    # 4. stop_intelligence
    op.create_table(
        "stop_intelligence",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("stop_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("stops.id", ondelete="SET NULL"), nullable=True),
        sa.Column("stop_name", sa.String(), nullable=False),
        sa.Column("normalized_name", sa.String(), nullable=True),
        sa.Column("route_number", sa.String(), nullable=True),
        sa.Column("route_context", sa.String(), nullable=True),
        sa.Column("sequence_order", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("geographic_status", sa.String(), nullable=False),
        sa.Column("resolved_latitude", sa.Float(), nullable=True),
        sa.Column("resolved_longitude", sa.Float(), nullable=True),
        sa.Column("coordinate_provenance", sa.String(), nullable=True),
        sa.Column("road", sa.String(), nullable=True),
        sa.Column("locality", sa.String(), nullable=True),
        sa.Column("landmark", sa.String(), nullable=True),
        sa.Column("city", sa.String(), nullable=True),
        sa.Column("district", sa.String(), nullable=True),
        sa.Column("confidence", sa.String(), nullable=False),
        sa.Column("evidence", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("notes", sa.Text(), nullable=True),
    )
    op.create_index("ix_stop_intel_stop_name", "stop_intelligence", ["stop_name"])
    op.create_index("ix_stop_intel_route_seq", "stop_intelligence", ["route_number", "sequence_order"])

    # 5. stop_aliases
    op.create_table(
        "stop_aliases",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("primary_name", sa.String(), nullable=False),
        sa.Column("alias_name", sa.String(), nullable=False),
        sa.Column("city", sa.String(), nullable=True),
        sa.Column("alias_type", sa.String(), nullable=False),
        sa.Column("confidence", sa.String(), nullable=False),
        sa.Column("evidence_id", sa.String(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.UniqueConstraint("primary_name", "alias_name", name="uq_stop_alias_pair"),
    )
    op.create_index("ix_stop_alias_primary", "stop_aliases", ["primary_name"])
    op.create_index("ix_stop_alias_alias", "stop_aliases", ["alias_name"])

    # 6. unresolved_stops_registry
    op.create_table(
        "unresolved_stops_registry",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("canonical_stop_id", sa.String(), nullable=True),
        sa.Column("stop_name", sa.String(), nullable=False),
        sa.Column("city", sa.String(), nullable=True),
        sa.Column("district", sa.String(), nullable=True),
        sa.Column("geographic_status", sa.String(), nullable=False, server_default="unresolved"),
        sa.Column("reason_unresolved", sa.Text(), nullable=True),
        sa.Column("query_attempted", sa.Text(), nullable=True),
        sa.Column("potential_corridor", sa.Text(), nullable=True),
        sa.Column("serving_routes", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.UniqueConstraint("stop_name", name="uq_unresolved_stop_name"),
    )
    op.create_index("ix_unresolved_stop_name", "unresolved_stops_registry", ["stop_name"])


def downgrade() -> None:
    op.drop_table("unresolved_stops_registry")
    op.drop_table("stop_aliases")
    op.drop_table("stop_intelligence")
    op.drop_table("route_corridor_intelligence")
    op.drop_table("route_intelligence")
    op.drop_table("evidence_citations")
