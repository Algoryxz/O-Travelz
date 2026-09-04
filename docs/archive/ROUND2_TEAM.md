# ROUND2_TEAM.md — O-TRAVELZ Round 2 Team Assignments & Regional Research Ownership

> This file documents team roles, regional ownership, and the district-to-region mapping used for Round 2 research.
> All regional contributors must read this file before beginning research work.
> The canonical project operating rules live in `PROJECT_CONTEXT.md` and `AGENTS.md`.

---

## Team Roles

### Rudra — Eastern Odisha Research

Owns research and staging for the **Eastern Odisha** region.

**Districts assigned**: Cuttack, Jagatsinghpur, Jajpur, Bhadrak, Kendrapara, Dhenkanal, Angul

**Responsibilities**:
- Discover, verify, and stage destination candidates for assigned districts
- Follow the regional research workflow (see below)
- Submit candidates to `data/research/round2/eastern/candidates.json`
- Document sources in `data/research/round2/eastern/sources.json`
- Do NOT directly edit `data/places/places.json` (production catalog)

---

### Akriti — Western Odisha Research

Owns research and staging for the **Western Odisha** region.

**Districts assigned**: Sambalpur, Bargarh, Jharsuguda, Balangir, Subarnapur, Nuapada, Deogarh, Sundargarh, Keonjhar

**Responsibilities**:
- Discover, verify, and stage destination candidates for assigned districts
- Follow the regional research workflow (see below)
- Submit candidates to `data/research/round2/western/candidates.json`
- Document sources in `data/research/round2/western/sources.json`
- Do NOT directly edit `data/places/places.json` (production catalog)

---

### Susmita — Southern Odisha Research

Owns research and staging for the **Southern Odisha** region.

**Districts assigned**: Ganjam, Gajapati, Koraput, Rayagada, Nabarangpur, Malkangiri, Kalahandi, Kandhamal, Boudh

**Responsibilities**:
- Discover, verify, and stage destination candidates for assigned districts
- Follow the regional research workflow (see below)
- Submit candidates to `data/research/round2/southern/candidates.json`
- Document sources in `data/research/round2/southern/sources.json`
- Do NOT directly edit `data/places/places.json` (production catalog)

---

### Punam — Northern Odisha Research

Owns research and staging for the **Northern Odisha** region.

**Districts assigned**: Mayurbhanj, Balasore, Keonjhar *(shared with western — see note below)*, Puri, Khordha, Nayagarh

> **Note on Puri and Khordha**: These districts are geographically central/coastal and are already well-covered in the production catalog (Khordha: 44 places, Puri: 15 places). Punam's priority should be Mayurbhanj and Balasore, which are underrepresented. The assignment of Puri and Khordha to Northern for this workflow is a working Round 2 convention, not a strict geographic claim — see the district mapping notes below.

> **Note on Keonjhar**: Keonjhar appears in both the western mineral belt and the northern wildlife corridor. For this Round 2 workflow, Keonjhar is assigned to Punam (Northern). Akriti should not submit Keonjhar records.

**Responsibilities**:
- Discover, verify, and stage destination candidates for assigned districts
- Follow the regional research workflow (see below)
- Submit candidates to `data/research/round2/northern/candidates.json`
- Document sources in `data/research/round2/northern/sources.json`
- Do NOT directly edit `data/places/places.json` (production catalog)

---

### Deepti + Smarak — Core Integration

Own the production pipeline and all cross-cutting quality work.

**Responsibilities**:
- Mo Bus / Ama Bus stop research and canonicalization
- Transit route graph integration
- Image acquisition pipeline and validation
- Destination publishability evaluation
- Production data promotion (the ONLY people who merge into `data/places/places.json`)
- Deduplication and cross-region conflict resolution
- Canonical database merge and Alembic migration
- Frontend integration and planner/transit integration
- Demo hardening and system health
- Cross-review of all regional submissions before promotion

**Core integration does NOT bypass the validation pipeline.**
Even core-team records must pass `scripts/validate_round2_research.py` before production promotion.

---

## District-to-Region Assignment (Round 2 Working Convention)

> This mapping is derived from the canonical `backend/app/core/regions.py` definitions.
> It is grouped into four research regions for Round 2 team workflow purposes.
> Some districts span conceptual zones; the assignment below is a documented working convention, not a universal geographic classification.

### Eastern Odisha — Rudra

| District | Canonical Travel Region | Current Catalog Count |
|---|---|---|
| Cuttack | Cuttack & Mahanadi | 9 |
| Jagatsinghpur | Cuttack & Mahanadi | 3 |
| Jajpur | Cuttack & Mahanadi | 3 |
| Bhadrak | Northern Odisha & Wildlife | 3 |
| Kendrapara | Northern Odisha & Wildlife | 2 |
| Dhenkanal | Cuttack & Mahanadi | 3 |
| Angul | Cuttack & Mahanadi | 4 |

**Research priority**: Kendrapara (2), Bhadrak (3), Dhenkanal (3) are underrepresented.

---

### Western Odisha — Akriti

| District | Canonical Travel Region | Current Catalog Count |
|---|---|---|
| Sambalpur | Sambalpur & Western Odisha | 6 |
| Bargarh | Sambalpur & Western Odisha | 2 |
| Jharsuguda | Sambalpur & Western Odisha | 3 |
| Balangir | Sambalpur & Western Odisha | 4 |
| Subarnapur | Sambalpur & Western Odisha | 3 |
| Nuapada | Sambalpur & Western Odisha | 2 |
| Deogarh | Sambalpur & Western Odisha | 2 |
| Sundargarh | Rourkela & Sundargarh | 6 |
| Keonjhar | Northern Odisha & Wildlife | assigned to Punam — do not submit |

**Research priority**: Nuapada (2), Deogarh (2), Bargarh (2) are underrepresented.

---

### Southern Odisha — Susmita

| District | Canonical Travel Region | Current Catalog Count |
|---|---|---|
| Ganjam | Chilika & Southern Coast | 5 |
| Gajapati | Chilika & Southern Coast | 3 |
| Koraput | Koraput & Tribal Highlands | 6 |
| Rayagada | Koraput & Tribal Highlands | 2 |
| Nabarangpur | Koraput & Tribal Highlands | 2 |
| Malkangiri | Koraput & Tribal Highlands | 3 |
| Kalahandi | Koraput & Tribal Highlands | 3 |
| Kandhamal | Kandhamal & Southern Hills | 4 |
| Boudh | Kandhamal & Southern Hills | 2 |

**Research priority**: Rayagada (2), Nabarangpur (2), Boudh (2) are underrepresented.

---

### Northern Odisha — Punam

| District | Canonical Travel Region | Current Catalog Count |
|---|---|---|
| Mayurbhanj | Northern Odisha & Wildlife | 4 |
| Balasore | Northern Odisha & Wildlife | 5 |
| Keonjhar | Northern Odisha & Wildlife | 5 |
| Puri | Puri & Coastal | 15 |
| Khordha | Bhubaneswar & Central | 44 |
| Nayagarh | Bhubaneswar & Central | 3 |

**Research priority**: Focus on Mayurbhanj and Balasore for new additions. Puri and Khordha are already well covered; new entries must be uniquely valuable and not duplicates of existing records.

---

## Unassigned Districts — Handled by Core

The following districts map to regions already assigned above but may have ambiguous ownership.
Core (Deepti + Smarak) resolves any cross-region disputes:

- **Jagatsinghpur** → Eastern (coastal, but administratively near Cuttack) ✓ assigned
- **Keonjhar** → Northern (despite mineral belt proximity to Western) ✓ assigned

All 30 official Odisha districts are assigned exactly once in this workflow.

---

## Regional Research Workflow

Every regional contributor must follow this exact sequence:

```
1. Candidate discovery (OTDC, ASI, government, Wikipedia-verified)
     ↓
2. Source verification (check source is official/authoritative)
     ↓
3. Canonical naming (use official/government name, not colloquial)
     ↓
4. District + category classification (use official district, approved categories)
     ↓
5. Coordinate verification (OSM cross-check; never invent coordinates)
     ↓
6. Factual description (minimum 50 characters; cite the source)
     ↓
7. Image source lead (Wikimedia Commons preferred; note license)
     ↓
8. Provenance capture (fill primary_source_url and sources.json)
     ↓
9. Staging submission (add to candidates.json; run validator locally)
     ↓
```

**STOP HERE.** Regional contributors do not proceed further.

```
10. Automated validation (scripts/validate_round2_research.py) — run by core
      ↓
11. Human review (Deepti + Smarak) — cross-region duplicates, factual review
      ↓
12. Image pipeline (scripts/image_validate.py, image_variants.py)
      ↓
13. Publishability evaluation (scripts/update_publishability.py)
      ↓
14. Production promotion (merge into data/places/places.json)
```

---

## Hard Data Rules for All Contributors

1. **Quality over count** — 5 strong verified candidates beat 20 half-finished guesses.
2. **No invented coordinates** — use OSM or verified official source only.
3. **No fabricated descriptions** — cite the source; mark uncertain fields as uncertain.
4. **No unsupported opening hours** — leave blank if unverified.
5. **No invented ratings** — the catalog does not use crowd-sourced ratings from regional contributors.
6. **No random unlicensed image downloads** — Wikimedia Commons CC-licensed only unless approved.
7. **No public destination without a verified usable image** — the image pipeline enforces this.
8. **Every candidate must have provenance** — fill `primary_source_url`.
9. **Every candidate stays in staging** — do not touch `data/places/places.json`.
10. **No duplicate names under alternate spellings** — normalize and check before submitting.
11. **Mark uncertainty explicitly** — use `"coordinate_verification_status": "pending"` or `"notes": "Opening hours unverified"`.

---

## Preferred Sources (in priority order)

1. Government of Odisha (odisha.gov.in)
2. Odisha Tourism / OTDC (odishatourism.gov.in)
3. Archaeological Survey of India (asi.nic.in)
4. District administration websites (.gov.in)
5. Official institutional sources (universities, wildlife reserves, etc.)
6. OpenStreetMap — for coordinate cross-verification
7. Wikimedia Commons — for reusable imagery (CC license required)
8. Wikipedia — for description context only; verify every factual claim against a primary source

**Not acceptable as standalone sources**: social media, travel blogs, aggregator sites (Justdial, Sulekha, etc.)

---

## Git Workflow for Contributors

1. **Pull latest main before starting work**: `git pull origin main`
2. Work only in your regional folder: `data/research/round2/{eastern|western|southern|northern}/`
3. Run the validator before committing: `python scripts/validate_round2_research.py`
4. Create a branch for your submission (optional but recommended): `git checkout -b research/eastern-batch-1`
5. Commit: `git commit -m "research(eastern): add N candidates — Angul, Kendrapara"`
6. Push and create a PR / notify core team for review.

**Never commit directly to `main` without core-team sign-off on research data.**
