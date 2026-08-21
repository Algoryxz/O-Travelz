import React from "react";
import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import type { ItineraryPlanResponse } from "../src/api/contracts";
import { ItineraryPlannerPage } from "../src/pages/ItineraryPlannerPage";
import { TopNav } from "../src/components/nav/TopNav";
import { MobileDrawer } from "../src/components/nav/MobileDrawer";
import { OdishaHero } from "../src/components/home/OdishaHero";
import { HomeSections } from "../src/components/home/HomeSections";
import { CategoryExplorePage } from "../src/components/home/CategoryExplorePage";
import { SavedPlacesPage } from "../src/components/home/SavedPlacesPage";
import { ItineraryView } from "../src/components/itinerary/ItineraryView";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Phase 6B UX Correction Tests", () => {
  it("renders the clean top navigation with location selector and navigation tabs without profile/theme menu", () => {
    const html = renderClean(
      <TopNav
        activeTab="discover"
        onTabChange={() => {}}
        selectedLocation="Bhubaneswar"
        onLocationChange={() => {}}
        onOpenMobileDrawer={() => {}}
      />
    );
    expect(html).toContain("O-Travelz");
    expect(html).toContain("safe • secure • smart");
    expect(html).toContain("Bhubaneswar");
    expect(html).toContain("Discover");
    expect(html).toContain("Map");
    expect(html).toContain("Plan Trip");
    expect(html).toContain("Saved");

    // Profile menu and theme controls must be absent
    expect(html).not.toContain("Explorer account");
    expect(html).not.toContain("Appearance");
    expect(html).not.toContain("theme-toggle-light");
    expect(html).not.toContain("theme-toggle-dark");
    expect(html).not.toContain("Update profile");
    expect(html).not.toContain("Sign out");
  });

  it("renders the mobile navigation drawer with clean travel items and without out-of-scope preferences", () => {
    const html = renderClean(
      <MobileDrawer
        isOpen={true}
        onClose={() => {}}
        activeTab="discover"
        onSelectTab={() => {}}
        savedCount={1}
      />
    );
    expect(html).toContain("Navigate");
    expect(html).toContain("Discover");
    expect(html).toContain("Interactive Map");
    expect(html).toContain("Plan a Trip");
    expect(html).toContain("Your Space");
    expect(html).toContain("Saved places");

    // Obsolete profile items must be absent
    expect(html).not.toContain("Preferences");
    expect(html).not.toContain("Revisit places");
  });

  it("renders the photographic Odisha hero section with search and destination stack", () => {
    const html = renderClean(
      <OdishaHero
        selectedLocation="Bhubaneswar"
        onSearch={() => {}}
        onSurpriseMe={() => {}}
        onSelectDestination={() => {}}
        onViewAllDestinations={() => {}}
      />
    );
    expect(html).toContain("Discover everything");
    expect(html).toContain("in Odisha.");
    expect(html).toContain("ODISHA, YOUR WAY");
    expect(html).toContain("Find places near Bhubaneswar...");
    expect(html).toContain("Surprise Me");
    expect(html).toContain("Daringbadi");
    expect(html).toContain("Chilika Lake");
    expect(html).toContain("Konark Sun Temple");
    expect(html).toContain("Puri Beach");
    expect(html).toContain("View all destinations");
  });

  it("renders rich home discovery sections without developer jargon", () => {
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
    // Quick Strip
    expect(html).toContain("Location active");
    expect(html).toContain("active now");
    expect(html).toContain("Ask your travel copilot");
    // Weather
    expect(html).toContain("LOCAL WEATHER · BHUBANESWAR");
    expect(html).toContain("°C");
    expect(html).toContain("FORECAST");
    // Categories
    expect(html).toContain("Popular Categories");
    expect(html).toContain("Nature");
    expect(html).toContain("Medical Help");
    expect(html).toContain("Heritage &amp; Culture");
    expect(html).toContain("ATMs");
    // Nearby & Active Now filters & cards
    expect(html).toContain("Nearby &amp; Active Now");
    expect(html).toContain("data-testid=\"nearby-filter-all\"");
    expect(html).toContain("data-testid=\"nearby-filter-open-now\"");
    expect(html).toContain("data-testid=\"nearby-filter-top-rated\"");
    expect(html).toContain("Brewbakes Café");
    expect(html).toContain("Kalinga Stadium");
    expect(html).toContain("Game On Arena");
    expect(html).toContain("SBI ATM, Jaydev Vihar");
    // Essentials
    expect(html).toContain("data-testid=\"essential-medical\"");
    expect(html).toContain("data-testid=\"essential-atm\"");
    expect(html).toContain("data-testid=\"essential-transport\"");
    expect(html).toContain("Essentials for the road.");
    // Detour & Footer
    expect(html).toContain("WORTH THE DETOUR");
    expect(html).toContain("Places to put on your map.");
    expect(html).toContain("Make a day of it.");
    expect(html).toContain("MADE IN ODISHA");
    expect(html).not.toContain("Phase 6B Itinerary");
  });

  it("renders dedicated category exploration pages with place cards and actions", () => {
    const categories = [
      "Nature",
      "Medical Help",
      "Heritage & Culture",
      "ATMs",
      "Hangout & Chill",
      "Shopping & Fashion",
    ];

    for (const cat of categories) {
      const html = renderClean(
        <CategoryExplorePage
          category={cat}
          selectedLocation="Bhubaneswar"
          onBack={() => {}}
          onPlanTripWithCategory={() => {}}
          onOpenMap={() => {}}
        />
      );
      expect(html).toContain("data-testid=\"category-explore-view\"");
      expect(html).toContain("data-testid=\"category-back-button\"");
      expect(html).toContain("data-testid=\"category-plan-cta\"");
      expect(html).toContain("data-testid=\"category-map-cta\"");
      expect(html).toContain(cat.replace("&", "&amp;"));
    }
  });

  it("renders truthful saved places page with initial empty state", () => {
    const html = renderClean(
      <SavedPlacesPage
        onBackToDiscover={() => {}}
        onPlanWithSaved={() => {}}
        onOpenMap={() => {}}
      />
    );
    expect(html).toContain("data-testid=\"saved-places-view\"");
    expect(html).toContain("Saved Places");
    expect(html).toContain("Nothing saved yet");
    expect(html).not.toContain("Konark Sun Temple");
    expect(html).not.toContain("Brewbakes Café");
  });

  it("renders the interactive planner page with trip history sidebar and clean copy", () => {
    const html = renderClean(<ItineraryPlannerPage initialTab="plan" />);
    expect(html).toContain("Deterministic Travel Engine");
    expect(html).toContain("Odisha Itinerary Workspace");
    expect(html).toContain("Trip Duration (Days)");
    expect(html).toContain("Interests / Themes");
    expect(html).not.toContain("Phase 6B · Verified Geospatial Engine");
    expect(html).not.toContain("deterministic ranking");
  });

  it("handles AI refinement resulting in Kalinga Stadium appearing in itinerary", () => {
    const refinedItinerary: ItineraryPlanResponse = {
      itinerary_id: "plan-ai-refined-sports",
      constraints: {
        days: 2,
        interests: ["sports", "heritage"],
        start: "Lingaraj Temple",
        dates: null,
      },
      days: [
        {
          day_number: 1,
          date: null,
          stops: [
            {
              sequence: 1,
              place: {
                id: "place-lingaraj-temple",
                name: "Lingaraj Temple",
                category: "temple",
              },
              planned_arrival: "09:00",
              planned_departure: "10:30",
            },
            {
              sequence: 2,
              place: {
                id: "place-kalinga-stadium",
                name: "Kalinga Stadium",
                category: "sports",
              },
              planned_arrival: "11:00",
              planned_departure: "12:30",
            },
          ],
          hops: [
            {
              from_sequence: 1,
              to_sequence: 2,
              mode: "auto",
              duration_minutes: 15,
              distance_km: 4.8,
              data_tier: "scheduled",
            },
          ],
        },
      ],
      explanation: "Refined 2-day itinerary including Kalinga Stadium for sports interest.",
    };

    const html = renderClean(<ItineraryView itinerary={refinedItinerary} />);
    expect(html).toContain("Kalinga Stadium");
    expect(html).toContain("Lingaraj Temple");
    expect(html).toContain("sports");
    expect(html).toContain("Refined 2-day itinerary including Kalinga Stadium");
  });
});
