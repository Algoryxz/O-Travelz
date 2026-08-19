import React from "react";
import { Sun, Moon, Settings } from "lucide-react";
import { useTheme } from "../../store/useTheme";

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
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div
      data-testid="theme-settings-dock"
      className={`inline-flex items-center gap-1.5 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/80 dark:border-emerald-900/50 shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
      aria-label="Theme and Settings dock"
    >
      {/* Theme Toggle Button */}
      <button
        type="button"
        data-testid="theme-toggle"
        aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
        title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
        onClick={toggleTheme}
        className="sr-only"
      >
        Toggle Theme
      </button>

      {/* Light Mode Button */}
      <button
        type="button"
        data-testid="dock-light-btn"
        aria-label="Switch to Light Theme"
        title="Light Mode"
        onClick={() => {
          if (isDark) toggleTheme();
        }}
        className={`relative flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
          isCompact ? "w-7 h-7" : "w-8 h-8"
        } ${
          !isDark
            ? "bg-amber-100 text-amber-900 shadow-xs ring-1 ring-amber-400/40"
            : "text-gray-400 hover:text-amber-500 hover:bg-gray-100/60 dark:hover:bg-slate-800/60"
        }`}
      >
        <Sun size={isCompact ? 14 : 16} className={!isDark ? "animate-spin-slow text-amber-600" : ""} />
      </button>


      {/* Dark Mode Button */}
      <button
        type="button"
        data-testid="dock-dark-btn"
        aria-label="Switch to Dark Theme"
        title="Dark Mode"
        onClick={() => {
          if (!isDark) toggleTheme();
        }}
        className={`relative flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
          isCompact ? "w-7 h-7" : "w-8 h-8"
        } ${
          isDark
            ? "bg-emerald-900/80 text-emerald-300 shadow-xs ring-1 ring-emerald-500/50"
            : "text-gray-400 hover:text-emerald-700 hover:bg-gray-100/60 dark:hover:bg-slate-800/60"
        }`}
      >
        <Moon size={isCompact ? 14 : 16} className={isDark ? "text-emerald-400" : ""} />
      </button>

      {/* Divider */}
      <div className="w-[1px] h-4 bg-gray-200 dark:bg-emerald-900/60 my-auto" />

      {/* Settings Button */}
      <button
        type="button"
        data-testid="dock-settings-btn"
        aria-label="Open Settings"
        title="Settings &amp; Options"
        onClick={onOpenSettings}
        className={`relative flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gray-100/60 dark:hover:bg-slate-800/60 transition-all duration-200 cursor-pointer ${
          isCompact ? "w-7 h-7" : "w-8 h-8"
        }`}
      >
        <Settings size={isCompact ? 14 : 16} className="hover:rotate-45 transition-transform duration-300" />
      </button>
    </div>
  );
};

