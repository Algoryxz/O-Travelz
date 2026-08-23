import React from "react";
import {
  Compass,
  MapPin,
  Sparkles,
  Bookmark,
  X,
  Layers,
  CalendarDays,
  History,
  Sliders,
  Route,
  ShieldCheck,
  FileText,
  Mail,
} from "lucide-react";
import { AuthStatusButton } from "../auth/AuthStatusButton";

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: any) => void;
  onToggleCopilot?: () => void;
  onOpenAI?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
  revisitCount?: number;
  [key: string]: any;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenSettings,
  savedCount = 0,
  revisitCount = 0,
}) => {
  if (!isOpen) return null;

  const navigateItems = [
    { id: "discover", label: "Discover", icon: Compass, testId: "drawer-nav-discover" },
    { id: "destinations", label: "All Destinations", icon: Layers, testId: "drawer-nav-destinations" },
    { id: "map", label: "Map & Routes", icon: MapPin, testId: "drawer-nav-map" },
    { id: "plan", label: "Plan a Trip", icon: Sparkles, testId: "drawer-nav-plan" },
  ];

  const spaceItems = [
    { id: "saved", label: "Saved Places", icon: Bookmark, testId: "drawer-nav-saved", badge: savedCount },
    { id: "revisit", label: "Revisit Places", icon: History, testId: "drawer-nav-revisit", badge: revisitCount },
    { id: "plan", label: "Planned Trips & Itineraries", icon: CalendarDays, testId: "drawer-nav-planned-trips" },
  ];

  const discoveryShortcuts = [
    { id: "destinations", label: "All Destinations Index", icon: Layers, testId: "drawer-nav-all-destinations" },
    { id: "category", label: "Thematic Travel Circuits", icon: Route, testId: "drawer-nav-thematic-circuits" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#12161E]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xs bg-[#FFFFFF] h-full shadow-2xl flex flex-col z-10 border-r border-[#E5DFD5] animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E5DFD5] flex items-center justify-between bg-[#FBF9F5]">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.jpeg"
              alt="O-Travelz Logo"
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#B87B22]/30 shadow-xs shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div>
              <span className="font-serif font-bold text-base text-[#12161E] tracking-tight">
                O-Travelz
              </span>
              <p className="text-xs text-[#70798B] font-mono">Odisha, in your rhythm.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EEE7] text-[#3D4654] hover:text-[#12161E] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={15} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* User Profile & Sync Status */}
          <div className="pb-3 border-b border-[#E5DFD5] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#70798B] uppercase tracking-wider font-mono">Account</span>
            <AuthStatusButton />
          </div>

          {/* Section 1: Navigate */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-[#70798B] uppercase tracking-wider font-mono px-3 py-1">
              Navigate
            </div>
            {navigateItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={item.testId}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#12161E] text-white font-bold shadow-xs"
                      : "text-[#3D4654] hover:bg-[#F2EEE7] hover:text-[#12161E]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={15} className={isActive ? "text-[#B87B22]" : "text-[#70798B]"} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Section 2: Your Space */}
          <div className="space-y-1 pt-3 border-t border-[#E5DFD5]">
            <div className="text-[11px] font-bold text-[#70798B] uppercase tracking-wider font-mono px-3 py-1">
              Your Space
            </div>
            {spaceItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={`${item.id}-${idx}`}
                  type="button"
                  data-testid={item.testId}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#12161E] text-white font-bold shadow-xs"
                      : "text-[#3D4654] hover:bg-[#F2EEE7] hover:text-[#12161E]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={15} className={isActive ? "text-[#B87B22]" : "text-[#70798B]"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-[#B87B22] text-white" : "bg-[#B87B22]/15 text-[#B87B22]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section 3: Discovery Shortcuts */}
          <div className="space-y-1 pt-3 border-t border-[#E5DFD5]">
            <div className="text-[11px] font-bold text-[#70798B] uppercase tracking-wider font-mono px-3 py-1">
              Discovery Shortcuts
            </div>
            {discoveryShortcuts.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={item.testId}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#12161E] text-white font-bold shadow-xs"
                      : "text-[#3D4654] hover:bg-[#F2EEE7] hover:text-[#12161E]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={15} className={isActive ? "text-[#B87B22]" : "text-[#70798B]"} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Section 4: Preferences & Tools */}
          <div className="space-y-1 pt-3 border-t border-[#E5DFD5]">
            <div className="text-[11px] font-bold text-[#70798B] uppercase tracking-wider font-mono px-3 py-1">
              Preferences &amp; Tools
            </div>
            <button
              type="button"
              data-testid="drawer-nav-trip-preferences"
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#3D4654] hover:bg-[#F2EEE7] hover:text-[#12161E] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Sliders size={15} className="text-[#1B5E6B]" />
                <span>Trip Preferences &amp; Settings</span>
              </div>
            </button>
          </div>

          {/* Section 5: Responsible Platform & Legal */}
          <div className="space-y-1 pt-3 border-t border-[#E5DFD5]">
            <div className="text-[11px] font-bold text-[#70798B] uppercase tracking-wider font-mono px-3 py-1">
              Responsible Platform
            </div>
            <button
              type="button"
              data-testid="drawer-nav-privacy"
              onClick={() => {
                onSelectTab("privacy");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-[#3D4654] hover:bg-[#F2EEE7] hover:text-[#12161E] transition-all cursor-pointer"
            >
              <ShieldCheck size={14} className="text-[#2F523E]" />
              <span>Privacy Policy</span>
            </button>
            <button
              type="button"
              data-testid="drawer-nav-terms"
              onClick={() => {
                onSelectTab("terms");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-[#3D4654] hover:bg-[#F2EEE7] hover:text-[#12161E] transition-all cursor-pointer"
            >
              <FileText size={14} className="text-[#70798B]" />
              <span>Terms &amp; Conditions</span>
            </button>
            <button
              type="button"
              data-testid="drawer-nav-contact"
              onClick={() => {
                onSelectTab("contact");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-[#3D4654] hover:bg-[#F2EEE7] hover:text-[#12161E] transition-all cursor-pointer"
            >
              <Mail size={14} className="text-[#A84825]" />
              <span>Contact &amp; Grievance</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E5DFD5] bg-[#FBF9F5] text-center">
          <p className="text-[11px] text-[#70798B] font-mono">
            O-Travelz · Built with Odisha Pride
          </p>
        </div>
      </div>
    </div>
  );
};
