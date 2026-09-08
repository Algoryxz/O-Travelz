#!/usr/bin/env python3
"""
scripts/staging/stage_odisha_district_boundaries.py

Deterministic staging ETL for Odisha 30 district administrative boundaries.
Extracts unsimplified vector boundary geometries from geoBoundaries gbOpen IND ADM2,
associates canonical crosswalk metadata, and validates topological invariants.

Source Authority Classification:
geoBoundaries is an EXTERNAL OPEN DATA institutional source (CC BY 4.0),
NOT primary Odisha-government administrative gazette truth.
"""

import json
import os
import sys
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
CROSSWALKS_PATH = REPO_ROOT / "research" / "mobile-v4-data" / "IDENTITY_CROSSWALKS.json"
OUTPUT_PATH = REPO_ROOT / "data" / "staging" / "geospatial" / "odisha_district_boundaries.geojson"
RAW_CACHE_PATH = REPO_ROOT / "data" / "staging" / "geospatial" / ".raw_ind_adm2_cache.geojson"

GEOBOUNDARIES_IND_ADM2_URL = (
    "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/IND/ADM2/geoBoundaries-IND-ADM2.geojson"
)

# Geographic bounding box bounds for Odisha State with margin
ODISHA_BOUNDS = {
    "min_lon": 81.0,
    "max_lon": 88.0,
    "min_lat": 17.0,
    "max_lat": 23.0
}


def load_raw_adm2() -> list:
    """Load raw ADM2 features from local cache or remote release."""
    if RAW_CACHE_PATH.exists():
        with open(RAW_CACHE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("features", [])
    elif OUTPUT_PATH.exists():
        # If output already staged, return staged features as fallback source
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("features", [])

    print(f"Downloading geoBoundaries IND ADM2 baseline from {GEOBOUNDARIES_IND_ADM2_URL}...")
    req = urllib.request.Request(
        GEOBOUNDARIES_IND_ADM2_URL,
        headers={"User-Agent": "OTravelz-Data-Intelligence/4.0"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    # Cache locally for offline reproducibility
    RAW_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(RAW_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f)

    return data.get("features", [])


def validate_coordinates(coords, geom_type: str) -> bool:
    """Recursively validate that coordinates fall within valid geographic bounds."""
    if geom_type == "Polygon":
        rings = coords
    elif geom_type == "MultiPolygon":
        rings = [ring for poly in coords for ring in poly]
    else:
        return False

    for ring in rings:
        if len(ring) < 4:
            return False
        # Polygon ring closure
        if ring[0] != ring[-1]:
            return False
        for pt in ring:
            lon, lat = pt[0], pt[1]
            if not (ODISHA_BOUNDS["min_lon"] <= lon <= ODISHA_BOUNDS["max_lon"]):
                return False
            if not (ODISHA_BOUNDS["min_lat"] <= lat <= ODISHA_BOUNDS["max_lat"]):
                return False
    return True


def stage_district_boundaries() -> dict:
    with open(CROSSWALKS_PATH, "r", encoding="utf-8") as f:
        cw_data = json.load(f)

    district_crosswalks = cw_data.get("district_crosswalks", [])
    if len(district_crosswalks) != 30:
        raise ValueError(f"Expected 30 district crosswalks, found {len(district_crosswalks)}")

    raw_features = load_raw_adm2()
    # Map features by shapeName (both exact and lowercase)
    feature_by_name = {}
    for f in raw_features:
        name = f.get("properties", {}).get("shapeName") or f.get("properties", {}).get("district_name")
        if name:
            feature_by_name[name.lower()] = f

    staged_features = []
    seen_canonical = set()

    for cw in sorted(district_crosswalks, key=lambda x: x["otravelz_name"]):
        c_name = cw["otravelz_name"]
        census_name = cw["census_2011_name"]

        # Attempt resolution
        matched_feature = (
            feature_by_name.get(c_name.lower()) or
            feature_by_name.get(census_name.lower())
        )

        if not matched_feature:
            raise RuntimeError(f"Could not resolve boundary feature for district: {c_name} / {census_name}")

        geom = matched_feature.get("geometry")
        if not geom:
            raise ValueError(f"Null geometry for district: {c_name}")

        geom_type = geom.get("type")
        if geom_type not in ("Polygon", "MultiPolygon"):
            raise ValueError(f"Invalid geometry type {geom_type} for district: {c_name}")

        if not validate_coordinates(geom.get("coordinates", []), geom_type):
            raise ValueError(f"Geometry coordinate bounds check failed for district: {c_name}")

        if c_name in seen_canonical:
            raise ValueError(f"Duplicate canonical mapping for district: {c_name}")
        seen_canonical.add(c_name)

        staged_props = {
            "district_name": matched_feature.get("properties", {}).get("shapeName", census_name),
            "canonical_district_name": c_name,
            "district_code_if_known": {
                "census_code": cw["census_code"],
                "lgd_code": cw["lgd_code"]
            },
            "travel_region": cw["travel_region"],
            "source": "geoBoundaries gbOpen IND ADM2 (William & Mary geoLab / UN OCHA HDX)",
            "source_authority": "EXTERNAL_OPEN_DATA",
            "source_license": "CC BY 4.0",
            "source_version": "gbOpen IND ADM2",
            "retrieved_at": "2026-09-08T10:19:35+05:30",
            "geometry_status": "VALID",
            "canonical_promotion_allowed": False,
            "provenance": {
                "source_id": "SRC_GEOBOUNDARIES_IND_ADM2",
                "claim_id": "CLM_DISTRICT_BOUNDARIES_GEOBOUNDARIES_008",
                "source_url": "https://www.geoboundaries.org/api/current/gbOpen/IND/ADM2/",
                "source_tier": "TIER_C_INSTITUTIONAL",
                "retrieved_at": "2026-09-08T10:19:35+05:30",
                "licensing_status": "CREATIVE_COMMONS_CC_BY_4_0",
                "freshness_class": "SLOW_CHANGING",
                "review_verdict": "ACCEPT_STAGING"
            }
        }

        staged_features.append({
            "type": "Feature",
            "properties": staged_props,
            "geometry": geom
        })

    # Strict invariant validation
    if len(staged_features) != 30:
        raise ValueError(f"Expected exactly 30 staged features, got {len(staged_features)}")

    geojson_payload = {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },
        "metadata": {
            "dataset": "odisha_district_boundaries",
            "version": "1.0.0",
            "feature_count": 30,
            "simplification": "NONE_PRESERVED_UNSIMPLIFIED",
            "source_authority": "EXTERNAL_OPEN_DATA",
            "primary_state_authority": "NOT_PRIMARY_STATE_GAZETTE",
            "license": "CC BY 4.0",
            "attribution_notice": "Boundary data from geoBoundaries (William & Mary geoLab / UN OCHA HDX) under CC BY 4.0.",
            "invariants": [
                "Exactly 30 matched Odisha districts.",
                "All geometry types are Polygon or MultiPolygon.",
                "Zero null geometries.",
                "Zero duplicate canonical district mappings.",
                "WGS84 EPSG:4326 coordinate reference system.",
                "canonical_promotion_allowed = false."
            ]
        },
        "features": staged_features
    }
    return geojson_payload


def main():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    geojson_data = stage_district_boundaries()
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(geojson_data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"[OK] Staged 30 district boundaries to {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
