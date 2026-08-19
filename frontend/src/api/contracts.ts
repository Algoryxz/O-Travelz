/**
 * Phase 0 and Phase 5/6 frontend/backend boundary types.
 * Reused across API client and UI components.
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

export interface APIErrorDetail {
  code: string;
  message: string;
  field?: string | null;
}

export interface APIErrorResponse {
  error: APIErrorDetail;
  details: Array<Record<string, unknown>>;
}

/* ================= Phase 5: AI Planning Contracts ================= */

export type AIStatus = "success" | "clarification" | "unsupported" | "error";

export interface Clarification {
  question: string;
  reason?: string | null;
}

export interface AIPlanRequest {
  message: string;
  constraints?: PlanningConstraints | null;
}

export interface AIResponse {
  message: string;
  itinerary?: ItineraryPlanResponse | null;
  clarification?: Clarification | null;
  status: AIStatus;
  changed_constraints?: PlanningConstraints | null;
}

/* ================= Phase 6A: Map Projection Contracts ================= */

export type MapEntity = "place" | "stop" | "route";
export type FeatureType = "place" | "stop" | "route_line";
export type GeometryStatus = "available" | "unavailable";
export type UnavailableReason =
  | "coordinate_unverified"
  | "identity_unresolved"
  | "topology_unresolved"
  | "source_missing"
  | "source_not_authoritative"
  | "not_in_scope"
  | "provider_geometry_unavailable"
  | "contract_not_approved";

export interface CanonicalRef {
  entity: MapEntity;
  id: string;
}

export interface PointGeometry {
  type: "Point";
  coordinates: [number, number];
}

export interface LineStringGeometry {
  type: "LineString";
  coordinates: Array<[number, number]>;
}

export type MapGeometry = PointGeometry | LineStringGeometry;

export interface MapFeature {
  feature_type: FeatureType;
  canonical_ref: CanonicalRef;
  geometry_status: GeometryStatus;
  geometry: MapGeometry | null;
  unavailable_reason?: UnavailableReason | null;
  name?: string | null;
  category?: string | null;
  region?: string | null;
}

export interface MapHopRef {
  day_number: number;
  from_sequence: number;
  to_sequence: number;
}

export interface MapLeg {
  mode: string;
  detail: string;
  provider?: string | null;
  route?: string | null;
  geometry_status: GeometryStatus;
  geometry?: LineStringGeometry | null;
  route_ref?: string | null;
  stop_refs: string[];
  unavailable_reason?: UnavailableReason | null;
}

export interface MapRelationship {
  relationship_type: "itinerary_hop";
  hop_ref: MapHopRef;
  mode: string;
  data_tier: DataTier;
  reason?: string | null;
  legs: MapLeg[];
}

export interface UnavailableItem {
  item_type: "feature" | "relationship";
  ref: CanonicalRef | MapHopRef;
  unavailable_reason: UnavailableReason;
}

export interface MapProjectionFeatureRequest {
  entity: MapEntity;
  id: string;
}

export interface RequestedHopContext {
  day_number: number;
  hop: TransportHop;
}

export interface MapProjectionHTTPRequest {
  requested_features?: MapProjectionFeatureRequest[];
  requested_hops?: RequestedHopContext[];
}

export interface MapProjectionResponse {
  requested_features: CanonicalRef[];
  features: MapFeature[];
  relationships: MapRelationship[];
  unavailable_items: UnavailableItem[];
}

/* ================= Authoritative Places Discovery Contracts ================= */

export interface PlaceImageContract {
  id?: string;
  storage_key?: string | null;
  url: string;
  thumbnail_url?: string | null;
  card_url?: string | null;
  alt_text?: string | null;
  title?: string | null;
  source_url?: string | null;
  source_name?: string | null;
  creator?: string | null;
  license?: string | null;
  attribution?: string | null;
  retrieval_timestamp?: string | null;
  width?: number | null;
  height?: number | null;
  aspect_ratio?: number | null;
  content_sha256?: string | null;
  content_type?: string | null;
  size_bytes?: number | null;
  status?: string | null;
  sort_order?: number;
  is_primary?: boolean;
}

export interface PlaceDetail {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  lat?: number | null;
  lon?: number | null;
  avg_visit_minutes?: number | null;
  price_tier?: string | null;
  source?: string | null;
  verified_at?: string | null;
  images?: PlaceImageContract[];
}

export interface PlaceListParams {
  category?: string;
  search?: string;
}
