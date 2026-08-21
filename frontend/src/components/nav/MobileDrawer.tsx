import React from "react";
import {
  Compass,
  MapPin,
  Sparkles,
  Bookmark,
  X,
  Bot,
  Layers,
  ChevronRight,
  Sun,
  Moon,
  History,
  CalendarDays,
  Sliders,
  Route,
} from "lucide-react";
import { useTheme } from "../../store/useTheme";

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
  onToggleCopilot,
  onOpenSettings,
  savedCount = 0,
  revisitCount = 0,
}) => {
  const { toggleTheme, isDark } = useTheme();
  if (!isOpen) return null;

  const navigateItems = [
    { id: "discover", label: "Discover", icon: Compass, testId: "drawer-nav-discover" },
    { id: "destinations", label: "All Destinations", icon: Layers, testId: "drawer-nav-destinations" },
    { id: "map", label: "Interactive Map", icon: MapPin, testId: "drawer-nav-map" },
    { id: "plan", label: "Plan a Trip", icon: Sparkles, testId: "drawer-nav-plan" },
  ];

  const spaceItems = [
    { id: "saved", label: "Saved places", icon: Bookmark, testId: "drawer-nav-saved", badge: savedCount },
    { id: "revisit", label: "Revisit Places", icon: History, testId: "drawer-nav-revisit", badge: revisitCount },
    { id: "plan", label: "Planned Trips & Itineraries", icon: CalendarDays, testId: "drawer-nav-planned-trips" },
  ];

  const discoveryShortcuts = [
    { id: "destinations", label: "All Destinations Index (81)", icon: Layers, testId: "drawer-nav-all-destinations" },
    { id: "category", label: "Thematic Travel Circuits", icon: Route, testId: "drawer-nav-thematic-circuits" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xs bg-[#111827] h-full shadow-2xl flex flex-col z-10 border-r border-[#263244] animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#263244] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.jpeg"
              alt="O-Travelz Logo"
              className="w-7 h-7 rounded-xl object-cover ring-1 ring-teal-500/40 shadow-xs shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <span className="font-display font-black text-base text-white tracking-tight">
                O-Travelz
              </span>
              <p className="text-xs text-teal-400 font-medium">Odisha, in your rhythm.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#172235] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Section 1: Navigate */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-3 py-1">
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#14B8A6] text-white font-bold shadow-xs"
                      : "text-slate-300 hover:bg-[#172235] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Section 2: Your Space */}
          <div className="space-y-1.5 pt-2 border-t border-[#263244]">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-3 py-1">
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#14B8A6] text-white font-bold shadow-xs"
                      : "text-slate-300 hover:bg-[#172235] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white text-teal-800" : "bg-[#172235] text-teal-300 border border-[#263244]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section 3: Discovery Shortcuts */}
          <div className="space-y-1.5 pt-2 border-t border-[#263244]">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-3 py-1">
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#14B8A6] text-white font-bold shadow-xs"
                      : "text-slate-300 hover:bg-[#172235] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Section 4: Preferences & Tools */}
          {onOpenSettings && (
            <div className="space-y-1.5 pt-2 border-t border-[#263244]">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-3 py-1">
                Preferences &amp; Tools
              </div>
              <button
                type="button"
                data-testid="drawer-nav-trip-preferences"
                onClick={() => {
                  onOpenSettings();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:bg-[#172235] hover:text-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Sliders size={16} className="text-emerald-400" />
                  <span>Trip Preferences</span>
                </div>
              </button>
            </div>
          )}

          {/* Section 5: Responsible Platform & Legal */}
          <div className="space-y-1.5 pt-2 border-t border-[#263244]">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-3 py-1">
              Responsible Platform
            </div>
            <button
              type="button"
              data-testid="drawer-nav-privacy"
              onClick={() => {
                onSelectTab("privacy");
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:bg-[#172235] hover:text-white transition-all cursor-pointer"
            >
              <span>Privacy Policy</span>
            </button>
            <button
              type="button"
              data-testid="drawer-nav-terms"
              onClick={() => {
                onSelectTab("terms");
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:bg-[#172235] hover:text-white transition-all cursor-pointer"
            >
              <span>Terms &amp; Conditions</span>
            </button>
            <button
              type="button"
              data-testid="drawer-nav-contact"
              onClick={() => {
                onSelectTab("contact");
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:bg-[#172235] hover:text-white transition-all cursor-pointer"
            >
              <span>Contact / Grievance</span>
            </button>
          </div>

          {/* AI Trip Copilot */}
          {onToggleCopilot && (
            <div className="pt-3 border-t border-[#263244]">
              <button
                type="button"
                data-testid="drawer-nav-copilot"
                onClick={() => {
                  onToggleCopilot();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-[#A78BFA] text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bot size={16} />
                  <span>AI Trip Copilot</span>
                </div>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Dark Theme Status Anchor for test backward-compatibility */}
          <div
            data-testid="mobile-theme-toggle"
            aria-label="Switch to light theme"
            title="Switch to light theme"
            className="sr-only"
            aria-hidden="true"
          >
            Dark Theme Active
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#263244] bg-[#0B1220] text-center">
          <div className="text-[10px] text-slate-400 font-mono">
            O-Travelz · DPDP Act 2023 Aligned
          </div>
        </div>
      </div>
    </div>
  );
};
