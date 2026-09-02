# O-TRAVELZ V4 — Mobile Feature Parity Matrix

> **Authoritative Technical Specification & Platform Parity Inventory**  
> Target Architecture: **Android (Jetpack Compose)** + **iOS (SwiftUI)** + **Shared Core (KMP)**  
> Document Version: `4.0.0` | Date: `2026-09-02`

---

## 1. Classification Taxonomy
* **`SHARED_CORE`**: Implemented in Kotlin Multiplatform (`mobile/shared/`).
* **`ANDROID_NATIVE`**: Platform-specific implementation in Kotlin + Jetpack Compose (`mobile/android/`).
* **`IOS_NATIVE`**: Platform-specific implementation in Swift + SwiftUI (`mobile/ios/`).
* **`API_DEPENDENT`**: Requires live backend HTTP/JSON communication (`backend/app/`).
* **`NOT_STARTED`**: Planned for future phase.

---

## 2. Parity Inventory

| Feature Domain | Specific Capability | Shared Core (KMP) | Android Native | iOS Native | Status (Android) | Status (iOS) |
|---|---|---|---|---|---|---|
| **1. Home** | Dynamic Time-of-Day Greeting (IST) | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Ambient Weather Card | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Hero Landmark Visual Priority | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Quick Action Dock | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Curated Heritage Circuits Carousel | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| **2. Explore** | 2-Column Grid vs Detailed List Toggle | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Category & District Filter Chips | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Verified Heritage Badge | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| **3. Search** | Instant Multi-token Search | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Search History & Recents | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| **4. Nearby** | Haversine Straight-line Distance | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Geolocation State Machine | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Master Canteen Datum Fallback | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | First-Mile Proximity Classifier | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| **5. Map** | Interactive Spatial Basemap | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| **6. Place Detail**| Multi-variant WebP Gallery | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Cultural Story & Essentials | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Bookmark Toggle | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| **7. Planner** | Visual Guided Planner (1-5 Days) | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Timeline Day & Stop Visualization | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| **8. Trips** | Offline Trip Viewer & Persistence | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| **9. Transit** | Canonical CRUT Network Browser | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Next Scheduled Departure (IST) | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| **10. Notifications**| Trip Reminders | - | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| **11. Community**| Staged Cultural Submission Form | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| **12. Localization**| Trilingual Key Invariants (EN, OR, HI)| `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| **13. Offline**| Bundled Places & Transit Schedules | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| **14. Auth** | Anonymous Guest Explorer Mode | `SHARED_CORE` | `ANDROID_NATIVE` | `IOS_NATIVE` | `NOT_STARTED` | `NOT_STARTED` |
| | Sign in with Apple | - | - | `IOS_NATIVE` | - | `NOT_STARTED` |
