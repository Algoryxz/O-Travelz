import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ApiError, NetworkError, UnexpectedResponseError } from "../src/api/client";
import type {
  ItineraryPlanResponse,
  ItineraryStop,
  TransportHop,
} from "../src/api/contracts";
import { ConstraintForm } from "../src/components/itinerary/ConstraintForm";
import { ErrorAlert } from "../src/components/itinerary/ErrorAlert";
import { InitialState } from "../src/components/itinerary/InitialState";
import { ItineraryDaySection } from "../src/components/itinerary/ItineraryDaySection";
import { ItineraryStopCard } from "../src/components/itinerary/ItineraryStopCard";
import { ItineraryView } from "../src/components/itinerary/ItineraryView";
import { LoadingState } from "../src/components/itinerary/LoadingState";
import { DataTierBadge } from "../src/components/transport/DataTierBadge";
import { TransportHopCard } from "../src/components/transport/TransportHopCard";
import { ItineraryPlannerPage } from "../src/pages/ItineraryPlannerPage";
import sampleItineraryFixture from "./fixtures/sample_itinerary.json";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Phase 6B Itinerary UI Components", () => {
  describe("Initial & Loading States", () => {
    it("renders initial empty state with consumer guidance", () => {
      const html = renderClean(<InitialState />);
      expect(html).toContain("Where will Odisha take you?");
      expect(html).toContain("Tell us how long you&#x27;re travelling and what you&#x27;re in the mood for");
      expect(html).toContain("Curated Destinations");
      expect(html).toContain("Local Transit Connections");
      expect(html).toContain("Realistic Day Schedules");
    });

    it("renders loading state with progress indicator", () => {
      const html = renderClean(<LoadingState />);
      expect(html).toContain("Planning Your Journey...");
      expect(html).toContain("Finding the best places and connecting realistic travel routes");
    });
  });

  describe("ConstraintForm Component", () => {
    it("renders initial form controls with optional interests", () => {
      const html = renderClean(
        <ConstraintForm
          initialConstraints={{ days: 2, interests: ["heritage", "spirituality"] }}
          isLoading={false}
          onSubmit={() => {}}
        />
      );

      expect(html).toContain('value="2"');
      expect(html).toContain("Trip Constraints");
      expect(html).toContain("Plan Itinerary");
      expect(html).toContain("Interests / Themes");
    });

    it("renders all 12 canonical interest chips with human-friendly labels and exact test-ids", () => {
      const html = renderClean(
        <ConstraintForm
          isLoading={false}
          onSubmit={() => {}}
        />
      );

      const expectedInterests = [
        { id: "heritage", label: "Heritage" },
        { id: "spirituality", label: "Spirituality" },
        { id: "architecture", label: "Architecture" },
        { id: "food", label: "Food &amp; Cuisine" },
        { id: "culture", label: "Culture" },
        { id: "nature", label: "Nature" },
        { id: "beach", label: "Beaches" },
        { id: "wildlife", label: "Wildlife" },
        { id: "waterfall", label: "Waterfalls" },
        { id: "relaxation", label: "Relaxation" },
        { id: "adventure", label: "Adventure" },
        { id: "shopping", label: "Shopping" },
      ];

      for (const item of expectedInterests) {
        expect(html).toContain(`data-testid="interest-chip-${item.id}"`);
        expect(html).toContain(item.label);
      }
    });

    it("does not render unsupported interest chips like photography, family, or physical category temple", () => {
      const html = renderClean(
        <ConstraintForm
          isLoading={false}
          onSubmit={() => {}}
        />
      );

      expect(html).not.toContain('data-testid="interest-chip-photography"');
      expect(html).not.toContain('data-testid="interest-chip-family"');
      expect(html).not.toContain('data-testid="interest-chip-temple"');
      expect(html).not.toContain('data-testid="interest-chip-monument"');
    });

    it("renders all 7 quick origin hub pills with exact test-ids", () => {
      const html = renderClean(
        <ConstraintForm
          isLoading={false}
          onSubmit={() => {}}
        />
      );

      const expectedHubs = [
        "bhubaneswar",
        "puri",
        "konark",
        "cuttack",
        "daringbadi",
        "sambalpur",
        "koraput",
      ];

      for (const hub of expectedHubs) {
        expect(html).toContain(`data-testid="origin-hub-${hub}"`);
      }
    });

    it("renders form with empty interests as valid and ready to submit (Surprise Me)", () => {
      const html = renderClean(
        <ConstraintForm
          initialConstraints={{ days: 3, interests: [] }}
          isLoading={false}
          onSubmit={() => {}}
        />
      );

      expect(html).toContain("Plan Itinerary (Surprise Me)");
      expect(html).not.toContain("Please select or add at least one interest");
      const submitBtnMatch = html.match(/data-testid="submit-plan-button"[^>]*>/);
      expect(submitBtnMatch?.[0]).not.toContain('disabled=""');
    });

    it("renders replanning state button text when isReplanning is true", () => {
      const html = renderClean(
        <ConstraintForm
          initialConstraints={{ days: 3, interests: ["food"] }}
          isLoading={false}
          isReplanning={true}
          onSubmit={() => {}}
        />
      );

      expect(html).toContain("Modify Constraints &amp; Re-plan");
      expect(html).toContain("Re-plan Itinerary");
    });
  });

  describe("ErrorAlert Component", () => {
    it("renders API / HTTP error state with structured code and message", () => {
      const apiError = new ApiError({
        message: "No places match the requested constraints.",
        status: 422,
        code: "no_feasible_candidates",
        field: "interests",
        details: [{ field: "interests", message: "Unknown category provided" }],
      });

      const html = renderClean(<ErrorAlert error={apiError} />);
      expect(html).toContain("Planning Failed (422)");
      expect(html).toContain("no_feasible_candidates");
      expect(html).toContain("No places match the requested constraints.");
      expect(html).toContain("interests");
      expect(html).toContain("Unknown category provided");
    });

    it("renders network error state with helpful connectivity message", () => {
      const networkError = new NetworkError("Failed to fetch");
      const html = renderClean(<ErrorAlert error={networkError} />);
      expect(html).toContain("Network Connection Error");
      expect(html).toContain("Unable to connect to the O-Travelz backend service");
    });

    it("renders unexpected response error state", () => {
      const unexpError = new UnexpectedResponseError("Invalid structure", 200, {});
      const html = renderClean(<ErrorAlert error={unexpError} />);
      expect(html).toContain("Unexpected Server Response");
    });
  });

  describe("Transport Data-Tier & Hop Components", () => {
    it("renders different data freshness tier badges accurately", () => {
      const liveHtml = renderClean(<DataTierBadge tier="live" />);
      expect(liveHtml).toContain("Live Data");

      const schedHtml = renderClean(<DataTierBadge tier="scheduled" />);
      expect(schedHtml).toContain("Scheduled");

      const staticHtml = renderClean(<DataTierBadge tier="static" />);
      expect(staticHtml).toContain("Static Fact");

      const unknownHtml = renderClean(<DataTierBadge tier="unknown" />);
      expect(unknownHtml).toContain("Unknown Tier");
    });

    it("renders successful multimodal transport hop with legs and estimates", () => {
      const hop: TransportHop = {
        from_sequence: 1,
        to_sequence: 2,
        mode: "walk+bus",
        estimated_minutes: 25,
        estimated_cost: 20,
        legs: [
          { mode: "walk", detail: "5 min to bus stop" },
          { mode: "bus", provider: "Mo Bus", route: "Route 10", detail: "4 stops" },
        ],
        data_tier: "scheduled",
      };

      const html = renderClean(<TransportHopCard hop={hop} />);
      expect(html).toContain("Stop 1 → Stop 2");
      expect(html).toContain("Mode: walk+bus");
      expect(html).toContain("Scheduled");
      expect(html).toContain("25 min");
      expect(html).toContain("₹20");
      expect(html).toContain("(Provider: Mo Bus)");
      expect(html).toContain("(Route: Route 10)");
    });

    it("renders start-origin hop with sequence 0 sentinel", () => {
      const originHop: TransportHop = {
        from_sequence: 0,
        to_sequence: 1,
        mode: "walk",
        estimated_minutes: 10,
        estimated_cost: null,
        legs: [{ mode: "walk", detail: "Walk from hotel" }],
        data_tier: "static",
      };

      const html = renderClean(<TransportHopCard hop={originHop} />);
      expect(html).toContain("Origin Start → Stop 1");
      expect(html).toContain("Walk from hotel");
    });

    it("renders explicit unavailable transport hop and reason without fabricating estimates", () => {
      const unavailableHop: TransportHop = {
        from_sequence: 1,
        to_sequence: 2,
        mode: "unavailable",
        estimated_minutes: null,
        estimated_cost: null,
        legs: [],
        data_tier: "unknown",
        reason: "No supported transport route is available between these locations.",
      };

      const html = renderClean(<TransportHopCard hop={unavailableHop} />);
      expect(html).toContain("Mode: unavailable");
      expect(html).toContain("Unknown Tier");
      expect(html).toContain("Transport Notice:");
      expect(html).toContain("No supported transport route is available between these locations.");
      expect(html).not.toContain("Duration:");
      expect(html).not.toContain("Est. Cost:");
    });
  });

  describe("Itinerary Stop & Day Section Components", () => {
    it("renders stop card with sequence, name, category, and times", () => {
      const stop: ItineraryStop = {
        sequence: 1,
        place: { id: "place-101", name: "Lingaraj Temple", category: "temple" },
        planned_arrival: "09:00",
        planned_departure: "10:30",
      };

      const html = renderClean(<ItineraryStopCard stop={stop} />);
      expect(html).toContain("1");
      expect(html).toContain("Lingaraj Temple");
      expect(html).toContain("temple");
      expect(html).toContain("09:00");
      expect(html).toContain("10:30");
    });

    it("renders day section with interleaved stops and hops", () => {
      const fixture = sampleItineraryFixture as unknown as ItineraryPlanResponse;
      const day = fixture.days[0];

      const html = renderClean(<ItineraryDaySection day={day} />);
      expect(html).toContain("Day 1");
      expect(html).toContain("(2026-09-01)");
      expect(html).toContain("Example Temple");
      expect(html).toContain("Example Market");
      expect(html).toContain("Stop 1 → Stop 2");
      expect(html).toContain("Mo Bus");
    });
  });

  describe("ItineraryView Component", () => {
    it("renders full itinerary view with traveler title, constraints, and copy button", () => {
      const fixture = sampleItineraryFixture as unknown as ItineraryPlanResponse;
      const html = renderClean(<ItineraryView itinerary={fixture} />);

      expect(html).toContain("Verified Odisha Itinerary");
      expect(html).toContain("Copy Itinerary Summary");
      expect(html).toContain("fixture-0001");
      expect(html).toContain("Example Hotel");
      expect(html).toContain("Trip Overview");
      expect(html).toContain("Fixture explanation text for frontend dev");
    });

    it("does not render explanation box when explanation is empty string", () => {
      const fixture: ItineraryPlanResponse = {
        itinerary_id: "deterministic-plan-1",
        constraints: { days: 1, interests: ["heritage"] },
        days: [
          {
            day_number: 1,
            stops: [{ sequence: 1, place: { id: "p1", name: "Place 1", category: "heritage" } }],
            hops: [],
          },
        ],
        explanation: "",
      };

      const html = renderClean(<ItineraryView itinerary={fixture} />);
      expect(html).not.toContain("Trip Overview");
    });
  });

  describe("ItineraryPlannerPage Component Integration", () => {
    it("renders initial full page with title and initial empty state", () => {
      const html = renderClean(<ItineraryPlannerPage initialTab="plan" />);
      expect(html).toContain("Deterministic Travel Engine");
      expect(html).toContain("Odisha Itinerary Workspace");
      expect(html).toContain("Where will Odisha take you?");
    });
  });
});
