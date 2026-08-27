import React, { useState, useMemo } from 'react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';
import { useLocation } from '../../context/LocationContext';
import { useRegisterAIContext } from '../../context/AIContext';
import { MANUAL_IMAGE_OVERRIDES } from '../../utils/imageRegistry';
import { getFeaturedOdishaDestinations } from '../../utils/imageService';
import { CoverflowCarousel, type CoverflowItem } from '../../components/gallery/CoverflowCarousel';
import { ODISHA_EXPERIENCES } from '../../data/odishaExperiences';
import { StitchWeatherSection } from '../../components/stitch/StitchWeatherSection';
import { StitchTransitSection } from '../../components/stitch/StitchTransitSection';
import { SurpriseMeButton } from '../../components/discovery/SurpriseMeButton';
import { ImageIdentifyButton } from '../../components/discovery/ImageIdentifyButton';
import { ImageIdentifyModal } from '../../components/discovery/ImageIdentifyModal';
import { CircuitsTicker } from '../../components/home/CircuitsTicker';
import { EssentialsSection } from '../../components/home/EssentialsSection';

interface StitchHomePageProps {
  onNavigate: (tab: StitchTab, params?: Record<string, string>) => void;
  onSearch: (query: string) => void;
  onOpenOnboarding?: () => void;
}

export const StitchHomePage: React.FC<StitchHomePageProps> = ({
  onNavigate,
  onSearch,
  onOpenOnboarding,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const { locationName, isLive } = useLocation();

  useRegisterAIContext(
    useMemo(
      () => ({
        page: 'home',
        location: {
          city: locationName,
          district: locationName,
          location_type: isLive ? 'LIVE_GPS' : 'USER_SELECTION',
        },
      }),
      [locationName, isLive]
    )
  );


  const discoveryCarouselItems: CoverflowItem[] = useMemo(() => {
    const featured = getFeaturedOdishaDestinations();
    return featured.map((d) => ({
      id: d.id,
      title: d.name,
      src: d.imageUrl,
      imageUrl: d.imageUrl,
      alt: d.name,
      category: d.category,
      tag: d.category,
      subtitle: d.description,
      description: d.description,
      meta: d.location,
      location: d.location,
    }));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      onNavigate('destinations', { query: searchInput.trim() });
    } else {
      onNavigate('destinations');
    }
  };

  const heroDestinations = useMemo(() => [
    {
      id: "place_konark_001",
      name: "Konark Sun Temple",
      odiaName: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର",
      category: "HERITAGE · UNESCO",
      location: "Konark, Puri District",
      detail: "13th Century Sanctuary",
      imageUrl: MANUAL_IMAGE_OVERRIDES["place_konark_001"],
    },
    {
      id: "place_chilika_001",
      name: "Chilika Lake",
      odiaName: "ଚିଲିକା ହ୍ରଦ",
      category: "COASTAL LAGOON",
      location: "Satapada & Mangalajodi",
      detail: "Asia's Largest Brackish Lagoon",
      imageUrl: MANUAL_IMAGE_OVERRIDES["place_chilika_001"],
    },
    {
      id: "place_daringbadi_001",
      name: "Daringbadi Valleys",
      odiaName: "ଦାରିଙ୍ଗବାଡ଼ି",
      category: "EASTERN GHATS",
      location: "Kandhamal Pine Valleys",
      detail: "Misty Valleys & Coffee Estates",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlDr9_Cek0l7sSj8p9l7a6HT5uYjYAkDij85CJ6uhJV8eizUTCMbyqKS4rlQKXpG2i_BAztVjrdoDYjZIbQf8MmFqxgB0ahaa_X9gAvn4_CQZQqUYVJ2EJJcBH365Dnwd9Pzr9EjRdsnuQtHhSbVBInYpZfeCz3nxzq4oX91YTxIfZ2oJgCpbMwIbcANSqHH1brcUm9gKAfrBa1CocGM7zZ-ARsFtyYEl2koEkEHUjoBnA9_7xyjBwbDAqj3MnQXISntVnPN8L17U",
    },
    {
      id: "place_puri_001",
      name: "Jagannath Temple & Puri Coast",
      odiaName: "ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର",
      category: "SACRED HERITAGE",
      location: "Puri Golden Coast",
      detail: "12th Century Living Shrines",
      imageUrl: MANUAL_IMAGE_OVERRIDES["place_puri_001"],
    },
  ], []);

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Auto-cycle hero slides every 7 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroDestinations.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroDestinations.length]);

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* 1. CINEMATIC HERO SECTION WITH REAL ODISHA PHOTOGRAPHY & SPATIAL GLASS STACK */}
      <section className="relative w-full min-h-[90vh] lg:min-h-[88vh] flex flex-col justify-center pt-28 pb-16 px-6 md:px-12 overflow-hidden bg-[#12161E]">
        {/* Background Crossfading Photography */}
        {heroDestinations.map((dest, idx) => (
          <img
            key={dest.id}
            src={dest.imageUrl}
            alt={dest.name}
            className={`absolute inset-0 w-full h-full object-cover object-center z-0 transition-all duration-1000 ease-out ${
              idx === activeHeroIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida-public/AB6AXuDlDr9_Cek0l7sSj8p9l7a6HT5uYjYAkDij85CJ6uhJV8eizUTCMbyqKS4rlQKXpG2i_BAztVjrdoDYjZIbQf8MmFqxgB0ahaa_X9gAvn4_CQZQqUYVJ2EJJcBH365Dnwd9Pzr9EjRdsnuQtHhSbVBInYpZfeCz3nxzq4oX91YTxIfZ2oJgCpbMwIbcANSqHH1brcUm9gKAfrBa1CocGM7zZ-ARsFtyYEl2koEkEHUjoBnA9_7xyjBwbDAqj3MnQXISntVnPN8L17U";
            }}
          />
        ))}

        {/* Rich Vignette Overlays ensuring crisp typography & spatial glass readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12161E] via-[#12161E]/60 to-[#12161E]/30 z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#12161E]/95 via-[#12161E]/55 to-transparent z-10 pointer-events-none"></div>

        {/* Hero Grid Container */}
        <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Narrative & Editorial Search Pod */}
          <div className="lg:col-span-7 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-white text-xs font-mono mb-2">
              <span className="w-2 h-2 rounded-full bg-[#B87B22]"></span>
              <span>Intelligent Odisha Travel Intelligence</span>
              {isLive && (
                <span className="text-[#E5DFD5]">• Near {locationName}</span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight leading-[1.1]">
              Some places are visited.<br />
              <span className="italic font-normal text-[#E5DFD5]">Some are discovered.</span>
            </h1>

            <p className="text-base sm:text-xl font-body text-[#E5DFD5] max-w-2xl leading-relaxed">
              A luxury editorial exploration of Odisha. 161 verified sanctuaries, authentic culinary traditions, and spatial route planning.
            </p>

            {/* Editorial Search Pod with Image Scan & Surprise Me Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-3xl">
              <form
                onSubmit={handleSearchSubmit}
                className="flex-1 bg-white/95 backdrop-blur-xl border border-white/40 p-2 sm:p-2.5 rounded-2xl shadow-2xl flex items-center gap-2"
              >
                <div className="flex-1 flex items-center gap-2.5 px-3 min-w-0">
                  <span className="material-symbols-outlined text-[#B87B22] text-xl shrink-0">search</span>
                  <input
                    type="text"
                    placeholder="Search destinations, places, experiences..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-transparent text-[#12161E] placeholder-[#70798B] font-body text-xs sm:text-sm focus:outline-none truncate"
                  />
                </div>

                {/* Camera Image Scan / Upload Button [ 📷 ] */}
                <ImageIdentifyButton
                  onImageSelected={(base64, name) => {
                    setSelectedImageData(base64);
                    setSelectedImageName(name);
                    setImageModalOpen(true);
                  }}
                />

                {/* Surprise Me Dice Button [ 🎲 ] */}
                <SurpriseMeButton
                  variant="hero"
                  onNavigateToMap={(id, lat, lon) => {
                    onNavigate('map', { placeId: id, lat: lat ? String(lat) : '', lon: lon ? String(lon) : '' });
                  }}
                  onPlanTrip={(name) => {
                    onNavigate('plan', { query: name });
                  }}
                />

                <button
                  type="submit"
                  className="bg-[#B87B22] hover:bg-[#A0691B] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-body text-xs sm:text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Explore</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: 4 Spatial Glass Destination Panels (Stitch-Led Design) */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 space-y-3">
            {/* Header label */}
            <div className="flex items-center justify-between text-xs text-[#E5DFD5]/90 font-mono tracking-widest uppercase px-1">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#B87B22] animate-pulse"></span>
                <span>FEATURED ODYSSEYS</span>
              </span>
              <span className="text-[#B87B22] font-semibold">
                {String(activeHeroIndex + 1).padStart(2, "0")} / 04
              </span>
            </div>

            {/* Spatial Glass Stack Panels */}
            <div className="flex flex-col space-y-2.5 sm:space-y-3 relative">
              {heroDestinations.map((dest, idx) => {
                const isActive = idx === activeHeroIndex;
                return (
                  <div
                    key={dest.id}
                    onClick={() => setActiveHeroIndex(idx)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl transition-all duration-500 cursor-pointer flex items-center justify-between gap-3.5 backdrop-blur-[24px] backdrop-saturate-[135%] border select-none ${
                      isActive
                        ? "bg-white/[0.22] border-white/60 border-l-4 border-l-[#B87B22] shadow-[0_16px_40px_rgba(0,0,0,0.5)] lg:translate-x-3 scale-[1.02] z-20"
                        : "bg-white/[0.12] hover:bg-white/[0.18] border-white/25 hover:border-white/40 shadow-[0_8px_24px_rgba(0,0,0,0.3)] scale-[0.98] opacity-80 hover:opacity-100 z-10"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Destination Thumbnail with Glass Ring */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md shrink-0 ring-1 ring-white/30">
                        <img
                          src={dest.imageUrl}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className={`absolute inset-0 ${isActive ? "bg-[#B87B22]/15" : "bg-black/20"}`} />
                        {isActive && (
                          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B87B22] ring-2 ring-white animate-pulse" />
                        )}
                      </div>

                      {/* Editorial Destination Info */}
                      <div className="min-w-0 space-y-0.5">
                        <span className="text-[10px] font-mono font-semibold tracking-wider text-[#B87B22] uppercase block">
                          {dest.category}
                        </span>
                        <h4 className="font-display font-bold text-base sm:text-lg text-white leading-tight truncate">
                          {dest.name}
                        </h4>
                        <p className="text-[11px] font-body text-[#E5DFD5]/90 truncate">
                          {dest.location}
                        </p>
                      </div>
                    </div>

                    {/* Action CTA */}
                    <div className="shrink-0 flex items-center gap-1">
                      {isActive ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('destinations', { query: dest.name });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer whitespace-nowrap"
                        >
                          <span>Explore</span>
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </button>
                      ) : (
                        <span className="material-symbols-outlined text-white/50 text-base">
                          chevron_right
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. RESTORED DESTINATION DISCOVERY SECTION */}
      <section
        data-testid="destination-discovery-section"
        className="w-full bg-[#FBF9F5] border-b border-[#E5DFD5] py-16 md:py-24 px-6 md:px-12"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Text-led Editorial Header */}
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono text-[#B87B22] tracking-widest uppercase font-semibold block">
              DESTINATION DISCOVERY
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#12161E] tracking-tight leading-[1.15]">
              Places worth taking<br className="hidden sm:inline" /> the long way for.
            </h2>
            <p className="font-body text-sm sm:text-base text-[#70798B] leading-relaxed max-w-2xl">
              A curated look at Odisha's coast, temples, forests, lakes and historic cities.
            </p>
          </div>

          {/* Glassmorphism Coverflow Carousel */}
          <CoverflowCarousel
            items={discoveryCarouselItems}
            onSelectItem={(item) => onNavigate('destinations', { query: item.title })}
            onExploreItem={(item) => onNavigate('destinations', { query: item.title })}
          />
        </div>
      </section>

      {/* 3. CONTINUOUS HORIZONTAL MOVING TICKER: POPULAR CIRCUITS */}
      <CircuitsTicker
        onSelectCircuit={(circuitName) => {
          onSearch(circuitName);
          onNavigate('destinations', { query: circuitName });
        }}
      />

      {/* 4. ESSENTIALS NEAR YOU SECTION */}
      <EssentialsSection
        onOpenHotels={() => onNavigate('map', { mode: 'hotels' })}
        onOpenMedical={() => onNavigate('map', { mode: 'medical' })}
        onOpenATM={() => onNavigate('map', { mode: 'atm' })}
        onOpenTransit={() => onNavigate('map', { mode: 'transit' })}
        onOpenCulinary={() => onNavigate('map', { mode: 'culinary' })}
        onOpenPetrol={() => onNavigate('map', { mode: 'petrol' })}
        onOpenPolice={() => onNavigate('map', { mode: 'police' })}
      />

      {/* 5. TRAVEL PERSONALITY ONBOARDING CALLOUT */}
      {onOpenOnboarding && (
        <section className="bg-[#FBF9F5] border-b border-[#E5DFD5] py-8 px-6 md:px-12">
          <div className="max-w-6xl mx-auto bg-white border border-[#E5DFD5] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#B87B22]/10 text-[#B87B22] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">psychology</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-[#12161E]">
                  Personalize Your Odisha Expedition
                </h3>
                <p className="font-body text-xs md:text-sm text-[#70798B] mt-1">
                  Tell us your travel pace, culinary appetites, and passions to receive curated recommendations.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenOnboarding}
              className="px-6 py-3 bg-[#12161E] hover:bg-[#B87B22] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              <span>Take Personality Quiz</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </section>
      )}

      {/* 6. CURATED SANCTUARIES & EXPEDITIONS */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#E5DFD5] pb-6">
          <div>
            <span className="text-xs font-mono text-[#B87B22] tracking-widest uppercase font-semibold">
              Editorial Signature Circuits
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#12161E] mt-1">
              Curated Expeditions
            </h2>
          </div>
          <button
            onClick={() => onNavigate('destinations')}
            className="text-xs font-mono text-[#B87B22] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>View All 161 Destinations</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* 3 Major Signature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Konark & Golden Triangle */}
          <article
            onClick={() => onNavigate('plan', { hub: 'konark' })}
            className="group relative h-[450px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-[#E5DFD5]"
          >
            <img
              src={MANUAL_IMAGE_OVERRIDES["place_konark_001"]}
              alt="Konark Sun Temple"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12161E] via-[#12161E]/40 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="text-xs font-mono bg-[#B87B22] px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                3 Days Classic
              </span>
              <h3 className="font-display text-2xl font-bold mt-3 mb-2">
                The Golden Triangle
              </h3>
              <p className="font-body text-xs text-[#E5DFD5] line-clamp-2 leading-relaxed">
                Bhubaneswar's ancient rock edicts, Puri's sacred seaside rituals, and the stone sundials of Konark.
              </p>
            </div>
          </article>

          {/* Card 2: Chilika Marine Lagoon */}
          <article
            onClick={() => onNavigate('plan', { hub: 'chilika' })}
            className="group relative h-[450px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-[#E5DFD5]"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBncciVZ_jB169hv_MKF44YxFY_wzB-0nEJAi6vrAnpeouErvxxKFxom7VZ-7VH9-vNrDKxN8ByHJmV0fSwpDCvfWJimHI98mDrHhdQnuSK-QwL88IBCAMCSVoaVGRLgl5O7mtGsbvpmBuHP6F7yMkUsDNRu85F9aKH8KliiglC5e8ZyAzkBtt2vd3fxyF1_cC1PJSxaPskidx5Q5U3hRBdUeDZoLNEobb-CVjWhJsGiP4yU1xS39ATAVvK4PfVW7q626KW5dHZYu0"
              alt="Chilika Lake"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12161E] via-[#12161E]/40 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="text-xs font-mono bg-[#1B5E6B] px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                2 Days Marine
              </span>
              <h3 className="font-display text-2xl font-bold mt-3 mb-2">
                Chilika Water Sanctuaries
              </h3>
              <p className="font-body text-xs text-[#E5DFD5] line-clamp-2 leading-relaxed">
                Dolphin cruises on Asia's largest brackish lagoon, fresh seafood shacks, and Kalijai Island.
              </p>
            </div>
          </article>

          {/* Card 3: Koraput & Daringbadi */}
          <article
            onClick={() => onNavigate('plan', { hub: 'bhubaneswar' })}
            className="group relative h-[450px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-[#E5DFD5]"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlDr9_Cek0l7sSj8p9l7a6HT5uYjYAkDij85CJ6uhJV8eizUTCMbyqKS4rlQKXpG2i_BAztVjrdoDYjZIbQf8MmFqxgB0ahaa_X9gAvn4_CQZQqUYVJ2EJJcBH365Dnwd9Pzr9EjRdsnuQtHhSbVBInYpZfeCz3nxzq4oX91YTxIfZ2oJgCpbMwIbcANSqHH1brcUm9gKAfrBa1CocGM7zZ-ARsFtyYEl2koEkEHUjoBnA9_7xyjBwbDAqj3MnQXISntVnPN8L17U"
              alt="Daringbadi Hill Station"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12161E] via-[#12161E]/40 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="text-xs font-mono bg-[#2F523E] px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                4 Days Highlands
              </span>
              <h3 className="font-display text-2xl font-bold mt-3 mb-2">
                Southern Coffee Valleys
              </h3>
              <p className="font-body text-xs text-[#E5DFD5] line-clamp-2 leading-relaxed">
                Misty pine valleys in Daringbadi, coffee plantations, and Deomali's soaring peaks in the Eastern Ghats.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* 7. ODISHA CULINARY & CRAFT EXPERIENCES RAIL */}
      <section className="py-16 bg-white border-t border-b border-[#E5DFD5] px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <span className="text-xs font-mono text-[#B87B22] tracking-widest uppercase font-semibold">
                Distinct Odia Heritage
              </span>
              <h2 className="text-3xl font-display font-bold text-[#12161E] mt-1">
                Culinary &amp; Craft Traditions
              </h2>
            </div>
            <button
              onClick={() => onNavigate('destinations', { category: 'food' })}
              className="text-xs font-mono text-[#B87B22] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Explore All Experiences</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ODISHA_EXPERIENCES.slice(0, 4).map((exp) => (
              <div
                key={exp.id}
                onClick={() => onNavigate('destinations', { query: exp.name })}
                className="bg-[#FBF9F5] border border-[#E5DFD5] rounded-xl p-5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[11px] font-mono text-[#B87B22] bg-[#B87B22]/10 px-2 py-0.5 rounded font-semibold">
                      {exp.categoryLabel}
                    </span>
                    <span className="text-[10px] font-mono text-[#70798B]">{exp.district}</span>
                  </div>
                  <h4 className="font-display font-bold text-lg text-[#12161E] mb-2 leading-snug">
                    {exp.name}
                  </h4>
                  <p className="font-body text-xs text-[#3D4654] line-clamp-3 leading-relaxed">
                    {exp.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5DFD5] flex justify-between items-center text-[11px] font-mono text-[#70798B]">
                  <span>{exp.locality.split(',')[0]}</span>
                  <span className="text-[#B87B22] font-semibold flex items-center gap-0.5">
                    <span>Details</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. MO BUS & PUBLIC TRANSIT INTELLIGENCE SECTION */}
      <StitchTransitSection
        onNavigateToMap={(lat, lon, stopName) => {
          onNavigate('map', { lat: String(lat), lon: String(lon), query: stopName || '' });
        }}
        onAddStopToTrip={(stopName, routeNum) => {
          onNavigate('plan', { hub: stopName, route: routeNum || '' });
        }}
      />

      {/* 9. FULL-WIDTH EDITORIAL WEATHER SECTION */}
      <StitchWeatherSection />

      {/* 10. IMAGE IDENTIFICATION / CAMERA SCAN DISCOVERY MODAL */}
      <ImageIdentifyModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageData={selectedImageData}
        fileName={selectedImageName}
        onNavigate={onNavigate}
      />
    </div>
  );
};
