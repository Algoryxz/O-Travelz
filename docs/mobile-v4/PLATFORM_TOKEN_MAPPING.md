# O-TRAVELZ Mobile V4 — Platform Token Mapping Specification

> **Authoritative Native Token Projection Specification**<br>
> Scope: **Mapping Shared Semantics to Android (Material 3) & iOS (SwiftUI HIG)**<br>
> Wave: `M2` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Projection Architecture

The shared semantic tokens defined in `SEMANTIC_DESIGN_TOKENS.md` project into native platform constructs without requiring identical naming conventions or rigid code wrappers. Each platform uses its native theme engine to express the design language authentically.

---

## 2. Color & Surface Projections

| Semantic Token | Android Compose (`MaterialTheme.colorScheme`) | iOS SwiftUI (`Color` / `Material`) |
|---|---|---|
| `surface.canvas` | `colorScheme.background` (`#10141B`) | `Color(uiColor: .systemBackground)` |
| `surface.card` | `colorScheme.surfaceContainer` (`#161B22`) | `Color(uiColor: .secondarySystemGroupedBackground)` |
| `surface.elevated` | `colorScheme.surfaceContainerHigh` (`#21262D`) | `Color(uiColor: .tertiarySystemGroupedBackground)` |
| `surface.overlay` | `colorScheme.scrim` (`rgba(0,0,0,0.65)`) | `.ultraThinMaterial` / `Color.black.opacity(0.65)` |
| `border.subtle` | `colorScheme.outlineVariant` (`#30363D`, 1dp) | `Color(uiColor: .separator)` (0.5pt hairline) |
| `border.prominent`| `colorScheme.outline` (`#D4A373`) | `Color("AccentSandstone")` |
| `text.primary` | `colorScheme.onSurface` (`#F0F6FC`) | `Color.primary` |
| `text.secondary` | `colorScheme.onSurfaceVariant` (`#8B949E`) | `Color.secondary` |
| `text.tertiary` | `colorScheme.onSurfaceVariant.copy(alpha = 0.7f)`| `Color.tertiary` |
| `accent.sandstone`| `colorScheme.primary` (`#D4A373`) | `Color("AccentSandstone")` |
| `accent.chilika` | `colorScheme.secondary` (`#38BDF8`) | `Color("AccentChilika")` |
| `accent.forest` | `colorScheme.tertiary` (`#34D399`) | `Color("AccentForest")` |
| `accent.terracotta`| `ExtendedColors.terracotta` (`#C86446`) | `Color("AccentTerracotta")` |

---

## 3. Truth State & Badge Projections

| Semantic Token | Android Jetpack Compose Representation | iOS SwiftUI Representation |
|---|---|---|
| `truth.verified` | `AssistChip(colors = AssistChipDefaults.assistChipColors(containerColor = Color(0xFF064E3B), labelColor = Color(0xFF6EE7B7)))` | `Label("Verified Official", systemImage: "checkmark.seal.fill").tint(.green)` |
| `truth.scheduled`| `AssistChip(colors = AssistChipDefaults.assistChipColors(containerColor = Color(0xFF451A03), labelColor = Color(0xFFFCD34D)))` | `Label("Scheduled", systemImage: "clock.fill").tint(.orange)` |
| `truth.live` | `AssistChip(colors = AssistChipDefaults.assistChipColors(containerColor = Color(0xFF082F49), labelColor = Color(0xFF7DD3FC)))` | `Label("Live", systemImage: "cloud.sun.fill").tint(.cyan)` |
| `truth.estimated`| `AssistChip(colors = AssistChipDefaults.assistChipColors(containerColor = Color(0xFF1E293B), labelColor = Color(0xFFCBD5E1)))` | `Label("Estimated", systemImage: "arrow.left.and.right").tint(.gray)` |
| `truth.candidate`| `SuggestionChip(border = BorderStroke(1.dp, Color(0xFFF59E0B), pathEffect = DashPathEffect))` | `Label("Candidate Stop", systemImage: "circle.dashed").tint(.amber)` |

---

## 4. Typography & Font Style Projections

| Semantic Token | Android Compose (`MaterialTheme.typography`) | iOS SwiftUI (`Font.TextStyle`) |
|---|---|---|
| `type.displayHero`| `typography.headlineLarge` (Serif/Odia, 32sp, bold) | `Font.largeTitle.bold()` (New York Serif) |
| `type.sectionTitle`| `typography.titleLarge` (22sp, medium) | `Font.title2.weight(.semibold)` (SF Pro) |
| `type.cardTitle` | `typography.titleMedium` (18sp, bold) | `Font.headline.weight(.semibold)` (SF Pro) |
| `type.editorialBody`| `typography.bodyLarge` (16sp, lineSpacing 24sp) | `Font.body` (SF Pro, relaxed line-height) |
| `type.metadataMono`| `typography.labelSmall` (12sp, FontFamily.Monospace) | `Font.caption1.monospacedDigit()` (SF Mono) |

---

## 5. Shape & Container Projections

| Semantic Token | Android Compose (`MaterialTheme.shapes`) | iOS SwiftUI (`ClipShape`) |
|---|---|---|
| `radius.small` | `shape.small` (`RoundedCornerShape(8.dp)`) | `.clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))` |
| `radius.medium` | `shape.medium` (`RoundedCornerShape(16.dp)`) | `.clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))` |
| `radius.large` | `shape.extraLarge` (`RoundedCornerShape(28.dp)`) | `.clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))` |
| `radius.full` | `shape.large` (`CircleShape`) | `.clipShape(Capsule())` |

---

## 6. Spacing & Touch Targets

| Semantic Token | Android Compose Value | iOS SwiftUI Value |
|---|---|---|
| `space.1` | `4.dp` | `4.0` |
| `space.2` | `8.dp` | `8.0` |
| `space.3` | `12.dp` | `12.0` |
| `space.4` | `16.dp` | `16.0` |
| `space.6` | `24.dp` | `24.0` |
| `touch.minTarget`| `Modifier.sizeIn(minWidth = 48.dp, minHeight = 48.dp)` | `.frame(minWidth: 44, minHeight: 44)` |

---

## 7. Motion & Transitions

| Semantic Interaction | Android Compose Motion API | iOS SwiftUI Animation API |
|---|---|---|
| `motion.tabSwitch` | `sharedAxisX(durationMillis = 180)` | Native `TabView` page transition |
| `motion.cardExpand`| `Modifier.sharedBounds()` (Container Transform) | `NavigationStack` push or `.matchedGeometryEffect` |
| `motion.sheetSnap` | `ModalBottomSheet` standard M3 easing | `.interactiveSpring(response: 0.35, dampingFraction: 0.82)` |
| `motion.hapticFeedback`| `LocalHapticFeedback.current.performHapticFeedback()` | `UIImpactFeedbackGenerator(style: .light)` |
| `motion.reducedFallback`| Instantaneous alpha crossfade (`50.ms`) | Instantaneous opacity transition (`.opacity`) |
