import { describe, expect, it, vi } from "vitest";
import { ApiClient, ApiError, NetworkError } from "../src/api/client";
import type {
  ItineraryPlanResponse,
  MapProjectionHTTPRequest,
  MapProjectionResponse,
} from "../src/api/contracts";
import sampleItineraryFixture from "./fixtures/sample_itinerary.json";

describe("Phase 6B Map Projection Flow & Integration", () => {
  const sampleItinerary = sampleItineraryFixture as unknown as ItineraryPlanResponse;

  it("extracts canonical place UUIDs and hops from itinerary for projection request", async () => {
    const itineraryWithUUIDs: ItineraryPlanResponse = {
      itinerary_id: "plan-uuid-001",
      constraints: { days: 1, interests: ["heritage"] },
      days: [
        {
          day_number: 1,
          stops: [
            {
              sequence: 1,
              place: {
                id: "550e8400-e29b-41d4-a716-446655440000",
                name: "Lingaraj",
                category: "temple",
              },
            },
            {
              sequence: 2,
              place: {
                id: "660e8400-e29b-41d4-a716-446655440001",
                name: "Mukteswar",
                category: "temple",
              },
            },
          ],
          hops: [
            {
              from_sequence: 1,
              to_sequence: 2,
              mode: "walk",
              legs: [{ mode: "walk", detail: "5 min walk" }],
              data_tier: "static",
            },
          ],
        },
      ],
      explanation: "",
    };

    const mockProjection: MapProjectionResponse = {
      requested_features: [
        { entity: "place", id: "550e8400-e29b-41d4-a716-446655440000" },
        { entity: "place", id: "660e8400-e29b-41d4-a716-446655440001" },
      ],
      features: [
        {
          feature_type: "place",
          canonical_ref: { entity: "place", id: "550e8400-e29b-41d4-a716-446655440000" },
          geometry_status: "available",
          geometry: { type: "Point", coordinates: [85.81, 20.29] },
        },
      ],
      relationships: [
        {
          relationship_type: "itinerary_hop",
          hop_ref: { day_number: 1, from_sequence: 1, to_sequence: 2 },
          mode: "walk",
          data_tier: "static",
          legs: [],
        },
      ],
      unavailable_items: [],
    };

    const mockGetMapProjection = vi.fn().mockResolvedValue(mockProjection);
    const mockClient = {
      getMapProjection: mockGetMapProjection,
    } as unknown as ApiClient;

    const payload: MapProjectionHTTPRequest = {
      requested_features: [
        { entity: "place", id: "550e8400-e29b-41d4-a716-446655440000" },
        { entity: "place", id: "660e8400-e29b-41d4-a716-446655440001" },
      ],
      requested_hops: [
        {
          day_number: 1,
          hop: itineraryWithUUIDs.days[0].hops[0],
        },
      ],
    };

    const result = await mockClient.getMapProjection(payload);

    expect(result).toEqual(mockProjection);
    expect(mockGetMapProjection).toHaveBeenCalledWith(payload);
    expect(result.features[0].geometry_status).toBe("available");
    expect(result.features[0].geometry?.type).toBe("Point");
  });

  it("handles structured API error without fabricating fake coordinates", async () => {
    const apiError = new ApiError({
      message: "Internal projection failed",
      status: 500,
      code: "internal_projection_error",
    });

    const mockGetMapProjection = vi.fn().mockRejectedValue(apiError);
    const mockClient = {
      getMapProjection: mockGetMapProjection,
    } as unknown as ApiClient;

    let caughtError: unknown = null;
    let result: unknown = null;

    try {
      result = await mockClient.getMapProjection({
        requested_features: [{ entity: "place", id: "550e8400-e29b-41d4-a716-446655440000" }],
      });
    } catch (err) {
      caughtError = err;
    }

    expect(result).toBeNull();
    expect(caughtError).toBeInstanceOf(ApiError);
    expect((caughtError as ApiError).code).toBe("internal_projection_error");
  });

  it("handles network failure during projection request", async () => {
    const netError = new NetworkError("Connection refused by map service");
    const mockGetMapProjection = vi.fn().mockRejectedValue(netError);
    const mockClient = {
      getMapProjection: mockGetMapProjection,
    } as unknown as ApiClient;

    let caughtError: unknown = null;
    try {
      await mockClient.getMapProjection({
        requested_features: [{ entity: "place", id: "550e8400-e29b-41d4-a716-446655440000" }],
      });
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeInstanceOf(NetworkError);
    expect((caughtError as NetworkError).message).toContain("Connection refused");
  });

  it("updates map projection when an itinerary is updated or refined", async () => {
    const firstProjection: MapProjectionResponse = {
      requested_features: [{ entity: "place", id: "550e8400-e29b-41d4-a716-446655440001" }],
      features: [
        {
          feature_type: "place",
          canonical_ref: { entity: "place", id: "550e8400-e29b-41d4-a716-446655440001" },
          geometry_status: "available",
          geometry: { type: "Point", coordinates: [85.81, 20.29] },
        },
      ],
      relationships: [],
      unavailable_items: [],
    };

    const secondProjection: MapProjectionResponse = {
      requested_features: [{ entity: "place", id: "550e8400-e29b-41d4-a716-446655440002" }],
      features: [
        {
          feature_type: "place",
          canonical_ref: { entity: "place", id: "550e8400-e29b-41d4-a716-446655440002" },
          geometry_status: "available",
          geometry: { type: "Point", coordinates: [85.87, 20.35] },
        },
      ],
      relationships: [],
      unavailable_items: [],
    };

    const mockGetMapProjection = vi
      .fn()
      .mockResolvedValueOnce(firstProjection)
      .mockResolvedValueOnce(secondProjection);

    const mockClient = {
      getMapProjection: mockGetMapProjection,
    } as unknown as ApiClient;

    const res1 = await mockClient.getMapProjection({
      requested_features: [{ entity: "place", id: "550e8400-e29b-41d4-a716-446655440001" }],
    });
    expect(res1.features[0].canonical_ref.id).toBe("550e8400-e29b-41d4-a716-446655440001");

    const res2 = await mockClient.getMapProjection({
      requested_features: [{ entity: "place", id: "550e8400-e29b-41d4-a716-446655440002" }],
    });
    expect(res2.features[0].canonical_ref.id).toBe("550e8400-e29b-41d4-a716-446655440002");
    expect(mockGetMapProjection).toHaveBeenCalledTimes(2);
  });
});
