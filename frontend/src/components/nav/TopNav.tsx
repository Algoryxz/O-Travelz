import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  ChevronDown,
  Menu,
  Check,
  LocateFixed,
  Waves,
  Sparkles,
  Sun,
  Moon,
  Bot,
  Sliders,
} from "lucide-react";
import { useTheme } from "../../store/useTheme";
import { ThemeSettingsDock } from "./ThemeSettingsDock";

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
}) => {
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const locationMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme, isDark } = useTheme();

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

  const locations = [
    { name: "Bhubaneswar", subtitle: "Capital region & Old Town", isLive: true },
    { name: "Puri", subtitle: "Coastal heritage & beaches", isLive: false },
    { name: "Chilika Lake", subtitle: "Wetland & bird sanctuary", isLive: false },
    { name: "Konark", subtitle: "Sun Temple heritage", isLive: false },
    { name: "Daringbadi", subtitle: "Hill station & pine forests", isLive: false },
    { name: "Sambalpur", subtitle: "Hirakud & Western Odisha", isLive: false },
    { name: "Koraput", subtitle: "Highlands & tribal heritage", isLive: false },
  ];

  return (
    <header className="topbar">
      {/* Left: Mobile hamburger & Location Selector */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          data-testid="mobile-menu-button"
          onClick={onOpenMobileDrawer}
          className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Location Dropdown Pill */}
        <div className="relative" ref={locationMenuRef}>
          <button
            type="button"
            data-testid="location-selector-button"
            onClick={() => setShowLocationMenu(!showLocationMenu)}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-700 shadow-xs hover:border-emerald-500 hover:shadow-sm transition-all text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <MapPin size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-none">{selectedLocation}</span>
            <ChevronDown size={13} className="text-gray-400 ml-0.5" />
          </button>

          {showLocationMenu && (
            <div className="absolute left-0 top-full mt-2 w-64 p-2 rounded-2xl bg-white dark:bg-slate-850 border border-gray-100 dark:border-slate-700 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Explore from
              </div>
              <div className="space-y-1 mt-1">
                {locations.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => {
                      onLocationChange(loc.name);
                      setShowLocationMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      selectedLocation === loc.name
                        ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 font-semibold"
                        : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {loc.name === "Chilika Lake" ? (
                        <Waves size={16} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <LocateFixed size={16} className="text-emerald-600 dark:text-emerald-400" />
                      )}
                      <div>
                        <div className="text-xs font-bold">{loc.name}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">{loc.subtitle}</div>
                      </div>
                    </div>
                    {selectedLocation === loc.name && (
                      <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Brand Lockup with Logo */}
      <div
        data-testid="brand-logo-lockup"
        className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none"
        onClick={() => onTabChange("discover")}
      >
        <img
          src="/images/logo.jpeg"
          alt="O-Travelz Logo"
          className="w-8 h-8 rounded-xl object-cover shadow-xs border border-emerald-700/20"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = "none";
          }}
        />
        <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-display font-black text-sm flex items-center justify-center shadow-xs">
          O
        </div>
        <div>
          <span className="font-display font-extrabold text-sm text-gray-900 dark:text-white tracking-tight block leading-none">
            O-Travelz
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-400 font-medium tracking-wide">
            safe • secure • smart
          </span>
        </div>
      </div>

      {/* Right: Desktop Navigation Links, AI Trigger, Theme Dock & Action Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
          <button
            type="button"
            data-testid="nav-tab-discover"
            onClick={() => onTabChange("discover")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "discover"
                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
            }`}
          >
            Discover
          </button>
          <button
            type="button"
            data-testid="nav-tab-destinations"
            onClick={() => onTabChange("destinations")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "destinations"
                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
            }`}
          >
            Destinations
          </button>
          <button
            type="button"
            data-testid="nav-tab-map"
            onClick={() => onTabChange("map")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "map"
                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
            }`}
          >
            Map
          </button>
          <button
            type="button"
            data-testid="nav-tab-plan"
            onClick={() => onTabChange("plan")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "plan"
                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
            }`}
          >
            Plan Trip
          </button>
          <button
            type="button"
            data-testid="nav-tab-saved"
            onClick={() => onTabChange("saved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "saved"
                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
            }`}
          >
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* AI Travel Planner Trigger Button */}
        <button
          type="button"
          data-testid="open-ai-planner-btn"
          onClick={onOpenAI}
          title="Open AI Travel Planner"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Bot size={14} className="text-emerald-700 dark:text-emerald-400" />
          <span className="hidden sm:inline">AI Planner</span>
        </button>

        {/* Reusable Theme & Settings Dock */}
        <ThemeSettingsDock
          onOpenSettings={onOpenSettings || (() => {})}
          isCompact={true}
        />

        {/* Quick Action Plan Trip Button */}
        <button
          type="button"
          data-testid="quick-plan-trip-btn"
          onClick={() => onTabChange("plan")}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <Sparkles size={13} />
          <span>Plan Trip</span>
        </button>
      </div>
    </header>
  );
};
