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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${place.name} - O-Travelz`,
          text: place.description || `Explore ${place.name} on O-Travelz`,
          url: window.location.href,
        });
      } catch {
        // Share cancelled
      }
    }
  };

  return (
    <div
      data-testid="place-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-[#FAF7F2] border-b border-[#E5DFD5] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C3A]" />
            <span className="text-xs font-mono font-semibold text-[#0D5C3A] uppercase tracking-wider">
              {place.category}
            </span>
            <span className="text-xs text-[#70798B] font-body">
              • {region}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#F2EEE7] text-[#12161E] flex items-center justify-center transition-colors cursor-pointer border border-[#E5DFD5] shadow-xs"
              title="Share"
            >
              <Share2 size={15} />
            </button>
            <button
              type="button"
              data-testid="modal-close-button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#F2EEE7] text-[#12161E] flex items-center justify-center transition-colors cursor-pointer border border-[#E5DFD5] shadow-xs"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Destination Media Container with V3 3D & Video Preview */}
          <DestinationMedia
            placeId={place.id || place.name}
            placeName={place.name}
            category={place.category}
            district={region}
            images={place.images}
            initialTab={place.initialMediaTab || "photos"}
            heightClass="h-[280px] sm:h-[360px] md:h-[400px]"
          />

          {/* Place Title & Quick Metadata */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E5DFD5] pb-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#12161E] tracking-tight">
                {place.name}
              </h2>
              <p className="font-body text-xs text-[#70798B] flex items-center gap-1.5 mt-1">
                <MapPin size={13} className="text-[#C69214]" />
                <span>{region}</span>
                {place.badge && (
                  <span className="text-[#0D5C3A] font-semibold ml-1">
                    • {place.badge}
                  </span>
                )}
              </p>
            </div>

            {place.verified_at && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono">
                <span>✓ Verified Odisha Sanctuary</span>
              </div>
            )}
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-1">
            <button
              onClick={() => setActiveContentTab("overview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeContentTab === "overview"
                  ? "bg-[#0D5C3A] text-white shadow-xs"
                  : "text-[#70798B] hover:bg-[#FAF7F2] hover:text-[#12161E]"
              }`}
            >
              Overview & Culture
            </button>
            <button
              onClick={() => setActiveContentTab("essentials")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeContentTab === "essentials"
                  ? "bg-[#0D5C3A] text-white shadow-xs"
                  : "text-[#70798B] hover:bg-[#FAF7F2] hover:text-[#12161E]"
              }`}
            >
              <HeartPulse size={14} />
              <span>Essentials & Healthcare</span>
            </button>
          </div>

          {/* Tab 1: Overview & Editorial Description */}
          {activeContentTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-[#C69214] uppercase tracking-widest font-semibold block mb-1">
                    Landmark Chronicle
                  </span>
                  <p className="font-body text-sm text-[#3D4654] leading-relaxed">
                    {place.description ||
                      "Verified architectural and natural treasure of Odisha, celebrating centuries of heritage, craft, and devotion."}
                  </p>
                </div>

                {place.interests && place.interests.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-[#C69214] uppercase tracking-widest font-semibold block">
                      Traveler Interests
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

              {/* Quick Info Sidebar */}
              <div className="md:col-span-4 space-y-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD5]">
                <span className="text-[10px] font-mono text-[#0D5C3A] uppercase tracking-widest font-semibold block">
                  Quick Details
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
                  {place.price_tier && (
                    <div className="flex justify-between py-1 border-b border-[#E5DFD5]">
                      <span className="text-[#70798B]">Price Tier</span>
                      <span className="font-semibold text-[#12161E] capitalize">{place.price_tier}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Nearby Essentials & Healthcare */}
          {activeContentTab === "essentials" && (
            <NearbyEssentialsTab
              lat={place.lat}
              lon={place.lon}
              destinationId={place.id}
              destinationName={place.name}
              onSelectFacility={(svc) => {
                handleExploreMap({
                  id: svc.id,
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
              data-testid="modal-explore-map-button"
              onClick={() => {
                handleExploreMap(place);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F2EEE7] text-[#12161E] border border-[#E5DFD5] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Compass size={15} className="text-[#0D5C3A]" />
              <span>View on Map</span>
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
              <span>Plan Trip to {place.name}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
