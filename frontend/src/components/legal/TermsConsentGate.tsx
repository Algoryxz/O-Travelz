import React, { useState } from "react";
import {
  Shield,
  FileCheck,
  Lock,
  Compass,
  CheckCircle2,
  X,
} from "lucide-react";
import { PrivacyPolicyPage } from "./PrivacyPolicyPage";
import { TermsConditionsPage } from "./TermsConditionsPage";
import { CURRENT_TERMS_VERSION } from "../../store/useTermsConsent";

interface TermsConsentGateProps {
  onAccept: () => void;
}

export const TermsConsentGate: React.FC<TermsConsentGateProps> = ({ onAccept }) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [activePreviewDoc, setActivePreviewDoc] = useState<"terms" | "privacy" | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed) return;
    onAccept();
  };

  return (
    <div
      data-testid="terms-consent-gate"
      className="min-h-screen w-full bg-[#FBF9F5] text-[#12161E] flex flex-col justify-between p-4 sm:p-6 md:p-10 relative overflow-x-hidden font-sans select-none"
    >
      {/* Decorative Ambient Subtle Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B87B22]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Brand Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between z-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <img
              src="/logo.jpeg"
              alt="O-Travelz Logo"
              className="w-9 h-9 rounded-2xl object-cover ring-1 ring-[#B87B22]/40 shadow-sm shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-tight text-[#12161E]">
                O-Travelz
              </span>
              <span className="live-dot" />
            </div>
            <p className="text-[11px] text-[#1B5E6B] font-medium tracking-wide">
              safe • secure • smart
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#FFFFFF] text-[#1B5E6B] border border-[#E5DFD5] text-[10px] font-mono font-bold tracking-wider shadow-sm">
          ODISHA PLATFORM
        </span>
      </div>

      {/* Main Center Consent Card */}
      <div className="max-w-3xl mx-auto w-full my-auto py-6 z-10">
        <div className="rounded-3xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xl p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Header Title */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1B5E6B]/10 border border-[#1B5E6B]/20 text-[#1B5E6B] text-xs font-mono font-semibold">
              <Shield size={14} className="text-[#1B5E6B]" />
              <span>RESPONSIBLE TRAVEL &amp; DATA PRIVACY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display tracking-tight text-[#12161E]">
              Welcome to O-Travelz
            </h1>
            <p className="text-xs sm:text-sm text-[#70798B] leading-relaxed max-w-2xl">
              Before you continue, please review and accept our Terms &amp; Conditions and Privacy Policy.
            </p>
          </div>

          {/* Three Key Pillars Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E5DFD5] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#1B5E6B]/10 text-[#1B5E6B] flex items-center justify-center">
                <Lock size={16} />
              </div>
              <h3 className="text-xs font-bold text-[#12161E]">Zero Cloud Tracking</h3>
              <p className="text-[11px] text-[#70798B] leading-relaxed">
                No tracking cookies, no advertising telemetry, and zero user profile selling.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E5DFD5] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#B87B22]/10 text-[#B87B22] flex items-center justify-center">
                <Compass size={16} />
              </div>
              <h3 className="text-xs font-bold text-[#12161E]">Verified Factuality</h3>
              <p className="text-[11px] text-[#70798B] leading-relaxed">
                Deterministic schedules, grounded coordinates, and verified Odisha transit links.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E5DFD5] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#A84825]/10 text-[#A84825] flex items-center justify-center">
                <FileCheck size={16} />
              </div>
              <h3 className="text-xs font-bold text-[#12161E]">DPDP Act Aligned</h3>
              <p className="text-[11px] text-[#70798B] leading-relaxed">
                Designed under India's Digital Personal Data Protection Act, 2023 principles.
              </p>
            </div>
          </div>

          {/* Document Preview Buttons */}
          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E5DFD5] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#3D4654] text-center sm:text-left font-medium">
              Review full governance documents:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                data-testid="view-terms-btn"
                onClick={() => setActivePreviewDoc("terms")}
                className="px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#E5DFD5] hover:border-[#B87B22] text-xs font-semibold text-[#1B5E6B] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <FileCheck size={14} />
                <span>View Terms &amp; Conditions</span>
              </button>

              <button
                type="button"
                data-testid="view-privacy-btn"
                onClick={() => setActivePreviewDoc("privacy")}
                className="px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#E5DFD5] hover:border-[#B87B22] text-xs font-semibold text-[#1B5E6B] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Shield size={14} />
                <span>View Privacy Policy</span>
              </button>
            </div>
          </div>

          {/* Acknowledgement & Accept Form */}
          <form onSubmit={handleFormSubmit} className="space-y-6 pt-2">
            {/* Checkbox */}
            <label
              htmlFor="consent-checkbox"
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2EEE7] border border-[#E5DFD5] transition-colors cursor-pointer group select-none"
            >
              <input
                type="checkbox"
                id="consent-checkbox"
                data-testid="consent-checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#D1C8BA] text-[#B87B22] focus:ring-[#B87B22] accent-[#B87B22] cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-[#12161E] leading-relaxed font-medium">
                I have read and agree to the Terms &amp; Conditions and Privacy Policy.
              </span>
            </label>

            {/* Accept Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] text-[#70798B] font-mono">
                Version: {CURRENT_TERMS_VERSION}
              </span>

              <button
                type="submit"
                data-testid="accept-consent-btn"
                disabled={!isAgreed}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isAgreed
                    ? "bg-[#B87B22] hover:bg-[#A0691B] text-white shadow-amber-500/20 scale-[1.01] cursor-pointer hover:shadow-md"
                    : "bg-[#E5DFD5] text-[#70798B] opacity-50 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 size={16} />
                <span>Accept &amp; Continue</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-4xl mx-auto w-full text-center z-10 pt-4 text-[11px] text-[#70798B] font-mono">
        O-Travelz · Travel Directory &amp; Itinerary Workspace for Odisha
      </div>

      {/* Modal / Dialog for Viewing Policy Without Leaving Consent Gate */}
      {activePreviewDoc && (
        <div
          data-testid="consent-document-preview-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActivePreviewDoc(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[85vh] bg-[#FFFFFF] rounded-3xl border border-[#E5DFD5] shadow-2xl overflow-hidden flex flex-col text-[#12161E] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#FBF9F5] border-b border-[#E5DFD5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-[#1B5E6B]" />
                <span className="text-xs font-bold font-display text-[#12161E]">
                  {activePreviewDoc === "terms"
                    ? "Terms & Conditions"
                    : "Privacy Policy"}
                </span>
              </div>
              <button
                type="button"
                data-testid="close-document-preview-btn"
                onClick={() => setActivePreviewDoc(null)}
                className="w-8 h-8 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE4DA] text-[#3D4654] hover:text-[#12161E] flex items-center justify-center transition-colors cursor-pointer border border-[#E5DFD5]"
                aria-label="Close document preview"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1">
              {activePreviewDoc === "terms" ? (
                <TermsConditionsPage />
              ) : (
                <PrivacyPolicyPage />
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#FBF9F5] border-t border-[#E5DFD5] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setActivePreviewDoc(null)}
                className="px-5 py-2 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
