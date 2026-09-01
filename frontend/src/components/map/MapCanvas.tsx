import React, { useEffect, useRef, useState, useMemo } from "react";
import type { MapFeature, MapRelationship } from "../../types/api";
import { getPlaceImageUrl, getPlaceRegion } from "../../utils/imageService";
import {
  Search,
  Crosshair,
  Layers as LayersIcon,
  X,
  Compass,
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertCircle,
  Car,
} from "lucide-react";

interface MapCanvasProps {
  features: MapFeature[];
  relationships?: MapRelationship[];
  selectedFeatureId?: string | null;
  userLocation?: { lat: number; lon: number } | null;
  userLocationName?: string;
  onSelectFeature?: (feature: MapFeature) => void;
  onPlanTripWithPlace?: (place: { id?: string; name: string; category: string; location?: string }) => void;
  onViewDetails?: (place: { id?: string; name: string; category: string; location?: string }) => void;
}

export function getMarkerCategoryColor(category?: string | null): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("police") || cat.includes("safety") || cat.includes("emergency")) return "#2F523E";
  if (cat.includes("hotel") || cat.includes("stay") || cat.includes("resort") || cat.includes("panthanivas") || cat.includes("lodging")) return "#B87B22";
  if (cat.includes("petrol") || cat.includes("fuel") || cat.includes("gas")) return "#D69E2E";
  if (cat.includes("atm") || cat.includes("bank")) return "#0284C7";
  if (cat.includes("transport") || cat.includes("transit") || cat.includes("bus") || cat.includes("rail") || cat.includes("airport")) return "#4A5568";
  if (cat.includes("medical") || cat.includes("hospital") || cat.includes("healthcare")) return "#E53E3E";
  if (cat.includes("food") || cat.includes("restaurant") || cat.includes("cafe") || cat.includes("dhaba") || cat.includes("hangout")) return "#F59E0B";
  if (cat.includes("temple") || cat.includes("heritage") || cat.includes("culture")) return "#D97706";
  if (cat.includes("beach") || cat.includes("lake") || cat.includes("coastal")) return "#0284C7";
  if (cat.includes("nature") || cat.includes("wildlife") || cat.includes("waterfall") || cat.includes("park")) return "#10B981";
  if (cat.includes("museum") || cat.includes("monument") || cat.includes("shopping")) return "#8B5CF6";
  return "#14B8A6";
}

type MapLayerType = "dark" | "satellite";

export const MapCanvas: React.FC<MapCanvasProps> = ({
  features,
  relationships = [],
  selectedFeatureId,
  userLocation,
  userLocationName,
  onSelectFeature,
  onPlanTripWithPlace,
  onViewDetails,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const baseTileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const routesLayerRef = useRef<any>(null);
  const userLayerRef = useRef<any>(null);
  const markerLookupRef = useRef<Map<string, any>>(new Map());

  const [isLeafletReady, setIsLeafletReady] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(7);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>("dark");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);
  const [activeUserPos, setActiveUserPos] = useState<{ lat: number; lon: number } | null>(userLocation || null);

  // Extract available Point features
  const pointFeatures = useMemo(() => {
    return features.filter(
      (f): f is MapFeature & { geometry: { type: "Point"; coordinates: [number, number] } } =>
        f.geometry_status === "available" &&
        f.geometry !== null &&
        f.geometry.type === "Point" &&
        Array.isArray(f.geometry.coordinates) &&
        f.geometry.coordinates.length === 2
    );
  }, [features]);

  // Extract available LineString features
  const lineFeatures = useMemo(() => {
    return features.filter(
      (f): f is MapFeature & { geometry: { type: "LineString"; coordinates: Array<[number, number]> } } =>
        f.geometry_status === "available" &&
        f.geometry !== null &&
        f.geometry.type === "LineString" &&
        Array.isArray(f.geometry.coordinates)
    );
  }, [features]);

  // Search filtered destinations
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return pointFeatures.filter((f) => {
      const name = f.name?.toLowerCase() || "";
      const cat = f.category?.toLowerCase() || "";
      const reg = (f.region || "").toLowerCase();
      return name.includes(q) || cat.includes(q) || reg.includes(q);
    });
  }, [searchQuery, pointFeatures]);

  // 1. Initialize Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;
    let resizeObserver: ResizeObserver | null = null;
    const container = mapContainerRef.current;

    import("leaflet").then((L) => {
      if (!isMounted || !container) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!leafletMapRef.current) {
        const map = L.map(container, {
          center: [20.4625, 85.8828],
          zoom: 7,
          minZoom: 5,
          maxZoom: 18,
          zoomControl: false,
        });

        const darkLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map);

        baseTileLayerRef.current = darkLayer;
        markersLayerRef.current = L.layerGroup().addTo(map);
        routesLayerRef.current = L.layerGroup().addTo(map);
        userLayerRef.current = L.layerGroup().addTo(map);
        leafletMapRef.current = map;
        setIsLeafletReady(true);

        map.on("zoomend", () => {
          setCurrentZoom(map.getZoom());
        });

        map.on("click", (e: any) => {
          setClickedCoords({
            lat: Number(e.latlng.lat.toFixed(4)),
            lon: Number(e.latlng.lng.toFixed(4)),
          });
        });

        setTimeout(() => {
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize();
          }
        }, 100);
      }

      if (typeof ResizeObserver !== "undefined" && container) {
        resizeObserver = new ResizeObserver(() => {
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize();
          }
        });
        resizeObserver.observe(container);
      }
    }).catch(() => {
      setIsLeafletReady(false);
    });

    return () => {
      isMounted = false;
      if (resizeObserver && container) {
        resizeObserver.unobserve(container);
        resizeObserver.disconnect();
      }
    };
  }, []);

  // 2. Switch Map Tile Layers (Dark Base vs Satellite)
  useEffect(() => {
    if (!leafletMapRef.current || !isLeafletReady || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      const map = leafletMapRef.current;
      if (!map) return;

      if (baseTileLayerRef.current) {
        map.removeLayer(baseTileLayerRef.current);
      }

      if (activeLayer === "satellite") {
        baseTileLayerRef.current = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
            maxZoom: 18,
          }
        ).addTo(map);
      } else {
        baseTileLayerRef.current = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
          }
        ).addTo(map);
      }
    });
  }, [activeLayer, isLeafletReady]);

  // 3. Render Markers & Smart Clusters
  useEffect(() => {
    if (!leafletMapRef.current || !isLeafletReady || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      const map = leafletMapRef.current;
      const markersLayer = markersLayerRef.current;
      const routesLayer = routesLayerRef.current;

      if (!map || !markersLayer || !routesLayer) return;

      map.invalidateSize();
      markersLayer.clearLayers();
      routesLayer.clearLayers();
      markerLookupRef.current.clear();

      const bounds = L.latLngBounds([]);
      const zoom = map.getZoom();

      const enableClustering = zoom <= 7 && pointFeatures.length > 15;

      if (enableClustering) {
        const clusterMap = new Map<string, { latSum: number; lonSum: number; items: typeof pointFeatures }>();
        const gridSize = 1.0;

        pointFeatures.forEach((feat) => {
          const [lon, lat] = feat.geometry.coordinates;
          const cellX = Math.floor(lon / gridSize);
          const cellY = Math.floor(lat / gridSize);
          const key = `${cellX}_${cellY}`;

          if (!clusterMap.has(key)) {
            clusterMap.set(key, { latSum: 0, lonSum: 0, items: [] });
          }
          const cluster = clusterMap.get(key)!;
          cluster.latSum += lat;
          cluster.lonSum += lon;
          cluster.items.push(feat);
        });

        clusterMap.forEach((cluster) => {
          const count = cluster.items.length;
          const avgLat = cluster.latSum / count;
          const avgLon = cluster.lonSum / count;
          const clusterLatLng = L.latLng(avgLat, avgLon);
          bounds.extend(clusterLatLng);

          if (count > 1) {
            const clusterHtml = `
              <div style="
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background: linear-gradient(135deg, #14B8A6, #0F766E);
                border: 2.5px solid #ffffff;
                box-shadow: 0 0 16px rgba(20, 184, 166, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-weight: 900;
                font-size: 13px;
                font-family: system-ui, sans-serif;
                cursor: pointer;
              ">
                ${count}
              </div>
            `;

            const clusterIcon = L.divIcon({
              html: clusterHtml,
              className: "custom-map-cluster",
              iconSize: [38, 38],
              iconAnchor: [19, 19],
            });

            const clusterMarker = L.marker(clusterLatLng, { icon: clusterIcon }).addTo(markersLayer);
            clusterMarker.on("click", () => {
              const clusterBounds = L.latLngBounds(
                cluster.items.map((it) => [it.geometry.coordinates[1], it.geometry.coordinates[0]] as [number, number])
              );
              map.fitBounds(clusterBounds, { padding: [40, 40], maxZoom: 10 });
            });
            return;
          }

          const singleFeat = cluster.items[0];
          renderSingleMarker(singleFeat, 0, L, map, markersLayer, bounds);
        });
      } else {
        pointFeatures.forEach((feature, index) => {
          renderSingleMarker(feature, index, L, map, markersLayer, bounds);
        });
      }

      function renderSingleMarker(
        feature: typeof pointFeatures[0],
        index: number,
        L: any,
        map: any,
        layer: any,
        bnds: any
      ) {
        const [lon, lat] = feature.geometry.coordinates;
        const featureId = (feature as any).id || feature.canonical_ref?.id || `feat-${index}`;
        const isSelected = selectedFeatureId === featureId;
        const props = (feature as any).properties;
        const placeName = feature.name || (feature as any).display_name || props?.name || "Destination";
        const category = feature.category || (feature as any).category_name || props?.category || "destination";
        const region = feature.region || props?.location || getPlaceRegion(placeName);
        const imageUrl = getPlaceImageUrl(placeName, category);
        const pinColor = isSelected ? "#F59E0B" : getMarkerCategoryColor(category);

        const latLng = L.latLng(lat, lon);
        bnds.extend(latLng);

        const showLabel = zoom >= 10 || isSelected || pointFeatures.length <= 5;

        const iconHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="
              width: ${isSelected ? "34px" : "28px"};
              height: ${isSelected ? "34px" : "28px"};
              border-radius: 50%;
              background: ${pinColor};
              border: 2.5px solid #ffffff;
              box-shadow: ${isSelected ? "0 0 16px rgba(245, 158, 11, 0.8), 0 4px 10px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.3)"};
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 800;
              font-size: ${isSelected ? "12px" : "11px"};
              font-family: system-ui, sans-serif;
              transition: transform 0.2s ease;
            ">
              ${index + 1}
            </div>
            ${
              showLabel
                ? `<div style="
                    margin-top: 3px;
                    padding: 2px 7px;
                    background: rgba(17, 24, 39, 0.92);
                    backdrop-filter: blur(6px);
                    border-radius: 6px;
                    color: #F8FAFC;
                    font-size: 10px;
                    font-weight: 700;
                    white-space: nowrap;
                    border: 1px solid rgba(255,255,255,0.15);
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  ">
                    ${placeName}
                  </div>`
                : ""
            }
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-map-pin",
          iconSize: [120, showLabel ? 54 : 32],
          iconAnchor: [60, isSelected ? 17 : 14],
          popupAnchor: [0, -20],
        });

        const marker = L.marker(latLng, { icon: customIcon, zIndexOffset: isSelected ? 500 : 10 }).addTo(layer);
        markerLookupRef.current.set(featureId, marker);
        markerLookupRef.current.set(placeName.toLowerCase(), marker);

        const popupContent = document.createElement("div");
        popupContent.style.width = "230px";
        popupContent.style.fontFamily = "system-ui, sans-serif";
        popupContent.innerHTML = `
          <div style="border-radius: 12px; overflow: hidden; margin-bottom: 8px; background: #FBF9F5;">
            <img src="${imageUrl}" alt="${placeName}" style="width: 100%; height: 110px; object-fit: cover;" />
          </div>
          <div style="margin-bottom: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 4px;">
              <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; background: rgba(184, 123, 34, 0.12); color: #B87B22; padding: 2px 6px; border-radius: 9999px; border: 1px solid rgba(184, 123, 34, 0.25);">${category}</span>
              <span style="font-size: 10px; color: #70798B; font-weight: 500;">${region}</span>
            </div>
            <h4 style="font-size: 13px; font-weight: 800; color: #12161E; margin: 2px 0;">${placeName}</h4>
            <p style="font-size: 10px; color: #70798B; margin: 0; font-family: monospace;">${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E</p>
          </div>
          <div style="display: flex; gap: 6px; margin-top: 8px; border-top: 1px solid #E5DFD5; padding-top: 8px;">
            <button id="popup-plan-${featureId}" style="flex: 1; padding: 6px 10px; background: #B87B22; color: #ffffff; border: none; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">Plan Trip</button>
            <button id="popup-detail-${featureId}" style="padding: 6px 10px; background: #FBF9F5; color: #12161E; border: 1px solid #E5DFD5; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">Details</button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("popupopen", () => {
          const planBtn = document.getElementById(`popup-plan-${featureId}`);
          if (planBtn && onPlanTripWithPlace) {
            planBtn.onclick = () => onPlanTripWithPlace({ id: featureId, name: placeName, category, location: region });
          }
          const detailBtn = document.getElementById(`popup-detail-${featureId}`);
          if (detailBtn && onViewDetails) {
            detailBtn.onclick = () => onViewDetails({ id: featureId, name: placeName, category, location: region });
          }
        });

        marker.on("click", () => {
          if (onSelectFeature) onSelectFeature(feature);
        });
      }

      // Render LineStrings
      lineFeatures.forEach((lineFeat) => {
        const lineCoords = lineFeat.geometry.coordinates.map(
          (c) => [c[1], c[0]] as [number, number]
        );
        lineCoords.forEach((pt) => bounds.extend(L.latLng(pt[0], pt[1])));

        L.polyline(lineCoords, {
          color: "#14B8A6",
          weight: 4,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(routesLayer);
      });

      // Render Multimodal Relationships
      relationships.forEach((rel) => {
        rel.legs?.forEach((leg) => {
          if (
            leg.geometry_status === "available" &&
            leg.geometry &&
            leg.geometry.type === "LineString" &&
            Array.isArray(leg.geometry.coordinates) &&
            leg.geometry.coordinates.length > 0
          ) {
            const legCoords = leg.geometry.coordinates.map(
              (c) => [c[1], c[0]] as [number, number]
            );
            legCoords.forEach((pt) => bounds.extend(L.latLng(pt[0], pt[1])));

            const color =
              leg.mode === "train" || leg.mode === "rail"
                ? "#6366F1"
                : leg.mode === "walk"
                ? "#F59E0B"
                : "#14B8A6";

            const dashArray = leg.mode === "walk" ? "4, 4" : undefined;

            L.polyline(legCoords, {
              color,
              weight: leg.mode === "walk" ? 3 : 4,
              opacity: 0.9,
              dashArray,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(routesLayer);
          }
        });
      });

      if (pointFeatures.length > 1 || lineFeatures.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } else if (pointFeatures.length === 1) {
        const [lon, lat] = pointFeatures[0].geometry.coordinates;
        map.setView([lat, lon], 13);
      } else {
        map.setView([20.4625, 85.8828], 7);
      }
    });
  }, [pointFeatures, lineFeatures, relationships, selectedFeatureId, isLeafletReady, currentZoom, onSelectFeature, onPlanTripWithPlace, onViewDetails]);

  // 4. Render User Location Beacon Layer
  useEffect(() => {
    if (!leafletMapRef.current || !isLeafletReady || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      const map = leafletMapRef.current;
      const userLayer = userLayerRef.current;
      if (!map || !userLayer) return;

      userLayer.clearLayers();

      if (activeUserPos && activeUserPos.lat != null && activeUserPos.lon != null) {
        const userLatLng = L.latLng(activeUserPos.lat, activeUserPos.lon);

        L.circle(userLatLng, {
          radius: 300,
          color: "#14B8A6",
          fillColor: "#14B8A6",
          fillOpacity: 0.15,
          weight: 1.5,
        }).addTo(userLayer);

        const userBeaconHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
            <div style="
              position: absolute;
              top: -6px;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: rgba(20, 184, 166, 0.25);
              border: 1px solid rgba(45, 212, 191, 0.6);
              box-shadow: 0 0 16px rgba(20, 184, 166, 0.6);
            "></div>
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: linear-gradient(135deg, #14B8A6, #0284C7);
              border: 3px solid #ffffff;
              box-shadow: 0 0 14px rgba(20, 184, 166, 0.9), 0 4px 10px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 900;
              font-size: 13px;
            ">
              📍
            </div>
            <div style="
              margin-top: 5px;
              padding: 3px 8px;
              background: #0B1220;
              border: 1px solid #14B8A6;
              border-radius: 9999px;
              color: #5EEAD4;
              font-size: 10px;
              font-weight: 800;
              font-family: monospace;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            ">
              ● You are here (${userLocationName || "Live Location"})
            </div>
          </div>
        `;

        const userIcon = L.divIcon({
          html: userBeaconHtml,
          className: "custom-user-beacon",
          iconSize: [160, 65],
          iconAnchor: [80, 20],
          popupAnchor: [0, -25],
        });

        const userMarker = L.marker(userLatLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(userLayer);
        userMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; color: #111827;">
            <div style="font-weight: 800; color: #0F766E; font-size: 12px; display: flex; align-items: center; gap: 4px;">
              <span>📍 Your Live Position</span>
            </div>
            <div style="font-size: 11px; color: #4B5563; margin-top: 2px;">${activeUserPos.lat.toFixed(4)}°N, ${activeUserPos.lon.toFixed(4)}°E</div>
            <div style="font-size: 10px; color: #14B8A6; font-weight: 700; margin-top: 4px;">Verified Location Service Active</div>
          </div>
        `);
      }
    });
  }, [activeUserPos, userLocationName, isLeafletReady]);

  // Handle Search Selection
  const handleSelectSearchResult = (feature: typeof pointFeatures[0]) => {
    const [lon, lat] = feature.geometry.coordinates;
    const placeName = feature.name || "Destination";
    setSearchQuery(placeName);
    setIsSearching(false);

    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([lat, lon], 14, { duration: 1.2 });
      const marker = markerLookupRef.current.get(placeName.toLowerCase());
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 1300);
      }
    }
  };

  // Handle Locate Me Geolocation
  const handleLocateMe = () => {
    setGeoError(null);
    setIsLocating(true);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const newCoords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setActiveUserPos(newCoords);
        if (leafletMapRef.current) {
          leafletMapRef.current.flyTo([newCoords.lat, newCoords.lon], 13, { duration: 1.2 });
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location permission denied. Please allow location access in your browser.");
        } else if (err.code === err.TIMEOUT) {
          setGeoError("Location request timed out. Please try again.");
        } else {
          setGeoError("Unable to retrieve live location coordinates.");
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomOut();
  };
  const handleResetBounds = () => {
    if (leafletMapRef.current && pointFeatures.length > 0) {
      import("leaflet").then((L) => {
        const bounds = L.latLngBounds(
          pointFeatures.map((p) => [p.geometry.coordinates[1], p.geometry.coordinates[0]] as [number, number])
        );
        leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      });
    }
  };

  // Static Projection Dimensions for Fallback SVG
  const WIDTH = 600;
  const HEIGHT = 380;
  const PADDING = 45;

  let minLon = 81.0;
  let maxLon = 87.5;
  let minLat = 17.5;
  let maxLat = 22.5;

  if (pointFeatures.length > 0) {
    const lons = pointFeatures.map((p) => p.geometry.coordinates[0]);
    const lats = pointFeatures.map((p) => p.geometry.coordinates[1]);

    const dataMinLon = Math.min(...lons);
    const dataMaxLon = Math.max(...lons);
    const dataMinLat = Math.min(...lats);
    const dataMaxLat = Math.max(...lats);

    const lonSpan = Math.max(dataMaxLon - dataMinLon, 0.05);
    const latSpan = Math.max(dataMaxLat - dataMinLat, 0.05);

    minLon = dataMinLon - lonSpan * 0.2;
    maxLon = dataMaxLon + lonSpan * 0.2;
    minLat = dataMinLat - latSpan * 0.2;
    maxLat = dataMaxLat + latSpan * 0.2;
  }

  const projectLonToX = (lon: number): number => {
    if (maxLon === minLon) return WIDTH / 2;
    return PADDING + ((lon - minLon) / (maxLon - minLon)) * (WIDTH - 2 * PADDING);
  };

  const projectLatToY = (lat: number): number => {
    if (maxLat === minLat) return HEIGHT / 2;
    return HEIGHT - (PADDING + ((lat - minLat) / (maxLat - minLat)) * (HEIGHT - 2 * PADDING));
  };

  return (
    <div
      data-testid="map-canvas-container"
      className="relative rounded-3xl bg-[#FFFFFF] border border-[#E5DFD5] overflow-hidden shadow-sm w-full min-h-[480px] sm:min-h-[560px]"
    >
      <div className="sr-only">Interactive Map View</div>

      {pointFeatures.length === 0 && (
        <div className="sr-only">No Location Coordinates Available</div>
      )}

      {/* Floating Map Search Bar */}
      <div className="absolute top-4 left-4 z-20 w-72 sm:w-80 max-w-[calc(100%-110px)]">
        <div className="relative">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E5DFD5] shadow-lg text-[#12161E]">
            <Search size={15} className="text-[#B87B22] shrink-0" />
            <input
              type="text"
              data-testid="map-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(true);
              }}
              onFocus={() => setIsSearching(true)}
              placeholder="Search destinations or districts across Odisha..."
              className="w-full bg-transparent text-xs text-[#12161E] placeholder-[#70798B] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearching(false);
                }}
                className="text-[#70798B] hover:text-[#12161E] p-0.5 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Search Autocomplete Dropdown */}
          {isSearching && searchQuery.trim().length > 0 && (
            <div
              data-testid="map-search-dropdown"
              className="absolute top-full mt-1.5 w-full rounded-2xl bg-[#FFFFFF]/98 backdrop-blur-xl border border-[#E5DFD5] shadow-2xl overflow-hidden z-30 max-h-56 overflow-y-auto divide-y divide-[#E5DFD5]"
            >
              {searchResults.length > 0 ? (
                searchResults.slice(0, 6).map((res, idx) => (
                  <button
                    key={`${res.name}-${idx}`}
                    type="button"
                    data-testid={`map-search-result-${idx}`}
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#12161E] hover:bg-[#FAF7F2] hover:text-[#B87B22] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-[#B87B22] shrink-0" />
                      <span className="font-semibold text-[#12161E] truncate max-w-[170px]">{res.name}</span>
                    </div>
                    <span className="text-[10px] text-[#B87B22] uppercase font-mono px-1.5 py-0.5 rounded bg-[#B87B22]/10 border border-[#B87B22]/20">
                      {res.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3.5 py-3 text-xs text-[#70798B] text-center font-medium">
                  No matching destinations found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Controls Cluster (Top-Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Layer Selector Toggle */}
        <div className="relative">
          <button
            type="button"
            data-testid="map-layers-btn"
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            title="Select map layer"
            className="w-10 h-10 rounded-2xl bg-[#FFFFFF]/95 hover:bg-[#FAF7F2] backdrop-blur-md border border-[#E5DFD5] text-[#12161E] shadow-lg flex items-center justify-center transition-colors cursor-pointer"
          >
            <LayersIcon size={16} className="text-[#B87B22]" />
          </button>

          {isLayerMenuOpen && (
            <div
              data-testid="map-layers-menu"
              className="absolute right-0 mt-2 w-52 bg-[#FFFFFF]/98 backdrop-blur-xl border border-[#E5DFD5] rounded-2xl shadow-2xl p-2 z-30 space-y-1"
            >
              <div className="px-2 py-1 text-[10px] font-bold text-[#70798B] uppercase tracking-wider font-mono">
                Map Layers
              </div>
              <button
                type="button"
                data-testid="map-layer-dark"
                onClick={() => {
                  setActiveLayer("dark");
                  setIsLayerMenuOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  activeLayer === "dark" ? "bg-[#FAF7F2] text-[#B87B22] font-bold" : "text-[#3D4654] hover:bg-[#F2EEE7]"
                }`}
              >
                <span>O-Travelz Canvas</span>
                {activeLayer === "dark" && <span className="w-1.5 h-1.5 rounded-full bg-[#B87B22]" />}
              </button>

              <button
                type="button"
                data-testid="map-layer-satellite"
                onClick={() => {
                  setActiveLayer("satellite");
                  setIsLayerMenuOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  activeLayer === "satellite" ? "bg-[#FAF7F2] text-[#B87B22] font-bold" : "text-[#3D4654] hover:bg-[#F2EEE7]"
                }`}
              >
                <span>Esri World Satellite</span>
                {activeLayer === "satellite" && <span className="w-1.5 h-1.5 rounded-full bg-[#B87B22]" />}
              </button>

              {/* Truthful Traffic Disabled Option */}
              <div
                data-testid="map-layer-traffic-disabled"
                title="Traffic data unavailable — no live provider configured"
                className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-[#70798B] opacity-60 flex items-center justify-between cursor-not-allowed border-t border-[#E5DFD5] mt-1 pt-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <Car size={12} />
                  <span>Live Traffic</span>
                </div>
                <span className="text-[9px] uppercase font-mono text-[#70798B]">Unavailable</span>
              </div>
            </div>
          )}
        </div>

        {/* Locate Me Button */}
        <button
          type="button"
          data-testid="map-locate-me-btn"
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Locate my current position"
          className="w-10 h-10 rounded-2xl bg-[#FFFFFF]/95 hover:bg-[#FAF7F2] backdrop-blur-md border border-[#E5DFD5] text-[#12161E] shadow-lg flex items-center justify-center transition-colors cursor-pointer"
        >
          <Crosshair size={16} className={`text-[#B87B22] ${isLocating ? "animate-spin" : ""}`} />
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col rounded-2xl bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E5DFD5] shadow-lg overflow-hidden">
          <button
            type="button"
            data-testid="map-zoom-in-btn"
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-10 h-9 flex items-center justify-center text-[#3D4654] hover:text-[#12161E] hover:bg-[#FAF7F2] transition-colors cursor-pointer border-b border-[#E5DFD5]"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            data-testid="map-zoom-out-btn"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-10 h-9 flex items-center justify-center text-[#3D4654] hover:text-[#12161E] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <ZoomOut size={15} />
          </button>
        </div>

        {/* Reset / Fit All */}
        <button
          type="button"
          data-testid="map-fit-bounds-btn"
          onClick={handleResetBounds}
          title="Fit all destinations"
          className="w-10 h-10 rounded-2xl bg-[#FFFFFF]/95 hover:bg-[#FAF7F2] backdrop-blur-md border border-[#E5DFD5] text-[#12161E] shadow-lg flex items-center justify-center transition-colors cursor-pointer"
        >
          <Maximize2 size={15} className="text-[#B87B22]" />
        </button>
      </div>

      {/* Click Coordinates / Geolocation Error Banner (Bottom-Left) */}
      {(clickedCoords || geoError) && (
        <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5 max-w-[calc(100%-32px)]">
          {geoError && (
            <div
              data-testid="map-geo-error"
              className="p-2.5 rounded-2xl bg-rose-50 backdrop-blur-md border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-lg"
            >
              <AlertCircle size={14} className="shrink-0 text-rose-600" />
              <span>{geoError}</span>
              <button
                type="button"
                onClick={() => setGeoError(null)}
                className="ml-auto text-rose-600 hover:text-rose-900 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {clickedCoords && (
            <div
              data-testid="map-clicked-coords"
              className="px-3 py-1.5 rounded-xl bg-[#FFFFFF]/90 backdrop-blur-md border border-[#E5DFD5] text-[#12161E] text-[11px] font-mono flex items-center gap-2 shadow-lg"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#B87B22]" />
              <span>
                Coordinates: {clickedCoords.lat}°N, {clickedCoords.lon}°E
              </span>
              <button
                type="button"
                onClick={() => setClickedCoords(null)}
                className="text-[#70798B] hover:text-[#12161E] ml-1 cursor-pointer"
              >
                <X size={11} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Real Geographic Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        data-testid="leaflet-map-element"
        className="w-full h-[480px] sm:h-[560px] z-0"
      />

      {/* Fallback SVG representation for SSR and tests */}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto select-none pointer-events-none absolute inset-0 opacity-0"
        data-testid="map-svg-canvas"
        aria-hidden="true"
      >
        <rect width={WIDTH} height={HEIGHT} fill="#FBF9F5" />
        {pointFeatures.map((feature, index) => {
          const [lon, lat] = feature.geometry.coordinates;
          const cx = projectLonToX(lon);
          const cy = projectLatToY(lat);
          const featureId = (feature as any).id || feature.canonical_ref?.id || `feat-${index}`;
          const isSelected = selectedFeatureId === featureId;
          const props = (feature as any).properties;
          const label = feature.name || (feature as any).display_name || props?.name || "Destination";

          return (
            <g
              key={`map-pin-${featureId}-${index}`}
              data-testid={`map-pin-${(feature.name || (feature as any).display_name || props?.name || "destination").toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
            >
              <circle cx={cx} cy={cy} r={isSelected ? 10 : 7} fill={isSelected ? "#F59E0B" : "#14B8A6"} />
              <text x={cx} y={cy + 18} fill="#ffffff" fontSize="10" textAnchor="middle">
                {label} ({lon.toFixed(4)}°, {lat.toFixed(4)}°)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
