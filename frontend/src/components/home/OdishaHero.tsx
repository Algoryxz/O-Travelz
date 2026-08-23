import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Pause,
  Play,
  Calendar,
  Compass,
} from "lucide-react";

import { getPlaceImageUrl } from "../../utils/imageService";

interface OdishaHeroProps {
  selectedLocation: string;
  onSearch?: (term: string) => void;
  onSurpriseMe?: () => void;
  onSelectDestination?: (name: string) => void;
  onViewAllDestinations?: () => void;
  destinationSearch?: string;
  onSearchChange?: (term: string) => void;
  onNavigateToPlan?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToCopilot?: () => void;
  onSelectCategory?: (cat: string) => void;
  onSelectPlace?: (place: any) => void;
}

export const OdishaHero: React.FC<OdishaHeroProps> = ({
  selectedLocation,
  onSearch,
  onSurpriseMe,
  onSelectDestination,
  onViewAllDestinations,
  destinationSearch,
  onSearchChange,
  onNavigateToPlan,
}) => {
  const [searchTerm, setSearchTerm] = useState(destinationSearch || "");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("2-3 Days");

  const destinations = [
    {
      name: "Konark Sun Temple",
      odiaName: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର",
      category: "Heritage · UNESCO",
      detail: "13th Century · Open 06:00 AM",
      quote: "Stone wheels, sacred geometry, and quiet coastal light",
      bgImage: getPlaceImageUrl("place_konark_001"),
    },
    {
      name: "Chilika Lake",
      odiaName: "ଚିଲିକା ହ୍ରଦ",
      category: "Wildlife · Coastal Lagoon",
      detail: "Irrawaddy Dolphins · Eco Boats",
      quote: "Tranquil brackish waters, wide skies, and migratory birds",
      bgImage: getPlaceImageUrl("place_chilika_001"),
    },
    {
      name: "Daringbadi",
      odiaName: "ଦାରିଙ୍ଗବାଡ଼ି",
      category: "Highlands · Eastern Ghats",
      detail: "Misty Valleys · Coffee Estates",
      quote: "Pine forests, cool mountain air, and scenic highland roads",
      bgImage: getPlaceImageUrl("place_daringbadi_001"),
    },
    {
      name: "Puri Beach",
      odiaName: "ପୁରୀ ସ୍ୱର୍ଣ୍ଣ ବେଳାଭୂମି",
      category: "Beach · Blue Flag Certified",
      detail: "Sunrise Walks · Bay of Bengal",
      quote: "Golden sands, temple bells, and serene marine horizons",
      bgImage: getPlaceImageUrl("place_puri_002"),
    },
  ];

  const [offsetY, setOffsetY] = useState(0);

  // Subtle parallax effect on scroll (respects reduced motion)
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduced) {
          setOffsetY(Math.min(window.scrollY * 0.12, 80));
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-cycle hero slides
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % destinations.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, destinations.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch?.(searchTerm.trim());
      onSearchChange?.(searchTerm.trim());
    } else {
      onViewAllDestinations?.();
    }
  };

  const current = destinations[activeSlide];

  return (
    <section className="relative overflow-hidden bg-[#FBF9F5] border-b border-[#E5DFD5]">
      {/* Background Image Carousel with Subtle Parallax & Warm Editorial Overlay */}
      <div
        className="absolute inset-0 will-change-transform pointer-events-none"
        style={{ transform: `translateY(${offsetY}px)` }}
      >
        {destinations.map((dest, idx) => (
          <div
            key={dest.name}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center ${
              idx === activeSlide ? "opacity-60 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
            style={{ backgroundImage: `url('${dest.bgImage}')` }}
          />
        ))}
      </div>

      {/* Warm Sunlight & Mineral Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FBF9F5]/96 via-[#FBF9F5]/75 to-[#FBF9F5]/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#FBF9F5] via-transparent to-transparent pointer-events-none" />

      {/* Main Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Literary Headline, Narrative & Travel Search Pod */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Location Hub Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E5DFD5] text-[#12161E] text-xs font-semibold shadow-xs">
              <span className="live-dot" />
              <MapPin size={13} className="text-[#B87B22]" />
              <span>{selectedLocation} · Live</span>
              <span className="text-[#70798B] font-odia text-[11px] ml-1">ଓଡ଼ିଶା</span>
            </div>

            <div className="space-y-3">
              <div className="text-[#B87B22] text-xs font-bold uppercase tracking-wider font-mono">
                DISCOVER EVERYTHING IN ODISHA · ODISHA, YOUR WAY
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#12161E] leading-[1.08]">
                Discover everything<br />
                <span className="text-[#B87B22] italic">
                  in Odisha.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#3D4654] font-normal max-w-xl leading-relaxed">
                Multimodal transit routing, verified heritage intelligence, and curated journeys across sacred shrines, coastal lagoons, and mountain sanctuaries.
              </p>
            </div>

            {/* Travel Search Console (Frosted Glass Card) */}
            <form
              onSubmit={handleSearchSubmit}
              className="p-2 sm:p-2.5 bg-[#FFFFFF]/95 border border-[#E5DFD5] rounded-2xl shadow-xl space-y-2.5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                {/* Field 1: Destination input */}
                <div className="sm:col-span-6 flex items-center gap-2.5 px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] focus-within:border-[#B87B22] transition-colors">
                  <Search size={16} className="text-[#70798B] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] uppercase font-mono font-bold text-[#70798B] tracking-wider">
                      Where to?
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        onSearchChange?.(e.target.value);
                      }}
                      placeholder={`Find places near ${selectedLocation}...`}
                      className="w-full text-xs sm:text-sm text-[#12161E] placeholder-[#70798B] bg-transparent border-0 outline-hidden p-0 font-medium"
                      aria-label="Search destinations in English, Odia, or Hindi"
                    />
                  </div>
                </div>

                {/* Field 2: Duration / When */}
                <div className="sm:col-span-3 flex items-center gap-2 px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5]">
                  <Calendar size={15} className="text-[#B87B22] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] uppercase font-mono font-bold text-[#70798B] tracking-wider">
                      Duration
                    </label>
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="w-full text-xs text-[#12161E] bg-transparent border-0 outline-hidden cursor-pointer font-medium"
                    >
                      <option value="1 Day">1 Day</option>
                      <option value="2-3 Days">2–3 Days</option>
                      <option value="4-5 Days">4–5 Days</option>
                      <option value="1 Week">1 Week</option>
                    </select>
                  </div>
                </div>

                {/* Field 3: Action Button */}
                <div className="sm:col-span-3 flex">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white font-serif font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Compass size={15} />
                    <span>Explore</span>
                  </button>
                </div>
              </div>

              {/* Quick tags bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 px-1 border-t border-[#E5DFD5]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#70798B]">
                  <span className="text-[#B87B22] font-semibold font-mono text-[10px]">Multilingual:</span>
                  <span>English · ଓଡ଼ିଆ · हिन्दी</span>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="hero-surprise-me-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSurpriseMe?.();
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F2EEE7] hover:bg-[#EAE4DA] border border-[#E5DFD5] text-[11px] text-[#12161E] font-medium transition-colors cursor-pointer"
                  >
                    <Sparkles size={12} className="text-[#B87B22]" />
                    <span>Surprise Me</span>
                  </button>

                  <button
                    type="button"
                    onClick={onNavigateToPlan}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B87B22]/10 hover:bg-[#B87B22]/20 border border-[#B87B22]/30 text-[11px] text-[#B87B22] font-medium transition-colors cursor-pointer"
                  >
                    <span>Plan a Trip</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Destination Cards Stack */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#70798B] px-1 font-mono uppercase tracking-wider">
              <span>Featured Odysseys</span>
              <span className="text-[#B87B22]">{String(activeSlide + 1).padStart(2, "0")} / 04</span>
            </div>

            <div className="space-y-2.5">
              {destinations.map((dest, idx) => {
                const isActive = idx === activeSlide;
                return (
                  <div
                    key={dest.name}
                    onClick={() => {
                      setActiveSlide(idx);
                      onSelectDestination?.(dest.name);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isActive
                        ? "bg-[#FFFFFF] border border-[#B87B22] shadow-lg translate-x-1"
                        : "bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] border border-[#E5DFD5]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? "bg-[#B87B22]/15 text-[#B87B22] border border-[#B87B22]/30"
                            : "bg-[#F2EEE7] text-[#70798B]"
                        }`}
                      >
                        <MapPin size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-serif font-bold text-sm text-[#12161E] truncate">
                          {dest.name}
                        </div>
                        <div className="text-[11px] text-[#3D4654] truncate">
                          {dest.category}
                        </div>
                        <div className="text-[10px] text-[#B87B22] font-mono flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B87B22]" />
                          {dest.detail}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`shrink-0 transition-transform ${
                        isActive ? "text-[#B87B22] translate-x-0.5" : "text-[#70798B]"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onViewAllDestinations}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FFFFFF] hover:bg-[#F2EEE7] border border-[#E5DFD5] text-[#12161E] font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <span>View all destinations</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </div>

      {/* Hero Bottom Bar with Slide Counter, Pause & Editorial Quote */}
      <div className="relative z-10 border-t border-[#E5DFD5] bg-[#F2EEE7]/90 backdrop-blur-md px-6 sm:px-8 py-3 flex items-center justify-between text-xs text-[#70798B]">
        <div className="truncate max-w-md">
          <span className="font-semibold text-[#12161E]">{current.name}</span> · {current.quote}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-[11px] text-[#B87B22]">
            {String(activeSlide + 1).padStart(2, "0")} / {String(destinations.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="w-6 h-6 rounded-full border border-[#E5DFD5] bg-[#FFFFFF] flex items-center justify-center text-[#3D4654] hover:text-[#12161E] hover:bg-[#F2EEE7] transition-colors cursor-pointer"
            aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
          >
            {isPaused ? <Play size={10} /> : <Pause size={10} />}
          </button>
        </div>
      </div>
    </section>
  );
};
