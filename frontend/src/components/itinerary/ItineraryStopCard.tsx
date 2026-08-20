import React from "react";
import type { ItineraryStop } from "../../types/api";
import { getPlaceImageUrl, getPlaceRegion } from "../../utils/imageService";
import { usePlaces } from "../../store/usePlaces";
import { CANONICAL_INTEREST_LABELS } from "../../utils/timelineService";
import { MapPin, Clock, Timer, Sparkles } from "lucide-react";

import { resolvePlaceImageUrl } from "../../utils/imageAdapter";

interface ItineraryStopCardProps {
  stop: ItineraryStop;
  calculatedArrival?: string;
  calculatedDeparture?: string;
  visitMinutes?: number;
  requestedInterests?: string[];
}

export const ItineraryStopCard: React.FC<ItineraryStopCardProps> = ({
  stop,
  calculatedArrival,
  calculatedDeparture,
  visitMinutes,
  requestedInterests = [],
}) => {
  const { getPlaceByName, getPlaceById } = usePlaces();
  const placeDetail = getPlaceById(stop.place.id) || getPlaceByName(stop.place.name);

  const imageUrl = resolvePlaceImageUrl(placeDetail || { name: stop.place.name, category: stop.place.category }, "card");
  const region = getPlaceRegion(stop.place.name);

  const arrivalTime =
    stop.planned_arrival || calculatedArrival || (stop.sequence === 1 ? "09:00" : "11:30");
  const departureTime = stop.planned_departure || calculatedDeparture;
  const visitDuration = visitMinutes ?? placeDetail?.avg_visit_minutes ?? 60;

  // Retrieve genuine canonical interests for this place
  const placeInterests = placeDetail?.interests || [];
  const normalizedRequested = requestedInterests.map((i) => i.toLowerCase().trim());

  return (
    <div
      data-testid={`itinerary-stop-${stop.sequence}`}
      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        {/* Stop Number Badge */}
        <div className="w-9 h-9 rounded-2xl bg-emerald-700 dark:bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5 sm:mt-0">
          {stop.sequence}
        </div>

        {/* Thumbnail Image */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-gray-200 dark:border-slate-800">
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
              className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
            >
              {stop.place.category}
            </span>

            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
              <MapPin size={10} className="text-gray-400 dark:text-gray-500" />
              <span>{region}</span>
            </span>

            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
              <Timer size={10} className="text-emerald-600 dark:text-emerald-400" />
              <span>~{visitDuration}m visit</span>
            </span>
          </div>

          {/* Destination Name */}
          <h4 className="text-sm sm:text-base font-bold font-display text-gray-900 dark:text-white leading-snug truncate">
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
                        ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 shadow-2xs font-bold"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700"
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

      {/* Timeline Schedule Indicator */}
      <div className="flex items-center gap-2 sm:flex-col sm:items-end text-xs text-gray-500 dark:text-gray-400 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800 w-full sm:w-auto justify-between sm:justify-center">
        <div
          data-testid={`stop-arrival-${stop.sequence}`}
          className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200 font-bold bg-emerald-50/90 dark:bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800 shadow-2xs"
        >
          <Clock size={13} className="text-emerald-700 dark:text-emerald-400" />
          <span className="font-mono text-sm tracking-tight">{arrivalTime}</span>
        </div>

        {departureTime && (
          <span
            data-testid={`stop-departure-${stop.sequence}`}
            className="text-[11px] text-gray-600 dark:text-gray-400 font-medium font-mono"
          >
            Dep: {departureTime}
          </span>
        )}
      </div>
    </div>
  );
};
