# O-TRAVELZ V4 — Product Requirements Document (PRD)

> **Authoritative Product Specification**  
> Product Name: **O-TRAVELZ**  
> Descriptor: **Odisha Travel Intelligence**  
> Credit: **Built by Algoryxz**  
> Positioning: **Odisha Travel Intelligence + Cultural Atlas**  
> Long-Term Differentiation: **Community-verified Odisha travel intelligence network**  
> Document Version: `4.0.0` | Last Updated: `2026-09-04`

---

## 1. Product Mission & Positioning

O-TRAVELZ is not a generic booking engine, an online travel agency (OTA), or a speculative AI chatbot wrapper. It is a **grounded travel intelligence system and digital cultural atlas** purpose-built for the state of Odisha, India.

The platform unites:
1. **Audited Cultural & Spatial Truth**: Authoritative destinations, temples, craft villages, sanctuaries, and living traditions across all 30 districts of Odisha.
2. **Deterministic Mobility Intelligence**: Real-world transit topology covering Capital Region Urban Transport (CRUT Mo Bus), Ama Bus, interstate bus terminals, rail interchanges, and first-mile pedestrian connections.
3. **Living Heritage & Artisan Provenance**: Verified craft clusters (e.g. Raghurajpur Pattachitra, Pipili Chandua, Cuttack Tarakasi filigree) with direct cultural context and workshop navigation.
4. **Transparent Data Provenance**: Explicit separation between verified facts, scheduled timetables, heuristic estimates, and live external observations.

---

## 2. Status Key for Architecture & Capabilities

Every section and feature in O-TRAVELZ documentation is strictly classified into one of three operational states:

* `[CURRENT]`: Implemented, tested, and actively functioning in the repository code and database.
* `[PLANNED]`: Approved architectural design scheduled for immediate implementation in the active rebuild wave.
* `[FUTURE / DEFERRED]`: Roadmapped capability requiring subsequent data verification, external APIs, or scaled field infrastructure.

---

## 3. Core Product Jobs (Prioritized over Feature Count)

O-TRAVELZ prioritizes solving concrete traveler problems with verifiable truth over accumulating speculative features.

| Priority | Core Product Job | User Question Addressed | System Solution | Capability State |
|---|---|---|---|---|
| **Job 1** | **Discover places** | *"What exists in Odisha beyond standard tourist brochures?"* | Curated catalog of 204 verified places spanning heritage, craft, nature, coastal, and culinary destinations. | `[CURRENT]` |
| **Job 2** | **Understand why they matter** | *"Why should I visit this specific temple, village, or lake?"* | Grounded cultural essays, architectural notes, and artisan histories without AI hallucinations. | `[CURRENT]` |
| **Job 3** | **Understand where they are** | *"Where is this located spatially and what region does it belong to?"* | Verified WGS84 coordinates projected onto native vector maps with regional boundaries. | `[CURRENT]` |
| **Job 4** | **Reach them realistically** | *"How do I actually get from my stay to this site without getting stranded?"* | Multimodal itinerary solver combining walking legs, public transit hops, and highway corridors. | `[CURRENT]` |
| **Job 5** | **Plan Odisha trips** | *"Can I build a realistic 1 to 5 day itinerary that respects opening hours?"* | Constraint-aware deterministic planner matching time budgets, meal windows, and route sequences. | `[CURRENT]` |
| **Job 6** | **Navigate transport honestly** | *"When does the bus actually depart and where is the stop?"* | Official CRUT timetable departures with verified stop coordinates and honest schedule labels. | `[CURRENT]` |
| **Job 7** | **Discover artisans & living culture** | *"Where can I meet authentic Pattachitra painters or Dhokra metal casters?"* | Dedicated artisan cluster profiles detailing master crafts, workshop localities, and etiquette. | `[PLANNED]` |
| **Job 8** | **Find nearby practical services** | *"Where is the nearest 24/7 hospital, ATM, fuel pump, or police station?"* | Audited civic amenities mapped to destinations via precomputed proximity relationships. | `[CURRENT]` |
| **Job 9** | **Understand weather constraints** | *"Will extreme heat, coastal humidity, or monsoon rain disrupt this plan?"* | Live weather, heat indices, precipitation probability, and sunset times via Open-Meteo. | `[CURRENT]` |
| **Job 10** | **Save trips offline** | *"Can I view my planned route and destination facts without cellular data?"* | Local client persistence (SwiftData on iOS, Room on Android, LocalStorage on Web). | `[PLANNED]` |
| **Job 11** | **Contribute verified local knowledge** | *"Can local guides and cultural experts submit corrections and discoveries?"* | Moderated community submission pipeline with photo evidence verification gates. | `[FUTURE / DEFERRED]` |

---

## 4. Primary User Journeys by Platform

### 4.1 Website Journey `[PLANNED]`
$$\text{Explore Odisha (Atlas / Grid)} \longrightarrow \text{Inspect Place Detail} \longrightarrow \text{Inspect Interactive Map} \longrightarrow \text{Plan Constraint Itinerary} \longrightarrow \text{Review Transport Context}$$

1. **Explore / Atlas**: Spatial and thematic discovery across 30 districts, filtering by category (Monument, Nature, Artisan, Beach, Food).
2. **Place Detail**: In-depth editorial card with verified photography, cultural rationale, visit duration, opening hours, and nearby amenities.
3. **Interactive Map**: MapLibre GL JS vector canvas rendering verified point features and route polylines.
4. **Plan Itinerary**: User selects starting hub, trip duration (1–5 days), and interests; engine returns geographically sequenced daily stops.
5. **Transport Context**: Step-by-step transit options showing scheduled Mo Bus routes or driving distances.

### 4.2 iOS Native Journey `[PLANNED]`
$$\text{Explore Feed} \longrightarrow \text{Place Detail} \longrightarrow \text{Apple MapKit View} \longrightarrow \text{Navigation Handoff} \longrightarrow \text{Save to Trip}$$

1. **Explore**: Smooth native SwiftUI scroll feed with high-density cards and proximity indicators.
2. **Place Detail**: Native sheet displaying cultural significance, live Open-Meteo weather, and first-mile walking badge.
3. **MapKit**: Native Apple vector map with custom temple/craft annotations and hardware-accelerated gestures.
4. **Navigation Handoff**: One-tap trigger opening Google Maps or Apple Maps with pre-filled destination coordinates.
5. **Save**: Stored offline using SwiftData for airplane-mode access during travel.

### 4.3 Android Native Journey `[PLANNED]`
$$\text{Explore Feed} \longrightarrow \text{Place Detail} \longrightarrow \text{Google Maps SDK View} \longrightarrow \text{Navigation Handoff} \longrightarrow \text{Save to Trip}$$

* **Native Ergonomics**: Android adapts the shared product journeys using Material 3 and Jetpack Compose idioms. It is **never** a literal port of iOS UI components.
* Uses `com.google.maps.android:maps-compose` for vector mapping and Room for local offline caching.

---

## 5. Multidimensional Truth & Provenance Model

To prevent deception and eliminate ambiguous claims, O-TRAVELZ evaluates all geospatial, temporal, and entity data through a strict **three-dimensional truth model**.

```
                           ┌────────────────────────────┐
                           │    VERIFICATION STATUS     │
                           │ Official • Audited • Staged│
                           └─────────────┬──────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
  ┌────────────────────────────┐                  ┌────────────────────────────┐
  │      FRESHNESS STATUS      │                  │    AVAILABILITY STATUS     │
  │Live • Scheduled • Curated  │                  │ Available • Fallback • N/A │
  └────────────────────────────┘                  └────────────────────────────┘
```

### 5.1 Dimension 1: VerificationStatus
* `OFFICIAL`: Sourced directly from government gazettes, CRUT publications, or certified tourism departments.
* `AUDITED`: Manually validated by the Algoryxz team through field audits, primary photo evidence, and cross-referenced satellite imagery.
* `STAGED`: Researched candidate awaiting secondary audit or image acquisition; strictly excluded from public production catalogs.

### 5.2 Dimension 2: FreshnessStatus
* `LIVE_OBSERVATION`: Real-time telemetry fetched within the last 60 minutes (applicable **exclusively** to Open-Meteo weather and environmental conditions).
* `SCHEDULED_TIMETABLE`: Fixed public timetable blocks published by transit agencies (e.g. CRUT Mo Bus time blocks).
* `STATIC_CURATED`: Verified static record (coordinates, ticket prices, historical descriptions).
* `HEURISTIC_ESTIMATE`: Algorithmic approximation (e.g. Haversine distance, average walking speed calculation).

### 5.3 Dimension 3: AvailabilityStatus
* `AVAILABLE`: Full data record and verified geometry present and rendered.
* `FALLBACK_BUNDLE`: Served from bundled offline assets due to network disconnection.
* `UNAVAILABLE`: Explicitly recorded missing data (e.g. stop coordinate unverified, opening hours unknown).

### 5.4 CRITICAL INVARIANT: Transit vs Weather Truth
> **Live weather observations must NEVER be equated with or conflated with real-time transit telemetry.**
>
> * Open-Meteo weather is labeled **`Live`** or **`Forecast`**.
> * Mo Bus and Ama Bus schedules are labeled **`Scheduled`** with exact departure time blocks in IST (UTC+05:30).
> * The terms *"live bus tracking"*, *"real-time arrival"*, or *"current GPS position"* are **strictly banned** until genuine transit telemetry feeds are integrated and verified.

---

## 6. Anti-Vibe-Code Product Constraints (Permanent Rules)

These rules are permanent design and copy constraints across all platforms:

### 6.1 Visual & Layout Bans
* **NEVER USE** purple gradients, neon gradients, or generic "AI SaaS" dark gradients.
* **NEVER USE** gratuitous glassmorphism, floating cards with massive diffuse shadows, or random organic blobs.
* **NEVER USE** cursor-following particles, cursor trailing effects, or animated canvas backdrops.
* **NEVER USE** scroll-jacking, horizontal wheel hijacking, or overbuilt multi-plane parallax.
* **NEVER USE** emoji characters as UI icons; use official SF Symbols (iOS), Material Symbols (Android), or Lucide icons (Web).

### 6.2 Data & Metric Bans
* **NEVER DISPLAY** fake user counters, fake traveler numbers, or fake booking counters (e.g. *"1,420 travelers planning now"*).
* **NEVER DISPLAY** fake reviews, fake user testimonials, or fabricated star ratings.
* **NEVER DISPLAY** fake urgency banners (e.g. *"Only 2 slots left today!"*).
* **NEVER DISPLAY** fake bus positions or simulated moving vehicle markers on any map.
* **NEVER DISPLAY** AI-generated tourist photography, synthetic temple images, or stock photos from other states/countries.

### 6.3 Copywriting & Marketing Bans
* **NEVER USE** generic travel cliché copy:
  * *Banned:* "Unlock unforgettable journeys"
  * *Banned:* "Experience travel like never before"
  * *Banned:* "Discover the magic of Odisha"
  * *Banned:* "Your AI-powered travel companion"
* **ALWAYS USE** concrete, informative, culturally grounded copy:
  * *Required:* "Explore heritage near Bhubaneswar"
  * *Required:* "Scheduled CRUT departures from Master Canteen"
  * *Required:* "Craft villages around Raghurajpur"
  * *Required:* "Rain likely after 4:00 PM IST"
  * *Required:* "Plan Bhubaneswar to Puri corridor"
* **BANNED TERMS**: "Made with AI", "AI powered", "Smart AI magic", "Zero hallucination guarantee".
* **PUNCTUATION RULE**: Zero em dash characters in customer-facing UI copy. Use colons, periods, or standard bullet formatting.

### 6.4 Expressive Editorial Integrity
Anti-vibe-coded does **not** mean sterile, generic, or visually impoverished. O-TRAVELZ embraces high visual intentionality: rich editorial layouts, commanding typography, authentic high-resolution photography, and cultural resonance inspired by Odisha stone carvings, Pattachitra scrolls, and coastal landscapes.

---

## 7. Legal, Trust & Attribution Specifications

1. **Credit**: The application and all official documentation must display: **Built by Algoryxz**.
2. **Privacy Policy**: Explicit, accessible document detailing local device storage, zero third-party tracking, and privacy-safe GPS usage (location permissions used solely for client-side proximity).
3. **Terms & Conditions**: Clear terms defining the educational, cultural, and informational nature of transit timetables and travel guidance.
4. **Data Attribution**:
   * *Transit*: Capital Region Urban Transport (CRUT) and Odisha State Road Transport Corporation (OSRTC).
   * *Weather*: Open-Meteo.com under CC BY 4.0.
   * *Map Data*: OpenStreetMap contributors (via MapLibre vector basemap) and Apple MapKit / Google Maps.
