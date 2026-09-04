# ADR-001: Maps, Geolocation, and Routing Provider Selection for O-TRAVELZ V4

* **Status**: Accepted
* **Date**: 2026-09-04
* **Decision Makers**: Algoryxz Core Architecture Team
* **Context**: Selection of native mobile and web mapping, routing, and geolocation infrastructure for O-TRAVELZ V4.

---

## 1. Context and Problem Statement

O-TRAVELZ requires high-performance, fluid map rendering, accurate spatial search, and reliable route guidance across Web, iOS, and Android. A key challenge is providing rich mapping and turn-by-turn guidance without:
1. Incurring uncontrolled cloud API costs from dynamic map loads, autocomplete sessions, or routing queries.
2. Violating third-party terms of service by caching external POI data (e.g. Google Places Terms Section 3.2.3).
3. Diluting O-TRAVELZ sovereign database of verified Odisha cultural landmarks, artisan clusters, and CRUT transit schedules.

---

## 2. Decision

The platform adopts a **Sovereign Hybrid Architecture**:

1. **Android Map Renderer**: **Google Maps SDK for Android** (`com.google.maps.android:maps-compose`).
   * *Rationale*: Provides unlimited free dynamic map loads on mobile native SDKs ($0.00 cost as of September 2026 audit), native Jetpack Compose integration, and hardware-accelerated rendering.
2. **iOS Map Renderer**: **Apple MapKit** (`SwiftUI.Map`).
   * *Rationale*: Zero financial cost, built directly into iOS 17+, Metal-accelerated, native Apple Human Interface Guidelines ergonomics, zero binary size overhead.
3. **Web Map Renderer**: **MapLibre GL JS**.
   * *Rationale*: Modern WebGL vector tile rendering, free open-source licensing (BSD-3-Clause), completely avoids Google Maps JavaScript API per-load fees. (Note: A vector tile provider will be selected and audited prior to web production launch).
4. **Turn-by-Turn Navigation**: **Google Maps Universal URLs** (`https://www.google.com/maps/dir/?api=1...`) with Apple Maps URL fallback on iOS.
   * *Rationale*: 100% free ($0 API cost), opens installed native navigation apps with live traffic and turn-by-turn voice guidance.
5. **Canonical Spatial & Search Truth**: **O-TRAVELZ PostgreSQL 16 + PostGIS 3.4**.
   * *Rationale*: All destination coordinates, artisan clusters, and CRUT transit routes originate from O-TRAVELZ canonical database. External providers are purely rendering and navigation utilities.
6. **Reverse Geocoding**: **O-TRAVELZ Coarse Grid Resolver** with cached OpenStreetMap Nominatim fallback (strictly restricted to coarse coordinates; never used for autocomplete).
7. **APIs Deferred / Rejected**:
   * *Google Places API*: Deferred to avoid high autocomplete session fees and TOS data caching prohibitions.
   * *Google Routes API*: Deferred in favor of in-app transit hops and zero-cost navigation URL handoffs.
   * *TravelTime API*: Deferred due to zero public transit GTFS coverage in Odisha.
   * *Geoapify*: Rejected as redundant with internal PostGIS.
   * *Overpass API*: Restricted strictly to offline data ingestion pipelines.

---

## 3. Consequences

### Positive
* Guaranteed $0.00 baseline mapping and navigation cost on mobile.
* Zero legal exposure to Google Places storage and caching restrictions.
* Preservation of 100% verified artisan and CRUT transit truth.
* Superior battery and frame-rate performance using platform-native map engines (MapKit on iOS, Google Maps SDK on Android).

### Negative / Trade-offs
* Requires maintaining platform-specific map wrapper composables/views (MapKit in SwiftUI, Google Maps in Compose, MapLibre on Web).
* Web client requires selecting and managing a vector tile source.
