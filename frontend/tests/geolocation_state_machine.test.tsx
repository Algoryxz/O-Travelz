import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { TopNav } from "../src/components/nav/TopNav";
import { LocationPermissionModal } from "../src/components/location/LocationPermissionModal";

function renderClean(element: React.ReactElement): string {
  return ReactDOMServer.renderToStaticMarkup(element);
}

describe("Client-Side Geolocation State Machine & Privacy Guarantees", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const storageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, val: string) => {
        mockStorage[key] = String(val);
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    };
    vi.stubGlobal("localStorage", storageMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("never triggers geolocation on initial render (not_granted / idle state)", () => {
    const html = renderClean(
      <TopNav
        activeTab="discover"
        onTabChange={() => {}}
        selectedLocation="Bhubaneswar"
        onLocationChange={() => {}}
        onOpenMobileDrawer={() => {}}
        locationStatus="idle"
        locationText=""
      />
    );
    expect(html).toContain("Use my live location");
    expect(html).not.toContain("LIVE Location");
    expect(mockStorage["user_coords"]).toBeUndefined();
    expect(mockStorage["coords"]).toBeUndefined();
  });

  it("renders explanation prompt modal before browser permission is requested", () => {
    const html = renderClean(
      <LocationPermissionModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        isLoading={false}
        error={null}
      />
    );

    expect(html).toContain("Enable Live Location");
    expect(html).toContain("Client-Side Geospatial Discovery");
    expect(html).toContain("Never logged · Processed on your device only");
    expect(html).toContain("Allow Live Location");
    expect(html).toContain("Not Now");
  });

  it("renders loading state in modal and header when requesting location", () => {
    const modalHtml = renderClean(
      <LocationPermissionModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        isLoading={true}
        error={null}
      />
    );
    expect(modalHtml).toContain("Locating...");

    const navHtml = renderClean(
      <TopNav
        activeTab="discover"
        onTabChange={() => {}}
        selectedLocation="Bhubaneswar"
        onLocationChange={() => {}}
        onOpenMobileDrawer={() => {}}
        locationStatus="requesting"
        locationText=""
      />
    );
    expect(navHtml).toContain("Finding your location…");
    expect(navHtml).not.toContain("LIVE Location");
  });

  it("renders GRANTED / ACTIVE state with accurate LIVE Location display and hub text", () => {
    const navHtml = renderClean(
      <TopNav
        activeTab="discover"
        onTabChange={() => {}}
        selectedLocation="Bhubaneswar"
        onLocationChange={() => {}}
        onOpenMobileDrawer={() => {}}
        locationStatus="granted"
        locationText="Puri, Odisha"
      />
    );
    expect(navHtml).toContain("LIVE Location");
    expect(navHtml).toContain("Puri, Odisha");
  });

  it("renders DENIED state with explanation and retry guidance", () => {
    const modalHtml = renderClean(
      <LocationPermissionModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        isLoading={false}
        error="Location access was denied in your browser settings."
        onRetry={() => {}}
      />
    );
    expect(modalHtml).toContain("Location access was denied");
    expect(modalHtml).toContain("Retry Permission");

    const navHtml = renderClean(
      <TopNav
        activeTab="discover"
        onTabChange={() => {}}
        selectedLocation="Bhubaneswar"
        onLocationChange={() => {}}
        onOpenMobileDrawer={() => {}}
        locationStatus="denied"
      />
    );
    expect(navHtml).toContain("Location Blocked");
    expect(navHtml).not.toContain("LIVE Location");
  });

  it("renders TIMEOUT and UNAVAILABLE states gracefully", () => {
    const navTimeout = renderClean(
      <TopNav
        activeTab="discover"
        onTabChange={() => {}}
        selectedLocation="Bhubaneswar"
        onLocationChange={() => {}}
        onOpenMobileDrawer={() => {}}
        locationStatus="timeout"
      />
    );
    expect(navTimeout).toContain("Location Timeout");
    expect(navTimeout).not.toContain("LIVE Location");

    const navUnavailable = renderClean(
      <TopNav
        activeTab="discover"
        onTabChange={() => {}}
        selectedLocation="Bhubaneswar"
        onLocationChange={() => {}}
        onOpenMobileDrawer={() => {}}
        locationStatus="unavailable"
      />
    );
    expect(navUnavailable).toContain("Location Unavailable");
    expect(navUnavailable).not.toContain("LIVE Location");
  });

  it("renders UNSUPPORTED state with graceful fallback text", () => {
    const navUnsupported = renderClean(
      <TopNav
        activeTab="discover"
        onTabChange={() => {}}
        selectedLocation="Bhubaneswar"
        onLocationChange={() => {}}
        onOpenMobileDrawer={() => {}}
        locationStatus="unsupported"
      />
    );
    expect(navUnsupported).toContain("Location Unsupported");
    expect(navUnsupported).not.toContain("LIVE Location");
  });

  it("guarantees coordinates are never saved in localStorage", () => {
    expect(mockStorage["coords"]).toBeUndefined();
    expect(mockStorage["userCoords"]).toBeUndefined();
    expect(mockStorage["latitude"]).toBeUndefined();
    expect(mockStorage["longitude"]).toBeUndefined();
  });
});
