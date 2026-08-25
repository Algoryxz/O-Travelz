import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type {
  ItineraryDay,
  ItineraryPlanResponse,
  ItineraryStop,
  TransportHop,
} from "../src/api/contracts";
import {
  calculateDayTimeline,
  calculateItineraryTotalTransitMinutes,
  formatTimeMinutes,
  formatDurationHoursMins,
  generateTravelerTripTitle,
  generateItineraryPlainTextSummary,
} from "../src/utils/timelineService";
import { ItineraryStopCard } from "../src/components/itinerary/ItineraryStopCard";
import { ItineraryDaySection } from "../src/components/itinerary/ItineraryDaySection";
import { ItineraryView } from "../src/components/itinerary/ItineraryView";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Pass 2: Itinerary Quality & Traveler UX Tests", () => {
  const samplePlacesMap: Record<
    string,
    { avg_visit_minutes?: number | null; interests?: string[] }
  > = {
    "Lingaraj Temple": { avg_visit_minutes: 60, interests: ["heritage", "spirituality", "architecture"] },
    "Mukteswar Temple": { avg_visit_minutes: 45, interests: ["heritage", "spirituality", "architecture"] },
    "Pahala Rasagola Sweet Hub": { avg_visit_minutes: 30, interests: ["food", "culture"] },
    "Null Visit Place": { avg_visit_minutes: null, interests: ["nature"] },
  };

  const mockGetPlace = (name: string) => samplePlacesMap[name];

  describe("1. Cumulative Transit-Aware Timeline", () => {
    it("starts stop 1 at 09:00 when no origin hop is provided", () => {
      const day: ItineraryDay = {
        day_number: 1,
        stops: [
          { sequence: 1, place: { id: "p1", name: "Lingaraj Temple", category: "temple" } },
        ],
        hops: [],
      };

      const timeline = calculateDayTimeline(day, mockGetPlace);
      const stop1 = timeline.get(1);

      expect(stop1?.arrivalFormatted).toBe("09:00");
      expect(stop1?.visitMinutes).toBe(60);
      expect(stop1?.departureFormatted).toBe("10:00");
    });

    it("second stop incorporates first stop visit duration and hop transit duration", () => {
      const day: ItineraryDay = {
        day_number: 1,
        stops: [
          { sequence: 1, place: { id: "p1", name: "Lingaraj Temple", category: "temple" } },
          { sequence: 2, place: { id: "p2", name: "Mukteswar Temple", category: "temple" } },
        ],
        hops: [
          {
            from_sequence: 1,
            to_sequence: 2,
            mode: "walk",
            estimated_minutes: 15,
            legs: [],
            data_tier: "scheduled",
          },
        ],
      };

      const timeline = calculateDayTimeline(day, mockGetPlace);
      const stop1 = timeline.get(1);
      const stop2 = timeline.get(2);

      // Stop 1: 09:00 arrival + 60m visit = 10:00 departure
      expect(stop1?.arrivalFormatted).toBe("09:00");
      expect(stop1?.departureFormatted).toBe("10:00");

      // Stop 2: 10:00 dep + 15m transit = 10:15 arrival. 45m visit = 11:00 departure
      expect(stop2?.arrivalFormatted).toBe("10:15");
      expect(stop2?.visitMinutes).toBe(45);
      expect(stop2?.departureFormatted).toBe("11:00");
    });

    it("third stop accumulates all previous visit and transit durations", () => {
      const day: ItineraryDay = {
        day_number: 1,
        stops: [
          { sequence: 1, place: { id: "p1", name: "Lingaraj Temple", category: "temple" } },
          { sequence: 2, place: { id: "p2", name: "Mukteswar Temple", category: "temple" } },
          { sequence: 3, place: { id: "p3", name: "Pahala Rasagola Sweet Hub", category: "market" } },
        ],
        hops: [
          {
            from_sequence: 1,
            to_sequence: 2,
            mode: "walk",
            estimated_minutes: 15,
            legs: [],
            data_tier: "scheduled",
          },
          {
            from_sequence: 2,
            to_sequence: 3,
            mode: "bus",
            estimated_minutes: 40,
            legs: [],
            data_tier: "scheduled",
          },
        ],
      };

      const timeline = calculateDayTimeline(day, mockGetPlace);
      const stop3 = timeline.get(3);

      // Stop 2 departure was 11:00 + 40m bus transit = 11:40 arrival
      expect(stop3?.arrivalFormatted).toBe("11:40");
      expect(stop3?.visitMinutes).toBe(30);
      expect(stop3?.departureFormatted).toBe("12:10");
    });

    it("null avg_visit_minutes defaults safely to 60 minutes convention", () => {
      const day: ItineraryDay = {
        day_number: 1,
        stops: [
          { sequence: 1, place: { id: "p1", name: "Null Visit Place", category: "nature" } },
          { sequence: 2, place: { id: "p2", name: "Lingaraj Temple", category: "temple" } },
        ],
        hops: [
          {
            from_sequence: 1,
            to_sequence: 2,
            mode: "car",
            estimated_minutes: 20,
            legs: [],
            data_tier: "scheduled",
          },
        ],
      };

      const timeline = calculateDayTimeline(day, mockGetPlace);
      const stop1 = timeline.get(1);
      const stop2 = timeline.get(2);

      expect(stop1?.visitMinutes).toBe(60);
      expect(stop1?.departureFormatted).toBe("10:00");
      expect(stop2?.arrivalFormatted).toBe("10:20");
    });

    it("null transport duration does not invent travel time and signals unknown transit", () => {
      const day: ItineraryDay = {
        day_number: 1,
        stops: [
          { sequence: 1, place: { id: "p1", name: "Lingaraj Temple", category: "temple" } },
          { sequence: 2, place: { id: "p2", name: "Mukteswar Temple", category: "temple" } },
        ],
        hops: [
          {
            from_sequence: 1,
            to_sequence: 2,
            mode: "unavailable",
            estimated_minutes: null,
            legs: [],
            data_tier: "unknown",
            reason: "No route",
          },
        ],
      };

      const timeline = calculateDayTimeline(day, mockGetPlace);
      const stop2 = timeline.get(2);

      expect(stop2?.isTransitUnknown).toBe(true);
      expect(stop2?.arrivalFormatted).toBe("--:--");
    });

    it("identical itinerary input produces strictly identical deterministic times", () => {
      const day: ItineraryDay = {
        day_number: 1,
        stops: [
          { sequence: 1, place: { id: "p1", name: "Lingaraj Temple", category: "temple" } },
          { sequence: 2, place: { id: "p2", name: "Mukteswar Temple", category: "temple" } },
        ],
        hops: [
          {
            from_sequence: 1,
            to_sequence: 2,
            mode: "walk",
            estimated_minutes: 25,
            legs: [],
            data_tier: "scheduled",
          },
        ],
      };

      const t1 = calculateDayTimeline(day, mockGetPlace);
      const t2 = calculateDayTimeline(day, mockGetPlace);

      expect(t1.get(1)).toEqual(t2.get(1));
      expect(t1.get(2)).toEqual(t2.get(2));
    });
  });

  describe("2. Thematic Interest Badges on Stop Cards", () => {
    it("renders stop card with physical category and authentic canonical interest badges", () => {
      const stop: ItineraryStop = {
        sequence: 1,
        place: { id: "place-101", name: "Ananta Vasudeva Temple", category: "temple" },
      };

      const html = renderClean(
        <ItineraryStopCard
          stop={stop}
          calculatedArrival="09:00"
          calculatedDeparture="10:00"
          visitMinutes={60}
          requestedInterests={["food", "heritage"]}
        />
      );

      // Physical category
      expect(html).toContain("temple");
      expect(html).toContain("Ananta Vasudeva Temple");

      // Canonical interest badges rendered
      expect(html).toContain("Heritage");
      expect(html).toContain("Spirituality");
      expect(html).toContain("Food");
      expect(html).toContain("Architecture");

      // Times rendered
      expect(html).toContain("09:00");
      expect(html).toContain("Dep: 10:00");
      expect(html).toContain("~60m visit");
    });

    it("keeps physical category completely separate from thematic interest badges", () => {
      const stop: ItineraryStop = {
        sequence: 2,
        place: { id: "place_food_001", name: "Pahala Rasagola Sweet Hub", category: "market" },
      };

      const html = renderClean(
        <ItineraryStopCard
          stop={stop}
          calculatedArrival="10:30"
          calculatedDeparture="11:00"
          visitMinutes={30}
        />
      );

      expect(html).toContain("market");
      expect(html).toContain("Food");
      expect(html).toContain("Culture");
      expect(html).not.toContain("temple");
    });

    it("does not render unsupported interests on stop cards", () => {
      const stop: ItineraryStop = {
        sequence: 1,
        place: { id: "place-101", name: "Lingaraj Temple", category: "temple" },
      };

      const html = renderClean(<ItineraryStopCard stop={stop} />);
      expect(html).not.toContain("Photography");
      expect(html).not.toContain("Family");
    });
  });

  describe("3. Traveler-Focused Itinerary Header", () => {
    const itineraryFixture: ItineraryPlanResponse = {
      itinerary_id: "itinerary-8fa764b912ec4d75",
      constraints: {
        days: 2,
        interests: ["heritage", "food"],
        start: "Bhubaneswar",
      },
      days: [
        {
          day_number: 1,
          date: "2026-09-01",
          stops: [
            { sequence: 1, place: { id: "p1", name: "Lingaraj Temple", category: "temple" } },
            { sequence: 2, place: { id: "p2", name: "Mukteswar Temple", category: "temple" } },
          ],
          hops: [
            {
              from_sequence: 1,
              to_sequence: 2,
              mode: "walk",
              estimated_minutes: 15,
              legs: [],
              data_tier: "scheduled",
            },
          ],
        },
        {
          day_number: 2,
          date: "2026-09-02",
          stops: [
            { sequence: 1, place: { id: "p3", name: "Pahala Rasagola Sweet Hub", category: "market" } },
          ],
          hops: [],
        },
      ],
      explanation: "Verified 2-day heritage and food journey.",
    };

    it("renders traveler summary title and metrics strip", () => {
      const html = renderClean(<ItineraryView itinerary={itineraryFixture} />);

      // Traveler summary title
      expect(html).toContain("Bhubaneswar Heritage &amp; Food Exploration");

      // Metrics strip
      expect(html).toContain("2 Days");
      expect(html).toContain("3 Destinations");
      expect(html).toContain("~15m");
      expect(html).toContain("Bhubaneswar");

      // Technical ID is subverted to small ref badge
      expect(html).toContain("Ref:");
      expect(html).toContain("itinerary-8fa764b912ec4d75");
    });

    it("calculates total transit minutes accurately from transport hops", () => {
      const totalTransit = calculateItineraryTotalTransitMinutes(itineraryFixture);
      expect(totalTransit).toBe(15);
      expect(formatDurationHoursMins(totalTransit)).toBe("15m");
    });
  });

  describe("4. One-Click Copy Itinerary Summary", () => {
    const itineraryFixture: ItineraryPlanResponse = {
      itinerary_id: "itinerary-8fa764b912ec4d75",
      constraints: {
        days: 2,
        interests: ["heritage", "food"],
        start: "Bhubaneswar",
      },
      days: [
        {
          day_number: 1,
          date: "2026-09-01",
          stops: [
            { sequence: 1, place: { id: "p1", name: "Lingaraj Temple", category: "temple" } },
            { sequence: 2, place: { id: "p2", name: "Mukteswar Temple", category: "temple" } },
          ],
          hops: [
            {
              from_sequence: 1,
              to_sequence: 2,
              mode: "walk",
              estimated_minutes: 15,
              legs: [],
              data_tier: "scheduled",
            },
          ],
        },
      ],
      explanation: "",
    };

    it("renders Copy Itinerary Summary button in header", () => {
      const html = renderClean(<ItineraryView itinerary={itineraryFixture} />);
      expect(html).toContain('data-testid="copy-itinerary-button"');
      expect(html).toContain("Copy Itinerary Summary");
    });

    it("generates structured plain-text summary containing days, times, and transit info", () => {
      const plainText = generateItineraryPlainTextSummary(itineraryFixture, mockGetPlace);

      expect(plainText).toContain("O-TRAVELZ TRIP ITINERARY");
      expect(plainText).toContain("BHUBANESWAR HERITAGE & FOOD");
      expect(plainText).toContain("Duration: 1 Day · 2 Destinations");
      expect(plainText).toContain("DAY 1 (2026-09-01)");
      expect(plainText).toContain("09:00 — Lingaraj Temple");
      expect(plainText).toContain("Themes: Heritage · Spirituality · Architecture");
      expect(plainText).toContain("Travel: 15m via walk");
      expect(plainText).toContain("10:15 — Mukteswar Temple");
      expect(plainText).toContain("Generated by O-Travelz (Grounded Verified Odisha Data)");
    });
  });
});
