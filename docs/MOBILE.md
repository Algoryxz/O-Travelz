# Mobile App Architecture & Preconditions — O-TRAVELZ

## 1. Status

> **Status**: `NOT_INITIALIZED`  
> Mobile implementation has not begun. This document establishes the target architectural boundary and preconditions.

---

## 2. Target Technology Stack

* **Framework**: React Native + Expo (SDK 51+)
* **Language**: TypeScript 5.x (Strict mode)
* **Target Platforms**: Android (APK/AAB) & iOS
* **State Management**: Zustand / TanStack Query
* **Location & Geofencing**: `expo-location`
* **Secure Storage**: `expo-secure-store` (OAuth session tokens)
* **Maps**: `react-native-maps` / Mapbox GL (Native vector rendering, avoiding WebView-only architecture)

---

## 3. Reusable Modules from Web Frontend

The following core logic from `frontend/` is directly shareable:
1. **First-Mile Distance & Auto/Cab Classifier**:
   - $\le 800\text{ m}$ walking
   - $800–1500\text{ m}$ walk/short auto optional
   - $> 1500\text{ m}$ auto/cab recommended
2. **Offline Bundled Transit Data**:
   - `staticTransitStops.ts`, `staticTransitRoutes.ts`, `transitTimetables.ts`.
3. **Multilingual Text & Odia Aliases**:
   - Query parser and station name matcher.

---

## 4. Mobile-Specific Adaptations

| Web Feature | Mobile Implementation |
|---|---|
| **Map Rendering** | Leaflet DOM $\rightarrow$ `react-native-maps` |
| **Auth Session** | HttpOnly cookie / localStorage $\rightarrow$ `expo-secure-store` Bearer token exchange |
| **Audio Guide** | HTML5 `<audio>` $\rightarrow$ `expo-av` |
| **Camera / QR** | WebRTC $\rightarrow$ `expo-camera` |
| **Push Notifications** | Service Worker $\rightarrow$ Expo Push Notifications |

---

## 5. Pre-Initialization Checklist

Before initializing `mobile/`:
- [ ] Freeze web baseline tag (`web-stable-2026-09-01`).
- [ ] Establish OpenAPI TypeScript generation (`openapi.json` $\rightarrow$ shared types).
- [ ] Confirm Expo project configuration (`app.json`, bundle identifiers).
