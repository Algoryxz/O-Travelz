# M17 Notification Routing: Deep Link Schema & Fallback Safety

## 1. Deep Link Grammar
Notification action intents use explicit, sanitized canonical URIs matching the authoritative `ROUTING_MODEL.md`:

```text
otravelz://route/{routeId}
```

Example:
```text
otravelz://route/mo_bus_10
```

## 2. Intent Resolution Flow
When a traveler taps an active departure reminder notification:
1. `MainActivity` receives the `Intent(Intent.ACTION_VIEW, Uri.parse("otravelz://route/{routeId}"))`.
2. The router validates scheme (`otravelz`), host (`route`), and path segment (`{routeId}`).
3. The app navigates directly to the **Transit** tab and opens `RouteDetailScreen` for the specified route.

## 3. Graceful Fallback Semantics
If the route is invalid, deleted, or cannot be found:
- **Never crash.**
- The app gracefully falls back to displaying the Transit Root search directory (`TabDestination.TRANSIT`).
- An informative non-blocking snackbar is displayed: *"Route schedule no longer available"*.
