"""
Import data/transport/static/*.json and fares/*.json into the database.

Owner: Smarak. Depends on Akriti's data and docs/transportation/01-providers.md
(only import providers that have been verified there).

Run: python scripts/import_transport.py
"""
import json
import argparse
from pathlib import Path

from data_validation import merge_reports, validate_transport_static

STATIC_DIR = Path(__file__).resolve().parent.parent / "data" / "transport" / "static"
FARES_DIR = Path(__file__).resolve().parent.parent / "data" / "transport" / "fares"


def main() -> int:
    parser = argparse.ArgumentParser(description="Preflight or import transport data.")
    parser.add_argument(
        "--validate",
        action="store_true",
        help="validate source data without opening a database or writing records",
    )
    args = parser.parse_args()
    provider_files = sorted(p for p in STATIC_DIR.glob("*.json") if p.name != "README.md")
    print(f"Found {len(provider_files)} provider static file(s) in {STATIC_DIR}")
    if args.validate:
        reports = []
        for provider_file in provider_files:
            reports.append(
                validate_transport_static(
                    json.loads(provider_file.read_text()), provider_file.name
                )
            )
        report = merge_reports(*reports)
        if not provider_files:
            print("WARNING: no provider data exists; Phase 1 research is not complete")
        for warning in report.warnings:
            print(f"WARNING: {warning}")
        for error in report.errors:
            print(f"ERROR: {error}")
        return 0 if report.valid else 1

    # Phase 2 will cross-check provider verification, load stops/routes/schedules/fares,
    # and write database rows. Phase 0 intentionally provides preflight only.
    print("Preflight only: use --validate before the Phase 2 database importer is added.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
