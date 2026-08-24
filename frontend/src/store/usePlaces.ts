import { useState, useEffect, useCallback } from "react";
import type { PlaceDetail, PlaceListParams } from "../api/contracts";
import { apiClient as defaultApiClient, ApiClient } from "../api/client";

import { getPlaceImageUrl } from "../utils/imageService";
import { resolvePlaceImageUrl } from "../utils/imageAdapter";
import { getRegionForPlace } from "../utils/regionUtils";
import { getCanonicalPlaceUuid } from "../utils/canonicalPlaceIds";

// Bundled authoritative seed fallback (so UI is instant & robust in all environments)
import seedPlacesData from "../../../data/places/places.json";

export interface ExtendedPlaceDetail extends PlaceDetail {
  region: string;
  imageUrl: string;
}

export function toExtendedPlace(place: PlaceDetail): ExtendedPlaceDetail {
  const canonicalId = getCanonicalPlaceUuid(place.id) || place.id;
  return {
    ...place,
    id: canonicalId,
    region: place.region || getRegionForPlace(place.district, place.id),
    imageUrl: resolvePlaceImageUrl(place, "card"),
  };
}

const FALLBACK_EXTENDED_PLACES: ExtendedPlaceDetail[] = (seedPlacesData as any[]).map((raw, idx) => {
  const rawId = raw.id || `seed_place_${idx + 1}`;
  const canonicalId = getCanonicalPlaceUuid(rawId);
  return {
    id: canonicalId,
    name: raw.name,
    category: raw.category,
    description: raw.description,
    lat: raw.lat,
    lon: raw.lon,
    district: raw.district,
    avg_visit_minutes: raw.avg_visit_minutes,
    price_tier: raw.price_tier,
    source: raw.source,
    verified_at: raw.verified_at,
    interests: raw.interests || [],
    region: getRegionForPlace(raw.district, raw.id),
    imageUrl: getPlaceImageUrl(raw.name, raw.category),
  };
});

function filterPlacesList(places: ExtendedPlaceDetail[], params: PlaceListParams = {}): ExtendedPlaceDetail[] {
  if (!params.search && !params.category && !params.district && !params.region && !params.interest) {
    return places;
  }
  return places.filter((p) => {
    if (params.district && p.district?.toLowerCase() !== params.district.toLowerCase()) return false;
    if (params.category && params.category !== "all" && p.category.toLowerCase() !== params.category.toLowerCase()) return false;
    if (params.region && params.region.toLowerCase() !== "all regions" && p.region.toLowerCase() !== params.region.toLowerCase()) return false;
    if (params.interest && params.interest !== "all" && !(p.interests || []).map((i) => i.toLowerCase()).includes(params.interest.toLowerCase())) return false;
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = (p.description || "").toLowerCase().includes(q);
      const matchDist = (p.district || "").toLowerCase().includes(q);
      const matchRegion = (p.region || "").toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchInt = (p.interests || []).some((i) => i.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchDist && !matchRegion && !matchCat && !matchInt) return false;
    }
    return true;
  });
}

export interface UsePlacesResult {
  places: ExtendedPlaceDetail[];
  isLoading: boolean;
  error: unknown | null;
  refetch: () => Promise<void>;
  getPlaceByName: (name: string) => ExtendedPlaceDetail | undefined;
  getPlaceById: (id: string) => ExtendedPlaceDetail | undefined;
}

export function usePlaces(client?: ApiClient): UsePlacesResult {
  const [places, setPlaces] = useState<ExtendedPlaceDetail[]>(FALLBACK_EXTENDED_PLACES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);

  const fetchPlaces = useCallback(async () => {
    const api = client ?? defaultApiClient;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.listPlaces();
      if (Array.isArray(data) && data.length > 0) {
        setPlaces(data.map(toExtendedPlace));
      }
    } catch (err) {
      // Graceful fallback to bundled authoritative records
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const getPlaceByName = useCallback(
    (name: string) => {
      const normalized = name.trim().toLowerCase();
      return places.find(
        (p) =>
          p.name.toLowerCase() === normalized ||
          p.name.toLowerCase().includes(normalized) ||
          normalized.includes(p.name.toLowerCase())
      );
    },
    [places]
  );

  const getPlaceById = useCallback(
    (id: string) => {
      const canonicalId = getCanonicalPlaceUuid(id);
      return places.find((p) => p.id === id || p.id === canonicalId || p.name.toLowerCase() === id.toLowerCase());
    },
    [places]
  );

  return {
    places,
    isLoading,
    error,
    refetch: fetchPlaces,
    getPlaceByName,
    getPlaceById,
  };
}

export interface UsePlaceSearchResult {
  places: ExtendedPlaceDetail[];
  isLoading: boolean;
  error: unknown | null;
  refetch: () => Promise<void>;
}

export function usePlaceSearch(
  params: PlaceListParams = {},
  client?: ApiClient,
  debounceMs: number = 200
): UsePlaceSearchResult {
  const [places, setPlaces] = useState<ExtendedPlaceDetail[]>(() => filterPlacesList(FALLBACK_EXTENDED_PLACES, params));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);

  const fetchResults = useCallback(async () => {
    const api = client ?? defaultApiClient;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.listPlaces(params);
      if (Array.isArray(data) && data.length > 0) {
        setPlaces(data.map(toExtendedPlace));
      } else if (Array.isArray(data) && data.length === 0) {
        // If API returned empty, filter fallback dataset to ensure consistent UX
        const fallbackFiltered = filterPlacesList(FALLBACK_EXTENDED_PLACES, params);
        setPlaces(fallbackFiltered);
      }
    } catch (err) {
      setError(err);
      const filtered = filterPlacesList(FALLBACK_EXTENDED_PLACES, params);
      setPlaces(filtered);
    } finally {
      setIsLoading(false);
    }
  }, [client, JSON.stringify(params)]);

  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      const api = client ?? defaultApiClient;
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.listPlaces(params);
        if (!isCancelled && Array.isArray(data) && data.length > 0) {
          setPlaces(data.map(toExtendedPlace));
        } else if (!isCancelled && Array.isArray(data) && data.length === 0) {
          const fallbackFiltered = filterPlacesList(FALLBACK_EXTENDED_PLACES, params);
          setPlaces(fallbackFiltered);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err);
          const filtered = filterPlacesList(FALLBACK_EXTENDED_PLACES, params);
          setPlaces(filtered);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [client, JSON.stringify(params), debounceMs]);

  return {
    places,
    isLoading,
    error,
    refetch: fetchResults,
  };
}
