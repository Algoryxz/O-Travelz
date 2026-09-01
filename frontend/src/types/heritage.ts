/**
 * Digital Heritage 3D Reconstruction & Provenance TypeScript Contracts.
 * Synchronized with backend/app/schemas/heritage.py.
 */

export type HeritageSceneType =
  | 'REAL_3D_RECONSTRUCTION'
  | 'REFERENCE_VIRTUAL_EXPERIENCE'
  | 'RECONSTRUCTION_IN_PROGRESS';

export type HeritageStatus =
  | 'AVAILABLE'
  | 'LOADING'
  | 'PROCESSING'
  | 'REFERENCE_ONLY'
  | 'UNAVAILABLE';

export interface HeritageHotspot {
  id: string;
  title: string;
  odia_title?: string;
  description: string;
  architectural_significance: string;
  position: [number, number, number];
  look_at?: [number, number, number];
  camera_offset?: [number, number, number];
}

export interface HeritageSource {
  title: string;
  source: string;
  license: string;
  url?: string;
  access_date: string;
  content_type: string;
  attribution?: string;
}

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  min_distance: number;
  max_distance: number;
  fov: number;
}

export interface AssetMetadata {
  format: string;
  model_url?: string;
  splat_url?: string;
  progressive_low_res_url?: string;
  point_count?: number;
  mesh_quality: string;
  coordinate_system: string;
  file_size_bytes?: number;
}

export interface HeritageScene {
  id: string;
  name: string;
  odia_name: string;
  district: string;
  century: string;
  category: string;
  description: string;
  scene_type: HeritageSceneType;
  status: HeritageStatus;
  asset: AssetMetadata;
  thumbnail: string;
  hero_banner?: string;
  hotspots: HeritageHotspot[];
  sources: HeritageSource[];
  reconstruction_notes: string;
  camera_preset: CameraPreset;
  lighting_preset: string;
  surrounding_environment?: string;
  is_canonical: boolean;
}
