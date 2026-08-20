/**
 * Typed frontend HTTP API client for approved O-Travelz backend contracts.
 * Connects to:
 *   - POST /itinerary/plan
 *   - POST /ai/plan
 *   - POST /map/v1/projection
 */

import type {
  AIPlanRequest,
  AIResponse,
  APIErrorResponse,
  ItineraryPlanResponse,
  MapProjectionHTTPRequest,
  MapProjectionResponse,
  PlanningConstraints,
} from "../types/api";

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
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
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
    this.baseUrl = rawUrl.replace(/\/+$/, "");
    this.fetchFn = config.fetchFn ?? fetch.bind(globalThis);
  }

  private buildUrl(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return this.baseUrl ? `${this.baseUrl}${cleanPath}` : cleanPath;
  }

  private async post<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
    const url = this.buildUrl(path);
    let response: Response;

    try {
      response = await this.fetchFn(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new NetworkError(
        `Failed to communicate with O-Travelz API at ${url}. Please check your connection.`,
        err
      );
    }

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {
      if (isAPIErrorResponse(data)) {
        throw new ApiError({
          message: data.error.message,
          status: response.status,
          code: data.error.code,
          field: data.error.field,
          details: data.details,
          rawResponse: data,
        });
      }

      if (isPlainObject(data) && typeof data.detail === "string") {
        throw new ApiError({
          message: data.detail,
          status: response.status,
          code: "HTTP_ERROR",
          rawResponse: data,
        });
      }

      throw new ApiError({
        message: `API request failed with status ${response.status}: ${response.statusText}`,
        status: response.status,
        code: "HTTP_ERROR",
        rawResponse: data,
      });
    }

    return data as TRes;
  }

  async planItinerary(constraints: PlanningConstraints): Promise<ItineraryPlanResponse> {
    const data = await this.post<PlanningConstraints, unknown>("/itinerary/plan", constraints);

    if (!isPlainObject(data) || typeof (data as any).itinerary_id !== "string" || !Array.isArray((data as any).days)) {
      throw new UnexpectedResponseError(
        "API returned an invalid itinerary plan format. Expected itinerary_id and days array.",
        200,
        data
      );
    }

    return data as ItineraryPlanResponse;
  }

  async sendAIPlan(request: AIPlanRequest): Promise<AIResponse> {
    const data = await this.post<AIPlanRequest, unknown>("/ai/plan", request);

    if (!isPlainObject(data) || typeof (data as any).message !== "string" || typeof (data as any).status !== "string") {
      throw new UnexpectedResponseError(
        "API returned an invalid AI response format. Expected message and status fields.",
        200,
        data
      );
    }

    return data as AIResponse;
  }

  async projectMap(request: MapProjectionHTTPRequest): Promise<MapProjectionResponse> {
    const data = await this.post<MapProjectionHTTPRequest, unknown>("/map/v1/projection", request);

    if (
      !isPlainObject(data) ||
      !Array.isArray((data as any).features) ||
      !Array.isArray((data as any).relationships) ||
      !Array.isArray((data as any).unavailable_items)
    ) {
      throw new UnexpectedResponseError(
        "API returned an invalid map projection format. Expected features, relationships, and unavailable_items arrays.",
        200,
        data
      );
    }

    return data as MapProjectionResponse;
  }
}

export const apiClient = new ApiClient();
