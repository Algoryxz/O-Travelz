"""Validate and import canonical place and interest data.

The source files are owned by research/data curators; this module owns their
deterministic load into the database. Canonical ``lat``/``lon`` values map to PostGIS as
``POINT(lon lat)`` with SRID 4326. A verified place may have a NULL location when
both coordinates are intentionally unresolved. Normalized traveler-facing interests
are mapped M:N via the ``place_interests`` table.

Run from the repository root with::

    python scripts/import_places.py --validate
    python scripts/import_places.py --validate \
        --data-dir data/research/handoffs/places_v5.1/data/places

The database session and optional PostGIS value construction remain lazy so validation
and focused importer tests do not require a live database or optional PostGIS package.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Iterable
import uuid


DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "places"
BACKEND_DIR = DATA_DIR.parent.parent / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from app.core.regions import ODISHA_DISTRICTS, validate_district
except ImportError:
    ODISHA_DISTRICTS = frozenset({
        "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh",
        "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur",
        "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar",
        "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh",
        "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
    })
    def validate_district(d):
        return bool(d and d.strip().title() in ODISHA_DISTRICTS)

_CATEGORY_FIELDS = frozenset({"id", "name", "description"})
_INTEREST_FIELDS = frozenset({"id", "name", "description"})
_PLACE_FIELDS = frozenset(
    {
        "id",
        "name",
        "category",
        "lat",
        "lon",
        "description",
        "opening_hours",
        "opening_hours_source",
        "avg_visit_minutes",
        "price_tier",
        "rating",
        "rating_count",
        "rating_source",
        "interests",
        "source",
        "source_url",
        "source_provenance_note",
        "coordinate_verification",
        "coordinate_audit_status",
        "audit_status",
        "verification_status",
        "verified_at",
        "district",
        "contact_phone",
        "emergency_phone",
        "address",
        "_comment",
    }
)



class ImportValidationError(ValueError):
    """Raised when source data cannot be safely imported."""


@dataclass(frozen=True)
class ValidatedInput:
    categories: tuple[dict[str, Any], ...]
    places: tuple[dict[str, Any], ...]
    interests: tuple[dict[str, Any], ...] = ()


@dataclass(frozen=True)
class ImportResult:
    categories_created: int = 0
    places_created: int = 0
    places_updated: int = 0
    interests_created: int = 0
    place_interests_created: int = 0


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


def load_interests(path: Path | None = None) -> list[dict[str, Any]]:
    """Load the canonical interest JSON file if present."""
    target = path or DATA_DIR / "interests.json"
    if not target.exists():
        return []
    return _read_json_array(target, "interests")


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


def _validate_interests(records: Any) -> tuple[dict[str, Any], ...]:
    if records is None:
        return ()
    if not isinstance(records, list):
        raise ImportValidationError("interests must be a JSON array")

    validated: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, record in enumerate(records):
        label = f"interests[{index}]"
        if not isinstance(record, dict):
            raise ImportValidationError(f"{label} must be an object")
        _validate_unknown_fields(record, _INTEREST_FIELDS, label)
        display_name = _require_nonempty_string(record, "name", label)
        identifier = record.get("id", display_name)
        if not isinstance(identifier, str) or not identifier.strip():
            raise ImportValidationError(f"{label}.id must be a non-empty string")
        if identifier != identifier.strip():
            raise ImportValidationError(f"{label}.id must not have leading/trailing whitespace")
        if identifier in seen:
            raise ImportValidationError(f"{label} duplicates interest id {identifier!r}")
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


def _validate_places(
    records: Any,
    category_names: set[str],
    interest_names: set[str] | None = None,
    require_district: bool = False,
) -> tuple[dict[str, Any], ...]:
    if not isinstance(records, list):
        raise ImportValidationError("places must be a JSON array")

    validated: list[dict[str, Any]] = []
    seen: set[tuple[str, ...]] = set()
    seen_names_by_district: dict[str, set[str]] = defaultdict(set)
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
            "rating_source",
            "opening_hours_source",
            "source_url",
            "contact_phone",
            "emergency_phone",
            "address",
        ):
            value = record.get(field)
            if value is not None and not isinstance(value, str):
                raise ImportValidationError(f"{label}.{field} must be a string or null")
        coordinate_audit_status = record.get("coordinate_audit_status")
        if lat is not None and lon is not None and coordinate_audit_status not in (None, "high"):
            raise ImportValidationError(
                f"{label}.coordinate_audit_status must be high for non-null coordinates"
            )

        verification_status = record.get("verification_status")
        if verification_status is not None:
            if not isinstance(verification_status, str) or verification_status not in (
                "VERIFIED",
                "UNVERIFIED",
                "UNAVAILABLE",
            ):
                raise ImportValidationError(
                    f"{label}.verification_status must be 'VERIFIED', 'UNVERIFIED', 'UNAVAILABLE', or null"
                )

        rating = record.get("rating")
        if rating is not None:
            if (
                isinstance(rating, bool)
                or not isinstance(rating, (int, float))
                or not math.isfinite(float(rating))
                or float(rating) < 0.0
                or float(rating) > 5.0
            ):
                raise ImportValidationError(
                    f"{label}.rating must be a finite number between 0.0 and 5.0 or null"
                )

        rating_count = record.get("rating_count")
        if rating_count is not None:
            if (
                isinstance(rating_count, bool)
                or not isinstance(rating_count, int)
                or rating_count < 0
            ):
                raise ImportValidationError(
                    f"{label}.rating_count must be a non-negative integer or null"
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


        if lat is not None and lon is not None:
            if (80.0 <= lat <= 90.0) and (16.0 <= lon <= 25.0):
                raise ImportValidationError(f"{label} has obviously swapped lat/lon coordinates ({lat}, {lon})")
            if not (17.5 <= lat <= 22.8 and 81.2 <= lon <= 87.6):
                raise ImportValidationError(f"{label} coordinates ({lat}, {lon}) outside Odisha envelope")

        # Validate interests if present
        raw_interests = record.get("interests")
        validated_interests: list[str] = []
        if raw_interests is not None:
            if not isinstance(raw_interests, list):
                raise ImportValidationError(f"{label}.interests must be a list of strings")
            seen_place_interests: set[str] = set()
            for int_idx, interest_item in enumerate(raw_interests):
                int_label = f"{label}.interests[{int_idx}]"
                if not isinstance(interest_item, str) or not interest_item.strip():
                    raise ImportValidationError(f"{int_label} must be a non-empty string")
                norm_interest = interest_item.strip()
                if norm_interest in seen_place_interests:
                    raise ImportValidationError(f"{label} duplicates interest {norm_interest!r}")
                if interest_names is not None and interest_names and norm_interest not in interest_names:
                    raise ImportValidationError(
                        f"{int_label} {norm_interest!r} is not present in interests.json"
                    )
                seen_place_interests.add(norm_interest)
                validated_interests.append(norm_interest)

        identity = ("research_id", research_id) if research_id is not None else (
            "canonical", name, category, source
        )
        if identity in seen:
            raise ImportValidationError(
                f"{label} duplicates place identity (name, category, source)"
            )
        seen.add(identity)

        district = record.get("district")
        if district is not None:
            if not isinstance(district, str) or not validate_district(district):
                raise ImportValidationError(
                    f"{label}.district {district!r} is not a valid Odisha administrative district"
                )
            norm_dist = district.strip().title()
            norm_nm = name.strip().casefold()
            if norm_nm in seen_names_by_district[norm_dist]:
                raise ImportValidationError(
                    f"{label} duplicates place name {name!r} within district {norm_dist!r}"
                )
            seen_names_by_district[norm_dist].add(norm_nm)
        elif require_district:
            raise ImportValidationError(
                f"{label} requires a non-empty district"
            )

        # Medical & Transit strict domain validation
        if category in ("hospital", "emergency_facility"):
            if lat is None or lon is None:
                raise ImportValidationError(f"{label} medical facility requires valid coordinates")
            emer_ph = record.get("emergency_phone")
            if emer_ph is not None and isinstance(emer_ph, str):
                if re.match(r"^(0{4,}|1{4,}|9{8,}|1234567890|n/?a|none|null|tbd)$", emer_ph.strip(), re.I):
                    raise ImportValidationError(f"{label} has invalid/synthetic emergency_phone {emer_ph!r}")

        if category == "transit_hub":
            if lat is None or lon is None:
                raise ImportValidationError(f"{label} transit hub requires valid coordinates")
            if district is None:
                raise ImportValidationError(f"{label} transit hub requires a non-empty district")

        validated.append(
            {
                **record,
                "id": research_id,
                "name": name,
                "category": category,
                "lat": lat,
                "lon": lon,
                "interests": tuple(validated_interests),
                "source": source,
            }
        )
    return tuple(validated)


def validate_input(
    categories: Any,
    places: Any,
    interests: Any = None,
    require_district: bool = False,
) -> ValidatedInput:
    """Validate all source data before a session or database write is attempted."""
    validated_categories = _validate_categories(categories)
    category_names = {record["id"] for record in validated_categories}
    validated_interests = _validate_interests(interests) if interests is not None else ()
    interest_names = {record["id"] for record in validated_interests} if validated_interests else set()
    validated_places = _validate_places(
        places,
        category_names,
        interest_names if interest_names else None,
        require_district=require_district,
    )
    return ValidatedInput(validated_categories, validated_places, validated_interests)


def _load_models() -> tuple[type[Any], type[Any], type[Any], type[Any]]:
    """Load canonical SQLAlchemy models for database operations."""
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))
    from app.db import base as _model_base  # noqa: F401
    from app.models.category import Category
    from app.models.place import Place
    from app.models.interest import Interest, PlaceInterest

    return Category, Place, Interest, PlaceInterest


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
    if category_model is None:
        category_model = _load_models()[0]
    validated = _validate_categories(list(records))
    categories_by_name: dict[str, Any] = {}
    created = 0
    for record in sorted(validated, key=lambda item: item["name"]):
        identifier = record["id"]
        name = record["name"]
        category = _find_one(session, category_model, name=identifier)
        if category is None:
            kwargs = {
                "name": identifier,
                "display_name": name,
                "description": record.get("description"),
            }
            if getattr(category_model, "__tablename__", None):
                kwargs["id"] = uuid.uuid5(uuid.NAMESPACE_DNS, f"otravelz.category.{identifier}")
            category = category_model(**kwargs)
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


def import_interests(
    session: Any,
    records: Iterable[dict[str, Any]],
    *,
    interest_model: type[Any] | None = None,
) -> tuple[dict[str, Any], int]:
    """Upsert interests in stable name order and return name-to-row mappings."""
    if interest_model is None:
        interest_model = _load_models()[2]
    validated = _validate_interests(list(records))
    interests_by_name: dict[str, Any] = {}
    created = 0
    for record in sorted(validated, key=lambda item: item["name"]):
        identifier = record["id"]
        name = record["name"]
        interest = _find_one(session, interest_model, name=identifier)
        if interest is None:
            kwargs = {
                "name": identifier,
                "display_name": name,
                "description": record.get("description"),
            }
            if getattr(interest_model, "__tablename__", None):
                kwargs["id"] = uuid.uuid5(uuid.NAMESPACE_DNS, f"otravelz.interest.{identifier}")
            interest = interest_model(**kwargs)
            session.add(interest)
            created += 1
        else:
            if hasattr(interest, "display_name"):
                interest.display_name = name
            if hasattr(interest, "description"):
                interest.description = record.get("description")
        interests_by_name[identifier] = interest
    session.flush()
    return interests_by_name, created


def import_records(
    session: Any,
    categories: Any,
    places: Any,
    *,
    interests: Any = None,
    location_builder: Callable[[dict[str, Any]], Any] | None = None,
    category_model: type[Any] | None = None,
    place_model: type[Any] | None = None,
    interest_model: type[Any] | None = None,
    place_interest_model: type[Any] | None = None,
) -> ImportResult:
    """Validate and upsert categories, interests, places, and associations in one transaction."""
    validated = validate_input(categories, places, interests)

    if category_model is None or place_model is None or interest_model is None or place_interest_model is None:
        model_cat, model_place, model_interest, model_pi = _load_models()
        category_model = category_model or model_cat
        place_model = place_model or model_place
        interest_model = interest_model or model_interest
        place_interest_model = place_interest_model or model_pi

    # Build every location before any session.add
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
        interests_by_name: dict[str, Any] = {}
        interest_count = 0
        if validated.interests:
            interests_by_name, interest_count = import_interests(
                session, validated.interests, interest_model=interest_model
            )

        place_count = 0
        place_updates = 0
        place_interests_created = 0

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
                "opening_hours_source": record.get("opening_hours_source"),
                "avg_visit_minutes": record.get("avg_visit_minutes"),
                "price_tier": record.get("price_tier"),
                "rating": float(record["rating"]) if record.get("rating") is not None else None,
                "rating_count": record.get("rating_count"),
                "rating_source": record.get("rating_source"),
                "source": record["source"],
                "source_url": record.get("source_url"),
                "verified_at": _parse_verified_at(record.get("verified_at")),
                "verification_status": record.get("verification_status"),
                "source_provenance_note": record.get("source_provenance_note"),
                "coordinate_verification": record.get("coordinate_verification"),
                "coordinate_audit_status": record.get("coordinate_audit_status"),
                "audit_status": record.get("audit_status"),
                "district": record.get("district"),
                "contact_phone": record.get("contact_phone"),
                "emergency_phone": record.get("emergency_phone"),
                "address": record.get("address"),
            }

            existing = None
            if values["research_id"] is not None:
                existing = _find_one(session, place_model, research_id=values["research_id"])
            if existing is None:
                existing = _find_one(
                    session,
                    place_model,
                    name=values["name"],
                    category_id=values["category_id"],
                    source=values["source"],
                )

            place_instance = existing
            if place_instance is None:
                if values.get("research_id") and getattr(place_model, "__tablename__", None):
                    values["id"] = uuid.uuid5(uuid.NAMESPACE_DNS, f"otravelz.place.{values['research_id']}")
                place_instance = place_model(**values)
                session.add(place_instance)
                place_count += 1
            else:
                for field, value in values.items():
                    setattr(place_instance, field, value)
                place_updates += 1

            session.flush()

            # Upsert place_interests if interests were provided
            place_interest_tags = record.get("interests", ())
            if place_interest_tags and interests_by_name:
                for tag in place_interest_tags:
                    interest_obj = interests_by_name.get(tag)
                    if interest_obj is not None:
                        existing_pi = _find_one(
                            session,
                            place_interest_model,
                            place_id=place_instance.id,
                            interest_id=interest_obj.id,
                        )
                        if existing_pi is None:
                            session.add(
                                place_interest_model(
                                    place_id=place_instance.id,
                                    interest_id=interest_obj.id,
                                )
                            )
                            place_interests_created += 1

        session.flush()
        session.commit()
    except Exception:
        session.rollback()
        raise

    return ImportResult(
        categories_created=category_count,
        places_created=place_count,
        places_updated=place_updates,
        interests_created=interest_count,
        place_interests_created=place_interests_created,
    )


def _open_session() -> Any:
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))
    from app.db.session import SessionLocal

    return SessionLocal()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate or import place and interest data.")
    parser.add_argument(
        "--validate",
        action="store_true",
        help="validate source data without opening a database or writing records",
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=DATA_DIR,
        help="directory containing categories.json, places.json, and optional interests.json",
    )
    args = parser.parse_args(argv)

    try:
        if args.data_dir == DATA_DIR:
            categories = load_categories()
            places = load_places()
            interests = load_interests()
        else:
            categories_file = args.data_dir / "categories.json"
            places_file = args.data_dir / "places.json"
            interests_file = args.data_dir / "interests.json"
            categories = load_categories(categories_file) if categories_file.exists() else []
            places = load_places(places_file) if places_file.exists() else []
            interests = load_interests(interests_file) if interests_file.exists() else []

        require_district = (args.data_dir.resolve() == DATA_DIR.resolve())
        validated = validate_input(categories, places, interests, require_district=require_district)
    except ImportValidationError as exc:
        print(f"ERROR: {exc}")
        return 1

    print(
        f"Loaded {len(validated.categories)} categories, {len(validated.interests)} interests, {len(validated.places)} places from {args.data_dir}"
    )
    if args.validate:
        print("Validation passed")
        return 0

    session = _open_session()
    try:
        result = import_records(session, categories, places, interests=interests)
    except Exception as exc:
        session.rollback()
        print(f"ERROR: database import failed: {exc}")
        return 1
    finally:
        session.close()
    print(
        f"Imported {result.categories_created} categories, "
        f"{result.interests_created} interests, "
        f"{result.places_created} new places, "
        f"{result.places_updated} updated places, "
        f"{result.place_interests_created} place-interest associations"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
