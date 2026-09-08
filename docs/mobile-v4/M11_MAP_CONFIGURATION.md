# O-TRAVELZ Mobile V4 — M11 Map Configuration & Credentials Policy

> **Authoritative Security and Configuration Specification**  
> Wave: `M11` | Document Version: `1.0.0` | Last Updated: `2026-09-08`

---

## 1. Android Google Maps SDK Configuration

The Android native map experience uses Google Maps Compose backed by Google Play Services Maps SDK.

### 1.1 Secret Policy (Zero Committed Secrets)
- **NEVER** commit an active or restricted Google Maps API key to Git.
- The repository must build cleanly out-of-the-box in local development, CI/CD, and test suites even when no API key is provided.

### 1.2 Configuration Mechanics
The Android build system extracts the Google Maps API key through the following priority order:
1. `MAPS_API_KEY` defined in `mobile/local.properties`:
   ```properties
   MAPS_API_KEY=AIzaSy...your_key_here
   ```
2. Environment variable:
   ```bash
   export MAPS_API_KEY="AIzaSy...your_key_here"
   ```
3. Gradle project property (`-PmapsApiKey=...`)
4. Safe fallback default: `""` (Empty string)

In `mobile/android/build.gradle.kts`:
```kotlin
val mapsApiKey: String = project.findProperty("mapsApiKey") as? String
    ?: System.getenv("MAPS_API_KEY")
    ?: localProperties.getProperty("MAPS_API_KEY")
    ?: ""

android {
    defaultConfig {
        manifestPlaceholders["MAPS_API_KEY"] = mapsApiKey
        buildConfigField("String", "MAPS_API_KEY", "\"$mapsApiKey\"")
    }
}
```

In `mobile/android/src/main/AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="${MAPS_API_KEY}" />
```

### 1.3 Graceful Degradation on Missing Key
If `MAPS_API_KEY` is empty, unconfigured, or rejected by Google Play Services:
- The app **does NOT crash**.
- Unit tests and headless lint checks pass without external dependencies.
- Map UI detects absent/invalid provider capability and renders a calm, truthful state card:
  *"Native Map Provider Unavailable — Configure MAPS_API_KEY in local.properties for interactive vector tiles."*
- Full list exploration and spatial search remain completely usable.

### 1.4 Provider Pricing & Quotas
- Google Maps SDK for Android is classified as `SUBJECT_TO_PROVIDER_PRICING`.
- Production deployments require a GCP Project with billing enabled and proper Android package / SHA-1 fingerprint restrictions.

---

## 2. iOS Apple MapKit Configuration

The iOS native map experience is built on Apple MapKit (`SwiftUI.Map`).

### 2.1 Zero External Dependencies
- iOS does not use Google Maps SDK, MapLibre, or any third-party binary pods/frameworks.
- No external API keys or server secrets are required.
- Native MapKit views are an entitlement of the Apple Developer platform.

### 2.2 Permissions
Foreground location requires `NSLocationWhenInUseUsageDescription` in `Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>O-TRAVELZ uses your location to show distance to cultural destinations and transit stops.</string>
```
No background location entitlements are permitted or declared.
