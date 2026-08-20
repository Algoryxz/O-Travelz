import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";

import { getPlaceImageUrl } from "../../utils/imageService";

interface OdishaHeroProps {
  selectedLocation: string;
  onSearch: (term: string) => void;
  onSurpriseMe: () => void;
  onSelectDestination: (name: string) => void;
  onViewAllDestinations: () => void;
}

export const OdishaHero: React.FC<OdishaHeroProps> = ({
  selectedLocation,
  onSearch,
  onSurpriseMe,
  onSelectDestination,
  onViewAllDestinations,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const destinations = [
    {
      name: "Daringbadi",
      category: "Hills · Nature",
      detail: "Cool climate · 280 km",
      quote: "Monsoon air and mountain roads",
      bgImage: getPlaceImageUrl("place_daringbadi_001"),
    },
    {
      name: "Chilika Lake",
      category: "Wildlife · Nature",
      detail: "Dolphins · Flamingos",
      quote: "Slow water, wide skies",
      bgImage: getPlaceImageUrl("place_chilika_001"),
    },
    {
      name: "Konark Sun Temple",
      category: "Heritage · UNESCO",
      detail: "Open now · 6:00 PM",
      quote: "Stone, shadow, and a coastline that makes history bigger",
      bgImage: getPlaceImageUrl("place_konark_001"),
    },
    {
      name: "Puri Beach",
      category: "Beach · Coastal",
      detail: "60 km · High season",
      quote: "Salt air, long walks, and an easy coastal reset",
      bgImage: getPlaceImageUrl("place_puri_002"),
    },
  ];

  // Auto-cycle hero slides
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % destinations.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, destinations.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const current = destinations[activeSlide];

  return (
    <section className="hero-container relative">
      {/* Background Image Carousel with Crossfade */}
      {destinations.map((dest, idx) => (
        <div
          key={dest.name}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center ${
            idx === activeSlide ? "opacity-40 scale-100" : "opacity-0 scale-105 pointer-events-none"
          }`}
          style={{ backgroundImage: `url('${dest.bgImage}')` }}
        />
      ))}

      {/* Dark gradient & atmospheric glow */}
      <div className="hero-overlay" />
      <div className="hero-glow" />

      {/* Main Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headings, Search & Surprise Me */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live location badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <span className="live-dot" />
            <MapPin size={13} className="text-emerald-400" />
            <span>{selectedLocation} · Live</span>
          </div>

          <div className="space-y-3">
            <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest font-mono">
              ODISHA, YOUR WAY
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.08]">
              Discover everything<br />
              <span className="text-emerald-400">in Odisha.</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-200 font-normal">
              Temples · Beaches · Cafés · Gaming · Shopping · Food · Activities · Events
            </p>
            <p className="text-xs sm:text-sm text-emerald-200/70 font-light">
              For tourists, locals, students and families alike.
            </p>
          </div>

          {/* Search Bar Pill */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="flex items-center gap-2 p-1.5 pl-4 bg-white rounded-2xl shadow-2xl max-w-lg border border-white/20">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Find places near ${selectedLocation}...`}
                className="w-full text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-transparent border-0 outline-hidden py-2"
                aria-label="Search places"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Surprise Me Button & Subtext */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onSurpriseMe}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs sm:text-sm shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              <Sparkles size={16} />
              <span>Surprise Me</span>
              <ArrowRight size={14} />
            </button>
            <span className="text-xs text-emerald-200/70">
              Location-aware · open places near you
            </span>
          </div>
        </div>

        {/* Right Column: Destination Cards Stack */}
        <div className="lg:col-span-5 space-y-3">
          <div className="space-y-2.5">
            {destinations.map((dest, idx) => {
              const isActive = idx === activeSlide;
              return (
                <div
                  key={dest.name}
                  onClick={() => {
                    setActiveSlide(idx);
                    onSelectDestination(dest.name);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isActive
                      ? "bg-emerald-950/80 border border-emerald-400/60 shadow-xl backdrop-blur-md translate-x-1"
                      : "bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-sm"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/30"
                          : "bg-white/10 text-emerald-300"
                      }`}
                    >
                      <MapPin size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-sm text-white truncate">
                        {dest.name}
                      </div>
                      <div className="text-[11px] text-emerald-200/80 truncate">
                        {dest.category}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {dest.detail}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`shrink-0 transition-transform ${
                      isActive ? "text-emerald-400 translate-x-0.5" : "text-white/40"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onViewAllDestinations}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <span>View all destinations</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Hero Bottom Bar with Slide Counter & Caption */}
      <div className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-md px-6 sm:px-8 py-3 flex items-center justify-between text-xs text-emerald-200/80">
        <div className="truncate max-w-md">
          <span className="font-semibold text-white">{current.name}</span> · {current.quote}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-[11px] text-emerald-300">
            {String(activeSlide + 1).padStart(2, "0")} / {String(destinations.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
          >
            {isPaused ? <Play size={10} /> : <Pause size={10} />}
          </button>
        </div>
      </div>
    </section>
  );
};
