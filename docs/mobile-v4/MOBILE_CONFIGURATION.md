# O-TRAVELZ Mobile V4 ? Configuration & Secrets Management Policy

> **Authoritative Mobile Configuration Policy**<br>
> Scope: **Wave M5 Native Bootstrap**<br>
> Version: `4.0.0` | Status: `LOCKED` | Date: `2026-09-08`

---

## 1. Secrets Isolation Policy

O-TRAVELZ Mobile V4 enforces a strict **Zero-Committed-Secrets** policy.

### Rules:
1. **Never hardcode API keys**, tokens, or private endpoint credentials in source code.
2. Secret-bearing files (`local.properties`, `Secrets.xcconfig`, google-services.json) are strictly gitignored.
3. Template files (`local.properties.example`, `Secrets.xcconfig.template`) are committed to document required variable keys.

---

## 2. Android Configuration Architecture

- **Local Development**: Read from `mobile/local.properties` (e.g. `OTRAVELZ_API_BASE_URL`, `GOOGLE_MAPS_API_KEY`).
- **Build System Injection**: `build.gradle.kts` injects properties into `BuildConfig` or manifest placeholders via `resValue` / `manifestPlaceholders`.
- **Gitignore Protection**: Root `.gitignore` covers `mobile/local.properties`.

---

## 3. iOS Configuration Architecture

- **Build Settings**: Xcode targets read configurations from `.xcconfig` files.
- **Local Development**: `mobile/ios/Configuration/Secrets.xcconfig` defines local keys.
- **Gitignore Protection**: `.gitignore` covers all `*.xcconfig` files containing secrets.
- **Runtime Access**: Evaluated via `Bundle.main.infoDictionary` or typed configuration struct.