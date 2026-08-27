import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';
import { useLocation } from '../../context/LocationContext';
import { useSavedPlaces } from '../../store/useSavedPlaces';
import { useRegisterAIContext } from '../../context/AIContext';
import { apiClient } from '../../api/client';
import type { PlaceDetail, TransportMapResponse, TransportMapRoute } from '../../api/contracts';
import { ODISHA_EXPERIENCES, type OdishaExperience } from '../../data/odishaExperiences';
import { ODISHA_ESSENTIALS, type EssentialPlace } from '../../data/odishaEssentials';
import { VERIFIED_TRANSIT_STOPS, type VerifiedTransitStop } from '../../data/staticTransitStops';
import {
  isValidCoordinate,
  calculateHaversineDistanceKm,
  formatDistance,
  getNearbyPlacesWithExpansion,
  calculateDriveTimeMinutes,
  calculateWalkTimeMinutes,
  formatDuration,
} from '../../utils/geoUtils';
import { PlaceInfoCard } from '../../components/place/PlaceInfoCard';
import { TransitStopDetailPanel } from '../../components/transit/TransitStopDetailPanel';
import { TransitTimetableModal } from '../../components/transit/TransitTimetableModal';
import L from 'leaflet';

export type MapViewMode =
  | 'destinations'
  | 'hotels'
  | 'culinary'
  | 'transit'
  | 'medical'
  | 'atm'
  | 'atms'
  | 'petrol'
  | 'police'
  | 'experiences'
  | 'saved';

interface ActiveRouteTarget {
  name: string;
  categoryLabel: string;
  address?: string;
  lat: number;
  lon: number;
  distKm: number;
  distanceFormatted: string;
  drivingMins: number;
  walkingMins: number;
}

interface StitchMapPageProps {
  onNavigate: (tab: StitchTab, params?: Record<string, string>) => void;
  onOpenShare?: () => void;
  initialPlaceId?: string;
  initialMode?: MapViewMode;
}

export const StitchMapPage: React.FC<StitchMapPageProps> = ({
  onNavigate,
  onOpenShare,
  initialPlaceId,
  initialMode = 'destinations',
}) => {
  const { currentPosition, isLive, locateUser, locationName, isLoading: isLocating } = useLocation();
  const { savedPlaces, toggleSave, isSaved } = useSavedPlaces();

  const [places, setPlaces] = useState<PlaceDetail[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(initialPlaceId || null);
  const [selectedExperience, setSelectedExperience] = useState<OdishaExperience | null>(null);
  const [selectedEssential, setSelectedEssential] = useState<EssentialPlace | null>(null);
  const [selectedTransitStop, setSelectedTransitStop] = useState<VerifiedTransitStop | null>(null);
  const [activeTimetableRoute, setActiveTimetableRoute] = useState<string | null>(null);

  const [transitMapData, setTransitMapData] = useState<TransportMapResponse | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [filterRegion, setFilterRegion] = useState('Near Me');
  const [viewMode, setViewMode] = useState<MapViewMode>(initialMode);
  const [showAllTransitStops, setShowAllTransitStops] = useState(false);
  const [activeRouteTarget, setActiveRouteTarget] = useState<ActiveRouteTarget | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLineLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Reference coordinates validation
  const hasValidUserCoords = isValidCoordinate(currentPosition?.lat, currentPosition?.lon);
  const refLat = hasValidUserCoords ? currentPosition!.lat : 20.2667;
  const refLon = hasValidUserCoords ? currentPosition!.lon : 85.8436;

  // Register Map Context with Global AI Copilot
  const activeMapPlace = useMemo(() => places.find((p) => p.id === selectedPlaceId), [places, selectedPlaceId]);
  const activeMapRoute = useMemo(
    () => transitMapData?.routes?.find((r) => r.route_id === selectedRouteId),
    [transitMapData, selectedRouteId]
  );

  useRegisterAIContext(
    useMemo(
      () => ({
        page: 'map',
        map: {
          mode: viewMode,
          selected_place: activeMapPlace
            ? {
                id: activeMapPlace.id,
                name: activeMapPlace.name,
                category: typeof activeMapPlace.category === 'string' ? activeMapPlace.category : (activeMapPlace.category as any)?.name,
                district: activeMapPlace.district,
              }
            : null,
          selected_route_id: selectedRouteId,
          selected_route_name: activeMapRoute ? (activeMapRoute.route_number || activeMapRoute.route_name) : null,
          region: filterRegion !== 'All' ? filterRegion : null,
        },
        location: {
          city: locationName,
          district: locationName,
          location_type: isLive ? 'LIVE_GPS' : 'USER_SELECTION',
        },
      }),
      [viewMode, activeMapPlace, selectedRouteId, activeMapRoute, filterRegion, locationName, isLive]
    )
  );

  // 2. Proximity-sorted Destinations
  const nearbyData = useMemo(() => {
    return getNearbyPlacesWithExpansion(places, refLat, refLon, {
      minResults: 4,
      radii: [25, 50, 100, 200, 500],
    });
  }, [places, refLat, refLon]);

  const displayedDestinations = useMemo(() => {
    if (filterRegion === 'Near Me') {
      return nearbyData.places;
    }
    const filtered = places.filter((p) => {
      if (filterRegion !== 'All' && p.region !== filterRegion) return false;
      return isValidCoordinate(p.lat, p.lon);
    });
    return filtered.map((p) => {
      const dist = calculateHaversineDistanceKm(refLat, refLon, p.lat!, p.lon!);
      return {
        ...p,
        distanceKm: dist,
        distanceFormatted: formatDistance(dist),
      };
    });
  }, [filterRegion, nearbyData.places, places, refLat, refLon]);

  // 3. Proximity-sorted Essentials (Hotels, Medical, ATMs, Restaurants, Petrol, Police)
  const displayedEssentials = useMemo(() => {
    let pool = ODISHA_ESSENTIALS;
    if (viewMode === 'hotels') {
      pool = pool.filter((e) => e.category === 'hotel');
    } else if (viewMode === 'medical') {
      pool = pool.filter((e) => e.category === 'hospital' || e.category === 'pharmacy');
    } else if (viewMode === 'atm' || viewMode === 'atms') {
      pool = pool.filter((e) => e.category === 'atm' || e.category === 'bank');
    } else if (viewMode === 'culinary') {
      pool = pool.filter((e) => e.category === 'restaurant');
    } else if (viewMode === 'petrol') {
      pool = pool.filter((e) => e.category === 'petrol');
    } else if (viewMode === 'police') {
      pool = pool.filter((e) => e.category === 'police');
    } else {
      return [];
    }

    const scored = pool.map((item) => {
      const dist = calculateHaversineDistanceKm(refLat, refLon, item.lat, item.lon);
      return {
        ...item,
        distanceKm: dist,
        distanceFormatted: formatDistance(dist),
      };
    });

    scored.sort((a, b) => a.distanceKm - b.distanceKm);
    return scored;
  }, [viewMode, refLat, refLon]);

  // 4. Transit Stops
  const displayedTransitStops = useMemo(() => {
    let stops = VERIFIED_TRANSIT_STOPS;
    const scored = stops.map((st) => {
      const dist = calculateHaversineDistanceKm(refLat, refLon, st.latitude, st.longitude);
      const walkingMins = calculateWalkTimeMinutes(dist);
      return {
        ...st,
        distanceKm: dist,
        distanceFormatted: formatDistance(dist),
        walkingMins,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    return showAllTransitStops ? scored : scored.slice(0, 15);
  }, [refLat, refLon, showAllTransitStops]);

  // 5. Saved Places
  const displayedSavedPlaces = useMemo(() => {
    return savedPlaces.map((sp) => {
      const target = places.find((p) => p.id === sp.id || p.name.toLowerCase() === sp.name.toLowerCase());
      const lat = target?.lat ?? sp.coordinates?.[0];
      const lon = target?.lon ?? sp.coordinates?.[1];
      const hasCoords = isValidCoordinate(lat, lon);
      const dist = hasCoords ? calculateHaversineDistanceKm(refLat, refLon, lat!, lon!) : 0;
      return {
        ...sp,
        lat,
        lon,
        distanceKm: dist,
        distanceFormatted: formatDistance(dist),
      };
    });
  }, [savedPlaces, places, refLat, refLon]);

  // Load canonical places
  useEffect(() => {
    let isMounted = true;
    apiClient
      .listPlaces()
      .then((data) => {
        if (isMounted) {
          setPlaces(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to load places for map:', err);
        if (isMounted) setLoading(false);
      });

    apiClient
      .getTransportMap()
      .then((res) => {
        if (isMounted) setTransitMapData(res);
      })
      .catch((err) => {
        console.warn('Transport map data unavailable, using static fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize MapLibre / Leaflet Container
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [refLat, refLon],
      zoom: 10,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors · O-Travelz',
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    const routeLineGroup = L.layerGroup().addTo(map);
    const userGroup = L.layerGroup().addTo(map);

    markersLayerRef.current = markersGroup;
    routeLineLayerRef.current = routeLineGroup;
    userMarkerLayerRef.current = userGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Draw User Location Pin
  useEffect(() => {
    if (!mapInstanceRef.current || !userMarkerLayerRef.current) return;
    userMarkerLayerRef.current.clearLayers();

    if (hasValidUserCoords) {
      const userIcon = L.divIcon({
        className: 'user-loc-pin',
        html: `<div style="background-color: #2563EB; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(37,99,235,0.6);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const userMarker = L.marker([refLat, refLon], { icon: userIcon });
      userMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
          <strong>📍 ${isLive ? 'Live GPS Location' : 'Selected Location'}</strong>
          <p style="margin: 2px 0 0 0; color: #70798B;">${locationName}</p>
        </div>
      `);
      userMarkerLayerRef.current.addLayer(userMarker);
    }
  }, [hasValidUserCoords, refLat, refLon, isLive, locationName]);

  // Route drawing helper
  const handleDrawRoute = useCallback(
    (target: { lat: number; lon: number; name: string; category: string; address?: string }) => {
      if (!mapInstanceRef.current || !routeLineLayerRef.current) return;
      const dist = calculateHaversineDistanceKm(refLat, refLon, target.lat, target.lon);
      const drivingMins = calculateDriveTimeMinutes(dist);
      const walkingMins = calculateWalkTimeMinutes(dist);

      setActiveRouteTarget({
        name: target.name,
        categoryLabel: target.category,
        address: target.address,
        lat: target.lat,
        lon: target.lon,
        distKm: dist,
        distanceFormatted: formatDistance(dist),
        drivingMins,
        walkingMins,
      });

      routeLineLayerRef.current.clearLayers();

      const polyline = L.polyline(
        [
          [refLat, refLon],
          [target.lat, target.lon],
        ],
        {
          color: '#B87B22',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.85,
        }
      );
      routeLineLayerRef.current.addLayer(polyline);

      const bounds = L.latLngBounds([
        [refLat, refLon],
        [target.lat, target.lon],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    },
    [refLat, refLon]
  );

  const handleClearRoute = () => {
    setActiveRouteTarget(null);
    if (routeLineLayerRef.current) {
      routeLineLayerRef.current.clearLayers();
    }
  };

  // Main Markers Rendering with ONE-CLICK popup fix (decoupled from layer teardown)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    // Mode 1: Destinations / Sanctuaries
    if (viewMode === 'destinations') {
      const points: [number, number][] = [];

      displayedDestinations.forEach((p, index) => {
        if (p.lat != null && p.lon != null && isValidCoordinate(p.lat, p.lon)) {
          points.push([p.lat, p.lon]);
          const customIcon = L.divIcon({
            className: 'custom-stitch-map-pin',
            html: `<div style="background-color: #B87B22; color: #FFFFFF; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: monospace; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);">${
              index + 1
            }</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const marker = L.marker([p.lat, p.lon], { icon: customIcon });

          // ONE-CLICK Immediate selection & popup
          marker.on('click', () => {
            setSelectedPlaceId(p.id);
            setSelectedExperience(null);
            setSelectedEssential(null);
            setSelectedTransitStop(null);
            marker.openPopup();
          });

          marker.bindPopup(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 220px;">
              <div style="font-size: 10px; font-family: monospace; color: #B87B22; font-weight: bold;">
                #${index + 1} ${p.distanceFormatted ? `· ${p.distanceFormatted}` : ''}
              </div>
              <strong style="font-size: 13px; color: #12161E;">${p.name}</strong>
              <p style="font-size: 11px; color: #70798B; margin: 3px 0 0 0;">${p.district || ''} · ${p.category}</p>
            </div>
          `);

          markersLayerRef.current?.addLayer(marker);
        }
      });

      if (points.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(points);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    }
    // Mode 2: Hotels & Stays
    else if (viewMode === 'hotels') {
      const hotelPoints: [number, number][] = [];
      displayedEssentials.forEach((item) => {
        hotelPoints.push([item.lat, item.lon]);
        const hotelIcon = L.divIcon({
          className: 'custom-hotel-pin',
          html: `<div style="background-color: #8C6239; color: #FFFFFF; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 8px rgba(140,98,57,0.4);">🏨</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([item.lat, item.lon], { icon: hotelIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
          setSelectedPlaceId(null);
          setSelectedTransitStop(null);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 230px;">
            <div style="font-size: 10px; font-family: monospace; color: #8C6239; font-weight: bold;">
              🏨 HOTEL · ${item.distanceFormatted}
            </div>
            <strong style="font-size: 13px; color: #12161E;">${item.name}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 3px 0 0 0;">${item.locality} (${item.city})</p>
            ${item.rating ? `<p style="font-size: 11px; color: #8C6239; font-weight: bold; margin-top: 3px;">★ ${item.rating.toFixed(1)} (${item.ratingCount || ''})</p>` : ''}
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });

      if (hotelPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(hotelPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 3: Food & Culinary
    else if (viewMode === 'culinary') {
      const foodPoints: [number, number][] = [];
      displayedEssentials.forEach((item) => {
        foodPoints.push([item.lat, item.lon]);
        const foodIcon = L.divIcon({
          className: 'custom-food-pin',
          html: `<div style="background-color: #C05621; color: #FFFFFF; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 8px rgba(192,86,33,0.4);">🍲</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([item.lat, item.lon], { icon: foodIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
          setSelectedPlaceId(null);
          setSelectedTransitStop(null);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 230px;">
            <div style="font-size: 10px; font-family: monospace; color: #C05621; font-weight: bold;">
              🍲 RESTAURANT · ${item.distanceFormatted}
            </div>
            <strong style="font-size: 13px; color: #12161E;">${item.name}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 3px 0 0 0;">${item.cuisine || item.locality}</p>
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });

      if (foodPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(foodPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 4: Transit & Mo Bus
    else if (viewMode === 'transit') {
      const transitPoints: [number, number][] = [];
      displayedTransitStops.forEach((st) => {
        transitPoints.push([st.latitude, st.longitude]);
        const transitIcon = L.divIcon({
          className: 'custom-transit-pin',
          html: `<div style="background-color: #1B5E6B; color: #FFFFFF; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 8px rgba(27,94,107,0.4);">🚌</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([st.latitude, st.longitude], { icon: transitIcon });
        marker.on('click', () => {
          setSelectedTransitStop(st);
          setSelectedPlaceId(null);
          setSelectedEssential(null);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 220px;">
            <div style="font-size: 10px; font-family: monospace; color: #1B5E6B; font-weight: bold;">
              CRUT BUS STOP · ${st.distanceFormatted}
            </div>
            <strong style="font-size: 13px; color: #12161E;">${st.name}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 3px 0 0 0;">${st.routes_serving_stop.map(r => r.route_number).join(', ')}</p>
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });

      if (transitPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(transitPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 5: Medical 24/7
    else if (viewMode === 'medical') {
      const medPoints: [number, number][] = [];
      displayedEssentials.forEach((item) => {
        medPoints.push([item.lat, item.lon]);
        const medIcon = L.divIcon({
          className: 'custom-med-pin',
          html: `<div style="background-color: #9E2A2B; color: #FFFFFF; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 8px rgba(158,42,43,0.4);">${
            item.category === 'hospital' ? '🏥' : '💊'
          }</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([item.lat, item.lon], { icon: medIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
          setSelectedPlaceId(null);
          setSelectedTransitStop(null);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 230px;">
            <div style="font-size: 10px; font-family: monospace; color: #9E2A2B; font-weight: bold;">
              ${item.category === 'hospital' ? '24/7 HOSPITAL' : '24/7 PHARMACY'} · ${item.distanceFormatted}
            </div>
            <strong style="font-size: 13px; color: #12161E;">${item.name}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 3px 0 0 0;">${item.locality}</p>
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });

      if (medPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(medPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 6: ATMs & Cash
    else if (viewMode === 'atm' || viewMode === 'atms') {
      const atmPoints: [number, number][] = [];
      displayedEssentials.forEach((item) => {
        atmPoints.push([item.lat, item.lon]);
        const atmIcon = L.divIcon({
          className: 'custom-atm-pin',
          html: `<div style="background-color: #B87B22; color: #FFFFFF; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 8px rgba(184,123,34,0.4);">🏧</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([item.lat, item.lon], { icon: atmIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
          setSelectedPlaceId(null);
          setSelectedTransitStop(null);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 220px;">
            <div style="font-size: 10px; font-family: monospace; color: #B87B22; font-weight: bold;">
              24/7 ATM · ${item.distanceFormatted}
            </div>
            <strong style="font-size: 13px; color: #12161E;">${item.name}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 3px 0 0 0;">${item.locality}</p>
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });

      if (atmPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(atmPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 7: Petrol & EV Fuel
    else if (viewMode === 'petrol') {
      const fuelPoints: [number, number][] = [];
      displayedEssentials.forEach((item) => {
        fuelPoints.push([item.lat, item.lon]);
        const fuelIcon = L.divIcon({
          className: 'custom-fuel-pin',
          html: `<div style="background-color: #DD6B20; color: #FFFFFF; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 8px rgba(221,107,32,0.4);">⛽</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([item.lat, item.lon], { icon: fuelIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
          setSelectedPlaceId(null);
          setSelectedTransitStop(null);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 230px;">
            <div style="font-size: 10px; font-family: monospace; color: #DD6B20; font-weight: bold;">
              24/7 FUEL STATION · ${item.distanceFormatted}
            </div>
            <strong style="font-size: 13px; color: #12161E;">${item.name}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 3px 0 0 0;">${item.locality}</p>
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });

      if (fuelPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(fuelPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 8: Police & Tourist Safety
    else if (viewMode === 'police') {
      const policePoints: [number, number][] = [];
      displayedEssentials.forEach((item) => {
        policePoints.push([item.lat, item.lon]);
        const policeIcon = L.divIcon({
          className: 'custom-police-pin',
          html: `<div style="background-color: #2B6CB0; color: #FFFFFF; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 8px rgba(43,108,176,0.4);">🛡️</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([item.lat, item.lon], { icon: policeIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
          setSelectedPlaceId(null);
          setSelectedTransitStop(null);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 230px;">
            <div style="font-size: 10px; font-family: monospace; color: #2B6CB0; font-weight: bold;">
              24/7 POLICE & SAFETY · ${item.distanceFormatted}
            </div>
            <strong style="font-size: 13px; color: #12161E;">${item.name}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 3px 0 0 0;">${item.locality}</p>
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });

      if (policePoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(policePoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 9: Experiences
    else if (viewMode === 'experiences') {
      const expPoints: [number, number][] = [];
      ODISHA_EXPERIENCES.forEach((exp) => {
        expPoints.push([exp.lat, exp.lon]);
        const expIcon = L.divIcon({
          className: 'custom-exp-pin',
          html: `<div style="background-color: #6E5A8F; color: #FFFFFF; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 8px rgba(110,90,143,0.4);">✨</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([exp.lat, exp.lon], { icon: expIcon });
        marker.on('click', () => {
          setSelectedExperience(exp);
          setSelectedPlaceId(null);
          setSelectedEssential(null);
          setSelectedTransitStop(null);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 220px;">
            <strong style="font-size: 13px; color: #12161E;">${exp.name}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 3px 0 0 0;">${exp.locality} · ${exp.categoryLabel}</p>
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });

      if (expPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(expPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 10: Saved Places
    else if (viewMode === 'saved') {
      const savedPoints: [number, number][] = [];
      displayedSavedPlaces.forEach((sp) => {
        if (sp.lat != null && sp.lon != null) {
          savedPoints.push([sp.lat, sp.lon]);
          const savedIcon = L.divIcon({
            className: 'custom-saved-pin',
            html: `<div style="background-color: #2F523E; color: #FFFFFF; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 8px rgba(47,82,62,0.4);">❤️</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([sp.lat, sp.lon], { icon: savedIcon });
          marker.on('click', () => {
            setSelectedPlaceId(sp.id);
            setSelectedEssential(null);
            setSelectedTransitStop(null);
            marker.openPopup();
          });

          marker.bindPopup(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 220px;">
              <strong style="font-size: 13px; color: #12161E;">${sp.name}</strong>
              <p style="font-size: 11px; color: #70798B; margin: 3px 0 0 0;">${sp.location || ''} · ${sp.category}</p>
            </div>
          `);

          markersLayerRef.current?.addLayer(marker);
        }
      });

      if (savedPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(savedPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
  }, [viewMode, filterRegion, showAllTransitStops, displayedDestinations, displayedEssentials, displayedTransitStops, displayedSavedPlaces]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#FBF9F5] overflow-hidden">
      {/* 1. Horizontally Scrollable Map Filter Rail */}
      <header className="flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-[#E5DFD5] px-4 py-2.5 z-20">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* Scrollable Filter Rail (Zero overlap, no wrapping) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap py-1 flex-1">
            <button
              onClick={() => {
                setViewMode('destinations');
                setSelectedEssential(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-destinations"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'destinations'
                  ? 'bg-[#12161E] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-[#F3EFE6] border border-[#E5DFD5]'
              }`}
            >
              <span>🏛️ All</span>
            </button>

            <button
              onClick={() => {
                setViewMode('hotels');
                setSelectedPlaceId(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-hotels"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'hotels'
                  ? 'bg-[#8C6239] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-[#F3EFE6] border border-[#E5DFD5]'
              }`}
            >
              <span>🏨 Hotels & Stays</span>
            </button>

            <button
              onClick={() => {
                setViewMode('culinary');
                setSelectedPlaceId(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-culinary"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'culinary'
                  ? 'bg-[#C05621] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-[#F3EFE6] border border-[#E5DFD5]'
              }`}
            >
              <span>🍲 Food</span>
            </button>

            <button
              onClick={() => {
                setViewMode('transit');
                setSelectedPlaceId(null);
                setSelectedEssential(null);
              }}
              data-testid="map-tab-transit"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'transit'
                  ? 'bg-[#1B5E6B] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-[#F3EFE6] border border-[#E5DFD5]'
              }`}
            >
              <span>🚌 Transit</span>
            </button>

            <button
              onClick={() => {
                setViewMode('medical');
                setSelectedPlaceId(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-medical"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'medical'
                  ? 'bg-[#9E2A2B] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-[#F3EFE6] border border-[#E5DFD5]'
              }`}
            >
              <span>🏥 Medical</span>
            </button>

            <button
              onClick={() => {
                setViewMode('atm');
                setSelectedPlaceId(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-atm"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'atm' || viewMode === 'atms'
                  ? 'bg-[#B87B22] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-[#F3EFE6] border border-[#E5DFD5]'
              }`}
            >
              <span>🏧 ATMs</span>
            </button>

            <button
              onClick={() => {
                setViewMode('petrol');
                setSelectedPlaceId(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-petrol"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'petrol'
                  ? 'bg-[#DD6B20] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-[#F3EFE6] border border-[#E5DFD5]'
              }`}
            >
              <span>⛽ Petrol</span>
            </button>

            <button
              onClick={() => {
                setViewMode('police');
                setSelectedPlaceId(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-police"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'police'
                  ? 'bg-[#2B6CB0] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-[#F3EFE6] border border-[#E5DFD5]'
              }`}
            >
              <span>🛡️ Police</span>
            </button>

            <button
              onClick={() => {
                setViewMode('experiences');
                setSelectedPlaceId(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-experiences"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'experiences'
                  ? 'bg-[#6E5A8F] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-[#F3EFE6] border border-[#E5DFD5]'
              }`}
            >
              <span>✨ Experiences</span>
            </button>

            <button
              onClick={() => {
                setViewMode('saved');
                setSelectedPlaceId(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-saved"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'saved'
                  ? 'bg-[#2F523E] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-[#F3EFE6] border border-[#E5DFD5]'
              }`}
            >
              <span>❤️ Saved ({savedPlaces.length})</span>
            </button>
          </div>

          {/* Transit All Stops Toggle */}
          {viewMode === 'transit' && (
            <button
              onClick={() => setShowAllTransitStops(!showAllTransitStops)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold whitespace-nowrap transition cursor-pointer border flex-shrink-0 ${
                showAllTransitStops
                  ? 'bg-[#1B5E6B] text-white border-[#1B5E6B]'
                  : 'bg-white text-[#1B5E6B] border-[#1B5E6B] hover:bg-teal-50'
              }`}
            >
              {showAllTransitStops ? 'Showing All Stops' : 'Show All Stops'}
            </button>
          )}
        </div>
      </header>

      {/* 2. Interactive Map Canvas Container */}
      <main className="relative flex-1 w-full h-full bg-[#E5DFD5]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Selected Destination Rich Infography Card */}
        {selectedPlaceId && (() => {
          const p = places.find((item) => item.id === selectedPlaceId) || displayedDestinations.find((d) => d.id === selectedPlaceId);
          if (!p) return null;
          return (
            <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto z-30 max-w-sm">
              <PlaceInfoCard
                place={{
                  id: p.id,
                  name: p.name,
                  category: typeof p.category === 'string' ? p.category : (p.category as any)?.name || 'Sanctuary',
                  district: p.district,
                  address: p.address,
                  lat: p.lat,
                  lon: p.lon,
                  rating: p.rating,
                  ratingCount: p.rating_count,
                  ratingSource: p.rating_source,
                  openingHours: p.opening_hours_source || undefined,
                  description: p.description,
                  verified: true,
                }}
                onClose={() => setSelectedPlaceId(null)}
                onNavigate={(tab, params) => onNavigate(tab as StitchTab, params)}
                onDrawRoute={(t) => handleDrawRoute({ ...t, address: t.address || undefined })}
              />
            </div>
          );
        })()}

        {/* Selected Essential / Hotel Rich Infography Card */}
        {selectedEssential && (
          <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto z-30 max-w-sm">
            <PlaceInfoCard
              place={{
                id: selectedEssential.id,
                name: selectedEssential.name,
                category: selectedEssential.category,
                district: selectedEssential.district,
                address: selectedEssential.address,
                lat: selectedEssential.lat,
                lon: selectedEssential.lon,
                rating: selectedEssential.rating,
                ratingCount: selectedEssential.ratingCount,
                ratingSource: selectedEssential.ratingSource,
                openingHours: selectedEssential.openingHours,
                is24x7: selectedEssential.is24x7,
                phone: selectedEssential.phone,
                emergencyPhone: selectedEssential.emergencyPhone,
                amenities: selectedEssential.amenities,
                cuisine: selectedEssential.cuisine,
                priceTier: selectedEssential.priceTier,
                dataSource: selectedEssential.dataSource,
                verified: selectedEssential.verified,
              }}
              onClose={() => setSelectedEssential(null)}
              onNavigate={(tab, params) => onNavigate(tab as StitchTab, params)}
              onDrawRoute={(t) => handleDrawRoute({ ...t, address: t.address || undefined })}
            />
          </div>
        )}

        {/* Selected Transit Stop Details Panel */}
        {selectedTransitStop && (
          <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto z-30 max-w-sm">
            <TransitStopDetailPanel
              stop={selectedTransitStop}
              onClose={() => setSelectedTransitStop(null)}
              onOpenTimetable={(routeNo) => setActiveTimetableRoute(routeNo)}
              onDrawRouteToStop={(st) =>
                handleDrawRoute({
                  lat: st.latitude,
                  lon: st.longitude,
                  name: st.name,
                  category: 'Transit Stop',
                  address: `${st.locality}, ${st.city}`,
                })
              }
            />
          </div>
        )}

        {/* Floating Route Guidance HUD */}
        {activeRouteTarget && (
          <div
            data-testid="directions-hud-overlay"
            className="absolute top-4 left-4 right-4 sm:left-6 sm:right-auto z-30 max-w-sm bg-white/95 backdrop-blur-md rounded-2xl border border-[#E5DFD5] p-4 shadow-xl font-body text-[#12161E] animate-in slide-in-from-top duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#B87B22]">
                  Live Route Guidance
                </span>
                <h4 className="font-display font-bold text-sm text-[#12161E] truncate max-w-[220px]">
                  {activeRouteTarget.name}
                </h4>
              </div>
              <button
                onClick={handleClearRoute}
                className="text-[#70798B] hover:text-[#12161E] text-xs font-semibold px-2 py-1 bg-[#FAF7F2] rounded-lg border border-[#E5DFD5] cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#FAF7F2] p-2 rounded-xl border border-[#E5DFD5] text-center font-mono text-xs mb-3">
              <div>
                <span className="text-[10px] text-[#70798B] block">Distance</span>
                <strong className="text-[#B87B22]">{activeRouteTarget.distanceFormatted}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#70798B] block">🚗 Drive</span>
                <strong>~{formatDuration(activeRouteTarget.drivingMins)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#70798B] block">🚶 Walk</span>
                <strong>~{formatDuration(activeRouteTarget.walkingMins)}</strong>
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${refLat},${refLon}&destination=${activeRouteTarget.lat},${activeRouteTarget.lon}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 bg-[#B87B22] text-white rounded-lg text-xs font-semibold hover:bg-[#966319] transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">navigation</span>
              <span>Open in Google Maps</span>
            </a>
          </div>
        )}

        {/* Accessible SSR Items Representation */}
        <div className="sr-only" data-testid="active-mode-items" aria-hidden="true">
          {displayedEssentials.map((e) => (
            <div key={e.id}>{e.name} - {e.category} - {e.locality}</div>
          ))}
          {displayedDestinations.map((d) => (
            <div key={d.id}>{d.name}</div>
          ))}
        </div>
      </main>

      {/* Transit Timetable Modal */}
      <TransitTimetableModal
        routeNumber={activeTimetableRoute}
        onClose={() => setActiveTimetableRoute(null)}
      />
    </div>
  );
};
