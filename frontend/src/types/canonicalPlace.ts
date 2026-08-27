/**
 * Canonical Place and Spatial Intelligence Data Model for O-Travelz.
 * Represents a single unified schema for destinations, hotels, dining, safety, utilities, and transit.
 */

export type PlaceCategory =
  | 'destination'
  | 'restaurant'
  | 'hotel'
  | 'hospital'
  | 'pharmacy'
  | 'atm'
  | 'petrol'
  | 'police'
  | 'transit_stop'
  | 'experience'
  | 'craft'
  | 'rail_station'
  | 'airport'
  | 'parking'
  | 'ev_charger'
  | 'other';

export interface DataSource {
  provider: string;
  sourceUrl?: string;
  providerId?: string;
  retrievedAt?: string;
  effectiveFrom?: string;
  lastVerified?: string;
}

export interface VerificationMetadata {
  status: 'verified' | 'provider' | 'fallback' | 'unknown';
  method?: string;
  verifiedAt?: string;
}

export interface PlaceImage {
  url: string;
  source: string;
  sourceUrl?: string;
  attribution?: string;
  verified: boolean;
  verifiedAt?: string;
  hash?: string;
  isFallback?: boolean;
}

export interface CanonicalPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lon: number;
  address?: string;
  district?: string;
  locality?: string;
  phone?: string;
  website?: string;
  rating?: number;
  ratingCount?: number;
  ratingSource?: string;
  openingHours?: string | Record<string, string>;
  is24x7?: boolean;
  priceTier?: 'free' | 'budget' | 'moderate' | 'premium' | 'luxury';
  image?: PlaceImage;
  source: DataSource;
  verification: VerificationMetadata;
  amenities?: string[];
  tags?: string[];
  description?: string;
  emergencyPhone?: string;
}
