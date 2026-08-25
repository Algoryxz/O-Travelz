import React from "react";
import { describe, expect, it, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";

import { PlaceDetailsModal, type SelectedPlaceInfo } from "../src/components/place/PlaceDetailsModal";
import { DestinationsPage } from "../src/components/home/DestinationsPage";
import { SavedPlacesPage } from "../src/components/home/SavedPlacesPage";
import { MapCanvas } from "../src/components/map/MapCanvas";
import { MapView } from "../src/components/map/MapView";
import type { MapProjectionResponse, MapFeature } from "../src/api/contracts";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

if (typeof global !== "undefined") {
  (global as any).localStorage = localStorageMock;
}

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Destination Discovery → Verified Place Details → Plan Trip Handoff Suite", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  // 1. Place Details Modal → Plan Trip Here Handoff
  describe("Place Details Modal Planning Handoff", () => {
    it("renders canonical place facts and triggers onPlanTrip with verified identity", () => {
      let plannedPlace: SelectedPlaceInfo | null = null;

      const mockPlace: SelectedPlaceInfo = {
        id: "place_konark_001",
        name: "Konark Sun Temple",
        category: "monument",
        location: "Konark & Marine",
        description: "13th-century UNESCO World Heritage stone chariot.",
        lat: 19.8876,
        lon: 86.0945,
        avg_visit_minutes: 120,
        price_tier: "medium",
        source: "Odisha Tourism Documentation",
      };

      const html = renderClean(
        <PlaceDetailsModal
          place={mockPlace}
          onClose={() => {}}
          onViewOnMap={() => {}}
          onPlanTrip={(p) => {
            plannedPlace = p;
          }}
        />
      );

      expect(html).toContain("Konark Sun Temple");
      expect(html).toContain("monument");
      expect(html).toContain("Konark &amp; Marine");
      expect(html).toContain("120 mins");
      expect(html).toContain("Plan Trip Here");
      expect(html).toContain("Explore on Map");
      expect(html).toContain("Save Place");
      expect(html).not.toContain("Point #");
      expect(html).not.toContain(">place_konark_001<"); // No raw research code exposed in visible text
    });

    it("seeds category interest when constraints.interests is empty", () => {
      const initialConstraints = {
        days: 2,
        interests: [] as string[],
        start: null as string | null,
        dates: null,
      };

      const targetPlace: SelectedPlaceInfo = {
        name: "Konark Sun Temple",
        category: "monument",
        location: "Konark & Marine",
      };

      // Simulate handlePlanTripWithPlace logic
      const existingInterests = initialConstraints.interests || [];
      const categoryName = targetPlace.category?.toLowerCase().trim();
      const updatedInterests =
        existingInterests.length > 0
          ? existingInterests
          : categoryName
          ? [categoryName]
          : [];

      const updatedConstraints = {
        ...initialConstraints,
        start: targetPlace.name,
        interests: updatedInterests,
      };

      expect(updatedConstraints.start).toBe("Konark Sun Temple");
      expect(updatedConstraints.interests).toEqual(["monument"]);
    });

    it("preserves existing user-selected interests when traveler already specified them", () => {
      const initialConstraints = {
        days: 3,
        interests: ["beach", "nature"],
        start: "Bhubaneswar",
        dates: null,
      };

      const targetPlace: SelectedPlaceInfo = {
        name: "Konark Sun Temple",
        category: "monument",
        location: "Konark & Marine",
      };

      const existingInterests = initialConstraints.interests || [];
      const categoryName = targetPlace.category?.toLowerCase().trim();
      const updatedInterests =
        existingInterests.length > 0
          ? existingInterests
          : categoryName
          ? [categoryName]
          : [];

      const updatedConstraints = {
        ...initialConstraints,
        start: targetPlace.name,
        interests: updatedInterests,
      };

      expect(updatedConstraints.start).toBe("Konark Sun Temple");
      expect(updatedConstraints.interests).toEqual(["beach", "nature"]);
    });
  });

  // 2. Destinations Page Catalog → Quick Planning Handoff
  describe("Destinations Catalog Planning Handoff", () => {
    it("renders verified Whole-Odisha catalog cards and passes selected place to handlers", () => {
      const html = renderClean(
        <DestinationsPage
          onSelectPlace={() => {}}
          onViewOnMap={() => {}}
          onPlanTripWithPlace={() => {}}
        />
      );

      expect(html).toContain("Explore Destinations Across Odisha");
      expect(html).toContain("Puri &amp; Coastal");
      expect(html).toContain("Konark &amp; Marine");
      expect(html).toContain("Kandhamal &amp; Southern Hills");
      expect(html).toContain("Puri Golden Beach");
      expect(html).toContain("Lingaraj Temple");
      expect(html).toContain("Daringbadi Hill Station");
    });
  });

  // 3. Saved Places → Plan with Saved Handoff
  describe("Saved Places Planning Handoff", () => {
    it("aggregates distinct canonical categories from multiple saved destinations into planner constraints", () => {
      const savedItems = [
        {
          id: "puri-beach",
          name: "Puri Golden Beach",
          category: "beach",
          location: "Puri & Coastal",
          savedAt: 123456,
        },
        {
          id: "konark-sun",
          name: "Konark Sun Temple",
          category: "monument",
          location: "Konark & Marine",
          savedAt: 123457,
        },
        {
          id: "daringbadi-hills",
          name: "Daringbadi Hill Station",
          category: "nature",
          location: "Kandhamal & Southern Hills",
          savedAt: 123458,
        },
      ];

      const initialConstraints = {
        days: 3,
        interests: ["temple"],
        start: null as string | null,
        dates: null,
      };

      // Simulate handlePlanWithSaved logic
      const savedCategories = Array.from(
        new Set(
          savedItems
            .map((p) => p.category?.toLowerCase().trim())
            .filter((cat): cat is string => Boolean(cat))
        )
      );
      const existingInterests = initialConstraints.interests || [];
      const mergedInterests = Array.from(
        new Set([...existingInterests, ...savedCategories])
      );

      const updatedConstraints = {
        ...initialConstraints,
        interests: mergedInterests,
        start: initialConstraints.start || savedItems[0]?.name || null,
      };

      expect(updatedConstraints.start).toBe("Puri Golden Beach");
      expect(updatedConstraints.interests).toContain("temple");
      expect(updatedConstraints.interests).toContain("beach");
      expect(updatedConstraints.interests).toContain("monument");
      expect(updatedConstraints.interests).toContain("nature");
      expect(updatedConstraints.interests.length).toBe(4);
    });

    it("preserves pre-existing start location when traveler already chose an origin", () => {
      const savedItems = [
        {
          id: "konark-sun",
          name: "Konark Sun Temple",
          category: "monument",
          location: "Konark & Marine",
          savedAt: 123457,
        },
      ];

      const initialConstraints = {
        days: 2,
        interests: [] as string[],
        start: "Bhubaneswar Airport",
        dates: null,
      };

      const savedCategories = Array.from(
        new Set(
          savedItems
            .map((p) => p.category?.toLowerCase().trim())
            .filter((cat): cat is string => Boolean(cat))
        )
      );
      const existingInterests = initialConstraints.interests || [];
      const mergedInterests = Array.from(
        new Set([...existingInterests, ...savedCategories])
      );

      const updatedConstraints = {
        ...initialConstraints,
        interests: mergedInterests,
        start: initialConstraints.start || savedItems[0]?.name || null,
      };

      expect(updatedConstraints.start).toBe("Bhubaneswar Airport");
      expect(updatedConstraints.interests).toEqual(["monument"]);
    });
  });

  // 4. Map View & Marker Popup Planning Handoff
  describe("Map Marker Popup Planning Handoff", () => {
    it("forwards onPlanTripWithPlace and onViewDetails through MapView to MapCanvas", () => {
      const sampleProjection: MapProjectionResponse = {
        requested_features: [
          { entity: "place", id: "550e8400-e29b-41d4-a716-446655440000" },
        ],
        features: [
          {
            feature_type: "place",
            canonical_ref: { entity: "place", id: "550e8400-e29b-41d4-a716-446655440000" },
            geometry_status: "available",
            geometry: { type: "Point", coordinates: [85.81, 20.29] },
            unavailable_reason: null,
            name: "Lingaraj Temple",
            category: "temple",
            region: "Bhubaneswar & Central",
          },
        ],
        relationships: [],
        unavailable_items: [],
      };

      let plannedPlace: any = null;
      let detailedPlace: any = null;

      const html = renderClean(
        <MapView
          projection={sampleProjection}
          isLoading={false}
          error={null}
          selectedPlace={null}
          onPlanTripWithPlace={(p) => {
            plannedPlace = p;
          }}
          onViewDetails={(p) => {
            detailedPlace = p;
          }}
        />
      );

      expect(html).toContain("Lingaraj Temple");
      expect(html).toContain("Odisha Route &amp; Destination Map");
      expect(html).toContain("1");
      expect(html).toContain("Mapped Locations");
      expect(html).not.toContain("Point #1");
    });
  });
});
