import React, { useState, useEffect, useMemo } from "react";
import {
  Image as ImageIcon,
  Film,
  Box,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Compass,
} from "lucide-react";
import type { PlaceImageContract, PlaceMediaResponse, VideoPreviewContract, Model3DContract } from "../../types/api";
import { apiClient } from "../../api/client";
import { resolvePlaceGallery, getVariantUrl } from "../../utils/imageAdapter";
import { ThreeDViewer } from "./ThreeDViewer";
import { VideoPreview } from "./VideoPreview";

interface DestinationMediaProps {
  placeId: string;
  placeName: string;
  category?: string;
  district?: string;
  images?: PlaceImageContract[];
  initialTab?: "photos" | "video" | "3d";
  className?: string;
  heightClass?: string;
  onTabChange?: (tab: "photos" | "video" | "3d") => void;
}

export const DestinationMedia: React.FC<DestinationMediaProps> = ({
  placeId,
  placeName,
  category = "heritage",
  district = "Odisha",
  images,
  initialTab = "photos",
  className = "",
  heightClass = "h-[320px] sm:h-[400px] md:h-[440px]",
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<"photos" | "video" | "3d">(initialTab);
  const [mediaData, setMediaData] = useState<PlaceMediaResponse | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  // Fetch complete media suite from backend
  useEffect(() => {
    let isMounted = true;
    const loadMedia = async () => {
      setIsLoadingMedia(true);
      try {
        const res = await apiClient.getPlaceMedia(placeId);
        if (isMounted && res) {
          setMediaData(res);
          // If initial tab requested has data, respect it
          if (initialTab === "3d" && res.has_3d) setActiveTab("3d");
          else if (initialTab === "video" && res.has_video) setActiveTab("video");
        }
      } catch (e) {
        // Graceful fallback to provided images
      } finally {
        if (isMounted) setIsLoadingMedia(false);
      }
    };
    if (placeId) {
      loadMedia();
    }
    return () => {
      isMounted = false;
    };
  }, [placeId, initialTab]);

  const handleTabSwitch = (tab: "photos" | "video" | "3d") => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const resolvedImages = useMemo(() => {
    if (mediaData?.images && mediaData.images.length > 0) {
      return mediaData.images.map((img) => ({
        url: img.url,
        title: img.title || placeName,
        alt_text: img.alt_text || placeName,
      }));
    }
    const gallery = resolvePlaceGallery({ id: placeId, name: placeName, category, images });
    return gallery.map((item) => ({
      url: item.url,
      title: item.attribution || item.alt || placeName,
      alt_text: item.alt || placeName,
    }));
  }, [placeId, placeName, category, images, mediaData?.images]);

  const currentPhoto = resolvedImages[selectedPhotoIndex] || resolvedImages[0];
  const fallbackUrl = currentPhoto?.url || "https://images.unsplash.com/photo-1599831104321-4f0563467439?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Media Type Switcher Tab Bar */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-[#E5DFD5]">
        <div className="flex items-center gap-1.5 p-1 bg-[#12161E]/5 rounded-2xl border border-[#E5DFD5]">
          <button
            type="button"
            onClick={() => handleTabSwitch("photos")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "photos"
                ? "bg-[#12161E] text-white shadow-sm"
                : "text-[#70798B] hover:text-[#12161E]"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#C69214]" />
            <span>Photos ({resolvedImages.length || 1})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch("video")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "video"
                ? "bg-[#0D5C3A] text-white shadow-sm"
                : "text-[#70798B] hover:text-[#12161E]"
            }`}
          >
            <Film className="w-3.5 h-3.5 text-[#C69214]" />
            <span>Video Preview</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C69214] animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch("3d")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "3d"
                ? "bg-[#B87B22] text-white shadow-sm"
                : "text-[#70798B] hover:text-[#12161E]"
            }`}
          >
            <Box className="w-3.5 h-3.5 text-white" />
            <span>3D Experience</span>
            <span className="text-[10px] font-mono bg-white/20 text-white px-1.5 py-0.2 rounded-full font-normal">
              Interactive
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#B87B22]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>V3 Visual Suite</span>
        </div>
      </div>

      {/* Media Content Display Area */}
      <div className="mt-3 relative w-full">
        {/* TAB 1: PHOTOS GALLERY */}
        {activeTab === "photos" && (
          <div
            data-testid="destination-photo-gallery"
            className={`relative w-full ${heightClass} rounded-2xl overflow-hidden bg-[#12161E] group select-none shadow-xl border border-[#E5DFD5]`}
          >
            {currentPhoto ? (
              <img
                src={currentPhoto.url}
                alt={currentPhoto.alt_text || placeName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <img
                src={fallbackUrl}
                alt={placeName}
                className="w-full h-full object-cover"
              />
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Photo Navigation Arrows */}
            {resolvedImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev === 0 ? resolvedImages.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev === resolvedImages.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo Caption & Index */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs z-20 pointer-events-none">
              <span className="font-display font-semibold truncate max-w-[70%]">
                {currentPhoto?.title || currentPhoto?.alt_text || placeName}
              </span>
              {resolvedImages.length > 1 && (
                <span className="font-mono text-[11px] bg-black/60 px-2.5 py-1 rounded-full border border-white/20">
                  {selectedPhotoIndex + 1} / {resolvedImages.length}
                </span>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CINEMATIC VIDEO PREVIEW */}
        {activeTab === "video" && (
          <VideoPreview
            video={mediaData?.video_preview}
            placeId={placeId}
            placeName={placeName}
            placeCategory={category}
            fallbackImageUrl={fallbackUrl}
            heightClass={heightClass}
            onVideoGenerated={(newVid) => {
              setMediaData((prev) => (prev ? { ...prev, video_preview: newVid, has_video: true } : null));
            }}
          />
        )}

        {/* TAB 3: 3D HERITAGE EXPERIENCE */}
        {activeTab === "3d" && (
          <ThreeDViewer
            model={mediaData?.model_3d}
            placeName={placeName}
            fallbackImageUrl={fallbackUrl}
            heightClass={heightClass}
          />
        )}
      </div>
    </div>
  );
};
