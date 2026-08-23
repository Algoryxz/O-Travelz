import React from "react";
import { MapPin, ShieldCheck, X, AlertCircle } from "lucide-react";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <div
      data-testid="location-permission-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#FFFFFF] rounded-3xl border border-[#E5DFD5] shadow-2xl p-6 sm:p-7 space-y-5 text-[#12161E] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          data-testid="close-location-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#70798B] hover:text-[#12161E] p-1 rounded-xl hover:bg-[#F2EEE7] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Icon & Title Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1B5E6B]/10 border border-[#1B5E6B]/20 text-[#1B5E6B] flex items-center justify-center shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-[#12161E]">
              Enable Live Location
            </h3>
            <p className="text-xs text-[#1B5E6B] font-mono font-medium">
              Client-Side Geospatial Discovery
            </p>
          </div>
        </div>

        {/* Informative Explanation Body */}
        <div className="space-y-3 text-xs sm:text-sm text-[#3D4654] leading-relaxed bg-[#FBF9F5] p-4 rounded-2xl border border-[#E5DFD5]">
          <p>
            O-Travelz can use your current location to show where you are on the map and improve nearby destination discovery.
          </p>
          <p className="text-[#70798B] text-xs">
            Your location is used only for these travel features. We will not use it for unrelated purposes.
          </p>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-[#1B5E6B] font-mono">
            <ShieldCheck size={14} className="text-[#1B5E6B] shrink-0" />
            <span>Never logged · Processed on your device only</span>
          </div>
        </div>

        {/* Error Alert if Permission was Denied or Timed Out */}
        {error && (
          <div
            data-testid="location-modal-error"
            className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
          >
            <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">{error}</span>
              <span className="text-[11px] text-rose-600 block">
                If location was blocked, please enable permission in your browser's site settings.
              </span>
            </div>
          </div>
        )}

        {/* Actions Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            data-testid="location-cancel-btn"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EEE7] text-[#3D4654] hover:text-[#12161E] border border-[#E5DFD5] text-xs font-bold transition-colors cursor-pointer"
          >
            Not Now
          </button>

          {error && onRetry ? (
            <button
              type="button"
              data-testid="location-retry-btn"
              onClick={onRetry}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Retrying..." : "Retry Permission"}
            </button>
          ) : (
            <button
              type="button"
              data-testid="location-allow-btn"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <MapPin size={14} />
                  <span>Allow Live Location</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
