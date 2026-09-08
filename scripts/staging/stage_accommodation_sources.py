#!/usr/bin/env python3
"""
scripts/staging/stage_accommodation_sources.py

Deterministic staging ETL for official government and community accommodation sources:
- OTDC Panthanivas properties
- Eco Retreat Odisha seasonal glamping hubs
- EcoTour Odisha community nature camps

Strict Invariants:
- Only government and verified community eco-tourism accommodation allowed.
- Zero commercial OTA (MakeMyTrip, Booking.com) ratings, reviews, or scrapers.
- Do not model live availability (live_availability_supported = false).
- Do not model dynamic rates as real-time.
- canonical_promotion_allowed = false across all records.
"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_PATH = REPO_ROOT / "data" / "staging" / "accommodation" / "official_accommodation_sources.json"

PROVENANCE_OTDC = {
    "source_id": "SRC_OTDC_BOOKING",
    "claim_id": "CLM_ACCOMMODATIONS_GOVT_ECOTOUR_011",
    "source_title": "Odisha Tourism Development Corporation Panthanivas Booking System",
    "source_url": "https://booking.otdc.in",
    "source_tier": "TIER_A_OFFICIAL_PRIMARY",
    "retrieved_at": "2026-09-08T10:15:00+05:30",
    "effective_date": "2026-09-08",
    "freshness_class": "CURRENT",
    "licensing_status": "STATUTORY_PUBLIC_RECORD",
    "review_verdict": "ACCEPT_STAGING"
}

PROVENANCE_ECOTOUR = {
    "source_id": "SRC_ECOTOUR_ODISHA",
    "claim_id": "CLM_ACCOMMODATIONS_GOVT_ECOTOUR_011",
    "source_title": "Ecotour Odisha Community Nature Camps Portal",
    "source_url": "https://www.ecotourodisha.com",
    "source_tier": "TIER_A_OFFICIAL_PRIMARY",
    "retrieved_at": "2026-09-08T10:15:00+05:30",
    "effective_date": "2026-09-08",
    "freshness_class": "SLOW_CHANGING",
    "licensing_status": "STATUTORY_PUBLIC_RECORD",
    "review_verdict": "ACCEPT_STAGING"
}

ACCOMMODATIONS = [
    # 1. OTDC Panthanivas
    {
        "stay_id": "stay_otdc_bbs",
        "name": "OTDC Panthanivas Bhubaneswar",
        "category": "STATE_TOURISM_HOTEL",
        "operator": "Odisha Tourism Development Corporation (OTDC)",
        "district": "Khordha",
        "locality": "Lewis Road, Old Town, Bhubaneswar",
        "latitude": 20.2510,
        "longitude": 85.8390,
        "phone": "0674-2432515",
        "official_booking_url": "https://booking.otdc.in",
        "indicative_tariff_category": "MID_SCALE",
        "amenities": ["Air Conditioning", "Restaurant (Mahodadhi Cuisine)", "Conference Hall", "Parking"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },
    {
        "stay_id": "stay_otdc_puri",
        "name": "OTDC Panthanivas Puri",
        "category": "STATE_TOURISM_HOTEL",
        "operator": "Odisha Tourism Development Corporation (OTDC)",
        "district": "Puri",
        "locality": "Chakratirtha Road, Sea Beach, Puri",
        "latitude": 19.8035,
        "longitude": 85.8360,
        "phone": "06752-222562",
        "official_booking_url": "https://booking.otdc.in",
        "indicative_tariff_category": "MID_SCALE",
        "amenities": ["Beach Front Access", "Vegetarian & Multi-cuisine Restaurant", "Parking"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },
    {
        "stay_id": "stay_otdc_konark",
        "name": "OTDC Panthanivas Konark",
        "category": "STATE_TOURISM_HOTEL",
        "operator": "Odisha Tourism Development Corporation (OTDC)",
        "district": "Puri",
        "locality": "Near Sun Temple Main Gate, Konark",
        "latitude": 19.8890,
        "longitude": 86.0965,
        "phone": "06758-236831",
        "official_booking_url": "https://booking.otdc.in",
        "indicative_tariff_category": "MID_SCALE",
        "amenities": ["Walking Distance to Sun Temple", "Restaurant", "Lawn Garden"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },
    {
        "stay_id": "stay_otdc_barkul",
        "name": "OTDC Panthanivas Barkul (Chilika)",
        "category": "STATE_TOURISM_HOTEL",
        "operator": "Odisha Tourism Development Corporation (OTDC)",
        "district": "Khordha",
        "locality": "Barkul Jetty, Chilika Lake, NH-16",
        "latitude": 19.7215,
        "longitude": 85.1980,
        "phone": "06756-220488",
        "official_booking_url": "https://booking.otdc.in",
        "indicative_tariff_category": "MID_SCALE",
        "amenities": ["Lakeside Panorama", "Chilika Water Sports Center", "Boating Jetty Access"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },
    {
        "stay_id": "stay_otdc_rambha",
        "name": "OTDC Panthanivas Rambha (Chilika)",
        "category": "STATE_TOURISM_HOTEL",
        "operator": "Odisha Tourism Development Corporation (OTDC)",
        "district": "Ganjam",
        "locality": "Rambha Bay, Southern Chilika, NH-16",
        "latitude": 19.5240,
        "longitude": 85.1060,
        "phone": "06810-278346",
        "official_booking_url": "https://booking.otdc.in",
        "indicative_tariff_category": "MID_SCALE",
        "amenities": ["Island Tour Boat Jetty", "Lakeside Cottages", "Birdwatching Lawn"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },
    {
        "stay_id": "stay_otdc_chandipur",
        "name": "OTDC Panthanivas Chandipur",
        "category": "STATE_TOURISM_HOTEL",
        "operator": "Odisha Tourism Development Corporation (OTDC)",
        "district": "Balasore",
        "locality": "Sea Beach Road, Chandipur",
        "latitude": 21.4682,
        "longitude": 87.0145,
        "phone": "06782-270051",
        "official_booking_url": "https://booking.otdc.in",
        "indicative_tariff_category": "MID_SCALE",
        "amenities": ["Vanishing Beach Views", "Seafood Restaurant", "Garden Lawn"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },
    {
        "stay_id": "stay_otdc_gopalpur",
        "name": "OTDC Panthanivas Gopalpur",
        "category": "STATE_TOURISM_HOTEL",
        "operator": "Odisha Tourism Development Corporation (OTDC)",
        "district": "Ganjam",
        "locality": "Main Beach Promenade, Gopalpur-on-Sea",
        "latitude": 19.2625,
        "longitude": 84.9070,
        "phone": "0680-2243931",
        "official_booking_url": "https://booking.otdc.in",
        "indicative_tariff_category": "MID_SCALE",
        "amenities": ["Direct Beach Promenade Access", "Restaurant", "Colonial Heritage Views"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },

    # 2. Eco Retreat Odisha (Seasonal Luxury Glamping)
    {
        "stay_id": "stay_ecoretreat_konark",
        "name": "Eco Retreat Konark",
        "category": "GOVERNMENT_GLAMPING_RETREAT",
        "operator": "Odisha Tourism (Department of Tourism)",
        "district": "Puri",
        "locality": "Ramchandi Beach, Marine Drive, Konark",
        "latitude": 19.8540,
        "longitude": 86.0620,
        "phone": "0674-2432177",
        "official_booking_url": "https://ecoretreat.odishatourism.gov.in",
        "indicative_tariff_category": "LUXURY_GLAMPING",
        "seasonality": "Winter Seasonal (November to March)",
        "amenities": ["Luxury Swiss Cottages", "Marine Drive Watersports", "Cultural Amphitheater", "Curated Odia Cuisine"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },
    {
        "stay_id": "stay_ecoretreat_satkosia",
        "name": "Eco Retreat Satkosia",
        "category": "GOVERNMENT_GLAMPING_RETREAT",
        "operator": "Odisha Tourism (Department of Tourism)",
        "district": "Nayagarh",
        "locality": "Badmul, Mahanadi River Sandbar, Satkosia Gorge",
        "latitude": 20.5210,
        "longitude": 84.8450,
        "phone": "0674-2432177",
        "official_booking_url": "https://ecoretreat.odishatourism.gov.in",
        "indicative_tariff_category": "LUXURY_GLAMPING",
        "seasonality": "Winter Seasonal (November to March)",
        "amenities": ["River Sandbar Tents", "Mahanadi Gorge Boat Cruise", "Eco-trail Walking"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },
    {
        "stay_id": "stay_ecoretreat_daringbadi",
        "name": "Eco Retreat Daringbadi",
        "category": "GOVERNMENT_GLAMPING_RETREAT",
        "operator": "Odisha Tourism (Department of Tourism)",
        "district": "Kandhamal",
        "locality": "Pine Forest Hillocks, Daringbadi",
        "latitude": 19.9080,
        "longitude": 84.1350,
        "phone": "0674-2432177",
        "official_booking_url": "https://ecoretreat.odishatourism.gov.in",
        "indicative_tariff_category": "LUXURY_GLAMPING",
        "seasonality": "Winter Seasonal (November to March)",
        "amenities": ["Highland Pine Forest Cottages", "Coffee Plantation Walks", "Tribal Folk Performances"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },
    {
        "stay_id": "stay_ecoretreat_bhitarkanika",
        "name": "Eco Retreat Bhitarkanika",
        "category": "GOVERNMENT_GLAMPING_RETREAT",
        "operator": "Odisha Tourism (Department of Tourism)",
        "district": "Kendrapara",
        "locality": "Pentha Sea Beach, Bhitarkanika Biosphere",
        "latitude": 20.5320,
        "longitude": 86.7820,
        "phone": "0674-2432177",
        "official_booking_url": "https://ecoretreat.odishatourism.gov.in",
        "indicative_tariff_category": "LUXURY_GLAMPING",
        "seasonality": "Winter Seasonal (November to March)",
        "amenities": ["Mangrove Creek Tents", "Crocodile Sanctuary Safari", "Casuarina Beach Promenade"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },

    # 3. EcoTour Odisha Nature Camps (Community-Managed)
    {
        "stay_id": "stay_ecotour_dangamal",
        "name": "Bhitarkanika Nature Camp, Dangamal",
        "category": "COMMUNITY_ECOTOUR_CAMP",
        "operator": "Forest & Environment Department, Govt of Odisha (Eco Development Committee)",
        "district": "Kendrapara",
        "locality": "Dangamal, Bhitarkanika National Park",
        "latitude": 20.7380,
        "longitude": 86.8790,
        "phone": "06727-220741",
        "official_booking_url": "https://www.ecotourodisha.com",
        "indicative_tariff_category": "ECO_CAMP",
        "amenities": ["Forest Rest House & Swiss Cottages", "Estuarine Crocodile Creek Safari", "Interpretation Centre"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },
    {
        "stay_id": "stay_ecotour_badmul",
        "name": "Satkosia Sands Resort, Badmul",
        "category": "COMMUNITY_ECOTOUR_CAMP",
        "operator": "Forest & Environment Department, Govt of Odisha (Mahanadi Wildlife Division)",
        "district": "Nayagarh",
        "locality": "Badmul Village, Mahanadi Gorge Sanctuary",
        "latitude": 20.5280,
        "longitude": 84.8510,
        "phone": "0674-2564587",
        "official_booking_url": "https://www.ecotourodisha.com",
        "indicative_tariff_category": "ECO_CAMP",
        "amenities": ["Permanent Swiss Cottages on Hill Slope", "Gharial & Mugger Crocodile Sanctuary Safari", "Nature Trail"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },
    {
        "stay_id": "stay_ecotour_debrigarh",
        "name": "Debrigarh Nature Camp, Zeropoint",
        "category": "COMMUNITY_ECOTOUR_CAMP",
        "operator": "Forest & Environment Department, Govt of Odisha (Hirakud Wildlife Division)",
        "district": "Bargarh",
        "locality": "Zeropoint, Hirakud Reservoir Coast, Debrigarh Sanctuary",
        "latitude": 21.5420,
        "longitude": 83.6550,
        "phone": "06646-232115",
        "official_booking_url": "https://www.ecotourodisha.com",
        "indicative_tariff_category": "ECO_CAMP",
        "amenities": ["Lake View Wooden Cottages", "Gaur & Wildlife Safari", "Hirakud Backwater Cruise"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    },
    {
        "stay_id": "stay_ecotour_similipal_jamuani",
        "name": "Similipal Nature Camp, Jamuani",
        "category": "COMMUNITY_ECOTOUR_CAMP",
        "operator": "Forest & Environment Department, Govt of Odisha (Similipal Tiger Reserve)",
        "district": "Mayurbhanj",
        "locality": "Jamuani, Similipal Tiger Reserve Core Boundary",
        "latitude": 21.8410,
        "longitude": 86.3520,
        "phone": "06792-252586",
        "official_booking_url": "https://www.ecotourodisha.com",
        "indicative_tariff_category": "ECO_CAMP",
        "amenities": ["Eco Cottages in Dense Sal Canopy", "Barehipani & Joranda Falls Circuit", "Tribal Hospitality"],
        "live_availability_supported": False,
        "ota_reviews_ingested": False
    }
]


def build_accommodation_dataset() -> dict:
    sorted_stays = sorted(ACCOMMODATIONS, key=lambda s: s["stay_id"])

    enriched = []
    for s in sorted_stays:
        prov = PROVENANCE_ECOTOUR if s["category"] == "COMMUNITY_ECOTOUR_CAMP" else PROVENANCE_OTDC
        enriched.append({
            **s,
            "canonical_promotion_allowed": False,
            "provenance": prov
        })

    payload = {
        "dataset": "official_accommodation_sources",
        "version": "1.0.0",
        "schema_compliance": "STAGE_F_ACCOMMODATION_STAGING",
        "total_properties": len(enriched),
        "category_breakdown": {
            "STATE_TOURISM_HOTEL": sum(1 for s in enriched if s["category"] == "STATE_TOURISM_HOTEL"),
            "GOVERNMENT_GLAMPING_RETREAT": sum(1 for s in enriched if s["category"] == "GOVERNMENT_GLAMPING_RETREAT"),
            "COMMUNITY_ECOTOUR_CAMP": sum(1 for s in enriched if s["category"] == "COMMUNITY_ECOTOUR_CAMP")
        },
        "invariants": [
            "Exclusively government and verified community eco-tourism properties.",
            "Commercial OTA scrapers, star ratings, and fake reviews strictly prohibited.",
            "live_availability_supported = false across all records.",
            "canonical_promotion_allowed = false across all records."
        ],
        "accommodations": enriched
    }
    return payload


def main():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = build_accommodation_dataset()
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"[OK] Staged {payload['total_properties']} official accommodation properties to {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
