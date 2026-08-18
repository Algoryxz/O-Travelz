/**
 * Phase 0 frontend/backend boundary types.
 * Owner: Deeptiman; semantic contract owners: Smarak and Rudra.
 * This file contains types only; it does not implement a frontend flow.
 */

export type DataTier = "static" | "scheduled" | "live" | "unknown";

export interface PlanningConstraints {
  days: number;
  interests: string[];
  dates?: string[] | null;
  pace?: string | null;
  budget_transport_per_day?: number | null;
  start?: string | null;
  mobility?: string | null;
}

export interface PlaceSummary {
  id: string;
  name: string;
  category: string;
}

export interface TransportLeg {
  mode: string;
  detail: string;
  provider?: string | null;
  route?: string | null;
}

export interface TransportHop {
  from_sequence: number;
  to_sequence: number;
  mode: string;
  estimated_minutes?: number | null;
  estimated_cost?: number | null;
  legs: TransportLeg[];
  data_tier: DataTier;
  reason?: string | null;
}

export interface ItineraryStop {
  sequence: number;
  place: PlaceSummary;
  planned_arrival?: string | null;
  planned_departure?: string | null;
}

export interface ItineraryDay {
  day_number: number;
  date?: string | null;
  stops: ItineraryStop[];
  hops: TransportHop[];
}

export interface ItineraryPlanResponse {
  itinerary_id: string;
  constraints: PlanningConstraints;
  days: ItineraryDay[];
  explanation: string;
}

export interface APIErrorResponse {
  error: {
    code: string;
    message: string;
    field?: string | null;
  };
  details: Array<Record<string, unknown>>;
}
