# O-TRAVELZ — PHASE 3A PRE-IMPLEMENTATION SAFETY AUDIT

**Date:** 2026-08-24  
**Auditor:** Antigravity AI Engine  
**Environment:** Local / Dev (Strict Non-Production Boundary)  

---

## 1. Baseline Verification

### Alembic Migration State
- **Current Head:** `0010_shared_trip_snapshots`
- **Revises:** `0009_google_oauth_user_identity`
- **Target New Migration:** `0011_food_places_extension` (Revises `0010_shared_trip_snapshots`)

### Existing Place Model Inspection (`backend/app/models/place.py`)
- The `places` table currently has columns: `id`, `research_id`, `name`, `category_id`, `location`, `description`, `opening_hours`, `opening_hours_source`, `avg_visit_minutes`, `price_tier`, `rating`, `rating_count`, `rating_source`, `source`, `source_url`, `verified_at`, `verification_status`, `source_provenance_note`, `coordinate_verification`, `coordinate_audit_status`, `audit_status`, `district`, `contact_phone`, `emergency_phone`, `address`.
- **Food-Specific Columns Currently in DB:** None (except `price_tier` and `rating`).
- **Target Additive Columns for Migration 0011:**
  - `cuisine`: `sa.String()`, nullable=True
  - `dietary_tags`: `sa.JSON()`, nullable=True
  - `speciality_dishes`: `sa.JSON()`, nullable=True
  - `highway_corridor`: `sa.String()`, nullable=True
  - `food_category`: `sa.String()`, nullable=True

### Transport Database Invariant Baseline
- **Transport Providers:** 3 (CRUT Mo Bus, AMA Bus, Mo E-Ride)
- **Routes:** 154 (96 Capital Region, 25 Rourkela, 17 Sambalpur, 10 Berhampur, 6 Keonjhar)
- **Stops:** 1,430 (41 high-confidence geocoded, 1,389 unresolved)
- **Route-Stop Sequence Links:** 1,487
- **Schedule Groups:** 302
- **Scheduled Departures:** 5,553

---

## 2. Place & Food Identity Strategy

- **Single Canonical Identity:** All food establishments and physical culinary hubs will be stored as `Place` records with unique `research_id` values (e.g. `food_khurda_001`, `food_cuttack_001`).
- **No Duplicate Tables:** We strictly avoid a separate `food_places` table to ensure that search, categories, interests, and spatial indexing remain unified.
- **Classification Stratification:**
  - `VERIFIED_PLACE`: Concrete verified physical establishment with verifiable address/locality and provenance $\rightarrow$ Seeded into database `places`.
  - `VERIFIED_FOOD_TRADITION`: Authentic cultural/culinary heritage item (e.g. Nayagarh Chhena Poda tradition, Kendrapara Rasabali history) $\rightarrow$ Retained in research dataset and knowledge base.
  - `RESEARCH_CANDIDATE`: Researched culinary landmark under verification $\rightarrow$ Retained in research dataset.
  - `UNRESOLVED`: Candidate with missing essential provenance or unverified location $\rightarrow$ Flagged in `FOOD_DATA_GAPS.md`.

---

## 3. Data Integrity & Safety Commitments

1. **Zero Rating Fabrication:** Null if not independently verified from authoritative registries or official Google Business data.
2. **Zero Coordinate Fabrication:** Null if not confidently matched with validated locality/district bounding boxes.
3. **Additive-Only Migrations:** Migration 0011 adds only 5 nullable columns and creates query indexes on `cuisine` and `highway_corridor`.
4. **Zero Impact on Transport Schema:** No modifications to `transport_providers`, `routes`, `stops`, `route_stops`, or `scheduled_trip_groups`.
