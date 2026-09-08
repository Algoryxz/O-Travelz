# O-TRAVELZ Mobile V4 — Persistence Privacy & Sensitivity Model

> **Authoritative Specification: Data Sensitivity, Platform Storage & OS Backup Policy**  
> Wave: `M14` | Status: `APPROVED_PRIVACY_SPEC` | Date: `2026-09-08`

---

## 1. Persisted Data Classification

| Entity | Sensitivity Tier | Data Types Stored | Prohibited Content |
|---|---|---|---|
| **`SavedPlace`** | `LOW_SENSITIVITY_USER_PREFERENCE` | Place ID, timestamp, display name, category, thumbnail URL | No GPS coordinates, no personal notes |
| **`SavedTrip`** | `PRIVATE_USER_TRAVEL_DATA` | Title, date range, constraints, stop sequence, schedule windows | No user identity tokens, no payment details |
| **`TripProgress`** | `PRIVATE_LOCAL_ACTIVITY_STATE` | Active trip ID, milestone index, visited stop IDs | **Zero raw GPS tracks**, zero location histories, zero dwell times |

---

## 2. Hard Anti-Tracking Rules

1. **No Background Location**: O-TRAVELZ does not request `ACCESS_BACKGROUND_LOCATION` (Android) or `Always Authorization` (iOS).
2. **No Location History**: The app never records breadcrumbs, user routes, or GPS coordinate trails.
3. **No AI Prompt Logging**: Freeform prompt strings used to configure trips are ephemeral and are not stored in the database.
4. **No Ad Tracking**: Zero analytics SDKs or advertising identifiers (IDFA / GAID) are tied to persisted travel plans.

---

## 3. Storage Security & OS Backup

1. **Sandbox Isolation**: SQLite databases and SwiftData stores are placed exclusively within application-sandboxed directories (`context.getDatabasePath()` on Android, `Application Support` on iOS), inaccessible to third-party apps.
2. **OS Backup Behavior**:
   - On iOS, user travel artifacts are included in encrypted iCloud/iTunes device backups by default.
   - On Android, `android:allowBackup="true"` allows private app data backup via Google Drive Auto Backup if the user enables device backup.
3. **Encryption at Rest**: Relies transparently on hardware-backed platform encryption (Android File-Based Encryption with credential-protected storage, iOS Data Protection Class `CompleteUntilFirstUserAuthentication`).
