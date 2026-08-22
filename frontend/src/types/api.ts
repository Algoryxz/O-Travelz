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
  duration_minutes?: number | null;
}

export interface ItineraryDay {
  day_number: number;
  date?: string | null;
  theme?: string | null;
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

/* ================= Phase 12: Grounded AI Conversation Contracts ================= */

export type ChatRole = "system" | "user" | "assistant" | "tool";

export type ToolStatus = "ok" | "unavailable" | "unknown" | "invalid" | "error";

export interface ToolCall {
  id?: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  tool_call_id?: string | null;
  tool_name: string;
  status: ToolStatus;
  data?: unknown;
  reason?: string | null;
  error?: string | null;
  warnings?: string[];
}

export interface ChatMessage {
  role: ChatRole;
  content?: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string | null;
  name?: string | null;
}

export interface AIConverseRequest {
  messages: ChatMessage[];
  constraints?: PlanningConstraints | null;
}

export interface GroundedConversationResponse {
  message: string;
  status: AIStatus;
  language?: string;
  itinerary?: ItineraryPlanResponse | null;
  places?: unknown[];
  transport?: TransportHop[];
  provider_status?: unknown[];
  tool_calls?: ToolCall[];
  tool_results?: ToolResult[];
  clarification?: Clarification | null;
  changed_constraints?: PlanningConstraints | null;
  is_grounded: boolean;
  warnings?: string[];
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

export const CANONICAL_MEDICAL_CATEGORIES = [
  { id: "hospital", label: "Hospitals & Medical Colleges" },
  { id: "emergency_facility", label: "Emergency & Trauma Care" },
] as const;

export const CANONICAL_TRANSIT_CATEGORIES = [
  { id: "transit_hub", label: "Airports & Transit Hubs" },
] as const;

export const ALL_CANONICAL_CATEGORIES = [
  ...CANONICAL_CATEGORIES,
  ...CANONICAL_MEDICAL_CATEGORIES,
  ...CANONICAL_TRANSIT_CATEGORIES,
] as const;

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
  rating?: number | null;
  rating_count?: number | null;
  rating_source?: string | null;
  opening_hours_source?: string | null;
  source?: string | null;
  source_url?: string | null;
  verified_at?: string | null;
  verification_status?: string | null;
  contact_phone?: string | null;
  emergency_phone?: string | null;
  address?: string | null;
  images?: PlaceImageContract[];
  interests?: string[];
}


export interface PlaceListParams {
  category?: string;
  interest?: string;
  district?: string;
  region?: string;
  search?: string;
  verification_status?: string;
  is_medical?: boolean;
  is_transit?: boolean;
  near_lat?: number;
  near_lon?: number;
  radius_km?: number;
  limit?: number;
  offset?: number;
}


/* ================= Weather Contracts ================= */

export interface WeatherObservation {
  location_name: string;
  lat: number;
  lon: number;
  observed_at: string;
  temperature_c?: number | null;
  apparent_temperature_c?: number | null;
  condition: string;
  condition_code?: number | null;
  is_day?: number | null;
  humidity_pct?: number | null;
  precipitation_probability_pct?: number | null;
  precipitation_mm?: number | null;
  wind_speed_kmh?: number | null;
  wind_direction_deg?: number | null;
  wind_gusts_kmh?: number | null;
  cloud_cover_pct?: number | null;
  timezone?: string | null;
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
  apparent_temperature_max_c?: number | null;
  apparent_temperature_min_c?: number | null;
  condition: string;
  condition_code?: number | null;
  precipitation_probability_pct?: number | null;
  precipitation_sum_mm?: number | null;
  sunrise?: string | null;
  sunset?: string | null;
  wind_speed_max_kmh?: number | null;
}

export interface WeatherResponse {
  location_name: string;
  current: WeatherObservation;
  forecast_daily: DailyForecastItem[];
}

export interface SearchSuggestion {
  text: string;
  canonical_name: string;
  match_type: string;
  confidence: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  display_name?: string | null;
  avatar_url?: string | null;
  provider: string;
  email_verified?: boolean;
}

export interface AuthResponse {
  authenticated: boolean;
  user: AuthUser | null;
}

export type SyncStatus = "idle" | "syncing" | "synced" | "pending" | "error" | "offline";

export interface SyncPlaceItem {
  place_id: string;
  place_name?: string | null;
  place_data: Record<string, unknown>;
  saved_at: number;
  updated_at: number;
  is_deleted: boolean;
}

export interface SyncSavedPlacesRequest {
  items: SyncPlaceItem[];
}

export interface SyncSavedPlacesResponse {
  synced_count: number;
  items: SyncPlaceItem[];
}

export interface SyncTripItem {
  id: string;
  title: string;
  history: Record<string, unknown>[];
  constraints?: Record<string, unknown> | null;
  itinerary?: Record<string, unknown> | null;
  timestamp: number;
  updated_at: number;
  is_deleted: boolean;
}

export interface SyncTripsRequest {
  items: SyncTripItem[];
}

export interface SyncTripsResponse {
  synced_count: number;
  items: SyncTripItem[];
}

/* ================= Phase 14: Shareable Trip Snapshot Contracts ================= */

export interface CreateShareTripRequest {
  title: string;
  itinerary: Record<string, unknown>;
  constraints?: Record<string, unknown> | null;
}

export interface CreateShareTripResponse {
  share_id: string;
  share_url: string;
  created_at: number;
}

export interface PublicSharedTripResponse {
  share_id: string;
  title: string;
  itinerary: ItineraryPlanResponse;
  constraints?: Record<string, unknown> | null;
  created_at: number;
  expires_at?: number | null;
}
