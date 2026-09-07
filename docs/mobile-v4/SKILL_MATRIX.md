# O-TRAVELZ Mobile V4 — Agent Skill Matrix & Governance

> **Authoritative Agent Tooling & Governance Specification**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Skill Governance Matrix

| Skill Name | Source & Scope | Platform | Target Waves | Governance Status | Mandatory Constraints |
|---|---|---|---|---|---|
| **ponytail** | Local Plugin | Cross-Platform | All Waves | `MANDATORY` | Channel senior dev minimalism; standard library before custom dependencies; one line before fifty. |
| **ponytail-review** | Local Plugin | Cross-Platform | M5–M30 | `MANDATORY` | Audit all code diffs for over-engineering and dead abstractions. |
| **graphify** | Local Config | Cross-Platform | All Waves | `MANDATORY` | AST-only knowledge graph updates after modifying code. |
| **ui-ux-pro-max** | `.agents/skills` | Cross-Platform | M0.5–M4 | `MANDATORY` | Design intelligence, accessibility, layout spacing, color palettes. |
| **frontend-design** | `.agents/skills` | Cross-Platform | M0.5–M4 | `MANDATORY` | Editorial direction, typography, anti-template layouts. |
| **design-system** | `.agents/skills` | Cross-Platform | M0.5–M4 | `MANDATORY` | 3-tier semantic tokens (primitive -> semantic -> component). |
| **brand** | `.agents/skills` | Cross-Platform | M0.5–M4 | `MANDATORY` | Cultural authenticity, tone of voice, Odishan heritage assets. |
| **Figma MCP** | Remote Server | Cross-Platform | M0.5–M4 | `MANDATORY` | Source-of-truth design tokens, variables, component specs, Auto Layout. |
| **Stitch MCP** | Local Schemas | Cross-Platform | M2 | `MANDATORY` | Conceptual exploration of 2–3 alternatives. Output NEVER committed to production code. |
| **swiftui-patterns** | `swift-ios-skills` | iOS Native | M1–M30 | `MANDATORY` | Modern MV + @Observable, view decomposition, isolated previews. |
| **swiftui-layout-components** | `swift-ios-skills` | iOS Native | M7–M15 | `MANDATORY` | Stacks, LazyVGrid, List sections, ScrollPosition. |
| **swiftui-navigation** | `swift-ios-skills` | iOS Native | M7–M15 | `MANDATORY` | NavigationStack, NavigationSplitView for iPad. |
| **swiftui-liquid-glass** | `swift-ios-skills` | iOS Native | M2–M10 | `MANDATORY` | Native Apple Liquid Glass strictly as progressive enhancement on supported hardware; baseline is standard high-contrast system materials on iOS 17. |
| **mapkit** | `swift-ios-skills` | iOS Native | M11–M12 | `MANDATORY` | Apple MapKit (`SwiftUI.Map`), custom annotations, polylines. |
| **swift-concurrency** | `swift-ios-skills` | iOS Native | M5–M30 | `MANDATORY` | Swift 6 strict concurrency, Sendable types, actor isolation. |
| **swift-testing** | `swift-ios-skills` | iOS Native | M5–M30 | `MANDATORY` | Swift Testing @Test and @Suite assertions. |
| **android-adaptive** | `android/skills` | Android Native | M1–M25 | `MANDATORY` | Compose MediaQuery, Navigation3 scenes, phone/tablet layouts. |
| **android-edge-to-edge** | `android/skills` | Android Native | M5–M15 | `MANDATORY` | enableEdgeToEdge(), WindowInsets.safeDrawing, IME handling. |
| **android-navigation-3** | `android/skills` | Android Native | M7–M15 | `MANDATORY` | Jetpack Navigation 3, backstacks, list-detail scenes. |
| **android-styles** | `android/skills` | Android Native | M2–M7 | `MANDATORY` | Compose Styles API, Material 3 theming. |
| **android-testing-setup** | `android/skills` | Android Native | M5–M27 | `MANDATORY` | Compose UI tests, unit test runner. |
| **android-profiler** | `android/skills` | Android Native | M23–M27 | `MANDATORY` | Memory leaks, heap dumps, SQL queries, 60fps frame rate. |
| **android-intent-security** | `android/skills` | Android Native | M11, M24 | `MANDATORY` | Intent redirection prevention, safe Maps URL launching. |
| **ui-styling** | Local Skill | Web Only | NONE | `BANNED_ON_MOBILE` | Tailwind CSS is strictly prohibited from native Compose and SwiftUI. |
| **Canvas UI** | External | N/A | NONE | `REJECTED` | Gimmicky canvas animations banned by Anti-Vibe-Code rules. |
| **OpenMotion** | External | N/A | NONE | `REJECTED` | Non-standard motion library; use standard native animation APIs. |
