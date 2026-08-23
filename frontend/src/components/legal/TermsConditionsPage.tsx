import React from "react";
import { FileText, ArrowLeft, ShieldCheck } from "lucide-react";

interface LegalPageProps {
  onBack?: () => void;
}

export const TermsConditionsPage: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <main
      data-testid="terms-conditions-page"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300 text-[#12161E]"
    >
      {/* Back Button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          data-testid="terms-back-btn"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#B87B22] hover:text-[#A0691B] transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to Travel Hub</span>
        </button>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] shadow-xs space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-[#B87B22]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#B87B22] font-mono">
            TERMS OF SERVICE
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#12161E]">
          O-Travelz Terms &amp; Conditions
        </h1>
        <p className="text-xs sm:text-sm text-[#3D4654] leading-relaxed max-w-2xl">
          Guidelines and terms governing your use of the O-Travelz travel intelligence platform.
        </p>
        <div className="flex flex-wrap gap-4 pt-2 text-[11px] text-[#70798B] font-mono">
          <span>Effective Date: August 2026</span>
          <span>•</span>
          <span>Version: 1.0 (Production Release)</span>
        </div>
      </div>

      {/* Narrative Terms Sections */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs space-y-6 text-xs text-[#3D4654] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-[#12161E]">1. Acceptance of Terms</h2>
          <p>
            By accessing or using O-Travelz, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-[#12161E]">2. Nature of the Platform</h2>
          <p>
            O-Travelz is a travel planning and discovery tool. While we make every effort to verify destination details, temple opening hours, and transport connections across Odisha, actual road conditions, transit delays, or temple darshan schedules may vary.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-[#12161E]">3. Responsible Travel in Odisha</h2>
          <p>
            Travelers are requested to respect local customs, heritage monuments, sacred temple guidelines, and eco-sensitive wildlife zones across Odisha.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-[#12161E]">4. Core Factuality &amp; AI Intelligence</h2>
          <p>
            AI orchestrates and refines; it does not invent factual travel information. All travel routing and place intelligence are powered by deterministic multi-day itinerary generation grounded in verified O-Travelz data.
          </p>
        </section>
      </div>
    </main>
  );
};
