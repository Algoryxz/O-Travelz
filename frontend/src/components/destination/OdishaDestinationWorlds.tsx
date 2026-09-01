/**
 * Cinematic Destination Preview: "Odisha Destination Worlds".
 * Provides an atmospheric, museum-grade visual portal into Odisha's beaches, heritage sanctuaries, and nature biosphere.
 * Designed with strict layer isolation ensuring zero UI overlap with navigation or interactive tools.
 */
import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Compass,
  ArrowRight,
  Sun,
  Waves,
  Trees,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

export interface DestinationWorld {
  id: string;
  name: string;
  odiaName: string;
  category: 'BEACH' | 'HERITAGE' | 'NATURE' | 'SACRED';
  district: string;
  tagline: string;
  description: string;
  atmosphereTheme: 'golden_coastal' | 'ancient_stone' | 'forest_mist' | 'temple_sacred';
  imageUrl: string;
  highlights: string[];
  bestTime: string;
}

export const ODISHA_DESTINATION_WORLDS: DestinationWorld[] = [
  {
    id: 'world_puri_beach',
    name: 'Puri Golden Beach',
    odiaName: 'ପୁରୀ ସୁବର୍ଣ୍ଣ ବେଳାଭୂମି',
    category: 'BEACH',
    district: 'Puri District',
    tagline: 'Golden Waves & Sacred Coastline of the Bay of Bengal',
    description: 'Feel the rhythm of the Bay of Bengal where sacred evening aarti echoes along the golden sands and traditional catamarans rest against the shimmering sunset.',
    atmosphereTheme: 'golden_coastal',
    imageUrl: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?q=80&w=1600&auto=format&fit=crop',
    highlights: ['Blue Flag Certified Beach', 'Sunset Camel & Horse Rides', 'Fresh Seafood Shacks', 'Chakratirtha Peace'],
    bestTime: 'October to March (Sunrise & Sunset)',
  },
  {
    id: 'world_konark',
    name: 'Konark Sun Temple Chariot',
    odiaName: 'କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର',
    category: 'HERITAGE',
    district: 'Puri District',
    tagline: '13th Century Architectural Symphony in Chlorite Stone',
    description: 'Conceived as the colossal chariot of the Sun God Surya, Konark stands as an immortal triumph of Kalinga stonemasonry and astronomical genius.',
    atmosphereTheme: 'ancient_stone',
    imageUrl: 'https://images.unsplash.com/photo-1606210114565-964c5d12038a?q=80&w=1600&auto=format&fit=crop',
    highlights: ['24 Astronomical Sundial Wheels', 'Natya Mandap Odissi Friezes', 'Surya Chariot Plinth', 'Chandrabhaga Beach Proximity'],
    bestTime: 'November to February (Early Morning Sun)',
  },
  {
    id: 'world_chilika',
    name: 'Chilika Lagoon & Satapada',
    odiaName: 'ଚିଲିକା ହ୍ରଦ ଓ ସାତପଡ଼ା',
    category: 'NATURE',
    district: 'Puri / Khordha / Ganjam',
    tagline: 'Asia’s Largest Brackish Water Lagoon & Dolphin Sanctuary',
    description: 'Glide across glassy turquoise waters home to elusive Irrawaddy dolphins and over a million migratory birds nesting among peaceful island sanctuaries.',
    atmosphereTheme: 'golden_coastal',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1600&auto=format&fit=crop',
    highlights: ['Irrawaddy Dolphin Spotting', 'Kalijai Island Temple', 'Nalabana Bird Sanctuary', 'Traditional Boat Cruises'],
    bestTime: 'November to February (Migratory Season)',
  },
  {
    id: 'world_dhauli',
    name: 'Dhauli Shanti Stupa & Daya River',
    odiaName: 'ଦଉଳି ଶାନ୍ତି ସ୍ତୂପ',
    category: 'HERITAGE',
    district: 'Khordha District',
    tagline: 'The Historic Cradle of Non-Violence & Ashokan Edicts',
    description: 'Stand atop Dhauli Hill where Emperor Ashoka renounced conquest after the Kalinga War, embracing universal compassion beneath the serene white Peace Pagoda.',
    atmosphereTheme: 'ancient_stone',
    imageUrl: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?q=80&w=1600&auto=format&fit=crop',
    highlights: ['Ashokan Rock Edicts (3rd Century BCE)', 'White Peace Pagoda', 'Daya River Valley Panoramic Vista', 'Rock-Cut Elephant'],
    bestTime: 'October to March (Evening Light & Sound)',
  },
  {
    id: 'world_daringbadi',
    name: 'Daringbadi Pine Valleys',
    odiaName: 'ଦାରିଙ୍ଗବାଡ଼ି (ଓଡ଼ିଶାର କାଶ୍ମୀର)',
    category: 'NATURE',
    district: 'Kandhamal District',
    tagline: 'The Kashmir of Odisha — Misty Pine Forests & Coffee Gardens',
    description: 'Immerse in cool mountain air, emerald pine plateaus, cascading waterfalls, and sprawling organic coffee plantations nestled deep in the Eastern Ghats.',
    atmosphereTheme: 'forest_mist',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop',
    highlights: ['Pine Forest Canopies', 'Hill View Park', 'Midubanda Waterfall', 'Organic Coffee & Pepper Gardens'],
    bestTime: 'December to February (Sub-Zero Winter Mist)',
  },
  {
    id: 'world_similipal',
    name: 'Similipal Biosphere Reserve',
    odiaName: 'ଶିମିଳିପାଳ ଜୈବମଣ୍ଡଳ',
    category: 'NATURE',
    district: 'Mayurbhanj District',
    tagline: 'UNESCO World Biosphere Reserve & Roaring Waterfalls',
    description: 'Venture into dense ancient Sal forests, mist-shrouded mountain peaks, Joranda and Barehipani waterfalls, and the protected territory of the Royal Bengal Tiger.',
    atmosphereTheme: 'forest_mist',
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=1600&auto=format&fit=crop',
    highlights: ['Barehipani Waterfall (399m)', 'Joranda Waterfall', 'Sal Forest Canopy Safaris', 'Tribal Culture & Crafts'],
    bestTime: 'November to April (Open Ecotourism Season)',
  },
  {
    id: 'world_gopalpur',
    name: 'Gopalpur-on-Sea & Lighthouse',
    odiaName: 'ଗୋପାଳପୁର ବେଳାଭୂମି',
    category: 'BEACH',
    district: 'Ganjam District',
    tagline: 'Historic Silk Port, Victorian Ruins & Coastal Serenity',
    description: 'A tranquil maritime retreat with vintage lighthouse vistas, quiet sandy dunes, swaying casuarina groves, and rich heritage from ancient maritime trade routes.',
    atmosphereTheme: 'golden_coastal',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop',
    highlights: ['Historic 1871 Lighthouse', 'Olive Ridley Nesting Nearby', 'Serene Uncrowded Sands', 'Seafood Cuisine'],
    bestTime: 'October to March (Gentle Sea Breezes)',
  },
];

interface OdishaDestinationWorldsProps {
  onExploreDestination?: (worldId: string, name: string) => void;
  onPlanTrip?: (name: string) => void;
}

export const OdishaDestinationWorlds: React.FC<OdishaDestinationWorldsProps> = ({
  onExploreDestination,
  onPlanTrip,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filteredWorlds = ODISHA_DESTINATION_WORLDS.filter(
    (w) => activeCategory === 'ALL' || w.category === activeCategory
  );

  const activeWorld = filteredWorlds[activeIndex] || filteredWorlds[0] || ODISHA_DESTINATION_WORLDS[0];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % filteredWorlds.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + filteredWorlds.length) % filteredWorlds.length);
  };

  return (
    <section className="relative py-16 bg-slate-950 text-slate-100 overflow-hidden border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cinematic Destination Preview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-100">
              Odisha Destination Worlds
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
              Immerse yourself in high-definition visual showcases of pristine coastlines, UNESCO heritage sanctuaries, and mist-covered mountain valleys.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 backdrop-blur-md">
            {['ALL', 'BEACH', 'HERITAGE', 'NATURE'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Worlds' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Master Cinematic Hero Card */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl min-h-[460px] sm:min-h-[520px] flex flex-col justify-between p-6 sm:p-10">
          {/* Layer 1: Atmospheric Background Image Canvas */}
          <div className="absolute inset-0 z-0">
            <img
              src={activeWorld.imageUrl}
              alt={activeWorld.name}
              className="w-full h-full object-cover object-center transform transition-transform duration-1000 scale-105"
            />
            {/* Multi-layered cinematic gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
          </div>

          {/* Layer 2: Top Floating Metadata Pills */}
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
                {activeWorld.category}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700/60">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeWorld.district}</span>
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md transition-colors"
                aria-label="Previous destination"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-300 px-1">
                {activeIndex + 1} / {filteredWorlds.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md transition-colors"
                aria-label="Next destination"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Layer 3: Central Content and Action Block */}
          <div className="relative z-10 max-w-2xl mt-auto pt-8">
            <div className="text-xs font-serif text-amber-300/90 font-medium mb-1">
              {activeWorld.odiaName}
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight mb-2">
              {activeWorld.name}
            </h3>
            <p className="text-sm sm:text-base font-medium text-amber-200/90 mb-3">
              {activeWorld.tagline}
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 mb-5">
              {activeWorld.description}
            </p>

            {/* Highlights Tag Chips */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {activeWorld.highlights.map((h, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900/70 border border-slate-700/50 text-slate-200 backdrop-blur-sm"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {onPlanTrip && (
                <button
                  type="button"
                  onClick={() => onPlanTrip(activeWorld.name)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-amber-500/20"
                >
                  <Compass className="w-4 h-4" />
                  <span>Plan Trip to {activeWorld.name.split(' ')[0]}</span>
                </button>
              )}

              {onExploreDestination && (
                <button
                  type="button"
                  onClick={() => onExploreDestination(activeWorld.id, activeWorld.name)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700/70 backdrop-blur-md transition-colors"
                >
                  <span>Explore World</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail Selector Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mt-6">
          {filteredWorlds.map((world, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={world.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative rounded-2xl overflow-hidden aspect-[4/3] text-left p-2.5 flex flex-col justify-end transition-all duration-200 border ${
                  isSelected
                    ? 'ring-2 ring-amber-400 border-transparent shadow-lg scale-105 z-10'
                    : 'border-slate-800 opacity-60 hover:opacity-90'
                }`}
              >
                <img
                  src={world.imageUrl}
                  alt={world.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="relative z-10">
                  <div className="text-[10px] font-bold text-amber-300 truncate">
                    {world.name}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">
                    {world.district.split(' ')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
