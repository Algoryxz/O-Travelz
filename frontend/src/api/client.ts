/**
 * Typed frontend HTTP API client for approved O-Travelz backend contracts.
 * Connects to:
 *   - POST /itinerary/plan
 *   - POST /ai/plan
 *   - POST /map/v1/projection
 *   - GET  /places
 *   - GET  /places/{id}
 *   - GET  /weather/current
 */

import type {
  AIConverseRequest,
  AIPlanRequest,
  AIResponse,
  APIErrorResponse,
  GroundedConversationResponse,
  ItineraryPlanResponse,
  MapProjectionHTTPRequest,
  MapProjectionResponse,
  PlaceDetail,
  PlaceListParams,
  PlanningConstraints,
  SearchSuggestion,
  WeatherResponse,
} from "./contracts";



export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly field?: string | null;
  readonly details: Array<Record<string, unknown>>;
  readonly rawResponse?: unknown;

  constructor(params: {
    message: string;
    status: number;
    code: string;
    field?: string | null;
    details?: Array<Record<string, unknown>>;
    rawResponse?: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.field = params.field;
    this.details = params.details ?? [];
    this.rawResponse = params.rawResponse;
  }
}

import {
  getApiBaseUrl,
  normalizeBaseUrl,
  buildApiUrlWithBase,
  diagnoseFetchError,
  type NetworkDiagnostic,
} from "./config";

export class NetworkError extends Error {
  readonly causeError?: unknown;
  readonly diagnostic?: NetworkDiagnostic;

  constructor(message: string, causeError?: unknown, diagnostic?: NetworkDiagnostic) {
    super(message);
    this.name = "NetworkError";
    this.causeError = causeError;
    this.diagnostic = diagnostic;
  }
}

export class UnexpectedResponseError extends Error {
  readonly status: number;
  readonly rawData: unknown;

  constructor(message: string, status: number, rawData: unknown) {
    super(message);
    this.name = "UnexpectedResponseError";
    this.status = status;
    this.rawData = rawData;
  }
}

export interface ApiClientConfig {
  baseUrl?: string;
  fetchFn?: typeof fetch;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAPIErrorResponse(data: unknown): data is APIErrorResponse {
  if (!isPlainObject(data)) return false;
  const err = data.error;
  if (!isPlainObject(err)) return false;
  return typeof err.code === "string" && typeof err.message === "string";
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;
  private bearerToken: string | null = null;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl !== undefined ? normalizeBaseUrl(config.baseUrl) : getApiBaseUrl();
    this.fetchFn = config.fetchFn ?? globalThis.fetch.bind(globalThis);
  }

  setBearerToken(token: string | null): void {
    this.bearerToken = token;
  }

  getBearerToken(): string | null {
    return this.bearerToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit,
    validateFn: (data: unknown) => data is T
  ): Promise<T> {
    const cleanEndpoint = `/${(endpoint || "").trim().replace(/^\/+/, "")}`;
    const url = buildApiUrlWithBase(this.baseUrl, cleanEndpoint);

    const authHeaders: Record<string, string> = {};
    if (this.bearerToken) {
      authHeaders["Authorization"] = `Bearer ${this.bearerToken}`;
    }

    let response: Response | null = null;
    const isIdempotentGet = !options.method || options.method.toUpperCase() === "GET";
    const maxAttempts = isIdempotentGet ? 2 : 1;
    let lastErr: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        response = await this.fetchFn(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...authHeaders,
            ...options.headers,
          },
        });
        lastErr = undefined;
        break;
      } catch (err) {
        lastErr = err;
        if (attempt < maxAttempts) {
          // Render free-tier cold starts or transient DNS resolution lag: brief backoff retry
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }

    if (!response || lastErr !== undefined) {
      const diagnostic = diagnoseFetchError(lastErr, url);
      throw new NetworkError(
        diagnostic.message,
        lastErr,
        diagnostic
      );
    }

    let parsedBody: unknown;
    const responseText = await response.text();
    if (responseText.trim().length > 0) {
      try {
        parsedBody = JSON.parse(responseText);
      } catch {
        if (!response.ok) {
          throw new ApiError({
            message: `HTTP ${response.status}: ${response.statusText || "Request failed"}`,
            status: response.status,
            code: "http_error",
            rawResponse: responseText,
          });
        }
        throw new UnexpectedResponseError(
          `Failed to parse JSON response from ${cleanEndpoint}`,
          response.status,
          responseText
        );
      }
    }

    if (!response.ok) {
      if (isAPIErrorResponse(parsedBody)) {
        throw new ApiError({
          message: parsedBody.error.message,
          status: response.status,
          code: parsedBody.error.code,
          field: parsedBody.error.field,
          details: parsedBody.details,
          rawResponse: parsedBody,
        });
      }

      if (isPlainObject(parsedBody) && typeof (parsedBody as Record<string, unknown>).detail === "string") {
        throw new ApiError({
          message: (parsedBody as Record<string, unknown>).detail as string,
          status: response.status,
          code: "http_error",
          rawResponse: parsedBody,
        });
      }

      throw new ApiError({
        message: `HTTP ${response.status}: ${response.statusText || "Request failed"}`,
        status: response.status,
        code: "http_error",
        rawResponse: parsedBody,
      });
    }

    if (!validateFn(parsedBody)) {
      throw new UnexpectedResponseError(
        `Invalid response structure from ${cleanEndpoint}`,
        response.status,
        parsedBody
      );
    }

    return parsedBody;
  }

  async planItinerary(constraints: PlanningConstraints): Promise<ItineraryPlanResponse> {
    return this.request<ItineraryPlanResponse>(
      "/itinerary/plan",
      {
        method: "POST",
        body: JSON.stringify(constraints),
      },
      (data): data is ItineraryPlanResponse => {
        return (
          isPlainObject(data) &&
          typeof data.itinerary_id === "string" &&
          Array.isArray(data.days) &&
          typeof data.explanation === "string" &&
          isPlainObject(data.constraints)
        );
      }
    );
  }

  async planWithAi(request: AIPlanRequest): Promise<AIResponse> {
    return this.request<AIResponse>(
      "/ai/plan",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      (data): data is AIResponse => {
        return (
          isPlainObject(data) &&
          typeof data.message === "string" &&
          typeof data.status === "string"
        );
      }
    );
  }

  async converseWithAi(request: AIConverseRequest): Promise<GroundedConversationResponse> {
    return this.request<GroundedConversationResponse>(
      "/ai/converse",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      (data): data is GroundedConversationResponse => {
        return (
          isPlainObject(data) &&
          typeof data.message === "string" &&
          typeof data.status === "string" &&
          typeof data.is_grounded === "boolean"
        );
      }
    );
  }

  // Alias for compatibility with components using sendAIPlan
  async sendAIPlan(request: AIPlanRequest): Promise<AIResponse> {
    return this.planWithAi(request);
  }


  async getMapProjection(request: MapProjectionHTTPRequest): Promise<MapProjectionResponse> {
    return this.request<MapProjectionResponse>(
      "/map/v1/projection",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      (data): data is MapProjectionResponse => {
        return (
          isPlainObject(data) &&
          Array.isArray(data.requested_features) &&
          Array.isArray(data.features) &&
          Array.isArray(data.relationships) &&
          Array.isArray(data.unavailable_items)
        );
      }
    );
  }

  // Alias for compatibility with components using projectMap
  async projectMap(request: MapProjectionHTTPRequest): Promise<MapProjectionResponse> {
    return this.getMapProjection(request);
  }

  async listPlaces(params: PlaceListParams = {}): Promise<PlaceDetail[]> {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.interest) query.set("interest", params.interest);
    if (params.district) query.set("district", params.district);
    if (params.region) query.set("region", params.region);
    if (params.search) query.set("search", params.search);
    if (params.verification_status) query.set("verification_status", params.verification_status);
    if (params.is_medical != null) query.set("is_medical", params.is_medical ? "true" : "false");
    if (params.is_transit != null) query.set("is_transit", params.is_transit ? "true" : "false");
    if (params.near_lat != null) query.set("near_lat", params.near_lat.toString());
    if (params.near_lon != null) query.set("near_lon", params.near_lon.toString());
    if (params.radius_km != null) query.set("radius_km", params.radius_km.toString());
    if (params.limit != null) query.set("limit", params.limit.toString());
    if (params.offset != null) query.set("offset", params.offset.toString());
    const qs = query.toString() ? `?${query.toString()}` : "";

    return this.request<PlaceDetail[]>(
      `/places${qs}`,
      { method: "GET" },
      (data): data is PlaceDetail[] => {
        return Array.isArray(data);
      }
    );
  }


  async getPlace(placeId: string): Promise<PlaceDetail> {
    return this.request<PlaceDetail>(
      `/places/${encodeURIComponent(placeId)}`,
      { method: "GET" },
      (data): data is PlaceDetail => {
        return isPlainObject(data) && typeof data.id === "string" && typeof data.name === "string";
      }
    );
  }

  async getWeather(params: { lat?: number; lon?: number; location_name?: string } = {}): Promise<WeatherResponse> {
    const query = new URLSearchParams();
    if (params.lat != null) query.set("lat", params.lat.toString());
    if (params.lon != null) query.set("lon", params.lon.toString());
    if (params.location_name) query.set("location_name", params.location_name);
    const qs = query.toString() ? `?${query.toString()}` : "";

    return this.request<WeatherResponse>(
      `/weather/current${qs}`,
      { method: "GET" },
      (data): data is WeatherResponse => {
        return (
          isPlainObject(data) &&
          typeof data.location_name === "string" &&
          isPlainObject(data.current)
        );
      }
    );
  }

  async getSearchSuggestions(query: string, limit = 5): Promise<SearchSuggestion[]> {
    const params = new URLSearchParams({ query, limit: String(limit) });
    return this.request<SearchSuggestion[]>(
      `/places/suggestions?${params.toString()}`,
      { method: "GET" },
      (data): data is SearchSuggestion[] => Array.isArray(data)
    );
  }

  // =========================================================================
  // Auth API Methods
  // =========================================================================

  async exchangeAuthTicket(ticket: string): Promise<import("./contracts").AuthResponse> {
    const res = await this.request<import("./contracts").AuthResponse & { session_token?: string }>(
      "/auth/session/exchange",
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ ticket }),
      },
      (data): data is import("./contracts").AuthResponse & { session_token?: string } =>
        isPlainObject(data) && typeof data.authenticated === "boolean"
    );
    if (res.authenticated && res.session_token) {
      this.setBearerToken(res.session_token);
    }
    return res;
  }

  async getAuthMe(): Promise<import("./contracts").AuthResponse> {
    return this.request<import("./contracts").AuthResponse>(
      "/auth/me",
      { method: "GET", credentials: "include" },
      (data): data is import("./contracts").AuthResponse =>
        isPlainObject(data) && typeof data.authenticated === "boolean"
    );
  }

  async logout(): Promise<{ authenticated: boolean }> {
    this.setBearerToken(null);
    return this.request<{ authenticated: boolean }>(
      "/auth/logout",
      { method: "POST", credentials: "include" },
      (data): data is { authenticated: boolean } =>
        isPlainObject(data) && typeof data.authenticated === "boolean"
    );
  }

  // =========================================================================
  // Cloud Synchronization API Methods
  // =========================================================================

  async getSyncedPlaces(): Promise<import("./contracts").SyncSavedPlacesResponse> {
    return this.request<import("./contracts").SyncSavedPlacesResponse>(
      "/api/v1/sync/saved-places",
      { method: "GET", credentials: "include" },
      (data): data is import("./contracts").SyncSavedPlacesResponse =>
        isPlainObject(data) && typeof data.synced_count === "number" && Array.isArray(data.items)
    );
  }

  async syncSavedPlaces(items: import("./contracts").SyncPlaceItem[]): Promise<import("./contracts").SyncSavedPlacesResponse> {
    return this.request<import("./contracts").SyncSavedPlacesResponse>(
      "/api/v1/sync/saved-places",
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ items }),
      },
      (data): data is import("./contracts").SyncSavedPlacesResponse =>
        isPlainObject(data) && typeof data.synced_count === "number" && Array.isArray(data.items)
    );
  }

  async getSyncedTrips(): Promise<import("./contracts").SyncTripsResponse> {
    return this.request<import("./contracts").SyncTripsResponse>(
      "/api/v1/sync/trips",
      { method: "GET", credentials: "include" },
      (data): data is import("./contracts").SyncTripsResponse =>
        isPlainObject(data) && typeof data.synced_count === "number" && Array.isArray(data.items)
    );
  }

  async syncTrips(items: import("./contracts").SyncTripItem[]): Promise<import("./contracts").SyncTripsResponse> {
    return this.request<import("./contracts").SyncTripsResponse>(
      "/api/v1/sync/trips",
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ items }),
      },
      (data): data is import("./contracts").SyncTripsResponse =>
        isPlainObject(data) && typeof data.synced_count === "number" && Array.isArray(data.items)
    );
  }

  // =========================================================================
  // Trip Sharing & Read-Only Snapshot API Methods
  // =========================================================================

  async createSharedTrip(payload: import("../types/api").CreateShareTripRequest): Promise<import("../types/api").CreateShareTripResponse> {
    return this.request<import("../types/api").CreateShareTripResponse>(
      "/api/v1/trips/share",
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(payload),
      },
      (data): data is import("../types/api").CreateShareTripResponse =>
        isPlainObject(data) &&
        typeof data.share_id === "string" &&
        typeof data.share_url === "string" &&
        typeof data.created_at === "number"
    );
  }

  async getSharedTrip(shareId: string): Promise<import("../types/api").PublicSharedTripResponse> {
    return this.request<import("../types/api").PublicSharedTripResponse>(
      `/api/v1/trips/shared/${encodeURIComponent(shareId)}`,
      {
        method: "GET",
      },
      (data): data is import("../types/api").PublicSharedTripResponse =>
        isPlainObject(data) &&
        typeof data.share_id === "string" &&
        typeof data.title === "string" &&
        isPlainObject(data.itinerary) &&
        typeof data.created_at === "number"
    );
  }

  async reverseGeocode(lat: number, lon: number): Promise<import("../types/api").ReverseGeocodeResponse> {
    const q = new URLSearchParams({ lat: String(lat), lon: String(lon) });
    return this.request<import("../types/api").ReverseGeocodeResponse>(
      `/location/reverse-geocode?${q.toString()}`,
      { method: "GET" },
      (data): data is import("../types/api").ReverseGeocodeResponse =>
        isPlainObject(data) && typeof data.locality === "string" && typeof data.city === "string"
    );
  }

  async getNearbyStops(
    lat: number,
    lon: number,
    radiusM: number = 3000,
    limit: number = 10
  ): Promise<import("../types/api").NearbyStopResponse[]> {
    const q = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      radius_m: String(radiusM),
      limit: String(limit),
    });
    return this.request<import("../types/api").NearbyStopResponse[]>(
      `/transport/stops/nearby?${q.toString()}`,
      { method: "GET" },
      (data): data is import("../types/api").NearbyStopResponse[] => Array.isArray(data)
    );
  }

  async getTransportMap(region?: string): Promise<import("../types/api").TransportMapResponse> {
    const q = new URLSearchParams();
    if (region) q.set("region", region);
    const queryStr = q.toString() ? `?${q.toString()}` : "";
    return this.request<import("../types/api").TransportMapResponse>(
      `/transport/map${queryStr}`,
      { method: "GET" },
      (data): data is import("../types/api").TransportMapResponse =>
        isPlainObject(data) && Array.isArray(data.routes) && Array.isArray(data.stops)
    );
  }

  async getRouteDetail(routeId: string): Promise<import("../types/api").RouteDetailResponse> {
    return this.request<import("../types/api").RouteDetailResponse>(
      `/transport/routes/${encodeURIComponent(routeId)}`,
      { method: "GET" },
      (data): data is import("../types/api").RouteDetailResponse =>
        isPlainObject(data) && typeof data.route_id === "string" && Array.isArray(data.stops)
    );
  }

  async getTransportProviders(): Promise<import("../types/api").TransportProviderResponse[]> {
    return this.request<import("../types/api").TransportProviderResponse[]>(
      `/transport/providers`,
      { method: "GET" },
      (data): data is import("../types/api").TransportProviderResponse[] => Array.isArray(data)
    );
  }

  async getCorridorFood(
    routeId: string,
    options: {
      maxDistanceM?: number;
      foodCategory?: string;
      dietaryTag?: string;
      cuisine?: string;
      limit?: number;
    } = {}
  ): Promise<import("../types/api").CorridorFoodResponse> {
    const q = new URLSearchParams({ route_id: routeId });
    if (options.maxDistanceM != null) q.set("max_distance_m", String(options.maxDistanceM));
    if (options.foodCategory) q.set("food_category", options.foodCategory);
    if (options.dietaryTag) q.set("dietary_tag", options.dietaryTag);
    if (options.cuisine) q.set("cuisine", options.cuisine);
    if (options.limit != null) q.set("limit", String(options.limit));

    return this.request<import("../types/api").CorridorFoodResponse>(
      `/transport/corridor-food?${q.toString()}`,
      { method: "GET" },
      (data): data is import("../types/api").CorridorFoodResponse =>
        isPlainObject(data) &&
        typeof data.route_id === "string" &&
        Array.isArray(data.candidates) &&
        isPlainObject(data.corridor_geometry_info)
    );
  }

  async planMultimodalJourney(
    req: import("../types/api").PlanJourneyRequest
  ): Promise<import("../types/api").JourneyPlanResponse> {
    return this.request<import("../types/api").JourneyPlanResponse>(
      `/transport/plan-journey`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      },
      (data): data is import("../types/api").JourneyPlanResponse =>
        isPlainObject(data) &&
        typeof data.journey_id === "string" &&
        typeof data.status === "string" &&
        Array.isArray(data.walking_legs) &&
        Array.isArray(data.transit_legs)
    );
  }

  async getCurrentUser(): Promise<import("../types/api").UserResponse | null> {
    try {
      const res = await this.getAuthMe();
      if (res && res.authenticated && res.user) {
        return res.user as import("../types/api").UserResponse;
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const apiClient = new ApiClient();



