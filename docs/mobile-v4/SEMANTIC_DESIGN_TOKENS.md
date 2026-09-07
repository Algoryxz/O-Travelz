# O-TRAVELZ Mobile V4 — Shared Semantic Design Tokens

> **Authoritative Platform-Agnostic Design Token Contract**<br>
> Scope: **Semantic Tokens Shared Across Android, iOS, and Web V4**<br>
> Wave: `M2` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Architectural Philosophy: Semantics Over Hex Codes

In O-TRAVELZ Mobile V4, UI components never reference raw hexadecimal color codes, pixel dimensions, or platform-specific style names directly. Instead, all surfaces, cards, labels, and borders reference **semantic tokens**.

A semantic token defines **intent, meaning, and hierarchy**. How that token is physically realized differs appropriately between Android (Material 3 roles) and iOS (Apple HIG system colors and materials), while preserving identical meaning.

---

## 2. Color & Surface Semantics

### 2.1 Surfaces & Backgrounds
| Semantic Token | Purpose & Intent | Dark Atlas Reference | Warm Sandstone Reference |
|---|---|---|---|
| `surface.canvas` | The foundational root application background | `#10141B` (Deep Basalt) | `#FBF9F5` (Parchment) |
| `surface.card` | Primary container for content items and list rows | `#161B22` | `#FFFFFF` |
| `surface.elevated` | Modal surfaces, popovers, floating preview sheets | `#21262D` | `#F5EFEB` |
| `surface.overlay` | Backdrop dimming behind modal dialogs and sheets | `rgba(0,0,0,0.65)` | `rgba(0,0,0,0.40)` |
| `border.subtle` | Hairline structural dividers (1px / 0.5pt) | `#30363D` | `#E8E2D8` |
| `border.prominent` | Card focus rings, active selection outlines | `#D4A373` | `#A87444` |

### 2.2 Typographic Hierarchy & Content
| Semantic Token | Purpose & Intent | Contrast Guarantee |
|---|---|---|
| `text.primary` | High-contrast editorial titles, monument names, metrics | $\ge 7:1$ (AAA) |
| `text.secondary` | Metadata, schedule timestamps, cultural sub-captions | $\ge 4.5:1$ (AA) |
| `text.tertiary` | Provenance citations, legal disclaimers, footnote text | $\ge 3.5:1$ |
| `text.inverse` | Text placed over dark photographic scrims or solid chips | $\ge 4.5:1$ |

### 2.3 Cultural & Brand Accents
| Semantic Token | Cultural Provenance & Domain Meaning | Dark Mode Hex | Light Mode Hex |
|---|---|---|---|
| `accent.sandstone` | Primary brand; temple heritage; active navigation state | `#D4A373` | `#A87444` |
| `accent.terracotta`| Living crafts, artisan clusters, cultural warnings | `#C86446` | `#B34728` |
| `accent.chilika` | Waterbodies, coastal geography, transit corridors | `#38BDF8` | `#0284C7` |
| `accent.forest` | Sanctuaries, natural reserves, eco-tourism | `#34D399` | `#059669` |

### 2.4 Multidimensional Truth & Status Tokens
| Semantic Token | Truth State Represented | Semantic Meaning & UI Role |
|---|---|---|
| `truth.verified` | `VerificationStatus.VERIFIED_OFFICIAL` | Physical inspection confirmed; official government/CRUT source |
| `truth.scheduled`| `FreshnessStatus.SCHEDULED` | Static timetable departure; HH:MM IST schedule |
| `truth.live` | `FreshnessStatus.LIVE_TELEMETRY` | Live weather condition (Open-Meteo) |
| `truth.estimated`| `DistanceConfidence.HAVERSINE_SPHERICAL` | Straight-line calculation; first-mile distance band |
| `truth.candidate`| `VerificationStatus.UNVERIFIED_CANDIDATE` | Candidate bus stop; GPS unverified by field inspection |
| `truth.unavailable`| `FreshnessStatus.STALE / UNAVAILABLE` | Information missing or external endpoint unreachable |
| `status.success` | Milestone completed, bookmark saved | Affirmative confirmation |
| `status.warning` | Sunday/holiday closure, locality-only stop | Cautious notification |
| `status.error` | Network disconnect, battery saver restricted | Actionable retry state |

---

## 3. Spatial System Tokens

All spacing adheres to a strict 4pt/4dp geometric base scale:

| Spacing Token | Scale Value | Primary Usage |
|---|---|---|
| `space.05` | $2\text{ dp / pt}$ | Hairline offsets, tag internal padding |
| `space.1` | $4\text{ dp / pt}$ | Micro gaps between icon and label |
| `space.2` | $8\text{ dp / pt}$ | Chip internal padding, compact element spacing |
| `space.3` | $12\text{ dp / pt}$ | Card internal content spacing |
| `space.4` | $16\text{ dp / pt}$ | Standard screen margin, card-to-card gap |
| `space.5` | $20\text{ dp / pt}$ | Section padding, modal header spacing |
| `space.6` | $24\text{ dp / pt}$ | Major editorial group separation |
| `space.8` | $32\text{ dp / pt}$ | Display hero top margin |
| `space.12` | $48\text{ dp / pt}$ | Minimum accessible interactive touch target |

---

## 4. Corner Radius Semantics

Corner radii reflect platform idioms while maintaining shared family proportions:

| Radius Token | Target Intent | Android (M3) | iOS (HIG) |
|---|---|---|---|
| `radius.small` | Tags, badges, status chips | $6\text{--}8\text{ dp}$ | $6\text{--}8\text{ pt}$ |
| `radius.medium` | Content cards, image containers | $16\text{ dp}$ | $12\text{ pt}$ |
| `radius.large` | Modal sheets, floating preview panels | $28\text{ dp}$ | $18\text{ pt}$ |
| `radius.full` | Pill buttons, circular avatars, fab | $9999\text{ dp}$ | $9999\text{ pt}$ |

---

## 5. Elevation & Depth Semantics

| Elevation Token | Semantic Purpose | Android Expression | iOS Expression |
|---|---|---|---|
| `depth.flat` | Inset list items, canvas | $0\text{ dp}$ (Border only) | Flat ($0\text{ pt}$) |
| `depth.raised` | Content cards, filter row | $1\text{ dp}$ Tonal tint | Grouped background |
| `depth.floating` | Bottom sheet preview, FAB | $2\text{--}3\text{ dp}$ Elevation | `.shadow(color: black.opacity(0.12), radius: 8)` |
| `depth.modal` | Full-screen dialogs, system alerts | $6\text{ dp}$ Elevation | Native modal presentation scrim |
