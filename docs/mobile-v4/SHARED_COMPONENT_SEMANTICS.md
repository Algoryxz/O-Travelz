# O-TRAVELZ Mobile V4 — Shared Component Semantics Specification

> **Authoritative Semantic Contract for Dual-Native Component Implementation**<br>
> Scope: **Platform-Agnostic Behavioral, Truth, and State Semantics**<br>
> Governance: **Semantic Parity Without Shared UI Code (Native Compose & SwiftUI Autonomy)**<br>
> Wave: `M3` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Governance & Anti-Abstraction Principle

O-TRAVELZ Mobile V4 implements **zero shared cross-platform UI code**. There are no shared multiplatform Compose widgets, no Flutter abstractions, and no React Native bridges.

Instead, the platform enforces **Shared Component Semantics**:
- Every core capability has a strictly defined semantic definition, data dependency contract, state model, and accessibility obligation.
- Android (`Material 3 Expressive Editorial`) and iOS (`Apple HIG Publication System`) build their own native UI controls from scratch to satisfy these exact semantic requirements.
- Neither platform may invent or omit states, fabricate facts, or violate data truth contracts.

---

## 2. Shared Semantic Component Catalog

### 1. `TruthBadge`
- **component_semantic_id**: `SEMANTIC_TRUTH_BADGE`
- **traveler_job**: Instantly know whether a piece of data (hours, stop, schedule, coordinate) is government-verified, estimated, or scheduled.
- **meaning**: Visual indicator of verification tier and data confidence.
- **required_data**: `verification_status` (`VERIFIED_OFFICIAL`, `VERIFIED_GEOSPATIAL`, `UNVERIFIED_CANDIDATE`), `confidence_score` (optional).
- **truth_contract**: Must display green seal for verified official; amber outline for candidate. Never claim official verification for crowd/unverified inputs.
- **states**: `VERIFIED`, `SCHEDULED`, `LIVE`, `ESTIMATED`, `CANDIDATE`, `UNAVAILABLE`.
- **user_actions**: Tap opens modal explanation sheet explaining the specific verification methodology and provenance.
- **prohibited_claims**: Do NOT label scheduled transit timetables as "Live". Do NOT omit the "Candidate" badge on unverified stops.
- **accessibility_semantics**: Role: Badge / Status. Accessibility Label: "[State name]: [Verification explanation]". Focusable.
- **offline_behavior**: Renders from cached/bundled metadata without network.
- **platform_specific_presentation_allowed**: Android uses M3 `AssistChip` / `SuggestionChip`. iOS uses inline capsule label (`Label(..., systemImage: ...)`).

---

### 2. `StatusBanner`
- **component_semantic_id**: `SEMANTIC_STATUS_BANNER`
- **traveler_job**: Understand transient conditions affecting destinations (e.g., temple festival closures, weather warnings, heavy crowd advisories).
- **meaning**: Prominent context alert displayed above or within detail views.
- **required_data**: `alert_id`, `severity` (`INFO`, `WARNING`, `CRITICAL`), `headline`, `body`, `valid_until`.
- **truth_contract**: Must cite source (e.g., "District Administration Advisory", "IMD Weather Bulletin").
- **states**: `ACTIVE_WARNING`, `ACTIVE_INFO`, `DISMISSED`.
- **user_actions**: Tap for full advisory text; swipe or tap 'X' to dismiss if non-critical.
- **prohibited_claims**: No AI-hallucinated crowd estimates or fake congestion warnings.
- **accessibility_semantics**: Role: Alert (`AccessibilityLiveRegion.Polite` on Android, `.accessibilityAddTraits(.isHeader)` on iOS).
- **offline_behavior**: Retains last-fetched advisory with "Cached [timestamp]" badge.
- **platform_specific_presentation_allowed**: Android uses M3 Card with tonal container color. iOS uses grouped banner with SF Symbol accent.

---

### 3. `PlaceSummary`
- **component_semantic_id**: `SEMANTIC_PLACE_SUMMARY`
- **traveler_job**: Evaluate a destination at a glance during discovery or search.
- **meaning**: Compact overview card containing name, Odia vernacular name, category, district, and key truth metadata.
- **required_data**: `destination_id`, `name_en`, `name_or`, `category`, `district`, `hero_image_url`, `verification_status`.
- **truth_contract**: `NO VERIFIED IMAGE = NO PUBLIC DESTINATION`. Every displayed place must link to a real verified destination record.
- **states**: `DEFAULT`, `BOOKMARKED`, `OFFLINE_AVAILABLE`, `SELECTED`.
- **user_actions**: Tap opens Place Detail; long-press opens contextual preview / quick save.
- **prohibited_claims**: No fake star ratings (e.g., "4.9 ★ (12k reviews)"). No commercial booking CTAs.
- **accessibility_semantics**: Role: Button / Link. Custom actions: "Save to Trip", "View on Map".
- **offline_behavior**: Fully browseable if included in bundled atlas or saved offline pack.
- **platform_specific_presentation_allowed**: Android uses M3 `ElevatedCard` with ripple and rounded corners (16dp). iOS uses inset grouped card with continuous corners (12pt).

---

### 4. `PlaceMediaSummary`
- **component_semantic_id**: `SEMANTIC_PLACE_MEDIA_SUMMARY`
- **traveler_job**: Inspect authentic visuals, cultural photography, and curated spatial views of a site.
- **meaning**: Gallery and hero presentation container strictly enforcing verified authentic assets.
- **required_data**: `image_urls` (WebP), `photographer_credit`, `license`, `has_verified_3d`, `has_verified_video`.
- **truth_contract**: No AI-generated tourist photos. Stock photos strictly prohibited unless museum-archived.
- **states**: `MEDIA_LOADED`, `THUMBNAIL_BLURHASH`, `OFFLINE_CACHED`, `MEDIA_UNAVAILABLE`.
- **user_actions**: Tap to expand full-screen lightbox gallery; pinch to zoom.
- **prohibited_claims**: Do NOT use synthetic 3D renders masquerading as real photography.
- **accessibility_semantics**: Accessible image description with photographer attribution.
- **offline_behavior**: Serves cached thumbnail or full image if saved in offline pack; placeholder icon if un-cached.
- **platform_specific_presentation_allowed**: Android uses `AsyncImage` with SubcomposeLayout. iOS uses SwiftUI `AsyncImage` / cached disk loader with zoom transition.

---

### 5. `WeatherSummary`
- **component_semantic_id**: `SEMANTIC_WEATHER_SUMMARY`
- **traveler_job**: Know current temperature, humidity, and precipitation risk for outdoor exploration.
- **meaning**: Contextual weather widget powered deterministically by Open-Meteo.
- **required_data**: `temp_celsius`, `weather_code`, `precipitation_probability`, `fetch_timestamp`.
- **truth_contract**: Must cite Open-Meteo source. Must indicate timestamp of forecast.
- **states**: `LIVE_FETCHED`, `STALE_CACHED`, `UNAVAILABLE`, `OFFLINE`.
- **user_actions**: Tap to refresh or view 24-hour hourly trend.
- **prohibited_claims**: Do not present multi-hour old cached forecast as "current conditions".
- **accessibility_semantics**: "Weather: [temp] degrees Celsius, [condition description], updated [relative time]".
- **offline_behavior**: Displays last-cached reading with explicit "Cached at [HH:MM]" label; hides if stale >12 hours.
- **platform_specific_presentation_allowed**: Android uses tonal card with M3 typography. iOS uses compact rounded container with SF Symbol weather glyph.

---

### 6. `TransitStopTruth`
- **component_semantic_id**: `SEMANTIC_TRANSIT_STOP_TRUTH`
- **traveler_job**: Determine if a Mo Bus / Ama Bus stop is officially surveyed or an estimated candidate location.
- **meaning**: Stop identity badge and GPS verification disclosure.
- **required_data**: `stop_id`, `stop_name_en`, `stop_name_or`, `verification_tier` (`VERIFIED_OFFICIAL`, `VERIFIED_GEOSPATIAL`, `CANDIDATE_HIGH`, `CANDIDATE_MEDIUM`, `CANDIDATE_LOW`, `LOCALITY_ONLY`).
- **truth_contract**: Exactly reflects canonical transit database tiers. If unverified, displays cautionary note.
- **states**: `OFFICIAL_STOP`, `GEOSPATIAL_STOP`, `CANDIDATE_STOP`, `LOCALITY_ONLY`.
- **user_actions**: Tap opens Stop Verification Details sheet with GPS coordinates and physical landmark notes.
- **prohibited_claims**: Do NOT claim stop has live arrival countdowns.
- **accessibility_semantics**: Role: Heading / Status. Label: "Stop: [name], Tier: [tier name]".
- **offline_behavior**: 100% available offline from bundled transit database (`data/transport/canonical/`).
- **platform_specific_presentation_allowed**: Android uses outline badge with warning icon. iOS uses system capsule with secondary text.

---

### 7. `RouteGeometryTruth`
- **component_semantic_id**: `SEMANTIC_ROUTE_GEOMETRY_TRUTH`
- **traveler_job**: Understand whether the map polyline represents the exact bus route or a road-network estimation.
- **meaning**: Visual polyline styling and map legend explaining geometry confidence.
- **required_data**: `route_id`, `geometry_confidence` (`VERIFIED_ROUTE_GEOMETRY`, `HIGH_CONFIDENCE_ROUTE_GEOMETRY`, `MEDIUM_CONFIDENCE_ROUTE_GEOMETRY`, `UNAVAILABLE`).
- **truth_contract**: VERIFIED_ROUTE_GEOMETRY renders road-following geometry; HIGH_CONFIDENCE_ROUTE_GEOMETRY renders validated road-following inferred geometry with confidence disclosure; MEDIUM_CONFIDENCE fails closed where continuity is not defensible; UNAVAILABLE suppresses polyline entirely. Strictly NO synthetic straight-line bridges or straight chords across unresolved gaps.
- **states**: `VERIFIED_SOLID`, `INFERRED_ROAD_ALIGNED`, `CORRIDOR_SEGMENT_DISCONTINUOUS`, `HIDDEN_UNMAPPED`.
- **user_actions**: Tap map legend chip to inspect route alignment confidence notes.
- **prohibited_claims**: Never claim unverified geometry is official surveyed alignment. Never draw synthetic straight chords between stops across unresolved gaps.
- **accessibility_semantics**: Audio explanation of route geometry type when map entity is selected.
- **offline_behavior**: Bundled in vector transit graph.
- **platform_specific_presentation_allowed**: Android MapLibre vector line layers. iOS MapKit / MapLibre line overlays.

---

### 8. `DepartureRow`
- **component_semantic_id**: `SEMANTIC_DEPARTURE_ROW`
- **traveler_job**: Plan when to reach a bus stop based on official published timetables.
- **meaning**: Individual scheduled bus trip entry showing route number, destination, and departure time.
- **required_data**: `route_number`, `destination_name`, `scheduled_time_ist`, `fare_inr` (strictly `null` until official fare tables ingested).
- **truth_contract**: Must be labeled "Scheduled Departure". When fare is null or unconfirmed, the UI must strictly display "Fare information unavailable" (with optional secondary note: "Check official/operator information before travel"). Never display raw "null", "₹0", "Pay on Bus", or invent fare amounts or payment methods.
- **states**: `UPCOMING_SCHEDULED`, `DEPARTED`, `NO_REMAINING_TODAY`.
- **user_actions**: Tap to view full route stops; tap bell icon for local departure alarm.
- **prohibited_claims**: STRICTLY PROHIBITED: "Arriving in 4 mins", "Live bus location".
- **accessibility_semantics**: "Route [number] to [destination], scheduled at [HH:MM] IST. Schedule timetable only."
- **offline_behavior**: Fully evaluated offline from local timetable graph.
- **platform_specific_presentation_allowed**: Android uses two-line list item with mono-font time pill. iOS uses inset table row with `SF Mono` time display.

---

### 9. `FirstMileGuidance`
- **component_semantic_id**: `SEMANTIC_FIRST_MILE_GUIDANCE`
- **traveler_job**: Know how far and how difficult it is to walk from the current location (or origin) to the nearest transit stop.
- **meaning**: Distance, estimated walking duration, and physical accessibility guidance.
- **required_data**: `distance_meters`, `distance_band` (`WALKABLE_CLOSE` <500m, `WALKABLE_MODERATE` 500–1200m, `EXTENDED` >1200m), `confidence` (`HAVERSINE_SPHERICAL`, `OSRM_PEDESTRIAN`).
- **truth_contract**: Distance labeled as "Straight-line estimate" if pedestrian network routing unavailable.
- **states**: `WALKABLE_RECOMMENDED`, `AUTO_RICKSHAW_RECOMMENDED`, `DISTANCE_UNAVAILABLE`.
- **user_actions**: Tap to launch native turn-by-turn walking directions in external app (Google Maps / Apple Maps).
- **prohibited_claims**: Do NOT claim sidewalk accessibility unless surveyed.
- **accessibility_semantics**: "First mile: [distance] meters, walking band [band name]."
- **offline_behavior**: Evaluated offline via on-device Haversine calculation against bundled stops.
- **platform_specific_presentation_allowed**: Android uses Chip with walking icon. iOS uses horizontal disclosure card.

---

### 10. `SavedStateIndicator`
- **component_semantic_id**: `SEMANTIC_SAVED_STATE_INDICATOR`
- **traveler_job**: Bookmark a place, itinerary, or transit route for offline access and later retrieval.
- **meaning**: Interactive toggle indicating persistence status in local device storage.
- **required_data**: `entity_id`, `is_saved`, `is_downloaded_offline`.
- **truth_contract**: Distinguish between "Bookmarked (cloud/metadata)" and "Downloaded (offline media + data guaranteed)".
- **states**: `UNSAVED`, `SAVED_LOCAL`, `DOWNLOADING_OFFLINE`, `OFFLINE_READY`.
- **user_actions**: Tap to toggle bookmark; long-press to manage offline asset download.
- **prohibited_claims**: Do not say "Saved for Offline" if images and vector data were not downloaded.
- **accessibility_semantics**: Role: Checkbox / Toggle. State: "Saved" / "Not saved".
- **offline_behavior**: Fully functional offline; reads and writes directly to local SQLite database.
- **platform_specific_presentation_allowed**: Android uses animated `FilledIconToggleButton`. iOS uses `.symbolEffect(.bounce)` bookmark icon button.

---

### 11. `JourneyLeg`
- **component_semantic_id**: `SEMANTIC_JOURNEY_LEG`
- **traveler_job**: Understand one individual segment of a multi-modal trip (e.g., Walk to Stop $\rightarrow$ Mo Bus Route 10 $\rightarrow$ Walk to Lingaraj Temple).
- **meaning**: Visual connector and metadata block for transit, walking, or private transport steps.
- **required_data**: `leg_type` (`WALK`, `BUS`, `AUTO`, `STAY`), `origin_name`, `destination_name`, `estimated_duration_min`, `route_number`.
- **truth_contract**: Timetable schedules clearly separated from walking estimates.
- **states**: `UPCOMING`, `CURRENT`, `COMPLETED`, `SKIPPED`.
- **user_actions**: Tap to inspect stops on this leg; tap to adjust transport mode.
- **prohibited_claims**: No fake traffic delay estimates.
- **accessibility_semantics**: "Leg [index]: [leg_type] from [origin] to [destination], approximately [duration] minutes."
- **offline_behavior**: Deterministically computed and stored in local journey plan.
- **platform_specific_presentation_allowed**: Android uses vertical timeline step with icon node. iOS uses continuous timeline line with rounded card leg.

---

### 12. `ItineraryMilestone`
- **component_semantic_id**: `SEMANTIC_ITINERARY_MILESTONE`
- **traveler_job**: Track progress during an active exploration day (visited temples, lunch stops, artisan visits).
- **meaning**: Structured timeline milestone card within an active trip.
- **required_data**: `milestone_id`, `destination_id`, `name`, `target_time_range`, `status` (`SCHEDULED`, `ACTIVE`, `COMPLETED`, `SKIPPED`).
- **truth_contract**: Reflects user action; no automatic GPS check-in unless explicitly enabled by user.
- **states**: `PENDING`, `IN_PROGRESS`, `DONE`, `DEFERRED`.
- **user_actions**: Swipe or button tap to mark "Complete" or "Skip"; reorder via drag handle.
- **prohibited_claims**: No gamified point counters or fake leaderboards.
- **accessibility_semantics**: Role: ListItem. Custom accessibility actions: "Mark Complete", "Skip", "Move Up".
- **offline_behavior**: 100% offline executable.
- **platform_specific_presentation_allowed**: Android uses M3 `OutlinedCard` with check button. iOS uses swipeable list cell with `Image(systemName: "checkmark.circle")`.

---

### 13. `EssentialServiceSummary`
- **component_semantic_id**: `SEMANTIC_ESSENTIAL_SERVICE_SUMMARY`
- **traveler_job**: Locate verified emergency services, public health facilities, and police assistance in Odisha.
- **meaning**: Emergency contact and civic utility card (211 verified facilities).
- **required_data**: `service_id`, `name`, `category` (`HOSPITAL`, `POLICE`, `TOURIST_AID`, `WOMEN_SAFETY`), `phone_number`, `coordinates`, `address`.
- **truth_contract**: Phone numbers must be official emergency/direct helplines. No unverified third-party contacts.
- **states**: `VERIFIED_ACTIVE`, `TAP_TO_CALL`.
- **user_actions**: Tap to initiate phone call; tap to view route on map.
- **prohibited_claims**: Never claim real-time emergency wait times.
- **accessibility_semantics**: "Essential service: [Name], [Category], Phone: [Number]. Double tap to call."
- **offline_behavior**: Bundled in core offline atlas; 100% callable and map-viewable with zero internet connection.
- **platform_specific_presentation_allowed**: Android uses emergency red tonal button / dialer intent. iOS uses `.tint(.red)` action button with `tel://` URL scheme.

---

### 14. `OfflineStateBanner`
- **component_semantic_id**: `SEMANTIC_OFFLINE_STATE_BANNER`
- **traveler_job**: Know immediately that the app is operating from on-device storage, which features remain functional, and what is temporarily disabled.
- **meaning**: Non-intrusive status notification displayed when cellular/Wi-Fi is absent.
- **required_data**: `network_status` (`OFFLINE`), `available_offline_tier` (`BUNDLED_ATLAS`, `DOWNLOADED_PACK`, `CACHE_ONLY`).
- **truth_contract**: Explicitly states: "Offline Mode: Showing bundled atlas and verified transit schedules. Live weather and AI assistant unavailable."
- **states**: `OFFLINE_CONNECTED_TO_LOCAL`, `OFFLINE_PARTIAL_CACHE`.
- **user_actions**: Tap to view offline storage status or manage downloaded district packs.
- **prohibited_claims**: Never say "Offline — All features available" if AI and weather are unavailable.
- **accessibility_semantics**: Role: Status banner. Announced once when network transitions to offline.
- **offline_behavior**: Displays automatically on local network disconnection event.
- **platform_specific_presentation_allowed**: Android uses top app bar subtitle chip or surface banner. iOS uses compact pill under navigation bar.

---

### 15. `AIStateBanner`
- **component_semantic_id**: `SEMANTIC_AI_STATE_BANNER`
- **traveler_job**: Understand that natural language suggestions are assisted by AI while all underlying facts (stops, coordinates, hours) remain deterministic.
- **meaning**: Clear boundary indicator showing AI assistant mode and deterministic grounding.
- **required_data**: `ai_status` (`READY`, `SYNTHESIZING`, `DEGRADED_FALLBACK`, `OFFLINE_UNAVAILABLE`), `grounding_source_count`.
- **truth_contract**: AI explains and refines plans; it NEVER invents coordinates, routes, or fares. Explicit disclaimer present.
- **states**: `READY`, `PROCESSING`, `FALLBACK_TO_DETERMINISTIC`, `OFFLINE_DISABLED`.
- **user_actions**: Tap info icon to view AI Grounding & Privacy notice; tap "Retry with Deterministic Engine" when offline.
- **prohibited_claims**: No claims of "AI psychic itinerary predictions" or ungrounded recommendations.
- **accessibility_semantics**: "AI Assistant: [Status]. Grounded by official Odisha travel catalog."
- **offline_behavior**: Disabled gracefully offline; presents deterministic rule-based filters instead.
- **platform_specific_presentation_allowed**: Android uses subtle sandstone-tinted container. iOS uses grouped section footer note.

---

### 16. `ContributionStatus`
- **component_semantic_id**: `SEMANTIC_CONTRIBUTION_STATUS`
- **traveler_job**: Check the review and verification status of a submitted field photo or GPS stop verification.
- **meaning**: Status indicator for traveler civic contributions.
- **required_data**: `submission_id`, `status` (`UNDER_REVIEW`, `VERIFIED_ACCEPTED`, `REJECTED`), `submission_timestamp`, `review_notes`.
- **truth_contract**: Submissions are strictly unverified until editorial review passes.
- **states**: `PENDING_REVIEW`, `ACCEPTED_PUBLISHED`, `NEEDS_ADDITIONAL_INFO`.
- **user_actions**: Tap to view submission detail or submit clarifying photo.
- **prohibited_claims**: No fake community badges or karma points.
- **accessibility_semantics**: "Contribution: [Title], Status: [Status]."
- **offline_behavior**: Queued locally in Outbox table when offline; auto-syncs on reconnect.
- **platform_specific_presentation_allowed**: Android uses M3 `AssistChip`. iOS uses table disclosure cell.

---

### 17. `PermissionEducation`
- **component_semantic_id**: `SEMANTIC_PERMISSION_EDUCATION`
- **traveler_job**: Understand exactly why the app requests Location or Notification permissions before the system dialog appears.
- **meaning**: Pre-permission educational dialog or in-context card explaining traveler utility.
- **required_data**: `permission_type` (`LOCATION_WHEN_IN_USE`, `NOTIFICATIONS`), `explanation_copy`, `fallback_description`.
- **truth_contract**: Truthful explanation: "Used only to show your position on the Odisha atlas and calculate first-mile distance to Mo Bus stops. The app remains 100% usable without location."
- **states**: `PRE_REQUEST_EXPLANATION`, `DENIED_GRACEFUL_FALLBACK`.
- **user_actions**: Tap "Continue" to trigger system prompt; tap "Not Now" to proceed in manual district selection mode.
- **prohibited_claims**: No coercive dark patterns claiming the app cannot function without permissions.
- **accessibility_semantics**: Accessible modal dialog with clear "Allow" and "Skip" targets.
- **offline_behavior**: Evaluated entirely on-device.
- **platform_specific_presentation_allowed**: Android uses M3 `AlertDialog` / `ModalBottomSheet`. iOS uses standard HIG alert or sheet.

---

### 18. `EmptyState`
- **component_semantic_id**: `SEMANTIC_EMPTY_STATE`
- **traveler_job**: Know why a list or search result is empty and what next action to take.
- **meaning**: Clean, informative placeholder when no data exists (e.g., zero saved trips, zero search results).
- **required_data**: `context` (`SEARCH_NO_RESULTS`, `TRIPS_EMPTY`, `FAVORITES_EMPTY`), `title`, `description`, `action_label`.
- **truth_contract**: Clearly explain the filter or condition causing the empty list.
- **states**: `FILTER_EMPTY`, `SAVED_ITEMS_EMPTY`, `HISTORY_EMPTY`.
- **user_actions**: Action button to clear filters, browse curated destinations, or start new plan.
- **prohibited_claims**: No generic error blaming the server when it is simply a zero-match filter.
- **accessibility_semantics**: Role: Image / Header / Action Button.
- **offline_behavior**: Fully functional offline.
- **platform_specific_presentation_allowed**: Android uses centered layout with M3 tonal button. iOS uses iOS 17+ `ContentUnavailableView`.

---

### 19. `ErrorState`
- **component_semantic_id**: `SEMANTIC_ERROR_STATE`
- **traveler_job**: Understand when a request has failed, why it failed, and how to recover or retry.
- **meaning**: Resilient failure presentation for network timeouts, bad responses, or hardware limitations.
- **required_data**: `error_code`, `user_friendly_explanation`, `is_retryable`, `technical_details` (hidden behind disclosure).
- **truth_contract**: Honest diagnostic language; no technical jargon exposed by default.
- **states**: `RETRYABLE_NETWORK_ERROR`, `FATAL_UNAVAILABLE_ERROR`.
- **user_actions**: Tap "Retry" to re-execute operation; tap "Use Offline Mode" to fall back to cached data.
- **prohibited_claims**: Do not report server maintenance when local airplane mode is enabled.
- **accessibility_semantics**: Role: Alert. Announces error description and focuses Retry button.
- **offline_behavior**: Can transition seamlessly into Offline fallback.
- **platform_specific_presentation_allowed**: Android uses M3 Card with retry FAB/button. iOS uses `ContentUnavailableView` with retry button.

---

## 3. Summary & Semantic Verification Matrix

| Semantic Component ID | Traveler Job | Truth Contract Key | Offline Behavior |
|---|---|---|---|
| `SEMANTIC_TRUTH_BADGE` | Data credibility verification | No fake live labels | Bundled metadata |
| `SEMANTIC_STATUS_BANNER` | Advisory awareness | Source cited | Cached advisory |
| `SEMANTIC_PLACE_SUMMARY` | Destination discovery | Verified image gate | Bundled / Saved |
| `SEMANTIC_PLACE_MEDIA_SUMMARY` | Cultural exploration | Zero AI photo generation | Cached / Placeholder |
| `SEMANTIC_WEATHER_SUMMARY` | Environmental planning | Open-Meteo attribution | Stale timestamp / Hidden |
| `SEMANTIC_TRANSIT_STOP_TRUTH` | Transit navigation | Survey tier fidelity | 100% Bundled |
| `SEMANTIC_ROUTE_GEOMETRY_TRUTH` | Transit path confidence | Polyline confidence legend | Bundled vector graph |
| `SEMANTIC_DEPARTURE_ROW` | Timetable adherence | Strictly scheduled, fares null | 100% Bundled |
| `SEMANTIC_FIRST_MILE_GUIDANCE` | Transit access planning | Straight-line disclosure | On-device Haversine |
| `SEMANTIC_SAVED_STATE_INDICATOR` | Content bookmarking | Offline downloaded distinction | 100% On-device SQLite |
| `SEMANTIC_JOURNEY_LEG` | Inter-modal transit navigation | Schedule vs walking split | Local journey plan |
| `SEMANTIC_ITINERARY_MILESTONE` | Daily execution tracking | Manual user action check-in | 100% Offline |
| `SEMANTIC_ESSENTIAL_SERVICE_SUMMARY`| Safety & medical access | Official emergency lines | 100% Bundled 211 entities |
| `SEMANTIC_OFFLINE_STATE_BANNER` | Awareness of degraded features | Transparent tier notice | Local network observer |
| `SEMANTIC_AI_STATE_BANNER` | AI boundaries understanding | Grounded facts, AI refines | Graceful disable offline |
| `SEMANTIC_CONTRIBUTION_STATUS` | Civic participation | Unverified until reviewed | Local sync queue |
| `SEMANTIC_PERMISSION_EDUCATION` | Privacy informed consent | Zero dark coercion | On-device logic |
| `SEMANTIC_EMPTY_STATE` | Zero-state guidance | Accurate filter reasoning | Fully offline |
| `SEMANTIC_ERROR_STATE` | Failure recovery | Honest diagnostics | Offline fallback |
