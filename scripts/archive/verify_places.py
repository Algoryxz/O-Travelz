"""Verify a place import against a reviewed source bundle.

This is read-only. It emits JSON evidence and exits non-zero when database counts,
provenance, category references, NULL-coordinate semantics, or PostGIS point values
do not match the supplied source bundle.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from sqlalchemy import text

SCRIPTS_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPTS_DIR.parent / "backend"
DATA_DIR = SCRIPTS_DIR.parent / "data" / "places"

if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from import_places import load_categories, load_places, validate_input  # noqa: E402


def _scalar(session: Any, sql: str) -> Any:
    return session.execute(text(sql)).scalar_one()


def verify_places(session: Any, source_dir: Path) -> dict[str, Any]:
    validated = validate_input(
        load_categories(source_dir / "categories.json"),
        load_places(source_dir / "places.json"),
    )
    evidence: dict[str, Any] = {
        "source_places": len(validated.places),
        "source_categories": len(validated.categories),
        "source_null_coordinates": sum(record["lat"] is None for record in validated.places),
        "database_places": _scalar(session, "SELECT COUNT(*) FROM places"),
        "database_categories": _scalar(session, "SELECT COUNT(*) FROM categories"),
        "database_null_coordinates": _scalar(
            session, "SELECT COUNT(*) FROM places WHERE location IS NULL"
        ),
        "missing_source": _scalar(
            session, "SELECT COUNT(*) FROM places WHERE source IS NULL OR btrim(source) = ''"
        ),
        "missing_verified_at": _scalar(
            session, "SELECT COUNT(*) FROM places WHERE verified_at IS NULL"
        ),
        "placeholder_records": _scalar(
            session,
            "SELECT COUNT(*) FROM places WHERE lower(name) LIKE '%replace me%' "
            "OR source LIKE 'REQUIRED%'",
        ),
        "duplicate_research_ids": _scalar(
            session,
            "SELECT COUNT(*) FROM (SELECT research_id FROM places "
            "WHERE research_id IS NOT NULL GROUP BY research_id HAVING COUNT(*) > 1) duplicates",
        ),
        "duplicate_canonical_records": _scalar(
            session,
            "SELECT COUNT(*) FROM (SELECT name, category_id, source FROM places "
            "GROUP BY name, category_id, source HAVING COUNT(*) > 1) duplicates",
        ),
        "orphan_category_references": _scalar(
            session,
            "SELECT COUNT(*) FROM places p LEFT JOIN categories c ON c.id = p.category_id "
            "WHERE c.id IS NULL",
        ),
        "invalid_spatial_rows": _scalar(
            session,
            "SELECT COUNT(*) FROM places WHERE location IS NOT NULL AND "
            "(ST_SRID(location::geometry) <> 4326 OR GeometryType(location::geometry) <> 'POINT' "
            "OR NOT (ST_X(location::geometry) BETWEEN -180 AND 180) "
            "OR NOT (ST_Y(location::geometry) BETWEEN -90 AND 90))",
        ),
    }

    coordinate_mismatches: list[str] = []
    for record in validated.places:
        if record.get("id") is not None:
            row = session.execute(
                text(
                    "SELECT ST_SRID(location::geometry), ST_X(location::geometry), "
                    "ST_Y(location::geometry) FROM places WHERE research_id = :research_id"
                ),
                {"research_id": record["id"]},
            ).one_or_none()
        else:
            row = session.execute(
                text(
                    "SELECT ST_SRID(location::geometry), ST_X(location::geometry), "
                    "ST_Y(location::geometry) FROM places "
                    "WHERE name = :name AND source = :source"
                ),
                {"name": record["name"], "source": record["source"]},
            ).one_or_none()
        if row is None:
            coordinate_mismatches.append(f"missing database row: {record['name']}")
            continue
        srid, x, y = row
        if record["lat"] is None:
            if any(value is not None for value in (srid, x, y)):
                coordinate_mismatches.append(f"expected NULL location: {record['name']}")
        elif srid != 4326 or abs(float(x) - record["lon"]) > 1e-9 or abs(float(y) - record["lat"]) > 1e-9:
            coordinate_mismatches.append(f"POINT(lon lat) mismatch: {record['name']}")
    evidence["coordinate_mismatches"] = coordinate_mismatches
    evidence["category_reference_check"] = "foreign-key-enforced"
    evidence["issues"] = [
        key
        for key, value in evidence.items()
        if key not in {"issues", "coordinate_mismatches"}
        and isinstance(value, int)
        and (
            (key == "database_null_coordinates" and value != evidence["source_null_coordinates"])
            or (key.startswith("database_") and key.endswith("places") and value != evidence["source_places"])
            or (key.startswith("database_") and key.endswith("categories") and value != evidence["source_categories"])
            or (
                key in {
                    "missing_source",
                    "missing_verified_at",
                    "placeholder_records",
                    "duplicate_research_ids",
                    "duplicate_canonical_records",
                    "orphan_category_references",
                    "invalid_spatial_rows",
                }
                and value != 0
            )
        )
    ]
    if coordinate_mismatches:
        evidence["issues"].append("coordinate_mismatches")
    evidence["valid"] = not evidence["issues"]
    return evidence


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Verify imported place records.")
    parser.add_argument("--data-dir", type=Path, default=DATA_DIR)
    args = parser.parse_args(argv)
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))
    from app.db.session import SessionLocal

    session = SessionLocal()
    try:
        evidence = verify_places(session, args.data_dir)
    finally:
        session.close()
    print(json.dumps(evidence, indent=2, sort_keys=True))
    return 0 if evidence["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
