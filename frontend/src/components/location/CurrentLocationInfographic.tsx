import React, { useState, useEffect, useMemo } from 'react';
import { getLocationImage, getLocationImageUrl, CANONICAL_HUB_IMAGES } from '../../utils/imageService';

export interface CurrentLocationInfographicProps {
  locationName?: string | null;
  city?: string | null;
  district?: string | null;
  lat?: number | null;
  lon?: number | null;
  isLive?: boolean;
  locationType?: string;
  onSearchArea?: () => void;
  onCenterLocation?: () => void;
  onExploreNearby?: () => void;
  compact?: boolean;
}

export const CurrentLocationInfographic: React.FC<CurrentLocationInfographicProps> = ({
  locationName,
  city,
  district,
  lat,
  lon,
  isLive = false,
  locationType,
  onSearchArea,
  onCenterLocation,
  onExploreNearby,
  compact = false,
}) => {
  // Resolve canonical location image metadata
  const hubImage = useMemo(() => {
    return getLocationImage(locationName, city, district);
  }, [locationName, city, district]);

  const [imgSrc, setImgSrc] = useState<string>(() => {
    return getLocationImageUrl(locationName, city, district);
  });
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dynamic state update when location, city, or district changes
  useEffect(() => {
    const nextUrl = getLocationImageUrl(locationName, city, district);
    setImgSrc(nextUrl);
    setHasError(false);
    setIsLoading(true);
  }, [locationName, city, district, lat, lon, isLive]);

  const displayTitle = locationName || city || 'Odisha Heritage Hub';
  const displayDistrict = district || city || 'Odisha';
  const subtitle = hubImage.title || `${displayTitle} Spatial Intelligence`;

  return (
    <div
      data-testid="current-location-infographic"
      className="w-full bg-white rounded-2xl border border-[#E5DFD5] shadow-xs overflow-hidden transition-all duration-300 hover:shadow-md"
    >
      {/* Editorial Photograph Header with Live Status Badges */}
      <div className="relative w-full aspect-[16/9] bg-[#12161E] overflow-hidden group">
        <img
          data-testid="current-location-infographic-image"
          src={hasError ? CANONICAL_HUB_IMAGES.bhubaneswar.imageUrl : imgSrc}
          alt={hubImage.alt || `${displayTitle} photograph`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            if (!hasError) {
              setHasError(true);
              setImgSrc(CANONICAL_HUB_IMAGES.bhubaneswar.imageUrl);
            }
          }}
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
            isLoading ? 'opacity-70 blur-xs' : 'opacity-100 blur-none'
          }`}
        />

        {/* Gradient overlays for crisp badge & typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40 pointer-events-none" />

        {/* Top Badges: Live GPS / Hub Status & District */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
          <span
            data-testid="current-location-status-badge"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold backdrop-blur-md border shadow-xs text-white bg-black/40 border-white/30"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-emerald-400 animate-pulse' : 'bg-[#B87B22]'
              }`}
            />
            <span>{isLive ? 'Live GPS Location' : locationType === 'MANUAL_LOCATION' ? 'Selected Hub' : 'Active Spatial Hub'}</span>
          </span>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-white/90 bg-white/20 backdrop-blur-md border border-white/30 font-medium">
            {displayDistrict}
          </span>
        </div>

        {/* Bottom Photograph Caption Overlay */}
        <div className="absolute bottom-3 inset-x-3 z-10">
          <div className="text-[10px] font-mono tracking-wider uppercase text-amber-300 font-semibold mb-0.5">
            Verified Odisha Sanctuary
          </div>
          <h3 className="text-base sm:text-lg font-display font-bold text-white leading-tight drop-shadow-md truncate">
            {displayTitle}
          </h3>
        </div>
      </div>

      {/* Infographic Details Body */}
      <div className="p-4 space-y-3 bg-[#FAF7F2]/50">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#12161E] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#B87B22]">location_on</span>
              <span className="truncate">{subtitle}</span>
            </div>
            {lat !== undefined && lon !== undefined && lat !== null && lon !== null && (
              <div className="text-[10px] font-mono text-[#70798B] mt-0.5 ml-5">
                {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
              </div>
            )}
          </div>
        </div>

        {/* Interactive Spatial Actions */}
        {!compact && (
          <div className="pt-2 border-t border-[#E5DFD5] flex items-center gap-2">
            {onSearchArea && (
              <button
                type="button"
                data-testid="infographic-search-area-btn"
                onClick={onSearchArea}
                className="flex-1 bg-white hover:bg-[#FAF7F2] text-[#12161E] hover:text-[#B87B22] border border-[#E5DFD5] px-3 py-2 rounded-xl text-xs font-mono font-medium transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-[#B87B22]">search</span>
                <span>Search Area</span>
              </button>
            )}

            {onCenterLocation && (
              <button
                type="button"
                data-testid="infographic-center-map-btn"
                onClick={onCenterLocation}
                className="bg-[#12161E] hover:bg-[#2A3447] text-white px-3 py-2 rounded-xl text-xs font-mono font-medium transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">my_location</span>
                <span>Center</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
