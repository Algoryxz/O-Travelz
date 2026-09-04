#!/usr/bin/env python3
"""
scripts/validate_canonical_data.py — Universal Canonical Data Quality & Promotion Gate.

Supports profiles:
- AUDIT: Inspects canonical data, reports all issues, exits 0 by default (unless --fail-on-error).
- PROMOTION: Strict gate for staged records; any ERROR blocks promotion with non-zero exit.
- CI: Enforces clean adopted invariants; newly discovered legacy debt does not break CI.

Usage:
  python scripts/validate_canonical_data.py --profile audit
  python scripts/validate_canonical_data.py --profile audit --fail-on-error
  python scripts/validate_canonical_data.py --profile promotion --input staged_records.json
  python scripts/validate_canonical_data.py --profile ci
  python scripts/validate_canonical_data.py --profile audit --json-out reports/audit_report.json
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = WORKSPACE_ROOT / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(WORKSPACE_ROOT) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_ROOT))

from app.validation.models import ValidationProfile, ValidationReport, ValidationSeverity
from app.validation.runner import UniversalValidator
from app.validation.profiles import CI_BLOCKING_CODES


def main() -> int:
    parser = argparse.ArgumentParser(
        description="O-TRAVELZ V4 Universal Canonical Data Quality & Promotion Gate"
    )
    parser.add_argument(
        "--profile",
        type=str,
        choices=["audit", "promotion", "ci"],
        default="audit",
        help="Validation profile: audit (default), promotion, or ci",
    )
    parser.add_argument(
        "--input",
        type=str,
        default=None,
        help="Path to staged JSON records file for promotion evaluation",
    )
    parser.add_argument(
        "--entity-type",
        type=str,
        default="place",
        help="Entity type when evaluating --input (default: place)",
    )
    parser.add_argument(
        "--fail-on-error",
        action="store_true",
        help="Exit with non-zero code if any ERROR is detected (even in audit profile)",
    )
    parser.add_argument(
        "--fail-on-warning",
        action="store_true",
        help="Exit with non-zero code if any WARNING is detected",
    )
    parser.add_argument(
        "--json-out",
        type=str,
        default=None,
        help="Output path for machine-readable JSON validation report",
    )

    args = parser.parse_args()
    profile_enum = ValidationProfile(args.profile.upper())

    validator = UniversalValidator(profile=profile_enum)
    report = ValidationReport(profile=profile_enum)

    if args.input:
        input_path = Path(args.input)
        if not input_path.exists():
            print(f"[ERROR] Input file does not exist: {input_path}", file=sys.stderr)
            return 1
        with open(input_path, encoding="utf-8") as f:
            staged = json.load(f)
        records = staged if isinstance(staged, list) else staged.get("records", [staged])
        validator.validate_collection(
            records=records,
            entity_type=args.entity_type,
            report=report,
            check_translations=True,
        )
    else:
        # Full audit across canonical files
        validator.audit_canonical_files(workspace_root=WORKSPACE_ROOT, report=report)

    # Print terminal summary
    print(report.format_terminal_summary())

    # Write JSON output if requested
    if args.json_out:
        out_path = Path(args.json_out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(report.to_json_dict(), f, indent=2, ensure_ascii=False)
        print(f"\n[INFO] Machine-readable JSON report written to: {out_path.resolve()}")

    # Determine exit code based on profile contract
    if profile_enum == ValidationProfile.PROMOTION:
        if report.summary.errors > 0:
            print(f"\n[PROMOTION BLOCKED] {report.summary.errors} blocking errors found.", file=sys.stderr)
            return 1
        if args.fail_on_warning and report.summary.warnings > 0:
            print(f"\n[PROMOTION BLOCKED] {report.summary.warnings} warnings found with --fail-on-warning.", file=sys.stderr)
            return 1
        print("\n[PROMOTION APPROVED] Staged dataset meets all canonical quality requirements.")
        return 0

    elif profile_enum == ValidationProfile.CI:
        ci_blocking_errors = [i for i in report.issues if i.severity == ValidationSeverity.ERROR and i.code in CI_BLOCKING_CODES]
        if ci_blocking_errors:
            print(f"\n[CI FAILURE] {len(ci_blocking_errors)} CI-blocking errors detected.", file=sys.stderr)
            return 1
        print("\n[CI PASS] All adopted CI invariants verified.")
        return 0

    else:  # AUDIT
        if args.fail_on_error and report.summary.errors > 0:
            print(f"\n[AUDIT FAILED] {report.summary.errors} errors found with --fail-on-error.", file=sys.stderr)
            return 1
        if args.fail_on_warning and report.summary.warnings > 0:
            print(f"\n[AUDIT FAILED] {report.summary.warnings} warnings found with --fail-on-warning.", file=sys.stderr)
            return 1
        return 0


if __name__ == "__main__":
    sys.exit(main())