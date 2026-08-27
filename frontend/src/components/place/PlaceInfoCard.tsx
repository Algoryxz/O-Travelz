import React, { useMemo } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useSavedPlaces } from '../../store/useSavedPlaces';
import { getPlaceImageUrl } from '../../utils/imageService';
import { evaluateOpeningStatus } from '../../utils/openingHoursUtils';
import { calculateHaversineDistanceKm, formatDistance, calculateDriveTimeMinutes, calculateWalkTimeMinutes, formatDuration } from '../../utils/geoUtils';
import { ODISHA_ESSENTIALS, type EssentialPlace } from '../../data/odishaEssentials';

export interface PlaceInfoCardProps {
  place: {
    id: string;
    name: string;
    category: string;
    district?: string | null;
    address?: string | null;
    lat?: number | null;
    lon?: number | null;
    rating?: number | null;
    ratingCount?: number | null;
    ratingSource?: string | null;
    openingHours?: string | Record<string, string> | null;
    is24x7?: boolean;
    phone?: string | null;
    emergencyPhone?: string | null;
    cuisine?: string | null;
    amenities?: string[];
    description?: string | null;
    priceTier?: string | null;
    dataSource?: string | null;
    verified?: boolean;
  };
  onClose?: () => void;
  onNavigate?: (tab: string, params?: Record<string, string>) => void;
  onDrawRoute?: (target: { lat: number; lon: number; name: string; category: string; address?: string }) => void;
  showNearbyStays?: boolean;
}

export const PlaceInfoCard: React.FC<PlaceInfoCardProps> = ({
  place,
  onClose,
  onNavigate,
  onDrawRoute,
  showNearbyStays = true,
}) => {
  const { currentPosition } = useLocation();
  const { isSaved, toggleSave } = useSavedPlaces();

  const saved = isSaved(place.id) || isSaved(place.name);

  // Compute distance from active user position
  const distanceKm = useMemo(() => {
    if (currentPosition?.lat != null && currentPosition?.lon != null && place.lat != null && place.lon != null) {
      return calculateHaversineDistanceKm(currentPosition.lat, currentPosition.lon, place.lat, place.lon);
    }
    return null;
  }, [currentPosition, place.lat, place.lon]);

  const driveMins = distanceKm != null ? calculateDriveTimeMinutes(distanceKm) : null;
  const walkMins = distanceKm != null ? calculateWalkTimeMinutes(distanceKm) : null;

  // Evaluate opening hours strictly using IST
  const opening = useMemo(() => {
    return evaluateOpeningStatus(place.openingHours, place.is24x7);
  }, [place.openingHours, place.is24x7]);

  // Image source with exact place alt text
  const heroImageSrc = useMemo(() => {
    return getPlaceImageUrl(place.id, place.category);
  }, [place.id, place.category]);

  const altText = `${place.name} in ${place.district || 'Odisha'}, India`;

  // Query nearby verified hotels sorted by distance
  const nearbyHotels = useMemo(() => {
    if (!showNearbyStays || place.lat == null || place.lon == null || place.category === 'hotel') return [];
    const hotels = ODISHA_ESSENTIALS.filter((e) => e.category === 'hotel');
    return hotels
      .map((h) => {
        const d = calculateHaversineDistanceKm(place.lat!, place.lon!, h.lat, h.lon);
        return { ...h, distFromPlace: d };
      })
      .sort((a, b) => a.distFromPlace - b.distFromPlace)
      .slice(0, 3);
  }, [showNearbyStays, place.lat, place.lon, place.category]);

  return (
    <div
      data-testid="place-info-card"
      className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#E5DFD5] shadow-xl overflow-hidden max-w-sm w-full font-body text-[#12161E] animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Hero Image Container */}
      <div className="relative h-40 w-full bg-[#FAF7F2] overflow-hidden">
        <img
          src={heroImageSrc}
          alt={altText}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close place details"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition cursor-pointer backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-[#12161E] backdrop-blur-sm border border-black/10">
            {place.category}
          </span>
          {place.verified && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white backdrop-blur-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">verified</span> Verified
            </span>
          )}
        </div>
      </div>

      {/* Main Details Body */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display font-bold text-base text-[#12161E] leading-snug">{place.name}</h3>
          {place.address && (
            <p className="text-xs text-[#70798B] mt-0.5 line-clamp-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#A84825]">location_on</span>
              {place.address}
            </p>
          )}
        </div>

        {/* Ratings & Opening Status Row */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F0EBE1] text-xs">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            {place.rating != null ? (
              <>
                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded font-mono font-bold flex items-center gap-0.5 text-[11px] border border-amber-200">
                  ★ {place.rating.toFixed(1)}
                </span>
                <span className="text-[10px] text-[#70798B]" title={place.ratingSource || 'Verified Source'}>
                  {place.ratingCount ? `(${place.ratingCount.toLocaleString()})` : ''}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-[#70798B] italic">Rating unavailable</span>
            )}
          </div>

          {/* Opening Status */}
          <div>
            {opening.status === 'open' ? (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-full text-[10px] border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                {opening.badgeText}
              </span>
            ) : opening.status === 'closed' ? (
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-semibold rounded-full text-[10px] border border-rose-200">
                {opening.badgeText}
              </span>
            ) : (
              <span className="text-[10px] text-[#70798B] font-mono">Hours unavailable</span>
            )}
          </div>
        </div>

        {/* Distance & Transit ETAs */}
        {distanceKm != null && (
          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5DFD5] flex items-center justify-between text-xs font-mono text-[#3D4654]">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#B87B22]">near_me</span>
              <span className="font-bold">{formatDistance(distanceKm)}</span>
            </div>
            {driveMins != null && (
              <div className="flex items-center gap-1 text-[11px] text-[#70798B]">
                <span className="material-symbols-outlined text-[13px]">directions_car</span>
                <span>~{formatDuration(driveMins)}</span>
              </div>
            )}
            {walkMins != null && (
              <div className="flex items-center gap-1 text-[11px] text-[#70798B]">
                <span className="material-symbols-outlined text-[13px]">directions_walk</span>
                <span>~{formatDuration(walkMins)}</span>
              </div>
            )}
          </div>
        )}

        {/* Phone / Emergency / Amenities */}
        {(place.phone || place.emergencyPhone || (place.amenities && place.amenities.length > 0)) && (
          <div className="text-xs space-y-1.5 text-[#3D4654]">
            {place.phone && (
              <a href={`tel:${place.phone}`} className="flex items-center gap-1.5 text-blue-700 hover:underline">
                <span className="material-symbols-outlined text-sm">call</span>
                <span>{place.phone}</span>
              </a>
            )}
            {place.emergencyPhone && (
              <a
                href={`tel:${place.emergencyPhone}`}
                className="flex items-center gap-1.5 text-red-600 font-bold hover:underline"
              >
                <span className="material-symbols-outlined text-sm">emergency</span>
                <span>Emergency: {place.emergencyPhone}</span>
              </a>
            )}
            {place.amenities && place.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {place.amenities.slice(0, 4).map((a, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-[#FAF7F2] rounded border border-[#E5DFD5]">
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stay Nearby Section */}
        {nearbyHotels.length > 0 && (
          <div className="pt-2 border-t border-[#F0EBE1]">
            <div className="text-[10px] font-mono uppercase font-bold text-[#70798B] tracking-wider mb-1.5 flex items-center justify-between">
              <span>🏨 Stay Nearby</span>
              <span className="text-[9px] text-[#B87B22]">Verified Hotels</span>
            </div>
            <div className="space-y-1">
              {nearbyHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3EFE6] transition"
                >
                  <span className="font-medium truncate max-w-[190px]">{hotel.name}</span>
                  <span className="font-mono text-[10px] text-[#70798B] flex-shrink-0">
                    {formatDistance(hotel.distFromPlace)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-[#F0EBE1]">
          {onDrawRoute && place.lat != null && place.lon != null && (
            <button
              data-testid="place-card-route-btn"
              onClick={() =>
                onDrawRoute({
                  lat: place.lat!,
                  lon: place.lon!,
                  name: place.name,
                  category: place.category,
                  address: place.address || undefined,
                })
              }
              className="flex-1 py-1.5 bg-[#B87B22] text-white text-xs font-semibold rounded-lg hover:bg-[#966319] transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">route</span>
              <span>Route</span>
            </button>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate('plan', { placeId: place.id, name: place.name })}
              className="flex-1 py-1.5 bg-[#12161E] text-white text-xs font-semibold rounded-lg hover:bg-black transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>Plan Trip</span>
            </button>
          )}

          <button
            onClick={() =>
              toggleSave({
                id: place.id,
                name: place.name,
                category: place.category,
                location: place.district || undefined,
                coordinates: place.lat != null && place.lon != null ? [place.lat, place.lon] : undefined,
              })
            }
            aria-label={saved ? 'Remove from saved' : 'Save place'}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center justify-center cursor-pointer ${
              saved
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-[#E5DFD5] text-[#70798B] hover:text-[#12161E]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{saved ? 'favorite' : 'favorite_border'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
