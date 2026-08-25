import React from "react";
import { ShieldCheck, MapPin } from "lucide-react";

export interface FooterProps {
  selectedLocation?: string;
  onNavigateToPlan?: () => void;
  onNavigateToMap?: () => void;
  onNavigate?: (tab: any) => void;
  onSelectCategory?: (cat: any) => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenContact?: () => void;
  [key: string]: any;
}

export const Footer: React.FC<FooterProps> = ({
  selectedLocation = "Bhubaneswar",
  onNavigate,
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact,
}) => {
  const handleLegalClick = (tab: string, customFn?: () => void) => {
    if (customFn) {
      customFn();
    } else if (onNavigate) {
      onNavigate(tab);
    } else if (typeof window !== "undefined") {
      window.location.hash = `#${tab}`;
    }
  };

  return (
    <footer className="relative bg-[#F2EEE7] text-[#12161E] border-t border-[#E5DFD5] overflow-hidden pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.jpeg"
                alt="O-Travelz Logo"
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#B87B22]/30 shadow-xs shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="font-serif font-bold text-xl tracking-tight text-[#12161E]">
                O-Travelz
              </span>
            </div>
            <p className="text-xs text-[#70798B] font-mono">
              Travel Odisha with intelligence, context and confidence. safe • secure • smart · Powered by Algoryxz
            </p>
            <p className="text-xs text-[#3D4654] max-w-md leading-relaxed">
              Curated multimodal travel intelligence platform for discovering Odisha's heritage temples, golden Bay of Bengal coastlines, serene brackish lagoons, and Eastern Ghats highland sanctuaries.
            </p>
          </div>

          {/* Legal & Responsible Data Col */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#B87B22]">
              Responsible Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#3D4654]">
              <li>
                <button
                  type="button"
                  data-testid="footer-privacy-policy-link"
                  onClick={() => handleLegalClick("privacy", onOpenPrivacy)}
                  className="hover:text-[#B87B22] transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-testid="footer-terms-conditions-link"
                  onClick={() => handleLegalClick("terms", onOpenTerms)}
                  className="hover:text-[#B87B22] transition-colors text-left cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-testid="footer-contact-grievance-link"
                  onClick={() => handleLegalClick("contact", onOpenContact)}
                  className="hover:text-[#B87B22] transition-colors text-left cursor-pointer"
                >
                  Contact / Grievance
                </button>
              </li>
            </ul>
          </div>

          {/* Active Hub & Trust Col */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#B87B22]">
              Hub &amp; Data Grounding
            </h4>
            <div className="space-y-2 text-xs text-[#70798B]">
              <div className="flex items-center gap-1.5 text-[#3D4654]">
                <MapPin size={13} className="text-[#B87B22]" />
                <span>Active Hub: {selectedLocation}, Odisha</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#2F523E]" />
                <span>DPDP Act 2023 aligned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-6 border-t border-[#E5DFD5] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#70798B]">
          <div>
            &copy; {new Date().getFullYear()} O-Travelz. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#B87B22] font-mono font-bold text-[10px] border border-[#E5DFD5]">
              CRAFTED IN ODISHA · MADE IN ODISHA · ODISHA SPIRIT
            </span>
            <span>Deterministic Spatial Travel Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
