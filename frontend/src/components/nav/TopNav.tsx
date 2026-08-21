import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  MapPin,
  Sparkles,
  Bookmark,
  Menu,
  ChevronDown,
  Bot,
  Layers,
  Sun,
  Moon,
  History,
  CalendarDays,
  Sliders,
  MoreHorizontal,
  Route,
} from "lucide-react";
import { useTheme } from "../../store/useTheme";

export type NavTab = "discover" | "destinations" | "map" | "plan" | "saved" | "revisit" | "category" | "settings";

export interface TopNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  selectedLocation: string;
  onLocationChange: (location: any) => void;
  onOpenMobileDrawer: () => void;
  onToggleCopilot?: () => void;
  onOpenAI?: () => void;
  onRefreshLocation?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
  revisitCount?: number;
  [key: string]: any;
}

const AVAILABLE_LOCATIONS = [
  "Bhubaneswar",
  "Puri",
  "Konark",
  "Cuttack",
  "Daringbadi",
  "Sambalpur",
  "Koraput",
  "Chilika Lake",
] as const;

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  selectedLocation,
  onLocationChange,
  onOpenMobileDrawer,
  onToggleCopilot,
  onOpenSettings,
  savedCount = 0,
  revisitCount = 0,
}) => {
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const { toggleTheme, isDark } = useTheme();

  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const locationMenuRef = useRef<HTMLDivElement | null>(null);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (locationMenuRef.current && !locationMenuRef.current.contains(e.target as Node)) {
        setLocationDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMoreMenuOpen(false);
        setLocationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navItems = [
    { id: "discover", label: "Discover", icon: Compass, testId: "nav-tab-discover" },
    { id: "destinations", label: "Destinations", icon: Layers, testId: "nav-tab-destinations" },
    { id: "map", label: "Map & Routes", icon: MapPin, testId: "nav-tab-map" },
    { id: "plan", label: "Plan Trip", icon: Sparkles, testId: "nav-tab-plan" },
    { id: "saved", label: "Saved", icon: Bookmark, testId: "nav-tab-saved", badge: savedCount },
  ];

  const handleMoreItemClick = (action: () => void) => {
    action();
    setIsMoreMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B1220]/95 backdrop-blur-md border-b border-[#263244] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo & Brand Lockup */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange("discover")}>
            <div className="relative flex items-center justify-center">
              <img
                src="/images/logo.png"
                alt="O-Travelz Logo"
                className="w-8 h-8 rounded-xl object-contain shadow-xs shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <svg className="w-8 h-8 text-[#14B8A6] hidden only-if-no-img" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#111827" stroke="#263244" strokeWidth="1.5"/>
                <circle cx="16" cy="16" r="8" stroke="#14B8A6" strokeWidth="2.5" strokeDasharray="36 12"/>
                <circle cx="16" cy="16" r="3.5" fill="#F59E0B"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg tracking-tight text-white">
                  O-Travelz
                </span>
                <span className="live-dot" />
              </div>
              <p className="text-[10px] text-teal-400 font-medium tracking-wide">
                safe • secure • smart
              </p>
            </div>
          </div>

          {/* Desktop Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#111827]/80 p-1.5 rounded-2xl border border-[#263244]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={item.testId}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#14B8A6] text-white shadow-xs font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white text-teal-800" : "bg-[#172235] text-teal-300 border border-[#263244]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Functional More Menu Trigger */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                data-testid="desktop-more-menu-btn"
                aria-haspopup="true"
                aria-expanded={isMoreMenuOpen}
                aria-label="More navigation options"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isMoreMenuOpen || activeTab === "revisit" || activeTab === "category"
                    ? "bg-[#172235] text-[#14B8A6] border border-[#14B8A6]/40 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <MoreHorizontal size={14} />
                <span>More</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isMoreMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Functional More Menu Dropdown Surface */}
              {isMoreMenuOpen && (
                <div
                  data-testid="desktop-more-menu-dropdown"
                  role="menu"
                  aria-label="More options menu"
                  className="absolute right-0 mt-2 w-72 bg-[#111827]/98 backdrop-blur-xl border border-[#263244] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-[#263244]"
                >
                  {/* Section 1: YOUR SPACE */}
                  <div className="py-1.5 px-2">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Your Space
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      data-testid="more-menu-saved-places"
                      onClick={() => handleMoreItemClick(() => onTabChange("saved"))}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-[#172235] hover:text-white transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bookmark size={14} className="text-teal-400" />
                        <span>Saved Places</span>
                      </div>
                      {savedCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                          {savedCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      data-testid="more-menu-revisit-places"
                      onClick={() => handleMoreItemClick(() => onTabChange("revisit"))}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-[#172235] hover:text-white transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <History size={14} className="text-sky-400" />
                        <span>Revisit Places</span>
                      </div>
                      {revisitCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                          {revisitCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      data-testid="more-menu-planned-trips"
                      onClick={() => handleMoreItemClick(() => onTabChange("plan"))}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-[#172235] hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <CalendarDays size={14} className="text-amber-400" />
                      <span>Planned Trips &amp; Itineraries</span>
                    </button>
                  </div>

                  {/* Section 2: DISCOVERY SHORTCUTS */}
                  <div className="py-1.5 px-2">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Discovery Shortcuts
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      data-testid="more-menu-all-destinations"
                      onClick={() => handleMoreItemClick(() => onTabChange("destinations"))}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-[#172235] hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <Layers size={14} className="text-teal-400" />
                      <span>All Destinations Index (81)</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      data-testid="more-menu-thematic-circuits"
                      onClick={() => handleMoreItemClick(() => onTabChange("category"))}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-[#172235] hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <Route size={14} className="text-purple-400" />
                      <span>Thematic Travel Circuits</span>
                    </button>
                  </div>

                  {/* Section 3: PREFERENCES & TOOLS */}
                  <div className="py-1.5 px-2">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Preferences &amp; Tools
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      data-testid="more-menu-trip-preferences"
                      onClick={() => handleMoreItemClick(() => onOpenSettings && onOpenSettings())}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-[#172235] hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <Sliders size={14} className="text-emerald-400" />
                      <span>Trip Preferences</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Controls: Location Selector + Theme Toggle + Copilot Button + Mobile Menu */}
          <div className="flex items-center gap-2.5">
            {/* Location Selector Dropdown */}
            <div className="relative" ref={locationMenuRef}>
              <button
                type="button"
                data-testid="location-selector"
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#263244] hover:border-slate-500 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <MapPin size={13} className="text-[#14B8A6]" />
                <span className="truncate max-w-[100px] sm:max-w-none">{selectedLocation}</span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {locationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-[#263244] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#263244] font-mono">
                    Select Odisha Hub
                  </div>
                  {AVAILABLE_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        onLocationChange(loc);
                        setLocationDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        selectedLocation === loc
                          ? "bg-[#172235] text-[#14B8A6] font-bold"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span>{loc}</span>
                      {selectedLocation === loc && <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark / Light Theme Toggle */}
            <button
              type="button"
              data-testid="desktop-theme-toggle"
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#111827] border border-[#263244] hover:border-slate-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? (
                <Sun size={15} className="text-[#F59E0B]" />
              ) : (
                <Moon size={15} className="text-[#38BDF8]" />
              )}
            </button>

            {/* AI Trip Copilot Button */}
            {onToggleCopilot && (
              <button
                type="button"
                data-testid="open-ai-sidebar-btn"
                onClick={onToggleCopilot}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-[#A78BFA] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <Bot size={14} className="text-[#A78BFA]" />
                <span>AI Copilot</span>
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              data-testid="mobile-menu-button"
              onClick={onOpenMobileDrawer}
              className="md:hidden p-2 rounded-xl bg-[#111827] border border-[#263244] text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
