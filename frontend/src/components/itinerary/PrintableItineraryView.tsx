import React from "react";
import type { ItineraryPlanResponse } from "../../types/api";
import { usePlaces } from "../../store/usePlaces";
import {
  generateTravelerTripTitle,
  calculateItineraryTotalTransitMinutes,
  formatDurationHoursMins,
  calculateDayTimeline,
  CANONICAL_INTEREST_LABELS,
} from "../../utils/timelineService";
import { ODISHA_EMERGENCY_HELPLINES } from "../../utils/itineraryExport";

interface PrintableItineraryViewProps {
  itinerary: ItineraryPlanResponse;
  tripTitle?: string;
}

export const PrintableItineraryView: React.FC<PrintableItineraryViewProps> = ({
  itinerary,
  tripTitle,
}) => {
  const { constraints, days, explanation } = itinerary;
  const { getPlaceByName } = usePlaces();

  const title = tripTitle || generateTravelerTripTitle(constraints, days.length);
  const totalTransitMinutes = calculateItineraryTotalTransitMinutes(itinerary);
  const totalStopsCount = days.reduce((acc, d) => acc + d.stops.length, 0);

  return (
    <div
      data-testid="printable-itinerary-view"
      className="printable-itinerary bg-white text-black p-8 max-w-4xl mx-auto space-y-6 print:p-0 print:m-0"
    >
      {/* 1. Header Banner */}
      <header className="border-b-2 border-black pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-bold text-gray-700">
            O-Travelz · Verified Odisha Itinerary
          </span>
          <span className="text-xs text-gray-500 font-mono">
            {days.length} {days.length === 1 ? "Day" : "Days"} · {totalStopsCount} Stops
          </span>
        </div>

        <h1
          data-testid="printable-trip-title"
          className="text-2xl sm:text-3xl font-bold text-black tracking-tight"
        >
          {title}
        </h1>

        {explanation && (
          <p className="text-xs text-gray-700 leading-relaxed italic">
            {explanation}
          </p>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs border-t border-gray-200 mt-2">
          {constraints?.start && (
            <div>
              <span className="font-semibold text-gray-600">Starting Hub: </span>
              <span className="font-medium text-black">{constraints.start}</span>
            </div>
          )}
          {constraints?.interests && constraints.interests.length > 0 && (
            <div>
              <span className="font-semibold text-gray-600">Themes: </span>
              <span className="font-medium text-black">
                {constraints.interests
                  .map((i) => CANONICAL_INTEREST_LABELS[i.toLowerCase()] || i)
                  .join(", ")}
              </span>
            </div>
          )}
          <div>
            <span className="font-semibold text-gray-600">Total Transit: </span>
            <span className="font-medium text-black">
              ~{formatDurationHoursMins(totalTransitMinutes)}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Day-by-Day Schedule */}
      <main className="space-y-6">
        {days.map((day) => {
          const timeline = calculateDayTimeline(day, (name) => getPlaceByName(name));

          return (
            <section
              key={day.day_number}
              data-testid={`printable-day-${day.day_number}`}
              className="day-print-section border border-gray-300 rounded-lg p-4 space-y-4 break-inside-avoid page-break-inside-avoid"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h2 className="text-base font-bold text-black">
                  Day {day.day_number}
                  {day.theme ? ` — ${day.theme}` : ""}
                </h2>
                {day.date && (
                  <span className="text-xs font-mono text-gray-600">
                    {day.date}
                  </span>
                )}
              </div>

              {/* Stops in Day */}
              <div className="space-y-3">
                {day.stops.map((stop, sIdx) => {
                  const timeInfo = timeline.get(stop.sequence);
                  const placeDetail = getPlaceByName(stop.place?.name || "");
                  const arrival = timeInfo?.arrivalFormatted || stop.planned_arrival || "09:00";
                  const dep = timeInfo?.departureFormatted || stop.planned_departure;
                  const visit = timeInfo?.visitMinutes || stop.duration_minutes || 60;
                  const placeName = stop.place?.name || "Destination";
                  const category = stop.place?.category || "Destination";

                  // Connecting hop to next stop
                  const nextStop = day.stops[sIdx + 1];
                  const hop = nextStop
                    ? day.hops.find(
                        (h) => h.from_sequence === stop.sequence && h.to_sequence === nextStop.sequence
                      )
                    : null;

                  return (
                    <div key={stop.place?.id || `stop-${day.day_number}-${stop.sequence}`} className="space-y-2">
                      <div className="flex items-start justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300">
                              {arrival}
                            </span>
                            <span className="font-bold text-black text-sm">
                              {placeName}
                            </span>
                            <span className="text-[11px] text-gray-600 italic">
                              ({category})
                            </span>
                          </div>

                          {placeDetail?.interests && placeDetail.interests.length > 0 && (
                            <div className="text-[11px] text-gray-600">
                              Themes:{" "}
                              {placeDetail.interests
                                .map((i) => CANONICAL_INTEREST_LABELS[i.toLowerCase()] || i)
                                .join(" · ")}
                            </div>
                          )}

                          {stop.place?.description && (
                            <p className="text-[11px] text-gray-700 pt-0.5 leading-snug">
                              {stop.place.description}
                            </p>
                          )}
                        </div>

                        <div className="text-right text-[11px] font-mono text-gray-600 shrink-0">
                          <span>~{visit} min</span>
                          {dep && <div className="text-[10px] text-gray-500">Depart: {dep}</div>}
                        </div>
                      </div>

                      {/* Transit Hop Divider */}
                      {hop && (
                        <div className="ml-4 pl-3 border-l-2 border-dashed border-gray-300 py-1 text-[11px] text-gray-700">
                          <span className="font-semibold">↳ Travel: </span>
                          <span>
                            ~{formatDurationHoursMins(hop.estimated_minutes)} via{" "}
                            {hop.mode === "unavailable" ? "Transit Notice" : hop.mode}
                            {hop.estimated_cost != null ? ` (₹${hop.estimated_cost})` : ""}
                          </span>
                          {hop.reason && (
                            <span className="block text-[10px] text-gray-500 italic">
                              Notice: {hop.reason}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* 3. Emergency & Tourist Helplines */}
      <footer className="border-t-2 border-black pt-4 space-y-3 break-inside-avoid page-break-inside-avoid text-xs">
        <h3 className="font-bold text-black uppercase tracking-wider text-xs">
          Odisha Traveler &amp; Emergency Helplines
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ODISHA_EMERGENCY_HELPLINES.map((contact) => (
            <div key={contact.service} className="p-2 border border-gray-200 rounded bg-gray-50">
              <div className="font-bold text-black">{contact.service}</div>
              <div className="font-mono font-bold text-gray-800">{contact.number}</div>
              <div className="text-[10px] text-gray-600">{contact.description}</div>
            </div>
          ))}
        </div>

        <div className="pt-2 text-[10px] text-gray-500 flex items-center justify-between border-t border-gray-100">
          <span>O-Travelz · Grounded Odisha Travel Intelligence</span>
          <span>Printed on {new Date().toISOString().split("T")[0]}</span>
        </div>
      </footer>
    </div>
  );
};
