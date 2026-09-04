import React, { useState, useEffect } from 'react';
import { LocationProvider } from './context/LocationContext';
import { AIProvider, useAI } from './context/AIContext';
import { StitchNavbar, type StitchTab } from './components/stitch/StitchNavbar';
import { StitchFooter } from './components/stitch/StitchFooter';
import { StitchMobileDrawer } from './components/stitch/StitchMobileDrawer';
import { StitchPreferencesModal } from './components/stitch/StitchPreferencesModal';
import { StitchShareModal } from './components/stitch/StitchShareModal';
import { StitchOnboardingModal, type TravelerPreferences } from './components/stitch/StitchOnboardingModal';
import { FloatingAICopilotTrigger } from './components/ai/FloatingAICopilotTrigger';
import { AISidebar } from './components/ai/AISidebar';

import { StitchHomePage } from './pages/stitch/StitchHomePage';
import { StitchDestinationsPage } from './pages/stitch/StitchDestinationsPage';
import type { MapViewMode } from './pages/stitch/StitchMapPage';

const StitchMapPage = React.lazy(() => import('./pages/stitch/StitchMapPage').then((m) => ({ default: m.StitchMapPage })));
const StitchPlannerPage = React.lazy(() => import('./pages/stitch/StitchPlannerPage').then((m) => ({ default: m.StitchPlannerPage })));
const StitchSavedPage = React.lazy(() => import('./pages/stitch/StitchSavedPage').then((m) => ({ default: m.StitchSavedPage })));
const StitchResiliencePage = React.lazy(() => import('./pages/stitch/StitchResiliencePage').then((m) => ({ default: m.StitchResiliencePage })));
const StitchLegalPage = React.lazy(() => import('./pages/stitch/StitchLegalPage').then((m) => ({ default: m.StitchLegalPage })));
const StitchPrivacyPage = React.lazy(() => import('./pages/stitch/StitchPrivacyPage').then((m) => ({ default: m.StitchPrivacyPage })));
const StitchTermsPage = React.lazy(() => import('./pages/stitch/StitchTermsPage').then((m) => ({ default: m.StitchTermsPage })));
const StitchDataTrustPage = React.lazy(() => import('./pages/stitch/StitchDataTrustPage').then((m) => ({ default: m.StitchDataTrustPage })));
const StitchSignInPage = React.lazy(() => import('./pages/stitch/StitchSignInPage').then((m) => ({ default: m.StitchSignInPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="w-full min-h-[60vh] flex flex-col items-center justify-center font-body text-[#70798B]">
    <div className="w-8 h-8 border-2 border-[#B87B22]/30 border-t-[#B87B22] rounded-full animate-spin mb-3" />
    <span className="font-mono text-xs text-[#3D4654]">Loading travel intelligence...</span>
  </div>
);

import { getTabFromHash, getHashForTab } from './utils/navigation';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<StitchTab>(() => {
    try {
      const hashTab = getTabFromHash(window.location.hash);
      return (hashTab as StitchTab) || 'discover';
    } catch {
      return 'discover';
    }
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals & Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Listen for browser hash navigation (e.g. #sign-in, #plan, #map, back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      try {
        const resolved = getTabFromHash(window.location.hash);
        if (resolved) {
          setCurrentTab(resolved as StitchTab);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (tab: StitchTab, params?: Record<string, string>) => {
    setCurrentTab(tab);
    setNavParams(params || {});
    if (params?.query) setSearchQuery(params.query);
    if (params?.category) setSelectedCategory(params.category);
    try {
      const targetHash = getHashForTab(tab);
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', `${window.location.pathname}${window.location.search}${targetHash}`);
      }
    } catch {
      // ignore
    }
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
        onOpenAuth={() => handleNavigate('signin')}
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
        onOpenAuth={() => handleNavigate('signin')}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
      />

      {/* Main View Container with Graceful Suspense Fallback */}
      <main className="flex-1 w-full pt-16 sm:pt-18">
        <React.Suspense fallback={<PageLoadingFallback />}>
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

          {currentTab === 'culture' && (
            <StitchDestinationsPage
              onNavigate={handleNavigate}
              initialQuery=""
              initialCategory="Heritage"
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

          {currentTab === 'privacy' && (
            <StitchPrivacyPage
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'terms' && (
            <StitchTermsPage
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'trust' && (
            <StitchDataTrustPage
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'signin' && (
            <StitchSignInPage
              onNavigate={handleNavigate}
            />
          )}
        </React.Suspense>
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

      {/* Footer (Hidden on dedicated Map application screen) */}
      {currentTab !== 'map' && (
        <StitchFooter onSelectTab={(tab) => handleNavigate(tab)} />
      )}

      {/* Dialogs & Overlays */}
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
