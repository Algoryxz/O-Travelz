# O-TRAVELZ V4 — Multiplatform Design System & Brand Identity

> **Authoritative Specification for Brand Identity, Design Tokens & Platform Implementations**  
> Platforms: **Web (Tailwind CSS)**, **Android (Jetpack Compose)**, **iOS (SwiftUI)**  
> Design Theme: **Modern Odisha Cultural Atlas**  
> Document Version: `4.0.0` | Date: `2026-09-02`

---

## 1. Brand Identity & Canonical Assets

### 1.1 Brand Typography & Voice
* **Brand Name**: **O-TRAVELZ**
* **Brand Descriptor**: **Odisha Travel Intelligence**
* **Organization Attribution**: **Built by Algoryxz**
* **Voice**: Authoritative, culturally respectful, mathematically precise, truthful, and welcoming.

### 1.2 The Brand Logo & Crest
* **Primary Mark**: Stylized Konark Sun Temple chariot wheel hub intersected by modern navigation vectors, rendered in `BrandOchre` (`#E5A93C`) and `TerracottaRed` (`#C84B31`).
* **Tagline**: *"Discover Odisha Grounded in Truth"*

---

## 2. Design Direction: *Modern Odisha Cultural Atlas*

The design system merges ancient Odishan temple geometry and living earth pigments with ultra-modern digital craftsmanship:

1. **Warm Sandstone & Mineral Pigments**: Deep ochres, temple sandstone, terracotta red, and Chilika azure replace generic cold gray palettes.
2. **Dual Surface Modes**:
   - **Light Mode (Editorial Atlas)**: Warm cream canvas (`#FAF7F2`) with rich serif headings and generous editorial whitespace.
   - **Dark Mode (Immersive Spatial)**: Deep slate-black canvas (`#0A0D12`) with glowing ochre accents, frosted glass cards, and high-contrast photography.
3. **Subtle Sacred Geometry**: Card outlines and dividers employ subtle 1pt architectural chamfers and Kalinga temple structural proportions.
4. **Authentic Multilingual Typography**: Native support for Odia script (*Noto Sans Oriya* / *Kalinga*) alongside Latin typography.

---

## 3. Semantic Design Tokens

### 3.1 Color Palette

| Token Name | Hex Code | Semantic Role & Cultural Meaning | Web / Tailwind | Android Compose | iOS SwiftUI |
|---|---|---|---|---|---|
| `BrandOchre` | `#E5A93C` | Primary brand accent; Konark gold crest | `bg-brand-ochre` | `Color(0xFFE5A93C)` | `Color("BrandOchre")` |
| `OchreLight` | `#F3C66A` | Interactive hover, focus rings, primary pills | `bg-ochre-light` | `Color(0xFFF3C66A)` | `Color("OchreLight")` |
| `OchreDark` | `#B57D1E` | Pressed button states, active borders | `bg-ochre-dark` | `Color(0xFFB57D1E)` | `Color("OchreDark")` |
| `TerracottaRed` | `#C84B31` | Pattachitra red, heritage accents, alerts | `bg-terracotta` | `Color(0xFFC84B31)` | `Color("TerracottaRed")` |
| `ChilikaAzure` | `#2D82B7` | Coastal water bodies, transit highlights | `bg-chilika-azure`| `Color(0xFF2D82B7)` | `Color("ChilikaAzure")` |
| `SalForestEmerald`| `#2E7D32`| Nature reserves, verified green badges | `bg-sal-emerald` | `Color(0xFF2E7D32)` | `Color("SalForestEmerald")`|
| `SandstoneMuted` | `#D2B48C`| Subtle dividers, secondary cultural icons | `border-sandstone`| `Color(0xFFD2B48C)` | `Color("SandstoneMuted")` |
| `DarkBackground` | `#0A0D12`| Level 0 canvas background (Dark Mode) | `bg-canvas-dark` | `Color(0xFF0A0D12)` | `Color("DarkBackground")` |
| `DarkSurface` | `#121820` | Level 1 surface for primary cards, sheets | `bg-surface-dark` | `Color(0xFF121820)` | `Color("DarkSurface")` |
| `DarkSurfaceElevated`| `#1A222D`| Level 2 surface for nested inputs, chips | `bg-surface-elevated`| `Color(0xFF1A222D)` | `Color("DarkSurfaceElevated")`|
| `BorderSubtle` | `#2B3747` | 1pt structural divider and card border | `border-dark-subtle`| `Color(0xFF2B3747)` | `Color("BorderSubtle")` |
| `TextPrimary` | `#F4F6F8` | 100% white-silver for high-contrast titles | `text-primary` | `Color(0xFFF4F6F8)` | `Color("TextPrimary")` |
| `TextSecondary` | `#A4B3C6` | 70% slate-gray for descriptions, subtitles | `text-secondary` | `Color(0xFFA4B3C6)` | `Color("TextSecondary")` |
| `TextMuted` | `#67778C` | 45% muted gray for metadata, timestamps | `text-muted` | `Color(0xFF67778C)` | `Color("TextMuted")` |

---

### 3.2 Typography Hierarchy

| Role | Font Size | Weight | Line Height | Tracking | Web Spec | Android Compose Spec | iOS SwiftUI Spec |
|---|---|---|---|---|---|---|---|
| `displayLarge` | 32pt/sp | Bold | 40pt | -0.5pt | `text-3xl font-bold tracking-tight` | `32.sp`, Bold, `-0.5.sp` | `.system(size: 32, weight: .bold, design: .rounded)` |
| `displayMedium`| 26pt/sp | SemiBold| 32pt | -0.25pt| `text-2xl font-semibold` | `26.sp`, SemiBold, `-0.25.sp` | `.system(size: 26, weight: .semibold, design: .rounded)` |
| `titleLarge` | 20pt/sp | SemiBold| 26pt | 0.0pt | `text-xl font-semibold` | `20.sp`, SemiBold, `0.0.sp` | `.system(size: 20, weight: .semibold)` |
| `titleMedium` | 16pt/sp | Medium | 22pt | +0.15pt| `text-base font-medium` | `16.sp`, Medium, `+0.15.sp` | `.system(size: 16, weight: .medium)` |
| `bodyLarge` | 16pt/sp | Regular | 24pt | +0.25pt| `text-base font-normal leading-relaxed`| `16.sp`, Normal, `+0.25.sp` | `.system(size: 16, weight: .regular)` |
| `bodyMedium` | 14pt/sp | Regular | 20pt | +0.2pt | `text-sm font-normal` | `14.sp`, Normal, `+0.2.sp` | `.system(size: 14, weight: .regular)` |
| `bodySmall` | 12pt/sp | Regular | 16pt | +0.4pt | `text-xs font-normal` | `12.sp`, Normal, `+0.4.sp` | `.system(size: 12, weight: .regular)` |
| `labelLarge` | 14pt/sp | SemiBold| 20pt | +0.1pt | `text-sm font-semibold tracking-wide` | `14.sp`, SemiBold, `+0.1.sp` | `.system(size: 14, weight: .semibold)` |
| `labelSmall` | 10pt/sp | Bold | 14pt | +0.5pt | `text-[10px] font-bold tracking-wider uppercase`| `10.sp`, Bold, `+0.5.sp` | `.system(size: 10, weight: .bold)` |

---

### 3.3 Spacing & Shape Scales

* **Spacing Scale**:
  - `xxs`: 2pt / 2px (`p-0.5`)
  - `xs`: 4pt / 4px (`p-1`)
  - `sm`: 8pt / 8px (`p-2`)
  - `md`: 16pt / 16px (`p-4`)
  - `lg`: 24pt / 24px (`p-6`)
  - `xl`: 32pt / 32px (`p-8`)
  - `xxl`: 48pt / 48px (`p-12`)
* **Corner Radii**:
  - `small`: 6pt (`rounded-md`) $\rightarrow$ Filter chips, small badges, inline icons.
  - `medium`: 12pt (`rounded-xl`) $\rightarrow$ Standard cards, text inputs, primary buttons.
  - `large`: 20pt (`rounded-2xl`) $\rightarrow$ Hero banners, modal dialogs, map bottom sheets.
  - `full`: 999pt (`rounded-full`) $\rightarrow$ Capsule badges, pill filters, FABs.

---

### 3.4 Motion & Elevation Intent

* **Spring Physics**:
  - Web: Framer Motion `transition={{ type: "spring", stiffness: 300, damping: 25 }}`
  - Android: `spring(dampingRatio = Spring.DampingRatioLowBouncy, stiffness = Spring.StiffnessMediumLow)`
  - iOS: SwiftUI `.animation(.spring(response: 0.35, dampingFraction: 0.8), value: ...)`
* **Elevation Intent**:
  - Web: `backdrop-blur-md bg-surface-dark/90 border border-dark-subtle shadow-lg`
  - Android: `tonalElevation = 2.dp` resting $\rightarrow$ `6.dp` pressed with Ochre surface tint.
  - iOS: `.background(.ultraThinMaterial)` with 1pt `BorderSubtle` stroke and subtle shadow.

---

### 3.5 Cross-Platform Icon Semantics

| Semantic Concept | Web (Lucide React) | Android (Material Symbols) | iOS (SF Symbols) |
|---|---|---|---|
| **Explore / Discovery** | `<Compass />` | `Icons.Rounded.Explore` | `safari` / `globe.asia.australia.fill` |
| **Itinerary / Calendar** | `<Calendar />` | `Icons.Rounded.CalendarMonth` | `calendar.badge.clock` |
| **Transit / Bus** | `<Bus />` | `Icons.Rounded.DirectionsBus` | `bus.fill` |
| **Railway / Train** | `<TrainTrack />` | `Icons.Rounded.Train` | `tram.fill` / `train.side.front.car` |
| **Aviation / Flight** | `<Plane />` | `Icons.Rounded.Flight` | `airplane` |
| **Artisan / Craft** | `<Palette />` / `<Sparkles />` | `Icons.Rounded.Brush` | `paintpalette.fill` |
| **Weather / Ambient** | `<SunDim />` / `<CloudSun />` | `Icons.Rounded.WbSunny` | `cloud.sun.fill` |
| **Bookmark / Save** | `<Bookmark />` | `Icons.Rounded.Bookmark` | `bookmark.fill` |
| **Verified Seal** | `<CheckCircle2 />` | `Icons.Rounded.Verified` | `checkmark.seal.fill` |
| **Scheduled Clock** | `<Clock />` | `Icons.Rounded.Schedule` | `clock.badge.checkmark.fill` |
| **Location / GPS** | `<Navigation />` | `Icons.Rounded.MyLocation` | `location.fill` |
| **Share Link** | `<Share2 />` | `Icons.Rounded.Share` | `square.and.arrow.up` |
