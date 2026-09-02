# O-TRAVELZ V4 — Hierarchical Transport Architecture & Multimodal Mobility

> **Authoritative Specification for the Multimodal Intercity, Rail, Aviation & Transit Subsystems**  
> Document Version: `4.0.0` | Date: `2026-09-02`

---

## 1. The Multimodal Transport Hierarchy

Travelers visiting Odisha do not navigate single isolated modes. They transition through a multi-tier transport hierarchy:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TIER 1: LONG-HAUL ARRIVAL                       │
│           Commercial Aviation                Intercity Indian Railways │
│        (Bhubaneswar BBI, Jharsuguda JRG)     (BBS, KUR, CTC, PURI, SBP)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      TIER 2: REGIONAL & INTERCITY                      │
│            OSRTC Long-Distance Express Buses / Intercity Rail          │
│       (Baramunda ISBT, Netaji Bus Terminal CTC, Badambadi, Puri ISBT)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       TIER 3: URBAN PUBLIC TRANSIT                     │
│                  Capital Region Urban Transport (CRUT)                 │
│         154 Mo Bus / Ama Bus Routes & 1,430 Canonical Stops            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     TIER 4: FIRST-MILE & PEDESTRIAN                    │
│   • ≤ 800m: Walking corridor                                           │
│   • 800m – 1500m: Walk or Short Auto connection                        │
│   • > 1500m: Auto-rickshaw / Taxi connection                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      FINAL DESTINATION / SACRED SITE                   │
│         (Konark, Lingaraj, Raghurajpur, Similipal, Chilika)            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tier 1: Commercial Aviation (Airports & Flights)

### 2.1 Supported Commercial Airports
1. **Biju Patnaik International Airport (BBI / VEBS)** — Bhubaneswar
   - Coordinates: $20.2444^\circ\text{N}, 85.8178^\circ\text{E}$
   - Terminals: Terminal 1 (Domestic), Terminal 2 (International)
   - Transit Connectivity: Connected directly via Mo Bus Route 10 (Airport $\leftrightarrow$ Nandankanan via Master Canteen) and Route 12.
2. **Veer Surendra Sai Airport (JRG / VEJH)** — Jharsuguda
   - Coordinates: $21.9144^\circ\text{N}, 84.0506^\circ\text{E}$
   - Primary gateway for Western Odisha (Sambalpur, Hirakud, Deogarh).
3. **Regional Airstrips (Defensible Static Reference Only)**:
   - Rourkela (RRK), Jeypore (PYB), Rangeilunda (Ganjam), Utkela (Kalahandi). Marked with clear operational status badges.

### 2.2 Flight Data Boundaries & Truthfulness
* **Static Route Availability**: Defensible database of active commercial routes (e.g. Delhi $\leftrightarrow$ BBI, Mumbai $\leftrightarrow$ BBI, Bangalore $\leftrightarrow$ BBI, Kolkata $\leftrightarrow$ BBI, Hyderabad $\leftrightarrow$ BBI).
* **Scheduled Timetables**: Standard airline schedule frequencies (Daily, 3x/week).
* **Live Flight Status**: **ISOLATED BEHIND PROVIDER ADAPTER**. Live status is disabled unless an authenticated, permitted aviation API (e.g. FlightRadar24 / FlightStats) is integrated. Zero synthetic flight radar tracks.

---

## 3. Tier 1 & 2: Indian Railways (Intercity Rail Corridor)

### 3.1 Key Odisha Tourist Rail Hubs
| Station Code | Station Name | Major Lines / Division | Coordinates | Tourist Gateway Scope |
|---|---|---|---|---|
| **BBS** | Bhubaneswar Railway Station | East Coast Railway (ECoR) | $20.2667^\circ\text{N}, 85.8436^\circ\text{E}$ | State Capital, Temples, Dhauli |
| **KUR** | Khurda Road Junction | East Coast Railway (ECoR) | $20.1833^\circ\text{N}, 85.7333^\circ\text{E}$ | Main Line / Puri Branch Junction |
| **PURI** | Puri Terminus | East Coast Railway (ECoR) | $19.8135^\circ\text{N}, 85.8315^\circ\text{E}$ | Jagannath Temple, Puri Beach, Konark |
| **CTC** | Cuttack Junction | East Coast Railway (ECoR) | $20.4630^\circ\text{N}, 85.8940^\circ\text{E}$ | Millennium City, Silver Filigree, Barabati |
| **SBP / SBPY** | Sambalpur / Sambalpur City | East Coast Railway (ECoR) | $21.4680^\circ\text{N}, 83.9820^\circ\text{E}$ | Western Odisha, Sambalpuri Weaving, Hirakud |
| **BAM** | Brahmapur | East Coast Railway (ECoR) | $19.3140^\circ\text{N}, 84.7940^\circ\text{E}$ | Southern Odisha, Gopalpur, Tampara Lake |
| **BLS** | Balasore | South Eastern Railway (SER) | $21.4930^\circ\text{N}, 86.9320^\circ\text{E}$ | Northern Odisha, Chandipur Beach, Similipal |

### 3.2 Rail Data Models & Separation of Concerns
* **`RailwayStation`**: Station code, name, division, geo-coordinates, number of platforms, interchange facilities.
* **`TrainService`**: Train number, name (e.g. *Vande Bharat Express*, *Puri Duronto*, *Purushottam Express*), origin, destination, days of operation.
* **`RailConnection`**: Connects stations with distance in km, scheduled travel time, and intermediate major stops.
* **Status Separation**:
  - `SCHEDULED`: Published timetable data.
  - `LIVE RUNNING STATUS`: Displayed **only** when authenticated NTES / IRCTC API integration is active; otherwise explicitly hidden.

---

## 4. Tier 2: Intercity Bus Network (ISBT & OSRTC)

### 4.1 Major Intercity Terminals
1. **Babasaheb Bhimrao Ambedkar Bus Terminal (Baramunda ISBT, BBS)**
   - Premier central bus terminal connecting all 30 districts of Odisha and interstate routes (West Bengal, Andhra Pradesh, Jharkhand, Chhattisgarh).
2. **Netaji Subhash Chandra Bose Intercity Bus Terminal (CNBT, Cuttack)**
   - Modern intercity terminal serving Northern and Coastal Odisha routes.
3. **Puri Central Bus Stand (Talabania & Malatipatpur)**
   - Terminal for intercity tourist buses connecting Bhubaneswar, Konark, and southern districts.

---

## 5. Tier 3: Urban Public Transit (CRUT / Mo Bus)

* **Coverage**: 154 official CRUT routes across Bhubaneswar, Cuttack, Puri, and Khordha.
* **Stop Registry**: 1,430 logical canonical stops; 83 coordinate-verified routable stops.
* **Schedules**: 302 official schedule records with 5,549 validated departure times in `data/transport/canonical/schedules.json`.
* **Zero Faux Telemetry**: Governed strictly by the three-mode truth rule (Mode 1 Live, Mode 2 Scheduled, Mode 3 Estimated Progress).

---

## 6. Tier 4: First-Mile / Last-Mile Engine

The `FirstMileEngine` bridges public transport exit hubs to final destination coordinates:

```kotlin
object FirstMileEngine {
    const val THRESHOLD_WALK_METERS = 800.0
    const val THRESHOLD_AUTO_METERS = 1500.0

    fun evaluate(distanceMeters: Double, isRealGps: Boolean): FirstMileGuidance? {
        if (!isRealGps) return null // Enforce zero fake advice against fallback datums
        
        return when {
            distanceMeters <= THRESHOLD_WALK_METERS -> FirstMileGuidance(
                mode = FirstMileMode.WALK,
                label = "Walking proximity (≤ 800m straight-line)",
                icon = "figure.walk"
            )
            distanceMeters <= THRESHOLD_AUTO_METERS -> FirstMileGuidance(
                mode = FirstMileMode.WALK_OR_SHORT_AUTO,
                label = "Walk or Short Auto proximity (800m–1.5km)",
                icon = "car.fill"
            )
            else -> FirstMileGuidance(
                mode = FirstMileMode.AUTO_OR_CAB,
                label = "Auto / Cab proximity (> 1.5km)",
                icon = "car.side.fill"
            )
        }
    }
}
```

---

## 7. Multimodal Route Planning Algorithm

The V4 planner determines travel hops by evaluating the multimodal graph:

1. **Origin Identification**: Classifies origin as Airport, Railway Station, City Transit Stop, or Device GPS.
2. **Long-Haul Corridor Resolution**: If origin and destination are in different regions (e.g. Bhubaneswar to Sambalpur), evaluates Intercity Rail (Train) vs Long-Distance Bus (OSRTC).
3. **Local Transit Matching**: For intracity or adjacent-city legs (e.g. Master Canteen to Nandankanan, or BBS to Cuttack), searches canonical CRUT route sequences connecting origin and destination stops.
4. **First-Mile Evaluation**: Computes straight-line distance from nearest transit stop to destination gate.
5. **Truthful Output Generation**: Emits an `ItineraryPlan` with explicit `TransportHop` records, each labeled with its exact `DataTier` (`SCHEDULED` vs `ESTIMATED`).
