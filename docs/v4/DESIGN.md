# O-TRAVELZ V4 — Design System & Visual Language

> **Authoritative Design Specification**  
> Aesthetic Direction: **Modern Odisha Cultural Atlas**  
> Visual Qualities: **Editorial, Restrained, Culturally Grounded, Information-Dense, Spatially Precise**  
> Document Version: `4.0.0` | Last Updated: `2026-09-04`

---

## 1. Aesthetic Philosophy: Modern Odisha Cultural Atlas

O-TRAVELZ re-imagines digital travel media as a **contemporary cultural atlas**. It discards both the gaudy commercialism of booking marketplaces and the sterile minimalism of generic software dashboards.

### 1.1 Expressive Editorial Intent
> **Anti-vibe-coded does NOT mean bland or utilitarian.**
>
> We reject synthetic neon gradients, gratuitous glassmorphism, and cartoonish illustrations. In their place, we elevate **commanding typography, authentic high-resolution photography, deep cultural provenance, and exquisite spatial mapping**. Every layout feels deliberate, authoritative, and deeply rooted in Odisha landscape and stone.

### 1.2 Cultural References as Restrained Accents
Odisha architectural and artisanal heritage guides our visual language, but **never as decorative kitsch**:
* **Sandstone**: Weathered buff and ochre stone of Mukteshwar, Rajarani, and Konark temples.
* **Terracotta**: Earthy reddish-brown clays of Barapali pottery and rural Odia courtyards.
* **Chilika Blue**: Deep marine and misted blues of Asia largest brackish lagoon.
* **Forest Green**: Canopy greens of Similipal National Park and the Eastern Ghats.
* **Brass & Bell Metal**: Burnished golden sheen of traditional Kantilo metalcraft.
* **Neutral Dominance**: Cultural colors are applied strictly as **accents, badges, and boundary indicators**. 85%+ of surfaces remain clean, calm slate or warm off-white neutrals to let photography and cartography lead.

> **Token Freezing Rule**:
> Hexadecimal values documented below represent target design references. **They are not frozen as permanent architecture until live implemented screens validate visual harmony and contrast across OLED, LCD, and mobile outdoor lighting.**

---

## 2. Color Tokens (Provisional Palette)

### 2.1 Dark Atlas Theme (Default Web & Mobile Dark Mode)
| Token Name | Reference Hex | Purpose & Usage |
|---|---|---|
| `surface-canvas` | `#0D1117` / `#10141B` | Primary deep canvas background |
| `surface-card` | `#161B22` / `#1A202C` | Content cards, drawers, bottom sheets |
| `surface-elevated` | `#21262D` / `#2D3748` | Interactive chips, elevated modals, popovers |
| `border-subtle` | `#30363D` | Crisp hairline dividers (1px) |
| `text-primary` | `#F0F6FC` | High-contrast editorial titles and values |
| `text-secondary` | `#8B949E` | Captions, metadata, schedule timestamps |
| `accent-sandstone` | `#D4A373` | Active tab indicators, temple category pins |
| `accent-terracotta`| `#C86446` | Artisan cluster badges, warning notes |
| `accent-chilika` | `#38BDF8` | Water features, beach categories, transit lines |
| `accent-forest` | `#34D399` | Wildlife sanctuaries, nature reserves, verified green |

### 2.2 Warm Sandstone Theme (Editorial Light Mode)
| Token Name | Reference Hex | Purpose & Usage |
|---|---|---|
| `surface-canvas` | `#FBF9F5` | Warm off-white parchment canvas |
| `surface-card` | `#FFFFFF` | Elevated reading cards |
| `border-subtle` | `#E8E2D8` | Muted natural stone borders |
| `text-primary` | `#1C1917` | Deep charcoal ink text |
| `text-secondary` | `#78716C` | Editorial metadata and secondary captions |
| `accent-sandstone` | `#A87444` | Contrast-tested ochre brand accents |

---

## 3. Typography & Hierarchy

The typographic system creates an authoritative, magazine-grade reading rhythm:

| Tier | Web Typography | iOS Typography (HIG) | Android Typography (M3) | Tracking & Weight |
|---|---|---|---|---|
| **Display Hero** | Serif Display (36–48px) | Large Title (Serif/Bold) | Headline Large (Serif) | Tight (-0.02em), Bold |
| **Section Title** | Sans-Serif (24–28px) | Title 2 (Semibold) | Title Large (Medium) | Normal, Semibold |
| **Card Header** | Sans-Serif (18–20px) | Headline (Semibold) | Title Medium (Medium) | Normal, Semibold |
| **Editorial Body** | Sans-Serif (15–16px) | Body (Regular) | Body Large (Regular) | Relaxed line-height (1.6) |
| **Metadata / Mono**| Monospace / Tabular (13px)| Caption 1 / Mono | Label Small (Medium) | Tabular numbers for times |

* **Numbers & Schedules**: Departure times (`08:45 IST`) and distances (`12.4 km`) **must** use tabular figures to prevent layout jitter during data updates.
* **Odisha Transliteration**: Odia script place names (`ଭୁବନେଶ୍ୱର`) render alongside English titles using system-native Odia fonts (`Kalinga`, `Nirmala UI`).

---

## 4. Truth Badges & Dimensional Presentation

UI badges are derived strictly from the **Multidimensional Truth Model** (`VerificationStatus`, `FreshnessStatus`, `AvailabilityStatus`):

```
┌────────────────────────────────────────────────────────┐
│ [● Verified Official]  Konark Sun Temple               │
│ Puri District · UNESCO World Heritage                  │
│                                                        │
│ [◷ Scheduled · 08:30 IST]  Route 10 (Master Canteen)   │
│ [☁ Live · 31°C · Humidity 78%]  Open-Meteo             │
│ [↔ Estimated · 3.2 km]  Haversine Straight-Line        │
└────────────────────────────────────────────────────────┘
```

| Badge Semantic | Badge Color (Dark) | Badge Color (Light) | Required Text Formula |
|---|---|---|---|
| **Official Provenance** | `#22C55E` border / green tint | Emerald `#047857` | `Verified Official` |
| **Timetable Schedule** | `#F59E0B` border / amber tint | Amber `#B45309` | `Scheduled · HH:MM IST` |
| **Live Weather** | `#38BDF8` border / sky tint | Blue `#0369A1` | `Live · {temp}°C` |
| **Estimated Distance** | `#94A3B8` border / slate tint | Slate `#475569` | `Estimated · {dist} km` |
| **Offline Fallback** | `#A855F7` border / purple tint | Purple `#7E22CE`| `Fallback Bundle` |

---

## 5. Photographic & Media Standards

1. **Zero Synthetic Photography**: AI-generated imagery is **strictly banned**. Every photograph must depict the actual physical site, monument, craft village, or artisan in Odisha.
2. **Quality Gate Rule**: `NO VERIFIED IMAGE = NO PUBLIC DESTINATION`. Places lacking audited photos remain in staging and do not appear in user-facing explore feeds.
3. **Aspect Ratio Standardization**:
   * Hero Banners: `16:9` or `21:9` wide cinematic crops.
   * Explore Cards: `4:3` editorial cards.
   * Artisan Portraits: `1:1` square portraits focusing on master craftspeople at work.
4. **Delivery Formats**: Multi-tier WebP format (`hero.webp`, `card.webp`, `thumbnail.webp`, `original.webp`).

---

## 6. Map Visual Language

* **Style Alignment**: Basemaps are styled in a custom Dark Slate / Sandstone palette matching the atlas UI.
* **Marker Vocabulary**:
  * Temples & Monuments: Sandstone Ochre pin (`#D4A373`) with monument icon.
  * Craft Villages: Terracotta pin (`#C86446`) with weaving/pottery icon.
  * Nature & Wildlife: Forest Green pin (`#34D399`) with leaf/canopy icon.
  * Transit Hubs: Deep Slate pin (`#64748B`) with bus/train symbol.
* **Marker Clustering**: Points cluster at zoom $\le 11$ with clean numerical count badges to prevent visual clutter in dense urban centers (e.g. Bhubaneswar Old Town).
