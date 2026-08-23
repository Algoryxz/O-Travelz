import React, { useState, useEffect, useRef } from "react";
import { useItineraryPlanner } from "../store/useItineraryPlanner";
import { useAIConversation } from "../store/useAIConversation";
import { useMapProjection } from "../store/useMapProjection";
import { useConversationHistory, type SavedTripConversation } from "../store/useConversationHistory";
import { useSavedPlaces } from "../store/useSavedPlaces";
import { useRecentPlaces } from "../store/useRecentPlaces";
import { usePlaces } from "../store/usePlaces";
import { getPlaceImageUrl, getPlaceRegion } from "../utils/imageService";
import { ConstraintForm } from "../components/itinerary/ConstraintForm";
import { ErrorAlert } from "../components/itinerary/ErrorAlert";
import { InitialState } from "../components/itinerary/InitialState";
import { LoadingState } from "../components/itinerary/LoadingState";
import { ItineraryView } from "../components/itinerary/ItineraryView";
import { AIConversationPanel } from "../components/ai/AIConversationPanel";
import { AISidebar } from "../components/ai/AISidebar";
import { SettingsModal, type UserTravelPreferences } from "../components/settings/SettingsModal";
import { TopNav, type NavTab } from "../components/nav/TopNav";
import { MobileDrawer } from "../components/nav/MobileDrawer";
import { FloatingNavigationDock } from "../components/nav/FloatingNavigationDock";
import { OdishaHero } from "../components/home/OdishaHero";
import { HomeSections } from "../components/home/HomeSections";
import { DestinationsPage } from "../components/home/DestinationsPage";
import { CategoryExplorePage } from "../components/home/CategoryExplorePage";
import { SavedPlacesPage } from "../components/home/SavedPlacesPage";
import { SharedItineraryPage } from "../components/itinerary/SharedItineraryPage";
import { Footer } from "../components/nav/Footer";
import {
  PlaceDetailsModal,
  type SelectedPlaceInfo,
} from "../components/place/PlaceDetailsModal";
import type { ApiClient } from "../services/api";
import {
  getTabFromHash,
  getHashForTab,
  normalizeHash,
  extractShareIdFromHash,
} from "../utils/navigation";
import {
  Bot,
  CalendarDays,
  MapPin,
  Plus,
  Trash2,
  Compass,
  History,
} from "lucide-react";

import { LocationPermissionModal } from "../components/location/LocationPermissionModal";
import { useGeolocation } from "../hooks/useGeolocation";
import { PrivacyPolicyPage } from "../components/legal/PrivacyPolicyPage";
import { TermsConditionsPage } from "../components/legal/TermsConditionsPage";
import { ContactGrievancePage } from "../components/legal/ContactGrievancePage";
import { TermsConsentGate } from "../components/legal/TermsConsentGate";
import { useTermsConsent } from "../store/useTermsConsent";

// Code-split Leaflet map dependency boundary
const MapView = React.lazy(() => import("../components/map/MapView"));

const MapLoadingFallback: React.FC = () => (
  <div
    data-testid="map-loading-state"
    className="p-8 text-center rounded-3xl bg-[#111827] border border-[#263244] shadow-xs"
  >
    <div className="w-8 h-8 mx-auto rounded-full border-2 border-[#263244] border-t-[#14B8A6] animate-spin mb-3" />
    <h4 className="text-sm font-semibold text-white">Loading Map...</h4>
    <p className="text-xs text-slate-400 mt-1">
      Connecting destination coordinates and route connections.
    </p>
  </div>
);

const ODISHA_HUBS_FOR_DISTANCE: Array<{ name: string; lat: number; lon: number }> = [
  { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245 },
  { name: "Puri", lat: 19.8135, lon: 85.8312 },
  { name: "Konark", lat: 19.8876, lon: 86.0945 },
  { name: "Cuttack", lat: 20.4625, lon: 85.8828 },
  { name: "Chilika Lake", lat: 19.7042, lon: 85.3214 },
  { name: "Daringbadi", lat: 19.9103, lon: 84.1311 },
  { name: "Sambalpur", lat: 21.4669, lon: 83.9812 },
  { name: "Koraput", lat: 18.8135, lon: 82.7123 },
  { name: "Rourkela", lat: 22.2604, lon: 84.8536 },
];

function findClosestOdishaHub(lat: number, lon: number): { name: string; distanceKm: number } {
  let closest = ODISHA_HUBS_FOR_DISTANCE[0];
  let minDistance = Infinity;

  for (const hub of ODISHA_HUBS_FOR_DISTANCE) {
    const dLat = (hub.lat - lat) * (Math.PI / 180);
    const dLon = (hub.lon - lon) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(hub.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = 6371 * c;
    if (dist < minDistance) {
      minDistance = dist;
      closest = hub;
    }
  }

  return { name: closest.name, distanceKm: Math.round(minDistance) };
}

type PlanningMode = "structured" | "ai";
type ResultViewTab = "itinerary" | "map";
type AppView = NavTab | "category" | "settings" | "privacy" | "terms" | "contact" | "shared";

interface ItineraryPlannerPageProps {
  apiClient?: ApiClient;
  initialTab?: AppView;
  initialConsentAccepted?: boolean;
}

export const ItineraryPlannerPage: React.FC<ItineraryPlannerPageProps> = ({
  apiClient,
  initialTab,
  initialConsentAccepted,
}) => {
  const { hasAccepted: hasAcceptedTerms, acceptConsent: handleAcceptTerms } =
    useTermsConsent(initialConsentAccepted);

  const getInitialTab = (): AppView => {
    if (initialTab) return initialTab;
    if (typeof window !== "undefined" && window.location.hash) {
      return getTabFromHash(window.location.hash);
    }
    return "discover";
  };

  const [activeTab, setActiveTab] = useState<AppView>(getInitialTab);
  const [currentShareId, setCurrentShareId] = useState<string | null>(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      return extractShareIdFromHash(window.location.hash);
    }
    return null;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("Nature");
  const [selectedLocation, setSelectedLocation] = useState<string>("Bhubaneswar");
  const [destinationSearch, setDestinationSearch] = useState<string>("");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<PlanningMode>("structured");
  const [activeResultTab, setActiveResultTab] = useState<ResultViewTab>("itinerary");

  // Robust Client-Side Geolocation State Machine Hook
  const {
    status: geoStatus,
    coords: geoCoords,
    errorMessage: geoError,
    isModalOpen: isLocationModalOpen,
    openPrompt: handleOpenLocationPrompt,
    confirmAndRequest: handleAllowLocation,
    retry: handleRetryLocation,
    dismissModal: handleCloseLocationModal,
  } = useGeolocation();

  // Location display calculation - strictly only when status is granted or active
  const isLiveActive = (geoStatus === "granted" || geoStatus === "active") && geoCoords !== null;
  const userCoords = isLiveActive ? { lat: geoCoords.lat, lon: geoCoords.lon } : null;

  let locationText = "";
  if (isLiveActive && geoCoords) {
    const closest = findClosestOdishaHub(geoCoords.lat, geoCoords.lon);
    if (closest.distanceKm <= 500) {
      locationText = `${closest.name}, Odisha`;
    } else {
      locationText = `Odisha (${closest.name} Hub)`;
    }
  }

  // Selected place for modal information
  const [selectedPlaceForModal, setSelectedPlaceForModal] =
    useState<SelectedPlaceInfo | null>(null);

  // Selected place for Map view highlight
  const [selectedMapPlace, setSelectedMapPlace] =
    useState<SelectedPlaceInfo | null>(null);

  const plannerSectionRef = useRef<HTMLDivElement>(null);

  const { savedCount } = useSavedPlaces();
  const { addRecentPlace, count: revisitCount } = useRecentPlaces();
  const { places: allVerifiedPlaces, getPlaceByName } = usePlaces();


  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    saveOrUpdateConversation,
    deleteConversation,
    startNewTrip,
  } = useConversationHistory();

  const {
    constraints,
    itinerary,
    isLoading: isPlannerLoading,
    error: plannerError,
    setConstraints,
    setItinerary,
    planItinerary,
    reset: resetPlanner,
    clearError: clearPlannerError,
  } = useItineraryPlanner();

  const {
    history: aiHistory,
    isLoading: isAiLoading,
    error: aiError,
    aiResponse,
    sendAiPlan,
    setHistory: setAiHistory,
    clearError: clearAiError,
  } = useAIConversation();

  const {
    projection,
    isLoading: isMapLoading,
    error: mapError,
    fetchProjection,
    fetchPlacesProjection,
    clearError: clearMapError,
    reset: resetMap,
  } = useMapProjection();

  const isLoading = isPlannerLoading || isAiLoading;

  // Authoritative backend map projection flow:
  // 1. If an itinerary is active, fetch its projection (stops + hops).
  // 2. If no itinerary is active and traveler opens Map tab, fetch authoritative places projection.
  useEffect(() => {
    if (itinerary) {
      fetchProjection(itinerary, apiClient);
    } else if (activeTab === "map") {
      const placeIds = allVerifiedPlaces.map((p) => p.id);
      fetchPlacesProjection(placeIds, apiClient);
    } else {
      resetMap();
    }
  }, [itinerary, activeTab, allVerifiedPlaces, fetchProjection, fetchPlacesProjection, resetMap, apiClient]);

  // 1. Listen to browser hashchange and popstate events (Browser Back / Forward / Manual URL change)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleHashChange = () => {
      const currentTab = getTabFromHash(window.location.hash);
      const shareId = extractShareIdFromHash(window.location.hash);
      setCurrentShareId(shareId);
      setActiveTab((prev) => (prev !== currentTab ? currentTab : prev));
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);

    // Deep link or invalid hash correction on initial mount
    if (window.location.hash) {
      const shareId = extractShareIdFromHash(window.location.hash);
      if (shareId) {
        setCurrentShareId(shareId);
      } else {
        const resolvedTab = getTabFromHash(window.location.hash);
        const targetHash = getHashForTab(resolvedTab);
        if (normalizeHash(window.location.hash) !== normalizeHash(targetHash)) {
          window.history.replaceState(null, "", targetHash);
        }
      }
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, []);

  // 2. Synchronize activeTab changes to the browser URL hash
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeTab === "shared") return; // preserve specific share link hash

    const targetHash = getHashForTab(activeTab);
    const currentNormalized = normalizeHash(window.location.hash);
    const targetNormalized = normalizeHash(targetHash);

    if (currentNormalized !== targetNormalized) {
      window.history.pushState(null, "", targetHash);
    }
  }, [activeTab]);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === "map" && itinerary) {
      setActiveResultTab("map");
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStructuredPlan = async (newConstraints: typeof constraints) => {
    const plan = await planItinerary(newConstraints, apiClient);
    if (plan) {
      setActiveResultTab("itinerary");
      if (activeTab !== "plan") {
        setActiveTab("plan");
      }
      // Save conversation trip to history
      saveOrUpdateConversation({
        history: aiHistory,
        constraints: newConstraints,
        itinerary: plan,
      });

      // Record all planned stops into User Memory & Revisit Places system
      if (plan.days && plan.days.length > 0) {
        const tripTitle = `${plan.days.length}-Day Odisha Itinerary (${newConstraints?.start || "Odisha"})`;
        plan.days.forEach((day) => {
          day.stops.forEach((stop) => {
            const placeId = stop.place?.id || `stop-${day.day_number}-${stop.sequence}`;
            const placeName = stop.place?.name || "Destination";
            const category = stop.place?.category || "destination";
            const timeDesc = stop.planned_arrival ? `${stop.planned_arrival} - ${stop.planned_departure || "depart"}` : `Stop ${stop.sequence}`;
            addRecentPlace({
              id: placeId,
              name: placeName,
              category,
              location: getPlaceRegion(placeName),
              description: `Day ${day.day_number} (${timeDesc})`,
              imageUrl: getPlaceImageUrl(placeName, category),
              status: "planned",
              tripAssociation: {
                tripId: `trip-${Date.now()}`,
                title: tripTitle,
                date: new Date().toISOString().split("T")[0],
                daysCount: plan.days.length,
              },
            });
          });
        });
      }
    }
  };

  const handleAiPlan = async (userMessage: string) => {
    const response = await sendAiPlan(userMessage, constraints, apiClient);
    if (response) {
      const updatedConstraints = response.changed_constraints || constraints;
      const updatedPlan = response.itinerary || itinerary;

      setConstraints(updatedConstraints);
      if (updatedPlan) {
        setItinerary(updatedPlan);
        setActiveResultTab("itinerary");

        // Record AI planned stops into User Memory & Revisit Places system
        if (updatedPlan.days && updatedPlan.days.length > 0) {
          const tripTitle = `${updatedPlan.days.length}-Day AI Custom Trip (${updatedConstraints?.start || "Odisha"})`;
          updatedPlan.days.forEach((day) => {
            day.stops.forEach((stop) => {
              const placeId = stop.place?.id || `ai-stop-${day.day_number}-${stop.sequence}`;
              const placeName = stop.place?.name || "Destination";
              const category = stop.place?.category || "destination";
              const timeDesc = stop.planned_arrival ? `${stop.planned_arrival} - ${stop.planned_departure || "depart"}` : `AI Stop ${stop.sequence}`;
              addRecentPlace({
                id: placeId,
                name: placeName,
                category,
                location: getPlaceRegion(placeName),
                description: `Day ${day.day_number} (${timeDesc})`,
                imageUrl: getPlaceImageUrl(placeName, category),
                status: "planned",
                tripAssociation: {
                  tripId: `ai-trip-${Date.now()}`,
                  title: tripTitle,
                  date: new Date().toISOString().split("T")[0],
                  daysCount: updatedPlan.days.length,
                },
              });
            });
          });
        }
      }

      saveOrUpdateConversation({
        history: [
          ...aiHistory,
          { role: "user", message: userMessage },
          { role: "assistant", message: response.message },
        ],
        constraints: updatedConstraints,
        itinerary: updatedPlan,
      });
    }
  };

  const handleSelectSavedConversation = (target: SavedTripConversation) => {
    setActiveConversationId(target.id);
    setAiHistory(target.history);
    if (target.constraints) {
      setConstraints(target.constraints);
    }
    setItinerary(target.itinerary);
    if (target.itinerary) {
      setActiveResultTab("itinerary");
      setActiveTab("plan");
    }
  };

  const handleDeleteSavedConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  const handleSelectPlaceFromCategory = (place: SelectedPlaceInfo) => {
    setSelectedPlaceForModal(place);
  };

  const handlePlanTripWithSinglePlace = (place: SelectedPlaceInfo) => {
    setSelectedPlaceForModal(null);
    setActiveTab("plan");
    setActiveMode("structured");

    // Initialize constraints with the place's location or interests
    setConstraints({
      days: 2,
      interests: place.interests || [place.category.toLowerCase()],
      start: place.location || selectedLocation,
    });

    // Auto-scroll to planner form
    setTimeout(() => {
      plannerSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handlePlanWithSavedPlaces = (places: Array<{ name: string; category: string }>) => {
    setActiveTab("plan");
    setActiveMode("structured");

    const interests = Array.from(
      new Set(places.map((p) => p.category.toLowerCase()))
    );

    setConstraints({
      days: Math.min(Math.max(places.length, 1), 7),
      interests: interests.length > 0 ? interests : ["heritage"],
      start: selectedLocation,
    });

    setTimeout(() => {
      plannerSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleViewPlaceOnMap = (place: SelectedPlaceInfo) => {
    setSelectedPlaceForModal(null);
    setSelectedMapPlace(place);
    setActiveTab("map");
    setActiveResultTab("map");
  };

  const handleClearSelectedMapPlace = () => {
    setSelectedMapPlace(null);
  };

  const handleApplyUserPreferences = (prefs: UserTravelPreferences) => {
    setConstraints({
      ...constraints,
      budget_transport_per_day:
        prefs.budgetTier === "budget"
          ? 1000
          : prefs.budgetTier === "balanced"
          ? 3000
          : 6000,
    });
  };
  const handleSurpriseMe = () => {
    if (allVerifiedPlaces && allVerifiedPlaces.length > 0) {
      const randomIndex = Math.floor(Math.random() * allVerifiedPlaces.length);
      const p = allVerifiedPlaces[randomIndex];
      setSelectedPlaceForModal({
        ...p,
        description: p.description ?? undefined,
      });
    }
  };

  const handleHeroSearch = (term: string) => {
    setDestinationSearch(term);
    setActiveTab("destinations");
  };

  const handleHeroSelectDestination = (name: string) => {
    const found = getPlaceByName(name);
    if (found) {
      setSelectedPlaceForModal({
        ...found,
        description: found.description ?? undefined,
      });
    } else {
      setDestinationSearch(name);
      setActiveTab("destinations");
    }
  };

  const handleViewAllDestinations = () => {
    setActiveTab("destinations");
  };

  // FIRST-LAUNCH CONSENT GATE: Main app is inaccessible until terms are accepted
  if (!hasAcceptedTerms) {
    return <TermsConsentGate onAccept={handleAcceptTerms} />;
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#12161E] flex flex-col font-sans antialiased selection:bg-[#B87B22] selection:text-white transition-colors duration-200">
      {/* 1. Header Navigation */}
      <TopNav
        activeTab={activeTab === "category" ? "destinations" : activeTab === "shared" ? "plan" : (activeTab as NavTab)}
        onTabChange={handleTabChange}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        onOpenAI={() => setIsAISidebarOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        savedCount={savedCount}
        revisitCount={revisitCount}
        locationStatus={geoStatus}
        locationText={locationText}
        onRequestLocation={handleOpenLocationPrompt}
      />


      {/* 2. Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeTab === "category" ? "destinations" : activeTab === "shared" ? "plan" : (activeTab as NavTab)}
        onSelectTab={handleTabChange}
        onOpenAI={() => setIsAISidebarOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        savedCount={savedCount}
        revisitCount={revisitCount}
      />

      {/* 3. Main Views Switching */}
      <main className="flex-1">
        {/* VIEW 1: HOME / DISCOVER */}
        {activeTab === "discover" && (
          <div className="space-y-12 pb-16 animate-in fade-in duration-300">
            <OdishaHero
              selectedLocation={selectedLocation}
              destinationSearch={destinationSearch}
              onSearchChange={setDestinationSearch}
              onSearch={handleHeroSearch}
              onSurpriseMe={handleSurpriseMe}
              onSelectDestination={handleHeroSelectDestination}
              onViewAllDestinations={handleViewAllDestinations}
              onNavigateToPlan={() => handleTabChange("plan")}
              onNavigateToMap={() => handleTabChange("map")}
              onNavigateToCopilot={() => setIsAISidebarOpen(true)}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setActiveTab("category");
              }}
              onSelectPlace={(place) => setSelectedPlaceForModal(place)}
            />

            <HomeSections
              selectedLocation={selectedLocation}
              userCoords={userCoords}
              onNavigateToPlan={() => handleTabChange("plan")}
              onNavigateToMap={(highlightPlace) => {
                if (highlightPlace) setSelectedMapPlace(highlightPlace);
                handleTabChange("map");
              }}
              onNavigateToCopilot={() => setIsAISidebarOpen(true)}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setActiveTab("category");
              }}
              onSelectPlace={(place) => setSelectedPlaceForModal(place)}
            />
          </div>
        )}

        {/* VIEW 2: ALL DESTINATIONS DIRECTORY */}
        {activeTab === "destinations" && (
          <DestinationsPage
            selectedLocation={selectedLocation}
            initialSearch={destinationSearch}
            onSelectPlace={(place) => setSelectedPlaceForModal(place)}
            onViewOnMap={(place) => handleViewPlaceOnMap(place)}
            onPlanTripWithPlace={(place) => handlePlanTripWithSinglePlace(place)}
          />
        )}

        {/* VIEW 3: THEMATIC CIRCUITS / CATEGORY EXPLORATION */}
        {activeTab === "category" && (
          <CategoryExplorePage
            categoryName={selectedCategory}
            selectedLocation={selectedLocation}
            onBack={() => handleTabChange("discover")}
            onSelectPlace={handleSelectPlaceFromCategory}
            onPlanWithSinglePlace={handlePlanTripWithSinglePlace}
            onOpenMap={(place) => place && handleViewPlaceOnMap(place)}
            onPlanTripWithCategory={(cat) =>
              handleStructuredPlan({
                days: 2,
                interests: [cat.toLowerCase()],
                start: selectedLocation,
              })
            }
          />
        )}

        {/* VIEW 4: SAVED & REVISIT DESTINATIONS */}
        {(activeTab === "saved" || activeTab === "revisit") && (
          <SavedPlacesPage
            initialViewMode={activeTab === "revisit" ? "revisit" : "saved"}
            onBackToDiscover={() => handleTabChange("discover")}
            onPlanWithSaved={handlePlanWithSavedPlaces}
            onPlanWithSinglePlace={handlePlanTripWithSinglePlace}
            onOpenMap={(place) => place && handleViewPlaceOnMap(place)}
            onSelectPlace={(place) => setSelectedPlaceForModal(place)}
          />
        )}

        {/* VIEW 5: INTERACTIVE MAP & ROUTE EXPLORER */}
        {activeTab === "map" && !itinerary && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
              <div>
                <span className="text-xs font-bold font-mono text-[#B87B22] uppercase tracking-wider">
                  Verified Geographical Explorer
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#12161E] tracking-tight">
                  Odisha Interactive Map
                </h1>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange("plan")}
                className="px-4 py-2 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Compass size={15} />
                <span>Build an Itinerary Route</span>
              </button>
            </div>

            <React.Suspense fallback={<MapLoadingFallback />}>
              <MapView
                projection={projection}
                isLoading={isMapLoading}
                error={mapError}
                allPlaces={allVerifiedPlaces}
                selectedPlace={selectedMapPlace}
                userLocation={userCoords}
                userLocationName={selectedLocation}
                onClearSelectedPlace={handleClearSelectedMapPlace}
                onPlanTripWithPlace={handlePlanTripWithSinglePlace}
                onViewDetails={(p: SelectedPlaceInfo) => setSelectedPlaceForModal(p)}
                onClearError={clearMapError}
              />
            </React.Suspense>
          </div>
        )}

        {/* VIEW 6: ITINERARY PLANNER & RESULTS */}
        {(activeTab === "plan" || (activeTab === "map" && itinerary)) && (
          <div
            ref={plannerSectionRef}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300 text-[#12161E]"
          >
            {/* Planner Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
              <div>
                <span className="text-xs font-bold font-mono text-[#B87B22] uppercase tracking-wider">
                  Deterministic Travel Engine
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#12161E] tracking-tight">
                  Odisha Itinerary Workspace
                </h1>
                <p className="text-xs text-[#70798B] mt-1">
                  Verified routes, topological hops, and curated schedules across all Odisha destinations.
                </p>
              </div>

              {itinerary && (
                <button
                  type="button"
                  onClick={resetPlanner}
                  className="px-3.5 py-1.5 rounded-lg border border-[#E5DFD5] hover:border-[#D1C8BA] bg-[#FFFFFF] text-[#12161E] text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  <span>New Plan</span>
                </button>
              )}
            </div>

            {/* Trip History Strip */}
            {conversations.length > 0 && (
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#B87B22] font-mono font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <History size={13} />
                    Saved Journeys ({conversations.length})
                  </span>
                  <button
                    type="button"
                    onClick={startNewTrip}
                    className="hover:underline text-[11px] cursor-pointer text-[#B87B22]"
                  >
                    + New Journey
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {conversations.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectSavedConversation(conv)}
                        className={`group shrink-0 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-all border ${
                          isActive
                            ? "bg-[#12161E] text-white border-[#12161E] shadow-xs font-bold"
                            : "bg-[#FFFFFF] text-[#3D4654] border-[#E5DFD5] hover:border-[#B87B22]"
                        }`}
                      >
                        <CalendarDays size={13} className={isActive ? "text-[#B87B22]" : "text-[#70798B]"} />
                        <span className="truncate max-w-[160px]">{conv.title}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSavedConversation(conv.id, e)}
                          className="opacity-0 group-hover:opacity-100 hover:text-[#A84825] text-[#70798B] transition-opacity p-0.5 ml-1"
                          aria-label="Delete trip"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mode Switcher: Structured Planner vs AI Copilot Full Panel */}
            <div className="flex items-center p-1 rounded-full bg-[#FAF7F2] border border-[#E5DFD5] w-fit shadow-xs">
              <button
                type="button"
                data-testid="mode-tab-structured"
                onClick={() => setActiveMode("structured")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMode === "structured"
                    ? "bg-[#12161E] text-white shadow-xs"
                    : "text-[#3D4654] hover:text-[#12161E]"
                }`}
              >
                <Compass size={14} />
                <span>Form Planner</span>
              </button>

              <button
                type="button"
                data-testid="mode-tab-ai"
                onClick={() => setActiveMode("ai")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMode === "ai"
                    ? "bg-[#12161E] text-white shadow-xs"
                    : "text-[#3D4654] hover:text-[#12161E]"
                }`}
              >
                <Bot size={14} />
                <span>AI Travel Assistant</span>
              </button>
            </div>

            {/* Planner Form / AI Input Panel */}
            <div className="grid grid-cols-1 gap-6">
              {activeMode === "structured" ? (
                <ConstraintForm
                  initialConstraints={constraints}
                  isLoading={isLoading}
                  isReplanning={Boolean(itinerary)}
                  onSubmit={handleStructuredPlan}
                  onReset={resetPlanner}
                />
              ) : (
                <AIConversationPanel
                  history={aiHistory}
                  isLoading={isAiLoading}
                  aiResponse={aiResponse}
                  onSendMessage={handleAiPlan}
                  onClearError={clearAiError}
                />
              )}
            </div>

            {/* Errors */}
            {plannerError ? (
              <ErrorAlert error={plannerError} onDismiss={clearPlannerError} />
            ) : null}
            {aiError ? <ErrorAlert error={aiError} onDismiss={clearAiError} /> : null}

            {/* Results Area */}
            {isLoading && <LoadingState />}

            {!isLoading && !itinerary && <InitialState />}

            {!isLoading && itinerary && (
              <div className="space-y-6 pt-4 border-t border-[#E5DFD5]">
                {/* Result Tab Selector: Itinerary Timeline vs Map Route */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center p-1 rounded-full bg-[#FAF7F2] border border-[#E5DFD5] shadow-xs">
                    <button
                      type="button"
                      data-testid="result-tab-itinerary"
                      onClick={() => setActiveResultTab("itinerary")}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeResultTab === "itinerary"
                          ? "bg-[#12161E] text-white shadow-xs"
                          : "text-[#3D4654] hover:text-[#12161E]"
                      }`}
                    >
                      <CalendarDays size={14} />
                      <span>Timeline Schedule</span>
                    </button>

                    <button
                      type="button"
                      data-testid="result-tab-map"
                      onClick={() => setActiveResultTab("map")}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeResultTab === "map"
                          ? "bg-[#12161E] text-white shadow-xs"
                          : "text-[#3D4654] hover:text-[#12161E]"
                      }`}
                    >
                      <MapPin size={14} />
                      <span>Route &amp; Hop Map</span>
                    </button>
                  </div>
                </div>

                {/* Tab 1: Itinerary Timeline View */}
                {activeResultTab === "itinerary" && (
                  <ItineraryView
                    itinerary={itinerary}
                    onOpenMap={() => setActiveResultTab("map")}
                    onViewPlaceDetails={(place) =>
                      setSelectedPlaceForModal({
                        id: place.id,
                        name: place.name,
                        category: place.category,
                        location: getPlaceRegion(place.name),
                        imageUrl: getPlaceImageUrl(place.name, place.category),
                      })
                    }
                  />
                )}

                {/* Tab 2: Map Projection View */}
                {activeResultTab === "map" && (
                  <React.Suspense fallback={<MapLoadingFallback />}>
                    <MapView
                      projection={projection}
                      isLoading={isMapLoading}
                      error={mapError}
                      allPlaces={allVerifiedPlaces}
                      userLocation={userCoords}
                      userLocationName={selectedLocation}
                      onPlanTripWithPlace={handlePlanTripWithSinglePlace}
                      onViewDetails={(p: SelectedPlaceInfo) => setSelectedPlaceForModal(p)}
                      onClearError={clearMapError}
                    />
                  </React.Suspense>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 7: LEGAL & PRIVACY PAGES */}
        {activeTab === "privacy" && (
          <PrivacyPolicyPage onBack={() => handleTabChange("discover")} />
        )}
        {activeTab === "terms" && (
          <TermsConditionsPage onBack={() => handleTabChange("discover")} />
        )}
        {activeTab === "contact" && (
          <ContactGrievancePage onBack={() => handleTabChange("discover")} />
        )}

        {/* VIEW 8: PUBLIC READ-ONLY SHARED TRIP */}
        {activeTab === "shared" && (
          <SharedItineraryPage
            shareId={currentShareId}
            onPlanOwnTrip={() => handleTabChange("plan")}
            onOpenMap={() => handleTabChange("map")}
            onViewPlaceDetails={(place) =>
              setSelectedPlaceForModal({
                id: place.id,
                name: place.name,
                category: place.category,
                location: getPlaceRegion(place.name),
                imageUrl: getPlaceImageUrl(place.name, place.category),
              })
            }
          />
        )}
      </main>

      {/* 4. Place Details Interactive Modal */}
      {selectedPlaceForModal && (
        <PlaceDetailsModal
          place={selectedPlaceForModal}
          onClose={() => setSelectedPlaceForModal(null)}
          onPlanTrip={(p) => handlePlanTripWithSinglePlace(p)}
          onViewOnMap={(p) => handleViewPlaceOnMap(p)}
        />
      )}

      {/* 5. Two-Step Geolocation Permission Explanation Modal */}
      <LocationPermissionModal
        isOpen={isLocationModalOpen}
        onClose={handleCloseLocationModal}
        onConfirm={handleAllowLocation}
        isLoading={geoStatus === "requesting"}
        error={geoError}
        onRetry={handleRetryLocation}
      />


      {/* 6. AI Copilot Side Drawer */}
      <AISidebar
        isOpen={isAISidebarOpen}
        onClose={() => setIsAISidebarOpen(false)}
        history={aiHistory}
        isLoading={isAiLoading}
        aiResponse={aiResponse}
        onSendMessage={handleAiPlan}
      />

      {/* 7. Settings & Travel Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onApplyPreferences={handleApplyUserPreferences}
      />

      {/* Floating AI Agent Dock Trigger (21st.dev Agent Dock Pattern) */}
      {!isAISidebarOpen && (
        <aside
          aria-label="AI Travel Assistant Quick Launcher"
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2"
        >
          <button
            type="button"
            data-testid="floating-ai-dock-btn"
            onClick={() => setIsAISidebarOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#111827]/95 hover:bg-[#172235] text-white border border-[#263244] hover:border-[#8B5CF6]/60 shadow-2xl backdrop-blur-xl transition-all duration-300 group cursor-pointer"
            aria-label="Open AI Copilot Travel Assistant"
          >
            <div className="w-7 h-7 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA] group-hover:scale-110 transition-transform">
              <Bot size={15} />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-bold text-white flex items-center gap-1.5 leading-none">
                <span>O-Travelz AI</span>
                <span className="live-dot" />
              </div>
              <div className="text-[9px] text-[#A78BFA] font-mono leading-none mt-1">
                Travel Assistant
              </div>
            </div>
          </button>
        </aside>
      )}

      {/* Floating Navigation Dock */}
      <FloatingNavigationDock
        activeTab={activeTab === "category" ? "destinations" : (activeTab as NavTab)}
        onSelectTab={handleTabChange}
        savedCount={savedCount}
      />

      {/* 8. Comprehensive Footer with Legal Links & Location-Aware Hub Intelligence */}
      <Footer
        selectedLocation={selectedLocation}
        onNavigate={handleTabChange}
        onOpenPrivacy={() => handleTabChange("privacy")}
        onOpenTerms={() => handleTabChange("terms")}
        onOpenContact={() => handleTabChange("contact")}
        onSelectCategory={(cat: string) => {
          setSelectedCategory(cat);
          setActiveTab("category");
        }}
      />
    </div>
  );
};

export default ItineraryPlannerPage;
