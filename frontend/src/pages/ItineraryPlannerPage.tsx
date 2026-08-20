import React, { useState, useEffect, useRef } from "react";
import { useItineraryPlanner } from "../store/useItineraryPlanner";
import { useAIConversation } from "../store/useAIConversation";
import { useMapProjection } from "../store/useMapProjection";
import { useConversationHistory } from "../store/useConversationHistory";
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
import { MapView } from "../components/map/MapView";
import { TopNav, type NavTab } from "../components/nav/TopNav";
import { MobileDrawer } from "../components/nav/MobileDrawer";
import { OdishaHero } from "../components/home/OdishaHero";
import { HomeSections } from "../components/home/HomeSections";
import { DestinationsPage } from "../components/home/DestinationsPage";
import { CategoryExplorePage } from "../components/home/CategoryExplorePage";
import { SavedPlacesPage } from "../components/home/SavedPlacesPage";
import { Footer } from "../components/nav/Footer";
import {
  PlaceDetailsModal,
  type SelectedPlaceInfo,
} from "../components/place/PlaceDetailsModal";
import type { ApiClient } from "../services/api";
import {
  Bot,
  CalendarDays,
  MapPin,
  Plus,
  Trash2,
  Sparkles,
  Compass,
  History,
  Sliders,
  CheckCircle2,
} from "lucide-react";

type PlanningMode = "structured" | "ai";
type ResultViewTab = "itinerary" | "map";
type AppView = NavTab | "category" | "settings";

interface ItineraryPlannerPageProps {
  apiClient?: ApiClient;
}

export const ItineraryPlannerPage: React.FC<ItineraryPlannerPageProps> = ({ apiClient }) => {
  const [activeTab, setActiveTab] = useState<AppView>("discover");
  const [selectedCategory, setSelectedCategory] = useState<string>("Nature");
  const [selectedLocation, setSelectedLocation] = useState<string>("Bhubaneswar");
  const [userCoords, setUserCoords] = useState<{lat: number, lon: number} | null>(null);
  const [destinationSearch, setDestinationSearch] = useState<string>("");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<PlanningMode>("structured");
  const [activeResultTab, setActiveResultTab] = useState<ResultViewTab>("itinerary");

  // Selected place for modal information
  const [selectedPlaceForModal, setSelectedPlaceForModal] =
    useState<SelectedPlaceInfo | null>(null);

  // Selected place for Map view highlight
  const [selectedMapPlace, setSelectedMapPlace] =
    useState<SelectedPlaceInfo | null>(null);

  const plannerSectionRef = useRef<HTMLDivElement>(null);

  const { savedPlaces, savedCount } = useSavedPlaces();
  const { recentPlaces, addRecentPlace, count: revisitCount } = useRecentPlaces();
  const { places: allVerifiedPlaces, getPlaceByName } = usePlaces();
  const [newTripFeedback, setNewTripFeedback] = useState<string | null>(null);
  const [isLiveLocation, setIsLiveLocation] = useState<boolean>(true);

  const fetchLiveLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setIsLiveLocation(true);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          setIsLiveLocation(false);
        }
      );
    }
  };

  const handleToggleLiveLocation = () => {
    if (isLiveLocation) {
      setIsLiveLocation(false);
      setUserCoords(null);
    } else {
      fetchLiveLocation();
    }
  };

  useEffect(() => {
    fetchLiveLocation();
  }, []);

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
    setAiResponse,
    clearError: clearAiError,
    reset: resetAi,
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
              rating: 4.8,
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
                rating: 4.9,
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

      // Save conversation turn to history
      saveOrUpdateConversation({
        history: [
          ...aiHistory,
          { role: "user", message: userMessage },
          { role: "assistant", message: response.message, response },
        ],
        constraints: updatedConstraints,
        itinerary: updatedPlan,
        promptForTitle: userMessage,
      });
    }
  };

  const handleStartNewTrip = () => {
    if (itinerary) {
      saveOrUpdateConversation({
        history: aiHistory,
        constraints,
        itinerary,
      });
      setNewTripFeedback("Previous itinerary saved to 'Your Trips'. Starting a fresh plan.");
      setTimeout(() => setNewTripFeedback(null), 4000);
    }
    startNewTrip();
    resetPlanner();
    resetAi();
    resetMap();
  };

  const handleSelectSavedConversation = (id: string) => {
    const target = conversations.find((c) => c.id === id);
    if (!target) return;

    setActiveConversationId(target.id);
    setAiHistory(target.history);
    setConstraints(target.constraints);
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
    setConstraints((prev) => ({
      ...prev,
      pace: prefs.pacePreference,
      budget_transport_per_day:
        prefs.budgetTier === "budget"
          ? 1000
          : prefs.budgetTier === "moderate"
          ? 3000
          : 6000,
    }));
  };

  return (
    <div className="min-h-screen bg-[#08120F] text-[#FBF8F1] flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* 1. Header Navigation */}
      <TopNav
        activeTab={activeTab === "category" ? "destinations" : (activeTab as NavTab)}
        onTabChange={handleTabChange}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        onOpenAI={() => setIsAISidebarOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        savedCount={savedCount}
        revisitCount={revisitCount}
        isLiveLocation={isLiveLocation}
        onToggleLiveLocation={handleToggleLiveLocation}
        onRefreshLocation={fetchLiveLocation}
      />

      {/* 2. Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeTab === "category" ? "destinations" : (activeTab as NavTab)}
        onSelectTab={handleTabChange}
        onOpenAI={() => setIsAISidebarOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        savedCount={savedCount}
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
              onNavigateToMap={(place) => {
                if (place) {
                  setSelectedMapPlace(place);
                }
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
          <div className="animate-in fade-in duration-300">
            <DestinationsPage
              selectedLocation={selectedLocation}
              onSelectPlace={(place) => setSelectedPlaceForModal(place)}
              onPlanTrip={(place) => handlePlanTripWithSinglePlace(place)}
              onViewOnMap={(place) => handleViewPlaceOnMap(place)}
            />
          </div>
        )}

        {/* VIEW 3: CATEGORY EXPLORE PAGE */}
        {activeTab === "category" && (
          <div className="animate-in fade-in duration-300">
            <CategoryExplorePage
              categoryName={selectedCategory}
              onBack={() => setActiveTab("discover")}
              onSelectPlace={handleSelectPlaceFromCategory}
              onPlanWithSinglePlace={handlePlanTripWithSinglePlace}
              onOpenMap={handleViewPlaceOnMap}
            />
          </div>
        )}

        {/* VIEW 4: SAVED PLACES / WISHLIST / REVISIT */}
        {(activeTab === "saved" || activeTab === "revisit") && (
          <div className="animate-in fade-in duration-300">
            <SavedPlacesPage
              initialViewMode={activeTab === "revisit" ? "revisit" : "saved"}
              onBackToDiscover={() => setActiveTab("discover")}
              onPlanWithSaved={handlePlanWithSavedPlaces}
              onPlanWithSinglePlace={handlePlanTripWithSinglePlace}
              onOpenMap={(place) => {
                if (place) {
                  setSelectedMapPlace(place);
                }
                setActiveTab("map");
              }}
              onSelectPlace={(place) => setSelectedPlaceForModal(place)}
            />
          </div>
        )}

        {/* VIEW 5: STANDALONE MAP TAB */}
        {activeTab === "map" && !itinerary && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Verified Geographical Explorer
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight">
                  Odisha Interactive Map
                </h1>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange("plan")}
                className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Compass size={15} />
                <span>Build an Itinerary Route</span>
              </button>
            </div>

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
              onViewDetails={(p) => setSelectedPlaceForModal(p)}
              onClearError={clearMapError}
            />
          </div>
        )}

        {/* VIEW 6: ITINERARY PLANNER & RESULTS */}
        {(activeTab === "plan" || (activeTab === "map" && itinerary)) && (
          <div
            ref={plannerSectionRef}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300"
          >
            {/* Header & Trip Management Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-900/40">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-mono font-bold">
                  <span className="live-dot" />
                  <span>ODISHA ROUTE &amp; TRANSIT PLANNER</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                  Plan Your Odisha Journey
                </h1>
                <p className="text-xs sm:text-sm text-gray-300">
                  Combine deterministic scheduling with AI Copilot recommendations.
                </p>
              </div>

              {/* Trip Controls & History Pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                {itinerary && (
                  <button
                    type="button"
                    data-testid="start-new-trip-button"
                    onClick={handleStartNewTrip}
                    className="px-3.5 py-2 rounded-2xl bg-[#09221b] border border-emerald-800/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Start New Trip</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsAISidebarOpen(true)}
                  className="px-3.5 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs font-bold transition-all hover:bg-emerald-900 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Bot size={14} className="text-emerald-400" />
                  <span>AI Copilot Panel</span>
                </button>
              </div>
            </div>

            {/* User feedback alert when new trip is started */}
            {newTripFeedback && (
              <div className="p-3.5 rounded-2xl bg-emerald-950 text-emerald-200 border border-emerald-700 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{newTripFeedback}</span>
              </div>
            )}

            {/* Saved Trips Carousel / Strip if history exists */}
            {conversations.length > 0 && (
              <div className="p-4 rounded-3xl bg-[#061e17] border border-emerald-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <History size={13} />
                    <span>Your Trips ({conversations.length})</span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    Switch between active and past planned itineraries
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {conversations.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectSavedConversation(conv.id)}
                        className={`group flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-medium border transition-all shrink-0 cursor-pointer ${
                          isActive
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-md font-bold"
                            : "bg-[#09221b] text-gray-300 border-emerald-800/50 hover:border-emerald-500/50 hover:bg-emerald-900/40"
                        }`}
                      >
                        <CalendarDays size={13} className={isActive ? "text-white" : "text-emerald-400"} />
                        <span className="truncate max-w-[160px]">{conv.title}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSavedConversation(conv.id, e)}
                          className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-gray-400 transition-opacity p-0.5 ml-1"
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
            <div className="flex items-center p-1 rounded-2xl bg-[#081d17] border border-emerald-800/50 w-fit shadow-inner">
              <button
                type="button"
                data-testid="mode-tab-structured"
                onClick={() => setActiveMode("structured")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMode === "structured"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-emerald-950/40"
                }`}
              >
                <Compass size={14} />
                <span>Form Planner</span>
              </button>

              <button
                type="button"
                data-testid="mode-tab-ai"
                onClick={() => setActiveMode("ai")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMode === "ai"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-emerald-950/40"
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
                />
              )}
            </div>

            {/* Errors */}
            {plannerError && (
              <ErrorAlert error={plannerError} onDismiss={clearPlannerError} />
            )}
            {aiError && <ErrorAlert error={aiError} onDismiss={clearAiError} />}

            {/* Results Area */}
            {isLoading && <LoadingState />}

            {!isLoading && !itinerary && <InitialState />}

            {!isLoading && itinerary && (
              <div className="space-y-6 pt-4 border-t border-emerald-900/40">
                {/* Result Tab Selector: Itinerary Timeline vs Map Route */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center p-1 rounded-2xl bg-[#081d17] border border-emerald-800/50 shadow-inner">
                    <button
                      type="button"
                      data-testid="result-tab-itinerary"
                      onClick={() => setActiveResultTab("itinerary")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeResultTab === "itinerary"
                          ? "bg-emerald-600 text-white shadow-md"
                          : "text-gray-300 hover:text-white hover:bg-emerald-950/40"
                      }`}
                    >
                      <CalendarDays size={14} />
                      <span>Timeline Schedule</span>
                    </button>

                    <button
                      type="button"
                      data-testid="result-tab-map"
                      onClick={() => setActiveResultTab("map")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeResultTab === "map"
                          ? "bg-emerald-600 text-white shadow-md"
                          : "text-gray-300 hover:text-white hover:bg-emerald-950/40"
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
                  <MapView
                    projection={projection}
                    isLoading={isMapLoading}
                    error={mapError}
                    allPlaces={allVerifiedPlaces}
                    userLocation={userCoords}
                    userLocationName={selectedLocation}
                    onPlanTripWithPlace={handlePlanTripWithSinglePlace}
                    onViewDetails={(p) => setSelectedPlaceForModal(p)}
                    onClearError={clearMapError}
                  />
                )}
              </div>
            )}
          </div>
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

      {/* 5. AI Copilot Side Drawer */}
      <AISidebar
        isOpen={isAISidebarOpen}
        onClose={() => setIsAISidebarOpen(false)}
        history={aiHistory}
        isLoading={isAiLoading}
        aiResponse={aiResponse}
        onSendMessage={handleAiPlan}
      />

      {/* 6. Settings & Travel Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onApplyPreferences={handleApplyUserPreferences}
      />

      {/* 7. Comprehensive Footer with Location-Aware Hub Intelligence */}
      <Footer
        selectedLocation={selectedLocation}
        onNavigate={handleTabChange}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveTab("category");
        }}
      />
    </div>
  );
};
