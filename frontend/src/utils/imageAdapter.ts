/**
 * Frontend Image Adapter for O-Travelz.
 *
 * Seamlessly resolves destination photography by prioritizing backend API-provided
 * PlaceImage contracts and variants (hero, card, thumbnail), while strictly preserving
 * the full 5-tier fallback manifest in imageService.ts when API images are absent.
 */
import type { PlaceImageContract } from "../api/contracts";
import {
  type PlaceImage,
  type PlaceImageMeta,
  getPrimaryPlaceImage,
  getPlaceGallery,
  getPlaceImageUrl,
  DEFAULT_FALLBACK_IMAGE,
} from "./imageService";

export type ImageVariant = "thumbnail" | "card" | "hero" | "original";

export interface PlaceLike {
  id?: string;
  name?: string;
  category?: string;
  images?: PlaceImageContract[];
  imageUrl?: string;
}

/**
 * Select the appropriate URL string from a PlaceImageContract based on requested variant.
 */
export function getVariantUrl(img: PlaceImageContract, variant: ImageVariant = "card"): string {
  switch (variant) {
    case "thumbnail":
      return img.thumbnail_url || img.card_url || img.url;
    case "card":
      return img.card_url || img.url;
    case "hero":
    case "original":
    default:
      return img.url;
  }
}

/**
 * Sorts and selects images, ensuring primary image comes first.
 */
function sortPlaceImages(images: PlaceImageContract[]): PlaceImageContract[] {
  return [...images].sort((a, b) => {
    // 1. Primary image takes absolute priority
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    // 2. Otherwise sort by sort_order
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
}

/**
 * Convert backend PlaceImageContract into frontend PlaceImage structure.
 */
export function contractToPlaceImage(
  img: PlaceImageContract,
  placeName?: string,
  variant: ImageVariant = "card"
): PlaceImage {
  return {
    src: getVariantUrl(img, variant),
    alt: img.alt_text || `Photograph of ${placeName || "Destination"}`,
    title: img.title || placeName || undefined,
    attribution: img.attribution || undefined,
    source: img.source_name || "O-Travelz Verified Photography",
    license: img.license || "Verified Asset",
    isFallback: false,
  };
}

/**
 * Convert backend PlaceImageContract into frontend PlaceImageMeta for PhotoGallery.
 */
export function contractToPlaceImageMeta(
  img: PlaceImageContract,
  placeName?: string,
  variant: ImageVariant = "hero"
): PlaceImageMeta {
  return {
    url: getVariantUrl(img, variant),
    alt: img.alt_text || `Photograph of ${placeName || "Destination"}`,
    source: img.source_name || "O-Travelz Verified Photography",
    license: img.license || "Verified Asset",
    attribution: img.attribution || img.title || "O-Travelz Tourism Documentation",
  };
}

/**
 * Resolves the primary PlaceImage for a destination, preferring backend API imagery
 * and gracefully falling back to imageService.ts.
 */
export function resolvePlaceImage(
  place?: PlaceLike | null,
  variant: ImageVariant = "card"
): PlaceImage {
  if (place?.images && place.images.length > 0) {
    const sorted = sortPlaceImages(place.images);
    return contractToPlaceImage(sorted[0], place.name, variant);
  }

  // Graceful fallback to imageService.ts
  return getPrimaryPlaceImage(place?.name, place?.category);
}

/**
 * Resolves the primary image URL string for a place with requested variant.
 */
export function resolvePlaceImageUrl(
  place?: PlaceLike | null,
  variant: ImageVariant = "card"
): string {
  if (place?.images && place.images.length > 0) {
    const sorted = sortPlaceImages(place.images);
    return getVariantUrl(sorted[0], variant);
  }

  if (place?.imageUrl) {
    return place.imageUrl;
  }

  return getPlaceImageUrl(place?.name, place?.category);
}

/**
 * Resolves the complete photo gallery for PlaceDetailsModal, preferring backend API imagery
 * and gracefully falling back to imageService.ts multi-image sets.
 */
export function resolvePlaceGallery(
  place?: PlaceLike | null
): PlaceImageMeta[] {
  if (place?.images && place.images.length > 0) {
    const sorted = sortPlaceImages(place.images);
    return sorted.map((img) => contractToPlaceImageMeta(img, place.name, "hero"));
  }

  // Graceful fallback to imageService.ts
  return getPlaceGallery(place?.name, place?.category);
}
