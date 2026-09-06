/**
 * High-Fidelity 3D Heritage Scene Viewer component for Destination and Modal views.
 * Bridges legacy Model3DContract to authoritative HeritageSceneViewer with 4 canonical monuments.
 */
import React, { useMemo } from 'react';
import { Box } from 'lucide-react';
import type { Model3DContract } from '../../types/api';
import type { HeritageScene } from '../../types/heritage';
import { FALLBACK_HERITAGE_SCENES } from '../../api/heritageApi';

const HeritageSceneViewer = React.lazy(() =>
  import('../heritage/HeritageSceneViewer').then((m) => ({ default: m.HeritageSceneViewer }))
);

export function is3DHeritageAvailable(
  placeId?: string | null,
  placeName?: string | null,
  model?: Model3DContract | null
): boolean {
  const pId = (placeId || '').toLowerCase().trim();
  const pName = (placeName || '').toLowerCase().trim();
  const pType = (model?.procedural_type || '').toLowerCase().trim();

  if (pId === 'place_konark_001' || pName.includes('konark') || pType.includes('konark')) return true;
  if (pId === 'place_puri_001' || pName.includes('jagannath') || (pName.includes('puri') && pName.includes('temple')) || pType.includes('jagannath')) return true;
  if (pId === 'place_bbsr_001' || pId === 'place_001' || pName.includes('lingaraj') || pType.includes('lingaraj')) return true;
  if (pId === 'place_bbsr_005' || pId === 'place_019' || pName.includes('brahmeswar') || pName.includes('brahmeshwar') || pName.includes('bhrameshwar') || pType.includes('brahmeswar')) return true;

  return false;
}

interface ThreeDViewerProps {
  placeId?: string;
  placeName?: string;
  model?: Model3DContract | null;
  fallbackImageUrl?: string;
  className?: string;
  autoRotateDefault?: boolean;
  heightClass?: string;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  placeId,
  placeName = 'Odisha Heritage Site',
  model,
  className = '',
  autoRotateDefault = true,
  heightClass = 'h-[420px] md:h-[500px]',
}) => {
  const matchedScene: HeritageScene | null = useMemo(() => {
    const pId = (placeId || '').toLowerCase().trim();
    const pName = (placeName || '').toLowerCase().trim();
    const pType = (model?.procedural_type || '').toLowerCase().trim();

    if (pId === 'place_konark_001' || pName.includes('konark') || pType.includes('konark')) {
      return FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'konark-sun-temple') || null;
    }
    if (pId === 'place_puri_001' || pName.includes('jagannath') || (pName.includes('puri') && pName.includes('temple')) || pType.includes('jagannath')) {
      return FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'puri-jagannath-temple') || null;
    }
    if (pId === 'place_bbsr_001' || pId === 'place_001' || pName.includes('lingaraj') || pType.includes('lingaraj')) {
      return FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'lingaraj-temple') || null;
    }
    if (pId === 'place_bbsr_005' || pId === 'place_019' || pName.includes('brahmeswar') || pName.includes('brahmeshwar') || pName.includes('bhrameshwar') || pType.includes('brahmeswar')) {
      return FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'brahmeswara-temple') || null;
    }

    return null;
  }, [placeId, placeName, model]);

  if (!matchedScene) {
    return (
      <div
        data-testid="threed-unavailable"
        className={`flex flex-col items-center justify-center p-8 bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] text-[#70798B] text-center select-none ${heightClass} ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-[#12161E]/5 flex items-center justify-center mb-3 border border-[#E5DFD5]">
          <Box className="w-6 h-6 text-[#C69214]" />
        </div>
        <h3 className="font-display font-bold text-base text-[#12161E] mb-1">
          3D Reconstruction Unavailable
        </h3>
        <p className="text-xs text-[#70798B] max-w-sm">
          Interactive 3D digital reconstructions are curated specifically for canonical heritage monuments (Konark Sun Temple, Puri Jagannath Temple, Lingaraj Temple, and Brahmeswara Temple).
        </p>
      </div>
    );
  }

  return (
    <React.Suspense
      fallback={
        <div className={`flex flex-col items-center justify-center bg-slate-950/80 rounded-2xl border border-slate-800 text-slate-400 font-mono text-xs ${heightClass} ${className}`}>
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-3" />
          <span>Loading 3D Monument Reconstruction...</span>
        </div>
      }
    >
      <HeritageSceneViewer
        scene={matchedScene}
        availableScenes={[matchedScene]}
        className={className}
        heightClass={heightClass}
        autoRotateDefault={autoRotateDefault}
      />
    </React.Suspense>
  );
};
