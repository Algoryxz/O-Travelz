#!/usr/bin/env python3
"""
scripts/staging/stage_weather_warning_sources.py

Deterministic staging ETL for weather and disaster early warning provider sources:
- IMD Meteorological Centre Bhubaneswar
- NDMA SACHET Common Alerting Protocol (CAP) feed

Strict Invariants:
- This is provider integration research, NOT bundled weather-warning content.
- Do NOT persist real-time warning alerts as canonical static data.
- canonical_promotion_allowed = false across all records.
"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_PATH = REPO_ROOT / "data" / "staging" / "weather" / "warning_sources.json"

PROVENANCE_IMD = {
    "source_id": "SRC_IMD_BHUBANESWAR",
    "claim_id": "CLM_WEATHER_ALERTS_AND_RAG_CORPUS_013",
    "source_title": "India Meteorological Department - Meteorological Centre Bhubaneswar",
    "source_url": "https://mausam.imd.gov.in/bhubaneswar",
    "source_tier": "TIER_A_OFFICIAL_PRIMARY",
    "retrieved_at": "2026-09-08T10:15:00+05:30",
    "effective_date": "2026-09-08",
    "freshness_class": "REALTIME",
    "licensing_status": "GOVERNMENT_PUBLIC_BULLETIN",
    "review_verdict": "ACCEPT_STAGING"
}

PROVENANCE_NDMA = {
    "source_id": "SRC_NDMA_SACHET",
    "claim_id": "CLM_WEATHER_ALERTS_AND_RAG_CORPUS_013",
    "source_title": "National Disaster Management Authority - SACHET Early Warning Portal",
    "source_url": "https://sachet.ndma.gov.in",
    "source_tier": "TIER_A_OFFICIAL_PRIMARY",
    "retrieved_at": "2026-09-08T10:15:00+05:30",
    "effective_date": "2026-09-08",
    "freshness_class": "REALTIME",
    "licensing_status": "GOVERNMENT_PUBLIC_BULLETIN",
    "review_verdict": "ACCEPT_STAGING"
}

WARNING_PROVIDERS = [
    {
        "provider_id": "prov_imd_mc_bhubaneswar",
        "provider_name": "India Meteorological Department (MC Bhubaneswar)",
        "feed_type": "HTML_TABLE_AND_PDF_BULLETIN",
        "feed_endpoint": "https://mausam.imd.gov.in/bhubaneswar/mcdata/district_warning.pdf",
        "web_portal": "https://mausam.imd.gov.in/bhubaneswar",
        "update_frequency": "TWICE_DAILY_1300_AND_2000_IST",
        "severe_weather_frequency": "HOURLY_DURING_ACTIVE_CYCLONE_OR_DEPRESSION",
        "district_mapping_method": "30_DISTRICT_STANDARD_NAMES",
        "severity_semantics": {
            "GREEN": {
                "label": "No Warning",
                "action": "No adverse weather anticipated; standard travel operations.",
                "color_hex": "#2E7D32"
            },
            "YELLOW": {
                "label": "Be Updated",
                "action": "Isolated thunderstorm, gusty winds, or moderate rain; monitor forecast updates.",
                "color_hex": "#F9A825"
            },
            "ORANGE": {
                "label": "Be Prepared",
                "action": "Heavy to very heavy precipitation or localized inundation; prepare for travel disruption.",
                "color_hex": "#EF6C00"
            },
            "RED": {
                "label": "Take Action",
                "action": "Extremely severe weather, cyclone landfall, flash flood; suspend non-essential travel.",
                "color_hex": "#C62828"
            }
        },
        "license_and_use_policy": "Government Open Weather Service (Free non-commercial public warning redistribution with attribution).",
        "client_polling_expectations": "Network-required; client polling throttled to minimum 30 minutes in normal conditions; 10 minutes during active Red alert.",
        "canonical_promotion_allowed": False,
        "provenance": PROVENANCE_IMD
    },
    {
        "provider_id": "prov_ndma_sachet_cap",
        "provider_name": "National Disaster Management Authority (SACHET Early Warning)",
        "feed_type": "OASIS_CAP_V1_2_XML_AND_RSS",
        "feed_endpoint": "https://sachet.ndma.gov.in/cap_feed/rss/odisha",
        "web_portal": "https://sachet.ndma.gov.in",
        "update_frequency": "EVENT_DRIVEN_PUSH_AND_PULL",
        "severe_weather_frequency": "REALTIME_ON_ALERT_ISSUANCE",
        "district_mapping_method": "CENSUS_2011_3_DIGIT_AND_LGD_CODES",
        "severity_semantics": {
            "Minor": {
                "label": "Advisory",
                "action": "Information notice regarding seasonal hazard.",
                "color_hex": "#1976D2"
            },
            "Moderate": {
                "label": "Watch (Yellow)",
                "action": "Potential risk to public safety and infrastructure.",
                "color_hex": "#F9A825"
            },
            "Severe": {
                "label": "Alert (Orange)",
                "action": "Significant threat to life and property; emergency services mobilized.",
                "color_hex": "#EF6C00"
            },
            "Extreme": {
                "label": "Urgent Warning (Red)",
                "action": "Catastrophic event imminent; immediate evacuation or sheltering.",
                "color_hex": "#C62828"
            }
        },
        "license_and_use_policy": "Government Public Safety Emergency Data under Disaster Management Act 2005.",
        "client_polling_expectations": "Network-required; managed through backend push ingestion broker; mobile client does not poll raw CAP feeds directly.",
        "canonical_promotion_allowed": False,
        "provenance": PROVENANCE_NDMA
    }
]


def stage_warning_sources():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "dataset": "weather_warning_sources",
        "version": "1.0.0",
        "schema_compliance": "STAGE_F_WEATHER_STAGING",
        "total_providers": len(WARNING_PROVIDERS),
        "invariants": [
            "Provider integration research only; live warnings must NEVER be bundled into mobile binary.",
            "Never default missing weather to fake 0C or sunny values (Fail-Closed contract).",
            "Network-required capability; graceful banner displayed when disconnected.",
            "canonical_promotion_allowed = false across all records."
        ],
        "providers": WARNING_PROVIDERS
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"[OK] Staged {len(WARNING_PROVIDERS)} weather warning sources to {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    stage_warning_sources()
