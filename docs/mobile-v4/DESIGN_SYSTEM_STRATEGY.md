# O-TRAVELZ Mobile V4 — Design System & Visual Strategy

> **Authoritative Cross-Platform Design Specification**  
> Philosophy: **Modern Odisha Cultural Atlas**  
> Core Axiom: **Shared Semantics ≠ Shared Visual Components**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Parity vs. Divergence Contract

O-TRAVELZ establishes an explicit boundary between what is shared across platforms and what is native to each platform.

### 1.1 What Must Be in Absolute Parity
1. **Capability Parity**: Every user capability (explore 204 places, filter by 30 districts, view 154 transit routes, plan itineraries, handoff to navigation) exists equally on both platforms.
2. **Truth Parity**: Verification statuses, timetable schedules, weather timestamps, and first-mile distance calculations evaluate identically.
3. **Contract Parity**: API schemas, offline fallback bundles, and local persistence semantics match the canonical data model.
4. **Quality Parity**: Both applications meet 60fps rendering targets, WCAG AA accessibility, Dynamic Type scaling, and instantaneous offline navigability.

### 1.2 What Is Explicitly Allowed to Diverge
1. **Visual Divergence**:
   - Android expresses the brand via **Material 3 Expressive** (pill chips, rounded card corners 16–24dp, floating sheets, optional Dynamic Color accents).
   - iOS expresses the brand via **Apple Human Interface Guidelines** (crisp hairline dividers, system vibrancy materials, 10–14pt corner radii, SF Symbols).
2. **Motion Divergence**:
   - Android uses **Predictive Back** gesture animations, shared axis transitions, and Material elevation lifts.
   - iOS uses native **SwiftUI springs**, interactive swipe-to-dismiss interactive sheet physics, and navigation zoom transitions.
3. **Navigation & Presentation Divergence**:
   - Android utilizes Jetpack Navigation 3 with an **Adaptive Navigation Rail** on tablets/foldables and Bottom Navigation Bar on phones.
   - iOS utilizes **NavigationSplitView** on iPad and tab-based **NavigationStack** on iPhone.
4. **Platform-Specific Interaction**:
   - Haptic feedback follows Android `HapticFeedbackConstants` vs iOS `UIImpactFeedbackGenerator`.

---

## 2. Three-Tier Token Architecture

```
┌────────────────────────────────────────────────────────┐
│ Tier 1: Primitive Tokens (Values)                      │
│ Ochre-500 (#D4A373), Terracotta-600 (#C86446), etc.   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Tier 2: Semantic Tokens (Purpose)                      │
│ surface-canvas, surface-card, accent-sandstone,        │
│ text-primary, text-secondary, badge-verified-official  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Tier 3: Component Tokens (Binding)                     │
│ DestinationCard.background, TransitPin.tint,           │
│ BottomNav.activeIndicator                              │
└────────────────────────────────────────────────────────┘
```

---

## 3. The Modern Odisha Cultural Atlas Palette

### 3.1 Dark Atlas Theme (Default)
- `surface-canvas`: `#0D1117` / `#10141B` (Deep basalt slate)
- `surface-card`: `#161B22` / `#1A202C` (Content container)
- `surface-elevated`: `#21262D` / `#2D3748` (Interactive chips & sheets)
- `border-subtle`: `#30363D` (1px hairline stone border)
- `text-primary`: `#F0F6FC` (High-contrast editorial reading)
- `text-secondary`: `#8B949E` (Captions, timestamps, metadata)
- `accent-sandstone`: `#D4A373` (Mukteshwar ochre; primary brand indicator)
- `accent-terracotta`: `#C86446` (Barapali clay; artisan cluster indicator)
- `accent-chilika`: `#38BDF8` (Brackish lagoon blue; water & transit)
- `accent-forest`: `#34D399` (Similipal canopy; verified natural reserves)

### 3.2 Warm Sandstone Theme (Editorial Light)
- `surface-canvas`: `#FBF9F5` (Tactile ivory parchment)
- `surface-card`: `#FFFFFF` (Elevated chalk-white cards)
- `border-subtle`: `#E8E2D8` (Warm weathered stone borders)
- `text-primary`: `#1C1917` (Deep charcoal ink)
- `text-secondary`: `#78716C` (Muted caption text)
- `accent-sandstone`: `#A87444` (Burnished sandstone accent)

---

## 4. Truth Badge Tokens

Badges represent genuine data facts derived from `DataProvenance`:

| Badge Type | Color Tint (Dark) | Color Tint (Light) | Strict Copy Formula |
|---|---|---|---|
| **Official Provenance** | `#22C55E` border / green tint | `#047857` text | `Verified Official` |
| **Scheduled Departure** | `#F59E0B` border / amber tint | `#B45309` text | `Scheduled · HH:MM IST` |
| **Live Telemetry** | `#38BDF8` border / sky tint | `#0369A1` text | `Live · {temp}°C` |
| **Estimated Distance** | `#94A3B8` border / slate tint | `#475569` text | `Estimated · {dist} km` |
| **Offline Fallback** | `#A855F7` border / purple tint | `#7E22CE` text | `Fallback Bundle` |

---

## 5. Typography Rhythm & Tabular Numbers

- **Display Serif Titles**: Evocative, commanding typography for destination names.
- **Odisha Dual-Script**: System Odia fonts (`Kalinga`, `Nirmala UI`) rendered at identical visual baseline alongside English titles.
- **Tabular Figures**: Departure times (`08:45 IST`) and distances (`12.4 km`) **must** use tabular figures to prevent horizontal layout shift during dynamic updates.
