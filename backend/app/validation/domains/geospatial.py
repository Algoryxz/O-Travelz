"""
Geospatial Domain Validator.
Enforces domain-aware coordinate validation, WGS84 limits, lat/lon swap detection,
and unresolved-coordinate gates.
"""
from __future__ import annotations

from typing import Any, Dict, Optional
from app.validation import codes
from app.validation.models import ValidationReport, ValidationSeverity

ODISHA_BOUNDS = {
    "min_lat": 17.5,
    "max_lat": 23.0,
    "min_lon": 81.0,
    "max_lon": 88.0,
}

EXTERNAL_ENTITY_TYPES = {
    "airport",
    "railway_connection",
    "external_hub",
    "interstate_node",
    "multimodal_external_node",
}


def validate_geospatial(
    record: Dict[str, Any],
    entity_type: str,
    report: ValidationReport,
    lat_field: str = "lat",
    lon_field: str = "lon",
) -> None:
    entity_id = record.get("id") or record.get("research_id") or record.get("stop_id") or "unknown"
    lat = record.get(lat_field)
    lon = record.get(lon_field)
    coord_status = str(record.get("coordinate_status", "")).strip().upper()
    is_unresolved = (
        coord_status == "UNRESOLVED"
        or record.get("geographic_status") == "unresolved"
        or record.get("verification_status") == "UNAVAILABLE"
    )

    # 1. Unresolved Coordinates Gate (Blocking ERROR if non-null)
    if is_unresolved:
        if lat is not None or lon is not None:
            report.add_issue(
                code=codes.GEO_UNRESOLVED_NON_NULL,
                severity=ValidationSeverity.ERROR,
                domain="geospatial",
                entity_type=entity_type,
                entity_id=str(entity_id),
                field=f"{lat_field}/{lon_field}",
                message=f"{entity_type} '{entity_id}' is marked UNRESOLVED but contains non-null coordinates ({lat}, {lon})",
                evidence={"lat": lat, "lon": lon, "coordinate_status": coord_status},
            )
        return

    # If coordinates are genuinely null for an unresolved / pending entity
    if lat is None or lon is None:
        if coord_status in {"VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL", "RESOLVED_HIGH_CONFIDENCE"}:
            report.add_issue(
                code=codes.GEO_MISSING_COORDINATES,
                severity=ValidationSeverity.WARNING,
                domain="geospatial",
                entity_type=entity_type,
                entity_id=str(entity_id),
                field=f"{lat_field}/{lon_field}",
                message=f"{entity_type} '{entity_id}' has verified status '{coord_status}' but coordinates are null",
                evidence={"coordinate_status": coord_status},
            )
        return

    # Coerce to float
    try:
        f_lat = float(lat)
        f_lon = float(lon)
    except (ValueError, TypeError):
        report.add_issue(
            code=codes.GEO_OUT_OF_WGS84,
            severity=ValidationSeverity.ERROR,
            domain="geospatial",
            entity_type=entity_type,
            entity_id=str(entity_id),
            field=f"{lat_field}/{lon_field}",
            message=f"{entity_type} '{entity_id}' coordinates are not valid numbers: ({lat}, {lon})",
            evidence={"lat": lat, "lon": lon},
        )
        return

    # 2. Universal WGS84 Range Check (Universally Blocking ERROR)
    if not (-90.0 <= f_lat <= 90.0) or not (-180.0 <= f_lon <= 180.0):
        report.add_issue(
            code=codes.GEO_OUT_OF_WGS84,
            severity=ValidationSeverity.ERROR,
            domain="geospatial",
            entity_type=entity_type,
            entity_id=str(entity_id),
            field=f"{lat_field}/{lon_field}",
            message=f"{entity_type} '{entity_id}' coordinates ({f_lat}, {f_lon}) outside valid WGS84 range",
            evidence={"lat": f_lat, "lon": f_lon},
        )
        return

    # 3. Lat / Lon Transposition Swap Detection (Universally Blocking ERROR)
    # E.g. Latitude > 80 (typical India longitude) and Longitude < 25 (typical Odisha latitude)
    if f_lat > 75.0 and f_lon < 30.0:
        report.add_issue(
            code=codes.GEO_LAT_LON_SWAP,
            severity=ValidationSeverity.ERROR,
            domain="geospatial",
            entity_type=entity_type,
            entity_id=str(entity_id),
            field=f"{lat_field}/{lon_field}",
            message=f"{entity_type} '{entity_id}' detected likely lat/lon swap: lat={f_lat}, lon={f_lon}",
            evidence={"lat": f_lat, "lon": f_lon},
        )
        return

    # 4. Domain-Aware Expected Region Check
    # External nodes (intercity stations, external airports, multimodal links) are allowed outside Odisha.
    is_external = (
        entity_type in EXTERNAL_ENTITY_TYPES
        or record.get("is_external") is True
        or str(record.get("region", "")).lower() in {"external", "interstate", "national"}
        or str(record.get("district", "")).lower() in {"howrah", "kolkata", "visakhapatnam", "hyderabad", "raipur"}
    )

    if not is_external:
        in_odisha = (
            ODISHA_BOUNDS["min_lat"] <= f_lat <= ODISHA_BOUNDS["max_lat"]
            and ODISHA_BOUNDS["min_lon"] <= f_lon <= ODISHA_BOUNDS["max_lon"]
        )
        if not in_odisha:
            report.add_issue(
                code=codes.GEO_OUT_OF_EXPECTED_REGION,
                severity=ValidationSeverity.ERROR,
                domain="geospatial",
                entity_type=entity_type,
                entity_id=str(entity_id),
                field=f"{lat_field}/{lon_field}",
                message=f"Odisha-native {entity_type} '{entity_id}' coordinates ({f_lat}, {f_lon}) outside Odisha bounds",
                evidence={"lat": f_lat, "lon": f_lon, "bounds": ODISHA_BOUNDS},
            )