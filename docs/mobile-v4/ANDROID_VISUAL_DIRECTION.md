# O-TRAVELZ Android V4 — Selected Visual Direction: Atlas Material

> **Authoritative Android Visual Specification**<br>
> Selected Direction: **`ANDROID_A_ATLAS_MATERIAL`** (Material 3 Expressive Editorial)<br>
> Wave: `M2` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Executive Summary & Selection Decision

Following rigorous multi-concept exploration, truth-state stress testing, accessibility evaluation, and hardware profiling on the reference Vivo Y19 (Helio P65 / API 31), **Direction A — Atlas Material** has been officially selected as the single visual and interaction system for Android V4.

- **Total Direction Score**: **96.0 / 100** (1st of 3 Android directions).
- **Core Identity**: An authoritative, contemporary digital cultural atlas engineered through disciplined Material 3 Expressive components. It combines deep basalt canvas backgrounds (`#10141B`) and warm sandstone content cards (`#1A202C`) with commanding typography, authentic photography, and precise spatial mapping.

---

## 2. Why Atlas Material Won

1. **Uncompromised Truth Visibility**: Integrated M3 tonal chips ([● Verified Official], [◷ Scheduled · HH:MM IST], [☁ Live · 31°C]) sit naturally within card headers without visual clutter or commercial marketplace tropes.
2. **Superior Hardware Feasibility**: Zero dependence on expensive real-time RenderEffect blurs or animated gradients. Achieves steady 60fps rendering on budget devices like the Vivo Y19.
3. **Accessibility Robustness**: Flawless font reflow up to Android $2.0\times$ font scaling without text clipping; exceeds WCAG 2.2 AA contrast standards ($4.8:1$ to $7.0:1$); fully compliant TalkBack traversal order.
4. **Platform-Native Elegance**: Respects modern Android conventions: edge-to-edge NavigationBar, Predictive Back gestures, M3 ModalBottomSheet detents, and adaptive NavigationRail on foldables/tablets.

---

## 3. Elements Borrowed from Rejected Android Directions

While Direction A is the core architecture, high-value functional elements from Direction B (Field Guide) have been selectively incorporated:
- **From Direction B (Field Guide)**:
  - **Compact Tabular Departure Grid**: The transit timetable view adopts Direction B's high-contrast monospace numeral layout for departure times and walking distance meters, ensuring instant readability on bumpy bus rides.
  - **Tactical Active-Trip Progress**: The step-by-step milestone check-in adopts Direction B's large, high-contrast action hit-targets and crisp tactile haptic tick.

---

## 4. Explicitly Rejected Patterns

- **Rejected from Direction C (Living Odisha)**:
  - Synthetic wax seal badges and decorative border scrollwork (violated Anti-Vibe-Code rules and accessibility contrast).
  - Staggered entry cascades and heavy parallax scroll headers (caused frame stutter on Helio P65).
  - Decorative serif fonts for body text (caused clipping of Odia conjunct ligatures).
- **General Rejections**:
  - Purple/cyan AI magic gradients, commercial star ratings, fake checkout buttons, and simulated live GPS bus animations.

---

## 5. Architectural Specification & Design Tokens

### 5.1 Palette & Surface Roles (Dark Atlas Default)
- `colorScheme.background`: `#10141B` (Deep Basalt Canvas)
- `colorScheme.surface`: `#161B22` (Card / Sheet Surface)
- `colorScheme.surfaceVariant`: `#21262D` (Elevated Filter Chips & Badges)
- `colorScheme.outlineVariant`: `#30363D` (Hairline Stone Border, 1dp)
- `colorScheme.onSurface`: `#F0F6FC` (Primary High-Contrast Ink)
- `colorScheme.onSurfaceVariant`: `#8B949E` (Secondary Captions & Metadata)
- `colorScheme.primary`: `#D4A373` (Sandstone Ochre Accent)
- `colorScheme.secondary`: `#38BDF8` (Chilika Sky Blue / Transit Accent)
- `colorScheme.tertiary`: `#34D399` (Similipal Forest Green / Verified Accent)

### 5.2 Shape & Geometry
- **Card Containers**: Rounded corners $16\text{ dp}$ (`shapeMedium`).
- **Filter Chips**: Pill shape $8\text{ dp}$ radius (`shapeSmall`).
- **Bottom Preview Sheets**: Top corners $28\text{ dp}$ (`shapeExtraLarge`).
- **Interactive Touch Targets**: Minimum $48\times 48\text{ dp}$ bounding box throughout.

### 5.3 Motion & Transitions
- **Tab Switching**: Shared Axis $X$ ($180\text{ ms}$, fade-through).
- **Card to Detail**: Container Transform ($280\text{ ms}$, standard decelerate).
- **Back Gesture**: Predictive Back scaling ($0.92\times$ scale + parent reveal).

---

## 6. Known Risks & Implementation Mitigations

1. **Risk**: Google Maps Compose overlaying M3 bottom sheets could cause touch dispatch race conditions.
   - *Mitigation*: Anchor sheets using official Compose `BottomSheetScaffold` or standalone `ModalBottomSheet` with explicit layout bounds.
2. **Risk**: Odia script vertical height variations causing line clipping in tight cards.
   - *Mitigation*: Enforce a minimum line-height multiplier of $1.4\times$ across all title and body text styles in the Compose typography system.
