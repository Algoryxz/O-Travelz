"""Validation primitives for supplied WGS84 geometry.

These helpers validate geometry that an approved source or backend contract supplies;
they do not create geometry, calculate routes, calculate distances, or choose providers.
``None`` is deliberately preserved as an unknown/unavailable geometry state.
"""

from collections.abc import Iterable, Sequence
from math import isfinite
from numbers import Real
from typing import TypeAlias


Coordinate: TypeAlias = tuple[float, float]


class GeometryValidationError(ValueError):
    """Raised when supplied coordinate or line geometry is not valid WGS84 data."""


def validate_coordinate(longitude: object, latitude: object) -> Coordinate:
    """Return a validated ``(longitude, latitude)`` pair.

    The argument order mirrors the persistence semantics: longitude is X and latitude
    is Y. Strings and booleans are rejected so validation cannot silently coerce
    malformed source data into geometry.
    """

    x = _finite_number(longitude, "longitude")
    y = _finite_number(latitude, "latitude")
    if not -180.0 <= x <= 180.0:
        raise GeometryValidationError("longitude must be within [-180, 180]")
    if not -90.0 <= y <= 90.0:
        raise GeometryValidationError("latitude must be within [-90, 90]")
    return x, y


def validate_optional_coordinate(
    longitude: object | None, latitude: object | None
) -> Coordinate | None:
    """Validate a point, preserving a paired ``None`` as unknown geometry."""

    if longitude is None and latitude is None:
        return None
    if longitude is None or latitude is None:
        raise GeometryValidationError("longitude and latitude must be provided together")
    return validate_coordinate(longitude, latitude)


def validate_linestring(
    points: Iterable[Sequence[object]] | None,
) -> tuple[Coordinate, ...] | None:
    """Validate supplied LineString positions, preserving ``None`` as unavailable.

    A line requires at least two positions. This function only validates supplied
    positions; it never derives a line from stops, endpoints, or sequence order.
    """

    if points is None:
        return None

    normalized: list[Coordinate] = []
    for index, point in enumerate(points):
        if isinstance(point, (str, bytes)) or len(point) != 2:
            raise GeometryValidationError(
                f"LineString position {index} must contain longitude and latitude"
            )
        try:
            normalized.append(validate_coordinate(point[0], point[1]))
        except GeometryValidationError as error:
            raise GeometryValidationError(
                f"LineString position {index}: {error}"
            ) from error

    if len(normalized) < 2:
        raise GeometryValidationError("LineString requires at least two positions")
    return tuple(normalized)


def _finite_number(value: object, label: str) -> float:
    if isinstance(value, bool) or not isinstance(value, Real):
        raise GeometryValidationError(f"{label} must be a finite number")
    number = float(value)
    if not isfinite(number):
        raise GeometryValidationError(f"{label} must be a finite number")
    return number


__all__ = [
    "Coordinate",
    "GeometryValidationError",
    "validate_coordinate",
    "validate_optional_coordinate",
    "validate_linestring",
]
