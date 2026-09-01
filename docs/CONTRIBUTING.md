# Contributing & Operating Rules — O-TRAVELZ

## 1. Golden Rules

1. **NO VERIFIED IMAGE = NO PUBLIC DESTINATION**: Every public destination must have 4 photographic variants (`hero.webp`, `card.webp`, `thumbnail.webp`, `original.webp`).
2. **Deterministic Facts Win**: AI interprets and explains; deterministic services own coordinates, routes, timetables, and fares.
3. **No Fabricated Transit Data**: Never invent bus stops, timetables, or live GPS arrival times. Transit is schedule-based.
4. **Single Source of Truth**: All transit updates must happen in `data/transport/canonical/`. Generated files must be updated via generator scripts.

---

## 2. Branch & Commit Discipline

* **Branching Model**: Feature branches branched from `main` (`feat/<feature-name>`, `fix/<bug-name>`, `chore/<task>`).
* **Commit Conventions**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `data:`).
* **Runnable Commits**: Every commit must leave the repository in a runnable state with green tests.

---

## 3. Mandatory Pre-Commit / Pre-Push Validation Gates

Run the following checks before pushing code:

```powershell
# 1. Backend Pytest suite (1,141 tests)
python -m pytest backend/tests -q

# 2. Frontend Vitest suite (592 tests)
npm --prefix frontend test

# 3. Frontend TypeScript & Production Build check
npm --prefix frontend run build

# 4. Regional Research Validator
python scripts/validate_round2_research.py

# 5. OpenAPI Schema Snapshot Drift Check
python scripts/generate_openapi.py --check

# 6. Shared TypeScript API Contract Drift Check
python scripts/check_api_drift.py

# 7. Photographic Integrity Validator
python scripts/validate_image_pipeline.py

# 8. Catalog Image Audit & Manifest Reconciliation
python scripts/audit_destination_images.py

# 9. Canonical Transit Validator
python scripts/validate_canonical_transit.py

# 10. Frontend Transit Fallback Drift Check
python scripts/generate_frontend_transit_data.py --check

# 11. Git whitespace check
git diff --check
```

---

## 4. Generated File Policy

The following tracked files are deterministically generated and must not be edited by hand:

| Tracked Generated File | Source | Generating Script | CI Enforcement |
|---|---|---|---|
| `shared/openapi/openapi.json` | `backend/app/schemas/` | `python scripts/generate_openapi.py` | `python scripts/generate_openapi.py --check` |
| `shared/api/generated.ts` | `shared/openapi/openapi.json` | `npm --prefix frontend run generate:api` | `python scripts/check_api_drift.py` |
| `frontend/src/data/staticTransitStops.ts` | `data/transport/canonical/stops.json` | `python scripts/generate_frontend_transit_data.py` | `python scripts/generate_frontend_transit_data.py --check` |
| `frontend/src/data/staticTransitRoutes.ts` | `data/transport/canonical/routes.json` | `python scripts/generate_frontend_transit_data.py` | `python scripts/generate_frontend_transit_data.py --check` |
| `frontend/src/data/transitTimetables.ts` | `data/transport/canonical/schedules.json` | `python scripts/generate_frontend_transit_data.py` | `python scripts/generate_frontend_transit_data.py --check` |
| `data/transport/canonical/network.json` | `data/transport/canonical/` | `python scripts/compile_canonical_transit.py` | Part of transit validator |
| `data/images/sources/publishability_report.json` | `data/places/places.json` + images | `python scripts/audit_destination_images.py` | Part of CI image gate |
