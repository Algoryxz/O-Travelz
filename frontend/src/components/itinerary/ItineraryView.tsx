import React, { useState, useCallback } from "react";
import type { ItineraryPlanResponse } from "../../types/api";
import { ItineraryDaySection } from "./ItineraryDaySection";
import { usePlaces } from "../../store/usePlaces";
import {
  generateTravelerTripTitle,
  calculateItineraryTotalTransitMinutes,
  formatDurationHoursMins,
  generateItineraryPlainTextSummary,
  CANONICAL_INTEREST_LABELS,
} from "../../utils/timelineService";
import {
  Copy,
  Check,
  Calendar,
  MapPin,
  Clock,
  Compass,
  Sparkles,
} from "lucide-react";

interface ItineraryViewProps {
  itinerary: ItineraryPlanResponse;
  onOpenMap?: () => void;
  onViewPlaceDetails?: (place: any) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  onOpenMap,
  onViewPlaceDetails,
}) => {
  const { itinerary_id, constraints, days, explanation } = itinerary;
  const { getPlaceByName } = usePlaces();

  const [copied, setCopied] = useState<boolean>(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const totalStopsCount = days.reduce((acc, d) => acc + d.stops.length, 0);
  const totalTransitMinutes = calculateItineraryTotalTransitMinutes(itinerary);
  const tripTitle = generateTravelerTripTitle(constraints, days.length);

  const handleCopySummary = useCallback(async () => {
    try {
      const summaryText = generateItineraryPlainTextSummary(itinerary, (name) =>
        getPlaceByName(name)
      );

      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summaryText);
        setCopied(true);
        setCopyError(null);
        setTimeout(() => setCopied(false), 2500);
      } else {
        // Fallback for environments where navigator.clipboard might be unavailable
        const textarea = document.createElement("textarea");
        textarea.value = summaryText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setCopyError(null);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn("Failed to copy itinerary summary to clipboard:", err);
      setCopyError("Could not copy automatically. Please select and copy manually.");
      setTimeout(() => setCopyError(null), 3000);
    }
  }, [itinerary, getPlaceByName]);

  return (
    <div data-testid="itinerary-view" className="space-y-6">
      {/* Traveler-Focused Header Card */}
      <div className="p-5 md:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
                Verified Odisha Itinerary
              </span>
            </div>
            <h2
              data-testid="itinerary-traveler-title"
              className="text-xl sm:text-2xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight"
            >
              {tripTitle}
            </h2>
          </div>

          {/* Action: Copy Itinerary Summary */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="copy-itinerary-button"
              onClick={handleCopySummary}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-2xs ${
                copied
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                  : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
              aria-label="Copy Itinerary Summary"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-white" />
                  <span>Summary Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-emerald-700 dark:text-emerald-400" />
                  <span>Copy Itinerary Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {copyError && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-medium">
            {copyError}
          </div>
        )}

        {/* Traveler Metrics Grid */}
        <div
          data-testid="itinerary-metrics-strip"
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
        >
          <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-750 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Calendar size={15} />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block">
                Duration
              </span>
              <span className="text-gray-900 dark:text-white font-bold text-sm">
                {days.length} {days.length === 1 ? "Day" : "Days"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-750 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center shrink-0">
              <MapPin size={15} />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block">
                Stops
              </span>
              <span className="text-gray-900 dark:text-white font-bold text-sm">
                {totalStopsCount} Destinations
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-750 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Clock size={15} />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block">
                Total Transit
              </span>
              <span className="text-gray-900 dark:text-white font-bold text-sm">
                ~{formatDurationHoursMins(totalTransitMinutes)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-750 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Compass size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block">
                Starting Hub
              </span>
              <span
                className="text-gray-900 dark:text-white font-bold text-sm truncate block"
                title={constraints.start || "Flexible Origin"}
              >
                {constraints.start || "Flexible Origin"}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Themes & Secondary Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mr-1">
              Themes:
            </span>
            {constraints.interests && constraints.interests.length > 0 ? (
              constraints.interests.map((interestId) => (
                <span
                  key={interestId}
                  className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold"
                >
                  {CANONICAL_INTEREST_LABELS[interestId] || interestId}
                </span>
              ))
            ) : (
              <span className="px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-[11px] font-medium">
                Balanced Highlights
              </span>
            )}
          </div>

          {/* Subdued Technical ID reference */}
          <div
            data-testid="itinerary-id-badge"
            className="text-[10px] text-gray-400 dark:text-gray-500 font-mono"
          >
            Ref: <span className="text-gray-500 dark:text-gray-400">{itinerary_id}</span>
          </div>
        </div>

        {/* Explanation Banner (if present and non-empty) */}
        {explanation && explanation.trim().length > 0 && (
          <div
            data-testid="itinerary-backend-explanation"
            className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed"
          >
            <div className="font-semibold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
              <Sparkles size={13} className="text-emerald-700 dark:text-emerald-400" />
              <span>Trip Overview</span>
            </div>
            <p className="text-emerald-900/90 dark:text-emerald-200/90">{explanation}</p>
          </div>
        )}
      </div>

      {/* Days list */}
      <div>
        {days.map((day) => (
          <ItineraryDaySection
            key={`day-${day.day_number}`}
            day={day}
            requestedInterests={constraints.interests}
          />
        ))}
      </div>
    </div>
  );
};
