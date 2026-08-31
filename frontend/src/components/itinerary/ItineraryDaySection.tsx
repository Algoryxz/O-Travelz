import React, { useState } from "react";
import { motion } from "motion/react";
import { buttonTap, cardTap, chipTap } from "../../lib/motion";
import type { ItineraryDay } from "../../types/api";
import { ItineraryStopCard } from "./ItineraryStopCard";
import { TransportHopCard } from "../transport/TransportHopCard";
import { Calendar, ChevronDown, ChevronUp, Clock, MapPin, Compass } from "lucide-react";
import { formatDurationHoursMins } from "../../utils/timelineService";

interface ItineraryDaySectionProps {
  day: ItineraryDay;
  requestedInterests?: string[];
  onReplaceStop?: (dayNumber: number, sequence: number, reason: string) => void;
}

export const ItineraryDaySection: React.FC<ItineraryDaySectionProps> = ({
  day,
  requestedInterests = [],
  onReplaceStop,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Derive total day transit metrics
  const totalDayTransitMinutes = (day.transit_hops || []).reduce(
    (sum, hop) => sum + (hop.duration_minutes || 0),
    0
  );

  const stopsCount = day.stops?.length || 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      data-testid={`itinerary-day-${day.day_number}`}
      className="rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs overflow-hidden text-[#12161E]"
    >
      {/* Day Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#E5DFD5] flex items-center justify-between cursor-pointer hover:bg-[#F2EEE7] transition-colors"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#B87B22] text-white flex flex-col items-center justify-center shadow-xs shrink-0 font-serif">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Day</span>
            <span className="text-sm font-bold leading-none">{day.day_number}</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#12161E] truncate">
                {day.theme || `Day ${day.day_number} Exploration`}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#70798B] mt-0.5">
              {day.date && (
                <span className="flex items-center gap-1 font-mono">
                  <Calendar size={11} className="text-[#B87B22]" />
                  <span>{day.date}</span>
                </span>
              )}
              <span className="flex items-center gap-1 font-medium">
                <MapPin size={11} className="text-[#1B5E6B]" />
                <span>{stopsCount} {stopsCount === 1 ? "stop" : "stops"}</span>
              </span>
              {totalDayTransitMinutes > 0 && (
                <span className="flex items-center gap-1 font-mono">
                  <Clock size={11} className="text-[#A84825]" />
                  <span>~{formatDurationHoursMins(totalDayTransitMinutes)} travel</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1.5 rounded-lg text-[#70798B] hover:text-[#12161E] transition-colors"
            aria-label={isExpanded ? "Collapse day" : "Expand day"}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Stops and Inter-Stop Transit Hops Timeline */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-4 bg-[#FFFFFF]">
          {stopsCount === 0 ? (
            <p className="text-xs text-[#70798B] italic py-4 text-center">
              No scheduled stops recorded for this day.
            </p>
          ) : (
            day.stops.map((stop, index) => {
              const nextStop = day.stops[index + 1];
              const matchingHop = day.transit_hops?.find(
                (h) =>
                  (h.from_stop_id && h.from_stop_id === stop.place_id) ||
                  (h.sequence_after_stop === stop.sequence)
              );

              return (
                <React.Fragment key={stop.place_id || stop.sequence}>
                  <ItineraryStopCard
                    stop={stop}
                    dayNumber={day.day_number}
                    requestedInterests={requestedInterests}
                    onReplaceStop={onReplaceStop}
                  />

                  {/* Render inter-destination transit hop between sequential stops */}
                  {index < day.stops.length - 1 && (
                    <TransportHopCard
                      hop={matchingHop}
                      originName={stop.place.name}
                      destinationName={nextStop?.place.name}
                    />
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      )}
    </motion.section>
  );
};
