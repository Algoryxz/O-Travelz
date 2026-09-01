import React, { useState, useEffect } from 'react';
import type { PlaceDetail, WeatherResponse } from '../../api/contracts';
import { apiClient } from '../../api/client';
import { DestinationMedia } from '../media/DestinationMedia';
import { Sparkles, MapPin, CalendarDays, Compass, X, CloudSun, ShieldCheck } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header Strip */}
        <div className="px-5 py-3.5 bg-[#FAF7F2] border-b border-[#E5DFD5] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C3A]" />
            <span className="text-xs font-mono font-semibold text-[#0D5C3A] uppercase tracking-wider">
              {place.category}
            </span>
            {place.district && (
              <span className="text-xs text-[#70798B] font-body">
                • {place.district}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F2EEE7] text-[#12161E] flex items-center justify-center transition-colors cursor-pointer border border-[#E5DFD5] shadow-xs"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Destination Media Suite: Photos / Video / 3D */}
          <DestinationMedia
            placeId={place.id}
            placeName={place.name}
            category={place.category}
            district={place.district || place.region || "Odisha"}
            images={place.images}
            heightClass="h-[300px] sm:h-[380px] md:h-[420px]"
          />

          {/* Place Title & Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E5DFD5] pb-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#12161E] tracking-tight">
                {place.name}
              </h2>
              <p className="font-body text-xs text-[#70798B] flex items-center gap-1.5 mt-1">
                <MapPin size={13} className="text-[#C69214]" />
                <span>{place.district || place.region || 'Odisha'}</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-mono ml-2">
                  ✓ Verified Place ID: {place.id}
                </span>
              </p>
            </div>

            {weather && weather.current && weather.current.temperature_c != null && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs">
                <CloudSun size={16} className="text-[#C69214]" />
                <span className="font-semibold text-[#12161E]">{weather.current.temperature_c}°C</span>
                {weather.current.condition && (
                  <span className="text-[#70798B]">({weather.current.condition})</span>
                )}
              </div>
            )}
          </div>

          {/* Editorial Description & Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-4">
              <div>
                <span className="text-[10px] font-mono text-[#C69214] uppercase tracking-widest font-semibold block mb-1">
                  Curated Landmark Intelligence
                </span>
                <p className="font-body text-sm text-[#3D4654] leading-relaxed">
                  {place.description || 'Verified Odisha cultural, spiritual, and ecological sanctuary.'}
                </p>
              </div>

              {place.interests && place.interests.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-[#C69214] uppercase tracking-widest font-semibold block">
                    Travel Themes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {place.interests.map((int) => (
                      <span
                        key={int}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] text-[#0D5C3A] text-xs font-semibold"
                      >
                        {int}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-4 space-y-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD5]">
              <span className="text-[10px] font-mono text-[#0D5C3A] uppercase tracking-widest font-semibold block">
                Quick Facts
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#E5DFD5]">
                  <span className="text-[#70798B]">Category</span>
                  <span className="font-semibold text-[#12161E] capitalize">{place.category}</span>
                </div>
                {place.lat != null && place.lon != null && (
                  <div className="flex justify-between py-1 border-b border-[#E5DFD5]">
                    <span className="text-[#70798B]">Coordinates</span>
                    <span className="font-mono text-[11px] text-[#12161E]">
                      {place.lat.toFixed(2)}°N, {place.lon.toFixed(2)}°E
                    </span>
                  </div>
                )}
                {place.avg_visit_minutes != null && (
                  <div className="flex justify-between py-1 border-b border-[#E5DFD5]">
                    <span className="text-[#70798B]">Est. Visit</span>
                    <span className="font-semibold text-[#12161E]">~{place.avg_visit_minutes} mins</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Strip */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E5DFD5] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onViewOnMap(place);
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F2EEE7] text-[#12161E] border border-[#E5DFD5] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Compass size={15} className="text-[#0D5C3A]" />
            <span>Explore on Map</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onPlanTrip(place);
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-[#0D5C3A] hover:bg-[#0A472C] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <CalendarDays size={15} className="text-[#C69214]" />
            <span>Plan Itinerary with AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
