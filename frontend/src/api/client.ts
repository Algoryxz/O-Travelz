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
  AIPlanRequest,
  AIResponse,
  APIErrorResponse,
  ItineraryPlanResponse,
  MapProjectionHTTPRequest,
  MapProjectionResponse,
  PlaceDetail,
  PlaceListParams,
  PlanningConstraints,
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

export class NetworkError extends Error {
  readonly causeError?: unknown;

  constructor(message: string, causeError?: unknown) {
    super(message);
    this.name = "NetworkError";
    this.causeError = causeError;
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

function getDefaultBaseUrl(): string {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  }
  return "";
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

  constructor(config: ApiClientConfig = {}) {
    const rawUrl = config.baseUrl !== undefined ? config.baseUrl : getDefaultBaseUrl();
    this.baseUrl = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
    this.fetchFn = config.fetchFn ?? globalThis.fetch.bind(globalThis);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit,
    validateFn: (data: unknown) => data is T
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = this.baseUrl ? `${this.baseUrl}${cleanEndpoint}` : cleanEndpoint;

    let response: Response;
    try {
      response = await this.fetchFn(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
      });
    } catch (err) {
      throw new NetworkError(
        `Failed to communicate with O-Travelz API at ${url}. Please check your connection.`,
        err
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
    if (params.search) query.set("search", params.search);
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
}

export const apiClient = new ApiClient();
