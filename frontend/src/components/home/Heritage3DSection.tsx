/**
 * Immersive 3D Heritage Explorer Section for O-Travelz.
 * Delivers museum-grade digital heritage visualizations for the 6 canonical Odisha monuments.
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
  BookOpen,
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
  const [loading, setLoading] = useState<boolean>(true);

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

  const isReal3D = activeScene.scene_type === 'REAL_3D_RECONSTRUCTION';

  return (
    <section className="relative py-16 bg-slate-950 text-slate-100 overflow-hidden border-t border-slate-900">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Digital Heritage & Spatial Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-100">
              Immersive 3D Heritage Explorer
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
              Photogrammetric 3D reconstructions and verified architectural spatial models of Odisha’s ancient temples, rock-cut caves, and medieval fortresses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              <strong className="text-amber-400">{scenes.length}</strong> Heritage Reconstructions
            </span>
          </div>
        </div>

        {/* Monument Selection Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {scenes.map((scene) => {
            const isSelected = scene.id === selectedSceneId;
            const is3D = scene.scene_type === 'REAL_3D_RECONSTRUCTION';

            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => setSelectedSceneId(scene.id)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{scene.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isSelected
                      ? 'bg-slate-950/20 text-slate-950'
                      : is3D
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {is3D ? '3D Reconstructed' : 'Ref Experience'}
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
              heightClass="h-[460px] sm:h-[520px] lg:h-[600px]"
            />
          </div>

          {/* Monument Architectural & Provenance Intelligence Card */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 flex flex-col justify-between h-full min-h-[520px]">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                      isReal3D
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                        : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isReal3D ? 'Verified Photogrammetry' : 'Curated Heritage Reference'}</span>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-100">{activeScene.name}</h3>
                <div className="text-xs font-serif text-amber-300/80 mt-0.5">
                  {activeScene.odia_name}
                </div>
              </div>

              {/* Quick Meta Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Location</span>
                  </div>
                  <div className="font-medium text-slate-200 truncate">{activeScene.district}</div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Era / Century</span>
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

              {/* Architectural Hotspots Pill List */}
              {activeScene.hotspots && activeScene.hotspots.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Key Architectural Features ({activeScene.hotspots.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {activeScene.hotspots.map((h) => (
                      <div
                        key={h.id}
                        className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 text-xs"
                      >
                        <div className="font-semibold text-slate-200">{h.title}</div>
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
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2 mt-4">
              {onPlanTrip && (
                <button
                  type="button"
                  onClick={() => onPlanTrip(activeScene.name)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/10"
                >
                  <Compass className="w-4 h-4" />
                  <span>Plan Trip Here</span>
                </button>
              )}

              {onExplorePlace && (
                <button
                  type="button"
                  onClick={() => onExplorePlace(activeScene.id, activeScene.name)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
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
