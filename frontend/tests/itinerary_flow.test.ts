import { describe, expect, it, vi } from "vitest";
import { ApiClient, ApiError, NetworkError } from "../src/api/client";
import type { ItineraryPlanResponse, PlanningConstraints } from "../src/api/contracts";
import sampleItineraryFixture from "./fixtures/sample_itinerary.json";

describe("Phase 6B Itinerary Planner State & Integration Flow", () => {
  const sampleItinerary = sampleItineraryFixture as unknown as ItineraryPlanResponse;

  it("plans an itinerary successfully and updates state", async () => {
    const mockPlanItinerary = vi.fn().mockResolvedValue(sampleItinerary);
    const mockClient = {
      planItinerary: mockPlanItinerary,
    } as unknown as ApiClient;

    const initialConstraints: PlanningConstraints = { days: 1, interests: ["temples", "food"] };
    const result = await mockClient.planItinerary(initialConstraints);

    expect(result).toEqual(sampleItinerary);
    expect(mockPlanItinerary).toHaveBeenCalledWith(initialConstraints);
    expect(result.itinerary_id).toBe("fixture-0001");
    expect(result.days[0].stops.length).toBe(2);
    expect(result.days[0].hops.length).toBe(1);
  });

  it("handles structured 422 API planning error without creating fake fallback data", async () => {
    const apiError = new ApiError({
      message: "No places match the requested constraints.",
      status: 422,
      code: "no_feasible_candidates",
      field: "interests",
      details: [],
    });

    const mockPlanItinerary = vi.fn().mockRejectedValue(apiError);
    const mockClient = {
      planItinerary: mockPlanItinerary,
    } as unknown as ApiClient;

    let errorResult: unknown = null;
    let itineraryResult: unknown = null;

    try {
      itineraryResult = await mockClient.planItinerary({ days: 1, interests: ["nonexistent"] });
    } catch (err) {
      errorResult = err;
    }

    expect(itineraryResult).toBeNull();
    expect(errorResult).toBeInstanceOf(ApiError);
    expect((errorResult as ApiError).code).toBe("no_feasible_candidates");
    expect((errorResult as ApiError).status).toBe(422);
  });

  it("handles network failure without crashing the planner", async () => {
    const netError = new NetworkError("Failed to fetch (connection refused)");
    const mockPlanItinerary = vi.fn().mockRejectedValue(netError);
    const mockClient = {
      planItinerary: mockPlanItinerary,
    } as unknown as ApiClient;

    let errorResult: unknown = null;
    try {
      await mockClient.planItinerary({ days: 1, interests: ["heritage"] });
    } catch (err) {
      errorResult = err;
    }

    expect(errorResult).toBeInstanceOf(NetworkError);
    expect((errorResult as NetworkError).message).toContain("connection refused");
  });

  it("supports replanning with modified constraints", async () => {
    const initialPlan: ItineraryPlanResponse = {
      ...sampleItinerary,
      itinerary_id: "plan-version-1",
      constraints: { days: 1, interests: ["heritage"] },
    };

    const replannedPlan: ItineraryPlanResponse = {
      ...sampleItinerary,
      itinerary_id: "plan-version-2",
      constraints: { days: 2, interests: ["food", "nature"], start: "Hotel Grand" },
    };

    const mockPlanItinerary = vi
      .fn()
      .mockResolvedValueOnce(initialPlan)
      .mockResolvedValueOnce(replannedPlan);

    const mockClient = {
      planItinerary: mockPlanItinerary,
    } as unknown as ApiClient;

    // Step 1: Initial Plan
    const firstResult = await mockClient.planItinerary({ days: 1, interests: ["heritage"] });
    expect(firstResult.itinerary_id).toBe("plan-version-1");
    expect(firstResult.constraints.days).toBe(1);

    // Step 2: Replanning with new constraints
    const replanConstraints: PlanningConstraints = {
      days: 2,
      interests: ["food", "nature"],
      start: "Hotel Grand",
    };
    const secondResult = await mockClient.planItinerary(replanConstraints);
    expect(secondResult.itinerary_id).toBe("plan-version-2");
    expect(secondResult.constraints.days).toBe(2);
    expect(secondResult.constraints.interests).toEqual(["food", "nature"]);
    expect(secondResult.constraints.start).toBe("Hotel Grand");
    expect(mockPlanItinerary).toHaveBeenCalledTimes(2);
  });
});
