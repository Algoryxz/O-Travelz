# O-TRAVELZ V4 — Mapping, Geospatial & Transit Architecture

> **Authoritative Geospatial & Mobility Specification**  
> Map Renderers: **Web: MapLibre GL JS | iOS: Apple MapKit | Android: Google Maps SDK**  
> Canonical Spatial Truth: **O-TRAVELZ PostgreSQL 16 + PostGIS 3.4**  
> Navigation Strategy: **Zero-Cost External Native Navigation Handoff (Google Maps URLs)**  
> Pricing Verification Date: **September 2026 (Vendor pricing is subject to change; not permanent architecture)**  
> Document Version: `4.0.0` | Last Updated: `2026-09-04`

---

## 1. Multiplatform Mapping Stack

Mapping across O-TRAVELZ is architected for maximum native rendering performance, zero licensing lock-in, and guaranteed cost control:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          O-TRAVELZ CANONICAL GEO TRUTH                           │
│     Aiven PostgreSQL 16 + PostGIS 3.4 • 204 Places • 1,430 Transit Stops        │
│          Deterministic GeoJSON Projection: POST /api/map/projection              │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
    ┌────────────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐
    │  Web: MapLibre GL JS   │ │ iOS: Apple MapKit│ │ Android: Google Maps SDK │
    │  Vector Tiles (WebGL)  │ │ Native SwiftUI   │ │ Jetpack Compose ($0loads)│
    │  Audit pending for tile│ │ Metal-accelerated│ │ Hardware-accelerated GPU │
    └────────────────────────┘ └──────────────────┘ └──────────────────────────┘
```

### 1.1 Web Map: MapLibre GL JS `[PLANNED]`
* **Technology**: MapLibre GL JS (open-source fork of Mapbox GL JS).
* **Role**: Full-screen interactive cultural atlas canvas, spatial category filtering, region boundary framing.
* **Vector Tile Provider Status**:
  > **AUDIT PENDING**: A vector tile provider for MapLibre GL JS must be formally selected and audited prior to production rollout. Candidate options under review:
  > 1. *OpenFreeMap* (Zero-cost, community-hosted vector tiles).
  > 2. *Protomaps PMTiles* (Self-hosted single-file archive on Cloudflare R2 / S3).
  > 3. *Stadia Maps / MapTiler* (Commercial freemium vector tile hosting).
  > 4. *CARTO Dark Matter Vector* (Clean cartographic aesthetic matching dark atlas).

### 1.2 iOS Map: Apple MapKit (`SwiftUI.Map`) `[PLANNED]`
* **Technology**: First-party `MapKit` framework available in iOS 17+.
* **Cost**: **$0.00 / Free** (Included with standard Apple Developer program).
* **Capabilities**: Hardware-accelerated Metal vector rendering, fluid gesture handling, custom SwiftUI annotation views with zero binary bloat.

### 1.3 Android Map: Google Maps SDK for Android `[PLANNED]`
* **Technology**: `com.google.maps.android:maps-compose:4.4.1` + Google Play Services Maps.
* **Cost**: **$0.00 / Free** (Google Maps Platform provides **unlimited free dynamic map loads** on native mobile SDKs for Android and iOS).
* **Capabilities**: Native Compose lifecycle integration, hardware GPU rendering, smooth marker clustering via Google Maps Compose Utils.

---

## 2. Navigation & Routing: Zero-Cost Handoff Strategy

To avoid expensive runtime routing APIs while giving travelers the best possible turn-by-turn guidance:

1. **In-App Journey Feasibility**:
   * O-TRAVELZ evaluates multimodal transit hops internally via `TransitEngine` and `FirstMileEngine` (walking legs, bus connections, interchange hubs).
2. **Turn-by-Turn GPS Navigation Handoff**:
   * When a traveler taps **"Navigate"** or **"Get Directions"**, O-TRAVELZ launches the native navigation app already installed on their device using **Google Maps Universal URLs**:
     ```
     https://www.google.com/maps/dir/?api=1&destination=20.2961,85.8245&travelmode=driving
     ```
   * **Advantages**:
     * **100% Free** ($0.00 API cost; zero API key required).
     * Delivers real-time Indian traffic conditions, road closures, and live GPS voice guidance.
     * On iOS, supports clean handoff to Apple Maps (`maps://?daddr=lat,lon`) or Google Maps based on user preference.

---

## 3. Transit Source of Truth: CRUT Mo Bus & Ama Bus

### 3.1 Network Inventory `[CURRENT]`
* **Routes**: 154 active routes covering the Capital Region (Bhubaneswar, Cuttack, Puri, Khurda) and regional corridors (Rourkela, Berhampur, Sambalpur).
* **Stops**: 1,430 stops (41 geocoded with high-confidence WGS84 coordinates; 1,389 tracked as legitimate unresolved stops awaiting field GPS audit).
* **Departures**: 302 schedule trip groups and 5,553 individual scheduled departure times.

### 3.2 Scheduled Truth Boundary (Zero Fake GPS)
* Departures are calculated deterministically against official schedule tables using Indian Standard Time (IST / UTC+05:30).
* Output format: `Scheduled · 08:30 IST (Route 10)`.
* Fares are recorded as `null` until an official audited fare matrix is ingested (zero invented ₹ values).
* Real-time vehicle tracking will be introduced **only** when an authenticated, reliable GTFS-Realtime or CRUT API integration is established.

---

## 4. First-Mile Pedestrian Logic (`mobile/shared/FirstMileEngine.kt`)

First-mile accessibility is evaluated deterministically in Kotlin Multiplatform:

```
                          Distance to Nearest Transit Stop (d)
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
            d <= 800m               800m < d <= 1500m          d > 1500m
        [WALK_REASONABLE]          [WALK_OR_SHORT_AUTO]   [AUTO_OR_CAB_RECOMMENDED]
```

### Critical Gating Rule
* Personalized first-mile recommendations are evaluated **strictly when `LocationState.isLiveDeviceLocation` is true**.
* When GPS is denied, timed out, or in Reference Datum mode (Master Canteen), the engine returns `null` to prevent misleading walking instructions against a fallback coordinate.

---

## 5. Vendor API Pricing Reference (Audited September 2026)

> **Architectural Reminder**: Vendor pricing tables are market conditions as of **September 2026** and must not be treated as immutable architectural constants.

| Provider & API SKU | Market Pricing (Verified Sep 2026) | Free Tier Allowance | O-TRAVELZ Architectural Decision |
|---|---|---|---|
| **Google Maps SDK (Android/iOS)** | **$0.00 / Free** (Unlimited loads) | Unlimited native loads | **ADOPT** for native Android map canvas. |
| **Apple MapKit (iOS Native)** | **$0.00 / Free** (Unlimited) | Unlimited | **ADOPT** for native iOS map canvas. |
| **Google Maps URLs (Deep Link)** | **$0.00 / Free** (Zero API calls) | Unlimited | **ADOPT** for turn-by-turn navigation handoff. |
| **Open-Meteo Weather API** | **$0.00 / Free** (Keyless) | 10,000 calls/day | **ADOPT** via backend caching layer. |
| **Google Maps JS API (Web)** | $7.00 per 1,000 loads | 28,500 loads/mo ($200 credit) | **AVOID** on Web; use MapLibre GL JS instead. |
| **Google Places Autocomplete** | $17.00 per 1,000 sessions | ~11,700 sessions/mo ($200 credit) | **DEFERRED**; O-TRAVELZ PostGIS search leads. |
| **Google Routes API (Advanced)** | $10.00 per 1,000 requests | 20,000 requests/mo ($200 credit) | **DEFERRED**; use zero-cost navigation URLs. |
| **TravelTime API** | Commercial plans from $150+/mo | Limited trial only | **DEFERRED**; zero CRUT transit data in Odisha. |
| **Geoapify** | Freemium | 3,000 credits/day | **REJECTED**; redundant with internal PostGIS. |
| **OSM Nominatim** | $0.00 (ODbL Policy) | Max 1 req/sec; heavy cache req | **RESTRICT** to low-volume reverse geocoding. |
| **OSM Overpass** | $0.00 | Public server throttles | **RESTRICT** to offline ETL ingestion only. |
