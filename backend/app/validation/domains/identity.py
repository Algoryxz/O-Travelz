"""
Identity Domain Validator.
Validates identifiers, duplicate primary keys, and scoped name collisions.
"""
from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Set
from app.validation import codes
from app.validation.models import ValidationReport, ValidationSeverity


def _normalize_name(name: str) -> str:
    """Normalize string for collision detection (lowercase alphanumeric only)."""
    return re.sub(r"[^a-z0-9]", "", (name or "").lower())


def validate_identity(
    records: List[Dict[str, Any]],
    entity_type: str,
    report: ValidationReport,
    id_field: str = "id",
    name_field: str = "name",
    scope_fields: Optional[List[str]] = None,
) -> None:
    """
    Validate identity, uniqueness, and name collisions across a collection of records.
    """
    seen_ids: Set[str] = set()
    seen_scoped_names: Dict[str, str] = {}  # scoped_key -> record_id

    for idx, rec in enumerate(records):
        rec_id = rec.get(id_field) or rec.get("research_id") or rec.get("stop_id") or rec.get("route_id")
        rec_name = rec.get(name_field) or rec.get("canonical_name")

        # 1. Missing identifier
        if not rec_id:
            report.add_issue(
                code=codes.ID_MISSING_IDENTIFIER,
                severity=ValidationSeverity.ERROR,
                domain="identity",
                entity_type=entity_type,
                entity_id=None,
                field=id_field,
                message=f"{entity_type} record at index {idx} missing primary identifier ({id_field})",
                evidence={"index": idx, "record_keys": list(rec.keys())},
            )
            continue

        rec_id_str = str(rec_id).strip()

        # 2. Duplicate Entity ID
        if rec_id_str in seen_ids:
            report.add_issue(
                code=codes.ID_DUPLICATE_ENTITY_ID,
                severity=ValidationSeverity.ERROR,
                domain="identity",
                entity_type=entity_type,
                entity_id=rec_id_str,
                field=id_field,
                message=f"Duplicate {entity_type} identifier detected: '{rec_id_str}'",
                evidence={"duplicate_id": rec_id_str},
            )
        else:
            seen_ids.add(rec_id_str)

        # 3. Scoped Name Collision (WARNING)
        if rec_name and str(rec_name).strip():
            norm_name = _normalize_name(str(rec_name))
            if norm_name:
                scope_parts = [entity_type]
                if scope_fields:
                    for sf in scope_fields:
                        val = rec.get(sf)
                        if val:
                            scope_parts.append(str(val).strip().lower())
                scope_parts.append(norm_name)
                scoped_key = "::".join(scope_parts)

                if scoped_key in seen_scoped_names:
                    existing_id = seen_scoped_names[scoped_key]
                    report.add_issue(
                        code=codes.ID_NAME_COLLISION,
                        severity=ValidationSeverity.WARNING,
                        domain="identity",
                        entity_type=entity_type,
                        entity_id=rec_id_str,
                        field=name_field,
                        message=f"Normalized name collision for '{rec_name}' with existing {entity_type} '{existing_id}' in same scope",
                        evidence={
                            "name": rec_name,
                            "colliding_with": existing_id,
                            "scope": scope_parts[:-1],
                        },
                    )
                else:
                    seen_scoped_names[scoped_key] = rec_id_str