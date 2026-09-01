# O-Travelz Frontend Architecture Specification

`STATUS: VERIFIED`

## 1. Technical Stack
* **Framework**: React 18 (TypeScript 5.5+)
* **Build Tooling**: Vite 5.4+ with Rollup code-splitting
* **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens (`index.css`)
* **Mapping**: Leaflet 1.9+ (Lazy loaded & code-split)
* **Icons**: Lucide React
* **State Management**: Custom React Hooks with persistent `localStorage` stores
* **Testing**: Vitest 2.0+ with `@testing-library/react` (43 suites, 385 tests)

---

## 2. Directory Structure & Layers

```
frontend/src/
├── api/                  # Typed HTTP Client & Backend Contracts
│   ├── client.ts         # ApiClient connecting to REST endpoints
│   └── contracts.ts      # Data types (Places, Itineraries, Projections, Weather)
├── components/           # Reusable UI & Domain Components
│   ├── home/             # OdishaHero, HomeSections, DestinationsPage, CategoryExplorePage, SavedPlacesPage
│   ├── itinerary/        # ConstraintForm, ItineraryView, ItineraryDaySection, ItineraryStopCard, ShareTripModal
│   ├── map/              # MapView (React.lazy Leaflet projection wrapper)
│   ├── nav/              # TopNav, MobileDrawer, Footer, ThemeSettingsDock
│   ├── place/            # PlaceCard, PlaceDetailsModal, EssentialCard
│   ├── weather/          # WeatherCard, animated weather icons
│   └── legal/            # PrivacyPolicyPage, TermsConditionsPage, TermsConsentGate
├── pages/                # High-level Router Views
│   └── ItineraryPlannerPage.tsx  # Master state machine & URL hash router
├── store/                # Domain State Machines & Storage Hooks
│   ├── usePlaces.ts              # Verified place catalog & search
│   ├── useItineraryPlanner.ts    # Deterministic itinerary planner
│   ├── useAIConversation.ts      # Grounded AI conversation engine
│   ├── useMapProjection.ts       # GeoJSON route projection
│   ├── useSavedPlaces.ts         # Bookmarked wishlist with localStorage
│   ├── useRecentPlaces.ts        # Recents history tracking
│   ├── useWeather.ts             # Dynamic live weather normalization
│   └── useTermsConsent.ts        # First-launch privacy consent gate
├── utils/                # Pure Business Logic, Formatters & Asset Resolvers
│   ├── imageService.ts           # Semantic 1-to-1 place photography manifest
│   ├── timelineService.ts        # Chronological schedule synthesis
│   └── operatingHoursService.ts  # Verified opening/closing time calculators
└── index.css             # Unified CSS Design Tokens & Typography Scale
```

---

## 3. URL Hash Routing Scheme

| URL Hash | Rendered View | Component |
| :--- | :--- | :--- |
| `#/discover` (default) | Editorial Homepage & Universal Search | `OdishaHero` + `HomeSections` |
| `#/destinations` | Filterable Destination Directory | `DestinationsPage` |
| `#/plan` | Trip Planning Workspace & Generated Itinerary | `ConstraintForm` + `ItineraryView` |
| `#/map` | Interactive Verified Geographical Map | `MapView` (Lazy loaded) |
| `#/saved` | Saved Destination Wishlist | `SavedPlacesPage` (mode: "saved") |
| `#/revisit` | Recently Explored Places History | `SavedPlacesPage` (mode: "revisit") |
| `#/shared/:shareId` | Shared Itinerary Snapshot | `SharedItineraryPage` |
| `#/privacy`, `#/terms` | Legal & Terms of Service | `PrivacyPolicyPage`, `TermsConditionsPage` |
