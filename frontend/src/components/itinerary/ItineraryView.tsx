import React from "react";
import type { ItineraryPlanResponse } from "../../api/contracts";
import { ItineraryDaySection } from "./ItineraryDaySection";

interface ItineraryViewProps {
  itinerary: ItineraryPlanResponse;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ itinerary }) => {
  const { itinerary_id, constraints, days, explanation } = itinerary;

  return (
    <div data-testid="itinerary-view" className="space-y-6">
      {/* Header card with metadata and applied constraints */}
      <div className="p-5 md:p-6 rounded-3xl bg-white border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold font-display text-gray-900">Your Trip Itinerary</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Trip Plan ID: <span className="text-gray-600 font-medium">{itinerary_id}</span>
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            {days.length} {days.length === 1 ? "Day Plan" : "Days Plan"}
          </span>
        </div>

        {/* Applied Constraints Summary */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-gray-400 block font-medium">Days</span>
            <span className="text-gray-800 font-semibold">{constraints.days}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-gray-400 block font-medium">Interests</span>
            <span className="text-gray-800 font-semibold truncate block" title={constraints.interests.join(", ")}>
              {constraints.interests && constraints.interests.length > 0
                ? constraints.interests.join(", ")
                : "Balanced / Surprise"}
            </span>
          </div>

          {constraints.start && (
            <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-gray-400 block font-medium">Start Location</span>
              <span className="text-gray-800 font-semibold truncate block" title={constraints.start}>
                {constraints.start}
              </span>
            </div>
          )}

          {constraints.dates && constraints.dates.length > 0 && (
            <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-gray-400 block font-medium">Dates</span>
              <span className="text-gray-800 font-semibold truncate block" title={constraints.dates.join(", ")}>
                {constraints.dates.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Explanation - only rendered if present and non-empty */}
        {explanation && explanation.trim().length > 0 && (
          <div
            data-testid="itinerary-backend-explanation"
            className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 leading-relaxed"
          >
            <div className="font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
              <span>Trip Overview</span>
            </div>
            <p className="text-emerald-900/90">{explanation}</p>
          </div>
        )}
      </div>

      {/* Days list */}
      <div>
        {days.map((day) => (
          <ItineraryDaySection key={`day-${day.day_number}`} day={day} />
        ))}
      </div>
    </div>
  );
};
