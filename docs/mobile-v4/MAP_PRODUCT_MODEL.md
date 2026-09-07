# O-TRAVELZ Mobile V4 — Map Product Model & Cartographic Architecture

> **Authoritative Cartographic Specification**  
> Engine Strategy: **Native Platform GPU Acceleration (Google Maps Compose + Apple MapKit)**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. The Map as an Analytical Product Mode

In O-TRAVELZ, the Map is not a cosmetic background or decorative gadget. It is an **analytical spatial exploration engine** that visualizes:
1. Spatial distribution of Odisha's 204 verified places across 30 administrative districts.
2. The multimodal transit network (154 routes, 1,430 stops).
3. Personal saved bookmarks and active day itinerary tracks.
4. Nearby emergency essentials isolated from leisure points.

---

## 2. Layer Architecture & Default Visibility

```
┌────────────────────────────────────────────────────────┐
│ Layer 7: User Location Puck (Hardware GPS / Heading)   │ [Default ON]
├────────────────────────────────────────────────────────┤
│ Layer 6: Active Itinerary Track & Next Leg Polyline    │ [Active Trip Only]
├────────────────────────────────────────────────────────┤
│ Layer 5: Saved / Bookmarked Places (Gold Star Pin)     │ [Default ON]
├────────────────────────────────────────────────────────┤
│ Layer 4: Verified Cultural Destinations (204 Places)   │ [Default ON]
├────────────────────────────────────────────────────────┤
│ Layer 3: Verified Transit Stops (173 Official Pins)    │ [Toggleable ON/OFF]
├────────────────────────────────────────────────────────┤
│ Layer 2: Transit Route Vector Polylines (154 Routes)   │ [Corridor Focus Only]
├────────────────────────────────────────────────────────┤
│ Layer 1: Civic & Emergency Essentials (Hospitals, ATM) │ [Emergency Mode Only]
├────────────────────────────────────────────────────────┤
│ Layer 0: Native Basemap (Google Maps / Apple MapKit)   │ [Standard / Dark]
└────────────────────────────────────────────────────────┘
```

### 2.1 Mutual Exclusivity & Information Density Control
To prevent visual chaos ("pin pollution"):
- **Leisure vs Essentials Isolation**: The `Essentials` layer (Hospitals, Police, ATMs) is **mutually exclusive** with deep heritage exploration. When the traveler taps "Find Hospital", leisure pins dim or hide to spotlight medical facilities.
- **Candidate Stops Gating**: `CANDIDATE_STOPS` are **hidden by default**. They appear strictly when the traveler turns on "Rider Verification Mode" or explicitly expands transit debug layers.

---

## 3. Zoom-Dependent Clustering & LOD (Level of Detail)

| Zoom Level Range | Geographic Context | Display Behavior & Geometry |
|---|---|---|
| **Zoom 5 – 7** | Statewide Odisha Overview | 30 District boundary polygons with district names in Odia/English. All individual place pins cluster into district numerical badges (`"Puri: 14"`). |
| **Zoom 8 – 11** | Regional Inter-District | Regional clusters expand into sub-clusters. Major highway corridors (NH-16, NH-316) highlighted. |
| **Zoom 12 – 14** | Urban / Cluster Scale (e.g. Old Town BBSR) | Individual destination pins render with category glyphs (Temple, Craft, Nature). Transit hubs visible. |
| **Zoom 15+** | Immediate Street / Stop Scale | Verified bus stop poles render (`VERIFIED_OFFICIAL`). Exact pedestrian walking paths rendered on external handoff. |

---

## 4. Marker Semantic Vocabulary & Pin Colors

- **Temples & Heritage Monuments**: Sandstone Ochre (`#D4A373`) pin with stone temple shikhar glyph.
- **Artisan Villages & Living Craft**: Terracotta Clay (`#C86446`) pin with handloom/pottery glyph.
- **Nature Reserves & Waterbodies**: Similipal Forest Green (`#34D399`) pin with leaf glyph.
- **Beaches & Coastal Lagoons**: Chilika Lagoon Sky Blue (`#38BDF8`) pin with wave glyph.
- **Transit Hubs & Bus Junctions**: Basalt Slate (`#64748B`) pin with bus glyph.
- **Candidate Transit Stops**: Translucent amber ring with dashed border (`#F59E0B`). Never a solid pin.
- **Saved Bookmarks**: Gold star badge (`#FBBF24`).

---

## 5. Selection & Inspection Model

1. **Tap Annotation**:
   - Map smoothly animates camera to center the tapped node with slight bottom offset.
   - Selected node renders an elevated pulse ring.
   - Contextual bottom preview sheet slides up ($180\text{ dp}$ height):
     - Destination photo thumbnail.
     - Title in English + Odia (`Mukteshwar Temple · ମୁକ୍ତେଶ୍ୱର ମନ୍ଦିର`).
     - Truth badge (`[● Verified Official]`).
     - Live straight-line distance (`180 m`).
     - Action buttons: **"Detail"** (opens full sheet) and **"Navigate"** (launches external turn-by-turn).
2. **Tap Elsewhere on Canvas**: Preview sheet smoothly dismisses; camera remains in place.

---

## 6. External Turn-by-Turn Handoff ($0 API Cost Strategy)

When traveler taps "Navigate":
- On **Android**: Launches Google Maps navigation intent:
  ```
  https://www.google.com/maps/dir/?api=1&destination=LAT,LON&travelmode=driving
  ```
- On **iOS**: Prompts choice between Apple Maps (`maps://?daddr=LAT,LON`) and Google Maps URL based on user preference.
- Delivers voice turn-by-turn, traffic rerouting, and lane guidance for **$0.00 platform cost**.
