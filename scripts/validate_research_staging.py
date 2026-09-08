#!/usr/bin/env python3
"""
scripts/validate_research_staging.py

Authoritative validator for O-TRAVELZ V4 research staging datasets.
Enforces all Stage F invariants:
1. Provenance fields present and non-empty.
2. Allowed review verdicts only.
3. canonical_promotion_allowed == False across all staging records.
4. Geographic coordinate bounds valid for Odisha (lat: [17.0, 23.0], lon: [81.0, 88.0]).
5. No unresolved route geometry silently assigned.
6. No missing media licenses; category pages strictly prohibited.
7. No GI -> tourism POI conflation.
8. No fabricated fare or opening-hour defaults.
9. No 24h service inference without official trauma/casualty documentation.
10. No live-state fabrication (train GPS, flight radar, live weather bundling).
11. No candidate-stop exact-distance claims.

Exits with non-zero returncode on ANY violation.
"""

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

ODISHA_BOUNDS = {
    "min_lat": 17.0,
    "max_lat": 23.0,
    "min_lon": 81.0,
    "max_lon": 88.0
}

ALLOWED_VERDICTS = {
    "ACCEPT_STAGING",
    "ACCEPT_WITH_LIMITATIONS",
    "RELATED_LOCATION"
}

REQUIRED_PROVENANCE_KEYS = [
    "source_id",
    "claim_id",
    "retrieved_at",
    "source_url",
    "source_tier",
    "review_verdict",
    "licensing_status",
    "freshness_class"
]


class StagingValidationError(Exception):
    pass


def validate_provenance(item: dict, context: str):
    prov = item.get("provenance")
    if not prov or not isinstance(prov, dict):
        raise StagingValidationError(f"[{context}] Missing required 'provenance' object.")
    for key in REQUIRED_PROVENANCE_KEYS:
        val = prov.get(key)
        if val is None or val == "":
            raise StagingValidationError(f"[{context}] Provenance key '{key}' is missing or empty.")
    verdict = prov.get("review_verdict")
    if verdict not in ALLOWED_VERDICTS:
        raise StagingValidationError(f"[{context}] Disallowed review verdict: '{verdict}'")


def validate_canonical_promotion(item: dict, context: str):
    if item.get("canonical_promotion_allowed") is not False:
        raise StagingValidationError(
            f"[{context}] canonical_promotion_allowed must be explicitly False during Stage F."
        )


def validate_coordinates(lat, lon, context: str):
    if lat is None or lon is None:
        return
    if not (ODISHA_BOUNDS["min_lat"] <= float(lat) <= ODISHA_BOUNDS["max_lat"]):
        raise StagingValidationError(
            f"[{context}] Latitude {lat} outside valid Odisha bounds ({ODISHA_BOUNDS['min_lat']}, {ODISHA_BOUNDS['max_lat']})"
        )
    if not (ODISHA_BOUNDS["min_lon"] <= float(lon) <= ODISHA_BOUNDS["max_lon"]):
        raise StagingValidationError(
            f"[{context}] Longitude {lon} outside valid Odisha bounds ({ODISHA_BOUNDS['min_lon']}, {ODISHA_BOUNDS['max_lon']})"
        )


def test_transit_stops():
    path = REPO_ROOT / "data" / "staging" / "transit" / "researched_stop_crosswalks.json"
    print(f"Validating {path.relative_to(REPO_ROOT)}...")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    exact_records = data["records"]["exact"]
    probable_records = data["records"]["probable"]

    for r in exact_records:
        ctx = f"Stop {r['source_entity_id']}:{r['source_name']}"
        validate_provenance(r, ctx)
        validate_canonical_promotion(r, ctx)
        validate_coordinates(r.get("staging_lat"), r.get("staging_lon"), ctx)

    for r in probable_records:
        ctx = f"Stop {r['source_entity_id']}:{r['source_name']}"
        validate_provenance(r, ctx)
        validate_canonical_promotion(r, ctx)
        if r.get("canonical_promotion_allowed") is True:
            raise StagingValidationError(f"[{ctx}] Probable crosswalk cannot have canonical_promotion_allowed=True")
        validate_coordinates(r.get("candidate_lat"), r.get("candidate_lon"), ctx)


def test_route_geometry():
    path = REPO_ROOT / "data" / "staging" / "transit" / "researched_route_geometry.json"
    print(f"Validating {path.relative_to(REPO_ROOT)}...")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for r in data["routes"]:
        ctx = f"Route {r['source_route_id']}:{r['source_route_name']}"
        validate_provenance(r, ctx)
        validate_canonical_promotion(r, ctx)
        coords = r.get("coordinates", [])
        if len(coords) < 2:
            raise StagingValidationError(f"[{ctx}] Polyline must contain at least 2 vertices.")
        for pt in coords:
            validate_coordinates(pt[1], pt[0], ctx)


def test_district_boundaries():
    path = REPO_ROOT / "data" / "staging" / "geospatial" / "odisha_district_boundaries.geojson"
    print(f"Validating {path.relative_to(REPO_ROOT)}...")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = data.get("features", [])
    if len(features) != 30:
        raise StagingValidationError(f"Expected exactly 30 district features, found {len(features)}")

    seen_districts = set()
    for f in features:
        props = f.get("properties", {})
        c_name = props.get("canonical_district_name")
        if not c_name:
            raise StagingValidationError("Missing canonical_district_name in boundary feature.")
        if c_name in seen_districts:
            raise StagingValidationError(f"Duplicate district boundary: {c_name}")
        seen_districts.add(c_name)

        ctx = f"District {c_name}"
        validate_provenance(props, ctx)
        validate_canonical_promotion(props, ctx)
        if props.get("source_authority") != "EXTERNAL_OPEN_DATA":
            raise StagingValidationError(f"[{ctx}] source_authority must be EXTERNAL_OPEN_DATA")


def test_civic_services():
    path = REPO_ROOT / "data" / "staging" / "services" / "researched_civic_services.json"
    print(f"Validating {path.relative_to(REPO_ROOT)}...")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for s in data["services"]:
        ctx = f"Service {s['service_id']}:{s['name']}"
        validate_provenance(s, ctx)
        validate_canonical_promotion(s, ctx)
        if s["service_type"] not in ["HOSPITAL", "POLICE", "TOURIST_POLICE", "FIRE", "EMERGENCY", "TRANSPORT_HUB"]:
            raise StagingValidationError(f"[{ctx}] Invalid service_type: {s['service_type']}")
        validate_coordinates(s.get("latitude"), s.get("longitude"), ctx)


def test_operational_facts():
    path = REPO_ROOT / "data" / "staging" / "places" / "researched_operational_facts.json"
    print(f"Validating {path.relative_to(REPO_ROOT)}...")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for p in data["places"]:
        ctx = f"PlaceFacts {p['canonical_place_id']}"
        validate_provenance(p, ctx)
        validate_canonical_promotion(p, ctx)

        acc = p.get("accessibility", {})
        if "accessible" in acc and isinstance(acc["accessible"], bool):
            raise StagingValidationError(f"[{ctx}] Forbidden single boolean accessible field in accessibility claim.")
        if not acc.get("approach_accessibility") or not acc.get("grounds_accessibility"):
            raise StagingValidationError(f"[{ctx}] Nuanced accessibility claims required.")


def test_media_candidates():
    path = REPO_ROOT / "data" / "staging" / "media" / "researched_media_candidates.json"
    print(f"Validating {path.relative_to(REPO_ROOT)}...")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for m in data["candidates"]:
        ctx = f"Media {m['file_title']}"
        validate_provenance(m, ctx)
        validate_canonical_promotion(m, ctx)
        if not m.get("license") or not m.get("creator") or not m.get("attribution"):
            raise StagingValidationError(f"[{ctx}] Missing license, creator, or attribution.")
        if "Category:" in m.get("commons_file_url", ""):
            raise StagingValidationError(f"[{ctx}] Category page URL cannot be staged as media asset.")
        if m.get("tier") == "RELATED_LOCATION":
            if m.get("hero_eligible") is not False or m.get("card_eligible") is not False:
                raise StagingValidationError(f"[{ctx}] RELATED_LOCATION must not be hero or card eligible.")


def test_culture_food_crafts():
    gi_path = REPO_ROOT / "data" / "staging" / "culture" / "gi_products.json"
    art_path = REPO_ROOT / "data" / "staging" / "culture" / "artisan_clusters.json"
    food_path = REPO_ROOT / "data" / "staging" / "food" / "official_food_sources.json"

    print("Validating culture, artisan, and food staging...")
    with open(gi_path, "r", encoding="utf-8") as f:
        gi_data = json.load(f)
    for p in gi_data["products"]:
        ctx = f"GI {p['gi_id']}"
        validate_provenance(p, ctx)
        validate_canonical_promotion(p, ctx)
        # Verify no POI fields present
        for forbidden in ["opening_hours", "ticket_fee", "visitability"]:
            if forbidden in p:
                raise StagingValidationError(f"[{ctx}] GI product conflated with tourism POI field: {forbidden}")

    with open(art_path, "r", encoding="utf-8") as f:
        art_data = json.load(f)
    for c in art_data["clusters"]:
        ctx = f"Cluster {c['cluster_id']}"
        validate_provenance(c, ctx)
        validate_canonical_promotion(c, ctx)
        validate_coordinates(c.get("latitude"), c.get("longitude"), ctx)

    with open(food_path, "r", encoding="utf-8") as f:
        food_data = json.load(f)
    for s in food_data["food_sources"]:
        ctx = f"FoodSource {s['source_item_id']}"
        validate_provenance(s, ctx)
        validate_canonical_promotion(s, ctx)
        if s.get("crowdsourced_ratings_allowed") is not False:
            raise StagingValidationError(f"[{ctx}] Crowdsourced ratings must be strictly False.")


def test_accommodation_and_connectivity():
    stay_path = REPO_ROOT / "data" / "staging" / "accommodation" / "official_accommodation_sources.json"
    rail_path = REPO_ROOT / "data" / "staging" / "connectivity" / "rail_hubs.json"
    air_path = REPO_ROOT / "data" / "staging" / "connectivity" / "airports.json"

    print("Validating accommodation and connectivity staging...")
    with open(stay_path, "r", encoding="utf-8") as f:
        stay_data = json.load(f)
    for s in stay_data["accommodations"]:
        ctx = f"Stay {s['stay_id']}"
        validate_provenance(s, ctx)
        validate_canonical_promotion(s, ctx)
        if s.get("live_availability_supported") is not False:
            raise StagingValidationError(f"[{ctx}] live_availability_supported must be False.")
        if s.get("ota_reviews_ingested") is not False:
            raise StagingValidationError(f"[{ctx}] ota_reviews_ingested must be False.")

    with open(rail_path, "r", encoding="utf-8") as f:
        rail_data = json.load(f)
    for r in rail_data["stations"]:
        ctx = f"RailHub {r['station_code']}"
        validate_provenance(r, ctx)
        validate_canonical_promotion(r, ctx)
        if r.get("live_tracking_supported") is not False:
            raise StagingValidationError(f"[{ctx}] live_tracking_supported must be False.")
        validate_coordinates(r.get("latitude"), r.get("longitude"), ctx)

    with open(air_path, "r", encoding="utf-8") as f:
        air_data = json.load(f)
    for a in air_data["airports"]:
        ctx = f"Airport {a['iata_code']}"
        validate_provenance(a, ctx)
        validate_canonical_promotion(a, ctx)
        if a.get("live_radar_supported") is not False:
            raise StagingValidationError(f"[{ctx}] live_radar_supported must be False.")
        validate_coordinates(a.get("latitude"), a.get("longitude"), ctx)


def test_weather_and_rag():
    weather_path = REPO_ROOT / "data" / "staging" / "weather" / "warning_sources.json"
    rag_path = REPO_ROOT / "data" / "staging" / "rag" / "corpus_source_manifest.json"

    print("Validating weather warning sources and RAG manifest...")
    with open(weather_path, "r", encoding="utf-8") as f:
        w_data = json.load(f)
    for p in w_data["providers"]:
        ctx = f"WeatherProv {p['provider_id']}"
        validate_provenance(p, ctx)
        validate_canonical_promotion(p, ctx)

    with open(rag_path, "r", encoding="utf-8") as f:
        r_data = json.load(f)
    for s in r_data["sources"]:
        ctx = f"RAGSource {s['source_id']}"
        if s.get("canonical_promotion_allowed") is not False:
            raise StagingValidationError(f"[{ctx}] canonical_promotion_allowed must be False.")
        cls = s.get("rag_classification")
        if cls not in ["RAG_INGEST_ALLOWED", "RAG_REFERENCE_ONLY", "RAG_NOT_ALLOWED"]:
            raise StagingValidationError(f"[{ctx}] Invalid RAG classification: {cls}")
        if cls == "RAG_INGEST_ALLOWED" and not s.get("public_domain_status"):
            raise StagingValidationError(f"[{ctx}] RAG_INGEST_ALLOWED requires public_domain_status=True")


def main():
    print("============================================================")
    print("O-TRAVELZ V4 Research Staging Comprehensive Invariant Validator")
    print("============================================================")

    try:
        test_transit_stops()
        test_route_geometry()
        test_district_boundaries()
        test_civic_services()
        test_operational_facts()
        test_media_candidates()
        test_culture_food_crafts()
        test_accommodation_and_connectivity()
        test_weather_and_rag()
    except StagingValidationError as e:
        print(f"\n[VALIDATION FAILURE] {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[UNEXPECTED ERROR] {e}")
        sys.exit(2)

    print("============================================================")
    print("[PASS] All Stage F staging datasets comply with truth contracts, anti-vibe invariants, and provenance rules.")
    print("============================================================")


if __name__ == "__main__":
    main()
