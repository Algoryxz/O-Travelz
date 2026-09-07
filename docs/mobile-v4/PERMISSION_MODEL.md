# O-TRAVELZ Mobile V4 — Permission Model & Progressive Disclosure

> **Authoritative Security & Privacy Specification**  
> Core Policy: **Contextual Progressive Disclosure (Zero Launch Interstitials)**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. The Progressive Disclosure Principle

O-TRAVELZ treats hardware device permissions as **sacred traveler trust boundaries**:
1. **Zero Launch Dialogs**: The application **never** triggers a system permission popup on first launch or during onboarding.
2. **Contextual Just-in-Time Prompts**: Permissions are requested **strictly** at the moment the user initiates a feature that genuinely requires hardware access.
3. **Pre-Permission Educational Sheets**: Before invoking the OS system prompt, the app presents an informative pre-permission card explaining *why* access is needed and what the user gains.
4. **Graceful Denied State**: If a user taps "Don't Allow", the feature degrades gracefully with zero blocking modals and zero persistent nagging banners.

---

## 2. Permission Matrix

| Hardware Permission | Trigger Point / User Action | Pre-Permission Rationale Provided | Graceful Fallback if Denied | Background Policy |
|---|---|---|---|---|
| **`LOCATION_WHILE_IN_USE`** | Tapping "Near Me" chip in Discover, tapping "Locate Me" on Map, or checking first-mile walking. | *"O-TRAVELZ uses your location to calculate walking distance to nearby monuments and bus stops."* | App switches to manual district selector (defaults to Capital Region). First-mile walking pills cleanly suppressed. | **STRICTLY PROHIBITED** from background location polling. |
| **`PRECISE_LOCATION`** | Participating in "Transit Check-In" or Stop Verification. | *"Precise GPS coordinates are required to confirm the physical location of this transit stop."* | If user provides approximate location, stop verification check-in is disabled. Normal app navigation remains 100% functional. | Foreground only. |
| **`CAMERA`** | User taps "Take Photo" in Community Contribution or Transit Check-In. | *"O-TRAVELZ uses your camera to document cultural places and verified bus stop signboards."* | User may pick an existing photo from gallery or submit text-only contribution. | Never accessed in background. |
| **`PHOTO_LIBRARY`** | User taps "Choose from Photos" in Community Contribution. | *"Select authentic photos of Odisha monuments or crafts from your photo library."* | Text-only contribution option remains active. | Read-only selection via system picker. |
| **`NOTIFICATIONS`** | User taps "Set Departure Reminder" on a transit schedule or active trip leg. | *"Receive a timely notification 15 minutes before your scheduled Mo Bus departure."* | In-app visual reminder displayed on Active Trip timeline instead. | Handled via local scheduled notifications (`UNUserNotificationCenter` / `AlarmManager`). |

---

## 3. Background Location: NOT APPROVED

> [!IMPORTANT]
> **BACKGROUND_LOCATION is STRICTLY FORBIDDEN in Mobile V4.**
> 
> O-TRAVELZ does not track user location in the background. All distance calculations, map centerings, and transit check-ins occur strictly in the foreground while the traveler actively uses the app.
