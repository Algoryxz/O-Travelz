import React from "react";
import { Shield, Lock, Eye, ArrowLeft, UserCheck } from "lucide-react";

interface LegalPageProps {
  onBack?: () => void;
}

export const PrivacyPolicyPage: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <main
      data-testid="privacy-policy-page"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300 text-[#12161E]"
    >
      {/* Back Button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          data-testid="privacy-back-btn"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#B87B22] hover:text-[#A0691B] transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to Travel Hub</span>
        </button>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] shadow-xs space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-[#B87B22]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#B87B22] font-mono">
            RESPONSIBLE DATA GOVERNANCE
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#12161E]">
          O-Travelz Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#3D4654] leading-relaxed max-w-2xl">
          Designed in alignment with India's Digital Personal Data Protection Act, 2023 (DPDP Act) and the Digital Personal Data Protection Rules, 2025.
        </p>
        <div className="flex flex-wrap gap-4 pt-2 text-[11px] text-[#70798B] font-mono">
          <span>Last Updated: August 2026</span>
          <span>•</span>
          <span>Version: 1.0 (Production Release)</span>
        </div>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#2F523E] flex items-center justify-center font-bold border border-[#E5DFD5]">
            <Lock size={15} />
          </div>
          <h3 className="text-sm font-serif font-bold text-[#12161E]">Zero Cloud Tracking</h3>
          <p className="text-xs text-[#70798B] leading-relaxed">
            Your live location stays client-side in browser memory. We do not maintain background user tracking profiles.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#1B5E6B] flex items-center justify-center font-bold border border-[#E5DFD5]">
            <Eye size={15} />
          </div>
          <h3 className="text-sm font-serif font-bold text-[#12161E]">Explicit Consent</h3>
          <p className="text-xs text-[#70798B] leading-relaxed">
            Geolocation is requested only after an in-app explanation. You can withdraw or block location permissions anytime.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#B87B22] flex items-center justify-center font-bold border border-[#E5DFD5]">
            <UserCheck size={15} />
          </div>
          <h3 className="text-sm font-serif font-bold text-[#12161E]">Client Storage Control</h3>
          <p className="text-xs text-[#70798B] leading-relaxed">
            Saved destinations and trip drafts are stored directly on your device via standard browser localStorage.
          </p>
        </div>
      </div>

      {/* Narrative Policy Sections */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs space-y-6 text-xs text-[#3D4654] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-[#12161E]">1. Scope &amp; Applicability</h2>
          <p>
            This Privacy Notice explains how O-Travelz collects, processes, and safeguards personal data when you use the O-Travelz web platform to explore destinations, routes, and transit schedules across the State of Odisha, India.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-[#12161E]">2. Information We Process</h2>
          <p>
            O-Travelz follows strict data minimization principles. We do not require account registration or personal profiling to browse Odisha destinations, view transit schedules, or build itineraries.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-[#12161E]">3. Contact &amp; Grievance Redressal</h2>
          <p>
            If you have questions, feedback, or grievance requests concerning this Privacy Policy, please contact our designated Grievance Officer at <a href="mailto:grievance@o-travelz.in" className="text-[#B87B22] font-semibold underline">grievance@o-travelz.in</a>.
          </p>
        </section>
      </div>
    </main>
  );
};
