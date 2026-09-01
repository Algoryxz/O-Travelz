import type { components } from "../../../shared/api/generated";

export type GeneratedSchemas = components["schemas"];

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

export type PlanningConstraints = GeneratedSchemas["PlanningConstraints"];

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

export interface SavedMultimodalJourney extends JourneyPlanResponse {
  saved_at?: number;
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
  multimodal_journey?: SavedMultimodalJourney | null;
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

/* ================= Phase 5: AI Planning Contracts (Generated from OpenAPI) ================= */

export type AIStatus = GeneratedSchemas["AIStatus"];
export type Clarification = GeneratedSchemas["Clarification"];
export type AIPlanRequest = GeneratedSchemas["AIPlanRequest"];

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

export type ChatRole = GeneratedSchemas["ChatRole"];
export type ToolStatus = GeneratedSchemas["ToolStatus"];
export type ToolCall = GeneratedSchemas["ToolCall"];
export type ToolResult = GeneratedSchemas["ToolResult"];
export type ChatMessage = GeneratedSchemas["ChatMessage"];

export type AppDestinationContext = GeneratedSchemas["AppDestinationContext"];
export type AppMapContext = GeneratedSchemas["AppMapContext"];
export type AppPlannerContext = GeneratedSchemas["AppPlannerContext"];
export type AppLocationContext = GeneratedSchemas["AppLocationContext"];
export type AppSavedSummaryContext = GeneratedSchemas["AppSavedSummaryContext"];
export type AppContextPayload = GeneratedSchemas["AppContextPayload"];

export interface AIConverseRequest {
  messages: ChatMessage[];
  constraints?: PlanningConstraints | null;
  context?: AppContextPayload | null;
}


export type ClaimType = "verified" | "scheduled" | "live" | "estimated" | "researched" | "unknown";

export interface EvidenceItem {
  title: string;
  rationale: string;
  claim_type: ClaimType;
  source?: string | null;
  confidence?: string | null;
}

export interface GroundedConversationResponse {
  message: string;
  status: AIStatus;
  language?: string;
  intent?: string | null;
  constraints?: PlanningConstraints | null;
  itinerary?: ItineraryPlanResponse | null;
  places?: unknown[];
  transport?: TransportHop[];
  provider_status?: unknown[];
  tool_calls?: ToolCall[];
  tool_results?: ToolResult[];
  clarification?: Clarification | null;
  changed_constraints?: PlanningConstraints | null;
  is_grounded: boolean;
  verified_claims?: string[];
  unverified_claims?: string[];
  grounding_sources?: string[];
  evidence_items?: EvidenceItem[];
  degraded_services?: string[];
  warnings?: string[];
}



/* ================= Phase 6A: Map Projection Contracts ================= */

export type MapEntity =
  | "place"
  | "stop"
  | "route"
  | "tourist_place"
  | "hotel"
  | "restaurant"
  | "atm"
  | "petrol_pump"
  | "hospital"
  | "police_station"
  | "transport";

export type FeatureType =
  | "place"
  | "stop"
  | "route_line"
  | "tourist_place"
  | "hotel"
  | "restaurant"
  | "atm"
  | "petrol_pump"
  | "hospital"
  | "police_station"
  | "transport";

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

export type BackendCanonicalRef = GeneratedSchemas["CanonicalRef"];
export type BackendMapFeature = GeneratedSchemas["MapFeature"];

export type PointGeometry = GeneratedSchemas["PointGeometry"];
export type LineStringGeometry = GeneratedSchemas["LineStringGeometry"];
export type MapGeometry = PointGeometry | LineStringGeometry;

export interface CanonicalRef {
  entity: MapEntity;
  id: string;
}

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
export type MapHopRef = GeneratedSchemas["MapHopRef"];
export type MapLeg = GeneratedSchemas["MapLeg"];
export type MapRelationship = GeneratedSchemas["MapRelationship"];
export type UnavailableItem = GeneratedSchemas["UnavailableItem"];
export type MapProjectionFeatureRequest = GeneratedSchemas["MapProjectionFeatureRequest"];
export type RequestedHopContext = GeneratedSchemas["RequestedHopContext"];
export type MapProjectionHTTPRequest = GeneratedSchemas["MapProjectionHTTPRequest"];
export type MapProjectionResponse = GeneratedSchemas["MapProjectionResponse"];

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
  research_id?: string | null;
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


/* ================= Weather Contracts (Generated from OpenAPI) ================= */

export type WeatherObservation = GeneratedSchemas["WeatherObservation"];
export type DailyForecastItem = GeneratedSchemas["DailyForecastItem"];
export type WeatherResponse = GeneratedSchemas["WeatherResponse"];

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

export interface ReverseGeocodeResponse {
  locality: string;
  neighborhood?: string | null;
  city: string;
  district?: string | null;
  state: string;
  country: string;
  lat: number;
  lon: number;
  is_exact: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  name?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  provider?: string | null;
}

export interface AuthMeResponse {
  authenticated: boolean;
  user: UserResponse | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OFFICIAL TRANSIT CONTRACTS (Phase 2.5)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ServingRouteSummary {
  route_id: string;
  route_number: string;
  route_name?: string | null;
  sequence_order: number;
  service_area?: string | null;
  origin?: string | null;
  destination?: string | null;
}

export interface NearbyStopResponse {
  stop_id: string;
  name: string;
  published_name?: string | null;
  canonical_stop_id?: string | null;
  city?: string | null;
  latitude: number;
  longitude: number;
  coordinate_status: "official" | "geocoded" | "ambiguous" | "unresolved";
  distance_m: number;
  walking_estimate_mins: number;
  routes_serving_stop: ServingRouteSummary[];
  region?: string | null;
}

export interface TransportMapStop {
  stop_id: string;
  stop_name: string;
  sequence_order: number;
  latitude?: number | null;
  longitude?: number | null;
  coordinate_status: "official" | "geocoded" | "ambiguous" | "unresolved";
}

export interface TransportMapRoute {
  route_id: string;
  route_number: string;
  route_name?: string | null;
  provider_id?: string;
  provider_name?: string;
  region?: string | null;
  service_area?: string | null;
  origin?: string | null;
  destination?: string | null;
  via?: string | null;
  geometry_status?: "EXACT" | "CORRIDOR" | "PARTIAL" | "NONE";
  overall_confidence?: "CONFIRMED" | "SUPPORTED" | "INFERRED" | "UNKNOWN";
  is_geometry_available?: boolean;
  verified_coordinates?: Array<[number, number]>;
  corridors?: Array<{
    sequence: number;
    from_label?: string;
    to_label?: string;
    road_names: string[];
    major_junctions: string[];
    landmarks: string[];
    status: string;
  }>;
  stops_count: number;
  stops: TransportMapStop[];
}

export interface TransportMapResponse {
  region?: string | null;
  total_routes: number;
  total_stops: number;
  routes: TransportMapRoute[];
  stops: Array<{
    stop_id: string;
    name: string;
    latitude: number;
    longitude: number;
    coordinate_status: string;
    city?: string | null;
  }>;
}

export interface RouteStopDetail {
  stop_id: string;
  stop_name: string;
  published_name?: string | null;
  sequence_order: number;
  latitude?: number | null;
  longitude?: number | null;
  coordinate_status: string;
  city?: string | null;
  district?: string | null;
}

export interface ScheduleTripGroupDetail {
  group_id: string;
  direction?: string | null;
  operating_pattern?: string | null;
  trips_count: number;
  departure_times: string[];
}

export interface RouteDetailResponse {
  route_id: string;
  route_number: string;
  route_name?: string | null;
  provider_id: string;
  provider_name: string;
  service_area?: string | null;
  origin?: string | null;
  destination?: string | null;
  via?: string | null;
  direction?: string | null;
  source_document?: string | null;
  stops: RouteStopDetail[];
  schedules: ScheduleTripGroupDetail[];
}

export interface TransportProviderResponse {
  id: string;
  name: string;
  mode: string;
  data_tier: DataTier;
  routes_count: number;
  stops_count: number;
}


/* ================= Phase 3B: Transit Corridor Food Discovery ================= */

export type CorridorStatus = "ON_ROUTE" | "SHORT_DETOUR" | "LONG_DETOUR";

export interface CorridorGeometryInfo {
  verified_coordinate_stops: number;
  total_route_stops: number;
  verified_segment_count: number;
  unresolved_gap_count: number;
  geometry_status: "verified" | "partial" | "geometry_unavailable";
}

export interface CorridorFoodCandidate {
  place_id: string;
  research_id: string;
  name: string;
  district?: string | null;
  locality?: string | null;
  latitude: number;
  longitude: number;
  food_category?: string | null;
  cuisine?: string | null;
  dietary_tags: string[];
  speciality_dishes: string[];
  price_tier?: string | null;
  rating?: number | null;
  rating_count?: number | null;
  rating_source?: string | null;
  distance_from_corridor_m: number;
  estimated_detour_minutes: number;
  corridor_status: CorridorStatus;
  match_reasons: string[];
  source: string;
  verification_status: string;
}

export interface CorridorFoodResponse {
  route_id: string;
  route_number: string;
  route_name?: string | null;
  corridor_geometry_info: CorridorGeometryInfo;
  total_candidates: number;
  candidates: CorridorFoodCandidate[];
}


/* ================= Phase 3C: Multimodal Journey Planning ================= */

export type JourneyStatus =
  | "SUCCESS"
  | "NO_VERIFIED_BOARDING_STOP"
  | "NO_TRANSIT_PATH"
  | "DESTINATION_UNREACHABLE"
  | "GEOMETRY_PARTIAL";

export interface PlanJourneyRequest {
  origin_lat: number;
  origin_lon: number;
  destination_lat?: number | null;
  destination_lon?: number | null;
  destination_place_id?: string | null;
  destination_stop_id?: string | null;
  max_walking_distance_m?: number;
  include_food?: boolean;
  food_category?: string | null;
  dietary_tag?: string | null;
  cuisine?: string | null;
  max_food_detour_m?: number;
  requested_departure_time?: string | null;
}

export interface WalkingLeg {
  leg_type: string;
  from_name: string;
  to_name: string;
  distance_m: number;
  estimated_duration_mins: number;
}

export interface TransitLeg {
  route_id: string;
  route_number: string;
  route_name?: string | null;
  service_area?: string | null;
  boarding_stop_id: string;
  boarding_stop_name: string;
  boarding_sequence: number;
  alighting_stop_id: string;
  alighting_stop_name: string;
  alighting_sequence: number;
  stop_count: number;
  scheduled_departures: string[];
  estimated_transit_mins: number;
  selected_departure?: string | null;
  estimated_arrival?: string | null;
}

export interface FoodWaypoint {
  place_id: string;
  research_id: string;
  name: string;
  food_category?: string | null;
  cuisine?: string | null;
  speciality_dishes: string[];
  dietary_tags: string[];
  corridor_status: CorridorStatus;
  distance_from_corridor_m: number;
  estimated_detour_minutes: number;
  rating?: number | null;
  rating_source?: string | null;
  source: string;
  verification_status: string;
}

export interface JourneyPlanResponse {
  journey_id: string;
  status: JourneyStatus;
  journey_type?: "direct" | "1_transfer";
  transfer_count?: number;
  transfer_hub?: string | null;
  transfer_wait_minutes?: number;
  departure_time?: string | null;
  estimated_arrival_time?: string | null;
  origin: {
    latitude: number;
    longitude: number;
    resolved_name?: string;
  };
  destination: {
    latitude?: number;
    longitude?: number;
    resolved_name?: string;
    place_id?: string;
    stop_id?: string;
  };
  walking_legs: WalkingLeg[];
  transit_legs: TransitLeg[];
  food_waypoint: FoodWaypoint | null;
  total_estimated_duration_minutes: number;
  warnings: string[];
}

// =========================================================================
// Image Identification & Visual Landmark Discovery Contracts
// =========================================================================

export type ConfidenceTier = "Likely Match" | "Possible Match" | "Could not confidently identify this place" | "Uncertain";

export type PlaceMatchCandidate = GeneratedSchemas["PlaceMatchCandidate"];
export type ImageIdentifyRequest = GeneratedSchemas["ImageIdentifyRequest"];
export type ImageIdentifyResponse = GeneratedSchemas["ImageIdentifyResponse"];




