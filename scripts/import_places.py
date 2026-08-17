"""Validate and import the canonical place data.

The source files are owned by Akriti; this module owns their deterministic load into
the database. Canonical ``lat``/``lon`` values map to PostGIS as
``POINT(lon lat)`` with SRID 4326. A verified place may have a NULL location when
both coordinates are intentionally unresolved.

Run from the repository root with::

    python scripts/import_places.py --validate
    python scripts/import_places.py --validate \
        --data-dir data/research/handoffs/places_v5.1/data/places

The database session and optional PostGIS value construction remain lazy so validation
and focused importer tests do not require a live database or optional PostGIS package.
The explicit ``--data-dir`` option allows a reviewed research handoff to be imported
without rewriting the handoff or silently replacing the repository's current source
projection.
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

_CATEGORY_FIELDS = frozenset({"id", "name", "description"})
_PLACE_FIELDS = frozenset(
    {
        "id",
        "name",
        "category",
        "lat",
        "lon",
        "description",
        "opening_hours",
        "avg_visit_minutes",
        "price_tier",
        "source",
        "source_provenance_note",
        "coordinate_verification",
        "coordinate_audit_status",
        "audit_status",
        "verified_at",
        "_comment",
    }
)


class ImportValidationError(ValueError):
    """Raised when source data cannot be safely imported."""


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
        display_name = _require_nonempty_string(record, "name", label)
        identifier = record.get("id", display_name)
        if not isinstance(identifier, str) or not identifier.strip():
            raise ImportValidationError(f"{label}.id must be a non-empty string")
        if identifier != identifier.strip():
            raise ImportValidationError(f"{label}.id must not have leading/trailing whitespace")
        if identifier in seen:
            raise ImportValidationError(f"{label} duplicates category id {identifier!r}")
        description = record.get("description")
        if description is not None and not isinstance(description, str):
            raise ImportValidationError(f"{label}.description must be a string or null")
        seen.add(identifier)
        validated.append(
            {"id": identifier, "name": display_name, "description": description}
        )
    return tuple(validated)


def _validate_coordinate(
    value: Any, field: str, label: str, minimum: float, maximum: float
) -> float | None:
    if value is None:
        return None
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
    seen: set[tuple[str, ...]] = set()
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
        research_id = record.get("id")
        if research_id is not None:
            research_id = _require_nonempty_string(record, "id", label)
        category = _require_nonempty_string(record, "category", label)
        if category not in category_names:
            raise ImportValidationError(
                f"{label}.category {category!r} is not present in categories.json"
            )
        if "lat" not in record or "lon" not in record:
            raise ImportValidationError(f"{label} requires both lat and lon fields")
        if (record["lat"] is None) != (record["lon"] is None):
            raise ImportValidationError(f"{label} requires both lat and lon or neither")
        lat = _validate_coordinate(record["lat"], "lat", label, -90.0, 90.0)
        lon = _validate_coordinate(record["lon"], "lon", label, -180.0, 180.0)

        for field in (
            "source_provenance_note",
            "coordinate_verification",
            "coordinate_audit_status",
            "audit_status",
        ):
            value = record.get(field)
            if value is not None and not isinstance(value, str):
                raise ImportValidationError(f"{label}.{field} must be a string or null")
        coordinate_audit_status = record.get("coordinate_audit_status")
        if lat is not None and lon is not None and coordinate_audit_status not in (None, "high"):
            raise ImportValidationError(
                f"{label}.coordinate_audit_status must be high for non-null coordinates"
            )

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

        identity = ("research_id", research_id) if research_id is not None else (
            "canonical", name, category, source
        )
        if identity in seen:
            raise ImportValidationError(
                f"{label} duplicates place identity (name, category, source)"
            )
        seen.add(identity)
        validated.append(
            {
                **record,
                "id": research_id,
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
    category_names = {record["id"] for record in validated_categories}
    validated_places = _validate_places(places, category_names)
    return ValidatedInput(validated_categories, validated_places)


def _load_models() -> tuple[type[Any], type[Any]]:
    """Load the canonical SQLAlchemy models only for a database import."""
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))
    # Import the model hub first. Importing Category directly would make
    # app.db.base import Category while Category is still being initialized.
    from app.db import base as _model_base  # noqa: F401
    from app.models.category import Category
    from app.models.place import Place

    return Category, Place


def _parse_verified_at(value: str | None) -> datetime | None:
    if value is None:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _build_location(record: dict[str, Any]) -> Any:
    """Build the approved PostGIS point without swapping latitude and longitude."""
    lat = record["lat"]
    lon = record["lon"]
    if lat is None and lon is None:
        return None

    try:
        from geoalchemy2.elements import WKTElement
    except ImportError as exc:
        raise ImportValidationError(
            "geoalchemy2 is required to build PostGIS place locations"
        ) from exc

    return WKTElement(f"POINT({lon} {lat})", srid=4326)


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
        identifier = record["id"]
        name = record["name"]
        category = _find_one(session, category_model, name=identifier)
        if category is None:
            category = category_model(
                name=identifier,
                display_name=name,
                description=record.get("description"),
            )
            session.add(category)
            created += 1
        else:
            if hasattr(category, "display_name"):
                category.display_name = name
            if hasattr(category, "description"):
                category.description = record.get("description")
        categories_by_name[identifier] = category
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

    ``location_builder`` is an optional test/integration hook. When omitted, the
    approved ``POINT(lon lat)`` Geography value is built here; an unresolved pair
    produces ``None``.
    """
    validated = validate_input(categories, places)

    if category_model is None or place_model is None:
        model_category, model_place = _load_models()
        category_model = category_model or model_category
        place_model = place_model or model_place

    # Build every location before the first session.add so a mapping failure cannot
    # leave categories or an earlier place partially written.
    place_values: list[tuple[dict[str, Any], Any]] = []
    builder = location_builder if location_builder is not None else _build_location
    for record in validated.places:
        location = builder(record)
        if location is None and (record["lat"] is not None or record["lon"] is not None):
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
                "research_id": record.get("id"),
                "name": record["name"],
                "category_id": category.id,
                "location": location,
                "description": record.get("description"),
                "opening_hours": record.get("opening_hours"),
                "avg_visit_minutes": record.get("avg_visit_minutes"),
                "price_tier": record.get("price_tier"),
                "source": record["source"],
                "verified_at": _parse_verified_at(record.get("verified_at")),
                "source_provenance_note": record.get("source_provenance_note"),
                "coordinate_verification": record.get("coordinate_verification"),
                "coordinate_audit_status": record.get("coordinate_audit_status"),
                "audit_status": record.get("audit_status"),
            }
            if values["research_id"] is not None:
                existing = _find_one(session, place_model, research_id=values["research_id"])
                if existing is None:
                    # Adopt a pre-v5.1 row with the same canonical identity rather
                    # than creating a duplicate when traceability is first added.
                    existing = _find_one(
                        session,
                        place_model,
                        name=values["name"],
                        category_id=values["category_id"],
                        source=values["source"],
                    )
            else:
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
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=DATA_DIR,
        help="directory containing categories.json and places.json",
    )
    args = parser.parse_args(argv)

    try:
        if args.data_dir == DATA_DIR:
            categories = load_categories()
            places = load_places()
        else:
            categories = load_categories(args.data_dir / "categories.json")
            places = load_places(args.data_dir / "places.json")
        validated = validate_input(categories, places)
    except ImportValidationError as exc:
        print(f"ERROR: {exc}")
        return 1

    print(
        f"Loaded {len(validated.categories)} categories, {len(validated.places)} places from {args.data_dir}"
    )
    if args.validate:
        print("Validation passed")
        return 0

    session = _open_session()
    try:
        result = import_records(session, categories, places)
    except Exception as exc:
        session.rollback()
        print(f"ERROR: database import failed: {exc}")
        return 1
    finally:
        session.close()
    print(
        f"Imported {result.categories_created} categories, "
        f"{result.places_created} new places, "
        f"{result.places_updated} updated places"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
