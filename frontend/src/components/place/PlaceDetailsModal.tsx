import React, { useState } from "react";
import {
  X,
  MapPin,
  Heart,
  Compass,
  CalendarDays,
  Clock,
  Tag,
  Sparkles,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Info,
  HeartPulse,
} from "lucide-react";
import type { PlaceImageContract } from "../../types/api";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import {
  getPlaceImageUrl,
  getPlaceRegion,
} from "../../utils/imageService";
import {
  resolvePlaceGallery,
  resolvePlaceImageUrl,
} from "../../utils/imageAdapter";
import { useRecentPlaces } from "../../store/useRecentPlaces";
import { NearbyFacilities } from "./NearbyFacilities";
import { NearbyEssentialsTab } from "./NearbyEssentialsTab";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const placeIdOrName = place.id || place.name;
  const saved = isSaved(placeIdOrName);
  const region = place.location || getPlaceRegion(place.name);
  const [activeTab, setActiveTab] = useState<"overview" | "essentials">("overview");

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

  // Gallery resolution
  const gallery = resolvePlaceGallery({
    id: place.id,
    name: place.name,
    category: place.category,
    imageUrl: place.imageUrl,
    images: place.images,
  });

  const activeImage = gallery[selectedImageIndex] || gallery[0] || {
    url: getPlaceImageUrl(place.name, place.category),
    alt: place.name,
  };

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

  return (
    <div
      data-testid="place-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#12161E]/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-[#12161E]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          data-testid="close-place-details-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#12161E] flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer border border-[#E5DFD5] shadow-sm"
          aria-label="Close details"
        >
          <X size={18} />
        </button>

        {/* Hero Photo / Gallery Carousel */}
        <div data-testid="destination-photo-gallery" className="relative h-64 sm:h-72 w-full bg-[#F2EEE7] shrink-0 overflow-hidden">
          <img
            src={activeImage.url}
            alt={activeImage.alt || place.name}
            className="w-full h-full object-cover transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceImageUrl(
                place.name,
                place.category
              );
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Gallery Navigation Arrows & Counter if multiple photos */}
          {gallery.length > 1 && (
            <>
              <div className="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) =>
                      prev === 0 ? gallery.length - 1 : prev - 1
                    );
                  }}
                  className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#12161E] flex items-center justify-center backdrop-blur-md transition-colors pointer-events-auto cursor-pointer border border-white/40 shadow-xs"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) =>
                      prev === gallery.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#12161E] flex items-center justify-center backdrop-blur-md transition-colors pointer-events-auto cursor-pointer border border-white/40 shadow-xs"
                  aria-label="Next photo"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Gallery Indicator / Thumbnails + Text Counter */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono font-bold backdrop-blur-md border border-white/20">
                  {selectedImageIndex + 1} / {gallery.length}
                </span>
                <div className="flex items-center gap-1.5">
                  {gallery.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === selectedImageIndex
                          ? "w-6 bg-[#B87B22]"
                          : "w-2 bg-white/60 hover:bg-white"
                      }`}
                      aria-label={`View photo ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Badges on Hero */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 text-white">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#FFFFFF]/90 text-[#12161E] text-[11px] font-bold uppercase tracking-wider font-mono">
                  {place.category}
                </span>
                {place.badge && (
                  <span className="px-2.5 py-0.5 rounded-md bg-[#B87B22] text-white text-[11px] font-bold uppercase tracking-wider">
                    {place.badge}
                  </span>
                )}
                {region && (
                  <span className="px-2.5 py-0.5 rounded-md bg-black/50 text-white text-[11px] font-medium backdrop-blur-md flex items-center gap-1">
                    <MapPin size={11} className="text-[#B87B22]" />
                    <span>{region}</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight drop-shadow-md">
                {place.name}
              </h2>
            </div>

            {/* Save Button */}
            <button
              type="button"
              data-testid="modal-save-button"
              onClick={handleToggleSave}
              className={`p-2.5 rounded-xl flex items-center gap-2 font-bold text-xs backdrop-blur-md transition-all cursor-pointer shadow-lg ${
                saved
                  ? "bg-[#A84825] text-white hover:bg-[#8F3B1D]"
                  : "bg-white/90 hover:bg-white text-[#12161E]"
              }`}
            >
              <Heart size={15} className={saved ? "fill-white" : "text-[#A84825]"} />
              <span>{saved ? "Saved" : "Save Place"}</span>
            </button>
          </div>
        </div>

        {/* Segmented Modal Tabs */}
        <div className="px-6 pt-4 pb-0 bg-[#FAF7F2] border-b border-[#E5DFD5] flex items-center gap-2">
          <button
            type="button"
            data-testid="modal-tab-overview"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === "overview"
                ? "bg-[#FFFFFF] text-[#12161E] border-[#E5DFD5] -mb-px shadow-xs"
                : "bg-transparent text-[#70798B] hover:text-[#12161E] border-transparent"
            }`}
          >
            <Info size={14} className={activeTab === "overview" ? "text-[#B87B22]" : "text-[#70798B]"} />
            <span>Overview &amp; Heritage</span>
          </button>

          <button
            type="button"
            data-testid="modal-tab-essentials"
            onClick={() => setActiveTab("essentials")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === "essentials"
                ? "bg-[#FFFFFF] text-[#12161E] border-[#E5DFD5] -mb-px shadow-xs"
                : "bg-transparent text-[#70798B] hover:text-[#12161E] border-transparent"
            }`}
          >
            <HeartPulse size={14} className={activeTab === "essentials" ? "text-[#9E2A2B]" : "text-[#70798B]"} />
            <span>Nearby Essentials &amp; Safety</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-white">
          {activeTab === "overview" ? (
            <>
              {/* Description */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#B87B22] font-mono flex items-center gap-1.5">
                  <Info size={13} />
                  <span>About Destination</span>
                </div>
                <p className="text-sm sm:text-base text-[#3D4654] leading-relaxed">
                  {place.description ||
                    `Explore ${place.name}, a premier destination in ${region || "Odisha"}.`}
                </p>
              </div>

              {/* Quick Facts / Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {place.avg_visit_minutes != null && (
                  <div className="p-3.5 rounded-xl bg-[#F2EEE7] border border-[#E5DFD5] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#70798B] text-xs">
                      <Clock size={14} className="text-[#B87B22]" />
                      <span>Duration</span>
                    </div>
                    <div className="text-sm font-bold font-serif text-[#12161E] font-mono">
                      ~{place.avg_visit_minutes} mins
                    </div>
                  </div>
                )}

                {place.price_tier && (
                  <div className="p-3.5 rounded-xl bg-[#F2EEE7] border border-[#E5DFD5] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#70798B] text-xs">
                      <Tag size={14} className="text-[#B87B22]" />
                      <span>Price Tier</span>
                    </div>
                    <div className="text-sm font-bold font-serif text-[#12161E] capitalize">
                      {place.price_tier}
                    </div>
                  </div>
                )}

                {place.lat != null && place.lon != null && (
                  <div className="p-3.5 rounded-xl bg-[#F2EEE7] border border-[#E5DFD5] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#70798B] text-xs">
                      <Navigation size={14} className="text-[#1B5E6B]" />
                      <span>GPS Coordinates</span>
                    </div>
                    <div className="text-xs font-mono font-semibold text-[#12161E] truncate">
                      {place.lat.toFixed(2)}°N, {place.lon.toFixed(2)}°E
                    </div>
                  </div>
                )}
              </div>

              {/* Interests & Thematic Tags */}
              {((place.interests && place.interests.length > 0) ||
                (place.tags && place.tags.length > 0)) && (
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#B87B22] font-mono flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>Themes:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(place.interests || []).map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] text-[#B87B22] text-xs font-semibold capitalize flex items-center gap-1"
                      >
                        <Sparkles size={11} className="text-[#B87B22]" />
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
            </>
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

          {/* Master Geospatial Nearby Facilities & Utilities */}
          <NearbyFacilities sourceId={place.id} />
        </div>

        {/* Action Buttons Strip */}
        <div className="p-4 sm:p-5 bg-[#F2EEE7] border-t border-[#E5DFD5] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            data-testid="modal-view-on-map-button"
            onClick={() => {
              handleExploreMap(place);
              onClose();
            }}
            className="px-4 py-2.5 rounded-lg bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#12161E] border border-[#E5DFD5] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Compass size={15} className="text-[#B87B22]" />
            <span>Explore on Map</span>
          </button>

          {onPlanTrip && (
            <button
              type="button"
              data-testid="modal-plan-trip-button"
              onClick={() => {
                onPlanTrip(place);
                onClose();
              }}
              className="px-6 py-2.5 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <CalendarDays size={15} />
              <span>Plan Trip Here</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
