# O-Travelz Design System Specification (Source of Truth)

`STATUS: VERIFIED`

This document defines the authoritative frontend design system for O-Travelz. It reflects the exact tokens, surfaces, typography, and geometries currently in production.

---

## 1. Core Brand Thesis & Atmosphere

O-Travelz is a high-end, modern travel operating system rooted in Odisha, engineered for national and global scale.

* **Personality**: Warm, architectural, tactile, quiet luxury, human, travel-first.
* **Canvas Philosophy**: Solid material surfaces (warm sandstone `#FAF8F5` in light mode, deep obsidian `#0B1220` in dark mode).
* **Guiding Rule**: Odisha-inspired, not Odisha-themed. No generic AI glowing gradients, no neon, no frosted glass clutter.

---

## 2. Typography Scale

| Role | Font Family | Weights | Usage / Intent |
| :--- | :--- | :--- | :--- |
| **Primary Display & Headings** | `Plus Jakarta Sans` | 600, 700, 800 | Confident headlines, brand lockup, section titles (`tracking: -0.025em`) |
| **Primary Body & UI** | `Plus Jakarta Sans` | 400, 500, 600 | Navigation links, form labels, card metadata, descriptions |
| **Editorial Storytelling** | `DM Serif Display` | 400 (Italic/Regular) | Signature quotes, historical intros, editorial hero captions |
| **Logistics & Telemetry** | `DM Mono` | 400, 500, 600 | Tabular numbers (`tnum`), coordinates (`lat/lon`), distances (`km`), time (`09:30`) |
| **Authentic Local Script** | `Noto Sans Oriya` | 400, 600 | Local destination script hints (e.g. ଓଡ଼ିଶା, କୋଣାର୍କ) |

---

## 3. Color Token Architecture

### A. Core Surfaces & Canvases
```css
--color-canvas-bg: #0B1220;         /* Obsidian dark canvas */
--color-canvas-light: #FAF8F5;      /* Warm sandstone light canvas */
--color-surface: #111827;           /* Base component surface */
--color-surface-elevated: #172235;  /* Hover / elevated card surface */
--color-surface-card: #0F172A;      /* Structured content container */
```

### B. Hairline Borders & Dividers
```css
--color-border-subtle: #1F293D;     /* 1px subtle internal dividers */
--color-border-default: #263244;    /* Standard card and control hairline border */
--color-border-strong: #334155;     /* Focused states and active containers */
--color-border-warm: #E2DDD5;       /* Warm light-mode hairline border */
```

### C. Signature Restrained Brand Accents
```css
--color-brand-terracotta: #E06D44;  /* Warm architectural terracotta */
--color-brand-sand: #D4AF37;        /* Subtle sandstone gold highlight */
--color-brand-teal: #14B8A6;        /* Coastal water & verified state */
--color-brand-teal-dark: #0F766E;   /* Deep ocean state */
```

### D. Semantic Category Indicators
```css
--color-cat-nature: #10B981;        /* Emerald hills & forests */
--color-cat-heritage: #D97706;      /* Ancient stone & monuments */
--color-cat-beach: #0284C7;         /* Marine & coastal beaches */
--color-cat-food: #F59E0B;          /* Culinary & local dining */
--color-cat-shopping: #A855F7;      /* Local crafts & handlooms */
--color-cat-medical: #F43F5E;       /* Emergency & trauma facilities */
--color-cat-transit: #06B6D4;       /* Rail & road transit stations */
```

---

## 4. Spacing, Geometry & Radii Hierarchy

* **Base Unit**: 8px spatial grid (`8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
* **Radius Tokens**:
  * `rounded-lg` (8px): Micro-badges, input fields, and tags.
  * `rounded-xl` (12px): Standard action buttons, dropdown items.
  * `rounded-2xl` (16px): Content cards, destination modules, search bars.
  * `rounded-3xl` (24px): Hero containers, modals, major feature sections.
* **Elevation & Shadows**:
  * `.shadow-paper`: `0 1px 3px rgba(0,0,0,0.2)`
  * `.shadow-paper-lg`: `0 4px 6px rgba(0,0,0,0.25)`
  * `.shadow-paper-xl`: `0 10px 15px rgba(0,0,0,0.35)`

---

## 5. Motion & Transitions

* **Duration**: `150ms` (instant micro-interactions) to `300ms` (slide-overs and modals).
* **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (fluid natural deceleration).
* **Accessibility**: Every animation strictly honors `@media (prefers-reduced-motion: reduce)` by disabling parallax offsets and auto-scroll behaviors.
