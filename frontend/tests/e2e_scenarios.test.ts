import { describe, it, expect, beforeAll } from "vitest";
import { ApiClient } from "../src/api/client";
import type {
  PlanningConstraints,
  ItineraryPlanResponse,
  MapProjectionHTTPRequest,
} from "../src/types/api";

const BACKEND_URL = "http://127.0.0.1:8000";
const client = new ApiClient({ baseUrl: BACKEND_URL });

let isBackendLive = false;

describe("Full-Stack End-to-End Live Validation Suite", () => {
  beforeAll(async () => {
    // Check backend connectivity
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      if (res.status === 200) {
        const health = await res.json();
        if (health.status === "ok") {
          isBackendLive = true;
        }
      }
    } catch {
      isBackendLive = false;
    }
  });

  // Scenario 1: "Plan a 2-day heritage trip in Bhubaneswar"
  it("Scenario 1: Plan a 2-day heritage trip in Bhubaneswar end-to-end", async (ctx) => {
    if (!isBackendLive) {
      ctx.skip();
      return;
    }
    // 1. Submit structured planning constraints
    const constraints: PlanningConstraints = {
      days: 2,
      start: "Bhubaneswar",
      interests: ["heritage"],
    };

    const plan = await client.planItinerary(constraints);
    expect(plan).toBeDefined();
    expect(plan.itinerary_id).toMatch(/^itinerary-/);
    expect(plan.days.length).toBe(2);

    // Verify Day 1 & Day 2 structures and places
    const allPlaceNames: string[] = [];
    for (const day of plan.days) {
      expect(day.stops.length).toBeGreaterThanOrEqual(1);
      for (const stop of day.stops) {
        expect(stop.place.id).toBeDefined();
        expect(stop.place.name).toBeTruthy();
        expect(stop.place.category).toBeTruthy();
        allPlaceNames.push(stop.place.name);
      }

      // Verify transport hops and data tiers
      for (const hop of day.hops) {
        expect(hop.mode).toBeTruthy();
        expect(["static", "scheduled", "live", "unavailable"]).toContain(
          hop.data_tier
        );
        expect(hop.legs.length).toBeGreaterThanOrEqual(1);
      }
    }

    // Verify places are canonical heritage places
    expect(allPlaceNames.some((n) => n.includes("Bindu Sagar") || n.includes("Dhauli") || n.includes("Barabati"))).toBe(true);

    // 2. Fetch Map Projection from backend
    const featureRequests = plan.days
      .flatMap((d) => d.stops)
      .map((s) => ({ entity: "place" as const, id: s.place.id }));

    const hopContexts = plan.days.flatMap((d) =>
      d.hops.map((hop) => ({ day_number: d.day_number, hop }))
    );

    const projection = await client.getMapProjection({
      requested_features: featureRequests,
      requested_hops: hopContexts,
    });

    expect(projection).toBeDefined();
    expect(projection.features.length).toBeGreaterThanOrEqual(1);
    for (const feat of projection.features) {
      expect(feat.canonical_ref.id).toBeTruthy();
      expect(feat.geometry_status).toBe("available");
      expect(feat.geometry?.type).toBe("Point");
    }

    // 3. AI Refinement: Add beach to trip
    const aiRes = await client.planWithAi({
      message: "Add beach and coastal relaxation to my trip",
      constraints: plan.constraints,
    });

    expect(aiRes).toBeDefined();
    expect(["success", "clarification"]).toContain(aiRes.status);
    if (aiRes.changed_constraints) {
      expect(aiRes.changed_constraints.interests).toContain("beach");
      const replan = await client.planItinerary(aiRes.changed_constraints);
      expect(replan.days.length).toBe(2);
      const replanNames = replan.days.flatMap((d) => d.stops.map((s) => s.place.name));
      expect(replanNames.some((n) => n.includes("Beach") || n.includes("Sea"))).toBe(true);
    }
  }, 25000);

  // Scenario 2: "Plan a 2-day architecture and heritage trip in Bhubaneswar"
  it("Scenario 2: Plan a 2-day architecture and heritage trip in Bhubaneswar", async (ctx) => {
    if (!isBackendLive) {
      ctx.skip();
      return;
    }
    const constraints: PlanningConstraints = {
      days: 2,
      start: "Bhubaneswar",
      interests: ["architecture", "heritage"],
    };

    const plan = await client.planItinerary(constraints);
    expect(plan.days.length).toBe(2);
    const placeCategories = plan.days.flatMap((d) => d.stops.map((s) => s.place.category.toLowerCase()));
    expect(placeCategories.some((c) => c.includes("temple") || c.includes("monument") || c.includes("heritage"))).toBe(true);

    // Verify map projection for scenario 2
    const featureRequests = plan.days
      .flatMap((d) => d.stops)
      .map((s) => ({ entity: "place" as const, id: s.place.id }));

    const projection = await client.getMapProjection({
      requested_features: featureRequests,
      requested_hops: [],
    });
    expect(projection.features.length).toBe(featureRequests.length);
  });

  // Scenario 3: Non-canonical interest safety
  it("Scenario 3: Non-canonical interest safety", async (ctx) => {
    if (!isBackendLive) {
      ctx.skip();
      return;
    }
    const aiRes = await client.planWithAi({
      message: "Plan a photography trip",
      constraints: null,
    });

    expect(aiRes).toBeDefined();
    // Non-canonical 'photography' should either trigger clarification or map to valid canonical interests
    if (aiRes.changed_constraints?.interests) {
      for (const interest of aiRes.changed_constraints.interests) {
        expect(["nature", "heritage", "beach", "wildlife", "architecture", "culture"]).toContain(interest);
      }
    }
  });

  // Scenario 4: Live Weather endpoint
  it("Scenario 4: Live Weather endpoint verification", async (ctx) => {
    if (!isBackendLive) {
      ctx.skip();
      return;
    }
    const weather = await client.getWeather("Bhubaneswar");
    expect(weather).toBeDefined();
    expect(weather.location_name.toLowerCase()).toContain("bhubaneswar");
    expect(weather.current.provider).toBeTruthy();
    expect(typeof weather.current.temperature_c === "number" || weather.current.temperature_c === null).toBe(true);
  }, 15000);

  // Scenario 5: Database Place Lookups (UUID and research_id)
  it("Scenario 5: Place lookup integrity (UUID and research_id)", async (ctx) => {
    if (!isBackendLive) {
      ctx.skip();
      return;
    }
    const places = await client.listPlaces();
    expect(places.length).toBeGreaterThanOrEqual(81);

    // Look up by UUID
    const firstPlace = places[0];
    const placeByUuid = await client.getPlace(firstPlace.id);
    expect(placeByUuid.name).toBe(firstPlace.name);

    // Look up by research_id
    const placeByResearchId = await client.getPlace("place_puri_001");
    expect(placeByResearchId.name).toContain("Jagannath");

    // Non-existent place returns 404 ApiError
    await expect(client.getPlace("invalid-non-existent-id")).rejects.toThrow();
  });
});
