import React from "react";
import { renderToString } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import { DestinationsPage } from "../src/components/home/DestinationsPage";
import { ApiClient } from "../src/api/client";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("DestinationsPage Search Flow & Whole-Odisha Retrieval", () => {
  it("renders explore view and search input correctly with initial search", () => {
    const html = renderClean(
      <DestinationsPage
        onSelectPlace={() => {}}
        onViewOnMap={() => {}}
        initialSearch="Lingaraj"
      />
    );

    expect(html).toContain('data-testid="destinations-explore-view"');
    expect(html).toContain('data-testid="destinations-search-input"');
    expect(html).toContain('data-testid="destinations-grid"');
    expect(html).toContain("Lingaraj");
  });

  it("filters destinations by initial search query", () => {
    const html = renderClean(
      <DestinationsPage
        onSelectPlace={() => {}}
        onViewOnMap={() => {}}
        initialSearch="Konark"
      />
    );

    expect(html).toContain('data-testid="destination-card-konark-sun-temple"');
    expect(html).not.toContain('data-testid="destination-card-lingaraj-temple"');
  });

  it("displays empty state when no places match search query", () => {
    const html = renderClean(
      <DestinationsPage
        onSelectPlace={() => {}}
        onViewOnMap={() => {}}
        initialSearch="NonExistentPlaceXYZ123"
      />
    );

    expect(html).toContain('data-testid="no-destinations-found"');
    expect(html).toContain("No destinations found");
    expect(html).not.toContain('data-testid="destinations-grid"');
  });

  it("renders region filter pills and filter buttons", () => {
    const html = renderClean(
      <DestinationsPage
        onSelectPlace={() => {}}
        onViewOnMap={() => {}}
      />
    );

    expect(html).toContain("Filter by Region");
    expect(html).toContain("All Regions");
    expect(html).toContain("Bhubaneswar &amp; Central");
    expect(html).toContain("Puri &amp; Coastal");
    expect(html).toContain("Northern Odisha &amp; Wildlife");
  });

  it("passes search and filter parameters through ApiClient.listPlaces", async () => {
    const mockListPlaces = vi.fn().mockResolvedValue([]);
    const mockClient = {
      listPlaces: mockListPlaces,
    } as unknown as ApiClient;

    await mockClient.listPlaces({
      search: "Puri",
      district: "Puri",
      category: "temple",
      is_medical: false,
      is_transit: false,
      near_lat: 20.2961,
      near_lon: 85.8245,
      radius_km: 25.0,
      limit: 20,
      offset: 0,
    });

    expect(mockListPlaces).toHaveBeenCalledWith({
      search: "Puri",
      district: "Puri",
      category: "temple",
      is_medical: false,
      is_transit: false,
      near_lat: 20.2961,
      near_lon: 85.8245,
      radius_km: 25.0,
      limit: 20,
      offset: 0,
    });
  });
});
