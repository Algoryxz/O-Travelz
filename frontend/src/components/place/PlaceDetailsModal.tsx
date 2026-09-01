import React, { useState } from "react";
import {
  X,
  MapPin,
  Heart,
  Star,
  Compass,
  CalendarDays,
  Clock,
  Tag,
  Sparkles,
  Navigation,
  Info,
  HeartPulse,
  Share2,
} from "lucide-react";
import type { PlaceImageContract } from "../../types/api";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import { getPlaceRegion } from "../../utils/imageService";
import { resolvePlaceImageUrl } from "../../utils/imageAdapter";
import { useRecentPlaces } from "../../store/useRecentPlaces";
import { NearbyFacilities } from "./NearbyFacilities";
import { NearbyEssentialsTab } from "./NearbyEssentialsTab";
import { DestinationMedia } from "../media/DestinationMedia";

export interface SelectedPlaceInfo {
  id?: string;
  name: string;
  category: string;
  location?: string;
  description?: string;
  lat?: number | null;
  lon?: number | null;
  price_tier?: string | null;
  avg_visit_minutes?: number | null;
  interests?: string[];
  tags?: string[];
  imageUrl?: string;
  images?: PlaceImageContract[];
  badge?: string | null;
  source?: string | null;
  verified_at?: string | null;
  distance?: string;
  distanceValue?: number;
  notes?: string;
  initialMediaTab?: "photos" | "video" | "3d";
}

export interface PlaceDetailsModalProps {
  place: SelectedPlaceInfo | null;
  isOpen?: boolean;
  onClose: () => void;
  onViewOnMap?: (place: SelectedPlaceInfo) => void;
  onExploreMap?: (place: SelectedPlaceInfo) => void;
  onPlanTrip?: (place: SelectedPlaceInfo) => void;
}

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({
  place,
  isOpen = true,
  onClose,
  onViewOnMap,
  onExploreMap,
  onPlanTrip,
}) => {
  if (!place || !isOpen) return null;
  const handleExploreMap = onExploreMap || onViewOnMap || (() => {});
  const { isSaved, toggleSavePlace } = useSavedPlaces();
  const { addRecentPlace } = useRecentPlaces();

  const placeIdOrName = place.id || place.name;
  const saved = isSaved(placeIdOrName);
  const region = place.location || getPlaceRegion(place.name);
  const [activeContentTab, setActiveContentTab] = useState<"overview" | "essentials">("overview");

  React.useEffect(() => {
    if (place?.name) {
      addRecentPlace({
        id: place.id || place.name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
        name: place.name,
        category: place.category,
        location: region,
        lat: place.lat,
        lon: place.lon,
        description: place.description,
        avg_visit_minutes: place.avg_visit_minutes ?? undefined,
        status: "explored",
        interests: place.interests,
        tags: place.tags,
        imageUrl: place.imageUrl || resolvePlaceImageUrl({ name: place.name, category: place.category, images: place.images }, "card"),
      });
    }
  }, [place, addRecentPlace, region]);

  const handleToggleSave = () => {
    toggleSavePlace({
      id: place.id || place.name,
      name: place.name,
      category: place.category,
      location: region,
      description: place.description,
      interests: place.interests,
    });
  };

  const canonicalId = place.id || "place_konark_001";

  return (
    <div
      data-testid="place-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#12161E]/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-testid="place-details-modal"
        className="relative w-full max-w-3xl max-h-[92vh] bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-[#12161E]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-[#FAF7F2] border-b border-[#E5DFD5] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C3A] shrink-0" />
            <span className="font-mono text-[11px] font-semibold text-[#0D5C3A] uppercase tracking-wider truncate">
              {place.category}
            </span>
            {region && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#70798B] font-body truncate">
                • {region}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="modal-save-button"
              onClick={handleToggleSave}
              className={`p-2 rounded-xl flex items-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
                saved
                  ? "bg-[#A84825] text-white hover:bg-[#8F3B1D]"
                  : "bg-white hover:bg-[#F2EEE7] text-[#12161E] border border-[#E5DFD5]"
              }`}
            >
              <Heart size={14} className={saved ? "fill-white" : "text-[#A84825]"} />
              <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
            </button>

            <button
              type="button"
              data-testid="close-place-details-modal"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#F2EEE7] text-[#12161E] flex items-center justify-center transition-colors cursor-pointer border border-[#E5DFD5] shadow-xs"
              aria-label="Close details"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
          {/* V3 Destination Media Suite (Photos / Cinematic Video / 3D Experience) */}
          <DestinationMedia
            placeId={canonicalId}
            placeName={place.name}
            category={place.category}
            district={region}
            images={place.images}
            initialTab={place.initialMediaTab || "photos"}
            heightClass="h-[280px] sm:h-[340px] md:h-[400px]"
          />

          {/* Place Title & Quick Details */}
          <div className="space-y-2 border-b border-[#E5DFD5] pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12161E] tracking-tight">
                {place.name}
              </h2>
              {place.badge && (
                <span className="px-3 py-1 rounded-full bg-[#0D5C3A] text-white text-xs font-semibold font-mono shadow-xs">
                  {place.badge}
                </span>
              )}
            </div>

            {region && (
              <div className="flex items-center gap-1.5 text-xs text-[#70798B]">
                <MapPin size={13} className="text-[#C69214]" />
                <span>{region}</span>
                {place.verified_at && (
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono font-medium ml-2">
                    ✓ Verified Destination
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Segmented Content Tabs: Overview & Heritage vs Essentials */}
          <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-0">
            <button
              type="button"
              data-testid="modal-tab-overview"
              onClick={() => setActiveContentTab("overview")}
              className={`px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 -mb-px ${
                activeContentTab === "overview"
                  ? "border-[#0D5C3A] text-[#0D5C3A]"
                  : "border-transparent text-[#70798B] hover:text-[#12161E]"
              }`}
            >
              <Info size={14} />
              <span>Overview & Heritage</span>
            </button>

            <button
              type="button"
              data-testid="modal-tab-essentials"
              onClick={() => setActiveContentTab("essentials")}
              className={`px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 -mb-px ${
                activeContentTab === "essentials"
                  ? "border-[#0D5C3A] text-[#0D5C3A]"
                  : "border-transparent text-[#70798B] hover:text-[#12161E]"
              }`}
            >
              <HeartPulse size={14} className="text-[#9E2A2B]" />
              <span>Nearby Facilities & Safety</span>
            </button>
          </div>

          {activeContentTab === "overview" ? (
            <div className="space-y-5">
              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#C69214] uppercase tracking-widest font-semibold block">
                  About Destination
                </span>
                <p className="text-sm sm:text-base text-[#3D4654] leading-relaxed">
                  {place.description || `Explore ${place.name}, a premier destination in ${region || "Odisha"}.`}
                </p>
              </div>

              {/* Quick Facts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {place.avg_visit_minutes != null && (
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#70798B] text-xs">
                      <Clock size={14} className="text-[#C69214]" />
                      <span>Duration</span>
                    </div>
                    <div className="text-sm font-bold font-mono text-[#12161E]">
                      ~{place.avg_visit_minutes} mins
                    </div>
                  </div>
                )}

                {place.price_tier && (
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#70798B] text-xs">
                      <Tag size={14} className="text-[#0D5C3A]" />
                      <span>Entry / Tier</span>
                    </div>
                    <div className="text-sm font-bold capitalize text-[#12161E]">
                      {place.price_tier}
                    </div>
                  </div>
                )}

                {place.lat != null && place.lon != null && (
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#70798B] text-xs">
                      <Navigation size={14} className="text-[#1B5E6B]" />
                      <span>Coordinates</span>
                    </div>
                    <div className="text-xs font-mono font-semibold text-[#12161E] truncate">
                      {place.lat.toFixed(2)}°N, {place.lon.toFixed(2)}°E
                    </div>
                  </div>
                )}
              </div>

              {/* Thematic Interests */}
              {place.interests && place.interests.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-[#C69214] uppercase tracking-widest font-semibold block">
                    Themes:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {place.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] text-[#0D5C3A] text-xs font-semibold capitalize flex items-center gap-1"
                      >
                        <Sparkles size={11} className="text-[#C69214]" />
                        <span>{interest}</span>
                      </span>
                    ))}
                    {(place.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-lg bg-[#F2EEE7] border border-[#E5DFD5] text-[#3D4654] text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby Facilities */}
              <NearbyFacilities sourceId={place.id} />
            </div>
          ) : (
            <NearbyEssentialsTab
              place={place}
              onExploreServiceOnMap={(svc) => {
                handleExploreMap({
                  name: svc.name,
                  category: svc.category,
                  lat: svc.lat,
                  lon: svc.lon,
                  location: svc.district,
                });
                onClose();
              }}
            />
          )}
        </div>

        {/* Footer Action Strip */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E5DFD5] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="modal-save-button"
              onClick={handleToggleSave}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F2EEE7] text-[#12161E] border border-[#E5DFD5] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Star size={15} className={saved ? "fill-[#C69214] text-[#C69214]" : "text-[#70798B]"} />
              <span>{saved ? "Saved" : "Save Place"}</span>
            </button>

            <button
              type="button"
              data-testid="modal-view-on-map-button"
              onClick={() => {
                handleExploreMap(place);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F2EEE7] text-[#12161E] border border-[#E5DFD5] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Compass size={15} className="text-[#0D5C3A]" />
              <span>Explore on Map</span>
            </button>
          </div>

          {onPlanTrip && (
            <button
              type="button"
              data-testid="modal-plan-trip-button"
              onClick={() => {
                onPlanTrip(place);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-[#0D5C3A] hover:bg-[#0A472C] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <CalendarDays size={15} className="text-[#C69214]" />
              <span>Plan Trip Here</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
