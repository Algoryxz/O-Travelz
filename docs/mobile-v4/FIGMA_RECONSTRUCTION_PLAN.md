# O-TRAVELZ Mobile V4 — Figma Canonical Reconstruction Plan

> **Authoritative Handoff Specification for Figma Remote Canvas Architecture**<br>
> Scope: **Execution Plan for Automated / Manual Workspace Population**<br>
> Current State: **PREPARED / EXECUTION BLOCKED (Awaiting User Token Authentication)**<br>
> Wave: `M2` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Governance & Execution Gate

- **Figma Server Endpoint**: `https://mcp.figma.com/mcp` (Configured in MCP settings).
- **Authentication Status**: `WAITING_USER_AUTH` (Personal Access Token / OAuth required).
- **Read / Write Verification**: `UNVERIFIED`.
- **Execution Gate Rule**: Canonical frame and variable reconstruction in Figma is **STRICTLY BLOCKED** until authenticated MCP read/write is verified. This document serves as the complete, authoritative blueprint for the moment user credentials are provided.

---

## 2. Workspace Page & Section Architecture

```
O-TRAVELZ Mobile V4 (Workspace)
│
├── 00 — Product Foundations
│   ├── Document Covers & Version History
│   ├── Modern Odisha Cultural Atlas Design Principles
│   └── Multidimensional Truth Matrix Documentation
│
├── 01 — Shared Semantics (Variables & Tokens)
│   ├── Colors & Surfaces (Dark Atlas / Warm Sandstone)
│   ├── Spacing & Grid (4dp / 4pt Geometric Base)
│   ├── Corner Radius & Elevation Rules
│   └── Truth State Semantics
│
├── 10 — Android Foundations (Material 3 Expressive)
│   ├── 11 — Android Components (Badges, Buttons, Cards, Inputs, AppBars, NavBars)
│   ├── 12 — Android Patterns (Truth Callouts, FirstMile Engine Pills, Bottom Sheets)
│   ├── 13 — Android Screens (8 Core Evaluated Surfaces + Responsive Variants)
│   ├── 14 — Android Motion Specs (Predictive Back, Container Transform)
│   └── 15 — Android Clickable Prototypes
│
├── 20 — iOS Foundations (Apple HIG)
│   ├── 21 — iOS Components (Capsules, Grouped Cards, TabBars, Navigation Bars)
│   ├── 22 — iOS Patterns (Presentation Detents, Dynamic Type Reflow Containers)
│   ├── 23 — iOS Screens (8 Core Evaluated Surfaces + iPad Adaptations)
│   ├── 24 — iOS Motion Specs (Interactive Springs, Sheet Rubber-Banding)
│   └── 25 — iOS Clickable Prototypes
│
├── 90 — Stitch Concept Staging
│   └── Visual Explorations (Reference Only — Non-Production)
│
└── 99 — Archive
```

---

## 3. Variable Collections Strategy

Three distinct variable collections will be constructed in Figma:

### Collection 1: Primitive Values
- **Colors**:
  - `primitive/color/basalt-900`: `#10141B`
  - `primitive/color/basalt-800`: `#161B22`
  - `primitive/color/basalt-700`: `#21262D`
  - `primitive/color/sandstone-ochre`: `#D4A373`
  - `primitive/color/terracotta`: `#C86446`
  - `primitive/color/chilika-blue`: `#38BDF8`
  - `primitive/color/forest-green`: `#34D399`
  - `primitive/color/emerald-verified`: `#064E3B`
  - `primitive/color/amber-scheduled`: `#451A03`
- **Spacing**:
  - `primitive/space/1`: `4px`
  - `primitive/space/2`: `8px`
  - `primitive/space/3`: `12px`
  - `primitive/space/4`: `16px`
  - `primitive/space/6`: `24px`

### Collection 2: Semantic Tokens
- `semantic/surface/canvas` $\rightarrow$ linked to primitive basalt-900 / parchment
- `semantic/surface/card` $\rightarrow$ linked to primitive basalt-800 / white
- `semantic/text/primary` $\rightarrow$ linked to `#F0F6FC` / `#1C1917`
- `semantic/text/secondary` $\rightarrow$ linked to `#8B949E` / `#78716C`
- `semantic/accent/brand` $\rightarrow$ linked to sandstone-ochre

### Collection 3: Contextual Modes
- **Mode 1**: `Dark Atlas` (Default primary theme)
- **Mode 2**: `Warm Sandstone` (Editorial light theme)

---

## 4. Component Sets & State Variants

### 4.1 Truth Badge Component Set
Variants configured along three orthogonal axes:
1. `Platform`: `Android-M3` | `iOS-HIG`
2. `TruthState`: `VerifiedOfficial` | `ScheduledDeparture` | `LiveWeather` | `EstimatedDistance` | `CandidateStop` | `Unavailable`
3. `DisplaySize`: `Compact` | `Standard`

### 4.2 Destination Card Component Set
1. `Platform`: `Android-M3` | `iOS-HIG`
2. `Density`: `StandardEditorial` (16:9 photo) | `CompactRow` (List mode)
3. `State`: `Default` | `Pressed` | `OfflineCached` | `BookmarkSaved`

### 4.3 Transit Timeline Milestone Set
1. `MilestoneType`: `VerifiedStop` | `CandidateStop` | `LocalityArea`
2. `ProgressState`: `Visited` | `ActiveNext` | `Upcoming`
3. `WalkingBand`: `WalkReasonable` ($\le 800\text{m}$) | `ShortAuto` ($800\text{--}1500\text{m}$) | `CabRecommended` ($> 1500\text{m}$) | `None`

---

## 5. Prototype Flows & Journey Mapping

The Figma prototype will interconnect screens into 6 continuous Golden Journeys:
1. **Flow J1**: First-time onboarding $\rightarrow$ Discover feed $\rightarrow$ Place detail inspection $\rightarrow$ Bookmark toggle.
2. **Flow J3**: Constraint input $\rightarrow$ AI-assisted itinerary generation $\rightarrow$ Review verified transit legs $\rightarrow$ Save Trip.
3. **Flow J5**: 154-Route directory $\rightarrow$ Corridor filter $\rightarrow$ Stop timetable evaluation $\rightarrow$ Boarding confidence.
4. **Flow J6**: Active trip execution $\rightarrow$ Milestone advancement $\rightarrow$ Emergency telephony trigger.
5. **Flow J8**: Airplane mode simulation $\rightarrow$ Offline cached atlas browsing $\rightarrow$ Local storage management.
6. **Flow J12**: Location denied $\rightarrow$ Reference datum fallback $\rightarrow$ Manual spatial filtering.

---

## 6. Accessibility & Dev-Mode Annotations

Every master frame will include explicit Dev Mode annotations:
- Minimum touch bounding box overlays ($44\text{pt}$ / $48\text{dp}$).
- VoiceOver / TalkBack reading order numbered paths.
- Dynamic Type reflow constraints (HStack to VStack transition breakpoints).
- Odia Unicode glyph vertical bounding allowances.
