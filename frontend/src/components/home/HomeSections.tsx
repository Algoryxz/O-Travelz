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
    if (!places || places.length === 0) return [];
    
    // Determine the reference coordinates. Default to Bhubaneswar if none.
    const refLat = userCoords?.lat ?? 20.2961;
    const refLon = userCoords?.lon ?? 85.8245;

    return places
      .filter(place => place.lat != null && place.lon != null)
      .map(place => {
        const dist = calculateDistance(refLat, refLon, place.lat as number, place.lon as number);
        return {
          id: place.id,
          title: place.name,
          category: place.category,
          region: place.region,
          distance: dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`,
          distanceValue: dist,
          status: "Verified Open",
          description: place.description || `Explore ${place.name} in Odisha.`,
          imageUrl: place.imageUrl || getPlaceImageUrl(place.name, place.category),
          rating: 4.8,
          lat: place.lat,
          lon: place.lon,
        };
      })
      .sort((a, b) => a.distanceValue - b.distanceValue)
      .slice(0, 4);
  }, [places, userCoords]);

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
                <span>Location Hub</span>
                <span className="live-dot" />
              </div>
              <div className="text-[11px] text-emerald-300/80 truncate">
                {selectedLocation}, Odisha
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
              <div className="text-xs font-bold text-white">AI Travel Assistant</div>
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
                  <span>LOCAL WEATHER FORECAST · {selectedLocation.toUpperCase()}</span>
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
                return place.status === "Verified Open";
              }
              if (activeFilter === "Top Rated") {
                return place.rating >= 4.6;
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

                      <div className="flex items-center gap-2 text-xs text-emerald-300/90 mt-1 font-mono">
                        <span className="flex items-center gap-1 font-bold text-emerald-400">
                          <MapPin size={11} /> {place.distance}
                        </span>
                        <span>·</span>
                        <span className="text-[11px] text-emerald-200">● {place.status}</span>
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
              <span>YOUR NEXT CHAPTER</span>
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

      {/* 9. DISTINCT ESSENTIALS FOR THE ROAD CARDS (Medical, ATM, Transport) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              ALWAYS WITHIN REACH
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight mt-0.5">
              Essentials for the Road
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToMap()}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Open map</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Essential services and transit networks across Odisha. Explore active facilities before departing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* 1. Medical Help: Emerald & Coral Accent */}
          <button
            type="button"
            data-testid="essential-medical"
            onClick={() => onSelectCategory("Medical Help")}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#12080a] via-[#1a0e12] to-[#09221b] text-white border border-rose-900/40 hover:border-rose-500/50 text-left transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 group flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-400/30 text-rose-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Hospital size={22} />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  <span>Medical Help</span>
                  <span className="text-[10px] text-rose-400 bg-rose-950/80 px-2 py-0.2 rounded-full border border-rose-800/60 font-mono">24/7 ER</span>
                </div>
                <div className="text-xs text-rose-200/70 mt-0.5">Hospitals, trauma &amp; clinics</div>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-rose-400/60 group-hover:text-rose-300 transition-colors" />
          </button>

          {/* 2. ATM: Warm Gold / Amber Accent */}
          <button
            type="button"
            data-testid="essential-atm"
            onClick={() => onSelectCategory("ATMs")}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#141208] via-[#1c180a] to-[#09221b] text-white border border-amber-900/40 hover:border-amber-500/50 text-left transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 group flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <WalletCards size={22} />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  <span>Nearest ATM</span>
                  <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.2 rounded-full border border-amber-800/60 font-mono">Cash</span>
                </div>
                <div className="text-xs text-amber-200/70 mt-0.5">Cash points, ATMs &amp; banks</div>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-amber-400/60 group-hover:text-amber-300 transition-colors" />
          </button>

          {/* 3. Transport: Cyan / Sky Blue & Emerald Accent */}
          <button
            type="button"
            data-testid="essential-transport"
            onClick={() => onNavigateToMap()}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#06141a] via-[#091c24] to-[#09221b] text-white border border-cyan-900/40 hover:border-cyan-500/50 text-left transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 group flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <TrainFront size={22} />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  <span>Transport</span>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.2 rounded-full border border-cyan-800/60 font-mono">Transit</span>
                </div>
                <div className="text-xs text-cyan-200/70 mt-0.5">Routes, stations &amp; buses</div>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-cyan-400/60 group-hover:text-cyan-300 transition-colors" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomeSections;
