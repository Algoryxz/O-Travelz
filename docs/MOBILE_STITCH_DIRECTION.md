# O-TRAVELZ Mobile V2 — Stitch Design Direction & Compose Translation Guide

> Architecture and UI translation framework integrating Stitch design exploration with native Jetpack Compose standards for the O-TRAVELZ Android app.

---

## 1. Operating Rules & Boundary Principles

1. **Design & Ergonomics Only**: Stitch concepts provide layout geometry, visual rhythm, typography scales, card compositions, and interaction patterns.
2. **Deterministic Data Strictness**: Never import fake API structures, artificial crowd levels, fabricated bus arrivals, or synthetic ratings. All values bind to verified backend repositories and OpenAPI schemas.
3. **Mobile-First Target Density**: Calibrated specifically for modern Android viewport widths (`360dp`, `393dp`, `411dp`) with primary physical validation on the `Vivo 1920` (`1080x2340`, 480dpi, Android 12, API 31).
4. **Preserve Working Architecture**: Existing Android ViewModels (`HomeViewModel`, `DiscoverViewModel`, `PlaceDetailViewModel`, `PlannerViewModel`), repository singletons, and SQLite/DataStore caches remain canonical.

---

## 2. Screen-by-Screen Stitch Concept Evaluation & Compose Specs

### A. Dynamic Home Screen
- **Selected Direction: Ambient Travel Cockpit**
  - *Hero Section*: High-impact photographic card with subtle dark gradient scrim, greeting localized to IST (`Shubha Sakala`, `Shubha Madhyahna`, `Shubha Sandhya`), and a direct shortcut to active trip alerts.
  - *Contextual Weather & Proximity Banner*: Ambient surface displaying live temperature (`°C`), weather condition text, and explicit provenance badge (`LIVE` vs `ESTIMATED`).
  - *Curated Circuits Strip*: Horizontal snapping cards showcasing classic day routes (e.g. *Ekamra Kshetra Heritage*, *Golden Triangle*, *Chilika Ecotourism Trail*) with scheduled transit tags.
  - *Featured Destinations Carousel*: High-density cards featuring category badges, verified checkmark badges, star ratings, and instant bookmark toggling.
  - *Quick Action Floating Dock*: Plan, Discover, Saved, and Transit action buttons with pressed-state haptic feedback.
- **Rejected Patterns**: Giant empty hero carousels with low contrast text, generic marketplace booking cards, and non-contextual static greetings.

---

### B. Discover & Search
- **Selected Direction: High-Density Search & Multi-Filter Hub**
  - *Search Surface*: Full-width outlined text field with instant clear action, leading search icon in `SunTempleGold`, and reactive 350ms debounce.
  - *Dual Category & District Chips*: Horizontally scrollable chips with animated background color transitions, active count badges, and multi-selection support.
  - *Grid / List Layout Toggle*: User toggle between immersive 2-column image grid and compact detailed vertical list with distance metrics.
  - *Verified Metadata Pill*: Prominent `VERIFIED` green tag indicating verified Odisha research records.
- **Rejected Patterns**: Cluttered dropdown menus, full-page reload on filter change, and missing empty/zero-result recovery states.

---

### C. Place Detail V2
- **Selected Direction: Cinematic Heritage Storytelling**
  - *Hero Photo*: 240dp height with aspect ratio crop, top app bar scrim, and quick bookmark & notification action buttons.
  - *Provenance Bar*: Rating score with review count, verified badge, and district pill.
  - *Cultural Story Section*: Rich typography for cultural history and architecture description.
  - *Practical Visit Matrix*: Visit duration (`avg_visit_minutes`), entry fee / price tier, contact & emergency phones, and address.
  - *First-Mile & Transit Module*: Scheduled Mo Bus / Ama Bus connectivity with walking distance guidance (`<= 800m` walk, `800-1500m` auto, `> 1500m` cab).
  - *Action Bar*: Floating or bottom-docked primary actions (Save, Share, Set Trip Reminder, Add to Plan).
- **Rejected Patterns**: Long unformatted walls of text, hidden action buttons below the fold, and non-functional fake booking forms.

---

### D. Planner V2 (Visual Builder + Conversational AI)
- **Selected Direction: Dual-Mode Deterministic Planner**
  - *Mode 1: Visual Guided Builder*: Days counter stepper (1–7 days), origin selector, interest chips (Temple, Heritage, Nature, Beaches, Waterfalls, Food), and public transit preference toggle.
  - *Mode 2: Conversational AI Planner*: Natural language prompt input with suggestions, streaming state, and grounded itinerary output.
  - *Timeline Presentation*: Day-by-day tabs, sequential stop cards with planned arrival/departure times, visit duration pills, and transport leg cards showing mode and data tier (`SCHEDULED`).
- **Rejected Patterns**: Non-deterministic AI hallucinated routes with impossible travel speeds or fabricated fares.

---

### E. Trips Hub
- **Selected Direction: Offline-First Itinerary Library**
  - *Active Trip Hero*: Highlighted active itinerary card showing next destination, current day progress, and transit reminders.
  - *Saved Trips List*: Compact cards displaying title, duration, origin, stop sequence, and transport details.
  - *Offline Ready Signal*: Explicit badge indicating cached offline availability.
  - *Trip Management*: Delete, share, and edit actions.

---

### F. Profile & Settings Hub
- **Selected Direction: Privacy-First Guest & Personalization Center**
  - *Profile Header*: Guest user avatar with local storage status and login CTA.
  - *Language Selection*: Immediate toggle between English and ଓଡ଼ିଆ (Odia).
  - *Notification Channels*: Granular switches for Trip Reminders, Weather Alerts, and Transit Guidance.
  - *DPDP Act 2023 Compliance*: Explicit explanation of local device processing and privacy guarantees.
  - *Community Contribution CTA*: "Recommend Your Hometown" entry point with staged submission modal.

---

### G. Community Staged Submission UX
- **Selected Direction: Transparent Staging Pipeline**
  - Explicit notification that submissions are staged for manual validation by the O-TRAVELZ research team before public indexing.
  - Input fields: Place name, Category, District, Description, Approximate Coordinates, Local Travel Tip.
  - Success message: *"Submitted for review by O-TRAVELZ team"* (Never *"Added to live catalog"*).

---

## 3. Physical Device Validation Loop

```
  +-------------------------------------------------------------+
  | 1. Capture physical phone screenshot via adb screencap      |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  | 2. Compare against Stitch layout & Compose design tokens    |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  | 3. Implement / refactor Jetpack Compose presentation        |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  | 4. Run gradle tests, assembleDebug, and lintDebug           |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  | 5. Stream install APK onto Vivo 1920 (154c8d32)             |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  | 6. Inspect runtime UI, cold launch, and touch responsiveness|
  +-------------------------------------------------------------+
```

---

## 4. Conflict Resolution Hierarchy

When design or implementation choices conflict, the order of authority is:

1. **Product Truth & Backend Data Models** (OpenAPI contracts, canonical SQLite schemas)
2. **Android Usability & Material 3 Touch Accessibility** (48dp minimum touch targets, WCAG AA contrast)
3. **Physical Phone Runtime Proof** (Vivo 1920 real hardware verification)
4. **O-TRAVELZ Design System Tokens** (`core/design/`)
5. **Stitch MCP Design Explorations**
