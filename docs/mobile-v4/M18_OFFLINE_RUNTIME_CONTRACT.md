# M18 Offline Runtime Contract

## 1. Executive Summary
- **Wave**: M18 — Offline Mode, Airplane-Mode Continuity, Cached Media & Honest Degraded-State Execution
- **Preceding Accepted Wave**: M17 (Local Notifications)
- **Branch**: `feature/v4-platform-rebuild`
- **Core Product Invariant**: Truth before convenience — absence of network must never be converted into fake state.

---

## 2. Capability Guarantees Matrix

### Category A: Guaranteed Without Prior Use (`BUNDLED_AND_GUARANTEED`)
1. **Transit Route Directory**: 154 routes across Bhubaneswar, Cuttack, Puri, Rourkela, Berhampur.
2. **Transit Timetables**: 302 directional schedule groups, 5,549 canonical scheduled departures.
3. **Emergency Helplines**: 24x7 state numbers (112, 100, 108, 102, 181, 1091, 1070).
4. **Artisan Clusters**: Complete curated GI craft clusters & cultural heritage metadata.
5. **Deterministic KMP Domain Math**: Haversine distance calculations, Odisha bounding box validation, FirstMile distance bands.
6. **User Location**: Hardware GNSS coordinate acquisition without network dependence.
7. **Local Departure Reminders**: Scheduled alarm evaluation via OS platform alarms.

### Category B: Persisted After Prior Use (`PERSISTED_AFTER_USE`)
1. **Saved Places**: Local bookmarks with canonical IDs, titles, categories, districts, ratings.
2. **Saved Itineraries**: Custom and generated multi-stop itineraries with milestone checklists.
3. **Active Trip State**: Current active itinerary, milestone completion/skipping progress.
4. **Cached User Profile**: Minimal display profile (name, email, avatar URL) in secure local storage.
5. **Scheduled Transit Reminders**: Persisted departure alert requests in local database/store.

### Category C: Cache After Use (`CACHE_AFTER_USE`)
1. **Destination Media**: Responsive WebP photographs retained in Coil disk cache (Android) / URLCache (iOS).
2. **Weather Observations**: Last-known observation stored with timestamp; strictly labeled with relative observation time (`Cached weather · 3h ago`).

### Category D: Network Required (`NETWORK_REQUIRED`)
1. **Discover Feed Pagination**: Live remote catalog loading.
2. **Full Place Detail Remote Payload**: Fresh operational hours, contact phone numbers, entry tickets.
3. **Conversational AI Companion**: `POST /ai/converse`.
4. **Automated Itinerary Solver**: `POST /itinerary/plan`.
5. **Nearby Civic Facilities**: `GET /api/v1/services/nearby`.
6. **Account Authentication & Session Exchange**: Google OAuth and session validation.

### Category E: Provider Dependent (`PROVIDER_DEPENDENT`)
1. **Basemap Vector Tiles**: Google Maps SDK / Apple MapKit cached tiles.
2. **Turn-by-Turn Voice Navigation**: External handoff to system mapping applications.

---

## 3. Degraded-State Presentation Rules

1. **Global Degraded Banner**:
   - Appears when device is offline or when API failures corroborate disconnection.
   - Non-modal, calm, auto-dismissing when connectivity is restored.
   - Localized in English and Odia.
2. **Place Detail Offline Snapshot**:
   - If bookmarked, displays saved snapshot fields with banner: *"Offline Snapshot · Saved place details"*.
   - Live fields cleanly degrade to calm notices; zero crashes.
3. **Weather Card**:
   - Never displays `0°C` or default "Sunny".
   - Shows relative time disclosure if cached, or *"Weather unavailable"*.
4. **Map Screen**:
   - When tiles are missing or unconfigured, presents a prominent linear list view alternative.
5. **AI Planner**:
   - Disables prompt submission with truthful explanation: *"AI Assistant requires an internet connection. You can still view saved trips and edit local trip details."*
