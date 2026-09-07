# O-TRAVELZ Mobile V4 — Design-to-Native Handoff Contract

> **Authoritative Engineering Handoff Specification for Later Implementation Waves**<br>
> Scope: **Mapping Figma Canonical Components to Native Android (Compose) & iOS (SwiftUI) Workflows**<br>
> Governance: **Zero Premature Code Generation; Strict Contract Schema for Implementation Waves**<br>
> Wave: `M3` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Architectural Handoff Pipeline

When native implementation waves begin (e.g., `M20` Scaffolding, `M21` Components, `M22` Core Screens), mobile engineers do not write ad-hoc UI or invent layout values. Every native component is built according to a strict **Handoff Contract Schema**.

This document defines the exact contract schema and provides binding examples for key components across Android and iOS.

---

## 2. Standard Handoff Contract Schema

Every canonical component implemented in native code must document and satisfy these 12 properties:

1. `semantic_id`: Canonical platform-agnostic ID defined in `SHARED_COMPONENT_SEMANTICS.md`.
2. `figma_component_id`: Canonical component node reference in the authoritative Figma file (`O-TRAVELZ Mobile V4`).
3. `platform`: `Android` or `iOS`.
4. `token_references`: Explicit references to shared tokens (`surface.card`, `space.4`, `radius.medium`).
5. `state_variants`: Supported domain variants (`VERIFIED`, `SCHEDULED`, `CANDIDATE`, `OFFLINE`).
6. `interaction_notes`: Tap, press, hover, drag, and dismiss behavioral specifics.
7. `accessibility_contract`: Accessible name, role, value, focus grouping, and reading order.
8. `motion_contract`: Transition choreographies, spring parameters, and Reduce Motion fallback.
9. `truth_contract`: Prohibited claims, mandatory source citations, and truth boundaries.
10. `provisional_values`: Layout constants flagged as provisional, to be verified on physical hardware.
11. `implementation_constraints`: Target framework APIs, slot structures, and forbidden dependencies.
12. `test_expectations`: Required unit, screenshot, or UI test assertions.

---

## 3. Representative Canonical Component Handoff Specifications

### 3.1 Android Canonical Example: `AtlasPlaceCard`
- **semantic_id**: `SEMANTIC_PLACE_SUMMARY`
- **figma_component_id**: `figma://O-TRAVELZ-Mobile-V4/11_Android_Components/AtlasPlaceCard`
- **platform**: `Android`
- **token_references**:
  - Background: `surface.card` (`colorScheme.surfaceContainer`, `#161B22`)
  - Border: `border.subtle` (`colorScheme.outlineVariant`, `#30363D`, 1dp)
  - Spacing: Margin `space.4` (16dp), Internal Padding `space.3` (12dp)
  - Radius: `radius.medium` (`shape.medium`, 16dp)
  - Typography: Title `type.cardTitle` (`typography.titleMedium`), District `typography.labelMedium`
- **state_variants**: `Resting`, `Pressed`, `Focused`, `Bookmarked`, `OfflineCached`.
- **interaction_notes**: Tap navigates to Place Detail; long-press opens contextual bottom sheet; 48x48dp touch hit target on bookmark toggle.
- **accessibility_contract**: TalkBack focus group combines image, title, and district; custom action "Save to Trip".
- **motion_contract**: Material 3 Container Transform (`Modifier.sharedBounds`) on expansion. Reduce Motion: 50ms opacity fade.
- **truth_contract**: Must display verified authentic photo. Verified seal badge present. No fake review stars.
- **provisional_values**: Card corner radius 16dp (provisional tuning); elevation 1dp tonal.
- **implementation_constraints**: Built with Jetpack Compose `ElevatedCard`; Coil `AsyncImage` with SubcomposeLayout.
- **test_expectations**: Roborazzi / Paparazzi screenshot test at 1.0x and 2.0x font scaling; TalkBack traversal test.

---

### 3.2 iOS Canonical Example: `EditorialPlaceCard`
- **semantic_id**: `SEMANTIC_PLACE_SUMMARY`
- **figma_component_id**: `figma://O-TRAVELZ-Mobile-V4/21_iOS_Components/EditorialPlaceCard`
- **platform**: `iOS`
- **token_references**:
  - Background: `surface.card` (`Color(uiColor: .secondarySystemGroupedBackground)`)
  - Border: `border.subtle` (`Color(uiColor: .separator)`, 0.5pt hairline)
  - Spacing: Margin `space.4` (16pt), Content gap `space.3` (12pt)
  - Radius: `radius.medium` (`RoundedRectangle(cornerRadius: 12, style: .continuous)`)
  - Typography: Title `type.cardTitle` (`Font.headline.weight(.semibold)` in New York / SF Pro)
- **state_variants**: `Resting`, `Highlighted`, `Favorited`, `OfflineCached`.
- **interaction_notes**: Tap triggers NavigationStack push; swipe trailing edge reveals quick-save action.
- **accessibility_contract**: VoiceOver combined element; Dynamic Type supports reflow up to `AX5`.
- **motion_contract**: Interactive spring (`response: 0.35s, dampingFraction: 0.82`) or `.navigationTransition(.zoom)`. Reduce Motion: instant cross-fade.
- **truth_contract**: Verified authentic photo mandatory. Truth badge pill embedded in header.
- **provisional_values**: Corner radius 12pt (provisional tuning); scrim gradient opacity 0.45.
- **implementation_constraints**: SwiftUI native view; `.clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))`; Liquid Glass gated behind `#available(iOS 26, *)`.
- **test_expectations**: Swift Testing snapshot tests across light and dark modes; Dynamic Type AX5 layout test.

---

### 3.3 Android Canonical Example: `AndroidTruthBadge`
- **semantic_id**: `SEMANTIC_TRUTH_BADGE`
- **figma_component_id**: `figma://O-TRAVELZ-Mobile-V4/11_Android_Components/AndroidTruthBadge`
- **platform**: `Android`
- **token_references**:
  - `truth.verified`: `#064E3B` container, `#6EE7B7` text/icon
  - `truth.scheduled`: `#451A03` container, `#FCD34D` text/icon
  - `truth.candidate`: `#422006` container, `#F59E0B` dashed outline
  - Padding: `space.1` (4dp vertical), `space.2` (8dp horizontal)
- **state_variants**: `VERIFIED`, `SCHEDULED`, `LIVE`, `ESTIMATED`, `CANDIDATE`, `UNAVAILABLE`.
- **interaction_notes**: Tap launches modal explanation sheet with data source citations.
- **accessibility_contract**: Announced as "[State]: [Explanation]". Focusable chip.
- **truth_contract**: Strictly prohibited from using "Live" on scheduled transit bus departures.
- **implementation_constraints**: Jetpack Compose `AssistChip` or custom `Surface` with `Icon` and `Text`.
- **test_expectations**: Unit test asserting correct state resolution from repository entity models.

---

### 3.4 iOS Canonical Example: `IOSTruthBadge`
- **semantic_id**: `SEMANTIC_TRUTH_BADGE`
- **figma_component_id**: `figma://O-TRAVELZ-Mobile-V4/21_iOS_Components/IOSTruthBadge`
- **platform**: `iOS`
- **token_references**:
  - `truth.verified`: `.tint(.green)`, SF Symbol `checkmark.seal.fill`
  - `truth.scheduled`: `.tint(.orange)`, SF Symbol `clock.fill`
  - `truth.candidate`: `.tint(.amber)`, SF Symbol `circle.dashed`
  - Shape: Capsule shape (`.clipShape(Capsule())`)
- **state_variants**: `Verified`, `Scheduled`, `Live`, `Estimated`, `Candidate`, `Unavailable`.
- **interaction_notes**: Tap presents `.sheet` with data confidence details.
- **accessibility_contract**: VoiceOver label: "Data confidence: [State]".
- **truth_contract**: No fake live bus tracking; fares null by default.
- **implementation_constraints**: SwiftUI `Label` with `.font(.caption.weight(.semibold))`.
- **test_expectations**: Snapshot tests for all 6 truth state capsules.

---

## 4. Implementation Readiness Protocol

Before coding any component in Wave `M21`:
1. Verify that the component's `semantic_id` exists in `SHARED_COMPONENT_SEMANTICS.md`.
2. Confirm tokens map directly to `SEMANTIC_DESIGN_TOKENS.md`.
3. Check `COMPONENT_STATE_VARIANTS.md` for all required domain states.
4. Verify that no Azure or unapproved third-party dependencies are imported.
5. Guarantee minimum interactive touch targets (48dp Android / 44pt iOS).
