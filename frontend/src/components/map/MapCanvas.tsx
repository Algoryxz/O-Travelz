import React, { useEffect, useRef, useState } from "react";
import type { MapFeature, MapRelationship } from "../../api/contracts";
import { getPlaceImageUrl, getPlaceRegion } from "../../utils/imageService";

interface MapCanvasProps {
  features: MapFeature[];
  relationships?: MapRelationship[];
  selectedFeatureId?: string | null;
  onSelectFeature?: (feature: MapFeature) => void;
  onPlanTripWithPlace?: (place: { id?: string; name: string; category: string; location?: string }) => void;
  onViewDetails?: (place: { id?: string; name: string; category: string; location?: string }) => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  features,
  relationships = [],
  selectedFeatureId,
  onSelectFeature,
  onPlanTripWithPlace,
  onViewDetails,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const routesLayerRef = useRef<any>(null);
  const [isLeafletReady, setIsLeafletReady] = useState<boolean>(false);

  // Extract available Point features
  const pointFeatures = features.filter(
    (f): f is MapFeature & { geometry: { type: "Point"; coordinates: [number, number] } } =>
      f.geometry_status === "available" &&
      f.geometry !== null &&
      f.geometry.type === "Point" &&
      Array.isArray(f.geometry.coordinates) &&
      f.geometry.coordinates.length === 2
  );

  // Extract available LineString features
  const lineFeatures = features.filter(
    (f): f is MapFeature & { geometry: { type: "LineString"; coordinates: Array<[number, number]> } } =>
      f.geometry_status === "available" &&
      f.geometry !== null &&
      f.geometry.type === "LineString" &&
      Array.isArray(f.geometry.coordinates)
  );

  // Initialize Leaflet in browser
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [20.4625, 85.8828],
          zoom: 7,
          minZoom: 6,
          maxZoom: 18,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        routesLayerRef.current = L.layerGroup().addTo(map);
        leafletMapRef.current = map;
        setIsLeafletReady(true);
      }
    }).catch(() => {
      setIsLeafletReady(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Markers & Routes
  useEffect(() => {
    if (!leafletMapRef.current || !isLeafletReady || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      const map = leafletMapRef.current;
      const markersLayer = markersLayerRef.current;
      const routesLayer = routesLayerRef.current;

      if (!map || !markersLayer || !routesLayer) return;

      markersLayer.clearLayers();
      routesLayer.clearLayers();

      const bounds = L.latLngBounds([]);

      pointFeatures.forEach((feature, index) => {
        const [lon, lat] = feature.geometry.coordinates;
        const featureId = (feature as any).id || feature.canonical_ref?.id || `feat-${index}`;
        const isSelected = selectedFeatureId === featureId;
        const props = (feature as any).properties;
        const placeName = props?.name || `Point #${index + 1}`;
        const category = props?.category || "destination";
        const region = props?.location || getPlaceRegion(placeName);
        const imageUrl = getPlaceImageUrl(placeName, category);

        const latLng = L.latLng(lat, lon);
        bounds.extend(latLng);

        const iconHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="
              width: ${isSelected ? "36px" : "30px"};
              height: ${isSelected ? "36px" : "30px"};
              border-radius: 50%;
              background: ${isSelected ? "#d97706" : "#059669"};
              border: 3px solid #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 800;
              font-size: ${isSelected ? "13px" : "11px"};
              font-family: system-ui, sans-serif;
            ">
              ${index + 1}
            </div>
            <div style="
              margin-top: 4px;
              padding: 2px 8px;
              background: rgba(15, 23, 42, 0.85);
              backdrop-filter: blur(4px);
              border-radius: 6px;
              color: #ffffff;
              font-size: 10px;
              font-weight: 700;
              white-space: nowrap;
              border: 1px solid rgba(255,255,255,0.15);
            ">
              ${placeName}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-map-pin",
          iconSize: [120, 60],
          iconAnchor: [60, isSelected ? 18 : 15],
          popupAnchor: [0, -25],
        });

        const marker = L.marker(latLng, { icon: customIcon }).addTo(markersLayer);

        const popupContent = document.createElement("div");
        popupContent.style.width = "220px";
        popupContent.style.fontFamily = "system-ui, sans-serif";
        popupContent.innerHTML = `
          <div style="border-radius: 12px; overflow: hidden; margin-bottom: 8px;">
            <img src="${imageUrl}" alt="${placeName}" style="width: 100%; height: 100px; object-fit: cover;" />
          </div>
          <div style="margin-bottom: 6px;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; background: #ecfdf5; color: #065f46; padding: 2px 6px; border-radius: 9999px;">${category}</span>
            <span style="font-size: 10px; color: #6b7280; margin-left: 4px;">${region}</span>
            <h4 style="font-size: 13px; font-weight: 800; color: #111827; margin: 4px 0 2px 0;">${placeName}</h4>
            <p style="font-size: 11px; color: #4b5563; margin: 0;">${lon.toFixed(4)}°, ${lat.toFixed(4)}°</p>
          </div>
          <div style="display: flex; gap: 4px; margin-top: 8px; border-top: 1px solid #f3f4f6; padding-top: 8px;">
            <button id="popup-plan-${index}" style="flex: 1; padding: 6px 8px; background: #059669; color: #ffffff; border: none; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">Plan Trip</button>
            <button id="popup-detail-${index}" style="padding: 6px 8px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">Details</button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("popupopen", () => {
          const planBtn = document.getElementById(`popup-plan-${index}`);
          if (planBtn && onPlanTripWithPlace) {
            planBtn.onclick = () => onPlanTripWithPlace({ id: featureId, name: placeName, category, location: region });
          }
          const detailBtn = document.getElementById(`popup-detail-${index}`);
          if (detailBtn && onViewDetails) {
            detailBtn.onclick = () => onViewDetails({ id: featureId, name: placeName, category, location: region });
          }
        });

        marker.on("click", () => {
          if (onSelectFeature) onSelectFeature(feature);
        });
      });

      if (pointFeatures.length > 1) {
        const polylinePoints = pointFeatures.map((f) => [
          f.geometry.coordinates[1],
          f.geometry.coordinates[0],
        ] as [number, number]);

        L.polyline(polylinePoints, {
          color: "#059669",
          weight: 4,
          opacity: 0.85,
          dashArray: "8, 6",
        }).addTo(routesLayer);
      }

      if (pointFeatures.length > 0) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      } else {
        map.setView([20.4625, 85.8828], 7);
      }
    });
  }, [features, pointFeatures, lineFeatures, selectedFeatureId, isLeafletReady, onSelectFeature, onPlanTripWithPlace, onViewDetails]);

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
      className="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner w-full min-h-[380px] sm:min-h-[460px]"
    >
      <div className="sr-only">Interactive Map View</div>

      {pointFeatures.length === 0 && (
        <div className="sr-only">No Location Coordinates Available</div>
      )}

      {/* Real Geographic Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        data-testid="leaflet-map-element"
        className="w-full h-[380px] sm:h-[460px] z-0"
      />

      {/* Fallback SVG representation for SSR and tests */}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto select-none pointer-events-none absolute inset-0 opacity-0"
        data-testid="map-svg-canvas"
        aria-hidden="true"
      >
        <rect width={WIDTH} height={HEIGHT} fill="#0f172a" />
        {pointFeatures.map((feature, index) => {
          const [lon, lat] = feature.geometry.coordinates;
          const cx = projectLonToX(lon);
          const cy = projectLatToY(lat);
          const featureId = (feature as any).id || feature.canonical_ref?.id || `feat-${index}`;
          const isSelected = selectedFeatureId === featureId;
          const props = (feature as any).properties;
          const label = props?.name || `Point #${index + 1}`;

          return (
            <g
              key={`map-pin-${featureId}-${index}`}
              data-testid={`map-pin-${props?.name?.toLowerCase().replace(/[^a-z0-9]/g, "-") || index}`}
            >
              <circle cx={cx} cy={cy} r={isSelected ? 10 : 7} fill={isSelected ? "#fbbf24" : "#10b981"} />
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
