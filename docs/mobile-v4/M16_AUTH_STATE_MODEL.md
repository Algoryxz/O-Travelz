# M16 Auth State Model: States, Transitions, and Lifecycle

## 1. Unified State Hierarchy

Both Android and iOS mobile platforms implement an identical conceptual state machine:

```
                  +--------------------------+
                  |        SignedOut         |
                  +--------------------------+
                         |            ^
           Initiate Auth |            | Logout / Cancel
                         v            |
                  +--------------------------+
                  |      Authenticating      |
                  +--------------------------+
                         |            |
           Ticket Valid  |            | Network / Validation Error
                         v            v
           +--------------------+  +--------------------+
           |      SignedIn      |  |       Error        |
           +--------------------+  +--------------------+
                 |        |
        401 /    |        | Logout
        Revoked  |        |
                 v        v
           +--------------------+
           |      Expired       |
           +--------------------+
```

### State Definitions

1. **`AuthState.SignedOut`**
   - No active session token in device secure storage.
   - The user has full, unrestricted access to all local-first product surfaces.
   - The You tab displays the optional account invitation card.

2. **`AuthState.Authenticating`**
   - User has tapped sign in; system browser / Custom Tab is launched or one-time ticket exchange is in flight.
   - Transient state; times out or transitions to SignedIn, Error, or back to SignedOut if cancelled.

3. **`AuthState.SignedIn(user: UserProfile)`**
   - Active session token verified against `/auth/me` or newly issued by `/auth/exchange-ticket`.
   - `UserProfile` contains:
     - `id`: Canonical backend user identifier.
     - `email`: Authenticated user email address.
     - `name`: Full display name (e.g., from Google OAuth).
     - `displayName`: Short presentation name.
     - `avatarUrl`: Optional profile photo URL.
     - `provider`: Identity provider (e.g., `"google"`).

4. **`AuthState.Error(message: String)`**
   - One-time ticket exchange failed, network handshake timed out, or invalid deep link returned.
   - Does not lock out the user or interrupt local app features.
   - User can dismiss the error or retry sign-in at will.

5. **`AuthState.Expired(message: String)`**
   - Previously stored session token returned HTTP 401/403 or was invalidated on the server.
   - Secure token storage is cleared.
   - UI gracefully transitions to SignedOut or displays an unobtrusive re-authentication prompt without interrupting current tasks.

## 2. Platform Parity Matrix

| State | Android Implementation | iOS Implementation |
|---|---|---|
| `SignedOut` | `AuthState.SignedOut` | `AuthState.signedOut` |
| `Authenticating` | `AuthState.Authenticating` | `AuthState.authenticating` |
| `SignedIn` | `AuthState.SignedIn(user)` | `AuthState.signedIn(user)` |
| `Error` | `AuthState.Error(message)` | `AuthState.error(message)` |
| `Expired` | `AuthState.Expired(message)` | `AuthState.expired(message)` |

## 3. Session Lifecycle & Startup Policy
- **Non-blocking launch**: App launch restores credentials asynchronously. Discover and Trips load immediately without awaiting `/auth/me`.
- **Fail-open resilience**: If the backend is unreachable or offline when validating an existing session, the app assumes local operation and does not wipe credentials prematurely or lock out the traveler.
