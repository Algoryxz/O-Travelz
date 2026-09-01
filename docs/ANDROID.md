# Native Android Architecture & Demo Runbook — O-TRAVELZ

## 1. Overview
The O-TRAVELZ Android application is built with **Kotlin 2.0+** and **Jetpack Compose (Material 3)**. It connects to the production FastAPI backend to provide grounded itinerary planning, verified Odisha cultural destinations, scheduled Mo Bus / Ama Bus transit integration, and live Open-Meteo weather context.

---

## 2. Technology Stack & Toolchain
- **Language**: Kotlin 2.0.20
- **UI Framework**: Jetpack Compose BOM 2024.09.02 (Material 3)
- **Navigation**: Jetpack Navigation Compose 2.8.1
- **Networking**: Retrofit 2.11.0 + OkHttp 4.12.0 + `kotlinx.serialization`
- **Image Loading**: Coil 2.7.0 (WebP / AsyncImage)
- **Location**: Android Location Services with in-memory Reference Origin state machine
- **Notifications**: NotificationCompat & NotificationChannels (`otravelz_trip_alerts`, `otravelz_transit_guidance`, `otravelz_weather_alerts`)
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
    ├── discover/                  # DiscoverScreen.kt, DiscoverViewModel.kt
    ├── place/                     # PlaceDetailScreen.kt, PlaceDetailViewModel.kt
    ├── planner/                   # PlannerScreen.kt, PlannerViewModel.kt
    ├── transit/                   # TransitScreen.kt, TransitViewModel.kt
    ├── map/                       # MapScreen.kt (Spatial Discovery)
    └── weather/                   # WeatherScreen.kt
```

---

## 4. How to Build & Install

### Build Prerequisites
- **JDK**: Java 17 (e.g., Microsoft JDK 17)
- **Android SDK**: Build Tools 34.0.0, Platform 34
- **Environment**: Set `$env:JAVA_HOME` and add SDK platform-tools to `$env:PATH`

### Build Commands
```powershell
cd mobile/android
.\gradlew.bat clean assembleDebug test lintDebug
```

### Install to Connected Device / Emulator
```powershell
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.otravelz.android.debug/com.otravelz.android.MainActivity
```

---

## 5. Demo Flow Walkthrough
1. **Cold Launch**: App boots directly to `Home` with dynamic time-of-day greeting and live Bhubaneswar weather condition.
2. **Discover & Search**: Tap `Discover` tab to view verified Odisha destinations, type search queries, and filter by district.
3. **Place Details & Deep Links**: Tap any destination card or dispatch `otravelz://place?id=konark-sun-temple` to view cultural tags, pricing tier, and emergency contacts.
4. **Interactive Multi-Day Planner**: Tap `Planner`, configure duration (1-5 days), select origin hub, choose cultural interests (Temples, Heritage, Food), and tap **Generate Itinerary**.
5. **Timeline Itinerary**: Scroll through structured day themes, sequential stop checkpoints, planned arrival/departure times, and Mo Bus transport hops.
6. **Spatial Discovery & Privacy**: Tap `Map` to view straight-line proximity calculations with truthful in-memory reference origin when GPS is disabled.
7. **Trip Reminders & Notifications**: Tap the bell icon or save trip to trigger system tray notifications on dedicated channels.

---

## 6. Truthfulness & Known Limitations
- **Spatial Discovery vs Native Basemap**: Spatial discovery calculates deterministic straight-line distances and renders destination cards. Native interactive Google Maps SDK is deferred.
- **Media**: Fast, high-quality WebP hero images are rendered. Video streaming (Media3) is deferred.
- **Transit Telemetry**: Transit hops reflect scheduled Mo Bus timetable data; no live GPS bus tracking is synthesized.
- **Cloud Sync**: Trips and saved places are stored locally in-memory and SharedPreferences. Cloud sync (`/api/v1/sync/*`) requires authenticated session and is deferred post-demo.
- **Fares**: Transit fares are labeled as scheduled estimates or not published.
