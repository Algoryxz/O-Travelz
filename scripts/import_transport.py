"""Validate and import verified transport data.

This importer is deliberately limited to the current SQLAlchemy model contract. It
normalizes provider topology, schedules, and fares, then persists them in dependency
order. It does not implement provider adapters, routing, or any external API access.

The current repository still has two explicit semantic boundaries:

* stop ``lat``/``lon`` values cannot be converted to ``Stop.location`` without the
  unresolved coordinate-mapping decision;
* the current models cannot represent estimate metadata on ``ScheduledTrip`` or more
  than one data tier for the same provider.

Those cases fail loudly before the first database write. Call
:func:`import_transport_sources` with an explicitly approved ``location_builder`` once
the coordinate contract is approved.
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

STATIC_DIR = Path(__file__).resolve().parent.parent / "data" / "transport" / "static"
FARES_DIR = Path(__file__).resolve().parent.parent / "data" / "transport" / "fares"
BACKEND_DIR = STATIC_DIR.parent.parent.parent / "backend"

DATA_TIERS = frozenset({"static", "scheduled", "live"})
_STATIC_FIELDS = frozenset(
    {
        "provider",
        "mode",
        "stops",
        "routes",
        "source",
        "verified_on",
        "verified_at",
        "data_tier",
        "coordinate_status",
        "source_note",
        "notes_on_verification",
    }
)
_STOP_FIELDS = frozenset(
    {"name", "lat", "lon", "external_ref", "coordinate_status", "source"}
)
_ROUTE_FIELDS = frozenset(
    {"name", "route_name", "stop_sequence", "source", "route_length_km", "geometry"}
)
_SCHEDULE_FIELDS = frozenset(
    {"provider", "source", "verified_on", "verified_at", "data_tier", "routes"}
)
_SCHEDULE_ROUTE_FIELDS = frozenset(
    {
        "route",
        "route_name",
        "explicit_departure_times",
        "origin_departure_times",
        "return_departure_times",
        "headway_minutes_min",
        "headway_minutes_max",
        "hours",
        "basis",
        "source",
    }
)
_FARE_FIELDS = frozenset(
    {
        "provider",
        "fare_type",
        "rule_type",
        "amount_inr",
        "amount",
        "currency",
        "status",
        "source",
        "verification_note",
        "verified_on",
        "verified_at",
    }
)


class TransportImportError(ValueError):
    """Raised when transport data cannot be safely normalized or imported."""


class LocationMappingDecisionRequired(RuntimeError):
    """Raised until the canonical stop coordinate mapping is approved."""


class ProviderDataTierConflict(TransportImportError):
    """Raised when one provider's inputs require incompatible model tiers."""


class EstimateMetadataDecisionRequired(TransportImportError):
    """Raised when the model cannot preserve an estimate-only schedule marker."""


@dataclass(frozen=True)
class TransportSourceBundle:
    static_records: tuple[dict[str, Any], ...]
    schedule_records: tuple[dict[str, Any], ...]
    fare_records: tuple[dict[str, Any], ...]


@dataclass(frozen=True)
class NormalizedProvider:
    name: str
    mode: str
    data_tier: str
    notes_on_verification: str | None


@dataclass(frozen=True)
class NormalizedStop:
    provider: str
    name: str
    lat: float | None
    lon: float | None
    external_ref: str | None
    coordinate_status: str | None


@dataclass(frozen=True)
class NormalizedRoute:
    provider: str
    name: str
    stop_sequence: tuple[str, ...]


@dataclass(frozen=True)
class NormalizedRouteStop:
    provider: str
    route: str
    stop: str
    sequence_order: int


@dataclass(frozen=True)
class NormalizedScheduledTrip:
    provider: str
    route: str
    headway_minutes_min: int | None
    headway_minutes_max: int | None
    explicit_departure_times: str | None


@dataclass(frozen=True)
class NormalizedFareRule:
    provider: str
    rule_type: str
    amount: float | None
    source: str
    verified_at: datetime | None
    status: str | None = None
    currency: str | None = None
    verification_note: str | None = None


@dataclass(frozen=True)
class NormalizedTransportData:
    providers: tuple[NormalizedProvider, ...]
    stops: tuple[NormalizedStop, ...]
    routes: tuple[NormalizedRoute, ...]
    route_stops: tuple[NormalizedRouteStop, ...]
    scheduled_trips: tuple[NormalizedScheduledTrip, ...]
    fare_rules: tuple[NormalizedFareRule, ...]


@dataclass(frozen=True)
class TransportImportResult:
    providers_created: int = 0
    stops_created: int = 0
    routes_created: int = 0
    route_stops_created: int = 0
    scheduled_trips_created: int = 0
    fare_rules_created: int = 0


@dataclass(frozen=True)
class TransportModels:
    provider: type[Any]
    stop: type[Any]
    route: type[Any]
    route_stop: type[Any]
    scheduled_trip: type[Any]
    fare_rule: type[Any]
    data_tier: Callable[[str], Any] | None = None


def _read_json(path: Path, label: str) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise TransportImportError(f"could not load {label} from {path}: {exc}") from exc


def _json_objects(value: Any, label: str) -> list[dict[str, Any]]:
    if isinstance(value, dict):
        return [value]
    if isinstance(value, list) and all(isinstance(item, dict) for item in value):
        return value
    raise TransportImportError(f"{label} must contain an object or an array of objects")


def load_transport_sources(
    static_dir: Path | None = None, fares_dir: Path | None = None
) -> TransportSourceBundle:
    """Load provider topology, schedule, and fare JSON without opening a database."""
    static_path = static_dir or STATIC_DIR
    fares_path = fares_dir or FARES_DIR
    static_records: list[dict[str, Any]] = []
    schedule_records: list[dict[str, Any]] = []
    fare_records: list[dict[str, Any]] = []

    for path in sorted(static_path.glob("*.json")):
        value = _read_json(path, path.name)
        if path.name.endswith("_schedule.json"):
            schedule_records.extend(_json_objects(value, path.name))
        else:
            static_records.extend(_json_objects(value, path.name))
    for path in sorted(fares_path.glob("*.json")):
        fare_records.extend(_json_objects(_read_json(path, path.name), path.name))
    return TransportSourceBundle(
        tuple(static_records), tuple(schedule_records), tuple(fare_records)
    )


def _require_string(record: dict[str, Any], field: str, label: str) -> str:
    value = record.get(field)
    if not isinstance(value, str) or not value.strip():
        raise TransportImportError(f"{label}.{field} must be a non-empty string")
    if value != value.strip():
        raise TransportImportError(f"{label}.{field} must not have leading/trailing whitespace")
    return value


def _require_source(record: dict[str, Any], label: str) -> str:
    source = _require_string(record, "source", label)
    if source == "REQUIRED" or source.startswith("REQUIRED"):
        raise TransportImportError(f"{label}.source must contain a real source")
    return source


def _reject_unknown(record: dict[str, Any], allowed: frozenset[str], label: str) -> None:
    unknown = sorted(set(record) - allowed)
    if unknown:
        raise TransportImportError(f"{label} has unsupported fields: {', '.join(unknown)}")


def _parse_verified_at(record: dict[str, Any], label: str) -> datetime | None:
    values = [record.get("verified_at"), record.get("verified_on")]
    values = [value for value in values if value is not None]
    if not values:
        return None
    if any(not isinstance(value, str) or not value.strip() for value in values):
        raise TransportImportError(f"{label}.verified_on/verified_at must be an ISO date or datetime")
    parsed: list[datetime] = []
    for value in values:
        try:
            parsed.append(datetime.fromisoformat(value.replace("Z", "+00:00")))
        except ValueError as exc:
            raise TransportImportError(
                f"{label}.verified_on/verified_at must be an ISO date or datetime"
            ) from exc
    if len(parsed) == 2 and parsed[0] != parsed[1]:
        raise TransportImportError(f"{label} has conflicting verified_on and verified_at")
    return parsed[0]


def _validate_tier(value: Any, label: str) -> str:
    if not isinstance(value, str) or value not in DATA_TIERS:
        raise TransportImportError(
            f"{label}.data_tier must be one of: {', '.join(sorted(DATA_TIERS))}"
        )
    return value


def _coordinate(value: Any, field: str, label: str, minimum: float, maximum: float) -> float | None:
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise TransportImportError(f"{label}.{field} must be a number or null")
    number = float(value)
    if not math.isfinite(number) or not minimum <= number <= maximum:
        raise TransportImportError(
            f"{label}.{field} must be finite and between {minimum} and {maximum}"
        )
    return number


def _provider_notes(entries: Iterable[dict[str, Any]]) -> str | None:
    values = [entry for entry in entries if entry]
    if not values:
        return None
    return json.dumps(values, sort_keys=True, separators=(",", ":"))


def _normalise_static(
    record: dict[str, Any], index: int
) -> tuple[NormalizedProvider, list[NormalizedStop], list[NormalizedRoute], list[NormalizedRouteStop], dict[str, Any]]:
    label = f"static[{index}]"
    _reject_unknown(record, _STATIC_FIELDS, label)
    provider = _require_string(record, "provider", label)
    mode = _require_string(record, "mode", label)
    source = _require_source(record, label)
    verified_at = _parse_verified_at(record, label)
    tier = _validate_tier(record.get("data_tier", "static"), label)
    stops_value = record.get("stops")
    routes_value = record.get("routes")
    if not isinstance(stops_value, list):
        raise TransportImportError(f"{label}.stops must be an array")
    if not isinstance(routes_value, list):
        raise TransportImportError(f"{label}.routes must be an array")

    stops: list[NormalizedStop] = []
    stop_names: set[str] = set()
    for stop_index, raw_stop in enumerate(stops_value):
        stop_label = f"{label}.stops[{stop_index}]"
        if not isinstance(raw_stop, dict):
            raise TransportImportError(f"{stop_label} must be an object")
        _reject_unknown(raw_stop, _STOP_FIELDS, stop_label)
        name = _require_string(raw_stop, "name", stop_label)
        if name in stop_names:
            raise TransportImportError(
                f"{stop_label} duplicates stop name {name!r}; route references would be ambiguous"
            )
        stop_names.add(name)
        lat = _coordinate(raw_stop.get("lat"), "lat", stop_label, -90.0, 90.0)
        lon = _coordinate(raw_stop.get("lon"), "lon", stop_label, -180.0, 180.0)
        if (lat is None) != (lon is None):
            raise TransportImportError(f"{stop_label} must provide both lat and lon or neither")
        coordinate_status = raw_stop.get("coordinate_status", record.get("coordinate_status"))
        if coordinate_status is not None and not isinstance(coordinate_status, str):
            raise TransportImportError(f"{stop_label}.coordinate_status must be a string or null")
        external_ref = raw_stop.get("external_ref")
        if external_ref is not None and not isinstance(external_ref, str):
            raise TransportImportError(f"{stop_label}.external_ref must be a string or null")
        stops.append(NormalizedStop(provider, name, lat, lon, external_ref, coordinate_status))

    routes: list[NormalizedRoute] = []
    route_stops: list[NormalizedRouteStop] = []
    route_names: set[str] = set()
    for route_index, raw_route in enumerate(routes_value):
        route_label = f"{label}.routes[{route_index}]"
        if not isinstance(raw_route, dict):
            raise TransportImportError(f"{route_label} must be an object")
        _reject_unknown(raw_route, _ROUTE_FIELDS, route_label)
        route_name = _require_string(raw_route, "name", route_label)
        if route_name in route_names:
            raise TransportImportError(f"{route_label} duplicates route name {route_name!r}")
        route_names.add(route_name)
        if raw_route.get("geometry") is not None:
            raise TransportImportError(
                f"{route_label}.geometry is not importable until the approved geometry contract exists"
            )
        sequence = raw_route.get("stop_sequence")
        if not isinstance(sequence, list) or not sequence:
            raise TransportImportError(f"{route_label}.stop_sequence must be a non-empty array")
        if any(not isinstance(stop_name, str) or not stop_name.strip() for stop_name in sequence):
            raise TransportImportError(f"{route_label}.stop_sequence must contain stop names")
        for sequence_order, stop_name in enumerate(sequence, start=1):
            if stop_name not in stop_names:
                raise TransportImportError(
                    f"{route_label}.stop_sequence references unknown stop {stop_name!r}"
                )
            route_stops.append(NormalizedRouteStop(provider, route_name, stop_name, sequence_order))
        routes.append(NormalizedRoute(provider, route_name, tuple(sequence)))

    provenance = {
        "kind": "static",
        "source": source,
        "verified_at": verified_at.isoformat() if verified_at else None,
    }
    if record.get("source_note") is not None:
        provenance["source_note"] = record["source_note"]
    if record.get("notes_on_verification") is not None:
        provenance["notes_on_verification"] = record["notes_on_verification"]
    return (
        NormalizedProvider(provider, mode, tier, _provider_notes([provenance])),
        stops,
        routes,
        route_stops,
        {provider: {"routes": route_names, "tier": tier}},
    )


def _normalise_schedule(
    record: dict[str, Any], index: int, known_routes: dict[str, set[str]], provider_tiers: dict[str, str]
) -> tuple[list[NormalizedScheduledTrip], dict[str, Any]]:
    label = f"schedule[{index}]"
    _reject_unknown(record, _SCHEDULE_FIELDS, label)
    provider = _require_string(record, "provider", label)
    source = _require_source(record, label)
    verified_at = _parse_verified_at(record, label)
    if provider not in known_routes:
        raise TransportImportError(f"{label}.provider {provider!r} has no static provider record")
    tier = _validate_tier(record.get("data_tier"), label)
    if tier != "scheduled":
        raise TransportImportError(f"{label}.data_tier must be 'scheduled' for schedule records")
    if provider_tiers[provider] != tier:
        raise ProviderDataTierConflict(
            f"provider {provider!r} has data_tier {provider_tiers[provider]!r} for topology and "
            f"{tier!r} for schedules; the current provider model stores only one tier"
        )
    routes_value = record.get("routes")
    if not isinstance(routes_value, list):
        raise TransportImportError(f"{label}.routes must be an array")
    trips: list[NormalizedScheduledTrip] = []
    seen_routes: set[str] = set()
    for route_index, raw_route in enumerate(routes_value):
        route_label = f"{label}.routes[{route_index}]"
        if not isinstance(raw_route, dict):
            raise TransportImportError(f"{route_label} must be an object")
        _reject_unknown(raw_route, _SCHEDULE_ROUTE_FIELDS, route_label)
        route = _require_string(raw_route, "route", route_label)
        if route not in known_routes[provider]:
            raise TransportImportError(
                f"{route_label}.route {route!r} does not reference a known route for {provider!r}"
            )
        if route in seen_routes:
            raise TransportImportError(f"{route_label} duplicates schedule route {route!r}")
        seen_routes.add(route)
        if raw_route.get("origin_departure_times") is not None or raw_route.get("return_departure_times") is not None:
            raise TransportImportError(
                f"{route_label} has directional departure arrays; ScheduledTrip has one "
                "explicit_departure_times field and cannot preserve both directions"
            )
        explicit = raw_route.get("explicit_departure_times")
        has_explicit = explicit is not None
        if has_explicit:
            if not isinstance(explicit, list) or not explicit:
                raise TransportImportError(
                    f"{route_label}.explicit_departure_times must be a non-empty array"
                )
            if any(not isinstance(value, str) or not _valid_time(value) for value in explicit):
                raise TransportImportError(
                    f"{route_label}.explicit_departure_times must contain HH:MM values"
                )
            explicit_csv = ",".join(explicit)
        else:
            explicit_csv = None
        min_headway = raw_route.get("headway_minutes_min")
        max_headway = raw_route.get("headway_minutes_max")
        has_headway = min_headway is not None or max_headway is not None
        if has_headway:
            if not _positive_int(min_headway) or not _positive_int(max_headway):
                raise TransportImportError(
                    f"{route_label} headway_minutes_min/max must be positive integers"
                )
            if min_headway > max_headway:
                raise TransportImportError(
                    f"{route_label}.headway_minutes_min cannot exceed headway_minutes_max"
                )
        if has_explicit == has_headway:
            raise TransportImportError(
                f"{route_label} must provide exactly one of explicit departure times or a headway range"
            )
        basis = raw_route.get("basis")
        if basis is not None and not isinstance(basis, str):
            raise TransportImportError(f"{route_label}.basis must be a string or null")
        if has_headway and basis and any(marker in basis.lower() for marker in ("estimate", "approx")):
            raise EstimateMetadataDecisionRequired(
                f"{route_label} is estimate-only, but ScheduledTrip has no field to preserve "
                "estimate metadata without resolving the documented OPEN DECISION"
            )
        trips.append(
            NormalizedScheduledTrip(provider, route, min_headway, max_headway, explicit_csv)
        )
    provenance = {
        "kind": "schedule",
        "source": source,
        "verified_at": verified_at.isoformat() if verified_at else None,
    }
    return trips, {provider: provenance}


def _valid_time(value: str) -> bool:
    try:
        datetime.strptime(value, "%H:%M")
    except ValueError:
        return False
    return True


def _positive_int(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value > 0


def _normalise_fare(
    raw_record: dict[str, Any], index: int, known_providers: set[str]
) -> NormalizedFareRule:
    label = f"fares[{index}]"
    _reject_unknown(raw_record, _FARE_FIELDS, label)
    provider = _require_string(raw_record, "provider", label)
    if provider not in known_providers:
        raise TransportImportError(f"{label}.provider {provider!r} has no static provider record")
    source = _require_source(raw_record, label)
    verified_at = _parse_verified_at(raw_record, label)
    fare_type = raw_record.get("fare_type")
    rule_type = raw_record.get("rule_type")
    if fare_type is not None and rule_type is not None and fare_type != rule_type:
        raise TransportImportError(f"{label} has conflicting fare_type and rule_type")
    normalized_rule_type = fare_type or rule_type
    if not isinstance(normalized_rule_type, str) or not normalized_rule_type.strip():
        raise TransportImportError(f"{label} requires fare_type or rule_type")
    amount_inr = raw_record.get("amount_inr")
    amount = raw_record.get("amount")
    if amount_inr is not None and amount is not None and amount_inr != amount:
        raise TransportImportError(f"{label} has conflicting amount_inr and amount")
    normalized_amount = amount_inr if amount_inr is not None else amount
    if normalized_amount is not None:
        if isinstance(normalized_amount, bool) or not isinstance(normalized_amount, (int, float)):
            raise TransportImportError(f"{label}.amount must be a number or null")
        if not math.isfinite(float(normalized_amount)) or normalized_amount < 0:
            raise TransportImportError(f"{label}.amount must be finite and non-negative")
    currency = raw_record.get("currency")
    if currency is not None and currency != "INR":
        raise TransportImportError(
            f"{label}.currency {currency!r} cannot be represented by the INR-scoped fare model"
        )
    status = raw_record.get("status")
    if status is not None and not isinstance(status, str):
        raise TransportImportError(f"{label}.status must be a string or null")
    if status == "unknown_for_static_seed" and normalized_amount is not None:
        raise TransportImportError(f"{label} cannot mark a fare unknown while supplying an amount")
    verification_note = raw_record.get("verification_note")
    if verification_note is not None and not isinstance(verification_note, str):
        raise TransportImportError(f"{label}.verification_note must be a string or null")
    return NormalizedFareRule(
        provider,
        normalized_rule_type,
        float(normalized_amount) if normalized_amount is not None else None,
        source,
        verified_at,
        status,
        currency,
        verification_note,
    )


def normalize_transport_sources(bundle: TransportSourceBundle) -> NormalizedTransportData:
    """Strictly validate and normalize all transport source records before writes."""
    providers: dict[str, NormalizedProvider] = {}
    provider_provenance: dict[str, list[dict[str, Any]]] = {}
    stops: list[NormalizedStop] = []
    routes: list[NormalizedRoute] = []
    route_stops: list[NormalizedRouteStop] = []
    known_routes: dict[str, set[str]] = {}

    for index, record in enumerate(bundle.static_records):
        provider, provider_stops, provider_routes, provider_route_stops, route_meta = _normalise_static(record, index)
        if provider.name in providers:
            raise TransportImportError(f"duplicate static provider {provider.name!r}")
        providers[provider.name] = provider
        known_routes[provider.name] = route_meta[provider.name]["routes"]
        provider_provenance[provider.name] = []
        if provider.notes_on_verification:
            provider_provenance[provider.name].extend(json.loads(provider.notes_on_verification))
        stops.extend(provider_stops)
        routes.extend(provider_routes)
        route_stops.extend(provider_route_stops)

    scheduled_trips: list[NormalizedScheduledTrip] = []
    seen_schedule_identities: set[tuple[str, str]] = set()
    for index, record in enumerate(bundle.schedule_records):
        trips, provenance = _normalise_schedule(record, index, known_routes, {name: p.data_tier for name, p in providers.items()})
        provider_name = next(iter(provenance))
        provider_provenance[provider_name].append(provenance[provider_name])
        for trip in trips:
            identity = (trip.provider, trip.route)
            if identity in seen_schedule_identities:
                raise TransportImportError(
                    f"duplicate scheduled trip for provider {trip.provider!r}, route {trip.route!r}"
                )
            seen_schedule_identities.add(identity)
            scheduled_trips.append(trip)

    fare_rules: list[NormalizedFareRule] = []
    seen_fare_identities: set[tuple[str, str, str]] = set()
    for index, record in enumerate(bundle.fare_records):
        fare = _normalise_fare(record, index, set(providers))
        identity = (fare.provider, fare.rule_type, fare.source)
        if identity in seen_fare_identities:
            raise TransportImportError(
                f"fares[{index}] duplicates provider/rule_type/source identity"
            )
        seen_fare_identities.add(identity)
        fare_rules.append(fare)
        provider_provenance[fare.provider].append(
            {
                "kind": "fare",
                "source": fare.source,
                "verified_at": fare.verified_at.isoformat() if fare.verified_at else None,
            }
        )

    normalized_providers = tuple(
        NormalizedProvider(
            provider.name,
            provider.mode,
            provider.data_tier,
            _provider_notes(provider_provenance[name]),
        )
        for name, provider in sorted(providers.items())
    )
    return NormalizedTransportData(
        normalized_providers,
        tuple(sorted(stops, key=lambda item: (item.provider, item.name))),
        tuple(sorted(routes, key=lambda item: (item.provider, item.name))),
        tuple(sorted(route_stops, key=lambda item: (item.provider, item.route, item.sequence_order))),
        tuple(sorted(scheduled_trips, key=lambda item: (item.provider, item.route))),
        tuple(sorted(fare_rules, key=lambda item: (item.provider, item.rule_type, item.source))),
    )


def _load_models() -> TransportModels:
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))
    from app.models.transport import (
        DataTier,
        FareRule,
        Route,
        RouteStop,
        ScheduledTrip,
        Stop,
        TransportProvider,
    )

    return TransportModels(
        TransportProvider,
        Stop,
        Route,
        RouteStop,
        ScheduledTrip,
        FareRule,
        DataTier,
    )


def _find_one(session: Any, model: type[Any], **filters: Any) -> Any | None:
    return session.query(model).filter_by(**filters).one_or_none()


def _stop_location_input(stop: NormalizedStop) -> dict[str, Any]:
    return {
        "provider": stop.provider,
        "name": stop.name,
        "lat": stop.lat,
        "lon": stop.lon,
        "external_ref": stop.external_ref,
        "coordinate_status": stop.coordinate_status,
    }


def import_transport_sources(
    session: Any,
    bundle: TransportSourceBundle,
    *,
    location_builder: Callable[[dict[str, Any]], Any] | None = None,
    models: TransportModels | None = None,
) -> TransportImportResult:
    """Normalize and idempotently upsert all transport entities in dependency order."""
    normalized = normalize_transport_sources(bundle)
    if normalized.stops and location_builder is None:
        raise LocationMappingDecisionRequired(
            "Cannot import stops: the canonical lat/lon to PostGIS location mapping "
            "is an OPEN DECISION in docs/ARCHITECTURE.md"
        )
    stop_locations: dict[tuple[str, str], Any] = {}
    for stop in normalized.stops:
        if stop.lat is None or stop.lon is None or stop.coordinate_status == "unresolved":
            raise TransportImportError(
                f"stop {stop.provider!r}/{stop.name!r} has unresolved coordinates and cannot be imported"
            )
        location = location_builder(_stop_location_input(stop)) if location_builder else None
        if location is None:
            raise TransportImportError(
                f"location_builder returned no location for {stop.provider!r}/{stop.name!r}"
            )
        stop_locations[(stop.provider, stop.name)] = location

    models = models or _load_models()
    tier_value = models.data_tier or (lambda value: value)
    try:
        provider_rows: dict[str, Any] = {}
        created_providers = 0
        for provider in normalized.providers:
            row = _find_one(session, models.provider, name=provider.name)
            if row is None:
                row = models.provider(
                    name=provider.name,
                    mode=provider.mode,
                    data_tier=tier_value(provider.data_tier),
                    notes_on_verification=provider.notes_on_verification,
                )
                session.add(row)
                created_providers += 1
            else:
                existing_tier = (
                    row.data_tier.value if hasattr(row.data_tier, "value") else row.data_tier
                )
                if row.mode != provider.mode or existing_tier != provider.data_tier:
                    raise TransportImportError(
                        f"existing provider {provider.name!r} conflicts with imported mode or data_tier"
                    )
                row.notes_on_verification = provider.notes_on_verification
            provider_rows[provider.name] = row
        session.flush()

        stop_rows: dict[tuple[str, str], Any] = {}
        created_stops = 0
        for stop in normalized.stops:
            provider_row = provider_rows[stop.provider]
            row = _find_one(
                session,
                models.stop,
                provider_id=provider_row.id,
                name=stop.name,
            )
            values = {
                "provider_id": provider_row.id,
                "name": stop.name,
                "location": stop_locations[(stop.provider, stop.name)],
                "external_ref": stop.external_ref,
            }
            if row is None:
                row = models.stop(**values)
                session.add(row)
                created_stops += 1
            else:
                for field, value in values.items():
                    setattr(row, field, value)
            stop_rows[(stop.provider, stop.name)] = row
        session.flush()

        route_rows: dict[tuple[str, str], Any] = {}
        created_routes = 0
        for route in normalized.routes:
            provider_row = provider_rows[route.provider]
            row = _find_one(
                session,
                models.route,
                provider_id=provider_row.id,
                name=route.name,
            )
            values = {"provider_id": provider_row.id, "name": route.name, "geometry": None}
            if row is None:
                row = models.route(**values)
                session.add(row)
                created_routes += 1
            route_rows[(route.provider, route.name)] = row
        session.flush()

        created_route_stops = 0
        for route_stop in normalized.route_stops:
            route_row = route_rows[(route_stop.provider, route_stop.route)]
            stop_row = stop_rows[(route_stop.provider, route_stop.stop)]
            row = _find_one(
                session,
                models.route_stop,
                route_id=route_row.id,
                sequence_order=route_stop.sequence_order,
            )
            values = {
                "route_id": route_row.id,
                "stop_id": stop_row.id,
                "sequence_order": route_stop.sequence_order,
            }
            if row is None:
                session.add(models.route_stop(**values))
                created_route_stops += 1
            else:
                row.stop_id = stop_row.id

        session.flush()
        created_scheduled_trips = 0
        for trip in normalized.scheduled_trips:
            route_row = route_rows[(trip.provider, trip.route)]
            values = {
                "route_id": route_row.id,
                "headway_minutes_min": trip.headway_minutes_min,
                "headway_minutes_max": trip.headway_minutes_max,
                "explicit_departure_times": trip.explicit_departure_times,
            }
            row = _find_one(session, models.scheduled_trip, route_id=route_row.id)
            if row is None:
                session.add(models.scheduled_trip(**values))
                created_scheduled_trips += 1
            else:
                for field, value in values.items():
                    setattr(row, field, value)

        created_fare_rules = 0
        for fare in normalized.fare_rules:
            provider_row = provider_rows[fare.provider]
            values = {
                "provider_id": provider_row.id,
                "rule_type": fare.rule_type,
                "amount": fare.amount,
                "source": fare.source,
                "verified_at": fare.verified_at,
                "status": fare.status,
                "currency": fare.currency,
                "verification_note": fare.verification_note,
            }
            row = _find_one(
                session,
                models.fare_rule,
                provider_id=provider_row.id,
                rule_type=fare.rule_type,
                source=fare.source,
            )
            if row is None:
                session.add(models.fare_rule(**values))
                created_fare_rules += 1
            else:
                for field, value in values.items():
                    setattr(row, field, value)
        session.flush()
        session.commit()
    except Exception:
        session.rollback()
        raise
    return TransportImportResult(
        created_providers,
        created_stops,
        created_routes,
        created_route_stops,
        created_scheduled_trips,
        created_fare_rules,
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate or import transport data.")
    parser.add_argument(
        "--validate",
        action="store_true",
        help="validate source data without opening a database or writing records",
    )
    args = parser.parse_args(argv)
    try:
        bundle = load_transport_sources()
        normalized = normalize_transport_sources(bundle)
    except (TransportImportError, LocationMappingDecisionRequired) as exc:
        print(f"ERROR: {exc}")
        return 1

    print(
        "Loaded "
        f"{len(normalized.providers)} providers, {len(normalized.stops)} stops, "
        f"{len(normalized.routes)} routes, {len(normalized.scheduled_trips)} scheduled trips, "
        f"{len(normalized.fare_rules)} fare rules"
    )
    if args.validate:
        if normalized.stops:
            print(
                "ERROR: stop import remains blocked until the canonical lat/lon to PostGIS "
                "location mapping OPEN DECISION is approved"
            )
            return 1
        print("Validation passed")
        return 0

    print(
        "ERROR: transport import requires an explicit approved stop location mapping; "
        "use import_transport_sources from a controlled caller after that decision"
    )
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
