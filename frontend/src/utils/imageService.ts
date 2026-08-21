/**
 * O-Travelz Comprehensive Image Pipeline & Semantic Place-Aware Asset Manifest
 *
 * Central abstraction for all destination photography, multi-image galleries,
 * verified category imagery, and provenance metadata across Odisha.
 *
 * Strictly enforces 1-to-1 semantic match between canonical destinations
 * and authentic destination photography. Never leaks photographs across destinations.
 */
import { getRegionForPlace } from "./regionUtils";

export function getBackendBaseUrl(): string {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const raw = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
    return typeof raw === "string" ? raw.trim().replace(/\/+$/, "") : "";
  }
  return "";
}

export function getBackendAssetUrl(storageKeyOrPath?: string | null): string {
  if (!storageKeyOrPath || typeof storageKeyOrPath !== "string") {
    return "";
  }
  const trimmed = storageKeyOrPath.trim();
  if (!trimmed) {
    return "";
  }
  // If it's already an absolute URL or inline data URI / blob, return as-is
  if (/^(https?:\/\/|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  // Reject path traversal
  if (trimmed.includes("..")) {
    return "";
  }

  const baseUrl = getBackendBaseUrl();
  const cleanPath = trimmed.replace(/^[\/\\]+/, "").replace(/\\/g, "/");

  if (!cleanPath) {
    return "";
  }

  // Ensure path starts with static/images/
  let finalPath = cleanPath;
  if (!finalPath.startsWith("static/images/") && !finalPath.startsWith("api/v1/images/")) {
    finalPath = `static/images/${finalPath}`;
  }

  finalPath = finalPath.replace(/\/{2,}/g, "/");

  if (!baseUrl) {
    return `/${finalPath}`;
  }

  return `${baseUrl}/${finalPath}`;
}

export interface PlaceImage {
  src: string;
  alt: string;
  title?: string;
  attribution?: string;
  source?: string;
  license?: string;
  isFallback?: boolean;
}


export interface PlaceImageSet {
  placeId: string;
  placeName: string;
  region?: string;
  images: PlaceImage[];
}

export interface PlaceImageMeta {
  url: string;
  source: string;
  license: string;
  attribution: string;
  alt: string;
}

export interface FeaturedDestination {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
  imageUrl: string;
}

/* =========================================================================
   1. AUTHORITATIVE CATEGORY-OWNED PHOTOGRAPHY MANIFEST
   Only contains genuinely category-owned assets from data/images/categories/.
   ========================================================================= */

export const CATEGORY_IMAGE_MANIFEST: Record<string, PlaceImage> = {
  "atms": {
    "src": "/static/images/categories/cat_atms/76647d302131/card.webp",
    "alt": "Banking, commercial and 24/7 ATM cash dispenser services in Odisha",
    "title": "Banking & ATM Services",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by WikiForRay via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "banking": {
    "src": "/static/images/categories/cat_atms/76647d302131/card.webp",
    "alt": "Banking, commercial and 24/7 ATM cash dispenser services in Odisha",
    "title": "Banking & ATM Services",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by WikiForRay via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "medical help": {
    "src": "/static/images/categories/cat_medical_help/bf5d0fc229ac/card.webp",
    "alt": "Modern hospital and medical emergency healthcare center at AIIMS Bhubaneswar in Odisha",
    "title": "Hospitals & Medical Services",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Debiprasad via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "hospitals": {
    "src": "/static/images/categories/cat_medical_help/bf5d0fc229ac/card.webp",
    "alt": "Modern hospital and medical emergency healthcare center at AIIMS Bhubaneswar in Odisha",
    "title": "Hospitals & Medical Services",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Debiprasad via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "hangout & chill": {
    "src": "/static/images/categories/cat_hangout_chill/840313660e7c/card.webp",
    "alt": "Artisan café lounge, open tea pavilion and social leisure space in Odisha",
    "title": "Cafes, Lounges & Social Spaces",
    "source": "Wikimedia Commons",
    "license": "CC BY 3.0",
    "attribution": "Photo by Biswarup Ganguly via Wikimedia Commons, licensed under CC BY 3.0",
    "isFallback": false
  },
  "cafes": {
    "src": "/static/images/categories/cat_hangout_chill/840313660e7c/card.webp",
    "alt": "Artisan café lounge, open tea pavilion and social leisure space in Odisha",
    "title": "Cafes, Lounges & Social Spaces",
    "source": "Wikimedia Commons",
    "license": "CC BY 3.0",
    "attribution": "Photo by Biswarup Ganguly via Wikimedia Commons, licensed under CC BY 3.0",
    "isFallback": false
  }
};

/* =========================================================================
   2. CATEGORY-THEMED NEUTRAL EDITORIAL FALLBACK ASSETS
   Deterministic, high-contrast, category-specific vector placeholders.
   Never borrows photography from unrelated destinations.
   ========================================================================= */

export const CATEGORY_THEMED_FALLBACKS: Record<string, PlaceImage> = {
  "temple": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%23F59E0B%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Cpath%20d%3D%27M400%20162%20L418%20215%20L382%20215%20Z%20M393%20215%20L407%20215%20L407%20238%20L393%20238%20Z%27%20fill%3D%27%23F59E0B%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27155%27%20r%3D%275%27%20fill%3D%27%23F59E0B%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3ETemple%20%26amp%3B%20Sacred%20Shrine%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3EKalinga%20Sacred%20Architecture%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Temple & Sacred Shrine - Verified Odisha Destination",
    title: "Temple & Sacred Shrine",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "monument": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%23D97706%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Cpath%20d%3D%27M375%20175%20L425%20175%20L425%20184%20L375%20184%20Z%20M382%20184%20L390%20184%20L390%20228%20L382%20228%20Z%20M410%20184%20L418%20184%20L418%20228%20L410%20228%20Z%20M396%20184%20L404%20184%20L404%20228%20L396%20228%20Z%20M370%20228%20L430%20228%20L430%20238%20L370%20238%20Z%27%20fill%3D%27%23D97706%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3EHistoric%20Monument%20%26amp%3B%20Heritage%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3EArchaeological%20%26amp%3B%20Historic%20Site%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Historic Monument & Heritage - Verified Odisha Destination",
    title: "Historic Monument & Heritage",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "museum": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%238B5CF6%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Cpath%20d%3D%27M400%20168%20L428%20185%20L372%20185%20Z%20M380%20188%20L388%20188%20L388%20230%20L380%20230%20Z%20M396%20188%20L404%20188%20L404%20230%20L396%20230%20Z%20M412%20188%20L420%20188%20L420%20230%20L412%20230%20Z%20M370%20230%20L430%20230%20L430%20238%20L370%20238%20Z%27%20fill%3D%27%238B5CF6%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3EMuseum%20%26amp%3B%20Cultural%20Heritage%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3ECultural%20Archives%20%26amp%3B%20Artifacts%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Museum & Cultural Heritage - Verified Odisha Destination",
    title: "Museum & Cultural Heritage",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "beach": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%230284C7%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27175%27%20r%3D%2714%27%20fill%3D%27%23F59E0B%27/%3E%3Cpath%20d%3D%27M370%20215%20Q385%20200%20400%20215%20T430%20215%20Q435%20225%20430%20235%20L370%20235%20Z%27%20fill%3D%27%230284C7%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3ECoastal%20Beach%20%26amp%3B%20Waters%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3EBay%20of%20Bengal%20Shoreline%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Coastal Beach & Waters - Verified Odisha Destination",
    title: "Coastal Beach & Waters",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "lake": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%2306B6D4%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Cpath%20d%3D%27M372%20208%20Q386%20195%20400%20208%20T428%20208%20L428%20236%20L372%20236%20Z%27%20fill%3D%27%2306B6D4%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3ELake%20%26amp%3B%20Lagoon%20Waters%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3EWetlands%20%26amp%3B%20Freshwater%20Ecosystem%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Lake & Lagoon Waters - Verified Odisha Destination",
    title: "Lake & Lagoon Waters",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "nature": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%2310B981%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Cpath%20d%3D%27M372%20235%20L395%20180%20L418%20235%20Z%27%20fill%3D%27%2310B981%27/%3E%3Cpath%20d%3D%27M405%20235%20L420%20196%20L435%20235%20Z%27%20fill%3D%27%23059669%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3ENature%20%26amp%3B%20Mountain%20Landscape%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3EEastern%20Ghats%20%26amp%3B%20Valleys%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Nature & Mountain Landscape - Verified Odisha Destination",
    title: "Nature & Mountain Landscape",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "waterfall": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%2338BDF8%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Cpath%20d%3D%27M378%20175%20L422%20175%20L415%20235%20L385%20235%20Z%27%20fill%3D%27%2338BDF8%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3EScenic%20Waterfall%20%26amp%3B%20Cascades%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3ENatural%20Forest%20Rapids%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Scenic Waterfall & Cascades - Verified Odisha Destination",
    title: "Scenic Waterfall & Cascades",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "wildlife": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%23059669%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27180%27%20r%3D%2716%27%20fill%3D%27%23059669%27/%3E%3Ccircle%20cx%3D%27385%27%20cy%3D%27195%27%20r%3D%2714%27%20fill%3D%27%23059669%27/%3E%3Ccircle%20cx%3D%27415%27%20cy%3D%27195%27%20r%3D%2714%27%20fill%3D%27%23059669%27/%3E%3Crect%20x%3D%27396%27%20y%3D%27205%27%20width%3D%278%27%20height%3D%2730%27%20fill%3D%27%23D97706%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3EWildlife%20%26amp%3B%20Biosphere%20Reserve%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3ESanctuary%20%26amp%3B%20Forest%20Canopy%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Wildlife & Biosphere Reserve - Verified Odisha Destination",
    title: "Wildlife & Biosphere Reserve",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "park": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%2310B981%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27182%27%20r%3D%2720%27%20fill%3D%27%2310B981%27/%3E%3Crect%20x%3D%27396%27%20y%3D%27208%27%20width%3D%278%27%20height%3D%2726%27%20fill%3D%27%23D97706%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3EParks%20%26amp%3B%20Botanical%20Gardens%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3ELush%20Urban%20%26amp%3B%20Botanical%20Greenery%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Parks & Botanical Gardens - Verified Odisha Destination",
    title: "Parks & Botanical Gardens",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "planetarium": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%2306B6D4%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2712%27%20fill%3D%27%2338BDF8%27/%3E%3Cellipse%20cx%3D%27400%27%20cy%3D%27205%27%20rx%3D%2730%27%20ry%3D%2710%27%20fill%3D%27none%27%20stroke%3D%27%2306B6D4%27%20stroke-width%3D%272%27%20transform%3D%27rotate%28-20%20400%20205%29%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3EPlanetarium%20%26amp%3B%20Space%20Center%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3ECelestial%20Science%20%26amp%3B%20Astronomy%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Planetarium & Space Center - Verified Odisha Destination",
    title: "Planetarium & Space Center",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "science_center": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%233B82F6%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%278%27%20fill%3D%27%233B82F6%27/%3E%3Cellipse%20cx%3D%27400%27%20cy%3D%27205%27%20rx%3D%2728%27%20ry%3D%2710%27%20fill%3D%27none%27%20stroke%3D%27%233B82F6%27%20stroke-width%3D%272%27/%3E%3Cellipse%20cx%3D%27400%27%20cy%3D%27205%27%20rx%3D%2728%27%20ry%3D%2710%27%20fill%3D%27none%27%20stroke%3D%27%233B82F6%27%20stroke-width%3D%272%27%20transform%3D%27rotate%2860%20400%20205%29%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3EScience%20%26amp%3B%20Innovation%20Center%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3EInteractive%20Science%20Discovery%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Science & Innovation Center - Verified Odisha Destination",
    title: "Science & Innovation Center",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "sports_venue": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%2314B8A6%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Crect%20x%3D%27376%27%20y%3D%27185%27%20width%3D%2748%27%20height%3D%2740%27%20rx%3D%2710%27%20fill%3D%27none%27%20stroke%3D%27%2314B8A6%27%20stroke-width%3D%273%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%278%27%20fill%3D%27%2314B8A6%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3ESports%20%26amp%3B%20Stadium%20Arena%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3EAthletics%20%26amp%3B%20Sports%20Complex%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Sports & Stadium Arena - Verified Odisha Destination",
    title: "Sports & Stadium Arena",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "market": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%23F97316%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Cpath%20d%3D%27M380%20180%20L420%20180%20L430%20235%20L370%20235%20Z%27%20fill%3D%27none%27%20stroke%3D%27%23F97316%27%20stroke-width%3D%272.5%27/%3E%3Cpath%20d%3D%27M390%20180%20Q400%20160%20410%20180%27%20fill%3D%27none%27%20stroke%3D%27%23F97316%27%20stroke-width%3D%272.5%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3EMarket%2C%20Handlooms%20%26amp%3B%20Crafts%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3ETraditional%20Bazaars%20%26amp%3B%20Culinary%20Corner%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Market, Handlooms & Crafts - Verified Odisha Destination",
    title: "Market, Handlooms & Crafts",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "heritage": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%23D97706%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Cpath%20d%3D%27M375%20175%20L425%20175%20L425%20184%20L375%20184%20Z%20M382%20184%20L390%20184%20L390%20228%20L382%20228%20Z%20M410%20184%20L418%20184%20L418%20228%20L410%20228%20Z%20M396%20184%20L404%20184%20L404%20228%20L396%20228%20Z%20M370%20228%20L430%20228%20L430%20238%20L370%20238%20Z%27%20fill%3D%27%23D97706%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3EHistoric%20Monument%20%26amp%3B%20Heritage%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3EArchaeological%20%26amp%3B%20Historic%20Site%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Heritage & Cultural Monuments - Verified Odisha Destination",
    title: "Heritage & Cultural Monuments",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "food": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%23F97316%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Cpath%20d%3D%27M380%20180%20L420%20180%20L430%20235%20L370%20235%20Z%27%20fill%3D%27none%27%20stroke%3D%27%23F97316%27%20stroke-width%3D%272.5%27/%3E%3Cpath%20d%3D%27M390%20180%20Q400%20160%20410%20180%27%20fill%3D%27none%27%20stroke%3D%27%23F97316%27%20stroke-width%3D%272.5%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3EMarket%2C%20Handlooms%20%26amp%3B%20Crafts%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3ECulinary%20Hub%20%26amp%3B%20Traditional%20Food%20Market%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Traditional Food & Culinary Market - Verified Odisha Destination",
    title: "Traditional Food & Culinary Market",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
  "sports": {
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27800%27%20height%3D%27500%27%20viewBox%3D%270%200%20800%20500%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%27100%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%230B1220%27/%3E%3Cstop%20offset%3D%2750%25%27%20stop-color%3D%27%23111827%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23172235%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27800%27%20height%3D%27500%27%20fill%3D%27url%28%23bg%29%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%2756%27%20fill%3D%27%231E293B%27%20stroke%3D%27%2314B8A6%27%20stroke-width%3D%272.5%27%20stroke-opacity%3D%270.45%27/%3E%3Crect%20x%3D%27376%27%20y%3D%27185%27%20width%3D%2748%27%20height%3D%2740%27%20rx%3D%2710%27%20fill%3D%27none%27%20stroke%3D%27%2314B8A6%27%20stroke-width%3D%273%27/%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27205%27%20r%3D%278%27%20fill%3D%27%2314B8A6%27/%3E%3Ctext%20x%3D%27400%27%20y%3D%27315%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2718%27%20font-weight%3D%27800%27%20fill%3D%27%23F8FAFC%27%20text-anchor%3D%27middle%27%3ESports%20%26amp%3B%20Stadium%20Arena%3C/text%3E%3Ctext%20x%3D%27400%27%20y%3D%27348%27%20font-family%3D%27system-ui%2C%20-apple-system%2C%20sans-serif%27%20font-size%3D%2712%27%20font-weight%3D%27600%27%20fill%3D%27%2394A3B8%27%20text-anchor%3D%27middle%27%3EAthletics%20%26amp%3B%20Sports%20Complex%20%E2%80%A2%20O-Travelz%20Catalog%3C/text%3E%3C/svg%3E",
    alt: "Sports & Stadium Arena - Verified Odisha Destination",
    title: "Sports & Stadium Arena",
    source: "O-Travelz Verified Catalog",
    license: "Platform Standard Asset",
    attribution: "O-Travelz Destination Documentation",
    isFallback: true,
  },
};

export const DEFAULT_FALLBACK_IMAGE: PlaceImage = {
  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23111827'/%3E%3Cstop offset='100%25' stop-color='%23172235'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='500' fill='url(%23bg)'/%3E%3Ccircle cx='400' cy='220' r='60' fill='%231E293B' stroke='%23334155' stroke-width='2'/%3E%3Cpath d='M400 180 L420 220 L380 220 Z' fill='%2314B8A6'/%3E%3Cpath d='M400 260 L380 220 L420 220 Z' fill='%23F59E0B'/%3E%3Ccircle cx='400' cy='220' r='8' fill='%23F8FAFC'/%3E%3Ctext x='400' y='330' font-family='system-ui, -apple-system, sans-serif' font-size='18' font-weight='700' fill='%23F8FAFC' text-anchor='middle'%3EOdisha Travel Destination%3C/text%3E%3Ctext x='400' y='360' font-family='system-ui, -apple-system, sans-serif' font-size='13' fill='%2394A3B8' text-anchor='middle'%3EVerified Location • O-Travelz%3C/text%3E%3C/svg%3E",
  alt: "Odisha Verified Travel Destination",
  title: "Odisha Verified Travel Destination",
  source: "O-Travelz Verified Catalog",
  license: "Platform Standard Asset",
  attribution: "O-Travelz Verified Tourism Asset",
  isFallback: true,
};

/* =========================================================================
   3. CANONICAL DESTINATION IMAGE MANIFEST (49 VERIFIED PLACES)
   ========================================================================= */

export const PLACE_IMAGE_MANIFEST: Record<string, PlaceImage[]> = {
  "place_013": [
    {
        "src": "/static/images/places/place_013/a2d24252c0ce/hero.webp",
        "alt": "Authentic photograph of Museum of Tribal Arts and Artifacts in Odisha",
        "title": "Museum of Tribal Arts and Artifacts",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Museum of Tribal Arts and Artifacts",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_013/a2d24252c0ce/card.webp",
        "alt": "Museum of Tribal Arts and Artifacts architectural and landscape perspective",
        "title": "Museum of Tribal Arts and Artifacts Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Museum of Tribal Arts and Artifacts",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_013/a2d24252c0ce/thumbnail.webp",
        "alt": "Museum of Tribal Arts and Artifacts panorama perspective",
        "title": "Museum of Tribal Arts and Artifacts Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Museum of Tribal Arts and Artifacts",
        "isFallback": false
    }
],
  "Museum of Tribal Arts and Artifacts": [
    {
        "src": "/static/images/places/place_013/a2d24252c0ce/hero.webp",
        "alt": "Authentic photograph of Museum of Tribal Arts and Artifacts in Odisha",
        "title": "Museum of Tribal Arts and Artifacts",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Museum of Tribal Arts and Artifacts",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_013/a2d24252c0ce/card.webp",
        "alt": "Museum of Tribal Arts and Artifacts architectural and landscape perspective",
        "title": "Museum of Tribal Arts and Artifacts Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Museum of Tribal Arts and Artifacts",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_013/a2d24252c0ce/thumbnail.webp",
        "alt": "Museum of Tribal Arts and Artifacts panorama perspective",
        "title": "Museum of Tribal Arts and Artifacts Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Museum of Tribal Arts and Artifacts",
        "isFallback": false
    }
],
  "place_012": [
    {
        "src": "/static/images/places/place_012/a917c9873b59/hero.webp",
        "alt": "Authentic photograph of Regional Museum of Natural History in Odisha",
        "title": "Regional Museum of Natural History",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Regional Museum of Natural History",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_012/a917c9873b59/card.webp",
        "alt": "Regional Museum of Natural History architectural and landscape perspective",
        "title": "Regional Museum of Natural History Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Regional Museum of Natural History",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_012/a917c9873b59/thumbnail.webp",
        "alt": "Regional Museum of Natural History panorama perspective",
        "title": "Regional Museum of Natural History Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Regional Museum of Natural History",
        "isFallback": false
    }
],
  "Regional Museum of Natural History": [
    {
        "src": "/static/images/places/place_012/a917c9873b59/hero.webp",
        "alt": "Authentic photograph of Regional Museum of Natural History in Odisha",
        "title": "Regional Museum of Natural History",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Regional Museum of Natural History",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_012/a917c9873b59/card.webp",
        "alt": "Regional Museum of Natural History architectural and landscape perspective",
        "title": "Regional Museum of Natural History Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Regional Museum of Natural History",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_012/a917c9873b59/thumbnail.webp",
        "alt": "Regional Museum of Natural History panorama perspective",
        "title": "Regional Museum of Natural History Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Regional Museum of Natural History",
        "isFallback": false
    }
],
  "place_032": [
    {
        "src": "/static/images/places/place_032/1b4f7e6f8b2e/hero.webp",
        "alt": "Authentic photograph of Buddha Jayanti Park in Odisha",
        "title": "Buddha Jayanti Park",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Buddha Jayanti Park",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_032/1b4f7e6f8b2e/card.webp",
        "alt": "Buddha Jayanti Park architectural and landscape perspective",
        "title": "Buddha Jayanti Park Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Buddha Jayanti Park",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_032/1b4f7e6f8b2e/thumbnail.webp",
        "alt": "Buddha Jayanti Park panorama perspective",
        "title": "Buddha Jayanti Park Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Buddha Jayanti Park",
        "isFallback": false
    }
],
  "Buddha Jayanti Park": [
    {
        "src": "/static/images/places/place_032/1b4f7e6f8b2e/hero.webp",
        "alt": "Authentic photograph of Buddha Jayanti Park in Odisha",
        "title": "Buddha Jayanti Park",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Buddha Jayanti Park",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_032/1b4f7e6f8b2e/card.webp",
        "alt": "Buddha Jayanti Park architectural and landscape perspective",
        "title": "Buddha Jayanti Park Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Buddha Jayanti Park",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_032/1b4f7e6f8b2e/thumbnail.webp",
        "alt": "Buddha Jayanti Park panorama perspective",
        "title": "Buddha Jayanti Park Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Buddha Jayanti Park",
        "isFallback": false
    }
],
  "place_031": [
    {
        "src": "/static/images/places/place_031/420159c383f2/hero.webp",
        "alt": "Authentic photograph of Indira Gandhi Park in Odisha",
        "title": "Indira Gandhi Park",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Indira Gandhi Park",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_031/420159c383f2/card.webp",
        "alt": "Indira Gandhi Park architectural and landscape perspective",
        "title": "Indira Gandhi Park Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Indira Gandhi Park",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_031/420159c383f2/thumbnail.webp",
        "alt": "Indira Gandhi Park panorama perspective",
        "title": "Indira Gandhi Park Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Indira Gandhi Park",
        "isFallback": false
    }
],
  "Indira Gandhi Park": [
    {
        "src": "/static/images/places/place_031/420159c383f2/hero.webp",
        "alt": "Authentic photograph of Indira Gandhi Park in Odisha",
        "title": "Indira Gandhi Park",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Indira Gandhi Park",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_031/420159c383f2/card.webp",
        "alt": "Indira Gandhi Park architectural and landscape perspective",
        "title": "Indira Gandhi Park Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Indira Gandhi Park",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_031/420159c383f2/thumbnail.webp",
        "alt": "Indira Gandhi Park panorama perspective",
        "title": "Indira Gandhi Park Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Indira Gandhi Park",
        "isFallback": false
    }
],
  "place_014": [
    {
        "src": "/static/images/places/place_014/30f7ed6f5755/hero.webp",
        "alt": "Authentic photograph of Pathani Samanta Planetarium in Odisha",
        "title": "Pathani Samanta Planetarium",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Pathani Samanta Planetarium",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_014/30f7ed6f5755/card.webp",
        "alt": "Pathani Samanta Planetarium architectural and landscape perspective",
        "title": "Pathani Samanta Planetarium Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Pathani Samanta Planetarium",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_014/30f7ed6f5755/thumbnail.webp",
        "alt": "Pathani Samanta Planetarium panorama perspective",
        "title": "Pathani Samanta Planetarium Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Pathani Samanta Planetarium",
        "isFallback": false
    }
],
  "Pathani Samanta Planetarium": [
    {
        "src": "/static/images/places/place_014/30f7ed6f5755/hero.webp",
        "alt": "Authentic photograph of Pathani Samanta Planetarium in Odisha",
        "title": "Pathani Samanta Planetarium",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Pathani Samanta Planetarium",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_014/30f7ed6f5755/card.webp",
        "alt": "Pathani Samanta Planetarium architectural and landscape perspective",
        "title": "Pathani Samanta Planetarium Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Pathani Samanta Planetarium",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_014/30f7ed6f5755/thumbnail.webp",
        "alt": "Pathani Samanta Planetarium panorama perspective",
        "title": "Pathani Samanta Planetarium Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Pathani Samanta Planetarium",
        "isFallback": false
    }
],
  "place_bbsr_008": [
    {
      "src": "/static/images/places/place_bbsr_008/dc85cc5814e7/hero.webp",
      "alt": "Authentic photograph of Odisha State Museum in Odisha",
      "title": "Odisha State Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by User:Tinucherian via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_008/dc85cc5814e7/card.webp",
      "alt": "Odisha State Museum architectural and landscape perspective",
      "title": "Odisha State Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by User:Tinucherian via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_008/dc85cc5814e7/thumbnail.webp",
      "alt": "Odisha State Museum panorama perspective",
      "title": "Odisha State Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by User:Tinucherian via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    }
  ],
  "Odisha State Museum": [
    {
      "src": "/static/images/places/place_bbsr_008/dc85cc5814e7/hero.webp",
      "alt": "Authentic photograph of Odisha State Museum in Odisha",
      "title": "Odisha State Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by User:Tinucherian via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_008/dc85cc5814e7/card.webp",
      "alt": "Odisha State Museum architectural and landscape perspective",
      "title": "Odisha State Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by User:Tinucherian via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_008/dc85cc5814e7/thumbnail.webp",
      "alt": "Odisha State Museum panorama perspective",
      "title": "Odisha State Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by User:Tinucherian via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    }
  ],
  "place_bbsr_006": [
    {
      "src": "/static/images/places/place_bbsr_006/94ea88ae627b/hero.webp",
      "alt": "Authentic photograph of Dhauli Shanti Stupa in Odisha",
      "title": "Dhauli Shanti Stupa",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Debashis Pradhan via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_006/94ea88ae627b/card.webp",
      "alt": "Dhauli Shanti Stupa architectural and landscape perspective",
      "title": "Dhauli Shanti Stupa Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Debashis Pradhan via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_006/94ea88ae627b/thumbnail.webp",
      "alt": "Dhauli Shanti Stupa panorama perspective",
      "title": "Dhauli Shanti Stupa Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Debashis Pradhan via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Dhauli Shanti Stupa": [
    {
      "src": "/static/images/places/place_bbsr_006/94ea88ae627b/hero.webp",
      "alt": "Authentic photograph of Dhauli Shanti Stupa in Odisha",
      "title": "Dhauli Shanti Stupa",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Debashis Pradhan via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_006/94ea88ae627b/card.webp",
      "alt": "Dhauli Shanti Stupa architectural and landscape perspective",
      "title": "Dhauli Shanti Stupa Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Debashis Pradhan via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_006/94ea88ae627b/thumbnail.webp",
      "alt": "Dhauli Shanti Stupa panorama perspective",
      "title": "Dhauli Shanti Stupa Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Debashis Pradhan via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_030": [
    {
        "src": "/static/images/places/place_030/dd18b0f33834/hero.webp",
        "alt": "Authentic photograph of Regional Science Centre, Bhubaneswar in Odisha",
        "title": "Regional Science Centre, Bhubaneswar",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Regional Science Centre, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_030/dd18b0f33834/card.webp",
        "alt": "Regional Science Centre, Bhubaneswar architectural and landscape perspective",
        "title": "Regional Science Centre, Bhubaneswar Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Regional Science Centre, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_030/dd18b0f33834/thumbnail.webp",
        "alt": "Regional Science Centre, Bhubaneswar panorama perspective",
        "title": "Regional Science Centre, Bhubaneswar Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Regional Science Centre, Bhubaneswar",
        "isFallback": false
    }
],
  "Regional Science Centre, Bhubaneswar": [
    {
        "src": "/static/images/places/place_030/dd18b0f33834/hero.webp",
        "alt": "Authentic photograph of Regional Science Centre, Bhubaneswar in Odisha",
        "title": "Regional Science Centre, Bhubaneswar",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Regional Science Centre, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_030/dd18b0f33834/card.webp",
        "alt": "Regional Science Centre, Bhubaneswar architectural and landscape perspective",
        "title": "Regional Science Centre, Bhubaneswar Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Regional Science Centre, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_030/dd18b0f33834/thumbnail.webp",
        "alt": "Regional Science Centre, Bhubaneswar panorama perspective",
        "title": "Regional Science Centre, Bhubaneswar Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Regional Science Centre, Bhubaneswar",
        "isFallback": false
    }
],
  "place_024": [
    {
        "src": "/static/images/places/place_024/c24a920d9ea5/hero.webp",
        "alt": "Authentic photograph of Bharati Matha Temple in Odisha",
        "title": "Bharati Matha Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bharati Matha Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_024/c24a920d9ea5/card.webp",
        "alt": "Bharati Matha Temple architectural and landscape perspective",
        "title": "Bharati Matha Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bharati Matha Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_024/c24a920d9ea5/thumbnail.webp",
        "alt": "Bharati Matha Temple panorama perspective",
        "title": "Bharati Matha Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bharati Matha Temple",
        "isFallback": false
    }
],
  "Bharati Matha Temple": [
    {
        "src": "/static/images/places/place_024/c24a920d9ea5/hero.webp",
        "alt": "Authentic photograph of Bharati Matha Temple in Odisha",
        "title": "Bharati Matha Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bharati Matha Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_024/c24a920d9ea5/card.webp",
        "alt": "Bharati Matha Temple architectural and landscape perspective",
        "title": "Bharati Matha Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bharati Matha Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_024/c24a920d9ea5/thumbnail.webp",
        "alt": "Bharati Matha Temple panorama perspective",
        "title": "Bharati Matha Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bharati Matha Temple",
        "isFallback": false
    }
],
  "place_019": [
    {
        "src": "/static/images/places/place_019/79d401a75a62/hero.webp",
        "alt": "Authentic photograph of Brahmeswar Temple in Odisha",
        "title": "Brahmeswar Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Brahmeswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_019/79d401a75a62/card.webp",
        "alt": "Brahmeswar Temple architectural and landscape perspective",
        "title": "Brahmeswar Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Brahmeswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_019/79d401a75a62/thumbnail.webp",
        "alt": "Brahmeswar Temple panorama perspective",
        "title": "Brahmeswar Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Brahmeswar Temple",
        "isFallback": false
    }
],
  "Brahmeswar Temple": [
    {
        "src": "/static/images/places/place_019/79d401a75a62/hero.webp",
        "alt": "Authentic photograph of Brahmeswar Temple in Odisha",
        "title": "Brahmeswar Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Brahmeswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_019/79d401a75a62/card.webp",
        "alt": "Brahmeswar Temple architectural and landscape perspective",
        "title": "Brahmeswar Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Brahmeswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_019/79d401a75a62/thumbnail.webp",
        "alt": "Brahmeswar Temple panorama perspective",
        "title": "Brahmeswar Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Brahmeswar Temple",
        "isFallback": false
    }
],
  "place_007": [
    {
        "src": "/static/images/places/place_007/6d8254429a6a/hero.webp",
        "alt": "Authentic photograph of Chausathi Yogini Temple, Hirapur in Odisha",
        "title": "Chausathi Yogini Temple, Hirapur",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Chausathi Yogini Temple, Hirapur",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_007/6d8254429a6a/card.webp",
        "alt": "Chausathi Yogini Temple, Hirapur architectural and landscape perspective",
        "title": "Chausathi Yogini Temple, Hirapur Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Chausathi Yogini Temple, Hirapur",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_007/6d8254429a6a/thumbnail.webp",
        "alt": "Chausathi Yogini Temple, Hirapur panorama perspective",
        "title": "Chausathi Yogini Temple, Hirapur Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Chausathi Yogini Temple, Hirapur",
        "isFallback": false
    }
],
  "Chausathi Yogini Temple, Hirapur": [
    {
        "src": "/static/images/places/place_007/6d8254429a6a/hero.webp",
        "alt": "Authentic photograph of Chausathi Yogini Temple, Hirapur in Odisha",
        "title": "Chausathi Yogini Temple, Hirapur",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Chausathi Yogini Temple, Hirapur",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_007/6d8254429a6a/card.webp",
        "alt": "Chausathi Yogini Temple, Hirapur architectural and landscape perspective",
        "title": "Chausathi Yogini Temple, Hirapur Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Chausathi Yogini Temple, Hirapur",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_007/6d8254429a6a/thumbnail.webp",
        "alt": "Chausathi Yogini Temple, Hirapur panorama perspective",
        "title": "Chausathi Yogini Temple, Hirapur Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Chausathi Yogini Temple, Hirapur",
        "isFallback": false
    }
],
  "place_029": [
    {
        "src": "/static/images/places/place_029/4878025f4210/hero.webp",
        "alt": "Authentic photograph of Kapilesvara Siva Temple in Odisha",
        "title": "Kapilesvara Siva Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Kapilesvara Siva Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_029/4878025f4210/card.webp",
        "alt": "Kapilesvara Siva Temple architectural and landscape perspective",
        "title": "Kapilesvara Siva Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Kapilesvara Siva Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_029/4878025f4210/thumbnail.webp",
        "alt": "Kapilesvara Siva Temple panorama perspective",
        "title": "Kapilesvara Siva Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Kapilesvara Siva Temple",
        "isFallback": false
    }
],
  "Kapilesvara Siva Temple": [
    {
        "src": "/static/images/places/place_029/4878025f4210/hero.webp",
        "alt": "Authentic photograph of Kapilesvara Siva Temple in Odisha",
        "title": "Kapilesvara Siva Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Kapilesvara Siva Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_029/4878025f4210/card.webp",
        "alt": "Kapilesvara Siva Temple architectural and landscape perspective",
        "title": "Kapilesvara Siva Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Kapilesvara Siva Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_029/4878025f4210/thumbnail.webp",
        "alt": "Kapilesvara Siva Temple panorama perspective",
        "title": "Kapilesvara Siva Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Kapilesvara Siva Temple",
        "isFallback": false
    }
],
  "place_025": [
    {
        "src": "/static/images/places/place_025/32de32c1a13d/hero.webp",
        "alt": "Authentic photograph of Kedar Gouri Temple in Odisha",
        "title": "Kedar Gouri Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Kedar Gouri Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_025/32de32c1a13d/card.webp",
        "alt": "Kedar Gouri Temple architectural and landscape perspective",
        "title": "Kedar Gouri Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Kedar Gouri Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_025/32de32c1a13d/thumbnail.webp",
        "alt": "Kedar Gouri Temple panorama perspective",
        "title": "Kedar Gouri Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Kedar Gouri Temple",
        "isFallback": false
    }
],
  "Kedar Gouri Temple": [
    {
        "src": "/static/images/places/place_025/32de32c1a13d/hero.webp",
        "alt": "Authentic photograph of Kedar Gouri Temple in Odisha",
        "title": "Kedar Gouri Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Kedar Gouri Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_025/32de32c1a13d/card.webp",
        "alt": "Kedar Gouri Temple architectural and landscape perspective",
        "title": "Kedar Gouri Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Kedar Gouri Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_025/32de32c1a13d/thumbnail.webp",
        "alt": "Kedar Gouri Temple panorama perspective",
        "title": "Kedar Gouri Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Kedar Gouri Temple",
        "isFallback": false
    }
],
  "place_026": [
    {
        "src": "/static/images/places/place_026/37aea0eff98c/hero.webp",
        "alt": "Authentic photograph of Megheswar Temple in Odisha",
        "title": "Megheswar Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Megheswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_026/37aea0eff98c/card.webp",
        "alt": "Megheswar Temple architectural and landscape perspective",
        "title": "Megheswar Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Megheswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_026/37aea0eff98c/thumbnail.webp",
        "alt": "Megheswar Temple panorama perspective",
        "title": "Megheswar Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Megheswar Temple",
        "isFallback": false
    }
],
  "Megheswar Temple": [
    {
        "src": "/static/images/places/place_026/37aea0eff98c/hero.webp",
        "alt": "Authentic photograph of Megheswar Temple in Odisha",
        "title": "Megheswar Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Megheswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_026/37aea0eff98c/card.webp",
        "alt": "Megheswar Temple architectural and landscape perspective",
        "title": "Megheswar Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Megheswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_026/37aea0eff98c/thumbnail.webp",
        "alt": "Megheswar Temple panorama perspective",
        "title": "Megheswar Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Megheswar Temple",
        "isFallback": false
    }
],
  "place_027": [
    {
        "src": "/static/images/places/place_027/17b31b2b4531/hero.webp",
        "alt": "Authentic photograph of Nageshwar Temple in Odisha",
        "title": "Nageshwar Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Nageshwar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_027/17b31b2b4531/card.webp",
        "alt": "Nageshwar Temple architectural and landscape perspective",
        "title": "Nageshwar Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Nageshwar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_027/17b31b2b4531/thumbnail.webp",
        "alt": "Nageshwar Temple panorama perspective",
        "title": "Nageshwar Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Nageshwar Temple",
        "isFallback": false
    }
],
  "Nageshwar Temple": [
    {
        "src": "/static/images/places/place_027/17b31b2b4531/hero.webp",
        "alt": "Authentic photograph of Nageshwar Temple in Odisha",
        "title": "Nageshwar Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Nageshwar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_027/17b31b2b4531/card.webp",
        "alt": "Nageshwar Temple architectural and landscape perspective",
        "title": "Nageshwar Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Nageshwar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_027/17b31b2b4531/thumbnail.webp",
        "alt": "Nageshwar Temple panorama perspective",
        "title": "Nageshwar Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Nageshwar Temple",
        "isFallback": false
    }
],
  "place_puri_002": [
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/hero.webp",
      "alt": "Authentic photograph of Puri Golden Beach in Odisha",
      "title": "Puri Golden Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/card.webp",
      "alt": "Puri Golden Beach architectural and landscape perspective",
      "title": "Puri Golden Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/thumbnail.webp",
      "alt": "Puri Golden Beach panorama perspective",
      "title": "Puri Golden Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Puri Golden Beach": [
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/hero.webp",
      "alt": "Authentic photograph of Puri Golden Beach in Odisha",
      "title": "Puri Golden Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/card.webp",
      "alt": "Puri Golden Beach architectural and landscape perspective",
      "title": "Puri Golden Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/thumbnail.webp",
      "alt": "Puri Golden Beach panorama perspective",
      "title": "Puri Golden Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_005": [
    {
        "src": "/static/images/places/place_005/4e56a105e3a5/hero.webp",
        "alt": "Authentic photograph of Parasurameswar Temple in Odisha",
        "title": "Parasurameswar Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Parasurameswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_005/4e56a105e3a5/card.webp",
        "alt": "Parasurameswar Temple architectural and landscape perspective",
        "title": "Parasurameswar Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Parasurameswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_005/4e56a105e3a5/thumbnail.webp",
        "alt": "Parasurameswar Temple panorama perspective",
        "title": "Parasurameswar Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Parasurameswar Temple",
        "isFallback": false
    }
],
  "Parasurameswar Temple": [
    {
        "src": "/static/images/places/place_005/4e56a105e3a5/hero.webp",
        "alt": "Authentic photograph of Parasurameswar Temple in Odisha",
        "title": "Parasurameswar Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Parasurameswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_005/4e56a105e3a5/card.webp",
        "alt": "Parasurameswar Temple architectural and landscape perspective",
        "title": "Parasurameswar Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Parasurameswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_005/4e56a105e3a5/thumbnail.webp",
        "alt": "Parasurameswar Temple panorama perspective",
        "title": "Parasurameswar Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Parasurameswar Temple",
        "isFallback": false
    }
],
  "place_022": [
    {
        "src": "/static/images/places/place_022/250c5fb998e6/hero.webp",
        "alt": "Authentic photograph of Ram Mandir, Bhubaneswar in Odisha",
        "title": "Ram Mandir, Bhubaneswar",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Ram Mandir, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_022/250c5fb998e6/card.webp",
        "alt": "Ram Mandir, Bhubaneswar architectural and landscape perspective",
        "title": "Ram Mandir, Bhubaneswar Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Ram Mandir, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_022/250c5fb998e6/thumbnail.webp",
        "alt": "Ram Mandir, Bhubaneswar panorama perspective",
        "title": "Ram Mandir, Bhubaneswar Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Ram Mandir, Bhubaneswar",
        "isFallback": false
    }
],
  "Ram Mandir, Bhubaneswar": [
    {
        "src": "/static/images/places/place_022/250c5fb998e6/hero.webp",
        "alt": "Authentic photograph of Ram Mandir, Bhubaneswar in Odisha",
        "title": "Ram Mandir, Bhubaneswar",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Ram Mandir, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_022/250c5fb998e6/card.webp",
        "alt": "Ram Mandir, Bhubaneswar architectural and landscape perspective",
        "title": "Ram Mandir, Bhubaneswar Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Ram Mandir, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_022/250c5fb998e6/thumbnail.webp",
        "alt": "Ram Mandir, Bhubaneswar panorama perspective",
        "title": "Ram Mandir, Bhubaneswar Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Ram Mandir, Bhubaneswar",
        "isFallback": false
    }
],
  "place_021": [
    {
        "src": "/static/images/places/place_021/40dbffdb3896/hero.webp",
        "alt": "Authentic photograph of Rameshwar Deula in Odisha",
        "title": "Rameshwar Deula",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Rameshwar Deula",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_021/40dbffdb3896/card.webp",
        "alt": "Rameshwar Deula architectural and landscape perspective",
        "title": "Rameshwar Deula Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Rameshwar Deula",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_021/40dbffdb3896/thumbnail.webp",
        "alt": "Rameshwar Deula panorama perspective",
        "title": "Rameshwar Deula Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Rameshwar Deula",
        "isFallback": false
    }
],
  "Rameshwar Deula": [
    {
        "src": "/static/images/places/place_021/40dbffdb3896/hero.webp",
        "alt": "Authentic photograph of Rameshwar Deula in Odisha",
        "title": "Rameshwar Deula",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Rameshwar Deula",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_021/40dbffdb3896/card.webp",
        "alt": "Rameshwar Deula architectural and landscape perspective",
        "title": "Rameshwar Deula Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Rameshwar Deula",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_021/40dbffdb3896/thumbnail.webp",
        "alt": "Rameshwar Deula panorama perspective",
        "title": "Rameshwar Deula Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Rameshwar Deula",
        "isFallback": false
    }
],
  "place_028": [
    {
        "src": "/static/images/places/place_028/cd738a94a267/hero.webp",
        "alt": "Authentic photograph of Talesvara Siva Temple in Odisha",
        "title": "Talesvara Siva Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Talesvara Siva Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_028/cd738a94a267/card.webp",
        "alt": "Talesvara Siva Temple architectural and landscape perspective",
        "title": "Talesvara Siva Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Talesvara Siva Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_028/cd738a94a267/thumbnail.webp",
        "alt": "Talesvara Siva Temple panorama perspective",
        "title": "Talesvara Siva Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Talesvara Siva Temple",
        "isFallback": false
    }
],
  "Talesvara Siva Temple": [
    {
        "src": "/static/images/places/place_028/cd738a94a267/hero.webp",
        "alt": "Authentic photograph of Talesvara Siva Temple in Odisha",
        "title": "Talesvara Siva Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Talesvara Siva Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_028/cd738a94a267/card.webp",
        "alt": "Talesvara Siva Temple architectural and landscape perspective",
        "title": "Talesvara Siva Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Talesvara Siva Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_028/cd738a94a267/thumbnail.webp",
        "alt": "Talesvara Siva Temple panorama perspective",
        "title": "Talesvara Siva Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Talesvara Siva Temple",
        "isFallback": false
    }
],
  "place_023": [
    {
        "src": "/static/images/places/place_023/993614bac0d4/hero.webp",
        "alt": "Authentic photograph of Chitrakarini Temple in Odisha",
        "title": "Chitrakarini Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Chitrakarini Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_023/993614bac0d4/card.webp",
        "alt": "Chitrakarini Temple architectural and landscape perspective",
        "title": "Chitrakarini Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Chitrakarini Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_023/993614bac0d4/thumbnail.webp",
        "alt": "Chitrakarini Temple panorama perspective",
        "title": "Chitrakarini Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Chitrakarini Temple",
        "isFallback": false
    }
],
  "Chitrakarini Temple": [
    {
        "src": "/static/images/places/place_023/993614bac0d4/hero.webp",
        "alt": "Authentic photograph of Chitrakarini Temple in Odisha",
        "title": "Chitrakarini Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Chitrakarini Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_023/993614bac0d4/card.webp",
        "alt": "Chitrakarini Temple architectural and landscape perspective",
        "title": "Chitrakarini Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Chitrakarini Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_023/993614bac0d4/thumbnail.webp",
        "alt": "Chitrakarini Temple panorama perspective",
        "title": "Chitrakarini Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Chitrakarini Temple",
        "isFallback": false
    }
],
  "place_020": [
    {
        "src": "/static/images/places/place_020/eaedc027e860/hero.webp",
        "alt": "Authentic photograph of Bhaskareswar Temple in Odisha",
        "title": "Bhaskareswar Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bhaskareswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_020/eaedc027e860/card.webp",
        "alt": "Bhaskareswar Temple architectural and landscape perspective",
        "title": "Bhaskareswar Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bhaskareswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_020/eaedc027e860/thumbnail.webp",
        "alt": "Bhaskareswar Temple panorama perspective",
        "title": "Bhaskareswar Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bhaskareswar Temple",
        "isFallback": false
    }
],
  "Bhaskareswar Temple": [
    {
        "src": "/static/images/places/place_020/eaedc027e860/hero.webp",
        "alt": "Authentic photograph of Bhaskareswar Temple in Odisha",
        "title": "Bhaskareswar Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bhaskareswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_020/eaedc027e860/card.webp",
        "alt": "Bhaskareswar Temple architectural and landscape perspective",
        "title": "Bhaskareswar Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bhaskareswar Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_020/eaedc027e860/thumbnail.webp",
        "alt": "Bhaskareswar Temple panorama perspective",
        "title": "Bhaskareswar Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bhaskareswar Temple",
        "isFallback": false
    }
],
  "place_018": [
    {
        "src": "/static/images/places/place_018/3fdcd749885b/hero.webp",
        "alt": "Authentic photograph of Baitala Deula in Odisha",
        "title": "Baitala Deula",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Baitala Deula",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_018/3fdcd749885b/card.webp",
        "alt": "Baitala Deula architectural and landscape perspective",
        "title": "Baitala Deula Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Baitala Deula",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_018/3fdcd749885b/thumbnail.webp",
        "alt": "Baitala Deula panorama perspective",
        "title": "Baitala Deula Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Baitala Deula",
        "isFallback": false
    }
],
  "Baitala Deula": [
    {
        "src": "/static/images/places/place_018/3fdcd749885b/hero.webp",
        "alt": "Authentic photograph of Baitala Deula in Odisha",
        "title": "Baitala Deula",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Baitala Deula",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_018/3fdcd749885b/card.webp",
        "alt": "Baitala Deula architectural and landscape perspective",
        "title": "Baitala Deula Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Baitala Deula",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_018/3fdcd749885b/thumbnail.webp",
        "alt": "Baitala Deula panorama perspective",
        "title": "Baitala Deula Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Baitala Deula",
        "isFallback": false
    }
],
  "place_bbsr_004": [
    {
      "src": "/static/images/places/place_bbsr_004/b91e7a5f0092/hero.webp",
      "alt": "Authentic photograph of Ananta Vasudeva Temple in Odisha",
      "title": "Ananta Vasudeva Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_004/b91e7a5f0092/card.webp",
      "alt": "Ananta Vasudeva Temple architectural and landscape perspective",
      "title": "Ananta Vasudeva Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_004/b91e7a5f0092/thumbnail.webp",
      "alt": "Ananta Vasudeva Temple panorama perspective",
      "title": "Ananta Vasudeva Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Ananta Vasudeva Temple": [
    {
      "src": "/static/images/places/place_bbsr_004/b91e7a5f0092/hero.webp",
      "alt": "Authentic photograph of Ananta Vasudeva Temple in Odisha",
      "title": "Ananta Vasudeva Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_004/b91e7a5f0092/card.webp",
      "alt": "Ananta Vasudeva Temple architectural and landscape perspective",
      "title": "Ananta Vasudeva Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_004/b91e7a5f0092/thumbnail.webp",
      "alt": "Ananta Vasudeva Temple panorama perspective",
      "title": "Ananta Vasudeva Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_bbsr_005": [
    {
      "src": "/static/images/places/place_bbsr_005/87c823650f8a/hero.webp",
      "alt": "Authentic photograph of Udayagiri and Khandagiri Caves in Odisha",
      "title": "Udayagiri and Khandagiri Caves",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Sourav Das from Santa Barbara, USA via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_005/87c823650f8a/card.webp",
      "alt": "Udayagiri and Khandagiri Caves architectural and landscape perspective",
      "title": "Udayagiri and Khandagiri Caves Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Sourav Das from Santa Barbara, USA via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_005/87c823650f8a/thumbnail.webp",
      "alt": "Udayagiri and Khandagiri Caves panorama perspective",
      "title": "Udayagiri and Khandagiri Caves Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Sourav Das from Santa Barbara, USA via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    }
  ],
  "Udayagiri and Khandagiri Caves": [
    {
      "src": "/static/images/places/place_bbsr_005/87c823650f8a/hero.webp",
      "alt": "Authentic photograph of Udayagiri and Khandagiri Caves in Odisha",
      "title": "Udayagiri and Khandagiri Caves",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Sourav Das from Santa Barbara, USA via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_005/87c823650f8a/card.webp",
      "alt": "Udayagiri and Khandagiri Caves architectural and landscape perspective",
      "title": "Udayagiri and Khandagiri Caves Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Sourav Das from Santa Barbara, USA via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_005/87c823650f8a/thumbnail.webp",
      "alt": "Udayagiri and Khandagiri Caves panorama perspective",
      "title": "Udayagiri and Khandagiri Caves Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Sourav Das from Santa Barbara, USA via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    }
  ],
  "place_bbsr_002": [
    {
      "src": "/static/images/places/place_bbsr_002/bf6293b73157/hero.webp",
      "alt": "Authentic photograph of Mukteswar Temple in Odisha",
      "title": "Mukteswar Temple",
      "source": "Wikimedia Commons",
      "license": "CC0",
      "attribution": "Photo by Anandbora2024 via Wikimedia Commons, licensed under CC0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_002/bf6293b73157/card.webp",
      "alt": "Mukteswar Temple architectural and landscape perspective",
      "title": "Mukteswar Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC0",
      "attribution": "Photo by Anandbora2024 via Wikimedia Commons, licensed under CC0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_002/bf6293b73157/thumbnail.webp",
      "alt": "Mukteswar Temple panorama perspective",
      "title": "Mukteswar Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC0",
      "attribution": "Photo by Anandbora2024 via Wikimedia Commons, licensed under CC0",
      "isFallback": false
    }
  ],
  "Mukteswar Temple": [
    {
      "src": "/static/images/places/place_bbsr_002/bf6293b73157/hero.webp",
      "alt": "Authentic photograph of Mukteswar Temple in Odisha",
      "title": "Mukteswar Temple",
      "source": "Wikimedia Commons",
      "license": "CC0",
      "attribution": "Photo by Anandbora2024 via Wikimedia Commons, licensed under CC0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_002/bf6293b73157/card.webp",
      "alt": "Mukteswar Temple architectural and landscape perspective",
      "title": "Mukteswar Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC0",
      "attribution": "Photo by Anandbora2024 via Wikimedia Commons, licensed under CC0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_002/bf6293b73157/thumbnail.webp",
      "alt": "Mukteswar Temple panorama perspective",
      "title": "Mukteswar Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC0",
      "attribution": "Photo by Anandbora2024 via Wikimedia Commons, licensed under CC0",
      "isFallback": false
    }
  ],
  "place_bbsr_012": [
    {
      "src": "/static/images/places/place_bbsr_012/3e013f8a3fd2/hero.webp",
      "alt": "Authentic photograph of Bindu Sagar in Odisha",
      "title": "Bindu Sagar",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jalmanav via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_012/3e013f8a3fd2/card.webp",
      "alt": "Bindu Sagar architectural and landscape perspective",
      "title": "Bindu Sagar Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jalmanav via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_012/3e013f8a3fd2/thumbnail.webp",
      "alt": "Bindu Sagar panorama perspective",
      "title": "Bindu Sagar Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jalmanav via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Bindu Sagar": [
    {
      "src": "/static/images/places/place_bbsr_012/3e013f8a3fd2/hero.webp",
      "alt": "Authentic photograph of Bindu Sagar in Odisha",
      "title": "Bindu Sagar",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jalmanav via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_012/3e013f8a3fd2/card.webp",
      "alt": "Bindu Sagar architectural and landscape perspective",
      "title": "Bindu Sagar Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jalmanav via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_012/3e013f8a3fd2/thumbnail.webp",
      "alt": "Bindu Sagar panorama perspective",
      "title": "Bindu Sagar Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jalmanav via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_bbsr_007": [
    {
      "src": "/static/images/places/place_bbsr_007/83ddf7bcbca3/hero.webp",
      "alt": "Authentic photograph of Nandankanan Zoological Park in Odisha",
      "title": "Nandankanan Zoological Park",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by DrGSINGH via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_007/83ddf7bcbca3/card.webp",
      "alt": "Nandankanan Zoological Park architectural and landscape perspective",
      "title": "Nandankanan Zoological Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by DrGSINGH via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_007/83ddf7bcbca3/thumbnail.webp",
      "alt": "Nandankanan Zoological Park panorama perspective",
      "title": "Nandankanan Zoological Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by DrGSINGH via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Nandankanan Zoological Park": [
    {
      "src": "/static/images/places/place_bbsr_007/83ddf7bcbca3/hero.webp",
      "alt": "Authentic photograph of Nandankanan Zoological Park in Odisha",
      "title": "Nandankanan Zoological Park",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by DrGSINGH via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_007/83ddf7bcbca3/card.webp",
      "alt": "Nandankanan Zoological Park architectural and landscape perspective",
      "title": "Nandankanan Zoological Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by DrGSINGH via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_007/83ddf7bcbca3/thumbnail.webp",
      "alt": "Nandankanan Zoological Park panorama perspective",
      "title": "Nandankanan Zoological Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by DrGSINGH via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_konark_003": [
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/hero.webp",
      "alt": "Authentic photograph of Ramachandi Beach & Temple in Odisha",
      "title": "Ramachandi Beach & Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/card.webp",
      "alt": "Ramachandi Beach & Temple architectural and landscape perspective",
      "title": "Ramachandi Beach & Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/thumbnail.webp",
      "alt": "Ramachandi Beach & Temple panorama perspective",
      "title": "Ramachandi Beach & Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Ramachandi Beach & Temple": [
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/hero.webp",
      "alt": "Authentic photograph of Ramachandi Beach & Temple in Odisha",
      "title": "Ramachandi Beach & Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/card.webp",
      "alt": "Ramachandi Beach & Temple architectural and landscape perspective",
      "title": "Ramachandi Beach & Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/thumbnail.webp",
      "alt": "Ramachandi Beach & Temple panorama perspective",
      "title": "Ramachandi Beach & Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_chilika_002": [
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/hero.webp",
      "alt": "Authentic photograph of Kalijai Island Temple, Chilika in Odisha",
      "title": "Kalijai Island Temple, Chilika",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/card.webp",
      "alt": "Kalijai Island Temple, Chilika architectural and landscape perspective",
      "title": "Kalijai Island Temple, Chilika Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/thumbnail.webp",
      "alt": "Kalijai Island Temple, Chilika panorama perspective",
      "title": "Kalijai Island Temple, Chilika Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Kalijai Island Temple, Chilika": [
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/hero.webp",
      "alt": "Authentic photograph of Kalijai Island Temple, Chilika in Odisha",
      "title": "Kalijai Island Temple, Chilika",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/card.webp",
      "alt": "Kalijai Island Temple, Chilika architectural and landscape perspective",
      "title": "Kalijai Island Temple, Chilika Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/thumbnail.webp",
      "alt": "Kalijai Island Temple, Chilika panorama perspective",
      "title": "Kalijai Island Temple, Chilika Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_puri_003": [
    {
      "src": "/static/images/places/place_puri_003/f14517383b2e/hero.webp",
      "alt": "Authentic photograph of Gundicha Temple in Odisha",
      "title": "Gundicha Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_003/f14517383b2e/card.webp",
      "alt": "Gundicha Temple architectural and landscape perspective",
      "title": "Gundicha Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_003/f14517383b2e/thumbnail.webp",
      "alt": "Gundicha Temple panorama perspective",
      "title": "Gundicha Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "Gundicha Temple": [
    {
      "src": "/static/images/places/place_puri_003/f14517383b2e/hero.webp",
      "alt": "Authentic photograph of Gundicha Temple in Odisha",
      "title": "Gundicha Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_003/f14517383b2e/card.webp",
      "alt": "Gundicha Temple architectural and landscape perspective",
      "title": "Gundicha Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_003/f14517383b2e/thumbnail.webp",
      "alt": "Gundicha Temple panorama perspective",
      "title": "Gundicha Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "place_puri_001": [
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/hero.webp",
      "alt": "Authentic photograph of Jagannath Temple, Puri in Odisha",
      "title": "Jagannath Temple, Puri",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/card.webp",
      "alt": "Jagannath Temple, Puri architectural and landscape perspective",
      "title": "Jagannath Temple, Puri Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/thumbnail.webp",
      "alt": "Jagannath Temple, Puri panorama perspective",
      "title": "Jagannath Temple, Puri Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Jagannath Temple, Puri": [
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/hero.webp",
      "alt": "Authentic photograph of Jagannath Temple, Puri in Odisha",
      "title": "Jagannath Temple, Puri",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/card.webp",
      "alt": "Jagannath Temple, Puri architectural and landscape perspective",
      "title": "Jagannath Temple, Puri Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/thumbnail.webp",
      "alt": "Jagannath Temple, Puri panorama perspective",
      "title": "Jagannath Temple, Puri Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_sambalpur_002": [
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/hero.webp",
      "alt": "Authentic photograph of Samaleswari Temple, Sambalpur in Odisha",
      "title": "Samaleswari Temple, Sambalpur",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/card.webp",
      "alt": "Samaleswari Temple, Sambalpur architectural and landscape perspective",
      "title": "Samaleswari Temple, Sambalpur Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/thumbnail.webp",
      "alt": "Samaleswari Temple, Sambalpur panorama perspective",
      "title": "Samaleswari Temple, Sambalpur Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Samaleswari Temple, Sambalpur": [
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/hero.webp",
      "alt": "Authentic photograph of Samaleswari Temple, Sambalpur in Odisha",
      "title": "Samaleswari Temple, Sambalpur",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/card.webp",
      "alt": "Samaleswari Temple, Sambalpur architectural and landscape perspective",
      "title": "Samaleswari Temple, Sambalpur Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/thumbnail.webp",
      "alt": "Samaleswari Temple, Sambalpur panorama perspective",
      "title": "Samaleswari Temple, Sambalpur Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_bbsr_011": [
    {
      "src": "/static/images/places/place_bbsr_011/36e8a9a95990/hero.webp",
      "alt": "Authentic photograph of Kalinga Stadium in Odisha",
      "title": "Kalinga Stadium",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_011/36e8a9a95990/card.webp",
      "alt": "Kalinga Stadium architectural and landscape perspective",
      "title": "Kalinga Stadium Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_011/36e8a9a95990/thumbnail.webp",
      "alt": "Kalinga Stadium panorama perspective",
      "title": "Kalinga Stadium Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "Kalinga Stadium": [
    {
      "src": "/static/images/places/place_bbsr_011/36e8a9a95990/hero.webp",
      "alt": "Authentic photograph of Kalinga Stadium in Odisha",
      "title": "Kalinga Stadium",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_011/36e8a9a95990/card.webp",
      "alt": "Kalinga Stadium architectural and landscape perspective",
      "title": "Kalinga Stadium Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_011/36e8a9a95990/thumbnail.webp",
      "alt": "Kalinga Stadium panorama perspective",
      "title": "Kalinga Stadium Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "place_puri_004": [
    {
      "src": "/static/images/places/place_puri_004/292d580f6bc0/hero.webp",
      "alt": "Authentic photograph of Swargadwar Beach in Odisha",
      "title": "Swargadwar Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_004/292d580f6bc0/card.webp",
      "alt": "Swargadwar Beach architectural and landscape perspective",
      "title": "Swargadwar Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_004/292d580f6bc0/thumbnail.webp",
      "alt": "Swargadwar Beach panorama perspective",
      "title": "Swargadwar Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Swargadwar Beach": [
    {
      "src": "/static/images/places/place_puri_004/292d580f6bc0/hero.webp",
      "alt": "Authentic photograph of Swargadwar Beach in Odisha",
      "title": "Swargadwar Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_004/292d580f6bc0/card.webp",
      "alt": "Swargadwar Beach architectural and landscape perspective",
      "title": "Swargadwar Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_004/292d580f6bc0/thumbnail.webp",
      "alt": "Swargadwar Beach panorama perspective",
      "title": "Swargadwar Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_cuttack_001": [
    {
      "src": "/static/images/places/place_cuttack_001/02e40272a98d/hero.webp",
      "alt": "Authentic photograph of Barabati Fort in Odisha",
      "title": "Barabati Fort",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by MysticStone via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_001/02e40272a98d/card.webp",
      "alt": "Barabati Fort architectural and landscape perspective",
      "title": "Barabati Fort Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by MysticStone via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_001/02e40272a98d/thumbnail.webp",
      "alt": "Barabati Fort panorama perspective",
      "title": "Barabati Fort Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by MysticStone via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Barabati Fort": [
    {
      "src": "/static/images/places/place_cuttack_001/02e40272a98d/hero.webp",
      "alt": "Authentic photograph of Barabati Fort in Odisha",
      "title": "Barabati Fort",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by MysticStone via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_001/02e40272a98d/card.webp",
      "alt": "Barabati Fort architectural and landscape perspective",
      "title": "Barabati Fort Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by MysticStone via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_001/02e40272a98d/thumbnail.webp",
      "alt": "Barabati Fort panorama perspective",
      "title": "Barabati Fort Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by MysticStone via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_rourkela_001": [
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/hero.webp",
      "alt": "Authentic photograph of Hanuman Vatika, Rourkela in Odisha",
      "title": "Hanuman Vatika, Rourkela",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/card.webp",
      "alt": "Hanuman Vatika, Rourkela architectural and landscape perspective",
      "title": "Hanuman Vatika, Rourkela Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/thumbnail.webp",
      "alt": "Hanuman Vatika, Rourkela panorama perspective",
      "title": "Hanuman Vatika, Rourkela Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Hanuman Vatika, Rourkela": [
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/hero.webp",
      "alt": "Authentic photograph of Hanuman Vatika, Rourkela in Odisha",
      "title": "Hanuman Vatika, Rourkela",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/card.webp",
      "alt": "Hanuman Vatika, Rourkela architectural and landscape perspective",
      "title": "Hanuman Vatika, Rourkela Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/thumbnail.webp",
      "alt": "Hanuman Vatika, Rourkela panorama perspective",
      "title": "Hanuman Vatika, Rourkela Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_sambalpur_001": [
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/hero.webp",
      "alt": "Authentic photograph of Hirakud Dam & Reservoir in Odisha",
      "title": "Hirakud Dam & Reservoir",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/card.webp",
      "alt": "Hirakud Dam & Reservoir architectural and landscape perspective",
      "title": "Hirakud Dam & Reservoir Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/thumbnail.webp",
      "alt": "Hirakud Dam & Reservoir panorama perspective",
      "title": "Hirakud Dam & Reservoir Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Hirakud Dam & Reservoir": [
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/hero.webp",
      "alt": "Authentic photograph of Hirakud Dam & Reservoir in Odisha",
      "title": "Hirakud Dam & Reservoir",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/card.webp",
      "alt": "Hirakud Dam & Reservoir architectural and landscape perspective",
      "title": "Hirakud Dam & Reservoir Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/thumbnail.webp",
      "alt": "Hirakud Dam & Reservoir panorama perspective",
      "title": "Hirakud Dam & Reservoir Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_rourkela_003": [
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/hero.webp",
      "alt": "Authentic photograph of Khandadhar Waterfall, Sundargarh in Odisha",
      "title": "Khandadhar Waterfall, Sundargarh",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/card.webp",
      "alt": "Khandadhar Waterfall, Sundargarh architectural and landscape perspective",
      "title": "Khandadhar Waterfall, Sundargarh Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/thumbnail.webp",
      "alt": "Khandadhar Waterfall, Sundargarh panorama perspective",
      "title": "Khandadhar Waterfall, Sundargarh Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Khandadhar Waterfall, Sundargarh": [
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/hero.webp",
      "alt": "Authentic photograph of Khandadhar Waterfall, Sundargarh in Odisha",
      "title": "Khandadhar Waterfall, Sundargarh",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/card.webp",
      "alt": "Khandadhar Waterfall, Sundargarh architectural and landscape perspective",
      "title": "Khandadhar Waterfall, Sundargarh Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/thumbnail.webp",
      "alt": "Khandadhar Waterfall, Sundargarh panorama perspective",
      "title": "Khandadhar Waterfall, Sundargarh Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_konark_002": [
    {
      "src": "/static/images/places/place_konark_002/96b3058c4a4d/hero.webp",
      "alt": "Authentic photograph of Chandrabhaga Beach in Odisha",
      "title": "Chandrabhaga Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_002/96b3058c4a4d/card.webp",
      "alt": "Chandrabhaga Beach architectural and landscape perspective",
      "title": "Chandrabhaga Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_002/96b3058c4a4d/thumbnail.webp",
      "alt": "Chandrabhaga Beach panorama perspective",
      "title": "Chandrabhaga Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Chandrabhaga Beach": [
    {
      "src": "/static/images/places/place_konark_002/96b3058c4a4d/hero.webp",
      "alt": "Authentic photograph of Chandrabhaga Beach in Odisha",
      "title": "Chandrabhaga Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_002/96b3058c4a4d/card.webp",
      "alt": "Chandrabhaga Beach architectural and landscape perspective",
      "title": "Chandrabhaga Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_002/96b3058c4a4d/thumbnail.webp",
      "alt": "Chandrabhaga Beach panorama perspective",
      "title": "Chandrabhaga Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_koraput_001": [
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/hero.webp",
      "alt": "Authentic photograph of Gupteswar Cave Temple, Koraput in Odisha",
      "title": "Gupteswar Cave Temple, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/card.webp",
      "alt": "Gupteswar Cave Temple, Koraput architectural and landscape perspective",
      "title": "Gupteswar Cave Temple, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/thumbnail.webp",
      "alt": "Gupteswar Cave Temple, Koraput panorama perspective",
      "title": "Gupteswar Cave Temple, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Gupteswar Cave Temple, Koraput": [
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/hero.webp",
      "alt": "Authentic photograph of Gupteswar Cave Temple, Koraput in Odisha",
      "title": "Gupteswar Cave Temple, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/card.webp",
      "alt": "Gupteswar Cave Temple, Koraput architectural and landscape perspective",
      "title": "Gupteswar Cave Temple, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/thumbnail.webp",
      "alt": "Gupteswar Cave Temple, Koraput panorama perspective",
      "title": "Gupteswar Cave Temple, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_mayurbhanj_002": [
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/hero.webp",
      "alt": "Authentic photograph of Barehipani & Joranda Falls in Odisha",
      "title": "Barehipani & Joranda Falls",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/card.webp",
      "alt": "Barehipani & Joranda Falls architectural and landscape perspective",
      "title": "Barehipani & Joranda Falls Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/thumbnail.webp",
      "alt": "Barehipani & Joranda Falls panorama perspective",
      "title": "Barehipani & Joranda Falls Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Barehipani & Joranda Falls": [
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/hero.webp",
      "alt": "Authentic photograph of Barehipani & Joranda Falls in Odisha",
      "title": "Barehipani & Joranda Falls",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/card.webp",
      "alt": "Barehipani & Joranda Falls architectural and landscape perspective",
      "title": "Barehipani & Joranda Falls Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/thumbnail.webp",
      "alt": "Barehipani & Joranda Falls panorama perspective",
      "title": "Barehipani & Joranda Falls Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_chilika_003": [
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/hero.webp",
      "alt": "Authentic photograph of Mangalajodi Bird Sanctuary in Odisha",
      "title": "Mangalajodi Bird Sanctuary",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/card.webp",
      "alt": "Mangalajodi Bird Sanctuary architectural and landscape perspective",
      "title": "Mangalajodi Bird Sanctuary Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/thumbnail.webp",
      "alt": "Mangalajodi Bird Sanctuary panorama perspective",
      "title": "Mangalajodi Bird Sanctuary Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    }
  ],
  "Mangalajodi Bird Sanctuary": [
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/hero.webp",
      "alt": "Authentic photograph of Mangalajodi Bird Sanctuary in Odisha",
      "title": "Mangalajodi Bird Sanctuary",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/card.webp",
      "alt": "Mangalajodi Bird Sanctuary architectural and landscape perspective",
      "title": "Mangalajodi Bird Sanctuary Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/thumbnail.webp",
      "alt": "Mangalajodi Bird Sanctuary panorama perspective",
      "title": "Mangalajodi Bird Sanctuary Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    }
  ],
  "place_kendrapara_001": [
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/hero.webp",
      "alt": "Authentic photograph of Bhitarkanika National Park in Odisha",
      "title": "Bhitarkanika National Park",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/card.webp",
      "alt": "Bhitarkanika National Park architectural and landscape perspective",
      "title": "Bhitarkanika National Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/thumbnail.webp",
      "alt": "Bhitarkanika National Park panorama perspective",
      "title": "Bhitarkanika National Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Bhitarkanika National Park": [
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/hero.webp",
      "alt": "Authentic photograph of Bhitarkanika National Park in Odisha",
      "title": "Bhitarkanika National Park",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/card.webp",
      "alt": "Bhitarkanika National Park architectural and landscape perspective",
      "title": "Bhitarkanika National Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/thumbnail.webp",
      "alt": "Bhitarkanika National Park panorama perspective",
      "title": "Bhitarkanika National Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_koraput_005": [
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/hero.webp",
      "alt": "Authentic photograph of Kolab Reservoir & Botanical Garden in Odisha",
      "title": "Kolab Reservoir & Botanical Garden",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/card.webp",
      "alt": "Kolab Reservoir & Botanical Garden architectural and landscape perspective",
      "title": "Kolab Reservoir & Botanical Garden Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/thumbnail.webp",
      "alt": "Kolab Reservoir & Botanical Garden panorama perspective",
      "title": "Kolab Reservoir & Botanical Garden Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Kolab Reservoir & Botanical Garden": [
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/hero.webp",
      "alt": "Authentic photograph of Kolab Reservoir & Botanical Garden in Odisha",
      "title": "Kolab Reservoir & Botanical Garden",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/card.webp",
      "alt": "Kolab Reservoir & Botanical Garden architectural and landscape perspective",
      "title": "Kolab Reservoir & Botanical Garden Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/thumbnail.webp",
      "alt": "Kolab Reservoir & Botanical Garden panorama perspective",
      "title": "Kolab Reservoir & Botanical Garden Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_konark_001": [
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/hero.webp",
      "alt": "Authentic photograph of Konark Sun Temple in Odisha",
      "title": "Konark Sun Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/card.webp",
      "alt": "Konark Sun Temple architectural and landscape perspective",
      "title": "Konark Sun Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/thumbnail.webp",
      "alt": "Konark Sun Temple panorama perspective",
      "title": "Konark Sun Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Konark Sun Temple": [
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/hero.webp",
      "alt": "Authentic photograph of Konark Sun Temple in Odisha",
      "title": "Konark Sun Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/card.webp",
      "alt": "Konark Sun Temple architectural and landscape perspective",
      "title": "Konark Sun Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/thumbnail.webp",
      "alt": "Konark Sun Temple panorama perspective",
      "title": "Konark Sun Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_ganjam_001": [
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/hero.webp",
      "alt": "Authentic photograph of Gopalpur-on-Sea Beach in Odisha",
      "title": "Gopalpur-on-Sea Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/card.webp",
      "alt": "Gopalpur-on-Sea Beach architectural and landscape perspective",
      "title": "Gopalpur-on-Sea Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/thumbnail.webp",
      "alt": "Gopalpur-on-Sea Beach panorama perspective",
      "title": "Gopalpur-on-Sea Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Gopalpur-on-Sea Beach": [
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/hero.webp",
      "alt": "Authentic photograph of Gopalpur-on-Sea Beach in Odisha",
      "title": "Gopalpur-on-Sea Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/card.webp",
      "alt": "Gopalpur-on-Sea Beach architectural and landscape perspective",
      "title": "Gopalpur-on-Sea Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/thumbnail.webp",
      "alt": "Gopalpur-on-Sea Beach panorama perspective",
      "title": "Gopalpur-on-Sea Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_cuttack_004": [
    {
      "src": "/static/images/places/place_cuttack_004/3d8ae5f82b5d/hero.webp",
      "alt": "Authentic photograph of Netaji Birth Place Museum in Odisha",
      "title": "Netaji Birth Place Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_004/3d8ae5f82b5d/card.webp",
      "alt": "Netaji Birth Place Museum architectural and landscape perspective",
      "title": "Netaji Birth Place Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_004/3d8ae5f82b5d/thumbnail.webp",
      "alt": "Netaji Birth Place Museum panorama perspective",
      "title": "Netaji Birth Place Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Netaji Birth Place Museum": [
    {
      "src": "/static/images/places/place_cuttack_004/3d8ae5f82b5d/hero.webp",
      "alt": "Authentic photograph of Netaji Birth Place Museum in Odisha",
      "title": "Netaji Birth Place Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_004/3d8ae5f82b5d/card.webp",
      "alt": "Netaji Birth Place Museum architectural and landscape perspective",
      "title": "Netaji Birth Place Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_004/3d8ae5f82b5d/thumbnail.webp",
      "alt": "Netaji Birth Place Museum panorama perspective",
      "title": "Netaji Birth Place Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_sambalpur_003": [
    {
      "src": "/static/images/places/place_sambalpur_003/62ffb7d419a2/hero.webp",
      "alt": "Authentic photograph of Huma Leaning Temple in Odisha",
      "title": "Huma Leaning Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jnanaranjan sahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_003/62ffb7d419a2/card.webp",
      "alt": "Huma Leaning Temple architectural and landscape perspective",
      "title": "Huma Leaning Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jnanaranjan sahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_003/62ffb7d419a2/thumbnail.webp",
      "alt": "Huma Leaning Temple panorama perspective",
      "title": "Huma Leaning Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jnanaranjan sahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Huma Leaning Temple": [
    {
      "src": "/static/images/places/place_sambalpur_003/62ffb7d419a2/hero.webp",
      "alt": "Authentic photograph of Huma Leaning Temple in Odisha",
      "title": "Huma Leaning Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jnanaranjan sahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_003/62ffb7d419a2/card.webp",
      "alt": "Huma Leaning Temple architectural and landscape perspective",
      "title": "Huma Leaning Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jnanaranjan sahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_003/62ffb7d419a2/thumbnail.webp",
      "alt": "Huma Leaning Temple panorama perspective",
      "title": "Huma Leaning Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jnanaranjan sahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_ganjam_002": [
    {
      "src": "/static/images/places/place_ganjam_002/87bc44f63b2d/hero.webp",
      "alt": "Authentic photograph of Tara Tarini Temple in Odisha",
      "title": "Tara Tarini Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_002/87bc44f63b2d/card.webp",
      "alt": "Tara Tarini Temple architectural and landscape perspective",
      "title": "Tara Tarini Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_002/87bc44f63b2d/thumbnail.webp",
      "alt": "Tara Tarini Temple panorama perspective",
      "title": "Tara Tarini Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "Tara Tarini Temple": [
    {
      "src": "/static/images/places/place_ganjam_002/87bc44f63b2d/hero.webp",
      "alt": "Authentic photograph of Tara Tarini Temple in Odisha",
      "title": "Tara Tarini Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_002/87bc44f63b2d/card.webp",
      "alt": "Tara Tarini Temple architectural and landscape perspective",
      "title": "Tara Tarini Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_002/87bc44f63b2d/thumbnail.webp",
      "alt": "Tara Tarini Temple panorama perspective",
      "title": "Tara Tarini Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "place_konark_004": [
    {
      "src": "/static/images/places/place_konark_004/ea4b0bedaa44/hero.webp",
      "alt": "Authentic photograph of Konark Archaeological Museum in Odisha",
      "title": "Konark Archaeological Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_004/ea4b0bedaa44/card.webp",
      "alt": "Konark Archaeological Museum architectural and landscape perspective",
      "title": "Konark Archaeological Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_004/ea4b0bedaa44/thumbnail.webp",
      "alt": "Konark Archaeological Museum panorama perspective",
      "title": "Konark Archaeological Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Konark Archaeological Museum": [
    {
      "src": "/static/images/places/place_konark_004/ea4b0bedaa44/hero.webp",
      "alt": "Authentic photograph of Konark Archaeological Museum in Odisha",
      "title": "Konark Archaeological Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_004/ea4b0bedaa44/card.webp",
      "alt": "Konark Archaeological Museum architectural and landscape perspective",
      "title": "Konark Archaeological Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_004/ea4b0bedaa44/thumbnail.webp",
      "alt": "Konark Archaeological Museum panorama perspective",
      "title": "Konark Archaeological Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_daringbadi_003": [
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/hero.webp",
      "alt": "Authentic photograph of Coffee Gardens, Daringbadi in Odisha",
      "title": "Coffee Gardens, Daringbadi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/card.webp",
      "alt": "Coffee Gardens, Daringbadi architectural and landscape perspective",
      "title": "Coffee Gardens, Daringbadi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/thumbnail.webp",
      "alt": "Coffee Gardens, Daringbadi panorama perspective",
      "title": "Coffee Gardens, Daringbadi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Coffee Gardens, Daringbadi": [
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/hero.webp",
      "alt": "Authentic photograph of Coffee Gardens, Daringbadi in Odisha",
      "title": "Coffee Gardens, Daringbadi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/card.webp",
      "alt": "Coffee Gardens, Daringbadi architectural and landscape perspective",
      "title": "Coffee Gardens, Daringbadi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/thumbnail.webp",
      "alt": "Coffee Gardens, Daringbadi panorama perspective",
      "title": "Coffee Gardens, Daringbadi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_mayurbhanj_001": [
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/hero.webp",
      "alt": "Authentic photograph of Similipal National Park in Odisha",
      "title": "Similipal National Park",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/card.webp",
      "alt": "Similipal National Park architectural and landscape perspective",
      "title": "Similipal National Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/thumbnail.webp",
      "alt": "Similipal National Park panorama perspective",
      "title": "Similipal National Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "Similipal National Park": [
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/hero.webp",
      "alt": "Authentic photograph of Similipal National Park in Odisha",
      "title": "Similipal National Park",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/card.webp",
      "alt": "Similipal National Park architectural and landscape perspective",
      "title": "Similipal National Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/thumbnail.webp",
      "alt": "Similipal National Park panorama perspective",
      "title": "Similipal National Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "place_koraput_003": [
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/hero.webp",
      "alt": "Authentic photograph of Deomali Peak, Koraput in Odisha",
      "title": "Deomali Peak, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/card.webp",
      "alt": "Deomali Peak, Koraput architectural and landscape perspective",
      "title": "Deomali Peak, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/thumbnail.webp",
      "alt": "Deomali Peak, Koraput panorama perspective",
      "title": "Deomali Peak, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Deomali Peak, Koraput": [
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/hero.webp",
      "alt": "Authentic photograph of Deomali Peak, Koraput in Odisha",
      "title": "Deomali Peak, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/card.webp",
      "alt": "Deomali Peak, Koraput architectural and landscape perspective",
      "title": "Deomali Peak, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/thumbnail.webp",
      "alt": "Deomali Peak, Koraput panorama perspective",
      "title": "Deomali Peak, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_chilika_001": [
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/hero.webp",
      "alt": "Authentic photograph of Chilika Lake - Satapada in Odisha",
      "title": "Chilika Lake - Satapada",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/card.webp",
      "alt": "Chilika Lake - Satapada architectural and landscape perspective",
      "title": "Chilika Lake - Satapada Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/thumbnail.webp",
      "alt": "Chilika Lake - Satapada panorama perspective",
      "title": "Chilika Lake - Satapada Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Chilika Lake - Satapada": [
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/hero.webp",
      "alt": "Authentic photograph of Chilika Lake - Satapada in Odisha",
      "title": "Chilika Lake - Satapada",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/card.webp",
      "alt": "Chilika Lake - Satapada architectural and landscape perspective",
      "title": "Chilika Lake - Satapada Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/thumbnail.webp",
      "alt": "Chilika Lake - Satapada panorama perspective",
      "title": "Chilika Lake - Satapada Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_balasore_001": [
    {
      "src": "/static/images/places/place_balasore_001/7b71840acce2/hero.webp",
      "alt": "Authentic photograph of Chandipur Beach in Odisha",
      "title": "Chandipur Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by B.Sunita M via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_balasore_001/7b71840acce2/card.webp",
      "alt": "Chandipur Beach architectural and landscape perspective",
      "title": "Chandipur Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by B.Sunita M via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_balasore_001/7b71840acce2/thumbnail.webp",
      "alt": "Chandipur Beach panorama perspective",
      "title": "Chandipur Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by B.Sunita M via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Chandipur Beach": [
    {
      "src": "/static/images/places/place_balasore_001/7b71840acce2/hero.webp",
      "alt": "Authentic photograph of Chandipur Beach in Odisha",
      "title": "Chandipur Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by B.Sunita M via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_balasore_001/7b71840acce2/card.webp",
      "alt": "Chandipur Beach architectural and landscape perspective",
      "title": "Chandipur Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by B.Sunita M via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_balasore_001/7b71840acce2/thumbnail.webp",
      "alt": "Chandipur Beach panorama perspective",
      "title": "Chandipur Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by B.Sunita M via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_daringbadi_004": [
    {
      "src": "/static/images/places/place_daringbadi_004/c5ae233d3210/hero.webp",
      "alt": "Authentic photograph of Belghar Nature Camp in Odisha",
      "title": "Belghar Nature Camp",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 at Bangla Wikipedia via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_004/c5ae233d3210/card.webp",
      "alt": "Belghar Nature Camp architectural and landscape perspective",
      "title": "Belghar Nature Camp Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 at Bangla Wikipedia via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_004/c5ae233d3210/thumbnail.webp",
      "alt": "Belghar Nature Camp panorama perspective",
      "title": "Belghar Nature Camp Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 at Bangla Wikipedia via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Belghar Nature Camp": [
    {
      "src": "/static/images/places/place_daringbadi_004/c5ae233d3210/hero.webp",
      "alt": "Authentic photograph of Belghar Nature Camp in Odisha",
      "title": "Belghar Nature Camp",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 at Bangla Wikipedia via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_004/c5ae233d3210/card.webp",
      "alt": "Belghar Nature Camp architectural and landscape perspective",
      "title": "Belghar Nature Camp Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 at Bangla Wikipedia via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_004/c5ae233d3210/thumbnail.webp",
      "alt": "Belghar Nature Camp panorama perspective",
      "title": "Belghar Nature Camp Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 at Bangla Wikipedia via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_bbsr_009": [
    {
      "src": "/static/images/places/place_bbsr_009/d3fdc630c2d8/hero.webp",
      "alt": "Authentic photograph of Odisha Crafts Museum Kala Bhoomi in Odisha",
      "title": "Odisha Crafts Museum Kala Bhoomi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by SUDEEP PRAMANIK via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_009/d3fdc630c2d8/card.webp",
      "alt": "Odisha Crafts Museum Kala Bhoomi architectural and landscape perspective",
      "title": "Odisha Crafts Museum Kala Bhoomi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by SUDEEP PRAMANIK via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_009/d3fdc630c2d8/thumbnail.webp",
      "alt": "Odisha Crafts Museum Kala Bhoomi panorama perspective",
      "title": "Odisha Crafts Museum Kala Bhoomi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by SUDEEP PRAMANIK via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Odisha Crafts Museum Kala Bhoomi": [
    {
      "src": "/static/images/places/place_bbsr_009/d3fdc630c2d8/hero.webp",
      "alt": "Authentic photograph of Odisha Crafts Museum Kala Bhoomi in Odisha",
      "title": "Odisha Crafts Museum Kala Bhoomi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by SUDEEP PRAMANIK via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_009/d3fdc630c2d8/card.webp",
      "alt": "Odisha Crafts Museum Kala Bhoomi architectural and landscape perspective",
      "title": "Odisha Crafts Museum Kala Bhoomi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by SUDEEP PRAMANIK via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_009/d3fdc630c2d8/thumbnail.webp",
      "alt": "Odisha Crafts Museum Kala Bhoomi panorama perspective",
      "title": "Odisha Crafts Museum Kala Bhoomi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by SUDEEP PRAMANIK via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_sambalpur_004": [
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/hero.webp",
      "alt": "Authentic photograph of Debrigarh Wildlife Sanctuary in Odisha",
      "title": "Debrigarh Wildlife Sanctuary",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/card.webp",
      "alt": "Debrigarh Wildlife Sanctuary architectural and landscape perspective",
      "title": "Debrigarh Wildlife Sanctuary Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/thumbnail.webp",
      "alt": "Debrigarh Wildlife Sanctuary panorama perspective",
      "title": "Debrigarh Wildlife Sanctuary Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Debrigarh Wildlife Sanctuary": [
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/hero.webp",
      "alt": "Authentic photograph of Debrigarh Wildlife Sanctuary in Odisha",
      "title": "Debrigarh Wildlife Sanctuary",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/card.webp",
      "alt": "Debrigarh Wildlife Sanctuary architectural and landscape perspective",
      "title": "Debrigarh Wildlife Sanctuary Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/thumbnail.webp",
      "alt": "Debrigarh Wildlife Sanctuary panorama perspective",
      "title": "Debrigarh Wildlife Sanctuary Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_cuttack_003": [
    {
      "src": "/static/images/places/place_cuttack_003/78dff96a9c3a/hero.webp",
      "alt": "Authentic photograph of Odisha State Maritime Museum in Odisha",
      "title": "Odisha State Maritime Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Soumendra Kumar Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_003/78dff96a9c3a/card.webp",
      "alt": "Odisha State Maritime Museum architectural and landscape perspective",
      "title": "Odisha State Maritime Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Soumendra Kumar Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_003/78dff96a9c3a/thumbnail.webp",
      "alt": "Odisha State Maritime Museum panorama perspective",
      "title": "Odisha State Maritime Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Soumendra Kumar Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Odisha State Maritime Museum": [
    {
      "src": "/static/images/places/place_cuttack_003/78dff96a9c3a/hero.webp",
      "alt": "Authentic photograph of Odisha State Maritime Museum in Odisha",
      "title": "Odisha State Maritime Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Soumendra Kumar Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_003/78dff96a9c3a/card.webp",
      "alt": "Odisha State Maritime Museum architectural and landscape perspective",
      "title": "Odisha State Maritime Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Soumendra Kumar Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_003/78dff96a9c3a/thumbnail.webp",
      "alt": "Odisha State Maritime Museum panorama perspective",
      "title": "Odisha State Maritime Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Soumendra Kumar Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_bbsr_010": [
    {
      "src": "/static/images/places/place_bbsr_010/78c2ef783f40/hero.webp",
      "alt": "Authentic photograph of Ekamra Haat in Odisha",
      "title": "Ekamra Haat",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_010/78c2ef783f40/card.webp",
      "alt": "Ekamra Haat architectural and landscape perspective",
      "title": "Ekamra Haat Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_010/78c2ef783f40/thumbnail.webp",
      "alt": "Ekamra Haat panorama perspective",
      "title": "Ekamra Haat Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    }
  ],
  "Ekamra Haat": [
    {
      "src": "/static/images/places/place_bbsr_010/78c2ef783f40/hero.webp",
      "alt": "Authentic photograph of Ekamra Haat in Odisha",
      "title": "Ekamra Haat",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_010/78c2ef783f40/card.webp",
      "alt": "Ekamra Haat architectural and landscape perspective",
      "title": "Ekamra Haat Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_010/78c2ef783f40/thumbnail.webp",
      "alt": "Ekamra Haat panorama perspective",
      "title": "Ekamra Haat Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    }
  ],
  "place_cuttack_002": [
    {
        "src": "/static/images/places/place_cuttack_002/57a31cc80182/hero.webp",
        "alt": "Authentic photograph of Cuttack Chandi Temple in Odisha",
        "title": "Cuttack Chandi Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Cuttack Chandi Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_cuttack_002/57a31cc80182/card.webp",
        "alt": "Cuttack Chandi Temple architectural and landscape perspective",
        "title": "Cuttack Chandi Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Cuttack Chandi Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_cuttack_002/57a31cc80182/thumbnail.webp",
        "alt": "Cuttack Chandi Temple panorama perspective",
        "title": "Cuttack Chandi Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Cuttack Chandi Temple",
        "isFallback": false
    }
],
  "Cuttack Chandi Temple": [
    {
        "src": "/static/images/places/place_cuttack_002/57a31cc80182/hero.webp",
        "alt": "Authentic photograph of Cuttack Chandi Temple in Odisha",
        "title": "Cuttack Chandi Temple",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Cuttack Chandi Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_cuttack_002/57a31cc80182/card.webp",
        "alt": "Cuttack Chandi Temple architectural and landscape perspective",
        "title": "Cuttack Chandi Temple Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Cuttack Chandi Temple",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_cuttack_002/57a31cc80182/thumbnail.webp",
        "alt": "Cuttack Chandi Temple panorama perspective",
        "title": "Cuttack Chandi Temple Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Cuttack Chandi Temple",
        "isFallback": false
    }
],
  "place_koraput_004": [
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/hero.webp",
      "alt": "Authentic photograph of Tribal Museum, Koraput in Odisha",
      "title": "Tribal Museum, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/card.webp",
      "alt": "Tribal Museum, Koraput architectural and landscape perspective",
      "title": "Tribal Museum, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/thumbnail.webp",
      "alt": "Tribal Museum, Koraput panorama perspective",
      "title": "Tribal Museum, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Tribal Museum, Koraput": [
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/hero.webp",
      "alt": "Authentic photograph of Tribal Museum, Koraput in Odisha",
      "title": "Tribal Museum, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/card.webp",
      "alt": "Tribal Museum, Koraput architectural and landscape perspective",
      "title": "Tribal Museum, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/thumbnail.webp",
      "alt": "Tribal Museum, Koraput panorama perspective",
      "title": "Tribal Museum, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_koraput_002": [
    {
      "src": "/static/images/places/place_koraput_002/da596fb21308/hero.webp",
      "alt": "Authentic photograph of Duduma Waterfall in Odisha",
      "title": "Duduma Waterfall",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Parthapratim25 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_002/da596fb21308/card.webp",
      "alt": "Duduma Waterfall architectural and landscape perspective",
      "title": "Duduma Waterfall Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Parthapratim25 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_002/da596fb21308/thumbnail.webp",
      "alt": "Duduma Waterfall panorama perspective",
      "title": "Duduma Waterfall Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Parthapratim25 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Duduma Waterfall": [
    {
      "src": "/static/images/places/place_koraput_002/da596fb21308/hero.webp",
      "alt": "Authentic photograph of Duduma Waterfall in Odisha",
      "title": "Duduma Waterfall",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Parthapratim25 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_002/da596fb21308/card.webp",
      "alt": "Duduma Waterfall architectural and landscape perspective",
      "title": "Duduma Waterfall Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Parthapratim25 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_002/da596fb21308/thumbnail.webp",
      "alt": "Duduma Waterfall panorama perspective",
      "title": "Duduma Waterfall Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Parthapratim25 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_rayagada_001": [
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/hero.webp",
      "alt": "Authentic photograph of Maa Majhigouri Temple, Rayagada in Odisha",
      "title": "Maa Majhigouri Temple, Rayagada",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/card.webp",
      "alt": "Maa Majhigouri Temple, Rayagada architectural and landscape perspective",
      "title": "Maa Majhigouri Temple, Rayagada Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/thumbnail.webp",
      "alt": "Maa Majhigouri Temple, Rayagada panorama perspective",
      "title": "Maa Majhigouri Temple, Rayagada Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Maa Majhigouri Temple, Rayagada": [
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/hero.webp",
      "alt": "Authentic photograph of Maa Majhigouri Temple, Rayagada in Odisha",
      "title": "Maa Majhigouri Temple, Rayagada",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/card.webp",
      "alt": "Maa Majhigouri Temple, Rayagada architectural and landscape perspective",
      "title": "Maa Majhigouri Temple, Rayagada Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/thumbnail.webp",
      "alt": "Maa Majhigouri Temple, Rayagada panorama perspective",
      "title": "Maa Majhigouri Temple, Rayagada Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_bbsr_001": [
    {
      "src": "/static/images/places/place_bbsr_001/06a456469886/hero.webp",
      "alt": "Authentic photograph of Lingaraj Temple in Odisha",
      "title": "Lingaraj Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_001/06a456469886/card.webp",
      "alt": "Lingaraj Temple architectural and landscape perspective",
      "title": "Lingaraj Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_001/06a456469886/thumbnail.webp",
      "alt": "Lingaraj Temple panorama perspective",
      "title": "Lingaraj Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Lingaraj Temple": [
    {
      "src": "/static/images/places/place_bbsr_001/06a456469886/hero.webp",
      "alt": "Authentic photograph of Lingaraj Temple in Odisha",
      "title": "Lingaraj Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_001/06a456469886/card.webp",
      "alt": "Lingaraj Temple architectural and landscape perspective",
      "title": "Lingaraj Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_001/06a456469886/thumbnail.webp",
      "alt": "Lingaraj Temple panorama perspective",
      "title": "Lingaraj Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_daringbadi_002": [
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/hero.webp",
      "alt": "Authentic photograph of Midubanda Waterfall, Daringbadi in Odisha",
      "title": "Midubanda Waterfall, Daringbadi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/card.webp",
      "alt": "Midubanda Waterfall, Daringbadi architectural and landscape perspective",
      "title": "Midubanda Waterfall, Daringbadi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/thumbnail.webp",
      "alt": "Midubanda Waterfall, Daringbadi panorama perspective",
      "title": "Midubanda Waterfall, Daringbadi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Midubanda Waterfall, Daringbadi": [
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/hero.webp",
      "alt": "Authentic photograph of Midubanda Waterfall, Daringbadi in Odisha",
      "title": "Midubanda Waterfall, Daringbadi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/card.webp",
      "alt": "Midubanda Waterfall, Daringbadi architectural and landscape perspective",
      "title": "Midubanda Waterfall, Daringbadi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/thumbnail.webp",
      "alt": "Midubanda Waterfall, Daringbadi panorama perspective",
      "title": "Midubanda Waterfall, Daringbadi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_daringbadi_001": [
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/hero.webp",
      "alt": "Authentic photograph of Daringbadi Hill Station in Odisha",
      "title": "Daringbadi Hill Station",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/card.webp",
      "alt": "Daringbadi Hill Station architectural and landscape perspective",
      "title": "Daringbadi Hill Station Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/thumbnail.webp",
      "alt": "Daringbadi Hill Station panorama perspective",
      "title": "Daringbadi Hill Station Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Daringbadi Hill Station": [
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/hero.webp",
      "alt": "Authentic photograph of Daringbadi Hill Station in Odisha",
      "title": "Daringbadi Hill Station",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/card.webp",
      "alt": "Daringbadi Hill Station architectural and landscape perspective",
      "title": "Daringbadi Hill Station Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/thumbnail.webp",
      "alt": "Daringbadi Hill Station panorama perspective",
      "title": "Daringbadi Hill Station Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_bbsr_003": [
    {
      "src": "/static/images/places/place_bbsr_003/0dd1f614ea63/hero.webp",
      "alt": "Authentic photograph of Rajarani Temple in Odisha",
      "title": "Rajarani Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sourabh.biswas003 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_003/0dd1f614ea63/card.webp",
      "alt": "Rajarani Temple architectural and landscape perspective",
      "title": "Rajarani Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sourabh.biswas003 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_003/0dd1f614ea63/thumbnail.webp",
      "alt": "Rajarani Temple panorama perspective",
      "title": "Rajarani Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sourabh.biswas003 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Rajarani Temple": [
    {
      "src": "/static/images/places/place_bbsr_003/0dd1f614ea63/hero.webp",
      "alt": "Authentic photograph of Rajarani Temple in Odisha",
      "title": "Rajarani Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sourabh.biswas003 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_003/0dd1f614ea63/card.webp",
      "alt": "Rajarani Temple architectural and landscape perspective",
      "title": "Rajarani Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sourabh.biswas003 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_003/0dd1f614ea63/thumbnail.webp",
      "alt": "Rajarani Temple panorama perspective",
      "title": "Rajarani Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sourabh.biswas003 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_rourkela_002": [
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/hero.webp",
      "alt": "Authentic photograph of Mandira Dam, Sundargarh in Odisha",
      "title": "Mandira Dam, Sundargarh",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/card.webp",
      "alt": "Mandira Dam, Sundargarh architectural and landscape perspective",
      "title": "Mandira Dam, Sundargarh Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/thumbnail.webp",
      "alt": "Mandira Dam, Sundargarh panorama perspective",
      "title": "Mandira Dam, Sundargarh Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Mandira Dam, Sundargarh": [
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/hero.webp",
      "alt": "Authentic photograph of Mandira Dam, Sundargarh in Odisha",
      "title": "Mandira Dam, Sundargarh",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/card.webp",
      "alt": "Mandira Dam, Sundargarh architectural and landscape perspective",
      "title": "Mandira Dam, Sundargarh Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/thumbnail.webp",
      "alt": "Mandira Dam, Sundargarh panorama perspective",
      "title": "Mandira Dam, Sundargarh Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_food_001": [
    {
        "src": "/static/images/places/place_food_001/e6fb3a71867e/hero.webp",
        "alt": "Authentic photograph of Pahala Rasagola Sweet Hub in Odisha",
        "title": "Pahala Rasagola Sweet Hub",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Pahala Rasagola Sweet Hub",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_001/e6fb3a71867e/card.webp",
        "alt": "Pahala Rasagola Sweet Hub architectural and landscape perspective",
        "title": "Pahala Rasagola Sweet Hub Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Pahala Rasagola Sweet Hub",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_001/e6fb3a71867e/thumbnail.webp",
        "alt": "Pahala Rasagola Sweet Hub panorama perspective",
        "title": "Pahala Rasagola Sweet Hub Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Pahala Rasagola Sweet Hub",
        "isFallback": false
    }
],
  "Pahala Rasagola Sweet Hub": [
    {
        "src": "/static/images/places/place_food_001/e6fb3a71867e/hero.webp",
        "alt": "Authentic photograph of Pahala Rasagola Sweet Hub in Odisha",
        "title": "Pahala Rasagola Sweet Hub",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Pahala Rasagola Sweet Hub",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_001/e6fb3a71867e/card.webp",
        "alt": "Pahala Rasagola Sweet Hub architectural and landscape perspective",
        "title": "Pahala Rasagola Sweet Hub Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Pahala Rasagola Sweet Hub",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_001/e6fb3a71867e/thumbnail.webp",
        "alt": "Pahala Rasagola Sweet Hub panorama perspective",
        "title": "Pahala Rasagola Sweet Hub Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Pahala Rasagola Sweet Hub",
        "isFallback": false
    }
],
  "place_food_002": [
    {
        "src": "/static/images/places/place_food_002/e0850b09b5ca/hero.webp",
        "alt": "Authentic photograph of Nimapada Chhena Jhili Market in Odisha",
        "title": "Nimapada Chhena Jhili Market",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Nimapada Chhena Jhili Market",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_002/e0850b09b5ca/card.webp",
        "alt": "Nimapada Chhena Jhili Market architectural and landscape perspective",
        "title": "Nimapada Chhena Jhili Market Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Nimapada Chhena Jhili Market",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_002/e0850b09b5ca/thumbnail.webp",
        "alt": "Nimapada Chhena Jhili Market panorama perspective",
        "title": "Nimapada Chhena Jhili Market Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Nimapada Chhena Jhili Market",
        "isFallback": false
    }
],
  "Nimapada Chhena Jhili Market": [
    {
        "src": "/static/images/places/place_food_002/e0850b09b5ca/hero.webp",
        "alt": "Authentic photograph of Nimapada Chhena Jhili Market in Odisha",
        "title": "Nimapada Chhena Jhili Market",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Nimapada Chhena Jhili Market",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_002/e0850b09b5ca/card.webp",
        "alt": "Nimapada Chhena Jhili Market architectural and landscape perspective",
        "title": "Nimapada Chhena Jhili Market Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Nimapada Chhena Jhili Market",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_002/e0850b09b5ca/thumbnail.webp",
        "alt": "Nimapada Chhena Jhili Market panorama perspective",
        "title": "Nimapada Chhena Jhili Market Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Nimapada Chhena Jhili Market",
        "isFallback": false
    }
],
  "place_food_003": [
    {
        "src": "/static/images/places/place_food_003/5a13e730e909/hero.webp",
        "alt": "Authentic photograph of Ananda Bazar, Puri in Odisha",
        "title": "Ananda Bazar, Puri",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Ananda Bazar, Puri",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_003/5a13e730e909/card.webp",
        "alt": "Ananda Bazar, Puri architectural and landscape perspective",
        "title": "Ananda Bazar, Puri Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Ananda Bazar, Puri",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_003/5a13e730e909/thumbnail.webp",
        "alt": "Ananda Bazar, Puri panorama perspective",
        "title": "Ananda Bazar, Puri Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Ananda Bazar, Puri",
        "isFallback": false
    }
],
  "Ananda Bazar, Puri": [
    {
        "src": "/static/images/places/place_food_003/5a13e730e909/hero.webp",
        "alt": "Authentic photograph of Ananda Bazar, Puri in Odisha",
        "title": "Ananda Bazar, Puri",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Ananda Bazar, Puri",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_003/5a13e730e909/card.webp",
        "alt": "Ananda Bazar, Puri architectural and landscape perspective",
        "title": "Ananda Bazar, Puri Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Ananda Bazar, Puri",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_003/5a13e730e909/thumbnail.webp",
        "alt": "Ananda Bazar, Puri panorama perspective",
        "title": "Ananda Bazar, Puri Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Ananda Bazar, Puri",
        "isFallback": false
    }
],
  "place_food_004": [
    {
        "src": "/static/images/places/place_food_004/4e765c230837/hero.webp",
        "alt": "Authentic photograph of Choudhury Bazar Dahibara Hub, Cuttack in Odisha",
        "title": "Choudhury Bazar Dahibara Hub, Cuttack",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Choudhury Bazar Dahibara Hub, Cuttack",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_004/4e765c230837/card.webp",
        "alt": "Choudhury Bazar Dahibara Hub, Cuttack architectural and landscape perspective",
        "title": "Choudhury Bazar Dahibara Hub, Cuttack Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Choudhury Bazar Dahibara Hub, Cuttack",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_004/4e765c230837/thumbnail.webp",
        "alt": "Choudhury Bazar Dahibara Hub, Cuttack panorama perspective",
        "title": "Choudhury Bazar Dahibara Hub, Cuttack Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Choudhury Bazar Dahibara Hub, Cuttack",
        "isFallback": false
    }
],
  "Choudhury Bazar Dahibara Hub, Cuttack": [
    {
        "src": "/static/images/places/place_food_004/4e765c230837/hero.webp",
        "alt": "Authentic photograph of Choudhury Bazar Dahibara Hub, Cuttack in Odisha",
        "title": "Choudhury Bazar Dahibara Hub, Cuttack",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Choudhury Bazar Dahibara Hub, Cuttack",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_004/4e765c230837/card.webp",
        "alt": "Choudhury Bazar Dahibara Hub, Cuttack architectural and landscape perspective",
        "title": "Choudhury Bazar Dahibara Hub, Cuttack Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Choudhury Bazar Dahibara Hub, Cuttack",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_004/4e765c230837/thumbnail.webp",
        "alt": "Choudhury Bazar Dahibara Hub, Cuttack panorama perspective",
        "title": "Choudhury Bazar Dahibara Hub, Cuttack Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Choudhury Bazar Dahibara Hub, Cuttack",
        "isFallback": false
    }
],
  "place_food_005": [
    {
        "src": "/static/images/places/place_food_005/daeb11d5893b/hero.webp",
        "alt": "Authentic photograph of Bikalananda Kar Rasagola Hub, Salepur in Odisha",
        "title": "Bikalananda Kar Rasagola Hub, Salepur",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bikalananda Kar Rasagola Hub, Salepur",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_005/daeb11d5893b/card.webp",
        "alt": "Bikalananda Kar Rasagola Hub, Salepur architectural and landscape perspective",
        "title": "Bikalananda Kar Rasagola Hub, Salepur Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bikalananda Kar Rasagola Hub, Salepur",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_005/daeb11d5893b/thumbnail.webp",
        "alt": "Bikalananda Kar Rasagola Hub, Salepur panorama perspective",
        "title": "Bikalananda Kar Rasagola Hub, Salepur Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bikalananda Kar Rasagola Hub, Salepur",
        "isFallback": false
    }
],
  "Bikalananda Kar Rasagola Hub, Salepur": [
    {
        "src": "/static/images/places/place_food_005/daeb11d5893b/hero.webp",
        "alt": "Authentic photograph of Bikalananda Kar Rasagola Hub, Salepur in Odisha",
        "title": "Bikalananda Kar Rasagola Hub, Salepur",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bikalananda Kar Rasagola Hub, Salepur",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_005/daeb11d5893b/card.webp",
        "alt": "Bikalananda Kar Rasagola Hub, Salepur architectural and landscape perspective",
        "title": "Bikalananda Kar Rasagola Hub, Salepur Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bikalananda Kar Rasagola Hub, Salepur",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_005/daeb11d5893b/thumbnail.webp",
        "alt": "Bikalananda Kar Rasagola Hub, Salepur panorama perspective",
        "title": "Bikalananda Kar Rasagola Hub, Salepur Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bikalananda Kar Rasagola Hub, Salepur",
        "isFallback": false
    }
],
  "place_food_006": [
    {
        "src": "/static/images/places/place_food_006/88f959c50d0e/hero.webp",
        "alt": "Authentic photograph of OTDC Nimantran Restaurant, Bhubaneswar in Odisha",
        "title": "OTDC Nimantran Restaurant, Bhubaneswar",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - OTDC Nimantran Restaurant, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_006/88f959c50d0e/card.webp",
        "alt": "OTDC Nimantran Restaurant, Bhubaneswar architectural and landscape perspective",
        "title": "OTDC Nimantran Restaurant, Bhubaneswar Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - OTDC Nimantran Restaurant, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_006/88f959c50d0e/thumbnail.webp",
        "alt": "OTDC Nimantran Restaurant, Bhubaneswar panorama perspective",
        "title": "OTDC Nimantran Restaurant, Bhubaneswar Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - OTDC Nimantran Restaurant, Bhubaneswar",
        "isFallback": false
    }
],
  "OTDC Nimantran Restaurant, Bhubaneswar": [
    {
        "src": "/static/images/places/place_food_006/88f959c50d0e/hero.webp",
        "alt": "Authentic photograph of OTDC Nimantran Restaurant, Bhubaneswar in Odisha",
        "title": "OTDC Nimantran Restaurant, Bhubaneswar",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - OTDC Nimantran Restaurant, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_006/88f959c50d0e/card.webp",
        "alt": "OTDC Nimantran Restaurant, Bhubaneswar architectural and landscape perspective",
        "title": "OTDC Nimantran Restaurant, Bhubaneswar Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - OTDC Nimantran Restaurant, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_006/88f959c50d0e/thumbnail.webp",
        "alt": "OTDC Nimantran Restaurant, Bhubaneswar panorama perspective",
        "title": "OTDC Nimantran Restaurant, Bhubaneswar Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - OTDC Nimantran Restaurant, Bhubaneswar",
        "isFallback": false
    }
],
  "place_food_007": [
    {
        "src": "/static/images/places/place_food_007/a0a492f880a5/hero.webp",
        "alt": "Authentic photograph of Bapuji Nagar Food Corridor, Bhubaneswar in Odisha",
        "title": "Bapuji Nagar Food Corridor, Bhubaneswar",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bapuji Nagar Food Corridor, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_007/a0a492f880a5/card.webp",
        "alt": "Bapuji Nagar Food Corridor, Bhubaneswar architectural and landscape perspective",
        "title": "Bapuji Nagar Food Corridor, Bhubaneswar Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bapuji Nagar Food Corridor, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_007/a0a492f880a5/thumbnail.webp",
        "alt": "Bapuji Nagar Food Corridor, Bhubaneswar panorama perspective",
        "title": "Bapuji Nagar Food Corridor, Bhubaneswar Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bapuji Nagar Food Corridor, Bhubaneswar",
        "isFallback": false
    }
],
  "Bapuji Nagar Food Corridor, Bhubaneswar": [
    {
        "src": "/static/images/places/place_food_007/a0a492f880a5/hero.webp",
        "alt": "Authentic photograph of Bapuji Nagar Food Corridor, Bhubaneswar in Odisha",
        "title": "Bapuji Nagar Food Corridor, Bhubaneswar",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bapuji Nagar Food Corridor, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_007/a0a492f880a5/card.webp",
        "alt": "Bapuji Nagar Food Corridor, Bhubaneswar architectural and landscape perspective",
        "title": "Bapuji Nagar Food Corridor, Bhubaneswar Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bapuji Nagar Food Corridor, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_007/a0a492f880a5/thumbnail.webp",
        "alt": "Bapuji Nagar Food Corridor, Bhubaneswar panorama perspective",
        "title": "Bapuji Nagar Food Corridor, Bhubaneswar Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Bapuji Nagar Food Corridor, Bhubaneswar",
        "isFallback": false
    }
],
  "place_food_008": [
    {
        "src": "/static/images/places/place_food_008/35cde5e9e0e8/hero.webp",
        "alt": "Authentic photograph of Unit-4 Traditional Food & Fish Market, Bhubaneswar in Odisha",
        "title": "Unit-4 Traditional Food & Fish Market, Bhubaneswar",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Unit-4 Traditional Food & Fish Market, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_008/35cde5e9e0e8/card.webp",
        "alt": "Unit-4 Traditional Food & Fish Market, Bhubaneswar architectural and landscape perspective",
        "title": "Unit-4 Traditional Food & Fish Market, Bhubaneswar Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Unit-4 Traditional Food & Fish Market, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_008/35cde5e9e0e8/thumbnail.webp",
        "alt": "Unit-4 Traditional Food & Fish Market, Bhubaneswar panorama perspective",
        "title": "Unit-4 Traditional Food & Fish Market, Bhubaneswar Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Unit-4 Traditional Food & Fish Market, Bhubaneswar",
        "isFallback": false
    }
],
  "Unit-4 Traditional Food & Fish Market, Bhubaneswar": [
    {
        "src": "/static/images/places/place_food_008/35cde5e9e0e8/hero.webp",
        "alt": "Authentic photograph of Unit-4 Traditional Food & Fish Market, Bhubaneswar in Odisha",
        "title": "Unit-4 Traditional Food & Fish Market, Bhubaneswar",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Unit-4 Traditional Food & Fish Market, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_008/35cde5e9e0e8/card.webp",
        "alt": "Unit-4 Traditional Food & Fish Market, Bhubaneswar architectural and landscape perspective",
        "title": "Unit-4 Traditional Food & Fish Market, Bhubaneswar Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Unit-4 Traditional Food & Fish Market, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_008/35cde5e9e0e8/thumbnail.webp",
        "alt": "Unit-4 Traditional Food & Fish Market, Bhubaneswar panorama perspective",
        "title": "Unit-4 Traditional Food & Fish Market, Bhubaneswar Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Unit-4 Traditional Food & Fish Market, Bhubaneswar",
        "isFallback": false
    }
],
  "place_food_009": [
    {
        "src": "/static/images/places/place_food_009/0b3143c9ea24/hero.webp",
        "alt": "Authentic photograph of OTDC Panthasala Odia Cuisine Centre, Konark in Odisha",
        "title": "OTDC Panthasala Odia Cuisine Centre, Konark",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - OTDC Panthasala Odia Cuisine Centre, Konark",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_009/0b3143c9ea24/card.webp",
        "alt": "OTDC Panthasala Odia Cuisine Centre, Konark architectural and landscape perspective",
        "title": "OTDC Panthasala Odia Cuisine Centre, Konark Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - OTDC Panthasala Odia Cuisine Centre, Konark",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_009/0b3143c9ea24/thumbnail.webp",
        "alt": "OTDC Panthasala Odia Cuisine Centre, Konark panorama perspective",
        "title": "OTDC Panthasala Odia Cuisine Centre, Konark Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - OTDC Panthasala Odia Cuisine Centre, Konark",
        "isFallback": false
    }
],
  "OTDC Panthasala Odia Cuisine Centre, Konark": [
    {
        "src": "/static/images/places/place_food_009/0b3143c9ea24/hero.webp",
        "alt": "Authentic photograph of OTDC Panthasala Odia Cuisine Centre, Konark in Odisha",
        "title": "OTDC Panthasala Odia Cuisine Centre, Konark",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - OTDC Panthasala Odia Cuisine Centre, Konark",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_009/0b3143c9ea24/card.webp",
        "alt": "OTDC Panthasala Odia Cuisine Centre, Konark architectural and landscape perspective",
        "title": "OTDC Panthasala Odia Cuisine Centre, Konark Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - OTDC Panthasala Odia Cuisine Centre, Konark",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_009/0b3143c9ea24/thumbnail.webp",
        "alt": "OTDC Panthasala Odia Cuisine Centre, Konark panorama perspective",
        "title": "OTDC Panthasala Odia Cuisine Centre, Konark Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - OTDC Panthasala Odia Cuisine Centre, Konark",
        "isFallback": false
    }
],
  "place_food_010": [
    {
        "src": "/static/images/places/place_food_010/abcf1ef01835/hero.webp",
        "alt": "Authentic photograph of Maa Mangala Temple Food & Pitha Precinct, Kakatpur in Odisha",
        "title": "Maa Mangala Temple Food & Pitha Precinct, Kakatpur",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Maa Mangala Temple Food & Pitha Precinct, Kakatpur",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_010/abcf1ef01835/card.webp",
        "alt": "Maa Mangala Temple Food & Pitha Precinct, Kakatpur architectural and landscape perspective",
        "title": "Maa Mangala Temple Food & Pitha Precinct, Kakatpur Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Maa Mangala Temple Food & Pitha Precinct, Kakatpur",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_010/abcf1ef01835/thumbnail.webp",
        "alt": "Maa Mangala Temple Food & Pitha Precinct, Kakatpur panorama perspective",
        "title": "Maa Mangala Temple Food & Pitha Precinct, Kakatpur Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Maa Mangala Temple Food & Pitha Precinct, Kakatpur",
        "isFallback": false
    }
],
  "Maa Mangala Temple Food & Pitha Precinct, Kakatpur": [
    {
        "src": "/static/images/places/place_food_010/abcf1ef01835/hero.webp",
        "alt": "Authentic photograph of Maa Mangala Temple Food & Pitha Precinct, Kakatpur in Odisha",
        "title": "Maa Mangala Temple Food & Pitha Precinct, Kakatpur",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Maa Mangala Temple Food & Pitha Precinct, Kakatpur",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_010/abcf1ef01835/card.webp",
        "alt": "Maa Mangala Temple Food & Pitha Precinct, Kakatpur architectural and landscape perspective",
        "title": "Maa Mangala Temple Food & Pitha Precinct, Kakatpur Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Maa Mangala Temple Food & Pitha Precinct, Kakatpur",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_010/abcf1ef01835/thumbnail.webp",
        "alt": "Maa Mangala Temple Food & Pitha Precinct, Kakatpur panorama perspective",
        "title": "Maa Mangala Temple Food & Pitha Precinct, Kakatpur Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Maa Mangala Temple Food & Pitha Precinct, Kakatpur",
        "isFallback": false
    }
],
  "place_food_011": [
    {
        "src": "/static/images/places/place_food_011/cb1d3fcc1b6c/hero.webp",
        "alt": "Authentic photograph of Raghunathpur Culinary Corner, Bhubaneswar in Odisha",
        "title": "Raghunathpur Culinary Corner, Bhubaneswar",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Raghunathpur Culinary Corner, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_011/cb1d3fcc1b6c/card.webp",
        "alt": "Raghunathpur Culinary Corner, Bhubaneswar architectural and landscape perspective",
        "title": "Raghunathpur Culinary Corner, Bhubaneswar Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Raghunathpur Culinary Corner, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_011/cb1d3fcc1b6c/thumbnail.webp",
        "alt": "Raghunathpur Culinary Corner, Bhubaneswar panorama perspective",
        "title": "Raghunathpur Culinary Corner, Bhubaneswar Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Raghunathpur Culinary Corner, Bhubaneswar",
        "isFallback": false
    }
],
  "Raghunathpur Culinary Corner, Bhubaneswar": [
    {
        "src": "/static/images/places/place_food_011/cb1d3fcc1b6c/hero.webp",
        "alt": "Authentic photograph of Raghunathpur Culinary Corner, Bhubaneswar in Odisha",
        "title": "Raghunathpur Culinary Corner, Bhubaneswar",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Raghunathpur Culinary Corner, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_011/cb1d3fcc1b6c/card.webp",
        "alt": "Raghunathpur Culinary Corner, Bhubaneswar architectural and landscape perspective",
        "title": "Raghunathpur Culinary Corner, Bhubaneswar Detail View",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Raghunathpur Culinary Corner, Bhubaneswar",
        "isFallback": false
    },
    {
        "src": "/static/images/places/place_food_011/cb1d3fcc1b6c/thumbnail.webp",
        "alt": "Raghunathpur Culinary Corner, Bhubaneswar panorama perspective",
        "title": "Raghunathpur Culinary Corner, Bhubaneswar Overview",
        "source": "O-Travelz Verified Photography",
        "license": "Platform Standard Asset",
        "attribution": "O-Travelz Destination Documentation - Raghunathpur Culinary Corner, Bhubaneswar",
        "isFallback": false
    }
],
};

function normalizeKey(str?: string | null): string {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getCategoryFallback(category?: string | null): PlaceImage {
  if (!category) return DEFAULT_FALLBACK_IMAGE;
  const normCat = normalizeKey(category);

  // 1. If category has a dedicated, verified category-owned asset (ATMs, Medical, Cafes)
  if (CATEGORY_IMAGE_MANIFEST[category]) {
    return CATEGORY_IMAGE_MANIFEST[category];
  }
  for (const [key, img] of Object.entries(CATEGORY_IMAGE_MANIFEST)) {
    if (normalizeKey(key) === normCat) {
      return img;
    }
  }

  // 2. Themed vector fallback for standard categories
  if (CATEGORY_THEMED_FALLBACKS[normCat]) {
    return CATEGORY_THEMED_FALLBACKS[normCat];
  }
  for (const [key, img] of Object.entries(CATEGORY_THEMED_FALLBACKS)) {
    if (normCat.includes(key) || key.includes(normCat)) {
      return img;
    }
  }

  return DEFAULT_FALLBACK_IMAGE;
}

function resolveImagesWithBackendUrl(images: PlaceImage[]): PlaceImage[] {
  return images.map((img) => ({
    ...img,
    src: getBackendAssetUrl(img.src),
  }));
}

export function getPlaceImages(placeName?: string | null, category?: string | null): PlaceImage[] {
  if (!placeName && !category) return resolveImagesWithBackendUrl([DEFAULT_FALLBACK_IMAGE]);

  if (placeName) {
    const normPlace = normalizeKey(placeName);

    // 1. Exact match by canonical place_id or name in PLACE_IMAGE_MANIFEST
    if (PLACE_IMAGE_MANIFEST[placeName]) {
      return resolveImagesWithBackendUrl(PLACE_IMAGE_MANIFEST[placeName]);
    }

    // 2. Normalized alphanumeric match ONLY for verified canonical place keys
    for (const [key, images] of Object.entries(PLACE_IMAGE_MANIFEST)) {
      if (normalizeKey(key) === normPlace) {
        return resolveImagesWithBackendUrl(images);
      }
    }

    // 3. Fallback to startswith / prefix match ONLY if unambiguous (single match)
    if (normPlace.length >= 6) {
      const candidates: PlaceImage[][] = [];
      for (const [key, images] of Object.entries(PLACE_IMAGE_MANIFEST)) {
        const normKey = normalizeKey(key);
        if (normKey.length >= 6 && (normKey.startsWith(normPlace) || normPlace.startsWith(normKey))) {
          if (!candidates.includes(images)) {
            candidates.push(images);
          }
        }
      }
      if (candidates.length === 1) {
        return resolveImagesWithBackendUrl(candidates[0]);
      }
    }
  }

  // 4. Strict safe fallback: Return category-themed neutral SVG fallback (NEVER another destination's photo!)
  if (category) {
    return resolveImagesWithBackendUrl([getCategoryFallback(category)]);
  }

  return resolveImagesWithBackendUrl([DEFAULT_FALLBACK_IMAGE]);
}

export function getPrimaryPlaceImage(placeName?: string | null, category?: string | null): PlaceImage {
  const images = getPlaceImages(placeName, category);
  return images[0] || {
    ...DEFAULT_FALLBACK_IMAGE,
    src: getBackendAssetUrl(DEFAULT_FALLBACK_IMAGE.src),
  };
}

export function getPlaceImageUrl(placeName?: string | null, category?: string | null): string {
  const img = getPrimaryPlaceImage(placeName, category);
  return getBackendAssetUrl(img.src);
}

const DISCOVER_CATEGORY_CARDS: Record<string, PlaceImage> = {
  "nature": {
    "src": "/static/images/places/place_daringbadi_001/49e608c2405f/card.webp",
    "alt": "Misty pine forest valleys of Daringbadi, Eastern Ghats",
    "title": "Nature & Landscapes",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Sandeep Sarkar via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "heritage & culture": {
    "src": "/static/images/places/place_konark_001/03b959a8abef/card.webp",
    "alt": "Ancient Kalinga stone temple architecture and sun chariot carvings at Konark",
    "title": "Heritage & Cultural Monuments",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "heritage": {
    "src": "/static/images/places/place_konark_001/03b959a8abef/card.webp",
    "alt": "Ancient Kalinga stone temple architecture and sun chariot carvings at Konark",
    "title": "Heritage & Cultural Monuments",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "shopping & fashion": {
    "src": "/static/images/places/place_bbsr_010/78c2ef783f40/card.webp",
    "alt": "Vibrant handloom textile boutique and artisan craft village at Ekamra Haat",
    "title": "Shopping, Handlooms & Crafts",
    "source": "Wikimedia Commons",
    "license": "CC BY 3.0",
    "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
    "isFallback": false
  }
};

export function getCategoryImage(category: string): PlaceImage {
  const norm = normalizeKey(category);
  for (const [key, img] of Object.entries(CATEGORY_IMAGE_MANIFEST)) {
    const normKey = normalizeKey(key);
    if (norm === normKey || norm.includes(normKey) || normKey.includes(norm)) {
      return {
        ...img,
        src: getBackendAssetUrl(img.src),
      };
    }
  }
  for (const [key, img] of Object.entries(DISCOVER_CATEGORY_CARDS)) {
    const normKey = normalizeKey(key);
    if (norm === normKey || norm.includes(normKey) || normKey.includes(norm)) {
      return {
        ...img,
        src: getBackendAssetUrl(img.src),
      };
    }
  }
  const fallback = getCategoryFallback(category);
  return {
    ...fallback,
    src: getBackendAssetUrl(fallback.src),
  };
}

export function getPlaceGallery(placeName?: string | null, category?: string | null): PlaceImageMeta[] {
  const images = getPlaceImages(placeName, category);
  return images.map((img) => ({
    url: getBackendAssetUrl(img.src.replace(/\/(thumbnail|card)\.webp$/i, "/hero.webp")),
    alt: img.alt,
    source: img.source || "Wikimedia Commons",
    license: img.license || "CC BY-SA 4.0",
    attribution: img.attribution || img.title || "Odisha Tourism Documentation",
  }));
}


export function getPlaceRegion(districtOrPlaceId?: string, placeId?: string): string {
  return getRegionForPlace(districtOrPlaceId, placeId);
}

export function getFeaturedOdishaDestinations(): FeaturedDestination[] {
  return [
    {
      id: "place_puri_001",
      name: "Jagannath Temple, Puri",
      category: "Heritage & Pilgrimage",
      location: "Puri & Coastal",
      description: "Sacred 12th-century Kalinga temple complex of Lord Jagannath with grand Bada Danda courtyards.",
      imageUrl: getPlaceImageUrl("place_puri_001"),
    },
    {
      id: "place_puri_002",
      name: "Puri Golden Beach",
      category: "Beach & Coastal",
      location: "Puri & Coastal",
      description: "Blue Flag certified coastline with azure waters and lively sunrise promenade.",
      imageUrl: getPlaceImageUrl("place_puri_002"),
    },
    {
      id: "place_konark_001",
      name: "Konark Sun Temple",
      category: "Monuments & Heritage",
      location: "Konark & Marine",
      description: "13th-century UNESCO World Heritage stone chariot with 24 sculpted sun wheels and celestial dancers.",
      imageUrl: getPlaceImageUrl("place_konark_001"),
    },
    {
      id: "place_chilika_001",
      name: "Chilika Lake - Satapada",
      category: "Nature & Lagoons",
      location: "Chilika & Southern Coast",
      description: "Asia's largest brackish lagoon with Irrawaddy dolphin cruises and serene island waters.",
      imageUrl: getPlaceImageUrl("place_chilika_001"),
    },
    {
      id: "place_daringbadi_001",
      name: "Daringbadi Hill Station",
      category: "Hills & Nature",
      location: "Kandhamal & Southern Hills",
      description: "Misty pine forest valleys, organic coffee gardens, and cool mountain breezes in the Eastern Ghats.",
      imageUrl: getPlaceImageUrl("place_daringbadi_001"),
    },
    {
      id: "place_bbsr_001",
      name: "Lingaraj Temple",
      category: "Temples & Culture",
      location: "Bhubaneswar & Central",
      description: "11th-century architectural masterpiece of Kalinga style in the ancient Temple City of Bhubaneswar.",
      imageUrl: getPlaceImageUrl("place_bbsr_001"),
    },
    {
      id: "place_mayurbhanj_001",
      name: "Similipal National Park",
      category: "Wildlife & Forests",
      location: "Northern Odisha & Wildlife",
      description: "Vast biosphere tiger reserve with deep Sal canopy, wild elephants, and roaring waterfalls.",
      imageUrl: getPlaceImageUrl("place_mayurbhanj_001"),
    },
    {
      id: "place_koraput_003",
      name: "Deomali Peak, Koraput",
      category: "Highlands & Treks",
      location: "Koraput & Tribal Highlands",
      description: "Highest mountain peak in Odisha offering panoramic views of misty clouds and rolling hills.",
      imageUrl: getPlaceImageUrl("place_koraput_003"),
    },
    {
      id: "place_ganjam_001",
      name: "Gopalpur-on-Sea Beach",
      category: "Coastal Beach",
      location: "Chilika & Southern Coast",
      description: "Tranquil coastal resort beach with casuarina groves and historic lighthouse overlooking the sea.",
      imageUrl: getPlaceImageUrl("place_ganjam_001"),
    },
    {
      id: "place_sambalpur_001",
      name: "Hirakud Dam & Reservoir",
      category: "Lakes & Engineering",
      location: "Sambalpur & Western Odisha",
      description: "One of the world's longest earthen dams spanning the Mahanadi River with panoramic lookout towers.",
      imageUrl: getPlaceImageUrl("place_sambalpur_001"),
    },
  ];
}
