#!/usr/bin/env python3
"""
scripts/staging/stage_culture_and_food.py

Deterministic staging ETL for:
1. data/staging/culture/gi_products.json
2. data/staging/culture/artisan_clusters.json
3. data/staging/food/official_food_sources.json

Strict Invariants:
- Do NOT turn GI registrations into tourism POIs.
- GI record proves product identity, geographic provenance, and registration evidence.
- GI record does NOT prove visitability, opening hours, tourism experience, shop identity,
  or current artisan availability.
- No commercial user reviews, Zomato/Google ratings, or scraped food directories.
- canonical_promotion_allowed = false.
"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
GI_OUTPUT_PATH = REPO_ROOT / "data" / "staging" / "culture" / "gi_products.json"
ARTISAN_OUTPUT_PATH = REPO_ROOT / "data" / "staging" / "culture" / "artisan_clusters.json"
FOOD_OUTPUT_PATH = REPO_ROOT / "data" / "staging" / "food" / "official_food_sources.json"

PROVENANCE_GI = {
    "source_id": "SRC_IPINDIA_GI_REGISTRY",
    "claim_id": "CLM_CRAFTS_GI_REGISTRY_007",
    "source_title": "Geographical Indications Registry (Intellectual Property India)",
    "source_url": "https://ipindia.gov.in",
    "source_tier": "TIER_A_OFFICIAL_PRIMARY",
    "retrieved_at": "2026-09-08T09:40:00+05:30",
    "effective_date": "2026-09-08",
    "freshness_class": "SLOW_CHANGING",
    "licensing_status": "STATUTORY_PUBLIC_RECORD",
    "review_verdict": "ACCEPT_STAGING"
}

PROVENANCE_FSSAI = {
    "source_id": "SRC_FSSAI_CLEAN_STREET_FOOD",
    "claim_id": "CLM_FOOD_REGIONAL_SPECIALTIES_GI_009",
    "source_title": "FSSAI Clean Street Food Hubs & Eat Right Stations",
    "source_url": "https://fssai.gov.in",
    "source_tier": "TIER_A_OFFICIAL_PRIMARY",
    "retrieved_at": "2026-09-08T10:10:00+05:30",
    "effective_date": "2026-09-08",
    "freshness_class": "SLOW_CHANGING",
    "licensing_status": "STATUTORY_PUBLIC_RECORD",
    "review_verdict": "ACCEPT_WITH_LIMITATIONS"
}

GI_PRODUCTS = [
    {
        "gi_id": "gi_odisha_rasagola",
        "product_name": "Odisha Rasagola",
        "category": "FOOD_STUFF",
        "application_number": 612,
        "registration_year": 2019,
        "class_id": 30,
        "geographical_area": "Statewide Odisha (Origin traditions in Puri, Pahala, and Salepur)",
        "registered_proprietor": "Odisha Small Industries Corporation Ltd (OSIC) and Utkal Mistanna Byabasayee Samiti",
        "description": "Traditional soft, juicy, non-spongy sweet made of chhena cooked in light sugar syrup, originating from centuries-old Jagannath temple Niladri Bije prasad rituals."
    },
    {
        "gi_id": "gi_kendrapada_rasabali",
        "product_name": "Kendrapada Rasabali",
        "category": "FOOD_STUFF",
        "application_number": 707,
        "registration_year": 2023,
        "class_id": 29,
        "geographical_area": "Kendrapara District",
        "registered_proprietor": "Kendrapada Rasabali Mistanna Byabasayee Samiti",
        "description": "Deep-fried flattened chhena patties soaked in thick cardamom-flavored rabri/milk, historically offered as bhoga at Baladevjew Temple."
    },
    {
        "gi_id": "gi_dhenkanal_magji",
        "product_name": "Dhenkanal Magji",
        "category": "FOOD_STUFF",
        "application_number": 735,
        "registration_year": 2024,
        "class_id": 30,
        "geographical_area": "Dhenkanal District (Gondia and Sadar blocks)",
        "registered_proprietor": "Dhenkanal Magji Mistanna Byabasayee Samiti",
        "description": "Unique dry-roasted sweet prepared from indigenous buffalo milk chhena, cardamom, and sugar."
    },
    {
        "gi_id": "gi_similipal_kai_chutney",
        "product_name": "Mayurbhanj Kai Chutney",
        "category": "FOOD_STUFF",
        "application_number": 705,
        "registration_year": 2024,
        "class_id": 29,
        "geographical_area": "Mayurbhanj District (Similipal Biosphere Reserve)",
        "registered_proprietor": "The Mayurbhanj Kai Chutney Producer Co-operative Ltd",
        "description": "Nutrient-dense savory chutney made by indigenous tribal communities using red weaver ants (Oecophylla smaragdina) and broods."
    },
    {
        "gi_id": "gi_odisha_pattachitra",
        "product_name": "Odisha Pattachitra",
        "category": "HANDICRAFT",
        "application_number": 87,
        "registration_year": 2008,
        "class_id": 24,
        "geographical_area": "Puri District (Raghurajpur and Dandasahi) and Ganjam District",
        "registered_proprietor": "State Institute for Development of Arts & Crafts (SIDAC)",
        "description": "Traditional cloth-based scroll painting and engraved palm-leaf art depicting Jagannath and Vaishnava iconography using organic stone and plant pigments."
    },
    {
        "gi_id": "gi_pipili_applique",
        "product_name": "Pipili Applique Work",
        "category": "HANDICRAFT",
        "application_number": 86,
        "registration_year": 2008,
        "class_id": 24,
        "geographical_area": "Pipili Block, Puri District",
        "registered_proprietor": "State Institute for Development of Arts & Crafts (SIDAC)",
        "description": "Heritage textile craft of cutting and stitching layered fabric patterns onto cloth canopies (Chandua), umbrellas, and temple banners."
    },
    {
        "gi_id": "gi_cuttack_tarakasi",
        "product_name": "Cuttack Rupa Tarakasi (Silver Filigree)",
        "category": "HANDICRAFT",
        "application_number": 738,
        "registration_year": 2024,
        "class_id": 14,
        "geographical_area": "Cuttack Municipal Corporation & surrounding silver artisan wards",
        "registered_proprietor": "Utkal Chandi Tarakasi Association",
        "description": "Exquisite 500-year-old metalwork technique drawing pure silver into micro-wires soldered into intricate lace jewelry and Durga Puja medha backdrops."
    },
    {
        "gi_id": "gi_sambalpuri_bandha",
        "product_name": "Sambalpuri Bandha Saree & Fabrics",
        "category": "TEXTILE",
        "application_number": 174,
        "registration_year": 2010,
        "class_id": 24,
        "geographical_area": "Bargarh, Sambalpur, Sonepur, and Balangir Districts",
        "registered_proprietor": "Sambalpuri Bastralaya Handloom Cooperative Society Ltd",
        "description": "Tie-dyed warp and weft double-ikat handloom weaving technique producing curvilinear motifs (shankha, chakra, floral vines)."
    },
    {
        "gi_id": "gi_kotpad_handloom",
        "product_name": "Kotpad Handloom Fabrics",
        "category": "TEXTILE",
        "application_number": 26,
        "registration_year": 2005,
        "class_id": 24,
        "geographical_area": "Kotpad NAC, Koraput District",
        "registered_proprietor": "Directorate of Textiles & Handlooms, Odisha",
        "description": "Tribal organic cotton fabric dyed with natural madder dye derived from roots of Aal (Morinda citrifolia) trees, woven by Mirgan community."
    },
    {
        "gi_id": "gi_berhampur_patta",
        "product_name": "Berhampur Patta (Phoda Kumbha)",
        "category": "TEXTILE",
        "application_number": 220,
        "registration_year": 2012,
        "class_id": 24,
        "geographical_area": "Brahmapur, Ganjam District",
        "registered_proprietor": "Berhampur Silk Weavers Co-operative Society Ltd",
        "description": "Pure mulberry silk sarees known as 'Silk City Sarees' featuring distinct needle-woven Phoda Kumbha temple spire borders."
    }
]

ARTISAN_CLUSTERS = [
    {
        "cluster_id": "art_raghurajpur",
        "cluster_name": "Raghurajpur Heritage Crafts Village",
        "primary_craft": "Odisha Pattachitra, Tala Pattachitra & Cowdung Toys",
        "district": "Puri",
        "locality": "Raghurajpur, Chandanpur, Puri",
        "latitude": 19.8970,
        "longitude": 85.8190,
        "artisan_household_count": 140,
        "cooperative_society": "Raghurajpur Pattachitra Silpi Samiti",
        "cluster_nature": "RURAL_HERITAGE_VILLAGE",
        "visitability_notice": "Living artisan village where families work in open verandahs; respect artisan privacy and avoid intrusive commercial photography without consent.",
        "opening_hours": None,
        "commercial_shop_registry": None
    },
    {
        "cluster_id": "art_pipili",
        "cluster_name": "Pipili Applique Artisan Cluster",
        "primary_craft": "Pipili Applique Work (Chandua)",
        "district": "Puri",
        "locality": "Main Bazaar, Pipili, NH-316",
        "latitude": 20.1145,
        "longitude": 85.8340,
        "artisan_household_count": 350,
        "cooperative_society": "Pipili Applique Co-operative Society",
        "cluster_nature": "URBAN_STREET_CLUSTER",
        "visitability_notice": "Artisan street market alongside highway; individual workshop hours vary independently.",
        "opening_hours": None,
        "commercial_shop_registry": None
    },
    {
        "cluster_id": "art_cuttack_filigree",
        "cluster_name": "Cuttack Tarakasi Silver Hub",
        "primary_craft": "Cuttack Rupa Tarakasi (Silver Filigree)",
        "district": "Cuttack",
        "locality": "Balu Bazar, Nayasarak, and Alisha Bazaar, Cuttack",
        "latitude": 20.4650,
        "longitude": 85.8780,
        "artisan_household_count": 250,
        "cooperative_society": "Utkal Chandi Tarakasi Association",
        "cluster_nature": "HISTORIC_METROPOLITAN_WARD",
        "visitability_notice": "Urban silversmith alleys in historic walled bazaar; workshops are private artisan ateliers.",
        "opening_hours": None,
        "commercial_shop_registry": None
    },
    {
        "cluster_id": "art_barpali_handloom",
        "cluster_name": "Bargarh-Barpali Sambalpuri Handloom Cluster",
        "primary_craft": "Sambalpuri Bandha Ikat Weaving",
        "district": "Bargarh",
        "locality": "Barpali and Bargarh Town",
        "latitude": 21.1960,
        "longitude": 83.5850,
        "artisan_household_count": 1200,
        "cooperative_society": "Sambalpuri Bastralaya Co-operative",
        "cluster_nature": "WEAVER_COOPERATIVE_REGION",
        "visitability_notice": "Extensive rural weaver clusters; official showroom operated by Sambalpuri Bastralaya.",
        "opening_hours": None,
        "commercial_shop_registry": None
    },
    {
        "cluster_id": "art_kotpad_mirgan",
        "cluster_name": "Kotpad Tribal Organic Handloom Colony",
        "primary_craft": "Kotpad Aal-Dyed Handloom Weaving",
        "district": "Koraput",
        "locality": "Kotpad NAC, Koraput",
        "latitude": 19.1450,
        "longitude": 82.3250,
        "artisan_household_count": 80,
        "cooperative_society": "Kotpad Mirgan Weavers Co-operative",
        "cluster_nature": "TRIBAL_HERITAGE_SETTLEMENT",
        "visitability_notice": "Small community of organic Aal dyers and pit loom weavers in tribal Koraput.",
        "opening_hours": None,
        "commercial_shop_registry": None
    },
    {
        "cluster_id": "art_sadeibareni_dhokra",
        "cluster_name": "Sadeibareni Dhokra Metal Craft Village",
        "primary_craft": "Lost-wax Dhokra Bell Metal Casting",
        "district": "Dhenkanal",
        "locality": "Sadeibareni, Saptasajya Foothills, Dhenkanal",
        "latitude": 20.6710,
        "longitude": 85.5580,
        "artisan_household_count": 60,
        "cooperative_society": "Sadeibareni Dhokra Co-operative",
        "cluster_nature": "RURAL_CRAFT_VILLAGE",
        "visitability_notice": "Traditional Dhokra casting hamlet; artisans fire open-air earth kilns.",
        "opening_hours": None,
        "commercial_shop_registry": None
    }
]

OFFICIAL_FOOD_SOURCES = [
    {
        "source_item_id": "food_gi_rasagola",
        "name": "Odisha Rasagola",
        "type": "GI_REGISTERED_SPECIALTY",
        "gi_reference": "gi_odisha_rasagola",
        "district": "Puri / Khordha / Cuttack",
        "traditional_hubs": ["Pahala (NH-16 Sweet Cluster)", "Salepur (Bikalananda Kar Heritage)", "Puri Jagannath Temple Ananda Bazar"],
        "cuisine_category": "SWEET_CONFECTIONERY",
        "is_vegetarian": True,
        "certification": "GI Application 612 (IP India)",
        "crowdsourced_ratings_allowed": False
    },
    {
        "source_item_id": "food_gi_rasabali",
        "name": "Kendrapada Rasabali",
        "type": "GI_REGISTERED_SPECIALTY",
        "gi_reference": "gi_kendrapada_rasabali",
        "district": "Kendrapara",
        "traditional_hubs": ["Baladevjew Temple Premises, Ichhapur, Kendrapara"],
        "cuisine_category": "SWEET_CONFECTIONERY",
        "is_vegetarian": True,
        "certification": "GI Application 707 (IP India)",
        "crowdsourced_ratings_allowed": False
    },
    {
        "source_item_id": "food_gi_magji",
        "name": "Dhenkanal Magji",
        "type": "GI_REGISTERED_SPECIALTY",
        "gi_reference": "gi_dhenkanal_magji",
        "district": "Dhenkanal",
        "traditional_hubs": ["Gondia and Dhenkanal Town Sweets Hub"],
        "cuisine_category": "SWEET_CONFECTIONERY",
        "is_vegetarian": True,
        "certification": "GI Application 735 (IP India)",
        "crowdsourced_ratings_allowed": False
    },
    {
        "source_item_id": "food_gi_kai_chutney",
        "name": "Mayurbhanj Kai Chutney",
        "type": "GI_REGISTERED_SPECIALTY",
        "gi_reference": "gi_similipal_kai_chutney",
        "district": "Mayurbhanj",
        "traditional_hubs": ["Baripada Tribal Weekly Haats, Similipal"],
        "cuisine_category": "TRADITIONAL_SAVORY_RELISH",
        "is_vegetarian": False,
        "certification": "GI Application 705 (IP India)",
        "crowdsourced_ratings_allowed": False
    },
    {
        "source_item_id": "food_fssai_khao_gali_bbs",
        "name": "Khao Gali Food Street, Bhubaneswar",
        "type": "FSSAI_CERTIFIED_CLEAN_STREET_HUB",
        "gi_reference": None,
        "district": "Khordha",
        "locality": "Ram Mandir Square, Unit-3, Bhubaneswar",
        "latitude": 20.2745,
        "longitude": 85.8398,
        "traditional_hubs": ["Ram Mandir Street Food Promenade"],
        "cuisine_category": "STREET_FOOD_HUB",
        "is_vegetarian": None,
        "certification": "FSSAI Clean Street Food Hub Certified Benchmark",
        "crowdsourced_ratings_allowed": False
    }
]


def stage_all():
    GI_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    FOOD_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    # 1. GI Products
    gi_sorted = sorted(GI_PRODUCTS, key=lambda x: x["gi_id"])
    gi_payload = {
        "dataset": "gi_products",
        "version": "1.0.0",
        "schema_compliance": "STAGE_F_CULTURE_STAGING",
        "total_products": len(gi_sorted),
        "invariants": [
            "GI record proves product identity, geographic provenance, and registration evidence.",
            "GI record does NOT prove visitability, opening hours, tourism experience, shop identity, or artisan availability.",
            "Zero conversion of GI registrations into tourist POI destinations.",
            "canonical_promotion_allowed = false across all records."
        ],
        "products": [
            {
                **p,
                "canonical_promotion_allowed": False,
                "provenance": PROVENANCE_GI
            }
            for p in gi_sorted
        ]
    }
    with open(GI_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(gi_payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"[OK] Staged {len(gi_sorted)} GI products to {GI_OUTPUT_PATH.relative_to(REPO_ROOT)}")

    # 2. Artisan Clusters
    art_sorted = sorted(ARTISAN_CLUSTERS, key=lambda x: x["cluster_id"])
    art_payload = {
        "dataset": "artisan_clusters",
        "version": "1.0.0",
        "schema_compliance": "STAGE_F_CULTURE_STAGING",
        "total_clusters": len(art_sorted),
        "invariants": [
            "Clusters are cultural geographic references, not retail tourism storefronts.",
            "Opening hours remain strictly null until validated cooperative visit guidelines exist.",
            "canonical_promotion_allowed = false across all records."
        ],
        "clusters": [
            {
                **c,
                "canonical_promotion_allowed": False,
                "provenance": PROVENANCE_GI
            }
            for c in art_sorted
        ]
    }
    with open(ARTISAN_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(art_payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"[OK] Staged {len(art_sorted)} artisan clusters to {ARTISAN_OUTPUT_PATH.relative_to(REPO_ROOT)}")

    # 3. Official Food Sources
    food_sorted = sorted(OFFICIAL_FOOD_SOURCES, key=lambda x: x["source_item_id"])
    food_payload = {
        "dataset": "official_food_sources",
        "version": "1.0.0",
        "schema_compliance": "STAGE_F_FOOD_STAGING",
        "total_sources": len(food_sorted),
        "invariants": [
            "Commercial ratings, user reviews, and scraper directories are strictly barred per anti-vibe PRD rule.",
            "Food sources represent statutory GI specialties and FSSAI certified hygienic hubs only.",
            "canonical_promotion_allowed = false across all records."
        ],
        "food_sources": [
            {
                **s,
                "canonical_promotion_allowed": False,
                "provenance": PROVENANCE_FSSAI if s["type"] == "FSSAI_CERTIFIED_CLEAN_STREET_HUB" else PROVENANCE_GI
            }
            for s in food_sorted
        ]
    }
    with open(FOOD_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(food_payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"[OK] Staged {len(food_sorted)} official food sources to {FOOD_OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    stage_all()
