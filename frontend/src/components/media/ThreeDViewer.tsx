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

export type Canonical3DSceneId =
  | 'konark-sun-temple'
  | 'puri-jagannath-temple'
  | 'lingaraj-temple'
  | 'brahmeswara-temple';

/**
 * Authoritatively matches a place to one of the 4 supported 3D heritage scenes.
 * Rules:
 * 1. Canonical placeId outranks everything. If placeId is provided and is NOT
 *    one of the 4 canonical IDs, this function returns null (no loose name fallbacks!).
 * 2. Explicit verified Model3DContract procedural_type from backend.
 * 3. Exact canonical name match ONLY when placeId is absent.
 * Substrings or loose words (e.g. "Konark Museum", "Jagannath Museum", "Lingaraj Market")
 * must NEVER match.
 */
export function matchCanonical3DSceneId(
  placeId?: string | null,
  placeName?: string | null,
  model?: Model3DContract | null
): Canonical3DSceneId | null {
  const pId = (placeId || '').toLowerCase().trim();

  // 1. Canonical ID outranks place name
  if (pId) {
    if (pId === 'place_konark_001') return 'konark-sun-temple';
    if (pId === 'place_puri_001') return 'puri-jagannath-temple';
    if (pId === 'place_bbsr_001' || pId === 'place_001') return 'lingaraj-temple';
    if (pId === 'place_bbsr_005' || pId === 'place_019') return 'brahmeswara-temple';
    // If a placeId is specified and it is not one of the 4 monuments, canonical ID outranks:
    return null;
  }

  // 2. Explicit verified model contract procedural_type from backend
  const pType = (model?.procedural_type || '').toLowerCase().trim();
  if (pType === 'konark_wheel') return 'konark-sun-temple';
  if (pType === 'jagannath_temple') return 'puri-jagannath-temple';
  if (pType === 'lingaraj_temple') return 'lingaraj-temple';
  if (pType === 'brahmeswara_temple' || pType === 'brahmeswar_temple') return 'brahmeswara-temple';

  // 3. Exact canonical name match ONLY when placeId is absent
  const rawName = (placeName || '').toLowerCase().trim();
  const normName = rawName.replace(/[,\-–—]+/g, ' ').replace(/\s+/g, ' ').trim();

  const KONARK_EXACT = new Set([
    'konark sun temple',
    'sun temple konark',
    'sun temple',
    'konark surya temple',
    'surya temple konark',
    'କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର',
  ]);
  const PURI_EXACT = new Set([
    'jagannath temple',
    'puri jagannath temple',
    'shree jagannath temple',
    'sri jagannath temple',
    'jagannath temple puri',
    'ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର',
  ]);
  const LINGARAJ_EXACT = new Set([
    'lingaraj temple',
    'shri lingaraj temple',
    'sri lingaraj temple',
    'lingaraja temple',
    'ଶ୍ରୀ ଲିଙ୍ଗରାଜ ମନ୍ଦିର',
  ]);
  const BRAHMESWAR_EXACT = new Set([
    'brahmeswar temple',
    'brahmeswara temple',
    'brahmeshwar temple',
    'bhrameshwar temple',
    'brahmeswara temple complex',
    'ବ୍ରହ୍ମେଶ୍ୱର ମନ୍ଦିର',
  ]);

  if (KONARK_EXACT.has(normName)) return 'konark-sun-temple';
  if (PURI_EXACT.has(normName)) return 'puri-jagannath-temple';
  if (LINGARAJ_EXACT.has(normName)) return 'lingaraj-temple';
  if (BRAHMESWAR_EXACT.has(normName)) return 'brahmeswara-temple';

  return null;
}

export function is3DHeritageAvailable(
  placeId?: string | null,
  placeName?: string | null,
  model?: Model3DContract | null
): boolean {
  return matchCanonical3DSceneId(placeId, placeName, model) !== null;
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
    const sceneId = matchCanonical3DSceneId(placeId, placeName, model);
    if (!sceneId) return null;
    return FALLBACK_HERITAGE_SCENES.find((s) => s.id === sceneId) || null;
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
