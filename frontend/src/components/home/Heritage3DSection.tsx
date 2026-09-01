import React, { useState } from "react";
import {
  Box,
  Sparkles,
  Compass,
  ArrowRight,
  Sun,
  Flame,
  Info,
  Layers,
  RotateCw,
} from "lucide-react";
import { ThreeDViewer } from "../media/ThreeDViewer";
import type { Model3DContract } from "../../types/api";

interface Heritage3DSectionProps {
  onExplorePlace?: (placeId: string, name: string) => void;
  onPlanTrip?: (placeName: string) => void;
}

const HERITAGE_3D_SHOWCASE: Array<{
  id: string;
  name: string;
  odiaName: string;
  category: string;
  district: string;
  description: string;
  model: Model3DContract;
}> = [
  {
    id: "place_konark_001",
    name: "Konark Sun Temple",
    odiaName: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର",
    category: "13th Century Solar Chariot",
    district: "Puri District",
    description: "The monumental 24-spoke stone Surya Chakra sundials and chlorite deula architecture.",
    model: {
      model_id: "model_konark_wheel_001",
      name: "Konark Surya Chakra",
      format: "procedural",
      procedural_type: "konark_wheel",
      provider: "curated",
      is_ai_generated: false,
      badge_label: "3D Heritage Model",
      transparency_notice: "Interactive 3D representation of the 24-spoke Konark Surya Chakra sundial.",
      scale_factor: 1.2,
      initial_camera_position: [0.0, 1.8, 4.2],
      recommended_lighting: "golden_hour",
      annotations: [
        { label: "24 Spoke Wheels", description: "Astronomical sundial wheels representing the 24 fortnights of the solar year.", position: [0.0, 0.0, 0.2] },
        { label: "Kalinga Vimana", description: "Curvilinear stone tower representing the chariot of the Sun God Surya.", position: [0.0, 1.6, -0.5] },
      ],
    },
  },
  {
    id: "place_puri_001",
    name: "Puri Jagannath Temple",
    odiaName: "ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର",
    category: "Living Sacred Sanctuary",
    district: "Puri",
    description: "65-meter sacred rekha deula crowned with the eight-spoke Nilachakra and fluttering flag.",
    model: {
      model_id: "model_puri_jagannath_001",
      name: "Puri Jagannath Sacred Shikhara",
      format: "procedural",
      procedural_type: "jagannath_temple",
      provider: "curated",
      is_ai_generated: false,
      badge_label: "3D Heritage Model",
      transparency_notice: "Interactive 3D model of the 65m Jagannath Temple deula and sanctum sanctorum.",
      scale_factor: 1.0,
      initial_camera_position: [0.0, 2.5, 6.0],
      recommended_lighting: "temple_glow",
      annotations: [
        { label: "Nilachakra", description: "Eight-spoked sacred wheel atop the main shikhara forged from ashtadhatu.", position: [0.0, 3.8, 0.0] },
      ],
    },
  },
  {
    id: "place_033",
    name: "Dhauli Shanti Stupa",
    odiaName: "ଦଉଳି ଶାନ୍ତି ସ୍ତୂପ",
    category: "Ashokan Peace Pagoda",
    district: "Khordha",
    description: "White hemispherical Buddhist peace pagoda overlooking the historic Daya river plains.",
    model: {
      model_id: "model_dhauli_stupa_001",
      name: "Dhauli Shanti Stupa",
      format: "procedural",
      procedural_type: "dhauli_stupa",
      provider: "curated",
      is_ai_generated: false,
      badge_label: "3D Heritage Model",
      transparency_notice: "Interactive 3D dome of the Dhauli Peace Pagoda commemorating Emperor Ashoka's edicts.",
      scale_factor: 1.1,
      initial_camera_position: [0.0, 2.0, 4.8],
      recommended_lighting: "daylight",
      annotations: [
        { label: "Ashokan Elephant", description: "Earliest rock sculpture in Odisha marking the Ashokan edict site.", position: [0.0, -0.6, 1.6] },
      ],
    },
  },
  {
    id: "place_002",
    name: "Mukteshwar Temple",
    odiaName: "ମୁକ୍ତେଶ୍ୱର ମନ୍ଦିର",
    category: "Gem of Odisha Architecture",
    district: "Bhubaneswar",
    description: "Exquisite 10th-century Kalinga Torana arched gateway with miniature lotus carvings.",
    model: {
      model_id: "model_mukteshwar_torana_001",
      name: "Mukteshwar Arched Torana",
      format: "procedural",
      procedural_type: "mukteshwar_torana",
      provider: "curated",
      is_ai_generated: false,
      badge_label: "3D Heritage Model",
      transparency_notice: "Interactive 3D model of the 10th-century Mukteshwar arched Torana gateway.",
      scale_factor: 1.3,
      initial_camera_position: [0.0, 1.4, 3.8],
      recommended_lighting: "golden_hour",
      annotations: [
        { label: "Carved Torana Arch", description: "Famous semi-circular archway with miniature lotus and scrollwork.", position: [0.0, 1.2, 0.0] },
      ],
    },
  },
  {
    id: "place_020",
    name: "Barabati Fort Gateway",
    odiaName: "ବାରବାଟୀ ଦୁର୍ଗ",
    category: "Medieval Katak Citadel",
    district: "Cuttack",
    description: "14th-century Ganga dynasty fortified gateway, laterite towers, and defensive moat ramparts.",
    model: {
      model_id: "model_barabati_fort_001",
      name: "Barabati Fort Gateway",
      format: "procedural",
      procedural_type: "barabati_fort",
      provider: "curated",
      is_ai_generated: false,
      badge_label: "3D Heritage Model",
      transparency_notice: "Interactive 3D reconstruction of the ancient Ganga dynasty arched stone gateway.",
      scale_factor: 1.0,
      initial_camera_position: [0.0, 1.5, 4.5],
      recommended_lighting: "temple_glow",
      annotations: [
        { label: "Arched Stone Portal", description: "Pointed arched stone portal of the medieval military stronghold.", position: [0.0, 0.8, 0.0] },
      ],
    },
  },
];

export const Heritage3DSection: React.FC<Heritage3DSectionProps> = ({
  onExplorePlace,
  onPlanTrip,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = HERITAGE_3D_SHOWCASE[activeIndex];

  return (
    <section className="w-full bg-[#12161E] text-white py-20 px-6 md:px-12 border-y border-white/10 relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#0D5C3A]/30 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#C69214]/25 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/15 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1 rounded-full text-xs font-mono text-[#C69214] border border-white/15">
              <Box className="w-3.5 h-3.5" />
              <span>IMMERSIVE 3D HERITAGE EXPLORER</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight">
              Experience Odisha in <span className="italic text-[#C69214]">Full 3D Depth</span>
            </h2>
            <p className="font-body text-sm sm:text-base text-[#E5DFD5] max-w-2xl leading-relaxed">
              Touch, rotate, and examine the astronomical sundials of Konark, sacred spires of Puri, and Ashokan stupas through interactive WebGL models.
            </p>
          </div>

          <div className="text-xs font-mono text-[#E5DFD5]/70 flex items-center gap-2">
            <RotateCw className="w-3.5 h-3.5 text-[#C69214] animate-spin" />
            <span>Interactive 3D Engine • Three.js</span>
          </div>
        </div>

        {/* Interactive Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Monument Selector Tabs */}
          <div className="lg:col-span-4 space-y-2.5">
            <span className="text-[11px] font-mono text-[#C69214] tracking-widest uppercase font-semibold block px-1">
              Select Monument to Render
            </span>
            <div className="space-y-2">
              {HERITAGE_3D_SHOWCASE.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer border text-left ${
                      isActive
                        ? "bg-white/15 border-white/40 border-l-4 border-l-[#C69214] shadow-xl scale-[1.02]"
                        : "bg-white/5 hover:bg-white/10 border-white/10 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#C69214] uppercase tracking-wider font-semibold">
                        {item.category}
                      </span>
                      <span className="text-xs font-mono text-[#E5DFD5]/60">
                        {item.district}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-white mt-1">
                      {item.name}
                    </h3>
                    <p className="font-body text-xs text-[#E5DFD5] line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: 3D Interactive Canvas & CTAs */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/40">
              <ThreeDViewer
                key={current.id}
                model={current.model}
                placeName={current.name}
                heightClass="h-[400px] sm:h-[480px] md:h-[540px]"
              />
            </div>

            {/* Monument Details & Trip Planner CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-lg text-white">{current.name}</h4>
                  <span className="text-xs text-[#C69214] font-body">{current.odiaName}</span>
                </div>
                <p className="text-xs text-[#E5DFD5]/80">{current.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onExplorePlace?.(current.id, current.name)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Full Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onPlanTrip?.(current.name)}
                  className="px-4 py-2 rounded-xl bg-[#0D5C3A] hover:bg-[#0A472C] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C69214]" />
                  <span>Plan Trip Here</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
