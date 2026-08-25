import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';
import { useLocation } from '../../context/LocationContext';
import { useSavedPlaces } from '../../store/useSavedPlaces';
import { apiClient } from '../../api/client';
import type { PlaceDetail, TransportMapResponse, TransportMapRoute, CorridorFoodCandidate } from '../../api/contracts';
import { ODISHA_EXPERIENCES, type OdishaExperience } from '../../data/odishaExperiences';
import { ODISHA_ESSENTIALS, type EssentialPlace } from '../../data/odishaEssentials';
import { VERIFIED_TRANSIT_STOPS, type VerifiedTransitStop } from '../../data/staticTransitStops';
import {
  isValidCoordinate,
  calculateHaversineDistanceKm,
  formatDistance,
  getNearbyPlacesWithExpansion,
} from '../../utils/geoUtils';
import { resolveRouteMapGeometry } from '../../utils/transitGeometry';
import L from 'leaflet';

export type MapViewMode = 'destinations' | 'medical' | 'atms' | 'atm' | 'transit' | 'experiences' | 'saved';

interface StitchMapPageProps {
  onNavigate: (tab: StitchTab, params?: Record<string, string>) => void;
  onOpenShare?: () => void;
  initialPlaceId?: string;
  initialMode?: MapViewMode;
}

interface OdishaAtm {
  id: string;
  name: string;
  bank: string;
  address: string;
  district: string;
  lat: number;
  lon: number;
  status: string;
  distanceKm?: number;
  distanceFormatted?: string;
}

const ODISHA_ATMS: OdishaAtm[] = [
  { id: 'atm_bbsr_sbi_1', name: 'SBI 24/7 ATM & Cash Deposit', bank: 'State Bank of India', address: 'Master Canteen Square / Railway Station, Bhubaneswar', district: 'Khordha', lat: 20.2680, lon: 85.8440, status: 'Active 24/7' },
  { id: 'atm_bbsr_hdfc_1', name: 'HDFC Bank ATM & Cash Recycler', bank: 'HDFC Bank', address: 'Saheed Nagar Janpath, Bhubaneswar', district: 'Khordha', lat: 20.2882, lon: 85.8440, status: 'Active 24/7' },
  { id: 'atm_bbsr_icici_1', name: 'ICICI Bank ATM', bank: 'ICICI Bank', address: 'Jaydev Vihar Square, Bhubaneswar', district: 'Khordha', lat: 20.3015, lon: 85.8234, status: 'Active 24/7' },
  { id: 'atm_puri_sbi_1', name: 'SBI Badadanda ATM', bank: 'State Bank of India', address: 'Grand Road (Badadanda), Near Jagannath Temple, Puri', district: 'Puri', lat: 19.8080, lon: 85.8250, status: 'Active 24/7' },
  { id: 'atm_puri_hdfc_1', name: 'HDFC Beach Road ATM', bank: 'HDFC Bank', address: 'VIP Road & Sea Beach, Puri', district: 'Puri', lat: 19.8010, lon: 85.8340, status: 'Active 24/7' },
  { id: 'atm_cuttack_sbi_1', name: 'SBI Badambadi ATM', bank: 'State Bank of India', address: 'Badambadi Bus Terminal, Cuttack', district: 'Cuttack', lat: 20.4580, lon: 85.8750, status: 'Active 24/7' },
  { id: 'atm_rourkela_sbi_1', name: 'SBI Bisra Chowk ATM', bank: 'State Bank of India', address: 'Bisra Chowk, Rourkela', district: 'Sundargarh', lat: 22.2270, lon: 84.8520, status: 'Active 24/7' },
  { id: 'atm_sambalpur_sbi_1', name: 'SBI Ainthapali ATM', bank: 'State Bank of India', address: 'Ainthapali Chowk, Sambalpur', district: 'Sambalpur', lat: 21.4880, lon: 83.9850, status: 'Active 24/7' },
  { id: 'atm_koraput_sbi_1', name: 'SBI Main Road Branch ATM', bank: 'State Bank of India', address: 'Main Road / Bus Stand, Koraput', district: 'Koraput', lat: 18.8135, lon: 82.7118, status: 'Active 24/7' },
  { id: 'atm_berhampur_sbi_1', name: 'SBI Old Bus Stand ATM', bank: 'State Bank of India', address: 'Old Bus Stand Road, Berhampur', district: 'Ganjam', lat: 19.3150, lon: 84.7940, status: 'Active 24/7' },
  { id: 'atm_baripada_sbi_1', name: 'SBI Baripada Main ATM', bank: 'State Bank of India', address: 'Kachery Road, Baripada', district: 'Mayurbhanj', lat: 21.9320, lon: 86.7260, status: 'Active 24/7' },
  { id: 'atm_balasore_sbi_1', name: 'SBI OT Road ATM', bank: 'State Bank of India', address: 'OT Road, Balasore', district: 'Balasore', lat: 21.4920, lon: 86.9320, status: 'Active 24/7' },
];

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
  const [selectedMedicalId, setSelectedMedicalId] = useState<string | null>(null);
  const [selectedAtmId, setSelectedAtmId] = useState<string | null>(null);
  const [transitMapData, setTransitMapData] = useState<TransportMapResponse | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [corridorFoodCandidates, setCorridorFoodCandidates] = useState<CorridorFoodCandidate[]>([]);
  const [selectedFoodCandidate, setSelectedFoodCandidate] = useState<CorridorFoodCandidate | null>(null);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [transitLoading, setTransitLoading] = useState(false);
  const [transitError, setTransitError] = useState<string | null>(null);
  
  // Independent Filter Domains (Invariants: Places and Transit filters must never mutate each other)
  const [placeRegion, setPlaceRegion] = useState<string>('Near Me');
  const [transitRegion, setTransitRegion] = useState<string>('All');
  const [filterRegion, setFilterRegion] = useState<string>('Near Me');
  
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

  const [medicalPlaces, setMedicalPlaces] = useState<PlaceDetail[]>([]);

  // 4. Computed 24/7 Medical & Emergency Facilities
  const displayedMedical = useMemo(() => {
    const list = medicalPlaces.length > 0 ? medicalPlaces : places.filter(p =>
      p.category === 'hospital' ||
      p.category === 'emergency_facility' ||
      p.name.toLowerCase().includes('hospital') ||
      p.name.toLowerCase().includes('medical')
    );
    return list.map(p => {
      const dist = calculateHaversineDistanceKm(refLat, refLon, p.lat || refLat, p.lon || refLon);
      return {
        ...p,
        distanceKm: dist,
        distanceFormatted: formatDistance(dist),
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [medicalPlaces, places, refLat, refLon]);

  // 5. Computed Nearby ATMs & Cash Dispensers
  const displayedAtms = useMemo(() => {
    return ODISHA_ATMS.map(atm => {
      const dist = calculateHaversineDistanceKm(refLat, refLon, atm.lat, atm.lon);
      return {
        ...atm,
        distanceKm: dist,
        distanceFormatted: formatDistance(dist),
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [refLat, refLon]);

  const activeTransitRoute = transitMapData?.routes.find(r => r.route_id === selectedRouteId);
  const activeRouteGeometry = resolveRouteMapGeometry(activeTransitRoute);

  // Fetch 161 destinations + verified medical facilities
  useEffect(() => {
    let isMounted = true;
    const loadPlaces = async () => {
      setPlacesLoading(true);
      try {
        const [data, medData] = await Promise.all([
          apiClient.listPlaces({ limit: 161 }),
          apiClient.listPlaces({ is_medical: true }).catch(() => []),
        ]);
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setPlaces(data);
            if (!selectedPlaceId && data.length > 0) {
              setSelectedPlaceId(data[0].id);
            }
          }
          if (Array.isArray(medData) && medData.length > 0) {
            setMedicalPlaces(medData);
          }
        }
      } catch (err) {
        console.warn('Map place fetch error:', err);
      } finally {
        if (isMounted) setPlacesLoading(false);
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

  const loadTransit = async () => {
    setTransitLoading(true);
    setTransitError(null);
    try {
      const regionParam = transitRegion === 'All' || transitRegion === 'Near Me' ? undefined : transitRegion;
      const data = await apiClient.getTransportMap(regionParam);
      if (data && data.routes.length > 0) {
        setTransitMapData(data);
        if (!selectedRouteId && data.routes.length > 0) {
          setSelectedRouteId(data.routes[0].route_id);
        }
      }
    } catch (err: any) {
      setTransitError(err?.message || 'Transport map fetch error');
    } finally {
      setTransitLoading(false);
    }
  };

  // Fetch transport map data when switching to transit mode
  useEffect(() => {
    if (viewMode === 'transit') {
      loadTransit();
    }
  }, [viewMode, transitRegion]);

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
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
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
              onClick={() => locateUser()}
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
              { id: 'destinations', label: 'Places', icon: 'temple_hindu' },
              { id: 'experiences', label: 'Culinary', icon: 'restaurant' },
              { id: 'transit', label: 'Mo Bus', icon: 'directions_bus' },
              { id: 'medical', label: 'Medical 24/7', icon: 'local_hospital' },
              { id: 'atm', label: 'ATMs', icon: 'atm' },
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

          {/* Mode: Medical Help 24/7 */}
          {viewMode === 'medical' && (
            <div className="space-y-4">
              {/* Prominent 108 Emergency Banner */}
              <div className="p-4 bg-red-600 text-white rounded-2xl shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl animate-pulse">emergency</span>
                    <div>
                      <div className="font-display font-bold text-base">Emergency Medical Help</div>
                      <div className="text-[11px] font-mono text-red-100">National Ambulance: 108 · 24/7 Dispatch</div>
                    </div>
                  </div>
                  <a
                    href="tel:108"
                    className="px-3.5 py-1.5 bg-white text-red-700 font-bold text-xs rounded-xl shadow-xs hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">call</span>
                    <span>Call 108</span>
                  </a>
                </div>
                <div className="pt-2 border-t border-red-500/60 flex flex-wrap gap-2 text-[10px] font-mono text-red-100">
                  <span className="bg-red-700/60 px-2 py-0.5 rounded">🚨 Police: 112</span>
                  <span className="bg-red-700/60 px-2 py-0.5 rounded">🛡️ Women Helpline: 181</span>
                  <span className="bg-red-700/60 px-2 py-0.5 rounded">🏥 Trauma Care: 24/7</span>
                </div>
              </div>

              {/* Verified Hospitals List */}
              <div className="flex items-center justify-between text-xs font-mono text-[#70798B]">
                <span>{displayedMedical.length} 24/7 Verified Hospitals</span>
                <span>Sorted by distance</span>
              </div>

              {displayedMedical.map((med, idx) => {
                const isSelected = selectedMedicalId === med.id;
                return (
                  <div
                    key={med.id}
                    onClick={() => {
                      setSelectedMedicalId(med.id);
                      if (med.lat != null && med.lon != null && isValidCoordinate(med.lat, med.lon) && mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([med.lat, med.lon], 13);
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-red-500 shadow-md ring-1 ring-red-300'
                        : 'bg-white/90 border-[#E5DFD5] hover:bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold font-mono">
                          {idx + 1}
                        </span>
                        <h4 className="font-display font-bold text-base text-[#12161E]">
                          {med.name}
                        </h4>
                      </div>
                      <span className="font-mono text-[10px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-semibold shrink-0">
                        24/7 Emergency
                      </span>
                    </div>
                    <p className="text-xs text-[#3D4654] line-clamp-2 mb-2 ml-8">
                      {med.description || 'Major tertiary healthcare facility with 24/7 trauma and ICU facilities.'}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#70798B] ml-8">
                      <span>{med.district || 'Odisha'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-red-700 font-semibold font-mono bg-red-50 px-2 py-0.5 rounded">
                          📍 {med.distanceFormatted}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('plan', { placeId: med.id });
                          }}
                          title="Plan Route to Hospital"
                          className="px-2 py-0.5 text-[10px] bg-[#12161E] text-white rounded hover:bg-[#B87B22] transition-colors cursor-pointer"
                        >
                          Plan Route
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mode: ATMs */}
          {(viewMode === 'atm' || viewMode === 'atms') && (
            <div className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-body space-y-1">
                <div className="flex items-center justify-between font-semibold text-teal-900">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-teal-700">atm</span>
                    <span>Verified 24/7 ATMs &amp; Cash Points</span>
                  </span>
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-teal-200 text-teal-800">
                    {displayedAtms.length} Available
                  </span>
                </div>
                <p className="text-[11px] text-teal-800">
                  24-hour automated teller machines and cash dispensers located across transport hubs and commercial corridors.
                </p>
              </div>

              {displayedAtms.map((atm, idx) => {
                const isSelected = selectedAtmId === atm.id;
                return (
                  <div
                    key={atm.id}
                    onClick={() => {
                      setSelectedAtmId(atm.id);
                      if (isValidCoordinate(atm.lat, atm.lon) && mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([atm.lat, atm.lon], 14);
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-teal-600 shadow-md ring-1 ring-teal-300'
                        : 'bg-white/90 border-[#E5DFD5] hover:bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold font-mono">
                          {idx + 1}
                        </span>
                        <h4 className="font-display font-bold text-base text-[#12161E]">
                          {atm.name}
                        </h4>
                      </div>
                      <span className="font-mono text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-semibold shrink-0">
                        {atm.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#3D4654] mb-2 ml-8">
                      {atm.address}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#70798B] ml-8">
                      <span>{atm.district} · {atm.bank}</span>
                      <span className="text-teal-800 font-semibold font-mono bg-teal-50 px-2 py-0.5 rounded">
                        📍 {atm.distanceFormatted}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mode: Transit Stops */}
          {viewMode === 'transit' && (
            transitLoading ? (
              <div className="text-center py-12 text-xs font-mono text-[#70798B]">
                <span className="material-symbols-outlined text-2xl mb-2 text-[#2B72BA] animate-spin">sync</span>
                <p>Loading official Mo Bus &amp; AMA Bus routes...</p>
              </div>
            ) : transitError ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                  <span className="material-symbols-outlined text-amber-700 text-base">cloud_off</span>
                  <span>{transitError}</span>
                </div>
                <button
                  onClick={() => loadTransit()}
                  className="px-3 py-1.5 bg-[#12161E] text-white rounded-md text-xs font-mono font-medium hover:bg-[#B87B22] cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            ) : transitMapData && transitMapData.routes.length === 0 ? (
              <div className="p-6 bg-white border border-[#E5DFD5] rounded-xl text-center space-y-3">
                <p className="text-xs font-mono text-[#70798B]">
                  No transit routes found matching "{transitRegion}".
                </p>
                <button
                  onClick={() => setTransitRegion('All')}
                  className="px-3.5 py-1.5 bg-[#12161E] text-white rounded-md text-xs font-mono font-medium hover:bg-[#B87B22] cursor-pointer"
                >
                  Show All Routes
                </button>
              </div>
            ) : transitMapData ? (
              <div className="space-y-4">
                {/* Transit Discovery State Header (Requirement 5) */}
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold text-[#2B72BA]">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">directions_bus</span>
                      <span>Mo Bus Network ({transitMapData.routes.length} routes)</span>
                    </span>
                    <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-blue-200">
                      {transitRegion === 'All' ? 'Statewide Network' : transitRegion}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3D4654] font-body">
                    {transitMapData.routes.length} verified CRUT transit routes across {transitRegion === 'All' ? 'the mapped transit network' : transitRegion}. Select a route to view its full stop sequence and highway alignment.
                  </p>
                </div>
                {transitMapData.routes.map((r: TransportMapRoute) => {
                  const isSelected = selectedRouteId === r.route_id;
                  const itemGeo = resolveRouteMapGeometry(r);
                  return (
                    <div
                      key={r.route_id}
                      onClick={() => setSelectedRouteId(r.route_id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-[#2B72BA] shadow-md ring-1 ring-[#2B72BA]/30'
                          : 'bg-white/80 border-[#E5DFD5] hover:bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-mono text-xs font-bold text-white bg-[#2B72BA] px-2.5 py-0.5 rounded">
                          Route {r.route_number}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {itemGeo.kind === 'EXACT' && (
                            <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ● Verified Path
                            </span>
                          )}
                          {itemGeo.kind === 'CORRIDOR' && (
                            <span className="text-[10px] font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              ● Stop Corridor ({itemGeo.resolvedStopCount}/{itemGeo.totalStops})
                            </span>
                          )}
                          {itemGeo.kind === 'ANCHOR' && (
                            <span className="text-[10px] font-mono font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                              ● Anchor Stop
                            </span>
                          )}
                          {itemGeo.kind === 'NONE' && (
                            <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              ● Sequence Only
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="font-display font-bold text-sm text-[#12161E] mt-1">
                        {r.origin || 'Origin'} → {r.destination || 'Destination'}
                      </h4>

                      {r.via && (
                        <p className="text-[11px] text-[#70798B] mt-0.5 font-body">
                          Via: {r.via}
                        </p>
                      )}

                      {/* Corridor Highways Preview */}
                      {isSelected && r.corridors && r.corridors.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#E5DFD5]">
                          <div className="font-mono text-[10px] uppercase tracking-wider text-[#1B5E6B] font-bold mb-1">
                            Corridor Highway Alignment
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {r.corridors[0].road_names.map((road, idx) => (
                              <span key={idx} className="text-[10px] font-mono text-[#1B5E6B] bg-[#1B5E6B]/10 px-2 py-0.5 rounded">
                                🛣️ {road}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expandable stops preview with Geocoded / Pending tags */}
                      {isSelected && r.stops && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#E5DFD5] space-y-1.5 text-xs">
                          <div className="font-mono text-[10px] uppercase tracking-wider text-[#B87B22] font-semibold flex justify-between">
                            <span>Stop Sequence ({r.stops.length})</span>
                            <span className="text-[#70798B]">
                              {itemGeo.resolvedStopCount} / {itemGeo.totalStops} GPS
                            </span>
                          </div>
                          <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                            {r.stops.map((st) => (
                              <div key={st.stop_id} className="flex items-center justify-between text-[11px]">
                                <span className="text-[#12161E] truncate max-w-[270px]">
                                  {st.sequence_order}. {st.stop_name}
                                </span>
                                {st.latitude != null && st.longitude != null && isValidCoordinate(st.latitude, st.longitude) ? (
                                  <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                                    GPS
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-mono text-[#70798B] bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                                    Pending
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null
          )}
        </div>
      </aside>

      {/* Right Pane: Interactive Map */}
      <main className="flex-1 h-full relative bg-[#F2EEE7]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Selected Landmark Floating Sheet */}
        {selectedPlace && viewMode === 'destinations' && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-10 bg-white/95 backdrop-blur-md border border-[#E5DFD5] p-5 rounded-2xl shadow-xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#B87B22] font-bold">
                  {selectedPlace.category} · {selectedPlace.region || 'Odisha'}
                </span>
                <h3 className="font-display font-bold text-lg text-[#12161E]">{selectedPlace.name}</h3>
              </div>
              <button
                onClick={() => setSelectedPlaceId(null)}
                className="text-[#70798B] hover:text-[#12161E] p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <p className="text-xs font-body text-[#3D4654] line-clamp-2 mb-4 leading-relaxed">
              {selectedPlace.description}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('plan', { placeId: selectedPlace.id })}
                className="flex-1 py-2 bg-[#B87B22] text-white rounded-lg text-xs font-semibold hover:bg-[#A0691B] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">edit_calendar</span>
                <span>Plan Around This Place</span>
              </button>
            </div>
          </div>
        )}

        {/* Selected Experience Floating Sheet */}
        {selectedExperience && viewMode === 'experiences' && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-10 bg-white/95 backdrop-blur-md border border-[#E5DFD5] p-5 rounded-2xl shadow-xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#1B5E6B] font-bold">
                  {selectedExperience.categoryLabel} · {selectedExperience.district}
                </span>
                <h3 className="font-display font-bold text-lg text-[#12161E]">{selectedExperience.name}</h3>
              </div>
              <button
                onClick={() => setSelectedExperience(null)}
                className="text-[#70798B] hover:text-[#12161E] p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <p className="text-xs font-body text-[#3D4654] line-clamp-3 mb-4 leading-relaxed">
              {selectedExperience.description}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('plan', { hub: selectedExperience.district.toLowerCase() })}
                className="flex-1 py-2 bg-[#1B5E6B] text-white rounded-lg text-xs font-semibold hover:bg-[#144752] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">restaurant</span>
                <span>Include in Trip Plan</span>
              </button>
            </div>
          </div>
        )}

        {/* Selected Transit Route Floating Sheet */}
        {activeTransitRoute && viewMode === 'transit' && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-10 bg-white/95 backdrop-blur-md border border-[#E5DFD5] p-5 rounded-2xl shadow-xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#2B72BA] font-bold">
                    Mo Bus Route {activeTransitRoute.route_number}
                  </span>
                  {activeRouteGeometry.kind === 'EXACT' && (
                    <span className="text-[9px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Verified Survey Path
                    </span>
                  )}
                  {activeRouteGeometry.kind === 'CORRIDOR' && (
                    <span className="text-[9px] font-mono font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      Stop Corridor ({activeRouteGeometry.resolvedStopCount}/{activeRouteGeometry.totalStops} GPS)
                    </span>
                  )}
                  {activeRouteGeometry.kind === 'ANCHOR' && (
                    <span className="text-[9px] font-mono font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                      Anchor Stop
                    </span>
                  )}
                  {activeRouteGeometry.kind === 'NONE' && (
                    <span className="text-[9px] font-mono font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      Sequence Only
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-base text-[#12161E]">
                  {activeTransitRoute.origin} → {activeTransitRoute.destination}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRouteId(null)}
                className="text-[#70798B] hover:text-[#12161E] p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div className="text-xs text-[#70798B] font-body mb-3">
              {activeTransitRoute.stops_count} sequence stops · {activeTransitRoute.service_area || activeTransitRoute.region || 'Odisha'}
            </div>

            {activeTransitRoute.corridors && activeTransitRoute.corridors.length > 0 && (
              <div className="mb-3 p-2 bg-[#FBF9F5] rounded-lg border border-[#E5DFD5] text-[11px] font-mono text-[#1B5E6B]">
                <div className="font-bold text-[10px] uppercase text-[#70798B] mb-0.5">Arterial Highway</div>
                {activeTransitRoute.corridors[0].road_names.join(' · ')}
              </div>
            )}

            <button
              onClick={() => onNavigate('plan', { hub: activeTransitRoute.origin || '', route: activeTransitRoute.route_number })}
              className="w-full py-2 bg-[#2B72BA] text-white rounded-lg text-xs font-semibold hover:bg-[#1E5799] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">directions_bus</span>
              <span>Plan Transit Journey</span>
            </button>
          </div>
        )}
        {/* Selected Medical Floating Sheet */}
        {selectedMedicalId && viewMode === 'medical' && (() => {
          const med = displayedMedical.find(m => m.id === selectedMedicalId);
          if (!med) return null;
          return (
            <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-10 bg-white/95 backdrop-blur-md border border-red-200 p-5 rounded-2xl shadow-xl animate-in slide-in-from-bottom duration-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-red-600 font-bold">
                    24/7 Emergency Medical Facility
                  </span>
                  <h3 className="font-display font-bold text-lg text-[#12161E]">{med.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedMedicalId(null)}
                  className="text-[#70798B] hover:text-[#12161E] p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <p className="text-xs font-body text-[#3D4654] line-clamp-2 mb-3 leading-relaxed">
                {med.description || 'Major tertiary healthcare facility with 24/7 emergency & trauma response.'}
              </p>
              <div className="text-xs font-mono text-red-700 bg-red-50 p-2 rounded-lg mb-3 flex items-center justify-between">
                <span>📍 {med.distanceFormatted} away</span>
                <a href="tel:108" className="font-bold flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-sm">call</span>
                  <span>Dial 108</span>
                </a>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigate('plan', { placeId: med.id })}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">directions</span>
                  <span>Plan Route to Hospital</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Selected ATM Floating Sheet */}
        {selectedAtmId && (viewMode === 'atms' || viewMode === 'atm') && (() => {
          const atm = displayedAtms.find(a => a.id === selectedAtmId);
          if (!atm) return null;
          return (
            <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-10 bg-white/95 backdrop-blur-md border border-teal-200 p-5 rounded-2xl shadow-xl animate-in slide-in-from-bottom duration-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-teal-700 font-bold">
                    {atm.status}
                  </span>
                  <h3 className="font-display font-bold text-lg text-[#12161E]">{atm.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedAtmId(null)}
                  className="text-[#70798B] hover:text-[#12161E] p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <p className="text-xs font-body text-[#3D4654] mb-3 leading-relaxed">
                {atm.address} ({atm.district})
              </p>
              <div className="text-xs font-mono text-teal-800 bg-teal-50 p-2 rounded-lg mb-3 flex items-center justify-between">
                <span>📍 {atm.distanceFormatted} away</span>
                <span className="font-bold">{atm.bank}</span>
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
};
