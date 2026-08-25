import React, { useState, useEffect } from 'react';
import { LocationProvider } from './context/LocationContext';
import { StitchNavbar, type StitchTab } from './components/stitch/StitchNavbar';
import { StitchFooter } from './components/stitch/StitchFooter';
import { StitchMobileDrawer } from './components/stitch/StitchMobileDrawer';
import { StitchAuthModal } from './components/stitch/StitchAuthModal';
import { StitchPreferencesModal } from './components/stitch/StitchPreferencesModal';
import { StitchShareModal } from './components/stitch/StitchShareModal';
import { StitchOnboardingModal, type TravelerPreferences } from './components/stitch/StitchOnboardingModal';
import { FloatingAICopilotTrigger } from './components/ai/FloatingAICopilotTrigger';
import { AISidebar } from './components/ai/AISidebar';
import { useAIConversation } from './store/useAIConversation';
import { useConversationHistory } from './store/useConversationHistory';

import { StitchHomePage } from './pages/stitch/StitchHomePage';
import { StitchDestinationsPage } from './pages/stitch/StitchDestinationsPage';
import { StitchMapPage, type MapViewMode } from './pages/stitch/StitchMapPage';
import { StitchPlannerPage } from './pages/stitch/StitchPlannerPage';
import { StitchSavedPage } from './pages/stitch/StitchSavedPage';
import { StitchResiliencePage } from './pages/stitch/StitchResiliencePage';
import { StitchLegalPage } from './pages/stitch/StitchLegalPage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<StitchTab>('discover');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals & Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);
  const [preferences, setPreferences] = useState<TravelerPreferences | null>(null);
  const [navParams, setNavParams] = useState<Record<string, string>>({});

  // AI Copilot State
  const ai = useAIConversation();
  const historyStore = useConversationHistory();

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
    <LocationProvider>
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
          isOpen={isAICopilotOpen}
          onClick={() => setIsAICopilotOpen(true)}
        />

        {/* AI Travel Copilot Sidebar */}
        <AISidebar
          isOpen={isAICopilotOpen}
          onClose={() => setIsAICopilotOpen(false)}
          isLoading={ai.isLoading}
          error={ai.error}
          history={ai.history}
          aiResponse={ai.aiResponse}
          onSendMessage={(msg) => ai.converse(msg)}
          onClearError={ai.clearError}
          hasItinerary={false}
          conversations={historyStore.conversations}
          activeConversationId={historyStore.activeConversationId}
          onSelectConversation={(id) => historyStore.setActiveConversationId(id)}
          onNewTrip={() => {
            ai.reset();
            historyStore.startNewTrip();
          }}
          onDeleteConversation={(id) => historyStore.deleteConversation(id)}
          onViewItineraryTab={() => {
            setIsAICopilotOpen(false);
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
    </LocationProvider>
  );
};

export default App;
