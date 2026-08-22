import { describe, expect, it, vi } from "vitest";

import {
  ApiClient,
  ApiError,
  NetworkError,
  UnexpectedResponseError,
} from "../src/api/client";
import type {
  AIPlanRequest,
  AIResponse,
  ItineraryPlanResponse,
  MapProjectionHTTPRequest,
  MapProjectionResponse,
  PlanningConstraints,
} from "../src/api/contracts";

describe("ApiClient", () => {
  const mockSuccessResponse = (data: unknown, status = 200): typeof fetch => {
    return vi.fn().mockResolvedValue({
      ok: true,
      status,
      statusText: "OK",
      text: () => Promise.resolve(JSON.stringify(data)),
    } as unknown as Response);
  };

  const mockErrorResponse = (data: unknown, status = 422, statusText = "Unprocessable Entity"): typeof fetch => {
    return vi.fn().mockResolvedValue({
      ok: false,
      status,
      statusText,
      text: () => Promise.resolve(typeof data === "string" ? data : JSON.stringify(data)),
    } as unknown as Response);
  };

  describe("Configuration & URL construction", () => {
    it("uses empty base URL or trims trailing slashes properly", async () => {
      const fetchFn = mockSuccessResponse({
        itinerary_id: "itin-1",
        constraints: { days: 1, interests: ["heritage"] },
        days: [],
        explanation: "",
      });

      const client = new ApiClient({ baseUrl: "http://localhost:8000/", fetchFn });
      await client.planItinerary({ days: 1, interests: ["heritage"] });

      expect(fetchFn).toHaveBeenCalledWith(
        "http://localhost:8000/itinerary/plan",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
          }),
        })
      );
    });
  });

  describe("POST /itinerary/plan", () => {
    it("handles successful itinerary plan request", async () => {
      const mockResponse: ItineraryPlanResponse = {
        itinerary_id: "plan-123",
        constraints: { days: 1, interests: ["temple"] },
        days: [
          {
            day_number: 1,
            stops: [
              {
                sequence: 1,
                place: { id: "p1", name: "Lingaraj", category: "temple" },
              },
            ],
            hops: [],
          },
        ],
        explanation: "Valid itinerary",
      };

      const fetchFn = mockSuccessResponse(mockResponse);
      const client = new ApiClient({ fetchFn });

      const constraints: PlanningConstraints = { days: 1, interests: ["temple"] };
      const result = await client.planItinerary(constraints);

      expect(result).toEqual(mockResponse);
      expect(fetchFn).toHaveBeenCalledWith(
        "/itinerary/plan",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(constraints),
        })
      );
    });

    it("handles structured non-2xx API error (e.g. 422 with structured body)", async () => {
      const errorBody = {
        error: {
          code: "no_feasible_candidates",
          message: "No places match the requested constraints.",
          field: null,
        },
        details: [],
      };

      const fetchFn = mockErrorResponse(errorBody, 422);
      const client = new ApiClient({ fetchFn });

      await expect(client.planItinerary({ days: 1, interests: ["unknown"] })).rejects.toThrow(
        ApiError
      );

      try {
        await client.planItinerary({ days: 1, interests: ["unknown"] });
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError);
        const apiErr = e as ApiError;
        expect(apiErr.status).toBe(422);
        expect(apiErr.code).toBe("no_feasible_candidates");
        expect(apiErr.message).toBe("No places match the requested constraints.");
        expect(apiErr.details).toEqual([]);
      }
    });

    it("handles non-2xx response without structured error contract", async () => {
      const fetchFn = mockErrorResponse("Internal Server Error", 500, "Internal Server Error");
      const client = new ApiClient({ fetchFn });

      try {
        await client.planItinerary({ days: 1, interests: ["temple"] });
        expect.unreachable();
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError);
        const apiErr = e as ApiError;
        expect(apiErr.status).toBe(500);
        expect(apiErr.code).toBe("http_error");
      }
    });
  });

  describe("Network failure", () => {
    it("translates fetch rejection into NetworkError", async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error("Failed to fetch (Connection refused)"));
      const client = new ApiClient({ fetchFn });

      await expect(client.planItinerary({ days: 1, interests: ["temple"] })).rejects.toThrow(
        NetworkError
      );

      try {
        await client.planItinerary({ days: 1, interests: ["temple"] });
      } catch (e) {
        expect(e).toBeInstanceOf(NetworkError);
        const netErr = e as NetworkError;
        expect(netErr.message).toContain("Failed to communicate with O-Travelz API");
      }
    });
  });

  describe("POST /ai/plan", () => {
    it("handles successful AI response", async () => {
      const mockResponse: AIResponse = {
        message: "Here is your 1-day itinerary.",
        status: "success",
        itinerary: {
          itinerary_id: "ai-itin-1",
          constraints: { days: 1, interests: ["heritage"] },
          days: [],
          explanation: "",
        },
        clarification: null,
        changed_constraints: null,
      };

      const fetchFn = mockSuccessResponse(mockResponse);
      const client = new ApiClient({ fetchFn });

      const request: AIPlanRequest = {
        message: "Plan a 1 day heritage trip",
        constraints: { days: 1, interests: ["heritage"] },
      };
      const result = await client.planWithAi(request);

      expect(result).toEqual(mockResponse);
      expect(fetchFn).toHaveBeenCalledWith(
        "/ai/plan",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(request),
        })
      );
    });

    it("handles AI clarification response", async () => {
      const mockResponse: AIResponse = {
        message: "Which dates are you planning for?",
        status: "clarification",
        clarification: {
          question: "Which dates are you planning for?",
          reason: "date_needed",
        },
      };

      const fetchFn = mockSuccessResponse(mockResponse);
      const client = new ApiClient({ fetchFn });

      const result = await client.planWithAi({ message: "Plan a trip" });
      expect(result.status).toBe("clarification");
      expect(result.clarification?.question).toBe("Which dates are you planning for?");
    });
  });

  describe("POST /map/v1/projection", () => {
    it("handles successful map projection response", async () => {
      const mockResponse: MapProjectionResponse = {
        requested_features: [{ entity: "place", id: "550e8400-e29b-41d4-a716-446655440000" }],
        features: [
          {
            feature_type: "place",
            canonical_ref: { entity: "place", id: "550e8400-e29b-41d4-a716-446655440000" },
            geometry_status: "available",
            geometry: { type: "Point", coordinates: [85.81, 20.29] },
          },
        ],
        relationships: [],
        unavailable_items: [],
      };

      const fetchFn = mockSuccessResponse(mockResponse);
      const client = new ApiClient({ fetchFn });

      const req: MapProjectionHTTPRequest = {
        requested_features: [{ entity: "place", id: "550e8400-e29b-41d4-a716-446655440000" }],
      };
      const result = await client.getMapProjection(req);

      expect(result).toEqual(mockResponse);
      expect(fetchFn).toHaveBeenCalledWith(
        "/map/v1/projection",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(req),
        })
      );
    });

    it("handles map projection structured error for empty features", async () => {
      const errorBody = {
        error: {
          code: "empty_requested_feature_set",
          message: "requested_features must contain at least one feature",
          field: "requested_features",
        },
        details: [],
      };

      const fetchFn = mockErrorResponse(errorBody, 422);
      const client = new ApiClient({ fetchFn });

      try {
        await client.getMapProjection({ requested_features: [] });
        expect.unreachable();
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError);
        const apiErr = e as ApiError;
        expect(apiErr.status).toBe(422);
        expect(apiErr.code).toBe("empty_requested_feature_set");
        expect(apiErr.field).toBe("requested_features");
      }
    });
  });

  describe("Malformed and unexpected responses", () => {
    it("rejects when 200 response body has invalid shape rather than converting into fake data", async () => {
      const invalidShapeData = { unexpected_key: 123 };
      const fetchFn = mockSuccessResponse(invalidShapeData);
      const client = new ApiClient({ fetchFn });

      await expect(client.planItinerary({ days: 1, interests: ["temple"] })).rejects.toThrow(
        UnexpectedResponseError
      );
    });

    it("rejects when 200 response contains unparseable JSON", async () => {
      const fetchFn = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        text: () => Promise.resolve("not valid json <<<<"),
      } as unknown as Response);

      const client = new ApiClient({ fetchFn });
      await expect(client.planItinerary({ days: 1, interests: ["temple"] })).rejects.toThrow(
        UnexpectedResponseError
      );
    });
  });

  describe("GET /places multilingual query construction & URL encoding", () => {
    it("preserves and properly encodes Odia search, district, category, and interest queries", async () => {
      const fetchFn = mockSuccessResponse([]);
      const client = new ApiClient({ fetchFn });

      // 1. Odia search queries
      await client.listPlaces({ search: "ପୁରୀ" });
      expect(fetchFn).toHaveBeenLastCalledWith(
        `/places?search=${encodeURIComponent("ପୁରୀ")}`,
        expect.objectContaining({ method: "GET" })
      );

      await client.listPlaces({ search: "ମନ୍ଦିର" });
      expect(fetchFn).toHaveBeenLastCalledWith(
        `/places?search=${encodeURIComponent("ମନ୍ଦିର")}`,
        expect.objectContaining({ method: "GET" })
      );

      await client.listPlaces({ search: "ରୂପା ସହର" });
      expect(fetchFn).toHaveBeenLastCalledWith(
        `/places?search=${encodeURIComponent("ରୂପା ସହର").replace(/%20/g, "+")}`,
        expect.objectContaining({ method: "GET" })
      );

      // 2. Odia district, category, and interest
      await client.listPlaces({ district: "ପୁରୀ", category: "ମନ୍ଦିର", interest: "ଐତିହ୍ୟ" });
      const lastCallUrl = (fetchFn as any).mock.calls[(fetchFn as any).mock.calls.length - 1][0];
      const parsedUrl = new URL(`http://localhost${lastCallUrl}`);
      expect(parsedUrl.searchParams.get("district")).toBe("ପୁରୀ");
      expect(parsedUrl.searchParams.get("category")).toBe("ମନ୍ଦିର");
      expect(parsedUrl.searchParams.get("interest")).toBe("ଐତିହ୍ୟ");
    });

    it("preserves and properly encodes Hindi search, district, category, and interest queries", async () => {
      const fetchFn = mockSuccessResponse([]);
      const client = new ApiClient({ fetchFn });

      // 1. Hindi search queries
      await client.listPlaces({ search: "पुरी" });
      expect(fetchFn).toHaveBeenLastCalledWith(
        `/places?search=${encodeURIComponent("पुरी")}`,
        expect.objectContaining({ method: "GET" })
      );

      await client.listPlaces({ search: "मंदिर" });
      expect(fetchFn).toHaveBeenLastCalledWith(
        `/places?search=${encodeURIComponent("मंदिर")}`,
        expect.objectContaining({ method: "GET" })
      );

      await client.listPlaces({ search: "चांदी का शहर" });
      expect(fetchFn).toHaveBeenLastCalledWith(
        `/places?search=${encodeURIComponent("चांदी का शहर").replace(/%20/g, "+")}`,
        expect.objectContaining({ method: "GET" })
      );

      // 2. Hindi district, category, and interest
      await client.listPlaces({ district: "पुरी", category: "मंदिर", interest: "विरासत" });
      const lastCallUrl = (fetchFn as any).mock.calls[(fetchFn as any).mock.calls.length - 1][0];
      const parsedUrl = new URL(`http://localhost${lastCallUrl}`);
      expect(parsedUrl.searchParams.get("district")).toBe("पुरी");
      expect(parsedUrl.searchParams.get("category")).toBe("मंदिर");
      expect(parsedUrl.searchParams.get("interest")).toBe("विरासत");
    });

    it("supports canonical English and localized inputs as opaque query parameters", async () => {
      const fetchFn = mockSuccessResponse([]);
      const client = new ApiClient({ fetchFn });

      // English canonical
      await client.listPlaces({ district: "Puri", category: "temple", interest: "heritage" });
      expect(fetchFn).toHaveBeenLastCalledWith(
        "/places?category=temple&interest=heritage&district=Puri",
        expect.objectContaining({ method: "GET" })
      );

      // Mixed / pagination parameters
      await client.listPlaces({
        search: "Temples in Puri",
        district: "Puri",
        category: "temple",
        interest: "heritage",
        limit: 10,
        offset: 20,
      });
      const lastCallUrl = (fetchFn as any).mock.calls[(fetchFn as any).mock.calls.length - 1][0];
      const parsedUrl = new URL(`http://localhost${lastCallUrl}`);
      expect(parsedUrl.searchParams.get("search")).toBe("Temples in Puri");
      expect(parsedUrl.searchParams.get("district")).toBe("Puri");
      expect(parsedUrl.searchParams.get("category")).toBe("temple");
      expect(parsedUrl.searchParams.get("interest")).toBe("heritage");
      expect(parsedUrl.searchParams.get("limit")).toBe("10");
      expect(parsedUrl.searchParams.get("offset")).toBe("20");
    });

    it("handles empty and optional parameter variations cleanly", async () => {
      const fetchFn = mockSuccessResponse([]);
      const client = new ApiClient({ fetchFn });

      // Empty params
      await client.listPlaces({});
      expect(fetchFn).toHaveBeenLastCalledWith("/places", expect.objectContaining({ method: "GET" }));

      // No params
      await client.listPlaces();
      expect(fetchFn).toHaveBeenLastCalledWith("/places", expect.objectContaining({ method: "GET" }));

      // Only search
      await client.listPlaces({ search: "Konark" });
      expect(fetchFn).toHaveBeenLastCalledWith("/places?search=Konark", expect.objectContaining({ method: "GET" }));
    });
  });
});
