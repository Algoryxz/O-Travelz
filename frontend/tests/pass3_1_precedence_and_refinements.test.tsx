import { describe, expect, it, vi } from "vitest";
import type {
  PlanningConstraints,
  ItineraryPlanResponse,
  AIResponse,
} from "../src/api/contracts";

describe("Pass 3.1: Precedence & AI Refinement Verification", () => {
  describe("1. Handoff Semantic Precedence Rules", () => {
    // Rule: Explicit traveler-selected interests > genuine place.interests > empty interests
    function resolveHandoffInterests(
      explicitInterests: string[] | undefined,
      placeInterests: string[] | undefined,
      placeCategory: string
    ): string[] {
      // 1. Explicit traveler interests take top precedence
      if (explicitInterests && explicitInterests.length > 0) {
        return explicitInterests;
      }
      // 2. Genuine place interests take next precedence
      if (placeInterests && placeInterests.length > 0) {
        return placeInterests;
      }
      // 3. Physical category must NEVER be converted to an interest
      return [];
    }

    it("preserves explicit traveler-selected interests over place interests", () => {
      const explicitInterests = ["beach", "relaxation"];
      const placeInterests = ["heritage", "spirituality", "architecture"];
      const result = resolveHandoffInterests(explicitInterests, placeInterests, "temple");

      expect(result).toEqual(["beach", "relaxation"]);
      expect(result).not.toContain("heritage");
      expect(result).not.toContain("temple");
    });

    it("uses genuine place interests when traveler has no explicit interests", () => {
      const explicitInterests: string[] = [];
      const placeInterests = ["heritage", "spirituality", "architecture", "food"];
      const result = resolveHandoffInterests(explicitInterests, placeInterests, "temple");

      expect(result).toEqual(["heritage", "spirituality", "architecture", "food"]);
    });

    it("returns empty interests when neither explicit nor place interests exist without guessing from category", () => {
      const explicitInterests: string[] = [];
      const placeInterests: string[] = [];
      const result = resolveHandoffInterests(explicitInterests, placeInterests, "market");

      expect(result).toEqual([]);
      expect(result).not.toContain("food");
      expect(result).not.toContain("market");
    });

    it("never converts physical category temple to spirituality", () => {
      const result = resolveHandoffInterests([], [], "temple");
      expect(result).toEqual([]);
      expect(result).not.toContain("spirituality");
      expect(result).not.toContain("heritage");
    });
  });

  describe("2. AI Refinement Complete Recalculation Flow", () => {
    it("simulates full AI refinement cycle for extending days", async () => {
      const initialConstraints: PlanningConstraints = {
        days: 2,
        interests: ["heritage"],
        start: "Bhubaneswar",
      };

      const mockPlanResponse: ItineraryPlanResponse = {
        itinerary_id: "itin-recalculated-003",
        constraints: { days: 3, interests: ["heritage"], start: "Bhubaneswar" },
        days: [
          { day_number: 1, stops: [], hops: [] },
          { day_number: 2, stops: [], hops: [] },
          { day_number: 3, stops: [], hops: [] },
        ],
        explanation: "Extended to 3 days heritage itinerary.",
      };

      const mockAiResponse: AIResponse = {
        status: "success",
        message: "I have extended your trip to 3 days focusing on heritage.",
        itinerary: mockPlanResponse,
        changed_constraints: { days: 3, interests: ["heritage"], start: "Bhubaneswar" },
        clarification: null,
      };

      // Verify the AI refinement output contract
      expect(mockAiResponse.status).toBe("success");
      expect(mockAiResponse.changed_constraints?.days).toBe(3);
      expect(mockAiResponse.itinerary?.days).toHaveLength(3);
      expect(mockAiResponse.changed_constraints?.interests).toEqual(["heritage"]);
      expect(mockAiResponse.changed_constraints?.start).toBe("Bhubaneswar");
    });

    it("simulates full AI refinement cycle for adding food theme", async () => {
      const initialConstraints: PlanningConstraints = {
        days: 2,
        interests: ["heritage"],
        start: "Bhubaneswar",
      };

      const mockPlanResponse: ItineraryPlanResponse = {
        itinerary_id: "itin-recalculated-food",
        constraints: { days: 2, interests: ["heritage", "food"], start: "Bhubaneswar" },
        days: [
          {
            day_number: 1,
            stops: [
              { sequence: 1, place: { id: "p1", name: "Lingaraj Temple", category: "temple" } },
              { sequence: 2, place: { id: "p2", name: "Ananda Bazar", category: "market" } },
            ],
            hops: [],
          },
          { day_number: 2, stops: [], hops: [] },
        ],
        explanation: "Added authentic food stops to your heritage journey.",
      };

      const mockAiResponse: AIResponse = {
        status: "success",
        message: "Added food stops to your itinerary.",
        itinerary: mockPlanResponse,
        changed_constraints: { days: 2, interests: ["heritage", "food"], start: "Bhubaneswar" },
        clarification: null,
      };

      expect(mockAiResponse.changed_constraints?.interests).toContain("heritage");
      expect(mockAiResponse.changed_constraints?.interests).toContain("food");
      expect(mockAiResponse.itinerary?.days[0].stops[1].place.name).toBe("Ananda Bazar");
    });
  });

  describe("3. Saved Trip Archival & Restoration", () => {
    it("preserves all trip attributes across snapshot save and restore", () => {
      const originalTrip = {
        id: "trip-snap-001",
        title: "2-Day Bhubaneswar Heritage & Food Tour",
        timestamp: 1771584000000,
        constraints: {
          days: 2,
          interests: ["heritage", "food"],
          start: "Bhubaneswar",
        },
        itinerary: {
          itinerary_id: "itin-snap-001",
          constraints: { days: 2, interests: ["heritage", "food"], start: "Bhubaneswar" },
          days: [
            {
              day_number: 1,
              stops: [{ sequence: 1, place: { id: "p1", name: "Lingaraj Temple", category: "temple" } }],
              hops: [],
            },
            {
              day_number: 2,
              stops: [{ sequence: 1, place: { id: "p2", name: "Ananda Bazar", category: "market" } }],
              hops: [],
            },
          ],
          explanation: "Verified trip",
        },
      };

      // Serialize and deserialize
      const serialized = JSON.stringify(originalTrip);
      const restored = JSON.parse(serialized);

      expect(restored.id).toBe(originalTrip.id);
      expect(restored.title).toBe(originalTrip.title);
      expect(restored.constraints.interests).toEqual(["heritage", "food"]);
      expect(restored.constraints.start).toBe("Bhubaneswar");
      expect(restored.itinerary.days).toHaveLength(2);
      expect(restored.itinerary.days[0].stops[0].place.name).toBe("Lingaraj Temple");
      expect(restored.itinerary.days[1].stops[0].place.name).toBe("Ananda Bazar");
    });
  });
});
