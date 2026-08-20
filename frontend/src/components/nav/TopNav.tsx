import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  ChevronDown,
  Menu,
  Check,
  LocateFixed,
  Waves,
  Sparkles,
  Bot,
  Settings,
  RefreshCw,
  Compass,
  Bookmark,
  History,
  LayoutDashboard,
  Map as MapIcon,
} from "lucide-react";

export type NavTab = "discover" | "destinations" | "map" | "plan" | "saved" | "revisit";

interface TopNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  onOpenMobileDrawer: () => void;
  onOpenAI?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
  revisitCount?: number;
  isLiveLocation?: boolean;
  onToggleLiveLocation?: () => void;
  onRefreshLocation?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  selectedLocation,
  onLocationChange,
  onOpenMobileDrawer,
  onOpenAI,
  onOpenSettings,
  savedCount = 0,
  revisitCount = 0,
  isLiveLocation = false,
  onToggleLiveLocation,
  onRefreshLocation,
}) => {
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [isRefreshingLoc, setIsRefreshingLoc] = useState(false);
  const locationMenuRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        locationMenuRef.current &&
        !locationMenuRef.current.contains(e.target as Node)
      ) {
        setShowLocationMenu(false);
      }
      if (
        navMenuRef.current &&
        !navMenuRef.current.contains(e.target as Node)
      ) {
        setShowNavMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshingLoc(true);
    if (onRefreshLocation) {
      await onRefreshLocation();
    }
    setTimeout(() => setIsRefreshingLoc(false), 800);
  };

  const locations = [
    { name: "Bhubaneswar", subtitle: "Capital region & Old Town" },
    { name: "Puri", subtitle: "Coastal heritage & beaches" },
    { name: "Chilika Lake", subtitle: "Wetland & bird sanctuary" },
    { name: "Konark", subtitle: "Sun Temple heritage" },
    { name: "Daringbadi", subtitle: "Hill station & pine forests" },
    { name: "Sambalpur", subtitle: "Hirakud & Western Odisha" },
    { name: "Koraput", subtitle: "Highlands & tribal heritage" },
    { name: "Cuttack", subtitle: "Silver city & Mahanadi river" },
    { name: "Rourkela", subtitle: "Steel city & northern hills" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08120F]/90 backdrop-blur-md border-b border-emerald-900/30 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Area: Logo & Location Control */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Mobile drawer toggle */}
          <button
            type="button"
            data-testid="mobile-menu-button"
            onClick={onOpenMobileDrawer}
            className="lg:hidden p-2 -ml-1 text-gray-300 hover:text-white rounded-lg hover:bg-emerald-950/50 transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Sleek Brand Logo Lockup */}
          <div
            data-testid="brand-logo-lockup"
            className="flex items-center gap-2 cursor-pointer select-none group"
            onClick={() => onTabChange("discover")}
          >
            <img
              src="/images/logo.png"
              alt="O-Travelz"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="hidden md:block text-left">
              <span className="font-display font-bold text-sm text-white tracking-tight leading-none block">
                O-Travelz
              </span>
              <span className="text-[9px] text-emerald-400/90 font-mono tracking-wider block">
                safe • secure • smart
              </span>
            </div>
          </div>

          {/* Sleek Compact Location Control */}
          <div className="relative" ref={locationMenuRef}>
            <div className="flex items-center rounded-full bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/40 transition-all text-xs">
              <button
                type="button"
                data-testid="location-selector-button"
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-gray-200 hover:text-white font-medium transition-colors cursor-pointer"
                title="Select destination hub"
              >
                <MapPin size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate max-w-[85px] sm:max-w-[120px] font-sans font-semibold text-xs text-emerald-100">
                  {selectedLocation}
                </span>
                <ChevronDown size={11} className="text-emerald-400/70 shrink-0" />
              </button>

              <button
                type="button"
                data-testid="toggle-live-location-btn"
                onClick={onToggleLiveLocation}
                title={isLiveLocation ? "Live Location is ON (Click to toggle)" : "Live Location is OFF (Click to enable)"}
                className="flex items-center gap-1 px-2.5 py-1 mr-1 rounded-full text-[10px] font-mono font-semibold transition-all cursor-pointer select-none hover:opacity-90"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isLiveLocation
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse"
                      : "bg-rose-500/80"
                  }`}
                />
                <span className={isLiveLocation ? "text-emerald-300" : "text-gray-400"}>
                  Live Location
                </span>
              </button>

              {isLiveLocation && onRefreshLocation && (
                <button
                  type="button"
                  data-testid="refresh-location-btn"
                  onClick={handleRefresh}
                  title="Refresh GPS position"
                  className="p-1 mr-1 text-emerald-400/80 hover:text-emerald-200 rounded-full transition-colors cursor-pointer"
                  aria-label="Refresh location"
                >
                  <RefreshCw size={11} className={isRefreshingLoc ? "animate-spin text-emerald-300" : ""} />
                </button>
              )}
            </div>

            {/* Location Selector Dropdown Popover */}
            {showLocationMenu && (
              <div className="absolute left-0 top-full mt-2 w-72 p-2.5 rounded-2xl bg-[#091813] border border-emerald-700/50 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white">
                <div className="flex items-center justify-between px-2 py-1 border-b border-emerald-900/40 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                    Explore Regional Hub
                  </span>
                  <span className="text-[10px] text-emerald-300/60 font-mono">9 Hubs</span>
                </div>

                <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
                  {locations.map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => {
                        onLocationChange(loc.name);
                        setShowLocationMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                        selectedLocation === loc.name
                          ? "bg-emerald-900/60 text-emerald-200 font-semibold"
                          : "hover:bg-emerald-950/50 text-gray-300 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {loc.name === "Chilika Lake" ? (
                          <Waves size={14} className="text-emerald-400 shrink-0" />
                        ) : (
                          <LocateFixed size={14} className="text-emerald-400 shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-semibold text-white">{loc.name}</div>
                          <div className="text-[10px] text-emerald-300/60">{loc.subtitle}</div>
                        </div>
                      </div>
                      {selectedLocation === loc.name && (
                        <Check size={13} className="text-emerald-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs (Lightweight, Understated) */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
          {[
            { id: "discover", label: "Discover", testId: "nav-tab-discover" },
            { id: "destinations", label: "Destinations", testId: "nav-tab-destinations" },
            { id: "map", label: "Map", testId: "nav-tab-map" },
            { id: "plan", label: "Plan Trip", testId: "nav-tab-plan" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={tab.testId}
                onClick={() => onTabChange(tab.id as NavTab)}
                className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "text-emerald-200 bg-emerald-950/70 border border-emerald-700/40 shadow-xs font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-emerald-950/30"
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          {/* Saved Places */}
          <button
            type="button"
            data-testid="nav-tab-saved"
            onClick={() => onTabChange("saved")}
            className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "saved"
                ? "text-emerald-200 bg-emerald-950/70 border border-emerald-700/40 shadow-xs font-semibold"
                : "text-gray-300 hover:text-white hover:bg-emerald-950/30"
            }`}
          >
            <Bookmark size={13} className="text-emerald-400/90" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-950 border border-rose-800/70 text-rose-300 text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* Revisit Places */}
          <button
            type="button"
            data-testid="nav-tab-revisit"
            onClick={() => onTabChange("revisit")}
            className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "revisit"
                ? "text-amber-200 bg-amber-950/70 border border-amber-700/40 shadow-xs font-semibold"
                : "text-gray-300 hover:text-white hover:bg-emerald-950/30"
            }`}
          >
            <History size={13} className="text-amber-400/90" />
            <span>Revisit</span>
            {revisitCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-950 border border-amber-800/70 text-amber-300 text-[10px] font-bold">
                {revisitCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Area: AI Copilot, Settings & Plan CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Navigate dropdown for smaller screens / accessibility */}
          <div className="relative lg:hidden" ref={navMenuRef}>
            <button
              type="button"
              data-testid="top-left-nav-dropdown-btn"
              onClick={() => setShowNavMenu(!showNavMenu)}
              className="p-1.5 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Menu"
            >
              <Compass size={16} />
            </button>

            {showNavMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 p-2 rounded-2xl bg-[#091813] border border-emerald-700/50 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white">
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => { onTabChange("discover"); setShowNavMenu(false); }}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold ${activeTab === "discover" ? "bg-emerald-900/60 text-emerald-200" : "text-gray-300"}`}
                  >
                    <LayoutDashboard size={14} className="text-emerald-400" />
                    <span>Discover</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { onTabChange("destinations"); setShowNavMenu(false); }}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold ${activeTab === "destinations" ? "bg-emerald-900/60 text-emerald-200" : "text-gray-300"}`}
                  >
                    <Compass size={14} className="text-emerald-400" />
                    <span>Destinations</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { onTabChange("map"); setShowNavMenu(false); }}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold ${activeTab === "map" ? "bg-emerald-900/60 text-emerald-200" : "text-gray-300"}`}
                  >
                    <MapIcon size={14} className="text-emerald-400" />
                    <span>Map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { onTabChange("plan"); setShowNavMenu(false); }}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold ${activeTab === "plan" ? "bg-emerald-900/60 text-emerald-200" : "text-gray-300"}`}
                  >
                    <Sparkles size={14} className="text-emerald-400" />
                    <span>Plan Trip</span>
                  </button>
                  <button
                    type="button"
                    data-testid="nav-menu-revisit-places"
                    onClick={() => { onTabChange("revisit"); setShowNavMenu(false); }}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold ${activeTab === "revisit" ? "bg-amber-900/60 text-amber-200" : "text-gray-300"}`}
                  >
                    <History size={14} className="text-amber-400" />
                    <span>Revisit Places</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Copilot Action Pill */}
          <button
            type="button"
            data-testid="open-ai-planner-btn"
            onClick={onOpenAI}
            title="Ask AI Travel Copilot"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/40 text-emerald-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Bot size={13} className="text-emerald-400" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Settings Icon */}
          <button
            type="button"
            data-testid="topbar-settings-btn"
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 text-gray-300 hover:text-emerald-200 hover:bg-emerald-950/50 rounded-full transition-colors cursor-pointer"
            aria-label="Settings"
          >
            <Settings size={15} />
          </button>

          {/* Plan Trip CTA */}
          <button
            type="button"
            data-testid="quick-plan-trip-btn"
            onClick={() => onTabChange("plan")}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Sparkles size={12} />
            <span>Plan Trip</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
