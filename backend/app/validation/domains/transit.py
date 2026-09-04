"""
Transit Domain Validator.
Enforces provider integrity, route-stop sequence ordering, service-day overnight timetable
sorting, and split transit truth boundaries (provenance and live claims).
"""
from __future__ import annotations

import math
import re
from typing import Any, Dict, List, Optional, Set
from app.validation import codes
from app.validation.models import ValidationProfile, ValidationReport, ValidationSeverity

TIME_HHMM_REGEX = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")

REGIONAL_ANCHORS: Dict[str, Dict[str, float]] = {
    "CAPITAL_REGION": {"lat": 20.2961, "lon": 85.8245, "max_km": 95.0},
    "ROURKELA": {"lat": 22.2604, "lon": 84.8536, "max_km": 75.0},
    "SAMBALPUR": {"lat": 21.4669, "lon": 83.9812, "max_km": 80.0},
    "BERHAMPUR": {"lat": 19.3150, "lon": 84.7941, "max_km": 65.0},
    "KEONJHAR": {"lat": 21.6289, "lon": 85.5817, "max_km": 75.0},
}


def _haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _resolve_transit_region(stop: Dict[str, Any]) -> str:
    sid = str(stop.get("stop_id", "")).lower()
    city = str(stop.get("city") or (stop.get("locality", {}) or {}).get("city") or "").lower()
    s_area = str(stop.get("service_area", "")).lower()
    t = f"{sid} {city} {s_area}"
    if "sambalpur" in t:
        return "SAMBALPUR"
    if "keonjhar" in t:
        return "KEONJHAR"
    if "rourkela" in t:
        return "ROURKELA"
    if "berhampur" in t or "brahmapur" in t:
        return "BERHAMPUR"
    if any(k in t for k in ("bhubaneswar", "cuttack", "puri", "khordha", "capital")):
        return "CAPITAL_REGION"
    return "UNKNOWN"



def _to_service_day_minutes(time_str: str) -> Optional[int]:
    """Convert HH:MM string to minutes from 00:00."""
    if not TIME_HHMM_REGEX.match(time_str):
        return None
    h, m = map(int, time_str.split(":"))
    return h * 60 + m


def is_service_day_sorted(times: List[str], max_step_minutes: int = 720) -> bool:
    """
    Validate schedule times order using service-day semantics.
    Supports timetables crossing midnight (e.g. 23:40 -> 00:15 -> 00:50).
    Rejects erratic jumps and multi-hour backward regressions.
    """
    if len(times) <= 1:
        return True

    raw_mins: List[int] = []
    for t in times:
        m = _to_service_day_minutes(str(t).strip())
        if m is None:
            return False
        raw_mins.append(m)

    # If already strictly non-decreasing, valid
    if all(raw_mins[i] <= raw_mins[i + 1] for i in range(len(raw_mins) - 1)):
        return True

    # Check for single valid overnight midnight crossing
    wrap_indices = [i for i in range(len(raw_mins) - 1) if raw_mins[i] > raw_mins[i + 1]]
    if len(wrap_indices) != 1:
        return False  # More than 1 midnight crossing or erratic jumps

    w_idx = wrap_indices[0]

    # Before wrap: strictly non-decreasing
    for i in range(w_idx):
        if raw_mins[i] > raw_mins[i + 1]:
            return False

    # Midnight crossing transition: late night (>= 12:00) to early morning (< 12:00)
    if raw_mins[w_idx] < 720 or raw_mins[w_idx + 1] >= 720:
        return False

    cross_step = (1440 - raw_mins[w_idx]) + raw_mins[w_idx + 1]
    if cross_step > max_step_minutes:
        return False

    # After wrap: strictly non-decreasing and each step <= max_step_minutes
    for i in range(w_idx + 1, len(raw_mins) - 1):
        step = raw_mins[i + 1] - raw_mins[i]
        if step < 0 or step > max_step_minutes:
            return False

    return True



def validate_transit_stop(
    stop: Dict[str, Any],
    report: ValidationReport,
    valid_providers: Optional[Set[str]] = None,
) -> None:
    sid = str(stop.get("stop_id") or stop.get("id") or "stop")
    provider = stop.get("provider") or stop.get("operator") or stop.get("provider_id")
    # Coordinate and status resolution (supports flat and nested structures)
    coord_obj = stop.get("coordinate")
    if isinstance(coord_obj, dict):
        c_status = str(coord_obj.get("status", "")).strip().upper()
        lat = coord_obj.get("lat") if coord_obj.get("lat") is not None else coord_obj.get("latitude")
        lon = coord_obj.get("lon") if coord_obj.get("lon") is not None else coord_obj.get("longitude")
        source = coord_obj.get("source") or coord_obj.get("coordinate_source")
    else:
        c_status = str(stop.get("coordinate_status", "")).strip().upper()
        lat = stop.get("lat") if stop.get("lat") is not None else stop.get("latitude")
        lon = stop.get("lon") if stop.get("lon") is not None else stop.get("longitude")
        source = stop.get("coordinate_source") or stop.get("source")

    # 1. Provider Identity Check
    if valid_providers is not None and provider:
        p_str = str(provider).strip()
        if p_str not in valid_providers:
            report.add_issue(
                code=codes.TRN_UNKNOWN_PROVIDER,
                severity=ValidationSeverity.ERROR,
                domain="transit",
                entity_type="stop",
                entity_id=sid,
                field="provider",
                message=f"Transit stop '{sid}' references unrecognized provider '{provider}'",
                evidence={"provider": provider, "valid_providers": sorted(list(valid_providers))},
            )

    # 2. Split Transit Truth: Coordinate Without Provenance (Correction #3)
    if c_status in {"VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL", "RESOLVED_HIGH_CONFIDENCE", "GEOCODED"}:
        if lat is not None and lon is not None:
            if not source or str(source).strip().lower() in {"", "none", "null", "required"}:
                report.add_issue(
                    code=codes.TRN_COORDINATE_WITHOUT_PROVENANCE,
                    severity=ValidationSeverity.ERROR,
                    domain="transit",
                    entity_type="stop",
                    entity_id=sid,
                    field="coordinate_source",
                    message=f"Stop '{sid}' coordinate ({lat}, {lon}) promoted as '{c_status}' without verified coordinate source",
                    evidence={"coordinate_status": c_status, "source": source},
                )

    # 3. Wave C2 Locality & BigDataCloud Truth Boundary Rules
    locality = stop.get("locality")
    locality_status = stop.get("locality_status")
    locality_source = stop.get("locality_source") or stop.get("locality_provenance")
    map_behavior = stop.get("map_behavior") or {}
    evidence = stop.get("evidence")
    has_source_doc = bool(evidence or stop.get("source_document") or stop.get("provenance", {}).get("source_document"))

    # TRN_LOCALITY_WITHOUT_PROVENANCE
    # Trigger: locality or status is declared without verifiable source or document evidence
    if locality_status in {"VERIFIED_LOCALITY", "OFFICIAL_SERVICE_AREA", "ROUTE_CONTEXT_ONLY"} or locality:
        if not locality_source or str(locality_source).strip().lower() in {"", "none", "null"}:
            report.add_issue(
                code=codes.TRN_LOCALITY_WITHOUT_PROVENANCE,
                severity=ValidationSeverity.ERROR,
                domain="transit",
                entity_type="stop",
                entity_id=sid,
                field="locality_source",
                message=f"Stop '{sid}' asserts locality status '{locality_status}' without verified locality source",
                evidence={"locality_status": locality_status, "locality_source": locality_source},
            )
        elif locality_status == "OFFICIAL_SERVICE_AREA" and not has_source_doc:
            report.add_issue(
                code=codes.TRN_LOCALITY_WITHOUT_PROVENANCE,
                severity=ValidationSeverity.ERROR,
                domain="transit",
                entity_type="stop",
                entity_id=sid,
                field="evidence",
                message=f"Stop '{sid}' asserts official service area locality without document citation in evidence or provenance",
                evidence={"locality_status": locality_status},
            )

    # TRN_LOCALITY_INVALID_STATE
    # Trigger: Asserting a locality with state other than Odisha or country other than India
    if isinstance(locality, dict):
        state = locality.get("state")
        country = locality.get("country")
        if state is not None and str(state).strip().lower() != "odisha":
            report.add_issue(
                code=codes.TRN_LOCALITY_INVALID_STATE,
                severity=ValidationSeverity.ERROR,
                domain="transit",
                entity_type="stop",
                entity_id=sid,
                field="locality.state",
                message=f"Stop '{sid}' locality specifies invalid state '{state}', expected 'Odisha'",
                evidence={"state": state, "locality": locality},
            )
        if country is not None and str(country).strip().lower() not in {"india", "in"}:
            report.add_issue(
                code=codes.TRN_LOCALITY_INVALID_STATE,
                severity=ValidationSeverity.ERROR,
                domain="transit",
                entity_type="stop",
                entity_id=sid,
                field="locality.country",
                message=f"Stop '{sid}' locality specifies invalid country '{country}', expected 'India'",
                evidence={"country": country, "locality": locality},
            )

    # TRN_LOCALITY_EXACT_PIN_WITHOUT_COORDINATE
    # Trigger: Attempting to render an exact map pin when physical coordinates are missing/unresolved
    is_unresolved = (lat is None or lon is None or c_status == "UNRESOLVED")
    renders_exact_marker = (
        map_behavior.get("render_exact_marker") is True
        or stop.get("render_exact_marker") is True
        or stop.get("map_display_type") == "EXACT_PIN"
    )
    if is_unresolved and renders_exact_marker:
        report.add_issue(
            code=codes.TRN_LOCALITY_EXACT_PIN_WITHOUT_COORDINATE,
            severity=ValidationSeverity.ERROR,
            domain="transit",
            entity_type="stop",
            entity_id=sid,
            field="map_behavior.render_exact_marker",
            message=f"Stop '{sid}' authorizes exact pin display without verified physical coordinates",
            evidence={"coordinate_status": c_status, "lat": lat, "lon": lon},
        )

    # TRN_FIRST_MILE_ON_LOCALITY_ONLY
    # Trigger: Calculating or claiming first-mile walking distance on locality-only / unresolved stop
    claims_first_mile = (
        map_behavior.get("participates_in_first_mile") is True
        or stop.get("participates_in_first_mile") is True
        or stop.get("first_mile_distance_meters") is not None
        or stop.get("has_walking_distance") is True
    )
    if is_unresolved and claims_first_mile:
        report.add_issue(
            code=codes.TRN_FIRST_MILE_ON_LOCALITY_ONLY,
            severity=ValidationSeverity.ERROR,
            domain="transit",
            entity_type="stop",
            entity_id=sid,
            field="map_behavior.participates_in_first_mile",
            message=f"Stop '{sid}' authorizes first-mile walking calculation without verified physical coordinates",
            evidence={"coordinate_status": c_status, "lat": lat, "lon": lon},
        )

    # TRN_BIGDATACLOUD_WITHOUT_INPUT_COORDINATE
    # Trigger: Claiming BigDataCloud reverse geocode provenance without input coordinates
    if locality_source and "bigdatacloud" in str(locality_source).strip().lower():
        if lat is None or lon is None:
            report.add_issue(
                code=codes.TRN_BIGDATACLOUD_WITHOUT_INPUT_COORDINATE,
                severity=ValidationSeverity.ERROR,
                domain="transit",
                entity_type="stop",
                entity_id=sid,
                field="coordinate",
                message=f"Stop '{sid}' claims BigDataCloud reverse geocoding provenance without valid input coordinates",
                evidence={"locality_source": locality_source, "lat": lat, "lon": lon},
            )

    # TRN_COORDINATE_SERVICE_AREA_MISMATCH
    # Check coordinate against declared transit region/service area
    if lat is not None and lon is not None:
        region = _resolve_transit_region(stop)
        cfg = REGIONAL_ANCHORS.get(region)
        if cfg:
            dist = _haversine_distance_km(float(lat), float(lon), cfg["lat"], cfg["lon"])
            if dist > cfg["max_km"]:
                severity = (
                    ValidationSeverity.ERROR
                    if report.profile == ValidationProfile.PROMOTION
                    else ValidationSeverity.WARNING
                )
                report.add_issue(
                    code=codes.TRN_COORDINATE_SERVICE_AREA_MISMATCH,
                    severity=severity,
                    domain="transit",
                    entity_type="stop",
                    entity_id=sid,
                    field="coordinate",
                    message=(
                        f"Stop '{sid}' declared in region '{region}' but coordinate ({lat}, {lon}) "
                        f"is {dist:.1f} km from regional anchor ({cfg['lat']}, {cfg['lon']}), "
                        f"exceeding conservative {cfg['max_km']} km service boundary"
                    ),
                    evidence={
                        "region": region,
                        "lat": lat,
                        "lon": lon,
                        "distance_km": round(dist, 2),
                        "max_allowed_km": cfg["max_km"],
                    },
                )
        elif region == "UNKNOWN":
            # Unknown region remains review-required
            if report.profile in {ValidationProfile.AUDIT, ValidationProfile.PROMOTION}:
                report.add_issue(
                    code=codes.TRN_COORDINATE_SERVICE_AREA_MISMATCH,
                    severity=ValidationSeverity.INFO,
                    domain="transit",
                    entity_type="stop",
                    entity_id=sid,
                    field="coordinate",
                    message=f"Stop '{sid}' has coordinates ({lat}, {lon}) in unmapped region '{region}'; manual review required",
                    evidence={"lat": lat, "lon": lon, "review_status": "REVIEW_REQUIRED"},
                )



def validate_transit_route(
    route: Dict[str, Any],
    report: ValidationReport,
    valid_providers: Optional[Set[str]] = None,
) -> None:
    rid = str(route.get("route_id") or route.get("id") or "route")
    provider = route.get("provider") or route.get("operator") or route.get("provider_id")
    data_tier = str(route.get("data_tier", "")).strip().lower()
    live_source = route.get("live_telemetry_source") or route.get("telemetry_source")

    # 1. Provider Identity Check
    if valid_providers is not None and provider:
        p_str = str(provider).strip()
        if p_str not in valid_providers:
            report.add_issue(
                code=codes.TRN_UNKNOWN_PROVIDER,
                severity=ValidationSeverity.ERROR,
                domain="transit",
                entity_type="route",
                entity_id=rid,
                field="provider",
                message=f"Route '{rid}' references unrecognized provider '{provider}'",
                evidence={"provider": provider},
            )

    # 2. Split Transit Truth: Live Claim Without Realtime Source (Correction #3)
    if data_tier == "live" and not live_source:
        report.add_issue(
            code=codes.TRN_LIVE_CLAIM_WITHOUT_REALTIME_SOURCE,
            severity=ValidationSeverity.ERROR,
            domain="transit",
            entity_type="route",
            entity_id=rid,
            field="data_tier",
            message=f"Route '{rid}' represents data_tier as 'live' without a genuine realtime vehicle telemetry source",
            evidence={"data_tier": data_tier, "telemetry_source": live_source},
        )


def validate_route_stops(
    route_id: str,
    stop_items: List[Dict[str, Any]],
    known_stop_ids: Set[str],
    report: ValidationReport,
) -> None:
    seen_seqs: Set[int] = set()
    prev_seq: Optional[int] = None

    for item in stop_items:
        seq = item.get("sequence")
        sid = str(item.get("stop_id", "")).strip()

        # 1. Duplicate sequence position
        if seq is not None:
            if seq in seen_seqs:
                report.add_issue(
                    code=codes.TRN_DUPLICATE_SEQUENCE,
                    severity=ValidationSeverity.ERROR,
                    domain="transit",
                    entity_type="route_stop",
                    entity_id=route_id,
                    field="sequence",
                    message=f"Route '{route_id}' contains duplicate sequence position {seq}",
                    evidence={"duplicate_sequence": seq},
                )
            else:
                seen_seqs.add(seq)
                if prev_seq is not None and seq > prev_seq + 1:
                    report.add_issue(
                        code=codes.TRN_SEQUENCE_GAP,
                        severity=ValidationSeverity.WARNING,
                        domain="transit",
                        entity_type="route_stop",
                        entity_id=route_id,
                        field="sequence",
                        message=f"Route '{route_id}' sequence jumps from {prev_seq} to {seq}",
                        evidence={"prev_sequence": prev_seq, "current_sequence": seq},
                    )
                prev_seq = seq

        # 2. Unknown stop ID
        if sid and sid not in known_stop_ids and not sid.startswith("stop_crut_unresolved_"):
            report.add_issue(
                code=codes.TRN_UNKNOWN_STOP,
                severity=ValidationSeverity.ERROR,
                domain="transit",
                entity_type="route_stop",
                entity_id=route_id,
                field="stop_id",
                message=f"Route '{route_id}' sequence item references non-existent stop_id '{sid}'",
                evidence={"unknown_stop_id": sid},
            )


def validate_transit_schedule(
    schedule: Dict[str, Any],
    report: ValidationReport,
    known_route_ids: Optional[Set[str]] = None,
) -> None:
    sched_id = str(schedule.get("schedule_id") or schedule.get("id") or "sched")
    route_id = str(schedule.get("route_id", "")).strip()
    departures = schedule.get("departure_times", [])

    if known_route_ids is not None and route_id and route_id not in known_route_ids:
        report.add_issue(
            code=codes.TRN_UNKNOWN_PROVIDER,
            severity=ValidationSeverity.ERROR,
            domain="transit",
            entity_type="schedule",
            entity_id=sched_id,
            field="route_id",
            message=f"Schedule '{sched_id}' references unknown route_id '{route_id}'",
            evidence={"route_id": route_id},
        )

    # Validate HH:MM regex
    for t in departures:
        t_str = str(t).strip()
        if not TIME_HHMM_REGEX.match(t_str):
            report.add_issue(
                code=codes.TRN_INVALID_SCHEDULE_TIME,
                severity=ValidationSeverity.ERROR,
                domain="transit",
                entity_type="schedule",
                entity_id=sched_id,
                field="departure_times",
                message=f"Schedule '{sched_id}' contains invalid HH:MM timestamp '{t_str}'",
                evidence={"invalid_time": t_str},
            )

    # Validate service-day ordering (Correction #4)
    if departures and not is_service_day_sorted([str(t).strip() for t in departures]):
        report.add_issue(
            code=codes.TRN_SCHEDULE_NOT_SORTED,
            severity=ValidationSeverity.ERROR,
            domain="transit",
            entity_type="schedule",
            entity_id=sched_id,
            field="departure_times",
            message=f"Schedule '{sched_id}' departure times are not monotonically advancing in service-day time",
            evidence={"departure_times": departures[:10]},
        )