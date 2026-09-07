# O-TRAVELZ Mobile V4 — Information Architecture & Structural Product Anatomy

> **Authoritative Product Anatomy Specification**  
> Scope: **Structural Hierarchy, Top-Level Navigation, and Functional Domain Mapping**  
> Document Version: `4.1.0` | Last Updated: `2026-09-07` (Updated in Wave M1 via Decision D-M1-02)

---

## 1. Top-Level Navigation Architecture: 5-Tab Root (Model A)

Based on the multi-criteria decision analysis in `reports/mobile_v4_m1_root_navigation_decision.json`, O-TRAVELZ Mobile V4 adopts **Model A**:

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   DISCOVER   │     MAP      │     PLAN     │    TRIPS     │     YOU      │
│  (Cultural   │   (Spatial   │ (Constraint  │   (Active    │  (Offline,   │
│    Atlas)    │   Canvas)    │   Solver)    │   Timeline)  │  Settings)   │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

### 1.1 Architectural Rationale
1. **Separation of "Before Traveling" vs. "While Traveling"**:
   - Before traveling, users browse **Discover**, explore regions on the **Map**, and construct schedules in **Plan**.
   - While traveling in Odisha, users immediately open **Trips** to see their current day's timeline, next bus hop, and saved bookmarks.
2. **Transit Integration**:
   - Transit (154 routes across CRUT Mo Bus and Ama Bus) is not an isolated directory tab. It is integrated as:
     - A featured entry section in **Discover** ("Transit Corridors & Bus Network").
     - A toggleable vector route layer on the **Map** tab.
     - The multimodal routing backbone in **Plan**.
     - The first-mile guidance engine in **Trips**.
3. **Map's Hybrid Role**:
   - Dedicated primary root tab for province-wide spatial filtering across 30 districts.
   - Embedded contextual mini-maps in Place Detail sheets, transit stop sheets, and itinerary timeline cards.

---

## 2. Complete Structural Domain Tree

```
App Root
├── 0. Onboarding & First-Run Context
│   ├── Welcome to Modern Odisha Cultural Atlas
│   ├── Language Selection (English / Odia - ଓଡ଼ିଆ)
│   ├── Optional Offline Catalog Pre-Cache
│   └── Progressive Location Disclosure (Triggered only upon explicit user action)
│
├── 1. Tab: Discover (Editorial Cultural Atlas)
│   ├── Editorial Hero Feature (Living Artisan Tradition / Monument of the Week)
│   ├── Quick District Filter Row (All 30 Odisha Districts)
│   ├── Category Carousels (Temples, Craft Villages, Wildlife, Corridors)
│   ├── Transit Network Portal (Direct access to 154 Mo Bus / Ama Bus routes)
│   ├── Search Bar & Filter Drawer
│   │   ├── Instant Search Suggestions (Destinations, Districts, Craft lineages)
│   │   └── Multidimensional Filter Sheet (Category, District, Open Now, Distance)
│   └── Place Detail Sheet (Contextual Presentation)
│       ├── Verified Photography Gallery (Distinct source WebP assets)
│       ├── Truth Header (Verified Official Badge, ASI/State Record, District)
│       ├── Live Telemetry (Open-Meteo Current Temp, Condition, Humidity)
│       ├── Cultural Essay & Architectural Context
│       ├── Nearest Verified Bus Stop & First-Mile Walking Pill
│       ├── External Navigation Trigger (Zero-cost deep link to Google/Apple Maps)
│       └── Bookmark / Save to Trip Action
│
├── 2. Tab: Map (Cartography & Spatial Navigation)
│   ├── Full-Screen Canvas (Google Maps Compose / Apple MapKit)
│   ├── Layer Control Pills (Monuments, Crafts, Nature, Transit Hubs, Bus Lines)
│   ├── District / Regional Browsing & Spatial Filtering (30 Districts)
│   ├── Dynamic Annotation Clustering (Numerical badges at zoom <= 11)
│   ├── Selected Node Preview Sheet (Swipeable card -> Place Detail)
│   └── Contextual Navigation Controls ("Re-center Odisha", "Locate Me")
│
├── 3. Tab: Plan (Constraint Solver & Conversational Assistant)
│   ├── Constraint Form (Days, Starting Hub, Travel Style, Walking Tolerance)
│   ├── Solver Output (Day-by-day feasible itinerary cards)
│   │   ├── Opening Hours Constraints (Validates temple and museum opening days)
│   │   ├── Scheduled Transit Connections (Mo Bus route numbers and departure IST)
│   │   └── Rest & Traditional Meal Windows
│   ├── Conversational AI Assistant Sheet (Grounded plan refinement)
│   │   ├── Multilingual Intent Parsing (Odia & English)
│   │   └── Cited Claims Attribution (Attributed to verified database records)
│   └── Save Itinerary Action (Persists immediately to local device storage)
│
├── 4. Tab: Trips (Active Itinerary, Timeline & Bookmarks)
│   ├── Active Trip View (Displayed when an itinerary is currently underway)
│   │   ├── "Next Milestone" Hero Banner (e.g. "Next: Mukteshwar Temple")
│   │   ├── Walking Access Pill (800m threshold via FirstMileEngine)
│   │   ├── Scheduled Bus Departure Clock (Tabular IST numbers)
│   │   ├── Day Timeline Checklist (Mark as Visited / Skip)
│   │   └── Turn-by-Turn Navigation Launch Button
│   ├── Saved Itineraries List (Past and upcoming plans, available offline)
│   └── Bookmarked Places Grid (Grouped by district, accessible in 1 tap)
│
└── 5. Tab: You (Preferences, Offline Atlas & Sovereign Controls)
    ├── Offline Atlas Manager
    │   ├── Storage Meter (Disk usage for text, data, and WebP media)
    │   ├── Manual Pre-Download of Image Packages
    │   └── Airplane Mode Verification Health Check
    ├── Language Selector (English / Odia - ଓଡ଼ିଆ)
    ├── Theme Preference (Dark Atlas Default / Warm Sandstone Light)
    ├── Emergency Civic Contacts (211 Verified Facilities: Police 112, District Hospitals, Tourist Police, Fire, Fuel, ATMs)
    ├── Community Contributions Portal
    │   ├── Submit Place Tip / Correction
    │   ├── Transit Stop Check-In & Ride Verification Mode (Consensus Engine)
    │   └── Staged Submissions Review Status
    └── Legal & Trust Transparency
        ├── Privacy Policy & Play Store / Apple Privacy Declarations
        ├── Terms & Conditions
        └── About O-TRAVELZ ("Built by Algoryxz")
```
