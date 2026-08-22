import React, { useState } from "react";
import type { ItineraryPlanResponse } from "../../types/api";
import {
  generateItineraryMarkdown,
  downloadItineraryMarkdown,
  triggerPrintItinerary,
  generateSafeFilename,
} from "../../utils/itineraryExport";
import {
  generateTravelerTripTitle,
  calculateItineraryTotalTransitMinutes,
  formatDurationHoursMins,
  CANONICAL_INTEREST_LABELS,
} from "../../utils/timelineService";
import { usePlaces } from "../../store/usePlaces";
import {
  Printer,
  FileText,
  Download,
  X,
  Check,
  Calendar,
  Compass,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";

interface ItineraryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: ItineraryPlanResponse | null | undefined;
  tripTitle?: string;
}

export const ItineraryExportModal: React.FC<ItineraryExportModalProps> = ({
  isOpen,
  onClose,
  itinerary,
  tripTitle,
}) => {
  const { getPlaceByName } = usePlaces();
  const [downloadedMd, setDownloadedMd] = useState(false);
  const [printed, setPrinted] = useState(false);

  if (!isOpen || !itinerary) return null;

  const { constraints, days, explanation } = itinerary;
  const title = tripTitle || generateTravelerTripTitle(constraints, days.length);
  const totalTransitMinutes = calculateItineraryTotalTransitMinutes(itinerary);
  const totalStopsCount = days.reduce((acc, d) => acc + d.stops.length, 0);
  const markdownFilename = generateSafeFilename(title, "md");

  const handlePrint = () => {
    setPrinted(true);
    triggerPrintItinerary();
    setTimeout(() => setPrinted(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    const success = downloadItineraryMarkdown(
      itinerary,
      title,
      (name) => getPlaceByName(name)
    );
    if (success) {
      setDownloadedMd(true);
      setTimeout(() => setDownloadedMd(false), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      data-testid="itinerary-export-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#111827] border border-[#263244] rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl text-white relative">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#263244]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#14B8A6] font-mono">
                Offline &amp; Print Export
              </span>
            </div>
            <h3 id="export-modal-title" className="text-xl font-bold font-display text-white">
              Export Itinerary
            </h3>
          </div>

          <button
            type="button"
            data-testid="close-export-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E2D44] transition-colors cursor-pointer"
            aria-label="Close Export Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Itinerary Preview Summary Card */}
        <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#1F293D] space-y-3">
          <div className="flex items-center justify-between">
            <h4
              data-testid="export-trip-title"
              className="text-sm font-bold text-white tracking-tight truncate max-w-[320px]"
            >
              {title}
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-[#14B8A6]/20 text-[#14B8A6] text-[10px] font-mono font-bold">
              {days.length} {days.length === 1 ? "Day" : "Days"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#14B8A6] shrink-0" />
              <span>{totalStopsCount} Destinations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#14B8A6] shrink-0" />
              <span>~{formatDurationHoursMins(totalTransitMinutes)} Transit</span>
            </div>
            {constraints?.start && (
              <div className="flex items-center gap-1.5 col-span-2 text-slate-400">
                <Compass size={13} className="text-amber-400 shrink-0" />
                <span>Start Hub: {constraints.start}</span>
              </div>
            )}
          </div>
        </div>

        {/* Export Actions */}
        <div className="space-y-3">
          {/* Option 1: Print / Save as PDF */}
          <button
            type="button"
            data-testid="print-itinerary-button"
            onClick={handlePrint}
            className="w-full p-4 rounded-2xl bg-[#172235] hover:bg-[#1E2D44] border border-[#263244] hover:border-[#14B8A6]/50 flex items-center justify-between transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/20 text-[#14B8A6] flex items-center justify-center shrink-0">
                <Printer size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-[#14B8A6] transition-colors">
                  Print / Save as PDF
                </div>
                <div className="text-xs text-slate-400">
                  Formatted high-contrast layout via browser print dialog
                </div>
              </div>
            </div>

            <div className="shrink-0 text-slate-400 group-hover:text-white">
              {printed ? (
                <span className="text-xs text-[#14B8A6] font-bold flex items-center gap-1">
                  <Check size={14} /> Printing...
                </span>
              ) : (
                <span className="text-xs font-bold text-[#14B8A6]">Print →</span>
              )}
            </div>
          </button>

          {/* Option 2: Download Markdown */}
          <button
            type="button"
            data-testid="download-markdown-button"
            onClick={handleDownloadMarkdown}
            className="w-full p-4 rounded-2xl bg-[#172235] hover:bg-[#1E2D44] border border-[#263244] hover:border-[#14B8A6]/50 flex items-center justify-between transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  Download Markdown (.md)
                </div>
                <div className="text-xs text-slate-400">
                  Offline Markdown document with daily timeline &amp; helplines
                </div>
              </div>
            </div>

            <div className="shrink-0 text-slate-400 group-hover:text-white">
              {downloadedMd ? (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Check size={14} /> Downloaded!
                </span>
              ) : (
                <Download size={16} className="text-slate-400 group-hover:text-white" />
              )}
            </div>
          </button>
        </div>

        {/* Security and Privacy Notice */}
        <div className="text-[11px] text-slate-400 text-center leading-relaxed pt-2 border-t border-[#1F293D]">
          <span>Client-side export · No accounts required · ₹0 cloud cost</span>
        </div>
      </div>
    </div>
  );
};
