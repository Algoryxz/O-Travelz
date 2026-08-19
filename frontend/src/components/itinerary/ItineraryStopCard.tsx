import React from "react";
import type { ItineraryStop } from "../../api/contracts";
import { getPlaceImageUrl, getPlaceRegion } from "../../utils/imageService";
import { MapPin, Clock } from "lucide-react";

interface ItineraryStopCardProps {
  stop: ItineraryStop;
}

export const ItineraryStopCard: React.FC<ItineraryStopCardProps> = ({ stop }) => {
  const imageUrl = getPlaceImageUrl(stop.place.name, stop.place.category);
  const region = getPlaceRegion(stop.place.name);

  // Time slot estimation for visual timeline: Stop 1 = 09:00, Stop 2 = 11:30, Stop 3 = 14:30
  const estimatedTime =
    stop.sequence === 1 ? "09:00" : stop.sequence === 2 ? "11:30" : "14:30";

  return (
    <div
      data-testid={`itinerary-stop-${stop.sequence}`}
      className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Stop Number Badge */}
        <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
          {stop.sequence}
        </div>

        {/* Thumbnail Image */}
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-gray-200">
          <img
            src={imageUrl}
            alt={stop.place.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceImageUrl(null, stop.place.category);
            }}
          />
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {stop.place.category}
            </span>
            <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
              <MapPin size={10} className="text-gray-400" />
              <span>{region}</span>
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug truncate">
            {stop.place.name}
          </h4>
        </div>
      </div>

      {/* Timeline Schedule Indicator */}
      <div className="flex items-center gap-2 sm:flex-col sm:items-end text-xs text-gray-500 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto justify-between sm:justify-center">
        <div className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100">
          <Clock size={12} className="text-emerald-700" />
          <span>{stop.planned_arrival || estimatedTime}</span>
        </div>
        {stop.planned_departure && (
          <span className="text-[11px] text-gray-600 font-medium">
            Dep: {stop.planned_departure}
          </span>
        )}
      </div>
    </div>
  );
};
