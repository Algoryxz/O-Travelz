# O-TRAVELZ Mobile V4 — Information Architecture & Structural Product Anatomy

> **Authoritative Product Anatomy Specification**  
> Scope: **Structural Hierarchy, Top-Level Navigation, and Functional Domain Mapping**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Top-Level Navigation Model: 5-Tab Root with Hybrid Map

O-TRAVELZ Mobile V4 adopts a **5-Tab Primary Root Navigation** model with a **Hybrid Map** role:

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   DISCOVER   │     MAP      │     PLAN     │   TRANSIT    │     YOU      │
│   (Explore)  │  (Cartography│ (Constraints │  (154 Routes │   (Saved &   │
│              │   & Spatial) │   & Engine)  │   & Stops)   │   Settings)  │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

### 1.1 Map's Architectural Role: Hybrid Canvas
Rather than forcing a binary choice between "pure contextual sheet" or "fullscreen isolated map", O-TRAVELZ uses a **Hybrid Role**:
1. **Dedicated Map Tab**: Full-screen spatial canvas for regional orientation across Odisha, district bounding box selection, multi-category pin toggles, and transit corridor visualization.
2. **Contextual Map Surfaces**: Embedded mini-maps in Place Detail sheets, transit stop details, and itinerary daily route summaries. Tapping any contextual mini-map opens the focused node within the primary Map canvas.

---

## 2. Structural Screen Anatomy & Domain Hierarchy

```
App Root
├── 0. Onboarding & Permissions Flow (First Launch / Progressive)
│   ├── Welcome to Modern Odisha Cultural Atlas
│   ├── Offline Catalog Pre-Cache Option
│   └── Progressive Location Disclosure (Triggered on intent, never on launch)
│
├── 1. Discover (Primary Catalog & Culture)
│   ├── Editorial Hero Feature (Curated Living Craft / Monument)
│   ├── Quick District Filter Chips (All 30 Odisha Districts)
│   ├── Category Carousel (Temples, Craft Villages, Wildlife, Waterbodies, Corridors)
│   ├── Search Bar & Filter Drawer
│   │   ├── Search Suggestions (Recent, Top Hits, District Matches)
│   │   └── Multidimensional Filters (Category, District, Proximity, Open Now)
│   └── Place Detail Sheet / Screen
│       ├── Verified Photography Gallery (Distinct source WebP assets)
│       ├── Truth Header (Verified Official Badge, District, ASI / State Record)
│       ├── Live Telemetry (Open-Meteo current temp, condition, humidity)
│       ├── Cultural Overview & Artisan Background
│       ├── Multimodal Transit Connection (Nearest stop + First-Mile Walk Guidance)
│       ├── Turn-by-Turn Navigation Trigger (Google Maps / Apple Maps deep link)
│       └── Offline Save / Bookmark Toggle
│
├── 2. Map (Spatial Exploration & Navigation)
│   ├── Full-Screen Canvas (Google Maps Compose / Apple MapKit)
│   ├── Floating Category Filter Pills (Monuments, Crafts, Nature, Transit Hubs)
│   ├── District Boundary Polygons (PostGIS Bounding Boxes)
│   ├── Clustered Annotations (Zoom <= 11) with Custom Tinted Pins
│   ├── Selected Node Bottom Sheet (Swipeable preview -> Place Detail)
│   └── "Re-center on Odisha" / "Locate Me" Floating Actions
│
├── 3. Plan (Deterministic Itinerary & AI Assistant)
│   ├── Constraint Input Form (Days, Origin, Travel Style, Transit Preference)
│   ├── Itinerary Solver Output (Day-by-Day Timeline)
│   │   ├── Opening Hours Constraint Validation
│   │   ├── Realistic Transit Hops & Highway Legs
│   │   └── Meal & Rest Windows
│   ├── AI Assistant Chat (Conversational refinement of deterministic plan)
│   │   ├── Grounded Claims Attribution (Citations to verified database)
│   │   └── Multilingual Odia / English intent parsing
│   └── Save Itinerary to Offline Storage
│
├── 4. Transit (CRUT Mo Bus, Ama Bus & Rail)
│   ├── Route Search & Regional Selectors (Capital Region, Rourkela, Berhampur, etc.)
│   ├── 154 Canonical Route Directory
│   │   ├── Route Overview (Start, Terminal, Total Distance, Frequency)
│   │   ├── Topological Stop Sequence
│   │   └── Scheduled Departure Times (Indian Standard Time)
│   ├── Stop Detail Canvas
│   │   ├── Stop Locality Chip (VERIFIED_LOCALITY vs OFFICIAL_SERVICE_AREA)
│   │   ├── Serving Bus Routes
│   │   └── Next Scheduled Departures
│   └── Community Ride Verification (M20)
│       ├── Check-In Verification Flow
│       └── Candidate Stop Consensus Meter
│
└── 5. You (Saved Trips, Offline Atlas & Preferences)
    ├── Saved Places (Available 100% offline via SwiftData / Room)
    ├── Saved Itineraries & Trip Timelines
    ├── Offline Atlas Manager
    │   ├── Storage Footprint & Cache Health
    │   ├── Manual Pre-Download of Image Variants
    │   └── Airplane Mode Verification Drill
    ├── Language Toggle (English / Odia - ଓଡ଼ିଆ)
    ├── Theme Toggle (Dark Atlas / Warm Sandstone / System)
    ├── Emergency Civic Contacts (Police 112, Tourist Helpline, District Hospitals)
    └── Legal & Trust Foundation
        ├── Privacy Policy & Data Safety Disclosures
        ├── Terms & Conditions
        └── About O-TRAVELZ ("Built by Algoryxz")
```
