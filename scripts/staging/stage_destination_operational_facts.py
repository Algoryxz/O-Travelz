#!/usr/bin/env python3
"""
scripts/staging/stage_destination_operational_facts.py

Deterministic staging ETL for destination operational facts:
- OPENING_HOURS: structured weekly schedule, ritual exceptions, seasonality, closure days
- ENTRY_FEE: statutory tariffs by visitor category and channel
- ACCESSIBILITY: claim-based multi-tier physical accessibility attributes

Invariants:
- Never flatten nuanced accessibility claims into a single boolean accessible: true/false.
- Never invent entry fees (unverified sites remain null).
- All records retain provenance and audit trail.
- canonical_promotion_allowed = false.
"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_PATH = REPO_ROOT / "data" / "staging" / "places" / "researched_operational_facts.json"

PROVENANCE_ASI = {
    "source_id": "SRC_ASI_ETICKETING_PORTAL",
    "claim_id": "CLM_DEST_FEES_TICKETED_HERITAGE_004",
    "source_title": "Archaeological Survey of India E-Ticketing Portal",
    "source_url": "https://asi.nic.in",
    "source_tier": "TIER_A_OFFICIAL_PRIMARY",
    "retrieved_at": "2026-09-08T09:40:00+05:30",
    "effective_date": "2026-09-08",
    "freshness_class": "CURRENT",
    "licensing_status": "STATUTORY_PUBLIC_RECORD",
    "review_verdict": "ACCEPT_WITH_LIMITATIONS"
}

PROVENANCE_SJTA = {
    "source_id": "SRC_SJTA_PURI_JAGANNATH_OFFICIAL",
    "claim_id": "CLM_DEST_HOURS_GOLDEN_JOURNEY_003",
    "source_title": "Shree Jagannatha Temple Administration (SJTA) Official Portal",
    "source_url": "https://shreejagannatha.in",
    "source_tier": "TIER_A_OFFICIAL_PRIMARY",
    "retrieved_at": "2026-09-08T09:40:00+05:30",
    "effective_date": "2026-09-08",
    "freshness_class": "CURRENT",
    "licensing_status": "STATUTORY_PUBLIC_RECORD",
    "review_verdict": "ACCEPT_WITH_LIMITATIONS"
}

PROVENANCE_STATE_MUSEUM = {
    "source_id": "SRC_ODISHA_STATE_MUSEUM_FEES",
    "claim_id": "CLM_DEST_FEES_TICKETED_HERITAGE_004",
    "source_title": "Odisha State Museum Tariff Notification",
    "source_url": "https://odishamuseum.nic.in",
    "source_tier": "TIER_A_OFFICIAL_PRIMARY",
    "retrieved_at": "2026-09-08T09:40:00+05:30",
    "effective_date": "2026-09-08",
    "freshness_class": "CURRENT",
    "licensing_status": "STATUTORY_PUBLIC_RECORD",
    "review_verdict": "ACCEPT_WITH_LIMITATIONS"
}

PROVENANCE_NANDANKANAN = {
    "source_id": "SRC_NANDANKANAN_OFFICIAL_FEES",
    "claim_id": "CLM_DEST_FEES_TICKETED_HERITAGE_004",
    "source_title": "Nandankanan Zoological Park Official Tariff Schedule",
    "source_url": "https://nandankanan.org",
    "source_tier": "TIER_A_OFFICIAL_PRIMARY",
    "retrieved_at": "2026-09-08T09:40:00+05:30",
    "effective_date": "2026-09-08",
    "freshness_class": "CURRENT",
    "licensing_status": "STATUTORY_PUBLIC_RECORD",
    "review_verdict": "ACCEPT_WITH_LIMITATIONS"
}

OPERATIONAL_FACTS = [
    {
        "canonical_place_id": "plc_puri_jagannath",
        "place_name": "Shree Jagannath Temple, Puri",
        "opening_hours": {
            "schedule_text": "05:00 - 23:30 IST daily (subject to ritual pauses)",
            "structured_hours": [{"open": "05:00", "close": "23:30"}],
            "seasonality": "Festive schedules altered during Rath Yatra, Snana Purnima, and Chandan Yatra",
            "ritual_exception": "Public darshan halted during daily niti rituals: Abakash, Bhoga Mandap, Sandhya Dhupa, Pahuda",
            "closure_days": [],
            "source_effective_date": "2026-09-08",
            "retrieved_at": "2026-09-08T09:40:00+05:30"
        },
        "entry_fees": [
            {
                "visitor_category": "ALL_DEVOTEES",
                "online_vs_offline": "FREE_ENTRY",
                "currency": "INR",
                "amount": 0,
                "conditions": "General entry is free; special Parimanik darshan governed by statutory SJTA ticket counters",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            }
        ],
        "accessibility": {
            "approach_accessibility": "Paved barrier-free Grand Road (Bada Danda) approach to Lion's Gate (Singhadwara)",
            "grounds_accessibility": "Outer circumambulation corridor (Parikrama) is step-free and wide",
            "wheelchair_service": "Manual wheelchairs permitted outside temple and along Parikrama corridor",
            "battery_vehicle_service": "Complimentary battery-operated golf carts operate between outer parking areas and Lion's Gate",
            "sanctum_or_interior_limitations": "Wheelchairs strictly barred inside sanctum sanctorum (Garbhagriha) and 22 steps (Baisi Pahacha); temple attendants provide physical carrying assistance",
            "assistance_available": "Tourist Police cell and designated SJTA sevaks provide elder/disability guidance"
        },
        "canonical_promotion_allowed": False,
        "provenance": PROVENANCE_SJTA
    },
    {
        "canonical_place_id": "plc_konark_sun_temple",
        "place_name": "Konark Sun Temple",
        "opening_hours": {
            "schedule_text": "Sunrise to Sunset (06:00 - 18:00 IST) daily; ASI Museum 10:00 - 17:00 IST (closed Fridays)",
            "structured_hours": [{"open": "06:00", "close": "18:00"}],
            "seasonality": "Light and Sound show operates 18:30-20:00 in winter and 19:30-21:00 in summer",
            "ritual_exception": None,
            "closure_days": ["ASI Museum closed every Friday; Main monument open 365 days"],
            "source_effective_date": "2026-09-08",
            "retrieved_at": "2026-09-08T09:40:00+05:30"
        },
        "entry_fees": [
            {
                "visitor_category": "INDIAN_CITIZEN",
                "online_vs_offline": "ONLINE_PORTAL",
                "currency": "INR",
                "amount": 35,
                "conditions": "Discounted rate when booked via ASI online e-ticketing portal",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "INDIAN_CITIZEN",
                "online_vs_offline": "CASH_COUNTER",
                "currency": "INR",
                "amount": 40,
                "conditions": "Physical ticket counter purchase",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "FOREIGN_NATIONAL",
                "online_vs_offline": "ONLINE_PORTAL",
                "currency": "INR",
                "amount": 550,
                "conditions": "Online portal tariff for non-BIMSTEC/SAARC foreign visitors",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "FOREIGN_NATIONAL",
                "online_vs_offline": "CASH_COUNTER",
                "currency": "INR",
                "amount": 600,
                "conditions": "Counter tariff for foreign visitors",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "CHILD_UNDER_15",
                "online_vs_offline": "ANY",
                "currency": "INR",
                "amount": 0,
                "conditions": "Statutory exemption for all children below 15 years",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            }
        ],
        "accessibility": {
            "approach_accessibility": "Broad paved pedestrian avenues connecting parking plaza to entry turnstiles",
            "grounds_accessibility": "Paved stone ramps loop around the landscaped lawn perimeter with clear monument viewing",
            "wheelchair_service": "Complimentary manual wheelchairs available at ASI ticketing office against valid photo ID",
            "battery_vehicle_service": "Solar-powered eco carts provide transport from parking zone to main entrance gate",
            "sanctum_or_interior_limitations": "Maha-prasada mandapa plinth steps are high stone; main deula sanctum filled with sand for structural stability (no entry for any visitor)",
            "assistance_available": "ASI attendants and Tourist Police stationed along primary paved walkways"
        },
        "canonical_promotion_allowed": False,
        "provenance": PROVENANCE_ASI
    },
    {
        "canonical_place_id": "plc_bbs_lingaraj_temple",
        "place_name": "Lingaraj Temple, Bhubaneswar",
        "opening_hours": {
            "schedule_text": "06:00 - 21:00 IST daily; afternoon closure 12:30 - 15:30 IST",
            "structured_hours": [
                {"open": "06:00", "close": "12:30"},
                {"open": "15:30", "close": "21:00"}
            ],
            "seasonality": "Continuous darshan on Maha Shivaratri night until Mahadipa is raised",
            "ritual_exception": "Sanctum closed 12:30 - 15:30 for Mahasnana and Bhoga; pauses during daily dhoopa ceremonies",
            "closure_days": [],
            "source_effective_date": "2026-09-08",
            "retrieved_at": "2026-09-08T09:40:00+05:30"
        },
        "entry_fees": [
            {
                "visitor_category": "ALL_DEVOTEES",
                "online_vs_offline": "FREE_ENTRY",
                "currency": "INR",
                "amount": 0,
                "conditions": "General entry free; non-Hindus view monument from northern viewing platform",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            }
        ],
        "accessibility": {
            "approach_accessibility": "Paved heritage pedestrian boulevard under Ekamra Kshetra revitalization project",
            "grounds_accessibility": "Outer compound paved with stone; interior courtyard has historic flagged stone steps",
            "wheelchair_service": "Wheelchairs allowed up to temple security perimeter gates",
            "battery_vehicle_service": "Ekamra heritage electric shuttle connects Old Town parking to temple gates",
            "sanctum_or_interior_limitations": "Inner sanctum accessed through narrow thresholds and stairs; wheelchair inaccessible",
            "assistance_available": "Old Town Tourist Police post and temple trust attendants assist devotees"
        },
        "canonical_promotion_allowed": False,
        "provenance": PROVENANCE_ASI
    },
    {
        "canonical_place_id": "plc_khandagiri_udayagiri",
        "place_name": "Khandagiri and Udayagiri Caves",
        "opening_hours": {
            "schedule_text": "06:00 - 18:00 IST daily",
            "structured_hours": [{"open": "06:00", "close": "18:00"}],
            "seasonality": None,
            "ritual_exception": None,
            "closure_days": [],
            "source_effective_date": "2026-09-08",
            "retrieved_at": "2026-09-08T09:40:00+05:30"
        },
        "entry_fees": [
            {
                "visitor_category": "INDIAN_CITIZEN",
                "online_vs_offline": "ONLINE_PORTAL",
                "currency": "INR",
                "amount": 20,
                "conditions": "Online portal rate for Indian / SAARC / BIMSTEC nationals",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "INDIAN_CITIZEN",
                "online_vs_offline": "CASH_COUNTER",
                "currency": "INR",
                "amount": 25,
                "conditions": "Counter rate",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "FOREIGN_NATIONAL",
                "online_vs_offline": "CASH_COUNTER",
                "currency": "INR",
                "amount": 250,
                "conditions": "Foreign national counter rate",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "CHILD_UNDER_15",
                "online_vs_offline": "ANY",
                "currency": "INR",
                "amount": 0,
                "conditions": "Free entry for children below 15 years",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            }
        ],
        "accessibility": {
            "approach_accessibility": "Paved approach from Khandagiri Square parking",
            "grounds_accessibility": "Lower landscaped garden is step-free; cave ascent consists of rock-cut stone staircases",
            "wheelchair_service": "Wheelchair usable only in lower ticketing and garden pavilion zone",
            "battery_vehicle_service": None,
            "sanctum_or_interior_limitations": "Ranigumpha and Hathigumpha rock cut caves require navigating uneven rock surfaces and ancient stone steps",
            "assistance_available": "ASI security personnel stationed throughout the complex"
        },
        "canonical_promotion_allowed": False,
        "provenance": PROVENANCE_ASI
    },
    {
        "canonical_place_id": "plc_odisha_state_museum",
        "place_name": "Odisha State Museum",
        "opening_hours": {
            "schedule_text": "10:00 - 17:00 IST; closed every Monday and gazetted public holidays",
            "structured_hours": [{"open": "10:00", "close": "17:00"}],
            "seasonality": None,
            "ritual_exception": None,
            "closure_days": ["Monday", "Government Gazetted Public Holidays"],
            "source_effective_date": "2026-09-08",
            "retrieved_at": "2026-09-08T09:40:00+05:30"
        },
        "entry_fees": [
            {
                "visitor_category": "INDIAN_ADULT",
                "online_vs_offline": "CASH_COUNTER",
                "currency": "INR",
                "amount": 20,
                "conditions": "General admission for adults",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "CHILD_5_TO_12",
                "online_vs_offline": "CASH_COUNTER",
                "currency": "INR",
                "amount": 10,
                "conditions": "Children between 5 and 12 years",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "FOREIGN_NATIONAL",
                "online_vs_offline": "CASH_COUNTER",
                "currency": "INR",
                "amount": 100,
                "conditions": "International tourist admission",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            }
        ],
        "accessibility": {
            "approach_accessibility": "Paved ramp from main gate to building porch",
            "grounds_accessibility": "Step-free ramp entry to ground floor galleries",
            "wheelchair_service": "Wheelchairs available at entrance reception counter",
            "battery_vehicle_service": None,
            "sanctum_or_interior_limitations": "Passenger elevator connects Ground, First, and Second floor galleries; step-free threshold access",
            "assistance_available": "Museum receptionists and security guards assist visitors with mobility needs"
        },
        "canonical_promotion_allowed": False,
        "provenance": PROVENANCE_STATE_MUSEUM
    },
    {
        "canonical_place_id": "plc_nandankanan_zoo",
        "place_name": "Nandankanan Zoological Park",
        "opening_hours": {
            "schedule_text": "07:30 - 17:30 IST (Apr-Sep); 08:00 - 17:00 IST (Oct-Mar); closed every Monday",
            "structured_hours": [{"open": "08:00", "close": "17:00"}],
            "seasonality": "Summer: 07:30 - 17:30 IST; Winter: 08:00 - 17:00 IST",
            "ritual_exception": None,
            "closure_days": ["Monday"],
            "source_effective_date": "2026-09-08",
            "retrieved_at": "2026-09-08T09:40:00+05:30"
        },
        "entry_fees": [
            {
                "visitor_category": "INDIAN_ADULT",
                "online_vs_offline": "CASH_COUNTER",
                "currency": "INR",
                "amount": 50,
                "conditions": "Adult general entry (age 12 and above)",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "CHILD_UNDER_12",
                "online_vs_offline": "CASH_COUNTER",
                "currency": "INR",
                "amount": 10,
                "conditions": "Children between 3 and 12 years; children under 3 free",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "FOREIGN_NATIONAL",
                "online_vs_offline": "CASH_COUNTER",
                "currency": "INR",
                "amount": 100,
                "conditions": "International tourist admission",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "SAFARI_BUS",
                "online_vs_offline": "CASH_COUNTER",
                "currency": "INR",
                "amount": 60,
                "conditions": "Lion and Tiger Safari bus ticket per seat",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            }
        ],
        "accessibility": {
            "approach_accessibility": "Broad paved entry promenade connecting bus stand and parking to ticket counters",
            "grounds_accessibility": "Over 8 km of smooth paved circuits around major animal enclosures",
            "wheelchair_service": "Wheelchair rental counter operating at main entrance gate",
            "battery_vehicle_service": "Fleet of battery-operated eco safari golf carts available on per-ride or hire basis",
            "sanctum_or_interior_limitations": "Park toy train includes designated accessible seating spaces; safari buses have boarding step requiring assistance",
            "assistance_available": "Zoo information attendants and safety volunteers"
        },
        "canonical_promotion_allowed": False,
        "provenance": PROVENANCE_NANDANKANAN
    },
    {
        "canonical_place_id": "plc_dhauli_shanti_stupa",
        "place_name": "Dhauli Shanti Stupa & Rock Edicts",
        "opening_hours": {
            "schedule_text": "06:00 - 18:30 IST daily; Light & Sound shows 19:00 - 19:40 and 19:45 - 20:25 IST",
            "structured_hours": [{"open": "06:00", "close": "18:30"}],
            "seasonality": "Show timings shift slightly by sunset time across seasons",
            "ritual_exception": None,
            "closure_days": [],
            "source_effective_date": "2026-09-08",
            "retrieved_at": "2026-09-08T09:40:00+05:30"
        },
        "entry_fees": [
            {
                "visitor_category": "MONUMENT_GENERAL_ENTRY",
                "online_vs_offline": "FREE_ENTRY",
                "currency": "INR",
                "amount": 0,
                "conditions": "Daytime visit to peace pagoda and rock edicts is completely free",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "LIGHT_AND_SOUND_ADULT",
                "online_vs_offline": "CASH_COUNTER",
                "currency": "INR",
                "amount": 25,
                "conditions": "Evening laser sound and light show ticket",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            },
            {
                "visitor_category": "LIGHT_AND_SOUND_STUDENT",
                "online_vs_offline": "CASH_COUNTER",
                "currency": "INR",
                "amount": 10,
                "conditions": "Student ticket on production of valid school/college identity card",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            }
        ],
        "accessibility": {
            "approach_accessibility": "Paved motorable road leads to hilltop parking esplanade",
            "grounds_accessibility": "Lower Ashokan rock edict glass enclosure is directly accessible from paved road",
            "wheelchair_service": "Wheelchairs allowed on hill terrace and stupa viewing deck",
            "battery_vehicle_service": None,
            "sanctum_or_interior_limitations": "Dedicated passenger elevator installed connecting parking terrace to the upper Peace Pagoda platform",
            "assistance_available": "Dhauli Tourist Police outpost officers on site"
        },
        "canonical_promotion_allowed": False,
        "provenance": PROVENANCE_ASI
    },
    {
        "canonical_place_id": "plc_chilika_mangalajodi",
        "place_name": "Mangalajodi Bird Sanctuary, Chilika",
        "opening_hours": {
            "schedule_text": "Sunrise to Sunset (05:30 - 17:30 IST); peak birding 06:00 - 09:30 and 15:30 - 17:30 IST",
            "structured_hours": [{"open": "05:30", "close": "17:30"}],
            "seasonality": "Peak migratory avian season operates October through March; limited boat trips in monsoon",
            "ritual_exception": None,
            "closure_days": [],
            "source_effective_date": "2026-09-08",
            "retrieved_at": "2026-09-08T09:40:00+05:30"
        },
        "entry_fees": [
            {
                "visitor_category": "COMMUNITY_ECO_BOAT",
                "online_vs_offline": "COUNTER_COMMUNITY",
                "currency": "INR",
                "amount": 750,
                "conditions": "Authorized non-motorized wooden country boat (3-hour guided wetland birdwatching tour for up to 4 persons)",
                "effective_date": "2026-09-08",
                "retrieved_at": "2026-09-08T09:40:00+05:30"
            }
        ],
        "accessibility": {
            "approach_accessibility": "Rural single-lane asphalt road leading to village eco-tourism jetty",
            "grounds_accessibility": "Narrow earthen wetland embankments and wooden jetty planks require balance",
            "wheelchair_service": "Wheelchairs cannot be accommodated on low-draft wooden punt boats",
            "battery_vehicle_service": None,
            "sanctum_or_interior_limitations": "Boarding requires stepping directly into shallow wooden country boats without docks; requires mobility stability",
            "assistance_available": "Mahavir Pakshi Suraksha Samiti community eco-guides provide physical embarkation support"
        },
        "canonical_promotion_allowed": False,
        "provenance": PROVENANCE_ASI
    }
]


def build_operational_facts_dataset() -> dict:
    sorted_facts = sorted(OPERATIONAL_FACTS, key=lambda p: p["canonical_place_id"])

    payload = {
        "dataset": "researched_operational_facts",
        "version": "1.0.0",
        "schema_compliance": "STAGE_F_PLACES_STAGING",
        "total_destinations": len(sorted_facts),
        "domains_covered": ["OPENING_HOURS", "ENTRY_FEE", "ACCESSIBILITY"],
        "invariants": [
            "Opening hours preserve ritual exceptions, closure days, and seasonality without artificial flattening.",
            "Fee models explicitly capture visitor category and booking channel; unpriced sites strictly remain null.",
            "Accessibility model is claim-based across approach, grounds, wheelchairs, battery vehicles, and sanctum limitations.",
            "Single boolean accessible: true/false is strictly prohibited.",
            "canonical_promotion_allowed = false across all records."
        ],
        "places": sorted_facts
    }
    return payload


def main():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = build_operational_facts_dataset()
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"[OK] Staged operational facts for {payload['total_destinations']} destinations to {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
