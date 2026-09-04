import React, { useState, useEffect } from 'react';
import type { PlaceDetail, WeatherResponse } from '../../api/contracts';
import { apiClient } from '../../api/client';
import { DestinationMedia } from '../media/DestinationMedia';
import { MapPin, CalendarDays, Compass, X, CloudSun, ShieldCheck, Landmark, Scroll, Bus, AlertCircle, Trees, Utensils, Building2 } from 'lucide-react';
import { getPlaceOdiaName, getPlaceCulturalMeta, getPlaceDomain, type PlaceDomainType } from '../../data/canonicalOdiaPlaces';

const MapLibreCanvas = React.lazy(() =>
  import('../map/MapLibreCanvas').then((m) => ({ default: m.MapLibreCanvas }))
);

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

  const odiaName = getPlaceOdiaName(place);
  const culturalMeta = getPlaceCulturalMeta(place.name);
  const domain: PlaceDomainType = culturalMeta?.domain || getPlaceDomain(place.category);

  // Derive dynamic verification badge from actual database record
  const isVerifiedCanonical =
    place.verification_status === 'VERIFIED_CANONICAL' ||
    place.verification_status === 'VERIFIED' ||
    (place as any).audit_status === 'verified';

  // Format dynamic verified_at date (Never hardcode build month)
  let verifiedDateLabel: string | null = null;
  if (place.verified_at) {
    try {
      const parsedDate = new Date(place.verified_at);
      if (!isNaN(parsedDate.getTime())) {
        const month = parsedDate.toLocaleString('default', { month: 'short' });
        const year = parsedDate.getFullYear();
        verifiedDateLabel = `Audited ${month} ${year}`;
      }
    } catch {
      verifiedDateLabel = null;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto" data-testid="destination-detail-modal">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header Strip: Grounded Truth Badges Derived From Canonical Schema */}
        <div className="px-5 py-3 bg-[#FAF7F2] border-b border-[#E5DFD5] flex items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {isVerifiedCanonical ? (
              <span className="inline-flex items-center gap-1 bg-[#0D5C3A]/10 text-[#0D5C3A] px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold">
                <ShieldCheck size={13} />
                <span>VERIFIED_CANONICAL</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold">
                <span>PROVISIONAL_RECORD</span>
              </span>
            )}

            {verifiedDateLabel && (
              <span className="inline-flex items-center gap-1 bg-[#B87B22]/10 text-[#B87B22] px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold">
                {verifiedDateLabel}
              </span>
            )}

            {place.district && (
              <span className="text-xs text-[#70798B] font-body hidden sm:inline">
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
          {/* Destination Media Suite */}
          <DestinationMedia
            placeId={place.id}
            placeName={place.name}
            category={place.category}
            district={place.district || place.region || "Odisha"}
            images={place.images}
            heightClass="h-[280px] sm:h-[360px] md:h-[400px]"
          />

          {/* Place Title & Authentic Odia Script */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E5DFD5] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#B87B22]">
                  {place.category}
                </span>
                <span className="text-[10px] font-mono text-[#70798B]">
                  • Ref: {place.id}
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#12161E] tracking-tight">
                {place.name}
              </h2>
              {odiaName && (
                <p className="font-odia text-base sm:text-lg text-[#B87B22] font-semibold mt-0.5">
                  {odiaName}
                </p>
              )}
              <p className="font-body text-xs text-[#70798B] flex items-center gap-1.5 mt-1">
                <MapPin size={13} className="text-[#C69214]" />
                <span>{place.district || place.region || 'Odisha'}</span>
              </p>
            </div>

            {/* Weather Block with explicit observation semantics */}
            {weather && weather.current && weather.current.temperature_c != null && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs shrink-0 shadow-xs">
                <CloudSun size={18} className="text-[#C69214]" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[#12161E] tabular-nums text-sm">
                      {weather.current.temperature_c}°C
                    </span>
                    <span className="text-[10px] font-mono text-[#70798B]">
                      (Current Weather)
                    </span>
                  </div>
                  {weather.current.condition && (
                    <span className="text-[#70798B] block text-[10px]">
                      {weather.current.condition}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Editorial Description & CONDITIONAL DOMAIN MODULES */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 space-y-4">
              {/* Primary Curated Overview */}
              <div>
                <span className="text-[10px] font-mono text-[#B87B22] uppercase tracking-widest font-semibold block mb-1 flex items-center gap-1">
                  <Landmark size={12} />
                  <span>Curated Intelligence</span>
                </span>
                <p className="font-body text-sm text-[#3D4654] leading-relaxed">
                  {place.description || 'Verified Odisha destination.'}
                </p>
              </div>

              {/* DOMAIN SECTION 1: SACRED SHRINERS & TEMPLES */}
              {domain === 'sacred' && (
                <div className="space-y-4">
                  {culturalMeta?.architecturalEra && (
                    <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD5] space-y-2 text-xs">
                      <span className="text-[10px] font-mono text-[#1B5E6B] uppercase tracking-widest font-semibold block flex items-center gap-1">
                        <Scroll size={12} />
                        <span>Sacred Architecture &amp; Lineage</span>
                      </span>
                      <div>
                        <span className="font-semibold text-[#12161E] block">Era &amp; Historical Patronage:</span>
                        <span className="text-[#3D4654]">{culturalMeta.architecturalEra}</span>
                      </div>
                      {culturalMeta.architecturalStyle && (
                        <div>
                          <span className="font-semibold text-[#12161E] block">Temple Form:</span>
                          <span className="text-[#3D4654]">{culturalMeta.architecturalStyle}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-[#FBF9F5] p-3.5 rounded-xl border border-[#E5DFD5] text-xs">
                    <span className="text-[10px] font-mono text-[#A84825] uppercase tracking-widest font-semibold block mb-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>Sacred Sanctuary Protocol</span>
                    </span>
                    <p className="text-[#3D4654] leading-relaxed">
                      {culturalMeta?.sanctuaryEtiquette ||
                        'Active sacred sanctuary. Modest traditional attire recommended for sanctum darshan; deposit footwear outside portal; photography prohibited in inner sanctum.'}
                    </p>
                  </div>
                </div>
              )}

              {/* DOMAIN SECTION 2: HISTORICAL MONUMENTS & ARCHAEOLOGY */}
              {domain === 'heritage' && (
                <div className="space-y-4">
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD5] space-y-2 text-xs">
                    <span className="text-[10px] font-mono text-[#1B5E6B] uppercase tracking-widest font-semibold block flex items-center gap-1">
                      <Scroll size={12} />
                      <span>Architectural &amp; Archaeological Provenance</span>
                    </span>
                    {culturalMeta?.architecturalEra && (
                      <div>
                        <span className="font-semibold text-[#12161E] block">Era &amp; Dynasty:</span>
                        <span className="text-[#3D4654]">{culturalMeta.architecturalEra}</span>
                      </div>
                    )}
                    {culturalMeta?.architecturalStyle && (
                      <div>
                        <span className="font-semibold text-[#12161E] block">Style &amp; Form:</span>
                        <span className="text-[#3D4654]">{culturalMeta.architecturalStyle}</span>
                      </div>
                    )}
                    {culturalMeta?.materials && (
                      <div>
                        <span className="font-semibold text-[#12161E] block">Stone &amp; Materials:</span>
                        <span className="text-[#3D4654]">{culturalMeta.materials}</span>
                      </div>
                    )}
                    {culturalMeta?.asiProtectionRef && (
                      <div className="pt-2 border-t border-[#E5DFD5]">
                        <span className="font-semibold text-[#12161E] block">Institutional Protection:</span>
                        <span className="font-mono text-[11px] text-[#70798B]">{culturalMeta.asiProtectionRef}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DOMAIN SECTION 3: NATURE, LAKES, WATERFALLS & BEACHES */}
              {domain === 'nature' && (
                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD5] space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-[#0D5C3A] uppercase tracking-widest font-semibold block flex items-center gap-1">
                    <Trees size={12} />
                    <span>Ecological Reserve &amp; Visitor Guidelines</span>
                  </span>
                  {culturalMeta?.architecturalStyle && (
                    <div>
                      <span className="font-semibold text-[#12161E] block">Ecosystem &amp; Topography:</span>
                      <span className="text-[#3D4654]">{culturalMeta.architecturalStyle}</span>
                    </div>
                  )}
                  <p className="text-[#3D4654] leading-relaxed pt-1">
                    {culturalMeta?.ecologicalGuidelines ||
                      'Protected natural habitat. Carry all non-biodegradable waste back; zero single-use plastic zone; adhere to designated walking trails and safety railings.'}
                  </p>
                  {culturalMeta?.asiProtectionRef && (
                    <div className="pt-2 border-t border-[#E5DFD5]">
                      <span className="font-semibold text-[#12161E] block">Conservation Designation:</span>
                      <span className="font-mono text-[11px] text-[#70798B]">{culturalMeta.asiProtectionRef}</span>
                    </div>
                  )}
                </div>
              )}

              {/* DOMAIN SECTION 4: CULINARY & FOOD CLUSTERS */}
              {domain === 'culinary' && (
                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD5] space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-[#B87B22] uppercase tracking-widest font-semibold block flex items-center gap-1">
                    <Utensils size={12} />
                    <span>Culinary Heritage &amp; Specialty</span>
                  </span>
                  <p className="text-[#3D4654] leading-relaxed">
                    Authentic regional Odia culinary tradition. Specialties prepared following indigenous recipes and heritage methods.
                  </p>
                  {place.cuisine && (
                    <div>
                      <span className="font-semibold text-[#12161E] block">Cuisine Category:</span>
                      <span className="text-[#3D4654]">{place.cuisine}</span>
                    </div>
                  )}
                </div>
              )}

              {/* DOMAIN SECTION 5: PUBLIC FACILITIES & UTILITIES */}
              {domain === 'facility' && (
                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD5] space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-[#2563EB] uppercase tracking-widest font-semibold block flex items-center gap-1">
                    <Building2 size={12} />
                    <span>Public Civic Facility</span>
                  </span>
                  <p className="text-[#3D4654] leading-relaxed">
                    Essential public infrastructure serving travelers and citizens across the district.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Grounded Transit Connections & Mini Map */}
            <div className="md:col-span-5 space-y-4">
              {/* Grounded Transit Connections with Straight-Line Truth */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD5] space-y-3">
                <span className="text-[10px] font-mono text-[#0D5C3A] uppercase tracking-widest font-semibold block flex items-center gap-1">
                  <Bus size={12} />
                  <span>Grounded Transit Guidance</span>
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-[#E5DFD5]">
                    <span className="text-[#70798B]">Nearest Hub</span>
                    <span className="font-semibold text-[#12161E]">
                      {culturalMeta?.nearestHub || place.district || 'Bhubaneswar'}
                    </span>
                  </div>
                  {culturalMeta?.approxStraightLineKm != null && (
                    <div className="flex justify-between items-center py-1 border-b border-[#E5DFD5]">
                      <span className="text-[#70798B]">Approx. Straight-Line</span>
                      <span className="font-mono text-[11px] text-[#12161E] tabular-nums font-bold">
                        ~{culturalMeta.approxStraightLineKm} km (Air)
                      </span>
                    </div>
                  )}
                  {place.lat != null && place.lon != null && (
                    <div className="flex justify-between items-center py-1 border-b border-[#E5DFD5]">
                      <span className="text-[#70798B]">Exact Coordinates</span>
                      <span className="font-mono text-[11px] text-[#12161E] tabular-nums">
                        {place.lat.toFixed(4)}°N, {place.lon.toFixed(4)}°E
                      </span>
                    </div>
                  )}
                  <div className="pt-2 text-[11px] text-[#70798B] leading-snug">
                    <p className="font-semibold text-[#3D4654] mb-0.5">CRUT Mo Bus / OSRTC Highway Corridor</p>
                    <p>
                      Connections operate via published timetables. Scheduled arrival data only; live GPS telemetry is strictly not active. Road driving times depend on corridor traffic.
                    </p>
                  </div>
                </div>
              </div>

              {/* Zero-Hallucination Visiting & Fare Governance */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-[#8A5515] space-y-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider block">
                  Visiting &amp; Fare Governance
                </span>
                <p className="text-[11px] leading-relaxed">
                  Opening hours and darshan access are regulated by local temple trusts, municipal authorities, or the Archaeological Survey of India (ASI). Confirm exact timings locally at the entrance portal. Bus fares are collected strictly per official CRUT / OSRTC counters.
                </p>
              </div>

              {/* Mini Vector Map Preview */}
              {place.lat != null && place.lon != null && (
                <div className="h-44 rounded-xl overflow-hidden border border-[#E5DFD5] shadow-xs">
                  <React.Suspense
                    fallback={
                      <div className="w-full h-full flex items-center justify-center bg-[#FAF7F2] text-[#70798B] font-mono text-xs">
                        Loading map preview...
                      </div>
                    }
                  >
                    <MapLibreCanvas
                      places={[
                        {
                          id: place.id,
                          name: place.name,
                          category: place.category,
                          lat: place.lat,
                          lng: place.lon,
                          verificationStatus: 'VERIFIED_CANONICAL',
                        },
                      ]}
                      selectedPlaceId={place.id}
                      center={[place.lon, place.lat]}
                      zoom={13}
                      showStyleSelector={false}
                      cluster={false}
                      className="w-full h-full min-h-[176px]"
                    />
                  </React.Suspense>
                </div>
              )}
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
            <span>Explore on Vector Map</span>
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
