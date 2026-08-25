import React, { useState } from "react";
import type { ItineraryPlanResponse } from "../../types/api";
import {
  downloadItineraryMarkdown,
  triggerPrintItinerary,
} from "../../utils/itineraryExport";
import {
  generateTravelerTripTitle,
  calculateItineraryTotalTransitMinutes,
  formatDurationHoursMins,
} from "../../utils/timelineService";
import { usePlaces } from "../../store/usePlaces";
import {
  Printer,
  FileText,
  Download,
  X,
  Check,
  Compass,
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

  const { constraints, days } = itinerary;
  const title = tripTitle || generateTravelerTripTitle(constraints, days.length);
  const totalTransitMinutes = calculateItineraryTotalTransitMinutes(itinerary);
  const totalStopsCount = days.reduce((acc, d) => acc + d.stops.length, 0);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12161E]/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl text-[#12161E] relative">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B87B22] font-mono">
                Offline &amp; Document Export
              </span>
            </div>
            <h3 id="export-modal-title" className="text-xl font-serif font-bold text-[#12161E]">
              Export Itinerary
            </h3>
          </div>

          <button
            type="button"
            data-testid="close-export-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-[#70798B] hover:text-[#12161E] hover:bg-[#F2EEE7] transition-colors cursor-pointer"
            aria-label="Close Export Modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Itinerary Preview Summary Card */}
        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-3">
          <div className="flex items-center justify-between">
            <h4
              data-testid="export-trip-title"
              className="text-sm font-serif font-bold text-[#12161E] tracking-tight truncate max-w-[320px]"
            >
              {title}
            </h4>
            <span className="px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#B87B22] text-[10px] font-mono font-bold border border-[#E5DFD5]">
              {days.length} {days.length === 1 ? "Day" : "Days"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-[#3D4654]">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#B87B22] shrink-0" />
              <span>{totalStopsCount} Destinations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#1B5E6B] shrink-0" />
              <span>~{formatDurationHoursMins(totalTransitMinutes)} Transit</span>
            </div>
            {constraints?.start && (
              <div className="flex items-center gap-1.5 col-span-2 text-[#70798B]">
                <Compass size={13} className="text-[#B87B22] shrink-0" />
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
            className="w-full p-4 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EEE7] border border-[#E5DFD5] hover:border-[#D1C8BA] flex items-center justify-between transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] text-[#B87B22] flex items-center justify-center shrink-0 border border-[#E5DFD5]">
                <Printer size={18} />
              </div>
              <div>
                <div className="text-sm font-serif font-bold text-[#12161E] group-hover:text-[#B87B22] transition-colors">
                  Print / Save as PDF
                </div>
                <div className="text-xs text-[#70798B]">
                  Formatted editorial layout via browser print
                </div>
              </div>
            </div>

            <div className="shrink-0 text-[#70798B]">
              {printed ? (
                <span className="text-xs text-[#2F523E] font-bold flex items-center gap-1">
                  <Check size={14} /> Printing...
                </span>
              ) : (
                <span className="text-xs font-bold text-[#B87B22]">Print →</span>
              )}
            </div>
          </button>

          {/* Option 2: Download Markdown */}
          <button
            type="button"
            data-testid="download-markdown-button"
            onClick={handleDownloadMarkdown}
            className="w-full p-4 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EEE7] border border-[#E5DFD5] hover:border-[#D1C8BA] flex items-center justify-between transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] text-[#1B5E6B] flex items-center justify-center shrink-0 border border-[#E5DFD5]">
                <FileText size={18} />
              </div>
              <div>
                <div className="text-sm font-serif font-bold text-[#12161E] group-hover:text-[#1B5E6B] transition-colors">
                  Download Markdown (.md)
                </div>
                <div className="text-xs text-[#70798B]">
                  Offline travel document with timeline &amp; logistics
                </div>
              </div>
            </div>

            <div className="shrink-0 text-[#70798B]">
              {downloadedMd ? (
                <span className="text-xs text-[#2F523E] font-bold flex items-center gap-1">
                  <Check size={14} /> Downloaded!
                </span>
              ) : (
                <Download size={15} className="text-[#70798B]" />
              )}
            </div>
          </button>
        </div>

        {/* Security and Privacy Notice */}
        <div className="text-[11px] text-[#70798B] text-center leading-relaxed pt-2 border-t border-[#E5DFD5] font-mono">
          <span>Client-side export · No accounts required · ₹0 cloud cost</span>
        </div>
      </div>
    </div>
  );
};
