import { describe, expect, it } from "vitest";

import type { ItineraryPlanResponse, TransportHop } from "../src/api/contracts";

describe("Phase 0 frontend/backend contract", () => {
  it("represents the shared itinerary response", () => {
    const response: ItineraryPlanResponse = {
      itinerary_id: "fixture-0001",
      constraints: { days: 1, interests: ["temples"], start: "Hotel" },
      days: [],
      explanation: "Grounded explanation.",
    };

    expect(response.constraints.days).toBe(1);
  });

  it("preserves transport data tier and ordered legs", () => {
    const hop: TransportHop = {
      from_sequence: 1,
      to_sequence: 2,
      mode: "walk+bus",
      legs: [
        { mode: "walk", detail: "8 min to bus stop" },
        { mode: "bus", provider: "Mo Bus", route: "5", detail: "3 stops" },
      ],
      data_tier: "static",
    };

    expect(hop.legs.map((leg) => leg.mode)).toEqual(["walk", "bus"]);
    expect(hop.data_tier).toBe("static");
  });
});
