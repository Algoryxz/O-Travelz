import React, { useState, useMemo } from 'react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';
import { useSavedPlaces } from '../../store/useSavedPlaces';
import { useRegisterAIContext } from '../../context/AIContext';
import { resolveDestinationImage, getCategoryFallbackSvg } from '../../utils/imageRegistry';

interface StitchSavedPageProps {
  onNavigate: (tab: StitchTab, params?: Record<string, string>) => void;
  onOpenShare?: () => void;
  onOpenAuth?: () => void;
}

export const StitchSavedPage: React.FC<StitchSavedPageProps> = ({
  onNavigate,
  onOpenShare,
}) => {
  const [activeTab, setActiveTab] = useState<'places' | 'journeys'>('places');
  const { savedPlaces, removePlace } = useSavedPlaces();

  useRegisterAIContext(
    useMemo(
      () => ({
        page: 'saved',
        saved: {
          saved_count: savedPlaces.length,
          sample_places: savedPlaces.slice(0, 5).map((p) => p.name),
        },
      }),
      [savedPlaces]
    )
  );

  const [savedTrips] = useState<Array<{ id: string; title: string; date: string; stopsCount: number }>>(() => {
    try {
      const raw = localStorage.getItem('o_travelz_saved_itineraries');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  return (
    <div className="w-full pt-28 pb-24 px-6 md:px-12 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <header className="border-b border-[#E5DFD5] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#B87B22]/10 text-[#B87B22] px-3.5 py-1 rounded-full text-xs font-mono font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-[#2F523E]"></span>
            <span>Personal Sanctuary Archive</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-[#12161E]">
            Saved Sanctuaries &amp; Journeys
          </h1>
          <p className="text-sm md:text-base font-body text-[#70798B] mt-2">
            Your saved places and journeys stay available on this device for offline access across Odisha.
          </p>
        </div>

        {/* Truthful Device Storage Status Badge */}
        <div className="flex items-center gap-2 bg-[#2F523E]/10 text-[#2F523E] px-3.5 py-2 rounded-xl text-xs font-mono border border-[#2F523E]/20">
          <span className="material-symbols-outlined text-sm">devices</span>
          <span>Stored On This Device</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#E5DFD5] pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('places')}
          className={`pb-2 px-1 font-semibold transition-colors cursor-pointer ${
            activeTab === 'places'
              ? 'text-[#B87B22] border-b-2 border-[#B87B22]'
              : 'text-[#70798B] hover:text-[#12161E]'
          }`}
        >
          Saved Landmarks ({savedPlaces.length})
        </button>
        <button
          onClick={() => setActiveTab('journeys')}
          className={`pb-2 px-1 font-semibold transition-colors cursor-pointer ${
            activeTab === 'journeys'
              ? 'text-[#B87B22] border-b-2 border-[#B87B22]'
              : 'text-[#70798B] hover:text-[#12161E]'
          }`}
        >
          Saved Expeditions ({savedTrips.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'places' ? (
        savedPlaces.length === 0 ? (
          <div className="bg-white border border-[#E5DFD5] rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#B87B22]/10 text-[#B87B22] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">bookmark_border</span>
            </div>
            <h3 className="font-display font-bold text-2xl text-[#12161E]">
              No Saved Landmarks Yet
            </h3>
            <p className="font-body text-xs text-[#70798B] max-w-md mx-auto">
              Explore verified Odisha sanctuaries and bookmark them to keep them readily accessible on your device.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('destinations')}
                className="px-6 py-2.5 bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                Browse 161 Destinations
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPlaces.map((place) => {
              const imgResult = resolveDestinationImage({
                id: place.id,
                name: place.name,
                category: place.category,
              });

              return (
                <article
                  key={place.id}
                  className="bg-white border border-[#E5DFD5] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-[#F2EEE7]">
                    <img
                      src={imgResult.src}
                      alt={place.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).onerror = null;
                        (e.currentTarget as HTMLImageElement).src = getCategoryFallbackSvg(place.category, place.name);
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-mono text-[#12161E] font-medium border border-[#E5DFD5]">
                      {place.category}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-display font-bold text-lg text-[#12161E] mb-1.5">
                        {place.name}
                      </h4>
                      {place.description && (
                        <p className="font-body text-xs text-[#3D4654] line-clamp-2 leading-relaxed mb-4">
                          {place.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E5DFD5] text-xs">
                      <button
                        onClick={() => onNavigate('map', { placeId: place.id })}
                        className="text-[#B87B22] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">map</span>
                        <span>View on Map</span>
                      </button>
                      <button
                        onClick={() => removePlace(place.id)}
                        className="text-[#70798B] hover:text-red-600 transition-colors p-1"
                        title="Remove bookmark"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : (
        savedTrips.length === 0 ? (
          <div className="bg-white border border-[#E5DFD5] rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#B87B22]/10 text-[#B87B22] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">route</span>
            </div>
            <h3 className="font-display font-bold text-2xl text-[#12161E]">
              No Saved Expeditions Yet
            </h3>
            <p className="font-body text-xs text-[#70798B] max-w-md mx-auto">
              You haven't archived any custom itineraries yet. Plan a custom circuit or synthesize a multimodal journey to get started.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => onNavigate('plan')}
                className="px-6 py-2.5 bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Plan an Itinerary
              </button>
              <button
                onClick={() => onNavigate('destinations')}
                className="px-6 py-2.5 bg-white border border-[#E5DFD5] text-[#12161E] text-xs font-semibold rounded-lg hover:bg-[#F2EEE7] cursor-pointer"
              >
                Explore 161 Destinations
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedTrips.map((trip) => (
              <div key={trip.id} className="bg-white border border-[#E5DFD5] rounded-xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-display font-bold text-lg text-[#12161E]">{trip.title || 'Odisha Expedition'}</h4>
                    <span className="font-mono text-[10px] text-[#70798B] bg-[#F2EEE7] px-2 py-0.5 rounded">
                      Local
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#70798B] mb-4">Saved: {trip.date || 'Recent'}</p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-[#E5DFD5]">
                  <button
                    onClick={() => onNavigate('plan', { tripId: trip.id })}
                    className="flex-1 py-2 bg-[#B87B22] text-white rounded text-xs font-semibold hover:bg-[#A0691B] cursor-pointer"
                  >
                    Reopen in Planner
                  </button>
                  {onOpenShare && (
                    <button
                      onClick={onOpenShare}
                      className="px-3 py-2 border border-[#E5DFD5] rounded text-xs text-[#3D4654] hover:bg-[#F2EEE7] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">share</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
