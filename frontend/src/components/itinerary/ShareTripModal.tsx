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
  const [shareId, setShareId] = useState<string | null>(null);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-testid="share-trip-modal"
        className="relative w-full max-w-lg rounded-3xl bg-[#111827] border border-[#263244] p-6 text-white shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#263244]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#14B8A6]/20 text-[#14B8A6] flex items-center justify-center">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Share Itinerary</h3>
              <p className="text-xs text-slate-400">
                Generate a secure, public read-only link to this trip.
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-share-modal-button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E2D44] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          /* Unauthenticated state */
          <div data-testid="share-unauthenticated-state" className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-[#172235] border border-[#263244] space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">
                <Lock size={14} />
                <span>Account Required for Sharing</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sign in with Google to create shareable links for your itineraries. Once generated, anyone with the link can view your itinerary without needing an account.
              </p>
            </div>

            <button
              type="button"
              data-testid="share-signin-button"
              onClick={loginWithGoogle}
              className="w-full py-3 px-4 rounded-2xl bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Sign in with Google to Share</span>
            </button>
          </div>
        ) : (
          /* Authenticated state */
          <div data-testid="share-authenticated-state" className="space-y-4">
            {/* Trip Preview Pill */}
            <div className="p-3.5 rounded-2xl bg-[#172235] border border-[#263244] flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                  Trip Snapshot
                </span>
                <span className="text-sm font-semibold text-white truncate block">
                  {tripTitle || "Odisha Trip Itinerary"}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#14B8A6]/20 text-[#14B8A6] text-[11px] font-bold shrink-0">
                {itinerary.days.length} {itinerary.days.length === 1 ? "Day" : "Days"}
              </span>
            </div>

            {errorMessage && (
              <div
                data-testid="share-error-alert"
                className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-medium flex items-center gap-2"
              >
                <AlertTriangle size={15} className="shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!shareUrl ? (
              <button
                type="button"
                data-testid="generate-share-link-button"
                onClick={handleGenerateShare}
                disabled={isGenerating}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Generating Secure Link...</span>
                  </>
                ) : (
                  <>
                    <Globe size={16} />
                    <span>Generate Shareable Link</span>
                  </>
                )}
              </button>
            ) : (
              <div data-testid="share-link-result" className="space-y-3">
                <label className="text-xs font-bold text-slate-300 block">
                  Public Share Link:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    data-testid="share-url-input"
                    value={shareUrl}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-[#263244] text-xs text-slate-200 font-mono selection:bg-[#14B8A6] focus:outline-hidden"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    type="button"
                    data-testid="copy-share-url-button"
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                      copied
                        ? "bg-[#14B8A6] text-white border-[#14B8A6]"
                        : "bg-[#1E2D44] text-slate-200 border-[#263244] hover:bg-[#263855]"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="text-[#14B8A6]" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy notice */}
            <div className="p-3 rounded-2xl bg-[#0B1120] border border-[#1E2D44] text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Globe size={13} className="text-[#14B8A6]" />
                <span>Read-Only & Private</span>
              </div>
              <p className="leading-relaxed">
                Anyone with this link can view the itinerary snapshot without logging in. Your email, personal account information, and private saved trips are never shared or modified.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
