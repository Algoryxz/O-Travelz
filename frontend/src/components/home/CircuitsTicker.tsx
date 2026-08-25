import React from "react";

interface CircuitsTickerProps {
  onSelectCircuit: (circuit: string) => void;
}

const CIRCUITS = [
  { id: "golden_triangle", name: "Golden Triangle", desc: "Bhubaneswar · Puri · Konark" },
  { id: "chilika_marine", name: "Chilika Marine", desc: "Satapada · Kalijai · Mangalajodi" },
  { id: "koraput_highlands", name: "Koraput Highlands", desc: "Deomali · Duduma · Gupteswar" },
  { id: "similipal_biosphere", name: "Similipal Biosphere", desc: "Mayurbhanj · Barehipani" },
  { id: "pahala_food_trail", name: "Pahala Food Trail", desc: "Rasagola · Chhena Poda · Odia Flavours" },
  { id: "diamond_triangle", name: "Diamond Triangle", desc: "Ratnagiri · Udayagiri · Lalitgiri" },
  { id: "daringbadi_valleys", name: "Daringbadi Valleys", desc: "Misty Pines · Coffee Estates" },
  { id: "konark_marine_drive", name: "Konark Marine Drive", desc: "Chandrabhaga · Ramachandi Coast" },
  { id: "sambalpur_heritage", name: "Sambalpur Heritage", desc: "Hirakud Reservoir · Samaleswari" },
];

export const CircuitsTicker: React.FC<CircuitsTickerProps> = ({ onSelectCircuit }) => {
  // Duplicate array for seamless infinite looping animation
  const loopItems = [...CIRCUITS, ...CIRCUITS];

  return (
    <div
      data-testid="popular-circuits-ticker"
      className="w-full bg-[#12161E] border-y border-white/10 overflow-hidden py-3 select-none relative z-20 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4">
        {/* Static Badge Label */}
        <div className="shrink-0 flex items-center gap-2 bg-black/60 border border-white/15 px-3 py-1.5 rounded-lg z-10 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#B87B22] animate-pulse"></span>
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#B87B22] uppercase whitespace-nowrap">
            POPULAR CIRCUITS:
          </span>
        </div>

        {/* Continuous Moving Horizontal Marquee Container */}
        <div className="flex-1 overflow-hidden relative mask-linear-fade">
          <div className="flex items-center gap-3 animate-marquee hover:pause-animation w-max">
            {loopItems.map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                type="button"
                onClick={() => onSelectCircuit(item.name)}
                className="group shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-[#B87B22] border border-white/15 hover:border-[#B87B22] transition-all duration-200 cursor-pointer shadow-xs"
              >
                <span className="text-xs font-body font-semibold text-white tracking-wide">
                  {item.name}
                </span>
                <span className="text-[10px] font-mono text-[#E5DFD5]/70 group-hover:text-white transition-colors">
                  • {item.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
