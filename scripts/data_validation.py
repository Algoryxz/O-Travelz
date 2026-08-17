"""Phase 0 data preflight helpers; no database writes. Owner: Smarak."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class ValidationReport:
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    @property
    def valid(self) -> bool:
        return not self.errors


def validate_categories(records: Any) -> ValidationReport:
    report = ValidationReport()
    if not isinstance(records, list):
        report.errors.append("categories must be a JSON array")
        return report
    for index, record in enumerate(records):
        if not isinstance(record, dict) or not isinstance(record.get("name"), str):
            report.errors.append(f"categories[{index}] requires a name")
    return report


def validate_places(records: Any) -> ValidationReport:
    report = ValidationReport()
    if not isinstance(records, list):
        report.errors.append("places must be a JSON array")
        return report
    required = {"name", "category", "lat", "lon", "source"}
    for index, record in enumerate(records):
        if not isinstance(record, dict):
            report.errors.append(f"places[{index}] must be an object")
            continue
        if "_comment" in record:
            report.warnings.append(f"places[{index}] is an explicit placeholder")
            continue
        missing = sorted(required - record.keys())
        if missing:
            report.errors.append(f"places[{index}] missing: {', '.join(missing)}")
        if record.get("source") in (None, "", "REQUIRED"):
            report.errors.append(f"places[{index}] requires a real source")
    return report


def validate_transport_static(record: Any, filename: str) -> ValidationReport:
    report = ValidationReport()
    if not isinstance(record, dict):
        report.errors.append(f"{filename} must contain an object")
        return report
    for key in ("provider", "mode", "stops", "routes", "source"):
        if key not in record:
            report.errors.append(f"{filename} missing: {key}")
    if record.get("source") in (None, "", "REQUIRED"):
        report.errors.append(f"{filename} requires a real source")
    return report


def merge_reports(*reports: ValidationReport) -> ValidationReport:
    merged = ValidationReport()
    for report in reports:
        merged.errors.extend(report.errors)
        merged.warnings.extend(report.warnings)
    return merged
