# O-TRAVELZ Mobile V4 — Authoritative Design Workflow

> **Authoritative Pipeline Specification**  
> Scope: **From Product Intent to Verified Native Mobile Code**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. The Design-to-Code Pipeline

O-TRAVELZ Mobile V4 enforces a strict, multi-stage pipeline designed to ensure deep cultural grounding, uncompromising truth integrity, and platform-native excellence.

```
┌────────────────────────────────────────────────────────┐
│ 1. Product Problem Definition & Jobs-to-be-Done        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Canonical Product & Multidimensional Truth Model    │
│    (VerificationStatus, FreshnessStatus, Provenance)  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Platform Native Constraints & Capabilities          │
│    Android: Material 3, Navigation 3, Adaptive Layouts │
│    iOS: HIG, NavigationStack, Native SwiftUI Materials │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. Stitch Concept Exploration                          │
│    (2–3 architectural alternatives, mood & density)   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 5. Critical Editorial & Anti-Vibe-Code Review          │
│    (Rejection of generic templates, purple glows)      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 6. Selected Concept Approval                           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 7. Figma Reconstruction & Refinement                   │
│    (Auto Layout, semantic variables, tokens, variants) │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 8. Platform-Specific Design Systems                    │
│    Android M3 Components | iOS HIG SwiftUI Components  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 9. Interactive Clickable Prototypes & State Validation │
│    (Loading, Content, Error, Stale, Offline)           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 10. Formal Design Acceptance & Token Freeze            │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 11. Native Platform Implementation                     │
│     Android: Jetpack Compose | iOS: SwiftUI            │
└────────────────────────────────────────────────────────┘
```

---

## 2. Hard Prohibitions

1. **NEVER: Stitch → generated code → production.**  
   Stitch produces web/HTML conceptual artifacts. These artifacts are strictly mental models and visual references. Committing Stitch-generated HTML/TSX directly into mobile apps is strictly forbidden.
2. **NEVER: Figma screenshot → guessed implementation.**  
   Developers must never "eyeball" a Figma screenshot and write ad-hoc padding or colors. Implementation must bind directly to defined semantic tokens and Auto Layout spacing rules.
3. **NEVER: Unverified images or fake transit telemetry.**  
   No design may feature synthetic AI-generated photography or fake "Live Bus" tracking indicators.

---

## 3. Tool Responsibilities

| Tool | Core Responsibility | Non-Goals / Exclusions |
|---|---|---|
| **Stitch MCP** | Rapid exploration of 2–3 architectural layouts, mood alternatives, and spatial density. | Never produces production code; never commits to Git. |
| **Figma MCP** | Canonical design source of truth, 3-tier variables, Auto Layout component specs, and prototypes. | Never executes production business logic. |
| **Kotlin Multiplatform** | Deterministic domain math, first-mile heuristics, and provenance enums. | Zero UI components; zero networking; zero DB. |
| **Jetpack Compose** | Native Android UI rendering using Material 3 Expressive and Android Adaptive. | Never a superficial port of iOS SwiftUI. |
| **SwiftUI** | Native iOS UI rendering using HIG, Metal-accelerated MapKit, and system materials. | Never a superficial port of Android Compose. |
