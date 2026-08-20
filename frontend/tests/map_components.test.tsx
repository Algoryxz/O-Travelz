import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ApiError, NetworkError } from "../src/api/client";
import type { MapProjectionResponse } from "../src/api/contracts";
import { MapCanvas } from "../src/components/map/MapCanvas";
import { MapDetailsDrawer } from "../src/components/map/MapDetailsDrawer";
import { MapView } from "../src/components/map/MapView";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Phase 6B Map Components", () => {
  const sampleProjection: MapProjectionResponse = {
    requested_features: [
      { entity: "place", id: "550e8400-e29b-41d4-a716-446655440000" },
      { entity: "place", id: "660e8400-e29b-41d4-a716-446655440001" },
      { entity: "place", id: "770e8400-e29b-41d4-a716-446655440002" },
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
      {
        feature_type: "place",
        canonical_ref: { entity: "place", id: "660e8400-e29b-41d4-a716-446655440000" },
        geometry_status: "available",
        geometry: { type: "Point", coordinates: [85.85, 20.32] },
        unavailable_reason: null,
        name: "Mukteswar Temple",
        category: "temple",
        region: "Bhubaneswar & Central",
      },
      {
        feature_type: "place",
        canonical_ref: { entity: "place", id: "770e8400-e29b-41d4-a716-446655440002" },
        geometry_status: "unavailable",
        geometry: null,
        unavailable_reason: "coordinate_unverified",
      },
    ],
    relationships: [
      {
        relationship_type: "itinerary_hop",
        hop_ref: { day_number: 1, from_sequence: 1, to_sequence: 2 },
        mode: "walk+bus",
        data_tier: "scheduled",
        reason: null,
        legs: [
          {
            mode: "walk",
            detail: "Walk to stop",
            provider: null,
            route: null,
            geometry_status: "unavailable",
            geometry: null,
            stop_refs: [],
            unavailable_reason: "source_missing",
          },
        ],
      },
    ],
    unavailable_items: [],
  };

  describe("MapCanvas Component", () => {
    it("renders available Point geometry on SVG canvas with coordinate labels", () => {
      const html = renderClean(<MapCanvas features={sampleProjection.features} />);

      expect(html).toContain("Interactive Map View");
      expect(html).toContain("Lingaraj Temple");
      expect(html).toContain("85.8100°, 20.2900°");
      expect(html).toContain("Mukteswar Temple");
      expect(html).toContain("85.8500°, 20.3200°");
    });

    it("renders empty points notice when no available coordinates exist without fabricating geometry", () => {
      const unavailableOnlyFeatures = sampleProjection.features.filter(
        (f) => f.geometry_status === "unavailable"
      );
      const html = renderClean(<MapCanvas features={unavailableOnlyFeatures} />);

      expect(html).toContain("No Location Coordinates Available");
      expect(html).not.toContain("Point #1");
    });
  });

  describe("MapDetailsDrawer Component", () => {
    it("renders mapped locations list with canonical destination names and categories", () => {
      const html = renderClean(
        <MapDetailsDrawer
          features={sampleProjection.features}
          relationships={sampleProjection.relationships}
          unavailableItems={sampleProjection.unavailable_items}
        />
      );

      expect(html).toContain("Mapped Locations (2)");
      expect(html).toContain("Lingaraj Temple");
      expect(html).toContain("temple");
      expect(html).toContain("85.8100°, 20.2900°");
      expect(html).not.toContain("550e8400-e29b-41d4-a716-446655440000");
    });

    it("explicitly represents unavailable geometry honestly with canonical name", () => {
      const html = renderClean(
        <MapDetailsDrawer
          features={sampleProjection.features}
          relationships={sampleProjection.relationships}
          unavailableItems={sampleProjection.unavailable_items}
        />
      );

      expect(html).toContain("Stops Without Map Pins (1)");
      expect(html).toContain("Pending Destination");
      expect(html).not.toContain("770e8400-e29b-41d4-a716-446655440002");
    });

    it("renders multimodal transit relationships and legs status", () => {
      const html = renderClean(
        <MapDetailsDrawer
          features={sampleProjection.features}
          relationships={sampleProjection.relationships}
          unavailableItems={sampleProjection.unavailable_items}
        />
      );

      expect(html).toContain("Travel Hops (1)");
      expect(html).toContain("Day 1: Stop 1 → Stop 2");
      expect(html).toContain("Mode: walk+bus");
      expect(html).toContain("Scheduled");
    });

    it("renders notice on unresolved requested items honestly when returned", () => {
      const projectionWithUnresolved: MapProjectionResponse = {
        ...sampleProjection,
        unavailable_items: [
          {
            item_type: "feature",
            ref: { entity: "place", id: "missing-uuid-1234" },
            unavailable_reason: "identity_unresolved",
          },
        ],
      };

      const html = renderClean(
        <MapDetailsDrawer
          features={projectionWithUnresolved.features}
          relationships={projectionWithUnresolved.relationships}
          unavailableItems={projectionWithUnresolved.unavailable_items}
        />
      );

      expect(html).toContain("Notice on Selected Places (1)");
      expect(html).toContain("missing-uuid-1234");
      expect(html).toContain("(identity_unresolved)");
    });
  });

  describe("MapView Root Component", () => {
    it("renders map summary statistics when projection is provided", () => {
      const html = renderClean(
        <MapView projection={sampleProjection} isLoading={false} error={null} />
      );

      expect(html).toContain("Odisha Route &amp; Destination Map");
      expect(html).toContain("2"); // Mapped locations
      expect(html).toContain("1"); // Missing geometry
      expect(html).toContain("1"); // Travel hops
    });

    it("renders loading state", () => {
      const html = renderClean(
        <MapView projection={null} isLoading={true} error={null} />
      );

      expect(html).toContain("Loading Map...");
    });

    it("renders empty state when projection is null and not loading", () => {
      const html = renderClean(
        <MapView projection={null} isLoading={false} error={null} />
      );

      expect(html).toContain("Explore on the Map");
    });

    it("renders structured API error alert", () => {
      const apiError = new ApiError({
        message: "Internal projection failed",
        status: 500,
        code: "internal_projection_error",
      });

      const html = renderClean(
        <MapView projection={null} isLoading={false} error={apiError} />
      );

      expect(html).toContain("Planning Failed (500)");
      expect(html).toContain("internal_projection_error");
    });

    it("renders network failure alert", () => {
      const netError = new NetworkError("Failed to fetch");

      const html = renderClean(
        <MapView projection={null} isLoading={false} error={netError} />
      );

      expect(html).toContain("Network Connection Error");
    });

    it("renders multimodal relationship with LineString geometry and transit segments", () => {
      const projectionWithMultimodal: MapProjectionResponse = {
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
          {
            feature_type: "place",
            canonical_ref: { entity: "place", id: "660e8400-e29b-41d4-a716-446655440001" },
            geometry_status: "available",
            geometry: { type: "Point", coordinates: [85.85, 20.32] },
          },
        ],
        relationships: [
          {
            relationship_type: "itinerary_hop",
            hop_ref: { day_number: 1, from_sequence: 1, to_sequence: 2 },
            mode: "train+bus",
            data_tier: "scheduled",
            reason: "Fastest combined transit connection",
            legs: [
              {
                mode: "train",
                detail: "Puri Express to Bhubaneswar",
                provider: "Indian Railways",
                route: "18410",
                geometry_status: "available",
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [85.81, 20.29],
                    [85.83, 20.30],
                    [85.85, 20.32],
                  ],
                },
                stop_refs: ["stop_puri", "stop_bbsr"],
              },
              {
                mode: "bus",
                detail: "Mo Bus Route 10 to Master Canteen",
                provider: "CRUT",
                route: "10",
                geometry_status: "unavailable",
                geometry: null,
                stop_refs: [],
                unavailable_reason: "provider_geometry_unavailable",
              },
            ],
          },
        ],
        unavailable_items: [],
      };

      const drawerHtml = renderClean(
        <MapDetailsDrawer
          features={projectionWithMultimodal.features}
          relationships={projectionWithMultimodal.relationships}
          unavailableItems={projectionWithMultimodal.unavailable_items}
        />
      );

      expect(drawerHtml).toContain("Day 1: Stop 1 → Stop 2");
      expect(drawerHtml).toContain("Mode: train+bus");
      expect(drawerHtml).toContain("Scheduled");
      expect(drawerHtml).toContain("Puri Express to Bhubaneswar");
      expect(drawerHtml).toContain("Route Plotted");
      expect(drawerHtml).toContain("Mo Bus Route 10 to Master Canteen");
      expect(drawerHtml).toContain("Standard Connection");
    });

    it("preserves honest unavailable reason codes without inventing synthetic coordinates", () => {
      const projectionUnavailable: MapProjectionResponse = {
        requested_features: [
          { entity: "place", id: "unverified_place_001" },
        ],
        features: [
          {
            feature_type: "place",
            canonical_ref: { entity: "place", id: "unverified_place_001" },
            geometry_status: "unavailable",
            geometry: null,
            unavailable_reason: "coordinate_unverified",
          },
        ],
        relationships: [],
        unavailable_items: [
          {
            item_type: "feature",
            ref: { entity: "place", id: "unverified_place_001" },
            unavailable_reason: "coordinate_unverified",
          },
        ],
      };

      const drawerHtml = renderClean(
        <MapDetailsDrawer
          features={projectionUnavailable.features}
          relationships={projectionUnavailable.relationships}
          unavailableItems={projectionUnavailable.unavailable_items}
        />
      );

      expect(drawerHtml).toContain("Stops Without Map Pins (1)");
      expect(drawerHtml).toContain("unverified_place_001");
      expect(drawerHtml).toContain("Notice on Selected Places (1)");
      expect(drawerHtml).toContain("(coordinate_unverified)");
    });

    it("renders canonical destination name for selected place instead of generic Destination", () => {
      const selectedPlace = {
        id: "lingaraj-temple",
        name: "Lingaraj Temple",
        category: "temple",
        location: "Bhubaneswar & Central",
        lat: 20.2384,
        lon: 85.8346,
      };

      const html = renderClean(
        <MapView
          projection={null}
          isLoading={false}
          error={null}
          selectedPlace={selectedPlace}
        />
      );

      expect(html).toContain("Lingaraj Temple");
      expect(html).toContain("85.8346°, 20.2384°");
      expect(html).not.toContain("1 Destination");
      expect(html).toContain("data-testid=\"map-selected-place-banner\"");
      expect(html).toContain("data-testid=\"map-pin-lingaraj-temple\"");
    });
  });
});
