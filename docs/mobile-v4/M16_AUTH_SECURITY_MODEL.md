# M16 Auth Security Model: Secrets, Deep Links & Attack Surface Mitigation

## 1. Threat Modeling & Safeguards

| Threat Area | Potential Vulnerability | M16 Mitigation & Enforcement |
|---|---|---|
| **Deep Link Callback** | Intent spoofing, route injection, rogue app interception | Exact matching on scheme (`otravelz`), host (`auth`), and path (`/callback`). Query parameter extraction strictly parses `auth_ticket`. Custom tab closes immediately upon redirect. |
| **Token Exposure** | Accidental logging in Logcat / OSLog / reports | Raw tokens are never logged. Masked representation used in audit reports (`sec_tok_***`). Tokens never passed to analytics or crash reporters. |
| **Token Storage** | Plaintext SharedPreferences / SQLite / UserDefaults leaks | Android uses Keystore-backed AES-256-GCM encryption with device-isolated fallback. iOS uses Keychain Services (`kSecClassGenericPassword` with `kSecAttrAccessibleAfterFirstUnlock`). |
| **Session Lifetime** | Indefinite session hijacking | Tokens are validated against `/auth/me`. Expired tokens are purged from client storage immediately. |
| **CSRF / State Spoofing** | OAuth state replay / cross-session injection | Backend signs OAuth state cookie with HMAC-SHA256 containing random nonce, timestamp, and optional validated `app_redirect`. Expired states (>10m) are rejected. |
| **Ticket Exfiltration** | Ticket reuse or interception | Auth tickets are 64-character cryptographically random secrets with a 60-second TTL. The backend enforces single-use deletion immediately upon lookup. |

## 2. Deep Link Intent Filter Configuration (Android)

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="otravelz"
        android:host="auth"
        android:pathPrefix="/callback" />
</intent-filter>
```

Strict matching rules:
- Wildcard schemes (`*://*`) are forbidden.
- Malicious schemes (`http`, `javascript`, `file`, `content`) are rejected.
- Non-matching paths (`otravelz://auth/admin`, `otravelz://untrusted`) are ignored.

## 3. iOS Universal / Custom Scheme Configuration

In `Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.otravelz.ios.auth</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>otravelz</string>
        </array>
    </dict>
</array>
```

Handled via `ASWebAuthenticationSession` with `callbackURLScheme: "otravelz"`. Cancellation by the user (`ASWebAuthenticationSessionError.canceledLogin`) resets the view model to `SignedOut` without displaying spurious error banners.
