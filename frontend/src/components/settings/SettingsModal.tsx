import React, { useState, useEffect } from "react";
import {
  X,
  Sliders,
  Sun,
  Moon,
  Trash2,
  RotateCcw,
  Sparkles,
  Compass,
  Check,
  Shield,
  Heart,
  Palette,
} from "lucide-react";
import { useTheme } from "../../store/useTheme";
import { useConversationHistory } from "../../store/useConversationHistory";
import { useSavedPlaces } from "../../store/useSavedPlaces";

const PREFS_STORAGE_KEY = "o_travelz_user_prefs";

export interface UserTravelPreferences {
  interests: string[];
  budgetTier: "budget" | "balanced" | "luxury";
  transportPreference: "public" | "cab" | "self-drive";
}

const DEFAULT_PREFERENCES: UserTravelPreferences = {
  interests: ["heritage", "nature"],
  budgetTier: "balanced",
  transportPreference: "cab",
};

export function loadUserPreferences(): UserTravelPreferences {
  if (typeof localStorage === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: UserTravelPreferences): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesChange?: (prefs: UserTravelPreferences) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onPreferencesChange,
}) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { conversations, deleteConversation, startNewTrip } = useConversationHistory();
  const { savedPlaces, clearAllSaved } = useSavedPlaces();

  const [prefs, setPrefs] = useState<UserTravelPreferences>(() => loadUserPreferences());
  const [activeTab, setActiveTab] = useState<"appearance" | "travel" | "data">("appearance");
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  useEffect(() => {
    setPrefs(loadUserPreferences());
  }, [isOpen]);

  if (!isOpen) return null;

  const showTemporaryFeedback = (msg: string) => {
    setConfirmMsg(msg);
    setTimeout(() => setConfirmMsg(null), 2500);
  };

  const handleInterestToggle = (interest: string) => {
    const nextInterests = prefs.interests.includes(interest)
      ? prefs.interests.filter((i) => i !== interest)
      : [...prefs.interests, interest];
    const updated = { ...prefs, interests: nextInterests };
    setPrefs(updated);
    saveUserPreferences(updated);
    onPreferencesChange?.(updated);
  };

  const handleBudgetChange = (tier: UserTravelPreferences["budgetTier"]) => {
    const updated = { ...prefs, budgetTier: tier };
    setPrefs(updated);
    saveUserPreferences(updated);
    onPreferencesChange?.(updated);
  };

  const handleTransportChange = (transport: UserTravelPreferences["transportPreference"]) => {
    const updated = { ...prefs, transportPreference: transport };
    setPrefs(updated);
    saveUserPreferences(updated);
    onPreferencesChange?.(updated);
  };

  const handleClearHistory = () => {
    conversations.forEach((c) => deleteConversation(c.id));
    startNewTrip();
    showTemporaryFeedback("Trip conversation history cleared.");
  };

  const handleClearSaved = () => {
    clearAllSaved();
    showTemporaryFeedback("Saved places list cleared.");
  };

  const handleResetAll = () => {
    setPrefs(DEFAULT_PREFERENCES);
    saveUserPreferences(DEFAULT_PREFERENCES);
    onPreferencesChange?.(DEFAULT_PREFERENCES);
    showTemporaryFeedback("Preferences reset to defaults.");
  };

  const ALL_INTEREST_OPTIONS = [
    { id: "heritage", label: "Temples & Heritage" },
    { id: "nature", label: "Nature & Hills" },
    { id: "beach", label: "Coastal Beaches" },
    { id: "wildlife", label: "Wildlife & Reserves" },
    { id: "waterfall", label: "Waterfalls & Treks" },
    { id: "food", label: "Cuisine & Street Food" },
    { id: "culture", label: "Handicrafts & Arts" },
  ];

  return (
    <div
      data-testid="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-emerald-900/40 flex flex-col max-h-[90vh] text-gray-900 dark:text-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-gray-900 dark:text-white">
                Settings &amp; Preferences
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Personalize your O-Travelz trip experience
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-settings-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-gray-100 dark:border-emerald-900/30">
          <button
            type="button"
            data-testid="settings-tab-appearance"
            onClick={() => setActiveTab("appearance")}
            className={`pb-3 text-xs font-bold transition-colors flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === "appearance"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            <Palette size={14} />
            <span>Appearance</span>
          </button>
          <button
            type="button"
            data-testid="settings-tab-travel"
            onClick={() => setActiveTab("travel")}
            className={`pb-3 text-xs font-bold transition-colors flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === "travel"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            <Compass size={14} />
            <span>Travel Style</span>
          </button>
          <button
            type="button"
            data-testid="settings-tab-data"
            onClick={() => setActiveTab("data")}
            className={`pb-3 text-xs font-bold transition-colors flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === "data"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            <Shield size={14} />
            <span>Data &amp; Storage</span>
          </button>
        </div>

        {/* Feedback Banner */}
        {confirmMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <Check size={15} className="text-emerald-600" />
            <span>{confirmMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">
                  Theme Mode
                </label>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] mb-3">
                  Choose between warm cream light mode or deep emerald dark mode.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    data-testid="settings-theme-light"
                    onClick={() => {
                      if (isDark) toggleTheme();
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      !isDark
                        ? "bg-amber-50/80 border-amber-300 text-amber-950 ring-2 ring-amber-400/30"
                        : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Sun size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Light Theme</div>
                      <div className="text-[10px] text-gray-500">Warm Odisha cream</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    data-testid="settings-theme-dark"
                    onClick={() => {
                      if (!isDark) toggleTheme();
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isDark
                        ? "bg-emerald-950 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30"
                        : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-900 text-emerald-300 flex items-center justify-center shrink-0">
                      <Moon size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Dark Theme</div>
                      <div className="text-[10px] text-gray-400">Deep emerald night</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. TRAVEL PREFERENCES */}
          {activeTab === "travel" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Default Interests */}
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">
                  Default Travel Interests
                </label>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] mb-2.5">
                  Pre-selects your preferred types of destinations during AI trip generation.
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_INTEREST_OPTIONS.map((item) => {
                    const active = prefs.interests.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-testid={`settings-interest-${item.id}`}
                        onClick={() => handleInterestToggle(item.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          active
                            ? "bg-emerald-100 dark:bg-emerald-900/60 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200 shadow-2xs"
                            : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-gray-300"
                        }`}
                      >
                        {active && <Check size={12} className="text-emerald-700 dark:text-emerald-400" />}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Tier */}
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">
                  Travel Budget Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "budget", label: "Budget Friendly", desc: "Local buses & homestays" },
                    { id: "balanced", label: "Balanced Standard", desc: "AC cabs & comfortable hotels" },
                    { id: "luxury", label: "Premium Comfort", desc: "Private tours & luxury resorts" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleBudgetChange(b.id as UserTravelPreferences["budgetTier"])}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        prefs.budgetTier === b.id
                          ? "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500"
                          : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="font-bold text-xs">{b.label}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{b.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transport Preference */}
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">
                  Preferred Transport Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "cab", label: "Taxi / Cab" },
                    { id: "public", label: "Bus / Train" },
                    { id: "self-drive", label: "Self Drive" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTransportChange(t.id as UserTravelPreferences["transportPreference"])}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        prefs.transportPreference === t.id
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. DATA & STORAGE */}
          {activeTab === "data" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-gray-900 dark:text-white">
                      Trip Conversation History
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {conversations.length} saved trip conversations stored locally.
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="settings-clear-history-btn"
                    disabled={conversations.length === 0}
                    onClick={handleClearHistory}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Clear History</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 pt-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-gray-900 dark:text-white">
                      Saved Places
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {savedPlaces.length} destinations saved to your wishlist.
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="settings-clear-saved-btn"
                    disabled={savedPlaces.length === 0}
                    onClick={handleClearSaved}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Heart size={13} />
                    <span>Clear Saved</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  data-testid="settings-reset-defaults-btn"
                  onClick={handleResetAll}
                  className="w-full py-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Reset All Preferences to Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-emerald-900/30 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-mono">
            O-Travelz v0.1 · Settings Auto-saved
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
