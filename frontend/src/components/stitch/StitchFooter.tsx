import React from 'react';
import type { StitchTab } from './StitchNavbar';

interface StitchFooterProps {
  onSelectTab: (tab: StitchTab) => void;
  weatherCity?: string;
  weatherTemp?: string;
  weatherCondition?: string;
}

export const StitchFooter: React.FC<StitchFooterProps> = ({
  onSelectTab,
  weatherCity = "Bhubaneswar Hub",
  weatherTemp = "32°C",
  weatherCondition = "Clear & Warm",
}) => {
  return (
    <footer className="bg-[#FBF9F5] border-t border-[#E5DFD5] mt-auto flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-10 w-full z-40">
      <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
        <div className="flex items-center gap-2.5 mb-2">
          <img
            src="/logo.jpeg"
            alt="O-Travelz Logo"
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#B87B22]/30 shadow-xs shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
          <span className="font-display italic text-2xl font-bold text-[#12161E]">O-Travelz</span>
          <span className="text-xs bg-[#B87B22]/10 text-[#B87B22] px-2 py-0.5 rounded font-mono font-medium">Odisha Editorial</span>
        </div>
        <span className="font-body text-xs text-[#70798B]">
          © {new Date().getFullYear()} O-Travelz · Built by Algoryxz. Intelligent Multimodal Travel Intelligence for Odisha.
        </span>

        {/* Live Weather Indicator */}
        <div className="mt-4 flex items-center gap-3 bg-white border border-[#E5DFD5] px-3.5 py-1.5 rounded-lg shadow-xs">
          <span className="material-symbols-outlined text-base text-[#B87B22]">wb_sunny</span>
          <span className="font-mono text-xs text-[#3D4654]">
            {weatherCity}: <strong className="text-[#12161E]">{weatherTemp}</strong>, {weatherCondition}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 font-body text-xs uppercase tracking-widest text-[#70798B]">
        <button
          onClick={() => onSelectTab('discover')}
          className="hover:text-[#B87B22] transition-colors focus:outline-none"
        >
          Discover
        </button>
        <button
          onClick={() => onSelectTab('destinations')}
          className="hover:text-[#B87B22] transition-colors focus:outline-none"
        >
          Destinations
        </button>
        <button
          onClick={() => onSelectTab('map')}
          className="hover:text-[#B87B22] transition-colors focus:outline-none"
        >
          Spatial Map
        </button>
        <button
          onClick={() => onSelectTab('resilience')}
          className="hover:text-[#B87B22] transition-colors focus:outline-none"
        >
          System Resilience
        </button>
        <button
          onClick={() => onSelectTab('legal')}
          className="hover:text-[#B87B22] transition-colors focus:outline-none"
        >
          Heritage Governance
        </button>
      </div>
    </footer>
  );
};
