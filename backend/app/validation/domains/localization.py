"""
Localization Domain Validator.
Validates LocalizedNames structure, fallback display names, and Odia/Hindi presence.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from app.validation import codes
from app.validation.models import ValidationReport, ValidationSeverity

VALID_LOCALES = {"en", "or", "hi"}


def validate_localization(
    record: Dict[str, Any],
    entity_type: str,
    report: ValidationReport,
    name_field: str = "name",
    check_translations: bool = True,
) -> None:
    """
    Validate localization rules adhering strictly to Wave A2 fallback semantics:
    1. canonical_name (or name_field) is the authoritative fallback.
    2. LOC_MISSING_CANONICAL_EN triggers ONLY if no valid canonical name fallback exists.
    3. localized_names, if present, must be a valid structure without empty strings.
    4. Missing Odia / Hindi translations are advisory WARNINGs, not blocking ERRORs.
    """
    entity_id = record.get("id") or record.get("research_id") or record.get("stop_id") or "unknown"
    canonical_name = record.get(name_field) or record.get("canonical_name")

    # 1. Authoritative Display / Canonical English Fallback Check
    if not canonical_name or not str(canonical_name).strip():
        # Check if localized_names has an en field as a rescue
        loc_names = record.get("localized_names")
        has_en = isinstance(loc_names, dict) and bool(str(loc_names.get("en", "")).strip())
        if not has_en:
            report.add_issue(
                code=codes.LOC_MISSING_CANONICAL_EN,
                severity=ValidationSeverity.ERROR,
                domain="localization",
                entity_type=entity_type,
                entity_id=str(entity_id),
                field=name_field,
                message=f"{entity_type} '{entity_id}' has no valid canonical display name or English fallback",
                evidence={"canonical_name": canonical_name},
            )

    # 2. LocalizedNames Structure Check
    raw_loc = record.get("localized_names")
    if raw_loc is not None:
        if not isinstance(raw_loc, dict):
            report.add_issue(
                code=codes.LOC_INVALID_STRUCTURE,
                severity=ValidationSeverity.ERROR,
                domain="localization",
                entity_type=entity_type,
                entity_id=str(entity_id),
                field="localized_names",
                message=f"{entity_type} '{entity_id}' localized_names must be a dictionary, got {type(raw_loc).__name__}",
                evidence={"value": str(raw_loc)},
            )
            return

        for locale_key, val in raw_loc.items():
            # Check locale code validity
            if locale_key not in VALID_LOCALES:
                report.add_issue(
                    code=codes.LOC_INVALID_LOCALE,
                    severity=ValidationSeverity.WARNING,
                    domain="localization",
                    entity_type=entity_type,
                    entity_id=str(entity_id),
                    field=f"localized_names.{locale_key}",
                    message=f"{entity_type} '{entity_id}' contains unrecognized locale key '{locale_key}'",
                    evidence={"locale": locale_key},
                )

            # Check non-empty string if key is provided
            if val is not None:
                if not isinstance(val, str) or not val.strip():
                    report.add_issue(
                        code=codes.LOC_EMPTY_STRING,
                        severity=ValidationSeverity.ERROR,
                        domain="localization",
                        entity_type=entity_type,
                        entity_id=str(entity_id),
                        field=f"localized_names.{locale_key}",
                        message=f"{entity_type} '{entity_id}' localized string for '{locale_key}' is empty or whitespace-only",
                        evidence={"locale": locale_key, "value": val},
                    )

        # 3. Odia & Hindi Language Gap Checks (Advisory WARNINGs)
        if check_translations:
            odia_val = raw_loc.get("or")
            if not odia_val or not str(odia_val).strip():
                report.add_issue(
                    code=codes.LOC_ODIA_ABSENT,
                    severity=ValidationSeverity.WARNING,
                    domain="localization",
                    entity_type=entity_type,
                    entity_id=str(entity_id),
                    field="localized_names.or",
                    message=f"{entity_type} '{entity_id}' lacks authentic Odia (ଓଡ଼ିଆ) script translation",
                    evidence={"canonical_name": canonical_name},
                )

            hindi_val = raw_loc.get("hi")
            if not hindi_val or not str(hindi_val).strip():
                report.add_issue(
                    code=codes.LOC_HINDI_ABSENT,
                    severity=ValidationSeverity.WARNING,
                    domain="localization",
                    entity_type=entity_type,
                    entity_id=str(entity_id),
                    field="localized_names.hi",
                    message=f"{entity_type} '{entity_id}' lacks Hindi (हिन्दी) translation",
                    evidence={"canonical_name": canonical_name},
                )
    elif check_translations:
        # If record has no localized_names dict at all, report Odia and Hindi absence
        report.add_issue(
            code=codes.LOC_ODIA_ABSENT,
            severity=ValidationSeverity.WARNING,
            domain="localization",
            entity_type=entity_type,
            entity_id=str(entity_id),
            field="localized_names",
            message=f"{entity_type} '{entity_id}' has no Odia translation registered",
            evidence={"canonical_name": canonical_name},
        )