"""Canonical Odisha district registry and helper functions.

Central authority for all 30 administrative districts of Odisha.
"""
from __future__ import annotations

from app.core.regions import (
    ODISHA_DISTRICTS,
    CANONICAL_REGIONS,
    DISTRICT_TO_REGION_MAP,
    get_region_for_place,
    validate_district,
)

__all__ = [
    "ODISHA_DISTRICTS",
    "CANONICAL_REGIONS",
    "DISTRICT_TO_REGION_MAP",
    "get_region_for_place",
    "validate_district",
]
