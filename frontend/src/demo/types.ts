import type {
  ItineraryPlanResponse,
  PlaceSummary,
  TransportHop,
} from "../api/contracts";

export type CrowdLevel = "low" | "moderate" | "high";
export type PlaceVariant =
  | "attraction"
  | "cafe"
  | "gaming"
  | "cinema"
  | "mall"
  | "restaurant"
  | "sports"
  | "medical"
  | "atm"
  | "transport";
export type LocationMode = "live" | "manual";
export type NearbyTab = "all" | "open" | "rated" | "nearest";
export type DemoStatus =
  | "OPEN NOW"
  | "CLOSING SOON"
  | "CLOSED"
  | "AVAILABLE"
  | "OUT OF SERVICE"
  | "STATUS UNAVAILABLE";

export type DemoPlace = PlaceSummary & {
  variant: PlaceVariant;
  location: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  open: boolean;
  openUntil?: string;
  crowd: CrowdLevel;
  priceRange?: string;
  verified: boolean;
  liveData: boolean;
  accessible: boolean;
  img: string;
  alt: string;
  badge?: string;
  meta?: string[];
  status?: DemoStatus;
};

export type EssentialPlace = PlaceSummary & {
  address: string;
  distanceKm: number;
  status: DemoStatus;
  contact?: string;
  note?: string;
  verified: boolean;
};

export type DemoMapPin = {
  x: number;
  y: number;
  name: string;
  type: string;
  crowd: CrowdLevel;
};

export type DemoItineraryItem = {
  time: string;
  icon: string;
  place: PlaceSummary;
  location: string;
  cost: string;
  crowd: CrowdLevel;
  verified: boolean;
};

export type DemoPlanStep = {
  icon: string;
  place: PlaceSummary;
  distance: string;
  travel_time: string;
  price: string;
  verified: boolean;
  status: DemoStatus;
};

export type ResponsibleTourismItem = {
  destination: PlaceSummary;
  pressure: number;
  alternatives: PlaceSummary[];
  alternativeNote: string;
};

export type DemoItineraryContract = ItineraryPlanResponse & {
  days: Array<ItineraryPlanResponse["days"][number] & { hops: TransportHop[] }>;
};
