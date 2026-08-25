import React, { useState } from "react";
import {
  Compass,
  Layers,
  MapPin,
  Sparkles,
  Bookmark,
  type LucideIcon,
} from "lucide-react";
import type { NavTab } from "./TopNav";

interface FloatingNavigationDockProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  savedCount?: number;
  className?: string;
}

export const FloatingNavigationDock: React.FC<FloatingNavigationDockProps> = ({
  activeTab,
  onSelectTab,
  savedCount = 0,
  className = "",
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const dockItems: Array<{
    id: NavTab;
    label: string;
    icon: LucideIcon;
    badge?: number;
  }> = [
    { id: "discover", label: "Discover", icon: Compass },
    { id: "destinations", label: "Destinations", icon: Layers },
    { id: "map", label: "Map & Routes", icon: MapPin },
    { id: "plan", label: "Plan Trip", icon: Sparkles },
    { id: "saved", label: "Saved", icon: Bookmark, badge: savedCount },
  ];

  return (
    <aside
      data-testid="floating-nav-dock"
      aria-label="Quick Navigation Dock"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-full bg-[#FFFFFF]/90 backdrop-blur-xl border border-[#E5DFD5] shadow-xl transition-all duration-300 md:hidden ${className}`}
    >
      {dockItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const isHovered = hoveredTab === item.id;

        return (
          <div key={item.id} className="relative flex flex-col items-center">
            {/* Tooltip */}
            {isHovered && (
              <div
                role="tooltip"
                className="absolute -top-9 px-2.5 py-1 rounded-lg bg-[#12161E] text-white text-[11px] font-medium border border-[#E5DFD5] shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150"
              >
                {item.label}
              </div>
            )}

            {/* Dock Action Button */}
            <button
              type="button"
              data-testid={`dock-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              onMouseEnter={() => setHoveredTab(item.id)}
              onMouseLeave={() => setHoveredTab(null)}
              onFocus={() => setHoveredTab(item.id)}
              onBlur={() => setHoveredTab(null)}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#12161E] text-[#B87B22] shadow-sm scale-105"
                  : "text-[#70798B] hover:text-[#12161E] hover:bg-[#F2EEE7] active:scale-95"
              }`}
            >
              <Icon size={18} />

              {/* Badge for Saved items */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold leading-none ${
                    isActive
                      ? "bg-[#B87B22] text-white"
                      : "bg-[#B87B22] text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </aside>
  );
};
