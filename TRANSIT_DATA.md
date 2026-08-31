# TRANSIT_DATA.md — O-TRAVELZ Mo Bus / Ama Bus Transit Data Specification

> Read `PROJECT_CONTEXT.md` first for full project background.
> This document defines the canonical transit data model, current inventory, and operating rules.

---

## The Canonical Transit Principle

> **There must be ONE transit source of truth.**

Do not independently maintain a backend transit stop universe and a different frontend transit universe.

Frontend fallback data in `frontend/src/data/staticTransitStops.ts` must be generated from or directly consume the canonical transit source files in `data/transport/canonical/`.

If the canonical files and the frontend fallback diverge, the canonical files win.

---

## What Exists — Verified Inventory (as of 2026-09-01)

| Asset | Count | Status |
|---|---|---|
| CRUT / Ama Bus routes verified from official documents | 154 | Verified (source: official schedule PDFs, effective 2026-08-21) |
| Logical canonical stops in canonical dataset | 1,430 | Normalized in `data/transport/canonical/stops.json` |
| Ordered route stop sequences | 164 lists (1,491 stops) | 100% route coverage in `data/transport/canonical/route_stops.json` |
| Routable stops with verified coordinates | **83** | 83 of 1,430 logical stops currently have sufficiently verified coordinates (31 Official, 26 Geospatial, 26 High-Confidence) |
| Stops with unresolved coordinates | **1,347** | `UNRESOLVED` — coordinates strictly `null` (zero fabrication) |
| Routes with ≥ 2 routable stops | **58** | Capable of geometric corridor evaluation |
| Top 25 interchange hubs resolved | **52.0% (13/25)** | Major transit nodes verified (Bhubaneswar, Cuttack, Puri, Berhampur, etc.) |
| Schedule departure records | 302 | Covering 145 routes in `data/transport/canonical/schedules.json` |
| Individual departure times | 5,549 | Validated `HH:MM` timestamps (0 malformed) |
| Alias mappings generated | 2,924 | Registered in `data/transport/canonical/aliases.json` |
| Fare data | 0 | `amount_inr: null` universally — NOT IMPLEMENTED |

### Canonical Pipeline Artifacts (`data/transport/canonical/`)

| File | Records | Purpose |
|---|---|---|
| `stops.json` | 1,430 stops (83 routable) | Authoritative canonical stop registry |
| `routes.json` | 154 routes | Authoritative route registry across all regions |
| `route_stops.json` | 164 sequences (1,491 stops) | Directional ordered stop sequence topology |
| `schedules.json` | 302 schedules (5,549 departures) | Official timetable departure blocks |
| `aliases.json` | 2,924 aliases | Name resolution and normalization lookup |
| `geocoding_priority.json` | 1,430 stops | Network-value priority ranking for geocoding |
| `geocoding_cache.json` | 80+ queries | Persistent offline query cache |
| `coordinate_review_queue.json` | Review queue | Ambiguous candidates requiring manual survey |
| `network.json` | Full graph | Consolidated offline network package |
| `build_report.json` | Full audit report | Verification gates and build metrics |

### Research Files (Extraction inputs)

| File | Contents |
|---|---|
| `data/research/transit/extraction/routes_extracted.json` | 154 routes extracted from official PDFs |
| `data/research/transit/extraction/stops_extracted.json` | 1,430 stops extracted from official PDFs |
| `data/research/transit/extraction/route_stops_extracted.json` | 1,491 route-stop occurrences |
| `data/research/transit/extraction/schedules_extracted.json` | 302 schedule departure blocks |
| `data/research/transit/phase_6b/stop_alias_registry.json` | Phase 6B alias mappings |


---

## What Does NOT Exist

- **Live vehicle GPS telemetry**: No public CRUT real-time API exists.
- **Verified bus fares**: Per-stage fare orders are not available in any structured form; `amount_inr: null` in all records.
- **Road-snapped polyline geometry**: Routes are represented as stop-to-stop segments only.

### Prohibited language

| Never say | Say instead |
|---|---|
| "Live bus location" | "Next scheduled departure" |
| "Real-time tracking" | "Published timetable" |
| "Live arrival" | "Estimated arrival from timetable" |
| "GPS-tracked stop" | "Verified stop" |
| "₹15 fare" or any invented ₹ value | "Fare subject to current CRUT stage fare order" |

---

## Canonical Stop Model

Target file: `data/transport/canonical/stops.json`

Each entry must conform to this structure:

```json
{
  "stop_id": "crut_bbsr_master_canteen",
  "canonical_name": "Master Canteen Square",
  "aliases": [
    "Master Canteen",
    "Master Canteen Bus Stop",
    "Master Canteen Sq"
  ],
  "city": "Bhubaneswar",
  "district": "Khordha",
  "lat": 20.2961,
  "lon": 85.8245,
  "coordinate_source": "OSM_Nominatim",
  "coordinate_confidence": "VERIFIED_GEOSPATIAL",
  "served_routes": ["09", "10", "12", "20", "22A"],
  "is_terminal": false,
  "is_interchange": true,
  "verification_status": "VERIFIED_GEOSPATIAL",
  "source_url": "https://nominatim.openstreetmap.org/...",
  "verified_at": "2026-08-24",
  "notes": null
}
```

### Field Definitions

| Field | Type | Required | Notes |
|---|---|---|---|
| `stop_id` | string | Yes | Globally unique. Format: `{agency}_{city}_{slug}` |
| `canonical_name` | string | Yes | The one authoritative name for this stop |
| `aliases` | string[] | Yes | Known variants; used for name resolution and deduplication |
| `city` | string | Yes | City name (lowercase preferred for consistency) |
| `district` | string | Yes | Official Odisha district name |
| `lat` | float | Conditional | Required for production; null acceptable in staging |
| `lon` | float | Conditional | Required for production; null acceptable in staging |
| `coordinate_source` | string | Yes | Where coordinates came from (see below) |
| `coordinate_confidence` | string | Yes | Confidence tier (see below) |
| `served_routes` | string[] | Yes | Route numbers serving this stop |
| `is_terminal` | bool | Yes | True if this is a route terminus |
| `is_interchange` | bool | Yes | True if this is a transfer hub between routes |
| `verification_status` | string | Yes | Must match allowed values below |
| `source_url` | string | No | URL to geocoding or official source |
| `verified_at` | date string | Yes | ISO date of last verification |

---

## Verification Status Values

Only the first three statuses appear in the production stop registry:

| Status | Meaning | Eligible for production? |
|---|---|---|
| `VERIFIED_OFFICIAL` | Coordinates from an official government document | ✅ Yes |
| `VERIFIED_GEOSPATIAL` | Confirmed via OSM Nominatim with city bounding-box safety check | ✅ Yes |
| `RESOLVED_HIGH_CONFIDENCE` | Cross-referenced from a trusted canonical source (e.g., `places.json` canonical coordinates) | ✅ Yes |
| `REVIEW_REQUIRED` | Ambiguous — could match multiple physical locations | ❌ No |
| `UNRESOLVED` | No coordinates yet; name-only | ❌ No |

---

## Coordinate Resolution Tiers

### Tier 1 — Already Geocoded (use immediately)
17 stops have confirmed coordinates from Nominatim geocoding in `stop_geocoding_report.json`.
Examples: Bhubaneswar Rly Station, Master Canteen, BBI Airport, Baramunda ISBT, Puri Bus Stand.
Promote directly to canonical `stops.json` with `verification_status: "VERIFIED_GEOSPATIAL"`.

### Tier 2 — OSM Cross-Reference (safe with bounding-box check)
Major named landmarks unambiguous in OSM for Odisha:
AIIMS Bhubaneswar, KIMS Hospital, Raj Mahal Square, Kalinga Stadium, KIIT University, etc.
Use the existing Nominatim geocoding script with city bounding box.

### Tier 3 — Cross-Reference from Places Catalog (safe with manual check)
If a transit stop name **exactly matches** or is **contained within** a `places.json` canonical destination name:
- Use that place's verified coordinates.
- Set `coordinate_source: "cross_referenced_from_places_catalog"`.
- Set `coordinate_confidence: "RESOLVED_HIGH_CONFIDENCE"`.
- **Important**: a tourist landmark coordinate is not automatically identical to the physical bus-stop coordinate. Apply this only where the stop is clearly at or immediately adjacent to the landmark, not for stops that merely share a name prefix.

### Tier 4 — Manual Review Queue (do NOT add without human confirmation)
1,344 stops with ambiguous or generic names remain in `UNRESOLVED` status.
**Never fabricate coordinates for Tier 4 stops.**
They remain in the research queue, not the production registry.

---

## Canonical Route Model

Target file: `data/transport/canonical/routes.json`

```json
{
  "route_id": "rt_09",
  "route_number": "09",
  "route_name": "Bhubaneswar Railway Station – Patia (via Niladri Vihar)",
  "operator": "CRUT",
  "network_type": "AMA Bus",
  "origin": "Bhubaneswar Railway Station",
  "destination": "Patia",
  "via": "Niladri Vihar",
  "direction": "bidirectional",
  "service_area": "Capital Region",
  "verification_status": "VERIFIED_OFFICIAL",
  "source_document": "New-Schedule-CR-w.e.f-21.08.2026.pdf",
  "effective_date": "2026-08-21"
}
```

---

## Canonical Route-Stop Model

Target file: `data/transport/canonical/route_stops.json`

```json
{
  "route_id": "rt_09",
  "direction": "forward",
  "sequence_completeness": "partial_from_via",
  "stops": [
    { "sequence": 1, "stop_id": "crut_bbsr_bhubaneswar_rly_stn", "verification_status": "VERIFIED_GEOSPATIAL" },
    { "sequence": 2, "stop_id": "crut_bbsr_master_canteen", "verification_status": "VERIFIED_GEOSPATIAL" },
    { "sequence": null, "stop_id": "crut_bbsr_niladri_vihar", "verification_status": "REVIEW_REQUIRED" },
    { "sequence": null, "stop_id": "crut_bbsr_patia", "verification_status": "UNRESOLVED" }
  ]
}
```

`sequence_completeness` values:
- `"complete"` — full ordered stop sequence confirmed from official document
- `"partial_from_via"` — only terminus + via-point intermediate stops are known
- `"terminus_only"` — only origin and destination are known

---

## Schedule Semantics

Departure times are published official CRUT timetable values.

- **Never** describe them as "live arrival" or "real-time."
- **Always** label them as `"Scheduled"` in the UI.
- **Always** cite the source timetable and effective date.

Example UI label:
```
Next Route 09 departure: 18:35 IST
Source: Published CRUT timetable (effective 2026-08-21) · Scheduled
```

Departure computation logic in `frontend/src/data/transitTimetables.ts`:
- Compare current IST clock time against sorted departure list.
- Return the next departure at or after current time.
- If past last departure of the day, return first departure of next day.

---

## Alias Resolution

Multiple source texts may refer to the same physical stop using different names.
The canonical `aliases[]` field captures all known variants.
When ingesting new stop names from research data:
1. Normalize to uppercase, strip punctuation.
2. Check if canonical form matches any existing alias.
3. If match found: do NOT create a duplicate stop; add the new variant to the existing `aliases[]` list.
4. If no match: create a new staging entry for human review.

Examples already resolved:
- "MASTER CANTEEN" / "MASTER CANTEEN SQUARE" / "MASTER CANTEEN BUS STOP" → canonical: "Master Canteen Square"
- "BBSR RLY STATION" / "BHUBANESWAR RAILWAY STATION" → canonical: "Bhubaneswar Railway Station"

---

## Multimodal Planning Integration

The `TransitComparator` module (`backend/app/transport/comparator.py`) uses the canonical stop registry to:
1. Find the nearest verified boarding stop to the origin location.
2. Check if a verified route connects the boarding stop to a stop near the destination.
3. Find the next scheduled departure for that route.
4. Compute walking time to boarding stop (80 m/min standard).
5. Estimate total transit time (walk + bus segment).

If no verified route exists connecting origin to destination:
```json
{
  "public_option_available": false,
  "message": "No verified public-transit option is currently available for this leg."
}
```

**Do NOT fabricate a transit recommendation** because a bus stop happens to be near the origin or destination. The transit graph must actually support the connection.

---

## Files NOT to Use Directly in Production

| File | Why |
|---|---|
| `data/research/transit/extraction/routes_extracted.json` | Research quality; not production-canonical |
| `data/research/transit/extraction/stops_extracted.json` | Name-only; no coordinates |
| `data/research/transit/extraction/mo_bus_map_second_pass.json` | All stops `unresolved` |
| `data/research/transit/extraction/geocoding_review.json` | Review queue; not validated |

These are inputs to the canonical generation pipeline, not end products.
