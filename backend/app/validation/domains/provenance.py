"""
Provenance Domain Validator.
Validates sources, verification status, evidence citations, and verification timestamps.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional, Set
from app.validation import codes
from app.validation.models import ValidationReport, ValidationSeverity

PLACEHOLDER_SOURCES = {
    "",
    "required",
    "todo",
    "tbd",
    "unknown",
    "none",
    "null",
    "placeholder",
}

VALID_STATUSES: Set[str] = {
    "VERIFIED",
    "UNVERIFIED",
    "UNAVAILABLE",
    "VERIFIED_OFFICIAL",
    "VERIFIED_GEOSPATIAL",
    "RESOLVED_HIGH_CONFIDENCE",
    "EXACT_LOCATION_VERIFIED",
    "RELATED_LOCATION",
    "TECHNICAL_VECTOR",
    "REJECTED",
}


def validate_provenance(
    record: Dict[str, Any],
    entity_type: str,
    report: ValidationReport,
    source_field: str = "source",
    status_field: str = "verification_status",
) -> None:
    entity_id = record.get("id") or record.get("research_id") or record.get("stop_id") or "unknown"
    src = record.get(source_field)
    status = record.get(status_field)

    # 1. Source requirement
    if src is None or str(src).strip().lower() in PLACEHOLDER_SOURCES:
        report.add_issue(
            code=codes.PRV_MISSING_SOURCE,
            severity=ValidationSeverity.ERROR,
            domain="provenance",
            entity_type=entity_type,
            entity_id=str(entity_id),
            field=source_field,
            message=f"{entity_type} '{entity_id}' lacks a valid authentic provenance source",
            evidence={"source": src},
        )

    # 2. Verification status validity
    if status is not None:
        status_norm = str(status).strip().upper()
        if status_norm not in VALID_STATUSES:
            report.add_issue(
                code=codes.PRV_INVALID_STATUS,
                severity=ValidationSeverity.ERROR,
                domain="provenance",
                entity_type=entity_type,
                entity_id=str(entity_id),
                field=status_field,
                message=f"{entity_type} '{entity_id}' has unrecognized verification status '{status}'",
                evidence={"verification_status": status, "allowed": sorted(VALID_STATUSES)},
            )

        # 3. Official/Verified requires verifiable evidence
        if status_norm in {"VERIFIED", "VERIFIED_OFFICIAL", "EXACT_LOCATION_VERIFIED"}:
            evidence_source = src or record.get("source_url") or record.get("evidence_citation_id")
            if not evidence_source or str(evidence_source).strip().lower() in PLACEHOLDER_SOURCES:
                report.add_issue(
                    code=codes.PRV_OFFICIAL_UNVERIFIED,
                    severity=ValidationSeverity.ERROR,
                    domain="provenance",
                    entity_type=entity_type,
                    entity_id=str(entity_id),
                    field=status_field,
                    message=f"{entity_type} '{entity_id}' is marked '{status}' but lacks required evidence citation or source",
                    evidence={"status": status, "source": src},
                )

    # 4. Timestamp Sanity
    for ts_field in ("verified_at", "last_verified_at"):
        ts_val = record.get(ts_field)
        if ts_val:
            try:
                if isinstance(ts_val, str):
                    # Handle Z or standard ISO
                    parsed_dt = datetime.fromisoformat(ts_val.replace("Z", "+00:00"))
                elif isinstance(ts_val, datetime):
                    parsed_dt = ts_val
                else:
                    parsed_dt = None

                if parsed_dt:
                    now = datetime.now(timezone.utc) if parsed_dt.tzinfo else datetime.utcnow()
                    if parsed_dt > now:
                        report.add_issue(
                            code=codes.PRV_STALE_VERIFICATION,
                            severity=ValidationSeverity.WARNING,
                            domain="provenance",
                            entity_type=entity_type,
                            entity_id=str(entity_id),
                            field=ts_field,
                            message=f"{entity_type} '{entity_id}' has future verification timestamp '{ts_val}'",
                            evidence={"timestamp": str(ts_val)},
                        )
            except Exception:
                pass