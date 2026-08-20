import { useState, useEffect, useCallback } from "react";

export type MemoryStatus = "explored" | "planned" | "visited" | "navigated";

export interface TripAssociation {
  tripId?: string;
  title?: string;
  date?: string;
  daysCount?: number;
}

export interface PlaceMemoryItem {
  id: string;
  name: string;
  category: string;
  location?: string;
  lat?: number | null;
  lon?: number | null;
  imageUrl?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  avg_visit_minutes?: number;
  status: MemoryStatus;
  visitedAt: number;
  tripAssociation?: TripAssociation;
  notes?: string;
  interests?: string[];
  tags?: string[];
}

export type RecentPlaceItem = PlaceMemoryItem;

const STORAGE_KEY = "otravelz_place_memories_v2";
const MAX_MEMORIES = 30;

function loadPlaceMemories(): PlaceMemoryItem[] {
  if (typeof window === "undefined" && typeof localStorage === "undefined") return [];
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) {
      // Check legacy key
      const legacyRaw = typeof localStorage !== "undefined" ? localStorage.getItem("otravelz_recent_places_v1") : null;
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        return legacy.map((item: any) => ({
          ...item,
          status: "explored" as MemoryStatus,
          rating: 4.8,
          reviewCount: 420,
        }));
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function savePlaceMemories(items: PlaceMemoryItem[]): void {
  if (typeof window === "undefined" && typeof localStorage === "undefined") return;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
    // Ignore storage errors
  }
}

export function useRecentPlaces() {
  const [recentPlaces, setRecentPlaces] = useState<PlaceMemoryItem[]>(() => loadPlaceMemories());

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setRecentPlaces(loadPlaceMemories());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addRecentPlace = useCallback(
    (place: {
      id?: string;
      name: string;
      category?: string;
      location?: string;
      lat?: number | null;
      lon?: number | null;
      imageUrl?: string;
      description?: string;
      rating?: number;
      reviewCount?: number;
      avg_visit_minutes?: number;
      status?: MemoryStatus;
      tripAssociation?: TripAssociation;
      notes?: string;
      interests?: string[];
      tags?: string[];
    }) => {
      setRecentPlaces((prev) => {
        const placeId = place.id || place.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const existing = prev.find(
          (p) => p.id === placeId || p.name.toLowerCase() === place.name.toLowerCase()
        );

        const updatedStatus = place.status || existing?.status || "explored";
        const updatedTrip = place.tripAssociation || existing?.tripAssociation;

        const memoryItem: PlaceMemoryItem = {
          id: placeId,
          name: place.name,
          category: place.category || existing?.category || "Destination",
          location: place.location || existing?.location || "Odisha",
          lat: place.lat ?? existing?.lat ?? null,
          lon: place.lon ?? existing?.lon ?? null,
          imageUrl: place.imageUrl || existing?.imageUrl,
          description: place.description || existing?.description,
          rating: place.rating ?? existing?.rating ?? 4.8,
          reviewCount: place.reviewCount ?? existing?.reviewCount ?? 350,
          avg_visit_minutes: place.avg_visit_minutes ?? existing?.avg_visit_minutes ?? 60,
          status: updatedStatus,
          visitedAt: Date.now(),
          tripAssociation: updatedTrip,
          notes: place.notes || existing?.notes,
          interests: place.interests || existing?.interests,
          tags: place.tags || existing?.tags,
        };

        const filtered = prev.filter(
          (p) => p.id !== placeId && p.name.toLowerCase() !== place.name.toLowerCase()
        );
        const updated = [memoryItem, ...filtered].slice(0, MAX_MEMORIES);
        savePlaceMemories(updated);
        return updated;
      });
    },
    []
  );

  const updateMemoryStatus = useCallback((idOrName: string, status: MemoryStatus) => {
    setRecentPlaces((prev) => {
      const updated = prev.map((p) => {
        if (p.id === idOrName || p.name.toLowerCase() === idOrName.toLowerCase()) {
          return { ...p, status, visitedAt: Date.now() };
        }
        return p;
      });
      savePlaceMemories(updated);
      return updated;
    });
  }, []);

  const removeRecentPlace = useCallback((idOrName: string) => {
    setRecentPlaces((prev) => {
      const updated = prev.filter(
        (p) => p.id !== idOrName && p.name.toLowerCase() !== idOrName.toLowerCase()
      );
      savePlaceMemories(updated);
      return updated;
    });
  }, []);

  const clearRecentPlaces = useCallback(() => {
    setRecentPlaces([]);
    savePlaceMemories([]);
  }, []);

  return {
    recentPlaces,
    memories: recentPlaces,
    count: recentPlaces.length,
    addRecentPlace,
    addPlaceMemory: addRecentPlace,
    updateMemoryStatus,
    removeRecentPlace,
    clearRecentPlaces,
  };
}
