import type { ItineraryPlanResponse } from "../types/api";
import {
  generateTravelerTripTitle,
  calculateItineraryTotalTransitMinutes,
  formatDurationHoursMins,
  calculateDayTimeline,
  CANONICAL_INTEREST_LABELS,
} from "./timelineService";

export interface EmergencyContact {
  service: string;
  number: string;
  description: string;
}

export const ODISHA_EMERGENCY_HELPLINES: EmergencyContact[] = [
  {
    service: "National Emergency Helpline (ERSS)",
    number: "112",
    description: "24/7 Unified Police, Fire & Medical dispatch",
  },
  {
    service: "Medical Emergency & Ambulance",
    number: "108",
    description: "24/7 Free emergency medical & ambulance service",
  },
  {
    service: "Odisha Tourist Police / Tourism Helpline",
    number: "1800-208-1414 / 1363",
    description: "Official traveler assistance & visitor safety",
  },
  {
    service: "Odisha Police Control Room",
    number: "100 / 112",
    description: "Statewide law enforcement & safety assistance",
  },
  {
    service: "Fire Emergency",
    number: "101",
    description: "Statewide fire & rescue operations",
  },
  {
    service: "Women & Child Helpline",
    number: "181 / 1091",
    description: "24/7 Women safety, legal & distress support",
  },
];

/**
 * Generates a clean, filesystem-safe filename for Markdown or PDF export.
 * e.g. "Puri Heritage Exploration" -> "o-travelz-itinerary-puri-heritage-exploration.md"
 */
export function generateSafeFilename(rawTitle: string, extension: "md" | "pdf" = "md"): string {
  const safeSlug = (rawTitle || "odisha-trip")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return `o-travelz-itinerary-${safeSlug || "trip"}.${extension}`;
}

/**
 * Escapes characters that could unintentionally format or break Markdown headers/tables.
 */
export function sanitizeMarkdownText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

/**
 * Generates a structured, clean, offline-friendly Markdown document from canonical itinerary data.
 */
export function generateItineraryMarkdown(
  itinerary: ItineraryPlanResponse,
  customTitle?: string,
  getPlaceByName?: (name: string) => { avg_visit_minutes?: number | null; interests?: string[] } | undefined
): string {
  const { constraints, days, explanation } = itinerary;
  const title = customTitle || generateTravelerTripTitle(constraints, days.length);
  const totalTransit = calculateItineraryTotalTransitMinutes(itinerary);
  const totalStops = days.reduce((sum, d) => sum + d.stops.length, 0);

  const lines: string[] = [];

  // Header
  lines.push(`# ${sanitizeMarkdownText(title)}`);
  lines.push("");
  lines.push(`> **Verified Odisha Itinerary** · ${days.length} ${days.length === 1 ? "Day" : "Days"} · ${totalStops} Destinations · Total Transit: ~${formatDurationHoursMins(totalTransit)}`);
  lines.push("");

  if (explanation) {
    lines.push(`### Trip Overview`);
    lines.push(`${sanitizeMarkdownText(explanation)}`);
    lines.push("");
  }

  // Trip Metadata / Constraints
  lines.push(`### Trip Details`);
  if (constraints?.start) {
    lines.push(`- **Starting Hub**: ${sanitizeMarkdownText(constraints.start)}`);
  }
  if (constraints?.interests && constraints.interests.length > 0) {
    const labels = constraints.interests.map((i) => CANONICAL_INTEREST_LABELS[i.toLowerCase()] || i);
    lines.push(`- **Themes**: ${labels.join(", ")}`);
  }
  if (constraints?.budget_transport_per_day) {
    lines.push(`- **Daily Transport Budget**: ₹${constraints.budget_transport_per_day}`);
  }
  lines.push(`- **Generated Via**: O-Travelz (Grounded Verified Odisha Travel Intelligence)`);
  lines.push("");

  // Daily Schedule
  for (const day of days) {
    const dateStr = day.date ? ` (${day.date})` : "";
    const themeStr = day.theme ? ` — ${day.theme}` : "";
    lines.push(`---`);
    lines.push(`## Day ${day.day_number}${dateStr}${themeStr}`);
    lines.push("");

    const timeline = calculateDayTimeline(day, getPlaceByName);

    for (let sIdx = 0; sIdx < day.stops.length; sIdx++) {
      const stop = day.stops[sIdx];
      const timeInfo = timeline.get(stop.sequence);
      const placeDetail = getPlaceByName ? getPlaceByName(stop.place?.name || "") : undefined;
      const arrival = timeInfo?.arrivalFormatted || stop.planned_arrival || "09:00";
      const dep = timeInfo?.departureFormatted || stop.planned_departure;
      const visit = timeInfo?.visitMinutes || stop.duration_minutes || 60;
      const placeName = stop.place?.name || "Destination";
      const category = stop.place?.category || "Destination";

      lines.push(`### ${arrival} — ${sanitizeMarkdownText(placeName)}`);
      lines.push(`- **Category**: ${category}`);

      if (placeDetail?.interests && placeDetail.interests.length > 0) {
        const themeLabels = placeDetail.interests.map((i) => CANONICAL_INTEREST_LABELS[i.toLowerCase()] || i);
        lines.push(`- **Themes**: ${themeLabels.join(" · ")}`);
      }
      lines.push(`- **Duration**: ~${visit} min${dep ? ` (Planned Departure: ${dep})` : ""}`);

      if (stop.place?.description) {
        lines.push(`- **About**: ${sanitizeMarkdownText(stop.place.description)}`);
      }

      // Connecting transit hop
      if (sIdx < day.stops.length - 1) {
        const nextStop = day.stops[sIdx + 1];
        const hop = day.hops.find(
          (h) => h.from_sequence === stop.sequence && h.to_sequence === nextStop.sequence
        );
        if (hop) {
          const hopDuration = formatDurationHoursMins(hop.estimated_minutes);
          const hopMode = hop.mode === "unavailable" ? "Transit Notice" : hop.mode;
          const costStr = hop.estimated_cost != null ? ` · Estimated Cost: ₹${hop.estimated_cost}` : "";
          lines.push("");
          lines.push(`> ↳ **Transit**: ~${hopDuration} via ${hopMode}${costStr}`);
          if (hop.reason) {
            lines.push(`> *Notice*: ${sanitizeMarkdownText(hop.reason)}`);
          }
          lines.push("");
        }
      }
    }
    lines.push("");
  }

  // Emergency & Tourist Assistance Helplines
  lines.push(`---`);
  lines.push(`## Odisha Traveler & Emergency Assistance`);
  lines.push(``);
  for (const contact of ODISHA_EMERGENCY_HELPLINES) {
    lines.push(`- **${contact.service}**: \`${contact.number}\` — *${contact.description}*`);
  }
  lines.push("");
  lines.push(`---`);
  lines.push(`*© O-Travelz. Grounded Odisha travel itinerary generated with ₹0 budget & offline-first data verification.*`);

  return lines.join("\n");
}

/**
 * Downloads the generated Markdown itinerary file to traveler's device.
 */
export function downloadItineraryMarkdown(
  itinerary: ItineraryPlanResponse,
  tripTitle?: string,
  getPlaceByName?: (name: string) => { avg_visit_minutes?: number | null; interests?: string[] } | undefined
): boolean {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return false;
    }

    const markdownContent = generateItineraryMarkdown(itinerary, tripTitle, getPlaceByName);
    const title = tripTitle || generateTravelerTripTitle(itinerary.constraints, itinerary.days.length);
    const filename = generateSafeFilename(title, "md");

    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      try {
        if (typeof document !== "undefined" && document.body && anchor.parentNode) {
          document.body.removeChild(anchor);
        }
        if (typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
          URL.revokeObjectURL(blobUrl);
        }
      } catch {
        // Defensive teardown
      }
    }, 100);

    return true;
  } catch (err) {
    console.warn("Failed to download itinerary markdown:", err);
    return false;
  }
}

/**
 * Triggers browser native print dialog for the current itinerary.
 */
export function triggerPrintItinerary(): boolean {
  if (typeof window !== "undefined" && typeof window.print === "function") {
    window.print();
    return true;
  }
  return false;
}
