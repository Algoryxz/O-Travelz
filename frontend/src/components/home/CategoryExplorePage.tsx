import React from "react";
import {
  ArrowLeft,
  Mountain,
  Hospital,
  Landmark,
  WalletCards,
  Coffee,
  ShoppingBag,
  MapPin,
  Compass,
  Heart,
} from "lucide-react";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import type { SelectedPlaceInfo } from "../place/PlaceDetailsModal";

interface CategoryExplorePageProps {
  category?: string;
  categoryName?: string;
  selectedLocation?: string;
  onBack: () => void;
  onPlanTripWithCategory?: (category: string) => void;
  onPlanWithSinglePlace?: (place: SelectedPlaceInfo) => void;
  onOpenMap: (place?: SelectedPlaceInfo) => void;
  onSelectPlace?: (place: SelectedPlaceInfo) => void;
}

interface PlaceItem {
  id: string;
  name: string;
  subtitle: string;
  distance: string;
  status: string;
  rating: number;
  tags: string[];
}

const CATEGORY_DATA: Record<
  string,
  {
    icon: typeof Mountain;
    tagline: string;
    description: string;
    places: PlaceItem[];
  }
> = {
  "Nature": {
    icon: Mountain,
    tagline: "WILDLIFE, WETLANDS & OUTDOORS",
    description: "Explore Odisha's pristine lakes, tiger reserves, waterfalls, and coastal sanctuaries.",
    places: [
      {
        id: "nature-1",
        name: "Chilika Lake",
        subtitle: "Asia's largest brackish water lagoon · Nalabana Bird Sanctuary",
        distance: "104 km from Bhubaneswar",
        status: "Open now",
        rating: 4.8,
        tags: ["Eco-tourism", "Boating", "Birds"],
      },
      {
        id: "nature-2",
        name: "Daringbadi Hill Station",
        subtitle: "Coffee gardens, pine forests and mist-covered valleys",
        distance: "250 km from Bhubaneswar",
        status: "Open now",
        rating: 4.7,
        tags: ["Pine Forest", "Waterfalls", "Viewpoint"],
      },
      {
        id: "nature-3",
        name: "Similipal National Park",
        subtitle: "UNESCO Biosphere Reserve & Tiger Sanctuary",
        distance: "260 km from Bhubaneswar",
        status: "Seasonal permits",
        rating: 4.6,
        tags: ["Wildlife", "Safaris", "Waterfalls"],
      },
      {
        id: "nature-4",
        name: "Bhitarkanika Mangroves",
        subtitle: "Saltwater crocodile habitat and dense delta mangroves",
        distance: "160 km from Bhubaneswar",
        status: "Open now",
        rating: 4.7,
        tags: ["Mangroves", "Crocodiles", "Boat safari"],
      },
    ],
  },
  "Medical Help": {
    icon: Hospital,
    tagline: "EMERGENCY & HEALTHCARE",
    description: "24/7 emergency rooms, trauma centers, tertiary hospitals, and pharmacies in Bhubaneswar and nearby regions.",
    places: [
      {
        id: "med-1",
        name: "AIIMS Bhubaneswar",
        subtitle: "Sijua, Patrapada · 24/7 Emergency & Critical Care",
        distance: "6.2 km",
        status: "Open 24 Hours",
        rating: 4.8,
        tags: ["24/7 Emergency", "Multispeciality", "Pharmacy"],
      },
      {
        id: "med-2",
        name: "Capital Hospital",
        subtitle: "Unit 6, Bhubaneswar · Government Tertiary Care",
        distance: "2.4 km",
        status: "Open 24 Hours",
        rating: 4.2,
        tags: ["Casualty", "Blood Bank", "Free Care"],
      },
      {
        id: "med-3",
        name: "Apollo Hospitals Bhubaneswar",
        subtitle: "Sainik School Road, Unit 15",
        distance: "3.8 km",
        status: "Open 24 Hours",
        rating: 4.6,
        tags: ["Super Speciality", "ICU", "Ambulance"],
      },
      {
        id: "med-4",
        name: "SUM Ultimate Medicare",
        subtitle: "Kalinga Nagar, Ghatikia",
        distance: "8.1 km",
        status: "Open 24 Hours",
        rating: 4.7,
        tags: ["Advanced Trauma", "Diagnostics", "24/7 ER"],
      },
    ],
  },
  "Heritage & Culture": {
    icon: Landmark,
    tagline: "KALINGA ARCHITECTURE & MONUMENTS",
    description: "Centuries-old stone temples, rock-cut caves, maritime heritage, and Odishan historical monuments.",
    places: [
      {
        id: "her-1",
        name: "Lingaraj Temple",
        subtitle: "11th-century Kalinga architecture masterpiece",
        distance: "4.5 km · Old Town",
        status: "06:00 - 21:00",
        rating: 4.9,
        tags: ["Temple", "Kalinga Style", "Heritage"],
      },
      {
        id: "her-2",
        name: "Konark Sun Temple",
        subtitle: "13th-century UNESCO World Heritage monumental chariot",
        distance: "65 km · Marine Drive",
        status: "06:00 - 20:00",
        rating: 4.9,
        tags: ["UNESCO Heritage", "Stone Carvings", "Monument"],
      },
      {
        id: "her-3",
        name: "Mukteswar Temple",
        subtitle: "The gem of Odishan architecture · Famous torana archway",
        distance: "4.1 km · Old Town",
        status: "06:30 - 19:30",
        rating: 4.8,
        tags: ["10th Century", "Torana Arch", "Pond"],
      },
      {
        id: "her-4",
        name: "Dhauli Shanti Stupa",
        subtitle: "Peace pagoda and historic Ashokan rock edicts",
        distance: "8.5 km · Daya River Bank",
        status: "06:00 - 20:00",
        rating: 4.7,
        tags: ["Buddhism", "Ashoka Edicts", "Panoramic View"],
      },
    ],
  },
  "ATMs": {
    icon: WalletCards,
    tagline: "CASH POINTS & BANKING",
    description: "Convenient cash points and ATM kiosks across Bhubaneswar and transit hubs.",
    places: [
      {
        id: "atm-1",
        name: "SBI ATM, Jaydev Vihar",
        subtitle: "Adjacent to Pal Heights · 24/7 Cash dispenser",
        distance: "0.4 km",
        status: "Operational",
        rating: 4.5,
        tags: ["Cash Withdrawal", "24/7", "SBI"],
      },
      {
        id: "atm-2",
        name: "HDFC Bank ATM, Master Canteen",
        subtitle: "Near Bhubaneswar Railway Station",
        distance: "1.8 km",
        status: "Operational",
        rating: 4.6,
        tags: ["Cash Deposit", "24/7", "HDFC"],
      },
      {
        id: "atm-3",
        name: "ICICI Bank ATM, Saheed Nagar",
        subtitle: "Janpath Road, Saheed Nagar",
        distance: "2.1 km",
        status: "Operational",
        rating: 4.4,
        tags: ["Fast Cash", "24/7", "ICICI"],
      },
      {
        id: "atm-4",
        name: "Axis Bank ATM, Khandagiri Square",
        subtitle: "Near Khandagiri Caves Entrance",
        distance: "5.3 km",
        status: "Operational",
        rating: 4.3,
        tags: ["Kiosk", "24/7", "Axis"],
      },
    ],
  },
  "Hangout & Chill": {
    icon: Coffee,
    tagline: "CAFÉS, SPORTS & LEISURE",
    description: "Relaxed cafés, modern sports complexes, and recreational arenas to unwind in Bhubaneswar.",
    places: [
      {
        id: "hang-1",
        name: "Brewbakes Café",
        subtitle: "Speciality roast, artisanal bakes & quiet work tables",
        distance: "0.8 km · Jaydev Vihar",
        status: "Open now",
        rating: 4.7,
        tags: ["Coffee", "Work friendly", "Wifi"],
      },
      {
        id: "hang-2",
        name: "Kalinga Stadium",
        subtitle: "World-class hockey stadium, athletic tracks & courts",
        distance: "2.1 km · Nayapalli",
        status: "Available",
        rating: 4.8,
        tags: ["Sports", "Badminton", "Running Track"],
      },
      {
        id: "hang-3",
        name: "Game On Arena",
        subtitle: "PC gaming, console lounges and low crowd ambiance",
        distance: "1.4 km · IRC Village",
        status: "Open now",
        rating: 4.6,
        tags: ["Gaming", "VR", "Snacks"],
      },
      {
        id: "hang-4",
        name: "Bocca Café",
        subtitle: "Art café with wood-fired pizza and patio seating",
        distance: "2.7 km · Master Canteen",
        status: "Open now",
        rating: 4.7,
        tags: ["Art", "Espresso", "Patio"],
      },
    ],
  },
  "Shopping & Fashion": {
    icon: ShoppingBag,
    tagline: "HANDLOOMS, CRAFTS & MODERN MALLS",
    description: "Authentic Sambalpuri & Ikat handlooms, Silver Filigree (Tarakasi), stone crafts, and contemporary retail.",
    places: [
      {
        id: "shop-1",
        name: "Boyanika & Utkalika",
        subtitle: "State Handloom & Handicrafts Emporium · Authentic Ikat & Silk",
        distance: "2.2 km · Market Building",
        status: "10:00 - 20:30",
        rating: 4.8,
        tags: ["Handloom", "Sambalpuri", "Handicrafts"],
      },
      {
        id: "shop-2",
        name: "Ekamra Haat",
        subtitle: "Open-air craft village showcasing rural artisans & live craft demos",
        distance: "2.5 km · Unit 3",
        status: "10:00 - 21:00",
        rating: 4.7,
        tags: ["Crafts", "Terracotta", "Food Stalls"],
      },
      {
        id: "shop-3",
        name: "Esplanade One Mall",
        subtitle: "Premier shopping destination with international brands and cinema",
        distance: "4.8 km · Rasulgarh",
        status: "10:30 - 22:00",
        rating: 4.6,
        tags: ["Mall", "Fashion", "Food Court"],
      },
      {
        id: "shop-4",
        name: "Silver Filigree (Tarakasi) Center",
        subtitle: "Centuries-old Cuttack filigree jewelry & silver artwork",
        distance: "22 km · Cuttack",
        status: "10:00 - 19:30",
        rating: 4.9,
        tags: ["GI Tagged", "Silver Art", "Jewelry"],
      },
    ],
  },
};

export const CategoryExplorePage: React.FC<CategoryExplorePageProps> = ({
  category,
  categoryName,
  selectedLocation = "Bhubaneswar",
  onBack,
  onPlanTripWithCategory,
  onPlanWithSinglePlace,
  onOpenMap,
  onSelectPlace,
}) => {
  const activeCategoryName = category || categoryName || "Nature";
  const categoryData = CATEGORY_DATA[activeCategoryName] || CATEGORY_DATA["Nature"];
  const Icon = categoryData.icon;
  const { isSaved, toggleSavePlace } = useSavedPlaces();

  return (
    <div
      data-testid="category-explore-view"
      className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8"
    >
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="category-back-button"
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 shadow-xs transition-colors cursor-pointer"
            aria-label="Back to Discover"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono">
              {categoryData.tagline}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                <Icon size={18} />
              </div>
              <span>{category}</span>
            </h1>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="category-plan-cta"
            onClick={() => onPlanTripWithCategory?.(activeCategoryName)}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Compass size={15} />
            <span>Plan with this category</span>
          </button>
          <button
            type="button"
            data-testid="category-map-cta"
            onClick={() => {
              if (categoryData.places.length > 0) {
                const p = categoryData.places[0];
                onOpenMap({
                  id: p.id,
                  name: p.name,
                  category: activeCategoryName,
                  location: p.distance,
                  description: p.subtitle,
                });
              } else {
                onOpenMap();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MapPin size={15} className="text-emerald-600" />
            <span>View on Map</span>
          </button>
        </div>
      </div>

      {/* Description Summary Card */}
      <div className="p-6 rounded-3xl bg-[#0b241d] text-white border border-emerald-800/40 shadow-lg">
        <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-3xl">
          {categoryData.description}
        </p>
        <div className="text-xs text-emerald-300/80 font-mono mt-3">
          Curated destinations and highlights around {selectedLocation} and connected regions.
        </div>
      </div>

      {/* Places List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categoryData.places.map((place) => {
          const saved = isSaved(place.id || place.name);
          return (
            <div
              key={place.id}
              data-testid={`category-place-${place.id}`}
              className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    onSelectPlace?.({
                      id: place.id,
                      name: place.name,
                      category: activeCategoryName,
                      distance: place.distance,
                      description: place.subtitle,
                      tags: place.tags,
                    })
                  }
                >
                  <h3 className="font-display font-bold text-lg text-gray-900 hover:text-emerald-700 transition-colors">
                    {place.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{place.subtitle}</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleSavePlace({
                      id: place.id,
                      name: place.name,
                      category: activeCategoryName,
                      distance: place.distance,
                      notes: place.subtitle,
                      tags: place.tags,
                    })
                  }
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                    saved
                      ? "bg-red-50 text-red-500"
                      : "bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-label={`Save ${place.name}`}
                >
                  <Heart size={18} fill={saved ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <MapPin size={13} /> {place.distance}
                </span>
                <span>·</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium">
                  {place.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-1.5">
                  {place.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenMap({
                        id: place.id,
                        name: place.name,
                        category: activeCategoryName,
                        location: place.distance,
                        description: place.subtitle,
                      })
                    }
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <MapPin size={12} /> Map
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
