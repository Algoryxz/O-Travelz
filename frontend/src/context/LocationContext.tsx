import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface LocationPosition {
  lat: number;
  lon: number;
}

export type LocationType = 'LIVE_GPS' | 'MANUAL_LOCATION' | 'VERIFIED_DEFAULT_HUB' | 'UNRESOLVED';

export interface CanonicalHub {
  id: string;
  name: string;
  city: string;
  district: string;
  lat: number;
  lon: number;
  tag: string;
}

export const CANONICAL_ODISHA_HUBS: CanonicalHub[] = [
  { id: "bhubaneswar", name: "Bhubaneswar (Capital)", city: "Bhubaneswar", district: "Khordha", lat: 20.2961, lon: 85.8245, tag: "Capital Hub" },
  { id: "puri", name: "Puri (Jagannath & Coast)", city: "Puri", district: "Puri", lat: 19.8135, lon: 85.8312, tag: "Seaside Heritage" },
  { id: "konark", name: "Konark (Sun Temple)", city: "Konark", district: "Puri", lat: 19.8876, lon: 86.0945, tag: "UNESCO Heritage" },
  { id: "cuttack", name: "Cuttack (Silver City)", city: "Cuttack", district: "Cuttack", lat: 20.4625, lon: 85.8828, tag: "Historic River City" },
  { id: "chilika", name: "Chilika (Satapada Lagoon)", city: "Chilika", district: "Puri", lat: 19.7083, lon: 85.3206, tag: "Marine Wetland" },
  { id: "sambalpur", name: "Sambalpur (Hirakud)", city: "Sambalpur", district: "Sambalpur", lat: 21.4669, lon: 83.9812, tag: "Western Gateway" },
  { id: "rourkela", name: "Rourkela (Steel City)", city: "Rourkela", district: "Sundargarh", lat: 22.2604, lon: 84.8536, tag: "Highland Corridor" },
  { id: "keonjhar", name: "Keonjhar (Waterfalls)", city: "Keonjhar", district: "Kendujhar", lat: 21.6289, lon: 85.5817, tag: "Northern Forests" },
  { id: "berhampur", name: "Berhampur (Silk City)", city: "Berhampur", district: "Ganjam", lat: 19.3149, lon: 84.7941, tag: "Southern Hub" },
  { id: "koraput", name: "Koraput (Deomali Peaks)", city: "Koraput", district: "Koraput", lat: 18.8135, lon: 82.7117, tag: "Eastern Ghats" },
  { id: "daringbadi", name: "Daringbadi (Coffee Valleys)", city: "Daringbadi", district: "Kandhamal", lat: 19.9080, lon: 84.1350, tag: "Pine Valley" },
];

export interface LocationContextValue {
  currentPosition: LocationPosition | null;
  locationName: string;
  locality: string;
  city: string;
  isLive: boolean;
  locationType: LocationType;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unavailable';
  isLoading: boolean;
  error: string | null;
  locateUser: (silent?: boolean) => Promise<void>;
  setManualLocation: (pos: LocationPosition, name: string, city?: string) => void;
  toggleLiveLocation: () => Promise<void>;
  selectHub: (hub: CanonicalHub) => void;
}

const DEFAULT_FALLBACK_LOCATION: LocationPosition = {
  lat: 20.2667,
  lon: 85.8436, // Master Canteen / BBSR Railway Station, Odisha
};

const DEFAULT_FALLBACK_NAME = "Master Canteen · Bhubaneswar";

const LocationContext = createContext<LocationContextValue>({
  currentPosition: DEFAULT_FALLBACK_LOCATION,
  locationName: DEFAULT_FALLBACK_NAME,
  locality: "Master Canteen",
  city: "Bhubaneswar",
  isLive: false,
  locationType: 'VERIFIED_DEFAULT_HUB',
  permissionState: 'prompt',
  isLoading: false,
  error: null,
  locateUser: async () => {},
  setManualLocation: () => {},
  toggleLiveLocation: async () => {},
  selectHub: () => {},
});

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPosition, setCurrentPosition] = useState<LocationPosition | null>(DEFAULT_FALLBACK_LOCATION);
  const [locationName, setLocationName] = useState<string>(DEFAULT_FALLBACK_NAME);
  const [locality, setLocality] = useState<string>("Master Canteen");
  const [city, setCity] = useState<string>("Bhubaneswar");
  const [isLive, setIsLive] = useState<boolean>(false);
  const [locationType, setLocationType] = useState<LocationType>('VERIFIED_DEFAULT_HUB');
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unavailable'>('prompt');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Last chosen manual hub for clean toggle-off return
  const [lastManualHub, setLastManualHub] = useState<CanonicalHub>(CANONICAL_ODISHA_HUBS[0]);

  const locateUser = useCallback(async (silent = false) => {
    if (!navigator.geolocation) {
      setPermissionState('unavailable');
      setLocationType('VERIFIED_DEFAULT_HUB');
      if (!silent) setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: LocationPosition = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };

        setCurrentPosition(coords);
        setIsLive(true);
        setLocationType('LIVE_GPS');
        setPermissionState('granted');

        try {
          // Call backend cached reverse geocoder
          const geocodeRes = await apiClient.reverseGeocode(coords.lat, coords.lon);
          if (geocodeRes && geocodeRes.locality) {
            setLocationName(geocodeRes.locality);
            setLocality(geocodeRes.neighborhood || geocodeRes.city || "Odisha");
            setCity(geocodeRes.city || "Odisha");
          } else {
            const fallbackCity = (geocodeRes && geocodeRes.city) ? geocodeRes.city : "Bhubaneswar";
            setLocationName(fallbackCity);
            setLocality(fallbackCity);
            setCity(fallbackCity);
          }
        } catch (err) {
          console.warn('Reverse geocode lookup note:', err);
          setLocationName("Live GPS Location (Odisha)");
          setLocality("Live Location");
          setCity("Odisha");
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setIsLoading(false);
        setIsLive(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState('denied');
          setLocationType('VERIFIED_DEFAULT_HUB');
          if (!silent) setError('Location permission was denied. Switched to manual Odisha location.');
        } else {
          setPermissionState('unavailable');
          setLocationType('VERIFIED_DEFAULT_HUB');
          if (!silent) setError('Could not acquire GPS position. Showing verified Odisha hub.');
        }
        // Fall back gracefully to last manual hub or default
        setCurrentPosition({ lat: lastManualHub.lat, lon: lastManualHub.lon });
        setLocationName(lastManualHub.name);
        setLocality(lastManualHub.city);
        setCity(lastManualHub.city);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 min cache
      }
    );
  }, [lastManualHub]);

  const setManualLocation = useCallback((pos: LocationPosition, name: string, userCity = "Odisha") => {
    setCurrentPosition(pos);
    setLocationName(name);
    setLocality(name);
    setCity(userCity);
    setIsLive(false);
    setLocationType('MANUAL_LOCATION');
    setError(null);
  }, []);

  const selectHub = useCallback((hub: CanonicalHub) => {
    setLastManualHub(hub);
    setManualLocation({ lat: hub.lat, lon: hub.lon }, hub.name, hub.city);
  }, [setManualLocation]);

  const toggleLiveLocation = useCallback(async () => {
    if (isLive) {
      // Turn OFF -> switch to last manual hub
      setIsLive(false);
      setLocationType('MANUAL_LOCATION');
      setCurrentPosition({ lat: lastManualHub.lat, lon: lastManualHub.lon });
      setLocationName(lastManualHub.name);
      setLocality(lastManualHub.city);
      setCity(lastManualHub.city);
      setError(null);
    } else {
      // Turn ON -> locate user
      await locateUser(false);
    }
  }, [isLive, lastManualHub, locateUser]);

  // Request on initial load silently
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((res) => {
        if (res.state === 'granted') {
          locateUser(true);
        } else if (res.state === 'denied') {
          setPermissionState('denied');
          setLocationType('VERIFIED_DEFAULT_HUB');
        } else {
          setPermissionState('prompt');
        }
      }).catch(() => {
        // Ignore permission query error
      });
    }
  }, [locateUser]);

  return (
    <LocationContext.Provider
      value={{
        currentPosition,
        locationName,
        locality,
        city,
        isLive,
        locationType,
        permissionState,
        isLoading,
        error,
        locateUser,
        setManualLocation,
        toggleLiveLocation,
        selectHub,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
