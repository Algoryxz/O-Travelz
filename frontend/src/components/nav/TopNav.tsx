import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  MapPin,
  Sparkles,
  Bookmark,
  Menu,
  ChevronDown,
  Layers,
  CalendarDays,
  MoreHorizontal,
  Route,
  Search,
  Check,
  Sliders,
} from "lucide-react";
import { AuthStatusButton } from "../auth/AuthStatusButton";

export type NavTab =
  | "discover"
  | "destinations"
  | "map"
  | "plan"
  | "saved"
  | "revisit"
  | "category"
  | "settings"
  | "privacy"
  | "terms"
  | "contact";

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
  locationStatus?:
    | "granted"
    | "active"
    | "not_granted"
    | "idle"
    | "prompt"
    | "denied"
    | "loading"
    | "requesting"
    | "timeout"
    | "unavailable"
    | "unsupported";
  locationText?: string;
  onRequestLocation?: () => void;
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
  onOpenSettings,
  savedCount = 0,
  locationText = "",
  locationStatus,
  onRequestLocation,
}) => {
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

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
    <header
      data-testid="top-navigation-bar"
      className="sticky top-0 z-40 w-full bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#E5DFD5] transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-4">
          
          {/* ZONE A: Logo & Brand Lockup */}
          <div className="flex items-center gap-3 shrink-0 select-none">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onTabChange("discover")}
            >
              <div className="relative flex items-center justify-center shrink-0">
                <img
                  src="/logo.jpeg"
                  alt="O-Travelz Logo"
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#B87B22]/30 shadow-xs shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-[#12161E] whitespace-nowrap">
                    O-Travelz
                  </span>
                  <span className="live-dot" />
                </div>
                <p className="text-[10px] text-[#70798B] font-medium tracking-wide whitespace-nowrap mt-0.5 leading-none font-mono">
                  Odisha Travel Intelligence · safe • secure • smart
                </p>
              </div>
            </div>

            {/* Departure Hub Pill Selector */}
            <div className="relative ml-2 hidden sm:block" ref={locationMenuRef}>
              <button
                type="button"
                data-testid={locationStatus ? "header-live-location-control" : "location-dropdown-toggle"}
                aria-haspopup="true"
                aria-expanded={locationDropdownOpen}
                onClick={() => {
                  if (locationStatus === "not_granted" && onRequestLocation) {
                    onRequestLocation();
                  } else {
                    setLocationDropdownOpen(!locationDropdownOpen);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EEE7] hover:bg-[#EAE4DA] text-[#12161E] border border-[#E5DFD5] text-xs font-medium transition-colors cursor-pointer"
              >
                <MapPin size={12} className="text-[#B87B22] shrink-0" />
                <span className="truncate max-w-[130px] font-semibold">
                  {locationStatus === "not_granted"
                    ? "Enable Location"
                    : locationStatus === "idle"
                    ? "Use my live location"
                    : locationStatus === "requesting"
                    ? "Finding your location…"
                    : locationStatus === "denied"
                    ? "Location Blocked"
                    : locationStatus === "timeout"
                    ? "Location Timeout"
                    : locationStatus === "unavailable"
                    ? "Location Unavailable"
                    : locationStatus === "unsupported"
                    ? "Location Unsupported"
                    : locationStatus === "granted"
                    ? `LIVE Location: ${locationText || `${selectedLocation}, Odisha`}`
                    : locationText || `${selectedLocation}, Odisha`}
                </span>
                <ChevronDown
                  size={11}
                  className={`text-[#70798B] transition-transform duration-150 ${
                    locationDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Hub Dropdown Popover */}
              {locationDropdownOpen && (
                <div
                  data-testid="location-dropdown-menu"
                  role="menu"
                  aria-label="Odisha Departure Hubs"
                  className="absolute left-0 mt-2 w-64 bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-[#70798B] uppercase tracking-wider font-mono border-b border-[#E5DFD5] pb-1.5 mb-1">
                    Select Departure Hub
                  </div>
                  {AVAILABLE_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onLocationChange(loc);
                        setLocationDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        selectedLocation === loc
                          ? "bg-[#F2EEE7] text-[#12161E] font-bold"
                          : "text-[#3D4654] hover:bg-[#FAF7F2] hover:text-[#12161E]"
                      }`}
                    >
                      <span>{loc}</span>
                      {selectedLocation === loc && <Check size={13} className="text-[#B87B22]" />}
                    </button>
                  ))}
                  {onRequestLocation && (
                    <div className="border-t border-[#E5DFD5] pt-1.5 mt-1 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          onRequestLocation();
                          setLocationDropdownOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-[#B87B22] hover:bg-[#FAF7F2] flex items-center gap-2 cursor-pointer"
                      >
                        <MapPin size={12} />
                        <span>Detect Live Location</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ZONE B: Primary Navigation Group */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-1.5 bg-[#FFFFFF] px-2 py-1 rounded-full border border-[#E5DFD5] shadow-xs shrink-0"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={item.testId}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-[#12161E] text-white shadow-xs"
                      : "text-[#3D4654] hover:text-[#12161E] hover:bg-[#F2EEE7]"
                  }`}
                >
                  <Icon size={13} className={isActive ? "text-[#B87B22] shrink-0" : "text-[#70798B] shrink-0"} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                        isActive
                          ? "bg-[#B87B22] text-white"
                          : "bg-[#F2EEE7] text-[#12161E] border border-[#E5DFD5]"
                      }`}
                    >
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isMoreMenuOpen || activeTab === "category"
                    ? "bg-[#F2EEE7] text-[#12161E] font-bold"
                    : "text-[#3D4654] hover:text-[#12161E] hover:bg-[#F2EEE7]"
                }`}
              >
                <MoreHorizontal size={13} className="shrink-0" />
                <span>More</span>
                <ChevronDown
                  size={11}
                  className={`transition-transform duration-200 shrink-0 ${isMoreMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Functional More Menu Dropdown Surface */}
              {isMoreMenuOpen && (
                <div
                  data-testid="desktop-more-menu-dropdown"
                  role="menu"
                  aria-label="More options menu"
                  className="absolute right-0 mt-2 w-64 bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-[#E5DFD5]"
                >
                  <div className="py-1 px-2">
                    <div className="px-3 py-1 text-[10px] font-bold text-[#70798B] uppercase tracking-wider font-mono">
                      Your Space
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      data-testid="more-menu-saved-places"
                      onClick={() => handleMoreItemClick(() => onTabChange("saved"))}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#3D4654] hover:bg-[#F2EEE7] hover:text-[#12161E] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bookmark size={13} className="text-[#B87B22] shrink-0" />
                        <span>Saved Places</span>
                      </div>
                      {savedCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#B87B22]/15 text-[#B87B22] text-[10px] font-bold">
                          {savedCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      data-testid="more-menu-planned-trips"
                      onClick={() => handleMoreItemClick(() => onTabChange("plan"))}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#3D4654] hover:bg-[#F2EEE7] hover:text-[#12161E] transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <CalendarDays size={13} className="text-[#1B5E6B] shrink-0" />
                      <span>Planned Trips &amp; Itineraries</span>
                    </button>
                  </div>

                  <div className="py-1 px-2">
                    <div className="px-3 py-1 text-[10px] font-bold text-[#70798B] uppercase tracking-wider font-mono">
                      Thematic Exploration
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      data-testid="more-menu-circuits"
                      onClick={() => handleMoreItemClick(() => onTabChange("category"))}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#3D4654] hover:bg-[#F2EEE7] hover:text-[#12161E] transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <Route size={13} className="text-[#A84825] shrink-0" />
                      <span>Thematic Circuits &amp; Categories</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* ZONE C: Action Group (Search, Auth, Mobile Trigger) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger Button */}
            <button
              type="button"
              onClick={() => onTabChange("destinations")}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#F2EEE7] border border-[#E5DFD5] text-xs text-[#70798B] transition-colors cursor-pointer"
              title="Search Destinations"
            >
              <Search size={13} className="text-[#B87B22]" />
              <span className="hidden xl:inline">Search destinations...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#F2EEE7] text-[#3D4654] rounded border border-[#E5DFD5]">
                ⌘K
              </kbd>
            </button>

            {/* Trip Settings Button */}
            {onOpenSettings && (
              <button
                type="button"
                data-testid="desktop-settings-button"
                onClick={onOpenSettings}
                aria-label="Trip Settings"
                title="Trip Settings"
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#E5DFD5] text-[#3D4654] hover:text-[#12161E] hover:bg-[#F2EEE7] transition-colors cursor-pointer"
              >
                <Sliders size={13} />
              </button>
            )}

            {/* Google OAuth & Account Status Button */}
            <AuthStatusButton />

            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              data-testid="mobile-menu-toggle"
              aria-label="Open mobile menu"
              onClick={onOpenMobileDrawer}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#E5DFD5] text-[#12161E] hover:bg-[#F2EEE7] transition-colors cursor-pointer"
            >
              <Menu size={16} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
