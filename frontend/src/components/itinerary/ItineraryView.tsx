import React, { useState, useCallback } from "react";
import type { ItineraryPlanResponse } from "../../types/api";
import { ItineraryDaySection } from "./ItineraryDaySection";
import { ShareTripModal } from "./ShareTripModal";
import { ItineraryExportModal } from "./ItineraryExportModal";
import { PrintableItineraryView } from "./PrintableItineraryView";
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
  Share2,
  FileDown,
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
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

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
      <div className="p-5 md:p-7 rounded-3xl bg-[#111827] border border-[#263244] shadow-sm space-y-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#263244]">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#14B8A6] font-mono">
                Verified Odisha Itinerary
              </span>
              {itinerary_id && (
                <span className="text-[10px] text-slate-400 font-mono">
                  (Ref: {itinerary_id})
                </span>
              )}
            </div>
            <h2
              data-testid="itinerary-traveler-title"
              className="text-xl sm:text-2xl font-extrabold font-display text-white tracking-tight"
            >
              {tripTitle}
            </h2>
            {explanation && (
              <div className="space-y-0.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Trip Overview
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {explanation}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons: Export/Print, Share Trip & Copy Summary */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <button
              type="button"
              data-testid="export-itinerary-button"
              onClick={() => setIsExportOpen(true)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-2xs bg-[#172235] text-slate-200 border-[#263244] hover:bg-[#1E2D44] hover:border-[#14B8A6]/40 hover:text-white"
              aria-label="Export Itinerary"
            >
              <FileDown size={14} className="text-[#14B8A6]" />
              <span>Export / Print</span>
            </button>

            <button
              type="button"
              data-testid="share-trip-button"
              onClick={() => setIsShareOpen(true)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-2xs bg-[#14B8A6]/20 text-teal-300 border-[#14B8A6]/40 hover:bg-[#14B8A6]/30"
              aria-label="Share Trip"
            >
              <Share2 size={14} className="text-[#14B8A6]" />
              <span>Share Trip</span>
            </button>

            <button
              type="button"
              data-testid="copy-itinerary-button"
              onClick={handleCopySummary}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-2xs ${
                copied
                  ? "bg-[#14B8A6] text-white border-[#14B8A6] shadow-sm"
                  : "bg-[#172235] text-slate-200 border-[#263244] hover:bg-[#1E2D44]"
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
                  <Copy size={14} className="text-[#14B8A6]" />
                  <span>Copy Itinerary Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {copyError && (
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs font-medium">
            {copyError}
          </div>
        )}

        {/* Traveler Metrics Grid */}
        <div
          data-testid="itinerary-metrics-strip"
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
        >
          <div className="p-3 rounded-2xl bg-[#172235] border border-[#263244] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#14B8A6]/20 text-teal-300 flex items-center justify-center shrink-0">
              <Calendar size={15} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Duration
              </span>
              <span className="text-white font-bold text-sm">
                {days.length} {days.length === 1 ? "Day" : "Days"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#172235] border border-[#263244] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
              <MapPin size={15} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Total Stops
              </span>
              <span className="text-white font-bold text-sm">
                {totalStopsCount} {totalStopsCount === 1 ? "Destination" : "Destinations"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#172235] border border-[#263244] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <Clock size={15} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Transit Time
              </span>
              <span className="text-white font-bold text-sm font-mono">
                ~{formatDurationHoursMins(totalTransitMinutes)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#172235] border border-[#263244] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <Compass size={15} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Origin Hub
              </span>
              <span className="text-white font-bold text-sm truncate max-w-[110px] block">
                {constraints?.start || "Bhubaneswar"}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Requested Interests Pills */}
        {constraints?.interests && constraints.interests.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mr-1">
              Themes:
            </span>
            {constraints.interests.map((interestId) => {
              const label = CANONICAL_INTEREST_LABELS[interestId] || interestId;
              return (
                <span
                  key={interestId}
                  className="px-2.5 py-0.5 rounded-full bg-[#172235] text-teal-300 border border-[#263244] text-[11px] font-semibold flex items-center gap-1"
                >
                  <Sparkles size={11} className="text-[#14B8A6]" />
                  <span>{label}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily Timeline Sections */}
      <div className="space-y-6">
        {days.map((day) => (
          <ItineraryDaySection
            key={day.day_number}
            day={day}
            requestedInterests={constraints?.interests || []}
          />
        ))}
      </div>

      {/* Share Trip Modal */}
      <ShareTripModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        itinerary={itinerary}
        tripTitle={tripTitle}
      />

      {/* Export & Print Modal */}
      <ItineraryExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        itinerary={itinerary}
        tripTitle={tripTitle}
      />

      {/* Dedicated Print-Only Representation for Native Browser Printing */}
      <div className="print-only" aria-hidden="true">
        <PrintableItineraryView itinerary={itinerary} tripTitle={tripTitle} />
      </div>
    </div>
  );
};
