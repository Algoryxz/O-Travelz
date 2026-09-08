#!/usr/bin/env python3
"""
scripts/staging/stage_rag_corpus_manifest.py

Deterministic staging ETL for future cultural RAG knowledge base corpus sources.
Enforces strict intellectual property and licensing boundaries for AI retrieval augmentation:
- RAG_INGEST_ALLOWED: Out-of-copyright, public domain texts (Odia Virtual Academy)
- RAG_REFERENCE_ONLY: Government periodicals with copyright retention (Odisha Review, Utkal Prasanga)
- RAG_NOT_ALLOWED: Proprietary commercial travel guidebooks

Strict Invariant:
Publicly readable != safe to ingest.
Do NOT download entire copyrighted corpora.
canonical_promotion_allowed = false.
"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_PATH = REPO_ROOT / "data" / "staging" / "rag" / "corpus_source_manifest.json"

CORPUS_SOURCES = [
    {
        "source_id": "SRC_OVA_SILPA_PRAKASA",
        "publisher": "Odia Virtual Academy / Traditional Palm Leaf Lineage",
        "title": "Silpa Prakasa: Medieval Orissan Sanskrit Architectural Treatise",
        "document_url": "https://ova.gov.in/archive/silpa-prakasa",
        "copyright_status": "PUBLIC_DOMAIN",
        "license": "Public Domain (Pre-18th Century Sanskrit Treatise)",
        "public_domain_status": True,
        "machine_readable": True,
        "citation_allowed": True,
        "full_text_ingestion_allowed": True,
        "embedding_allowed": True,
        "reference_only": False,
        "freshness_class": "ARCHIVAL",
        "domain": "Temple Architecture (Rekha Deula, Pidha Deula, Khakhara Deula geometry)",
        "rag_classification": "RAG_INGEST_ALLOWED",
        "retrieved_at": "2026-09-08T10:15:00+05:30"
    },
    {
        "source_id": "SRC_OVA_BHUBANESWARA_HISTORICAL",
        "publisher": "Odia Virtual Academy",
        "title": "Ekamra Purana & Historic Temple Chronicles of Bhubaneswar",
        "document_url": "https://ova.gov.in/archive/ekamra-purana",
        "copyright_status": "PUBLIC_DOMAIN",
        "license": "Public Domain (Out of Copyright - Indian Copyright Act 1957 s.22)",
        "public_domain_status": True,
        "machine_readable": True,
        "citation_allowed": True,
        "full_text_ingestion_allowed": True,
        "embedding_allowed": True,
        "reference_only": False,
        "freshness_class": "ARCHIVAL",
        "domain": "Sacred Geography and Historic Shrines of Ekamra Kshetra",
        "rag_classification": "RAG_INGEST_ALLOWED",
        "retrieved_at": "2026-09-08T10:15:00+05:30"
    },
    {
        "source_id": "SRC_OVA_UTKAL_DIPIKA_PRE1920",
        "publisher": "Odia Virtual Academy / Utkal Dipika Society",
        "title": "Utkal Dipika Historic Gazettes and Travel Dispatches (1866-1920)",
        "document_url": "https://ova.gov.in/archive/utkal-dipika",
        "copyright_status": "PUBLIC_DOMAIN",
        "license": "Public Domain (Published pre-1920; 100+ years elapsed)",
        "public_domain_status": True,
        "machine_readable": True,
        "citation_allowed": True,
        "full_text_ingestion_allowed": True,
        "embedding_allowed": True,
        "reference_only": False,
        "freshness_class": "ARCHIVAL",
        "domain": "Colonial-era Transport, Pilgrim Routes, and Famine Relief Geography",
        "rag_classification": "RAG_INGEST_ALLOWED",
        "retrieved_at": "2026-09-08T10:15:00+05:30"
    },
    {
        "source_id": "SRC_IPR_ODISHA_REVIEW",
        "publisher": "Information & Public Relations Department, Government of Odisha",
        "title": "Odisha Review Monthly Cultural & Heritage Journal",
        "document_url": "https://magazines.odisha.gov.in/orissa-review",
        "copyright_status": "GOVERNMENT_COPYRIGHT_RESERVED",
        "license": "Government of Odisha Copyright (All Rights Reserved)",
        "public_domain_status": False,
        "machine_readable": True,
        "citation_allowed": True,
        "full_text_ingestion_allowed": False,
        "embedding_allowed": False,
        "reference_only": True,
        "freshness_class": "SLOW_CHANGING",
        "domain": "Contemporary State Cultural Studies & Monument Profiles",
        "rag_classification": "RAG_REFERENCE_ONLY",
        "retrieved_at": "2026-09-08T10:15:00+05:30"
    },
    {
        "source_id": "SRC_IPR_UTKAL_PRASANGA",
        "publisher": "Information & Public Relations Department, Government of Odisha",
        "title": "Utkal Prasanga Odia Language Monthly Magazine",
        "document_url": "https://magazines.odisha.gov.in/utkal-prasanga",
        "copyright_status": "GOVERNMENT_COPYRIGHT_RESERVED",
        "license": "Government of Odisha Copyright (All Rights Reserved)",
        "public_domain_status": False,
        "machine_readable": True,
        "citation_allowed": True,
        "full_text_ingestion_allowed": False,
        "embedding_allowed": False,
        "reference_only": True,
        "freshness_class": "SLOW_CHANGING",
        "domain": "Odia Regional Literature, Folklore, and Temple Traditions",
        "rag_classification": "RAG_REFERENCE_ONLY",
        "retrieved_at": "2026-09-08T10:15:00+05:30"
    },
    {
        "source_id": "SRC_ASI_KALINGA_MONOGRAPH",
        "publisher": "Archaeological Survey of India (ASI), Ministry of Culture",
        "title": "The Temples of Kalinga: Architectural Monograph Series",
        "document_url": "https://asi.nic.in/publications",
        "copyright_status": "GOVERNMENT_OF_INDIA_COPYRIGHT",
        "license": "Government of India Copyright (ASI Publications)",
        "public_domain_status": False,
        "machine_readable": False,
        "citation_allowed": True,
        "full_text_ingestion_allowed": False,
        "embedding_allowed": False,
        "reference_only": True,
        "freshness_class": "ARCHIVAL",
        "domain": "Epigraphical and Structural Architectural Analyses of Protected Monuments",
        "rag_classification": "RAG_REFERENCE_ONLY",
        "retrieved_at": "2026-09-08T10:15:00+05:30"
    },
    {
        "source_id": "SRC_COMMERCIAL_TRAVEL_GUIDE",
        "publisher": "Commercial Travel Publishers (Lonely Planet / Outlook Traveller)",
        "title": "Commercial Odisha Travel Guides & User Review Compilations",
        "document_url": "https://example.com/commercial-guides",
        "copyright_status": "COMMERCIAL_PROPRIETARY_COPYRIGHT",
        "license": "Commercial Proprietary",
        "public_domain_status": False,
        "machine_readable": False,
        "citation_allowed": False,
        "full_text_ingestion_allowed": False,
        "embedding_allowed": False,
        "reference_only": False,
        "freshness_class": "CURRENT",
        "domain": "Commercial Tourist Recommendations",
        "rag_classification": "RAG_NOT_ALLOWED",
        "retrieved_at": "2026-09-08T10:15:00+05:30"
    }
]


def stage_rag_manifest():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    sorted_sources = sorted(CORPUS_SOURCES, key=lambda s: s["source_id"])

    payload = {
        "dataset": "corpus_source_manifest",
        "version": "1.0.0",
        "schema_compliance": "STAGE_F_RAG_STAGING",
        "total_sources": len(sorted_sources),
        "classification_breakdown": {
            "RAG_INGEST_ALLOWED": sum(1 for s in sorted_sources if s["rag_classification"] == "RAG_INGEST_ALLOWED"),
            "RAG_REFERENCE_ONLY": sum(1 for s in sorted_sources if s["rag_classification"] == "RAG_REFERENCE_ONLY"),
            "RAG_NOT_ALLOWED": sum(1 for s in sorted_sources if s["rag_classification"] == "RAG_NOT_ALLOWED")
        },
        "invariants": [
            "Publicly readable web pages != safe to ingest into LLM embeddings.",
            "Only confirmed public-domain texts (Odia Virtual Academy) may be ingested.",
            "Zero mass downloading of copyrighted government periodicals.",
            "canonical_promotion_allowed = false across all records."
        ],
        "sources": [
            {
                **s,
                "canonical_promotion_allowed": False
            }
            for s in sorted_sources
        ]
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"[OK] Staged {len(sorted_sources)} RAG corpus sources to {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    stage_rag_manifest()
