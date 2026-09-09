# M16 Sign-Out Semantics: Safe Disconnection Without Data Loss

## 1. Intent & Purpose
Signing out must cleanly disconnect the user's account session without destroying local data or leaving the mobile app in a degraded or unusable state.

## 2. Six-Point Sign-Out Protocol

```
           +---------------------------------------------+
           |           User Taps "Sign Out"              |
           +---------------------------------------------+
                                  |
                                  v
           +---------------------------------------------+
           | 1. Server Revocation Call                   |
           |    POST /auth/logout                        |
           |    Header: Authorization: Bearer <token>    |
           |    Revokes session row in DB                |
           +---------------------------------------------+
                                  |
                                  v
           +---------------------------------------------+
           | 2. Wipe Local Secure Storage                |
           |    Clear Android Keystore / EncryptedPrefs  |
           |    Clear iOS Keychain Item                  |
           +---------------------------------------------+
                                  |
                                  v
           +---------------------------------------------+
           | 3. Transition UI State                      |
           |    AuthState -> SignedOut                   |
           |    Clear in-memory UserProfile              |
           +---------------------------------------------+
                                  |
                                  v
           +---------------------------------------------+
           | 4. PRESERVE Local Persistence               |
           |    Room SQLite tables untouched             |
           |    SwiftData models untouched               |
           |    Active trip progress preserved           |
           +---------------------------------------------+
                                  |
                                  v
           +---------------------------------------------+
           | 5. PRESERVE Offline Bundles                 |
           |    Offline transit schedules retained       |
           |    Cached map tiles retained                |
           |    Emergency cache retained                 |
           +---------------------------------------------+
                                  |
                                  v
           +---------------------------------------------+
           | 6. App Continues Seamlessly                 |
           |    User remains on You tab or returns       |
           |    Discover, Map, Plan, Trips fully usable  |
           +---------------------------------------------+
```

## 3. Resilience to Server Logout Failures
If the device is offline or the backend returns 5xx when `POST /auth/logout` is called:
- The local secure credentials are still deleted locally.
- The UI transitions cleanly to `SignedOut`.
- The user is never trapped in a stuck session due to a network outage.

## 4. Active Trip Invariant
If a traveler is mid-trip (e.g., navigating milestone 3 in Bhubaneswar) and decides to sign out:
- `TripProgressEntity` / `TripProgressModel` is **not deleted**.
- The trip remains active and navigable.
- The next stop alert and offline directions continue functioning without interruption.
