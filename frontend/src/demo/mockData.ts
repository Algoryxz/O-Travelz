/**
 * DEMO/MOCK DATA - NOT VERIFIED, NOT PRODUCTION DATA.
 * Every place, rating, price, status, and coordinate below is fabricated for
 * visual demonstration only. Do not import this file outside frontend/src/demo/.
 * Replace with live data from the itinerary/places API when Phase 4+ contracts land.
 * See docs/PRD.md and docs/ARCHITECTURE.md - AI orchestrates, it does not invent facts.
 */

import type {
  ItineraryPlanResponse,
  PlaceSummary,
  TransportHop,
} from "../api/contracts";
import type {
  DemoItineraryItem,
  DemoMapPin,
  DemoPlace,
  DemoPlanStep,
  EssentialPlace,
  ResponsibleTourismItem,
} from "./types";

export const CATEGORIES_12 = [
  { id: "nature", icon: "🌿", label: "Nature", sub: "Forests · Waterfalls" },
  { id: "heritage", icon: "🏛", label: "Heritage & Culture", sub: "Temples · Museums" },
  { id: "food", icon: "🍽", label: "Food & Drink", sub: "Cafés · Restaurants" },
  { id: "shopping", icon: "🛍", label: "Shopping & Fashion", sub: "Malls · Markets" },
  { id: "gaming", icon: "🎮", label: "Gaming & Cyber", sub: "PC Cafés · Arcades" },
  { id: "hangout", icon: "😌", label: "Hangout & Chill", sub: "Parks · Rooftops" },
  { id: "entertainment", icon: "🎬", label: "Entertainment", sub: "Cinemas · Bowling" },
  { id: "sports", icon: "⚽", label: "Sports & Activities", sub: "Badminton · Gyms" },
  { id: "medical", icon: "🏥", label: "Medical Help", sub: "Hospitals · Clinics" },
  { id: "transport", icon: "🚌", label: "Transport", sub: "Bus · Rail · Air" },
  { id: "local", icon: "🎨", label: "Local Experiences", sub: "Culture · Art" },
  { id: "atm", icon: "🏧", label: "ATMs", sub: "All banks nearby" },
] as const;

export const POPULAR_CATS = [
  { icon: "☕", label: "Cafés", sub: "120+ open", img: "https://images.unsplash.com/photo-1751956066306-c5684cbcf385?w=600&h=400&fit=crop&auto=format" },
  { icon: "🎬", label: "Cinemas", sub: "28 open now", img: "https://images.unsplash.com/photo-1648472243961-f9060e984066?w=600&h=400&fit=crop&auto=format" },
  { icon: "🎮", label: "Gaming Cafés", sub: "14 open", img: "https://images.unsplash.com/photo-1579018183467-a60b8dc9dd78?w=600&h=400&fit=crop&auto=format" },
  { icon: "🛍", label: "Malls", sub: "10 open", img: "https://images.unsplash.com/photo-1771320892680-a8b2a74400fd?w=600&h=400&fit=crop&auto=format" },
  { icon: "🌿", label: "Outdoor", sub: "Hiking · Cycling", img: "https://images.unsplash.com/photo-1776180040561-b0776ed2d3a7?w=600&h=400&fit=crop&auto=format" },
  { icon: "🏛", label: "Heritage", sub: "Temples · UNESCO", img: "https://images.unsplash.com/photo-1677211352662-30e7775c7ce8?w=600&h=400&fit=crop&auto=format" },
] as const;

export const ODISHA_CITIES = [
  "Bhubaneswar", "Cuttack", "Puri", "Rourkela", "Berhampur", "Sambalpur",
  "Konark", "Balasore", "Baripada", "Paradip", "Daringbadi",
] as const;

const place = (value: DemoPlace): DemoPlace => value;

export const NEARBY_PLACES: DemoPlace[] = [
  place({ id: "ekamra", name: "Ekamra Walks - Bindu Sagar", variant: "attraction", category: "Hangout & Chill", location: "Old Town, Bhubaneswar", distanceKm: 1.5, rating: 4.6, reviewCount: 6800, open: true, openUntil: "8:00 PM", crowd: "low", priceRange: "Free", verified: true, liveData: true, accessible: true, img: "https://images.unsplash.com/photo-1618843808465-befb4ad4a183?w=500&h=360&fit=crop&auto=format", alt: "Peaceful lakeside park walk", badge: "Low crowd now", status: "OPEN NOW", meta: ["Peaceful", "Lake views", "Walking path"] }),
  place({ id: "brewhouse", name: "Brew & Co. Café", variant: "cafe", category: "Food & Drink", location: "Saheed Nagar, Bhubaneswar", distanceKm: 1.2, rating: 4.7, reviewCount: 1840, open: true, openUntil: "11:00 PM", crowd: "moderate", priceRange: "₹150-400", verified: true, liveData: true, accessible: true, img: "https://images.unsplash.com/photo-1751956066306-c5684cbcf385?w=500&h=360&fit=crop&auto=format", alt: "Modern café interior", badge: "Study friendly", status: "OPEN NOW", meta: ["Wi-Fi", "Veg options", "Quiet seating"] }),
  place({ id: "levelup", name: "LevelUp Gaming Zone", variant: "gaming", category: "Gaming & Cyber", location: "Bapuji Nagar, Bhubaneswar", distanceKm: 2.1, rating: 4.5, reviewCount: 960, open: true, openUntil: "1:00 AM", crowd: "moderate", priceRange: "₹60-100/hr", verified: true, liveData: true, accessible: false, img: "https://images.unsplash.com/photo-1579018183467-a60b8dc9dd78?w=500&h=360&fit=crop&auto=format", alt: "Gaming setup with screens", badge: "PC & Console", status: "OPEN NOW", meta: ["40+ PCs", "PS5 available", "Team bookings"] }),
  place({ id: "surbhi", name: "Surbhi Restaurant", variant: "restaurant", category: "Food & Drink", location: "Old Town, Bhubaneswar", distanceKm: 0.8, rating: 4.8, reviewCount: 4100, open: true, openUntil: "10:00 PM", crowd: "low", priceRange: "₹120-350", verified: true, liveData: true, accessible: false, img: "https://images.unsplash.com/photo-1714328864042-1d23671ab8d5?w=500&h=360&fit=crop&auto=format", alt: "Traditional Odia restaurant", badge: "Locally owned", status: "OPEN NOW", meta: ["Dalma · Pakhala", "Thali ₹150", "Since 1994"] }),
  place({ id: "esplanade", name: "Esplanade One Mall", variant: "mall", category: "Shopping & Fashion", location: "Rasulgarh, Bhubaneswar", distanceKm: 4.8, rating: 4.3, reviewCount: 18600, open: true, openUntil: "9:30 PM", crowd: "high", priceRange: "Free entry", verified: true, liveData: true, accessible: true, img: "https://images.unsplash.com/photo-1771320892680-a8b2a74400fd?w=500&h=360&fit=crop&auto=format", alt: "Modern shopping mall", badge: "INOX Cinema inside", status: "OPEN NOW", meta: ["200+ stores", "Food court", "Parking ₹20"] }),
  place({ id: "inox", name: "INOX - Esplanade", variant: "cinema", category: "Entertainment", location: "Rasulgarh, Bhubaneswar", distanceKm: 4.8, rating: 4.4, reviewCount: 7200, open: true, openUntil: "11:30 PM", crowd: "moderate", priceRange: "₹160-380", verified: true, liveData: true, accessible: true, img: "https://images.unsplash.com/photo-1648472243961-f9060e984066?w=500&h=360&fit=crop&auto=format", alt: "Cinema entrance", badge: "Now showing: 6 films", status: "OPEN NOW", meta: ["4K · Dolby", "Next show 5:30 PM", "4 screens"] }),
];

export const ODISHA_DESTINATIONS: DemoPlace[] = [
  place({ id: "konark", name: "Konark Sun Temple", variant: "attraction", category: "Heritage · UNESCO", location: "Konark, Puri District", distanceKm: 65, rating: 4.8, reviewCount: 12400, open: true, openUntil: "6:00 PM", crowd: "moderate", verified: true, liveData: true, accessible: true, img: "https://images.unsplash.com/photo-1677211352662-30e7775c7ce8?w=600&h=420&fit=crop&auto=format", alt: "Konark Sun Temple Odisha", status: "OPEN NOW", meta: ["Entry ₹40", "Best 6-9 AM", "2-3 hrs"] }),
  place({ id: "puri", name: "Puri Golden Beach", variant: "attraction", category: "Beach · Coastal", location: "Puri, Odisha", distanceKm: 60, rating: 4.6, reviewCount: 28700, open: true, crowd: "high", verified: true, liveData: true, accessible: false, img: "https://images.unsplash.com/photo-1655352710727-6c89536454b3?w=600&h=420&fit=crop&auto=format", alt: "Puri Golden Beach Odisha", status: "OPEN NOW", meta: ["Free entry", "Sunrise recommended", "2-4 hrs"] }),
  place({ id: "chilika", name: "Chilika Lake", variant: "attraction", category: "Wildlife · Nature", location: "Chilika, Ganjam District", distanceKm: 105, rating: 4.7, reviewCount: 9800, open: true, openUntil: "5:00 PM", crowd: "low", verified: true, liveData: false, accessible: false, img: "https://images.unsplash.com/photo-1618843808465-befb4ad4a183?w=600&h=420&fit=crop&auto=format", alt: "Chilika Lake Odisha", status: "OPEN NOW", meta: ["Boat ₹200-600", "Winter for birds", "3-5 hrs"] }),
  place({ id: "daringbadi", name: "Daringbadi Hills", variant: "attraction", category: "Nature · Hill Station", location: "Daringbadi, Kandhamal", distanceKm: 280, rating: 4.5, reviewCount: 3400, open: true, crowd: "low", verified: true, liveData: false, accessible: false, img: "https://images.unsplash.com/photo-1776180040561-b0776ed2d3a7?w=600&h=420&fit=crop&auto=format", alt: "Daringbadi misty hills", status: "OPEN NOW", meta: ["Free entry", "Oct-Feb best", "Weekend trip"] }),
];

export const SAFETY_MEDICAL: EssentialPlace[] = [
  { id: "kalinga", name: "Kalinga Hospital", category: "Medical Help", address: "Kusuma Vihar, Bhubaneswar", distanceKm: 2.4, status: "OPEN NOW", contact: "0674-2721888", note: "24/7 Emergency", verified: true },
  { id: "aiims", name: "AIIMS Bhubaneswar", category: "Medical Help", address: "Sijua, Patrapada", distanceKm: 8.2, status: "OPEN NOW", contact: "0674-2476789", note: "Government · 24/7", verified: true },
  { id: "apollo", name: "Apollo Clinic", category: "Medical Help", address: "Unit 9, Bhubaneswar", distanceKm: 1.1, status: "OPEN NOW", contact: "1800-103-0102", note: "OPD · 8 AM-8 PM", verified: true },
];
export const SAFETY_ATM: EssentialPlace[] = [
  { id: "sbi", name: "SBI ATM", category: "ATMs", address: "Unit 4, Bhubaneswar", distanceKm: 0.4, status: "AVAILABLE", verified: true },
  { id: "hdfc", name: "HDFC ATM", category: "ATMs", address: "Saheed Nagar, Bhubaneswar", distanceKm: 0.8, status: "AVAILABLE", verified: true },
  { id: "axis", name: "Axis Bank ATM", category: "ATMs", address: "Jaydev Vihar, Bhubaneswar", distanceKm: 1.2, status: "AVAILABLE", verified: true },
];
export const SAFETY_TRANSPORT: EssentialPlace[] = [
  { id: "rail", name: "Bhubaneswar Railway Station", category: "Transport", address: "Station Square, Bhubaneswar", distanceKm: 3.1, status: "OPEN NOW", contact: "139", note: "IRCTC · All trains", verified: true },
  { id: "air", name: "Biju Patnaik Airport", category: "Transport", address: "Airport Road, Bhubaneswar", distanceKm: 7.2, status: "OPEN NOW", note: "Terminal 2 · Domestic & International", verified: true },
  { id: "bus", name: "Master Canteen Bus Stand", category: "Transport", address: "Master Canteen Square, Bbsr", distanceKm: 1.8, status: "OPEN NOW", note: "OSRTC · City & intercity", verified: true },
];

export const MAP_PINS: DemoMapPin[] = [
  { x: 540, y: 180, name: "Bhubaneswar", type: "city", crowd: "moderate" },
  { x: 610, y: 240, name: "Puri", type: "beach", crowd: "high" },
  { x: 590, y: 220, name: "Konark", type: "heritage", crowd: "moderate" },
  { x: 480, y: 200, name: "Cuttack", type: "city", crowd: "moderate" },
  { x: 450, y: 310, name: "Chilika", type: "nature", crowd: "low" },
  { x: 350, y: 280, name: "Daringbadi", type: "nature", crowd: "low" },
  { x: 670, y: 150, name: "Paradip", type: "beach", crowd: "low" },
  { x: 300, y: 170, name: "Similipal", type: "wildlife", crowd: "low" },
];
export const MAP_CAT_FILTERS = ["All", "Nature", "Heritage & Culture", "Food & Drink", "Shopping & Fashion", "Gaming & Cyber", "Hangout & Chill", "Entertainment", "Sports & Activities", "Medical Help", "Transport", "Local Experiences", "ATMs"] as const;
export const MAP_QUICK_FILTERS = ["Near Me", "Open Now", "Low Crowd", "Accessible", "Budget Friendly", "Highly Rated"] as const;

const summary = (id: string, name: string, category: string): PlaceSummary => ({ id, name, category });

export const ITINERARY: DemoItineraryItem[] = [
  { time: "10:00 AM", icon: "🏛", place: summary("lingaraj", "Lingaraj Temple", "Heritage & Culture"), location: "Old Town", cost: "Free", crowd: "moderate", verified: true },
  { time: "1:00 PM", icon: "🍽", place: summary("surbhi", "Dalma & Pakhala at Surbhi", "Food & Drink"), location: "Old Town", cost: "₹150", crowd: "low", verified: true },
  { time: "3:00 PM", icon: "🛍", place: summary("esplanade", "Esplanade One - Shopping", "Shopping & Fashion"), location: "Rasulgarh", cost: "Free", crowd: "high", verified: true },
  { time: "5:30 PM", icon: "🎬", place: summary("inox", "INOX - Evening Show", "Entertainment"), location: "Rasulgarh", cost: "₹220", crowd: "moderate", verified: true },
  { time: "8:30 PM", icon: "☕", place: summary("brewhouse", "Brew & Co. - Night Chill", "Hangout & Chill"), location: "Saheed Nagar", cost: "₹200", crowd: "low", verified: true },
];

export const AI_PLAN: DemoPlanStep[] = [
  { icon: "🍽", place: summary("surbhi", "Surbhi Restaurant", "Food & Drink"), distance: "0.8 km", travel_time: "10 min walk", price: "₹120-350", verified: true, status: "OPEN NOW" },
  { icon: "🎮", place: summary("levelup", "LevelUp Gaming Zone", "Gaming & Cyber"), distance: "2.1 km", travel_time: "8 min auto", price: "₹60/hr", verified: true, status: "OPEN NOW" },
  { icon: "☕", place: summary("brewhouse", "Brew & Co. Café", "Hangout & Chill"), distance: "1.2 km", travel_time: "5 min auto", price: "₹150-400", verified: true, status: "OPEN NOW" },
  { icon: "🌊", place: summary("ekamra", "Ekamra Walks, Bindu Sagar", "Local Experiences"), distance: "1.5 km", travel_time: "12 min walk", price: "Free", verified: false, status: "STATUS UNAVAILABLE" },
];

export const INTEREST_CHIPS = ["☕ Cafés", "🎮 Gaming", "🎬 Cinema", "🛍 Shopping", "🏎 Activities", "🌿 Nature", "🏛 Heritage", "🍜 Food", "🏖 Beaches", "🎨 Culture", "📚 Study", "💪 Fitness"] as const;

export const RESPONSIBLE_TOURISM: ResponsibleTourismItem[] = [
  { destination: summary("konark", "Konark Sun Temple", "Heritage"), pressure: 78, alternatives: [summary("mukteswar", "Mukteswar Temple", "Heritage"), summary("rajarani", "Rajarani Temple", "Heritage")], alternativeNote: "Equally stunning, far fewer crowds" },
  { destination: summary("puri", "Puri Beach", "Beach"), pressure: 91, alternatives: [summary("konark-beach", "Konark Beach", "Beach"), summary("chandrabhaga", "Chandrabhaga Beach", "Beach")], alternativeNote: "Clean and peaceful alternatives" },
  { destination: summary("chilika", "Chilika Lake", "Wildlife"), pressure: 42, alternatives: [], alternativeNote: "Great time to visit - low season" },
];

export const DEMO_TRANSPORT_HOP: TransportHop = {
  from_sequence: 1,
  to_sequence: 2,
  mode: "walk+bus",
  estimated_minutes: 22,
  estimated_cost: 15,
  legs: [
    { mode: "walk", detail: "8 min to nearest bus stop" },
    { mode: "bus", provider: "Mo Bus", route: "5", detail: "3 stops" },
    { mode: "walk", detail: "4 min to destination" },
  ],
  data_tier: "static",
};

export const DEMO_ITINERARY_PLAN: ItineraryPlanResponse = {
  itinerary_id: "demo-fixture-0001",
  constraints: { days: 1, interests: ["heritage", "food"], start: "Example Hotel" },
  days: [{ day_number: 1, date: "2026-09-01", stops: ITINERARY.map((item, index) => ({ sequence: index + 1, place: item.place, planned_arrival: item.time, planned_departure: null })), hops: [DEMO_TRANSPORT_HOP] }],
  explanation: "Demo itinerary shape only. Replace with the live itinerary API response in Phase 4.",
};
