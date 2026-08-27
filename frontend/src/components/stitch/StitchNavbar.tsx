import React, { useState, useRef, useEffect } from 'react';
import { useLocation, CANONICAL_ODISHA_HUBS, type CanonicalHub } from '../../context/LocationContext';
import { useSavedPlaces } from '../../store/useSavedPlaces';
import { AuthStatusButton } from '../auth/AuthStatusButton';

export type StitchTab = 'discover' | 'destinations' | 'map' | 'plan' | 'saved' | 'resilience' | 'legal' | 'signin';

interface StitchNavbarProps {
  currentTab: StitchTab;
  onSelectTab: (tab: StitchTab) => void;
  onOpenAuth?: () => void;
  onOpenPreferences?: () => void;
  onToggleMobileMenu?: () => void;
  weatherSummary?: string;
  onOpenOnboarding?: () => void;
}

export const StitchNavbar: React.FC<StitchNavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onOpenPreferences,
  onToggleMobileMenu,
  weatherSummary = "Bhubaneswar: 32°C, Sunny",
  onOpenOnboarding,
}) => {
  const handleAuthAction = onOpenAuth || (() => onSelectTab('signin'));
  const {
    locationName,
    city,
    isLive,
    locateUser,
    selectHub,
    toggleLiveLocation,
    isLoading,
  } = useLocation();

  const { savedCount } = useSavedPlaces();
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const locationMenuRef = useRef<HTMLDivElement>(null);

  // Close location menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationMenuRef.current && !locationMenuRef.current.contains(e.target as Node)) {
        setIsLocationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCityLabel = locationName || city || 'Bhubaneswar';

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#FBF9F5]/95 backdrop-blur-xl border-b border-[#E5DFD5] shadow-xs transition-all">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3 lg:gap-6">
        
        {/* LEFT ZONE: Brand Lockup with Odisha Visual Identity */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => onSelectTab('discover')}
            className="flex items-center gap-2.5 hover:opacity-95 transition-opacity focus:outline-none cursor-pointer text-left select-none"
          >
            <img
              src="/logo.jpeg"
              alt="O-Travelz Logo"
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#B87B22]/30 shadow-xs shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-display font-bold text-[#12161E] italic tracking-tight leading-none">
                  O-Travelz
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#70798B] tracking-wide leading-none mt-0.5 whitespace-nowrap">
                safe • secure • smart
              </span>
            </div>
          </button>
        </div>

        {/* CENTER ZONE: Interactive Location & Live-GPS Control + Primary Navigation Links */}
        <div className="hidden md:flex items-center gap-3 lg:gap-5 xl:gap-7 min-w-0">
          
          {/* Enhanced Location & Live-GPS Popover Trigger */}
          <div className="relative shrink-0" ref={locationMenuRef}>
            <button
              onClick={() => setIsLocationMenuOpen((prev) => !prev)}
              title="Click to toggle Live Location GPS or select a manual Odisha destination"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2EEE7] hover:bg-[#EAE4DA] border border-[#E5DFD5] text-xs font-mono text-[#3D4654] transition-all cursor-pointer shadow-xs select-none"
            >
              <span
                className={`material-symbols-outlined text-sm shrink-0 ${
                  isLive ? 'text-[#2F523E]' : 'text-[#B87B22]'
                }`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isLive ? 'my_location' : 'location_on'}
              </span>

              <span className="font-semibold text-[#12161E] whitespace-nowrap max-w-[140px] lg:max-w-[180px] truncate">
                {isLoading ? 'Detecting GPS...' : activeCityLabel}
              </span>

              {/* Live Status Pill Badge */}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border transition-colors ${
                  isLive
                    ? 'bg-[#2F523E]/10 text-[#2F523E] border-[#2F523E]/30'
                    : 'bg-black/5 text-[#70798B] border-[#E5DFD5]'
                }`}
              >
                {isLive ? 'Live: ON' : 'Live: OFF'}
              </span>

              <span className="material-symbols-outlined text-xs text-[#70798B]">
                {isLocationMenuOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Location Control Dropdown Menu */}
            {isLocationMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-[#E5DFD5] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-[#12161E]">
                
                {/* Live GPS Toggle Row */}
                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isLive ? 'bg-[#2F523E] animate-pulse ring-2 ring-[#2F523E]/30' : 'bg-[#70798B]'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-[#12161E]">
                        {isLive ? 'Live Location: ON' : 'Live Location: OFF'}
                      </div>
                      <div className="text-[10px] text-[#70798B] truncate">
                        {isLive ? 'Using device coordinates' : 'Using manual selection'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await toggleLiveLocation();
                      setIsLocationMenuOpen(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-xs shrink-0 ${
                      isLive
                        ? 'bg-[#2F523E] text-white hover:bg-[#233F30]'
                        : 'bg-[#B87B22] text-white hover:bg-[#A0691B]'
                    }`}
                  >
                    {isLive ? 'Turn OFF' : 'Turn ON'}
                  </button>
                </div>

                {/* Manual Selection Header */}
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#70798B] px-2 py-1">
                  Or Select Manual Location
                </div>

                {/* Canonical Hubs List */}
                <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
                  {CANONICAL_ODISHA_HUBS.map((hub: CanonicalHub) => {
                    const isSelected = !isLive && (locationName.includes(hub.city) || city.includes(hub.city));
                    return (
                      <button
                        key={hub.id}
                        type="button"
                        onClick={() => {
                          selectHub(hub);
                          setIsLocationMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#B87B22]/15 text-[#B87B22] font-bold'
                            : 'text-[#3D4654] hover:bg-[#FAF7F2] hover:text-[#12161E]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="material-symbols-outlined text-sm text-[#70798B]">
                            location_on
                          </span>
                          <span className="truncate">{hub.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#70798B] shrink-0">
                          {hub.district}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Clean Single-Line Navigation Links (No Duplicate Saved Journey) */}
          <div className="flex items-center gap-3.5 lg:gap-5 xl:gap-6 font-body text-xs lg:text-sm font-medium">
            <button
              onClick={() => onSelectTab('discover')}
              className={`whitespace-nowrap transition-colors focus:outline-none cursor-pointer pb-0.5 border-b-2 ${
                currentTab === 'discover'
                  ? 'text-[#B87B22] border-[#B87B22] font-semibold'
                  : 'text-[#3D4654] border-transparent hover:text-[#B87B22]'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => onSelectTab('destinations')}
              className={`whitespace-nowrap transition-colors focus:outline-none cursor-pointer pb-0.5 border-b-2 ${
                currentTab === 'destinations'
                  ? 'text-[#B87B22] border-[#B87B22] font-semibold'
                  : 'text-[#3D4654] border-transparent hover:text-[#B87B22]'
              }`}
            >
              Destinations
            </button>
            <button
              onClick={() => onSelectTab('map')}
              className={`whitespace-nowrap transition-colors focus:outline-none cursor-pointer pb-0.5 border-b-2 ${
                currentTab === 'map'
                  ? 'text-[#B87B22] border-[#B87B22] font-semibold'
                  : 'text-[#3D4654] border-transparent hover:text-[#B87B22]'
              }`}
            >
              Map &amp; Routes
            </button>
            <button
              onClick={() => onSelectTab('plan')}
              className={`whitespace-nowrap transition-colors focus:outline-none cursor-pointer pb-0.5 border-b-2 ${
                currentTab === 'plan'
                  ? 'text-[#B87B22] border-[#B87B22] font-semibold'
                  : 'text-[#3D4654] border-transparent hover:text-[#B87B22]'
              }`}
            >
              Plan Trip
            </button>
          </div>
        </div>

        {/* RIGHT ZONE: Unified Saved Places & Utility Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 shrink-0">
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              title="Traveler Persona & Preferences"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F2EEE7] rounded-full text-xs font-mono text-[#3D4654] border border-[#E5DFD5] transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm text-[#B87B22]">psychology</span>
              <span>Preferences</span>
            </button>
          )}

          {/* Unified Single Concept: Saved Places */}
          <button
            onClick={() => onSelectTab('saved')}
            title="Saved Sanctuaries & Landmarks"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all focus:outline-none cursor-pointer whitespace-nowrap shadow-xs ${
              currentTab === 'saved'
                ? 'bg-[#B87B22] text-white border-[#B87B22]'
                : 'bg-[#F2EEE7] hover:bg-[#EAE4DA] text-[#12161E] border-[#E5DFD5]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-base ${
                currentTab === 'saved' ? 'text-white' : 'text-[#B87B22]'
              }`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bookmark
            </span>
            <span className="font-semibold">Saved Places</span>
            {savedCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                currentTab === 'saved' ? 'bg-white text-[#B87B22]' : 'bg-[#B87B22] text-white'
              }`}>
                {savedCount}
              </span>
            )}
          </button>

          {/* Desktop & Tablet Auth Control */}
          <div className="flex items-center shrink-0">
            <AuthStatusButton onOpenAuth={handleAuthAction} />
          </div>

          {/* Mobile Drawer Trigger */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-[#3D4654] hover:text-[#12161E] hover:bg-[#F2EEE7] transition-colors focus:outline-none cursor-pointer ml-1"
              aria-label="Open mobile menu"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
