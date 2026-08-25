import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';
import { useLocation } from '../../context/LocationContext';
import { useSavedPlaces } from '../../store/useSavedPlaces';
import { apiClient } from '../../api/client';
import type { PlaceDetail, TransportMapResponse, CorridorFoodCandidate } from '../../api/contracts';
import { ODISHA_EXPERIENCES, type OdishaExperience } from '../../data/odishaExperiences';
import { ODISHA_ESSENTIALS, type EssentialPlace } from '../../data/odishaEssentials';
import { VERIFIED_TRANSIT_STOPS, type VerifiedTransitStop } from '../../data/staticTransitStops';
import {
  isValidCoordinate,
  calculateHaversineDistanceKm,
  formatDistance,
  getNearbyPlacesWithExpansion,
} from '../../utils/geoUtils';
import L from 'leaflet';

export type MapViewMode = 'destinations' | 'medical' | 'atm' | 'transit' | 'experiences' | 'saved';

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
  const { savedPlaces } = useSavedPlaces();

  const [places, setPlaces] = useState<PlaceDetail[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(initialPlaceId || null);
  const [selectedExperience, setSelectedExperience] = useState<OdishaExperience | null>(null);
  const [selectedEssential, setSelectedEssential] = useState<EssentialPlace | null>(null);
  const [transitMapData, setTransitMapData] = useState<TransportMapResponse | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [corridorFoodCandidates, setCorridorFoodCandidates] = useState<CorridorFoodCandidate[]>([]);
  const [selectedFoodCandidate, setSelectedFoodCandidate] = useState<CorridorFoodCandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRegion, setFilterRegion] = useState('Near Me');
  const [viewMode, setViewMode] = useState<MapViewMode>(initialMode);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLineLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Reference coordinates validation
  const hasValidUserCoords = isValidCoordinate(currentPosition?.lat, currentPosition?.lon);
  const refLat = hasValidUserCoords ? currentPosition!.lat : 20.2667;
  const refLon = hasValidUserCoords ? currentPosition!.lon : 85.8436;

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
    const filtered = places.filter(p => {
      if (filterRegion !== 'All' && p.region !== filterRegion) return false;
      return isValidCoordinate(p.lat, p.lon);
    });
    return filtered.map(p => {
      const dist = calculateHaversineDistanceKm(refLat, refLon, p.lat!, p.lon!);
      return {
        ...p,
        distanceKm: dist,
        distanceFormatted: formatDistance(dist),
      };
    });
  }, [filterRegion, nearbyData.places, places, refLat, refLon]);

  // 3. Proximity-sorted Essentials (Medical & ATMs)
  const displayedEssentials = useMemo(() => {
    let pool = ODISHA_ESSENTIALS;
    if (viewMode === 'medical') {
      pool = pool.filter(e => e.category === 'hospital' || e.category === 'pharmacy');
    } else if (viewMode === 'atm') {
      pool = pool.filter(e => e.category === 'atm' || e.category === 'bank');
    } else {
      return [];
    }

    const scored = pool.map(item => {
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

  // 4. Proximity-sorted Static Transit Stops Fallback
  const fallbackTransitStops = useMemo(() => {
    return VERIFIED_TRANSIT_STOPS.map(st => {
      const dist = calculateHaversineDistanceKm(refLat, refLon, st.latitude, st.longitude);
      const walkingMins = Math.max(1, Math.ceil((dist * 1000) / 80));
      return {
        ...st,
        distanceKm: dist,
        distanceFormatted: formatDistance(dist),
        walkingMins,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [refLat, refLon]);

  // 5. Proximity-sorted Saved Places
  const displayedSavedPlaces = useMemo(() => {
    return savedPlaces.map(sp => {
      const target = places.find(p => p.id === sp.id || p.name.toLowerCase() === sp.name.toLowerCase());
      const lat = target?.lat ?? sp.coordinates?.[0];
      const lon = target?.lon ?? sp.coordinates?.[1];
      const hasCoords = isValidCoordinate(lat, lon);
      const dist = hasCoords ? calculateHaversineDistanceKm(refLat, refLon, lat!, lon!) : 0;
      return {
        ...sp,
        lat: hasCoords ? lat : undefined,
        lon: hasCoords ? lon : undefined,
        district: target?.district || sp.location,
        distanceFormatted: hasCoords ? formatDistance(dist) : undefined,
      };
    });
  }, [savedPlaces, places, refLat, refLon]);

  // Fetch 161 destinations
  useEffect(() => {
    let isMounted = true;
    const loadPlaces = async () => {
      setLoading(true);
      try {
        const data = await apiClient.listPlaces({ limit: 161 });
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setPlaces(data);
          if (!selectedPlaceId && data.length > 0) {
            setSelectedPlaceId(data[0].id);
          }
        }
      } catch (err) {
        console.warn('Map place fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadPlaces();
    return () => { isMounted = false; };
  }, []);

  // Update initial viewMode / initialPlaceId if provided
  useEffect(() => {
    if (initialMode) {
      setViewMode(initialMode);
    }
  }, [initialMode]);

  // Synchronize initialPlaceId when supplied
  useEffect(() => {
    if (initialPlaceId) {
      setSelectedPlaceId(initialPlaceId);
      const target = places.find(p => p.id === initialPlaceId);
      if (target && isValidCoordinate(target.lat, target.lon) && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([target.lat!, target.lon!], 13, { duration: 0.8 });
      }
    }
  }, [initialPlaceId, places]);

  // Fetch transport map data when switching to transit mode
  useEffect(() => {
    if (viewMode !== 'transit') return;
    let isMounted = true;
    const loadTransit = async () => {
      try {
        const regionParam = filterRegion === 'All' || filterRegion === 'Near Me' ? undefined : filterRegion;
        const data = await apiClient.getTransportMap(regionParam);
        if (isMounted && data && data.routes.length > 0) {
          setTransitMapData(data);
          if (!selectedRouteId && data.routes.length > 0) {
            setSelectedRouteId(data.routes[0].route_id);
          }
        }
      } catch (err) {
        console.warn('Transport map fetch error:', err);
      }
    };
    loadTransit();
    return () => { isMounted = false; };
  }, [viewMode, filterRegion]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20.27, 85.83],
        zoom: 11,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
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
    }
  }, []);

  // Render User Location Pin
  useEffect(() => {
    if (!mapInstanceRef.current || !userMarkerLayerRef.current) return;
    userMarkerLayerRef.current.clearLayers();

    if (currentPosition && isValidCoordinate(currentPosition.lat, currentPosition.lon)) {
      const userIcon = L.divIcon({
        className: 'user-live-gps-pin',
        html: `<div style="background-color: #2F523E; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(47,82,62,0.9); ${isLive ? 'animation: pulse 2s infinite;' : ''}"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([currentPosition.lat, currentPosition.lon], { icon: userIcon });
      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
          <div style="font-size: 10px; font-family: monospace; color: #2F523E; font-weight: bold;">
            ${isLive ? '🟢 LIVE GPS LOCATION' : '📌 ACTIVE LOCATION'}
          </div>
          <strong style="font-size: 12px; color: #12161E;">${locationName || 'Odisha'}</strong>
        </div>
      `);
      userMarkerLayerRef.current.addLayer(marker);
    }
  }, [currentPosition, isLive, locationName]);

  // Main Markers & Geometry Layer Rendering
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !routeLineLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    routeLineLayerRef.current.clearLayers();

    // Mode 1: Sanctuaries / Destinations
    if (viewMode === 'destinations') {
      const points: [number, number][] = [];

      displayedDestinations.forEach((p, index) => {
        const isSelected = selectedPlaceId === p.id;
        const customIcon = L.divIcon({
          className: 'custom-stitch-map-pin',
          html: `<div style="background-color: ${isSelected ? '#12161E' : '#B87B22'}; color: #FFFFFF; width: ${isSelected ? '32px' : '26px'}; height: ${isSelected ? '32px' : '26px'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: 'JetBrains Mono', monospace; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35); transition: all 0.2s;">${index + 1}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        if (p.lat != null && p.lon != null && isValidCoordinate(p.lat, p.lon)) {
          points.push([p.lat, p.lon]);
          const marker = L.marker([p.lat, p.lon], { icon: customIcon });
          marker.on('click', () => {
            setSelectedPlaceId(p.id);
            setSelectedExperience(null);
            setSelectedEssential(null);
          });

          marker.bindPopup(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 210px;">
              <div style="font-size: 10px; font-family: monospace; color: #B87B22; font-weight: bold;">
                #${index + 1} ${p.distanceFormatted ? `· ${p.distanceFormatted}` : ''}
              </div>
              <strong style="font-family: 'Playfair Display', serif; font-size: 13px; color: #12161E;">${p.name}</strong>
              <p style="font-size: 11px; color: #70798B; margin: 3px 0 0 0;">${p.district || ''} · ${p.category}</p>
            </div>
          `);

          markersLayerRef.current?.addLayer(marker);
        }
      });

      if (selectedPlaceId) {
        const current = displayedDestinations.find(p => p.id === selectedPlaceId) || places.find(p => p.id === selectedPlaceId);
        if (current && current.lat != null && current.lon != null && isValidCoordinate(current.lat, current.lon)) {
          mapInstanceRef.current.flyTo([current.lat, current.lon], 12, { duration: 0.8 });
        }
      } else if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    } 
    // Mode 2: Medical Help 24/7
    else if (viewMode === 'medical') {
      const medPoints: [number, number][] = [];
      displayedEssentials.forEach((item, index) => {
        medPoints.push([item.lat, item.lon]);
        const isSelected = selectedEssential?.id === item.id;
        const medIcon = L.divIcon({
          className: 'custom-med-pin',
          html: `<div style="background-color: ${isSelected ? '#12161E' : '#9E2A2B'}; color: #FFFFFF; width: ${isSelected ? '32px' : '26px'}; height: ${isSelected ? '32px' : '26px'}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 8px rgba(158,42,43,0.4);">${item.category === 'hospital' ? '🏥' : '💊'}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([item.lat, item.lon], { icon: medIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 230px;">
            <div style="font-size: 10px; font-family: monospace; color: #9E2A2B; font-weight: bold;">
              ${item.category === 'hospital' ? '24/7 HOSPITAL' : '24/7 PHARMACY'} · ${item.distanceFormatted}
            </div>
            <strong style="font-size: 13px; color: #12161E;">${item.name}</strong>
            <p style="font-size: 11px; color: #70798B; margin: 3px 0 0 0;">${item.locality}</p>
            ${item.phone ? `<p style="font-size: 11px; color: #9E2A2B; font-weight: bold; margin-top: 4px;">📞 ${item.phone}</p>` : ''}
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });

      if (medPoints.length > 0) {
        const bounds = L.latLngBounds(medPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 3: ATMs & Cash Points
    else if (viewMode === 'atm') {
      const atmPoints: [number, number][] = [];
      displayedEssentials.forEach((item) => {
        atmPoints.push([item.lat, item.lon]);
        const isSelected = selectedEssential?.id === item.id;
        const atmIcon = L.divIcon({
          className: 'custom-atm-pin',
          html: `<div style="background-color: ${isSelected ? '#12161E' : '#B87B22'}; color: #FFFFFF; width: ${isSelected ? '32px' : '26px'}; height: ${isSelected ? '32px' : '26px'}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 8px rgba(184,123,34,0.4);">🏧</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([item.lat, item.lon], { icon: atmIcon });
        marker.on('click', () => {
          setSelectedEssential(item);
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

      if (atmPoints.length > 0) {
        const bounds = L.latLngBounds(atmPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
    // Mode 4: Mo Bus & Transit
    else if (viewMode === 'transit') {
      const stopPoints: [number, number][] = [];
      const activeStops = transitMapData && transitMapData.stops.length > 0 ? transitMapData.stops : fallbackTransitStops;

      activeStops.forEach((st) => {
        const lat = 'latitude' in st ? st.latitude : undefined;
        const lon = 'longitude' in st ? st.longitude : undefined;

        if (lat != null && lon != null) {
          stopPoints.push([lat, lon]);
          const isSelected = selectedStopId === st.stop_id;
          const busIcon = L.divIcon({
            className: 'custom-transit-pin',
            html: `<div style="background-color: ${isSelected ? '#12161E' : '#1B5E6B'}; color: #FFFFFF; width: ${isSelected ? '30px' : '24px'}; height: ${isSelected ? '30px' : '24px'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.35);">🚌</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([lat, lon], { icon: busIcon });
          marker.on('click', () => {
            setSelectedStopId(st.stop_id);
          });

          marker.bindPopup(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 220px;">
              <div style="font-size: 10px; font-family: monospace; color: #1B5E6B; font-weight: bold;">MO BUS VERIFIED STOP</div>
              <strong style="font-size: 13px; color: #12161E;">${st.name}</strong>
              <p style="font-size: 11px; color: #70798B; margin: 2px 0 0 0;">${st.city || 'Odisha'} · Official CRUT Terminal</p>
            </div>
          `);

          markersLayerRef.current?.addLayer(marker);
        }
      });

      if (stopPoints.length > 0) {
        const bounds = L.latLngBounds(stopPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    }
    // Mode 5: Culinary & Craft Experiences
    else if (viewMode === 'experiences') {
      const expPoints: [number, number][] = [];
      ODISHA_EXPERIENCES.forEach((exp) => {
        expPoints.push([exp.lat, exp.lon]);
        const isSelected = selectedExperience?.id === exp.id;
        const customIcon = L.divIcon({
          className: 'custom-stitch-exp-pin',
          html: `<div style="background-color: ${isSelected ? '#12161E' : '#B87B22'}; color: #FFFFFF; width: ${isSelected ? '32px' : '26px'}; height: ${isSelected ? '32px' : '26px'}; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);">🍴</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([exp.lat, exp.lon], { icon: customIcon });
        marker.on('click', () => {
          setSelectedExperience(exp);
        });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 200px;">
            <strong style="font-family: 'Playfair Display', serif; font-size: 13px; color: #12161E;">${exp.name}</strong>
            <p style="font-size: 11px; color: #B87B22; margin: 4px 0 0 0;">${exp.categoryLabel}</p>
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });

      if (expPoints.length > 0) {
        const bounds = L.latLngBounds(expPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
      }
    }
    // Mode 6: Saved Places
    else if (viewMode === 'saved') {
      const savedPoints: [number, number][] = [];
      displayedSavedPlaces.forEach((sp) => {
        if (sp.lat != null && sp.lon != null) {
          savedPoints.push([sp.lat, sp.lon]);
          const savedIcon = L.divIcon({
            className: 'custom-saved-pin',
            html: `<div style="background-color: #2F523E; color: #FFFFFF; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 8px rgba(47,82,62,0.4);">🔖</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([sp.lat, sp.lon], { icon: savedIcon });
          marker.bindPopup(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 200px;">
              <div style="font-size: 10px; font-family: monospace; color: #2F523E; font-weight: bold;">SAVED PLACE</div>
              <strong style="font-size: 13px; color: #12161E;">${sp.name}</strong>
              <p style="font-size: 11px; color: #70798B; margin: 2px 0 0 0;">${sp.category || ''}</p>
            </div>
          `);
          markersLayerRef.current?.addLayer(marker);
        }
      });

      if (savedPoints.length > 0) {
        const bounds = L.latLngBounds(savedPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    }
  }, [
    places,
    filterRegion,
    selectedPlaceId,
    viewMode,
    selectedExperience,
    selectedEssential,
    transitMapData,
    selectedRouteId,
    selectedStopId,
    corridorFoodCandidates,
    selectedFoodCandidate,
    displayedDestinations,
    displayedEssentials,
    fallbackTransitStops,
    displayedSavedPlaces,
  ]);

  const handleLocateMe = async () => {
    await locateUser(false);
    if (currentPosition && isValidCoordinate(currentPosition.lat, currentPosition.lon) && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([currentPosition.lat, currentPosition.lon], 13, { duration: 1 });
    }
  };

  const selectedPlace = displayedDestinations.find(p => p.id === selectedPlaceId) || places.find(p => p.id === selectedPlaceId);

  return (
    <div className="w-full pt-16 sm:pt-18 h-screen flex flex-col md:flex-row overflow-hidden bg-[#FBF9F5]">
      {/* Left Workspace Pane */}
      <aside className="w-full md:w-[450px] lg:w-[480px] flex flex-col h-full border-r border-[#E5DFD5] bg-[#FBF9F5] z-10 shrink-0">
        {/* Top Header */}
        <header className="px-5 py-4 border-b border-[#E5DFD5] bg-white/90 backdrop-blur-md">
          <div className="flex justify-between items-start mb-2.5">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#B87B22]/10 text-[#B87B22] px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold mb-1">
                <span className="material-symbols-outlined text-xs">explore</span>
                <span>Spatial Intelligence Engine</span>
              </div>
              <h1 className="font-display font-bold text-xl md:text-2xl text-[#12161E]">
                Spatial Route &amp; Map
              </h1>
            </div>

            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2EEE7] text-[#2F523E] border border-[#E5DFD5] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#2F523E] animate-ping" />
              <span>{isLocating ? 'Locating...' : 'GPS Centered'}</span>
            </button>
          </div>

          {/* Map Layer Mode Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
            {[
              { id: 'destinations', label: 'Sanctuaries', icon: 'temple_hindu' },
              { id: 'medical', label: 'Medical 24/7', icon: 'local_hospital' },
              { id: 'atm', label: 'ATMs', icon: 'atm' },
              { id: 'transit', label: 'Mo Bus', icon: 'directions_bus' },
              { id: 'experiences', label: 'Food & Crafts', icon: 'restaurant' },
              { id: 'saved', label: `Saved (${savedPlaces.length})`, icon: 'bookmark' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewMode(tab.id as MapViewMode)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  viewMode === tab.id
                    ? 'bg-[#12161E] text-white shadow-xs'
                    : 'bg-[#F2EEE7] text-[#3D4654] hover:bg-[#EAE4DA]'
                }`}
              >
                <span className="material-symbols-outlined text-xs">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Dynamic Sidebar Content Based on View Mode */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {/* Mode: Destinations */}
          {viewMode === 'destinations' && (
            displayedDestinations.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPlaceId(p.id);
                  if (p.lat && p.lon && mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([p.lat, p.lon], 13, { duration: 0.8 });
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedPlaceId === p.id
                    ? 'bg-white border-[#B87B22] shadow-md ring-1 ring-[#B87B22]/30'
                    : 'bg-white/80 hover:bg-white border-[#E5DFD5]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#B87B22]">
                      #{idx + 1} {p.distanceFormatted ? `• ${p.distanceFormatted}` : ''}
                    </span>
                    <h3 className="font-display font-bold text-base text-[#12161E]">{p.name}</h3>
                    <p className="text-xs text-[#70798B] mt-0.5">{p.district || p.region} • {p.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('plan', { placeId: p.id });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
                  >
                    Plan Trip
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Mode: Medical Help 24/7 */}
          {viewMode === 'medical' && (
            displayedEssentials.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedEssential(item);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([item.lat, item.lon], 14, { duration: 0.8 });
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedEssential?.id === item.id
                    ? 'bg-[#FFF5F5] border-[#9E2A2B] shadow-md ring-1 ring-[#9E2A2B]/30'
                    : 'bg-white hover:bg-[#FFF9F9] border-[#E5DFD5]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#9E2A2B] bg-[#9E2A2B]/10 px-2 py-0.5 rounded-full">
                      {item.category === 'hospital' ? '🏥 24/7 Hospital' : '💊 24/7 Pharmacy'} • {item.distanceFormatted}
                    </span>
                    <h3 className="font-display font-bold text-base text-[#12161E] mt-1.5">{item.name}</h3>
                    <p className="text-xs text-[#70798B] mt-0.5">{item.address}</p>
                    {item.phone && (
                      <p className="text-xs font-mono font-semibold text-[#9E2A2B] mt-2">
                        📞 Emergency: {item.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Mode: ATMs */}
          {viewMode === 'atm' && (
            displayedEssentials.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedEssential(item);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([item.lat, item.lon], 14, { duration: 0.8 });
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedEssential?.id === item.id
                    ? 'bg-[#FBF8F2] border-[#B87B22] shadow-md ring-1 ring-[#B87B22]/30'
                    : 'bg-white hover:bg-[#FBF8F2]/60 border-[#E5DFD5]'
                }`}
              >
                <span className="text-[10px] font-mono font-bold uppercase text-[#B87B22] bg-[#B87B22]/10 px-2 py-0.5 rounded-full">
                  🏧 24/7 ATM • {item.distanceFormatted}
                </span>
                <h3 className="font-display font-bold text-base text-[#12161E] mt-1.5">{item.name}</h3>
                <p className="text-xs text-[#70798B] mt-0.5">{item.address}</p>
              </div>
            ))
          )}

          {/* Mode: Transit Stops */}
          {viewMode === 'transit' && (
            (transitMapData?.stops && transitMapData.stops.length > 0 ? transitMapData.stops : fallbackTransitStops).map((st) => (
              <div
                key={st.stop_id}
                onClick={() => {
                  setSelectedStopId(st.stop_id);
                  const lat = 'latitude' in st ? st.latitude : undefined;
                  const lon = 'longitude' in st ? st.longitude : undefined;
                  if (lat && lon && mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([lat, lon], 14, { duration: 0.8 });
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedStopId === st.stop_id
                    ? 'bg-[#F2F8F9] border-[#1B5E6B] shadow-md ring-1 ring-[#1B5E6B]/30'
                    : 'bg-white hover:bg-[#F2F8F9]/50 border-[#E5DFD5]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#1B5E6B] bg-[#1B5E6B]/10 px-2 py-0.5 rounded-full">
                      🚌 Mo Bus Stop {'distanceFormatted' in st ? `• ${st.distanceFormatted}` : ''}
                    </span>
                    <h3 className="font-display font-bold text-base text-[#12161E] mt-1.5">{st.name}</h3>
                    <p className="text-xs text-[#70798B] mt-0.5">{st.city || 'Odisha'} Terminal</p>
                    {'routes_serving_stop' in st && Array.isArray((st as any).routes_serving_stop) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(st as any).routes_serving_stop.map((r: { route_number: string }, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DFD5] text-[10px] font-mono font-bold text-[#12161E]">
                            Route {r.route_number}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Mode: Experiences */}
          {viewMode === 'experiences' && (
            ODISHA_EXPERIENCES.map((exp) => (
              <div
                key={exp.id}
                onClick={() => {
                  setSelectedExperience(exp);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([exp.lat, exp.lon], 13, { duration: 0.8 });
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedExperience?.id === exp.id
                    ? 'bg-[#FAF7F2] border-[#B87B22] shadow-md ring-1 ring-[#B87B22]/30'
                    : 'bg-white hover:bg-[#FAF7F2] border-[#E5DFD5]'
                }`}
              >
                <span className="text-[10px] font-mono font-bold uppercase text-[#B87B22]">
                  {exp.categoryLabel} • {exp.district}
                </span>
                <h3 className="font-display font-bold text-base text-[#12161E] mt-1">{exp.name}</h3>
                <p className="text-xs text-[#3D4654] line-clamp-2 mt-1">{exp.description}</p>
              </div>
            ))
          )}

          {/* Mode: Saved */}
          {viewMode === 'saved' && (
            displayedSavedPlaces.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E5DFD5]">
                <p className="text-xs text-[#70798B]">No saved places on this device yet.</p>
              </div>
            ) : (
              displayedSavedPlaces.map((sp) => (
                <div
                  key={sp.id}
                  onClick={() => {
                    if (sp.lat && sp.lon && mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([sp.lat, sp.lon], 13, { duration: 0.8 });
                    }
                  }}
                  className="p-4 rounded-2xl bg-white border border-[#E5DFD5] hover:border-[#2F523E] transition-all cursor-pointer"
                >
                  <span className="text-[10px] font-mono font-bold uppercase text-[#2F523E]">
                    🔖 Saved Landmark {sp.distanceFormatted ? `• ${sp.distanceFormatted}` : ''}
                  </span>
                  <h3 className="font-display font-bold text-base text-[#12161E] mt-1">{sp.name}</h3>
                  <p className="text-xs text-[#70798B] mt-0.5">{sp.district || sp.category}</p>
                </div>
              ))
            )
          )}
        </div>
      </aside>

      {/* Right Canvas: Interactive Map */}
      <main className="flex-1 h-full relative overflow-hidden bg-[#F2EEE7]">
        <div ref={mapContainerRef} className="w-full h-full" />
      </main>
    </div>
  );
};
