# O-TRAVELZ Mobile V4 ? Appearance & Color System Model

> **Authoritative Multiplatform Appearance Model (Light, Dark, System)**<br>
> Scope: **Wave M4 Design Acceptance Freeze**<br>
> Visual Directions: `ANDROID_A_ATLAS_MATERIAL` & `IOS_A_EDITORIAL_ATLAS`<br>
> Version: `4.0.0` | Status: `FROZEN_SPECIFIED` | Date: `2026-09-07`

---

## 1. Philosophy: Modern Odisha Cultural Atlas in Light & Dark

The visual identity of O-TRAVELZ is built from authentic Odisha cultural foundations: weathered temple sandstone, dark basalt sculpture, terracotta pottery, Chilika brackish water, and deep sal forests.

Both platforms support:
- `LIGHT` Mode (Sunlit sandstone canvas, high legibility in bright Indian outdoor sunlight)
- `DARK` Mode (Deep basalt sanctuary surfaces, energy saving in nighttime travel)
- `SYSTEM` Mode (Automatic tracking of OS system appearance settings)

---

## 2. Appearance Color Token Mapping

| Semantic Token | Light Mode (Sunlit Sandstone) | Dark Mode (Deep Basalt) | Role & Invariant |
|---|---|---|---|
| `surface.canvas` | `#F5F2EB` (Warm Sandstone Canvas) | `#12100E` (Deep Basalt Stone) | Root background behind all content feeds. |
| `surface.card` | `#EDEAE0` (Sun-baked Clay) | `#1E1A16` (Carved Basalt Block) | Card surfaces, milestone rows, feed containers. |
| `surface.elevated` | `#FFFFFF` (Pure White) | `#2A2520` (Elevated Basalt Surface) | Modals, floating action buttons, sheets. |
| `text.primary` | `#1A1612` (Charcoal Ink) | `#FAF8F5` (Parchment White) | Primary headings, titles, core body text. |
| `text.secondary` | `#5C554D` (Muted Umber) | `#B0A89F` (Muted Sandstone) | Subtitles, secondary metadata, timestamps. |
| `accent.terracotta` | `#C85A32` (Terracotta Brick) | `#E06D44` (Glowing Terracotta) | Primary brand accent, interactive buttons, milestones. |
| `accent.chilika` | `#2B6B88` (Chilika Lagoon Blue) | `#458CAE` (Luminous Lagoon) | Waterways, coastal destinations, ferry routes. |
| `accent.forest` | `#2D5A3F` (Similipal Sal Forest) | `#4E8765` (Luminous Foliage) | Nature reserves, ecotourism, wildlife belts. |

---

## 3. Truth-State Color Distinguishability

Truth colors MUST remain unmistakable in both light and dark appearances, and NEVER rely on color alone:

| Truth State | Light Mode Token | Dark Mode Token | Accompanying Non-Color Cue |
|---|---|---|---|
| **Verified** | `#2E7D32` (Dark Emerald) | `#4CAF50` (Vibrant Emerald) | Solid checkmark badge + explicit "Verified" text |
| **Scheduled** | `#1565C0` (Navy Sapphire) | `#42A5F5` (Sky Sapphire) | Clock face icon + explicit "Scheduled" text |
| **Candidate** | `#E65100` (Deep Amber) | `#FFB74D` (Bright Amber) | Warning triangle icon + explicit "Candidate" text |
| **Unavailable** | `#616161` (Neutral Charcoal) | `#9E9E9E` (Neutral Gray) | Slashed circle icon + "Unavailable" text |

---

## 4. Platform-Native Dynamic Theming Guardrails

### Android (Material 3 Dynamic Color)
- Dynamic Color (wallpaper extraction via Monet) is **restricted to utility chrome** (selection highlights, sliders).
- Core cultural brand surfaces (`surface.canvas`, `accent.terracotta`, and truth badges) MUST maintain O-TRAVELZ brand tokens to preserve cultural identity regardless of user wallpaper.

### iOS (Materials & Vibrancy)
- iOS system materials (`.ultraThinMaterial`, `.thinMaterial`, `.regularMaterial`) are used for navigation bars and sheet backgrounds.
- Vibrancy ensures secondary text and icons automatically adjust contrast over photographic backdrops.