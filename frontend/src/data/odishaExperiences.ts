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

export function getFoodExperiencesForRegion(region: string): OdishaExperience[] {
  return ODISHA_EXPERIENCES.filter(e =>
    (e.type === 'food_experience' || e.type === 'restaurant') &&
    (e.region.toLowerCase().includes(region.toLowerCase()) || region.toLowerCase().includes(e.region.toLowerCase()))
  );
}
