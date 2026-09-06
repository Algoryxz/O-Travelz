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
  getBackendAssetUrl,
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
  let url = img.url;
  switch (variant) {
    case "thumbnail":
      url = img.thumbnail_url || img.card_url || img.url;
      break;
    case "card":
      url = img.card_url || img.url;
      break;
    case "hero":
    case "original":
    default:
      url = img.url;
      break;
  }
  return getBackendAssetUrl(url);
}


/**
 * Sorts and selects images, ensuring primary image comes first.
 */
export function sortPlaceImages(images: PlaceImageContract[]): PlaceImageContract[] {
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

function isSafePlaceAsset(place?: PlaceLike | null, imgUrl?: string): boolean {
  if (!place) return true;
  // Protect against deprecated bhoga sweets asset hash (14877b098df9)
  if (imgUrl && imgUrl.includes("14877b098df9")) {
    return false;
  }
  return true;
}

/**
 * Resolves the primary PlaceImage for a destination, preferring backend API imagery
 * and gracefully falling back to imageService.ts.
 */
export function resolvePlaceImage(
  place?: PlaceLike | null,
  variant: ImageVariant = "card"
): PlaceImage {
  if (place?.images && place.images.length > 0 && isSafePlaceAsset(place)) {
    const sorted = sortPlaceImages(place.images);
    const candidateUrl = getVariantUrl(sorted[0], variant);
    if (isSafePlaceAsset(place, candidateUrl)) {
      return contractToPlaceImage(sorted[0], place.name, variant);
    }
  }

  // Graceful fallback to imageService.ts
  return getPrimaryPlaceImage(place?.id || place?.name, place?.category);
}

/**
 * Resolves the primary image URL string for a place with requested variant.
 */
export function resolvePlaceImageUrl(
  place?: PlaceLike | null,
  variant: ImageVariant = "card"
): string {
  if (place?.images && place.images.length > 0 && isSafePlaceAsset(place)) {
    const sorted = sortPlaceImages(place.images);
    const candidateUrl = getVariantUrl(sorted[0], variant);
    if (isSafePlaceAsset(place, candidateUrl)) {
      return candidateUrl;
    }
  }

  if (place?.imageUrl && isSafePlaceAsset(place, place.imageUrl)) {
    return getBackendAssetUrl(place.imageUrl);
  }

  return getPlaceImageUrl(place?.id || place?.name, place?.category);
}

/**
 * Resolves the complete photo gallery for PlaceDetailsModal, preferring backend API imagery
 * and gracefully falling back to imageService.ts multi-image sets.
 */
export function resolvePlaceGallery(
  place?: PlaceLike | null
): PlaceImageMeta[] {
  if (place?.images && place.images.length > 0 && isSafePlaceAsset(place)) {
    const sorted = sortPlaceImages(place.images);
    const filtered = sorted.filter((img) => isSafePlaceAsset(place, getVariantUrl(img, "hero")));
    if (filtered.length > 0) {
      return filtered.map((img) => contractToPlaceImageMeta(img, place.name, "hero"));
    }
  }

  // Graceful fallback to imageService.ts
  return getPlaceGallery(place?.name, place?.category);
}

/**
 * Resolves the canonical source photograph identity key for deduplication.
 * Hierarchy per Wave Media Suite Truth:
 * 1. media_asset_id
 * 2. content_sha256
 * 3. asset_hash / source asset directory identity
 * 4. canonical source image ID (id)
 * 5. fallback: normalized base url without responsive variant suffix
 */
export function getSourcePhotoIdentity(img: any): string {
  if (!img) return "";

  // 1. media_asset_id
  if (img.media_asset_id && typeof img.media_asset_id === "string") {
    return `media_asset_id:${img.media_asset_id.trim()}`;
  }

  // 2. content_sha256
  if (img.content_sha256 && typeof img.content_sha256 === "string") {
    return `content_sha256:${img.content_sha256.trim().toLowerCase()}`;
  }

  // 3. asset_hash / source asset identity
  if (img.asset_hash && typeof img.asset_hash === "string") {
    return `asset_hash:${img.asset_hash.trim().toLowerCase()}`;
  }

  // Check storage_key for asset directory hash, e.g. places/.../<hash>/(hero|card|thumbnail).webp
  const storageKey = img.storage_key;
  if (storageKey && typeof storageKey === "string") {
    const match = storageKey.match(/(?:^|\/)([a-f0-9]{8,64})\/(?:hero|card|thumbnail|original)\.[a-z0-9]+$/i);
    if (match) {
      return `asset_hash:${match[1].toLowerCase()}`;
    }
  }

  // Check url/src for asset directory hash, e.g. /static/images/places/.../<hash>/(hero|card|thumbnail).webp
  const urlCandidate = typeof img === "string" ? img : (img.url || img.src || "");
  if (urlCandidate && typeof urlCandidate === "string") {
    const hashMatch = urlCandidate.match(/(?:^|\/)([a-f0-9]{8,64})\/(?:hero|card|thumbnail|original)\.[a-z0-9]+$/i);
    if (hashMatch) {
      return `asset_hash:${hashMatch[1].toLowerCase()}`;
    }
  }

  // 4. canonical source image ID
  if (img.id && typeof img.id === "string") {
    return `image_id:${img.id.trim()}`;
  }

  // 5. Normalization fallback: strip variant suffix (hero, card, thumbnail, thumb) so variants share key
  if (urlCandidate && typeof urlCandidate === "string") {
    const cleanUrl = urlCandidate
      .split("?")[0]
      .replace(/[_-](?:hero|card|thumbnail|thumb|small|medium|large)\.([a-z0-9]+)$/i, ".$1")
      .replace(/\/(?:hero|card|thumbnail|original)\.webp$/i, "");
    return `url_base:${cleanUrl.trim().toLowerCase()}`;
  }

  return `unknown:${Math.random()}`;
}

