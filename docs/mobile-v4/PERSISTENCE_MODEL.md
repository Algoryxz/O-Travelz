# O-TRAVELZ Mobile V4 — Persistence Domain Model

> **Authoritative Data Persistence Specification**  
> Engines: **Android Room SQLite (KSP) & iOS SwiftData (@Model)**  
> Status: **Wave M14 Implemented & Accepted** | Last Updated: `2026-09-08`

---

## 1. Core Persistence Axiom

The 204 canonical places and 154 transit routes are **immutable reference assets**, never duplicated as editable user records. User persistence is restricted strictly to personal artifacts: bookmarks, custom itineraries, active trip progress, offline preferences, and queued contributions.

---

## 2. Conceptual Persisted Entity Table

| Entity Name | Canonical ID | Mutable Fields | Source | Sync Semantics | Deletion Semantics | Privacy Class | Retention |
|---|---|---|---|---|---|---|---|
| **`SavedPlace`** | `place_id` (String slug) | `saved_at`, `notes`, `priority` | User Action | Local-first; synced via `POST /api/v1/sync/saved-places` | Hard delete removes bookmark from local list | `USER_PRIVATE` | Retained indefinitely until user unsaves |
| **`SavedTrip`** | `trip_id` (UUID) | `title`, `start_date`, `end_date`, `days_json`, `is_active` | Plan Solver / User Edit | Local-first; synced via `POST /api/v1/sync/trips` | Hard delete removes trip and its progress | `USER_PRIVATE` | Retained indefinitely |
| **`TripProgress`**| `trip_id` + `milestone_index` | `status` (PENDING, VISITED, SKIPPED), `completed_at` | Active Trip Flow | Stored locally; updates active trip UI | Cascades on `SavedTrip` deletion | `USER_OPERATIONAL` | Cleared when trip is completed or deleted |
| **`RecentSearch`**| Auto-increment ID | `query_string`, `timestamp` | Search Bar | Local device only (never synced to cloud) | Rolling FIFO queue (max 10); clearable by user | `USER_EPHEMERAL` | 30 days max |
| **`UserPreference`**| `key` (String) | `value_string` (Locale, Theme, Units) | Settings View | Local DataStore / UserDefaults | Reset to defaults on cache clear | `SYSTEM_LOCAL` | Retained indefinitely |
| **`OfflinePackage`**| `package_id` (e.g. `district-puri`) | `status`, `bytes_downloaded`, `last_verified_at` | Offline Manager | Local disk cache state | User can purge media cache to free storage | `SYSTEM_LOCAL` | Purged on low device storage |
| **`PendingContribution`**| `submission_id` (UUID) | `payload_json`, `photo_file_path`, `status` | Contributor Flow | Queued locally until network available; uploaded via POST | Deleted from queue once 201 Created confirmed | `CONTRIBUTOR_AUDIT`| Retained until successful upload |
