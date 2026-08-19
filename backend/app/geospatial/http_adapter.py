"""Thin HTTP binding for the accepted Phase 6A projection core."""
from __future__ import annotations

import re
import struct

from sqlalchemy.exc import SQLAlchemyError

from app.geospatial.projection import project_map
from app.schemas.map_projection import (
    ApprovedFeatureGeometry,
    AuthorizedCanonicalRef,
    CanonicalRef,
    LineStringGeometry,
    MapProjectionHTTPRequest,
    MapProjectionRequest,
    MapProjectionResponse,
    PointGeometry,
)


def _determine_region(name: str | None) -> str | None:
    if not name:
        return None
    name_lower = name.lower()
    if any(k in name_lower for k in ["puri", "gundicha", "swargadwar"]):
        return "Puri & Coastal"
    if any(k in name_lower for k in ["konark", "chandrabhaga", "ramachandi"]):
        return "Konark & Marine"
    if any(k in name_lower for k in ["cuttack", "barabati", "chandi", "maritime", "netaji"]):
        return "Cuttack & Mahanadi"
    if any(k in name_lower for k in ["chilika", "kalijai", "mangalajodi", "gopalpur", "tara tarini"]):
        return "Chilika & Southern Coast"
    if any(k in name_lower for k in ["daringbadi", "midubanda", "coffee", "belghar", "kandhamal"]):
        return "Kandhamal & Southern Hills"
    if any(k in name_lower for k in ["hirakud", "samaleswari", "huma", "debrigarh", "sambalpur"]):
        return "Sambalpur & Western Odisha"
    if any(k in name_lower for k in ["rourkela", "hanuman vatika", "mandira", "khandadhar", "sundargarh"]):
        return "Rourkela & Sundargarh"
    if any(k in name_lower for k in ["similipal", "barehipani", "bhitarkanika", "chandipur", "balasore", "mayurbhanj"]):
        return "Northern Odisha & Wildlife"
    if any(k in name_lower for k in ["koraput", "deomali", "gupteswar", "duduma", "kolab", "rayagada", "majhigouri"]):
        return "Koraput & Tribal Highlands"
    return "Bhubaneswar & Central"


class MapProjectionHTTPError(Exception):
    """Structured failure raised by the map HTTP adapter."""

    def __init__(
        self,
        code: str,
        message: str,
        field: str | None = None,
        status_code: int = 422,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.field = field
        self.status_code = status_code


class MapProjectionHTTPAdapter:
    """Bind public typed UUIDs to exact backend facts, then invoke the core."""

    def __init__(self, db) -> None:
        self._db = db

    def project(self, request: MapProjectionHTTPRequest) -> MapProjectionResponse:
        requested_refs = [
            CanonicalRef(entity=item.entity, id=str(item.id))
            for item in request.requested_features
        ]

        if not requested_refs and not request.requested_hops:
            raise MapProjectionHTTPError(
                code="empty_requested_feature_set",
                message="requested_features must contain at least one feature",
                field="requested_features",
            )

        approved_features = []
        for item, requested_ref in zip(request.requested_features, requested_refs):
            model = self._model_for_entity(item.entity)
            try:
                record = self._db.get(model, item.id)
            except SQLAlchemyError as error:
                raise MapProjectionHTTPError(
                    code="internal_projection_error",
                    message="Map projection failed",
                    status_code=500,
                ) from error
            if record is None:
                continue
            approved_features.append(self._approved_feature(record, requested_ref))

        core_request = MapProjectionRequest(
            requested_features=requested_refs,
            approved_features=approved_features,
            requested_hops=request.requested_hops,
        )
        try:
            return project_map(core_request)
        except MapProjectionHTTPError:
            raise
        except Exception as error:
            raise MapProjectionHTTPError(
                code="internal_projection_error",
                message="Map projection failed",
                status_code=500,
            ) from error

    @staticmethod
    def _model_for_entity(entity: str):
        # This is an explicit typed namespace map.  No alternate identifier enters
        # resolution and no generic "trusted canonical ref" path exists.
        from app.models.place import Place
        from app.models.transport import Route, Stop

        return {"place": Place, "stop": Stop, "route": Route}[entity]

    @staticmethod
    def _approved_feature(record: object, requested_ref: CanonicalRef) -> ApprovedFeatureGeometry:
        authorized_ref = AuthorizedCanonicalRef.from_backend_record(record)
        if authorized_ref.canonical_ref != requested_ref:
            raise MapProjectionHTTPError(
                code="internal_projection_error",
                message="Typed backend identity binding failed",
                status_code=500,
            )

        entity = authorized_ref.entity
        name = getattr(record, "name", None)
        category = None
        if entity == "place":
            if hasattr(record, "category") and record.category:
                category = record.category.name
        elif entity == "stop":
            category = "stop"
        elif entity == "route":
            category = "route"

        region = _determine_region(name) if entity == "place" else None

        raw_geometry = getattr(record, "geometry", None) if entity == "route" else getattr(record, "location", None)
        if raw_geometry is None:
            unavailable_reason = "source_missing" if entity == "route" else "coordinate_unverified"
            return ApprovedFeatureGeometry(
                authorized_ref=authorized_ref,
                geometry=None,
                unavailable_reason=unavailable_reason,
                name=name,
                category=category,
                region=region,
            )

        try:
            geometry_kind, coordinates = _decode_backend_geometry(raw_geometry)
            if entity == "route":
                if geometry_kind != "LineString":
                    raise ValueError("route geometry must be a LineString")
                geometry = LineStringGeometry(
                    type="LineString",
                    coordinates=coordinates,
                )
            else:
                if geometry_kind != "Point":
                    raise ValueError(f"{entity} geometry must be a Point")
                geometry = PointGeometry(
                    type="Point",
                    coordinates=coordinates[0],
                )
            return ApprovedFeatureGeometry(
                authorized_ref=authorized_ref,
                geometry=geometry,
                name=name,
                category=category,
                region=region,
            )
        except Exception as error:
            raise MapProjectionHTTPError(
                code="invalid_geometry",
                message="Backend geometry is not valid WGS84 geometry",
                field=f"{entity}.geometry",
            ) from error


def _decode_backend_geometry(raw_geometry: object) -> tuple[str, list[tuple[float, ...]]]:
    """Decode existing WKT/WKB backend values without adding a geometry dependency."""

    data = getattr(raw_geometry, "data", raw_geometry)
    srid = getattr(raw_geometry, "srid", None)
    if srid != 4326:
        raise ValueError("backend geometry must declare WGS84 / EPSG:4326")

    if isinstance(data, str):
        return _decode_wkt(data)
    if isinstance(data, (bytes, bytearray, memoryview)):
        return _decode_wkb(bytes(data))

    # This keeps the adapter compatible with an already-decoded backend geometry
    # object while still accepting only its explicit Point/LineString coordinates.
    geometry_kind = getattr(raw_geometry, "geom_type", None)
    coordinates = getattr(raw_geometry, "coords", None)
    if geometry_kind in {"Point", "LineString"} and coordinates is not None:
        return geometry_kind, [tuple(position) for position in coordinates]
    raise ValueError("unsupported backend geometry representation")


def _decode_wkt(value: str) -> tuple[str, list[tuple[float, ...]]]:
    text = value.strip()
    srid_match = re.match(r"^SRID=(\d+);(.*)$", text, flags=re.IGNORECASE)
    if srid_match:
        if srid_match.group(1) != "4326":
            raise ValueError("backend geometry must use WGS84 / EPSG:4326")
        text = srid_match.group(2).strip()

    match = re.match(
        r"^(POINT|LINESTRING)(?:\s+([ZM]{1,2}))?\s*\((.*)\)$",
        text,
        flags=re.IGNORECASE,
    )
    if not match:
        raise ValueError("backend geometry must be a WGS84 Point or LineString")

    geometry_kind = {"POINT": "Point", "LINESTRING": "LineString"}[match.group(1).upper()]
    body = match.group(3).strip()
    if not body or body.upper() == "EMPTY":
        raise ValueError("empty backend geometry is unavailable, not valid geometry")
    positions = body.split(",")
    coordinates = [tuple(float(number) for number in position.split()) for position in positions]
    if geometry_kind == "Point" and len(coordinates) != 1:
        raise ValueError("Point geometry must contain one position")
    return geometry_kind, coordinates


def _decode_wkb(value: bytes) -> tuple[str, list[tuple[float, ...]]]:
    if len(value) < 5:
        raise ValueError("backend WKB geometry is truncated")
    byte_order = "<" if value[0] == 1 else ">" if value[0] == 0 else None
    if byte_order is None:
        raise ValueError("backend WKB geometry has an invalid byte order")

    offset = 1

    def read(format_string: str):
        nonlocal offset
        size = struct.calcsize(byte_order + format_string)
        if offset + size > len(value):
            raise ValueError("backend WKB geometry is truncated")
        result = struct.unpack_from(byte_order + format_string, value, offset)
        offset += size
        return result[0]

    type_word = read("I")
    has_z = bool(type_word & 0x80000000)
    has_m = bool(type_word & 0x40000000)
    has_srid = bool(type_word & 0x20000000)
    base_type = type_word & 0x0FFFFFFF
    if base_type >= 1000:
        has_z = has_z or base_type // 1000 in (1, 3)
        has_m = has_m or base_type // 1000 in (2, 3)
        base_type %= 1000
    if base_type not in (1, 2):
        raise ValueError("backend WKB geometry must be a Point or LineString")
    if has_srid and read("I") != 4326:
        raise ValueError("backend geometry must use WGS84 / EPSG:4326")

    dimensions = 2 + int(has_z) + int(has_m)

    def read_position() -> tuple[float, ...]:
        return tuple(read("d") for _ in range(dimensions))

    if base_type == 1:
        coordinates = [read_position()]
        geometry_kind = "Point"
    else:
        count = read("I")
        coordinates = [read_position() for _ in range(count)]
        geometry_kind = "LineString"
    return geometry_kind, coordinates


__all__ = ["MapProjectionHTTPAdapter", "MapProjectionHTTPError"]
