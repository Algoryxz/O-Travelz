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
  Radio,
  Navigation,
} from "lucide-react";

export type NavTab = "discover" | "destinations" | "map" | "plan" | "saved";

interface TopNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  onOpenMobileDrawer: () => void;
  onOpenAI?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
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
  isLiveLocation = false,
  onToggleLiveLocation,
  onRefreshLocation,
}) => {
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [isRefreshingLoc, setIsRefreshingLoc] = useState(false);
  const locationMenuRef = useRef<HTMLDivElement>(null);

  // Close location menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        locationMenuRef.current &&
        !locationMenuRef.current.contains(e.target as Node)
      ) {
        setShowLocationMenu(false);
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
    <header className="sticky top-0 z-40 w-full bg-[#08120F]/95 backdrop-blur-xl border-b border-emerald-950/80 px-4 sm:px-6 py-2.5 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile menu & Location Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          data-testid="mobile-menu-button"
          onClick={onOpenMobileDrawer}
          className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 hover:bg-emerald-950/60 hover:text-white transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Location Dropdown Pill with Attached Live Location Status */}
        <div className="relative" ref={locationMenuRef}>
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0b241d] border border-emerald-800/50 shadow-md">
            {/* Base Location Selector Pill */}
            <button
              type="button"
              data-testid="location-selector-button"
              onClick={() => setShowLocationMenu(!showLocationMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-emerald-100 hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-emerald-950/50"
            >
              <MapPin size={14} className="text-emerald-400 shrink-0" />
              <span className="truncate max-w-[95px] sm:max-w-[130px] font-display">{selectedLocation}</span>
              <ChevronDown size={13} className="text-emerald-400/80 ml-0.5" />
            </button>

            {/* Live Location Visual Status Toggle Button */}
            <button
              type="button"
              data-testid="toggle-live-location-btn"
              onClick={onToggleLiveLocation}
              title={isLiveLocation ? "Live Location is ON (Click to toggle)" : "Live Location is OFF (Click to enable)"}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                isLiveLocation
                  ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                  : "bg-rose-950/40 text-rose-300/90 border border-rose-900/50 hover:border-rose-700/60 shadow-[0_0_8px_rgba(244,63,94,0.15)]"
              }`}
            >
              {isLiveLocation ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)] shrink-0" />
              )}
              <span className={isLiveLocation ? "text-emerald-200 [text-shadow:0_0_10px_rgba(16,185,129,0.4)]" : "text-rose-200"}>
                Live Location
              </span>
            </button>

            {/* Refresh GPS Button */}
            {isLiveLocation && onRefreshLocation && (
              <button
                type="button"
                data-testid="refresh-location-btn"
                onClick={handleRefresh}
                title="Refresh current live coordinates"
                className="p-1.5 text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-900/50 rounded-lg transition-colors cursor-pointer"
                aria-label="Refresh location"
              >
                <RefreshCw size={12} className={isRefreshingLoc ? "animate-spin text-emerald-300" : ""} />
              </button>
            )}
          </div>

          {/* Compact Obsidian Location Dropdown Menu */}
          {showLocationMenu && (
            <div className="absolute left-0 top-full mt-2 w-76 p-3 rounded-2xl bg-[#0B0F19] border border-emerald-800/60 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-emerald-900/50 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Select Base Hub
                </span>
                <span className="text-[10px] text-emerald-300/60 font-mono">Odisha</span>
              </div>

              {/* Quick Live Location Action inside menu */}
              <div className="mb-2 p-2 rounded-xl bg-[#06251D] border border-emerald-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isLiveLocation ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  )}
                  <span className="text-xs font-bold text-white">
                    {isLiveLocation ? "Live Location Active" : "Live Location Off"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onToggleLiveLocation?.();
                    setShowLocationMenu(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                    isLiveLocation
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                  }`}
                >
                  {isLiveLocation ? "Turn Off" : "Turn On"}
                </button>
              </div>

              {/* Hub Destinations List */}
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
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
                        ? "bg-emerald-950 text-emerald-200 border border-emerald-700/70 font-semibold shadow-xs"
                        : "hover:bg-emerald-950/40 text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {loc.name === "Chilika Lake" ? (
                        <Waves size={15} className="text-emerald-400 shrink-0" />
                      ) : (
                        <LocateFixed size={15} className="text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-white">{loc.name}</div>
                        <div className="text-[10px] text-emerald-300/60">{loc.subtitle}</div>
                      </div>
                    </div>
                    {selectedLocation === loc.name && (
                      <Check size={14} className="text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Official O-Travelz Brand Logo */}
      <div
        data-testid="brand-logo-lockup"
        className="flex items-center gap-2.5 cursor-pointer select-none group"
        onClick={() => onTabChange("discover")}
      >
        <img
          src="/images/logo.png"
          alt="O-Travelz Logo"
          className="h-10 sm:h-11 w-auto rounded-xl object-contain shadow-xs border border-emerald-900/40 group-hover:border-emerald-500/50 transition-colors"
        />
        <div className="hidden md:block text-left">
          <div className="font-display font-extrabold text-sm text-white tracking-tight leading-none">
            O-Travelz
          </div>
          <div className="text-[10px] text-emerald-400 font-mono tracking-wider font-semibold mt-0.5">
            safe • secure • smart
          </div>
        </div>
      </div>

      {/* Right: Desktop Navigation Links, AI Trigger & Settings */}
      <div className="flex items-center gap-2 sm:gap-3">
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
          <button
            type="button"
            data-testid="nav-tab-discover"
            onClick={() => onTabChange("discover")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "discover"
                ? "text-emerald-300 bg-emerald-950/90 border border-emerald-700/50 shadow-xs"
                : "text-gray-300 hover:text-white hover:bg-emerald-950/40"
            }`}
          >
            Discover
          </button>
          <button
            type="button"
            data-testid="nav-tab-destinations"
            onClick={() => onTabChange("destinations")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "destinations"
                ? "text-emerald-300 bg-emerald-950/90 border border-emerald-700/50 shadow-xs"
                : "text-gray-300 hover:text-white hover:bg-emerald-950/40"
            }`}
          >
            Destinations
          </button>
          <button
            type="button"
            data-testid="nav-tab-map"
            onClick={() => onTabChange("map")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "map"
                ? "text-emerald-300 bg-emerald-950/90 border border-emerald-700/50 shadow-xs"
                : "text-gray-300 hover:text-white hover:bg-emerald-950/40"
            }`}
          >
            Map
          </button>
          <button
            type="button"
            data-testid="nav-tab-plan"
            onClick={() => onTabChange("plan")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "plan"
                ? "text-emerald-300 bg-emerald-950/90 border border-emerald-700/50 shadow-xs"
                : "text-gray-300 hover:text-white hover:bg-emerald-950/40"
            }`}
          >
            Plan Trip
          </button>
          <button
            type="button"
            data-testid="nav-tab-saved"
            onClick={() => onTabChange("saved")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "saved"
                ? "text-emerald-300 bg-emerald-950/90 border border-emerald-700/50 shadow-xs"
                : "text-gray-300 hover:text-white hover:bg-emerald-950/40"
            }`}
          >
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-950 border border-rose-800/80 text-rose-300 text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* AI Travel Assistant Trigger Button */}
        <button
          type="button"
          data-testid="open-ai-planner-btn"
          onClick={onOpenAI}
          title="Open AI Travel Planner"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-200 border border-emerald-700/60 text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Bot size={14} className="text-emerald-400" />
          <span className="hidden sm:inline">AI Planner</span>
        </button>

        {/* Settings Button */}
        <button
          type="button"
          data-testid="topbar-settings-btn"
          onClick={onOpenSettings}
          title="Settings & Options"
          className="w-8 h-8 rounded-xl bg-[#09221b] border border-emerald-800/40 hover:border-emerald-500/50 text-gray-300 hover:text-emerald-300 flex items-center justify-center transition-all cursor-pointer shadow-xs"
          aria-label="Settings"
        >
          <Settings size={15} className="hover:rotate-45 transition-transform duration-300" />
        </button>

        {/* Quick Action Plan Trip Button */}
        <button
          type="button"
          data-testid="quick-plan-trip-btn"
          onClick={() => onTabChange("plan")}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Sparkles size={13} />
          <span>Plan Trip</span>
        </button>
      </div>
    </header>
  );
};

export default TopNav;
