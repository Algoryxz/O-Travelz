/**
 * O-TRAVELZ V4 — Map Configuration & Vector Tile Endpoints
 * Baseline: OpenFreeMap Liberty style (OpenStreetMap vector schema)
 * Configurable via VITE_MAP_TILE_STYLE_URL environment variable.
 */

export interface MapStyleOption {
  id: string;
  name: string;
  url: string;
  description: string;
}

export const MAP_STYLES: Record<string, MapStyleOption> = {
  liberty: {
    id: 'liberty',
    name: 'Liberty (Default)',
    url: 'https://tiles.openfreemap.org/styles/liberty',
    description: 'Clean, full-featured topographic and road cartography.',
  },
  positron: {
    id: 'positron',
    name: 'Positron (Light Minimal)',
    url: 'https://tiles.openfreemap.org/styles/positron',
    description: 'Subdued high-contrast light cartography for overlaying corridors.',
  },
  bright: {
    id: 'bright',
    name: 'Bright',
    url: 'https://tiles.openfreemap.org/styles/bright',
    description: 'High-visibility roads and boundary demarcation.',
  },
};

export const DEFAULT_MAP_CONFIG = {
  /** Configurable style endpoint via env or fallback to Liberty */
  styleUrl:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAP_TILE_STYLE_URL) ||
    MAP_STYLES.liberty.url,

  /** Canonical Odisha center [Longitude, Latitude] */
  defaultCenter: [85.8245, 20.2961] as [number, number],

  /** Default state-level zoom */
  defaultZoom: 7.2,

  /** Minimum and maximum allowable zoom levels */
  minZoom: 5.5,
  maxZoom: 18,

  /** Geographic bounding box for Odisha [minLng, minLat, maxLng, maxLat] */
  odishaBounds: [
    [81.0, 17.5], // Southwest coordinates
    [87.8, 22.8], // Northeast coordinates
  ] as [[number, number], [number, number]],
};
