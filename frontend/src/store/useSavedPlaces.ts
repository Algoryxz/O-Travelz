import { useState, useEffect, useCallback } from "react";

export interface SavedPlaceItem {
  id: string;
  name: string;
  category: string;
  location?: string;
  description?: string | null;
  distance?: string;
  notes?: string;
  tags?: string[];
  addedDate?: string;
  coordinates?: [number, number]; // [lon, lat]
}

const STORAGE_KEY = "o_travelz_saved_places";

function loadSavedPlacesFromStorage(): SavedPlaceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSavedPlacesToStorage(items: SavedPlaceItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
    (idOrName: string): boolean => {
      const match = idOrName.trim().toLowerCase();
      return savedPlaces.some(
        (p) =>
          p.id.toLowerCase() === match || p.name.toLowerCase() === match
      );
    },
    [savedPlaces]
  );

  const savePlace = useCallback((place: SavedPlaceItem) => {
    setSavedPlaces((prev) => {
      if (
        prev.some(
          (p) =>
            p.id.toLowerCase() === place.id.toLowerCase() ||
            p.name.toLowerCase() === place.name.toLowerCase()
        )
      ) {
        return prev;
      }
      const updated = [
        ...prev,
        {
          ...place,
          addedDate: place.addedDate ?? new Date().toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
        },
      ];
      saveSavedPlacesToStorage(updated);
      return updated;
    });
  }, []);

  const removePlace = useCallback((idOrName: string) => {
    setSavedPlaces((prev) => {
      const match = idOrName.trim().toLowerCase();
      const updated = prev.filter(
        (p) =>
          p.id.toLowerCase() !== match && p.name.toLowerCase() !== match
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

  const clearAllSaved = useCallback(() => {
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
    clearAllSaved,
  };
}
