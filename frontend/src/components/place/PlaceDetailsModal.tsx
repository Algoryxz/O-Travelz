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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#111827] rounded-3xl border border-[#263244] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          data-testid="close-place-details-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer border border-white/20"
          aria-label="Close details"
        >
          <X size={20} />
        </button>

        {/* Hero Photo / Gallery Carousel */}
        <div data-testid="destination-photo-gallery" className="relative h-64 sm:h-72 w-full bg-[#0B1220] shrink-0 overflow-hidden">
          <img
            src={activeImage.url}
            alt={activeImage.alt || place.name}
            className="w-full h-full object-cover transition-all duration-300 brightness-95"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceImageUrl(
                place.name,
                place.category
              );
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-black/30 to-transparent" />

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
                  className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors pointer-events-auto cursor-pointer border border-white/20"
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
                  className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors pointer-events-auto cursor-pointer border border-white/20"
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
                          ? "w-6 bg-[#14B8A6]"
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
                <span className="px-3 py-0.5 rounded-full bg-[#111827]/90 text-teal-300 border border-[#263244] text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                  {place.category}
                </span>
                {place.badge && (
                  <span className="px-3 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                    {place.badge}
                  </span>
                )}
                {region && (
                  <span className="px-3 py-0.5 rounded-full bg-black/50 text-white text-[11px] font-medium backdrop-blur-md flex items-center gap-1 border border-white/20">
                    <MapPin size={11} className="text-[#14B8A6]" />
                    <span>{region}</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight drop-shadow-md">
                {place.name}
              </h2>
            </div>

            {/* Save Button */}
            <button
              type="button"
              data-testid="modal-save-button"
              onClick={handleToggleSave}
              className={`p-3 rounded-2xl flex items-center gap-2 font-bold text-xs backdrop-blur-md transition-all cursor-pointer shadow-lg ${
                saved
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-black/50 hover:bg-black/70 text-white border border-white/20"
              }`}
            >
              <Heart size={16} className={saved ? "fill-white" : ""} />
              <span>{saved ? "Saved" : "Save Place"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Description */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#14B8A6] font-mono flex items-center gap-1.5">
              <Info size={13} />
              <span>About Destination</span>
            </div>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {place.description ||
                `Explore ${place.name}, a premier destination in ${region || "Odisha"}.`}
            </p>
          </div>

          {/* Quick Facts / Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {place.avg_visit_minutes != null && (
              <div className="p-3.5 rounded-2xl bg-[#172235] border border-[#263244] space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock size={14} className="text-[#14B8A6]" />
                  <span>Duration</span>
                </div>
                <div className="text-sm font-bold font-display text-white font-mono">
                  ~{place.avg_visit_minutes} mins
                </div>
              </div>
            )}

            {place.price_tier && (
              <div className="p-3.5 rounded-2xl bg-[#172235] border border-[#263244] space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Tag size={14} className="text-[#14B8A6]" />
                  <span>Price Tier</span>
                </div>
                <div className="text-sm font-bold font-display text-white capitalize">
                  {place.price_tier}
                </div>
              </div>
            )}

            {place.lat != null && place.lon != null && (
              <div className="p-3.5 rounded-2xl bg-[#172235] border border-[#263244] space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Navigation size={14} className="text-[#14B8A6]" />
                  <span>GPS Coordinates</span>
                </div>
                <div className="text-xs font-mono font-semibold text-white truncate">
                  {place.lat.toFixed(2)}°N, {place.lon.toFixed(2)}°E
                </div>
              </div>
            )}
          </div>

          {/* Interests & Thematic Tags */}
          {((place.interests && place.interests.length > 0) ||
            (place.tags && place.tags.length > 0)) && (
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#14B8A6] font-mono flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>Themes: Interests &amp; Experiences</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(place.interests || []).map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 rounded-xl bg-[#172235] border border-[#263244] text-teal-300 text-xs font-semibold capitalize flex items-center gap-1"
                  >
                    <Sparkles size={11} className="text-[#14B8A6]" />
                    <span>{interest}</span>
                  </span>
                ))}
                {(place.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-xl bg-[#172235] border border-[#263244] text-slate-300 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Strip */}
        <div className="p-5 sm:p-6 bg-[#0B1220] border-t border-[#263244] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            data-testid="modal-view-on-map-button"
            onClick={() => {
              handleExploreMap(place);
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#172235] hover:bg-[#1E2D44] text-slate-200 border border-[#263244] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Compass size={15} className="text-[#14B8A6]" />
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
              className="px-6 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold shadow-md hover:shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
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
