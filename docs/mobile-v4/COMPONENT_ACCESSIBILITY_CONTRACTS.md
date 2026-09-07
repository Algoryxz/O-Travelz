# O-TRAVELZ Mobile V4 — Component Accessibility Contracts Specification

> **Authoritative Specification for Dual-Native Accessibility Semantics and Screen Readers**<br>
> Scope: **TalkBack (Android) & VoiceOver (iOS) Semantics, Focus Ordering, Dynamic Text, and Color Independence**<br>
> Governance: **Explicit Accessibility Architecture; Zero Premature Runtime Verification Claims**<br>
> Wave: `M3` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Architectural Philosophy: Inherent Accessibility

In O-TRAVELZ Mobile V4, accessibility is not a post-hoc compliance audit; it is an inherent property of component architecture:
- **Zero generic unlabelled containers**: Every actionable surface, card, and chip has an explicit accessible name, role, and action.
- **Color independence**: Status meaning (verified, scheduled, candidate, warning) is never conveyed by color alone. Every badge, pin, and alert includes an explicit vector glyph and text label.
- **Linear map alternative**: Screen reader users are never locked into an inaccessible 2D canvas; every map surface provides a direct linear list alternative.
- **Dynamic Type & Font Scale tolerance**: All layouts accommodate up to 2.0x font scaling (Android) and `AX5` accessibility sizing (iOS) without text truncation or clipping of critical travel data.

---

## 2. Component Family Accessibility Contracts

### 2.1 Navigation Components
- **accessible name**: Localized destination title (e.g., "Discover", "Map", "Trips", "You").
- **role**: `Role.Tab` (Android) / `.accessibilityAddTraits(.isSelected)` (iOS).
- **value**: "Selected" or "Not selected".
- **hint**: "Double tap to switch to this tab".
- **state announcement**: Announces "[Title], tab, [Index] of [Total], selected" on activation.
- **focus grouping**: Tabs are grouped into a single linear navigation container.
- **reading order**: Traversed in left-to-right natural tab order before screen content.
- **actions**: Single activation action ("Select").
- **dynamic text behavior**: Labels remain legible; if text scaling exceeds threshold, system hides text and exposes via long-press accessibility tooltip.
- **color-independent status meaning**: Active tab indicated by filled sandstone icon + pill container, not just color tint.

---

### 2.2 Destination Card (`AtlasPlaceCard` / `EditorialPlaceCard`)
- **accessible name**: "[Monument Name], [District Name]". Odia vernacular name included if Odia voice locale active.
- **role**: `Role.Button` / `Button`.
- **value**: Verification confidence tier (e.g., "Verified Official").
- **hint**: "Double tap to view visiting hours, photos, and location".
- **state announcement**: "Bookmarked" announced if destination is saved.
- **focus grouping**: Image, title, district tag, and truth badge are merged into a single focus group (`Modifier.semantics(mergeDescendants = true)` / `.accessibilityElement(children: .combine)`).
- **reading order**: Monument Name $\rightarrow$ District $\rightarrow$ Verification Tier $\rightarrow$ Actions.
- **actions**:
  - Default action: "Open details".
  - Custom action: "Save to My Trips".
  - Custom action: "View on Map".
- **dynamic text behavior**: Title expands vertically up to 3 lines; tags wrap to secondary row.
- **color-independent status meaning**: Verified status shown with checkmark seal glyph in addition to green container.

---

### 2.3 TruthBadge (`AndroidTruthBadge` / `IOSTruthBadge`)
- **accessible name**:
  - `VERIFIED`: "Verification status: Official government survey confirmed."
  - `SCHEDULED`: "Timetable status: Scheduled departure time. Non-live."
  - `LIVE`: "Telemetry status: Live weather data from Open-Meteo."
  - `ESTIMATED`: "Distance status: Straight-line spherical estimate."
  - `CANDIDATE`: "Transit stop status: Candidate stop awaiting physical survey."
  - `UNAVAILABLE`: "Data status: Currently unavailable."
- **role**: Status / Badge.
- **hint**: "Double tap to view full verification methodology and sources".
- **focus grouping**: Standalone focusable element or merged into parent card.
- **color-independent status meaning**: Unique iconography per state (Shield checkmark, Clock, Sun/Cloud, Wave, Dashed circle, Warning triangle).

---

### 2.4 Transit Route & Stop Timeline (`RouteSummaryRow` / `StopTimelineRow`)
- **accessible name**: "Stop: [Stop Name]. Next scheduled departure: [Time] IST."
- **role**: `Role.ListItem` / `ListItem`.
- **value**: Survey tier (e.g., "Official Stop" vs "Candidate Stop").
- **hint**: "Double tap to view all routes serving this stop".
- **state announcement**: Candidate stops announce: "Notice: GPS coordinates unconfirmed by field inspection."
- **focus grouping**: Stop node, name, timetable time, and warning icon merged into one linear item.
- **reading order**: Sequential stop order along transit corridor (Stop 1 $\rightarrow$ Stop 2 $\rightarrow$ Stop N).
- **actions**: "View Stop Details", "Set Departure Alarm".
- **dynamic text behavior**: Departure time pill reflows beneath stop name under large accessibility text sizes.
- **color-independent status meaning**: Candidate stops use dashed borders and warning glyphs; verified stops use solid nodes and bus glyphs.

---

### 2.5 First-Mile Guidance (`FirstMileChip` / `FirstMileLabel`)
- **accessible name**: "First-mile walking guidance: [Distance] meters, [Band Description] (e.g., Walkable, approximately 4 minutes)."
- **role**: Button.
- **hint**: "Double tap to open walking navigation in Maps".
- **color-independent status meaning**: Walking figure glyph accompanies all distance readouts.

---

### 2.6 Active Milestone Card (`ActiveMilestoneCard`)
- **accessible name**: "Current active stop: [Destination Name]. Scheduled for [Time Window]."
- **role**: Container with prominent Action Buttons.
- **hint**: "Double tap 'Arrived' when you reach this destination".
- **state announcement**: On tap 'Arrived': "Milestone completed. Advancing to next stop: [Next Destination]."
- **reading order**: Current Milestone Name $\rightarrow$ Cultural Guidance $\rightarrow$ Arrived Action Button $\rightarrow$ Skip Button.
- **actions**: Primary: "Mark Arrived"; Secondary: "Skip Milestone".
- **dynamic text behavior**: Action buttons stack vertically under accessibility text sizes (`AX1`–`AX5`) to maintain 48dp / 44pt minimum touch areas.

---

### 2.7 Interactive Map & Linear List Alternative
- **screen reader challenge**: Spatial 2D vector maps are non-linear and difficult for TalkBack/VoiceOver users to explore effectively.
- **linear map alternative contract**:
  - Every map screen (`Map Root`, `Transit Route Detail`, `Selected Entity Sheet`) provides an immediate, prominent toggle button: **"View as List"**.
  - When active, the map is hidden or bypassed, and all visible map entities are presented as a sorted linear list (ordered by proximity to user or route sequence).
  - Each list item exposes name, category, distance, and direct action triggers.
- **pin accessibility semantics**: When navigating on the map canvas, pins announce: "Map pin: [Place Name], [Category], [Distance] meters away. Double tap to select."

---

## 3. Accessibility Verification Obligation

- **Design Review Status**: `CONCEPTUALLY_FEASIBLE_AND_SPECIFIED` (All semantic names, roles, focus groups, and alternatives defined).
- **Execution Rule**: Physical device TalkBack and VoiceOver verification belongs strictly to implementation and QA waves (`M21`, `M25`). No claims of "Automated Runtime Verified" are permitted until native binaries run on physical test hardware.
