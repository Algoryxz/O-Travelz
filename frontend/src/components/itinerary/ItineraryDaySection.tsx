import React from "react";
import type { ItineraryDay } from "../../api/contracts";
import { ItineraryStopCard } from "./ItineraryStopCard";
import { TransportHopCard } from "../transport/TransportHopCard";
import { usePlaces } from "../../store/usePlaces";
import { calculateDayTimeline } from "../../utils/timelineService";

interface ItineraryDaySectionProps {
  day: ItineraryDay;
  requestedInterests?: string[];
}

export const ItineraryDaySection: React.FC<ItineraryDaySectionProps> = ({
  day,
  requestedInterests = [],
}) => {
  const { getPlaceByName, getPlaceById } = usePlaces();

  // Deterministically calculate the cumulative timeline for all stops on this day
  const timeline = calculateDayTimeline(day, (name) => {
    return getPlaceByName(name);
  });

  // Identify start-origin hops (from_sequence === 0)
  const originHops = day.hops.filter((hop) => hop.from_sequence === 0);
  const consecutiveHops = day.hops.filter((hop) => hop.from_sequence > 0);

  // Map consecutive hops by from_sequence
  const hopsByFromSequence = new Map<number, typeof day.hops>();
  for (const hop of consecutiveHops) {
    const list = hopsByFromSequence.get(hop.from_sequence) ?? [];
    list.push(hop);
    hopsByFromSequence.set(hop.from_sequence, list);
  }

  const renderedHopKeys = new Set<string>();

  return (
    <section
      data-testid={`itinerary-day-${day.day_number}`}
      className="p-5 md:p-6 rounded-3xl bg-gray-50 dark:bg-slate-850/60 border border-gray-200/80 dark:border-slate-800 mb-6 last:mb-0 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 font-display">
          <span className="px-3 py-1 rounded-xl bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-2xs">
            {`Day ${day.day_number}`}
          </span>
          {day.date && (
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">
              {`(${day.date})`}
            </span>
          )}
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {`${day.stops.length} ${day.stops.length === 1 ? "Stop" : "Stops"} · ${day.hops.length} ${day.hops.length === 1 ? "Hop" : "Hops"}`}
        </div>
      </div>

      <div className="space-y-3">
        {/* Origin hops (e.g. from start origin to stop 1) */}
        {originHops.map((hop, idx) => {
          const key = `origin-${hop.from_sequence}-${hop.to_sequence}-${idx}`;
          renderedHopKeys.add(key);
          return <TransportHopCard key={key} hop={hop} />;
        })}

        {/* Sequential stops with intermediate transport hops */}
        {day.stops.map((stop) => {
          const followingHops = hopsByFromSequence.get(stop.sequence) ?? [];
          const timeInfo = timeline.get(stop.sequence);

          return (
            <React.Fragment key={`stop-${stop.sequence}`}>
              <ItineraryStopCard
                stop={stop}
                calculatedArrival={timeInfo?.arrivalFormatted}
                calculatedDeparture={timeInfo?.departureFormatted}
                visitMinutes={timeInfo?.visitMinutes}
                requestedInterests={requestedInterests}
              />
              {followingHops.map((hop, hIdx) => {
                const key = `hop-${hop.from_sequence}-${hop.to_sequence}-${hIdx}`;
                renderedHopKeys.add(key);
                return <TransportHopCard key={key} hop={hop} />;
              })}
            </React.Fragment>
          );
        })}

        {/* Unmatched / supplementary hops if any exist */}
        {day.hops
          .filter(
            (hop) =>
              hop.from_sequence !== 0 &&
              !day.stops.some((s) => s.sequence === hop.from_sequence)
          )
          .map((hop, idx) => (
            <TransportHopCard
              key={`extra-hop-${hop.from_sequence}-${hop.to_sequence}-${idx}`}
              hop={hop}
            />
          ))}
      </div>
    </section>
  );
};
