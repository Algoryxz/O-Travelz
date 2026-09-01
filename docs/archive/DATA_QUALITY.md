# O-Travelz Data Quality, Provenance & Validation Contract

**Author**: Systems & Data Core Team (Smarak)  
**Status**: Canonical Data Quality Contract (Phase 11 Step 3)  
**Version**: 2026-08-22-v1  

---

## 1. Core Principle: Zero Fabricated Data

In O-Travelz, **correctness strictly supersedes quantity**. Unverified travel facts, placeholder emergency contacts, fake ratings, or speculative opening hours are classified as system vulnerabilities.

- If a fact cannot be authoritatively verified from official government portals (ASI, Odisha Tourism, UNESCO, MoHFW, district portals), it **MUST remain `null`** or be marked `UNVERIFIED` / `UNAVAILABLE`.
- No synthetic numbers (e.g., `0000000000`, `1234567890`) or placeholder text (e.g., `"REQUIRED"`, `"replace me"`) may ever be ingested into the database.

---

## 2. Canonical Schema Contract

### A. Place Entity Fields
| Field Name | Type | Nullable? | Validation Rules |
| :--- | :--- | :---: | :--- |
| `id` | UUID / String | No | Unique research/database identifier (`place_*`, `med_*`, `transit_*`). |
| `name` | String | No | Non-empty trimmed title. Unique within its administrative district. |
| `category` | String | No | Must exist in `data/places/categories.json`. |
| `district` | String | No | Must belong to the authoritative 30 Odisha districts list. |
| `lat` | Float | Yes* | Must be within the Odisha envelope `[17.5, 22.8]`. If non-null, `lon` is required. |
| `lon` | Float | Yes* | Must be within the Odisha envelope `[81.2, 87.6]`. If non-null, `lat` is required. |
| `description` | String | Yes | Non-empty informative summary. |
| `source` | String | No | Authoritative source name or provenance note. |
| `source_url` | String | Yes | Must be a valid `http://` or `https://` official URL. |
| `verified_at` | ISO Datetime | Yes | Timestamp when the ground fact or coordinates were verified. |
| `verification_status` | String | Yes | Restricted to: `VERIFIED`, `UNVERIFIED`, `UNAVAILABLE`. |
| `avg_visit_minutes` | Integer | Yes | Positive integer (> 0) representing typical traveler duration. |
| `price_tier` | String | Yes | `free`, `low`, `medium`, `high`. |
| `rating` | Float | Yes | Finite number between `0.0` and `5.0`. |
| `rating_count` | Integer | Yes | Non-negative integer ($\ge 0$). |
| `rating_source` | String | Yes | Provenance source for the rating (required if rating is populated). |
| `opening_hours` | JSON | Yes | Structured schedule. Never inferred or guessed. |
| `opening_hours_source` | String | Yes | Source documenting opening hours. |
| `contact_phone` | String | Yes | Official landline/inquiry number. Null if unverified. |
| `emergency_phone` | String | Yes | Official 24x7 emergency helpline (e.g., `108`, `112`). Null if unverified. |
| `address` | String | Yes | Authentic postal/street location. |

*\*Note: Tourist attractions may have null coordinates if intentionally unresolved during research; medical and transit entities require non-null verified coordinates.*

---

## 3. Geographic & Coordinate Validation

### Envelope Boundary
- **Latitude**: `17.5000` to `22.8000` North
- **Longitude**: `81.2000` to `87.6000` East
- **Datum / Projection**: WGS84 (`EPSG:4326` / PostGIS Geography Point).

### Swapped Coordinate Protection
- The validation engine actively rejects swapped coordinates where `lat` is in longitude range (`80.0 - 90.0`) and `lon` is in latitude range (`16.0 - 25.0`).

---

## 4. Administrative Districts & Travel Regions

### Canonical 30 Districts
All place records must reference one of the 30 official districts:
1. `Angul`
2. `Balangir`
3. `Balasore`
4. `Bargarh`
5. `Bhadrak`
6. `Boudh`
7. `Cuttack`
8. `Deogarh`
9. `Dhenkanal`
10. `Gajapati`
11. `Ganjam`
12. `Jagatsinghpur`
13. `Jajpur`
14. `Jharsuguda`
15. `Kalahandi`
16. `Kandhamal`
17. `Kendrapara`
18. `Keonjhar`
19. `Khordha`
20. `Koraput`
21. `Malkangiri`
22. `Mayurbhanj`
23. `Nabarangpur`
24. `Nayagarh`
25. `Nuapada`
26. `Puri`
27. `Rayagada`
28. `Sambalpur`
29. `Subarnapur`
30. `Sundargarh`

### Travel Regions
Travel regions are deterministically derived via `app.data.odisha_districts.get_region_for_place(district, place_id)`.

---

## 5. Domain Separation Rules

### A. Leisure Attractions (Tourist)
- Mapped to 13 physical categories (`temple`, `monument`, `museum`, `market`, `park`, `lake`, `beach`, `nature`, `waterfall`, `wildlife`, `planetarium`, `sports_venue`, `science_center`).
- Associated with 12 thematic traveler interests (`heritage`, `spirituality`, `architecture`, `food`, `culture`, `nature`, `beach`, `wildlife`, `waterfall`, `relaxation`, `adventure`, `shopping`).
- Eligible for deterministic itinerary ranking.

### B. Medical Facilities (`hospital`, `emergency_facility`)
- Must possess authentic coordinates, district, and provenance.
- Must **NOT** be automatically mixed into tourist itinerary recommendations.
- Emergency helplines must be authentic (`108`, `112`, or official hospital PBX); synthetic strings trigger immediate validation failures.

### C. Transit Hubs (`transit_hub`)
- Major airports, railway junctions, and central bus stands (ISBTs).
- Must possess authentic coordinates and district.
- Serve as multimodal route graph origins/destinations, not leisure stops.

---

## 6. Duplicate Detection Standards

1. **Research ID Uniqueness**: No two records may share the same `id`.
2. **Intra-District Name Uniqueness**: No two places within the same district may have the same normalized name.
3. **Canonical Identity Uniqueness**: The tuple `(name, category, source)` must be globally unique.
4. **Coordinate Proximity Review**: Sites sharing identical coordinates ($\le 0.0001^\circ$) produce warnings for curator verification.

---

## 7. Quality Audit Tooling & CI Execution

### Automated Auditor CLI
Run locally or in CI pipelines:
```bash
# Human-readable report
python scripts/audit_data_quality.py

# Machine-readable JSON output for automated CI gates
python scripts/audit_data_quality.py --json

# Strict mode (fails on warnings)
python scripts/audit_data_quality.py --strict
```

### Exit Codes:
- `0`: All records pass validation.
- `1`: Fatal data validation errors detected (ingestion blocked).
