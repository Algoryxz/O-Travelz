# O-Travelz — Authoritative API Contract & Frontend Integration Map
**Version:** 1.0.0 (API Specifications)  
**Backend Framework:** FastAPI 0.115.0  
**Contract Definition File:** `frontend/src/types/api.ts` & `backend/app/schemas/`

---

## 1. Complete API Contract Mapping Table

| Feature | Frontend Caller | Method | Endpoint | Request Body / Query Params | Response Structure | Auth Req? | Current UI / View |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: | :--- |
| **Liveness Health Check** | CI / Monitoring | `GET` | `/health` | None | `{"status": "ok"}` | No | System health / Docker |
| **Google OAuth Start** | `useAuth.loginWithGoogle` | `GET` | `/auth/google/start` | None | `302 Redirect` to Google Consent | No | Header / Mobile Login button |
| **Google OAuth Callback** | Browser Redirect | `GET` | `/auth/google/callback` | `code`, `state`, `error` | `302 Redirect` to Frontend + Sets Cookie | No | OAuth Return Gate |
| **Get Auth Status** | `apiClient.getAuthMe` | `GET` | `/auth/me` | None (reads cookie) | `AuthResponse` (`authenticated`, `user`) | Optional | `AuthStatusButton`, TopNav |
| **User Logout** | `apiClient.logout` | `POST` | `/auth/logout` | None (reads cookie) | `{"authenticated": false}` | Optional | Header User Menu |
| **List / Search Places** | `apiClient.listPlaces` | `GET` | `/places` | `search`, `category`, `district`, `region`, `limit`, `offset` | `PlaceDetailResponse[]` + Headers | No | `DestinationsPage`, `HomeSections` |
| **Search Suggestions** | `apiClient.getSearchSuggestions` | `GET` | `/places/suggestions` | `query`, `limit` | `SearchSuggestion[]` | No | `OdishaHero`, Search Input |
| **Get Place Details** | `apiClient.getPlace` | `GET` | `/places/{id}` | Path: `id` (UUID or research ID) | `PlaceDetailResponse` | No | `PlaceDetailsModal` |
| **Deterministic Itinerary** | `apiClient.planItinerary` | `POST` | `/itinerary/plan` | `PlanningConstraints` (`days`, `interests`, `start`, etc.) | `ItineraryPlanResponse` | No | `ConstraintForm`, `#plan` tab |
| **AI Itinerary Plan (Legacy)** | `apiClient.planWithAi` | `POST` | `/ai/plan` | `AIPlanRequest` (`message`, `constraints`) | `AIResponse` | No | `AIConversationPanel` |
| **Grounded AI Conversation** | `apiClient.converseWithAi` | `POST` | `/ai/converse` | `AIConversationRequest` (`messages`, `constraints`) | `GroundedConversationResponse` | No | `AISidebar`, `AIConversationPanel` |
| **Map Geospatial Projection** | `apiClient.getMapProjection` | `POST` | `/map/v1/projection` | `MapProjectionHTTPRequest` (`features`, `hops`) | `MapProjectionResponse` | No | `MapView`, `MapCanvas` |
| **Image Asset Proxy** | `<img>` / Image loader | `GET` | `/static/images/{path}` | Path: storage key (e.g. `places/...`) | Binary WebP bytes (`image/webp`) | No | All Place Cards, Galleries, Heros |
| **Image Asset Proxy (v1)** | `<img>` / Image loader | `GET` | `/api/v1/images/{path}` | Path: storage key | Binary WebP bytes (`image/webp`) | No | Alternative Image route |
| **Current Live Weather** | `apiClient.getWeather` | `GET` | `/weather/current` | `location_name`, `lat`, `lon` | `WeatherResponse` | No | `WeatherCard`, Hub Selector |
| **Weather Forecast (Backend)**| None *(Direct)* | `GET` | `/weather/forecast` | `location_name`, `lat`, `lon` | `WeatherResponse` (7-day forecast) | No | Unused by frontend UI |
| **Get Synced Places** | `apiClient.getSyncedPlaces` | `GET` | `/api/v1/sync/saved-places` | None (reads cookie) | `SyncSavedPlacesResponse` | **Yes** | `useCloudSync`, `SavedPlacesPage` |
| **Upsert Synced Places** | `apiClient.syncSavedPlaces` | `POST` | `/api/v1/sync/saved-places` | `SyncSavedPlacesRequest` (`items[]`) | `SyncSavedPlacesResponse` | **Yes** | `useCloudSync` |
| **Get Synced Trips** | `apiClient.getSyncedTrips` | `GET` | `/api/v1/sync/trips` | None (reads cookie) | `SyncTripsResponse` | **Yes** | `useCloudSync`, Trip History |
| **Upsert Synced Trips** | `apiClient.syncTrips` | `POST` | `/api/v1/sync/trips` | `SyncTripsRequest` (`items[]`) | `SyncTripsResponse` | **Yes** | `useCloudSync` |
| **Create Shareable Trip** | `apiClient.createSharedTrip`| `POST` | `/api/v1/trips/share` | `CreateShareTripRequest` (`title`, `itinerary`) | `CreateShareTripResponse` (`share_id`, `url`) | **Yes** | `ShareTripModal` |
| **Get Public Shared Trip** | `apiClient.getSharedTrip` | `GET` | `/api/v1/trips/shared/{id}`| Path: `share_id` | `PublicSharedTripResponse` | No | `SharedItineraryPage` (`#trip/shared/*`) |
| **Plan Single Transport Hop**| None *(Tool only)* | `POST` | `/transport/hop` | `PlanTransportHopArgs` (`from`, `to`, `mode`) | `TransportHopContract` | No | Unused directly (called via Itinerary engine) |
| **Get Provider Status** | None *(Tool only)* | `GET` | `/transport/providers/{id}` | Path: `provider_id` (e.g. `mo_bus`) | `ProviderStatusContract` | No | Unused directly (called via AI tool) |

---

## 2. Backend Endpoints Without Direct Frontend Consumers

The following endpoints exist in the backend architecture but are currently only accessed internally via AI tools or backend services:

1. **`POST /transport/hop`**:
   * Evaluates pairwise transit routes between two points. Used internally by `ItineraryService` and AI tool `plan_transport_hop`.
2. **`GET /transport/providers/{provider_id}`**:
   * Returns operational status for transportation networks (Mo Bus, Mo E-Ride, CRUT). Used internally by AI tool `get_provider_status`.
3. **`GET /weather/forecast`**:
   * Provides multi-day weather forecasts. Currently, the frontend only consumes `/weather/current`.

---

## 3. Standardized Error Response Format

All backend endpoints emit RFC 7807-compliant structured JSON errors:

```json
{
  "error": {
    "code": "validation_error | rate_limited | not_found | unauthorized | payload_too_large | http_error",
    "message": "Human-readable explanation of error condition",
    "field": "optional_field_name"
  },
  "details": [
    {
      "field": "constraints.days",
      "message": "Input should be less than or equal to 7"
    }
  ]
}
```
