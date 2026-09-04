import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Map, NavigationControl, AttributionControl, Popup, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DEFAULT_MAP_CONFIG, MAP_STYLES, type MapStyleOption } from '../../config/mapConfig';
import { MapPin, Layers, Navigation, Info, Compass, ShieldCheck } from 'lucide-react';

export interface MapPlaceMarker {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  rating?: number;
  verificationStatus?: 'VERIFIED_CANONICAL' | 'FIELD_VALIDATED' | 'PROVISIONAL';
}

interface MapLibreCanvasProps {
  places?: MapPlaceMarker[];
  selectedPlaceId?: string | null;
  onSelectPlace?: (placeId: string) => void;
  className?: string;
  showStyleSelector?: boolean;
}

export const MapLibreCanvas: React.FC<MapLibreCanvasProps> = ({
  places = [],
  selectedPlaceId = null,
  onSelectPlace,
  className = 'w-full h-full min-h-[500px]',
  showStyleSelector = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const [activeStyleId, setActiveStyleId] = useState<string>('liberty');
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // Initialize MapLibre GL map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialStyleUrl =
      DEFAULT_MAP_CONFIG.styleUrl || MAP_STYLES.liberty.url;

    const map = new Map({
      container: mapContainerRef.current,
      style: initialStyleUrl,
      center: DEFAULT_MAP_CONFIG.defaultCenter,
      zoom: DEFAULT_MAP_CONFIG.defaultZoom,
      minZoom: DEFAULT_MAP_CONFIG.minZoom,
      maxZoom: DEFAULT_MAP_CONFIG.maxZoom,
      attributionControl: false,
    });

    // Add navigation controls (zoom, compass/bearing)
    map.addControl(
      new NavigationControl({
        visualizePitch: true,
        showCompass: true,
      }),
      'top-right'
    );

    // Add attribution with proper open-source credit
    map.addControl(
      new AttributionControl({
        compact: true,
        customAttribution: '© OpenFreeMap • © OpenStreetMap contributors • Built by Algoryxz',
      }),
      'bottom-right'
    );

    map.on('load', () => {
      setIsMapLoaded(true);
      // Fit to Odisha bounds if requested
      try {
        map.setMaxBounds(DEFAULT_MAP_CONFIG.odishaBounds);
      } catch {
        // ignore bounds constraint errors on small mobile viewports
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update style when user toggles
  const handleStyleChange = useCallback((styleOption: MapStyleOption) => {
    if (!mapRef.current) return;
    setActiveStyleId(styleOption.id);
    mapRef.current.setStyle(styleOption.url);
  }, []);

  // Plot places markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    places.forEach((place) => {
      if (!place.lat || !place.lng) return;

      // Custom marker DOM element
      const el = document.createElement('div');
      el.className = 'group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110';

      const isSelected = place.id === selectedPlaceId;
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
            isSelected
              ? 'bg-[#B87B22] text-white ring-4 ring-[#B87B22]/30 scale-125'
              : 'bg-white text-[#12161E] ring-1 ring-[#E5DFD5] hover:bg-[#FAF7F2]'
          }">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ${isSelected ? 'text-white' : 'text-[#B87B22]'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `;

      // Popup
      const popupHtml = `
        <div class="p-2.5 max-w-[240px] font-body text-left">
          ${place.imageUrl ? `<img src="${place.imageUrl}" alt="${place.name}" class="w-full h-24 object-cover rounded-md mb-2" />` : ''}
          <div class="text-[10px] font-mono uppercase tracking-wider text-[#B87B22] font-semibold mb-0.5">
            ${place.category}
          </div>
          <h4 class="font-display font-bold text-sm text-[#12161E] leading-tight mb-1">
            ${place.name}
          </h4>
          <div class="flex items-center gap-1.5 text-[11px] text-[#70798B] mt-2">
            <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DFD5] font-mono text-[10px]">
              ${place.verificationStatus || 'VERIFIED'}
            </span>
          </div>
        </div>
      `;

      const popup = new Popup({ offset: 25, closeButton: false }).setHTML(popupHtml);

      const marker = new Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', () => {
        if (onSelectPlace) {
          onSelectPlace(place.id);
        }
      });

      markersRef.current[place.id] = marker;
    });
  }, [places, isMapLoaded, selectedPlaceId, onSelectPlace]);

  // Center on selected place
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlaceId) return;

    const target = places.find((p) => p.id === selectedPlaceId);
    if (target && target.lat && target.lng) {
      map.flyTo({
        center: [target.lng, target.lat],
        zoom: Math.max(map.getZoom(), 12),
        speed: 1.2,
        curve: 1.4,
        essential: true,
      });

      const marker = markersRef.current[target.id];
      if (marker && !marker.getPopup().isOpen()) {
        marker.togglePopup();
      }
    }
  }, [selectedPlaceId, places]);

  // Reset to state-level view
  const handleResetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: DEFAULT_MAP_CONFIG.defaultCenter,
      zoom: DEFAULT_MAP_CONFIG.defaultZoom,
      pitch: 0,
      bearing: 0,
      essential: true,
    });
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-[#E5DFD5] shadow-xs ${className}`}>
      {/* MapLibre DOM Mount */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />

      {/* Floating Style Controls (Liberty baseline) */}
      {showStyleSelector && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-lg border border-[#E5DFD5] shadow-sm text-xs font-body">
          <Layers className="w-3.5 h-3.5 text-[#70798B] shrink-0" />
          <span className="text-[11px] font-mono text-[#70798B] mr-1 hidden sm:inline">Style:</span>
          {Object.values(MAP_STYLES).map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleChange(style)}
              title={style.description}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                activeStyleId === style.id
                  ? 'bg-[#B87B22] text-white font-bold'
                  : 'text-[#3D4654] hover:bg-[#FAF7F2]'
              }`}
            >
              {style.name.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {/* State View Reset Button */}
      <div className="absolute bottom-3 left-3 z-10">
        <button
          onClick={handleResetView}
          title="Reset to Odisha State Overview"
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#E5DFD5] shadow-sm text-xs font-mono text-[#3D4654] hover:text-[#12161E] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-[#B87B22]" />
          <span>Reset View</span>
        </button>
      </div>
    </div>
  );
};
