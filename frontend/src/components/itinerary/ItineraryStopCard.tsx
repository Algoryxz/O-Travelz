import React, { useState } from "react";
import type { ItineraryStop } from "../../types/api";
import { getPlaceImageUrl, getPlaceRegion } from "../../utils/imageService";
import { usePlaces } from "../../store/usePlaces";
import { CANONICAL_INTEREST_LABELS } from "../../utils/timelineService";
import { MapPin, Clock, Timer, RefreshCw, X, Check } from "lucide-react";
import { resolvePlaceImageUrl } from "../../utils/imageAdapter";

interface ItineraryStopCardProps {
  stop: ItineraryStop;
  dayNumber?: number;
  calculatedArrival?: string;
  calculatedDeparture?: string;
  visitMinutes?: number;
  requestedInterests?: string[];
  onReplaceStop?: (dayNumber: number, sequence: number, reason: string) => void;
}

const REPLACEMENT_REASONS = [
  { id: "crowd", label: "Too crowded" },
  { id: "walking", label: "Too much walking" },
  { id: "weather", label: "Weather / Rainy" },
  { id: "interest", label: "Not interested" },
  { id: "closed", label: "Closed / unavailable" },
  { id: "user_request", label: "Other preference" },
];

export const ItineraryStopCard: React.FC<ItineraryStopCardProps> = ({
  stop,
  dayNumber = 1,
  calculatedArrival,
  calculatedDeparture,
  visitMinutes,
  requestedInterests = [],
  onReplaceStop,
}) => {
  const [showReplaceMenu, setShowReplaceMenu] = useState(false);
  const { getPlaceByName, getPlaceById } = usePlaces();
  const placeDetail = getPlaceById(stop.place.id) || getPlaceByName(stop.place.name);

  const imageUrl = resolvePlaceImageUrl(placeDetail || { name: stop.place.name, category: stop.place.category }, "card");
  const region = getPlaceRegion(stop.place.name);

  const arrivalTime =
    stop.planned_arrival || calculatedArrival || (stop.sequence === 1 ? "09:00" : "11:30");
  const departureTime = stop.planned_departure || calculatedDeparture;
  const visitDuration = visitMinutes ?? placeDetail?.avg_visit_minutes ?? 60;

  const placeInterests = placeDetail?.interests || [];
  const normalizedRequested = requestedInterests.map((i) => i.toLowerCase().trim());

  const handleSelectReason = (reasonId: string) => {
    setShowReplaceMenu(false);
    if (onReplaceStop) {
      onReplaceStop(dayNumber, stop.sequence, reasonId);
    }
  };

  return (
    <div
      data-testid={`itinerary-stop-${stop.sequence}`}
      className="p-4 sm:p-5 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] hover:border-[#D1C8BA] shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[#12161E] relative"
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        {/* Stop Number Badge */}
        <div className="w-8 h-8 rounded-lg bg-[#12161E] text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0 mt-0.5 sm:mt-0 font-mono">
          {stop.sequence}
        </div>

        {/* Thumbnail Image */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-[#F2EEE7] shrink-0 border border-[#E5DFD5]">
          <img
            src={imageUrl}
            alt={stop.place.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceImageUrl(null, stop.place.category);
            }}
          />
        </div>

        {/* Details & Thematic Badges */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Header row: Physical Category & Region */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              data-testid={`stop-category-${stop.sequence}`}
              className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-[#F2EEE7] text-[#12161E] border border-[#E5DFD5] font-mono"
            >
              {stop.place.category}
            </span>

            <span className="text-[11px] text-[#70798B] font-medium flex items-center gap-1">
              <MapPin size={10} className="text-[#B87B22]" />
              <span>{region}</span>
            </span>

            <span className="text-[11px] text-[#70798B] font-medium flex items-center gap-1">
              <Timer size={10} className="text-[#1B5E6B]" />
              <span>~{visitDuration}m visit</span>
            </span>
          </div>

          {/* Destination Name */}
          <h4 className="text-sm sm:text-base font-serif font-bold text-[#12161E] leading-snug truncate">
            {stop.place.name}
          </h4>

          {/* Genuine Thematic Interest Badges */}
          {placeInterests.length > 0 && (
            <div
              data-testid={`stop-interests-${stop.sequence}`}
              className="flex flex-wrap items-center gap-1.5 pt-0.5"
            >
              {placeInterests.map((interestId) => {
                const label = CANONICAL_INTEREST_LABELS[interestId] || interestId;
                const isRequested = normalizedRequested.includes(interestId.toLowerCase());

                return (
                  <span
                    key={interestId}
                    data-testid={`stop-interest-${interestId}`}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors ${
                      isRequested
                        ? "bg-[#B87B22]/10 text-[#B87B22] border-[#B87B22]/30 font-bold"
                        : "bg-[#FAF7F2] text-[#70798B] border-[#E5DFD5]"
                    }`}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Timeline Schedule Indicator & Actions */}
      <div className="flex items-center gap-3 sm:flex-col sm:items-end text-xs text-[#70798B] shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5DFD5] w-full sm:w-auto justify-between sm:justify-center">
        <div
          data-testid={`stop-arrival-${stop.sequence}`}
          className="flex items-center gap-1.5 text-[#12161E] font-bold bg-[#F2EEE7] px-3 py-1 rounded-lg border border-[#E5DFD5]"
        >
          <Clock size={12} className="text-[#B87B22]" />
          <span className="font-mono text-sm tracking-tight">{arrivalTime}</span>
        </div>

        <div className="flex items-center gap-2">
          {departureTime && (
            <span
              data-testid={`stop-departure-${stop.sequence}`}
              className="text-[11px] text-[#70798B] font-medium font-mono"
            >
              Dep: {departureTime}
            </span>
          )}

          {/* Replace stop action trigger */}
          {onReplaceStop && (
            <div className="relative">
              <button
                type="button"
                data-testid={`replace-stop-${stop.sequence}`}
                onClick={() => setShowReplaceMenu(!showReplaceMenu)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#505D75] hover:text-[#B87B22] px-2 py-1 rounded-md border border-[#E5DFD5] hover:border-[#B87B22]/40 bg-[#FAF7F2] hover:bg-[#FFF8EE] transition-all"
                title="Replace this stop"
              >
                <RefreshCw size={11} className={showReplaceMenu ? "rotate-180 transition-transform" : ""} />
                <span>Replace</span>
              </button>

              {/* Lightweight popup menu */}
              {showReplaceMenu && (
                <div
                  data-testid={`replace-menu-${stop.sequence}`}
                  className="absolute right-0 top-full mt-1.5 z-20 w-48 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-lg p-1.5 space-y-0.5 text-left"
                >
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8C96A5] font-mono border-b border-[#F2EEE7]">
                    Replace because:
                  </div>
                  {REPLACEMENT_REASONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      data-testid={`replace-reason-${r.id}-${stop.sequence}`}
                      onClick={() => handleSelectReason(r.id)}
                      className="w-full text-left px-2 py-1.5 text-xs text-[#12161E] hover:bg-[#F2EEE7] rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

