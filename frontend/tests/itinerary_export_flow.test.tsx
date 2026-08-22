import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderToString } from "react-dom/server";
import { ItineraryExportModal } from "../src/components/itinerary/ItineraryExportModal";
import { PrintableItineraryView } from "../src/components/itinerary/PrintableItineraryView";
import { ItineraryView } from "../src/components/itinerary/ItineraryView";
import {
  generateItineraryMarkdown,
  generateSafeFilename,
  downloadItineraryMarkdown,
  triggerPrintItinerary,
  ODISHA_EMERGENCY_HELPLINES,
} from "../src/utils/itineraryExport";
import type { ItineraryPlanResponse } from "../src/types/api";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

const MOCK_ITINERARY: ItineraryPlanResponse = {
  itinerary_id: "itin_export_test_001",
  explanation: "A scenic heritage journey covering Bhubaneswar and Konark.",
  constraints: {
    days: 2,
    interests: ["heritage", "architecture"],
    start: "Bhubaneswar",
    budget_transport_per_day: 2000,
  },
  days: [
    {
      day_number: 1,
      theme: "Old Temple Circuit",
      date: "2026-08-25",
      stops: [
        {
          place_id: "lingaraj_01",
          place_name: "Lingaraj Temple",
          planned_arrival: "09:00",
          planned_departure: "10:30",
          sequence: 1,
          duration_minutes: 90,
          place: {
            id: "lingaraj_01",
            name: "Lingaraj Temple",
            category: "heritage",
            district: "Khordha",
            region: "Bhubaneswar & Central",
            description: "11th-century masterpiece of Kalinga architecture.",
          },
        },
        {
          place_id: "mukteshwar_02",
          place_name: "Mukteshwar Temple",
          planned_arrival: "11:00",
          planned_departure: "12:15",
          sequence: 2,
          duration_minutes: 75,
          place: {
            id: "mukteshwar_02",
            name: "Mukteshwar Temple",
            category: "heritage",
            district: "Khordha",
            region: "Bhubaneswar & Central",
            description: "Gem of Odisha architecture with iconic arched gateway.",
          },
        },
      ],
      hops: [
        {
          from_sequence: 1,
          to_sequence: 2,
          mode: "Auto-rickshaw",
          estimated_minutes: 30,
          estimated_cost: 120,
          reason: "Direct city transit via Old Town lane",
        },
      ],
    },
    {
      day_number: 2,
      theme: "Sun Temple Grandeur",
      date: "2026-08-26",
      stops: [
        {
          place_id: "konark_03",
          place_name: "Konark Sun Temple",
          planned_arrival: "09:00",
          planned_departure: "12:00",
          sequence: 1,
          duration_minutes: 180,
          place: {
            id: "konark_03",
            name: "Konark Sun Temple",
            category: "heritage",
            district: "Puri",
            region: "Puri & Coastal",
            description: "UNESCO World Heritage 13th-century chariot temple.",
          },
        },
      ],
      hops: [],
    },
  ],
};

describe("Phase 14 Step 3: Itinerary Export & Print Optimization Suite", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      print: vi.fn(),
      location: { origin: "http://localhost:5173", hash: "", pathname: "/" },
    });
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:http://localhost:5173/mock-blob-uuid"),
      revokeObjectURL: vi.fn(),
    });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("1. Markdown Export Generator", () => {
    it("generates markdown with correct title, metadata, and constraints", () => {
      const md = generateItineraryMarkdown(MOCK_ITINERARY, "Bhubaneswar & Konark Heritage Tour");

      expect(md).toContain("# Bhubaneswar & Konark Heritage Tour");
      expect(md).toContain("Verified Odisha Itinerary");
      expect(md).toContain("2 Days");
      expect(md).toContain("3 Destinations");
      expect(md).toContain("Starting Hub**: Bhubaneswar");
      expect(md).toContain("Themes**: Heritage, Architecture");
      expect(md).toContain("Daily Transport Budget**: ₹2000");
    });

    it("generates structured daily itinerary schedule with visit times and hops", () => {
      const md = generateItineraryMarkdown(MOCK_ITINERARY);

      expect(md).toContain("## Day 1 (2026-08-25) — Old Temple Circuit");
      expect(md).toContain("### 09:00 — Lingaraj Temple");
      expect(md).toContain("- **Category**: heritage");
      expect(md).toContain("- **Duration**: ~60 min (Planned Departure: 10:30)");
      expect(md).toContain("> ↳ **Transit**: ~30m via Auto-rickshaw · Estimated Cost: ₹120");
      expect(md).toContain("> *Notice*: Direct city transit via Old Town lane");
      expect(md).toContain("### 11:00 — Mukteshwar Temple");
      expect(md).toContain("## Day 2 (2026-08-26) — Sun Temple Grandeur");
      expect(md).toContain("### 09:00 — Konark Sun Temple");
    });

    it("includes standard Odisha emergency and tourist helplines", () => {
      const md = generateItineraryMarkdown(MOCK_ITINERARY);

      expect(md).toContain("## Odisha Traveler & Emergency Assistance");
      expect(md).toContain("National Emergency Helpline (ERSS)**: `112`");
      expect(md).toContain("Medical Emergency & Ambulance**: `108`");
      expect(md).toContain("Odisha Tourist Police / Tourism Helpline**: `1800-208-1414 / 1363`");
      expect(md).toContain("Odisha Police Control Room**: `100 / 112`");
      expect(md).toContain("Fire Emergency**: `101`");
    });

    it("does not mutate original itinerary during export", () => {
      const itineraryCopy = JSON.parse(JSON.stringify(MOCK_ITINERARY));
      generateItineraryMarkdown(MOCK_ITINERARY);
      expect(MOCK_ITINERARY).toEqual(itineraryCopy);
    });

    it("generates safe filename from trip title", () => {
      expect(generateSafeFilename("Bhubaneswar & Konark Heritage Tour")).toBe(
        "o-travelz-itinerary-bhubaneswar-konark-heritage-tour.md"
      );
      expect(generateSafeFilename("Puri Beach & Chill!!! (Day 1)")).toBe(
        "o-travelz-itinerary-puri-beach-chill-day-1.md"
      );
      expect(generateSafeFilename("")).toBe("o-travelz-itinerary-odisha-trip.md");
    });

    it("triggers browser download using native Blob and ObjectURL", () => {
      const clickMock = vi.fn();
      const appendMock = vi.fn();
      const removeMock = vi.fn();
      const mockAnchor: any = {
        href: "",
        download: "",
        style: {},
        parentNode: null,
        click: clickMock,
      };

      vi.stubGlobal("document", {
        createElement: vi.fn(() => mockAnchor),
        body: {
          appendChild: vi.fn((el) => {
            el.parentNode = {};
            appendMock(el);
          }),
          removeChild: removeMock,
        },
      });

      const result = downloadItineraryMarkdown(MOCK_ITINERARY, "Custom Test Tour");
      expect(result).toBe(true);
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
    });
  });

  describe("2. Print Functionality & Native Browser Integration", () => {
    it("triggerPrintItinerary invokes native window.print()", () => {
      const printSpy = vi.fn();
      vi.stubGlobal("window", { print: printSpy });

      const res = triggerPrintItinerary();
      expect(res).toBe(true);
      expect(printSpy).toHaveBeenCalledTimes(1);
    });

    it("PrintableItineraryView renders paper-optimized layout", () => {
      const html = renderClean(
        <PrintableItineraryView
          itinerary={MOCK_ITINERARY}
          tripTitle="Bhubaneswar Heritage Circuit"
        />
      );

      expect(html).toContain("data-testid=\"printable-itinerary-view\"");
      expect(html).toContain("Bhubaneswar Heritage Circuit");
      expect(html).toContain("Day 1 — Old Temple Circuit");
      expect(html).toContain("Lingaraj Temple");
      expect(html).toContain("Mukteshwar Temple");
      expect(html).toContain("Konark Sun Temple");
      expect(html).toContain("Odisha Traveler &amp; Emergency Helplines");
      expect(html).toContain("112");
      expect(html).toContain("108");
      expect(html).toContain("1800-208-1414 / 1363");
      expect(html).toContain("break-inside-avoid");
    });
  });

  describe("3. ItineraryExportModal Component", () => {
    it("renders export modal when isOpen is true", () => {
      const html = renderClean(
        <ItineraryExportModal
          isOpen={true}
          onClose={() => {}}
          itinerary={MOCK_ITINERARY}
          tripTitle="Bhubaneswar 2-Day Tour"
        />
      );

      expect(html).toContain("Export Itinerary");
      expect(html).toContain("Print / Save as PDF");
      expect(html).toContain("Download Markdown (.md)");
      expect(html).toContain("Bhubaneswar 2-Day Tour");
      expect(html).toContain("3 Destinations");
      expect(html).toContain("Client-side export · No accounts required · ₹0 cloud cost");
    });

    it("returns null when isOpen is false", () => {
      const html = renderClean(
        <ItineraryExportModal
          isOpen={false}
          onClose={() => {}}
          itinerary={MOCK_ITINERARY}
        />
      );
      expect(html).toBe("");
    });

    it("handles null / empty itinerary gracefully", () => {
      const html = renderClean(
        <ItineraryExportModal
          isOpen={true}
          onClose={() => {}}
          itinerary={null}
        />
      );
      expect(html).toBe("");
    });
  });

  describe("4. ItineraryView Integration", () => {
    it("renders Export/Print action button in ItineraryView", () => {
      const html = renderClean(
        <ItineraryView itinerary={MOCK_ITINERARY} />
      );

      expect(html).toContain("data-testid=\"export-itinerary-button\"");
      expect(html).toContain("Export / Print");
      expect(html).toContain("data-testid=\"share-trip-button\"");
      expect(html).toContain("data-testid=\"copy-itinerary-button\"");
    });

    it("renders print-only PrintableItineraryView inside ItineraryView", () => {
      const html = renderClean(
        <ItineraryView itinerary={MOCK_ITINERARY} />
      );

      expect(html).toContain("class=\"print-only\"");
      expect(html).toContain("data-testid=\"printable-itinerary-view\"");
    });
  });

  describe("5. Security, Invariants & Zero-Cost Privacy", () => {
    it("does not leak authentication tokens, cookies, or secrets in export", () => {
      const md = generateItineraryMarkdown(MOCK_ITINERARY);

      expect(md).not.toContain("cookie");
      expect(md).not.toContain("session");
      expect(md).not.toContain("otravelz_session");
      expect(md).not.toContain("token");
      expect(md).not.toContain("bearer");
      expect(md).not.toContain("user_id");
    });

    it("contains 6 standard emergency helplines in constant registry", () => {
      expect(ODISHA_EMERGENCY_HELPLINES.length).toBe(6);
      expect(ODISHA_EMERGENCY_HELPLINES.some((c) => c.number === "112")).toBe(true);
      expect(ODISHA_EMERGENCY_HELPLINES.some((c) => c.number === "108")).toBe(true);
    });
  });
});
