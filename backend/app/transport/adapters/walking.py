"""Deterministic straight-line walking calculations; this is not road navigation."""
from dataclasses import dataclass
from math import asin, ceil, cos, isfinite, radians, sin, sqrt


WALKING_METERS_PER_MINUTE = 80
MAX_WALKING_DISTANCE_METERS = 2000  # 2.0 km
MAX_TRANSIT_TRANSFER_WALK_METERS = 1500  # 1.5 km


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


def road_distance_meters(start: Coordinate, end: Coordinate) -> int:
    """Return estimated road network distance in metres using highway/road curvature factor (~1.25x)."""
    direct = walking_distance_meters(start, end)
    return round(direct * 1.25)


def road_minutes(distance_meters: int) -> int:
    """Calculate realistic road duration in minutes.
    - Urban / local (<= 15 km): ~25 km/h (417 m/min)
    - Regional / highway (> 15 km): ~50 km/h (833 m/min)
    """
    if distance_meters <= 15_000:
        return max(1, ceil(distance_meters / (25_000 / 60)))
    # 15km urban base = 36 min, remaining distance at 55 km/h
    remainder = distance_meters - 15_000
    return max(1, ceil(36 + remainder / (55_000 / 60)))
