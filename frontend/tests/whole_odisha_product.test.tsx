import React from "react";
import { describe, expect, it, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";
import { DestinationsPage } from "../src/components/home/DestinationsPage";
import { PlaceDetailsModal } from "../src/components/place/PlaceDetailsModal";
import { TopNav } from "../src/components/nav/TopNav";
import { MobileDrawer } from "../src/components/nav/MobileDrawer";
import { MapView } from "../src/components/map/MapView";
import { OdishaHero } from "../src/components/home/OdishaHero";
import { ItineraryPlannerPage } from "../src/pages/ItineraryPlannerPage";
import { getPlaceImageUrl, getPlaceRegion } from "../src/utils/imageService";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

// In-memory mock localStorage for Node/test environment
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

describe("Whole-Odisha Productization & Discovery Tests", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("renders Destinations exploration view with full regional catalog and filter controls", () => {
    const html = renderClean(
      <DestinationsPage
        onSelectPlace={() => {}}
        onViewOnMap={() => {}}
        onPlanTripWithPlace={() => {}}
      />
    );

    expect(html).toContain("destinations-explore-view");
    expect(html).toContain("Explore Destinations Across Odisha");
    expect(html).toContain("Filter by Region");
    expect(html).toContain("Filter by Category");

    // All major regions must be present
    expect(html).toContain("Puri &amp; Coastal");
    expect(html).toContain("Konark &amp; Marine");
    expect(html).toContain("Bhubaneswar &amp; Central");
    expect(html).toContain("Kandhamal &amp; Southern Hills");
    expect(html).toContain("Sambalpur &amp; Western Odisha");
    expect(html).toContain("Koraput &amp; Tribal Highlands");

    // Key Odisha destinations must be rendered in catalog
    expect(html).toContain("Lingaraj Temple");
    expect(html).toContain("Konark Sun Temple");
    expect(html).toContain("Daringbadi Hill Station");
    expect(html).toContain("Hirakud Dam &amp; Reservoir");
    expect(html).toContain("Similipal National Park");
    expect(html).toContain("Gupteswar Cave Temple, Koraput");
  });

  it("renders PlaceDetailsModal with rich facts, verified badges, coordinates, and action buttons", () => {
    const samplePlace = {
      id: "place_konark_001",
      name: "Konark Sun Temple",
      category: "monument",
      location: "Konark & Marine",
      description: "13th-century UNESCO World Heritage Site sculpted as a colossal stone chariot.",
      lat: 19.8875,
      lon: 86.0944,
      avg_visit_minutes: 120,
      price_tier: "Paid",
      source: "https://whc.unesco.org/en/list/246/",
    };

    const html = renderClean(
      <PlaceDetailsModal
        place={samplePlace}
        onClose={() => {}}
        onViewOnMap={() => {}}
        onPlanTrip={() => {}}
      />
    );

    expect(html).toContain("place-details-modal");
    expect(html).toContain("Konark Sun Temple");
    expect(html).toContain("13th-century UNESCO World Heritage Site");
    expect(html).toContain("~120 mins");
    expect(html).toContain("Paid");
    expect(html).toContain("19.89°N, 86.09°E");
    expect(html).toContain("modal-save-button");
    expect(html).toContain("modal-view-on-map-button");
    expect(html).toContain("modal-plan-trip-button");
    expect(html).toContain("Save Place");
    expect(html).toContain("Explore on Map");
    expect(html).toContain("Plan Trip Here");

    // No developer internal jargon
    expect(html).not.toContain("SRID");
    expect(html).not.toContain("WGS84");
    expect(html).not.toContain("PostGIS");
  });

  it("verifies TopNav and MobileDrawer include Destinations navigation tab without dark/light mode toggle", () => {
    const navHtml = renderClean(
      <TopNav
        activeTab="destinations"
        onTabChange={() => {}}
        selectedLocation="Bhubaneswar"
        onLocationChange={() => {}}
        onOpenMobileDrawer={() => {}}
        savedCount={3}
      />
    );

    expect(navHtml).toContain("nav-tab-discover");
    expect(navHtml).toContain("nav-tab-destinations");
    expect(navHtml).toContain("nav-tab-map");
    expect(navHtml).toContain("nav-tab-plan");
    expect(navHtml).toContain("nav-tab-saved");
    expect(navHtml).toContain("3"); // Saved count badge

    // Theme controls enabled
    expect(navHtml).toContain("theme-toggle");

    const drawerHtml = renderClean(
      <MobileDrawer
        isOpen={true}
        onClose={() => {}}
        activeTab="destinations"
        onSelectTab={() => {}}
        savedCount={3}
      />
    );

    expect(drawerHtml).toContain("drawer-nav-discover");
    expect(drawerHtml).toContain("drawer-nav-destinations");
    expect(drawerHtml).toContain("drawer-nav-map");
    expect(drawerHtml).toContain("drawer-nav-plan");
    expect(drawerHtml).toContain("drawer-nav-saved");
    expect(drawerHtml).toContain("drawer-theme-toggle");
  });

  it("verifies MapView renders standalone selected place banner with Plan Trip Here button", () => {
    const selectedPlace = {
      name: "Daringbadi Hill Station",
      category: "nature",
      location: "Kandhamal & Southern Hills",
      lat: 19.9111,
      lon: 84.1305,
    };

    const html = renderClean(
      <MapView
        projection={null}
        isLoading={false}
        error={null}
        selectedPlace={selectedPlace}
        onPlanTripWithPlace={() => {}}
      />
    );

    expect(html).toContain("map-selected-place-banner");
    expect(html).toContain("Daringbadi Hill Station");
    expect(html).toContain("Kandhamal &amp; Southern Hills");
    expect(html).toContain("Plan Trip Here");
  });

  it("verifies image resolution service accurately maps whole-Odisha regions and travel photography", () => {
    expect(getPlaceRegion("Puri Golden Beach")).toBe("Puri & Coastal");
    expect(getPlaceRegion("Konark Sun Temple")).toBe("Konark & Marine");
    expect(getPlaceRegion("Daringbadi Hill Station")).toBe("Kandhamal & Southern Hills");
    expect(getPlaceRegion("Hirakud Dam & Reservoir")).toBe("Sambalpur & Western Odisha");
    expect(getPlaceRegion("Similipal National Park")).toBe("Northern Odisha & Wildlife");
    expect(getPlaceRegion("Gupteswar Cave Temple, Koraput")).toBe("Koraput & Tribal Highlands");

    const imgPuri = getPlaceImageUrl("Puri Golden Beach", "beach");
    const imgKonark = getPlaceImageUrl("Konark Sun Temple", "monument");
    const imgDaringbadi = getPlaceImageUrl("Daringbadi Hill Station", "nature");

    expect(imgPuri).toContain("unsplash.com");
    expect(imgKonark).toContain("unsplash.com");
    expect(imgDaringbadi).toContain("unsplash.com");
  });

  it("verifies OdishaHero renders live destination rotation and view all destinations action", () => {
    const html = renderClean(
      <OdishaHero
        selectedLocation="Puri"
        onSearch={() => {}}
        onSurpriseMe={() => {}}
        onSelectDestination={() => {}}
        onViewAllDestinations={() => {}}
      />
    );

    expect(html).toContain("Discover everything");
    expect(html).toContain("in Odisha.");
    expect(html).toContain("Puri · Live");
    expect(html).toContain("Daringbadi");
    expect(html).toContain("Chilika Lake");
    expect(html).toContain("Konark Sun Temple");
    expect(html).toContain("View all destinations");
  });
});
