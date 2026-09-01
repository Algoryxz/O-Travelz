/**
 * Screen-projected Interactive Architectural Hotspots for Heritage 3D Scene.
 */
import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Info, X } from 'lucide-react';
import type { HeritageHotspot } from '../../types/heritage';

interface ProjectedHotspot {
  hotspot: HeritageHotspot;
  screenX: number;
  screenY: number;
  visible: boolean;
  distance: number;
}

interface HeritageHotspotsProps {
  hotspots: HeritageHotspot[];
  camera: THREE.PerspectiveCamera | null;
  containerRef: React.RefObject<HTMLDivElement>;
  selectedHotspot: HeritageHotspot | null;
  onSelectHotspot: (hotspot: HeritageHotspot) => void;
  onCloseHotspot: () => void;
}

export const HeritageHotspots: React.FC<HeritageHotspotsProps> = ({
  hotspots,
  camera,
  containerRef,
  selectedHotspot,
  onSelectHotspot,
  onCloseHotspot,
}) => {
  const [projected, setProjected] = useState<ProjectedHotspot[]>([]);

  useEffect(() => {
    let animId: number;

    const project = () => {
      if (!camera || !containerRef.current || hotspots.length === 0) {
        setProjected([]);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const tempVec = new THREE.Vector3();

      const list: ProjectedHotspot[] = hotspots.map((h) => {
        tempVec.set(h.position[0], h.position[1], h.position[2]);
        const dist = camera.position.distanceTo(tempVec);

        tempVec.project(camera);

        // Check if in front of camera
        const isVisible = tempVec.z < 1.0;
        const x = ((tempVec.x + 1) / 2) * width;
        const y = ((-tempVec.y + 1) / 2) * height;

        return {
          hotspot: h,
          screenX: Math.round(x),
          screenY: Math.round(y),
          visible: isVisible && x >= 10 && x <= width - 10 && y >= 10 && y <= height - 10,
          distance: dist,
        };
      });

      setProjected(list);
      animId = requestAnimationFrame(project);
    };

    project();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [hotspots, camera, containerRef]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* Projected Hotspot Marker Pins */}
      {projected.map(({ hotspot, screenX, screenY, visible }) => {
        if (!visible) return null;
        const isSelected = selectedHotspot?.id === hotspot.id;

        return (
          <button
            key={hotspot.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectHotspot(hotspot);
            }}
            style={{
              transform: `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%)`,
            }}
            className={`absolute pointer-events-auto group flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md transition-all duration-200 shadow-lg ${
              isSelected
                ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-900 scale-110 z-30'
                : 'bg-slate-900/85 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 hover:scale-105'
            }`}
            title={hotspot.title}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-medium tracking-wide whitespace-nowrap">
              {hotspot.title}
            </span>
          </button>
        );
      })}

      {/* Selected Hotspot Detail Drawer Overlay */}
      {selectedHotspot && (
        <div
          className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md pointer-events-auto bg-slate-900/95 border border-amber-500/30 backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Architectural Feature
                </span>
                {selectedHotspot.odia_title && (
                  <span className="text-xs font-serif text-amber-200/70">
                    {selectedHotspot.odia_title}
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold text-slate-100 mt-1">
                {selectedHotspot.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={onCloseHotspot}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {selectedHotspot.description}
          </p>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 mb-1">
              <Info className="w-3.5 h-3.5" />
              <span>Architectural Significance</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {selectedHotspot.architectural_significance}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
