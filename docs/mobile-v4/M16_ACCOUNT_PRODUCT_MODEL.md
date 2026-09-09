# M16 Account Product Model: Identity Without Account Gates

## 1. Core Principle
> **O-TRAVELZ must remain fully useful while signed out.**

Authentication in O-TRAVELZ Mobile V4 is strictly an enhancement layer for identity, backup eligibility, future cross-device sync readiness, and verified traveler attribution. It is **never** a gate or barrier to any core discovery, planning, navigation, or emergency feature.

## 2. Three Identity States

```
+-------------------------------------------------------------------------+
|                           O-TRAVELZ APP SHELL                           |
+-------------------------------------------------------------------------+
       |                                      |
       v                                      v
+-----------------------------+     +-----------------------------------+
|      SIGNED_OUT_LOCAL       |     |      SIGNED_IN_LOCAL_PRIMARY      |
|  (Default for all travelers)|     |  (Authenticated identity active)  |
+-----------------------------+     +-----------------------------------+
| * Discover places & events  |     | * All SIGNED_OUT_LOCAL features   |
| * Full search & filters     |     | * User profile badge on You root  |
| * MapLibre maps & transit   |     | * Server session active           |
| * Route geometry & stops    |     | * Backup eligibility flagged      |
| * AI conversational planner |     | * Device storage remains primary  |
| * Save places to local DB   |     | * Cross-device sync: DEFERRED     |
| * Save trips to local DB    |     +-----------------------------------+
| * Active-trip navigation    |                       |
| * Emergency essentials      |                       v
| * Artisan cluster guides    |     +-----------------------------------+
| * Offline caching           |     |     SIGNED_IN_SYNC_CAPABLE        |
+-----------------------------+     |  (LOCKED / FUTURE EXPANSION ONLY) |
                                    +-----------------------------------+
                                    | * Status: SUPPORTED_NOT_IMPLEMENTED|
                                    |   (Requires server sync engine)   |
                                    +-----------------------------------+
```

### 2.1. `SIGNED_OUT_LOCAL` (Default)
- Every user begins here upon app launch.
- No login wall, no forced onboarding account creation, no email prompts before accessing places, maps, or itineraries.
- Data persistence is 100% device-local (Room SQLite on Android, SwiftData on iOS).
- Local bookmarks, itineraries, and active trip progress operate with zero network account dependency.

### 2.2. `SIGNED_IN_LOCAL_PRIMARY`
- User signs in via Google OAuth with system browser handoff or dev mock credentials.
- Backend establishes an authenticated session and issues a cryptographically random session token.
- Mobile client securely stores the token in platform hardware/keychain storage (EncryptedSharedPreferences / Android Keystore, iOS Keychain).
- Local storage remains the single source of truth for all user content on this device.
- The app explicitly communicates: *"Your saved trips and bookmarks remain safely stored on this device."*

### 2.3. `SIGNED_IN_SYNC_CAPABLE` (Status: DEFERRED)
- Strictly deferred until canonical backend entity sync APIs and conflict resolution engines are built.
- The UI never falsely claims or implies that local trips are "synced to cloud" in Wave M16.

## 3. Product Features by Auth State Matrix

| Feature | `SIGNED_OUT_LOCAL` | `SIGNED_IN_LOCAL_PRIMARY` | `SIGNED_IN_SYNC_CAPABLE` |
|---|---|---|---|
| Browse destinations & temples | Full Access | Full Access | Full Access |
| Multi-modal transit & schedules | Full Access | Full Access | Full Access |
| Interactive offline-ready maps | Full Access | Full Access | Full Access |
| AI Trip Generation | Full Access | Full Access | Full Access |
| Save places & trips | Local Storage | Local Storage | Local + Cloud Sync (Future) |
| Active-trip navigation progress | Local Storage | Local Storage | Local + Cloud Sync (Future) |
| Emergency essentials & civic contacts | Full Access | Full Access | Full Access |
| Artisan cluster directory | Full Access | Full Access | Full Access |
| You / Account tab | Local Library + Sign-in Card | Local Library + Identity Details + Sign-out | Local Library + Sync Status |
| Cloud backup / restore | Disabled | Eligible (Future) | Active (Future) |

## 4. Anti-Vibe-Code Guarantees
- No fake counters ("Over 50,000 travelers joined today!").
- No fake review badges or artificial gamification tiers.
- No intrusive account modals interrupting map panning, trip planning, or emergency lookup.
- Authentic Odia cultural identity design system: Warm Terracotta, Sun Stone, Forest Bronze.
