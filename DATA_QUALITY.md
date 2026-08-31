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

## Image Pipeline

### Step 1 — Audit (`scripts/image_audit.py`)
- Read `data/images/sources/manifest.json`
- For each entry: check source URL accessibility, original dimensions, SHA256 integrity
- Current state: 50 entries, all `quality_status: "unknown"` — audit has not been run yet
- Output: `data/images/quality_report.json`

### Step 2 — Acquisition (`scripts/image_acquire.py`)
- For each publishable-candidate place without a manifest entry:
  - Search Wikimedia Commons API by place name + "Odisha"
  - Download candidate to `data/images/raw/<place_id>/`
  - Record entry in manifest with SHA256
- Human review required before any acquired image is accepted

### Step 3 — Validation (`scripts/image_validate.py`)
Deterministic rules. No AI or vision model required.

| Rule | Pass condition | Fail action |
|---|---|---|
| File validity | Valid JPEG / PNG / WebP, not corrupt | Reject |
| Minimum dimensions | Width ≥ 800 px AND height ≥ 450 px | Reject |
| Aspect ratio | 0.5 ≤ (width/height) ≤ 3.0 | Reject |
| File size | 50 KB ≤ size ≤ 25 MB | Reject |
| SHA256 blacklist | Not present in `rejected_candidates.json` | Reject |
| Source domain | Wikimedia Commons, OTDC, ASI, official government sources | Flag for review |

Output: `quality_status = "verified" | "rejected" | "needs_review"` per entry.

### Step 4 — Relevance Check (`scripts/image_relevance.py`)
Heuristic check. No vision AI dependency.

| Check | Pass condition |
|---|---|
| Source domain | Trusted heritage/government source |
| Wikimedia file title | Contains place name or known location keywords |
| Filename | Contains place name, destination name, or canonical location keywords |
| Description metadata | References the destination or its district |

Output: `relevance_status = "relevant" | "suspect" | "rejected"` per entry.

**Important**: quality ≠ relevance. A high-quality image of the wrong place must be rejected.

### Step 5 — Variant Generation (`scripts/image_variants.py`)
For entries passing steps 3 + 4:
- Generate `hero.webp` (1280×720, Q=85)
- Generate `card.webp` (640×400, Q=85)
- Generate `thumbnail.webp` (320×200, Q=85)
- Update manifest with variant paths and dimensions

### Step 6 — Publishability Update (`scripts/update_publishability.py`)
- For each place in `data/places/places.json`, evaluate all publishability criteria
- Set `publishable: true` or `false` with reason
- Write `data/places/places_publishable.json` (not a separate database — used to update `places.json`)

### Step 7 — Quarantine
- Images failing validation: move to `data/images/quarantine/<place_id>/`
- Log reason in `data/images/quarantine_report.json`
- Quarantined images do not block the place record — they are simply not counted as valid images

---

## Staging vs Production

| Environment | Location | Behavior |
|---|---|---|
| **Regional research staging** | `data/research/round2/{eastern,western,southern,northern}/` | Regional candidate research; validated via `scripts/validate_round2_research.py` |
| **Research/staging (general)** | `data/research/` | Raw, unverified research artifacts, not served publicly |
| **Staging candidates** | `data/places/places_staging.json` | Awaiting human review & image pipeline |
| **Production** | `data/places/places.json` | Publishability gate passed; served to users |

Regional research contributions go to `data/research/round2/`. Production catalog promotion is handled only after automated validation, image verification, and core-team review. See [`ROUND2_TEAM.md`](ROUND2_TEAM.md).

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
