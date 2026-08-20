import React, { useState, useMemo } from "react";
import {
  Crosshair,
  Layers3,
  Bot,
  ArrowUpRight,
  CloudRain,
  Sun,
  Cloud,
  CloudLightning,
  Wind,
  Droplets,
  Mountain,
  Hospital,
  Landmark,
  WalletCards,
  Coffee,
  ShoppingBag,
  Heart,
  Navigation,
  TrainFront,
  MapPin,
  Sparkles,
  Bookmark,
  Compass,
  CalendarDays,
} from "lucide-react";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import { useWeather } from "../../store/useWeather";
import { usePlaces } from "../../store/usePlaces";
import type { SelectedPlaceInfo } from "../place/PlaceDetailsModal";
import { CoverflowCarousel, type CoverflowItem } from "../gallery/CoverflowCarousel";
import {
  getFeaturedOdishaDestinations,
  getPlaceImageUrl,
  getPlaceRegion,
  getCategoryImage,
  DEFAULT_FALLBACK_IMAGE,
} from "../../utils/imageService";
import {
  getPlaceOperatingHours,
  getPlaceRatingMetadata,
  type OperatingHoursResult,
} from "../../utils/operatingHoursService";

// Helper function to calculate distance in km using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export const ODISHA_HUB_COORDINATES: Record<string, { lat: number; lon: number }> = {
  bhubaneswar: { lat: 20.2961, lon: 85.8245 },
  puri: { lat: 19.8135, lon: 85.8312 },
  cuttack: { lat: 20.4625, lon: 85.8828 },
  konark: { lat: 19.8876, lon: 86.0945 },
  "chilika lake": { lat: 19.7042, lon: 85.3214 },
  chilika: { lat: 19.7042, lon: 85.3214 },
  daringbadi: { lat: 19.9103, lon: 84.1311 },
  sambalpur: { lat: 21.4669, lon: 83.9812 },
  koraput: { lat: 18.8135, lon: 82.7123 },
  rourkela: { lat: 22.2604, lon: 84.8536 },
};

export const ODISHA_REGIONAL_SERVICES: Record<
  string,
  {
    medical: Array<{ name: string; type: string; phone: string; address: string }>;
    transport: Array<{ name: string; type: string; details: string }>;
    atms: Array<{ bank: string; location: string; available247: boolean }>;
  }
> = {
  bhubaneswar: {
    medical: [
      { name: "AIIMS Bhubaneswar", type: "Apex Trauma & Multispeciality", phone: "0674-2476789", address: "Sijua, Patrapada" },
      { name: "Capital Hospital", type: "Government General Hospital", phone: "0674-2391983", address: "Unit-6, Forest Park" },
      { name: "Apollo Hospitals", type: "Private Super Speciality", phone: "0674-6661066", address: "Old Town, Samantarapur" },
    ],
    transport: [
      { name: "Bhubaneswar Junction (BBS)", type: "Railway Hub", details: "Master Canteen, 24/7 Connectivity" },
      { name: "Biju Patnaik Int'l Airport (BBI)", type: "Airport", details: "Domestic & South-East Asian Flights" },
      { name: "Baramunda Inter-State Bus Terminal (ISBT)", type: "Bus Terminal", details: "State & Inter-State AC Coaches" },
      { name: "Mo Bus Smart Transit", type: "City Transit", details: "City-wide AC Electric Buses & Passes" },
    ],
    atms: [
      { bank: "State Bank of India", location: "Master Canteen Sq.", available247: true },
      { bank: "HDFC Bank 24/7", location: "Janpath Rd, Saheed Nagar", available247: true },
      { bank: "ICICI Bank ATM", location: "Old Town Lingaraj Plaza", available247: true },
    ],
  },
  puri: {
    medical: [
      { name: "District Headquarters Hospital", type: "Main District Hospital", phone: "06752-222044", address: "Near Grand Road, Puri" },
      { name: "ESI Hospital & Tourist Aid Post", type: "Emergency Centre", phone: "06752-223120", address: "Chakratirtha Road" },
      { name: "Puri Beach Red Cross First Aid", type: "Beach Patrol Unit", phone: "108", address: "Golden Beach Promenade" },
    ],
    transport: [
      { name: "Puri Railway Station (PURI)", type: "Railway Terminal", details: "Terminus for all Express & Vande Bharat Trains" },
      { name: "Puri Central Bus Stand", type: "Bus Terminal", details: "Direct routes to Bhubaneswar, Konark & Chilika" },
      { name: "Puri Auto & Taxi Union", type: "Local Cab Stand", details: "Fixed rate temple and beach shuttles" },
    ],
    atms: [
      { bank: "State Bank of India", location: "Grand Road Temple Square", available247: true },
      { bank: "HDFC Bank 24/7", location: "VIP Road, Police Line", available247: true },
      { bank: "Bank of India ATM", location: "Swargadwar Beach Market", available247: true },
    ],
  },
  cuttack: {
    medical: [
      { name: "SCB Medical College & Hospital", type: "Premier Government Teaching Hospital", phone: "0671-2414080", address: "Mangalabag, Cuttack" },
      { name: "Acharya Harihar Cancer Centre", type: "Speciality Hospital", phone: "0671-2423580", address: "Mangalabag" },
      { name: "City Hospital Cuttack", type: "Municipal Hospital", phone: "0671-2301222", address: "Buxi Bazaar" },
    ],
    transport: [
      { name: "Cuttack Junction (CTC)", type: "Railway Station", details: "Howrah-Chennai Main Line Stop" },
      { name: "Badambadi Bus Terminal (BSABT)", type: "Central Bus Terminal", details: "Odisha's largest transit interchange" },
      { name: "Mahanadi River Ferry Ghat", type: "Water Transport", details: "Scenic crossing to Dhabaleswar Temple" },
    ],
    atms: [
      { bank: "State Bank of India", location: "Badambadi Bus Stand", available247: true },
      { bank: "Axis Bank 24/7 ATM", location: "Choudhury Bazar", available247: true },
      { bank: "Punjab National Bank", location: "College Square", available247: true },
    ],
  },
  konark: {
    medical: [
      { name: "Konark Community Health Centre (CHC)", type: "Government Hospital", phone: "06758-236825", address: "Main Road, Konark" },
      { name: "Puri District Mobile Health Unit", type: "Emergency Ambulance", phone: "108", address: "Sun Temple Plaza" },
    ],
    transport: [
      { name: "Konark Bus Terminus", type: "Bus Terminal", details: "Frequent shuttles to Puri (35km) & Bhubaneswar (65km)" },
      { name: "Marine Drive Auto & Cab Stand", type: "Coastal Taxi", details: "Scenic Puri-Konark Marine Drive transfers" },
    ],
    atms: [
      { bank: "State Bank of India", location: "Sun Temple Commercial Complex", available247: true },
      { bank: "UCO Bank ATM", location: "Konark Market Square", available247: true },
    ],
  },
  "chilika lake": {
    medical: [
      { name: "Balugaon Community Health Centre", type: "Government Hospital", phone: "06756-251214", address: "Balugaon Town" },
      { name: "Satapada Primary Health Centre (PHC)", type: "Coastal Clinic", phone: "06752-260100", address: "Satapada Jetty" },
    ],
    transport: [
      { name: "Barkul OTDC Water Sports Jetty", type: "Boat Terminal", details: "Motorboat cruises to Kalijai Island & Bird Sanctuary" },
      { name: "Satapada Dolphin Cruise Terminal", type: "Lagoon Port", details: "Irrawaddy Dolphin watching boats & Sea Mouth ferries" },
      { name: "Balugaon Railway Station (BALU)", type: "Railway Station", details: "Direct train access on Howrah-Chennai line" },
    ],
    atms: [
      { bank: "State Bank of India", location: "Balugaon Railway Road", available247: true },
      { bank: "Canara Bank 24/7", location: "Barkul Highway Junction", available247: true },
    ],
  },
  daringbadi: {
    medical: [
      { name: "Daringbadi Community Health Centre", type: "Hill Station Hospital", phone: "06847-268020", address: "Daringbadi Centre" },
      { name: "Phulbani District Headquarters Hospital", type: "District Referral", phone: "06842-253244", address: "Phulbani Town" },
    ],
    transport: [
      { name: "Daringbadi Eco-Bus Stand", type: "Hill Transit Stand", details: "Buses to Berhampur, Phulbani & Bhubaneswar" },
      { name: "Kandhamal Hill Taxi Association", type: "Mountain Cab Service", details: "Pine forest, coffee plantation & waterfall tours" },
    ],
    atms: [
      { bank: "State Bank of India", location: "Daringbadi Market", available247: true },
      { bank: "Odisha Gramya Bank", location: "Daringbadi Main Rd", available247: false },
    ],
  },
  sambalpur: {
    medical: [
      { name: "VIMSAR Burla Medical College", type: "Apex Super Speciality Teaching Hospital", phone: "0663-2430768", address: "Burla, Sambalpur" },
      { name: "District Headquarters Hospital", type: "District Hospital", phone: "0663-2400100", address: "Khetrajpur, Sambalpur" },
    ],
    transport: [
      { name: "Sambalpur Junction (SBP)", type: "Major Railway Junction", details: "Direct trains to Kolkata, Mumbai, Delhi & Bhubaneswar" },
      { name: "Ainthapali Central Bus Terminal", type: "Bus Terminal", details: "Western Odisha primary bus hub" },
      { name: "Hirakud Reservoir Boat Point", type: "Reservoir Transit", details: "Boat rides across the longest earthen dam" },
    ],
    atms: [
      { bank: "State Bank of India", location: "VSS Marg, Sambalpur", available247: true },
      { bank: "HDFC Bank 24/7", location: "Khetrajpur Station Rd", available247: true },
    ],
  },
  koraput: {
    medical: [
      { name: "SLN Medical College & Hospital", type: "Government Medical College", phone: "06852-250100", address: "Koraput Town" },
      { name: "Jeypore Sub-Divisional Hospital", type: "Regional Hospital", phone: "06854-232144", address: "Jeypore" },
    ],
    transport: [
      { name: "Koraput Railway Station (KRPU)", type: "Scenic Mountain Railway", details: "KK Line (Kottavalasa-Kirandul) with Vistadome Coach" },
      { name: "Jeypore Central Bus Stand", type: "Bus Stand", details: "Connections to Visakhapatnam, Jagdalpur & Raipur" },
      { name: "Deomali Trek Base Taxi Union", type: "Trek Transport", details: "4x4 Cabs for highest peak expeditions" },
    ],
    atms: [
      { bank: "State Bank of India", location: "Koraput Main Branch", available247: true },
      { bank: "Axis Bank ATM", location: "Jeypore Road", available247: true },
    ],
  },
};

export const ODISHA_HUB_LOCAL_HIGHLIGHTS: Record<
  string,
  Array<{ id: string; name: string; category: string; lat: number; lon: number; description: string }>
> = {
  bhubaneswar: [
    { id: "nb-bbsr-brewbakes", name: "Brewbakes Café", category: "Hangout & Chill", lat: 20.2961, lon: 85.8245, description: "Artisan coffee, shakes and hangout spot in Jaydev Vihar." },
    { id: "nb-bbsr-kalinga", name: "Kalinga Stadium", category: "Sports & Recreation", lat: 20.2962, lon: 85.8246, description: "Premier international sports complex and athletic track." },
    { id: "nb-bbsr-gameon", name: "Game On Arena", category: "Sports & Games", lat: 20.2963, lon: 85.8247, description: "Indoor turf, sports gaming and bowling zone in Patia." },
    { id: "nb-bbsr-sbi", name: "SBI ATM, Jaydev Vihar", category: "ATMs", lat: 20.2964, lon: 85.8248, description: "24/7 ATM and Cash Deposit facility." },
  ],
  puri: [
    { id: "nb-puri-honeybee", name: "Honey Bee Bakery & Cafe", category: "Hangout & Chill", lat: 19.8135, lon: 85.8312, description: "Seaside Italian cafe, artisanal pizza and bakery on CT Road." },
    { id: "nb-puri-beach", name: "Puri Golden Beach", category: "Coastal Beach", lat: 19.8050, lon: 85.8340, description: "Blue Flag certified beach promenade with morning yoga and evening sea breeze." },
    { id: "nb-puri-market", name: "Swargadwar Beach Market", category: "Shopping & Crafts", lat: 19.7995, lon: 85.8220, description: "Handicrafts, seashell art, khaja sweets and beachside shopping." },
    { id: "nb-puri-sbi", name: "SBI 24/7 ATM, Grand Road", category: "ATMs", lat: 19.8120, lon: 85.8300, description: "24/7 ATM and Cash Point near Jagannath Temple." },
  ],
  cuttack: [
    { id: "nb-ctc-barabati", name: "Barabati Stadium & Fort", category: "Sports & Heritage", lat: 20.4810, lon: 85.8670, description: "Historic 14th century fort ruins and cricket stadium." },
    { id: "nb-ctc-silver", name: "Choudhury Bazar Silver Filigree", category: "Shopping & Crafts", lat: 20.4650, lon: 85.8810, description: "Traditional Tarakasi silver filigree master workshops." },
    { id: "nb-ctc-dahibara", name: "Raghu Dahi Bara Aloodum", category: "Food & Cuisine", lat: 20.4630, lon: 85.8820, description: "Iconic Cuttack style spiced Dahi Bara Aloodum street food." },
    { id: "nb-ctc-sbi", name: "SBI ATM, Badambadi", category: "ATMs", lat: 20.4580, lon: 85.8790, description: "24/7 ATM near Central Bus Station." },
  ],
  konark: [
    { id: "nb-konark-otdc", name: "Yatrinivas Cafe & Restaurant", category: "Hangout & Chill", lat: 19.8876, lon: 86.0945, description: "OTDC dining hall serving authentic Odia thalis." },
    { id: "nb-konark-chandrabhaga", name: "Chandrabhaga Beach Point", category: "Coastal Beach", lat: 19.8710, lon: 86.1150, description: "Serene shoreline, beach walks and sunrise lookout." },
    { id: "nb-konark-museum", name: "ASI Site Museum Konark", category: "Heritage & Culture", lat: 19.8890, lon: 86.0930, description: "Sculptures and restored stones from Sun Temple complex." },
    { id: "nb-konark-sbi", name: "SBI 24/7 ATM, Temple Square", category: "ATMs", lat: 19.8870, lon: 86.0940, description: "24/7 ATM at Konark Market complex." },
  ],
  "chilika lake": [
    { id: "nb-chilika-otdc", name: "Panthanivas Barkul Restaurant", category: "Hangout & Chill", lat: 19.7042, lon: 85.3214, description: "Lakefront dining overlooking the blue waters of Chilika." },
    { id: "nb-chilika-jetty", name: "Barkul Water Sports Jetty", category: "Boating & Safaris", lat: 19.7020, lon: 85.3200, description: "Speed boats, passenger ferries and Kalijai island tours." },
    { id: "nb-chilika-mangalajodi", name: "Mangalajodi Birding Eco-Camp", category: "Nature & Wildlife", lat: 19.9140, lon: 85.4210, description: "Country boat wetlands safari guided by local conservationists." },
    { id: "nb-chilika-sbi", name: "SBI ATM, Balugaon", category: "ATMs", lat: 19.7420, lon: 85.2150, description: "24/7 ATM on National Highway junction." },
  ],
  daringbadi: [
    { id: "nb-daring-cafe", name: "Hill View Coffee & Tea Lounge", category: "Hangout & Chill", lat: 19.9103, lon: 84.1311, description: "Locally grown organic Kandhamal coffee and snacks." },
    { id: "nb-daring-pine", name: "Daringbadi Pine Forest", category: "Nature & Hills", lat: 19.9150, lon: 84.1350, description: "Whispering pine trees and misty walking trails." },
    { id: "nb-daring-park", name: "Hill View Nature Park", category: "Parks & Views", lat: 19.9120, lon: 84.1290, description: "Panoramic valley view, watchtower and butterfly garden." },
    { id: "nb-daring-sbi", name: "SBI ATM, Daringbadi Market", category: "ATMs", lat: 19.9100, lon: 84.1300, description: "Town center cash dispensing point." },
  ],
  sambalpur: [
    { id: "nb-sbp-cafe", name: "Mahanadi Riverfront Plaza", category: "Hangout & Chill", lat: 21.4669, lon: 83.9812, description: "Evening strolls, street chaat and river breezes." },
    { id: "nb-sbp-samaleswari", name: "Maa Samaleswari Temple Complex", category: "Heritage & Culture", lat: 21.4630, lon: 83.9780, description: "Presiding deity of Western Odisha on the banks of Mahanadi." },
    { id: "nb-sbp-hirakud", name: "Hirakud Gandhi Minar Viewpoint", category: "Nature & Views", lat: 21.5280, lon: 83.8720, description: "Panoramic 360-degree overlook of the vast reservoir." },
    { id: "nb-sbp-sbi", name: "SBI ATM, VSS Marg", category: "ATMs", lat: 21.4670, lon: 83.9820, description: "24/7 ATM in downtown Sambalpur." },
  ],
  koraput: [
    { id: "nb-krp-coffee", name: "Koraput Organic Coffee Cafe", category: "Hangout & Chill", lat: 18.8135, lon: 82.7123, description: "Specialty high-altitude shade-grown Arabica coffee." },
    { id: "nb-krp-tribal", name: "COATS Tribal Museum", category: "Heritage & Culture", lat: 18.8150, lon: 82.7150, description: "Preserving indigenous cultural artifacts and documentation." },
    { id: "nb-krp-kolab", name: "Kolab Botanical Garden & Lake", category: "Nature & Lakes", lat: 18.7850, lon: 82.6840, description: "Terraced gardens, boating and scenic mountain views." },
    { id: "nb-krp-sbi", name: "SBI ATM, Main Road Koraput", category: "ATMs", lat: 18.8130, lon: 82.7120, description: "24/7 ATM in Koraput central square." },
  ],
  rourkela: [
    { id: "nb-rkl-cafe", name: "Sector-5 Boulevard Cafe", category: "Hangout & Chill", lat: 22.2604, lon: 84.8536, description: "Youth hangout, coffee and quick bites in steel city." },
    { id: "nb-rkl-hanuman", name: "Hanuman Vatika Garden", category: "Heritage & Parks", lat: 22.2450, lon: 84.8420, description: "Garden complex featuring a 75-foot Hanuman statue." },
    { id: "nb-rkl-igpark", name: "Indira Gandhi Park & Zoo", category: "Parks & Wildlife", lat: 22.2510, lon: 84.8610, description: "Urban park with deer safari, musical fountain and aquarium." },
    { id: "nb-rkl-sbi", name: "SBI ATM, Bisra Road", category: "ATMs", lat: 22.2600, lon: 84.8540, description: "24/7 ATM near Rourkela Railway Station." },
  ],
};

export function getOperatingStatus(category: string, placeName: string): { status: string; isOpen: boolean; is24Hours?: boolean; hoursDescription?: string } {
  const res = getPlaceOperatingHours(placeName, category);
  return {
    status: res.status,
    isOpen: res.isOpen === true,
    is24Hours: res.is24Hours,
    hoursDescription: res.hoursDescription,
  };
}

interface HomeSectionsProps {
  selectedLocation: string;
  userCoords?: { lat: number, lon: number } | null;
  onNavigateToPlan: () => void;
  onNavigateToMap: (place?: SelectedPlaceInfo) => void;
  onNavigateToCopilot: () => void;
  onSelectCategory: (category: string) => void;
  onSelectPlace: (place: SelectedPlaceInfo) => void;
}

export const HomeSections: React.FC<HomeSectionsProps> = ({
  selectedLocation,
  userCoords,
  onNavigateToPlan,
  onNavigateToMap,
  onNavigateToCopilot,
  onSelectCategory,
  onSelectPlace,
}) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const { savedPlaces, isSaved, toggleSavePlace } = useSavedPlaces();
  const { weather, isLoading: isWeatherLoading } = useWeather(selectedLocation);
  const { places } = usePlaces();

  // Carousel #1: Featured Whole-Odisha Destinations
  const discoveryCarouselItems: CoverflowItem[] = useMemo(() => {
    const featured = getFeaturedOdishaDestinations();
    return featured.map((item) => ({
      id: item.id,
      title: item.name,
      category: item.category,
      location: item.location,
      description: item.description,
      imageUrl: item.imageUrl,
    }));
  }, []);

  // Carousel #2: Saved / Recommended Places to Explore
  const savedAndExploreItems: CoverflowItem[] = useMemo(() => {
    if (savedPlaces.length > 0) {
      return savedPlaces.map((sp) => ({
        id: sp.id,
        title: sp.name,
        category: sp.category,
        location: sp.location || getPlaceRegion(sp.name),
        description: sp.description || sp.notes || `Saved travel destination in Odisha.`,
        imageUrl: getPlaceImageUrl(sp.name, sp.category),
      }));
    }

    // Default Curated recommendations if no saved places yet
    return [
      {
        id: "rec-daringbadi",
        title: "Daringbadi Pine Hills",
        category: "Hills & Nature",
        location: "Kandhamal & Southern Hills",
        description: "Mist-covered pine forests, coffee plantations, and cool mountain breezes.",
        imageUrl: getPlaceImageUrl("daringbadi hill station", "nature"),
      },
      {
        id: "rec-chilika",
        title: "Chilika Mangalajodi",
        category: "Wetland & Birds",
        location: "Chilika & Southern Coast",
        description: "Eco-tourism haven with wooden boat birding tours in Asia's largest lagoon.",
        imageUrl: getPlaceImageUrl("chilika lake", "nature"),
      },
      {
        id: "rec-similipal",
        title: "Similipal Tiger Reserve",
        category: "Wildlife & Forests",
        location: "Northern Odisha & Wildlife",
        description: "Deep Sal forests, waterfalls, and rich wildlife in Mayurbhanj.",
        imageUrl: getPlaceImageUrl("similipal national park", "wildlife"),
      },
      {
        id: "rec-puri",
        title: "Puri Golden Beach",
        category: "Coastal Beach",
        location: "Puri & Coastal",
        description: "Blue Flag certified beach with golden sands and seaside promenades.",
        imageUrl: getPlaceImageUrl("puri golden beach", "beach"),
      },
      {
        id: "rec-deomali",
        title: "Deomali Peak Koraput",
        category: "Highlands & Treks",
        location: "Koraput & Tribal Highlands",
        description: "Spectacular misty clouds and high ridge treks at Odisha's highest peak.",
        imageUrl: getPlaceImageUrl("deomali peak", "nature"),
      },
    ];
  }, [savedPlaces]);

  // Categories resolved through central image pipeline
  const categories = useMemo(() => {
    return [
      {
        label: "Nature",
        emoji: "🌿",
        icon: Mountain,
        image: getCategoryImage("nature"),
      },
      {
        label: "Medical Help",
        emoji: "🏥",
        icon: Hospital,
        image: getCategoryImage("medical help"),
      },
      {
        label: "Heritage & Culture",
        emoji: "🏛️",
        icon: Landmark,
        image: getCategoryImage("heritage & culture"),
      },
      {
        label: "ATMs",
        emoji: "💳",
        icon: WalletCards,
        image: getCategoryImage("atms"),
      },
      {
        label: "Hangout & Chill",
        emoji: "☕",
        icon: Coffee,
        image: getCategoryImage("hangout & chill"),
      },
      {
        label: "Shopping & Fashion",
        emoji: "🛍️",
        icon: ShoppingBag,
        image: getCategoryImage("shopping & fashion"),
      },
    ];
  }, []);

  // Image-First Nearby Destinations
  const nearbyPlaces = useMemo(() => {
    // Determine the reference coordinates. Look up selectedLocation hub, fallback to Bhubaneswar
    const hubKey = selectedLocation.trim().toLowerCase();
    const hubCoords = ODISHA_HUB_COORDINATES[hubKey] || ODISHA_HUB_COORDINATES["bhubaneswar"];

    const refLat = userCoords?.lat ?? hubCoords.lat;
    const refLon = userCoords?.lon ?? hubCoords.lon;

    const localNearby = ODISHA_HUB_LOCAL_HIGHLIGHTS[hubKey] || ODISHA_HUB_LOCAL_HIGHLIGHTS["bhubaneswar"];

    const allCandidates = [...localNearby, ...(places || [])];

    return allCandidates
      .filter((place) => (place as any).lat != null && (place as any).lon != null)
      .map((place) => {
        const placeName = (place as any).name || (place as any).title || "Destination";
        const dist = calculateDistance(
          refLat,
          refLon,
          (place as any).lat as number,
          (place as any).lon as number
        );
        const op = getOperatingStatus((place as any).category, placeName);
        const meta = getPlaceRatingMetadata(placeName, (place as any).rating || 4.8);

        return {
          id: (place as any).id,
          title: placeName,
          category: (place as any).category,
          region: (place as any).region || (place as any).location || selectedLocation,
          distance: dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`,
          distanceValue: dist,
          status: op.status,
          isOpen: op.isOpen,
          description: (place as any).description || `Explore ${placeName} in ${selectedLocation}, Odisha.`,
          imageUrl: (place as any).imageUrl || getPlaceImageUrl(placeName, (place as any).category),
          rating: meta.rating,
          reviewCount: meta.reviewCount,
          lat: (place as any).lat,
          lon: (place as any).lon,
        };
      })
      .sort((a, b) => a.distanceValue - b.distanceValue)
      .slice(0, 6);
  }, [places, userCoords, selectedLocation]);

  const detourPlaces = useMemo(() => {
    return [
      {
        name: "Konark Sun Temple",
        category: "Heritage & Culture",
        tag: "HERITAGE · 65 KM",
        desc: "Stone chariot sanctuary, intricate wheels, and a legendary coastline.",
        imageUrl: getPlaceImageUrl("konark sun temple", "monument"),
      },
      {
        name: "Chilika Lake",
        category: "Nature",
        tag: "NATURE · 104 KM · LAGOON",
        desc: "Asia's largest brackish lagoon with quiet waters and migratory birds.",
        imageUrl: getPlaceImageUrl("chilika lake", "nature"),
      },
      {
        name: "Daringbadi",
        category: "Nature",
        tag: "HILL STATION · 245 KM",
        desc: "Misty pine forest valleys, coffee gardens, and cool mountain air.",
        imageUrl: getPlaceImageUrl("daringbadi hill station", "nature"),
      },
      {
        name: "Similipal National Park",
        category: "Wildlife",
        tag: "WILDLIFE · 270 KM · RESERVE",
        desc: "Deep Sal jungles, tiger reserve, and cascading waterfalls.",
        imageUrl: getPlaceImageUrl("similipal national park", "wildlife"),
      },
    ];
  }, []);

  const handleCarouselSelect = (item: CoverflowItem) => {
    onSelectPlace({
      id: item.id,
      name: item.title,
      category: item.category,
      location: item.location,
      description: item.description,
      imageUrl: item.imageUrl,
    });
  };

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 1. Context Action Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-2 sm:p-2.5 rounded-3xl bg-[#09221b] text-white border border-emerald-800/40 grid grid-cols-1 md:grid-cols-3 gap-2 shadow-lg">
          <button
            type="button"
            onClick={() => onNavigateToMap()}
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-emerald-950/60 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-800/60 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Crosshair size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Location active</span>
                <span className="live-dot" />
              </div>
              <div className="text-[11px] text-emerald-300/80 truncate">
                {selectedLocation}, Odisha • active now
              </div>
            </div>
            <ArrowUpRight size={15} className="ml-auto text-emerald-400/60 group-hover:text-emerald-300 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateToMap()}
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-emerald-950/60 transition-all text-left border-t md:border-t-0 md:border-l border-emerald-900/40 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-800/60 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers3 size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white">Live Route &amp; Transit Map</div>
              <div className="text-[11px] text-emerald-300/80 truncate">
                Explore nearby attractions &amp; services
              </div>
            </div>
            <ArrowUpRight size={15} className="ml-auto text-emerald-400/60 group-hover:text-emerald-300 shrink-0" />
          </button>

          <button
            type="button"
            onClick={onNavigateToCopilot}
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-emerald-950/60 transition-all text-left border-t md:border-t-0 md:border-l border-emerald-900/40 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-800/60 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Bot size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white">Ask your travel copilot</div>
              <div className="text-[11px] text-emerald-300/80 truncate">
                &ldquo;Plan a 2-day heritage roadtrip&rdquo;
              </div>
            </div>
            <ArrowUpRight size={15} className="ml-auto text-emerald-400/60 group-hover:text-emerald-300 shrink-0" />
          </button>
        </div>
      </section>

      {/* 2. V1-Quality Rich Weather Banner Module */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="weather-banner-section">
        <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#07241c] via-[#0b2b22] to-[#061e17] text-white border border-emerald-800/50 shadow-xl overflow-hidden">
          {/* Atmospheric ambient glow */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Weather Animated Icon Container */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md shrink-0">
                {weather?.current.condition.toLowerCase().includes("rain") ? (
                  <CloudRain size={32} className="animate-bounce text-cyan-300" />
                ) : weather?.current.condition.toLowerCase().includes("thunder") ? (
                  <CloudLightning size={32} className="text-amber-400" />
                ) : weather?.current.condition.toLowerCase().includes("cloud") ? (
                  <Cloud size={32} className="text-emerald-300" />
                ) : (
                  <Sun size={32} className="animate-spin-slow text-amber-400" />
                )}
              </div>

              {/* Temperature & Main Conditions */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
                  <span>LOCAL WEATHER · {selectedLocation.toUpperCase()}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono border border-emerald-800/60">FORECAST</span>
                  {weather?.current.provider && (
                    <span className="text-[9px] text-emerald-400/70 font-sans normal-case">
                      ({weather.current.provider})
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-baseline gap-3.5 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
                    {weather ? `${Math.round(weather.current.temperature_c)}°C` : isWeatherLoading ? "--°C" : "28°C"}
                  </span>
                  <span className="text-sm font-semibold text-emerald-200 bg-emerald-950/70 px-2.5 py-0.5 rounded-lg border border-emerald-800/60">
                    {weather?.current.condition || (isWeatherLoading ? "Fetching..." : "Pleasant")}
                  </span>
                  {weather?.current.humidity_pct != null && (
                    <span className="text-xs text-emerald-300/80 font-mono flex items-center gap-1">
                      <Droplets size={13} className="text-cyan-400" />
                      <span>{weather.current.humidity_pct}% humidity</span>
                    </span>
                  )}
                  {weather?.current.wind_speed_kmh != null && (
                    <span className="text-xs text-emerald-300/80 font-mono hidden sm:flex items-center gap-1">
                      <Wind size={13} className="text-emerald-400" />
                      <span>{Math.round(weather.current.wind_speed_kmh)} km/h wind</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Travel Guidance Badge */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 text-xs text-emerald-200/90">
              <span className="italic max-w-sm text-left md:text-right text-emerald-100/90 leading-relaxed">
                &ldquo;{weather?.current.advice || "Optimal conditions for coastal and cultural exploration today."}&rdquo;
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-700/60 flex items-center gap-1.5 shadow-xs">
                <span className="live-dot" />
                <span>{weather?.current.status === "available" ? "LIVE METRICS" : "FORECAST"}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COVERFLOW CAROUSEL #1: Destination Discovery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="discovery-coverflow-section">
        <CoverflowCarousel
          items={discoveryCarouselItems}
          tag="DESTINATION DISCOVERY"
          title="Iconic Odisha Highlights"
          subtitle="Scroll with mouse wheel or swipe to explore top-rated destinations across Odisha."
          onSelectItem={handleCarouselSelect}
          onExploreItem={handleCarouselSelect}
        />
      </section>

      {/* 4. Popular Categories Section - Responsive 3-Column Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              BROWSE BY CATEGORY
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight mt-0.5">
              Popular Categories
            </h2>
          </div>
          <button
            type="button"
            onClick={onNavigateToPlan}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Plan by category</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-5">
          Select a travel theme to view verified destinations and jumpstart your custom itinerary.
        </p>

        {/* 3-Column Responsive Grid with Proportional Aspect Ratios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.label}
                data-testid={`category-card-${cat.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                onClick={() => onSelectCategory(cat.label)}
                className="group relative h-48 sm:h-52 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 text-white border border-emerald-900/40 cursor-pointer bg-slate-900"
              >
                {/* Category Background Image */}
                <img
                  src={cat.image.src}
                  alt={cat.image.alt}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover brightness-85 group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE.src;
                  }}
                />

                {/* Gradient Overlay for Crisp Text Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 pointer-events-none" />

                {/* Top Icon Badge */}
                <div className="relative z-10 w-10 h-10 rounded-xl bg-emerald-600/90 backdrop-blur-md text-white flex items-center justify-center shadow-md border border-white/15">
                  <Icon size={18} />
                </div>

                {/* Bottom Title & Action Button */}
                <div className="relative z-10 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold font-display text-white leading-tight flex items-center gap-1.5">
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </h3>
                    <span className="text-[10px] sm:text-[11px] text-emerald-300 font-mono tracking-wider">
                      VERIFIED PLACES
                    </span>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                  >
                    <span>Explore</span>
                    <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. IMAGE-FIRST Nearby & Active Now */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="live-dot" /> PLACES NEAR {selectedLocation.toUpperCase()}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight mt-0.5">
              Nearby &amp; Active Now
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Image-first discovery of top destinations close to your active location.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "all", label: "All" },
              { id: "open-now", label: "Open Now" },
              { id: "top-rated", label: "Top Rated" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                data-testid={`nearby-filter-${f.id}`}
                onClick={() => setActiveFilter(f.label)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeFilter === f.label
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-[#09221b] text-gray-300 hover:text-white border border-emerald-900/60"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2x2 Image-Rich Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {nearbyPlaces
            .filter((place) => {
              if (activeFilter === "Open Now") {
                return place.isOpen === true || (place.isOpen !== false && place.status.toLowerCase().includes("open"));
              }
              if (activeFilter === "Top Rated") {
                return (place.rating ?? 4.8) >= 4.6;
              }
              return true;
            })
            .map((place) => {
              const saved = isSaved(place.title);
              return (
                <div
                  key={place.id || place.title}
                  data-testid={`nearby-place-${place.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  onClick={() =>
                    onSelectPlace({
                      id: place.id,
                      name: place.title,
                      category: place.category,
                      distance: place.distance,
                      description: place.description,
                      imageUrl: place.imageUrl,
                      lat: place.lat,
                      lon: place.lon,
                    })
                  }
                  className="group rounded-3xl bg-[#0a231c] text-white border border-emerald-900/50 hover:border-emerald-500/50 transition-all duration-300 flex flex-col sm:flex-row overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer"
                >
                  {/* Left / Top Image Container */}
                  <div className="relative w-full sm:w-44 h-40 sm:h-auto bg-slate-900 shrink-0 overflow-hidden">
                    <img
                      src={place.imageUrl}
                      alt={place.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getPlaceImageUrl(place.title, place.category);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none" />

                    {/* Top Category Badge */}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-700/60 text-emerald-300 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md">
                      {place.category}
                    </span>
                  </div>

                  {/* Right Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-bold text-base text-white group-hover:text-emerald-300 transition-colors truncate">
                          {place.title}
                        </h3>

                        {/* Save Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSavePlace({
                              id: place.id || place.title,
                              name: place.title,
                              category: place.category,
                              distance: place.distance,
                              notes: place.description,
                            });
                          }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                            saved
                              ? "text-rose-400 bg-rose-950/60"
                              : "text-gray-400 hover:text-white hover:bg-emerald-950/80"
                          }`}
                          aria-label={`Save ${place.title}`}
                        >
                          <Heart size={14} fill={saved ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-300/90 mt-1 font-mono">
                        <span className="flex items-center gap-1 font-bold text-emerald-400">
                          <MapPin size={11} /> {place.distance}
                        </span>
                        <span>·</span>
                        <span
                          className={`text-[11px] ${
                            place.isOpen === true
                              ? "text-emerald-300"
                              : place.isOpen === false
                              ? "text-amber-300/90"
                              : "text-gray-400"
                          }`}
                        >
                          ● {place.status}
                        </span>
                        {place.rating != null && (
                          <>
                            <span>·</span>
                            <span className="text-amber-300 font-bold flex items-center gap-0.5">
                              ★ {place.rating.toFixed(1)}
                              {place.reviewCount ? (
                                <span className="text-[10px] text-gray-400 font-normal ml-0.5">
                                  ({place.reviewCount > 999 ? `${(place.reviewCount / 1000).toFixed(1)}k` : place.reviewCount})
                                </span>
                              ) : null}
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed">
                        {place.description}
                      </p>
                    </div>

                    {/* Quick Action Button */}
                    <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-gray-400">{place.region || "Odisha"}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToMap({
                            id: place.id,
                            name: place.title,
                            category: place.category,
                            description: place.description,
                            imageUrl: place.imageUrl,
                            lat: place.lat,
                            lon: place.lon,
                          });
                        }}
                        className="text-xs text-emerald-300 hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>View Map</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* 6. Worth the Detour Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              WORTH THE DETOUR
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight mt-0.5">
              Places to put on your map.
            </h2>
          </div>
          <button
            type="button"
            onClick={onNavigateToPlan}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Build an itinerary</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* 4 Cards Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {detourPlaces.map((item) => (
            <div
              key={item.name}
              className="relative h-80 sm:h-88 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col justify-end p-4 sm:p-5 text-white bg-slate-900 border border-emerald-900/40 hover:border-emerald-500/40"
            >
              {/* Background Image */}
              <img
                src={item.imageUrl}
                alt={item.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover brightness-85 group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE.src;
                }}
              />

              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#041a13] via-[#041a13]/50 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 font-mono">
                  {item.tag}
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-display leading-tight text-white line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
                <div className="pt-1.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onSelectPlace({
                        name: item.name,
                        category: item.category,
                        description: item.desc,
                        imageUrl: item.imageUrl,
                      })
                    }
                    className="flex-1 py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    <Navigation size={12} />
                    <span>Explore</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigateToMap({
                        name: item.name,
                        category: item.category,
                        description: item.desc,
                        imageUrl: item.imageUrl,
                      })
                    }
                    className="p-1.5 sm:p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                    aria-label="View on map"
                  >
                    <MapPin size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. COVERFLOW CAROUSEL #2: Saved / Recommended Places */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="saved-explore-coverflow-section">
        <CoverflowCarousel
          items={savedAndExploreItems}
          tag={savedPlaces.length > 0 ? "YOUR SAVED WISHLIST" : "PLACES TO EXPLORE"}
          title={savedPlaces.length > 0 ? "Your Saved Odisha Places" : "Handpicked Destinations on Your Radar"}
          subtitle={
            savedPlaces.length > 0
              ? "All your saved destinations ready to be added to an itinerary schedule."
              : "Curated hill stations, wildlife wetlands, and ancient shrines worth adding to your journey."
          }
          onSelectItem={handleCarouselSelect}
          onExploreItem={handleCarouselSelect}
        />
      </section>

      {/* 8. UPGRADED "MAKE A DAY OF IT" FULL V2 DESIGN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="make-a-day-cta-section">
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#06251D] via-[#0B241D] to-[#041611] text-white border border-emerald-700/40 shadow-2xl overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Ambient Glows */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Decorative SVG Journey Route Curve & Markers */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden lg:block">
            <svg width="220" height="140" viewBox="0 0 220 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 110 C 60 20, 140 130, 200 40"
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle cx="10" cy="110" r="5" fill="#10B981" />
              <circle cx="95" cy="70" r="4" fill="#34D399" />
              <circle cx="140" cy="100" r="4" fill="#F59E0B" />
              <circle cx="200" cy="40" r="6" fill="#10B981" stroke="#06251D" strokeWidth="2" />
            </svg>
          </div>

          {/* Left Text */}
          <div className="relative z-10 space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
              <Sparkles size={12} className="text-amber-400" />
              <span>MADE IN ODISHA · YOUR NEXT CHAPTER</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
              Make a day of it.
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-light">
              Tell us the time you have. We&apos;ll connect the shrines, coastline, authentic cuisine, and transport to make every kilometer feel effortless.
            </p>
          </div>

          {/* Right CTA Button */}
          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onNavigateToPlan}
              className="px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-sm shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Compass size={16} />
              <span>Plan My Trip</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 9. DISTINCT LOCATION-AWARE ESSENTIALS FOR THE ROAD CARDS (Medical, ATM, Transport) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="essentials-section">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="live-dot" />
              <span>VERIFIED SERVICES · {selectedLocation.toUpperCase()}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight mt-0.5">
              Essentials for the road.
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToMap()}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Open verified map</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Emergency trauma, transportation stations, and 24/7 banking points tailored to {selectedLocation}.
        </p>

        {(() => {
          const locKey = selectedLocation.trim().toLowerCase();
          const services = ODISHA_REGIONAL_SERVICES[locKey] || ODISHA_REGIONAL_SERVICES["bhubaneswar"];

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 1. Medical Help: Emerald & Coral Accent */}
              <div
                data-testid="essential-medical"
                className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#12080a] via-[#1a0e12] to-[#09221b] text-white border border-rose-900/40 hover:border-rose-500/50 transition-all duration-300 shadow-lg flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-400 flex items-center justify-center shrink-0">
                        <Hospital size={20} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                          <span>Medical Aid &amp; ER</span>
                          <span className="text-[9px] text-rose-300 bg-rose-950/90 px-2 py-0.2 rounded-full border border-rose-800/80 font-mono">24/7 ER</span>
                        </h3>
                        <span className="text-[11px] text-rose-200/70">Top trauma centers in {selectedLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-rose-950/60">
                    {services.medical.slice(0, 2).map((med, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-black/30 border border-rose-900/30 text-xs">
                        <div className="font-bold text-rose-200 flex items-center justify-between">
                          <span>{med.name}</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">{med.phone}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{med.address}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCategory("Medical Help")}
                  className="w-full py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Explore Medical Facilities</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              {/* 2. ATM: Warm Gold / Amber Accent */}
              <div
                data-testid="essential-atm"
                className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#141208] via-[#1c180a] to-[#09221b] text-white border border-amber-900/40 hover:border-amber-500/50 transition-all duration-300 shadow-lg flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
                        <WalletCards size={20} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                          <span>24/7 ATM &amp; Cash</span>
                          <span className="text-[9px] text-amber-300 bg-amber-950/90 px-2 py-0.2 rounded-full border border-amber-800/80 font-mono">Cash</span>
                        </h3>
                        <span className="text-[11px] text-amber-200/70">Verified cash points in {selectedLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-amber-950/60">
                    {services.atms.slice(0, 2).map((atm, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-black/30 border border-amber-900/30 text-xs">
                        <div className="font-bold text-amber-200 flex items-center justify-between">
                          <span>{atm.bank}</span>
                          <span className="text-[10px] text-amber-400 font-mono">24/7 Active</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{atm.location}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCategory("ATMs")}
                  className="w-full py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-800/60 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Find All ATMs Nearby</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              {/* 3. Transport: Cyan / Sky Blue & Emerald Accent */}
              <div
                data-testid="essential-transport"
                className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#06141a] via-[#091c24] to-[#09221b] text-white border border-cyan-900/40 hover:border-cyan-500/50 transition-all duration-300 shadow-lg flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shrink-0">
                        <TrainFront size={20} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                          <span>Transit &amp; Railway</span>
                          <span className="text-[9px] text-cyan-300 bg-cyan-950/90 px-2 py-0.2 rounded-full border border-cyan-800/80 font-mono">Transit</span>
                        </h3>
                        <span className="text-[11px] text-cyan-200/70">Connecting stations in {selectedLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-cyan-950/60">
                    {services.transport.slice(0, 2).map((tr, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-black/30 border border-cyan-900/30 text-xs">
                        <div className="font-bold text-cyan-200 flex items-center justify-between">
                          <span>{tr.name}</span>
                          <span className="text-[10px] text-cyan-400 font-mono">{tr.type}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{tr.details}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToMap()}
                  className="w-full py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-800/60 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Transit Routes on Map</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          );
        })()}
      </section>
    </div>
  );
};

export default HomeSections;
