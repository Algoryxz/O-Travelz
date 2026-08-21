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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#111827] rounded-3xl border border-[#263244] shadow-2xl p-6 sm:p-7 space-y-5 text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          data-testid="close-location-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Icon & Title Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-[#14B8A6] flex items-center justify-center shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              Enable Live Location
            </h3>
            <p className="text-xs text-teal-400 font-mono font-medium">
              Client-Side Geospatial Discovery
            </p>
          </div>
        </div>

        {/* Informative Explanation Body */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#0B1220] p-4 rounded-2xl border border-[#263244]">
          <p>
            O-Travelz can use your current location to show where you are on the map and improve nearby destination discovery.
          </p>
          <p className="text-slate-400 text-xs">
            Your location is used only for these travel features. We will not use it for unrelated purposes.
          </p>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-teal-300 font-mono">
            <ShieldCheck size={14} className="text-[#14B8A6] shrink-0" />
            <span>Never logged · Processed on your device only</span>
          </div>
        </div>

        {/* Error Alert if Permission was Denied or Timed Out */}
        {error && (
          <div
            data-testid="location-modal-error"
            className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5"
          >
            <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">{error}</span>
              <span className="text-[11px] text-rose-300 block">
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
            className="px-4 py-2.5 rounded-xl bg-[#172235] hover:bg-[#1E2D44] text-slate-300 hover:text-white border border-[#263244] text-xs font-bold transition-colors cursor-pointer"
          >
            Not Now
          </button>

          {error && onRetry ? (
            <button
              type="button"
              data-testid="location-retry-btn"
              onClick={onRetry}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold shadow-md hover:shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Retrying..." : "Retry Permission"}
            </button>
          ) : (
            <button
              type="button"
              data-testid="location-allow-btn"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold shadow-md hover:shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
