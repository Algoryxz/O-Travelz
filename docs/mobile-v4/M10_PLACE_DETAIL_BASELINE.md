# M10 — Place Detail Editorial Experience, Verified Media, Practical Truth & Live Weather

> Authoritative baseline documentation for O-TRAVELZ Mobile V4 Wave M10.
> Establishes the authoritative cultural atlas destination inspection experience across Android and iOS.

---

## 1. Executive Summary

Wave M10 fulfills the core promise of the Modern Odisha Cultural Atlas: making opening a destination feel like opening the definitive, authoritative O-TRAVELZ entry for that place.

Key achievements:
1. **Immediate Title Identity**: Immediate visibility of destination category, English name, and Odia script calligraphy at the very top of the screen before media, ensuring the traveler never loses orientation even during image loading, failure, or on small viewports.
2. **5-Tier Canonical Source-Photo Identity**: Strict deterministic deduplication priority (`media_asset_id` > `content_sha256` > `asset_hash` > canonical image record `id` > normalized source URL prefix). Guarantees that responsive rendering variants (`hero.webp`, `card.webp`, `thumbnail.webp`) collapse strictly into 1 distinct photograph.
3. **Publication Policy Reconciliation**: Decoupled destination publication from media publication. All 179 default cultural/leisure destinations are publicly browsable. 70 places with verified photography display the authentic hero image; 109 destinations pending photographic verification display an editorial cultural sandstone card with prominent Odia calligraphy. Zero stock photos, zero AI hallucinations, zero cross-destination photo borrowing.
4. **Photo Gallery Rules**: Gallery is rendered if and only if distinct verified photo count > 1. For single-photo destinations, the hero stands alone without redundant duplicates, fake carousels, or misleading arrows.
5. **Strict Capability Gating**: Since backend places endpoints expose zero video streams and zero 3D runtime models, video and 3D affordances evaluate strictly to `false` (`hasVideo = false`, `has3d = false`). Zero play buttons on still photos, zero fake durations, zero fake 3D/AR controls.
6. **Live Open-Meteo Weather Truth**: Current weather is requested on-demand only for places with valid coordinates (`GET /weather/current?lat={lat}&lon={lon}`). Temperature is displayed in exact °C with condition and advice. Missing temperature or network error yields a calm "Weather data currently unavailable" notice. Null temperature never defaults to 0°C or Sunny.
7. **Sourced Practical Facts**: Null fields are strictly omitted. Null price tier is never labeled "Free" (`null != Free`). Null opening hours never calculates "Open Now" or "Closed". Null accessibility is omitted without guessing wheelchair accessibility.
8. **System Maps Navigation Handoff**: When valid coordinates exist, a dedicated 48dp (Android) / 44pt (iOS) button launches the platform native maps intent (`geo:` on Android, `maps://` on iOS) with fallback to web maps. No Map SDK is embedded prematurely (Map SDK belongs to Wave M11).
9. **Zero Speculative Bloat (Ponytail)**: Voluntary rejection of premature gallery managers, media repositories, in-memory bookmarking hacks, and heavy modal zoom engines.
10. **Strict Change Boundaries**: Zero modifications to backend services, web clients, KMP shared core, or canonical transit data.

---

## 2. Information Hierarchy

The production Place Detail layout follows a deliberate editorial rhythm:
1. **Immediate Destination Identity**: Category tag, primary title (headline), authentic Odia script subtitle, and administrative district / travel region tag.
2. **Verified Hero Media / Cultural Card**: High-resolution `hero.webp` variant with required legal attribution and "Verified Place" badge; or dignified cultural sandstone typography card for places pending verification.
3. **Location Action**: External system navigation handoff ("Open in Maps") for destinations with coordinates.
4. **Cultural Heritage & Significance Narrative**: Attributed canonical background and significance narrative without promotional hyperbole or AI-generated filler.
5. **Live Local Weather**: Provider-backed current weather card with calm degradation when unavailable.
6. **Verified Photo Gallery**: Horizontal paging/scrolling gallery with distinct photo count and source attribution, active only when distinct verified photos > 1.
7. **Practical Traveler Facts**: Grid/table of verified practical facts (Address, Coordinates, Visit Duration, Price Tier, Public Contact, Emergency Phone). Every null field is omitted.
8. **Catalog & Data Provenance**: Data source attribution, verification timestamp, and official status. Internal database UUIDs and raw SHA-256 hashes are cleanly concealed from travelers.

---

## 3. Data & Truth Statistics

| Dimension | Count / Rule | Verification Status |
|---|---|---|
| **Total Places in DB** | 204 places | VERIFIED via backend audit |
| **Excluded Infrastructure Entities** | 25 places (13 hospitals, 12 transit hubs) | VERIFIED via category filter |
| **Public Leisure Destinations** | 179 places | VERIFIED via catalog truth |
| **Destinations with Verified Media** | 70 places (39.1%) | VERIFIED via place_images |
| **Destinations Pending Photo Verification** | 109 places (60.9%) | VERIFIED (cultural cards active) |
| **Source Photo Deduplication** | 5-tier priority collapses variants to 1 photo | VERIFIED via unit tests |
| **Single-Photo Destinations** | Rendered as hero only (no fake carousel) | VERIFIED via UI logic |
| **Multi-Photo Destinations** | Gallery rendered only when distinct count > 1 | VERIFIED via UI logic |
| **Video Stream Affordances** | 0 rendered (`hasVideo = false`) | VERIFIED capability gate |
| **3D Runtime Model Affordances** | 0 rendered (`has3d = false`) | VERIFIED capability gate |
| **Weather Request Budget** | Max 1 call per detail open, 0 polling | VERIFIED via network audit |
| **Weather Null Temperature** | Mapped to Unavailable, never 0°C | VERIFIED via test |
| **Price Tier Null Omission** | Null fee != Free | VERIFIED via test |
| **Opening Hours Null Omission** | Null hours != Closed | VERIFIED via test |
| **Accessibility Null Omission** | Unverified site data omitted | VERIFIED via test |
| **External Map Handoff** | Native intent (`geo:` / `maps://`) | VERIFIED (48dp / 44pt targets) |
| **Save / Bookmark Button** | Hidden until Wave M14 | VERIFIED (no fake disabled hearts) |

---

## 4. Platform Implementation Details

### 4.1 Android Implementation
- **Files**:
  - `mobile/android/src/main/kotlin/com/otravelz/android/data/network/dto/PlaceDtos.kt`
  - `mobile/android/src/main/kotlin/com/otravelz/android/domain/model/PlaceModels.kt`
  - `mobile/android/src/main/kotlin/com/otravelz/android/ui/screens/PlaceDetailScreen.kt`
  - `mobile/android/src/main/res/values/strings.xml`
  - `mobile/android/src/test/kotlin/com/otravelz/android/PlaceDetailModelTest.kt`
- **Architecture**:
  - Unidirectional data flow via `PlaceDetailUiState` (`Loading`, `Success`, `Error`).
  - TopAppBar with navigation back, destination title, and native share Intent (`ACTION_SEND`).
  - Coil `AsyncImage` for hero and gallery cards with explicit content descriptions and memory caching.
  - Accessibility: semantic headings `heading()`, content descriptions on photo cards, and 48dp touch targets.
- **Validation**:
  - `:android:testDebugUnitTest`: PASS (all unit tests passing).
  - `:android:assembleDebug`: PASS.
  - `:android:lintDebug`: PASS.

### 4.2 iOS Implementation
- **Files**:
  - `mobile/ios/OTravelz/Networking/DTO/PlacesDTOs.swift`
  - `mobile/ios/OTravelz/Features/PlaceDomainModels.swift`
  - `mobile/ios/OTravelz/Features/PlaceDetailView.swift`
  - `mobile/ios/OTravelz/Resources/en.lproj/Localizable.strings`
  - `mobile/ios/OTravelz/Resources/or.lproj/Localizable.strings`
  - `mobile/ios/OTravelzTests/PlaceDetailDomainTests.swift`
- **Architecture**:
  - SwiftUI with `ScrollView`, `VStack`, and native `AsyncImage`.
  - Header section positioned before hero to ensure immediate name and Odia script visibility.
  - Native `ShareLink` in navigation toolbar.
  - External navigation handoff via `maps://` URL scheme with Apple Maps web fallback.
  - Accessibility: Dynamic Type scaling, VoiceOver labels, and 44pt minimum touch targets.
- **Status**: SOURCE_VERIFIED / PENDING_MACOS runtime execution.

---

## 5. Historical Media Regressions Suite

The following 8 historical media failure modes remain permanently prevented:
1. **Responsive Variant Inflation**: Three responsive variants (`hero.webp`, `card.webp`, `thumbnail.webp`) evaluate strictly to `Photos(1)`.
2. **Cross-Destination Model Leakage**: Odisha State Museum or non-Konark places cannot receive Konark 3D assets.
3. **Fake Video Affordances**: Missing video streams cannot show play buttons, fake durations, or empty video tabs.
4. **Buried Title Identity**: Destination name is visible immediately upon screen open without scrolling.
5. **Cross-Destination Media Borrowing**: Place A cannot borrow or render photography from Place B.
6. **Unbounded Original Downloads**: Huge multi-megabyte Wikimedia or archive master originals are never requested in mobile feeds.
7. **Client-Side 3D Hallucination**: Frontend/mobile cannot hallucinate `has_3d = true` when backend is `false`.
8. **Synthetic Weather Defaults**: Null weather response cannot become 0°C or Sunny.

---

## 6. Known Data Quality Gaps & Future Enrichment
- **P1 Photographic Verification**: 109 cultural destinations currently require authentic field photographic verification.
- **P1 Odia Script Coverage**: 107 destinations require verified Odia orthographic titles in canonical database.
- **P2 Structured Opening Hours**: Official temple trust and ASI opening/closing schedules to be ingested in structured format.
- **P2 Physical Accessibility Audits**: Verified on-site audit of wheelchair ramps, accessible restrooms, and tactile paths.
- **P3 Multi-Photo Galleries**: Enrichment of multi-photo verified sets for top 20 heritage complexes.
