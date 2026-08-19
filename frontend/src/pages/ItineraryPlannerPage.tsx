import React, { useState, useEffect, useRef } from "react";
import { useItineraryPlanner } from "../store/useItineraryPlanner";
import { useAIConversation } from "../store/useAIConversation";
import { useMapProjection } from "../store/useMapProjection";
import { useConversationHistory } from "../store/useConversationHistory";
import { useSavedPlaces } from "../store/useSavedPlaces";
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
import {
  PlaceDetailsModal,
  type SelectedPlaceInfo,
} from "../components/place/PlaceDetailsModal";
import type { ApiClient } from "../api/client";
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
    clearError: clearMapError,
    reset: resetMap,
  } = useMapProjection();

  const isLoading = isPlannerLoading || isAiLoading;

  // Whenever an itinerary is produced or updated, fetch its map projection
  useEffect(() => {
    if (itinerary) {
      fetchProjection(itinerary, apiClient);
    } else {
      resetMap();
    }
  }, [itinerary, fetchProjection, resetMap, apiClient]);

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
    }
  };

  const handleAiPlan = async (userMessage: string) => {
    const response = await sendAiPlan(userMessage, itinerary ? constraints : null, apiClient);
    if (response) {
      let updatedPlan = itinerary;
      let updatedConstraints = constraints;

      if (response.itinerary) {
        updatedPlan = response.itinerary;
        setItinerary(response.itinerary);
        setActiveResultTab("itinerary");
        if (activeTab !== "plan") {
          setActiveTab("plan");
        }
      }
      if (response.changed_constraints) {
        updatedConstraints = response.changed_constraints;
        setConstraints(response.changed_constraints);
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
    startNewTrip();
    resetPlanner();
    resetAi();
    resetMap();
  };

  const handleSelectSavedConversation = (id: string) => {
    const target = conversations.find((c) => c.id === id);
    if (!target) return;

    setActiveConversationId(id);
    if (target.constraints) {
      setConstraints(target.constraints);
    }
    setItinerary(target.itinerary);
    setAiHistory(target.history);
    if (target.history.length > 0) {
      const lastAssistantTurn = [...target.history]
        .reverse()
        .find((t) => t.role === "assistant");
      if (lastAssistantTurn) {
        setAiResponse({
          message: lastAssistantTurn.message,
          status: "success",
          itinerary: target.itinerary,
          clarification: null,
          changed_constraints: target.constraints,
        });
      }
    }
    setActiveTab("plan");
    setActiveResultTab("itinerary");
  };

  const handleSearchHero = (term: string) => {
    setDestinationSearch(term);
    setActiveTab("destinations");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSurpriseMe = () => {
    handleAiPlan("Plan an exciting 2-day trip in Odisha");
    setActiveMode("ai");
    setActiveTab("plan");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectHeroDestination = (dest: SelectedPlaceInfo) => {
    setSelectedPlaceForModal(dest);
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setActiveTab("category");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePlanWithCategory = (category: string) => {
    setConstraints({
      ...constraints,
      interests: [category.toLowerCase()],
    });
    setActiveTab("plan");
    setActiveMode("structured");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleViewPlaceOnMap = (place: SelectedPlaceInfo) => {
    setSelectedMapPlace(place);
    setSelectedPlaceForModal(null);
    setActiveTab("map");
    setActiveResultTab("map");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePlanTripWithPlace = (place: SelectedPlaceInfo) => {
    setConstraints({
      ...constraints,
      start: place.name,
    });
    setSelectedPlaceForModal(null);
    setActiveTab("plan");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePreferencesChange = (newPrefs: UserTravelPreferences) => {
    if (newPrefs.interests && newPrefs.interests.length > 0) {
      setConstraints({
        ...constraints,
        interests: newPrefs.interests,
      });
    }
  };


  const availableMapPointsCount =
    projection?.features.filter((f) => f.geometry_status === "available").length ?? 0;

  return (
    <div className="min-h-screen bg-[#f8faf8] dark:bg-[#08120f] font-body text-gray-900 dark:text-gray-100 flex flex-col selection:bg-emerald-600 selection:text-white transition-colors duration-200">
      {/* Top Navigation Bar */}
      <TopNav
        activeTab={activeTab === "category" ? "discover" : (activeTab as NavTab)}
        onTabChange={handleTabChange}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        onOpenAI={() => setIsAISidebarOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        savedCount={savedCount}
      />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeTab === "category" ? "discover" : (activeTab as NavTab)}
        onSelectTab={handleTabChange}
        onOpenAI={() => setIsAISidebarOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        savedCount={savedCount}
      />

      {/* Persistent AI Sidebar */}
      <AISidebar
        isOpen={isAISidebarOpen}
        onClose={() => setIsAISidebarOpen(false)}
        isLoading={isLoading}
        error={aiError}
        history={aiHistory}
        aiResponse={aiResponse}
        onSend={handleAiPlan}
        onClearError={clearAiError}
        hasItinerary={!!itinerary}
        activeItinerary={itinerary}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectSavedConversation}
        onNewTrip={handleStartNewTrip}
        onDeleteConversation={deleteConversation}
        onViewItineraryTab={() => {
          setActiveTab("plan");
          setActiveResultTab("itinerary");
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onPreferencesChange={handlePreferencesChange}
      />

      {/* Place Details Modal */}
      {selectedPlaceForModal && (
        <PlaceDetailsModal
          place={selectedPlaceForModal}
          onClose={() => setSelectedPlaceForModal(null)}
          onViewOnMap={handleViewPlaceOnMap}
          onPlanTrip={handlePlanTripWithPlace}
        />
      )}

      {/* 1. DISCOVER VIEW */}
      {activeTab === "discover" && (
        <div className="space-y-12">
          {/* Hero Section */}
          <OdishaHero
            selectedLocation={selectedLocation}
            onSearch={handleSearchHero}
            onSurpriseMe={handleSurpriseMe}
            onSelectDestination={(destName) =>
              handleSelectHeroDestination({
                name: destName,
                category: "Destination",
                description: `Explore the sights, culture, and beauty of ${destName}.`,
              })
            }
            onViewAllDestinations={() => setActiveTab("destinations")}
          />

          {/* Discovery & Contextual Home Sections with 2 Coverflow Carousels */}
          <HomeSections
            selectedLocation={selectedLocation}
            onNavigateToPlan={() => setActiveTab("plan")}
            onNavigateToMap={(place) => {
              if (place) {
                handleViewPlaceOnMap(place);
              } else {
                setActiveTab("map");
                setActiveResultTab("map");
              }
            }}
            onNavigateToCopilot={() => {
              setIsAISidebarOpen(true);
            }}
            onSelectCategory={handleSelectCategory}
            onSelectPlace={(place) => setSelectedPlaceForModal(place)}
          />
        </div>
      )}

      {/* 2. ALL DESTINATIONS DISCOVERY VIEW */}
      {activeTab === "destinations" && (
        <DestinationsPage
          initialSearch={destinationSearch}
          onSelectPlace={(place) => setSelectedPlaceForModal(place)}
          onViewOnMap={handleViewPlaceOnMap}
          onPlanTripWithPlace={handlePlanTripWithPlace}
        />
      )}

      {/* 3. CATEGORY EXPLORATION VIEW */}
      {activeTab === "category" && (
        <CategoryExplorePage
          category={selectedCategory}
          selectedLocation={selectedLocation}
          onBack={() => setActiveTab("discover")}
          onPlanTripWithCategory={handlePlanWithCategory}
          onOpenMap={(place) => {
            if (place) {
              handleViewPlaceOnMap(place);
            } else {
              setActiveTab("map");
              setActiveResultTab("map");
            }
          }}
          onSelectPlace={(place) => setSelectedPlaceForModal(place)}
        />
      )}

      {/* 4. SAVED PLACES VIEW */}
      {activeTab === "saved" && (
        <SavedPlacesPage
          onBackToDiscover={() => setActiveTab("discover")}
          onPlanWithSaved={(places) => {
            const interests = Array.from(
              new Set(places.map((p) => p.category.toLowerCase().split(" ")[0]))
            );
            setConstraints({
              ...constraints,
              interests: interests.length > 0 ? interests : [],
              start: places[0]?.name || null,
            });
            setActiveTab("plan");
            setActiveMode("structured");
          }}
          onOpenMap={(place) => {
            if (place) {
              handleViewPlaceOnMap(place);
            } else {
              setActiveTab("map");
              setActiveResultTab("map");
            }
          }}
          onSelectPlace={(place) => setSelectedPlaceForModal(place)}
        />
      )}

      {/* 5. MAP FULL VIEW */}
      {activeTab === "map" && (
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-slate-800">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="live-dot" /> ODISHA ROUTE &amp; TRANSIT MAP
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight">
                Interactive Map
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("plan")}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Open Trip Planner
            </button>
          </div>

          <MapView
            projection={projection}
            isLoading={isMapLoading}
            error={mapError}
            selectedPlace={selectedMapPlace}
            onClearSelectedPlace={() => setSelectedMapPlace(null)}
            onPlanTripWithPlace={handlePlanTripWithPlace}
            onClearError={clearMapError}
          />
        </main>
      )}

      {/* 6. PLAN TRIP WORKSPACE */}
      {(activeTab === "plan" || activeTab === "discover") && (
        <main
          ref={plannerSectionRef}
          id="planner-workspace"
          className={`max-w-7xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8 ${
            activeTab === "discover" ? "pt-4 border-t border-gray-200/60 dark:border-slate-800" : ""
          }`}
        >
          {/* Planner Workspace Header */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b241d] text-white border border-emerald-800/40 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="live-dot" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
                  Odisha Travel Planner
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
                Transportation-Aware Itinerary Planner
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl leading-relaxed">
                Plan realistic itineraries across Odisha with local transport, interactive maps,
                and smart AI recommendations.
              </p>
            </div>
          </div>

          {/* Main Grid with Trip History Sidebar & Planning Center */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar: Conversation / Trip History */}
            <aside
              data-testid="trip-history-sidebar"
              className="lg:col-span-4 space-y-4"
            >
              {/* New Trip Button */}
              <button
                type="button"
                data-testid="new-trip-button"
                onClick={handleStartNewTrip}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>New Trip</span>
              </button>

              {/* Saved Trips Box */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-mono">
                    <History size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Your Trips</span>
                  </div>
                  {conversations.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {conversations.length}
                    </span>
                  )}
                </div>

                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500 space-y-1">
                    <p>No saved trips yet.</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      Plan a trip with the form or AI copilot to store it here.
                    </p>
                  </div>
                ) : (
                  <div
                    data-testid="saved-trips-list"
                    className="space-y-1.5 max-h-80 overflow-y-auto pr-1"
                  >
                    {conversations.map((conv) => {
                      const isActive = activeConversationId === conv.id;
                      const dateStr = new Date(conv.timestamp).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      });

                      return (
                        <div
                          key={conv.id}
                          data-testid={`trip-history-item-${conv.id}`}
                          onClick={() => handleSelectSavedConversation(conv.id)}
                          className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 font-semibold"
                              : "bg-gray-50/70 dark:bg-slate-800/70 border-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs truncate font-display font-bold text-gray-900 dark:text-white">
                              {conv.title}
                            </div>
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-2">
                              <span>{dateStr}</span>
                              {conv.itinerary && (
                                <span>· {conv.itinerary.days.length}d</span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            data-testid={`delete-trip-${conv.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            aria-label="Delete trip"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>

            {/* Right Center: Forms, AI Copilot & Results */}
            <div className="lg:col-span-8 space-y-6">
              {/* Mode Selector Tabs */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs max-w-md">
                <button
                  type="button"
                  data-testid="mode-tab-structured"
                  onClick={() => setActiveMode("structured")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeMode === "structured"
                      ? "bg-[#059669] text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <CalendarDays size={14} />
                  <span>Structured Form</span>
                </button>
                <button
                  type="button"
                  data-testid="mode-tab-ai"
                  onClick={() => setActiveMode("ai")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeMode === "ai"
                      ? "bg-[#059669] text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Bot size={14} />
                  <span>{itinerary ? "AI Refinement" : "AI Trip Assistant"}</span>
                </button>
              </div>

              {/* Mode Panel Rendering */}
              <div className="transition-all duration-200">
                {activeMode === "structured" ? (
                  <ConstraintForm
                    initialConstraints={constraints}
                    isLoading={isLoading}
                    isReplanning={!!itinerary}
                    onSubmit={handleStructuredPlan}
                    onReset={handleStartNewTrip}
                  />
                ) : (
                  <AIConversationPanel
                    currentConstraints={constraints}
                    hasItinerary={!!itinerary}
                    isLoading={isLoading}
                    error={aiError}
                    aiResponse={aiResponse}
                    history={aiHistory}
                    onSend={handleAiPlan}
                    onClearError={clearAiError}
                  />
                )}
              </div>

              {/* Error Alert Display for Planner */}
              {plannerError != null && (
                <ErrorAlert error={plannerError} onDismiss={clearPlannerError} />
              )}

              {/* Dynamic State Rendering */}
              {isLoading && <LoadingState />}

              {!isLoading && !itinerary && !plannerError && !aiResponse && <InitialState />}

              {/* Results Area with View Switcher (Itinerary Schedule vs Map) */}
              {!isLoading && itinerary && (
                <div className="space-y-6 pt-4">
                  {/* View Switcher Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        data-testid="result-tab-itinerary"
                        onClick={() => setActiveResultTab("itinerary")}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          activeResultTab === "itinerary"
                            ? "bg-gray-900 text-white shadow-md"
                            : "bg-white dark:bg-slate-850 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700"
                        }`}
                      >
                        <CalendarDays size={14} />
                        <span>Itinerary Schedule</span>
                      </button>
                      <button
                        type="button"
                        data-testid="result-tab-map"
                        onClick={() => setActiveResultTab("map")}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          activeResultTab === "map"
                            ? "bg-gray-900 text-white shadow-md"
                            : "bg-white dark:bg-slate-850 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700"
                        }`}
                      >
                        <MapPin size={14} />
                        <span>Interactive Map</span>
                        {availableMapPointsCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-mono">
                            {availableMapPointsCount}
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <span className="font-bold text-gray-900 dark:text-white">{itinerary.days.length}</span>{" "}
                      {itinerary.days.length === 1 ? "Day" : "Days"} ·{" "}
                      <span className="font-bold text-gray-900 dark:text-white">{availableMapPointsCount}</span> Mapped Destinations
                    </div>
                  </div>

                  {/* Active Result View Display */}
                  {activeResultTab === "itinerary" ? (
                    <ItineraryView itinerary={itinerary} />
                  ) : (
                    <MapView
                      projection={projection}
                      isLoading={isMapLoading}
                      error={mapError}
                      selectedPlace={selectedMapPlace}
                      onClearSelectedPlace={() => setSelectedMapPlace(null)}
                      onPlanTripWithPlace={handlePlanTripWithPlace}
                      onClearError={clearMapError}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default ItineraryPlannerPage;
