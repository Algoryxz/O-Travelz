# O-Travelz — Traveller Essentials, Local Services & Safety Layer

**Authoritative Architecture, Data Model, Proximity Engine, AI Tools & Service Image Catalog Documentation**  
**SOA IDEATHON 2026 — Round 2 Traveller Support Subsystem**  
**Contributor**: Rudra — Eastern Odisha Research Lead & System Architect  

---

## 1. Overview, Purpose & Core Principles

The **Traveller Essentials & Local Services** subsystem extends O-Travelz beyond tourist sightseeing by providing mission-critical logistical, safety, healthcare, and transit intelligence around every destination.

### 1.1 Why Traveller Essentials Exists
When tourists explore destinations in Odisha—especially remote lakes, river islands, or wildlife sanctuaries such as **Ansupa Lake**, **Dhabaleswar Island**, or **Gahirmatha Marine Sanctuary**—their practical concerns extend beyond monument descriptions:
1. **Health & Emergency Care**: Identifying the nearest 24x7 hospital, Sub-Divisional Hospital (SDH), Community Health Centre (CHC), or ambulance helpline (108).
2. **Law Enforcement & Safety**: Locating the nearest police station, coastal outpost, or tourist assistance booth (112).
3. **Logistics & Fuel**: Pinpointing verified fuel stations (IOCL, HPCL, BPCL) and operational bank ATMs (SBI, PNB) before entering rural or forested corridors.
4. **Local Transit**: Identifying nearest bus terminals (OSRTC, CRUT Mo Bus) and railway junctions.
5. **Destination Safety Guidance**: Providing official emergency contacts, seasonal flood/tide advisories, wildlife rules, and recommended visiting hours.

### 1.2 Fundamental Architecture Invariants
- **Destinations ≠ Support Services (Strict Domain Separation)**:
  - Tourist attractions (temples, palaces, craft villages, waterfalls) reside exclusively in the destination catalog (`data/places/` or `data/research/`).
  - Support amenities (hospitals, police outposts, fuel pumps, ATMs, bus stops) reside strictly in the dedicated service layer (`data/services/`).
  - A hospital will **never** appear in the tourist attraction list; a tourist attraction is **never** classified as a support service.
- **AI Grounding Guarantee ("AI Orchestrates; It Does Not Invent Facts")**:
  - The AI assistant owns natural language interpretation and conversational presentation.
  - The AI assistant **does not own** coordinates, phone numbers, opening hours, distances, or safety rules.
  - All factual travel essentials are retrieved deterministically from the backend domain engine (`EssentialsService`) via registered tools (`get_nearby_services`, `get_destination_safety`).
- **Zero-Fabrication Proximity Guarantee**:
  - Every service record has verified coordinates, official contact numbers, and traceable government/operator source provenance.
  - If no verified facility exists within 5 km of an isolated site, the system transparently indicates the exact distance to the nearest verified facility across progressive expansion rings rather than inventing fictitious nearby amenities.

---

## 2. Current Verified Dataset Coverage

The current verified Traveller Essentials dataset covers **61 support service records** and **21 destination safety profiles** focused on the 7 districts of Eastern Odisha (**Angul, Bhadrak, Cuttack, Dhenkanal, Jagatsinghpur, Jajpur, Kendrapara**).

### 2.1 Service Records Breakdown by Category

| Category | Public Label | Record Count | Supported Subcategories | Authoritative Provenance |
|---|---|---|---|---|
| `healthcare` | **Healthcare** | **18** | `hospital` (DHH/SDH), `chc` (Community Health Centre), `emergency_facility` | Health & Family Welfare Dept Odisha, DMET, District Health Societies |
| `police` | **Safety & Police** | **17** | `police_station`, `police_outpost`, `coastal_police` | Odisha State Police Directory, District Police Administrations |
| `hotel` | **Hotels & Stays** | **10** | `hotel_otdc_panthanivas`, `hotel_budget`, `hotel_guest_house`, `homestay`, `eco_retreat` | Odisha Tourism Development Corporation (OTDC), Ecotour Odisha |
| `atm` | **ATMs & Cash** | **5** | `sbi_atm`, `bank_atm`, `postal_payment` | State Level Bankers' Committee (SLBC) Odisha, Bank Branch Locators |
| `transit` | **Transit & Hubs** | **4** | `railway_station`, `bus_stand` | East Coast Railway, OSRTC, Municipal Transport Authorities |
| `fuel` | **Fuel Stations** | **4** | `petrol_pump`, `fuel_station` | Indian Oil (IOCL), Bharat Petroleum (BPCL), HPCL Retail Locators |
| `restaurant` | **Dining** | **3** | `restaurant`, `vegetarian`, `coastal_cuisine` | Tourism Food Registry, District Tourism Dining Guides |
| **TOTAL** | | **61** | | |

### 2.2 Destination Safety Profiles
* **Total Safety Advisories**: **21 destination safety profiles** (`data/services/destination_safety_advisories.json`), mapping 100% of the 21 researched Eastern Odisha candidate destinations (`round2_east_001` through `round2_east_021`) to verified nearest police outposts, hospitals, 24x7 emergency contacts, and localized terrain rules.

---

## 3. Data Models & Schemas

### 3.1 Service Data Model (`data/services/odisha_services.json`)
Conforms to the schema defined in [`data/research/round2/schema/service.schema.json`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/data/research/round2/schema/service.schema.json).

```json
{
  "id": "hosp_athagarh_sdh",
  "name": "Sub-Divisional Hospital Athagarh",
  "category": "healthcare",
  "subcategory": "hospital",
  "district": "Cuttack",
  "locality": "Athagarh",
  "lat": 20.5286,
  "lon": 85.7865,
  "address": "Hospital Road, Athagarh, Cuttack 754029",
  "phone": "06723-220224",
  "emergency_phone": "108",
  "is_24x7": true,
  "opening_hours": "24 Hours",
  "amenities": ["24x7 Emergency", "Maternity Ward", "Ambulance", "Pathology"],
  "source": "District Health Society Cuttack / National Health Mission",
  "source_url": "https://cuttack.nic.in/health-facilities/",
  "source_type": "health_department",
  "verification_status": "verified",
  "data_type": "static",
  "last_verified": "2026-08-31",
  "notes": "Nearest major sub-divisional hospital to Dhabaleswar Island Temple (~4.5 km)."
}
```

#### Field Specifications:
* **`id`** (`string`, Authoritative, Unique): Canonical alphanumeric identifier (e.g. `hosp_scb_cuttack`, `police_tigiria_ps`, `fuel_ioc_athagarh`).
* **`name`** (`string`, Authoritative): Official physical facility name.
* **`category`** (`enum`, Authoritative): One of `healthcare`, `police`, `hotel`, `restaurant`, `fuel`, `transit`, `atm`, `safety`.
* **`subcategory`** (`string`, Authoritative): Fine-grained classification (e.g. `hospital`, `chc`, `petrol_pump`, `railway_station`).
* **`district`** (`string`, Authoritative): Administrative district within Odisha.
* **`locality`** (`string`, Optional): Town, block, or neighborhood.
* **`lat`, `lon`** (`float`, Authoritative): WGS84 GPS coordinates validated within Odisha geographic bounds ($17.8^\circ \text{N} \le \text{lat} \le 22.6^\circ \text{N}$, $81.4^\circ \text{E} \le \text{lon} \le 87.5^\circ \text{E}$).
* **`address`** (`string`, Authoritative): Verified postal or street address.
* **`phone`, `emergency_phone`** (`string`, Optional/Nullable): Official landlines, mobile help desks, or national emergency numbers (`108`, `112`).
* **`is_24x7`** (`boolean`, Authoritative): Whether the facility operates continuously.
* **`opening_hours`** (`string`, Optional): Specific operating schedule.
* **`amenities`, `fuel_types`, `routes_served`** (`array`, Optional): Category-specific attribute arrays.
* **`source`, `source_url`, `source_type`** (`string`, Authoritative): Direct provenance citation.
* **`verification_status`** (`enum`, Authoritative): `verified`, `cross_checked`, or `pending`.
* **`data_type`** (`string`, Authoritative): `static` for permanent structures; volatile attributes carry explicit verification timestamps.
* **`last_verified`** (`string`, Authoritative): `YYYY-MM-DD` date when facility data was confirmed against official records.

### 3.2 Destination Safety Advisory Model (`data/services/destination_safety_advisories.json`)
Conforms to the schema defined in [`data/research/round2/schema/safety.schema.json`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/data/research/round2/schema/safety.schema.json).

```json
{
  "destination_id": "round2_east_018",
  "destination_name": "Dhabaleswar Island Temple",
  "district": "Cuttack",
  "nearest_police_station_id": "police_dhabaleswar_outpost",
  "nearest_police_station_name": "Dhabaleswar Police Outpost",
  "nearest_hospital_id": "hosp_athagarh_sdh",
  "nearest_hospital_name": "Sub-Divisional Hospital Athagarh",
  "emergency_contacts": [
    { "label": "Police Emergency", "number": "112", "service_type": "police", "is_24x7": true },
    { "label": "Medical Emergency (Ambulance)", "number": "108", "service_type": "ambulance", "is_24x7": true },
    { "label": "Athagarh Police Station", "number": "06723-220222", "service_type": "police", "is_24x7": true }
  ],
  "safety_advisories": [
    {
      "category": "terrain_guidance",
      "title": "Mahanadi River Island Access",
      "guidance": "Access via suspension footbridge or licensed ferry ghat only. Strictly avoid unauthorized country boats during monsoon river swell.",
      "severity": "caution"
    }
  ],
  "network_connectivity": "good_4g_5g",
  "best_visiting_hours": "05:00 AM - 08:30 PM",
  "source": "District Administration Cuttack / Odisha Police",
  "last_verified": "2026-08-31"
}
```

---

## 4. Verification & Research Methodology

All service records and safety profiles were collected and verified following a strict multi-tier hierarchy:

1. **Tier 1: Government Portals & District Health/Police Societies**:
   - Directorate of Medical Education & Training (DMET) Odisha & National Health Mission (NHM) for hospitals and CHCs.
   - Odisha State Police Directory and District Police Administrations for police stations and outposts.
   - District Administration portals (`cuttack.nic.in`, `kendrapara.nic.in`, `bhadrak.nic.in`, etc.) for emergency helplines and administrative contacts.
2. **Tier 2: Official Public Sector Operators & Utilities**:
   - Odisha Tourism Development Corporation (OTDC) and Ecotour Odisha for Panthanivas, nature camps, and guest houses.
   - Indian Oil Corporation (IOCL), Bharat Petroleum (BPCL), and Hindustan Petroleum (HPCL) dealer locators for retail fuel stations.
   - State Level Bankers' Committee (SLBC) Odisha & State Bank of India / Punjab National Bank branch locators for bank ATMs.
   - East Coast Railway (ECoR) & OSRTC for rail and bus terminals.
3. **Tier 3: OpenStreetMap & Geospatial Boundary Cross-Checking**:
   - Verification of physical building coordinates and road approach junctions against satellite imagery and OpenStreetMap bounding envelopes.
4. **Anti-Hallucination Rejection Rules**:
   - Commercial travel blogs, unverified crowdsourced review sites, and automated scrapers were strictly excluded.
   - Any facility whose physical address, jurisdiction, or coordinates could not be confirmed via official registries was excluded.

---

## 5. Proximity Engine & Progressive Radius Expansion

The backend proximity engine in [`backend/app/services/essentials/service.py`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/backend/app/services/essentials/service.py) calculates great-circle distances and handles progressive radius expansion.

### 5.1 Expansion Ladder Mechanics
To support both densely populated urban hubs (e.g. Cuttack Town) and isolated natural habitats (e.g. Gahirmatha Marine Sanctuary), the engine executes an adaptive search ladder:
$$\text{Ladder} = [r_{\text{requested}}, 10.0\text{ km}, 25.0\text{ km}, r_{\text{max}}]$$

1. **Initial Evaluation**: Search facilities within $r_{\text{requested}}$ (default: 5.0 km or 10.0 km).
2. **Expansion Trigger**: If the number of matching facilities is less than `min_results` (default: 1), the engine automatically expands to 10 km, then 25 km, and finally up to $r_{\text{max}}$ (default: 50.0 km).
3. **Active Radius & Expansion State**:
   - `active_radius_km`: The actual radius ring in which the nearest verified result was discovered.
   - `is_expanded`: A boolean flag (`true` if $\text{active\_radius} > r_{\text{requested}}$, `false` otherwise).
4. **No-Data State**: If no verified facility exists within 50 km, an empty list with `count: 0` is returned transparently.

---

## 6. Distance Semantics & Truthfulness Labels

### 6.1 Definition of Straight-Line Geodesic Distance
All distance calculations in the service layer are computed using the Haversine great-circle formula:
$$d = 2 R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta\text{lon}}{2}\right)} \right)$$
where $R = 6371.0\text{ km}$.

### 6.2 Truthfulness Guarantee
- Geodesic distance **must never be misrepresented** as road driving distance, walking distance, or travel itinerary time.
- API contracts explicitly declare:
  ```json
  "distance_semantics": "straight_line_haversine"
  ```
- The frontend UI strictly formats distances with explicit semantic badges:
  ```
  4.9 km · straight-line
  ```
- Driving and walking estimates (`estimated_drive_minutes`, `estimated_walk_minutes`) apply standard road winding factors ($1.25\times$) for heuristic guidance only. Exact road graph routing belongs to the transport subsystem.

---

## 7. Backend Domain Architecture & Runtime Engine

```
Verified Data Files (data/services/odisha_services.json & destination_safety_advisories.json)
       ↓
Backend Domain Service (backend/app/services/essentials/service.py)
       ↓
FastAPI Router (backend/app/api/services_routes.py @ /api/v1/services)
       ├──→ AI Tool Execution Boundary (ToolRegistry: get_nearby_services, get_destination_safety)
       └──→ Frontend API Client (frontend/src/api/client.ts)
                 ↓
            React UI (NearbyEssentialsTab.tsx) [with L3 Offline Snapshot Fallback]
```

### 7.1 Authoritative Runtime Engine (`EssentialsService`)
- **Location**: [`backend/app/services/essentials/service.py`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/backend/app/services/essentials/service.py)
- **Current Authoritative Runtime Source**: **Canonical JSON Datasets + Backend In-Memory Indexing** (`data/services/odisha_services.json` and `destination_safety_advisories.json`).
- *Note on PostGIS*: The domain service is structured with strict Pydantic contracts and clean decoupling, ready for direct PostgreSQL/PostGIS table migration when database synchronization is enabled across the repository. In the current staging phase, queries are evaluated in-memory using deterministic Haversine calculations. No false claims of active PostGIS querying are made.

---

## 8. Canonical REST API Specifications

**Canonical Base URL**: `/api/v1/services` (registered in [`backend/app/main.py`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/backend/app/main.py)).

### 8.1 `GET /api/v1/services/nearby`
Find verified support services around geographic coordinates with progressive radius expansion.

* **Parameters**:
  - `lat` (`float`, Required, $17.8 \le \text{lat} \le 22.6$): WGS84 Latitude.
  - `lon` (`float`, Required, $81.4 \le \text{lon} \le 87.5$): WGS84 Longitude.
  - `category` (`string`, Optional): Filter by category (`healthcare`, `police`, `hotel`, `restaurant`, `fuel`, `transit`, `atm`).
  - `subcategory` (`string`, Optional): Subcategory filter (e.g. `hospital`, `chc`, `petrol_pump`).
  - `radius_km` (`float`, Default `5.0`): Initial search radius in km.
  - `max_radius_km` (`float`, Default `50.0`): Maximum radius expansion ceiling.
  - `limit` (`integer`, Default `20`): Maximum records to return.
* **Response Model**: `NearbyServicesListResponse`
  ```json
  {
    "query_lat": 20.5056,
    "query_lon": 85.8267,
    "category": "healthcare",
    "requested_radius_km": 5.0,
    "active_radius_km": 5.0,
    "is_expanded": false,
    "count": 1,
    "distance_semantics": "straight_line_haversine",
    "services": [
      {
        "id": "hosp_athagarh_sdh",
        "name": "Sub-Divisional Hospital Athagarh",
        "category": "healthcare",
        "subcategory": "hospital",
        "district": "Cuttack",
        "locality": "Athagarh",
        "lat": 20.5286,
        "lon": 85.7865,
        "address": "Hospital Road, Athagarh, Cuttack 754029",
        "phone": "06723-220224",
        "emergency_phone": "108",
        "is_24x7": true,
        "distance_km": 4.88,
        "distance_formatted": "4.9 km away",
        "distance_semantics": "straight_line_haversine",
        "estimated_drive_minutes": 10,
        "estimated_walk_minutes": 61,
        "source": "District Health Society Cuttack / National Health Mission",
        "verification_status": "verified",
        "last_verified": "2026-08-31"
      }
    ]
  }
  ```

### 8.2 `GET /api/v1/services/safety/{destination_id}`
Retrieve verified emergency contacts, nearest police station, nearest hospital, and terrain advisories.

* **Parameters**:
  - `destination_id` (`string`, Path): Canonical destination identifier (e.g. `round2_east_018`).
* **Response Model**: `DestinationSafetyContract` (Returns 404 if not found).

### 8.3 `GET /api/v1/services/for-destination`
Comprehensive grouped discovery of all 7 support categories plus destination safety profile for modal views.

* **Parameters**:
  - `lat`, `lon` (`float`, Required): Destination coordinates.
  - `destination_id` (`string`, Optional): Destination ID for safety profile resolution.
  - `destination_name` (`string`, Optional): Destination name for fallback safety resolution.
  - `radius_km` (`float`, Default `10.0`): Search radius in km.
* **Response Model**: `NearbyServicesGroupedResponse` (Includes `healthcare`, `police`, `hotels`, `restaurants`, `fuel`, `transit`, `atms`, `safety_advisory`, `distance_semantics`, `active_radius_km`, `is_expanded`).

---

## 9. Deterministic AI Tool Integration

Authoritative tool adapters are defined in [`backend/app/ai/tools/`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/backend/app/ai/tools/) and registered into the provider-neutral `ToolRegistry`:

```
User Intent ("Where is the nearest hospital to Dhabaleswar?")
       ↓
AI Conversational Orchestrator (backend/app/ai/conversation.py)
       ↓
Approved Tool Execution (GetNearbyServicesToolAdapter / GetDestinationSafetyToolAdapter)
       ↓
Deterministic Domain Engine (EssentialsService)
       ↓
Structured Verified JSON Result
       ↓
Natural Language Explanation Formatted by LLM (Zero Hallucination of facts/numbers)
```

### 9.1 Registered AI Tools:
1. **`get_nearby_services`** ([`get_nearby_services.py`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/backend/app/ai/tools/get_nearby_services.py)):
   - Arguments: `lat`, `lon`, `category`, `subcategory`, `radius_km`, `limit`.
   - Queries `EssentialsService.search_nearby_services`.
2. **`get_destination_safety`** ([`get_destination_safety.py`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/backend/app/ai/tools/get_destination_safety.py)):
   - Arguments: `destination_id_or_name`.
   - Queries `EssentialsService.get_destination_safety` (falls back gracefully to standard state helplines `112`/`108` if destination is unlisted).

---

## 10. Frontend Presentation & Offline Snapshot Resilience

### 10.1 UI Component Architecture
- **Location**: [`frontend/src/components/place/NearbyEssentialsTab.tsx`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/frontend/src/components/place/NearbyEssentialsTab.tsx) rendered inside `PlaceDetailsModal.tsx`.
- **Features**:
  - Category selector pills with live count badges.
  - Prominent Traveller Safety Banner with emergency helplines (`tel:108`, `tel:112`, local landlines).
  - Explicit `(Straight-line)` distance indicators.
  - Direct integration with `MapCanvas.tsx` for visual map pin centering.

### 10.2 Resilience & Degraded L3 Operation
- **Primary Flow**: On mount, `NearbyEssentialsTab` invokes `apiClient.getDestinationEssentials(...)` querying `/api/v1/services/for-destination`.
- **Degraded / Offline Mode**:
  - If the backend is unreachable or returns a network error, the component catches the exception and transitions to **`isOfflineSnapshot = true`**.
  - A prominent notice banner is displayed:
    > **Offline Snapshot · Displaying verified static development dataset (August 2026)**
  - An explicit backend "no data within 50 km" response is **never silently overridden** with stale local data.

---

## 11. Service Image Catalog & Photographic Provenance (`data/services/services_image_catalog.json`)

### 11.1 Separation of Service Verification and Image Verification
Service verification and image verification are strictly separate evidence states:
- **Service Verification**: Establishes that the physical facility, emergency contacts, operating hours, and location facts are genuine and verified via official government directories.
- **Image Verification**: Establishes that a photograph corresponds to the exact physical facility, has traceable source provenance, and is published under an unambiguous Creative Commons or open reuse license.
- *A verified service does not automatically imply a verified image.*

### 11.2 Status Semantics
- **`VERIFIED_IMAGE`** (**4 records**): Exact physical facility photograph authenticated with verified Creative Commons / open reuse license.
- **`NO_REUSABLE_IMAGE_FOUND`** (**57 records**): Multi-source sweep across operator portals, district administration sites, tourism directories, and Wikimedia Commons found no open-licensed authentic photograph.
- **`REVIEW_REQUIRED`** (**0 records**): No unresolved or ambiguous licensing states remain.

### 11.3 Field Photography Semantics
- **`field_photography_recommended: true`**: Indicates that a reasonable multi-source research sweep across operator websites, district portals, tourism directories, and open archives did not identify a suitable reusable photograph; taking original on-ground photography is recommended for service identification and user-facing presentation. It does not imply that no photograph could ever exist.

### 11.4 Quality Classification & Identity Confidence
- **`quality`**:
  - `HIGH`: Long edge $\ge$ 1600 px (**3 images**)
  - `MEDIUM`: Long edge 1000–1599 px (**0 images**)
  - `LOW`: Long edge $<$ 1000 px (**1 image**: SCB Platinum Jubilee Gate at 731 × 419 px, retained for authentic site correspondence)
- **`identity_confidence`**:
  - `HIGH`: Concrete visual and textual evidence linking the image to the exact physical building facade (**100% of verified images**).
- **`usage`**:
  - `service_card`: Intended frontend component card display (**100% of verified images**).

### 11.5 Verified Service Facilities Provenance Table

| Service ID | Service Name | Category | Dimensions & Quality | Confidence | Usage | Source & Author | License | Status |
|---|---|---|---|---|---|---|---|---|
| `hosp_scb_cuttack` | SCB Medical College and Hospital | healthcare | 731 × 419 (`LOW`) | `HIGH` | `service_card` | Wikimedia Commons / Satya Narayan Baral | CC BY-SA 4.0 | `VERIFIED_IMAGE` |
| `transit_cuttack_railway_station` | Cuttack Railway Junction (CTC) | transit | 2048 × 1536 (`HIGH`) | `HIGH` | `service_card` | Wikimedia Commons / Aruni Nayak | CC BY-SA 3.0 | `VERIFIED_IMAGE` |
| `transit_badambadi_bus_stand` | Netaji Subhash Chandra Bose Bus Terminal | transit | 4000 × 3000 (`HIGH`) | `HIGH` | `service_card` | Wikimedia Commons / Kamalakanta777 | CC BY-SA 3.0 | `VERIFIED_IMAGE` |
| `transit_bhadrak_railway_station` | Bhadrak Railway Junction (BHC) | transit | 2870 × 1836 (`HIGH`) | `HIGH` | `service_card` | Wikimedia Commons / Pinakpani | CC BY 4.0 | `VERIFIED_IMAGE` |

### 11.6 Structured Research Trace & Timestamps
Every service entry documents structured research attempts across `official_operator`, `government`, `tourism`, and `wikimedia` with respective source URLs or search queries, accompanied by the `last_checked_at` audit timestamp (`2026-09-01`).

---

## 12. Pilot Hub Verification (5 Geographic Archetypes)

To verify the architecture across distinct geographic terrains, five diverse pilot hubs were tested:

| Pilot Destination | Archetype | Nearest Hospital | Nearest Police | Nearest Hotel |
|---|---|---|---|---|
| **Dhabaleswar Island Temple** | River Island / Shaivite | Athagarh SDH (4.9 km) | Dhabaleswar Outpost (0.4 km) | Dhabaleswar Yatri Nivas (0.1 km) |
| **Ansupa Lake** | Freshwater Lake / Ecotourism | Tigiria CHC (8.9 km) | Tigiria PS (9.1 km) | Ansupa Nature Camp (0.3 km) |
| **Gahirmatha Marine Sanctuary** | Coastal Estuary / Wildlife | Rajkanika CHC (36.2 km) | Talchua Coastal PS (9.2 km) | OTDC Aranya Nivas (36.2 km) |
| **Lalitgiri Buddhist Complex** | Hilltop / Archaeological | Chandikhole CHC (12.1 km) | Balichandrapur PS (6.4 km) | OTDC Tourist Complex (0.2 km) |
| **Nuapatna Handloom Village** | Rural / Artisan Craft | Tigiria CHC (2.6 km) | Tigiria PS (2.3 km) | Boyanika Guest House (0.3 km) |

---

## 13. Comprehensive Validation & Test Matrix

| Validation Suite | Command | Verified Result | Scope / Invariants Enforced |
|---|---|---|---|
| **Backend Pytest Suite** | `python -m pytest backend/tests/test_services_engine.py backend/tests/test_services_api.py backend/tests/test_services_ai_tools.py -v` | **21 passed in 0.95s** | Coordinates, Haversine zero-distance, subcategory filtering, progressive radius expansion, HTTP routes, 404 handling, AI tool adapters. |
| **Services Image Catalog Validator** | `python scripts/validate_services_image_catalog.py` | **PASS (100%)** | 61/61 ID linkage, image status, dimension-quality match, confidence, usage, research trace, last_checked_at. |
| **Destination Image Catalog Validator** | `python scripts/validate_image_catalog.py` | **PASS (100%)** | 21/21 destination candidates, 64 images, 19 verified, 2 needs_image, CC licenses, zero duplicate URLs. |
| **Services Data & Proximity Validator** | `python scripts/validate_services_data.py` | **PASS (100%)** | 61 service records, 21 safety profiles, coordinate bounding box, pilot hub proximity verification. |
| **Round 2 Staging Research Validator** | `python scripts/validate_round2_research.py` | **PASS (100%)** | 21 Eastern candidates, 63 sources, cross-region collision check clean (2 unpromoted needs_image warnings). |
| **Project Context Check** | `python scripts/check_project_context.py` | **PASS (100%)** | 14/14 required context files present, all cross-references verified. |
| **Repository Final State Integrity** | `python scripts/verify_final_repo_state.py` | **PASS (100%)** | Reconciles candidates, catalog, sources, and frontend image registry. |
| **Git Diff Format Check** | `git diff --check` | **PASS (Clean)** | Zero trailing whitespace or merge conflict markers. |

---

## 14. Current Limitations

1. **Straight-Line Geodesic Distances**:
   - Distance calculations are currently great-circle Haversine approximations and explicitly labeled as `(Straight-line)`. Road-network graph routing belongs to the transport subsystem.
2. **Static Verified Telemetry**:
   - Operating hours and contact details reflect verified registry snapshots (August 2026); no live IoT pump telemetry or real-time hospital bed availability is fabricated.
3. **Partial Service Image Coverage**:
   - 4 out of 61 services have verified authentic photography. The remaining 57 local facilities currently have no reusable image identified in the completed sweep, and field photography is recommended where appropriate.
4. **Staging JSON Runtime**:
   - `EssentialsService` currently operates in-memory over canonical JSON datasets pending database schema synchronization for regional services.
5. **Regional Scope**:
   - The verified dataset currently focuses on the 7 Eastern Odisha districts. Western, Southern, and Northern regions will be integrated as regional research leads stage their verified data.

---

## 15. Future Integration / Handoff Notes (`NOT CURRENTLY IMPLEMENTED`)

The following items are potential future enhancements and are **NOT currently implemented**:
1. **PostgreSQL/PostGIS Migration**: Migrating `odisha_services.json` and `destination_safety_advisories.json` into a PostGIS table with a `geography(Point, 4326)` column with spatial GIST indexing when the project enters database synchronization.
2. **Transport-Aware Route Routing**: Bridging `EssentialsService` with the transport road network graph to compute exact driving turn-by-turn road distances.
3. **On-Ground Field Photography Program**: Commissioning original CC BY-licensed photography for the 57 local support facilities marked with `field_photography_recommended: true`.
4. **Itinerary Accessibility Ranking**: Adding optional constraints (e.g. `requires_emergency_medical: bool`, `max_hospital_distance_km: float`) to the itinerary ranking engine after product approval.

---

## 16. Subsystem File Ownership Matrix

| File Path | Subsystem Responsibility | Status |
|---|---|---|
| [`data/services/odisha_services.json`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/data/services/odisha_services.json) | Canonical verified dataset for 61 support services. | Authoritative Data |
| [`data/services/destination_safety_advisories.json`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/data/services/destination_safety_advisories.json) | Canonical safety profiles & emergency helplines for 21 destinations. | Authoritative Data |
| [`data/services/services_image_catalog.json`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/data/services/services_image_catalog.json) | Service image catalog with provenance, quality, and research trace. | Authoritative Data |
| [`backend/app/schemas/service.py`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/backend/app/schemas/service.py) | Pydantic contracts and API response models. | Backend Contract |
| [`backend/app/services/essentials/service.py`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/backend/app/services/essentials/service.py) | Authoritative domain engine for proximity and expansion. | Backend Domain |
| [`backend/app/api/services_routes.py`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/backend/app/api/services_routes.py) | FastAPI HTTP endpoints under `/api/v1/services`. | Backend API |
| [`backend/app/ai/tools/get_nearby_services.py`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/backend/app/ai/tools/get_nearby_services.py) | Deterministic AI tool for nearby services. | AI Tool Layer |
| [`backend/app/ai/tools/get_destination_safety.py`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/backend/app/ai/tools/get_destination_safety.py) | Deterministic AI tool for safety advisories. | AI Tool Layer |
| [`frontend/src/types/services.ts`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/frontend/src/types/services.ts) | TypeScript interfaces synchronized with backend schemas. | Frontend Contract |
| [`frontend/src/components/place/NearbyEssentialsTab.tsx`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/frontend/src/components/place/NearbyEssentialsTab.tsx) | React UI component with offline snapshot fallback. | Frontend UI |
| [`scripts/validate_services_image_catalog.py`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/scripts/validate_services_image_catalog.py) | Automated validator for service image catalog. | Validation Tool |
| [`scripts/validate_services_data.py`](file:///c:/Users/Rudra/OneDrive/Desktop/O-travelz/scripts/validate_services_data.py) | Automated validator for services and safety datasets. | Validation Tool |

---

## 17. Research & Developer Handoff Checklist

### Checklist for Adding a New Service Record:
- [ ] **Verify Exact Entity**: Confirm physical existence through official government/operator registries (NHM, Police, OTDC, IOCL, SLBC).
- [ ] **Verify Coordinates**: Confirm WGS84 GPS latitude and longitude lie within Odisha bounds ($17.8^\circ\text{N} \dots 22.6^\circ\text{N}, 81.4^\circ\text{E} \dots 87.5^\circ\text{E}$).
- [ ] **Capture Full Provenance**: Record `source`, `source_url`, `source_type`, `is_24x7`, and `last_verified`.
- [ ] **Avoid Unsupported Claims**: Do not invent opening hours, prices, or live availability.
- [ ] **Validate Schema**: Ensure record passes `python scripts/validate_services_data.py`.

### Checklist for Adding a Service Image:
- [ ] **Verify Exact Physical Building**: Ensure photo depicts the exact facility, not a generic company logo, stock vehicle, or unrelated branch.
- [ ] **Verify Open License**: Ensure image is licensed under CC BY, CC BY-SA, CC0, or Public Domain.
- [ ] **Capture Full Attribution**: Record photographer/author, license URL, direct image URL, and source description page URL.
- [ ] **Classify Quality**: Set `quality` based on pixel dimensions (`HIGH` $\ge 1600$, `MEDIUM` $1000\dots 1599$, `LOW` $< 1000$).
- [ ] **Set Identity Confidence**: Set `identity_confidence: "HIGH"` only when exact building correspondence is proven.
- [ ] **Set Status & Usage**: Assign `image_verification_status: "VERIFIED_IMAGE"` and `usage: "service_card"`.
- [ ] **Validate Catalog**: Ensure record passes `python scripts/validate_services_image_catalog.py`.
