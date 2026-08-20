import { useState, useEffect, useCallback } from "react";

export interface RecentPlaceItem {
  id: string;
  name: string;
  category: string;
  location?: string;
  imageUrl?: string;
  visitedAt: number;
}

const STORAGE_KEY = "otravelz_recent_places_v1";
const MAX_RECENT = 10;

function loadRecentPlaces(): RecentPlaceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentPlaces(items: RecentPlaceItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

export function useRecentPlaces() {
  const [recentPlaces, setRecentPlaces] = useState<RecentPlaceItem[]>(() => loadRecentPlaces());

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setRecentPlaces(loadRecentPlaces());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addRecentPlace = useCallback(
    (place: { id: string; name: string; category?: string; location?: string; imageUrl?: string }) => {
      setRecentPlaces((prev) => {
        const filtered = prev.filter(
          (p) => p.id !== place.id && p.name.toLowerCase() !== place.name.toLowerCase()
        );
        const updated: RecentPlaceItem[] = [
          {
            id: place.id,
            name: place.name,
            category: place.category || "Destination",
            location: place.location || "Odisha",
            imageUrl: place.imageUrl,
            visitedAt: Date.now(),
          },
          ...filtered,
        ].slice(0, MAX_RECENT);
        saveRecentPlaces(updated);
        return updated;
      });
    },
    []
  );

  const clearRecentPlaces = useCallback(() => {
    setRecentPlaces([]);
    saveRecentPlaces([]);
  }, []);

  return {
    recentPlaces,
    addRecentPlace,
    clearRecentPlaces,
  };
}
