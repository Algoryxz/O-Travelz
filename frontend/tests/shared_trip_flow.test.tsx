import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderToString } from "react-dom/server";
import { ShareTripModal } from "../src/components/itinerary/ShareTripModal";
import { SharedItineraryPage } from "../src/components/itinerary/SharedItineraryPage";
import { useAuth, setAuthStateForTesting } from "../src/store/useAuth";
import { apiClient, ApiError } from "../src/api/client";
import {
  extractShareIdFromHash,
  getTabFromHash,
  getHashForTab,
  isValidTabHash,
} from "../src/utils/navigation";
import type { ItineraryPlanResponse, PublicSharedTripResponse } from "../src/types/api";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

const MOCK_ITINERARY: ItineraryPlanResponse = {
  itinerary_id: "itin_test_999",
  explanation: "A scenic coastal and heritage tour of Puri and Konark.",
  constraints: {
    days: 2,
    interests: ["beach", "temple"],
    start: "Puri",
  },
  days: [
    {
      day_number: 1,
      theme: "Puri Coastal & Heritage",
      date: "2026-08-25",
      stops: [
        {
          place_id: "puri_beach_01",
          place_name: "Puri Beach",
          planned_arrival: "09:00",
          planned_departure: "11:00",
          sequence: 1,
          duration_minutes: 120,
          place: {
            id: "puri_beach_01",
            name: "Puri Beach",
            category: "beach",
            district: "Puri",
            region: "Coastal Odisha",
          },
        },
      ],
      hops: [],
    },
  ],
};

describe("Phase 14 Step 2: Shareable Itinerary Deep-Linking & Public Read-Only Trip Snapshot", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      location: { origin: "http://localhost:5173", hash: "", pathname: "/", search: "" },
      history: { pushState: vi.fn(), replaceState: vi.fn() },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn() } });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("1. URL Hash Extraction and Routing", () => {
    it("extractShareIdFromHash extracts ID from #trip/shared/{share_id}", () => {
      expect(extractShareIdFromHash("#trip/shared/abc12345_token")).toBe("abc12345_token");
      expect(extractShareIdFromHash("#/trip/shared/xyz98765")).toBe("xyz98765");
      expect(extractShareIdFromHash("#shared/token_short")).toBe("token_short");
      expect(extractShareIdFromHash("#plan")).toBeNull();
      expect(extractShareIdFromHash("")).toBeNull();
      expect(extractShareIdFromHash(null)).toBeNull();
    });

    it("getTabFromHash resolves 'shared' tab when share ID is present", () => {
      expect(getTabFromHash("#trip/shared/k8F_9vB1mXq-2zLwA0P_4Q")).toBe("shared");
      expect(getTabFromHash("#shared/k8F_9vB1mXq-2zLwA0P_4Q")).toBe("shared");
      expect(getTabFromHash("#plan")).toBe("plan");
      expect(getTabFromHash("#discover")).toBe("discover");
    });

    it("isValidTabHash recognizes shared routes as valid", () => {
      expect(isValidTabHash("#trip/shared/some_token")).toBe(true);
      expect(isValidTabHash("#shared/some_token")).toBe(true);
      expect(isValidTabHash("#invalid_unknown_hash")).toBe(false);
    });
  });

  describe("2. ShareTripModal Component", () => {
    it("renders account sign-in prompt when traveler is anonymous", () => {
      setAuthStateForTesting({ user: null, isAuthenticated: false, isLoading: false });

      const html = renderClean(
        <ShareTripModal
          isOpen={true}
          onClose={() => {}}
          itinerary={MOCK_ITINERARY}
          tripTitle="2-Day Puri Tour"
        />
      );

      expect(html).toContain("Account Required for Sharing");
      expect(html).toContain("Sign in with Google to Share");
    });

    it("renders generate share link button when traveler is authenticated", () => {
      setAuthStateForTesting({
        user: {
          id: "u123",
          email: "traveler@odisha.in",
          name: "Odisha Traveler",
          provider: "google",
        },
        isAuthenticated: true,
        isLoading: false,
      });

      const html = renderClean(
        <ShareTripModal
          isOpen={true}
          onClose={() => {}}
          itinerary={MOCK_ITINERARY}
          tripTitle="2-Day Puri Tour"
        />
      );

      expect(html).toContain("Generate Shareable Link");
      expect(html).toContain("Read-Only &amp; Private");
      expect(html).not.toContain("Account Required for Sharing");
    });

    it("does not render when isOpen is false", () => {
      const html = renderClean(
        <ShareTripModal
          isOpen={false}
          onClose={() => {}}
          itinerary={MOCK_ITINERARY}
          tripTitle="2-Day Puri Tour"
        />
      );
      expect(html).toBe("");
    });
  });

  describe("3. SharedItineraryPage Component", () => {
    it("renders loading state when shareId is loading", () => {
      const html = renderClean(
        <SharedItineraryPage
          shareId="some_pending_share_id"
          onPlanOwnTrip={() => {}}
        />
      );
      expect(html).toContain("Loading Shared Itinerary...");
    });

    it("renders error card when shareId is null or missing", () => {
      const html = renderClean(
        <SharedItineraryPage
          shareId={null}
          onPlanOwnTrip={() => {}}
        />
      );
      expect(html).toContain("Shared Trip Not Found");
      expect(html).toContain("Plan Your Own Odisha Itinerary");
    });
  });

  describe("4. API Client Share Contracts", () => {
    it("apiClient createSharedTrip posts to /api/v1/trips/share with credentials", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () =>
          JSON.stringify({
            share_id: "token_123",
            share_url: "/#trip/shared/token_123",
            created_at: 1700000000000,
          }),
      });

      const client = new (apiClient.constructor as any)({
        fetchFn: fetchSpy,
      });

      const payload = {
        title: "Puri Heritage",
        itinerary: MOCK_ITINERARY as any,
      };

      const res = await client.createSharedTrip(payload);
      expect(res.share_id).toBe("token_123");
      expect(res.share_url).toBe("/#trip/shared/token_123");
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/v1/trips/share",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        })
      );
    });

    it("apiClient getSharedTrip gets /api/v1/trips/shared/{share_id} publicly", async () => {
      const mockSnapshot: PublicSharedTripResponse = {
        share_id: "token_123",
        title: "Puri Heritage",
        itinerary: MOCK_ITINERARY,
        created_at: 1700000000000,
      };

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => JSON.stringify(mockSnapshot),
      });

      const client = new (apiClient.constructor as any)({
        fetchFn: fetchSpy,
      });

      const res = await client.getSharedTrip("token_123");
      expect(res.share_id).toBe("token_123");
      expect(res.title).toBe("Puri Heritage");
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/v1/trips/shared/token_123",
        expect.objectContaining({
          method: "GET",
        })
      );
    });
  });
});
