# DATA_QUALITY.md — O-TRAVELZ Destination & Image Quality Rules

> Read `PROJECT_CONTEXT.md` first for full project background.
> This document governs publishability, image validation, and the staging-to-production pipeline.

---

## The Hard Rule

> **NO VERIFIED IMAGE = NO PUBLIC DESTINATION.**

A destination record may exist in research/staging indefinitely.
It must NOT appear in the public-facing production catalog until ALL publishability criteria are satisfied.

Do not use generic placeholder images, logos, or unrelated stock images to bypass this rule.

---

## Destination Publishability Criteria

A place is `publishable = true` only when ALL of the following are met:

| Criterion | Requirement |
|---|---|
| `lat` + `lon` | Present and within Odisha bounding box: lat 17.8–22.6°N, lon 81.4–87.5°E |
| `name` | Present, canonical, not a duplicate of an existing record |
| `district` | One of the 30 official Odisha districts |
| `category` | From the approved taxonomy (see `data/places/categories.json`) |
| `description` | ≥ 50 characters, factual, no invented claims |
| `source` | Provenance URL or named official document |
| Image | At least one manifest entry with `quality_status: "verified"` AND `relevance_status: "relevant"` |

If any criterion fails, set:
```json
{
  "publishable": false,
  "publishability_reason": "missing_image"   // or "unverified_coordinates", "incomplete_description", etc.
}
```

---

## Image Pipeline (Track A1 Architecture)

The image pipeline uses unified, typed, and deterministic tooling without AI hallucination risk:

### 1. Canonical Manifest Contract (`backend/app/storage/manifest.py`)
- Typed Pydantic models: `ImageManifestItem`, `VariantMetadata`, `EvidenceClassification`, `QualityStatus`, `RelevanceStatus`.
- Standardized classifications: `EXACT_LOCATION_VERIFIED`, `RELATED_LOCATION_ONLY`, `GENERIC_IMAGE`, `REJECTED`, `REVIEW_REQUIRED`.
- Fully backward compatible with legacy records (`VERIFIED_AUTHENTIC_PHOTOGRAPHY`).

### 2. Ingestion & Safety Hardening (`scripts/ingest_destination_images.py`)
- Unified ingestion CLI supporting URL acquisition, local files, batch JSON, and regional research candidates.
- Strict format checks (`JPEG`, `PNG`, `WEBP`), aspect ratio bounds `0.5–3.0`, 50M pixel decompression bomb guard, and HTML payload rejection.
- SHA-256 duplicate detection: same-place duplicates are idempotent (`ALREADY_EXISTS`); cross-place duplicates safely downgrade to `REVIEW_REQUIRED` with conflict audit notes.
- Generates 4 standardized WebP variants: `original.webp`, `hero.webp` (1080×720), `card.webp` (640×427), `thumbnail.webp` (320×213).

### 3. Destination Image Auditor & Shadow Publishability (`scripts/audit_destination_images.py`)
- Evaluates destinations across all 8 publishability gates emitting deterministic machine-readable blocker reason codes.
- Shadow mode evaluation: produces `data/images/sources/publishability_report.json` and updates `authentic_image_audit.json` without mutating `places.json` or frontend visibility.
- **Current Verified Baseline**: 161 production places, 70 canonical manifest records, 81 local variant sets, 62 exact verified images, 62 shadow-publishable destinations (38.51%).

### 4. Canonical Pipeline Integrity Validator (`scripts/validate_image_pipeline.py`)
- Cryptographic and structural validator verifying manifest schema validity, Pillow WebP decoding, dimension/byte matching, variant SHA verification, and strict evidence reconciliation (112 strict registry records, 0 sync gaps).
- Distinguishes fatal errors (CI exit code 1) from non-blocking legacy debt warnings (exit code 0).
- **Current Verified Status**: 0 integrity errors.

### 5. Track A2 Legacy Recovery Status & Acquisition Policy
- **Track A2 Web Provenance Recovery is COMPLETE**: All 31 legacy unmanifested destinations audited; 20 canonically ingested (17 exact, 3 related); 11 unrecoverable web sources cataloged in `data/images/sources/a2_unrecoverable_backlog.json`.
- **Policy**: Remaining unrecoverable image gaps require first-party, community, or official partner photography, NOT lower-quality web scraping. These 11 serve as the pilot seed for the Community Recommendation intake pipeline.

---

## Staging vs Production

| Environment | Location | Behavior |
|---|---|---|
| **Regional research staging** | `data/research/round2/{eastern,western,southern,northern}/` | Regional candidate research; validated via `scripts/validate_round2_research.py` |
| **Research/staging (general)** | `data/research/` | Raw, unverified research artifacts, not served publicly |
| **Staging candidates** | `data/places/places_staging.json` | Awaiting human review & image pipeline |
| **Production** | `data/places/places.json` | Publishability gate passed; served to users |

Regional research contributions go to `data/research/round2/`. Production catalog promotion is handled only after automated validation, image verification, and core-team review. See [`docs/archive/ROUND2_TEAM.md`](docs/archive/ROUND2_TEAM.md).

Data flows in one direction: staging → production (with core team approval). Never the reverse.

---

## Duplicate Detection

Before adding a new place record:
1. Check for exact `name` match within the same district.
2. Check for coordinate proximity: if an existing record is within 200 m, flag as potential duplicate.
3. Check for similar name (fuzzy match) if coordinates are close.

Duplicates are rejected from production. If a duplicate is discovered in existing data, flag both for human resolution.

---

## Provenance Requirements

Every place record must carry:
- `source`: URL or named document (e.g., `"OTDC Odisha Tourism Portal"`, `"ASI Monument List 2025"`)
- `verified_at`: ISO date string of last verification
- `verification_status`: one of `"verified"`, `"research"`, `"unverified"`

Every image manifest entry must carry:
- `source_url`: original image URL
- `source_domain`: domain name
- `creator`: author/photographer if known
- `license`: Creative Commons license identifier or equivalent
- `attribution`: full attribution string for display
- `content_sha256`: SHA256 hash of the downloaded file
- `retrieval_timestamp`: ISO datetime of download

---

## API Behaviour

```
GET /places                    → returns publishable=true places only
GET /places?publishable=false  → returns all places (internal/admin use)
GET /places?publishable=true   → explicit filter (same as default)
```

---

## Current Coverage Summary (as of 2026-08-31)

| Metric | Value |
|---|---|
| Total canonical places | 161 |
| Districts covered | 30 |
| Places with image manifest entries | 50 (31%) |
| Places with `quality_status: "verified"` | 0 (audit not yet run) |
| Places with `relevance_status: "relevant"` | 0 (relevance check not yet run) |
| Places currently marked `publishable: true` | Unknown (field not yet on model) |

Update this section after running the image audit pipeline.
