# O-TRAVELZ Mobile V2 Design System

> A native Jetpack Compose design system tailored for authentic Odisha cultural travel, high-density mobile ergonomics, and Material 3 compliance.

---

## 1. Design Principles

1. **Cultural Authenticity**: Inspired by Odisha's natural and artistic heritage — Terracotta pottery, Pattachitra earth tones, Konark sandstone, Chilika lagoon azure, and Sal tree emerald.
2. **Contextual Dynamism**: Screens react to physical environment (time of day, live weather, real GPS proximity, scheduled transit windows).
3. **High-Information Density & Scannability**: Avoid sprawling empty spaces; use purposeful 4dp/8dp spacing, clear typography contrast, and informative badge metadata.
4. **Motion Continuity**: Subtle spring physics, elevation shifts on press, smooth bottom sheet transitions, and reduced-motion fallbacks.
5. **Strict Truthfulness**: Verified badges, scheduled transit indicators, estimated distance tags, and honest null states.

---

## 2. Color System (`core/design/Color.kt`)

### Primary Palette (Odisha Cultural Accents)
- **OchrePrimary (`#E5A93C`)**: Core brand ochre / gold temple crest.
- **OchreLight (`#F3C66A`)**: Secondary highlights, badges, and focus rings.
- **OchreDark (`#B57D1E`)**: Pressed states, active border strokes.
- **TerracottaRed (`#C84B31`)**: Pattachitra red, urgent alerts, heritage badges.
- **ChilikaAzure (`#2D82B7`)**: Water bodies, coastal circuits, transit highlights.
- **SalForestEmerald (`#2E7D32`)**: Nature reserves, ecotourism, open/verified indicators.
- **SandstoneMuted (`#D2B48C`)**: Subtle borders, secondary icons, inactive chips.

### Surface & Neutral Hierarchy (Dark Mode First)
- **DarkBackground (`#0A0D12`)**: Deep black-slate canvas.
- **DarkSurface (`#121820`)**: Level 1 surface for cards, bottom bar, and top bar.
- **DarkSurfaceVariant (`#1A222D`)**: Level 2 surface for nested cards, search bars, chips.
- **DarkSurfaceElevated (`#242F3E`)**: Level 3 surface for dialogs, bottom sheets, snackbars.
- **DarkBorder (`#2B3747`)**: 1dp structural divider and card outline.
- **DarkBorderLight (`#3E4E63`)**: Active input outline and selected chip stroke.

### Text & Icon Tokens
- **TextPrimary (`#F4F6F8`)**: 100% white-silver for high-contrast headlines and titles.
- **TextSecondary (`#A4B3C6`)**: 70% slate-gray for subtitles, body text, and helper labels.
- **TextMuted (`#67778C`)**: 45% muted gray for metadata, timestamps, and captions.
- **TextOchre (`#F3C66A`)**: Brand highlight text.

### Semantic Status Tokens
- **StatusSuccess (`#4CAF50`)**: Verified data, active GPS, completed stop.
- **StatusWarning (`#FF9800`)**: Scheduled timetable (non-live), weather advisory.
- **StatusError (`#F44336`)**: Connectivity loss, missing location, 404.
- **StatusInfo (`#2196F3`)**: Transit routes, walking guidance, distance tags.

---

## 3. Typography Scale (`core/design/Typography.kt`)

Using clean, highly-legible system typography with balanced tracking and line-heights:

| Style | Font Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `displayLarge` | 32.sp | Bold | 40.sp | -0.5.sp | Hero greetings, landmark names |
| `displayMedium` | 26.sp | SemiBold | 32.sp | -0.25.sp | Section titles, circuit names |
| `titleLarge` | 20.sp | SemiBold | 26.sp | 0.sp | Card titles, modal headers |
| `titleMedium` | 16.sp | Medium | 22.sp | 0.15.sp | Subheaders, filter group names |
| `titleSmall` | 14.sp | Medium | 20.sp | 0.1.sp | Card secondary headers |
| `bodyLarge` | 16.sp | Normal | 24.sp | 0.25.sp | Place descriptions, story text |
| `bodyMedium` | 14.sp | Normal | 20.sp | 0.2.sp | Standard body copy, reviews |
| `bodySmall` | 12.sp | Normal | 16.sp | 0.4.sp | Helper text, secondary specs |
| `labelLarge` | 14.sp | SemiBold | 20.sp | 0.1.sp | Button text, interactive tabs |
| `labelMedium` | 12.sp | Medium | 16.sp | 0.3.sp | Filter chips, metadata tags |
| `labelSmall` | 10.sp | Bold | 14.sp | 0.5.sp | Badges, verification pills |

---

## 4. Spacing & Shape Rhythm

### Spacing Scale (`core/design/Spacing.kt`)
- `xxs`: 2.dp
- `xs`: 4.dp
- `sm`: 8.dp
- `md`: 16.dp
- `lg`: 24.dp
- `xl`: 32.dp
- `xxl`: 48.dp

### Shape Scale (`core/design/Shape.kt`)
- `small`: 6.dp (Chips, small badges, inline icons)
- `medium`: 12.dp (Standard cards, text inputs, buttons)
- `large`: 20.dp (Hero banners, dialogs, map floating panels)
- `full`: 999.dp (Pill chips, circular icon buttons, floating action buttons)

---

## 5. Motion & Transitions (`core/design/Motion.kt`)

- **Spring Spec**: `spring(dampingRatio = Spring.DampingRatioLowBouncy, stiffness = Spring.StiffnessMediumLow)`
- **Standard Transition Duration**: 250ms (cross-fade, expansion)
- **Elevation Physics**: 0dp resting $\rightarrow$ 4dp pressed on interactive cards.

---

## 6. Core Component Library (`core/design/Components.kt` & `core/ui/`)

1. **`OTButton`**: Primary (Ochre gradient), Secondary (Surface outline), Text/Ghost, Danger with loading indicator state.
2. **`DestinationCardV2`**: Image with subtle gradient overlay, Category tag, Verified checkmark badge, Rating pill, Distance badge (when GPS active), Save bookmark button.
3. **`AmbientWeatherBanner`**: Dynamic contextual banner displaying live Open-Meteo temp, weather condition icon, sunrise/sunset window, and outdoor recommendation.
4. **`ContextChipV2`**: Filter chips with selection animation, optional icon prefix, and count badge.
5. **`TruthBadge`**: Semantic pills with standard truth labels (`VERIFIED`, `SCHEDULED`, `ESTIMATED`, `LIVE`, `FALLBACK`).
6. **`EmptyStateV2` / `ErrorStateV2`**: Clean illustration container with actionable retry and offline mode prompt.
7. **`FilterBottomSheet`**: Modal sheet for multi-parameter destination filtering (District, Category, Transit Accessible, Price Tier).
