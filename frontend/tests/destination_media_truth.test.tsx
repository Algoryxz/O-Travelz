import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { PlaceDetailsModal } from "../src/components/place/PlaceDetailsModal";
import { DestinationMedia } from "../src/components/media/DestinationMedia";
import {
  ThreeDViewer,
  is3DHeritageAvailable,
  matchCanonical3DSceneId,
} from "../src/components/media/ThreeDViewer";
import { VideoPreview, isVideoPreviewAvailable } from "../src/components/media/VideoPreview";
import { getSourcePhotoIdentity } from "../src/utils/imageAdapter";
import type { PlaceImageContract } from "../src/types/api";

describe("Wave D1 — Media Suite Truth & Place Identity Regression Suite", () => {
  describe("1. Photo Deduplication & Distinct Source Photograph Invariants", () => {
    it("deduplicates hero, card, thumbnail variants into 1 distinct photograph for Odisha State Museum", () => {
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

      expect(html).toContain("Photos (1)");
      expect(html).not.toContain("gallery-prev-btn");
      expect(html).not.toContain("gallery-next-btn");
    });

    it("getSourcePhotoIdentity strictly prioritizes media_asset_id -> content_sha256 -> asset_hash -> id", () => {
      // 1. media_asset_id highest precedence
      const asset1 = {
        url: "https://example.com/hero.webp",
        media_asset_id: "asset_alpha_123",
        content_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        asset_hash: "hash_999",
        id: "img_001",
      };
      expect(getSourcePhotoIdentity(asset1)).toBe("media_asset_id:asset_alpha_123");

      // 2. content_sha256 second precedence
      const asset2 = {
        url: "https://example.com/card.webp",
        content_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        asset_hash: "hash_999",
        id: "img_002",
      };
      expect(getSourcePhotoIdentity(asset2)).toBe(
        "content_sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      );

      // 3. asset_hash third precedence
      const asset3 = {
        url: "https://example.com/thumbnail.webp",
        asset_hash: "06a456469886",
        id: "img_003",
      };
      expect(getSourcePhotoIdentity(asset3)).toBe("asset_hash:06a456469886");

      // 4. asset directory extracted from storage_key or url
      const assetPath = {
        url: "/static/images/places/place_bbsr_001/06a456469886/hero.webp",
      };
      expect(getSourcePhotoIdentity(assetPath)).toBe("asset_hash:06a456469886");

      // 5. canonical source image id
      const assetId = {
        url: "https://example.com/custom.jpg",
        id: "img_canonical_42",
      };
      expect(getSourcePhotoIdentity(assetId)).toBe("image_id:img_canonical_42");
    });

    it("deduplicates three different URLs belonging to one media asset into Photos (1)", () => {
      const threeVariantsOfOneAsset: PlaceImageContract[] = [
        {
          url: "https://cdn.otravelz.com/assets/media_001/hero.webp",
          media_asset_id: "media_asset_canonical_001",
          title: "Lingaraj Rekha Deula Hero",
        },
        {
          url: "https://cdn.otravelz.com/assets/media_001/card.webp",
          media_asset_id: "media_asset_canonical_001",
          title: "Lingaraj Rekha Deula Card",
        },
        {
          url: "https://cdn.otravelz.com/assets/media_001/thumbnail.webp",
          media_asset_id: "media_asset_canonical_001",
          title: "Lingaraj Rekha Deula Thumb",
        },
      ];

      const html = renderToString(
        <DestinationMedia
          placeId="place_bbsr_001"
          placeName="Lingaraj Temple"
          category="monuments & heritage"
          images={threeVariantsOfOneAsset}
        />
      );

      expect(html).toContain("Photos (1)");
      expect(html).not.toContain("Photos (3)");
    });

    it("renders Photos (3) when three genuinely independent source assets are provided", () => {
      const threeDistinctPhotographs: PlaceImageContract[] = [
        {
          url: "https://cdn.otravelz.com/photos/temple_facade.webp",
          media_asset_id: "source_asset_photo_1",
          title: "Temple Facade Morning",
        },
        {
          url: "https://cdn.otravelz.com/photos/sanctum_vimana.webp",
          media_asset_id: "source_asset_photo_2",
          title: "Sanctum Vimana Architecture",
        },
        {
          url: "https://cdn.otravelz.com/photos/chlorite_sculpture.webp",
          media_asset_id: "source_asset_photo_3",
          title: "Chlorite Wall Carving",
        },
      ];

      const html = renderToString(
        <DestinationMedia
          placeId="place_bbsr_001"
          placeName="Lingaraj Temple"
          category="monuments & heritage"
          images={threeDistinctPhotographs}
        />
      );

      expect(html).toContain("Photos (3)");
      expect(html).toContain("gallery-prev-btn");
      expect(html).toContain("gallery-next-btn");
    });
  });

  describe("2. 3D Authority & Adversarial Boundary Auditing", () => {
    it("exact canonical Konark ID => Konark 3D", () => {
      expect(is3DHeritageAvailable("place_konark_001")).toBe(true);
      expect(matchCanonical3DSceneId("place_konark_001")).toBe("konark-sun-temple");
    });

    it("exact canonical Lingaraj ID => Lingaraj 3D", () => {
      expect(is3DHeritageAvailable("place_bbsr_001")).toBe(true);
      expect(matchCanonical3DSceneId("place_bbsr_001")).toBe("lingaraj-temple");
      expect(is3DHeritageAvailable("place_001")).toBe(true);
      expect(matchCanonical3DSceneId("place_001")).toBe("lingaraj-temple");
    });

    it("exact canonical Puri and Brahmeswar IDs => authentic 3D", () => {
      expect(is3DHeritageAvailable("place_puri_001")).toBe(true);
      expect(matchCanonical3DSceneId("place_puri_001")).toBe("puri-jagannath-temple");
      expect(is3DHeritageAvailable("place_019")).toBe(true);
      expect(matchCanonical3DSceneId("place_019")).toBe("brahmeswara-temple");
      expect(is3DHeritageAvailable("place_bbsr_005")).toBe(true);
      expect(matchCanonical3DSceneId("place_bbsr_005")).toBe("brahmeswara-temple");
    });

    it("ADVERSARIAL: 'Konark Museum' must NOT receive Konark Sun Temple 3D", () => {
      expect(is3DHeritageAvailable(undefined, "Konark Museum")).toBe(false);
      expect(matchCanonical3DSceneId(undefined, "Konark Museum")).toBe(null);

      const html = renderToString(
        <ThreeDViewer placeName="Konark Museum" />
      );
      expect(html).toContain("threed-unavailable");
      expect(html).not.toContain("Surya Chakra");
    });

    it("ADVERSARIAL: 'Jagannath Museum' must NOT receive Jagannath Temple 3D", () => {
      expect(is3DHeritageAvailable(undefined, "Jagannath Museum")).toBe(false);
      expect(matchCanonical3DSceneId(undefined, "Jagannath Museum")).toBe(null);

      const html = renderToString(
        <ThreeDViewer placeName="Jagannath Museum" />
      );
      expect(html).toContain("threed-unavailable");
      expect(html).not.toContain("Sacred Shikhara");
    });

    it("ADVERSARIAL: 'Lingaraj Market' must NOT receive Lingaraj 3D", () => {
      expect(is3DHeritageAvailable(undefined, "Lingaraj Market")).toBe(false);
      expect(matchCanonical3DSceneId(undefined, "Lingaraj Market")).toBe(null);

      const html = renderToString(
        <ThreeDViewer placeName="Lingaraj Market" />
      );
      expect(html).toContain("threed-unavailable");
      expect(html).not.toContain("Rekha Deula");
    });

    it("ADVERSARIAL: place_bbsr_008 Odisha State Museum => no 3D", () => {
      expect(is3DHeritageAvailable("place_bbsr_008", "Odisha State Museum")).toBe(false);
      expect(matchCanonical3DSceneId("place_bbsr_008", "Odisha State Museum")).toBe(null);

      const html = renderToString(
        <ThreeDViewer placeId="place_bbsr_008" placeName="Odisha State Museum" />
      );
      expect(html).toContain("threed-unavailable");
    });

    it("Canonical ID strictly outranks place name: conflicting name does not grant 3D", () => {
      // Even if placeName says Konark Sun Temple, if placeId is place_bbsr_008, it MUST evaluate to false
      expect(is3DHeritageAvailable("place_bbsr_008", "Konark Sun Temple")).toBe(false);
      expect(matchCanonical3DSceneId("place_bbsr_008", "Konark Sun Temple")).toBe(null);
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
