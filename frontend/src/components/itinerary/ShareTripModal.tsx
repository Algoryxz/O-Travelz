import React, { useState, useEffect, useCallback } from "react";
import { apiClient, ApiError } from "../../api/client";
import { useAuth } from "../../store/useAuth";
import type { ItineraryPlanResponse } from "../../types/api";
import {
  Share2,
  Copy,
  Check,
  X,
  Lock,
  Globe,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-react";

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: ItineraryPlanResponse;
  tripTitle: string;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  isOpen,
  onClose,
  itinerary,
  tripTitle,
}) => {
  const { isAuthenticated, loginWithGoogle } = useAuth();

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [_shareId, setShareId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setCopied(false);
    }
  }, [isOpen]);

  const handleGenerateShare = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.createSharedTrip({
        title: tripTitle || "Odisha Trip Itinerary",
        itinerary: itinerary as unknown as Record<string, unknown>,
        constraints: (itinerary.constraints as unknown as Record<string, unknown>) || null,
      });

      const fullUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}${res.share_url}`
          : res.share_url;

      setShareUrl(fullUrl);
      setShareId(res.share_id);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setErrorMessage(
            "Share limit reached (max 20 per hour). Please wait before generating another link."
          );
        } else if (err.status === 422) {
          setErrorMessage("This itinerary is too large to create a snapshot link.");
        } else {
          setErrorMessage(err.message || "Failed to generate share link.");
        }
      } else {
        setErrorMessage("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  }, [isAuthenticated, itinerary, tripTitle]);

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Clipboard copy failed:", err);
    }
  }, [shareUrl]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="share-trip-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12161E]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-testid="share-trip-modal"
        className="relative w-full max-w-lg rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] p-6 text-[#12161E] shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#B87B22] flex items-center justify-center border border-[#E5DFD5]">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#12161E]">Share Itinerary</h3>
              <p className="text-xs text-[#70798B]">
                Generate a secure, public read-only link to this trip.
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-share-modal-button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#70798B] hover:text-[#12161E] hover:bg-[#F2EEE7] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Auth Barrier Notice if anonymous */}
        {!isAuthenticated && (
          <div
            data-testid="share-auth-prompt"
            className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[#12161E]">
              <Lock size={14} className="text-[#B87B22]" />
              <span>Account Required for Sharing</span>
            </div>
            <p className="text-xs text-[#70798B] leading-relaxed">
              Sign in with your Google account to create public share links, preserve trip snapshots, and sync across your devices.
            </p>
            <button
              type="button"
              data-testid="share-google-login-button"
              onClick={loginWithGoogle}
              className="w-full py-2.5 px-4 rounded-xl bg-[#12161E] hover:bg-[#263244] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Sign in with Google to Share</span>
            </button>
          </div>
        )}

        {/* Authenticated Sharing Controls */}
        {isAuthenticated && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#70798B] font-mono">
                Trip Snapshot Title
              </span>
              <p className="text-xs font-bold text-[#12161E] font-serif truncate">
                {tripTitle || "Odisha Travel Itinerary"}
              </p>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div
                data-testid="share-error-message"
                className="p-3 rounded-lg bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] text-xs font-medium flex items-center gap-2"
              >
                <AlertTriangle size={14} className="shrink-0 text-[#C2410C]" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Generated Link Display */}
            {shareUrl ? (
              <div data-testid="share-url-container" className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#70798B]">
                  <span className="flex items-center gap-1.5 text-[#2F523E] font-bold">
                    <Globe size={13} />
                    <span>Public Link Ready</span>
                  </span>
                  <span className="font-mono text-[10px]">Read-Only &amp; Private</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5]">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    data-testid="share-url-input"
                    className="flex-1 bg-transparent border-0 outline-hidden text-xs text-[#12161E] font-mono select-all truncate px-2"
                  />
                  <button
                    type="button"
                    data-testid="copy-share-url-button"
                    onClick={handleCopyLink}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 ${
                      copied
                        ? "bg-[#2F523E] text-white"
                        : "bg-[#B87B22] text-white hover:bg-[#A0691B]"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={13} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Generate Action Button */
              <div className="space-y-2">
                <button
                  type="button"
                  data-testid="generate-share-link-button"
                  disabled={isGenerating}
                  onClick={handleGenerateShare}
                  className="w-full py-3 px-4 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Creating Public Snapshot...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Generate Shareable Link</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-[#70798B] text-center font-mono">
                  Read-Only &amp; Private
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
