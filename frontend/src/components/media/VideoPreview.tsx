import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Info,
  Wand2,
  RotateCcw,
  Film,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { VideoPreviewContract } from "../../types/api";
import { apiClient } from "../../api/client";

interface VideoPreviewProps {
  video?: VideoPreviewContract | null;
  placeId: string;
  placeName: string;
  placeCategory?: string;
  fallbackImageUrl?: string;
  className?: string;
  autoPlayInView?: boolean;
  heightClass?: string;
  onVideoGenerated?: (video: VideoPreviewContract) => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  video,
  placeId,
  placeName,
  placeCategory = "heritage",
  fallbackImageUrl,
  className = "",
  autoPlayInView = true,
  heightClass = "h-[420px] md:h-[500px]",
  onVideoGenerated,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video?.duration_seconds || 10);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Generation Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("cinematic_golden_hour");
  const [customPrompt, setCustomPrompt] = useState("");

  // Intersection Observer for autoplay when visible
  useEffect(() => {
    if (!autoPlayInView || !containerRef.current || !videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoPlayInView, video]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.duration) setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Trigger Video Generation
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenStatus("Connecting to Video Provider...");
    try {
      const res = await apiClient.generateVideoPreview({
        place_id: placeId,
        prompt: customPrompt.trim() || undefined,
        style: selectedStyle,
        duration_seconds: 5,
        aspect_ratio: "16:9",
      });

      if (res.video_result) {
        onVideoGenerated?.(res.video_result);
        setGenStatus(res.message);
        setTimeout(() => {
          setIsGenerateModalOpen(false);
          setIsGenerating(false);
          setGenStatus(null);
        }, 1200);
      } else {
        setGenStatus(res.message);
        setTimeout(() => setIsGenerating(false), 2000);
      }
    } catch (err: any) {
      setGenStatus(err?.message || "Generation request failed. Curated video preview remains active.");
      setTimeout(() => setIsGenerating(false), 2500);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const videoUrl = video?.video_url;
  const posterUrl = video?.poster_url || fallbackImageUrl;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full ${heightClass} bg-[#12161E] rounded-2xl overflow-hidden select-none border border-white/10 shadow-2xl group ${className}`}
    >
      {/* Video Element */}
      {videoUrl && !videoError ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          playsInline
          loop
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onError={() => setVideoError(true)}
          className="w-full h-full object-cover cursor-pointer block"
          onClick={togglePlay}
        />
      ) : (
        <div className="relative w-full h-full">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={placeName}
              className="w-full h-full object-cover brightness-75"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12161E] via-transparent to-black/40" />
        </div>
      )}

      {/* Top Header Bar: Badge & Action Buttons */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3 pointer-events-none z-20">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#0D5C3A]/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-semibold border border-white/20 shadow-md">
            <Film className="w-3.5 h-3.5 text-[#C69214]" />
            <span>{video?.badge_label || "Video Preview"}</span>
          </div>

          {/* Attribution pill */}
          <div className="hidden sm:inline-flex items-center gap-1 bg-black/50 text-[#E5DFD5] backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-body border border-white/10">
            <Info className="w-3 h-3 text-[#C69214]" />
            <span className="truncate max-w-[200px]">
              {video?.attribution || "Odisha Tourism Media Engine"}
            </span>
          </div>
        </div>

        {/* Generate New Video Button & Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#C69214] hover:bg-[#B87B22] text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md cursor-pointer"
            title="Generate custom AI video preview"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Generate</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all shadow-md cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Centered Large Play Button (when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl border border-white/40 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-2xl z-20 cursor-pointer"
        >
          <Play className="w-7 h-7 fill-white translate-x-0.5" />
        </button>
      )}

      {/* Bottom Controls Bar (Visible on hover or paused) */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 z-20 ${
          isHovered || !isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Scrubber */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="range"
            min={0}
            max={duration || 10}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#C69214]"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1 hover:text-[#C69214] transition-colors cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-1 hover:text-[#C69214] transition-colors cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="font-mono text-[11px] text-[#E5DFD5]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="font-display font-semibold text-xs text-[#E5DFD5] truncate max-w-xs">
            {video?.title || placeName}
          </div>
        </div>
      </div>

      {/* AI Video Generation Modal */}
      {isGenerateModalOpen && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 z-40">
          <div className="bg-[#161B26] border border-white/20 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C69214]" />
                <h3 className="font-display font-bold text-base">Generate AI Video Preview</h3>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-white/60 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#E5DFD5] leading-relaxed">
                Generate a cinematic AI video impression for <strong>{placeName}</strong> using Google Veo or Kling 3.0.
              </p>

              <div>
                <label className="block text-[11px] font-mono text-[#C69214] uppercase tracking-wider mb-1">
                  Styling Atmosphere
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "cinematic_golden_hour", label: "Golden Hour Sunset" },
                    { id: "tropical_lush_monsoon", label: "Tropical Monsoon" },
                    { id: "sacred_temple_dawn", label: "Temple Dawn Rays" },
                    { id: "aerial_coastal_waves", label: "Coastal Aerial Drone" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedStyle === style.id
                          ? "bg-[#0D5C3A] text-white border-white/40 shadow-sm"
                          : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#C69214] uppercase tracking-wider mb-1">
                  Custom Prompt (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={`e.g. 4K aerial drone shot of ${placeName} during sunset, warm sandstone deula carvings, coastal breeze...`}
                  rows={2}
                  className="w-full bg-black/40 border border-white/20 rounded-xl p-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#C69214] text-xs resize-none"
                />
              </div>

              {genStatus && (
                <div className="p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-[#E5DFD5] flex items-center gap-2">
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-[#C69214] border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span>{genStatus}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#0D5C3A] hover:bg-[#0A472C] flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#C69214]" />
                <span>{isGenerating ? "Generating..." : "Start Generation"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
