import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { LocationPermissionModal } from "../src/components/location/LocationPermissionModal";
import { PrivacyPolicyPage } from "../src/components/legal/PrivacyPolicyPage";
import { TermsConditionsPage } from "../src/components/legal/TermsConditionsPage";
import { ContactGrievancePage } from "../src/components/legal/ContactGrievancePage";
import { Footer } from "../src/components/nav/Footer";
import { TopNav } from "../src/components/nav/TopNav";
import { MapDetailsDrawer } from "../src/components/map/MapDetailsDrawer";
import { CANONICAL_INTERESTS } from "../src/components/itinerary/ConstraintForm";
import { getTabFromHash, getHashForTab } from "../src/utils/navigation";

function renderClean(element: React.ReactElement): string {
  return ReactDOMServer.renderToStaticMarkup(element);
}

describe("Phase 10: UX, Privacy, Legal & Map Dark Design Suite", () => {
  describe("1. Two-Step Geolocation Permission & Consent UX", () => {
    it("1.1 renders O-Travelz permission explanation with DPDP Act compliant wording", () => {
      const html = renderClean(
        <LocationPermissionModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
        />
      );

      expect(html).toContain("Enable Live Location");
      expect(html).toContain("O-Travelz can use your current location to show where you are on the map and improve nearby destination discovery.");
      expect(html).toContain("Your location is used only for these travel features. We will not use it for unrelated purposes.");
      expect(html).toContain("Allow Live Location");
      expect(html).toContain("Not Now");
      expect(html).toContain("Never logged · Processed on your device only");
    });

    it("1.2 renders error feedback and retry action when permission is blocked", () => {
      const html = renderClean(
        <LocationPermissionModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          error="Location access was denied in your browser settings."
          onRetry={() => {}}
        />
      );

      expect(html).toContain("Location access was denied in your browser settings.");
      expect(html).toContain("Retry Permission");
    });
  });

  describe("2. Indian DPDP Act 2023 Aligned Legal Pages", () => {
    it("2.1 renders Privacy Policy page with DPDP Act 2023 references and responsible data disclosures", () => {
      const html = renderClean(<PrivacyPolicyPage />);

      expect(html).toContain("O-Travelz Privacy Policy");
      expect(html).toContain("Digital Personal Data Protection Act, 2023");
      expect(html).toContain("Digital Personal Data Protection Rules, 2025");
      expect(html).toContain("Zero Cloud Tracking");
      expect(html).toContain("grievance@o-travelz.in");
    });

    it("2.2 renders Terms & Conditions page with Core Factuality Principle", () => {
      const html = renderClean(<TermsConditionsPage />);

      expect(html).toContain("O-Travelz Terms &amp; Conditions");
      expect(html).toContain("AI orchestrates and refines; it does not invent factual travel information.");
      expect(html).toContain("deterministic multi-day itinerary generation");
    });

    it("2.3 renders Contact & Grievance Redressal page with officer details and feedback form", () => {
      const html = renderClean(<ContactGrievancePage />);

      expect(html).toContain("Contact &amp; Grievance Redressal");
      expect(html).toContain("Punam &amp; Algoryxz Support Desk");
      expect(html).toContain("grievance@o-travelz.in");
      expect(html).toContain("Submit Grievance or Travel Feedback");
    });
  });

  describe("3. Persistent Legal Links & Navigation Synchronization", () => {
    it("3.1 renders persistent Privacy, Terms, and Grievance links in Footer", () => {
      const html = renderClean(<Footer selectedLocation="Bhubaneswar" />);

      expect(html).toContain("data-testid=\"footer-privacy-policy-link\"");
      expect(html).toContain("Privacy Policy");
      expect(html).toContain("data-testid=\"footer-terms-conditions-link\"");
      expect(html).toContain("Terms &amp; Conditions");
      expect(html).toContain("data-testid=\"footer-contact-grievance-link\"");
      expect(html).toContain("Contact / Grievance");
      expect(html).toContain("DPDP Act 2023 aligned");
    });

    it("3.2 maps legal hash routes correctly in navigation utility", () => {
      expect(getTabFromHash("#privacy")).toBe("privacy");
      expect(getTabFromHash("#terms")).toBe("terms");
      expect(getTabFromHash("#contact")).toBe("contact");

      expect(getHashForTab("privacy")).toBe("#privacy");
      expect(getHashForTab("terms")).toBe("#terms");
      expect(getHashForTab("contact")).toBe("#contact");
    });
  });

  describe("4. Dark Theme & Header Live Location Indicator", () => {
    it("4.1 renders persistent Live Location control with distinct states in TopNav", () => {
      const htmlNotGranted = renderClean(
        <TopNav
          activeTab="discover"
          onTabChange={() => {}}
          selectedLocation="Bhubaneswar"
          onLocationChange={() => {}}
          onOpenMobileDrawer={() => {}}
          locationStatus="not_granted"
        />
      );
      expect(htmlNotGranted).toContain("data-testid=\"header-live-location-control\"");
      expect(htmlNotGranted).toContain("Enable Location");

      const htmlGranted = renderClean(
        <TopNav
          activeTab="discover"
          onTabChange={() => {}}
          selectedLocation="Bhubaneswar"
          onLocationChange={() => {}}
          onOpenMobileDrawer={() => {}}
          locationStatus="granted"
          locationText="Bhubaneswar, Odisha"
        />
      );
      expect(htmlGranted).toContain("LIVE Location");
      expect(htmlGranted).toContain("Bhubaneswar, Odisha");
    });

    it("4.2 has 12 vibrant canonical traveler interest buttons with accessible styling", () => {
      expect(CANONICAL_INTERESTS.length).toBe(12);
      const interestIds = CANONICAL_INTERESTS.map((i) => i.id);
      expect(interestIds).toEqual([
        "heritage",
        "spirituality",
        "architecture",
        "food",
        "culture",
        "nature",
        "beach",
        "wildlife",
        "waterfall",
        "relaxation",
        "adventure",
        "shopping",
      ]);

      CANONICAL_INTERESTS.forEach((item) => {
        expect(item.unselectedClass).toBeDefined();
        expect(item.activeClass).toBeDefined();
        expect(item.iconClass).toBeDefined();
      });
    });
  });

  describe("5. Map Design System & Details Drawer", () => {
    it("5.1 renders MapDetailsDrawer with clean container cards", () => {
      const mockFeature = {
        canonical_ref: { id: "place_lingaraj_001", feature_type: "place" as const },
        geometry_status: "available" as const,
        geometry: { type: "Point" as const, coordinates: [85.8333, 20.2382] },
        name: "Lingaraj Temple",
        category: "heritage",
        feature_type: "destination" as const,
      };

      const html = renderClean(
        <MapDetailsDrawer
          features={[mockFeature]}
          relationships={[]}
          unavailableItems={[]}
        />
      );

      expect(html).toContain("Mapped Locations (1)");
      expect(html).toContain("Lingaraj Temple");
    });
  });
});
