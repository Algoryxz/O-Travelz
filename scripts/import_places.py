"""
Import data/places/*.json into the database.

Owner: Smarak. Depends on Akriti's data (docs/team/AKRITI.md) and the models in
app.models.place / app.models.category.

Run: python scripts/import_places.py
"""
import json
import argparse
from pathlib import Path

from data_validation import merge_reports, validate_categories, validate_places

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "places"


def load_categories() -> list[dict]:
    return json.loads((DATA_DIR / "categories.json").read_text())


def load_places() -> list[dict]:
    return json.loads((DATA_DIR / "places.json").read_text())


def main() -> int:
    parser = argparse.ArgumentParser(description="Preflight or import place data.")
    parser.add_argument(
        "--validate",
        action="store_true",
        help="validate source data without opening a database or writing records",
    )
    args = parser.parse_args()
    categories = load_categories()
    places = load_places()
    print(f"Loaded {len(categories)} categories, {len(places)} places from {DATA_DIR}")
    if args.validate:
        report = merge_reports(validate_categories(categories), validate_places(places))
        for warning in report.warnings:
            print(f"WARNING: {warning}")
        for error in report.errors:
            print(f"ERROR: {error}")
        return 0 if report.valid else 1

    # Phase 2 will open a DB session, upsert categories, resolve category IDs, and
    # import only validated non-placeholder places. Phase 0 intentionally provides
    # the preflight entry point without implementing database writes.
    print("Preflight only: use --validate before the Phase 2 database importer is added.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
