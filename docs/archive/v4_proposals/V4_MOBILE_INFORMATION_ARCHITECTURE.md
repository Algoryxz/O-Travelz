# O-TRAVELZ V4 — Mobile Information Architecture & Ergonomics

> **Authoritative Specification for the Five-Tab Native Mobile Application**  
> Targets: **Android (Jetpack Compose)** & **iOS (SwiftUI)**  
> Document Version: `4.0.0` | Date: `2026-09-02`

---

## 1. Top-Level Five-Tab Shell Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        O-TRAVELZ MOBILE V4 SHELL                       │
├─────────────┬─────────────┬─────────────┬─────────────┬────────────────┤
│    HOME     │   EXPLORE   │    PLAN     │    TRIPS    │      YOU       │
│ Context &   │ Primary     │ Grounded    │ Offline &   │ Preferences,   │
│ Live Status │ Discovery   │ Multi-Day   │ Active Trip │ Privacy &      │
│ & Curated   │ & Map Modes │ Studio      │ Command     │ About Algoryxz │
└─────────────┴─────────────┴─────────────┴─────────────┴────────────────┘
```

---

## 2. Detailed Tab Specifications

### 2.1 Tab 1: HOME (Context-Driven Command Center)
The Home tab greets the traveler with real-time, location-aware intelligence:
* **Brand Header**: Official O-TRAVELZ crest logo, active location context badge (e.g. `Bhubaneswar (In-Memory GPS)` or `Bhubaneswar Master Canteen (Reference Datum)`).
* **Ambient Weather Card**: Live Open-Meteo temperature, condition, sunrise/sunset window, and outdoor exploration advisory. Labeled `LIVE · Open-Meteo` or `FALLBACK · Offline`.
* **Active Trip Widget**: If a trip is currently active, displays the next upcoming stop, planned departure time, and Mo Bus route connection.
* **Recommended Now**: Time-aware recommendations (e.g. Morning temple visit $\rightarrow$ Midday museum/handicrafts $\rightarrow$ Evening beach/lake sunset).
* **Nearby Highlights Carousel**: Dynamic straight-line proximity cards for nearby monuments, artisans, and dining.
* **Cultural Stories & Heritage Spotlights**: Curated cultural essays on Odishan architecture, festivals, and GI-tagged crafts.
* **Transport Advisories**: Official service alerts and disruptions (displayed only when real notices exist).

---

### 2.2 Tab 2: EXPLORE (Unified Spatial & Entity Discovery)
Explore is the comprehensive discovery engine for all 30 districts of Odisha:
* **Three View Modes**:
  1. **List Mode**: High-density 2-column grid or detailed 1-column list with sorting (Proximity, Rating, Name).
  2. **Map Mode**: Full-screen interactive basemap (MapLibre on Android, MapKit on iOS) with custom category pins and clustering.
  3. **Nearby Mode**: Pure proximity-ranked feed computed from active device coordinates.
* **Omni-Search Across 20+ Entity Types**:
  - *Destinations & Nature*: Sacred temples, heritage monuments, beaches, wildlife sanctuaries, waterfalls, forests.
  - *Culture & Living Heritage*: Craft villages, artisan workshops, weaving clusters, local weekly haats/markets, museums.
  - *Hospitality & Food*: Regional Odia cuisine restaurants, verified hotels, heritage stays.
  - *Transit & Mobility*: Airports (BBI, JRG), Railway Stations (BBS, PURI, CTC), Intercity Bus Terminals, Mo Bus stops.
  - *Civic Essentials*: 24x7 Hospitals, Police stations, Fuel stations, ATMs.
* **Filter Bottom Sheet**: Multi-select filter by District (all 30), Category, Verified Status, Transit Accessibility, and Price Tier.

---

### 2.3 Tab 3: PLAN (Grounded Constraint-Aware Itinerary Studio)
A deterministic planning engine that crafts realistic, actionable multi-day itineraries:
* **Planning Inputs**:
  - *Origin*: Airport, Railway Station, Hotel, or Current Location.
  - *Duration*: 1 to 5 Days (stepper).
  - *Travel Dates & Pace*: Relaxed, Balanced, Fast-Paced.
  - *Interests*: Temples, Heritage, Nature, Wildlife, Artisans/Handlooms, Food, Beaches.
  - *Transport Preference*: Public Transit Preferred (CRUT / Mo Bus), Private Cab / Auto, Mixed.
  - *Accessibility & Group*: Low-walking required, Avoid crowds, Family / Solo / Couples.
  - *Budget Level*: Budget, Moderate, Premium.
* **Grounded Plan Output**:
  - *Day Themes & Stop Sequences*: Logically ordered checkpoints minimizing travel backtracking.
  - *Meal Windows*: Dedicated slots for authentic breakfast, Odia lunch, and dinner near itinerary stops.
  - *Travel Legs & Transport Hops*: Explicit comparison of Private road duration vs Public transit (Mo Bus route number, boarding stop, exit stop, scheduled departure time in IST, first-mile walking distance).
  - *Operating Hours Check*: Verifies monuments are open during visited time slots.
  - *Explainable Rationale ("Why this recommendation?")*: Grounded deterministic reasons for each suggested stop.

---

### 2.4 Tab 4: TRIPS (Trip Lifecycle & Active Command Hub)
Organizes the traveler's itineraries across four lifecycle stages:
* **1. Drafts**: Unsaved generated itineraries and planning experiments.
* **2. Upcoming**: Confirmed future trips with scheduled calendar reminder triggers.
* **3. Active Trip Mode (Command Center)**:
  - Focused single-screen interface for the currently traveling user.
  - Step-by-step stop checklist with checkoff actions.
  - One-tap navigation to next stop.
  - Scheduled transit countdown for upcoming bus departure.
  - Offline access guaranteeing zero network reliance during travel.
* **4. Completed**: Past travel history, notes, and local photo memories.

---

### 2.5 Tab 5: YOU (Profile, Preferences & Identity)
User settings, privacy controls, and organizational identity:
* **Identity Status**: Guest Explorer Mode (Local RAM/Disk storage notice) or Authenticated Account.
* **Language Switcher**: Instant toggle between English (`EN`), Odia (`ଓଡ଼ିଆ`), and Hindi (`हिंदी`).
* **Saved Places & Bookmarks**: Grid of user-favorited destinations and artisan workshops.
* **Travel Preferences**: Default transport mode, diet preferences (Vegetarian), walking tolerance.
* **Privacy & Location Controls**: Explicit notice of in-memory location handling, option to wipe local cache and reset to Master Canteen datum.
* **Community Contributions**: Staged draft submissions, review status tracker.
* **About O-TRAVELZ**:
  - Version: `4.0.0 (V4 Multiplatform Build)`
  - Subtitle: *Odisha Travel Intelligence*
  - Attribution: **Built by Algoryxz**
  - Source Transparency: Canonical datasets, CRUT timetable version, Open-Meteo live integration.
