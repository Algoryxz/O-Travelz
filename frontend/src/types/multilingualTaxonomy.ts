/**
 * Authoritative Multilingual Taxonomy for Frontend.
 *
 * 1:1 verified crosswalk with backend/app/data/multilingual_taxonomy.py.
 * Provides deterministic, zero-fabrication localized labels for:
 *   - 30 Administrative Districts of Odisha
 *   - 16 Canonical Physical Categories
 *   - 12 Canonical Traveler Interests
 *
 * Preserves canonical English identifiers for API requests while enabling
 * native Odia (ଓଡ଼ିଆ) and Hindi (हिन्दी) UI presentation.
 */

export type SupportedLanguage = "en" | "or" | "hi";

export interface LocalizedTaxonomyItem {
  readonly id: string;
  readonly label_en: string;
  readonly label_or: string;
  readonly label_hi: string;
}

// ==============================================================================
// 1. 30 ADMINISTRATIVE DISTRICTS (1:1 with backend DISTRICT_TAXONOMY)
// ==============================================================================

export const MULTILINGUAL_DISTRICTS: readonly LocalizedTaxonomyItem[] = [
  { id: "Angul", label_en: "Angul", label_or: "ଅନୁଗୋଳ", label_hi: "अनुगुल" },
  { id: "Balangir", label_en: "Balangir", label_or: "ବଲାଙ୍ଗୀର", label_hi: "बलांगीर" },
  { id: "Balasore", label_en: "Balasore", label_or: "ବାଲେଶ୍ୱର", label_hi: "बालेश्वर" },
  { id: "Bargarh", label_en: "Bargarh", label_or: "ବରଗଡ଼", label_hi: "बरगढ़" },
  { id: "Bhadrak", label_en: "Bhadrak", label_or: "ଭଦ୍ରକ", label_hi: "भद्रक" },
  { id: "Boudh", label_en: "Boudh", label_or: "ବୌଦ୍ଧ", label_hi: "बौद्ध" },
  { id: "Cuttack", label_en: "Cuttack", label_or: "କଟକ", label_hi: "कटक" },
  { id: "Deogarh", label_en: "Deogarh", label_or: "ଦେବଗଡ଼", label_hi: "देवगढ़" },
  { id: "Dhenkanal", label_en: "Dhenkanal", label_or: "ଢେଙ୍କାନାଳ", label_hi: "ढेंकानाल" },
  { id: "Gajapati", label_en: "Gajapati", label_or: "ଗଜପତି", label_hi: "गजपति" },
  { id: "Ganjam", label_en: "Ganjam", label_or: "ଗଞ୍ଜାମ", label_hi: "गंजाम" },
  { id: "Jagatsinghpur", label_en: "Jagatsinghpur", label_or: "ଜଗତସିଂହପୁର", label_hi: "जगतसिंहपुर" },
  { id: "Jajpur", label_en: "Jajpur", label_or: "ଯାଜପୁର", label_hi: "जाजपुर" },
  { id: "Jharsuguda", label_en: "Jharsuguda", label_or: "ଝାରସୁଗୁଡ଼ା", label_hi: "झारसुगुड़ा" },
  { id: "Kalahandi", label_en: "Kalahandi", label_or: "କଳାହାଣ୍ଡି", label_hi: "कालाहांडी" },
  { id: "Kandhamal", label_en: "Kandhamal", label_or: "କନ୍ଧମାଳ", label_hi: "कंधमाल" },
  { id: "Kendrapara", label_en: "Kendrapara", label_or: "କେନ୍ଦ୍ରାପଡ଼ା", label_hi: "केंद्रापड़ा" },
  { id: "Keonjhar", label_en: "Keonjhar", label_or: "କେନ୍ଦୁଝର", label_hi: "केन्दुझर" },
  { id: "Khordha", label_en: "Khordha", label_or: "ଖୋର୍ଦ୍ଧା", label_hi: "खोर्धा" },
  { id: "Koraput", label_en: "Koraput", label_or: "କୋରାପୁଟ", label_hi: "कोरापुट" },
  { id: "Malkangiri", label_en: "Malkangiri", label_or: "ମାଲକାନଗିରି", label_hi: "मलकानगिरि" },
  { id: "Mayurbhanj", label_en: "Mayurbhanj", label_or: "ମୟୂରଭଞ୍ଜ", label_hi: "मयूरभंज" },
  { id: "Nabarangpur", label_en: "Nabarangpur", label_or: "ନବରଙ୍ଗପୁର", label_hi: "नबरंगपुर" },
  { id: "Nayagarh", label_en: "Nayagarh", label_or: "ନୟାଗଡ଼", label_hi: "नयागढ़" },
  { id: "Nuapada", label_en: "Nuapada", label_or: "ନୂଆପଡ଼ା", label_hi: "नुआपड़ा" },
  { id: "Puri", label_en: "Puri", label_or: "ପୁରୀ", label_hi: "पुरी" },
  { id: "Rayagada", label_en: "Rayagada", label_or: "ରାୟଗଡ଼ା", label_hi: "रायगड़ा" },
  { id: "Sambalpur", label_en: "Sambalpur", label_or: "ସମ୍ବଲପୁର", label_hi: "संबलपुर" },
  { id: "Subarnapur", label_en: "Subarnapur", label_or: "ସୁବର୍ଣ୍ଣପୁର", label_hi: "सुवर्णपुर" },
  { id: "Sundargarh", label_en: "Sundargarh", label_or: "ସୁନ୍ଦରଗଡ଼", label_hi: "सुंदरगढ़" },
] as const;

// ==============================================================================
// 2. 16 CANONICAL PHYSICAL CATEGORIES (1:1 with backend CATEGORY_TAXONOMY)
// ==============================================================================

export const MULTILINGUAL_CATEGORIES: readonly LocalizedTaxonomyItem[] = [
  { id: "temple", label_en: "temple", label_or: "ମନ୍ଦିର", label_hi: "मंदिर" },
  { id: "monument", label_en: "monument", label_or: "ସ୍ମାରକୀ", label_hi: "स्मारक" },
  { id: "museum", label_en: "museum", label_or: "ସଂଗ୍ରହାଳୟ", label_hi: "संग्रहालय" },
  { id: "market", label_en: "market", label_or: "ବଜାର", label_hi: "बाजार" },
  { id: "park", label_en: "park", label_or: "ଉଦ୍ୟାନ", label_hi: "उद्यान" },
  { id: "lake", label_en: "lake", label_or: "ହ୍ରଦ", label_hi: "झील" },
  { id: "beach", label_en: "beach", label_or: "ସମୁଦ୍ର କୂଳ", label_hi: "समुद्र तट" },
  { id: "nature", label_en: "nature", label_or: "ପ୍ରକୃତି", label_hi: "प्रकृति" },
  { id: "waterfall", label_en: "waterfall", label_or: "ଜଳପ୍ରପାତ", label_hi: "जलप्रपात" },
  { id: "wildlife", label_en: "wildlife", label_or: "ବନ୍ୟଜନ୍ତୁ ଅଭୟାରଣ୍ୟ", label_hi: "वन्यजीव अभयारण्य" },
  { id: "planetarium", label_en: "planetarium", label_or: "ତାରାମଣ୍ଡଳ", label_hi: "तारामंडल" },
  { id: "sports_venue", label_en: "sports_venue", label_or: "କ୍ରୀଡ଼ା ପ୍ରାଙ୍ଗଣ", label_hi: "खेल परिसर" },
  { id: "science_center", label_en: "science_center", label_or: "ବିଜ୍ଞାନ କେନ୍ଦ୍ର", label_hi: "विज्ञान केंद्र" },
  { id: "hospital", label_en: "hospital", label_or: "ଡାକ୍ତରଖାନା", label_hi: "अस्पताल" },
  { id: "emergency_facility", label_en: "emergency_facility", label_or: "ଜରୁରୀକାଳୀନ ସେବା", label_hi: "आपातकालीन सुविधा" },
  { id: "transit_hub", label_en: "transit_hub", label_or: "ପରିବହନ କେନ୍ଦ୍ର", label_hi: "परिवहन केंद्र" },
] as const;

// ==============================================================================
// 3. 12 CANONICAL TRAVELER THEMES/INTERESTS (1:1 with backend INTEREST_TAXONOMY)
// ==============================================================================

export const MULTILINGUAL_INTERESTS: readonly LocalizedTaxonomyItem[] = [
  { id: "heritage", label_en: "heritage", label_or: "ଐତିହ୍ୟ", label_hi: "विरासत" },
  { id: "spirituality", label_en: "spirituality", label_or: "ଆଧ୍ୟାତ୍ମିକତା", label_hi: "आध्यात्मिकता" },
  { id: "architecture", label_en: "architecture", label_or: "ସ୍ଥାପତ୍ୟ", label_hi: "वास्तुकला" },
  { id: "food", label_en: "food", label_or: "ଖାଦ୍ୟ", label_hi: "खानपान" },
  { id: "culture", label_en: "culture", label_or: "ସଂସ୍କୃତି", label_hi: "संस्कृति" },
  { id: "nature", label_en: "nature", label_or: "ପ୍ରକୃତି", label_hi: "प्रकृति" },
  { id: "beach", label_en: "beach", label_or: "ବେଳାଭୂମି", label_hi: "समुद्र तट" },
  { id: "wildlife", label_en: "wildlife", label_or: "ବନ୍ୟଜୀବନ", label_hi: "वन्यजीव" },
  { id: "waterfall", label_en: "waterfall", label_or: "ଜଳପ୍ରପାତ", label_hi: "जलप्रपात" },
  { id: "relaxation", label_en: "relaxation", label_or: "ବିଶ୍ରାମ", label_hi: "विश्राम" },
  { id: "adventure", label_en: "adventure", label_or: "ଦୁଃସାହସିକ ଯାତ୍ରା", label_hi: "साहसिक यात्रा" },
  { id: "shopping", label_en: "shopping", label_or: "କିଣାକିଣି", label_hi: "खरीदारी" },
] as const;

// ==============================================================================
// 4. LOOKUP INDEXES & DETERMINISTIC ACCESSORS
// ==============================================================================

const _DISTRICT_MAP = new Map<string, LocalizedTaxonomyItem>(
  MULTILINGUAL_DISTRICTS.map((item) => [item.id, item])
);

const _CATEGORY_MAP = new Map<string, LocalizedTaxonomyItem>(
  MULTILINGUAL_CATEGORIES.map((item) => [item.id, item])
);

const _INTEREST_MAP = new Map<string, LocalizedTaxonomyItem>(
  MULTILINGUAL_INTERESTS.map((item) => [item.id, item])
);

export function getLocalizedDistrictLabel(
  canonicalDistrict: string,
  language: SupportedLanguage = "en"
): string {
  const item = _DISTRICT_MAP.get(canonicalDistrict);
  if (!item) return canonicalDistrict;
  if (language === "or") return item.label_or;
  if (language === "hi") return item.label_hi;
  return item.label_en;
}

export function getLocalizedCategoryLabel(
  canonicalCategory: string,
  language: SupportedLanguage = "en"
): string {
  const item = _CATEGORY_MAP.get(canonicalCategory);
  if (!item) return canonicalCategory;
  if (language === "or") return item.label_or;
  if (language === "hi") return item.label_hi;
  return item.label_en;
}

export function getLocalizedInterestLabel(
  canonicalInterest: string,
  language: SupportedLanguage = "en"
): string {
  const item = _INTEREST_MAP.get(canonicalInterest);
  if (!item) return canonicalInterest;
  if (language === "or") return item.label_or;
  if (language === "hi") return item.label_hi;
  return item.label_en;
}
