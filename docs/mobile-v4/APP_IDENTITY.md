# O-TRAVELZ Mobile V4 ? Application & Bundle Identity Specification

> **Authoritative Application Identity Specification**<br>
> Scope: **Wave M5 Native Bootstrap**<br>
> Version: `4.0.0` | Status: `LOCKED` | Date: `2026-09-08`

---

## 1. Android Application Identity

- **Namespace**: `com.otravelz.android`
- **Application ID (Release)**: `com.otravelz.android`
- **Application ID (Debug)**: `com.otravelz.android.debug`
- **App Name**: `O-TRAVELZ` (Odia: `?-?????????`)
- **Version Code**: `1`
- **Version Name**: `4.0.0`
- **Minimum SDK**: `26` (Android 8.0 Oreo)
- **Target SDK**: `35` (Android 15)
- **Compile SDK**: `35` (Android 15)

---

## 2. iOS Application Identity

- **Bundle Identifier (Release)**: `com.otravelz.ios`
- **Bundle Identifier (Debug)**: `com.otravelz.ios.debug`
- **App Name**: `O-TRAVELZ` (Odia: `?-?????????`)
- **Bundle Version**: `1`
- **Short Version String**: `4.0.0`
- **Minimum Deployment Target**: `iOS 17.0`
- **Swift Language Baseline**: `Swift 5.9 / 6.0`

---

## 3. Signing & Security Invariant

- **Zero Secrets Committed**: No release keystores, `.jks` files, provisioning profiles, distribution certificates, or plain-text credentials are ever committed to the repository.
- Release signing is performed solely in dedicated CI/CD environments via GitHub Actions / Xcode Cloud secrets.