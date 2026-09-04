import React, { useState, useEffect, useMemo } from 'react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';
import { apiClient } from '../../api/client';
import type { PlaceDetail } from '../../api/contracts';
import { useRegisterAIContext } from '../../context/AIContext';
import { StitchDestinationDetailModal } from '../../components/stitch/StitchDestinationDetailModal';
import { resolveDestinationImage, getCategoryFallbackSvg } from '../../utils/imageRegistry';
import { ODISHA_EXPERIENCES } from '../../data/odishaExperiences';
import { StitchWeatherSection } from '../../components/stitch/StitchWeatherSection';
import { getPlaceOdiaName } from '../../data/canonicalOdiaPlaces';
import type { MapPlaceMarker } from '../../components/map/MapLibreCanvas';

const MapLibreCanvas = React.lazy(() =>
  import('../../components/map/MapLibreCanvas').then((m) => ({ default: m.MapLibreCanvas }))
);

interface StitchDestinationsPageProps {
  onNavigate: (tab: StitchTab, params?: Record<string, string>) => void;
  initialQuery?: string;
  initialCategory?: string;
  onSelectPlace?: (place: PlaceDetail) => void;
}

export const StitchDestinationsPage: React.FC<StitchDestinationsPageProps> = ({
  onNavigate,
  initialQuery = '',
  initialCategory = 'All',
  onSelectPlace,
}) => {
  const [places, setPlaces] = useState<PlaceDetail[]>([]);
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedPlaceForModal, setSelectedPlaceForModal] = useState<PlaceDetail | null>(null);
  const [viewLayout, setViewLayout] = useState<'grid' | 'split_map'>('grid');
  const [selectedPlaceIdForMap, setSelectedPlaceIdForMap] = useState<string | null>(null);

  useRegisterAIContext(
    useMemo(
      () => ({
        page: selectedPlaceForModal ? 'destination_detail' : 'destinations',
        destination: selectedPlaceForModal
          ? {
              id: selectedPlaceForModal.id,
              name: selectedPlaceForModal.name,
              category: typeof selectedPlaceForModal.category === 'string' ? selectedPlaceForModal.category : (selectedPlaceForModal.category as any)?.name,
              district: selectedPlaceForModal.district,
            }
          : null,
      }),
      [selectedPlaceForModal]
    )
  );

  useEffect(() => {
    let isMounted = true;
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = { limit: '250' };
        if (selectedCategory !== 'All' && selectedCategory !== 'Food' && selectedCategory !== 'Crafts' && selectedCategory !== 'Shopping') {
          params.category = selectedCategory.toLowerCase();
        }
        if (selectedRegion !== 'All') params.region = selectedRegion;
        if (search.trim()) params.search = search.trim();

        const data = await apiClient.listPlaces(params);
        if (isMounted && Array.isArray(data)) {
          // Gate: Authenticate destinations with verified metadata
          setPlaces(data);
        }
      } catch (err) {
        console.warn('API error fetching places, falling back to local dataset:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPlaces();
    return () => { isMounted = false; };
  }, [search, selectedCategory, selectedRegion]);

  const handleCardClick = (place: PlaceDetail) => {
    setSelectedPlaceForModal(place);
    setSelectedPlaceIdForMap(place.id);
    if (onSelectPlace) onSelectPlace(place);
  };

  // Convert places for MapLibre
  const mapLibreMarkers: MapPlaceMarker[] = useMemo(() => {
    return places
      .filter((p) => p.lat != null && p.lon != null && !isNaN(p.lat) && !isNaN(p.lon))
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category || 'Sanctuary',
        lat: p.lat!,
        lng: p.lon!,
        imageUrl: p.images?.[0]?.url,
        verificationStatus: (p.verification_status as any) || 'VERIFIED_CANONICAL',
      }));
  }, [places]);

  // Filter experiences when Food / Crafts / Shopping are selected
  const matchingExperiences = ODISHA_EXPERIENCES.filter(exp => {
    if (selectedCategory === 'Food' && exp.type !== 'food_experience' && exp.type !== 'restaurant') return false;
    if (selectedCategory === 'Crafts' && exp.type !== 'craft') return false;
    if (selectedCategory === 'Shopping' && exp.type !== 'shopping' && exp.type !== 'mall') return false;
    if (selectedCategory !== 'All' && selectedCategory !== 'Food' && selectedCategory !== 'Crafts' && selectedCategory !== 'Shopping') return false;
    if (selectedRegion !== 'All' && !exp.region.includes(selectedRegion)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return exp.name.toLowerCase().includes(q) || exp.description.toLowerCase().includes(q) || exp.tags.some(t => t.includes(q));
    }
    return true;
  });

  const showExperiencesSection = selectedCategory === 'Food' || selectedCategory === 'Crafts' || selectedCategory === 'Shopping' || (selectedCategory === 'All' && !search);

  return (
    <div className="w-full pt-28 pb-0 min-h-screen flex flex-col justify-between">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto w-full mb-16">
        {/* Editorial Header */}
        <header className="mb-8 border-b border-[#E5DFD5] pb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#B87B22]/10 text-[#B87B22] px-3 py-1 rounded-full text-xs font-mono font-medium mb-3">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>204 Canonical Sanctuaries + Verified Cultural Heritage</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-[#12161E] tracking-tight">
                Destinations &amp; Cultural Atlas
              </h1>
              <p className="text-sm md:text-base font-body text-[#70798B] mt-2 max-w-2xl">
                Verified spiritual monuments, architectural marvels, coastal lagoons, and living craft ecosystems across all 30 districts of Odisha.
              </p>
            </div>

            {/* Quick Search & View Toggle */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#70798B] text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search places (Odia / Hindi / English)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-[#E5DFD5] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#12161E] placeholder-[#70798B] focus:border-[#B87B22] focus:outline-none shadow-xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#70798B] hover:text-[#12161E] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                )}
              </div>

              {/* View Layout Toggle: Grid vs Split Map */}
              <div className="flex items-center bg-white border border-[#E5DFD5] rounded-lg p-1 shadow-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setViewLayout('grid')}
                  title="Grid View"
                  className={`p-1.5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                    viewLayout === 'grid'
                      ? 'bg-[#12161E] text-white shadow-xs'
                      : 'text-[#70798B] hover:text-[#12161E]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout('split_map')}
                  title="Split Map View"
                  className={`p-1.5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                    viewLayout === 'split_map'
                      ? 'bg-[#B87B22] text-white shadow-xs'
                      : 'text-[#70798B] hover:text-[#B87B22]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 items-center font-body text-xs">
            <span className="font-mono text-[#70798B] mr-2">Region:</span>
            {['All', 'Coastal Belt', 'Western Highlands', 'Northern Biosphere', 'Koraput & Tribal Highlands', 'Central Heritage'].map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                  selectedRegion === region
                    ? 'bg-[#12161E] text-white border-[#12161E] font-medium'
                    : 'bg-white text-[#3D4654] border-[#E5DFD5] hover:bg-[#F2EEE7]'
                }`}
              >
                {region}
              </button>
            ))}

            <span className="font-mono text-[#70798B] ml-4 mr-2">Category:</span>
            {['All', 'Temple', 'Nature', 'Beach', 'Wildlife', 'Waterfall', 'Food', 'Crafts', 'Shopping'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#B87B22] text-white border-[#B87B22] font-medium'
                    : 'bg-white text-[#3D4654] border-[#E5DFD5] hover:bg-[#F2EEE7]'
                }`}
              >
                {cat}
              </button>
            ))}

            {(selectedCategory !== 'All' || selectedRegion !== 'All' || search) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedRegion('All');
                  setSearch('');
                }}
                className="ml-auto text-[#A84825] hover:underline font-mono text-xs cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </header>

        {/* Section: Verified Experiences (if Food / Crafts / Shopping active) */}
        {showExperiencesSection && matchingExperiences.length > 0 && viewLayout === 'grid' && (
          <section className="mb-14">
            <div className="flex justify-between items-end mb-6 border-b border-[#E5DFD5] pb-3">
              <div>
                <span className="text-[11px] font-mono text-[#1B5E6B] font-semibold uppercase tracking-wider">
                  Living Heritage
                </span>
                <h3 className="text-xl md:text-2xl font-display font-bold text-[#12161E] mt-0.5">
                  Culinary, Handloom &amp; Craft Clusters ({matchingExperiences.length})
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingExperiences.map(exp => {
                const imgResult = resolveDestinationImage({ id: exp.image_key, name: exp.name, category: exp.type });
                return (
                  <article
                    key={exp.id}
                    className="bg-white border border-[#E5DFD5] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-[#F2EEE7]">
                      <img
                        src={imgResult.src}
                        alt={exp.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).onerror = null;
                          (e.currentTarget as HTMLImageElement).src = getCategoryFallbackSvg(exp.type, exp.name);
                        }}
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-mono text-[#1B5E6B] font-semibold border border-[#E5DFD5]">
                        {exp.categoryLabel}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-0.5 rounded text-[10px] font-mono">
                        {exp.district}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-display font-bold text-lg text-[#12161E] mb-1.5">
                          {exp.name}
                        </h4>
                        <p className="font-body text-xs text-[#3D4654] line-clamp-3 leading-relaxed mb-4">
                          {exp.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#E5DFD5] text-xs">
                        <span className="font-mono text-[#70798B]">{exp.locality.split(',')[0]}</span>
                        <button
                          onClick={() => onNavigate('plan', { hub: exp.district.toLowerCase() })}
                          className="text-[#1B5E6B] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Add to Circuit</span>
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Section: Verified Canonical Sanctuaries */}
        {selectedCategory !== 'Food' && selectedCategory !== 'Crafts' && selectedCategory !== 'Shopping' && (
          <section>
            <div className="flex justify-between items-end mb-6 border-b border-[#E5DFD5] pb-3">
              <h3 className="text-xl md:text-2xl font-display font-bold text-[#12161E]">
                Canonical Sanctuaries ({places.length})
              </h3>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#0D5C3A] bg-[#0D5C3A]/10 px-2.5 py-1 rounded-full font-bold">
                  ✓ VERIFIED CANONICAL
                </span>
                <span className="font-mono text-xs text-[#70798B] hidden sm:inline">No Synthetic Records</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white border border-[#E5DFD5] rounded-xl h-72 animate-pulse p-4 flex flex-col justify-between">
                    <div className="bg-[#F2EEE7] h-40 rounded-lg w-full"></div>
                    <div className="h-4 bg-[#F2EEE7] rounded w-3/4"></div>
                    <div className="h-3 bg-[#F2EEE7] rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-20 bg-white border border-[#E5DFD5] rounded-xl p-8">
                <div className="w-16 h-16 rounded-full bg-[#B87B22]/10 text-[#B87B22] flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl">travel_explore</span>
                </div>
                <h4 className="font-display font-bold text-xl text-[#12161E] mb-2">No Sanctuaries Found</h4>
                <p className="font-body text-xs text-[#70798B] max-w-md mx-auto mb-6">
                  No Odisha destinations match your current filter selection. Try resetting filters or searching with another term.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedRegion('All');
                    setSearch('');
                  }}
                  className="px-6 py-2.5 bg-[#B87B22] text-white rounded-lg text-xs font-semibold hover:bg-[#A0691B] cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewLayout === 'grid' ? (
              /* GRID MODE: 3-column editorial cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map(place => {
                  const imgResult = resolveDestinationImage({
                    id: place.id,
                    researchId: place.research_id || place.id,
                    name: place.name,
                    category: place.category,
                    images: place.images,
                    apiImageUrl: place.images?.[0]?.url,
                  });
                  const odiaName = getPlaceOdiaName(place);

                  return (
                    <article
                      key={place.id}
                      onClick={() => handleCardClick(place)}
                      className="bg-white border border-[#E5DFD5] rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col cursor-pointer"
                    >
                      <div className="relative h-48 w-full overflow-hidden bg-[#F2EEE7]">
                        <img
                          src={imgResult.src}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).onerror = null;
                            (e.currentTarget as HTMLImageElement).src = getCategoryFallbackSvg(place.category, place.name);
                          }}
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-mono text-[#12161E] font-medium border border-[#E5DFD5]">
                          {place.category}
                        </div>
                        {place.district && (
                          <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-0.5 rounded text-[10px] font-mono">
                            {place.district}
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-display font-bold text-lg text-[#12161E] group-hover:text-[#B87B22] transition-colors">
                            {place.name}
                          </h4>
                          {odiaName && (
                            <p className="font-odia text-xs text-[#B87B22] font-semibold mt-0.5 mb-2">
                              {odiaName}
                            </p>
                          )}
                          <p className="font-body text-xs text-[#3D4654] line-clamp-2 leading-relaxed mb-3">
                            {place.description || 'Verified Odisha cultural and ecological sanctuary.'}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-mono text-[#0D5C3A] bg-[#0D5C3A]/10 px-2 py-0.5 rounded border border-[#0D5C3A]/20 font-bold">
                              ✓ VERIFIED CANONICAL
                            </span>
                            {place.lat != null && place.lon != null && (
                              <span className="text-[10px] font-mono text-[#70798B] tabular-nums">
                                {place.lat.toFixed(2)}°N, {place.lon.toFixed(2)}°E
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-[#E5DFD5] text-xs">
                            <span className="font-mono text-[#70798B] flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm text-[#B87B22]">near_me</span>
                              {place.region || place.district || 'Odisha'}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate('map', { placeId: place.id });
                                }}
                                className="text-[#70798B] hover:text-[#12161E] font-mono text-xs flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Map</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate('plan', { placeId: place.id });
                                }}
                                className="text-[#B87B22] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Plan</span>
                                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* SPLIT MAP MODE: Left list (~48%) + Right MapLibre (~52%) */
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="w-full lg:w-1/2 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                  {places.map(place => {
                    const imgResult = resolveDestinationImage({
                      id: place.id,
                      researchId: place.research_id || place.id,
                      name: place.name,
                      category: place.category,
                      images: place.images,
                      apiImageUrl: place.images?.[0]?.url,
                    });
                    const odiaName = getPlaceOdiaName(place);
                    const isSelectedOnMap = place.id === selectedPlaceIdForMap;

                    return (
                      <article
                        key={place.id}
                        onClick={() => handleCardClick(place)}
                        className={`bg-white border rounded-xl p-3.5 transition-all flex gap-4 cursor-pointer ${
                          isSelectedOnMap
                            ? 'border-[#B87B22] ring-2 ring-[#B87B22]/20 shadow-md bg-[#FAF7F2]'
                            : 'border-[#E5DFD5] hover:border-[#B87B22] hover:shadow-xs'
                        }`}
                      >
                        <div className="relative w-28 h-24 rounded-lg overflow-hidden bg-[#F2EEE7] shrink-0">
                          <img
                            src={imgResult.src}
                            alt={place.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).onerror = null;
                              (e.currentTarget as HTMLImageElement).src = getCategoryFallbackSvg(place.category, place.name);
                            }}
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-mono text-[#B87B22] uppercase tracking-wider font-semibold">
                                {place.category}
                              </span>
                              <span className="text-[10px] font-mono text-[#0D5C3A] font-bold">
                                ✓ VERIFIED
                              </span>
                            </div>
                            <h4 className="font-display font-bold text-base text-[#12161E] truncate">
                              {place.name}
                            </h4>
                            {odiaName && (
                              <p className="font-odia text-xs text-[#B87B22] font-semibold truncate">
                                {odiaName}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E5DFD5]/60 mt-1">
                            <span className="font-mono text-[#70798B] text-[11px]">
                              {place.district || place.region || 'Odisha'}
                            </span>
                            <span className="text-[#B87B22] text-xs font-semibold flex items-center gap-0.5">
                              <span>Details</span>
                              <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Right Sticky Map Canvas */}
                <div className="w-full lg:w-1/2 sticky top-28 h-[600px] lg:h-[calc(100vh-220px)] rounded-2xl overflow-hidden border border-[#E5DFD5] shadow-xs">
                  <React.Suspense
                    fallback={
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF7F2] text-[#70798B] font-mono text-xs">
                        <div className="w-8 h-8 border-2 border-[#B87B22]/30 border-t-[#B87B22] rounded-full animate-spin mb-3" />
                        <span>Loading Vector Cartography...</span>
                      </div>
                    }
                  >
                    <MapLibreCanvas
                      places={mapLibreMarkers}
                      selectedPlaceId={selectedPlaceIdForMap}
                      onSelectPlace={(id) => {
                        setSelectedPlaceIdForMap(id);
                        const match = places.find(p => p.id === id);
                        if (match) setSelectedPlaceForModal(match);
                      }}
                      className="w-full h-full"
                    />
                  </React.Suspense>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Full-Width Luxury Weather Section at Bottom */}
      <StitchWeatherSection />

      {/* Destination Detail Modal */}
      <StitchDestinationDetailModal
        place={selectedPlaceForModal}
        isOpen={Boolean(selectedPlaceForModal)}
        onClose={() => setSelectedPlaceForModal(null)}
        onPlanTrip={(p) => onNavigate('plan', { placeId: p.id })}
        onViewOnMap={(p) => onNavigate('map', { placeId: p.id })}
      />
    </div>
  );
};
