# O-TRAVELZ V4 — Web Information Architecture & Experience Design

> **Authoritative Specification for the Next-Generation Desktop & Tablet Web Experience**  
> Positioning: **Odisha Travel Intelligence + Living Cultural Atlas**  
> Document Version: `4.0.0` | Date: `2026-09-02`

---

## 1. Vision & Core Philosophy

The O-TRAVELZ V4 Web Application is not a generic booking portal or a reskinned mobile view. It is an **authoritative, high-density desktop and tablet cultural atlas and travel intelligence platform**.

### Desktop Advantages Leveraged
1. **Full-Width Interactive Canvas**: MapLibre GL JS vector maps with split-screen itinerary inspectors and spatial filtering.
2. **Deep Cultural Storytelling**: Long-form editorial narratives, historical context, temple architectural breakdowns, and artisan profiles.
3. **Multimodal Transport Explorer**: Side-by-side rail, aviation, intercity bus, and CRUT transit route visualizers.
4. **Interactive 3D Heritage & Gaussian Splatting**: WebGL spatial view of Konark, Lingaraj, Dhauli, and Barabati Fort.
5. **Direct Research & Provenance Audit**: Direct transparency into image licenses, coordinate geocoding confidence, and CRUT timetable effective dates.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   O-TRAVELZ V4 WEB APP                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  NAV:  [Explore]  [Plan]  [Map]  [Transport]  [Culture]  [Artisans]  [Stories]  [Community] │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│   ┌──────────────────────────────────┐  ┌────────────────────────────────────────────────┐  │
│   │     MODERN CULTURAL ATLAS        │  │          FULL-WIDTH INTERACTIVE MAP            │  │
│   │  • Editorial Heritage Stories    │  │  • MapLibre GL JS Vector Basemap               │  │
│   │  • Living Artisan Clusters       │  │  • Multi-layer Spatial Filtering               │  │
│   │  • GI-Tagged Crafts & Weaves     │  │  • Stop Sequences & Route Corridors            │  │
│   └──────────────────────────────────┘  └────────────────────────────────────────────────┘  │
│   ┌──────────────────────────────────┐  ┌────────────────────────────────────────────────┐  │
│   │     MULTIMODAL ITINERARY         │  │          INTERCITY & MOBILITY HUB              │  │
│   │  • Multi-Day Constraint Studio   │  │  • Flights (BBI/JRG) & Rail Hubs (BBS/PURI)    │  │
│   │  • Side-by-Side Transport Hops   │  │  • 154 Mo Bus Corridors & Timetables          │  │
│   │  • Why This Recommendation?      │  │  • First-Mile Proximity Engine                 │  │
│   └──────────────────────────────────┘  └────────────────────────────────────────────────┘  │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Primary Navigation Structure

| Navigation Section | Primary Surface URL | Core Capabilities & User Flows |
|---|---|---|
| **1. Explore** | `/explore` | Multi-category catalog (Destinations, Heritage, Beaches, Wildlife, Dining, Essentials). 3-column masonry grid, district filters, and instant search. |
| **2. Plan** | `/plan` | Grounded multi-day itinerary planner with constraint sliders (Days, Pace, Budget, Mobility, Transit Preference) and interactive timeline editor. |
| **3. Map** | `/map` | Full-screen MapLibre GL JS experience. Multi-layer toggles for Monuments, Artisans, Mo Bus Stops, Railway Stations, Airports, and Weather. |
| **4. Transport** | `/transport` | Unified multimodal hub: 154 CRUT routes, stop departures, Indian Railways connectivity (BBS, PURI, CTC), and airport flight schedules (BBI, JRG). |
| **5. Culture** | `/culture` | Odisha heritage atlas: Architectural timelines (Kalinga Style), temple geometry, sacred rituals (Rath Yatra), festivals, and culinary geography. |
| **6. Artisans** | `/artisans` | Living craft directory: 12 craft traditions (Pattachitra, Tarakasi, Sambalpuri, Kotpad), verified village clusters, and workshop visit guides. |
| **7. Stories** | `/stories` | Curated travel essays, field notes from the 30 districts, photo journalism, and archaeological context. |
| **8. Community** | `/community` | Transparent contribution platform: Staged destination submissions, photo evidence upload, and research peer-review queue. |

---

## 3. Three Web Design Direction Explorations

### Direction 1: *Modern Odisha Cultural Atlas* (RECOMMENDED)
* **Aesthetic**: Warm Sandstone (`#D2B48C`), Terracotta (`#C84B31`), and Temple Gold (`#E5A93C`) accents on an off-white/cream canvas (`#FAF7F2`) with an instant toggle to Slate Dark Mode (`#0A0D12`).
* **Typography**: Elegant serif display typography (*Playfair Display* / *Cinzel*) paired with ultra-clean modern sans (*Inter* / *Plus Jakarta Sans*) and authentic Odia script (*Noto Sans Oriya*).
* **Layout**: Generous editorial whitespace, large hero photographic spreads, delicate geometric temple borders, and rich contextual cards.
* **Tone**: Authoritative, cultural, welcoming, and prestigious.

### Direction 2: *High-Precision Mobility & Geospatial Intelligence*
* **Aesthetic**: Technical dark-slate canvas (`#0F172A`) with high-contrast Cyan (`#06B6D4`), Emerald (`#10B981`), and Amber (`#F59E0B`) data accents.
* **Typography**: Monospace coordinate badges (*JetBrains Mono*), high-density tabular typography, and data-dense pill chips.
* **Layout**: Split-pane IDE-style layout with live map on the left, route timetable inspector on the right, and bottom data telemetry drawer.
* **Tone**: Analytical, exact, real-time, and technical.

### Direction 3: *Immersive Living Heritage & 3D Spatial Audio*
* **Aesthetic**: Deep charcoal black (`#050505`) with vibrant Pattachitra mineral colors (Indigo, Haritala Yellow, Geru Red).
* **Typography**: Expressive display fonts and interactive audio captions.
* **Layout**: 3D WebGL viewport hero, spatial soundscapes of temple bells and loom shuttles, full-screen immersive video reels.
* **Tone**: Cinematic, emotional, artistic, and experiential.

---

## 4. Homepage Hero Section Layout

The Homepage delivers immediate intelligence:

1. **Top Bar**: O-TRAVELZ Logo (`BrandOchre`), Navigation Links, Language Switcher (EN / ଓଡ଼ିଆ / हिंदी), Search Trigger (`Cmd+K`).
2. **Hero Header**: *"Odisha Travel Intelligence & Cultural Atlas"* with live Bhubaneswar weather condition and search bar accepting natural language (`"Temples near Cuttack"`, `"Pattachitra artists in Raghurajpur"`).
3. **Intelligence Dock**: Quick stats (161+ Verified Places, 154 Mo Bus Routes, 12 Living Craft Lineages, 30 Districts).
4. **Curated Circuits Grid**: Golden Triangle (Bhubaneswar-Puri-Konark), Diamond Triangle (Lalitgiri-Ratnagiri-Udayagiri), Ecotourism (Similipal & Chilika), Western Heritage (Sambalpur & Hirakud).
5. **Living Artisans Spotlight**: Highlighting master craftspeople and village clusters with travel directions.
6. **Live Transport Telemetry Notice**: Transparent banner explaining scheduled timetable data vs live tracking.
