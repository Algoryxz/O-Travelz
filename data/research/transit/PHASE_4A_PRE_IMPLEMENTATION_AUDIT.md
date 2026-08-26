# O-TRAVELZ — PHASE 4A PRE-IMPLEMENTATION AUDIT
## Canonical Transit Hub Clustering & Stop Aliasing

> **STATUS: LOCAL/DEV ONLY — PRE-IMPLEMENTATION FORENSIC AUDIT**
> **AUTHORITATIVE GRAPH: 154 ROUTES, 1,430 STOPS, 1,487 LINKS, 302 SCHEDULES, 5,553 DEPARTURES**
> **ZERO DATABASE MUTATIONS · ZERO FABRICATED COORDINATES**

---

### 1. Objective & Problem Statement
In the authoritative CRUT transport dataset, physical transit interchange hubs appear with slight naming variations across official PDF schedule tables and stoppage listings (e.g. `BHUBANESWAR AIRPORT` on Route 10 vs `AIRPORT` on Route 82). 

Because the spatial planner previously matched origin/destination coordinates strictly to single `Stop` UUIDs, route discovery failed to find valid services between major hubs (e.g., Master Canteen $\leftrightarrow$ Airport) even when the routes exist in the authoritative graph.

Phase 4A introduces an **application-level Canonical Transit Hub clustering layer** that groups stop nodes representing the same physical hub without mutating the underlying database or fabricating coordinates for unresolved stops.

---

### 2. Forensic Database Inventory of Candidate Hubs

#### A. Airport Hub Candidates
| Stop ID | Stop Name | Region/City | Coords Status | Routes Attached | Alias Decision |
|:---|:---|:---|:---:|:---:|:---:|
| `4f295c1f-d478-4b35-b77b-e46722a3cd50` | `BHUBANESWAR AIRPORT` | Bhubaneswar | `geocoded` (20.2523, 85.8135) | 1 (Route 10) | ✅ **ACCEPTED** (Verified Anchor) |
| `1d190390-ff3d-419c-9ca9-dd17bc0ce14e` | `AIRPORT` | Bhubaneswar / Capital | `unresolved` (NULL) | 2 (Route 82, Route 101) | ✅ **ACCEPTED** for Capital Region |
| `b5a521df-809b-4fad-b09a-15e4d8cbebb3` | `BIJU PATNAIK INTERNATIONAL AIRPORT, BBSR`| Bhubaneswar | `unresolved` (NULL) | 1 (Route 17) | ✅ **ACCEPTED** |
| `348ae3d7-dd81-48b8-84a7-20e8f33597f8` | `OLD AIRPORT SQUARE` | Bhubaneswar | `unresolved` (NULL) | 0 | ❌ **REJECTED** (Distinct physical intersection) |
| `42bc3c75-0862-4586-936d-0e45ee023d3d` | `NEW AIRPORT SQUARE` | Bhubaneswar | `unresolved` (NULL) | 0 | ❌ **REJECTED** (Distinct physical intersection) |

#### B. Master Canteen / Station Hub Candidates
| Stop ID | Stop Name | Region/City | Coords Status | Routes Attached | Alias Decision |
|:---|:---|:---|:---:|:---:|:---:|
| `e633a3b6-b0e6-409f-a418-f80384e30f6a` | `BHUBANESWAR RAILWAY STATION` | Bhubaneswar | `geocoded` (20.2668, 85.8436) | 30 routes | ✅ **ACCEPTED** (Verified Anchor) |
| `590c6d95-fb91-441e-9657-a2b785fb2691` | `MASTER CANTEEN` | Bhubaneswar | `unresolved` (NULL) | 1 (Route 28) | ✅ **ACCEPTED** |
| `a92d109b-7d6c-4927-9b7d-7e421a7f80f6` | `MASTER CANTEEN - SCB MEDICAL`| Bhubaneswar | `geocoded` (20.4725, 85.8864) | 1 (Route 82) | ✅ **ACCEPTED** (Terminal variant) |

#### C. Baramunda Hub Candidates
| Stop ID | Stop Name | Region/City | Coords Status | Routes Attached | Alias Decision |
|:---|:---|:---|:---:|:---:|:---:|
| `1a69f886-6b06-405b-8d33-851355c1d168` | `BARAMUNDA BSABT` | Bhubaneswar | `geocoded` (20.2731, 85.7923) | 10 routes | ✅ **ACCEPTED** (Verified Anchor) |
| `9bbce580-15a3-420b-a810-28064ff168ce` | `BARAMUNDA ISBT` | Bhubaneswar | `unresolved` (NULL) | 1 (Route 71) | ✅ **ACCEPTED** |
| `bcf79029-5bf0-4276-8711-03b1666aabc9` | `BARAMUNDA` | Bhubaneswar | `unresolved` (NULL) | 0 | ✅ **ACCEPTED** |
| `2abcdf47-4850-41c6-839c-d43eaf4fe9e3` | `BARAMUNDA SHIVA TEMPLE` | Bhubaneswar | `unresolved` (NULL) | 0 | ❌ **REJECTED** (Distinct religious landmark) |

#### D. Nandankanan Hub Candidates
| Stop ID | Stop Name | Region/City | Coords Status | Routes Attached | Alias Decision |
|:---|:---|:---|:---:|:---:|:---:|
| `48131d75-8ad7-4f2f-9a36-db5840ada85b` | `NANDANKANAN` | Bhubaneswar | `geocoded` (20.3956, 85.8256) | 6 routes | ✅ **ACCEPTED** (Verified Anchor) |
| `e757548a-bb5f-4931-b5f4-4abcc259b1fd` | `NANDANKANAN BOTANICAL GARDEN`| Bhubaneswar | `geocoded` (20.3956, 85.8256) | 1 route | ✅ **ACCEPTED** |
| `acd0eb56-6295-4a5b-b6b2-35a36a0d23ee` | `NANDANKANAN HIGH SCHOOL` | Bhubaneswar | `geocoded` (20.3956, 85.8256) | 1 route | ❌ **REJECTED** (Distinct educational institution) |

#### E. SCB Medical & Cuttack Hub Candidates
| Stop ID | Stop Name | Region/City | Coords Status | Routes Attached | Alias Decision |
|:---|:---|:---|:---:|:---:|:---:|
| `af4b1bb8-eb0d-4bc0-ab65-2fdcf82324c3` | `SCB MEDICAL` | Cuttack/BBSR | `geocoded` (20.4725, 85.8864) | 4 routes | ✅ **ACCEPTED** (Verified Anchor) |
| `df7a9e73-5342-4f0d-a8cb-48d40ffef4d9` | `SCB MEDICAL,CUTTACK` | Cuttack/BBSR | `geocoded` (20.4725, 85.8864) | 1 route | ✅ **ACCEPTED** |

#### F. MKCG Medical (Berhampur) Hub Candidates
| Stop ID | Stop Name | Region/City | Coords Status | Routes Attached | Alias Decision |
|:---|:---|:---|:---:|:---:|:---:|
| `8959d94d-7afa-4285-bdfd-128af4d947a4` | `MKCG MEDICAL` | Berhampur | `geocoded` (19.3083, 84.8083) | 4 routes | ✅ **ACCEPTED** (Verified Anchor) |
| `0e4d0b13-9a3d-4c3e-b810-74d12bb812a1` | `MKCG MEDICAL COLLEGE` | Berhampur | `geocoded` (19.3083, 84.8083) | 2 routes | ✅ **ACCEPTED** |
| `5b564dc2-e352-476f-acaa-55daeb6ead4f` | `MKCG STATE BANK` | Berhampur | `geocoded` (19.3083, 84.8083) | 1 route | ✅ **ACCEPTED** |
| `09b3074c-813d-405f-bbf0-93a8e9e9841f` | `MKCG MEDICAL COLLEGE SQUARE`| Berhampur | `geocoded` (19.3083, 84.8083) | 1 route | ✅ **ACCEPTED** |

---

### 3. Architecture & Implementation Design

1. **Domain Hub Clustering (`backend/app/transport/hubs.py`)**:
   - Maintains explicit mapping from Canonical Hub keys (`HUB_BHUBANESWAR_AIRPORT`, `HUB_MASTER_CANTEEN`, `HUB_BARAMUNDA`, etc.) to member stop names and UUIDs.
   - Provides helper: `get_canonical_hub(stop_name: str, stop_id: str | UUID, city: str | None) -> CanonicalHub | None`.
   - Provides helper: `get_hub_member_stops(hub_key: str, db: Session) -> list[Stop]`.

2. **Planner Enhancement (`backend/app/transport/planner.py`)**:
   - In `_find_verified_nearby_stops`: When a spatial origin/destination point is within walking distance of a verified geocoded stop, the planner expands the candidate stop set to include all member stops belonging to that Canonical Hub.
   - Preserves stop sequence checks ($seq_B < seq_A$) on the exact route.
   - Preserves honest `location = NULL` on unresolved stop records.

3. **Data & Schema Integrity**:
   - **Database Mutations**: **0** (No stops modified, no RouteStops modified, no migrations).
   - **Authoritative Counts**: 3 providers, 154 routes, 1,430 stops, 1,487 links, 302 schedules, 5,553 departures, 41 geocoded, 1,389 unresolved.
