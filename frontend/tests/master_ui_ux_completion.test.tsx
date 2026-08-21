import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { ThemeSettingsDock } from "../src/components/nav/ThemeSettingsDock";
import { SettingsModal, loadUserPreferences, saveUserPreferences } from "../src/components/settings/SettingsModal";
import { CoverflowCarousel, type CoverflowItem } from "../src/components/gallery/CoverflowCarousel";
import { AISidebar } from "../src/components/ai/AISidebar";
import { PhotoGallery } from "../src/components/gallery/PhotoGallery";
import { PlaceDetailsModal } from "../src/components/place/PlaceDetailsModal";
import { TopNav } from "../src/components/nav/TopNav";
import { MobileDrawer } from "../src/components/nav/MobileDrawer";
import { HomeSections } from "../src/components/home/HomeSections";
import { getFeaturedOdishaDestinations } from "../src/utils/imageService";

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

if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
}

describe("Master UI / UX / Product Completion Test Suite", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });


  // 1. Theme & Settings Dock
  it("renders ThemeSettingsDock with Settings action", () => {
    let settingsOpened = false;
    const html = renderClean(
      <ThemeSettingsDock onOpenSettings={() => { settingsOpened = true; }} />
    );

    expect(html).toContain("theme-settings-dock");
    expect(html).toContain("dock-settings-btn");
  });

  // 2. Settings Modal
  it("renders SettingsModal with Travel Style and Data Storage tabs", () => {
    const html = renderClean(
      <SettingsModal isOpen={true} onClose={() => {}} />
    );

    expect(html).toContain("settings-modal");
    expect(html).toContain("settings-tab-travel");
    expect(html).toContain("settings-tab-data");
  });


  it("persists user preferences via saveUserPreferences and loadUserPreferences", () => {
    saveUserPreferences({
      interests: ["wildlife", "beach"],
      budgetTier: "luxury",
      transportPreference: "self-drive",
    });

    const loaded = loadUserPreferences();
    expect(loaded.interests).toEqual(["wildlife", "beach"]);
    expect(loaded.budgetTier).toBe("luxury");
    expect(loaded.transportPreference).toBe("self-drive");
  });

  // 3. Coverflow Carousel Component
  it("renders CoverflowCarousel with 3D cards, pagination dots, and navigation buttons", () => {
    const demoItems: CoverflowItem[] = [
      {
        id: "p1",
        title: "Puri Golden Beach",
        category: "Beach",
        location: "Puri & Coastal",
        description: "Blue flag beach and golden sands.",
        imageUrl: "https://example.com/puri.jpg",
      },
      {
        id: "p2",
        title: "Konark Sun Temple",
        category: "Monument",
        location: "Konark & Marine",
        description: "UNESCO Heritage site.",
        imageUrl: "https://example.com/konark.jpg",
      },
      {
        id: "p3",
        title: "Daringbadi Pine Hills",
        category: "Nature",
        location: "Kandhamal & Southern Hills",
        description: "Hill station and pine valleys.",
        imageUrl: "https://example.com/daringbadi.jpg",
      },
    ];

    const html = renderClean(
      <CoverflowCarousel
        items={demoItems}
        tag="DESTINATION DISCOVERY"
        title="Iconic Odisha Highlights"
        subtitle="Swipe to discover"
      />
    );

    expect(html).toContain("coverflow-carousel-section");
    expect(html).toContain("coverflow-prev-button");
    expect(html).toContain("coverflow-next-button");
    expect(html).toContain("Puri Golden Beach");
    expect(html).toContain("Konark Sun Temple");
    expect(html).toContain("Daringbadi Pine Hills");
    expect(html).toContain("coverflow-dot-0");
    expect(html).toContain("coverflow-dot-1");
    expect(html).toContain("coverflow-dot-2");
  });

  // 4. AI Sidebar Component
  it("renders AISidebar with conversation history, suggestion chips, and message input", () => {
    const html = renderClean(
      <AISidebar
        isOpen={true}
        onClose={() => {}}
        isLoading={false}
        error={null}
        history={[
          { role: "user", message: "Plan a 2-day trip in Puri" },
          { role: "assistant", message: "Here is your coastal heritage journey in Puri!" },
        ]}
        aiResponse={null}
        onSend={() => {}}
        hasItinerary={true}
        activeItinerary={{
          itinerary_id: "plan_123",
          days: [
            {
              day_number: 1,
              stops: [{ sequence: 1, place: { id: "p1", name: "Puri Beach", category: "Beach", lat: 19.8, lon: 85.8 } }],
              hops: [],
            },
          ],
        }}
        conversations={[
          {
            id: "trip_1",
            title: "2-Day Puri Beach Journey",
            timestamp: Date.now(),
            history: [],
            constraints: null,
            itinerary: null,
          },
        ]}
        activeConversationId="trip_1"
        onSelectConversation={() => {}}
        onNewTrip={() => {}}
        onDeleteConversation={() => {}}
      />
    );

    expect(html).toContain("ai-travel-sidebar");
    expect(html).toContain("AI Travel Planner");
    expect(html).toContain("sidebar-new-trip-btn");
    expect(html).toContain("Plan a 2-day trip in Puri");
    expect(html).toContain("Here is your coastal heritage journey in Puri!");
    expect(html).toContain("sidebar-suggestion-0");
    expect(html).toContain("sidebar-ai-input");
    expect(html).toContain("sidebar-ai-submit");
  });

  // 5. Multi-image PhotoGallery
  it("renders PhotoGallery with image counter, attribution info, and thumbnail controls", () => {
    const images = [
      {
        url: "https://example.com/img1.jpg",
        source: "Unsplash",
        license: "Free License",
        attribution: "Photo by Odisha Travel",
        alt: "Lingaraj Spire",
      },
      {
        url: "https://example.com/img2.jpg",
        source: "Wikimedia",
        license: "CC BY-SA",
        attribution: "Heritage Archive",
        alt: "Temple Courtyard",
      },
    ];

    const html = renderClean(
      <PhotoGallery images={images} placeName="Lingaraj Temple" />
    );

    expect(html).toContain("destination-photo-gallery");
    expect(html).toContain("gallery-image-counter");
    expect(html).toContain("1 / 2");
    expect(html).toContain("gallery-prev-button");
    expect(html).toContain("gallery-next-button");
    expect(html).toContain("gallery-thumb-0");
    expect(html).toContain("gallery-thumb-1");
  });

  // 6. PlaceDetailsModal
  it("renders PlaceDetailsModal with full destination stats, highlights, and CTAs", () => {
    const place = {
      id: "place-konark",
      name: "Konark Sun Temple",
      category: "Monument",
      location: "Konark & Marine",
      description: "13th-century UNESCO World Heritage stone chariot.",
      avg_visit_minutes: 120,
      price_tier: "₹40 (Indians) / ₹600 (Foreigners)",
      lat: 19.8876,
      lon: 86.0945,
      source: "Odisha Tourism Department",
    };

    const html = renderClean(
      <PlaceDetailsModal
        place={place}
        onClose={() => {}}
        onViewOnMap={() => {}}
        onPlanTrip={() => {}}
      />
    );

    expect(html).toContain("place-details-modal");
    expect(html).toContain("Konark Sun Temple");
    expect(html).toContain("UNESCO");
    expect(html).toContain("~120 mins");
    expect(html).toContain("19.89°N, 86.09°E");
    expect(html).toContain("modal-save-button");
    expect(html).toContain("modal-view-on-map-button");
    expect(html).toContain("modal-plan-trip-button");
  });

  // 7. Discover HomeSections with 2 Coverflow Carousels
  it("renders Discover HomeSections containing both Coverflow Carousels", () => {
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

    expect(html).toContain("discovery-coverflow-section");
    expect(html).toContain("saved-explore-coverflow-section");
    expect(html).toContain("Iconic Odisha Highlights");
    expect(html).toContain("Popular Categories");
    expect(html).toContain("Nearby &amp; Active Now");
    expect(html).toContain("WORTH THE DETOUR");
    expect(html).toContain("Places to put on your map.");
    expect(html).toContain("Essentials for the road.");
  });



  // 8. Canonical Logo Integration
  it("verifies canonical logo is integrated in TopNav and MobileDrawer", () => {
    const navHtml = renderClean(
      <TopNav
        activeTab="discover"
        onTabChange={() => {}}
        selectedLocation="Bhubaneswar"
        onLocationChange={() => {}}
        onOpenMobileDrawer={() => {}}
      />
    );
    expect(navHtml).toContain("/images/logo");
    expect(navHtml).toContain("O-Travelz");
    expect(navHtml).toContain("safe • secure • smart");

    const drawerHtml = renderClean(
      <MobileDrawer
        isOpen={true}
        onClose={() => {}}
        activeTab="discover"
        onSelectTab={() => {}}
      />
    );
    expect(drawerHtml).toContain("/images/logo");
    expect(drawerHtml).toContain("Odisha, in your rhythm.");
  });
});
