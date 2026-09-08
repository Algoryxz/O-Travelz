# O-TRAVELZ Mobile V4 ? Native Logging & Privacy Policy

> **Authoritative Native Logging Specification**<br>
> Scope: **Wave M5 Native Bootstrap**<br>
> Version: `4.0.0` | Status: `LOCKED` | Date: `2026-09-08`

---

## 1. Privacy & Zero-Telemetry Philosophy

O-TRAVELZ Mobile V4 refuses unvetted surveillance and tracker SDKs:
- **Telemetry Provider**: `NOT_SELECTED` (Zero third-party trackers, zero Firebase Analytics, zero advertising identifiers).
- **Log Sanitation**: Diagnostics must NEVER capture or emit sensitive traveler data.

---

## 2. Prohibited Log Data (Hard Invariants)

The following data types MUST NEVER be logged under any condition:
1. **Precise Long-Term GPS Coordinates**: Tracing precise continuous location history is strictly prohibited.
2. **Authentication Credentials**: Zero OAuth tokens, JWT tokens, session keys, or passwords.
3. **Private User Prompts**: Natural-language planning prompts must not be recorded in diagnostic logs.
4. **Unredacted Personal Identifiers**: Phone numbers, government IDs, email addresses.
5. **Private Media Files**: User-uploaded photo binaries.

---

## 3. Native Logging Implementations

### Android
- Use minimal `android.util.Log` wrapper guarded by `if (BuildConfig.DEBUG)`.
- Release builds strip diagnostic logs via Proguard rules (`-assumenosideeffects class android.util.Log { ... }`).

### iOS
- Use Apple's unified logging system via `os.Logger`.
- Log levels: `Logger(subsystem: "com.otravelz.ios", category: "App")`.
- Privacy masking: Private values must be wrapped in `\(value, privacy: .private)` to ensure OSLog redacts values in production.