/**
 * Canonical Whole-Odisha API Contract Types.
 * Authoritative type definitions matching backend FastAPI schemas.
 */

export type DataTier = "static" | "scheduled" | "live" | "unknown";

// The 13 canonical physical place categories supported by the authoritative dataset
export const CANONICAL_CATEGORIES = [
  { id: "temple", label: "Temples & Shrines" },
  { id: "monument", label: "Monuments & Forts" },
  { id: "nature", label: "Hills & Nature" },
  { id: "beach", label: "Beaches & Coast" },
  { id: "wildlife", label: "Wildlife & Sanctuaries" },
  { id: "waterfall", label: "Waterfalls" },
  { id: "museum", label: "Museums & Arts" },
  { id: "lake", label: "Lakes & Reservoirs" },
  { id: "market", label: "Markets & Food Hubs" },
  { id: "park", label: "Parks & Gardens" },
  { id: "sports_venue", label: "Sports Venues & Stadiums" },
  { id: "science_center", label: "Science Centres" },
  { id: "planetarium", label: "Planetariums" },
] as const;

// The 12 canonical traveler interests supported by the authoritative schema
export const CANONICAL_INTERESTS = [
  { id: "heritage", label: "Heritage" },
  { id: "spirituality", label: "Spirituality" },
  { id: "architecture", label: "Architecture" },
  { id: "food", label: "Food & Cuisine" },
  { id: "culture", label: "Culture" },
  { id: "nature", label: "Nature" },
  { id: "beach", label: "Beaches" },
  { id: "wildlife", label: "Wildlife" },
  { id: "waterfall", label: "Waterfalls" },
  { id: "relaxation", label: "Relaxation" },
  { id: "adventure", label: "Adventure" },
  { id: "shopping", label: "Shopping" },
] as const;

export type CanonicalCategoryId = (typeof CANONICAL_CATEGORIES)[number]["id"];
export type CanonicalInterestId = (typeof CANONICAL_INTERESTS)[number]["id"];

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
  location?: string | null;
  lat?: number | null;
  lon?: number | null;
  description?: string | null;
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
  suggested_action?: string | null;
  extracted_constraints?: PlanningConstraints | null;
  metadata?: Record<string, unknown>;
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
  district?: string | null;
  region?: string | null;
  avg_visit_minutes?: number | null;
  price_tier?: string | null;
  source?: string | null;
  verified_at?: string | null;
  images?: PlaceImageContract[];
  interests?: string[];
}

export interface PlaceListParams {
  category?: string;
  district?: string;
  region?: string;
  search?: string;
}

/* ================= Weather Contracts ================= */

export interface WeatherObservation {
  location_name: string;
  lat: number;
  lon: number;
  observed_at: string;
  temperature_c: number;
  apparent_temperature_c?: number | null;
  condition: string;
  condition_code?: number | null;
  humidity_pct?: number | null;
  precipitation_probability_pct?: number | null;
  precipitation_mm?: number | null;
  wind_speed_kmh?: number | null;
  advice?: string | null;
  provider: string;
  freshness_timestamp: string;
  status: "available" | "unavailable";
  error_reason?: string | null;
}

export interface DailyForecastItem {
  date: string;
  temperature_max_c: number;
  temperature_min_c: number;
  condition: string;
  condition_code?: number | null;
  precipitation_probability_pct?: number | null;
  precipitation_sum_mm?: number | null;
}

export interface WeatherResponse {
  location_name: string;
  current: WeatherObservation;
  forecast_daily: DailyForecastItem[];
}
