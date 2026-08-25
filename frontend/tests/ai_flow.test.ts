import { describe, expect, it, vi } from "vitest";
import { ApiClient, ApiError, NetworkError } from "../src/api/client";
import type { AIPlanRequest, AIResponse, ItineraryPlanResponse } from "../src/api/contracts";
import sampleItineraryFixture from "./fixtures/sample_itinerary.json";

describe("Phase 6B AI Conversation & Refinement Flow", () => {
  const sampleItinerary = sampleItineraryFixture as unknown as ItineraryPlanResponse;

  it("handles successful initial AI planning request returning an itinerary", async () => {
    const mockAiResponse: AIResponse = {
      message: "Here is your grounded 1-day heritage trip in Bhubaneswar.",
      status: "success",
      itinerary: sampleItinerary,
      clarification: null,
      changed_constraints: null,
    };

    const mockPlanWithAi = vi.fn().mockResolvedValue(mockAiResponse);
    const mockClient = {
      planWithAi: mockPlanWithAi,
    } as unknown as ApiClient;

    const request: AIPlanRequest = {
      message: "Plan a 1 day heritage trip",
      constraints: null,
    };

    const result = await mockClient.planWithAi(request);

    expect(result.status).toBe("success");
    expect(result.message).toContain("grounded 1-day heritage trip");
    expect(result.itinerary).toEqual(sampleItinerary);
    expect(mockPlanWithAi).toHaveBeenCalledWith(request);
  });

  it("handles AI clarification response without fabricating an itinerary", async () => {
    const mockClarificationResponse: AIResponse = {
      message: "Could you please specify which dates you would like to visit?",
      status: "clarification",
      itinerary: null,
      clarification: {
        question: "Which dates are you planning for?",
        reason: "dates_unspecified",
      },
      changed_constraints: null,
    };

    const mockPlanWithAi = vi.fn().mockResolvedValue(mockClarificationResponse);
    const mockClient = {
      planWithAi: mockPlanWithAi,
    } as unknown as ApiClient;

    const result = await mockClient.planWithAi({ message: "Plan a trip for next week" });

    expect(result.status).toBe("clarification");
    expect(result.itinerary).toBeNull();
    expect(result.clarification?.question).toBe("Which dates are you planning for?");
  });

  it("handles structured 422 API error without generating fake fallback data", async () => {
    const apiError = new ApiError({
      message: "Invalid request payload",
      status: 422,
      code: "validation_error",
      field: "message",
      details: [{ field: "message", message: "Message cannot be empty" }],
    });

    const mockPlanWithAi = vi.fn().mockRejectedValue(apiError);
    const mockClient = {
      planWithAi: mockPlanWithAi,
    } as unknown as ApiClient;

    let caughtError: unknown = null;
    let result: unknown = null;

    try {
      result = await mockClient.planWithAi({ message: "" });
    } catch (err) {
      caughtError = err;
    }

    expect(result).toBeNull();
    expect(caughtError).toBeInstanceOf(ApiError);
    expect((caughtError as ApiError).code).toBe("validation_error");
    expect((caughtError as ApiError).status).toBe(422);
  });

  it("handles network failure gracefully", async () => {
    const netError = new NetworkError("Connection refused by backend");
    const mockPlanWithAi = vi.fn().mockRejectedValue(netError);
    const mockClient = {
      planWithAi: mockPlanWithAi,
    } as unknown as ApiClient;

    let caughtError: unknown = null;
    try {
      await mockClient.planWithAi({ message: "Plan a trip" });
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeInstanceOf(NetworkError);
    expect((caughtError as NetworkError).message).toContain("Connection refused");
  });

  it("supports conversational refinement replacing the existing itinerary with new grounded output", async () => {
    const refinedItinerary: ItineraryPlanResponse = {
      ...sampleItinerary,
      itinerary_id: "refined-itin-002",
      constraints: { days: 2, interests: ["food"] },
      days: [
        {
          day_number: 1,
          stops: [{ sequence: 1, place: { id: "food-1", name: "Surbhi", category: "food" } }],
          hops: [],
        },
        {
          day_number: 2,
          stops: [{ sequence: 1, place: { id: "food-2", name: "Bikalananda", category: "food" } }],
          hops: [],
        },
      ],
      explanation: "Refined 2-day food itinerary.",
    };

    const mockRefinementResponse: AIResponse = {
      message: "Here is your updated 2-day food-focused itinerary.",
      status: "success",
      itinerary: refinedItinerary,
      changed_constraints: { days: 2, interests: ["food"] },
    };

    const mockPlanWithAi = vi.fn().mockResolvedValue(mockRefinementResponse);
    const mockClient = {
      planWithAi: mockPlanWithAi,
    } as unknown as ApiClient;

    const request: AIPlanRequest = {
      message: "Make it a 2-day food focused plan",
      constraints: { days: 1, interests: ["heritage"] },
    };

    const result = await mockClient.planWithAi(request);

    expect(result.status).toBe("success");
    expect(result.changed_constraints?.interests).toEqual(["food"]);
    expect(result.changed_constraints?.days).toBe(2);
    expect(result.itinerary?.itinerary_id).toBe("refined-itin-002");
    expect(result.itinerary?.days.length).toBe(2);
    expect(mockPlanWithAi).toHaveBeenCalledWith(request);
  });

  it("handles unsupported preferences without mutating or fabricating an itinerary", async () => {
    const mockUnsupportedResponse: AIResponse = {
      message: "Walking distance optimization is not currently supported.",
      status: "unsupported",
      itinerary: null,
      clarification: null,
      changed_constraints: null,
    };

    const mockPlanWithAi = vi.fn().mockResolvedValue(mockUnsupportedResponse);
    const mockClient = {
      planWithAi: mockPlanWithAi,
    } as unknown as ApiClient;

    const result = await mockClient.planWithAi({
      message: "Make it involve less walking",
      constraints: { days: 1, interests: ["heritage"] },
    });

    expect(result.status).toBe("unsupported");
    expect(result.itinerary).toBeNull();
    expect(result.message).toContain("Walking distance optimization is not currently supported");
  });
});
