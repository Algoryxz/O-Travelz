#!/usr/bin/env python3
"""
scripts/staging/stage_packaging_eligibility.py

Deterministic staging report for Mobile Offline Packaging Candidates.
Classifies all Stage F staged datasets into the 5 authoritative offline product categories:
1. BUNDLE_CANDIDATE (Bundled and guaranteed in app binary)
2. CACHE_AFTER_USE (Persisted in SQLite/Room/SwiftData upon user fetch)
3. OPTIONAL_DOWNLOAD_CANDIDATE (Explicit regional download packages)
4. NETWORK_REQUIRED (Remote telemetry or AI reasoning only)
5. NOT_MOBILE_DATA (Backend/server-side ingestion infrastructure)

Strict Invariant:
Do NOT actually bundle anything into Android or iOS production targets in Stage F.
"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_PATH = REPO_ROOT / "reports" / "research" / "mobile_offline_packaging_candidates.json"

DATASETS = [
    {
        "dataset_name": "researched_stop_crosswalks",
        "file_path": "data/staging/transit/researched_stop_crosswalks.json",
        "domain": "Transit GIS",
        "offline_classification": "BUNDLE_CANDIDATE",
        "rationale": "Static reference coordinates for verified Mo Bus stops enable offline stop pin rendering and topological trip review.",
        "bundling_prerequisites": "Retains candidate coordinates in staging; requires canonical promotion audit before packaging."
    },
    {
        "dataset_name": "researched_route_geometry",
        "file_path": "data/staging/transit/researched_route_geometry.json",
        "domain": "Transit GIS",
        "offline_classification": "BUNDLE_CANDIDATE",
        "rationale": "Compact road-following corridor polylines for high-priority urban bus routes render transit lines in airplane mode.",
        "bundling_prerequisites": "Only promoted if route-corridor alignment is formally verified against CRUT active routes."
    },
    {
        "dataset_name": "odisha_district_boundaries",
        "file_path": "data/staging/geospatial/odisha_district_boundaries.geojson",
        "domain": "Geospatial GIS",
        "offline_classification": "OPTIONAL_DOWNLOAD_CANDIDATE",
        "rationale": "Raw unsimplified boundary polygon is ~4.6 MB. Suitable as optional download or bundle candidate ONLY after simplifying to <250 KB TopoJSON.",
        "bundling_prerequisites": "Must be converted to simplified TopoJSON and measured against app size budget before binary inclusion."
    },
    {
        "dataset_name": "researched_civic_services",
        "file_path": "data/staging/services/researched_civic_services.json",
        "domain": "Civic Amenities",
        "offline_classification": "BUNDLE_CANDIDATE",
        "rationale": "Essential emergency civic facilities (Tourist Police cells, 30 DHHs, medical colleges, fire stations, 112 dispatch) must be 100% available in Airplane Mode.",
        "bundling_prerequisites": "Validated and ready for packaging audit."
    },
    {
        "dataset_name": "researched_operational_facts",
        "file_path": "data/staging/places/researched_operational_facts.json",
        "domain": "Heritage & Culture",
        "offline_classification": "CACHE_AFTER_USE",
        "rationale": "Visiting hours, ticket fees, and ritual pauses are freshness-sensitive and subject to seasonal government notifications. Cached locally upon viewing.",
        "bundling_prerequisites": "Client must display explicit timestamp when rendering cached operational facts offline."
    },
    {
        "dataset_name": "researched_media_candidates",
        "file_path": "data/staging/media/researched_media_candidates.json",
        "domain": "Media & Visual Arts",
        "offline_classification": "CACHE_AFTER_USE",
        "rationale": "High-resolution architectural photography is cached in local disk cache upon browsing; heavy asset bundles belong in optional offline packs, not APK/IPA baseline.",
        "bundling_prerequisites": "WebP generation pipeline and image attribution cards must be wired before bundling."
    },
    {
        "dataset_name": "gi_products",
        "file_path": "data/staging/culture/gi_products.json",
        "domain": "Cultural Crafts & Food",
        "offline_classification": "BUNDLE_CANDIDATE",
        "rationale": "Statutory Geographical Indication records provide foundational Cultural Atlas reference metadata that rarely changes.",
        "bundling_prerequisites": "Ready for lightweight bundling in shared cultural atlas asset pack."
    },
    {
        "dataset_name": "artisan_clusters",
        "file_path": "data/staging/culture/artisan_clusters.json",
        "domain": "Cultural Crafts",
        "offline_classification": "BUNDLE_CANDIDATE",
        "rationale": "Artisan craft villages and cooperative cluster coordinates provide cultural heritage exploration offline.",
        "bundling_prerequisites": "Ready for lightweight bundling."
    },
    {
        "dataset_name": "official_food_sources",
        "file_path": "data/staging/food/official_food_sources.json",
        "domain": "Culinary Heritage",
        "offline_classification": "BUNDLE_CANDIDATE",
        "rationale": "Curated traditional Odia regional food items and certified clean street food clusters enhance the Cultural Atlas in offline mode.",
        "bundling_prerequisites": "Ready for bundling."
    },
    {
        "dataset_name": "official_accommodation_sources",
        "file_path": "data/staging/accommodation/official_accommodation_sources.json",
        "domain": "Hospitality",
        "offline_classification": "CACHE_AFTER_USE",
        "rationale": "Government lodging facilities (OTDC Panthanivas, Eco Retreat, EcoTour camps) have seasonal operating windows and rate revisions.",
        "bundling_prerequisites": "Offline UI must show last-verified timestamp; zero live availability claims."
    },
    {
        "dataset_name": "rail_hubs",
        "file_path": "data/staging/connectivity/rail_hubs.json",
        "domain": "Inter-City Transit",
        "offline_classification": "BUNDLE_CANDIDATE",
        "rationale": "12 major rail junction hubs and coordinates support multimodal route planning and station reference offline.",
        "bundling_prerequisites": "Ready for lightweight bundling."
    },
    {
        "dataset_name": "airports",
        "file_path": "data/staging/connectivity/airports.json",
        "domain": "Inter-City Transit",
        "offline_classification": "BUNDLE_CANDIDATE",
        "rationale": "5 operational civil airports and feeder bus linkages provide essential gateway navigation in offline mode.",
        "bundling_prerequisites": "Ready for lightweight bundling."
    },
    {
        "dataset_name": "weather_warning_sources",
        "file_path": "data/staging/weather/warning_sources.json",
        "domain": "Safety & Climate",
        "offline_classification": "NETWORK_REQUIRED",
        "rationale": "IMD color bulletins and NDMA SACHET CAP alerts are live event-driven feeds; bundling static warnings into the application binary is strictly forbidden.",
        "bundling_prerequisites": "Fail-Closed: show 'Weather Unavailable' when disconnected; never synthesize fake temperatures."
    },
    {
        "dataset_name": "corpus_source_manifest",
        "file_path": "data/staging/rag/corpus_source_manifest.json",
        "domain": "AI Knowledge",
        "offline_classification": "NOT_MOBILE_DATA",
        "rationale": "RAG corpus source manifest and licensing boundaries belong to backend indexing pipelines, not consumer mobile client runtime.",
        "bundling_prerequisites": "Server-side only."
    }
]


def generate_packaging_report():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    sorted_datasets = sorted(DATASETS, key=lambda d: d["dataset_name"])

    counts = {}
    for d in sorted_datasets:
        cat = d["offline_classification"]
        counts[cat] = counts.get(cat, 0) + 1

    payload = {
        "report_version": "1.0.0",
        "evaluation_stage": "STAGE_F_MOBILE_PACKAGING_ELIGIBILITY",
        "evaluated_at": "2026-09-08T10:35:00+05:30",
        "total_datasets_evaluated": len(sorted_datasets),
        "classification_breakdown": counts,
        "authoritative_model_reference": "docs/mobile-v4/OFFLINE_PRODUCT_MODEL.md",
        "hard_invariant": "Zero files actually bundled into mobile/android or mobile/ios in Stage F.",
        "datasets": sorted_datasets
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"[OK] Generated mobile packaging eligibility report at {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    generate_packaging_report()
