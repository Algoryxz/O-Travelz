import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient, ApiError } from "../api/client";
import { useAuth } from "./useAuth";
import type {
  SyncPlaceItem,
  SyncStatus,
  SyncTripItem,
} from "../types/api";
import type { SavedPlaceItem } from "./useSavedPlaces";
import type { SavedTripConversation } from "./useConversationHistory";

const SAVED_PLACES_KEY = "o_travelz_saved_places";
const SAVED_PLACES_TOMBSTONES_KEY = "o_travelz_saved_places_tombstones";
const CONVERSATIONS_KEY = "o_travelz_conversations";
const CONVERSATIONS_TOMBSTONES_KEY = "o_travelz_conversations_tombstones";

interface TombstoneEntry {
  id: string;
  updatedAt: number;
}

function isObject(val: unknown): val is Record<string, any> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

/**
 * Runtime Type Guard for SyncPlaceItem to prevent malformed server records from corrupting state.
 */
export function isValidSyncPlaceItem(item: unknown): item is SyncPlaceItem {
  if (!isObject(item)) return false;
  if (typeof item.place_id !== "string" || item.place_id.trim().length === 0 || item.place_id.length > 100) {
    return false;
  }
  if (typeof item.updated_at !== "number" || isNaN(item.updated_at) || item.updated_at < 0) {
    return false;
  }
  if (typeof item.is_deleted !== "boolean") {
    return false;
  }
  if (item.place_data !== undefined && item.place_data !== null && !isObject(item.place_data)) {
    return false;
  }
  return true;
}

/**
 * Sanitize raw place item into a validated SyncPlaceItem structure.
 */
export function sanitizeSyncPlaceItem(item: unknown): SyncPlaceItem | null {
  if (!isValidSyncPlaceItem(item)) return null;
  return {
    place_id: item.place_id.trim(),
    place_name: typeof item.place_name === "string" ? item.place_name.trim() : item.place_id.trim(),
    place_data: isObject(item.place_data) ? item.place_data : {},
    saved_at: typeof item.saved_at === "number" && !isNaN(item.saved_at) && item.saved_at >= 0 ? item.saved_at : item.updated_at,
    updated_at: item.updated_at,
    is_deleted: item.is_deleted,
  };
}

/**
 * Runtime Type Guard for SyncTripItem to prevent malformed server records from corrupting state.
 */
export function isValidSyncTripItem(item: unknown): item is SyncTripItem {
  if (!isObject(item)) return false;
  if (typeof item.id !== "string" || item.id.trim().length === 0 || item.id.length > 100) {
    return false;
  }
  if (typeof item.title !== "string") {
    return false;
  }
  if (typeof item.updated_at !== "number" || isNaN(item.updated_at) || item.updated_at < 0) {
    return false;
  }
  if (typeof item.is_deleted !== "boolean") {
    return false;
  }
  if (item.history !== undefined && item.history !== null && !Array.isArray(item.history)) {
    return false;
  }
  return true;
}

/**
 * Sanitize raw trip item into a validated SyncTripItem structure.
 */
export function sanitizeSyncTripItem(item: unknown): SyncTripItem | null {
  if (!isValidSyncTripItem(item)) return null;
  return {
    id: item.id.trim(),
    title: item.title.trim() || "Untitled Trip",
    history: Array.isArray(item.history) ? item.history : [],
    constraints: isObject(item.constraints) ? item.constraints : null,
    itinerary: isObject(item.itinerary) ? item.itinerary : null,
    timestamp: typeof item.timestamp === "number" && !isNaN(item.timestamp) && item.timestamp >= 0 ? item.timestamp : item.updated_at,
    updated_at: item.updated_at,
    is_deleted: item.is_deleted,
  };
}

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, data: T): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

interface CloudSyncState {
  status: SyncStatus;
  lastSyncedAt: number | null;
  error: string | null;
}

let globalSyncState: CloudSyncState = {
  status: "idle",
  lastSyncedAt: null,
  error: null,
};

const syncListeners = new Set<(state: CloudSyncState) => void>();

function updateSyncState(newState: Partial<CloudSyncState>) {
  globalSyncState = { ...globalSyncState, ...newState };
  syncListeners.forEach((fn) => fn(globalSyncState));
}

export function useCloudSync() {
  const { isAuthenticated, checkAuth } = useAuth();
  const [state, setState] = useState<CloudSyncState>(globalSyncState);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryAfterUntilRef = useRef<number>(0);

  useEffect(() => {
    syncListeners.add(setState);
    return () => {
      syncListeners.delete(setState);
    };
  }, []);

  // Offline / Online listeners
  useEffect(() => {
    const handleOnline = () => {
      if (globalSyncState.status === "offline") {
        updateSyncState({ status: "pending" });
        if (isAuthenticated) {
          triggerSync();
        }
      }
    };
    const handleOffline = () => {
      updateSyncState({ status: "offline" });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isAuthenticated]);

  const reconcilePlaces = useCallback(async (): Promise<boolean> => {
    try {
      const serverRes = await apiClient.getSyncedPlaces();
      if (!isObject(serverRes) || !Array.isArray(serverRes.items)) {
        throw new Error("Malformed saved-places response received from sync server.");
      }
      const rawServerItems = serverRes.items;

      const localPlaces = loadJson<SavedPlaceItem[]>(SAVED_PLACES_KEY, []);
      const localTombstones = loadJson<TombstoneEntry[]>(SAVED_PLACES_TOMBSTONES_KEY, []);

      // Build local map: place_id -> { item?, is_deleted, updated_at }
      const localMap = new Map<
        string,
        { item?: SavedPlaceItem; is_deleted: boolean; updated_at: number }
      >();

      localPlaces.forEach((p) => {
        const id = p.id || p.name;
        localMap.set(id.toLowerCase().trim(), {
          item: p,
          is_deleted: false,
          updated_at: p.savedAt || Date.now(),
        });
      });

      localTombstones.forEach((t) => {
        const id = t.id.toLowerCase().trim();
        const existing = localMap.get(id);
        if (!existing || t.updatedAt >= existing.updated_at) {
          localMap.set(id, {
            item: undefined,
            is_deleted: true,
            updated_at: t.updatedAt,
          });
        }
      });

      const serverMap = new Map<string, SyncPlaceItem>();
      rawServerItems.forEach((raw) => {
        const validated = sanitizeSyncPlaceItem(raw);
        if (validated) {
          serverMap.set(validated.place_id.toLowerCase().trim(), validated);
        }
      });

      const allIds = new Set<string>([...localMap.keys(), ...serverMap.keys()]);

      const reconciledActivePlaces: SavedPlaceItem[] = [];
      const reconciledTombstones: TombstoneEntry[] = [];
      const itemsToPushToServer: SyncPlaceItem[] = [];

      for (const key of allIds) {
        const local = localMap.get(key);
        const server = serverMap.get(key);

        if (local && server) {
          // Compare timestamps
          let winnerIsLocal = false;
          let isDeleted = false;

          if (local.updated_at > server.updated_at) {
            winnerIsLocal = true;
            isDeleted = local.is_deleted;
          } else if (server.updated_at > local.updated_at) {
            winnerIsLocal = false;
            isDeleted = server.is_deleted;
          } else {
            // Equal timestamp tie-breaker: tombstone wins
            isDeleted = local.is_deleted || server.is_deleted;
            winnerIsLocal = !isDeleted && !!local.item;
          }

          if (isDeleted) {
            reconciledTombstones.push({
              id: (server.place_id || local.item?.id || key),
              updatedAt: Math.max(local.updated_at, server.updated_at),
            });
            if (winnerIsLocal) {
              itemsToPushToServer.push({
                place_id: local.item?.id || local.item?.name || key,
                place_name: local.item?.name || key,
                place_data: (local.item as any) || {},
                saved_at: local.updated_at,
                updated_at: local.updated_at,
                is_deleted: true,
              });
            }
          } else {
            // Active winner
            const activePlace: SavedPlaceItem = winnerIsLocal
              ? local.item!
              : {
                  id: server.place_id,
                  name: server.place_name || server.place_id,
                  category: (server.place_data?.category as string) || "nature",
                  savedAt: server.saved_at,
                  ...(server.place_data as any),
                };
            reconciledActivePlaces.push(activePlace);

            if (winnerIsLocal) {
              itemsToPushToServer.push({
                place_id: activePlace.id || activePlace.name,
                place_name: activePlace.name,
                place_data: activePlace as any,
                saved_at: activePlace.savedAt || Date.now(),
                updated_at: local.updated_at,
                is_deleted: false,
              });
            }
          }
        } else if (local) {
          // Exists only locally -> push to server
          if (local.is_deleted) {
            reconciledTombstones.push({ id: key, updatedAt: local.updated_at });
            itemsToPushToServer.push({
              place_id: key,
              place_name: key,
              place_data: {},
              saved_at: local.updated_at,
              updated_at: local.updated_at,
              is_deleted: true,
            });
          } else if (local.item) {
            reconciledActivePlaces.push(local.item);
            itemsToPushToServer.push({
              place_id: local.item.id || local.item.name,
              place_name: local.item.name,
              place_data: local.item as any,
              saved_at: local.item.savedAt || Date.now(),
              updated_at: local.updated_at,
              is_deleted: false,
            });
          }
        } else if (server) {
          // Exists only on server -> adopt locally
          if (server.is_deleted) {
            reconciledTombstones.push({
              id: server.place_id,
              updatedAt: server.updated_at,
            });
          } else {
            reconciledActivePlaces.push({
              id: server.place_id,
              name: server.place_name || server.place_id,
              category: (server.place_data?.category as string) || "nature",
              savedAt: server.saved_at,
              ...(server.place_data as any),
            });
          }
        }
      }

      // Save reconciled state locally
      saveJson(SAVED_PLACES_KEY, reconciledActivePlaces);
      saveJson(SAVED_PLACES_TOMBSTONES_KEY, reconciledTombstones);

      // Push local winners to server if any
      if (itemsToPushToServer.length > 0) {
        await apiClient.syncSavedPlaces(itemsToPushToServer);
      }

      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        checkAuth();
      }
      throw err;
    }
  }, [checkAuth]);

  const reconcileTrips = useCallback(async (): Promise<boolean> => {
    try {
      const serverRes = await apiClient.getSyncedTrips();
      if (!isObject(serverRes) || !Array.isArray(serverRes.items)) {
        throw new Error("Malformed trips response received from sync server.");
      }
      const rawServerItems = serverRes.items;

      const localTrips = loadJson<SavedTripConversation[]>(CONVERSATIONS_KEY, []);
      const localTombstones = loadJson<TombstoneEntry[]>(CONVERSATIONS_TOMBSTONES_KEY, []);

      const localMap = new Map<
        string,
        { item?: SavedTripConversation; is_deleted: boolean; updated_at: number }
      >();

      localTrips.forEach((t) => {
        localMap.set(t.id, {
          item: t,
          is_deleted: false,
          updated_at: t.timestamp || Date.now(),
        });
      });

      localTombstones.forEach((t) => {
        const existing = localMap.get(t.id);
        if (!existing || t.updatedAt >= existing.updated_at) {
          localMap.set(t.id, {
            item: undefined,
            is_deleted: true,
            updated_at: t.updatedAt,
          });
        }
      });

      const serverMap = new Map<string, SyncTripItem>();
      rawServerItems.forEach((raw) => {
        const validated = sanitizeSyncTripItem(raw);
        if (validated) {
          serverMap.set(validated.id.toLowerCase().trim(), validated);
        }
      });

      const allIds = new Set<string>([...localMap.keys(), ...serverMap.keys()]);

      const reconciledActiveTrips: SavedTripConversation[] = [];
      const reconciledTombstones: TombstoneEntry[] = [];
      const tripsToPushToServer: SyncTripItem[] = [];

      for (const id of allIds) {
        const local = localMap.get(id);
        const server = serverMap.get(id);

        if (local && server) {
          let winnerIsLocal = false;
          let isDeleted = false;

          if (local.updated_at > server.updated_at) {
            winnerIsLocal = true;
            isDeleted = local.is_deleted;
          } else if (server.updated_at > local.updated_at) {
            winnerIsLocal = false;
            isDeleted = server.is_deleted;
          } else {
            isDeleted = local.is_deleted || server.is_deleted;
            winnerIsLocal = !isDeleted && !!local.item;
          }

          if (isDeleted) {
            reconciledTombstones.push({
              id,
              updatedAt: Math.max(local.updated_at, server.updated_at),
            });
            if (winnerIsLocal) {
              tripsToPushToServer.push({
                id,
                title: local.item?.title || "Deleted Trip",
                history: (local.item?.history as any) || [],
                constraints: (local.item?.constraints as any) || null,
                itinerary: (local.item?.itinerary as any) || null,
                timestamp: local.updated_at,
                updated_at: local.updated_at,
                is_deleted: true,
              });
            }
          } else {
            const activeTrip: SavedTripConversation = winnerIsLocal
              ? local.item!
              : {
                  id: server.id,
                  title: server.title,
                  timestamp: server.timestamp,
                  history: (server.history as any) || [],
                  constraints: (server.constraints as any) || null,
                  itinerary: (server.itinerary as any) || null,
                };
            reconciledActiveTrips.push(activeTrip);

            if (winnerIsLocal) {
              tripsToPushToServer.push({
                id: activeTrip.id,
                title: activeTrip.title,
                history: (activeTrip.history as any) || [],
                constraints: (activeTrip.constraints as any) || null,
                itinerary: (activeTrip.itinerary as any) || null,
                timestamp: activeTrip.timestamp,
                updated_at: local.updated_at,
                is_deleted: false,
              });
            }
          }
        } else if (local) {
          if (local.is_deleted) {
            reconciledTombstones.push({ id, updatedAt: local.updated_at });
            tripsToPushToServer.push({
              id,
              title: "Deleted Trip",
              history: [],
              timestamp: local.updated_at,
              updated_at: local.updated_at,
              is_deleted: true,
            });
          } else if (local.item) {
            reconciledActiveTrips.push(local.item);
            tripsToPushToServer.push({
              id: local.item.id,
              title: local.item.title,
              history: (local.item.history as any) || [],
              constraints: (local.item.constraints as any) || null,
              itinerary: (local.item.itinerary as any) || null,
              timestamp: local.item.timestamp,
              updated_at: local.updated_at,
              is_deleted: false,
            });
          }
        } else if (server) {
          if (server.is_deleted) {
            reconciledTombstones.push({ id: server.id, updatedAt: server.updated_at });
          } else {
            reconciledActiveTrips.push({
              id: server.id,
              title: server.title,
              timestamp: server.timestamp,
              history: (server.history as any) || [],
              constraints: (server.constraints as any) || null,
              itinerary: (server.itinerary as any) || null,
            });
          }
        }
      }

      saveJson(CONVERSATIONS_KEY, reconciledActiveTrips);
      saveJson(CONVERSATIONS_TOMBSTONES_KEY, reconciledTombstones);

      if (tripsToPushToServer.length > 0) {
        await apiClient.syncTrips(tripsToPushToServer);
      }

      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        checkAuth();
      }
      throw err;
    }
  }, [checkAuth]);

  const performSync = useCallback(async () => {
    if (!isAuthenticated) {
      updateSyncState({ status: "idle", error: null });
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      updateSyncState({ status: "offline" });
      return;
    }

    if (Date.now() < retryAfterUntilRef.current) {
      updateSyncState({ status: "pending" });
      return;
    }

    updateSyncState({ status: "syncing", error: null });

    try {
      await Promise.all([reconcilePlaces(), reconcileTrips()]);
      updateSyncState({
        status: "synced",
        lastSyncedAt: Date.now(),
        error: null,
      });
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 429) {
        // Respect Retry-After
        const retrySec = 60;
        retryAfterUntilRef.current = Date.now() + retrySec * 1000;
        updateSyncState({ status: "pending", error: "Rate limit reached. Sync paused temporarily." });
      } else if (err instanceof ApiError && err.status === 401) {
        updateSyncState({ status: "idle", error: "Session expired." });
      } else {
        updateSyncState({
          status: "error",
          error: err instanceof Error ? err.message : "Sync failed. Changes saved locally.",
        });
      }
    }
  }, [isAuthenticated, reconcilePlaces, reconcileTrips]);

  const triggerSync = useCallback(() => {
    if (!isAuthenticated) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      performSync();
    }, 400);
  }, [isAuthenticated, performSync]);

  // Initial sync on authentication confirmation
  useEffect(() => {
    if (isAuthenticated) {
      performSync();
    } else {
      updateSyncState({ status: "idle", error: null });
    }
  }, [isAuthenticated, performSync]);

  return {
    status: state.status,
    lastSyncedAt: state.lastSyncedAt,
    error: state.error,
    syncNow: performSync,
    triggerSync,
  };
}

/** Record a place tombstone deletion */
export function recordPlaceTombstone(placeIdOrName: string): void {
  const list = loadJson<TombstoneEntry[]>(SAVED_PLACES_TOMBSTONES_KEY, []);
  list.push({ id: placeIdOrName, updatedAt: Date.now() });
  saveJson(SAVED_PLACES_TOMBSTONES_KEY, list);
}

/** Record a trip tombstone deletion */
export function recordTripTombstone(tripId: string): void {
  const list = loadJson<TombstoneEntry[]>(CONVERSATIONS_TOMBSTONES_KEY, []);
  list.push({ id: tripId, updatedAt: Date.now() });
  saveJson(CONVERSATIONS_TOMBSTONES_KEY, list);
}
