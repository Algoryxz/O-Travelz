import React from "react";
import { Compass, ShieldCheck, Heart, MapPin } from "lucide-react";

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
  onNavigateToPlan,
  onNavigateToMap,
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
    <footer className="relative bg-[#080E1A] text-white border-t border-[#263244] overflow-hidden pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.jpeg"
                alt="O-Travelz Logo"
                className="w-7 h-7 rounded-xl object-cover ring-1 ring-teal-500/40 shadow-xs shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-display font-black text-xl tracking-tight text-white">
                O-Travelz
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">safe • secure • smart</p>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Curated travel intelligence platform for exploring Odisha's heritage temples, golden coastlines, pristine lakes, and tribal highlands.
            </p>
          </div>

          {/* Legal & Responsible Data Col */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-teal-400">
              Responsible Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  data-testid="footer-privacy-policy-link"
                  onClick={() => handleLegalClick("privacy", onOpenPrivacy)}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-testid="footer-terms-conditions-link"
                  onClick={() => handleLegalClick("terms", onOpenTerms)}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-testid="footer-contact-grievance-link"
                  onClick={() => handleLegalClick("contact", onOpenContact)}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  Contact / Grievance
                </button>
              </li>
            </ul>
          </div>

          {/* Active Hub & Trust Col */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-teal-400">
              Odisha Hub &amp; Trust
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin size={13} className="text-[#14B8A6]" />
                <span>Exploring around {selectedLocation}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#14B8A6]" />
                <span>DPDP Act 2023 aligned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-6 border-t border-[#263244] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} O-Travelz. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2 py-0.5 rounded-md bg-[#172235] text-teal-300 font-mono font-bold text-[10px] border border-[#263244]">MADE IN ODISHA</span>
            <span className="px-2 py-0.5 rounded-md bg-[#172235] text-amber-300 font-mono font-bold text-[10px] border border-[#263244]">ODISHA SPIRIT</span>
            <span>Crafted by Algoryxz for travelers across Odisha</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
