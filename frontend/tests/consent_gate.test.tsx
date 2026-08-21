import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { TermsConsentGate } from "../src/components/legal/TermsConsentGate";
import { ItineraryPlannerPage } from "../src/pages/ItineraryPlannerPage";
import {
  CURRENT_TERMS_VERSION,
  TERMS_STORAGE_KEY,
  checkTermsConsentAccepted,
  saveTermsConsentAccepted,
  clearTermsConsent,
} from "../src/store/useTermsConsent";

function renderClean(element: React.ReactElement): string {
  return ReactDOMServer.renderToStaticMarkup(element);
}

describe("First-Launch Terms & Privacy Consent Gate Suite", () => {
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
      location: { hash: "" },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("1. First-time visitor sees full-screen branded consent gate", () => {
    const html = renderClean(<ItineraryPlannerPage initialConsentAccepted={false} />);

    expect(html).toContain("data-testid=\"terms-consent-gate\"");
    expect(html).toContain("Welcome to O-Travelz");
    expect(html).toContain("Before you continue, please review and accept our Terms &amp; Conditions and Privacy Policy.");
  });

  it("2. Main application components (header nav, hero, search, planner) are inaccessible until acceptance", () => {
    const html = renderClean(<ItineraryPlannerPage initialConsentAccepted={false} />);

    // Consent gate is present
    expect(html).toContain("data-testid=\"terms-consent-gate\"");

    // Core app navigation and hero must NOT be rendered
    expect(html).not.toContain("data-testid=\"nav-tab-discover\"");
    expect(html).not.toContain("data-testid=\"nav-tab-destinations\"");
    expect(html).not.toContain("data-testid=\"nav-tab-map\"");
    expect(html).not.toContain("data-testid=\"nav-tab-plan\"");
    expect(html).not.toContain("data-testid=\"constraint-form\"");
  });

  it("3. Accept button is disabled before acknowledgement checkbox is checked", () => {
    const html = renderClean(<TermsConsentGate onAccept={() => {}} />);

    expect(html).toContain("data-testid=\"accept-consent-btn\"");
    expect(html).toContain("data-testid=\"consent-checkbox\"");
    expect(html).toContain("disabled=\"\"");
  });

  it("4. Contains explicit acknowledgement control with required neutral legal phrasing", () => {
    const html = renderClean(<TermsConsentGate onAccept={() => {}} />);

    expect(html).toContain("I have read and agree to the Terms &amp; Conditions and Privacy Policy.");
    expect(html).not.toContain("fully legally compliant with all Indian laws");
  });

  it("5. Terms & Conditions preview action is clearly visible", () => {
    const html = renderClean(<TermsConsentGate onAccept={() => {}} />);

    expect(html).toContain("data-testid=\"view-terms-btn\"");
    expect(html).toContain("View Terms &amp; Conditions");
  });

  it("6. Privacy Policy preview action is clearly visible", () => {
    const html = renderClean(<TermsConsentGate onAccept={() => {}} />);

    expect(html).toContain("data-testid=\"view-privacy-btn\"");
    expect(html).toContain("View Privacy Policy");
  });

  it("7. Acceptance is stored with version in localStorage", () => {
    expect(checkTermsConsentAccepted()).toBe(false);

    saveTermsConsentAccepted(CURRENT_TERMS_VERSION);

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      TERMS_STORAGE_KEY,
      CURRENT_TERMS_VERSION
    );
    expect(checkTermsConsentAccepted()).toBe(true);
  });

  it("8. Subsequent visit after acceptance skips the gate and renders the main application", () => {
    // Simulate previously accepted state in localStorage
    storageStore[TERMS_STORAGE_KEY] = CURRENT_TERMS_VERSION;

    const html = renderClean(<ItineraryPlannerPage initialConsentAccepted={true} initialTab="discover" />);

    // Consent gate must NOT be present
    expect(html).not.toContain("data-testid=\"terms-consent-gate\"");

    // Normal application must be rendered
    expect(html).toContain("data-testid=\"nav-tab-discover\"");
    expect(html).toContain("safe • secure • smart");
  });

  it("9. Changing the Terms version causes the gate to appear again", () => {
    // Old version stored
    storageStore[TERMS_STORAGE_KEY] = "2025-01-01-v0";

    expect(checkTermsConsentAccepted()).toBe(false);

    const html = renderClean(<ItineraryPlannerPage initialConsentAccepted={false} />);
    expect(html).toContain("data-testid=\"terms-consent-gate\"");
  });

  it("10. No geolocation API is called during the consent process", () => {
    const geoMock = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
    };
    vi.stubGlobal("navigator", {
      geolocation: geoMock,
    });

    const onAcceptMock = vi.fn();
    renderClean(<TermsConsentGate onAccept={onAcceptMock} />);

    expect(geoMock.getCurrentPosition).not.toHaveBeenCalled();
    expect(geoMock.watchPosition).not.toHaveBeenCalled();
  });

  it("11. Existing legal navigation links (Privacy, Terms, Contact) remain accessible in Footer after acceptance", () => {
    const html = renderClean(<ItineraryPlannerPage initialConsentAccepted={true} initialTab="discover" />);

    expect(html).toContain("data-testid=\"footer-privacy-policy-link\"");
    expect(html).toContain("data-testid=\"footer-terms-conditions-link\"");
    expect(html).toContain("data-testid=\"footer-contact-grievance-link\"");
  });

  it("12. Existing application behavior (destinations, planner, map) remains fully functional after acceptance", () => {
    const htmlDest = renderClean(<ItineraryPlannerPage initialConsentAccepted={true} initialTab="destinations" />);
    expect(htmlDest).toContain("data-testid=\"destinations-explore-view\"");

    const htmlPlan = renderClean(<ItineraryPlannerPage initialConsentAccepted={true} initialTab="plan" />);
    expect(htmlPlan).toContain("data-testid=\"constraint-form\"");

    const htmlMap = renderClean(<ItineraryPlannerPage initialConsentAccepted={true} initialTab="map" />);
    expect(htmlMap).toContain("Odisha Interactive Map");
  });
});
