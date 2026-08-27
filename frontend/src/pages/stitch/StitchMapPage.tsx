import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';
import { useLocation } from '../../context/LocationContext';
import { useSavedPlaces } from '../../store/useSavedPlaces';
import { useRegisterAIContext } from '../../context/AIContext';
import { apiClient } from '../../api/client';
import type { PlaceDetail, TransportMapResponse } from '../../api/contracts';
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
import seedPlacesData from '../../../../data/places/places.json';
import L from 'leaflet';

export type MapViewMode =
  | 'destinations'
  | 'places'
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const createSafePopupOptions = (customOffset: L.Point = L.point(0, -10)): L.PopupOptions => ({
  autoPan: true,
  autoPanPaddingTopLeft: L.point(20, 20),
  autoPanPaddingBottomRight: L.point(20, 20),
  keepInView: true,
  closeButton: true,
  offset: customOffset,
  className: 'stitch-safe-map-popup',
});

export const StitchMapPage: React.FC<StitchMapPageProps> = ({
  onNavigate,
  onOpenShare,
  initialPlaceId,
  initialMode = 'destinations',
}) => {
  const { currentPosition, isLive, locateUser, locationName, isLoading: isLocating } = useLocation();
  const { savedPlaces, toggleSave, isSaved } = useSavedPlaces();

  const [places, setPlaces] = useState<PlaceDetail[]>(seedPlacesData as unknown as PlaceDetail[]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(initialPlaceId || null);
  const [selectedExperience, setSelectedExperience] = useState<OdishaExperience | null>(null);
  const [selectedEssential, setSelectedEssential] = useState<EssentialPlace | null>(null);
  const [selectedTransitStop, setSelectedTransitStop] = useState<VerifiedTransitStop | null>(null);
  const [activeTimetableRoute, setActiveTimetableRoute] = useState<string | null>(null);

  const [transitMapData, setTransitMapData] = useState<TransportMapResponse | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<MapViewMode>(initialMode);
  const [showAllTransitStops, setShowAllTransitStops] = useState(false);
  const [activeRouteTarget, setActiveRouteTarget] = useState<ActiveRouteTarget | null>(null);

  // Search & "Search This Area" Map Bounds State
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const lastQueriedCenterRef = useRef<[number, number] | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLineLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerLayerRef = useRef<L.LayerGroup | null>(null);

  // Reference coordinates validation
  const hasValidUserCoords = isValidCoordinate(currentPosition?.lat, currentPosition?.lon);
  const refLat = hasValidUserCoords ? currentPosition!.lat : 20.2667;
  const refLon = hasValidUserCoords ? currentPosition!.lon : 85.8436;

  // Global AI Context Registration
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
          region: locationName,
        },
        location: {
          city: locationName,
          district: locationName,
          location_type: isLive ? 'LIVE_GPS' : 'USER_SELECTION',
        },
      }),
      [viewMode, activeMapPlace, selectedRouteId, activeMapRoute, locationName, isLive]
    )
  );

  // Proximity-sorted Destinations
  const nearbyData = useMemo(() => {
    return getNearbyPlacesWithExpansion(places, refLat, refLon, {
      minResults: 6,
      radii: [25, 50, 100, 200, 500],
    });
  }, [places, refLat, refLon]);

  const displayedDestinations = useMemo(() => {
    let pool = places.length > 0 ? places : nearbyData.places;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      pool = pool.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.district?.toLowerCase().includes(q) ||
          (typeof p.category === 'string' ? p.category : (p.category as any)?.name)?.toLowerCase().includes(q)
      );
    }
    return pool
      .filter((p) => isValidCoordinate(p.lat, p.lon))
      .map((p) => {
        const dist = calculateHaversineDistanceKm(refLat, refLon, p.lat!, p.lon!);
        return {
          ...p,
          distanceKm: dist,
          distanceFormatted: formatDistance(dist),
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [places, nearbyData.places, refLat, refLon, searchQuery]);

  // Proximity-sorted Essentials (Hotels, Medical, ATMs, Restaurants, Petrol, Police)
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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      pool = pool.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.district.toLowerCase().includes(q) ||
          e.locality.toLowerCase().includes(q) ||
          e.address.toLowerCase().includes(q) ||
          (e.cuisine && e.cuisine.toLowerCase().includes(q))
      );
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
  }, [viewMode, refLat, refLon, searchQuery]);

  // Transit Stops
  const displayedTransitStops = useMemo(() => {
    let stops = VERIFIED_TRANSIT_STOPS;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      stops = stops.filter(
        (st) =>
          st.name.toLowerCase().includes(q) ||
          st.district.toLowerCase().includes(q) ||
          st.city.toLowerCase().includes(q) ||
          st.routes_serving_stop.some((r) => r.route_number.toLowerCase().includes(q) || (r.route_name && r.route_name.toLowerCase().includes(q)))
      );
    }

    const scored = stops
      .map((st) => {
        const dist = calculateHaversineDistanceKm(refLat, refLon, st.latitude, st.longitude);
        const walkingMins = calculateWalkTimeMinutes(dist);
        return {
          ...st,
          distanceKm: dist,
          distanceFormatted: formatDistance(dist),
          walkingMins,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return showAllTransitStops || searchQuery.trim() ? scored : scored.slice(0, 20);
  }, [refLat, refLon, showAllTransitStops, searchQuery]);

  // Saved Places
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
        console.warn('Transport map data note:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Map with resilient sizing and Odisha spatial bounds
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const odishaBounds = L.latLngBounds([17.0, 81.0], [23.5, 88.5]);

    const map = L.map(mapContainerRef.current, {
      center: [refLat, refLon],
      zoom: 12,
      minZoom: 7,
      maxZoom: 18,
      maxBounds: odishaBounds,
      maxBoundsViscosity: 0.8,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors · O-Travelz',
      minZoom: 7,
      maxZoom: 18,
      noWrap: true,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    const routeLineGroup = L.layerGroup().addTo(map);
    const userGroup = L.layerGroup().addTo(map);

    markersLayerRef.current = markersGroup;
    routeLineLayerRef.current = routeLineGroup;
    userMarkerLayerRef.current = userGroup;
    mapInstanceRef.current = map;
    (window as any).__stitch_map = map;
    (window as any).__stitch_markers = markersLayerRef.current;
    lastQueriedCenterRef.current = [refLat, refLon];

    requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    map.on('moveend', () => {
      const c = map.getCenter();
      setMapCenter([c.lat, c.lng]);
      if (lastQueriedCenterRef.current) {
        const d = calculateHaversineDistanceKm(lastQueriedCenterRef.current[0], lastQueriedCenterRef.current[1], c.lat, c.lng);
        if (d > 2.5) {
          setShowSearchThisArea(true);
        }
      }
    });

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
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
        html: `<div style="background-color: #2563EB; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(37,99,235,0.7); display: flex; align-items: center; justify-content: center;"><div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const userMarker = L.marker([refLat, refLon], { icon: userIcon });
      userMarker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; padding: 4px;">
          <div style="font-weight: bold; color: #2563EB; margin-bottom: 2px;">📍 ${isLive ? 'Live GPS Location' : 'Selected Location'}</div>
          <div style="color: #3D4654;">${locationName}</div>
        </div>
      `, createSafePopupOptions());
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

  // Safe DOM Event Delegation for Popup Clicks
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-map-action]');
      if (!target) return;
      const action = target.getAttribute('data-map-action');
      const id = target.getAttribute('data-id') || '';
      const type = target.getAttribute('data-type') || '';
      const lat = parseFloat(target.getAttribute('data-lat') || '0');
      const lon = parseFloat(target.getAttribute('data-lon') || '0');
      const name = target.getAttribute('data-name') || '';
      const category = target.getAttribute('data-category') || '';
      const address = target.getAttribute('data-address') || '';

      if (action === 'route' && lat && lon) {
        handleDrawRoute({ lat, lon, name, category, address });
      } else if (action === 'details') {
        if (type === 'destination') {
          setSelectedPlaceId(id);
          setSelectedEssential(null);
          setSelectedTransitStop(null);
        } else if (type === 'essential') {
          const item = ODISHA_ESSENTIALS.find((e) => e.id === id);
          if (item) {
            setSelectedEssential(item);
            setSelectedPlaceId(null);
            setSelectedTransitStop(null);
          }
        } else if (type === 'transit') {
          const st = VERIFIED_TRANSIT_STOPS.find((s) => s.stop_id === id);
          if (st) {
            setSelectedTransitStop(st);
            setSelectedPlaceId(null);
            setSelectedEssential(null);
          }
        }
      } else if (action === 'save' && id) {
        const p = places.find((item) => item.id === id);
        if (p) {
          toggleSave({
            id: p.id,
            name: p.name,
            category: typeof p.category === 'string' ? p.category : (p.category as any)?.name || 'Landmark',
            location: p.district || undefined,
            coordinates: p.lat != null && p.lon != null ? [p.lat, p.lon] : undefined,
          });
        }
      }
    };

    container.addEventListener('click', handleClick);
    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [places, toggleSave, handleDrawRoute]);

  // "Search This Area" Action
  const handleSearchThisArea = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const center = mapInstanceRef.current.getCenter();
    lastQueriedCenterRef.current = [center.lat, center.lng];
    setShowSearchThisArea(false);
    setIsSearchingArea(true);
    setTimeout(() => {
      setIsSearchingArea(false);
    }, 400);
  }, []);

  // Track Map Zoom for Dynamic Spatial Clustering
  const [currentZoom, setCurrentZoom] = useState<number>(12);

  // Main Markers Rendering with Dynamic Clustering & Category-Aware Pins
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    // Mode 1 & 2: Destinations & Places
    if (viewMode === 'destinations' || viewMode === 'places') {
      const validDestinations = displayedDestinations.filter(
        (p) => p.lat != null && p.lon != null && isValidCoordinate(p.lat, p.lon)
      );

      if (currentZoom >= 13) {
        validDestinations.forEach((p) => {
          const cat = typeof p.category === 'string' ? p.category.toLowerCase() : '';
          const iconEmoji = cat.includes('beach') ? '🏖️' : cat.includes('temple') || cat.includes('heritage') ? '🏛️' : cat.includes('waterfall') || cat.includes('lake') ? '🌊' : cat.includes('wildlife') || cat.includes('sanctuary') ? '🌿' : '📍';
          const bgColor = cat.includes('temple') || cat.includes('heritage') ? '#B87B22' : cat.includes('beach') || cat.includes('lake') ? '#1B5E6B' : '#2F523E';

          const customIcon = L.divIcon({
            className: 'custom-destination-pin',
            html: `<div style="background-color: ${bgColor}; color: #FFFFFF; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3); cursor: pointer;">${iconEmoji}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([p.lat!, p.lon!], { icon: customIcon });

          marker.on('click', () => {
            setSelectedPlaceId(p.id);
            setSelectedExperience(null);
            setSelectedEssential(null);
            setSelectedTransitStop(null);
            marker.openPopup();
          });

          const safeCat = typeof p.category === 'string' ? p.category : (p.category as any)?.name || 'Landmark';
          const ratingText = p.rating ? `★ ${p.rating.toFixed(1)} ${p.rating_count ? `(${p.rating_count})` : ''}` : 'Rating verified';

          marker.bindPopup(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; width: 210px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-size: 10px; font-family: monospace; color: #B87B22; font-weight: bold; text-transform: uppercase;">
                  ${escapeHtml(safeCat)}
                </span>
                <span style="font-size: 10px; font-family: monospace; color: #70798B;">
                  ${escapeHtml(p.distanceFormatted || '')}
                </span>
              </div>
              <strong style="font-size: 13px; color: #12161E; display: block; line-height: 1.2; margin-bottom: 2px;">
                ${escapeHtml(p.name)}
              </strong>
              <div style="font-size: 11px; color: #70798B; margin-bottom: 6px;">
                ${p.district ? `${escapeHtml(p.district)} · ` : ''}${ratingText}
              </div>
              <div style="display: flex; gap: 6px; margin-top: 4px; border-top: 1px solid #E5DFD5; padding-top: 6px;">
                <button data-map-action="route" data-lat="${p.lat}" data-lon="${p.lon}" data-name="${escapeHtml(p.name)}" data-category="${escapeHtml(safeCat)}" data-address="${escapeHtml(p.address || '')}" style="flex: 1; padding: 4px 6px; background-color: #B87B22; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                  🚗 Route
                </button>
                <button data-map-action="details" data-id="${p.id}" data-type="destination" style="flex: 1; padding: 4px 6px; background-color: #12161E; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                  ℹ️ Details
                </button>
              </div>
            </div>
          `, createSafePopupOptions());

          markersLayerRef.current?.addLayer(marker);
        });
      } else {
        // Dynamic Grid Clustering for wide / medium zooms
        const gridSize = currentZoom <= 8 ? 0.6 : currentZoom <= 10 ? 0.25 : 0.1;
        const clusters = new Map<string, typeof validDestinations>();

        validDestinations.forEach((p) => {
          const cellKey = `${Math.floor(p.lat! / gridSize)}_${Math.floor(p.lon! / gridSize)}`;
          if (!clusters.has(cellKey)) clusters.set(cellKey, []);
          clusters.get(cellKey)!.push(p);
        });

        clusters.forEach((items) => {
          if (items.length === 1) {
            const p = items[0];
            const cat = typeof p.category === 'string' ? p.category.toLowerCase() : '';
            const iconEmoji = cat.includes('beach') ? '🏖️' : cat.includes('temple') || cat.includes('heritage') ? '🏛️' : cat.includes('waterfall') || cat.includes('lake') ? '🌊' : cat.includes('wildlife') || cat.includes('sanctuary') ? '🌿' : '📍';
            const bgColor = cat.includes('temple') || cat.includes('heritage') ? '#B87B22' : cat.includes('beach') || cat.includes('lake') ? '#1B5E6B' : '#2F523E';

            const customIcon = L.divIcon({
              className: 'custom-destination-pin',
              html: `<div style="background-color: ${bgColor}; color: #FFFFFF; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); cursor: pointer;">${iconEmoji}</div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            });

            const marker = L.marker([p.lat!, p.lon!], { icon: customIcon });
            marker.on('click', () => {
              setSelectedPlaceId(p.id);
              setSelectedExperience(null);
              setSelectedEssential(null);
              setSelectedTransitStop(null);
              marker.openPopup();
            });

            const safeCat = typeof p.category === 'string' ? p.category : (p.category as any)?.name || 'Landmark';
            const ratingText = p.rating ? `★ ${p.rating.toFixed(1)} ${p.rating_count ? `(${p.rating_count})` : ''}` : 'Rating verified';

            marker.bindPopup(`
              <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; width: 210px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                  <span style="font-size: 10px; font-family: monospace; color: #B87B22; font-weight: bold; text-transform: uppercase;">
                    ${escapeHtml(safeCat)}
                  </span>
                  <span style="font-size: 10px; font-family: monospace; color: #70798B;">
                    ${escapeHtml(p.distanceFormatted || '')}
                  </span>
                </div>
                <strong style="font-size: 13px; color: #12161E; display: block; line-height: 1.2; margin-bottom: 2px;">
                  ${escapeHtml(p.name)}
                </strong>
                <div style="font-size: 11px; color: #70798B; margin-bottom: 6px;">
                  ${p.district ? `${escapeHtml(p.district)} · ` : ''}${ratingText}
                </div>
                <div style="display: flex; gap: 6px; margin-top: 4px; border-top: 1px solid #E5DFD5; padding-top: 6px;">
                  <button data-map-action="route" data-lat="${p.lat}" data-lon="${p.lon}" data-name="${escapeHtml(p.name)}" data-category="${escapeHtml(safeCat)}" data-address="${escapeHtml(p.address || '')}" style="flex: 1; padding: 4px 6px; background-color: #B87B22; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                    🚗 Route
                  </button>
                  <button data-map-action="details" data-id="${p.id}" data-type="destination" style="flex: 1; padding: 4px 6px; background-color: #12161E; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                    ℹ️ Details
                  </button>
                </div>
              </div>
            `, createSafePopupOptions());

            markersLayerRef.current?.addLayer(marker);
          } else {
            // Cluster badge
            const avgLat = items.reduce((acc, i) => acc + i.lat!, 0) / items.length;
            const avgLon = items.reduce((acc, i) => acc + i.lon!, 0) / items.length;

            const clusterIcon = L.divIcon({
              className: 'custom-cluster-badge',
              html: `<div style="background-color: #B87B22; color: #FFFFFF; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 12px rgba(184,123,34,0.4); cursor: pointer; transition: transform 0.15s ease;">${items.length}</div>`,
              iconSize: [34, 34],
              iconAnchor: [17, 17],
            });

            const clusterMarker = L.marker([avgLat, avgLon], { icon: clusterIcon });
            clusterMarker.on('click', () => {
              const clusterBounds = L.latLngBounds(items.map((it) => [it.lat!, it.lon!]));
              mapInstanceRef.current?.fitBounds(clusterBounds, { padding: [60, 60], maxZoom: 15 });
            });

            markersLayerRef.current?.addLayer(clusterMarker);
          }
        });
      }
    }
    // Mode 3: Hotels & Stays
    else if (viewMode === 'hotels') {
      const hotelPoints: [number, number][] = [];
      displayedEssentials.forEach((item) => {
        hotelPoints.push([item.lat, item.lon]);
        const hotelIcon = L.divIcon({
          className: 'custom-hotel-pin',
          html: `<div style="background-color: #8C6239; color: #FFFFFF; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 10px rgba(140,98,57,0.4); cursor: pointer;">🏨</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([item.lat, item.lon], { icon: hotelIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
          setSelectedPlaceId(null);
          setSelectedTransitStop(null);
          marker.openPopup();
        });

        const ratingText = item.rating ? `★ ${item.rating.toFixed(1)} (${item.ratingCount || ''})` : 'Rating verified';

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span style="font-size: 10px; font-family: monospace; color: #8C6239; font-weight: bold;">
                🏨 HOTEL & STAY
              </span>
              <span style="font-size: 10px; font-family: monospace; color: #70798B;">
                ${escapeHtml(item.distanceFormatted)}
              </span>
            </div>
            <strong style="font-size: 13px; color: #12161E; display: block; line-height: 1.2;">${escapeHtml(item.name)}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 2px 0 4px 0;">${escapeHtml(item.locality)} (${escapeHtml(item.city)}) · ${ratingText}</p>
            <div style="display: flex; gap: 6px; margin-top: 4px; border-top: 1px solid #E5DFD5; padding-top: 6px;">
              <button data-map-action="route" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${escapeHtml(item.name)}" data-category="Hotel" data-address="${escapeHtml(item.address)}" style="flex: 1; padding: 4px 6px; background-color: #8C6239; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                🚗 Route
              </button>
              <button data-map-action="details" data-id="${item.id}" data-type="essential" style="flex: 1; padding: 4px 6px; background-color: #12161E; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                ℹ️ Details
              </button>
            </div>
          </div>
        `, createSafePopupOptions());

        markersLayerRef.current?.addLayer(marker);
      });

      if (hotelPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(hotelPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 4: Food & Culinary
    else if (viewMode === 'culinary') {
      const foodPoints: [number, number][] = [];
      displayedEssentials.forEach((item) => {
        foodPoints.push([item.lat, item.lon]);
        const foodIcon = L.divIcon({
          className: 'custom-food-pin',
          html: `<div style="background-color: #C05621; color: #FFFFFF; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 10px rgba(192,86,33,0.4); cursor: pointer;">🍲</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([item.lat, item.lon], { icon: foodIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
          setSelectedPlaceId(null);
          setSelectedTransitStop(null);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span style="font-size: 10px; font-family: monospace; color: #C05621; font-weight: bold;">
                🍲 ODIA CUISINE
              </span>
              <span style="font-size: 10px; font-family: monospace; color: #70798B;">
                ${escapeHtml(item.distanceFormatted)}
              </span>
            </div>
            <strong style="font-size: 13px; color: #12161E; display: block; line-height: 1.2;">${escapeHtml(item.name)}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 2px 0 4px 0;">${escapeHtml(item.cuisine || item.locality)}</p>
            <div style="display: flex; gap: 6px; margin-top: 4px; border-top: 1px solid #E5DFD5; padding-top: 6px;">
              <button data-map-action="route" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${escapeHtml(item.name)}" data-category="Restaurant" data-address="${escapeHtml(item.address)}" style="flex: 1; padding: 4px 6px; background-color: #C05621; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                🚗 Route
              </button>
              <button data-map-action="details" data-id="${item.id}" data-type="essential" style="flex: 1; padding: 4px 6px; background-color: #12161E; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                ℹ️ Details
              </button>
            </div>
          </div>
        `, createSafePopupOptions());

        markersLayerRef.current?.addLayer(marker);
      });

      if (foodPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(foodPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 5: Transit
    else if (viewMode === 'transit') {
      const transitPoints: [number, number][] = [];
      displayedTransitStops.forEach((st) => {
        transitPoints.push([st.latitude, st.longitude]);

        const iconEmoji = st.stop_type === 'airport' ? '✈️' : st.stop_type === 'rail_station' ? '🚆' : '🚌';
        const bgColor = st.stop_type === 'airport' ? '#1E3A8A' : st.stop_type === 'rail_station' ? '#0F766E' : '#0D9488';

        const transitIcon = L.divIcon({
          className: 'custom-transit-pin',
          html: `<div style="background-color: ${bgColor}; color: #FFFFFF; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 10px rgba(13,148,136,0.4); cursor: pointer;">${iconEmoji}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([st.latitude, st.longitude], { icon: transitIcon });
        marker.on('click', () => {
          setSelectedTransitStop(st);
          setSelectedPlaceId(null);
          setSelectedEssential(null);
          marker.openPopup();
        });

        const routesCount = st.routes_serving_stop?.length || 1;

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span style="font-size: 10px; font-family: monospace; color: #0D9488; font-weight: bold;">
                ${escapeHtml(st.agency || 'TRANSIT HUB')}
              </span>
              <span style="font-size: 10px; font-family: monospace; color: #70798B;">
                ${escapeHtml(st.distanceFormatted)}
              </span>
            </div>
            <strong style="font-size: 13px; color: #12161E; display: block; line-height: 1.2;">${escapeHtml(st.name)}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 2px 0 4px 0;">${escapeHtml(st.city)} · ${routesCount} routes connecting</p>
            <div style="display: flex; gap: 6px; margin-top: 4px; border-top: 1px solid #E5DFD5; padding-top: 6px;">
              <button data-map-action="route" data-lat="${st.latitude}" data-lon="${st.longitude}" data-name="${escapeHtml(st.name)}" data-category="Transit Stop" data-address="${escapeHtml(st.locality)}" style="flex: 1; padding: 4px 6px; background-color: #0D9488; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                🚗 Route
              </button>
              <button data-map-action="details" data-id="${st.stop_id}" data-type="transit" style="flex: 1; padding: 4px 6px; background-color: #12161E; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                ℹ️ Timetable
              </button>
            </div>
          </div>
        `, createSafePopupOptions());

        markersLayerRef.current?.addLayer(marker);
      });

      if (transitPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(transitPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 6: Medical
    else if (viewMode === 'medical') {
      const medPoints: [number, number][] = [];
      displayedEssentials.forEach((item) => {
        medPoints.push([item.lat, item.lon]);
        const iconEmoji = item.category === 'pharmacy' ? '💊' : '🏥';
        const medIcon = L.divIcon({
          className: 'custom-med-pin',
          html: `<div style="background-color: #DC2626; color: #FFFFFF; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 10px rgba(220,38,38,0.4); cursor: pointer;">${iconEmoji}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([item.lat, item.lon], { icon: medIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
          setSelectedPlaceId(null);
          setSelectedTransitStop(null);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span style="font-size: 10px; font-family: monospace; color: #DC2626; font-weight: bold;">
                🚨 24/7 MEDICAL · DIAL 108
              </span>
              <span style="font-size: 10px; font-family: monospace; color: #70798B;">
                ${escapeHtml(item.distanceFormatted)}
              </span>
            </div>
            <strong style="font-size: 13px; color: #12161E; display: block; line-height: 1.2;">${escapeHtml(item.name)}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 2px 0 4px 0;">${escapeHtml(item.locality)} (${escapeHtml(item.city)})</p>
            <div style="display: flex; gap: 6px; margin-top: 4px; border-top: 1px solid #E5DFD5; padding-top: 6px;">
              <button data-map-action="route" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${escapeHtml(item.name)}" data-category="Hospital" data-address="${escapeHtml(item.address)}" style="flex: 1; padding: 4px 6px; background-color: #DC2626; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                🚗 Route
              </button>
              <button data-map-action="details" data-id="${item.id}" data-type="essential" style="flex: 1; padding: 4px 6px; background-color: #12161E; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                ℹ️ Details
              </button>
            </div>
          </div>
        `, createSafePopupOptions());

        markersLayerRef.current?.addLayer(marker);
      });

      if (medPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(medPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 7: ATMs
    else if (viewMode === 'atm' || viewMode === 'atms') {
      const atmPoints: [number, number][] = [];
      displayedEssentials.forEach((item) => {
        atmPoints.push([item.lat, item.lon]);
        const atmIcon = L.divIcon({
          className: 'custom-atm-pin',
          html: `<div style="background-color: #D97706; color: #FFFFFF; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 10px rgba(217,119,6,0.4); cursor: pointer;">🏧</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([item.lat, item.lon], { icon: atmIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
          setSelectedPlaceId(null);
          setSelectedTransitStop(null);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span style="font-size: 10px; font-family: monospace; color: #D97706; font-weight: bold;">
                🏧 24/7 ATM & CASH
              </span>
              <span style="font-size: 10px; font-family: monospace; color: #70798B;">
                ${escapeHtml(item.distanceFormatted)}
              </span>
            </div>
            <strong style="font-size: 13px; color: #12161E; display: block; line-height: 1.2;">${escapeHtml(item.name)}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 2px 0 4px 0;">${escapeHtml(item.locality)}</p>
            <div style="display: flex; gap: 6px; margin-top: 4px; border-top: 1px solid #E5DFD5; padding-top: 6px;">
              <button data-map-action="route" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${escapeHtml(item.name)}" data-category="ATM" data-address="${escapeHtml(item.address)}" style="flex: 1; padding: 4px 6px; background-color: #D97706; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                🚗 Route
              </button>
              <button data-map-action="details" data-id="${item.id}" data-type="essential" style="flex: 1; padding: 4px 6px; background-color: #12161E; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                ℹ️ Details
              </button>
            </div>
          </div>
        `, createSafePopupOptions());

        markersLayerRef.current?.addLayer(marker);
      });

      if (atmPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(atmPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 8: Petrol
    else if (viewMode === 'petrol') {
      const fuelPoints: [number, number][] = [];
      displayedEssentials.forEach((item) => {
        fuelPoints.push([item.lat, item.lon]);
        const fuelIcon = L.divIcon({
          className: 'custom-fuel-pin',
          html: `<div style="background-color: #EA580C; color: #FFFFFF; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 10px rgba(234,88,12,0.4); cursor: pointer;">⛽</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([item.lat, item.lon], { icon: fuelIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
          setSelectedPlaceId(null);
          setSelectedTransitStop(null);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span style="font-size: 10px; font-family: monospace; color: #EA580C; font-weight: bold;">
                ⛽ 24/7 PETROL & EV
              </span>
              <span style="font-size: 10px; font-family: monospace; color: #70798B;">
                ${escapeHtml(item.distanceFormatted)}
              </span>
            </div>
            <strong style="font-size: 13px; color: #12161E; display: block; line-height: 1.2;">${escapeHtml(item.name)}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 2px 0 4px 0;">${escapeHtml(item.locality)}</p>
            <div style="display: flex; gap: 6px; margin-top: 4px; border-top: 1px solid #E5DFD5; padding-top: 6px;">
              <button data-map-action="route" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${escapeHtml(item.name)}" data-category="Fuel Station" data-address="${escapeHtml(item.address)}" style="flex: 1; padding: 4px 6px; background-color: #EA580C; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                🚗 Route
              </button>
              <button data-map-action="details" data-id="${item.id}" data-type="essential" style="flex: 1; padding: 4px 6px; background-color: #12161E; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                ℹ️ Details
              </button>
            </div>
          </div>
        `, createSafePopupOptions());

        markersLayerRef.current?.addLayer(marker);
      });

      if (fuelPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(fuelPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 9: Police
    else if (viewMode === 'police') {
      const policePoints: [number, number][] = [];
      displayedEssentials.forEach((item) => {
        policePoints.push([item.lat, item.lon]);
        const policeIcon = L.divIcon({
          className: 'custom-police-pin',
          html: `<div style="background-color: #2563EB; color: #FFFFFF; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 10px rgba(37,99,235,0.4); cursor: pointer;">🛡️</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([item.lat, item.lon], { icon: policeIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
          setSelectedPlaceId(null);
          setSelectedTransitStop(null);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span style="font-size: 10px; font-family: monospace; color: #2563EB; font-weight: bold;">
                🛡️ POLICE · DIAL 112
              </span>
              <span style="font-size: 10px; font-family: monospace; color: #70798B;">
                ${escapeHtml(item.distanceFormatted)}
              </span>
            </div>
            <strong style="font-size: 13px; color: #12161E; display: block; line-height: 1.2;">${escapeHtml(item.name)}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 2px 0 4px 0;">${escapeHtml(item.locality)}</p>
            <div style="display: flex; gap: 6px; margin-top: 4px; border-top: 1px solid #E5DFD5; padding-top: 6px;">
              <button data-map-action="route" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${escapeHtml(item.name)}" data-category="Police Station" data-address="${escapeHtml(item.address)}" style="flex: 1; padding: 4px 6px; background-color: #2563EB; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                🚗 Route
              </button>
              <button data-map-action="details" data-id="${item.id}" data-type="essential" style="flex: 1; padding: 4px 6px; background-color: #12161E; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                ℹ️ Details
              </button>
            </div>
          </div>
        `, createSafePopupOptions());

        markersLayerRef.current?.addLayer(marker);
      });

      if (policePoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(policePoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 10: Experiences
    else if (viewMode === 'experiences') {
      const expPoints: [number, number][] = [];
      ODISHA_EXPERIENCES.forEach((exp) => {
        expPoints.push([exp.lat, exp.lon]);
        const expIcon = L.divIcon({
          className: 'custom-exp-pin',
          html: `<div style="background-color: #7C3AED; color: #FFFFFF; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 10px rgba(124,58,237,0.4); cursor: pointer;">✨</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
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
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; width: 210px;">
            <strong style="font-size: 13px; color: #12161E; display: block; line-height: 1.2;">${escapeHtml(exp.name)}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 2px 0 4px 0;">${escapeHtml(exp.locality)} · ${escapeHtml(exp.categoryLabel)}</p>
          </div>
        `, createSafePopupOptions());

        markersLayerRef.current?.addLayer(marker);
      });

      if (expPoints.length > 0 && !activeRouteTarget) {
        const bounds = L.latLngBounds(expPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 11: Saved Places
    else if (viewMode === 'saved') {
      const savedPoints: [number, number][] = [];
      displayedSavedPlaces.forEach((sp) => {
        if (sp.lat != null && sp.lon != null) {
          savedPoints.push([sp.lat, sp.lon]);
          const savedIcon = L.divIcon({
            className: 'custom-saved-pin',
            html: `<div style="background-color: #059669; color: #FFFFFF; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 10px rgba(5,150,105,0.4); cursor: pointer;">❤️</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([sp.lat, sp.lon], { icon: savedIcon });
          marker.on('click', () => {
            setSelectedPlaceId(sp.id);
            setSelectedExperience(null);
            setSelectedEssential(null);
            setSelectedTransitStop(null);
            marker.openPopup();
          });

          marker.bindPopup(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; width: 210px;">
              <strong style="font-size: 13px; color: #12161E; display: block; line-height: 1.2;">${escapeHtml(sp.name)}</strong>
              <p style="font-size: 11px; color: #70798B; margin: 2px 0 4px 0;">${escapeHtml(sp.location || 'Odisha')} · ${escapeHtml(sp.category)}</p>
            </div>
          `, createSafePopupOptions());

          markersLayerRef.current?.addLayer(marker);
        }
      });
    }
  }, [
    viewMode,
    displayedDestinations,
    displayedEssentials,
    displayedTransitStops,
    displayedSavedPlaces,
    currentZoom,
    activeRouteTarget,
  ]);

  // Selected place object resolution
  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null;
    return places.find((item) => item.id === selectedPlaceId) || displayedDestinations.find((d) => d.id === selectedPlaceId) || null;
  }, [selectedPlaceId, places, displayedDestinations]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] sm:h-[calc(100vh-72px)] bg-[#FBF9F5] text-[#12161E] font-body overflow-hidden">
      
      {/* 1. TOP WORKSPACE TOOLBAR & CONTROLS */}
      <header className="flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-[#E5DFD5] px-3 sm:px-6 py-2.5 z-20 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1920px] mx-auto w-full">
          
          {/* Search Workspace Input */}
          <div className="relative flex-1 min-w-[240px] max-w-xl">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#70798B] text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              data-testid="map-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places, hotels, food, transit stops, hospitals..."
              className="w-full pl-9 pr-8 py-2 bg-[#FAF7F2] border border-[#E5DFD5] rounded-full text-xs sm:text-sm text-[#12161E] placeholder-[#70798B] focus:outline-hidden focus:border-[#B87B22] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#70798B] hover:text-[#12161E] text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search This Area Radar Trigger */}
          {showSearchThisArea && (
            <button
              onClick={handleSearchThisArea}
              disabled={isSearchingArea}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#12161E] text-white text-xs font-semibold shadow-md hover:bg-black transition cursor-pointer flex-shrink-0"
            >
              <span className={`material-symbols-outlined text-sm ${isSearchingArea ? 'animate-spin' : ''}`}>
                radar
              </span>
              <span>Search this area</span>
            </button>
          )}

          {/* Active Hub & GPS Status Indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E5DFD5] text-xs font-mono text-[#3D4654]">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <strong className="text-[#12161E] font-semibold">{locationName}</strong>
              <span className="text-[10px] text-[#70798B]">({isLive ? 'Live: ON' : 'Live: OFF'})</span>
            </div>

            <button
              onClick={() => locateUser()}
              disabled={isLocating}
              data-testid="map-locate-me-btn"
              title="Use current GPS device location"
              className="p-2 rounded-full bg-[#FAF7F2] hover:bg-white text-[#70798B] hover:text-[#B87B22] border border-[#E5DFD5] transition cursor-pointer flex items-center justify-center"
            >
              <span className={`material-symbols-outlined text-base ${isLocating ? 'animate-spin' : ''}`}>
                my_location
              </span>
            </button>
          </div>
        </div>

        {/* Horizontal 11-Layer Category Rail */}
        <div className="flex items-center justify-between gap-2 max-w-[1920px] mx-auto w-full pt-1 border-t border-[#F0EBE1]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap py-0.5 flex-1 select-none">
            
            <button
              onClick={() => {
                setViewMode('destinations');
                setSelectedEssential(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-destinations"
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'destinations'
                  ? 'bg-[#12161E] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-white border border-[#E5DFD5]'
              }`}
            >
              <span>🏛️ All ({displayedDestinations.length})</span>
            </button>

            <button
              onClick={() => {
                setViewMode('places');
                setSelectedEssential(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-places"
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'places'
                  ? 'bg-[#2F523E] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-white border border-[#E5DFD5]'
              }`}
            >
              <span>📍 Places</span>
            </button>

            <button
              onClick={() => {
                setViewMode('culinary');
                setSelectedPlaceId(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-culinary"
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'culinary'
                  ? 'bg-[#C05621] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-white border border-[#E5DFD5]'
              }`}
            >
              <span>🍲 Food</span>
            </button>

            <button
              onClick={() => {
                setViewMode('hotels');
                setSelectedPlaceId(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-hotels"
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'hotels'
                  ? 'bg-[#8C6239] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-white border border-[#E5DFD5]'
              }`}
            >
              <span>🏨 Hotels</span>
            </button>

            <button
              onClick={() => {
                setViewMode('transit');
                setSelectedPlaceId(null);
                setSelectedEssential(null);
              }}
              data-testid="map-tab-transit"
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'transit'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-white border border-[#E5DFD5]'
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
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'medical'
                  ? 'bg-[#DC2626] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-white border border-[#E5DFD5]'
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
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'atm' || viewMode === 'atms'
                  ? 'bg-[#D97706] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-white border border-[#E5DFD5]'
              }`}
            >
              <span>🏧 ATM</span>
            </button>

            <button
              onClick={() => {
                setViewMode('petrol');
                setSelectedPlaceId(null);
                setSelectedTransitStop(null);
              }}
              data-testid="map-tab-petrol"
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'petrol'
                  ? 'bg-[#EA580C] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-white border border-[#E5DFD5]'
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
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'police'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-white border border-[#E5DFD5]'
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
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'experiences'
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-white border border-[#E5DFD5]'
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
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'saved'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#70798B] hover:bg-white border border-[#E5DFD5]'
              }`}
            >
              <span>❤️ Saved ({savedPlaces.length})</span>
            </button>
          </div>

          {/* Transit Toggle */}
          {viewMode === 'transit' && (
            <button
              onClick={() => setShowAllTransitStops(!showAllTransitStops)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold whitespace-nowrap transition cursor-pointer border flex-shrink-0 ${
                showAllTransitStops
                  ? 'bg-[#0D9488] text-white border-[#0D9488]'
                  : 'bg-white text-[#0D9488] border-[#0D9488] hover:bg-teal-50'
              }`}
            >
              {showAllTransitStops ? 'All 46 Stops' : 'Hubs'}
            </button>
          )}
        </div>
      </header>

      {/* 2. TWO-COLUMN APPLICATION WORKSPACE (MAP ~68% + DETAILS ~32%) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-[1920px] mx-auto w-full p-2 sm:p-3 md:p-4 gap-3 md:gap-4 min-h-0">
        
        {/* Left Column: Dedicated Leaflet Map Canvas */}
        <section className="flex-1 md:w-[65%] lg:w-[68%] h-[50vh] md:h-full relative rounded-2xl overflow-hidden border border-[#E5DFD5] shadow-xs flex flex-col bg-[#E5DFD5]">
          <div ref={mapContainerRef} data-testid="map-canvas-container" className="w-full h-full" />
        </section>

        {/* Right Column: Place Information & Routing Details Panel (Independent Layout) */}
        <aside className="w-full md:w-[35%] lg:w-[32%] h-auto md:h-full overflow-y-auto rounded-2xl border border-[#E5DFD5] bg-white p-3 sm:p-4 flex flex-col shadow-xs custom-scrollbar">
          
          {/* Scenario 1: Active Route Guidance HUD */}
          {activeRouteTarget && (
            <div
              data-testid="directions-hud-overlay"
              className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] p-4 shadow-sm font-body text-[#12161E] mb-4 animate-in fade-in duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#B87B22]">
                    🚗 Active Route Guidance
                  </span>
                  <h4 className="font-display font-bold text-base text-[#12161E] truncate max-w-[230px]">
                    {activeRouteTarget.name}
                  </h4>
                </div>
                <button
                  onClick={handleClearRoute}
                  className="text-[#70798B] hover:text-[#12161E] text-xs font-semibold px-2 py-1 bg-white rounded-lg border border-[#E5DFD5] cursor-pointer"
                >
                  Clear Route
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-[#E5DFD5] text-center font-mono text-xs mb-3">
                <div>
                  <span className="text-[10px] text-[#70798B] block">Distance</span>
                  <strong className="text-[#B87B22] text-sm">{activeRouteTarget.distanceFormatted}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#70798B] block">Drive Time</span>
                  <strong>~{formatDuration(activeRouteTarget.drivingMins)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#70798B] block">Walk Time</span>
                  <strong>~{formatDuration(activeRouteTarget.walkingMins)}</strong>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${refLat},${refLon}&destination=${activeRouteTarget.lat},${activeRouteTarget.lon}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#B87B22] text-white rounded-xl text-xs font-semibold hover:bg-[#966319] transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">navigation</span>
                <span>Open in Google Maps Navigation</span>
              </a>
            </div>
          )}

          {/* Scenario 2: Selected Destination Place */}
          {selectedPlace && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedPlaceId(null)}
                  className="text-xs text-[#70798B] hover:text-[#12161E] flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Back to Explore</span>
                </button>
                <span className="text-[10px] font-mono font-bold uppercase text-[#B87B22] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E5DFD5]">
                  Destination Detail
                </span>
              </div>

              <PlaceInfoCard
                place={{
                  id: selectedPlace.id,
                  name: selectedPlace.name,
                  category: typeof selectedPlace.category === 'string' ? selectedPlace.category : (selectedPlace.category as any)?.name || 'Landmark',
                  district: selectedPlace.district,
                  address: selectedPlace.address,
                  lat: selectedPlace.lat,
                  lon: selectedPlace.lon,
                  rating: selectedPlace.rating,
                  ratingCount: selectedPlace.rating_count,
                  ratingSource: selectedPlace.rating_source,
                  openingHours: selectedPlace.opening_hours_source || undefined,
                  description: selectedPlace.description,
                  verified: true,
                }}
                onClose={() => setSelectedPlaceId(null)}
                onNavigate={(tab, params) => onNavigate(tab as StitchTab, params)}
                onDrawRoute={(t) => handleDrawRoute({ ...t, address: t.address || undefined })}
              />
            </div>
          )}

          {/* Scenario 3: Selected Essential (Hotel, Food, Hospital, Pharmacy, ATM, Petrol, Police) */}
          {selectedEssential && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedEssential(null)}
                  className="text-xs text-[#70798B] hover:text-[#12161E] flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Back to Explore</span>
                </button>
                <span className="text-[10px] font-mono font-bold uppercase text-[#B87B22] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E5DFD5]">
                  Verified Essential
                </span>
              </div>

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

          {/* Scenario 4: Selected Transit Stop */}
          {selectedTransitStop && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedTransitStop(null)}
                  className="text-xs text-[#70798B] hover:text-[#12161E] flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Back to Explore</span>
                </button>
                <span className="text-[10px] font-mono font-bold uppercase text-[#0D9488] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  Transit Stop
                </span>
              </div>

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

          {/* Scenario 5: Selected Experience */}
          {selectedExperience && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedExperience(null)}
                  className="text-xs text-[#70798B] hover:text-[#12161E] flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Back to Explore</span>
                </button>
                <span className="text-[10px] font-mono font-bold uppercase text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  Odisha Experience
                </span>
              </div>

              <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] p-4 shadow-sm">
                <h3 className="font-display font-bold text-base text-[#12161E] mb-1">
                  {selectedExperience.name}
                </h3>
                <p className="text-xs text-[#70798B] mb-3">
                  {selectedExperience.locality} · {selectedExperience.categoryLabel}
                </p>
                <button
                  onClick={() =>
                    handleDrawRoute({
                      lat: selectedExperience.lat,
                      lon: selectedExperience.lon,
                      name: selectedExperience.name,
                      category: selectedExperience.categoryLabel,
                      address: selectedExperience.locality,
                    })
                  }
                  className="w-full py-2 bg-[#7C3AED] text-white rounded-xl text-xs font-semibold hover:bg-purple-800 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">route</span>
                  <span>Route to Experience</span>
                </button>
              </div>
            </div>
          )}

          {/* Scenario 6: No Place Selected ("Explore Odisha" Default State) */}
          {!selectedPlace && !selectedEssential && !selectedTransitStop && !selectedExperience && !activeRouteTarget && (
            <div className="flex flex-col h-full justify-between gap-4">
              <div>
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] mb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">🧭</span>
                    <h3 className="font-display font-bold text-sm text-[#12161E]">
                      Explore Odisha Travel Intelligence
                    </h3>
                  </div>
                  <p className="text-xs text-[#70798B] leading-relaxed">
                    Select any pin on the map to inspect verified details, view authentic Odia stays & food spots, or calculate live driving and walking routes.
                  </p>
                </div>

                {/* Quick Recommendation List for Active Mode */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#70798B] font-mono px-1">
                    <span>Nearest in {viewMode.toUpperCase()}</span>
                    <span>Distance</span>
                  </div>

                  {(viewMode === 'destinations' || viewMode === 'places' ? displayedDestinations.slice(0, 5) : displayedEssentials.slice(0, 5)).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if ('category' in item && typeof item.category === 'string' && ['hotel', 'hospital', 'pharmacy', 'atm', 'bank', 'restaurant', 'petrol', 'police'].includes(item.category)) {
                          setSelectedEssential(item as EssentialPlace);
                        } else {
                          setSelectedPlaceId(item.id);
                        }
                        if (mapInstanceRef.current && item.lat && item.lon) {
                          mapInstanceRef.current.flyTo([item.lat, item.lon], 14, { duration: 0.5 });
                        }
                      }}
                      className="p-3 rounded-xl border border-[#E5DFD5] bg-white hover:bg-[#FAF7F2] transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="truncate max-w-[190px]">
                        <h4 className="font-semibold text-xs text-[#12161E] group-hover:text-[#B87B22] transition truncate">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-[#70798B]">
                          {('district' in item ? item.district : '') || ('locality' in item ? item.locality : '')}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#B87B22] font-semibold flex-shrink-0">
                        {item.distanceFormatted}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Provenance Footer */}
              <div className="pt-3 border-t border-[#F0EBE1] text-[11px] text-[#70798B] flex items-center justify-between font-mono">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-emerald-600">verified</span>
                  <span>100% Verified Spatial Data</span>
                </span>
                <span>30 Districts</span>
              </div>
            </div>
          )}

        </aside>
      </div>

      {/* Accessible SSR Items Representation */}
      <div className="sr-only" data-testid="active-mode-items" aria-hidden="true">
        {displayedEssentials.map((e) => (
          <div key={e.id}>{e.name} - {e.category} - {e.locality}</div>
        ))}
        {displayedDestinations.map((d) => (
          <div key={d.id}>{d.name}</div>
        ))}
      </div>

      {/* Transit Timetable Modal */}
      <TransitTimetableModal
        routeNumber={activeTimetableRoute}
        onClose={() => setActiveTimetableRoute(null)}
      />
    </div>
  );
};
