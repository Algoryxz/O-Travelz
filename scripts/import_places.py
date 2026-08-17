"""Validate and import the canonical place data.

The source files are owned by Akriti; this module owns their deterministic load into
the database. The importer deliberately does not choose a meaning for the source
``lat``/``lon`` fields because the canonical documents still record the mapping to the
model's PostGIS ``location`` field as an OPEN DECISION.

Run from the repository root with::

    python scripts/import_places.py --validate

The full database import remains guarded until the coordinate mapping is approved.
Call :func:`import_records` with an explicitly approved ``location_builder`` once that
decision exists. The database session and model imports are kept lazy so validation
and focused importer tests do not require a live database or optional PostGIS package.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Iterable

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "places"
BACKEND_DIR = DATA_DIR.parent.parent / "backend"

_CATEGORY_FIELDS = frozenset({"name"})
_PLACE_FIELDS = frozenset(
    {
        "name",
        "category",
        "lat",
        "lon",
        "description",
        "opening_hours",
        "avg_visit_minutes",
        "price_tier",
        "source",
        "verified_at",
        "_comment",
    }
)


class ImportValidationError(ValueError):
    """Raised when source data cannot be safely imported."""


class LocationMappingDecisionRequired(RuntimeError):
    """Raised until the canonical lat/lon-to-PostGIS mapping is approved."""


@dataclass(frozen=True)
class ValidatedInput:
    categories: tuple[dict[str, Any], ...]
    places: tuple[dict[str, Any], ...]


@dataclass(frozen=True)
class ImportResult:
    categories_created: int = 0
    places_created: int = 0
    places_updated: int = 0


def _read_json_array(path: Path, label: str) -> list[dict[str, Any]]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ImportValidationError(f"could not load {label} from {path}: {exc}") from exc
    if not isinstance(value, list):
        raise ImportValidationError(f"{label} must be a JSON array")
    return value


def load_categories(path: Path | None = None) -> list[dict[str, Any]]:
    """Load the canonical category JSON file."""
    return _read_json_array(path or DATA_DIR / "categories.json", "categories")


def load_places(path: Path | None = None) -> list[dict[str, Any]]:
    """Load the canonical place JSON file."""
    return _read_json_array(path or DATA_DIR / "places.json", "places")


def _require_nonempty_string(record: dict[str, Any], field: str, label: str) -> str:
    value = record.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ImportValidationError(f"{label}.{field} must be a non-empty string")
    if value != value.strip():
        raise ImportValidationError(f"{label}.{field} must not have leading/trailing whitespace")
    return value


def _validate_unknown_fields(record: dict[str, Any], allowed: frozenset[str], label: str) -> None:
    unknown = sorted(set(record) - allowed)
    if unknown:
        raise ImportValidationError(f"{label} has unsupported fields: {', '.join(unknown)}")


def _validate_categories(records: Any) -> tuple[dict[str, Any], ...]:
    if not isinstance(records, list):
        raise ImportValidationError("categories must be a JSON array")

    validated: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, record in enumerate(records):
        label = f"categories[{index}]"
        if not isinstance(record, dict):
            raise ImportValidationError(f"{label} must be an object")
        _validate_unknown_fields(record, _CATEGORY_FIELDS, label)
        name = _require_nonempty_string(record, "name", label)
        if name in seen:
            raise ImportValidationError(f"{label} duplicates category name {name!r}")
        seen.add(name)
        validated.append({"name": name})
    return tuple(validated)


def _validate_coordinate(value: Any, field: str, label: str, minimum: float, maximum: float) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ImportValidationError(f"{label}.{field} must be a number")
    number = float(value)
    if not math.isfinite(number) or not minimum <= number <= maximum:
        raise ImportValidationError(
            f"{label}.{field} must be finite and between {minimum} and {maximum}"
        )
    return number


def _validate_verified_at(value: Any, label: str) -> None:
    if value is None:
        return
    if not isinstance(value, str) or not value.strip():
        raise ImportValidationError(f"{label}.verified_at must be an ISO datetime string or null")
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ImportValidationError(f"{label}.verified_at must be an ISO datetime string") from exc


def _validate_json_value(value: Any, field: str, label: str) -> None:
    try:
        json.dumps(value)
    except (TypeError, ValueError) as exc:
        raise ImportValidationError(f"{label}.{field} must be JSON-serializable") from exc


def _validate_places(records: Any, category_names: set[str]) -> tuple[dict[str, Any], ...]:
    if not isinstance(records, list):
        raise ImportValidationError("places must be a JSON array")

    validated: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str]] = set()
    for index, record in enumerate(records):
        label = f"places[{index}]"
        if not isinstance(record, dict):
            raise ImportValidationError(f"{label} must be an object")
        if "_comment" in record:
            raise ImportValidationError(
                f"{label} is an explicit example/placeholder and cannot be imported"
            )
        _validate_unknown_fields(record, _PLACE_FIELDS, label)

        name = _require_nonempty_string(record, "name", label)
        category = _require_nonempty_string(record, "category", label)
        if category not in category_names:
            raise ImportValidationError(
                f"{label}.category {category!r} is not present in categories.json"
            )
        lat = _validate_coordinate(record.get("lat"), "lat", label, -90.0, 90.0)
        lon = _validate_coordinate(record.get("lon"), "lon", label, -180.0, 180.0)

        source = _require_nonempty_string(record, "source", label)
        if source == "REQUIRED" or source.startswith("REQUIRED:"):
            raise ImportValidationError(f"{label}.source must contain a real source")
        if "replace me" in name.lower():
            raise ImportValidationError(f"{label} is an example/placeholder and cannot be imported")

        description = record.get("description")
        if description is not None and not isinstance(description, str):
            raise ImportValidationError(f"{label}.description must be a string or null")
        opening_hours = record.get("opening_hours")
        _validate_json_value(opening_hours, "opening_hours", label)
        avg_visit_minutes = record.get("avg_visit_minutes")
        if avg_visit_minutes is not None and (
            isinstance(avg_visit_minutes, bool)
            or not isinstance(avg_visit_minutes, int)
            or avg_visit_minutes <= 0
        ):
            raise ImportValidationError(f"{label}.avg_visit_minutes must be a positive integer or null")
        price_tier = record.get("price_tier")
        if price_tier is not None and not isinstance(price_tier, str):
            raise ImportValidationError(f"{label}.price_tier must be a string or null")
        _validate_verified_at(record.get("verified_at"), label)

        identity = (name, category, source)
        if identity in seen:
            raise ImportValidationError(
                f"{label} duplicates place identity (name, category, source)"
            )
        seen.add(identity)
        validated.append(
            {
                **record,
                "name": name,
                "category": category,
                "lat": lat,
                "lon": lon,
                "source": source,
            }
        )
    return tuple(validated)


def validate_input(categories: Any, places: Any) -> ValidatedInput:
    """Validate all source data before a session or database write is attempted."""
    validated_categories = _validate_categories(categories)
    category_names = {record["name"] for record in validated_categories}
    validated_places = _validate_places(places, category_names)
    return ValidatedInput(validated_categories, validated_places)


def _load_models() -> tuple[type[Any], type[Any]]:
    """Load the canonical SQLAlchemy models only for a database import."""
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))
    from app.models.category import Category
    from app.models.place import Place

    return Category, Place


def _parse_verified_at(value: str | None) -> datetime | None:
    if value is None:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _find_one(session: Any, model: type[Any], **filters: Any) -> Any | None:
    return session.query(model).filter_by(**filters).one_or_none()


def import_categories(
    session: Any,
    records: Iterable[dict[str, Any]],
    *,
    category_model: type[Any] | None = None,
) -> tuple[dict[str, Any], int]:
    """Upsert categories in stable name order and return name-to-row mappings."""
    category_model = category_model or _load_models()[0]
    validated = _validate_categories(list(records))
    categories_by_name: dict[str, Any] = {}
    created = 0
    for record in sorted(validated, key=lambda item: item["name"]):
        name = record["name"]
        category = _find_one(session, category_model, name=name)
        if category is None:
            category = category_model(name=name)
            session.add(category)
            created += 1
        categories_by_name[name] = category
    session.flush()
    return categories_by_name, created


def import_records(
    session: Any,
    categories: Any,
    places: Any,
    *,
    location_builder: Callable[[dict[str, Any]], Any] | None = None,
    category_model: type[Any] | None = None,
    place_model: type[Any] | None = None,
) -> ImportResult:
    """Validate and upsert categories and places in one transaction.

    ``location_builder`` is intentionally mandatory for place persistence in the
    current project state. It must be supplied by the approved coordinate mapping
    decision; this importer does not assume that ``(lon, lat)`` is the canonical
    representation for the model's PostGIS field.
    """
    validated = validate_input(categories, places)
    if validated.places and location_builder is None:
        raise LocationMappingDecisionRequired(
            "Cannot import places: the canonical lat/lon to PostGIS location mapping "
            "is an OPEN DECISION in docs/ARCHITECTURE.md; approve it before supplying "
            "a location_builder"
        )

    if category_model is None or place_model is None:
        model_category, model_place = _load_models()
        category_model = category_model or model_category
        place_model = place_model or model_place

    # Build every location before the first session.add so a mapping failure cannot
    # leave categories or an earlier place partially written.
    place_values: list[tuple[dict[str, Any], Any]] = []
    if location_builder is not None:
        for record in validated.places:
            location = location_builder(record)
            if location is None:
                raise ImportValidationError(
                    f"location_builder returned no location for {record['name']!r}"
                )
            place_values.append((record, location))

    try:
        categories_by_name, category_count = import_categories(
            session, validated.categories, category_model=category_model
        )
        place_count = 0
        place_updates = 0
        for record, location in sorted(
            place_values,
            key=lambda item: (item[0]["category"], item[0]["name"], item[0]["source"]),
        ):
            category = categories_by_name[record["category"]]
            values = {
                "name": record["name"],
                "category_id": category.id,
                "location": location,
                "description": record.get("description"),
                "opening_hours": record.get("opening_hours"),
                "avg_visit_minutes": record.get("avg_visit_minutes"),
                "price_tier": record.get("price_tier"),
                "source": record["source"],
                "verified_at": _parse_verified_at(record.get("verified_at")),
            }
            existing = _find_one(
                session,
                place_model,
                name=values["name"],
                category_id=values["category_id"],
                source=values["source"],
            )
            if existing is None:
                session.add(place_model(**values))
                place_count += 1
            else:
                for field, value in values.items():
                    setattr(existing, field, value)
                place_updates += 1
        session.flush()
        session.commit()
    except Exception:
        session.rollback()
        raise
    return ImportResult(category_count, place_count, place_updates)


def _open_session() -> Any:
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))
    from app.db.session import SessionLocal

    return SessionLocal()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate or import place data.")
    parser.add_argument(
        "--validate",
        action="store_true",
        help="validate source data without opening a database or writing records",
    )
    args = parser.parse_args(argv)

    try:
        categories = load_categories()
        places = load_places()
        validated = validate_input(categories, places)
    except ImportValidationError as exc:
        print(f"ERROR: {exc}")
        return 1

    print(
        f"Loaded {len(validated.categories)} categories, {len(validated.places)} places from {DATA_DIR}"
    )
    if args.validate:
        print("Validation passed")
        return 0

    if validated.places:
        print(
            "ERROR: Cannot import places until the canonical lat/lon to PostGIS "
            "location mapping OPEN DECISION is approved"
        )
        return 1

    # This branch is intentionally only useful for a categories-only source file. It
    # still uses the project's SessionLocal infrastructure and transaction boundary.
    session = _open_session()
    try:
        _, created = import_categories(session, validated.categories)
        session.commit()
    except Exception as exc:
        session.rollback()
        print(f"ERROR: database import failed: {exc}")
        return 1
    finally:
        session.close()
    print(f"Imported {created} new categories")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
