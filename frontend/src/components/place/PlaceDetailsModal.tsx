import React from "react";
import {
  X,
  MapPin,
  Heart,
  Compass,
  Clock,
  ExternalLink,
  ShieldCheck,
  Tag,
  CalendarDays,
  Sparkles,
  Award,
} from "lucide-react";
import type { PlaceImageContract } from "../../api/contracts";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import { getPlaceRegion } from "../../utils/imageService";
import { resolvePlaceGallery } from "../../utils/imageAdapter";
import { PhotoGallery } from "../gallery/PhotoGallery";

export interface SelectedPlaceInfo {
  id?: string;
  name: string;
  category: string;
  location?: string;
  description?: string | null;
  distance?: string;
  lat?: number | null;
  lon?: number | null;
  avg_visit_minutes?: number | null;
  price_tier?: string | null;
  source?: string | null;
  verified_at?: string | null;
  imageUrl?: string;
  bgImage?: string;
  tags?: string[];
  coordinates?: [number, number];
  images?: PlaceImageContract[];
}

interface PlaceDetailsModalProps {
  place: SelectedPlaceInfo;
  onClose: () => void;
  onViewOnMap: (place: SelectedPlaceInfo) => void;
  onPlanTrip: (place: SelectedPlaceInfo) => void;
}

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({
  place,
  onClose,
  onViewOnMap,
  onPlanTrip,
}) => {
  const { isSaved, toggleSavePlace } = useSavedPlaces();
  const saved = isSaved(place.name);

  const region = place.location || getPlaceRegion(place.name);
  const gallery = resolvePlaceGallery(place);


  // Derive "Best Suited For" based on category & region
  const getBestSuitedFor = (category: string, name: string): string => {
    const c = category.toLowerCase();
    const n = name.toLowerCase();
    if (c === "temple") return "Pilgrimage · Ancient Kalinga Architecture · Spiritual Serenity";
    if (c === "monument") return "UNESCO Heritage · Historical Sculpture · Photography";
    if (c === "beach") return "Golden Sands · Coastal Sunrise · Ocean Leisure";
    if (c === "wildlife") return "Biodiversity · Tiger Reserve · Birdwatching & Ecotourism";
    if (c === "waterfall" || c === "nature") return "Scenic Landscapes · Pine Forests · Nature Trekking";
    if (c === "lake") return "Boating & Lagoons · Dolphin Spotting · Island Shrines";
    if (c === "museum") return "Odisha Art History · Handloom Crafts · Artifacts";
    return "Sightseeing · Cultural Exploration · Local Photography";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      data-testid="place-details-modal"
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-emerald-900/40 flex flex-col max-h-[90vh] text-gray-900 dark:text-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          data-testid="close-place-details-modal"
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer border border-white/10"
          aria-label="Close details"
        >
          <X size={18} />
        </button>

        {/* Modal Photo Gallery Header */}
        <div className="relative shrink-0">
          <PhotoGallery images={gallery} placeName={place.name} />

          {/* Badges on hero */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3 text-white pointer-events-none z-10">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                  {place.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-medium backdrop-blur-md flex items-center gap-1">
                  <MapPin size={11} />
                  <span>{region}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white drop-shadow-sm truncate">
                {place.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Description */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-mono">
              About this destination
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {place.description ||
                `Explore ${place.name}, a remarkable travel destination situated in ${region}, Odisha.`}
            </p>
          </div>

          {/* Why Visit / Best For Highlight Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/60 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300 font-bold">
              <Sparkles size={14} className="text-emerald-700 dark:text-emerald-400" />
              <span>Highlights &amp; Experiences</span>
            </div>
            <p className="text-emerald-950 dark:text-emerald-200 font-medium leading-relaxed">
              {getBestSuitedFor(place.category, place.name)}
            </p>
          </div>

          {/* Travel Information Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {place.avg_visit_minutes != null && (
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                  <Clock size={13} className="text-emerald-700 dark:text-emerald-400" />
                  <span>Duration</span>
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                  ~{place.avg_visit_minutes} mins
                </span>
              </div>
            )}

            {place.price_tier && (
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                  <Tag size={13} className="text-emerald-700 dark:text-emerald-400" />
                  <span>Entry</span>
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                  {place.price_tier}
                </span>
              </div>
            )}

            {place.lat != null && place.lon != null && (
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                  <MapPin size={13} className="text-emerald-700 dark:text-emerald-400" />
                  <span>Coordinates</span>
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
                  {place.lat.toFixed(2)}°N, {place.lon.toFixed(2)}°E
                </span>
              </div>
            )}
          </div>

          {/* Source provenance */}
          {place.source && (
            <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 pt-1 border-t border-gray-100 dark:border-slate-800">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">
                Verified travel facts sourced from Odisha Tourism authorities.
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-emerald-900/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            data-testid="modal-save-button"
            onClick={() =>
              toggleSavePlace({
                id: place.id || place.name,
                name: place.name,
                category: place.category,
                location: region,
                description: place.description,
              })
            }
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              saved
                ? "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
                : "bg-white dark:bg-slate-850 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            }`}
          >
            <Heart size={15} className={saved ? "fill-rose-600 text-rose-600" : ""} />
            <span>{saved ? "Saved" : "Save Place"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="modal-view-on-map-button"
              onClick={() => onViewOnMap(place)}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-850 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Compass size={15} className="text-emerald-700 dark:text-emerald-400" />
              <span>Explore on Map</span>
            </button>

            <button
              type="button"
              data-testid="modal-plan-trip-button"
              onClick={() => onPlanTrip(place)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CalendarDays size={15} />
              <span>Plan Trip Here</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
