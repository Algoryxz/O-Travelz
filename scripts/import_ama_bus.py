"""Import adapter for the corrected AMA Bus Phase 1 research handoff.

This module is deliberately separate from ``import_transport.py``.  The handoff's
filenames and schemas are explicit, and its unresolved research records are not
silently converted into production stop identities.
"""
from __future__ import annotations

import csv
import hashlib
import json
import re
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Any, Callable

try:
    from geoalchemy2.elements import WKTElement
except ImportError:  # pragma: no cover - the declared dependency is required by the app
    WKTElement = None


class AMABusImportError(ValueError):
    """The handoff is malformed, ambiguous, or violates its research boundary."""


BQS_FILE = "AMA_BUS_BQS_FINAL_RECONCILIATION_2026-08-17.csv"
SCHEDULE_FILE = "AMA_BUS_SCHEDULE_NORMALIZED_2026-08-01.json"
PRIMARY_SCHEDULE_FILE = "ama_bus_schedule_primary_2026-08-01.json"
SCHEDULE_GROUPS_FILE = "AMA_BUS_SCHEDULE_GROUPS_FINAL_2026-08-01.csv"
ROUTE12_FILE = "ama_bus_route12_primary_ordered_stop_extraction.csv"
MANIFEST_FILE = "FINAL_MANIFEST.json"
SHA_FILE = "SHA256SUMS.txt"
QA_FILE = "QA_CHECKS_2026-08-17.csv"

EXPECTED_BQS_HEADERS = {
    "bqs_record_id", "bqs_index", "published_name", "latitude", "longitude",
    "coordinate_status", "canonical_stop_id", "current_march_2026_match",
    "reconciliation_status", "primary_source", "effective_date", "notes",
    "verification_date",
}
EXPECTED_ROUTE12_HEADERS = {
    "route_id", "route_number", "direction", "stop_sequence", "published_stop_name",
    "canonical_candidate", "source", "source_page", "verification_date",
}


@dataclass(frozen=True)
class AMABusImportResult:
    created_provider: int
    created_provider_sources: int
    created_stops: int
    created_routes: int
    created_schedule_groups: int
    departure_times: int
    unresolved_records: tuple[dict[str, str], ...]
    unresolved_route_stop_rows: int


@dataclass(frozen=True)
class AMABusPackage:
    directory: Path
    manifest: dict[str, Any]
    bqs_records: tuple[dict[str, Any], ...]
    schedule: dict[str, Any]
    schedule_groups: tuple[dict[str, Any], ...]
    route12_rows: tuple[dict[str, Any], ...]


def _read_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise AMABusImportError(f"cannot read JSON {path.name}: {exc}") from exc
    if not isinstance(value, dict):
        raise AMABusImportError(f"{path.name} must contain a JSON object")
    return value


def _read_csv(path: Path, expected_headers: set[str]) -> list[dict[str, str]]:
    try:
        with path.open(newline="", encoding="utf-8-sig") as handle:
            reader = csv.DictReader(handle)
            headers = set(reader.fieldnames or [])
            if headers != expected_headers:
                raise AMABusImportError(
                    f"{path.name} has schema {sorted(headers)!r}; expected {sorted(expected_headers)!r}"
                )
            return list(reader)
    except OSError as exc:
        raise AMABusImportError(f"cannot read CSV {path.name}: {exc}") from exc


def _require_files(directory: Path) -> None:
    required = (BQS_FILE, SCHEDULE_FILE, PRIMARY_SCHEDULE_FILE, SCHEDULE_GROUPS_FILE,
                ROUTE12_FILE, MANIFEST_FILE, SHA_FILE, QA_FILE)
    missing = [name for name in required if not (directory / name).is_file()]
    if missing:
        raise AMABusImportError(f"AMA Bus package is missing required files: {missing}")


def _verify_manifest(directory: Path) -> dict[str, Any]:
    manifest = _read_json(directory / MANIFEST_FILE)
    try:
        checksums = (directory / SHA_FILE).read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        raise AMABusImportError(f"cannot read {SHA_FILE}: {exc}") from exc
    expected: dict[str, str] = {}
    for line in checksums:
        parts = line.split(maxsplit=1)
        if len(parts) != 2 or len(parts[0]) != 64:
            raise AMABusImportError(f"malformed checksum line: {line!r}")
        expected[parts[1].lstrip("* ")] = parts[0].lower()
    for name, digest in expected.items():
        path = directory / name
        if not path.is_file():
            raise AMABusImportError(f"checksum references missing file {name!r}")
        actual = hashlib.sha256(path.read_bytes()).hexdigest()
        if actual != digest:
            raise AMABusImportError(f"checksum mismatch for {name!r}")
    if len(expected) != 13:
        raise AMABusImportError(f"expected 13 checksum entries, found {len(expected)}")
    return manifest


def _parse_optional_float(value: str, field: str, record_id: str) -> float | None:
    if value == "":
        return None
    try:
        return float(value)
    except ValueError as exc:
        raise AMABusImportError(f"{record_id}: {field} is not numeric") from exc


def _parse_date(value: str, field: str, identity: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise AMABusImportError(f"{identity}: invalid {field} {value!r}") from exc


def _validate_bqs(rows: list[dict[str, str]]) -> tuple[dict[str, Any], ...]:
    if len(rows) != 83:
        raise AMABusImportError(f"expected 83 BQS records, found {len(rows)}")
    seen_research: set[str] = set()
    seen_canonical: set[str] = set()
    result: list[dict[str, Any]] = []
    for row in rows:
        identity = row["bqs_record_id"]
        if not identity or identity in seen_research:
            raise AMABusImportError(f"duplicate or blank BQS research ID {identity!r}")
        seen_research.add(identity)
        canonical = row["canonical_stop_id"] or None
        if canonical and canonical in seen_canonical:
            raise AMABusImportError(f"duplicate canonical stop ID {canonical!r}")
        if canonical:
            seen_canonical.add(canonical)
        lat = _parse_optional_float(row["latitude"], "latitude", identity)
        lon = _parse_optional_float(row["longitude"], "longitude", identity)
        if (lat is None) != (lon is None):
            raise AMABusImportError(f"{identity}: latitude/longitude must be paired")
        if lat is not None and not -90 <= lat <= 90:
            raise AMABusImportError(f"{identity}: latitude out of range")
        if lon is not None and not -180 <= lon <= 180:
            raise AMABusImportError(f"{identity}: longitude out of range")
        if row["coordinate_status"] == "unresolved" and (lat is not None or lon is not None):
            raise AMABusImportError(f"{identity}: unresolved coordinate status has coordinates")
        status = row["reconciliation_status"]
        if status in {"BQS_MATCH_PRIMARY", "BQS_MATCH_NORMALIZED"} and not canonical:
            raise AMABusImportError(f"{identity}: confirmed reconciliation lacks canonical_stop_id")
        if status not in {
            "BQS_MATCH_PRIMARY", "BQS_MATCH_NORMALIZED",
            "NEAR_VARIANT_REQUIRES_IDENTITY_CONFIRMATION",
            "NOT_EVIDENCED_IN_PRIMARY_STOPPAGE_SOURCE",
        }:
            raise AMABusImportError(f"{identity}: unsupported reconciliation status {status!r}")
        result.append({
            **row,
            "latitude_value": lat,
            "longitude_value": lon,
            "canonical_stop_id_value": canonical,
            "effective_date_value": _parse_date(row["effective_date"], "effective_date", identity),
            "verification_date_value": _parse_date(row["verification_date"], "verification_date", identity),
        })
    if len(seen_canonical) != 72:
        raise AMABusImportError(f"expected 72 canonical stop IDs, found {len(seen_canonical)}")
    return tuple(result)


def _validate_times(value: Any, identity: str, field: str) -> list[str]:
    if not isinstance(value, list) or not value or not all(isinstance(item, str) for item in value):
        raise AMABusImportError(f"{identity}: {field} must be a non-empty list of strings")
    for item in value:
        if not re.fullmatch(r"\d{1,2}:\d{2}", item):
            raise AMABusImportError(f"{identity}: invalid time {item!r} in {field}")
        hour, minute = (int(part) for part in item.split(":", 1))
        if hour > 23 or minute > 59:
            raise AMABusImportError(f"{identity}: invalid time {item!r} in {field}")
    return value


def _validate_schedule(schedule: dict[str, Any], primary: dict[str, Any], groups: list[dict[str, str]]) -> tuple[dict[str, Any], ...]:
    required = {"provider", "mode", "effective_from", "source", "verified_on", "data_tier", "route_count", "routes"}
    if set(schedule) < required or schedule["provider"] != "AMA Bus / Mo Bus" or schedule["data_tier"] != "scheduled":
        raise AMABusImportError("normalized schedule has unexpected provider/tier/schema")
    if schedule["route_count"] != 95 or len(schedule["routes"]) != 95:
        raise AMABusImportError("expected 95 AMA Bus schedule routes")
    if primary.get("route_count") != 95 or len(primary.get("routes", [])) != 95:
        raise AMABusImportError("primary schedule does not contain 95 routes")
    if {route.get("route") for route in primary["routes"]} != {
        route.get("route") for route in schedule["routes"]
    }:
        raise AMABusImportError("primary and normalized schedules contain different route identities")
    group_rows: list[dict[str, Any]] = []
    seen_routes: set[str] = set()
    seen_groups: set[tuple[str, str]] = set()
    total_times = 0
    for route in schedule["routes"]:
        for field in ("route", "route_name", "source_page", "effective_from", "data_tier", "source", "schedule_groups"):
            if field not in route:
                raise AMABusImportError(f"route is missing {field}")
        route_id = route["route"]
        if route_id in seen_routes:
            raise AMABusImportError(f"duplicate route {route_id!r}")
        seen_routes.add(route_id)
        for group in route["schedule_groups"]:
            label = group.get("label")
            key = (route_id, label)
            if not label or key in seen_groups:
                raise AMABusImportError(f"duplicate or blank schedule group {key!r}")
            seen_groups.add(key)
            source_order = _validate_times(group.get("departure_times_source_order"), f"{route_id}/{label}", "source_order")
            normalized = group.get("departure_times_source_order")
            raw = group.get("departure_times_source_order_raw")
            chronological = group.get("departure_times_chronological")
            _validate_times(raw, f"{route_id}/{label}", "raw")
            _validate_times(normalized, f"{route_id}/{label}", "normalized")
            _validate_times(chronological, f"{route_id}/{label}", "chronological")
            if normalized != source_order:
                raise AMABusImportError(f"{route_id}/{label}: normalized source order mismatch")
            total_times += len(raw)
            group_rows.append({
                "route": route_id, "route_name": route["route_name"], "source_page": str(route["source_page"]),
                "schedule_group": label, "effective_date": _parse_date(route["effective_from"], "effective_from", route_id),
                "verified_at": datetime.combine(_parse_date(schedule["verified_on"], "verified_on", route_id), datetime.min.time()),
                "data_tier": route["data_tier"], "source": route["source"],
                "raw": raw, "normalized": normalized, "chronological": chronological,
            })
    if len(group_rows) != 193 or total_times != 3617:
        raise AMABusImportError(f"expected 193 schedule groups/3617 times, found {len(group_rows)}/{total_times}")
    csv_keys = {(r["route"], r["schedule_group"]) for r in groups}
    csv_counts = {(r["route"], r["schedule_group"]): int(r["trip_count"]) for r in groups}
    expected_counts = {(r["route"], r["schedule_group"]): len(r["raw"]) for r in group_rows}
    if (
        csv_keys != seen_groups
        or csv_counts != expected_counts
        or sum(csv_counts.values()) != 3617
    ):
        raise AMABusImportError("schedule-group CSV does not reconcile with normalized timetable")
    return tuple(group_rows)


def _validate_route12(rows: list[dict[str, str]]) -> tuple[dict[str, str], ...]:
    if len(rows) != 36:
        raise AMABusImportError(f"expected 36 Route 12 source rows, found {len(rows)}")
    if any(row["canonical_candidate"].strip() for row in rows):
        raise AMABusImportError("Route 12 contains an unexpected canonical stop mapping")
    return tuple(rows)


def load_ama_bus_package(package_dir: str | Path) -> AMABusPackage:
    directory = Path(package_dir)
    _require_files(directory)
    manifest = _verify_manifest(directory)
    bqs = _validate_bqs(_read_csv(directory / BQS_FILE, EXPECTED_BQS_HEADERS))
    groups = _read_csv(directory / SCHEDULE_GROUPS_FILE, {
        "route", "route_name", "source_page", "schedule_group", "trip_count",
        "first_time_source_order_raw", "last_time_source_order_raw", "first_time_source_order",
        "last_time_source_order", "first_time_chronological", "last_time_chronological",
        "source_order_nonchronological", "source",
    })
    schedule = _read_json(directory / SCHEDULE_FILE)
    primary = _read_json(directory / PRIMARY_SCHEDULE_FILE)
    route12 = _validate_route12(_read_csv(directory / ROUTE12_FILE, EXPECTED_ROUTE12_HEADERS))
    group_rows = _validate_schedule(schedule, primary, groups)
    if manifest.get("engineering_ready") is not False:
        raise AMABusImportError("handoff engineering_ready boundary changed unexpectedly")
    return AMABusPackage(directory, manifest, bqs, schedule, group_rows, route12)


def _find_one(session: Any, model: type[Any], **filters: Any) -> Any | None:
    return session.query(model).filter_by(**filters).one_or_none()


def _models():
    from app.db import base as _model_base  # noqa: F401
    from app.models.transport import (
        DataTier, FareRule, Route, ScheduledTripGroup, Stop,
        TransportProvider, TransportProviderSource,
    )
    return TransportProvider, TransportProviderSource, Stop, Route, ScheduledTripGroup, DataTier


def import_ama_bus_package(
    session: Any,
    package_dir: str | Path,
    *,
    models: tuple[type[Any], type[Any], type[Any], type[Any], type[Any], Any] | None = None,
    location_builder: Callable[[float, float], Any] | None = None,
) -> AMABusImportResult:
    """Validate then idempotently import only the 72 confirmed stop identities."""
    package = load_ama_bus_package(package_dir)
    Provider, ProviderSource, Stop, Route, Group, DataTier = models or _models()
    confirmed = tuple(row for row in package.bqs_records if row["canonical_stop_id_value"])
    unresolved = tuple(
        {"source_record_id": row["bqs_record_id"], "reason": row["reconciliation_status"]}
        for row in package.bqs_records if not row["canonical_stop_id_value"]
    )
    try:
        provider = _find_one(session, Provider, name=package.schedule["provider"])
        created_provider = 0
        if provider is None:
            provider = Provider(
                name=package.schedule["provider"], mode=package.schedule["mode"],
                data_tier=DataTier.SCHEDULED if hasattr(DataTier, "SCHEDULED") else "scheduled",
                notes_on_verification="AMA Bus corrected Phase 1 handoff; research remains engineering_ready=false.",
            )
            session.add(provider)
            created_provider = 1
        elif provider.mode != package.schedule["mode"]:
            raise AMABusImportError("existing AMA Bus provider has conflicting mode")
        session.flush()
        tier = DataTier.SCHEDULED if hasattr(DataTier, "SCHEDULED") else "scheduled"
        source = _find_one(session, ProviderSource, provider_id=provider.id, data_tier=tier, source=package.schedule["source"])
        created_sources = 0
        if source is None:
            source = ProviderSource(
                provider_id=provider.id, data_tier=tier, source=package.schedule["source"],
                effective_from=_parse_date(package.schedule["effective_from"], "effective_from", "AMA Bus"),
                verified_at=datetime.combine(_parse_date(package.schedule["verified_on"], "verified_on", "AMA Bus"), datetime.min.time()),
                notes="; ".join(package.schedule.get("notes", [])),
            )
            session.add(source)
            created_sources = 1
        session.flush()

        created_stops = 0
        for row in confirmed:
            existing = _find_one(session, Stop, provider_id=provider.id, research_id=row["bqs_record_id"])
            location = None
            if row["latitude_value"] is not None:
                if location_builder is not None:
                    location = location_builder(row["latitude_value"], row["longitude_value"])
                elif WKTElement is not None:
                    location = WKTElement(
                        f"POINT({row['longitude_value']} {row['latitude_value']})", srid=4326
                    )
            values = {
                "provider_id": provider.id, "name": row["published_name"],
                "published_name": row["published_name"], "matched_name": row["current_march_2026_match"] or None,
                "location": location, "external_ref": row["canonical_stop_id_value"],
                "research_id": row["bqs_record_id"], "canonical_stop_id": row["canonical_stop_id_value"],
                "coordinate_status": row["coordinate_status"], "reconciliation_status": row["reconciliation_status"],
                "source": row["primary_source"], "effective_date": row["effective_date_value"],
                "verified_at": datetime.combine(row["verification_date_value"], datetime.min.time()), "notes": row["notes"],
            }
            if existing is None:
                session.add(Stop(**values))
                created_stops += 1
            else:
                for field, value in values.items():
                    setattr(existing, field, value)
        session.flush()

        routes: dict[str, Any] = {}
        created_routes = 0
        for row in package.schedule["routes"]:
            route = _find_one(session, Route, provider_id=provider.id, route_code=row["route"])
            values = {
                "provider_id": provider.id, "name": row["route"], "route_code": row["route"],
                "route_name": row["route_name"], "source": row["source"], "source_page": str(row["source_page"]),
                "effective_date": _parse_date(row["effective_from"], "effective_from", row["route"]),
                "verified_at": datetime.combine(_parse_date(package.schedule["verified_on"], "verified_on", row["route"]), datetime.min.time()),
                "geometry": None,
            }
            if route is None:
                route = Route(**values)
                session.add(route)
                created_routes += 1
            else:
                for field, value in values.items():
                    setattr(route, field, value)
            routes[row["route"]] = route
        session.flush()

        created_groups = 0
        departure_times = 0
        for row in package.schedule_groups:
            route = routes[row["route"]]
            existing = _find_one(session, Group, route_id=route.id, group_label=row["schedule_group"], source=row["source"])
            values = {
                "route_id": route.id, "group_label": row["schedule_group"], "source": row["source"],
                "source_page": row["source_page"], "effective_date": row["effective_date"], "data_tier": tier,
                "verified_at": row["verified_at"], "departure_times_source_order_raw": row["raw"],
                "departure_times_source_order": row["normalized"], "departure_times_chronological": row["chronological"],
            }
            if existing is None:
                session.add(Group(**values))
                created_groups += 1
            else:
                for field, value in values.items():
                    setattr(existing, field, value)
            departure_times += len(row["raw"])
        session.flush()
        session.commit()
    except Exception:
        session.rollback()
        raise
    return AMABusImportResult(
        created_provider, created_sources, created_stops, created_routes, created_groups,
        departure_times, unresolved, len(package.route12_rows),
    )


if __name__ == "__main__":  # pragma: no cover
    import argparse
    parser = argparse.ArgumentParser(description="Validate the corrected AMA Bus research handoff.")
    parser.add_argument("package_dir", type=Path)
    args = parser.parse_args()
    package = load_ama_bus_package(args.package_dir)
    print(f"Validated {len(package.bqs_records)} BQS records, 95 routes, {len(package.schedule_groups)} schedule groups, 3617 times")
