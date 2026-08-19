import { useState, useEffect, useCallback } from "react";
import type { PlaceDetail } from "../api/contracts";
import { apiClient as defaultApiClient, ApiClient } from "../api/client";
import { getPlaceRegion, getPlaceImageUrl } from "../utils/imageService";
import { resolvePlaceImageUrl } from "../utils/imageAdapter";

// Bundled authoritative seed fallback (so UI is instant & robust in all environments)
import seedPlacesData from "../../../data/places/places.json";

export interface ExtendedPlaceDetail extends PlaceDetail {
  region: string;
  imageUrl: string;
}

export function toExtendedPlace(place: PlaceDetail): ExtendedPlaceDetail {
  return {
    ...place,
    region: getPlaceRegion(place.name),
    imageUrl: resolvePlaceImageUrl(place, "card"),
  };
}


const FALLBACK_EXTENDED_PLACES: ExtendedPlaceDetail[] = (seedPlacesData as any[]).map((raw, idx) => ({
  id: raw.id || `seed_place_${idx + 1}`,
  name: raw.name,
  category: raw.category,
  description: raw.description,
  lat: raw.lat,
  lon: raw.lon,
  avg_visit_minutes: raw.avg_visit_minutes,
  price_tier: raw.price_tier,
  source: raw.source,
  verified_at: raw.verified_at,
  region: getPlaceRegion(raw.name),
  imageUrl: getPlaceImageUrl(raw.name, raw.category),
}));

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
      return places.find((p) => p.id === id);
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
