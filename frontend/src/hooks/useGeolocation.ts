/**
 * Client-Side Geolocation State Machine Hook for O-Travelz
 *
 * Enforces strict DPDP Act 2023 compliance & privacy guarantees:
 * - Never prompts for browser permission on mount.
 * - Requires explicit user-confirmed action.
 * - Coordinates remain strictly in-memory client state (never in localStorage).
 * - Zero unauthorized backend transmission.
 * - Proper cleanup of navigator.geolocation watches.
 */
import { useState, useEffect, useRef, useCallback } from "react";

export type GeolocationStatus =
  | "idle"
  | "prompt"
  | "requesting"
  | "granted"
  | "active"
  | "denied"
  | "unavailable"
  | "timeout"
  | "unsupported";

export interface GeoCoordinates {
  lat: number;
  lon: number;
  accuracyMeters?: number;
  timestamp?: number;
}

export interface GeolocationState {
  status: GeolocationStatus;
  coords: GeoCoordinates | null;
  errorMessage: string | null;
  isModalOpen: boolean;
  accuracy: number | null;
}

export interface UseGeolocationReturn extends GeolocationState {
  openPrompt: () => void;
  confirmAndRequest: () => void;
  retry: () => void;
  dismissModal: () => void;
  clearLocation: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [coords, setCoords] = useState<GeoCoordinates | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const watchIdRef = useRef<number | null>(null);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      clearWatch();
    };
  }, [clearWatch]);

  // Check initial browser permission status if supported (without prompting)
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      navigator.permissions &&
      navigator.permissions.query
    ) {
      try {
        navigator.permissions
          .query({ name: "geolocation" as PermissionName })
          .then((permissionStatus) => {
            if (permissionStatus.state === "denied") {
              setStatus((prev) => (prev === "idle" ? "denied" : prev));
            }
            permissionStatus.onchange = () => {
              if (permissionStatus.state === "denied") {
                setStatus("denied");
                setCoords(null);
                clearWatch();
              } else if (permissionStatus.state === "prompt" && status === "denied") {
                setStatus("idle");
              }
            };
          })
          .catch(() => {
            // Permission API query unsupported or restricted; ignore safely
          });
      } catch {
        // Fall back gracefully
      }
    }
  }, [clearWatch, status]);

  const openPrompt = useCallback(() => {
    setIsModalOpen(true);
    if (status === "idle" || status === "denied" || status === "timeout" || status === "unavailable") {
      setErrorMessage(null);
    }
  }, [status]);

  const dismissModal = useCallback(() => {
    setIsModalOpen(false);
    if (status === "requesting") {
      setStatus("idle");
    }
  }, [status]);

  const clearLocation = useCallback(() => {
    clearWatch();
    setCoords(null);
    setAccuracy(null);
    setStatus("idle");
    setErrorMessage(null);
    setIsModalOpen(false);
  }, [clearWatch]);

  const confirmAndRequest = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      setErrorMessage("Geolocation is not supported by your browser.");
      setIsModalOpen(false);
      return;
    }

    setStatus("requesting");
    setErrorMessage(null);

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords: GeoCoordinates = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        setCoords(newCoords);
        setAccuracy(Math.round(position.coords.accuracy));
        setStatus("granted");
        setErrorMessage(null);
        setIsModalOpen(false);

        // Set up active watch for position updates
        clearWatch();
        try {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (watchPos) => {
              setCoords({
                lat: watchPos.coords.latitude,
                lon: watchPos.coords.longitude,
                accuracyMeters: watchPos.coords.accuracy,
                timestamp: watchPos.timestamp,
              });
              setAccuracy(Math.round(watchPos.coords.accuracy));
              setStatus("active");
            },
            () => {
              // Ignore background watch errors silently to prevent interrupting UX
            },
            {
              enableHighAccuracy: true,
              maximumAge: 60000,
              timeout: 15000,
            }
          );
        } catch {
          // If watch fails, single current position remains granted
        }
      },
      (error) => {
        clearWatch();
        setCoords(null);
        setAccuracy(null);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setStatus("denied");
            setErrorMessage("Location access was denied in your browser settings.");
            break;
          case error.TIMEOUT:
            setStatus("timeout");
            setErrorMessage("Location request timed out. Please try again.");
            break;
          case error.POSITION_UNAVAILABLE:
          default:
            setStatus("unavailable");
            setErrorMessage("Unable to determine your current GPS position.");
            break;
        }
      },
      geoOptions
    );
  }, [clearWatch]);

  const retry = useCallback(() => {
    confirmAndRequest();
  }, [confirmAndRequest]);

  return {
    status,
    coords,
    errorMessage,
    isModalOpen,
    accuracy,
    openPrompt,
    confirmAndRequest,
    retry,
    dismissModal,
    clearLocation,
  };
}
