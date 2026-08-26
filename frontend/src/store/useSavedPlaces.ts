import { useState, useEffect, useCallback } from "react";

export interface SavedPlaceItem {
  id: string;
  name: string;
  category: string;
  location?: string;
  notes?: string;
  distance?: string;
  coordinates?: [number, number];
  savedAt?: number;
  description?: string;
  tags?: string[];
  interests?: string[];
}

const STORAGE_KEY = "o_travelz_saved_places";

function loadSavedPlacesFromStorage(): SavedPlaceItem[] {
  if (typeof window === "undefined" && typeof localStorage === "undefined") return [];
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSavedPlacesToStorage(items: SavedPlaceItem[]): void {
  if (typeof window === "undefined" && typeof localStorage === "undefined") return;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
    // ignore storage quota errors
  }
}

export function useSavedPlaces() {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlaceItem[]>(() =>
    loadSavedPlacesFromStorage()
  );

  // Sync state if another tab modifies storage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setSavedPlaces(loadSavedPlacesFromStorage());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isSaved = useCallback(
    (placeIdOrName: string) => {
      const target = placeIdOrName.toLowerCase().trim();
      return savedPlaces.some(
        (p) =>
          p.id.toLowerCase().trim() === target ||
          p.name.toLowerCase().trim() === target
      );
    },
    [savedPlaces]
  );

  const savePlace = useCallback((place: SavedPlaceItem) => {
    setSavedPlaces((prev) => {
      const exists = prev.some(
        (p) =>
          p.id.toLowerCase().trim() === place.id.toLowerCase().trim() ||
          p.name.toLowerCase().trim() === place.name.toLowerCase().trim()
      );
      if (exists) return prev;
      const updated = [{ ...place, savedAt: Date.now() }, ...prev];
      saveSavedPlacesToStorage(updated);
      return updated;
    });
  }, []);

  const removePlace = useCallback((placeIdOrName: string) => {
    // Record tombstone for cloud sync
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        const raw = localStorage.getItem("o_travelz_saved_places_tombstones");
        const list = raw ? JSON.parse(raw) : [];
        list.push({ id: placeIdOrName, updatedAt: Date.now() });
        localStorage.setItem("o_travelz_saved_places_tombstones", JSON.stringify(list));
      } catch {
        // ignore
      }
    }

    setSavedPlaces((prev) => {
      const target = placeIdOrName.toLowerCase().trim();
      const updated = prev.filter(
        (p) =>
          p.id.toLowerCase().trim() !== target &&
          p.name.toLowerCase().trim() !== target
      );
      saveSavedPlacesToStorage(updated);
      return updated;
    });
  }, []);

  const toggleSavePlace = useCallback(
    (place: SavedPlaceItem) => {
      if (isSaved(place.id) || isSaved(place.name)) {
        removePlace(place.id || place.name);
      } else {
        savePlace(place);
      }
    },
    [isSaved, savePlace, removePlace]
  );

  const clearSavedPlaces = useCallback(() => {
    setSavedPlaces([]);
    saveSavedPlacesToStorage([]);
  }, []);

  return {
    savedPlaces,
    savedCount: savedPlaces.length,
    isSaved,
    savePlace,
    removePlace,
    toggleSavePlace,
    toggleSave: toggleSavePlace,
    clearSavedPlaces,
    clearAllSaved: clearSavedPlaces,
  };
}
