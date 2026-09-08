# O-TRAVELZ Mobile V4 — Wave M12 Transit Directory & Timetable Baseline

> **Authoritative Statewide Transit Directory Specification**  
> Status: ACCEPTED_PRODUCTION_BASELINE | Wave: M12 | Date: 2026-09-08  
> Git Commit Reference: Wave M12 Completion

---

## 1. Executive Summary

Wave M12 establishes the native statewide transit directory for Odisha across Android and iOS. Enforcing strict transit truth boundaries, the product catalogs all 154 public bus routes operated under CRUT (Capital Region Urban Transport), encompassing AMA BUS (153 routes) and Mo Bus (Route 100 Express), 302 directional schedules, 5,549 daily scheduled departures in Indian Standard Time (IST, UTC+05:30), and multi-tiered stop confidence across 1,430 stops.

---

## 2. Statewide Provider & Regional Distribution Matrix

All 154 routes map deterministically into 5 operational transit regions without gaps:

| Region | Route Range | Provider | Route Count | Scheduled Departures | Primary Hubs |
|---|---|---|---|---|---|
| **Capital Region** | 10–99, 100 | CRUT AMA BUS / Mo Bus | 96 | 4,120+ | Bhubaneswar (Master Canteen, Baramunda), Cuttack (Badambadi), Puri, Khordha |
| **Rourkela** | 101–125 | CRUT AMA BUS | 25 | 600+ | Rourkela Railway Station, Panposh, Bisra, Birmitrapur |
| **Sambalpur** | 201–217 | CRUT AMA BUS | 17 | 400+ | Sambalpur Ainthapali, Burla, Hirakud |
| **Berhampur** | 301–310 | CRUT AMA BUS | 10 | 250+ | Berhampur New Bus Stand, Gopalpur, Chhatrapur |
| **Keonjhar** | 401–406 | CRUT AMA BUS | 6 | 150+ | Keonjhar Bus Stand, Ghatgaon, Anandapur |
| **Total Statewide** | **All 154 Routes** | **CRUT** | **154** | **5,549** | **Odisha Statewide Network** |

---

## 3. Stop Confidence Truth & Gating Model

Stops are strictly partitioned into two operational tiers:

`
                          ┌───────────────────────────┐
                          │   1,430 Unique Stops      │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
  ┌─────────────────────────────┐               ┌─────────────────────────────┐
  │   VERIFIED PHYSICAL POLE    │               │      LOCALITY ONLY          │
  │         (173 Stops)         │               │       (1,257 Stops)         │
  ├─────────────────────────────┤               ├─────────────────────────────┤
  │ • Real GPS coordinates      │               │ • Coordinates strictly NULL │
  │ • Solid map pin renderable  │               │ • Map pin SUPPRESSED        │
  │ • External nav ENABLED      │               │ • External nav PROHIBITED   │
  │ • First-mile walk ENABLED   │               │ • First-mile SUPPRESSED     │
  │ • Verified physical flag    │               │ • Locality disclosure tag   │
  └─────────────────────────────┘               └─────────────────────────────┘
`

1. **Verified Physical Poles (173 stops)**:
   - Possess surveyed, ground-truthed GPS coordinates in Odisha.
   - Eligible for map marker rendering, external directions handoff (geo:0,0?q=lat,lon(name) or Apple Maps URL), and first-mile walking distance calculations.
2. **Locality-Only Stops (1,257 stops)**:
   - Coordinates are strictly 
ull.
   - Centroid approximation and coordinate hallucination are strictly prohibited.
   - Pins are suppressed on maps; external navigation triggers are disabled; explicit traveler disclosure ("Approximate locality; board at prominent village/town intersection") is rendered.

---

## 4. Timetable Truth & IST Evaluation

1. **IST Timezone Contract**:
   - All 5,549 scheduled departures are evaluated strictly in Indian Standard Time (Asia/Kolkata, UTC+05:30).
   - The timetable engine evaluates 
extDeparture(afterISTMinutes) deterministically from local device clock converted to IST minutes from midnight.
2. **Timetable Coverage**:
   - 145 routes have complete directional schedules (UP and DOWN).
   - 9 routes have no published timetable (SCHEDULE_PENDING badge displayed).
3. **Anti-Fake-Telemetry Rules**:
   - No animated bus icons.
   - No simulated GPS movement.
   - No "Arriving in 3m" countdowns.
   - Departures are explicitly titled "Scheduled Departure" (ଅନୁସୂଚିତ ପ୍ରସ୍ଥାନ).

---

## 5. First-Mile Walking Distance Contract

For verified stops, traveler distance from hardware GPS is classified into 4 standardized bands:

| Band | Threshold | Label | Guidance |
|---|---|---|---|
| EASY_WALK | < 400 m | Short walk | Under 5 minutes on foot |
| MODERATE_WALK | 400 m – 800 m | Moderate walk | 5–10 minutes on foot |
| EXTENDED_WALK | 800 m – 1,500 m | Extended walk | 10–20 minutes on foot |
| NOT_RECOMMENDED | > 1,500 m | Long distance | Transit or auto-rickshaw recommended to stop |

For locality-only stops, first-mile walking guidance evaluates strictly to 
ull.

---

## 6. Fare Truth Model

- **Status**: 100% of routes evaluate fare to 
ull (areText = null).
- **Rule**: Estimating or inventing bus fares is strictly forbidden. Fares remain marked as "Fares available at boarding" until official CRUT fare stage matrices are ingested.

---

## 7. Deterministic 6-Tier Search Ranking

The transit search engine evaluates queries against routes using a zero-dependency deterministic ranking:

1. **Tier 1**: Exact Route Number match (e.g. query "10" matches Route 10 exactly).
2. **Tier 2**: Route Number prefix match (e.g. query "10" matches Route 101, 102).
3. **Tier 3**: Route Number contains substring.
4. **Tier 4**: Origin or Destination prefix match (English or Odia).
5. **Tier 5**: Origin or Destination substring match.
6. **Tier 6**: Intermediate Stop name match.

---

## 8. Cross-Platform Parity Contract

| Platform | Architectural Pattern | Fixture Source | Test Suite |
|---|---|---|---|
| **Android** | Kotlin / Jetpack Compose / MVI ViewModel | ssets/transit/ | TransitProductModelTest.kt (8 tests) |
| **iOS** | Swift 6 / SwiftUI / @MainActor ViewModel | OTravelz/Resources/Transit/ | TransitDomainTests.swift (7 tests) |
