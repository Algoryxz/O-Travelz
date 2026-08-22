import React from "react";
import { useSharedTrip } from "../../store/useSharedTrip";
import { ItineraryView } from "./ItineraryView";
import {
  Globe,
  Compass,
  AlertTriangle,
  Loader2,
  Calendar,
  Sparkles,
} from "lucide-react";

interface SharedItineraryPageProps {
  shareId: string | null;
  onPlanOwnTrip: () => void;
  onOpenMap?: () => void;
  onViewPlaceDetails?: (place: any) => void;
}

export const SharedItineraryPage: React.FC<SharedItineraryPageProps> = ({
  shareId,
  onPlanOwnTrip,
  onOpenMap,
  onViewPlaceDetails,
}) => {
  const { sharedTrip, isLoading, error } = useSharedTrip(shareId);

  if (isLoading) {
    return (
      <div
        data-testid="shared-trip-loading"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4"
      >
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#14B8A6]/20 text-[#14B8A6] flex items-center justify-center animate-spin">
          <Loader2 size={24} />
        </div>
        <h3 className="text-lg font-bold text-white font-display">Loading Shared Itinerary...</h3>
        <p className="text-xs text-slate-400">
          Retrieving verified travel stops and route timing.
        </p>
      </div>
    );
  }

  if (error || !sharedTrip) {
    return (
      <div
        data-testid="shared-trip-error-state"
        className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6"
      >
        <div className="p-8 rounded-3xl bg-[#111827] border border-amber-900/50 space-y-4 text-white shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-display text-white">
              Shared Trip Not Found
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {error || "This shared itinerary link is invalid or has expired."}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              data-testid="plan-own-trip-button"
              onClick={onPlanOwnTrip}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Compass size={16} />
              <span>Plan Your Own Odisha Itinerary</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="shared-itinerary-page"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Public Read-Only Banner */}
      <div
        data-testid="shared-trip-banner"
        className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-[#172235] to-[#111827] border border-[#263244] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#14B8A6]/20 text-[#14B8A6] flex items-center justify-center shrink-0">
            <Globe size={20} />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#14B8A6]">
                Public Shared Snapshot
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#1E2D44] text-[10px] text-slate-300 font-mono">
                Read-Only
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate">
              Shared trip: <span className="font-semibold text-white">{sharedTrip.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            data-testid="shared-plan-cta-button"
            onClick={onPlanOwnTrip}
            className="px-4 py-2.5 rounded-2xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Plan Your Own Trip</span>
          </button>
        </div>
      </div>

      {/* Render the verified Itinerary */}
      <ItineraryView
        itinerary={sharedTrip.itinerary}
        onOpenMap={onOpenMap}
        onViewPlaceDetails={onViewPlaceDetails}
      />
    </div>
  );
};
