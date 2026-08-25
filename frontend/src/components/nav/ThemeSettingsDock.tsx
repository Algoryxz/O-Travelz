import React from "react";
import { Settings } from "lucide-react";

interface ThemeSettingsDockProps {
  onOpenSettings: () => void;
  className?: string;
  isCompact?: boolean;
}

export const ThemeSettingsDock: React.FC<ThemeSettingsDockProps> = ({
  onOpenSettings,
  className = "",
  isCompact = false,
}) => {
  return (
    <div
      data-testid="theme-settings-dock"
      className={`inline-flex items-center gap-1.5 p-1.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-emerald-900/50 shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
      aria-label="Settings dock"
    >
      {/* Settings Button */}
      <button
        type="button"
        data-testid="dock-settings-btn"
        aria-label="Open Settings"
        title="Settings & Options"
        onClick={onOpenSettings}
        className={`relative flex items-center justify-center rounded-full text-gray-400 hover:text-emerald-400 hover:bg-slate-800/60 transition-all duration-200 cursor-pointer ${
          isCompact ? "w-7 h-7" : "w-8 h-8"
        }`}
      >
        <Settings size={isCompact ? 14 : 16} className="hover:rotate-45 transition-transform duration-300" />
      </button>
    </div>
  );
};
