/**
 * Immersive Digital Heritage Section for O-Travelz.
 * Delivers authentic 3D architectural models, verified dimensions, materials,
 * and spatial intelligence for the 4 canonical Odisha monuments.
 */
import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  MapPin,
  Clock,
  Ruler,
} from 'lucide-react';
import type { HeritageScene } from '../../types/heritage';
import { fetchHeritageScenes, FALLBACK_HERITAGE_SCENES } from '../../api/heritageApi';
import { HeritageSceneViewer } from '../heritage/HeritageSceneViewer';

interface Heritage3DSectionProps {
  onExplorePlace?: (placeId: string, name: string) => void;
  onPlanTrip?: (placeName: string) => void;
}

export const Heritage3DSection: React.FC<Heritage3DSectionProps> = ({
  onExplorePlace,
  onPlanTrip,
}) => {
  const [scenes, setScenes] = useState<HeritageScene[]>(FALLBACK_HERITAGE_SCENES);
  const [selectedSceneId, setSelectedSceneId] = useState<string>('konark-sun-temple');
  const [, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    fetchHeritageScenes().then((data) => {
      if (mounted && data && data.length > 0) {
        setScenes(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const activeScene =
    scenes.find((s) => s.id === selectedSceneId) || scenes[0] || FALLBACK_HERITAGE_SCENES[0];

  const getBadgeDetails = (scene: HeritageScene) => {
    switch (scene.scene_type) {
      case 'REAL_3D_RECONSTRUCTION':
        return {
          chip: '3D Model',
          full: '3D Digital Reconstruction',
          badgeClass: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
          chipClass: 'bg-emerald-500/20 text-emerald-300',
        };
      case 'REFERENCE_VIRTUAL_EXPERIENCE':
        return {
          chip: 'Visual Ref',
          full: 'Verified Visual Reference',
          badgeClass: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300',
          chipClass: 'bg-cyan-500/20 text-cyan-300',
        };
      case 'RECONSTRUCTION_IN_PROGRESS':
      default:
        return {
          chip: 'In Progress',
          full: '3D Reconstruction In Progress',
          badgeClass: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
          chipClass: 'bg-amber-500/20 text-amber-300',
        };
    }
  };

  const badgeInfo = getBadgeDetails(activeScene);

  return (
    <section className="relative py-12 bg-slate-950 text-slate-100 overflow-hidden border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Digital Heritage & Spatial Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              Immersive Heritage Explorer
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Authentic 3D architectural models and structural intelligence of Odisha’s 4 canonical Kalinga temples.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 font-mono text-emerald-400">
              {scenes.length} Canonical Monuments
            </span>
          </div>
        </div>

        {/* Monument Selection Filter Chips (4 Canonical Monuments) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar max-w-full">
          {scenes.map((scene) => {
            const isSelected = scene.id === selectedSceneId;
            const b = getBadgeDetails(scene);

            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => setSelectedSceneId(scene.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-bold scale-[1.02]'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{scene.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : b.chipClass
                  }`}
                >
                  {b.chip}
                </span>
              </button>
            );
          })}
        </div>

        {/* Master Interactive 3D Viewer Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 3D Viewport Column */}
          <div className="lg:col-span-8 w-full">
            <HeritageSceneViewer
              scene={activeScene}
              availableScenes={scenes}
              onSelectScene={(id) => setSelectedSceneId(id)}
              heightClass="h-[460px] sm:h-[500px] lg:h-[560px]"
            />
          </div>

          {/* Monument Architectural & Provenance Intelligence Card */}
          <div className="lg:col-span-4 bg-slate-900/85 border border-slate-800 backdrop-blur-xl rounded-3xl p-5 sm:p-6 flex flex-col justify-between h-full min-h-[460px] sm:min-h-[500px] lg:min-h-[560px]">
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${badgeInfo.badgeClass}`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{badgeInfo.full}</span>
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-100">{activeScene.name}</h3>
                <div className="text-xs font-serif text-amber-300/90 mt-0.5">
                  {activeScene.odia_name}
                </div>
              </div>

              {/* Quick Meta Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>Location</span>
                  </div>
                  <div className="font-medium text-slate-200 truncate">{activeScene.district}</div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-0.5">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Era / Dynasty</span>
                  </div>
                  <div className="font-medium text-slate-200 truncate">
                    {activeScene.century.split('(')[0].trim()}
                  </div>
                </div>
              </div>

              {/* Architectural Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeScene.description}
              </p>

              {/* Verified Dimensions & Material Badges */}
              {(activeScene.dimensions || activeScene.materials) && (
                <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                  {activeScene.dimensions && (
                    <div className="flex items-start gap-2 text-xs">
                      <Ruler className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-400 text-[11px]">Key Dimensions: </span>
                        <span className="text-slate-200 font-medium text-[11px]">
                          {Object.values(activeScene.dimensions)[0]}
                        </span>
                      </div>
                    </div>
                  )}
                  {activeScene.materials && (
                    <div className="flex items-start gap-2 text-xs">
                      <Layers className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-400 text-[11px]">Material: </span>
                        <span className="text-slate-200 font-medium text-[11px]">
                          {Object.values(activeScene.materials)[0]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Architectural Hotspots Pill List */}
              {activeScene.hotspots && activeScene.hotspots.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Verified Architectural Hotspots ({activeScene.hotspots.length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 no-scrollbar">
                    {activeScene.hotspots.map((h) => (
                      <div
                        key={h.id}
                        className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/80 text-xs"
                      >
                        <div className="font-semibold text-slate-200 flex justify-between gap-1">
                          <span>{h.title}</span>
                          {h.dimension && (
                            <span className="text-[10px] text-emerald-400/90 font-mono">
                              {h.dimension.split(',')[0]}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                          {h.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2 mt-3">
              {onPlanTrip && (
                <button
                  type="button"
                  onClick={() => onPlanTrip(activeScene.name)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Plan Trip Here</span>
                </button>
              )}

              {onExplorePlace && (
                <button
                  type="button"
                  onClick={() => onExplorePlace(activeScene.id, activeScene.name)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 cursor-pointer"
                >
                  <span>Explore Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
