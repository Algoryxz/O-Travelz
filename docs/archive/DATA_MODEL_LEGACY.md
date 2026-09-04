# Data Model & Source of Truth — O-TRAVELZ

## 1. Domain Catalog & Datasets

### A. Places & Destinations (`data/places/places.json`)
* Master catalog of 161+ verified destinations, heritage sites, nature spots, and culinary hubs across Odisha.
* **Schema**: Unique `id`, `research_id`, `name`, `category`, `district`, `coordinates` (`lat`, `lon`), `opening_hours`, `ticket_price`, `contact_number`, `entry_fee`, `image_hash`.

### B. Image Pipeline & Provenance (`data/images/`)
* **Hard Rule**: `NO VERIFIED IMAGE = NO PUBLIC DESTINATION`.
* Each published place directory under `data/images/places/<place_id>/<hash>/` contains 4 standard WebP variants:
  * `hero.webp` (high-resolution landscape hero banner)
  * `card.webp` (medium card representation)
  * `thumbnail.webp` (low-resolution thumbnail)
  * `original.webp` (master archived photo)
* **Provenance Ledgers**: `data/images/sources/legacy_provenance_recovery.json`, `data/images/sources/a2_unrecoverable_backlog.json`.
* **Audit Validator**: `scripts/audit_destination_images.py` generates `publishability_report.json`.

### C. Transit Network (`data/transport/canonical/`)
* 154 Routes, 1,430 Stops, scheduled departures, corridor stops, and aliases across Mo Bus (CRUT) and Ama Bus networks.
* **Canonical JSON files**:
  * `routes.json`: Route ID, route number, route name, origin, destination, service area.
  * `stops.json`: Stop ID, verified name, coordinates (`lat`, `lon`), code.
  * `route_stops.json`: Ordered stop sequence per route.
  * `schedules.json`: Fixed timetable departures.
  * `aliases.json`: Multilingual and colloquial stop name aliases.

### D. Traveler Essentials & Facilities (`data/services/`)
* Verified civic infrastructure across Odisha districts:
  * `atms.json`: 24/7 bank ATMs with precise coordinates.
  * `hospitals.json`: Emergency care and district health centers.
  * `fuel.json`: Petrol and EV charging stations along highway corridors.
  * `police.json`: Police stations and assistance booths.

---

## 2. Representation Layers

| Dataset | Canonical File | Database Table | Frontend Offline Bundle |
|---|---|---|---|
| **Places** | `data/places/places.json` | `places` | In-memory fallback (`places.json`) |
| **Images** | `data/images/places/` | `place_images` | Proxied via `/api/v1/images/...` |
| **Transit Stops** | `data/transport/canonical/stops.json` | `stops` | `frontend/src/data/staticTransitStops.ts` |
| **Transit Routes** | `data/transport/canonical/routes.json` | `routes` | `frontend/src/data/staticTransitRoutes.ts` |
| **Timetables** | `data/transport/canonical/schedules.json` | `scheduled_trip_groups` | `frontend/src/data/transitTimetables.ts` |
| **Services** | `data/services/*.json` | `services` | Loaded from REST API |

---

## 3. Data Integrity & Verification

1. **Validation Gates**:
   - `python scripts/validate_round2_research.py`: Checks staging records against Pydantic schema.
   - `python scripts/validate_image_pipeline.py`: Validates photographic integrity and all 4 WebP variants.
   - `python scripts/validate_canonical_transit.py`: Asserts stop coordinate validity and route topology.
   - `python scripts/generate_frontend_transit_data.py --check`: Prevents frontend drift from canonical transit data.
