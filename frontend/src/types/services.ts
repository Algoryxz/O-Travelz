/**
 * Canonical Type Definitions for O-Travelz Traveller Essentials & Local Services Layer
 * Authoritative contracts for healthcare, police, safety advisories, accommodation, dining, fuel, transit, and banking.
 */

export type ServiceCategory =
  | "healthcare"
  | "police"
  | "safety"
  | "hotel"
  | "restaurant"
  | "fuel"
  | "transit"
  | "atm";

export type ServiceSubcategory =
  | "hospital"
  | "chc"
  | "phc"
  | "emergency_facility"
  | "clinic"
  | "police_station"
  | "police_outpost"
  | "tourist_police"
  | "coastal_police"
  | "hotel_otdc_panthanivas"
  | "hotel_resort"
  | "hotel_heritage"
  | "hotel_budget"
  | "hotel_guest_house"
  | "homestay"
  | "eco_retreat"
  | "restaurant"
  | "dhaba"
  | "vegetarian"
  | "coastal_cuisine"
  | "cafe"
  | "heritage_dining"
  | "petrol_pump"
  | "fuel_station"
  | "cng_station"
  | "mo_bus_stop"
  | "bus_stand"
  | "railway_station"
  | "ferry_ghat"
  | "bank_atm"
  | "cash_point"
  | "sbi_atm"
  | "postal_payment"
  | "emergency_contact"
  | "disaster_helpline"
  | "forest_range_office";

export interface ServiceRecord {
  id: string;
  name: string;
  category: ServiceCategory;
  subcategory: ServiceSubcategory;
  district: string;
  locality?: string;
  lat: number;
  lon: number;
  address: string;
  phone?: string | null;
  emergency_phone?: string | null;
  is_24x7?: boolean;
  opening_hours?: string | null;
  amenities?: string[];
  fuel_types?: string[];
  routes_served?: string[];
  bank_name?: string | null;
  cuisine?: string | null;
  price_tier?: "budget" | "moderate" | "premium" | null;
  source: string;
  source_url?: string | null;
  source_type: "government" | "health_department" | "police_department" | "tourism_department" | "transport_authority" | "osm" | "official_registry";
  verification_status: "verified" | "cross_checked" | "pending";
  data_type: "static" | "dynamic";
  last_verified: string;
  notes?: string | null;
}

export type DistanceSemantics =
  | "straight_line_haversine"
  | "walking_estimate"
  | "driving_estimate"
  | "road_network_exact";

export interface NearbyServiceResult extends ServiceRecord {
  distanceKm: number;
  distanceFormatted: string;
  distance_semantics?: DistanceSemantics;
  estimatedDriveMinutes: number;
  estimatedWalkMinutes: number;
}

export interface EmergencyContact {
  label: string;
  number: string;
  service_type: "all_emergency" | "police" | "ambulance" | "fire" | "tourist_helpline" | "forest_department" | "coastal_security" | "disaster_control";
  is_24x7: boolean;
}

export interface SafetyAdvisoryItem {
  category: "water_safety" | "wildlife_caution" | "terrain_access" | "heat_weather" | "temple_etiquette" | "monument_protection" | "general_safety";
  title: string;
  guidance: string;
  severity: "info" | "caution" | "warning";
}

export interface DestinationSafetyAdvisory {
  destination_id: string;
  destination_name: string;
  district: string;
  nearest_police_station_id: string;
  nearest_police_station_name: string;
  nearest_hospital_id: string;
  nearest_hospital_name: string;
  emergency_contacts: EmergencyContact[];
  safety_advisories: SafetyAdvisoryItem[];
  network_connectivity?: "good_4g_5g" | "moderate_cellular" | "patchy_rural" | "low_remote";
  best_visiting_hours?: string | null;
  source: string;
  source_url?: string | null;
  last_verified: string;
}

export interface NearbyServicesGrouped {
  destinationId?: string;
  destinationName?: string;
  activeRadiusKm: number;
  isExpanded: boolean;
  totalServicesCount: number;
  healthcare: NearbyServiceResult[];
  police: NearbyServiceResult[];
  hotels: NearbyServiceResult[];
  restaurants: NearbyServiceResult[];
  fuel: NearbyServiceResult[];
  transit: NearbyServiceResult[];
  atms: NearbyServiceResult[];
  safetyAdvisory?: DestinationSafetyAdvisory | null;
}

export interface ServiceSearchParams {
  lat: number;
  lon: number;
  category?: ServiceCategory;
  subcategory?: ServiceSubcategory;
  radiusKm?: number;
  minResults?: number;
  maxRadiusKm?: number;
  limit?: number;
}
