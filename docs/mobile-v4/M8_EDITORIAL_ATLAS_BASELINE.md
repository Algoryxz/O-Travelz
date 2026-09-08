# M8 — Editorial Cultural Atlas: Discover + Place Detail Production Vertical Slice

> Authoritative baseline documentation for O-TRAVELZ Mobile V4 Wave M8.
> Establishes the traveler-facing Discover root and Place Detail screens across Android and iOS.

---

## 1. Executive Summary

Wave M8 establishes the first traveler-facing vertical slice of O-TRAVELZ Mobile V4:
1. **Live Catalog Discover Root**: Direct integration with the canonical PostgreSQL database via the live backend API (`GET /places?limit=300`).
2. **Leisure Cultural Filtering**: Strict separation of leisure/heritage destinations from infrastructure; 25 non-leisure entities (13 hospitals, 12 transit hubs) are excluded from the default Discover browse catalog, leaving 179 eligible leisure places.
3. **Strict Media Identity & Photo Deduplication**: Multi-resolution responsive variants (`hero.webp`, `card.webp`, `thumbnail.webp`) sharing the same parent folder hash collapse into exactly 1 authentic photo. 70 places feature verified authentic photography; 109 places pending photo verification render dignified cultural sandstone typography cards rather than misleading generic stock photos (`NO VERIFIED IMAGE = NO PUBLIC DESTINATION`).
4. **Editorial Place Detail**: Complete destination inspection view rendering high-resolution hero imagery, authentic Odia script titles, cultural narrative, sourced practical traveler facts, live local weather, verified photo galleries, and catalog provenance.
5. **Calm Degradation & Zero Speculative Affordances**: Null practical fields are cleanly omitted (never fabricated); unverified opening hours and fake ratings are strictly excluded; volatile save/bookmark buttons are hidden until local persistence in Wave M14.

---

## 2. Platform Architecture

### 2.1 Android Architecture
- **Language & Runtime**: Kotlin 2.0.21, Jetpack Compose BOM 2024.09.02, AGP 8.6.0.
- **Components**:
  - `DiscoverRoot.kt`: Hosts the search bar, category chips, adaptive responsive grid (`GridCells.Adaptive(320.dp)`), and state machines.
  - `PlaceCard.kt`: Material 3 expressive destination card with image loading via `coil-compose`, verified badge, photo count badge, and Odia script title.
  - `PlaceDetailScreen.kt`: Editorial scrollable destination detail view with TopAppBar, back navigation, live weather card, practical information table, and provenance card.
  - `PlaceModels.kt`: Domain models (`DiscoverPlace`, `PlaceDetail`, `PlacePhoto`) and photo hash deduplication mappers.
- **Adaptive Chrome**: Seamlessly adjusts between compact phone bottom `NavigationBar` and tablet/foldable leading `NavigationRail`.

### 2.2 iOS Architecture
- **Language & Runtime**: Swift 6, SwiftUI (iOS 17+ baseline).
- **Components**:
  - `DiscoverRootView.swift`: Hosts native `.searchable` bar, category filter pills, adaptive grid (`GridItem.adaptive(300, 500)`), and navigation destinations.
  - `PlaceCardView.swift`: Apple HIG Publication System card with `AsyncImage`, verified seal badge, and `FallbackCulturalBanner` for places pending photo verification.
  - `PlaceDetailView.swift`: Editorial destination inspection sheet/push with hero media, Odia typography, live weather, practical rows, horizontal photo gallery, and data provenance.
  - `PlaceDomainModels.swift`: Domain models (`DiscoverPlace`, `PlaceDetail`, `PlacePhoto`) and `PlaceDomainMapper` hash deduplication.

---

## 3. Data & Truth Statistics

| Dimension | Count / Rule | Verification Status |
|---|---|---|
| **Database Total Places** | 204 places | VERIFIED via live API |
| **Excluded Non-Leisure Entities** | 25 places (13 hospitals, 12 transit hubs) | VERIFIED via category filter |
| **Discover Leisure Places** | 179 places | VERIFIED via catalog truth |
| **Verified Image Coverage** | 70 places | VERIFIED via database bootstrap |
| **Pending Photo Verification** | 109 places | VERIFIED (rendered as cultural cards) |
| **Photo Deduplication** | Folder hash match collapses variants to 1 photo | VERIFIED via unit tests |
| **Opening Hours** | Omitted when null | VERIFIED (zero fabricated hours) |
| **Save / Bookmark Button** | Hidden until Wave M14 | VERIFIED (zero fake affordance) |

---

## 4. Verification Evidence

- **Android Unit Tests**: `DiscoverPlaceModelTest` verifies photo deduplication, distinct asset preservation, leisure filtering, and null practical field handling.
- **iOS Unit Tests**: `DiscoverDomainTests` asserts variant collapse, distinct photo retention, non-leisure exclusion, and Odia script preservation.
- **Localization**: Full parity across English and Odia string catalogs (`mobile/android/src/main/res/values-or/strings.xml` and `mobile/ios/OTravelz/Resources/or.lproj/Localizable.strings`).
