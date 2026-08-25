import React, { useState, useEffect } from "react";
import {
  X,
  Sliders,
  Trash2,
  RotateCcw,
  Compass,
  Check,
  Shield,
  Heart,
  Sparkles,
} from "lucide-react";
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
  onApplyPreferences?: (prefs: UserTravelPreferences) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onPreferencesChange,
  onApplyPreferences,
}) => {
  const { conversations, deleteConversation, startNewTrip } = useConversationHistory();
  const { savedPlaces, clearAllSaved } = useSavedPlaces();
  const handlePrefsChange = onApplyPreferences || onPreferencesChange || (() => {});

  const [prefs, setPrefs] = useState<UserTravelPreferences>(() => loadUserPreferences());
  const [activeTab, setActiveTab] = useState<"travel" | "data">("travel");
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
    handlePrefsChange(updated);
  };

  const handleBudgetChange = (tier: UserTravelPreferences["budgetTier"]) => {
    const updated = { ...prefs, budgetTier: tier };
    setPrefs(updated);
    saveUserPreferences(updated);
    handlePrefsChange(updated);
  };

  const handleTransportChange = (transport: UserTravelPreferences["transportPreference"]) => {
    const updated = { ...prefs, transportPreference: transport };
    setPrefs(updated);
    saveUserPreferences(updated);
    handlePrefsChange(updated);
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
    handlePrefsChange(DEFAULT_PREFERENCES);
    showTemporaryFeedback("Preferences reset to defaults.");
  };

  const ALL_INTEREST_OPTIONS = [
    { id: "heritage", label: "🏛️ Temples & Heritage" },
    { id: "nature", label: "🌿 Nature & Hills" },
    { id: "beach", label: "🌊 Coastal Beaches" },
    { id: "wildlife", label: "🐅 Wildlife & Reserves" },
    { id: "waterfall", label: "💧 Waterfalls & Treks" },
    { id: "food", label: "☕ Cuisine & Sweets" },
    { id: "culture", label: "🎨 Handicrafts & Arts" },
  ];

  return (
    <div
      data-testid="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#09221b] rounded-3xl overflow-hidden shadow-2xl border border-emerald-800/50 flex flex-col max-h-[90vh] text-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-700/50 text-emerald-300 flex items-center justify-center">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">
                Settings &amp; Preferences
              </h2>
              <p className="text-xs text-emerald-300/70">
                Personalize your O-Travelz trip experience
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-settings-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-emerald-950/70 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 px-6 pt-3 border-b border-emerald-900/40">
          <button
            type="button"
            data-testid="settings-tab-travel"
            onClick={() => setActiveTab("travel")}
            className={`pb-3 text-xs font-bold transition-colors flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === "travel"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-gray-400 hover:text-gray-200"
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
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Shield size={14} />
            <span>Data &amp; Storage</span>
          </button>
        </div>

        {/* Feedback Banner */}
        {confirmMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <Check size={15} className="text-emerald-400" />
            <span>{confirmMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. TRAVEL PREFERENCES */}
          {activeTab === "travel" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Default Interests */}
              <div>
                <label className="font-bold text-white block mb-1">
                  Default Travel Interests
                </label>
                <p className="text-emerald-300/70 text-[11px] mb-2.5">
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
                            ? "bg-emerald-950 text-emerald-200 border-emerald-600 shadow-xs"
                            : "bg-[#0d2820] border-emerald-800/40 text-gray-300 hover:border-emerald-600/50 hover:text-white"
                        }`}
                      >
                        {active && <Check size={12} className="text-emerald-400" />}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Tier */}
              <div>
                <label className="font-bold text-white block mb-1">
                  Travel Budget Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "budget", label: "Budget Friendly", desc: "Local buses & homestays" },
                    { id: "balanced", label: "Balanced Standard", desc: "AC cabs & good hotels" },
                    { id: "luxury", label: "Premium Comfort", desc: "Private tours & resorts" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleBudgetChange(b.id as UserTravelPreferences["budgetTier"])}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        prefs.budgetTier === b.id
                          ? "bg-emerald-950 border-emerald-500 text-emerald-200 shadow-xs ring-1 ring-emerald-500/50"
                          : "bg-[#0d2820] border-emerald-800/40 text-gray-300 hover:border-emerald-700/60"
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{b.label}</div>
                      <div className="text-[10px] text-emerald-300/60 mt-0.5">{b.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transport Preference */}
              <div>
                <label className="font-bold text-white block mb-1">
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
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                          : "bg-[#0d2820] border-emerald-800/40 text-gray-300 hover:bg-emerald-950/50 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. DATA & STORAGE */}
          {activeTab === "data" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-[#0d2820] border border-emerald-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-white">
                      Trip Conversation History
                    </div>
                    <div className="text-[11px] text-emerald-300/70">
                      {conversations.length} saved trip conversations stored locally.
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="settings-clear-history-btn"
                    disabled={conversations.length === 0}
                    onClick={handleClearHistory}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-300 font-bold text-xs disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Clear History</span>
                  </button>
                </div>

                <div className="border-t border-emerald-900/50 pt-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-white">
                      Saved Places
                    </div>
                    <div className="text-[11px] text-emerald-300/70">
                      {savedPlaces.length} destinations saved to your wishlist.
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="settings-clear-saved-btn"
                    disabled={savedPlaces.length === 0}
                    onClick={handleClearSaved}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-300 font-bold text-xs disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
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
                  className="w-full py-2.5 rounded-2xl bg-[#09221b] border border-emerald-800/50 hover:bg-emerald-950 text-gray-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Reset All Preferences to Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#071d17] border-t border-emerald-900/40 flex items-center justify-between">
          <span className="text-[11px] text-emerald-400/60 font-mono">
            O-Travelz v0.1 · Settings Auto-saved
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
