import React, { useState, useEffect } from 'react';
import { LocationProvider } from './context/LocationContext';
import { AIProvider, useAI } from './context/AIContext';
import { StitchNavbar, type StitchTab } from './components/stitch/StitchNavbar';
import { StitchFooter } from './components/stitch/StitchFooter';
import { StitchMobileDrawer } from './components/stitch/StitchMobileDrawer';
import { StitchAuthModal } from './components/stitch/StitchAuthModal';
import { StitchPreferencesModal } from './components/stitch/StitchPreferencesModal';
import { StitchShareModal } from './components/stitch/StitchShareModal';
import { StitchOnboardingModal, type TravelerPreferences } from './components/stitch/StitchOnboardingModal';
import { FloatingAICopilotTrigger } from './components/ai/FloatingAICopilotTrigger';
import { AISidebar } from './components/ai/AISidebar';

import { StitchHomePage } from './pages/stitch/StitchHomePage';
import { StitchDestinationsPage } from './pages/stitch/StitchDestinationsPage';
import { StitchMapPage, type MapViewMode } from './pages/stitch/StitchMapPage';
import { StitchPlannerPage } from './pages/stitch/StitchPlannerPage';
import { StitchSavedPage } from './pages/stitch/StitchSavedPage';
import { StitchResiliencePage } from './pages/stitch/StitchResiliencePage';
import { StitchLegalPage } from './pages/stitch/StitchLegalPage';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<StitchTab>('discover');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals & Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [preferences, setPreferences] = useState<TravelerPreferences | null>(null);
  const [navParams, setNavParams] = useState<Record<string, string>>({});

  // Global AI Copilot Context
  const {
    isCopilotOpen,
    openCopilot,
    closeCopilot,
    isLoading,
    error,
    history,
    aiResponse,
    sendMessage,
    retryLast,
    clearError,
    activeContextLabel,
    contextualPrompts,
    clearAppContext,
    conversations,
    activeConversationId,
    selectConversation,
    deleteConversation,
    startNewTrip,
    language,
  } = useAI();

  // Load saved preferences if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem('otravelz_traveler_preferences');
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleNavigate = (tab: StitchTab, params?: Record<string, string>) => {
    setCurrentTab(tab);
    setNavParams(params || {});
    if (params?.query) setSearchQuery(params.query);
    if (params?.category) setSelectedCategory(params.category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#12161E] font-body selection:bg-[#B87B22]/20 selection:text-[#B87B22] relative">
      {/* Top Navbar */}
      <StitchNavbar
        currentTab={currentTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
      />

      {/* Mobile Drawer */}
      <StitchMobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentTab={currentTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full">
        {currentTab === 'discover' && (
          <StitchHomePage
            onNavigate={handleNavigate}
            onSearch={handleSearch}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        )}

        {currentTab === 'destinations' && (
          <StitchDestinationsPage
            onNavigate={handleNavigate}
            initialQuery={searchQuery}
            initialCategory={selectedCategory}
          />
        )}

        {currentTab === 'map' && (
          <StitchMapPage
            onNavigate={handleNavigate}
            onOpenShare={() => setIsShareOpen(true)}
            initialPlaceId={navParams.placeId}
            initialMode={(navParams.mode as MapViewMode) || 'destinations'}
          />
        )}

        {currentTab === 'plan' && (
          <StitchPlannerPage
            onNavigate={handleNavigate}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            initialPlaceId={navParams.placeId}
          />
        )}

        {currentTab === 'saved' && (
          <StitchSavedPage
            onNavigate={handleNavigate}
            onOpenShare={() => setIsShareOpen(true)}
          />
        )}

        {currentTab === 'resilience' && (
          <StitchResiliencePage
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'legal' && (
          <StitchLegalPage
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Persistent Floating AI Copilot Trigger [ ✦ AI ] */}
      <FloatingAICopilotTrigger
        isOpen={isCopilotOpen}
        onClick={openCopilot}
      />

      {/* AI Travel Copilot Sidebar */}
      <AISidebar
        isOpen={isCopilotOpen}
        onClose={closeCopilot}
        isLoading={isLoading}
        error={error}
        history={history}
        aiResponse={aiResponse}
        onSendMessage={(msg) => sendMessage(msg)}
        onClearError={clearError}
        onRetry={retryLast}
        hasItinerary={false}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewTrip={startNewTrip}
        onDeleteConversation={deleteConversation}
        activeContextLabel={activeContextLabel}
        contextualPrompts={contextualPrompts}
        onClearContext={clearAppContext}
        language={language}
        onViewItineraryTab={() => {
          closeCopilot();
          handleNavigate('plan');
        }}
      />

      {/* Footer */}
      <StitchFooter onSelectTab={(tab) => handleNavigate(tab)} />

      {/* Dialogs & Overlays */}
      <StitchAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <StitchPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />

      <StitchShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <StitchOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSavePreferences={(prefs) => setPreferences(prefs)}
        initialPreferences={preferences || undefined}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LocationProvider>
      <AIProvider>
        <AppContent />
      </AIProvider>
    </LocationProvider>
  );
};

export default App;
