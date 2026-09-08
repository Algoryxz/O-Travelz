# O-TRAVELZ Mobile V4 — Network Reachability & Availability Policy

> **Authoritative Specification for Network Presence and Offline State Truth**  
> Wave M6 Baseline  

---

## 1. Core Operating Rule: Request Outcome Is Authoritative

In O-TRAVELZ Mobile V4:
1. **Never use speculative network reachability singletons** (`ConnectivityManager` or `NWPathMonitor`) to decide whether a network call will succeed.
2. An active Wi-Fi or Cellular radio connection does NOT guarantee internet connectivity or backend server reachability (e.g. captive portals, DNS filtering, Render cold starts).
3. The outcome of the actual HTTP request is **the only authoritative source of truth**.

---

## 2. Tri-State Network Availability

The client recognizes three network states:

| Availability State | Condition | UI / System Reaction |
|---|---|---|
| **`REQUEST_SUCCEEDED`** | Real HTTP request completes with valid status. | Data displayed; offline caches updated; offline status badges hidden. |
| **`REQUEST_FAILED`** | HTTP request fails due to `UnknownHostException`, timeout, or 5xx. | Serve cached content; display calm, actionable retry banner; switch to deterministic KMP logic. |
| **`NETWORK_UNKNOWN`** | App launch or cold start before any network request has been dispatched. | Do not block UI or display alarming "No Internet" banners before attempting a fetch. |

---

## 3. Passive Telemetry Only
Platform network monitors (`ConnectivityManager.NetworkCallback` on Android, `NWPathMonitor` on iOS) are used **strictly as opportunistic hints** to schedule deferred synchronization or trigger a quiet retry when connectivity returns—never to gate or block user interactions.
