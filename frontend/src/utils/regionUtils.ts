/**
 * Authoritative Odisha district taxonomy and deterministic travel region crosswalk for Frontend.
 */
import seedPlacesData from "../../../data/places/places.json";

export const ODISHA_DISTRICTS = [
  "Angul",
  "Balangir",
  "Balasore",
  "Bargarh",
  "Bhadrak",
  "Boudh",
  "Cuttack",
  "Deogarh",
  "Dhenkanal",
  "Gajapati",
  "Ganjam",
  "Jagatsinghpur",
  "Jajpur",
  "Jharsuguda",
  "Kalahandi",
  "Kandhamal",
  "Kendrapara",
  "Keonjhar",
  "Khordha",
  "Koraput",
  "Malkangiri",
  "Mayurbhanj",
  "Nabarangpur",
  "Nayagarh",
  "Nuapada",
  "Puri",
  "Rayagada",
  "Sambalpur",
  "Subarnapur",
  "Sundargarh",
] as const;

export type OdishaDistrict = (typeof ODISHA_DISTRICTS)[number];

export const CANONICAL_REGIONS = [
  "All Regions",
  "Puri & Coastal",
  "Konark & Marine",
  "Bhubaneswar & Central",
  "Cuttack & Mahanadi",
  "Chilika & Southern Coast",
  "Kandhamal & Southern Hills",
  "Sambalpur & Western Odisha",
  "Rourkela & Sundargarh",
  "Northern Odisha & Wildlife",
  "Koraput & Tribal Highlands",
] as const;

export type CanonicalRegion = (typeof CANONICAL_REGIONS)[number];

export const DISTRICT_TO_REGION_MAP: Record<string, string> = {
  // Central
  Khordha: "Bhubaneswar & Central",
  Nayagarh: "Bhubaneswar & Central",
  // Coastal & Marine
  Puri: "Puri & Coastal",
  // Mahanadi Delta
  Cuttack: "Cuttack & Mahanadi",
  Jagatsinghpur: "Cuttack & Mahanadi",
  Dhenkanal: "Cuttack & Mahanadi",
  Angul: "Cuttack & Mahanadi",
  Jajpur: "Cuttack & Mahanadi",
  // Southern Coast & Lagoons
  Ganjam: "Chilika & Southern Coast",
  Gajapati: "Chilika & Southern Coast",
  // Southern Hills
  Kandhamal: "Kandhamal & Southern Hills",
  Boudh: "Kandhamal & Southern Hills",
  // Western Odisha
  Sambalpur: "Sambalpur & Western Odisha",
  Bargarh: "Sambalpur & Western Odisha",
  Jharsuguda: "Sambalpur & Western Odisha",
  Deogarh: "Sambalpur & Western Odisha",
  Balangir: "Sambalpur & Western Odisha",
  Subarnapur: "Sambalpur & Western Odisha",
  Nuapada: "Sambalpur & Western Odisha",
  // Sundargarh
  Sundargarh: "Rourkela & Sundargarh",
  // Northern & Wildlife
  Mayurbhanj: "Northern Odisha & Wildlife",
  Balasore: "Northern Odisha & Wildlife",
  Bhadrak: "Northern Odisha & Wildlife",
  Kendrapara: "Northern Odisha & Wildlife",
  Keonjhar: "Northern Odisha & Wildlife",
  // Tribal Highlands
  Koraput: "Koraput & Tribal Highlands",
  Rayagada: "Koraput & Tribal Highlands",
  Nabarangpur: "Koraput & Tribal Highlands",
  Malkangiri: "Koraput & Tribal Highlands",
  Kalahandi: "Koraput & Tribal Highlands",
};

export const PLACE_REGION_OVERRIDES: Record<string, string> = {
  // Konark Marine Corridor within Puri District
  place_konark_001: "Konark & Marine",
  place_konark_002: "Konark & Marine",
  place_konark_003: "Konark & Marine",
  place_konark_004: "Konark & Marine",
  place_food_009: "Konark & Marine",
  // Chilika Wetland Corridor within Khordha & Puri Districts
  place_chilika_001: "Chilika & Southern Coast",
  place_chilika_002: "Chilika & Southern Coast",
  place_chilika_003: "Chilika & Southern Coast",
};

function getRegionFromDistrict(district?: string | null, placeId?: string | null): string {
  if (placeId && placeId in PLACE_REGION_OVERRIDES) {
    return PLACE_REGION_OVERRIDES[placeId];
  }
  if (!district) {
    return "Bhubaneswar & Central";
  }
  const cleanDistrict =
    district.charAt(0).toUpperCase() + district.slice(1).toLowerCase();
  return DISTRICT_TO_REGION_MAP[cleanDistrict] || "Bhubaneswar & Central";
}

// Build exact canonical lookup maps from seed data
const CANONICAL_PLACE_ID_TO_REGION: Record<string, string> = {};
const CANONICAL_PLACE_NAME_TO_REGION: Record<string, string> = {};

for (const p of seedPlacesData as any[]) {
  const derivedRegion = getRegionFromDistrict(p.district, p.id);
  if (p.id) {
    CANONICAL_PLACE_ID_TO_REGION[p.id] = derivedRegion;
  }
  if (p.name) {
    CANONICAL_PLACE_NAME_TO_REGION[p.name.trim().toLowerCase()] = derivedRegion;
  }
}

/**
 * Deterministically derive travel region from administrative district, place ID, or place name.
 */
export function getRegionForPlace(
  districtOrName?: string | null,
  placeId?: string | null
): string {
  // 1. Direct place ID lookup
  if (placeId && placeId in CANONICAL_PLACE_ID_TO_REGION) {
    return CANONICAL_PLACE_ID_TO_REGION[placeId];
  }
  if (placeId && placeId in PLACE_REGION_OVERRIDES) {
    return PLACE_REGION_OVERRIDES[placeId];
  }

  if (!districtOrName) {
    return "Bhubaneswar & Central";
  }

  const normalizedInput = districtOrName.trim();

  // 2. Direct district lookup
  const cleanDistrict =
    normalizedInput.charAt(0).toUpperCase() + normalizedInput.slice(1).toLowerCase();
  if (cleanDistrict in DISTRICT_TO_REGION_MAP) {
    return DISTRICT_TO_REGION_MAP[cleanDistrict];
  }

  // 3. Exact canonical place name lookup
  const nameKey = normalizedInput.toLowerCase();
  if (nameKey in CANONICAL_PLACE_NAME_TO_REGION) {
    return CANONICAL_PLACE_NAME_TO_REGION[nameKey];
  }

  // 4. Fallback default
  return "Bhubaneswar & Central";
}
