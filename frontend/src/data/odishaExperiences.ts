/**
 * O-Travelz Verified Odisha Experiences & Culinary Seed Dataset
 *
 * Distinguishes "Place to visit" (Destinations) from "Experience to have" (Food, Crafts, Shopping).
 * Fully structured for travel itinerary planning and personality matching.
 */

export type ExperienceType =
  | 'food_experience'
  | 'restaurant'
  | 'shopping'
  | 'mall'
  | 'craft'
  | 'cultural_activity';

export interface OdishaExperience {
  id: string;
  name: string;
  type: ExperienceType;
  categoryLabel: string;
  region: string;
  locality: string;
  district: string;
  lat: number;
  lon: number;
  description: string;
  cuisine?: string;
  dietary_options?: ('vegetarian' | 'non_vegetarian' | 'seafood' | 'sweets' | 'jain_friendly')[];
  price_tier?: 'budget' | 'moderate' | 'premium';
  recommended_time_of_day?: 'morning' | 'afternoon' | 'evening' | 'all_day';
  image_key: string;
  tags: string[];
  is_verified: boolean;
}

export const ODISHA_EXPERIENCES: OdishaExperience[] = [
  // 1. Food Experiences
  {
    id: "exp_pahala_rasgulla",
    name: "Pahala Rasgulla & Chhena Gaja Trail",
    type: "food_experience",
    categoryLabel: "Traditional Sweets",
    region: "Bhubaneswar & Central",
    locality: "Pahala Highway Cluster, NH-16",
    district: "Khurda",
    lat: 20.352,
    lon: 85.875,
    description: "Famous roadside sweet cluster spanning NH-16 between Bhubaneswar and Cuttack, serving steaming fresh brown Pahala rasgulla, chhena gaja, and chhena poda straight from earthen pots.",
    cuisine: "Odia Traditional Sweets",
    dietary_options: ["vegetarian", "sweets"],
    price_tier: "budget",
    recommended_time_of_day: "afternoon",
    image_key: "exp_pahala_rasgulla",
    tags: ["rasgulla", "sweets", "pahala", "chhena", "dessert", "highway_stop"],
    is_verified: true,
  },
  {
    id: "exp_puri_mahaprasad",
    name: "Ananda Bazaar Mahaprasad Experience",
    type: "food_experience",
    categoryLabel: "Sacred Temple Feast",
    region: "Puri & Coastal",
    locality: "Jagannath Temple Complex, Puri",
    district: "Puri",
    lat: 19.805,
    lon: 85.818,
    description: "World's largest open-air food market inside the sacred Jagannath Temple, offering authentic Chappan Bhog cooked in earthen pots on wood fires (Kanika, Dalma, Khechedi, Besara, Khaja).",
    cuisine: "Sacred Temple Cuisine (No onion, no garlic)",
    dietary_options: ["vegetarian", "jain_friendly"],
    price_tier: "budget",
    recommended_time_of_day: "afternoon",
    image_key: "exp_puri_mahaprasad",
    tags: ["mahaprasad", "temple_food", "puri", "dalma", "khaja", "sacred"],
    is_verified: true,
  },
  {
    id: "exp_cuttack_dahibara",
    name: "Cuttack Barabati Dahibara Aloodum",
    type: "food_experience",
    categoryLabel: "Iconic Street Food",
    region: "Cuttack & Mahanadi",
    locality: "Barabati Fort & Bidanasi, Cuttack",
    district: "Cuttack",
    lat: 20.481,
    lon: 85.867,
    description: "The crown jewel of Odisha street food: light fermented lentil vadas soaked in spiced yogurt water, served with rich spicy aloodum, ghuguni curry, fresh coriander, and severing sev.",
    cuisine: "Odia Street Food",
    dietary_options: ["vegetarian"],
    price_tier: "budget",
    recommended_time_of_day: "morning",
    image_key: "exp_cuttack_dahibara",
    tags: ["dahibara", "cuttack", "street_food", "breakfast", "spicy"],
    is_verified: true,
  },
  {
    id: "exp_nayagarh_chhenapoda",
    name: "Nayagarh Authentic Chhena Poda",
    type: "food_experience",
    categoryLabel: "Heritage Dessert",
    region: "Western Highlands",
    locality: "Dasapalla / Nayagarh Town",
    district: "Nayagarh",
    lat: 20.128,
    lon: 85.105,
    description: "The birthplace of Odisha's roasted cheese cake—fresh cottage cheese kneaded with sugar, cardamom, and cashew, slow-baked wrapped in Sal leaves over burning charcoal for hours until caramelized.",
    cuisine: "Traditional Odia Bakery",
    dietary_options: ["vegetarian", "sweets"],
    price_tier: "budget",
    recommended_time_of_day: "all_day",
    image_key: "exp_nayagarh_chhenapoda",
    tags: ["chhenapoda", "nayagarh", "sweets", "roasted_cheese", "sal_leaf"],
    is_verified: true,
  },
  {
    id: "exp_chilika_seafood",
    name: "Satapada Fresh Lagoon Crab & Tiger Prawns",
    type: "food_experience",
    categoryLabel: "Coastal Lagoon Seafood",
    region: "Chilika & Southern Coast",
    locality: "Satapada Marine Jetty, Chilika",
    district: "Puri",
    lat: 19.675,
    lon: 85.435,
    description: "Freshly harvested Chilika Lake mud crabs, jumbo tiger prawns, and pomfret prepared with mustard paste, curry leaves, and green chillies at water-edge coastal shacks.",
    cuisine: "Chilika Coastal Seafood",
    dietary_options: ["non_vegetarian", "seafood"],
    price_tier: "moderate",
    recommended_time_of_day: "afternoon",
    image_key: "exp_chilika_seafood",
    tags: ["seafood", "prawns", "crab", "chilika", "satapada", "lagoon"],
    is_verified: true,
  },

  // 2. Crafts & Cultural Experiences
  {
    id: "exp_raghurajpur_craft",
    name: "Raghurajpur Heritage Pattachitra Village",
    type: "craft",
    categoryLabel: "Heritage Art Village",
    region: "Puri & Coastal",
    locality: "Raghurajpur Village, near Puri",
    district: "Puri",
    lat: 19.882,
    lon: 85.834,
    description: "Centuries-old artisan settlement where every household practices traditional palm-leaf engraving, stone carving, and Pattachitra scroll painting with natural mineral pigments.",
    price_tier: "moderate",
    recommended_time_of_day: "morning",
    image_key: "exp_raghurajpur_craft",
    tags: ["pattachitra", "raghurajpur", "handicrafts", "palm_leaf", "heritage_village"],
    is_verified: true,
  },
  {
    id: "exp_pipili_applique",
    name: "Pipili Applique Artisan Bazaar",
    type: "craft",
    categoryLabel: "Textile & Applique Art",
    region: "Bhubaneswar & Central",
    locality: "Main Road, Pipili",
    district: "Puri",
    lat: 20.115,
    lon: 85.832,
    description: "Vibrant craft colony famous for intricate cloth patch-work lanterns (Chandua), umbrellas for Rath Yatra, wall hangings, and ceremonial decorative arts.",
    price_tier: "budget",
    recommended_time_of_day: "afternoon",
    image_key: "exp_pipili_applique",
    tags: ["pipili", "applique", "chandua", "textile", "rath_yatra", "craft"],
    is_verified: true,
  },

  // 3. Shopping & Markets
  {
    id: "exp_ekamra_haat",
    name: "Ekamra Haat Urban Craft & Food Village",
    type: "shopping",
    categoryLabel: "Cultural Craft Bazaar",
    region: "Bhubaneswar & Central",
    locality: "Unit 3, Bhubaneswar",
    district: "Khurda",
    lat: 20.274,
    lon: 85.839,
    description: "Sprawling open-air village market in central Bhubaneswar featuring master weaver stalls (Boyanika, Sambalpuri), Dhokra metal casts, terracotta art, and authentic Odia food court (Pakhala, Dalma).",
    price_tier: "budget",
    recommended_time_of_day: "evening",
    image_key: "exp_ekamra_haat",
    tags: ["ekamra_haat", "bhubaneswar", "handloom", "dhokra", "pakhala", "shopping"],
    is_verified: true,
  },
  {
    id: "exp_esplanade_one",
    name: "Esplanade One Shopping & Entertainment",
    type: "mall",
    categoryLabel: "Modern Shopping Mall",
    region: "Bhubaneswar & Central",
    locality: "Rasulgarh, Bhubaneswar",
    district: "Khurda",
    lat: 20.298,
    lon: 85.864,
    description: "Odisha's premier shopping and lifestyle destination featuring international brands, multiscreen cinema, and diverse dining.",
    price_tier: "premium",
    recommended_time_of_day: "evening",
    image_key: "exp_esplanade_one",
    tags: ["mall", "esplanade", "shopping", "bhubaneswar", "lifestyle"],
    is_verified: true,
  },
  {
    id: "exp_boyanika_handloom",
    name: "Boyanika Sambalpuri Handloom Emporium",
    type: "shopping",
    categoryLabel: "State Handloom Weavers",
    region: "Bhubaneswar & Central",
    locality: "Janpath, Saheed Nagar, Bhubaneswar",
    district: "Khurda",
    lat: 20.285,
    lon: 85.845,
    description: "Government apex society for handloom weavers featuring authentic Sambalpuri Ikat sarees, Bomkai, Pasapalli silks, and handwoven natural cotton fabrics.",
    price_tier: "moderate",
    recommended_time_of_day: "all_day",
    image_key: "exp_boyanika_handloom",
    tags: ["boyanika", "ikat", "sambalpuri", "silk", "handloom", "saheed_nagar"],
    is_verified: true,
  }
];

export function getExperiencesByType(type?: ExperienceType): OdishaExperience[] {
  if (!type) return ODISHA_EXPERIENCES;
  return ODISHA_EXPERIENCES.filter(e => e.type === type);
}

export function getFoodExperiencesForRegion(regionOrDistrict: string): OdishaExperience[] {
  const norm = regionOrDistrict.toLowerCase().trim();
  return ODISHA_EXPERIENCES.filter(e => {
    if (e.type !== 'food_experience' && e.type !== 'restaurant') return false;
    const expDist = (e.district || '').toLowerCase();
    const expReg = (e.region || '').toLowerCase();
    const expLoc = (e.locality || '').toLowerCase();
    return (
      expDist.includes(norm) ||
      norm.includes(expDist) ||
      expReg.includes(norm) ||
      norm.includes(expReg) ||
      expLoc.includes(norm) ||
      norm.includes(expLoc)
    );
  });
}

/**
 * Deterministic multi-day culinary schedule builder.
 * Guarantees that no culinary experience is repeated across days in the entire generated itinerary.
 * Strictly enforces geographic eligibility: distant experiences are never assigned merely to fill a slot.
 * If no geographically eligible experience is available for a day, that day receives no entry (slot omitted).
 */
export function buildItineraryCulinarySchedule(
  days: Array<{ day_number: number; stops?: Array<{ place?: { id?: string | null; name?: string | null; district?: string | null; region?: string | null; lat?: number | null; lon?: number | null } }> }>,
  placesCatalog?: Array<{ id?: string | null; name?: string | null; district?: string | null; region?: string | null; lat?: number | null; lon?: number | null }>
): Map<number, OdishaExperience> {
  const schedule = new Map<number, OdishaExperience>();
  const usedIds = new Set<string>();
  const usedNormalizedNames = new Set<string>();

  const allFoodExperiences = ODISHA_EXPERIENCES.filter(
    e => e.type === 'food_experience' || e.type === 'restaurant'
  );

  // Compact Haversine helper
  const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  for (const day of days) {
    // 1. Gather districts & regions and coordinates from all stops on this day
    const dayLocations = new Set<string>();
    const dayCoords: Array<{ lat: number; lon: number }> = [];

    if (day.stops) {
      for (const stop of day.stops) {
        if (!stop.place) continue;
        if (stop.place.district) dayLocations.add(stop.place.district.toLowerCase().trim());
        if (stop.place.region) dayLocations.add(stop.place.region.toLowerCase().trim());

        if (stop.place.lat != null && stop.place.lon != null) {
          dayCoords.push({ lat: stop.place.lat, lon: stop.place.lon });
        }

        // Look up stop in catalog for richer location info
        if (placesCatalog && placesCatalog.length > 0) {
          const matched = placesCatalog.find(
            p => p.id === stop.place?.id || (p.name && stop.place?.name && p.name.toLowerCase().trim() === stop.place.name.toLowerCase().trim())
          );
          if (matched) {
            if (matched.district) dayLocations.add(matched.district.toLowerCase().trim());
            if (matched.region) dayLocations.add(matched.region.toLowerCase().trim());
            if (matched.lat != null && matched.lon != null) {
              dayCoords.push({ lat: matched.lat, lon: matched.lon });
            }
          }
        }
      }
    }

    // 2. Score candidates based on geographic proximity
    const scoredCandidates: Array<{ exp: OdishaExperience; score: number; minDistanceKm: number }> = [];

    for (const exp of allFoodExperiences) {
      const normName = exp.name.toLowerCase().trim();
      if (usedIds.has(exp.id) || usedNormalizedNames.has(normName)) {
        continue; // Strictly skip already used experiences
      }

      const expDist = (exp.district || '').toLowerCase().trim();
      const expReg = (exp.region || '').toLowerCase().trim();

      let score = 0;
      let minDistanceKm = 9999;

      if (dayCoords.length > 0 && exp.lat != null && exp.lon != null) {
        for (const coord of dayCoords) {
          const d = haversineKm(coord.lat, coord.lon, exp.lat, exp.lon);
          if (!isNaN(d) && d < minDistanceKm) {
            minDistanceKm = d;
          }
        }
      }

      // Check district & regional match
      for (const loc of dayLocations) {
        if (expDist && (expDist === loc || expDist.includes(loc) || loc.includes(expDist))) {
          score += 20;
        } else if (expReg && (expReg === loc || expReg.includes(loc) || loc.includes(expReg))) {
          score += 8;
        }
      }

      // Distance-based bonus or disqualification
      if (minDistanceKm <= 35) {
        score += 15;
      } else if (minDistanceKm <= 75) {
        score += 5;
      } else if (minDistanceKm > 95 && score < 20) {
        // Distant place in another region/district (>95 km): disqualify completely
        score = 0;
      }

      // ONLY include candidates that actually have positive geographic relevance
      if (score > 0) {
        scoredCandidates.push({ exp, score, minDistanceKm });
      }
    }

    // Sort descending by score, then nearest distance
    scoredCandidates.sort((a, b) => b.score - a.score || a.minDistanceKm - b.minDistanceKm);

    // 3. Assign the top eligible candidate ONLY if score > 0
    if (scoredCandidates.length > 0 && scoredCandidates[0].score > 0) {
      const chosen = scoredCandidates[0].exp;
      usedIds.add(chosen.id);
      usedNormalizedNames.add(chosen.name.toLowerCase().trim());
      schedule.set(day.day_number, chosen);
    }
    // If no candidate has score > 0, no schedule entry is added (slot remains clean/empty)
  }

  return schedule;
}
