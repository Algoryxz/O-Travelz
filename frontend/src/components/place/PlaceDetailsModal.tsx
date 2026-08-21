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

import { useRecentPlaces } from "../../store/useRecentPlaces";

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
    images: place.images,
    imageUrl: place.imageUrl,
  });

  const activeImage =
    gallery.length > 0
      ? gallery[Math.min(selectedImageIndex, gallery.length - 1)]
      : {
          url: resolvePlaceImageUrl(place, "hero"),
          alt: place.name,
          source: "O-Travelz Verified",
          license: "Standard",
          attribution: "O-Travelz Tourism Documentation",
        };

  const handleToggleSave = () => {
    toggleSavePlace({
      id: place.id || place.name,
      name: place.name,
      category: place.category,
      location: region,
      description: place.description,
      distance: place.distance,
      notes: place.notes,
      tags: place.tags,
      interests: place.interests,
      coordinates:
        place.lon != null && place.lat != null
          ? [place.lon, place.lat]
          : undefined,
    });
  };

  return (
    <div
      data-testid="place-details-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-testid="place-details-modal"
        className="relative w-full max-w-2xl bg-[#FBF8F1] dark:bg-[#0B0F19] text-[#1E1E1E] dark:text-gray-100 rounded-3xl shadow-2xl border border-emerald-900/20 dark:border-emerald-700/30 overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          data-testid="close-place-details-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
          aria-label="Close details"
        >
          <X size={20} />
        </button>

        {/* Hero Photo / Gallery Carousel */}
        <div data-testid="destination-photo-gallery" className="relative h-64 sm:h-72 w-full bg-slate-900 shrink-0 overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

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
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors pointer-events-auto cursor-pointer"
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
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors pointer-events-auto cursor-pointer"
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
                          ? "w-6 bg-emerald-400"
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
                <span className="px-3 py-0.5 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                  {place.category}
                </span>
                {place.badge && (
                  <span className="px-3 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                    {place.badge}
                  </span>
                )}
                {region && (
                  <span className="px-3 py-0.5 rounded-full bg-black/50 text-white text-[11px] font-medium backdrop-blur-md flex items-center gap-1">
                    <MapPin size={11} className="text-emerald-400" />
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
                  : "bg-white/20 hover:bg-white/30 text-white border border-white/20"
              }`}
            >
              <Heart size={16} className={saved ? "fill-white" : ""} />
              <span>{saved ? "Save Place" : "Save Place"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Description */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1.5">
              <Info size={13} />
              <span>About Destination</span>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {place.description ||
                `Explore ${place.name}, a premier destination in ${region || "Odisha"}.`}
            </p>
          </div>

          {/* Quick Facts / Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {place.avg_visit_minutes != null && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-400 text-xs">
                  <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Duration</span>
                </div>
                <div className="text-sm font-bold font-display text-gray-900 dark:text-white">
                  ~{place.avg_visit_minutes} mins
                </div>
              </div>
            )}

            {place.price_tier && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-400 text-xs">
                  <Tag size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Price Tier</span>
                </div>
                <div className="text-sm font-bold font-display text-gray-900 dark:text-white capitalize">
                  {place.price_tier}
                </div>
              </div>
            )}

            {place.lat != null && place.lon != null && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-400 text-xs">
                  <Navigation size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>GPS Coordinates</span>
                </div>
                <div className="text-xs font-mono font-semibold text-gray-900 dark:text-white truncate">
                  {place.lat.toFixed(2)}°N, {place.lon.toFixed(2)}°E
                </div>
              </div>
            )}
          </div>

          {/* Interests & Thematic Tags */}
          {((place.interests && place.interests.length > 0) ||
            (place.tags && place.tags.length > 0)) && (
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>Themes: Interests &amp; Experiences</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(place.interests || []).map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-semibold capitalize flex items-center gap-1"
                  >
                    <Sparkles size={11} className="text-emerald-600" />
                    <span>{interest}</span>
                  </span>
                ))}
                {(place.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verification & Dataset Integrity Attribution */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3">
            <ShieldCheck size={18} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 text-emerald-950 dark:text-emerald-200">
              <div className="font-bold">Authoritative Odisha Dataset</div>
              <div className="text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                {place.source || "Official Tourism & Cultural Documentation"}
                {place.verified_at ? ` · Verified on ${place.verified_at}` : ""}
              </div>
              {activeImage.attribution && (
                <div className="text-[10px] text-emerald-700/70 dark:text-emerald-400/60 pt-0.5">
                  Photo Attribution: {activeImage.attribution}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer Strip */}
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onViewOnMap && (
              <button
                type="button"
                data-testid="modal-view-on-map-button"
                onClick={() => {
                  onViewOnMap(place);
                }}
                className="px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Compass size={15} className="text-emerald-700 dark:text-emerald-400" />
                <span>Explore on Map</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>

            {onPlanTrip && (
              <button
                type="button"
                data-testid="modal-plan-trip-button"
                onClick={() => {
                  onPlanTrip(place);
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <CalendarDays size={15} />
                <span>Plan Trip Here</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
