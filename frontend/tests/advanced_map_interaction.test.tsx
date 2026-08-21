import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { MapCanvas } from "../src/components/map/MapCanvas";
import type { MapFeature } from "../src/types/api";
import canonicalPlaces from "../../data/places/places.json";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Advanced Interactive Map & 81 Destinations", () => {
  const mockFeatures: MapFeature[] = canonicalPlaces.map((p) => ({
    canonical_ref: { entity: "place", id: p.id },
    name: p.name,
    category: p.category,
    region: p.location || "Odisha",
    feature_type: "place" as const,
    geometry_status: "available" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [p.lon, p.lat] as [number, number],
    },
  }));

  it("accepts all 81 canonical destinations without omissions", () => {
    expect(mockFeatures.length).toBe(81);
    expect(canonicalPlaces.length).toBe(81);

    const html = renderClean(
      <MapCanvas
        features={mockFeatures}
        selectedFeatureId={null}
        onSelectFeature={() => {}}
      />
    );

    expect(html).toContain('data-testid="map-canvas-container"');
    expect(html).toContain('data-testid="leaflet-map-element"');
    expect(html).toContain('data-testid="map-search-input"');
    expect(html).toContain('data-testid="map-layers-btn"');
    expect(html).toContain('data-testid="map-locate-me-btn"');
    expect(html).toContain('data-testid="map-zoom-in-btn"');
    expect(html).toContain('data-testid="map-zoom-out-btn"');
    expect(html).toContain('data-testid="map-fit-bounds-btn"');
  });

  it("renders search placeholder targeting all 81 destinations or districts", () => {
    const html = renderClean(
      <MapCanvas
        features={mockFeatures}
        selectedFeatureId={null}
      />
    );

    expect(html).toContain("Search 81 destinations or districts...");
  });

  it("renders locate me, zoom controls, and fit bounds buttons", () => {
    const html = renderClean(
      <MapCanvas
        features={mockFeatures}
        userLocation={{ lat: 20.2961, lon: 85.8245 }}
        userLocationName="Bhubaneswar"
      />
    );

    expect(html).toContain('data-testid="map-locate-me-btn"');
    expect(html).toContain('data-testid="map-zoom-in-btn"');
    expect(html).toContain('data-testid="map-zoom-out-btn"');
    expect(html).toContain('data-testid="map-fit-bounds-btn"');
  });
});
