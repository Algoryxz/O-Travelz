"""
Data Models for O-TRAVELZ V4 Universal Canonical Validation Framework.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ValidationSeverity(str, Enum):
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"


class ValidationProfile(str, Enum):
    AUDIT = "AUDIT"
    PROMOTION = "PROMOTION"
    CI = "CI"


class ValidationIssue(BaseModel):
    """
    Standard machine-readable issue representation.
    Designed for zero-ambiguity programmatic ingestion.
    """
    code: str = Field(..., description="Deterministic issue code (e.g. PRV_MISSING_SOURCE)")
    severity: ValidationSeverity = Field(..., description="ERROR | WARNING | INFO")
    domain: str = Field(..., description="identity | localization | provenance | geospatial | relationships | media | transit")
    entity_type: str = Field(..., description="place | stop | route | media_asset | entity_relationship | etc.")
    entity_id: Optional[str] = Field(None, description="Primary ID or research ID of the entity")
    field: Optional[str] = Field(None, description="Affected property or attribute name")
    message: str = Field(..., description="Concise human-readable explanation")
    evidence: Dict[str, Any] = Field(default_factory=dict, description="Contextual diagnostic facts")


class ValidationSummary(BaseModel):
    errors: int = 0
    warnings: int = 0
    infos: int = 0


class ValidationReport(BaseModel):
    schema_version: str = "1.0.0"
    profile: ValidationProfile
    generated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    summary: ValidationSummary = Field(default_factory=ValidationSummary)
    issues: List[ValidationIssue] = Field(default_factory=list)

    def add_issue(
        self,
        code: str,
        severity: ValidationSeverity | str,
        domain: str,
        entity_type: str,
        message: str,
        entity_id: Optional[str] = None,
        field: Optional[str] = None,
        evidence: Optional[Dict[str, Any]] = None,
    ) -> ValidationIssue:
        if isinstance(severity, str):
            severity = ValidationSeverity(severity.upper())
        issue = ValidationIssue(
            code=code,
            severity=severity,
            domain=domain,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            field=field,
            message=message,
            evidence=evidence or {},
        )
        self.issues.append(issue)
        if severity == ValidationSeverity.ERROR:
            self.summary.errors += 1
        elif severity == ValidationSeverity.WARNING:
            self.summary.warnings += 1
        elif severity == ValidationSeverity.INFO:
            self.summary.infos += 1
        return issue

    def is_passing(self, fail_on_warning: bool = False) -> bool:
        """
        Evaluate pass/fail against active profile contract:
        - AUDIT: passes by default (reports debt without blocking), unless fail_on_warning=True or fail_on_error
        - PROMOTION: strict promotion gate, blocks if errors > 0
        - CI: blocks if any CI-blocking errors exist
        """
        if fail_on_warning and self.summary.warnings > 0:
            return False
        if self.profile == ValidationProfile.PROMOTION:
            return self.summary.errors == 0
        if self.profile == ValidationProfile.CI:
            # CI evaluates only blocking errors
            return self.summary.errors == 0
        # AUDIT profile does not fail CI by default unless explicit
        return True

    def to_json_dict(self) -> Dict[str, Any]:
        return json.loads(self.model_dump_json())

    def format_terminal_summary(self) -> str:
        lines = [
            "=" * 70,
            f"O-TRAVELZ V4 CANONICAL DATA QUALITY REPORT [{self.profile.value}]",
            f"Generated: {self.generated_at}",
            "=" * 70,
            f"SUMMARY: {self.summary.errors} Errors | {self.summary.warnings} Warnings | {self.summary.infos} Info Items",
            "-" * 70,
        ]

        # Domain breakdown
        domain_counts: Dict[str, Dict[str, int]] = {}
        for issue in self.issues:
            if issue.domain not in domain_counts:
                domain_counts[issue.domain] = {"ERROR": 0, "WARNING": 0, "INFO": 0}
            domain_counts[issue.domain][issue.severity.value] += 1

        lines.append("DOMAIN BREAKDOWN:")
        for dom, counts in sorted(domain_counts.items()):
            lines.append(
                f"  - {dom:<15}: {counts['ERROR']} Errors, {counts['WARNING']} Warnings, {counts['INFO']} Info"
            )

        if self.summary.errors > 0:
            lines.append("-" * 70)
            lines.append(f"BLOCKING ERRORS ({self.summary.errors} total):")
            err_issues = [i for i in self.issues if i.severity == ValidationSeverity.ERROR]
            for err in err_issues[:15]:
                ent_str = f" [{err.entity_type}:{err.entity_id}]" if err.entity_id else ""
                lines.append(f"  * [{err.code}]{ent_str} {err.message}")
            if len(err_issues) > 15:
                lines.append(f"  ... and {len(err_issues) - 15} more errors.")

        if self.summary.warnings > 0:
            lines.append("-" * 70)
            lines.append(f"ADVISORY WARNINGS ({self.summary.warnings} total):")
            warn_issues = [i for i in self.issues if i.severity == ValidationSeverity.WARNING]
            for w in warn_issues[:10]:
                ent_str = f" [{w.entity_type}:{w.entity_id}]" if w.entity_id else ""
                lines.append(f"  * [{w.code}]{ent_str} {w.message}")
            if len(warn_issues) > 10:
                lines.append(f"  ... and {len(warn_issues) - 10} more warnings.")

        lines.append("=" * 70)
        return "\n".join(lines)