import type {
  ItineraryDay,
  ItineraryPlanResponse,
  ItineraryStop,
  PlanningConstraints,
  TransportHop,
} from "../api/contracts";

export interface StopTimelineInfo {
  sequence: number;
  arrivalFormatted: string; // e.g. "09:00"
  departureFormatted: string; // e.g. "10:00"
  visitMinutes: number;
  isTransitUnknown: boolean;
}

export const CANONICAL_INTEREST_LABELS: Record<string, string> = {
  heritage: "Heritage",
  spirituality: "Spirituality",
  architecture: "Architecture",
  food: "Food",
  culture: "Culture",
  nature: "Nature",
  beach: "Beach",
  wildlife: "Wildlife",
  waterfall: "Waterfall",
  relaxation: "Relaxation",
  adventure: "Adventure",
  shopping: "Shopping",
};

/**
 * Formats minutes from midnight into 24-hour HH:MM string.
 * e.g. 540 -> "09:00", 645 -> "10:45", 825 -> "13:45".
 */
export function formatTimeMinutes(totalMinutes: number): string {
  const normalized = totalMinutes % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Formats duration in minutes to human-readable string.
 * e.g. 45 -> "45m", 90 -> "1h 30m", 120 -> "2h".
 */
export function formatDurationHoursMins(mins: number | null | undefined): string {
  if (mins === null || mins === undefined) return "Unknown";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

/**
 * Pure deterministic calculation of cumulative day timeline.
 * Base departure is 09:00 (540 mins).
 * Next arrival = previous arrival + previous visit + transport estimated_minutes.
 */
export function calculateDayTimeline(
  day: ItineraryDay,
  getPlaceByName?: (name: string) => { avg_visit_minutes?: number | null } | undefined
): Map<number, StopTimelineInfo> {
  const result = new Map<number, StopTimelineInfo>();
  if (!day.stops || day.stops.length === 0) return result;

  const sortedStops = [...day.stops].sort((a, b) => a.sequence - b.sequence);
  const BASE_START_MINUTES = 9 * 60; // 09:00

  // Check for origin hop (sequence 0 -> sequence 1)
  const originHop = day.hops.find((h) => h.from_sequence === 0 && h.to_sequence === sortedStops[0]?.sequence);
  let currentMinutes = BASE_START_MINUTES;
  if (originHop && typeof originHop.estimated_minutes === "number") {
    currentMinutes += originHop.estimated_minutes;
  }

  let isTimelineBroken = false;

  for (let i = 0; i < sortedStops.length; i++) {
    const stop = sortedStops[i];
    const placeDetail = getPlaceByName ? getPlaceByName(stop.place.name) : undefined;
    const visitDuration = placeDetail?.avg_visit_minutes ?? 60; // Default 60m convention

    if (i > 0) {
      const prevStop = sortedStops[i - 1];
      const connectingHop = day.hops.find(
        (h) => h.from_sequence === prevStop.sequence && h.to_sequence === stop.sequence
      );

      if (connectingHop && typeof connectingHop.estimated_minutes === "number") {
        currentMinutes += connectingHop.estimated_minutes;
      } else {
        // Unknown or unavailable transit duration
        isTimelineBroken = true;
      }
    }

    const arrivalFormatted = stop.planned_arrival
      ? stop.planned_arrival
      : isTimelineBroken
      ? "--:--"
      : formatTimeMinutes(currentMinutes);

    const departureMinutes = currentMinutes + visitDuration;
    const departureFormatted = stop.planned_departure
      ? stop.planned_departure
      : isTimelineBroken
      ? "--:--"
      : formatTimeMinutes(departureMinutes);

    result.set(stop.sequence, {
      sequence: stop.sequence,
      arrivalFormatted,
      departureFormatted,
      visitMinutes: visitDuration,
      isTransitUnknown: isTimelineBroken,
    });

    currentMinutes = departureMinutes;
  }

  return result;
}

/**
 * Calculates total verified transit minutes across all days in the itinerary.
 */
export function calculateItineraryTotalTransitMinutes(itinerary: ItineraryPlanResponse): number {
  let total = 0;
  for (const day of itinerary.days) {
    for (const hop of day.hops) {
      if (typeof hop.estimated_minutes === "number") {
        total += hop.estimated_minutes;
      }
    }
  }
  return total;
}

/**
 * Generates a clean, traveler-friendly summary title based on constraints and route.
 */
export function generateTravelerTripTitle(
  constraints: PlanningConstraints,
  itineraryDaysCount: number
): string {
  const origin = constraints.start ? constraints.start.trim() : null;
  const interestLabels = (constraints.interests || [])
    .map((id) => CANONICAL_INTEREST_LABELS[id.toLowerCase()] || id)
    .filter(Boolean);

  const interestStr =
    interestLabels.length > 0
      ? interestLabels.slice(0, 2).join(" & ") + (interestLabels.length > 2 ? ` + ${interestLabels.length - 2} more` : "")
      : "Balanced Highlights";

  if (origin) {
    return `${origin} ${interestStr} ${itineraryDaysCount === 1 ? "Day Tour" : "Exploration"}`;
  }

  return `Odisha ${interestStr} ${itineraryDaysCount === 1 ? "Day Trip" : `${itineraryDaysCount}-Day Journey`}`;
}

/**
 * Generates a structured, clean plain-text summary suitable for clipboard copy.
 */
export function generateItineraryPlainTextSummary(
  itinerary: ItineraryPlanResponse,
  getPlaceByName?: (name: string) => { avg_visit_minutes?: number | null; interests?: string[] } | undefined
): string {
  const { constraints, days } = itinerary;
  const title = generateTravelerTripTitle(constraints, days.length);
  const totalTransit = calculateItineraryTotalTransitMinutes(itinerary);
  const totalStops = days.reduce((sum, d) => sum + d.stops.length, 0);

  const lines: string[] = [
    `============================================================`,
    `O-TRAVELZ TRIP ITINERARY`,
    `${title.toUpperCase()}`,
    `============================================================`,
    `Duration: ${days.length} ${days.length === 1 ? "Day" : "Days"} · ${totalStops} Destinations`,
    `Total Transit: ~${formatDurationHoursMins(totalTransit)}`,
  ];

  if (constraints.start) {
    lines.push(`Starting Hub: ${constraints.start}`);
  }
  if (constraints.interests && constraints.interests.length > 0) {
    const labels = constraints.interests.map((i) => CANONICAL_INTEREST_LABELS[i] || i);
    lines.push(`Requested Themes: ${labels.join(", ")}`);
  }
  lines.push("");

  for (const day of days) {
    const dateStr = day.date ? ` (${day.date})` : "";
    lines.push(`------------------------------------------------------------`);
    lines.push(`DAY ${day.day_number}${dateStr}`);
    lines.push(`------------------------------------------------------------`);

    const timeline = calculateDayTimeline(day, getPlaceByName);

    for (let sIdx = 0; sIdx < day.stops.length; sIdx++) {
      const stop = day.stops[sIdx];
      const timeInfo = timeline.get(stop.sequence);
      const placeDetail = getPlaceByName ? getPlaceByName(stop.place.name) : undefined;
      const arrival = timeInfo?.arrivalFormatted || stop.planned_arrival || "09:00";
      const dep = timeInfo?.departureFormatted || stop.planned_departure;
      const visit = timeInfo?.visitMinutes || 60;

      lines.push(`${arrival} — ${stop.place.name}`);
      lines.push(`   Category: ${stop.place.category}`);

      if (placeDetail?.interests && placeDetail.interests.length > 0) {
        const themeLabels = placeDetail.interests.map((i) => CANONICAL_INTEREST_LABELS[i] || i);
        lines.push(`   Themes: ${themeLabels.join(" · ")}`);
      }
      lines.push(`   Visit: ~${visit} min${dep ? ` (Depart: ${dep})` : ""}`);

      // If there is a following hop to the next stop
      if (sIdx < day.stops.length - 1) {
        const nextStop = day.stops[sIdx + 1];
        const hop = day.hops.find(
          (h) => h.from_sequence === stop.sequence && h.to_sequence === nextStop.sequence
        );
        if (hop) {
          const hopDuration = formatDurationHoursMins(hop.estimated_minutes);
          const hopMode = hop.mode === "unavailable" ? "Transit Notice" : hop.mode;
          const costStr = hop.estimated_cost != null ? ` · ₹${hop.estimated_cost}` : "";
          lines.push("");
          lines.push(`   ↓ Travel: ${hopDuration} via ${hopMode}${costStr}`);
          if (hop.reason) {
            lines.push(`     Notice: ${hop.reason}`);
          }
          lines.push("");
        }
      }
    }
    lines.push("");
  }

  lines.push(`Generated by O-Travelz (Grounded Verified Odisha Data)`);
  return lines.join("\n");
}

/**
 * Deterministic contextual prompt suggestions for AI Copilot.
 */
export function getRefinementSuggestions(
  constraints: PlanningConstraints | null | undefined,
  hasItinerary: boolean
): string[] {
  if (!hasItinerary || !constraints) {
    return [
      "Plan a 2-day heritage trip in Bhubaneswar",
      "Plan a 2-day food and culture tour",
      "Plan a relaxing beach trip in Puri",
      "Explore nature and waterfalls in Koraput",
      "Plan a wildlife and adventure getaway",
    ];
  }

  const suggestions: string[] = [];
  const days = constraints.days || 1;
  const interests = (constraints.interests || []).map((i) => i.toLowerCase().trim());
  const origin = constraints.start?.trim();

  // 1. Duration adjustments
  if (days < 4) {
    suggestions.push(`Extend trip to ${days + 1} days`);
  } else if (days > 2) {
    suggestions.push("Reduce to 2 days");
  }

  // 2. Origin adjustments
  if (!origin || !origin.toLowerCase().includes("puri")) {
    suggestions.push("Start from Puri");
  } else if (!origin.toLowerCase().includes("bhubaneswar")) {
    suggestions.push("Start from Bhubaneswar");
  }

  // 3. Thematic adjustments
  if (!interests.includes("food")) {
    suggestions.push("Add food and culinary stops");
  }
  if (!interests.includes("beach")) {
    suggestions.push("Add beaches and coastal views");
  }
  if (!interests.includes("heritage")) {
    suggestions.push("Add heritage and architecture");
  }
  if (!interests.includes("nature") && !interests.includes("waterfall")) {
    suggestions.push("Add nature & waterfalls");
  }
  if (!interests.includes("wildlife")) {
    suggestions.push("Add wildlife sanctuary");
  }
  if (!interests.includes("relaxation")) {
    suggestions.push("Make it more relaxing");
  }

  return suggestions.slice(0, 6);
}
