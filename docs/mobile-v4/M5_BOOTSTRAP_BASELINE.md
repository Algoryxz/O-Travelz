# O-TRAVELZ Mobile V4 — M5 Bootstrap Baseline Specification

## 1. Executive Summary

Wave M5 establishes the dual-native project baseline for O-TRAVELZ Mobile V4 without premature feature implementation.

| Dimension | Android V4 | iOS V4 |
|---|---|---|
| **Directory** | mobile/android/ | mobile/ios/ |
| **Language & Toolchain** | Kotlin 2.0.21, JVM 17 | Swift 6.0, Swift Package / Xcode 15/16 |
| **UI Framework** | Jetpack Compose (BOM 2024.09.02) | SwiftUI (iOS 17.0+) |
| **Design System Foundation** | Material 3 (ndroidx.compose.material3) | Apple HIG Publication (ColorTokens, TypographyTokens) |
| **Navigation Shell** | 5-tab NavigationBar (Discover, Map, Plan, Trips, You) | 5-tab TabView (Discover, Map, Plan, Trips, You) |
| **Edge-to-Edge** | enableEdgeToEdge() active | System default full-screen safe-area insets |
| **Shared Core Integration** | Gradle project dependency :shared | Framework search path uild/bin/iosSimulatorArm64/ |
| **Test Verification** | 3 test suites, 6 assertions passed | Statically verified test target OTravelzTests |
| **Build Status** | BUILD SUCCESSFUL (debug APK: 9.8 MB) | Source accepted (NOT_EXECUTABLE_ON_CURRENT_HOST) |

---

## 2. Directory Anatomy

`
mobile/
├── android/
│   ├── build.gradle.kts          # AGP 8.6.0, compileSdk 35, minSdk 26, targetSdk 35
│   ├── proguard-rules.pro        # Clean R8 rules
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml
│       │   ├── kotlin/com/otravelz/android/
│       │   │   ├── OTravelzApplication.kt
│       │   │   ├── MainActivity.kt
│       │   │   ├── OTravelzApp.kt
│       │   │   ├── navigation/NavDestination.kt
│       │   │   └── ui/theme/
│       │   │       ├── Color.kt
│       │   │       ├── Theme.kt
│       │   │       ├── Type.kt
│       │   │       └── Spacing.kt
│       │   └── res/
│       │       ├── values/strings.xml
│       │       └── values-or/strings.xml
│       └── test/kotlin/com/otravelz/android/
│           ├── NavigationTest.kt
│           ├── SharedCoreIntegrationTest.kt
│           └── ThemeTest.kt
├── ios/
│   ├── OTravelz.xcodeproj/
│   │   └── project.pbxproj
│   ├── OTravelz/
│   │   ├── App/OTravelzApp.swift
│   │   ├── Navigation/
│   │   │   ├── TabDestination.swift
│   │   │   └── RootTabView.swift
│   │   ├── Features/BootstrapPlaceholderView.swift
│   │   ├── DesignSystem/
│   │   │   ├── ColorTokens.swift
│   │   │   ├── TypographyTokens.swift
│   │   │   └── SpacingTokens.swift
│   │   ├── Resources/
│   │   │   ├── en.lproj/Localizable.strings
│   │   │   └── or.lproj/Localizable.strings
│   │   └── Supporting/Info.plist
│   └── OTravelzTests/
│       └── OTravelzTests.swift
└── shared/                        # Untouched canonical KMP core
`

---

## 3. Shared Core Boundary

:shared remains the single canonical source of truth for:
- Geographic bounding box evaluation (OdishaBounds)
- Great-circle distance calculations (HaversineDistance)
- Timetable evaluation and transit graph traversal
- Multilingual aliases and taxonomy

Both platforms consume :shared without any presentation or UI logic residing in the KMP module.

---

## 4. Zero Premature Implementation Audit

Wave M5 strictly audited the codebase to ensure:
1. No destination cards, carousels, or catalog queries implemented.
2. No MapKit, Google Maps, or MapLibre SDKs pulled into dependency trees.
3. No trip persistence, room DB, or SwiftData schemas created.
4. No fake transit GPS, fake reviews, or synthetic ratings added.
5. No Azure dependencies or deprecated endpoints introduced.

---

## 5. Next Wave: M6

Wave M6 will implement the native design system tokens, typography styles, and core atomic components in accordance with the frozen M4 design specifications.
