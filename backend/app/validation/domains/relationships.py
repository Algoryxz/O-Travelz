"""
Relationships Domain Validator.
Validates normalized graph edges, referential integrity, duplicate edges,
self-loops, and relationship types.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional, Set, Tuple
from app.validation import codes
from app.validation.models import ValidationReport, ValidationSeverity

VALID_RELATIONSHIP_TYPES = {
    "nearest_transit_stop",
    "artisan_hub_for",
    "culinary_origin",
    "cultural_influence",
    "corridor_link",
    "service_facility",
    "parent_hub",
    "serves_route",
    "interchange_connection",
    "craft_tradition_origin",
}


def validate_relationships(
    relationships: List[Dict[str, Any]],
    report: ValidationReport,
    known_entity_ids: Optional[Set[str]] = None,
) -> None:
    seen_edges: Set[Tuple[str, str, str, str, str]] = set()

    for idx, rel in enumerate(relationships):
        rel_id = rel.get("id") or f"edge_{idx}"
        src_type = str(rel.get("source_entity_type", "")).strip()
        src_id = str(rel.get("source_entity_id", "")).strip()
        tgt_type = str(rel.get("target_entity_type", "")).strip()
        tgt_id = str(rel.get("target_entity_id", "")).strip()
        rel_type = str(rel.get("relationship_type", "")).strip()
        confidence = rel.get("confidence")

        # 1. Self-Loop Check (Blocking ERROR)
        if src_type and tgt_type and src_id and tgt_id and (src_type == tgt_type) and (src_id == tgt_id):
            report.add_issue(
                code=codes.REL_SELF_LOOP,
                severity=ValidationSeverity.ERROR,
                domain="relationships",
                entity_type="entity_relationship",
                entity_id=str(rel_id),
                field="target_entity_id",
                message=f"Entity {src_type}:'{src_id}' has an accidental self-referential relationship edge",
                evidence={"entity_type": src_type, "entity_id": src_id, "relationship_type": rel_type},
            )

        # 2. Relationship Type Validity
        if rel_type not in VALID_RELATIONSHIP_TYPES:
            report.add_issue(
                code=codes.REL_INVALID_TYPE,
                severity=ValidationSeverity.ERROR,
                domain="relationships",
                entity_type="entity_relationship",
                entity_id=str(rel_id),
                field="relationship_type",
                message=f"Unrecognized relationship type '{rel_type}' on edge '{rel_id}'",
                evidence={"relationship_type": rel_type, "allowed": sorted(VALID_RELATIONSHIP_TYPES)},
            )

        # 3. Duplicate Edge Check
        edge_key = (src_type, src_id, tgt_type, tgt_id, rel_type)
        if edge_key in seen_edges:
            report.add_issue(
                code=codes.REL_DUPLICATE_EDGE,
                severity=ValidationSeverity.ERROR,
                domain="relationships",
                entity_type="entity_relationship",
                entity_id=str(rel_id),
                field="relationship_type",
                message=f"Duplicate relationship edge detected between {src_type}:'{src_id}' and {tgt_type}:'{tgt_id}'",
                evidence={"edge_key": list(edge_key)},
            )
        else:
            seen_edges.add(edge_key)

        # 4. Orphan Reference Check (if known entity ID registry provided)
        if known_entity_ids is not None:
            if src_id and src_id not in known_entity_ids:
                report.add_issue(
                    code=codes.REL_ORPHAN_REFERENCE,
                    severity=ValidationSeverity.ERROR,
                    domain="relationships",
                    entity_type="entity_relationship",
                    entity_id=str(rel_id),
                    field="source_entity_id",
                    message=f"Relationship edge '{rel_id}' references non-existent source entity '{src_id}'",
                    evidence={"missing_source_id": src_id},
                )
            if tgt_id and tgt_id not in known_entity_ids:
                report.add_issue(
                    code=codes.REL_ORPHAN_REFERENCE,
                    severity=ValidationSeverity.ERROR,
                    domain="relationships",
                    entity_type="entity_relationship",
                    entity_id=str(rel_id),
                    field="target_entity_id",
                    message=f"Relationship edge '{rel_id}' references non-existent target entity '{tgt_id}'",
                    evidence={"missing_target_id": tgt_id},
                )

        # 5. Unassigned Confidence Check (INFO only, per non-defaulting rule)
        if confidence is None or not str(confidence).strip():
            report.add_issue(
                code=codes.REL_UNASSIGNED_CONFIDENCE,
                severity=ValidationSeverity.INFO,
                domain="relationships",
                entity_type="entity_relationship",
                entity_id=str(rel_id),
                field="confidence",
                message=f"Relationship edge '{rel_id}' has unassigned confidence (correctly un-defaulted)",
                evidence={"source_id": src_id, "target_id": tgt_id},
            )