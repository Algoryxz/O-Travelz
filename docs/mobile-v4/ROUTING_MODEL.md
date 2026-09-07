# O-TRAVELZ Mobile V4 — Deep Linking & Routing Model

> **Authoritative Navigation Routing Specification**  
> Schemes: **Custom URI (`otravelz://`) & Future Universal App Links**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Custom URI Scheme Routing Table

| URI Route Pattern | Target Surface ID | Action & Navigation Stack Behavior | Unresolved ID Fallback Behavior |
|---|---|---|---|
| `otravelz://place/{id}` | `place_detail` | Opens Place Detail sheet on top of active root tab. | Shows error dialog: *"Destination not found"*, navigates to `discover_root`. |
| `otravelz://trip/{id}` | `saved_trip_detail` | Opens Saved Trip view in `trips_root`. | Informs user: *"Trip could not be loaded"*, opens `trips_root`. |
| `otravelz://route/{id}` | `route_detail` | Opens Transit Route stop sequence and schedule. | Shows: *"Route not found"*, opens `transit_directory`. |
| `otravelz://stop/{id}` | `stop_detail` | Opens Bus Stop Timetable bottom sheet. | Shows: *"Stop not found"*, centers map on capital region. |
| `otravelz://map` | `map_canvas` | Switches directly to Tab 1 (Map) and centers on user or Odisha overview. | N/A |
| `otravelz://plan` | `plan_root` | Switches directly to Tab 2 (Plan) with empty or pre-filled form. | N/A |
| `otravelz://active-trip` | `active_trip_view` | Switches to Tab 3 (Trips) and expands current day's active timeline. | If no active trip, shows saved trips list. |
| `otravelz://essentials` | `essentials_sheet` | Opens Emergency Contacts modal sheet. | N/A |

---

## 2. Universal / App Links Architecture (Web Parity)

When a user taps a web link shared from the O-TRAVELZ web client:
- Pattern: `https://algoryxz.github.io/O-Travelz/places/{id}`
- App Links (Android) and Universal Links (iOS) intercept the URL and map directly to `place_detail`.
- If the application is not installed, the link opens seamlessly in the mobile web browser.

---

## 3. Deep-Link Security & Parameter Sanitization

Following `android-intent-security` and iOS URL handling best practices:
1. **No Dynamic Code / Eval**: Route parameters (`{id}`) are strictly validated as alphanumeric kebab-case slugs (`^[a-z0-9-]+$`).
2. **Intent Hijacking Prevention**: External navigation URLs are dispatched strictly to official package intents (`com.google.android.apps.maps`) or verified universal HTTPS URLs (`https://www.google.com/maps/...`).
