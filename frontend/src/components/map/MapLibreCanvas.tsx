import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Map, NavigationControl, AttributionControl, Popup, Marker, setWorkerUrl, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreglWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { DEFAULT_MAP_CONFIG, MAP_STYLES, type MapStyleOption } from '../../config/mapConfig';
import { Layers, Compass } from 'lucide-react';

// Configure MapLibre self-contained worker bundle URL for Vite dev and production
if (typeof window !== 'undefined' && maplibreglWorkerUrl) {
  setWorkerUrl(maplibreglWorkerUrl);
}

export interface MapPlaceMarker {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  verificationStatus?: 'VERIFIED_CANONICAL' | 'FIELD_VALIDATED' | 'PROVISIONAL';
}

interface MapLibreCanvasProps {
  places?: MapPlaceMarker[];
  selectedPlaceId?: string | null;
  onSelectPlace?: (placeId: string) => void;
  className?: string;
  showStyleSelector?: boolean;
  cluster?: boolean;
  center?: [number, number];
  zoom?: number;
}

export const MapLibreCanvas: React.FC<MapLibreCanvasProps> = ({
  places = [],
  selectedPlaceId = null,
  onSelectPlace,
  className = 'w-full h-full min-h-[450px]',
  showStyleSelector = true,
  cluster = true,
  center,
  zoom,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const activeMarkerRef = useRef<Marker | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const [activeStyleId, setActiveStyleId] = useState<string>('liberty');
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // GeoJSON feature collection from places
  const createGeoJSON = useCallback((): GeoJSON.FeatureCollection => {
    return {
      type: 'FeatureCollection',
      features: places
        .filter((p) => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng))
        .map((p) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [p.lng, p.lat],
          },
          properties: {
            id: p.id,
            name: p.name,
            category: p.category,
            imageUrl: p.imageUrl || '',
            verificationStatus: p.verificationStatus || 'VERIFIED_CANONICAL',
          },
        })),
    };
  }, [places]);

  // Set up MapLibre GL instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialStyleUrl = DEFAULT_MAP_CONFIG.styleUrl || MAP_STYLES.liberty.url;

    const map = new Map({
      container: mapContainerRef.current,
      style: initialStyleUrl,
      center: center || DEFAULT_MAP_CONFIG.defaultCenter,
      zoom: zoom || DEFAULT_MAP_CONFIG.defaultZoom,
      minZoom: DEFAULT_MAP_CONFIG.minZoom,
      maxZoom: DEFAULT_MAP_CONFIG.maxZoom,
      attributionControl: false,
    });

    map.addControl(
      new NavigationControl({
        visualizePitch: true,
        showCompass: true,
      }),
      'top-right'
    );

    map.addControl(
      new AttributionControl({
        compact: true,
        customAttribution: '© OpenFreeMap • © OpenStreetMap contributors • Built by Algoryxz',
      }),
      'bottom-right'
    );

    const setupLayers = () => {
      const geojson = createGeoJSON();

      if (map.getSource('places-source')) {
        (map.getSource('places-source') as GeoJSONSource).setData(geojson);
        return;
      }

      map.addSource('places-source', {
        type: 'geojson',
        data: geojson,
        cluster: cluster,
        clusterMaxZoom: 14,
        clusterRadius: 45,
      });

      if (cluster) {
        // Cluster circles
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'places-source',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#B87B22',
              10,
              '#A84825',
              25,
              '#1B5E6B',
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              18,
              10,
              22,
              25,
              28,
            ],
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#FFFFFF',
          },
        });

        // Cluster count text
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'places-source',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-size': 12,
          },
          paint: {
            'text-color': '#FFFFFF',
          },
        });
      }

      // Individual unclustered place points
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'places-source',
        filter: cluster ? ['!', ['has', 'point_count']] : undefined,
        paint: {
          'circle-color': '#FFFFFF',
          'circle-radius': 7,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#B87B22',
        },
      });

      // Cluster click: expand and zoom in
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0]?.properties?.cluster_id;
        if (clusterId == null) return;

        const source = map.getSource('places-source') as GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((targetZoom) => {
          if (targetZoom != null) {
            map.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: targetZoom,
            });
          }
        }).catch(() => {});
      });

      // Unclustered point click: select and open popup
      map.on('click', 'unclustered-point', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;

        const coordinates = (feature.geometry as any).coordinates.slice();
        const { id, name, category, imageUrl, verificationStatus } = feature.properties as any;

        if (popupRef.current) {
          popupRef.current.remove();
        }

        const popupHtml = `
          <div class="p-3 max-w-[260px] font-body text-left">
            ${imageUrl ? `<img src="${imageUrl}" alt="${name}" class="w-full h-24 object-cover rounded-lg mb-2" />` : ''}
            <div class="text-[10px] font-mono uppercase tracking-wider text-[#B87B22] font-semibold mb-0.5">
              ${category}
            </div>
            <h4 class="font-display font-bold text-sm text-[#12161E] leading-tight mb-1">
              ${name}
            </h4>
            <div class="flex items-center gap-1.5 text-[10px] text-[#70798B] mt-2">
              <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DFD5] font-mono text-[#0D5C3A] font-bold">
                ✓ ${verificationStatus || 'VERIFIED'}
              </span>
            </div>
          </div>
        `;

        popupRef.current = new Popup({ offset: 12, closeButton: false })
          .setLngLat(coordinates)
          .setHTML(popupHtml)
          .addTo(map);

        if (onSelectPlace && id) {
          onSelectPlace(id);
        }
      });

      // Cursor interaction states
      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
      });
    };

    map.on('error', (e) => {
      if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
        console.warn('[MapLibre Canvas Event]', e.error?.message || e);
      }
    });

    map.on('load', () => {
      map.resize();
      setIsMapLoaded(true);
      setupLayers();
      try {
        map.setMaxBounds(DEFAULT_MAP_CONFIG.odishaBounds);
      } catch {
        // ignore bounds constraint on small mobile viewports
      }
    });

    map.on('style.load', () => {
      if (isMapLoaded) {
        setupLayers();
      }
    });

    // ResizeObserver ensures canvas automatically tracks container dimensions
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    mapRef.current = map;

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (popupRef.current) popupRef.current.remove();
      if (activeMarkerRef.current) activeMarkerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update GeoJSON data when places change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    const source = map.getSource('places-source') as GeoJSONSource | undefined;
    if (source && typeof source.setData === 'function') {
      source.setData(createGeoJSON());
    }
  }, [places, isMapLoaded, createGeoJSON]);

  // Highlight and fly to selected place
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    if (!selectedPlaceId) {
      if (activeMarkerRef.current) {
        activeMarkerRef.current.remove();
        activeMarkerRef.current = null;
      }
      return;
    }

    const target = places.find((p) => p.id === selectedPlaceId);
    if (!target || !target.lat || !target.lng) return;

    map.flyTo({
      center: [target.lng, target.lat],
      zoom: Math.max(map.getZoom(), 12.5),
      speed: 1.2,
      curve: 1.4,
      essential: true,
    });

    // Render prominent pulsing halo pin for selected place
    if (activeMarkerRef.current) {
      activeMarkerRef.current.remove();
    }

    const el = document.createElement('div');
    el.className = 'relative flex items-center justify-center pointer-events-none';
    el.innerHTML = `
      <div class="absolute w-12 h-12 rounded-full bg-[#B87B22]/30 animate-ping"></div>
      <div class="w-8 h-8 rounded-full bg-[#B87B22] text-white flex items-center justify-center shadow-lg ring-2 ring-white">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
        </svg>
      </div>
    `;

    activeMarkerRef.current = new Marker({ element: el })
      .setLngLat([target.lng, target.lat])
      .addTo(map);
  }, [selectedPlaceId, places, isMapLoaded]);

  const handleStyleChange = useCallback((styleOption: MapStyleOption) => {
    if (!mapRef.current) return;
    setActiveStyleId(styleOption.id);
    mapRef.current.setStyle(styleOption.url);
  }, []);

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
    <div className={`relative rounded-xl overflow-hidden border border-[#E5DFD5] shadow-xs ${className}`} data-testid="maplibre-canvas">
      {/* MapLibre WebGL Mount */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />

      {/* Style Toggle (Liberty baseline) */}
      {showStyleSelector && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-lg border border-[#E5DFD5] shadow-xs text-xs font-body">
          <Layers className="w-3.5 h-3.5 text-[#70798B] shrink-0" />
          <span className="text-[11px] font-mono text-[#70798B] mr-1 hidden sm:inline">Style:</span>
          {Object.values(MAP_STYLES).map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleChange(style)}
              title={style.description}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                activeStyleId === style.id
                  ? 'bg-[#B87B22] text-white font-bold shadow-xs'
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
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#E5DFD5] shadow-xs text-xs font-mono text-[#3D4654] hover:text-[#12161E] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-[#B87B22]" />
          <span>Odisha Overview</span>
        </button>
      </div>
    </div>
  );
};
