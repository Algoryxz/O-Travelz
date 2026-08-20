import React from "react";
import {
  Compass,
  Search,
  MapPin,
  Bot,
  CalendarDays,
  Heart,
  X,
  Sliders,
  Sparkles,
} from "lucide-react";
import type { NavTab } from "./TopNav";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAI?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenAI,
  onOpenSettings,
  savedCount = 0,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="relative w-80 max-w-[85vw] bg-[#09221b] border-r border-emerald-900/60 h-full shadow-2xl flex flex-col p-6 text-gray-100 z-10 animate-in slide-in-from-left duration-200">
        {/* Brand Header with Canonical Logo */}
        <div className="flex items-center justify-between pb-6 border-b border-emerald-900/50">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="O-Travelz Logo"
              className="h-11 w-auto rounded-xl object-contain shadow-xs border border-emerald-800/40"
            />
            <div>
              <div className="font-display font-extrabold text-sm text-white tracking-tight">
                O-Travelz
              </div>
              <div className="text-[10px] text-emerald-400 font-mono font-semibold">
                by Algoryxz
              </div>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-mobile-drawer"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-emerald-950/70 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70 px-3 mb-2 font-mono">
              Explore Odisha
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                data-testid="drawer-nav-discover"
                onClick={() => {
                  onSelectTab("discover");
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "discover"
                    ? "bg-emerald-950 text-emerald-200 border border-emerald-700/60 shadow-xs"
                    : "text-gray-300 hover:bg-emerald-950/50 hover:text-white"
                }`}
              >
                <Compass size={17} className="text-emerald-400" />
                <span>Discover</span>
              </button>

              <button
                type="button"
                data-testid="drawer-nav-destinations"
                onClick={() => {
                  onSelectTab("destinations");
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "destinations"
                    ? "bg-emerald-950 text-emerald-200 border border-emerald-700/60 shadow-xs"
                    : "text-gray-300 hover:bg-emerald-950/50 hover:text-white"
                }`}
              >
                <Search size={17} className="text-emerald-400" />
                <span>All Destinations</span>
              </button>

              <button
                type="button"
                data-testid="drawer-nav-map"
                onClick={() => {
                  onSelectTab("map");
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "map"
                    ? "bg-emerald-950 text-emerald-200 border border-emerald-700/60 shadow-xs"
                    : "text-gray-300 hover:bg-emerald-950/50 hover:text-white"
                }`}
              >
                <MapPin size={17} className="text-emerald-400" />
                <span>Interactive Map</span>
              </button>

              <button
                type="button"
                data-testid="drawer-nav-plan"
                onClick={() => {
                  onSelectTab("plan");
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "plan"
                    ? "bg-emerald-950 text-emerald-200 border border-emerald-700/60 shadow-xs"
                    : "text-gray-300 hover:bg-emerald-950/50 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CalendarDays size={17} className="text-emerald-400" />
                  <span>Plan a Trip</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Your Space: AI & Saved Trips */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70 px-3 mb-2 font-mono">
              Your Space
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                data-testid="drawer-nav-ai"
                onClick={() => {
                  onClose();
                  onOpenAI?.();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-950/80 text-emerald-200 border border-emerald-800 hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bot size={17} className="text-emerald-400" />
                  <span>AI Travel Assistant</span>
                </div>
                <Sparkles size={14} className="text-emerald-400" />
              </button>

              <button
                type="button"
                data-testid="drawer-nav-saved"
                onClick={() => {
                  onSelectTab("saved");
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "saved"
                    ? "bg-emerald-950 text-emerald-200 border border-emerald-700/60 shadow-xs"
                    : "text-gray-300 hover:bg-emerald-950/50 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart size={17} className="text-rose-400" />
                  <span>Saved places</span>
                </div>
                {savedCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-bold flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Settings & Preferences */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70 px-3 mb-2 font-mono">
              Preferences
            </div>
            <button
              type="button"
              data-testid="drawer-settings-btn"
              onClick={() => {
                onClose();
                onOpenSettings?.();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#0d2b23] border border-emerald-800/50 text-gray-200 hover:bg-emerald-950 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Sliders size={16} className="text-emerald-400" />
                <span>App Settings</span>
              </div>
            </button>
          </div>
        </div>

        {/* Status Footer */}
        <div className="pt-4 border-t border-emerald-900/50 flex flex-col gap-1.5 text-[10px] text-emerald-300/70 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="live-dot" /> <span className="font-semibold text-emerald-400">safe • secure • smart</span>
            </div>
            <span>Odisha</span>
          </div>
          <div className="text-[9px] text-emerald-400/50">
            Built by Algoryxz
          </div>
        </div>
      </aside>
    </div>
  );
};
