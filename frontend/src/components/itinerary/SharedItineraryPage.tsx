import React from "react";
import { useSharedTrip } from "../../store/useSharedTrip";
import { ItineraryView } from "./ItineraryView";
import {
  Globe,
  Compass,
  AlertTriangle,
  Loader2,
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
        <div className="w-12 h-12 mx-auto rounded-xl bg-[#FAF7F2] text-[#B87B22] flex items-center justify-center animate-spin border border-[#E5DFD5]">
          <Loader2 size={24} />
        </div>
        <h3 className="text-lg font-serif font-bold text-[#12161E]">Loading Shared Itinerary...</h3>
        <p className="text-xs text-[#70798B]">
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
        <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-4 text-[#12161E] shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center border border-[#FDBA74]">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-bold text-[#12161E]">
              Shared Trip Not Found
            </h3>
            <p className="text-xs text-[#70798B] leading-relaxed">
              {error || "This shared itinerary link is invalid or has expired."}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              data-testid="plan-own-trip-button"
              onClick={onPlanOwnTrip}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
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
        className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] text-[#12161E] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] text-[#B87B22] flex items-center justify-center shrink-0 border border-[#E5DFD5]">
            <Globe size={20} />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#B87B22]">
                Public Shared Snapshot
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[10px] text-[#70798B] font-mono border border-[#E5DFD5]">
                Read-Only
              </span>
            </div>
            <p className="text-xs text-[#3D4654] truncate">
              Shared trip: <span className="font-semibold text-[#12161E]">{sharedTrip.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            data-testid="shared-plan-cta-button"
            onClick={onPlanOwnTrip}
            className="px-4 py-2 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
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
