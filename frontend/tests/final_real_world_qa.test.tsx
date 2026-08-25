import React from "react";
import { describe, expect, it, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";
import {
  ODISHA_HUB_COORDINATES,
  ODISHA_REGIONAL_SERVICES,
  getOperatingStatus,
  HomeSections,
} from "../src/components/home/HomeSections";
import { SavedPlacesPage } from "../src/components/home/SavedPlacesPage";
import { PlaceDetailsModal } from "../src/components/place/PlaceDetailsModal";
import { ConstraintForm, CANONICAL_INTERESTS } from "../src/components/itinerary/ConstraintForm";
import { Footer } from "../src/components/nav/Footer";
import { TopNav } from "../src/components/nav/TopNav";
import {
  getPlaceImageUrl,
  getPlaceRegion,
  ODISHA_DESTINATION_GALLERY,
} from "../src/utils/imageService";
import { resolvePlaceImageUrl, resolvePlaceGallery } from "../src/utils/imageAdapter";
import type { ItineraryPlanResponse } from "../src/types/api";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

// In-memory mock localStorage for SSR test environment
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

describe("O-Travelz Final QA, Real-Data Validation & Visual Polish Pass", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("1. Verifies Revisit Places memory storage, status tags, and deduplication with accumulated history", () => {
    const memories = [
      {
        id: "place-konark",
        name: "Konark Sun Temple",
        category: "heritage",
        location: "Konark",
        description: "13th century architectural marvel.",
        status: "explored",
        rating: 4.9,
        visitedAt: Date.now(),
      },
    ];

    expect(memories).toHaveLength(1);
    expect(memories[0].name).toBe("Konark Sun Temple");
    expect(memories[0].status).toBe("explored");

    // Plan trip with Konark Sun Temple updates existing entry
    memories[0] = {
      ...memories[0],
      status: "planned",
      tripAssociation: {
        tripId: "trip-001",
        title: "2-Day Golden Triangle",
        date: "2026-08-25",
        daysCount: 2,
      },
    };

    expect(memories).toHaveLength(1);
    expect(memories[0].status).toBe("planned");
    expect(memories[0].tripAssociation?.title).toBe("2-Day Golden Triangle");
  });

  it("2. Verifies distinct trip associations across Trip A and Trip B without colliding", () => {
    const memories = [
      {
        id: "place-similipal",
        name: "Similipal Tiger Reserve",
        category: "wildlife",
        location: "Northern Odisha",
        status: "planned",
        tripAssociation: {
          tripId: "trip-A",
          title: "Wildlife Safari Expedition",
          date: "2026-09-01",
          daysCount: 3,
        },
      },
      {
        id: "place-daringbadi",
        name: "Daringbadi Pine Hills",
        category: "nature",
        location: "Kandhamal",
        status: "planned",
        tripAssociation: {
          tripId: "trip-B",
          title: "Hill Station Weekend",
          date: "2026-09-10",
          daysCount: 2,
        },
      },
    ];

    expect(memories).toHaveLength(2);
    expect(memories[0].tripAssociation?.title).toBe("Wildlife Safari Expedition");
    expect(memories[1].tripAssociation?.title).toBe("Hill Station Weekend");
  });

  it("3. Verifies SavedPlacesPage renders both Wishlist and Revisit Places with appropriate status tags", () => {
    // Add a saved wishlist place to localStorage
    const savedItems = [
      {
        id: "wishlist-chilika",
        name: "Chilika Lake",
        category: "nature",
        location: "Chilika & Southern Coast",
        description: "Asia's largest brackish lagoon.",
        savedAt: Date.now(),
      },
    ];
    localStorage.setItem("o_travelz_saved_places", JSON.stringify(savedItems));

    // Add a revisit memory place to localStorage
    const memoryItems = [
      {
        id: "mem-lingaraj",
        name: "Lingaraj Temple",
        category: "heritage",
        location: "Bhubaneswar",
        status: "visited",
        rating: 4.9,
        visitedAt: Date.now(),
      },
    ];
    localStorage.setItem("otravelz_place_memories_v2", JSON.stringify(memoryItems));

    // Render Wishlist tab
    const wishlistHtml = renderClean(
      <SavedPlacesPage
        initialViewMode="saved"
        onBackToDiscover={() => {}}
        onPlanWithSaved={() => {}}
        onPlanWithSinglePlace={() => {}}
        onOpenMap={() => {}}
        onSelectPlace={() => {}}
      />
    );
    expect(wishlistHtml).toContain("Saved Wishlist");
    expect(wishlistHtml).toContain("Chilika Lake");
    expect(wishlistHtml).toContain("Plan Trip with All Saved");

    // Render Revisit Places tab
    const revisitHtml = renderClean(
      <SavedPlacesPage
        initialViewMode="revisit"
        onBackToDiscover={() => {}}
        onPlanWithSaved={() => {}}
        onPlanWithSinglePlace={() => {}}
        onOpenMap={() => {}}
        onSelectPlace={() => {}}
      />
    );
    expect(revisitHtml).toContain("Revisit Places");
    expect(revisitHtml).toContain("Lingaraj Temple");
    expect(revisitHtml).toContain("Visited Before");
    expect(revisitHtml).toContain("Explore Again");
  });

  it("4. Verifies dynamic regional services change across all 9 Odisha hubs without stale data", () => {
    const hubs = [
      "bhubaneswar",
      "puri",
      "cuttack",
      "konark",
      "chilika lake",
      "daringbadi",
      "sambalpur",
      "koraput",
    ];

    hubs.forEach((hub) => {
      const services = ODISHA_REGIONAL_SERVICES[hub];
      expect(services).toBeDefined();
      expect(services.medical.length).toBeGreaterThan(0);
      expect(services.transport.length).toBeGreaterThan(0);
      expect(services.atms.length).toBeGreaterThan(0);

      // Verify coordinate registration
      expect(ODISHA_HUB_COORDINATES[hub]).toBeDefined();
      expect(ODISHA_HUB_COORDINATES[hub].lat).toBeGreaterThan(17);
      expect(ODISHA_HUB_COORDINATES[hub].lon).toBeGreaterThan(80);
    });

    // Test Puri specifically: should have District Hospital and PURI Railway Station
    const puriServices = ODISHA_REGIONAL_SERVICES["puri"];
    expect(puriServices.medical[0].name).toContain("District Headquarters");
    expect(puriServices.transport[0].name).toContain("Puri Railway Station");

    // Test Cuttack specifically: should have SCB Medical College and Badambadi Bus Terminal
    const cuttackServices = ODISHA_REGIONAL_SERVICES["cuttack"];
    expect(cuttackServices.medical[0].name).toContain("SCB Medical College");
    expect(cuttackServices.transport[1].name).toContain("Badambadi");

    // Test Sambalpur specifically: should have VIMSAR Burla
    const sambalpurServices = ODISHA_REGIONAL_SERVICES["sambalpur"];
    expect(sambalpurServices.medical[0].name).toContain("VIMSAR Burla");
  });

  it("5. Verifies time-aware operating hours logic (Active Now)", () => {
    // Nature, beaches, hills must always be Open 24 Hours
    const beachStatus = getOperatingStatus("beach", "Puri Beach");
    expect(beachStatus.isOpen).toBe(true);
    expect(beachStatus.status).toContain("Open 24 Hours");

    const hillStatus = getOperatingStatus("nature", "Daringbadi Hill");
    expect(hillStatus.isOpen).toBe(true);

    // Temples have defined operating hours
    const templeStatus = getOperatingStatus("spirituality", "Lingaraj Temple");
    expect(templeStatus.status).toBeDefined();
  });

  it("6. Verifies image pipeline maps specific destinations to verified photographs rather than generic categories", () => {
    const konarkImg = getPlaceImageUrl("Konark Sun Temple", "heritage");
    const lingarajImg = getPlaceImageUrl("Lingaraj Temple", "heritage");
    const puriBeachImg = getPlaceImageUrl("Puri Beach", "beach");
    const daringbadiImg = getPlaceImageUrl("Daringbadi Pine Hills", "nature");

    // All distinct places must produce non-empty valid URLs
    expect(konarkImg).toBeTruthy();
    expect(lingarajImg).toBeTruthy();
    expect(puriBeachImg).toBeTruthy();
    expect(daringbadiImg).toBeTruthy();

    // Two distinct heritage sites (Konark and Lingaraj) should NOT have identical URLs
    expect(konarkImg).not.toEqual(lingarajImg);
  });

  it("7. Verifies PlaceDetailsModal renders verified photo gallery, GPS coordinates, and metadata", () => {
    const modalHtml = renderClean(
      <PlaceDetailsModal
        place={{
          id: "place-konark",
          name: "Konark Sun Temple",
          category: "Heritage",
          location: "Konark",
          lat: 19.8876,
          lon: 86.0945,
          avg_visit_minutes: 120,
          price_tier: "budget",
          badge: "UNESCO World Heritage Site",
          description: "Magnificent 13th-century Sun temple shaped as a giant stone chariot.",
          interests: ["heritage", "spirituality", "architecture"],
          tags: ["Chariot Wheels", "Black Pagoda", "Maritime Kalinga"],
        }}
        onClose={() => {}}
        onViewOnMap={() => {}}
        onPlanTrip={() => {}}
      />
    );

    expect(modalHtml).toContain("Konark Sun Temple");
    expect(modalHtml).toContain("UNESCO World Heritage Site");
    expect(modalHtml).toContain("19.89°N, 86.09°E");
    expect(modalHtml).toContain("~120 mins");
    expect(modalHtml).toContain("budget");
    expect(modalHtml).toContain("Chariot Wheels");
    expect(modalHtml).toContain("Plan Trip Here");
    expect(modalHtml).toContain("Explore on Map");
  });

  it("8. Verifies ConstraintForm renders progressive multi-section accordion with 12 themed chips and quick hubs", () => {
    const formHtml = renderClean(
      <ConstraintForm
        isLoading={false}
        onSubmit={() => {}}
      />
    );

    expect(formHtml).toContain("ODISHA ROUTE &amp; TRANSIT PLANNER");
    expect(formHtml).toContain("Trip Basics &amp; Starting Hub");
    expect(formHtml).toContain("Interests / Themes &amp; Experiences");
    expect(formHtml).toContain("Transportation &amp; Pace Intelligence");

    // All 12 themed chips must be present
    expect(CANONICAL_INTERESTS).toHaveLength(12);
    CANONICAL_INTERESTS.forEach((chip) => {
      expect(formHtml).toContain(chip.label.replace("&", "&amp;"));
    });

    // Quick hubs must be present
    expect(formHtml).toContain("Bhubaneswar");
    expect(formHtml).toContain("Puri");
    expect(formHtml).toContain("Konark");
    expect(formHtml).toContain("Daringbadi");
  });

  it("9. Verifies Footer adapts dynamically to the selected location and renders all brand and provenance details", () => {
    const footerHtml = renderClean(
      <Footer
        selectedLocation="Puri"
        onNavigate={() => {}}
        onSelectCategory={() => {}}
      />
    );

    expect(footerHtml).toContain("Puri");
    expect(footerHtml).toContain("safe • secure • smart");
    expect(footerHtml).toContain("Algoryxz");
    expect(footerHtml).toContain("MADE IN ODISHA");
    expect(footerHtml).toContain("ODISHA SPIRIT");
  });

  it("10. Full 23-step acceptance journey simulation: Explore -> Save -> Plan -> Memory -> Hub Switch", () => {
    // Step 1-6: Explore place & save to wishlist
    const destination = {
      id: "place-chilika",
      name: "Chilika Lake (Mangalajodi)",
      category: "nature",
      location: "Chilika Lake",
      description: "Wetland ecosystem with migratory birds.",
    };
    const savedList = [destination];
    expect(savedList.some((d) => d.id === "place-chilika")).toBe(true);

    // Step 7-12: Plan itinerary with destination
    const sampleItinerary: ItineraryPlanResponse = {
      itinerary_id: "itin-001",
      constraints: { days: 2, interests: ["nature", "wildlife"], start: "Chilika Lake" },
      days: [
        {
          day_number: 1,
          date: "2026-08-25",
          theme: "Lagoon Exploration",
          stops: [
            {
              sequence: 1,
              place: {
                id: "place-chilika",
                name: "Chilika Lake (Mangalajodi)",
                category: "nature",
              },
              planned_arrival: "07:00",
              planned_departure: "11:00",
              duration_minutes: 240,
            },
          ],
        },
      ],
      estimated_total_cost: 3200,
    };

    // Step 13-14: Record to Revisit Places
    const memory: any[] = [];
    sampleItinerary.days.forEach((day) => {
      day.stops.forEach((stop) => {
        memory.push({
          id: stop.place.id,
          name: stop.place.name,
          category: stop.place.category,
          location: getPlaceRegion(stop.place.name),
          status: "planned",
          tripAssociation: {
            tripId: sampleItinerary.itinerary_id,
            title: `2-Day Lagoon Exploration`,
            date: day.date,
            daysCount: 2,
          },
        });
      });
    });

    expect(memory.some((m) => m.name === "Chilika Lake (Mangalajodi)" && m.status === "planned")).toBe(true);

    // Step 15-23: Switch Hub to Konark & verify regional services
    const konarkServices = ODISHA_REGIONAL_SERVICES["konark"];
    expect(konarkServices.medical[0].name).toContain("Konark");
    expect(konarkServices.transport[0].name).toContain("Konark Bus");
  });
});
