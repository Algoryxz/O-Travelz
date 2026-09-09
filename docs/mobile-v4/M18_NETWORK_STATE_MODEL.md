# M18 Network State Model

## 1. Core Architectural Principle
The network state monitor in O-TRAVELZ Mobile V4 is **strictly advisory, non-authoritative, and presentation-focused**.

> **The actual result of an HTTP network request (`NetworkResult.Success` or `NetworkResult.Failure`) is always the source of ground truth.**

An operating system connectivity callback might report an active Wi-Fi or cellular interface when a captive portal is blocking internet traffic or when remote servers are unreachable. Conversely, transient callback delays must never prevent an app from attempting a network request when the traveler taps Refresh.

---

## 2. Finite State Representation
Both Android and iOS expose a uniform three-state enumeration:

```kotlin
sealed interface NetworkState {
    object Online : NetworkState
    object Offline : NetworkState
    object Unknown : NetworkState
}
```

```swift
public enum NetworkState: Sendable, Equatable {
    case online
    case offline
    case unknown
}
```

---

## 3. Platform Implementations

### 3.1 Android
- Uses `ConnectivityManager.registerNetworkCallback` with `NetworkRequest.Builder().addCapability(NET_CAPABILITY_INTERNET)`.
- Updates a `StateFlow<NetworkState>`.
- Gracefully handles headless unit test environments where `ConnectivityManager` is unavailable, defaulting safely to `NetworkState.Online`.
- **Zero background service, zero polling loop, zero wake lock, zero analytics logging.**

### 3.2 iOS
- Uses Apple's `NWPathMonitor` on a dedicated background dispatch queue.
- Updates an `@Observable` object or Swift async stream publishing `NetworkState`.
- Maps `.satisfied` to `.online`, `.unsatisfied` to `.offline`, and `.requiresConnection` to `.offline`.

---

## 4. UI Consumption
1. When `NetworkState.Offline`, the root shell renders the compact, non-modal `OfflineStatusBanner`.
2. When an explicit user action triggers a remote request while offline, the action fails fast or falls back to persisted snapshots, rather than hanging indefinitely.
3. When network returns (`NetworkState.Online`), the banner dismisses automatically.
