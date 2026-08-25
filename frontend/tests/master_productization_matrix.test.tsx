import React from "react";
import { describe, expect, it, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";
import { PhotoGallery } from "../src/components/gallery/PhotoGallery";
import { PlaceDetailsModal } from "../src/components/place/PlaceDetailsModal";
import { DestinationsPage } from "../src/components/home/DestinationsPage";
import { ItineraryView } from "../src/components/itinerary/ItineraryView";
import { AIConversationPanel } from "../src/components/ai/AIConversationPanel";
import { MapCanvas } from "../src/components/map/MapCanvas";
import { MapView } from "../src/components/map/MapView";
import { getPlaceGallery, getPlaceImageUrl, getPlaceRegion } from "../src/utils/imageService";
import type { ItineraryPlanResponse, MapFeature } from "../src/api/contracts";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

// In-memory mock localStorage
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k of Object.keys(mockStorage)) {
      delete mockStorage[k];
    }
  },
};
if (typeof global !== "undefined") {
  (global as any).localStorage = localStorageMock;
}

describe("Master Whole-Odisha Productization & Judge Matrix Tests", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("verifies multi-image PhotoGallery renders image counter, attribution info, and navigation controls", () => {
    const gallery = getPlaceGallery("Konark Sun Temple", "monument");
    expect(gallery.length).toBeGreaterThanOrEqual(2);

    const html = renderClean(
      <PhotoGallery images={gallery} placeName="Konark Sun Temple" />
    );

    expect(html).toContain("destination-photo-gallery");
    expect(html).toContain("gallery-image-counter");
    expect(html).toContain(`1 / ${gallery.length}`);
    expect(html).toContain("gallery-prev-button");
    expect(html).toContain("gallery-next-button");
    expect(html).toContain("gallery-thumb-0");
  });

  it("verifies Whole-Odisha regional sampling across Coastal, Central, Southern, Western, Northern regions", () => {
    const sampleDestinations = [
      { name: "Puri Golden Beach", region: "Puri & Coastal" },
      { name: "Konark Sun Temple", region: "Konark & Marine" },
      { name: "Barabati Fort", region: "Cuttack & Mahanadi" },
      { name: "Daringbadi Hill Station", region: "Kandhamal & Southern Hills" },
      { name: "Hirakud Dam & Reservoir", region: "Sambalpur & Western Odisha" },
      { name: "Similipal National Park", region: "Northern Odisha & Wildlife" },
      { name: "Deomali Peak, Koraput", region: "Koraput & Tribal Highlands" },
      { name: "Gupteswar Cave Temple, Koraput", region: "Koraput & Tribal Highlands" },
      { name: "Duduma Waterfall", region: "Koraput & Tribal Highlands" },
    ];

    for (const dest of sampleDestinations) {
      expect(getPlaceRegion(dest.name)).toBe(dest.region);
      const gallery = getPlaceGallery(dest.name);
      expect(gallery.length).toBeGreaterThan(0);
      expect(gallery[0].url).toBeTruthy();
      expect(gallery[0].source).toBeDefined();
      expect(gallery[0].license).toBeDefined();
    }
  });

  it("verifies Itinerary visual timeline renders hop metrics, stop cards, and direction arrows", () => {
    const sampleItinerary: ItineraryPlanResponse = {
      itinerary_id: "plan-test-whole-odisha-001",
      constraints: {
        days: 2,
        interests: ["nature", "heritage"],
        start: "Bhubaneswar",
      },
      explanation: "",
      days: [
        {
          day_number: 1,
          date: "2026-10-15",
          stops: [
            {
              sequence: 1,
              place: { id: "p1", name: "Dhauli Shanti Stupa", category: "monument" },
              planned_arrival: "09:00",
              planned_departure: "10:30",
            },
            {
              sequence: 2,
              place: { id: "p2", name: "Udayagiri and Khandagiri Caves", category: "monument" },
              planned_arrival: "11:30",
              planned_departure: "13:30",
            },
          ],
          hops: [
            {
              from_sequence: 0,
              to_sequence: 1,
              mode: "drive",
              estimated_minutes: 18,
              estimated_cost: 150,
              data_tier: "scheduled",
              reason: null,
              legs: [],
            },
            {
              from_sequence: 1,
              to_sequence: 2,
              mode: "drive",
              estimated_minutes: 25,
              estimated_cost: 200,
              data_tier: "scheduled",
              reason: null,
              legs: [],
            },
          ],
        },
      ],
    };

    const html = renderClean(<ItineraryView itinerary={sampleItinerary} />);

    expect(html).toContain("itinerary-view");
    expect(html).toContain("Origin Start → Stop 1");
    expect(html).toContain("Stop 1 → Stop 2");
    expect(html).toContain("18 min");
    expect(html).toContain("25 min");
    expect(html).toContain("Dhauli Shanti Stupa");
    expect(html).toContain("Udayagiri and Khandagiri Caves");
  });

  it("verifies AI Conversation Panel renders multi-turn chat history without repeating whole workspace", () => {
    const history = [
      { role: "user" as const, message: "Make it more food focused" },
      {
        role: "assistant" as const,
        message: "Done — I adjusted the itinerary to prioritize food and culinary heritage.",
        response: {
          message: "Done — I adjusted the itinerary to prioritize food and culinary heritage.",
          status: "success",
          itinerary: null,
          clarification: null,
          changed_constraints: { interests: ["food", "heritage"] },
        },
      },
      { role: "user" as const, message: "Add temples" },
      {
        role: "assistant" as const,
        message: "Done — I added temple stops across the plan.",
        response: {
          message: "Done — I added temple stops across the plan.",
          status: "success",
          itinerary: null,
          clarification: null,
          changed_constraints: { interests: ["food", "heritage", "temple"] },
        },
      },
    ];

    const html = renderClean(
      <AIConversationPanel
        hasItinerary={true}
        isLoading={false}
        error={null}
        aiResponse={null}
        history={history}
        onSend={() => {}}
      />
    );

    expect(html).toContain("ai-chat-history");
    expect(html).toContain("Make it more food focused");
    expect(html).toContain("Done — I adjusted the itinerary to prioritize food and culinary heritage.");
    expect(html).toContain("Add temples");
    expect(html).toContain("Done — I added temple stops across the plan.");
  });

  it("verifies AI Clarification Box renders when unresolvable starting location is queried", () => {
    const clarificationResponse = {
      message: "I need clarification on your starting location.",
      status: "clarification",
      itinerary: null,
      clarification: {
        question: "Which verified hotel or Odisha location would you like to start from?",
        reason: "The requested starting location could not be resolved to a verified place in our database.",
      },
      changed_constraints: null,
    };

    const html = renderClean(
      <AIConversationPanel
        hasItinerary={false}
        isLoading={false}
        error={null}
        aiResponse={clarificationResponse}
        history={[]}
        onSend={() => {}}
      />
    );

    expect(html).toContain("ai-clarification-box");
    expect(html).toContain("Which verified hotel or Odisha location would you like to start from?");
  });

  it("verifies Leaflet Map Canvas renders real geographic container and features", () => {
    const sampleFeatures: MapFeature[] = [
      {
        feature_type: "place",
        canonical_ref: { entity: "place", id: "p_daringbadi" },
        geometry_status: "available",
        geometry: { type: "Point", coordinates: [84.1305, 19.9111] },
        unavailable_reason: null,
      },
      {
        feature_type: "place",
        canonical_ref: { entity: "place", id: "p_koraput" },
        geometry_status: "available",
        geometry: { type: "Point", coordinates: [82.7167, 18.8167] },
        unavailable_reason: null,
      },
    ];

    const html = renderClean(<MapCanvas features={sampleFeatures} />);

    expect(html).toContain("map-canvas-container");
    expect(html).toContain("leaflet-map-element");
    expect(html).toContain("84.1305°, 19.9111°");
    expect(html).toContain("82.7167°, 18.8167°");
  });
});
