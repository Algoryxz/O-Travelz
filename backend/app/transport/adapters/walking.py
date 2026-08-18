"""Deterministic straight-line walking calculations; this is not road navigation."""
from dataclasses import dataclass
from math import asin, ceil, cos, isfinite, radians, sin, sqrt


WALKING_METERS_PER_MINUTE = 80


@dataclass(frozen=True)
class Coordinate:
    latitude: float
    longitude: float

    def __post_init__(self) -> None:
        if not isfinite(self.latitude) or not -90 <= self.latitude <= 90:
            raise ValueError("latitude must be finite and within [-90, 90]")
        if not isfinite(self.longitude) or not -180 <= self.longitude <= 180:
            raise ValueError("longitude must be finite and within [-180, 180]")


def walking_distance_meters(start: Coordinate, end: Coordinate) -> int:
    """Return haversine distance rounded to metres using verified endpoint geometry."""
    radius_m = 6_371_000
    lat_delta = radians(end.latitude - start.latitude)
    lon_delta = radians(end.longitude - start.longitude)
    a = sin(lat_delta / 2) ** 2 + cos(radians(start.latitude)) * cos(radians(end.latitude)) * sin(lon_delta / 2) ** 2
    return round(2 * radius_m * asin(sqrt(a)))


def walking_minutes(distance_meters: int) -> int:
    return ceil(distance_meters / WALKING_METERS_PER_MINUTE)
