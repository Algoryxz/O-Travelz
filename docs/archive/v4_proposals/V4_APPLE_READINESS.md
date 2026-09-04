# O-TRAVELZ V4 — Apple Platform Readiness & Checklist

> **Technical Compliance, Platform Guidelines & App Store Submission Readiness**  
> Target Platform: **iOS 17.0+ (Swift 5.9+ / SwiftUI)**  
> Document Version: `4.0.0` | Date: `2026-09-02`

---

## 1. Technical Baseline

* **Minimum iOS Target**: **iOS 17.0+**
* **Deployment Target**: iPhone (iOS 17.0+), iPad (iPadOS 17.0+)
* **SwiftUI Paradigm**: Native `@Observable` models, `SwiftData` local storage, `NavigationStack`, and native `SwiftUI.Map` (MapKit).

---

## 2. Location & Privacy Policies

* **Usage Key**: `NSLocationWhenInUseUsageDescription`
* **Description**: *"O-TRAVELZ uses your location while using the app to calculate straight-line distances to Odisha destinations and nearby Mo Bus stops. Coordinates are held in memory and are never stored on disk or shared."*
* **Background Location**: Strictly disabled. Zero background location modes declared.
* **Datum Fallback**: In non-GPS states, distances default to Bhubaneswar Master Canteen ($20.2961^\circ\text{N}, 85.8245^\circ\text{E}$) with honest `straight-line ref` labels.

---

## 3. App Store Readiness Checklist

- [ ] Privacy manifest (`PrivacyInfo.xcprivacy`) generated from discovered Required Reason APIs in compiled build.
- [ ] Sign in with Apple implemented alongside any third-party auth (Guideline 4.8); guest mode fully usable with 0 login.
- [ ] Location requested strictly When In Use.
- [ ] Zero claims of live bus tracking without genuine real-time telemetry.
- [ ] Dynamic Type supported across all primary text views.
- [ ] Release build strips localhost ATS exceptions.
