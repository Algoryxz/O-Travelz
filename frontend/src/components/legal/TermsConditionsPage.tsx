import React from "react";
import { FileText, ArrowLeft, ShieldCheck, Image as ImageIcon } from "lucide-react";

interface LegalPageProps {
  onBack?: () => void;
  onOpenContact?: () => void;
}

export const TermsConditionsPage: React.FC<LegalPageProps> = ({ onBack, onOpenContact }) => {
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
            TERMS OF SERVICE &amp; CONTENT GOVERNANCE
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#12161E]">
          O-Travelz Terms &amp; Conditions
        </h1>
        <p className="text-xs sm:text-sm text-[#3D4654] leading-relaxed max-w-2xl">
          Guidelines, terms of service, and visual content policies governing your use of the O-Travelz travel intelligence platform.
        </p>
        <div className="flex flex-wrap gap-4 pt-2 text-[11px] text-[#70798B] font-mono">
          <span>Effective Date: August 2026</span>
          <span>•</span>
          <span>Version: 1.1 (Content Governance Release)</span>
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

        {/* Part 1: Images and Third-Party Content Section */}
        <section className="space-y-3 pt-4 border-t border-[#E5DFD5]">
          <div className="flex items-center gap-2 text-[#B87B22]">
            <ImageIcon size={16} />
            <h2 className="text-base font-serif font-bold text-[#12161E]">5. Images and Third-Party Content</h2>
          </div>
          <p>
            O-TRAVELZ does not claim ownership of all photographs, images, logos, trademarks, or other third-party visual content displayed on the platform. Such content may be displayed to support travel discovery, informational reference, educational context, and destination identification.
          </p>
          <p>
            All intellectual-property rights, including applicable copyrights and trademarks, remain with their respective owners. O-TRAVELZ does not claim that every third-party image displayed is in the public domain, royalty-free, or subject to blanket licensing.
          </p>
          <p>
            Where attribution or source information is available, O-TRAVELZ may display or preserve such information. The absence of recorded source metadata does not constitute a claim of ownership by O-TRAVELZ.
          </p>
          <p>
            For authentic destination photographs curated directly from user contributions or field surveys, O-TRAVELZ verifies subject authenticity (ensuring photographs depict the genuine landmark, sanctuary, or regional culinary specialty) separately from provenance documentation. Where historical provenance records were not retained, content is cataloged with transparency rather than speculative attribution.
          </p>
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-2">
            <h3 className="font-semibold text-[#12161E]">Attribution &amp; Content Review Requests</h3>
            <p>
              If you are a copyright owner or authorized representative and believe that content displayed on the platform requires attribution, correction, or removal, please contact us with sufficient information to identify the relevant content. We will promptly review the request and take appropriate action where necessary.
            </p>
            <p className="pt-1 font-mono text-[11px] text-[#70798B]">
              Notice &amp; Content Review Channel: <span className="text-[#12161E] font-semibold">Submit via the in-app Contact &amp; Grievance Redressal portal</span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};
