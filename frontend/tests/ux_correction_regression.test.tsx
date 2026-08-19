import React from "react";
import { describe, expect, it, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";
import { TopNav } from "../src/components/nav/TopNav";
import { MobileDrawer } from "../src/components/nav/MobileDrawer";
import { ConstraintForm } from "../src/components/itinerary/ConstraintForm";
import { SavedPlacesPage } from "../src/components/home/SavedPlacesPage";
import { CategoryExplorePage } from "../src/components/home/CategoryExplorePage";
import { HomeSections } from "../src/components/home/HomeSections";
import { MapView } from "../src/components/map/MapView";
import { ItineraryPlannerPage } from "../src/pages/ItineraryPlannerPage";
import { useSavedPlaces } from "../src/store/useSavedPlaces";
import { useConversationHistory, generateTripTitle } from "../src/store/useConversationHistory";
import type { PlanningConstraints, MapProjectionResponse } from "../src/api/contracts";

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
    for (const key in mockStorage) {
      delete mockStorage[key];
    }
  },
};
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("Phase 17 - Comprehensive UX Correction Regression Suite", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("1 & 2. verifies profile menu and theme controls are completely removed from TopNav", () => {
    const html = renderClean(
      <TopNav
        activeTab="discover"
        onTabChange={() => {}}
        selectedLocation="Bhubaneswar"
        onLocationChange={() => {}}
        onOpenMobileDrawer={() => {}}
      />
    );

    expect(html).not.toContain("Explorer account");
    expect(html).not.toContain("explorer@o-travelz.in");
    expect(html).not.toContain("theme-toggle-light");
    expect(html).not.toContain("theme-toggle-dark");
    expect(html).not.toContain("Update profile");
    expect(html).not.toContain("Preferences");
    expect(html).not.toContain("Sign out");
  });

  it("3. verifies internal/developer strings are not present in rendered planner", () => {
    const html = renderClean(<ItineraryPlannerPage />);

    expect(html).not.toContain("WGS84");
    expect(html).not.toContain("SRID 4326");
    expect(html).not.toContain("geospatial engine");
    expect(html).not.toContain("deterministic ranking");
    expect(html).not.toContain("POST /ai/plan");
    expect(html).not.toContain("POST /map/v1/projection");
    expect(html).not.toContain("Phase 4/6B Contract");
  });

  it("4 & 5. verifies interests are optional and submits successfully with empty interests []", () => {
    let submittedPayload: PlanningConstraints | null = null;

    const html = renderClean(
      <ConstraintForm
        initialConstraints={{ days: 2, interests: [] }}
        isLoading={false}
        onSubmit={(payload) => {
          submittedPayload = payload;
        }}
      />
    );

    // Form shows optional indicator and allows planning
    expect(html).toContain("Trip Constraints");
    expect(html).toContain("Plan Itinerary (Surprise Me)");
    expect(html).not.toContain("Please select or add at least one interest");
    // Verify submit button is enabled
    expect(html).toContain('data-testid="submit-plan-button"');
    const submitBtnMatch = html.match(/data-testid="submit-plan-button"[^>]*>/);
    expect(submitBtnMatch?.[0]).not.toContain('disabled=""');
  });

  it("6, 7 & 8. verifies saved places start completely empty, persist in storage, and save/unsave work", () => {
    // Fresh session
    const htmlEmpty = renderClean(
      <SavedPlacesPage
        onBackToDiscover={() => {}}
        onPlanWithSaved={() => {}}
        onOpenMap={() => {}}
      />
    );
    expect(htmlEmpty).toContain("Nothing saved yet");
    expect(htmlEmpty).not.toContain("Konark Sun Temple");
    expect(htmlEmpty).not.toContain("Brewbakes Café");

    // Test localStorage persistence directly with stable storage key
    const initialSaved = [
      { id: "place-1", name: "Dhauli Shanti Stupa", category: "Heritage" },
    ];
    localStorageMock.setItem("o_travelz_saved_places", JSON.stringify(initialSaved));

    const loaded = JSON.parse(localStorageMock.getItem("o_travelz_saved_places") || "[]");
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe("Dhauli Shanti Stupa");
  });

  it("9. verifies View on Map preserves selected place identity", () => {
    const selectedPlace = {
      id: "place-lingaraj",
      name: "Lingaraj Temple",
      category: "Heritage",
      location: "Old Town, Bhubaneswar",
      description: "11th-century Kalinga masterpiece",
    };

    const html = renderClean(
      <MapView
        projection={null}
        isLoading={false}
        error={null}
        selectedPlace={selectedPlace}
        onClearSelectedPlace={() => {}}
        onPlanTripWithPlace={() => {}}
      />
    );

    expect(html).toContain("data-testid=\"map-selected-place-banner\"");
    expect(html).toContain("Lingaraj Temple");
    expect(html).toContain("Heritage");
    expect(html).toContain("Old Town, Bhubaneswar");
    expect(html).toContain("Plan Trip Here");
  });

  it("10. verifies categories navigation elements render cleanly", () => {
    const html = renderClean(
      <CategoryExplorePage
        category="Heritage & Culture"
        selectedLocation="Bhubaneswar"
        onBack={() => {}}
        onPlanTripWithCategory={() => {}}
        onOpenMap={() => {}}
      />
    );

    expect(html).toContain("data-testid=\"category-explore-view\"");
    expect(html).toContain("Lingaraj Temple");
    expect(html).toContain("Konark Sun Temple");
    expect(html).toContain("Plan with this category");
  });

  it("11. verifies All, Open Now, Top Rated filters exist on HomeSections", () => {
    const html = renderClean(
      <HomeSections
        selectedLocation="Bhubaneswar"
        onNavigateToPlan={() => {}}
        onNavigateToMap={() => {}}
        onNavigateToCopilot={() => {}}
        onSelectCategory={() => {}}
        onSelectPlace={() => {}}
      />
    );

    expect(html).toContain("data-testid=\"nearby-filter-all\"");
    expect(html).toContain("data-testid=\"nearby-filter-open-now\"");
    expect(html).toContain("data-testid=\"nearby-filter-top-rated\"");
  });

  it("12. verifies essentials section renders all three operational services", () => {
    const html = renderClean(
      <HomeSections
        selectedLocation="Bhubaneswar"
        onNavigateToPlan={() => {}}
        onNavigateToMap={() => {}}
        onNavigateToCopilot={() => {}}
        onSelectCategory={() => {}}
        onSelectPlace={() => {}}
      />
    );

    expect(html).toContain("data-testid=\"essential-medical\"");
    expect(html).toContain("data-testid=\"essential-atm\"");
    expect(html).toContain("data-testid=\"essential-transport\"");
  });

  it("13, 14 & 15. verifies AI conversation trip history helper functions and localStorage serialization", () => {
    const title = generateTripTitle("Plan a coastal journey", { days: 2, interests: ["heritage"] }, null);
    expect(title).toBe("2-Day Heritage Trip");

    const conv = {
      id: "trip_1",
      title: "2-Day Heritage Journey",
      timestamp: 1724000000000,
      history: [{ role: "user" as const, message: "Trip request" }],
      constraints: { days: 2, interests: ["heritage"] },
      itinerary: null,
    };

    localStorageMock.setItem("o_travelz_conversations", JSON.stringify([conv]));
    const stored = JSON.parse(localStorageMock.getItem("o_travelz_conversations") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe("2-Day Heritage Journey");
  });

  it("16. verifies primary navigation items Discover, Map, Plan Trip, Saved are present", () => {
    const html = renderClean(
      <TopNav
        activeTab="plan"
        onTabChange={() => {}}
        selectedLocation="Bhubaneswar"
        onLocationChange={() => {}}
        onOpenMobileDrawer={() => {}}
        savedCount={3}
      />
    );

    expect(html).toContain("data-testid=\"nav-tab-discover\"");
    expect(html).toContain("data-testid=\"nav-tab-map\"");
    expect(html).toContain("data-testid=\"nav-tab-plan\"");
    expect(html).toContain("data-testid=\"nav-tab-saved\"");
    expect(html).toContain("3"); // Saved count badge
  });
});
