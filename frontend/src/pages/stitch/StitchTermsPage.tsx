import React from 'react';
import { Scale, BookOpen, AlertTriangle, Copyright, FileCheck } from 'lucide-react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';

interface StitchTermsPageProps {
  onNavigate: (tab: StitchTab) => void;
}

export const StitchTermsPage: React.FC<StitchTermsPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto font-body selection:bg-[#B87B22]/20 selection:text-[#B87B22]">
      {/* Header */}
      <header className="border-b border-[#E5DFD5] pb-8 mb-10">
        <div className="flex items-center gap-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#B87B22] mb-3">
          <Scale className="w-4 h-4 text-[#B87B22]" />
          <span>Platform Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#12161E] tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-[#70798B] mt-3 max-w-2xl leading-relaxed">
          These terms govern your access to the O-TRAVELZ platform, services, and digital cultural atlas built by Algoryxz.
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs text-[#70798B] font-mono">
          <span>Effective: September 2026</span>
          <span>•</span>
          <span>Version 4.0</span>
          <span>•</span>
          <span>Algoryxz Technologies</span>
        </div>
      </header>

      {/* Terms Sections */}
      <div className="space-y-8 text-sm text-[#3D4654] leading-relaxed">
        
        {/* Section 1: Algoryxz Intellectual Property */}
        <section className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#B87B22]/10 rounded-lg text-[#B87B22] shrink-0">
              <Copyright className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-display font-bold text-[#12161E]">
                1. Intellectual Property &amp; Platform Ownership
              </h2>
              <p>
                O-TRAVELZ is conceived, designed, and engineered by <strong>Algoryxz</strong>. The platform architecture, routing algorithms, design tokens, multimodal synthesis interfaces, and curated cultural compilations are protected by applicable copyright and intellectual property laws.
              </p>
              <p className="text-xs text-[#70798B]">
                You are granted a personal, revocable, non-exclusive license to use O-TRAVELZ for personal, non-commercial travel planning and cultural exploration across Odisha.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Traveler Conduct & Heritage Sensitivity */}
        <section className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#A84825]/10 rounded-lg text-[#A84825] shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-display font-bold text-[#12161E]">
                2. Cultural Heritage Etiquette &amp; Traveler Conduct
              </h2>
              <p>
                When traveling using recommendations from O-TRAVELZ, travelers agree to uphold the highest standards of cultural and ecological respect:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-[#3D4654]">
                <li>Comply with all Archaeological Survey of India (ASI) regulations at protected monuments (e.g. Konark Sun Temple, Khandagiri &amp; Udayagiri).</li>
                <li>Respect temple sanctum sanctorum protocols, dress codes, footwear removal rules, and photography bans.</li>
                <li>Observe ecological guidelines in vulnerable wildlife habitats (Chilika Lake, Bhitarkanika, Similipal).</li>
                <li>Engage fairly with indigenous artisans and handloom weavers across rural heritage clusters.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Disclaimers & Limitation of Liability */}
        <section className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#70798B]/10 rounded-lg text-[#70798B] shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-display font-bold text-[#12161E]">
                3. Disclaimers &amp; Limitation of Liability
              </h2>
              <p>
                O-TRAVELZ provides transit timetables and travel recommendations on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. Public transit operations (CRUT Mo Bus, OSRTC, Indian Railways) are managed independently by government transit authorities.
              </p>
              <p className="text-xs text-[#70798B]">
                Algoryxz is not liable for transport delays, schedule alterations, weather disruptions, route cancellations, or monument entry closures implemented by local administrative authorities.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Governing Law */}
        <section className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#2F523E]/10 rounded-lg text-[#2F523E] shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-display font-bold text-[#12161E]">
                4. Governing Law &amp; Jurisdiction
              </h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of India, with jurisdiction in Bhubaneswar, Odisha.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-6 border-t border-[#E5DFD5] flex flex-wrap gap-4 text-xs font-mono">
        <button
          onClick={() => onNavigate('privacy')}
          className="text-[#B87B22] hover:underline cursor-pointer"
        >
          Privacy Policy →
        </button>
        <button
          onClick={() => onNavigate('trust')}
          className="text-[#B87B22] hover:underline cursor-pointer"
        >
          Data Trust &amp; Transit Disclaimers →
        </button>
        <button
          onClick={() => onNavigate('discover')}
          className="text-[#70798B] hover:text-[#12161E] ml-auto cursor-pointer"
        >
          Return to Explore
        </button>
      </div>
    </div>
  );
};
