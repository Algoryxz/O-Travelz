import React, { useState, useEffect } from 'react';
import type { PlaceDetail, WeatherResponse } from '../../api/contracts';
import { apiClient } from '../../api/client';
import { resolveDestinationImage, getCategoryFallbackSvg } from '../../utils/imageRegistry';

interface StitchDestinationDetailModalProps {
  place: PlaceDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onPlanTrip: (place: PlaceDetail) => void;
  onViewOnMap: (place: PlaceDetail) => void;
}

export const StitchDestinationDetailModal: React.FC<StitchDestinationDetailModalProps> = ({
  place,
  isOpen,
  onClose,
  onPlanTrip,
  onViewOnMap,
}) => {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);

  useEffect(() => {
    if (!place) return;
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const w = await apiClient.getWeather({
          lat: place.lat ?? undefined,
          lon: place.lon ?? undefined,
          location_name: place.name,
        });
        if (isMounted) setWeather(w);
      } catch {
        // graceful fallback
      }
    };
    fetchWeather();
    return () => { isMounted = false; };
  }, [place]);

  if (!isOpen || !place) return null;

  const imgResult = resolveDestinationImage({
    id: place.id,
    researchId: place.research_id || place.id,
    name: place.name,
    category: place.category,
    images: place.images,
  });
  const imageUrl = imgResult.src;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-[#FBF9F5] border border-[#E5DFD5] rounded-none md:rounded-2xl shadow-2xl w-full max-w-4xl max-h-screen md:max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Hero Banner */}
        <div className="relative w-full h-[320px] md:h-[400px] overflow-hidden">
          <img
            src={imageUrl}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).onerror = null;
              (e.currentTarget as HTMLImageElement).src = getCategoryFallbackSvg(place.category, place.name);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12161E] via-[#12161E]/40 to-transparent"></div>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-mono">
                {place.category}
              </span>
              <span className="px-2.5 py-0.5 bg-[#B87B22] rounded-full text-xs font-mono font-medium">
                {place.region || 'Odisha Heritage'}
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">{place.name}</h2>
            <p className="font-mono text-xs text-[#E5DFD5] mt-1">Canonical UUID: {place.id}</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Editorial Description */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-display font-bold text-xl text-[#12161E]">Curated Landmark Intelligence</h3>
            <p className="font-body text-sm text-[#3D4654] leading-relaxed">
              {place.description || 'A verified historical, ecological, and cultural destination situated in Odisha, mapped for spatial discovery and multimodal itinerary routing.'}
            </p>

            {place.interests && place.interests.length > 0 && (
              <div className="pt-2">
                <span className="block text-xs font-mono text-[#70798B] mb-2 font-semibold">THEME VECTORS</span>
                <div className="flex flex-wrap gap-1.5">
                  {place.interests.map(t => (
                    <span key={t} className="px-2.5 py-1 bg-[#F2EEE7] text-[#12161E] rounded-md text-xs font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logistical Sidebar */}
          <div className="lg:col-span-5 bg-[#F2EEE7]/60 border border-[#E5DFD5] rounded-xl p-6 space-y-4 text-xs font-body">
            <h4 className="font-display font-bold text-base text-[#12161E] border-b border-[#E5DFD5] pb-2">
              Verified Logistics
            </h4>

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#B87B22]">schedule</span>
              <div>
                <span className="block text-[#70798B] font-mono text-[10px]">AVG VISIT DURATION</span>
                <strong className="text-[#12161E]">{place.avg_visit_minutes || 90} Minutes</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#1B5E6B]">location_on</span>
              <div>
                <span className="block text-[#70798B] font-mono text-[10px]">DISTRICT &amp; COORDINATES</span>
                <strong className="text-[#12161E]">{place.district || 'Odisha'} · {place.lat?.toFixed(3)}, {place.lon?.toFixed(3)}</strong>
              </div>
            </div>

            {weather && (
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-[#E5DFD5]">
                <span className="material-symbols-outlined text-[#B87B22]">wb_sunny</span>
                <div>
                  <span className="block text-[#70798B] font-mono text-[10px]">LIVE METEOROLOGICAL STATE</span>
                  <strong className="text-[#12161E]">{weather.current?.temperature_c}°C · {weather.current?.condition}</strong>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={() => { onPlanTrip(place); onClose(); }}
                className="w-full py-2.5 bg-[#B87B22] hover:bg-[#A0691B] text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">edit_calendar</span>
                <span>Plan Trip Around Landmark</span>
              </button>
              <button
                onClick={() => { onViewOnMap(place); onClose(); }}
                className="w-full py-2.5 bg-white border border-[#E5DFD5] hover:bg-[#F2EEE7] text-[#12161E] rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">map</span>
                <span>View on Spatial Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
