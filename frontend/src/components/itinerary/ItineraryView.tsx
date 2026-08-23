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
      <div className="p-5 md:p-7 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs space-y-5 text-[#12161E]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B87B22] font-mono">
                Verified Odisha Itinerary
              </span>
              {itinerary_id && (
                <span className="text-[10px] text-[#70798B] font-mono">
                  (Ref: {itinerary_id})
                </span>
              )}
            </div>
            <h2
              data-testid="itinerary-traveler-title"
              className="text-xl sm:text-2xl font-serif font-bold text-[#12161E] tracking-tight"
            >
              {tripTitle}
            </h2>
            {explanation && (
              <div className="space-y-0.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#70798B] font-mono">
                  Trip Overview
                </span>
                <p className="text-xs text-[#3D4654] leading-relaxed">
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
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border bg-[#FFFFFF] text-[#12161E] border-[#E5DFD5] hover:bg-[#FAF7F2] shadow-xs"
              aria-label="Export Itinerary"
            >
              <FileDown size={14} className="text-[#1B5E6B]" />
              <span>Export / Print</span>
            </button>

            <button
              type="button"
              data-testid="share-trip-button"
              onClick={() => setIsShareOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border bg-[#B87B22] text-white border-[#B87B22] hover:bg-[#A0691B] shadow-xs"
              aria-label="Share Trip"
            >
              <Share2 size={14} className="text-white" />
              <span>Share Trip</span>
            </button>

            <button
              type="button"
              data-testid="copy-itinerary-button"
              onClick={handleCopySummary}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-xs ${
                copied
                  ? "bg-[#2F523E] text-white border-[#2F523E]"
                  : "bg-[#F2EEE7] text-[#12161E] border-[#E5DFD5] hover:bg-[#EAE4DA]"
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
                  <Copy size={14} className="text-[#70798B]" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {copyError && (
          <div className="p-3 rounded-lg bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] text-xs font-medium">
            {copyError}
          </div>
        )}

        {/* Traveler Metrics Grid */}
        <div
          data-testid="itinerary-metrics-strip"
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
        >
          <div className="p-3 rounded-xl bg-[#F2EEE7] border border-[#E5DFD5] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] text-[#B87B22] flex items-center justify-center shrink-0 border border-[#E5DFD5]">
              <Calendar size={15} />
            </div>
            <div>
              <span className="text-[10px] text-[#70798B] font-bold uppercase tracking-wider block font-mono">
                Duration
              </span>
              <span className="text-[#12161E] font-bold text-sm font-serif">
                {days.length} {days.length === 1 ? "Day" : "Days"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F2EEE7] border border-[#E5DFD5] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] text-[#1B5E6B] flex items-center justify-center shrink-0 border border-[#E5DFD5]">
              <MapPin size={15} />
            </div>
            <div>
              <span className="text-[10px] text-[#70798B] font-bold uppercase tracking-wider block font-mono">
                Total Stops
              </span>
              <span className="text-[#12161E] font-bold text-sm font-serif">
                {totalStopsCount} {totalStopsCount === 1 ? "Destination" : "Destinations"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F2EEE7] border border-[#E5DFD5] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] text-[#A84825] flex items-center justify-center shrink-0 border border-[#E5DFD5]">
              <Clock size={15} />
            </div>
            <div>
              <span className="text-[10px] text-[#70798B] font-bold uppercase tracking-wider block font-mono">
                Transit Time
              </span>
              <span className="text-[#12161E] font-bold text-sm font-mono">
                ~{formatDurationHoursMins(totalTransitMinutes)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F2EEE7] border border-[#E5DFD5] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] text-[#2F523E] flex items-center justify-center shrink-0 border border-[#E5DFD5]">
              <Compass size={15} />
            </div>
            <div>
              <span className="text-[10px] text-[#70798B] font-bold uppercase tracking-wider block font-mono">
                Origin Hub
              </span>
              <span className="text-[#12161E] font-bold text-sm truncate max-w-[110px] block">
                {constraints?.start || "Bhubaneswar"}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Requested Interests Pills */}
        {constraints?.interests && constraints.interests.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-[#70798B] uppercase tracking-wider font-mono mr-1">
              Themes:
            </span>
            {constraints.interests.map((interestId) => {
              const label = CANONICAL_INTEREST_LABELS[interestId] || interestId;
              return (
                <span
                  key={interestId}
                  className="px-2.5 py-0.5 rounded-md bg-[#FAF7F2] text-[#B87B22] border border-[#E5DFD5] text-[11px] font-semibold flex items-center gap-1"
                >
                  <Sparkles size={11} className="text-[#B87B22]" />
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
