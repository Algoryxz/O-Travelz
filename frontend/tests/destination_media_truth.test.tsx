import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { PlaceDetailsModal } from "../src/components/place/PlaceDetailsModal";
import { DestinationMedia } from "../src/components/media/DestinationMedia";
import { ThreeDViewer, is3DHeritageAvailable } from "../src/components/media/ThreeDViewer";
import { VideoPreview, isVideoPreviewAvailable } from "../src/components/media/VideoPreview";
import { getPlaceGallery } from "../src/utils/imageService";

describe("Wave D1 — Media Suite Truth & Place Identity Regression Suite", () => {
  describe("1. Photo Deduplication & Variant Truth", () => {
    it("deduplicates hero, card, thumbnail variants into 1 distinct photograph for Odisha State Museum in DestinationMedia", () => {
      const html = renderToString(
        <DestinationMedia
          placeId="place_bbsr_008"
          placeName="Odisha State Museum"
          category="museum"
        />
      );
      expect(html).toContain("Photos (1)");
      expect(html).toContain("/places/place_bbsr_008/dc85cc5814e7/hero.webp");
    });

    it("renders 'Photos (1)' and omits carousel navigation arrows when only 1 distinct photo exists", () => {
      const html = renderToString(
        <DestinationMedia
          placeId="place_bbsr_008"
          placeName="Odisha State Museum"
          category="museum"
        />
      );

      // Photos tab label must report exactly 1
      expect(html).toContain("Photos (1)");

      // Navigation arrows must not exist for single image
      expect(html).not.toContain("gallery-prev-btn");
      expect(html).not.toContain("gallery-next-btn");
    });
  });

  describe("2. Strict 3D Heritage Boundary (Never Leak Konark)", () => {
    it("is3DHeritageAvailable correctly validates only the 4 canonical monuments", () => {
      expect(is3DHeritageAvailable("place_konark_001", "Konark Sun Temple")).toBe(true);
      expect(is3DHeritageAvailable("place_puri_001", "Puri Jagannath Temple")).toBe(true);
      expect(is3DHeritageAvailable("place_bbsr_001", "Lingaraj Temple")).toBe(true);
      expect(is3DHeritageAvailable("place_019", "Brahmeswar Temple")).toBe(true);

      // Other places must strictly evaluate to false
      expect(is3DHeritageAvailable("place_bbsr_008", "Odisha State Museum")).toBe(false);
      expect(is3DHeritageAvailable("place_puri_002", "Puri Golden Beach")).toBe(false);
      expect(is3DHeritageAvailable("place_daringbadi_001", "Daringbadi")).toBe(false);
      expect(is3DHeritageAvailable("unknown_place_999", "Random Park")).toBe(false);
    });

    it("ThreeDViewer displays honest unavailable card and NEVER renders Konark for non-3D destinations", () => {
      const html = renderToString(
        <ThreeDViewer
          placeId="place_bbsr_008"
          placeName="Odisha State Museum"
        />
      );

      // Must show unavailable card
      expect(html).toContain("threed-unavailable");
      expect(html).toContain("3D Reconstruction Unavailable");

      // Must NOT mention Konark Sun Temple
      expect(html).not.toContain("Konark Sun Temple —");
      expect(html).not.toContain("Surya Chakra");
    });

    it("ThreeDViewer allows 3D scene loading for canonical monuments", () => {
      const konarkHtml = renderToString(
        <ThreeDViewer
          placeId="place_konark_001"
          placeName="Konark Sun Temple"
        />
      );
      expect(konarkHtml).not.toContain("threed-unavailable");

      const puriHtml = renderToString(
        <ThreeDViewer
          placeId="place_puri_001"
          placeName="Puri Jagannath Temple"
        />
      );
      expect(puriHtml).not.toContain("threed-unavailable");

      const lingarajHtml = renderToString(
        <ThreeDViewer
          placeId="place_bbsr_001"
          placeName="Lingaraj Temple"
        />
      );
      expect(lingarajHtml).not.toContain("threed-unavailable");

      const brahmeswarHtml = renderToString(
        <ThreeDViewer
          placeId="place_019"
          placeName="Brahmeswar Temple"
        />
      );
      expect(brahmeswarHtml).not.toContain("threed-unavailable");
    });
  });

  describe("3. Honest Video Preview", () => {
    it("isVideoPreviewAvailable detects missing or empty video URLs", () => {
      expect(isVideoPreviewAvailable(null)).toBe(false);
      expect(isVideoPreviewAvailable({ video_url: "" } as any)).toBe(false);
      expect(isVideoPreviewAvailable({ video_url: "https://example.com/video.mp4" } as any)).toBe(true);
    });

    it("VideoPreview renders unavailable overlay without fake play button or scrubber when videoUrl is absent", () => {
      const html = renderToString(
        <VideoPreview
          placeId="place_bbsr_008"
          placeName="Odisha State Museum"
          video={null}
        />
      );

      expect(html).toContain("video-unavailable-overlay");
      expect(html).toContain("Video Preview Unavailable");

      // Play button and scrubber slider must NOT exist
      expect(html).not.toContain('type="range"');
      expect(html).not.toContain('title="Play"');
    });
  });

  describe("4. Destination Details Modal Layout & Header Truth", () => {
    it("displays destination name in the fixed header bar immediately on modal open", () => {
      const html = renderToString(
        <PlaceDetailsModal
          place={{
            id: "place_bbsr_008",
            name: "Odisha State Museum",
            category: "museum",
            location: "Bhubaneswar",
            description: "State cultural archive and museum.",
          }}
          onClose={() => {}}
        />
      );

      // Must have H2 destination title directly rendered
      expect(html).toContain("Odisha State Museum");
      expect(html).toMatch(/<h2[^>]*>Odisha State Museum<\/h2>/);
    });

    it("does NOT borrow place_konark_001 when place id is missing or empty", () => {
      const html = renderToString(
        <PlaceDetailsModal
          place={{
            name: "Custom Cultural Spot",
            category: "culture",
            description: "A lovely spot.",
          }}
          onClose={() => {}}
        />
      );

      // Should not contain Konark Sun Temple anywhere in the modal
      expect(html).not.toContain("Konark Sun Temple");
      expect(html).not.toContain("place_konark_001");
    });

    it("omits 3D and Video tabs when viewing non-3D, non-video destination", () => {
      const html = renderToString(
        <PlaceDetailsModal
          place={{
            id: "place_bbsr_008",
            name: "Odisha State Museum",
            category: "museum",
            location: "Bhubaneswar",
          }}
          onClose={() => {}}
        />
      );

      expect(html).toContain("media-tab-photos");
      expect(html).not.toContain("media-tab-3d");
      expect(html).not.toContain("media-tab-video");
    });

    it("renders 3D tab for Konark Sun Temple", () => {
      const html = renderToString(
        <PlaceDetailsModal
          place={{
            id: "place_konark_001",
            name: "Konark Sun Temple",
            category: "monuments & heritage",
            location: "Konark",
          }}
          onClose={() => {}}
        />
      );

      expect(html).toContain("media-tab-3d");
    });
  });
});
