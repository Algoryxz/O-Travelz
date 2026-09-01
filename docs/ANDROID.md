# Native Android Architecture — O-TRAVELZ

## 1. Overview
The O-TRAVELZ Android application is built with **Kotlin 2.0+** and **Jetpack Compose (Material 3)**. It connects to the production FastAPI backend to provide grounded itinerary planning, verified Odisha cultural destinations, scheduled Mo Bus / Ama Bus transit integration, and live weather context.

---

## 2. Technology Stack & Toolchain
- **Language**: Kotlin 2.0.20
- **UI Framework**: Jetpack Compose BOM 2024.09.02 (Material 3)
- **Navigation**: Jetpack Navigation Compose 2.8.1
- **Networking**: Retrofit 2.11.0 + OkHttp 4.12.0 + `kotlinx.serialization`
- **Image Loading**: Coil 2.7.0 (WebP / AsyncImage)
- **Location**: Android Location Services & DPDP Act compliant in-memory state machine
- **Notifications**: NotificationCompat & NotificationChannels (`otravelz_trip_alerts`, `otravelz_transit_guidance`)
- **Target SDK**: 34 (Android 14) / Min SDK: 26 (Android 8.0)

---

## 3. Package Structure
```
mobile/android/app/src/main/java/com/otravelz/android/
├── MainActivity.kt                # NavHost, BottomBar, Deep link routing
├── OTravelzApp.kt                 # Application class & channel initialization
├── core/
│   ├── design/                    # Theme.kt, Color.kt, Typography.kt, Components.kt
│   ├── network/                   # NetworkClient.kt, ApiConfig.kt, NetworkDiagnostic.kt
│   ├── location/                  # LocationManager.kt, GeolocationState.kt
│   └── notifications/             # NotificationHelper.kt
├── data/
│   ├── api/                       # ApiService.kt (Retrofit endpoints)
│   ├── model/                     # Models.kt (OpenAPI mirror DTOs)
│   └── repository/                # Places, Weather, Transit, Planner repositories
└── feature/
    ├── home/                      # HomeScreen.kt, HomeViewModel.kt
    ├── discover/                  # DiscoverScreen.kt
    ├── place/                     # PlaceDetailScreen.kt, PlaceDetailViewModel.kt
    ├── planner/                   # PlannerScreen.kt, PlannerViewModel.kt
    ├── transit/                   # TransitScreen.kt
    ├── map/                       # MapScreen.kt
    └── weather/                   # WeatherScreen.kt
```

---

## 4. Single Source of Truth & Contracts
Backend FastAPI schemas in `backend/app/schemas/` define canonical truth:
1. `python scripts/generate_openapi.py` outputs `shared/openapi/openapi.json`.
2. Kotlin DTOs in `data/model/Models.kt` mirror OpenAPI fields strictly.
3. No fabricated coordinates, routes, fares, or real-time GPS telemetry.
