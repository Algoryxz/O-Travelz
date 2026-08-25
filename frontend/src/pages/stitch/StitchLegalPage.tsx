import React from 'react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';

interface StitchLegalPageProps {
  onNavigate: (tab: StitchTab) => void;
}

export const StitchLegalPage: React.FC<StitchLegalPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full pt-28 pb-24 px-6 md:px-12 max-w-4xl mx-auto space-y-8 font-body">
      <header className="border-b border-[#E5DFD5] pb-6">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[#12161E]">
          Heritage Governance &amp; Ethical Tourism
        </h1>
        <p className="text-sm text-[#70798B] mt-2">
          Guidelines for respectful cultural discovery across sacred sanctuaries and indigenous communities in Odisha.
        </p>
      </header>

      <section className="space-y-6 text-sm text-[#3D4654] leading-relaxed">
        <div className="bg-white border border-[#E5DFD5] p-6 rounded-xl shadow-xs">
          <h3 className="font-display font-bold text-lg text-[#12161E] mb-2">
            1. Sacred Sanctuary Protocols
          </h3>
          <p>
            When visiting active temple complexes such as Puri Jagannath and Lingaraj, strictly observe footwear removal, dress codes, and photography restrictions within sanctum sanctorum zones.
          </p>
        </div>

        <div className="bg-white border border-[#E5DFD5] p-6 rounded-xl shadow-xs">
          <h3 className="font-display font-bold text-lg text-[#12161E] mb-2">
            2. Ecological Sensitivity in Coastal Wetlands
          </h3>
          <p>
            In Chilika Lake and Mangalajodi, avoid loud noise or motor interference near dolphin feeding grounds and migratory avian nesting marshes.
          </p>
        </div>
      </section>
    </div>
  );
};
