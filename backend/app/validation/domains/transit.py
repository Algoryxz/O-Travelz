"""
Transit Domain Validator.
Enforces provider integrity, route-stop sequence ordering, service-day overnight timetable
sorting, and split transit truth boundaries (provenance and live claims).
"""
from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Set
from app.validation import codes
from app.validation.models import ValidationReport, ValidationSeverity

TIME_HHMM_REGEX = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")


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
    c_status = str(stop.get("coordinate_status", "")).strip().upper()
    lat = stop.get("lat")
    lon = stop.get("lon")
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
    if c_status in {"VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL", "RESOLVED_HIGH_CONFIDENCE"}:
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