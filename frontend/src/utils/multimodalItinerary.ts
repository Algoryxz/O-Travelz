import type {
  JourneyPlanResponse,
  SavedMultimodalJourney,
  ItineraryPlanResponse,
  ItineraryDay,
  ItineraryStop,
  TransportHop,
  TransportLeg,
} from "../types/api";
import { DataTier } from "../types/api";

/**
 * Converts a planned multimodal journey (from POST /transport/plan-journey)
 * into a complete, structured ItineraryPlanResponse.
 */
export function convertPlannedJourneyToItinerary(
  journey: JourneyPlanResponse
): ItineraryPlanResponse {
  const originName = journey.origin.resolved_name || "Origin Location";
  const destName = journey.destination.resolved_name || "Destination Location";

  // Build summary legs
  const legs: TransportLeg[] = [];
  for (const w of journey.walking_legs) {
    legs.push({
      mode: "walk",
      detail: `Walk ~${w.distance_m}m from ${w.from_name} to ${w.to_name} (~${w.estimated_duration_mins} min)`,
    });
  }
  for (const t of journey.transit_legs) {
    legs.push({
      mode: "bus",
      detail: `Board Mo Bus Route ${t.route_number} from ${t.boarding_stop_name} to ${t.alighting_stop_name} (${t.stop_count} stops, ~${t.estimated_transit_mins} min)`,
      provider: "CRUT Mo Bus",
      route: t.route_number,
    });
  }

  const savedJourney: SavedMultimodalJourney = {
    ...journey,
    saved_at: Date.now(),
  };

  const transportHop: TransportHop = {
    from_sequence: 1,
    to_sequence: 2,
    mode: journey.journey_type === "1_transfer" ? "walk+bus+transfer" : "walk+bus",
    estimated_minutes: journey.total_estimated_duration_minutes,
    estimated_cost: journey.transit_legs.length * 15, // standard CRUT fare approximation
    legs,
    data_tier: "scheduled",
    multimodal_journey: savedJourney,
  };


  const stop1: ItineraryStop = {
    sequence: 1,
    place: {
      id: "origin-point",
      name: originName,
      category: "transit_hub",
      lat: journey.origin.latitude,
      lon: journey.origin.longitude,
      description: "Starting point for multimodal journey",
    },
    planned_departure: journey.departure_time || undefined,
    duration_minutes: 0,
  };

  const stop2: ItineraryStop = {
    sequence: 2,
    place: {
      id: journey.destination.place_id || "dest-point",
      name: destName,
      category: "attraction",
      lat: journey.destination.latitude,
      lon: journey.destination.longitude,
      description: "Arrival destination",
    },
    planned_arrival: journey.estimated_arrival_time || undefined,
    duration_minutes: 60,
  };

  const day1: ItineraryDay = {
    day_number: 1,
    date: new Date().toISOString().split("T")[0],
    theme: journey.journey_type === "1_transfer" ? "1-Transfer Transit Expedition" : "Direct Transit Journey",
    stops: [stop1, stop2],
    hops: [transportHop],
  };

  const explanation =
    journey.journey_type === "1_transfer"
      ? `Schedule-aware 1-transfer multimodal journey from ${originName} to ${destName} via ${journey.transfer_hub || "interchange hub"} (~${journey.total_estimated_duration_minutes} min total).`
      : `Schedule-aware direct multimodal transit from ${originName} to ${destName} via Mo Bus Route ${journey.transit_legs[0]?.route_number || ""} (~${journey.total_estimated_duration_minutes} min total).`;

  return {
    itinerary_id: journey.journey_id || `itin_${Date.now()}`,
    constraints: {
      days: 1,
      interests: ["transit", "heritage"],
      start: originName,
    },
    days: [day1],
    explanation,
  };
}

/**
 * Check if a transport hop has an embedded multimodal journey structure.
 */
export function isMultimodalHop(hop: TransportHop): boolean {
  return (
    !!hop.multimodal_journey &&
    Array.isArray(hop.multimodal_journey.transit_legs) &&
    hop.multimodal_journey.transit_legs.length > 0
  );
}
