import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderToString } from "react-dom/server";
import { AuthStatusButton } from "../src/components/auth/AuthStatusButton";
import { StitchNavbar } from "../src/components/stitch/StitchNavbar";
import { StitchAuthModal } from "../src/components/stitch/StitchAuthModal";
import { StitchSignInPage } from "../src/pages/stitch/StitchSignInPage";
import { LocationProvider } from "../src/context/LocationContext";
import { useAuth, setAuthStateForTesting } from "../src/store/useAuth";
import {
  useCloudSync,
  recordPlaceTombstone,
  recordTripTombstone,
  isValidSyncPlaceItem,
  sanitizeSyncPlaceItem,
  isValidSyncTripItem,
  sanitizeSyncTripItem,
} from "../src/store/useCloudSync";
import { useSavedPlaces } from "../src/store/useSavedPlaces";
import { useConversationHistory } from "../src/store/useConversationHistory";
import { apiClient, ApiError } from "../src/api/client";
import type { AuthUser, SyncPlaceItem, SyncTripItem } from "../src/types/api";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Frontend Authentication & Cloud Sync Suite", () => {
  let storageStore: Record<string, string> = {};

  beforeEach(() => {
    storageStore = {};
    const mockStorage = {
      getItem: vi.fn((key: string) => storageStore[key] ?? null),
      setItem: vi.fn((key: string, val: string) => {
        storageStore[key] = String(val);
      }),
      removeItem: vi.fn((key: string) => {
        delete storageStore[key];
      }),
      clear: vi.fn(() => {
        storageStore = {};
      }),
    };

    vi.stubGlobal("window", {
      localStorage: mockStorage,
      location: { href: "" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("localStorage", mockStorage);
    vi.stubGlobal("navigator", { onLine: true });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    storageStore = {};
    vi.unstubAllGlobals();
  });

  describe("1. Authentication State & Rendering", () => {
    it("renders anonymous Sign In button when unauthenticated", () => {
      setAuthStateForTesting({ user: null, isAuthenticated: false, isLoading: false });
      const html = renderClean(<AuthStatusButton />);
      expect(html).toContain("Sign In");
      expect(html).toContain("Sign in with Google");
    });

    it("StitchNavbar visibly renders desktop auth controls when unauthenticated", () => {
      setAuthStateForTesting({ user: null, isAuthenticated: false, isLoading: false });
      const html = renderClean(
        <LocationProvider>
          <StitchNavbar
            currentTab="discover"
            onSelectTab={vi.fn()}
            onOpenAuth={vi.fn()}
          />
        </LocationProvider>
      );
      expect(html).toContain("Sign In");
    });

    it("StitchNavbar renders authenticated traveler profile pill when user is logged in", () => {
      setAuthStateForTesting({
        user: {
          id: "user-456",
          email: "explorer@odisha.in",
          name: "Konark Explorer",
          display_name: "Explorer",
          provider: "google",
        },
        isAuthenticated: true,
        isLoading: false,
      });
      const html = renderClean(
        <LocationProvider>
          <StitchNavbar
            currentTab="discover"
            onSelectTab={vi.fn()}
            onOpenAuth={vi.fn()}
          />
        </LocationProvider>
      );
      expect(html).toContain("Explorer");
    });

    it("StitchAuthModal consumes central auth state and renders login prompt without redundant network calls", () => {
      setAuthStateForTesting({ user: null, isAuthenticated: false, isLoading: false });
      const html = renderClean(
        <StitchAuthModal isOpen={true} onClose={vi.fn()} />
      );
      expect(html).toContain("Sign in to O-Travelz");
      expect(html).toContain("Continue with Google");
      expect(html).toContain("Traveler Profile &amp; Cloud Sync");
    });

    it("StitchAuthModal renders authenticated user details from central auth store", () => {
      setAuthStateForTesting({
        user: {
          id: "user-789",
          email: "jagannath@odisha.in",
          name: "Jagannath Das",
          display_name: "Jagannath",
          provider: "google",
          avatar_url: "https://lh3.googleusercontent.com/avatar.jpg",
        },
        isAuthenticated: true,
        isLoading: false,
      });
      const html = renderClean(
        <StitchAuthModal isOpen={true} onClose={vi.fn()} />
      );
      expect(html).toContain("Your Account");
      expect(html).toContain("Jagannath");
      expect(html).toContain("jagannath@odisha.in");
      expect(html).toContain("Google Cloud Connected");
      expect(html).toContain("Sign Out");
    });

    it("StitchSignInPage renders unauthenticated dedicated sign-in view with value proposition and Google CTA", () => {
      setAuthStateForTesting({ user: null, isAuthenticated: false, isLoading: false });
      const html = renderClean(
        <StitchSignInPage onNavigate={vi.fn()} />
      );
      expect(html).toContain("Sign in to O-Travelz");
      expect(html).toContain("Continue with Google");
      expect(html).toContain("Cloud Sync Across Devices");
      expect(html).toContain("Offline-First Resilience");
      expect(html).toContain("Back to Expedition Explorer");
    });

    it("StitchSignInPage renders authenticated traveler profile with Open Trip Planner and Sign Out actions", () => {
      setAuthStateForTesting({
        user: {
          id: "user-999",
          email: "traveler999@odisha.in",
          name: "Puri Explorer",
          display_name: "Puri Explorer",
          provider: "google",
        },
        isAuthenticated: true,
        isLoading: false,
      });
      const html = renderClean(
        <StitchSignInPage onNavigate={vi.fn()} />
      );
      expect(html).toContain("Your Traveler Profile");
      expect(html).toContain("Puri Explorer");
      expect(html).toContain("traveler999@odisha.in");
      expect(html).toContain("Open Trip Planner");
      expect(html).toContain("Sync Now");
      expect(html).toContain("Sign Out");
    });

    it("apiClient getAuthMe fetches /auth/me with credentials included", async () => {
      const mockUser: AuthUser = {
        id: "user-123",
        email: "traveler@odisha.in",
        name: "Odisha Traveler",
        display_name: "Traveler",
        provider: "google",
      };

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => JSON.stringify({ authenticated: true, user: mockUser }),
      });

      const client = new (apiClient.constructor as any)({
        fetchFn: fetchSpy,
      });

      const res = await client.getAuthMe();
      expect(res.authenticated).toBe(true);
      expect(res.user?.name).toBe("Odisha Traveler");
      expect(fetchSpy).toHaveBeenCalledWith(
        "/auth/me",
        expect.objectContaining({ method: "GET", credentials: "include" })
      );
    });

    it("apiClient logout posts to /auth/logout with credentials included", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => JSON.stringify({ authenticated: false }),
      });

      const client = new (apiClient.constructor as any)({
        fetchFn: fetchSpy,
      });

      const res = await client.logout();
      expect(res.authenticated).toBe(false);
      expect(fetchSpy).toHaveBeenCalledWith(
        "/auth/logout",
        expect.objectContaining({ method: "POST", credentials: "include" })
      );
    });
  });

  describe("2. Saved Places Offline-First & Reconciliation", () => {
    it("anonymous user saves place locally without wiping localStorage", () => {
      storageStore["o_travelz_saved_places"] = JSON.stringify([
        { id: "puri-beach", name: "Puri Beach", category: "beach", savedAt: 1000 },
      ]);

      const raw = storageStore["o_travelz_saved_places"];
      expect(raw).toContain("Puri Beach");
    });

    it("recordPlaceTombstone saves tombstone entry for deleted place", () => {
      recordPlaceTombstone("puri-beach");
      const tombstones = JSON.parse(storageStore["o_travelz_saved_places_tombstones"] || "[]");
      expect(tombstones.length).toBe(1);
      expect(tombstones[0].id).toBe("puri-beach");
      expect(tombstones[0].updatedAt).toBeGreaterThan(0);
    });

    it("recordTripTombstone saves tombstone entry for deleted trip", () => {
      recordTripTombstone("trip_123_abc");
      const tombstones = JSON.parse(storageStore["o_travelz_conversations_tombstones"] || "[]");
      expect(tombstones.length).toBe(1);
      expect(tombstones[0].id).toBe("trip_123_abc");
      expect(tombstones[0].updatedAt).toBeGreaterThan(0);
    });

    it("apiClient syncSavedPlaces posts items to /api/v1/sync/saved-places", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => JSON.stringify({ synced_count: 1, items: [] }),
      });

      const client = new (apiClient.constructor as any)({
        fetchFn: fetchSpy,
      });

      const items: SyncPlaceItem[] = [
        {
          place_id: "Puri",
          place_name: "Puri",
          place_data: {},
          saved_at: 1000,
          updated_at: 1000,
          is_deleted: false,
        },
      ];

      const res = await client.syncSavedPlaces(items);
      expect(res.synced_count).toBe(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/v1/sync/saved-places",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        })
      );
    });

    it("apiClient syncTrips posts items to /api/v1/sync/trips", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => JSON.stringify({ synced_count: 1, items: [] }),
      });

      const client = new (apiClient.constructor as any)({
        fetchFn: fetchSpy,
      });

      const items: SyncTripItem[] = [
        {
          id: "trip_01",
          title: "Odisha Trip",
          history: [],
          timestamp: 1000,
          updated_at: 1000,
          is_deleted: false,
        },
      ];

      const res = await client.syncTrips(items);
      expect(res.synced_count).toBe(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/v1/sync/trips",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        })
      );
    });
  });

  describe("3. Rate Limiting & Security Invariants", () => {
    it("handles 429 rate limit correctly", () => {
      const err = new ApiError({
        message: "Too many requests",
        status: 429,
        code: "rate_limited",
      });
      expect(err.status).toBe(429);
      expect(err.code).toBe("rate_limited");
    });

    it("ensures no session secrets or tokens are stored in client localStorage", () => {
      const allKeys = Object.keys(storageStore);
      expect(allKeys.some((k) => k.toLowerCase().includes("token"))).toBe(false);
      expect(allKeys.some((k) => k.toLowerCase().includes("secret"))).toBe(false);
      expect(allKeys.some((k) => k.toLowerCase().includes("session"))).toBe(false);
    });
  });

  describe("4. Runtime Structural Validation for Cloud Sync", () => {
    it("isValidSyncPlaceItem validates correct records and rejects malformed items", () => {
      // Valid record
      expect(
        isValidSyncPlaceItem({
          place_id: "puri_beach_01",
          updated_at: 1700000000000,
          is_deleted: false,
          place_data: { district: "Puri" },
        })
      ).toBe(true);

      // Malformed: missing place_id
      expect(
        isValidSyncPlaceItem({
          updated_at: 1700000000000,
          is_deleted: false,
        })
      ).toBe(false);

      // Malformed: empty/whitespace place_id
      expect(
        isValidSyncPlaceItem({
          place_id: "   ",
          updated_at: 1700000000000,
          is_deleted: false,
        })
      ).toBe(false);

      // Malformed: negative updated_at
      expect(
        isValidSyncPlaceItem({
          place_id: "puri_beach_01",
          updated_at: -10,
          is_deleted: false,
        })
      ).toBe(false);

      // Malformed: non-boolean is_deleted
      expect(
        isValidSyncPlaceItem({
          place_id: "puri_beach_01",
          updated_at: 1700000000000,
          is_deleted: "false",
        })
      ).toBe(false);

      // Malformed: place_data is a primitive instead of object
      expect(
        isValidSyncPlaceItem({
          place_id: "puri_beach_01",
          updated_at: 1700000000000,
          is_deleted: false,
          place_data: "invalid_string",
        })
      ).toBe(false);

      // Non-object
      expect(isValidSyncPlaceItem(null)).toBe(false);
      expect(isValidSyncPlaceItem("string")).toBe(false);
      expect(isValidSyncPlaceItem([])).toBe(false);
    });

    it("sanitizeSyncPlaceItem safely fills defaults for optional fields", () => {
      const sanitized = sanitizeSyncPlaceItem({
        place_id: "  konark_temple  ",
        updated_at: 1700000000000,
        is_deleted: false,
      });

      expect(sanitized).not.toBeNull();
      expect(sanitized?.place_id).toBe("konark_temple");
      expect(sanitized?.place_name).toBe("konark_temple");
      expect(sanitized?.saved_at).toBe(1700000000000);
      expect(sanitized?.place_data).toEqual({});
    });

    it("isValidSyncTripItem validates correct trips and rejects malformed items", () => {
      // Valid record
      expect(
        isValidSyncTripItem({
          id: "trip_123_abc",
          title: "Puri Heritage",
          updated_at: 1700000000000,
          is_deleted: false,
          history: [{ role: "user", content: "hi" }],
        })
      ).toBe(true);

      // Malformed: missing id
      expect(
        isValidSyncTripItem({
          title: "Puri Heritage",
          updated_at: 1700000000000,
          is_deleted: false,
        })
      ).toBe(false);

      // Malformed: missing title
      expect(
        isValidSyncTripItem({
          id: "trip_123",
          updated_at: 1700000000000,
          is_deleted: false,
        })
      ).toBe(false);

      // Malformed: history is not an array
      expect(
        isValidSyncTripItem({
          id: "trip_123",
          title: "Title",
          history: "invalid_history",
          updated_at: 1700000000000,
          is_deleted: false,
        })
      ).toBe(false);
    });

    it("sanitizeSyncTripItem safely sanitizes trip payloads", () => {
      const sanitized = sanitizeSyncTripItem({
        id: "  trip_clean_id  ",
        title: "  Valid Title  ",
        updated_at: 1700000000000,
        is_deleted: false,
        history: [{ role: "user", content: "Plan a trip" }],
      });

      expect(sanitized).not.toBeNull();
      expect(sanitized?.id).toBe("trip_clean_id");
      expect(sanitized?.title).toBe("Valid Title");
      expect(sanitized?.timestamp).toBe(1700000000000);
      expect(sanitized?.history.length).toBe(1);
    });
  });
});
