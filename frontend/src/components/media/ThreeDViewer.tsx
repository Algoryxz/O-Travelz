/**
 * High-Fidelity 3D Heritage Scene Viewer component for Destination and Modal views.
 * Bridges legacy Model3DContract to authoritative HeritageSceneViewer with 4 canonical monuments.
 */
import React, { useMemo } from 'react';
import type { Model3DContract } from '../../types/api';
import type { HeritageScene } from '../../types/heritage';
import { FALLBACK_HERITAGE_SCENES } from '../../api/heritageApi';
import { HeritageSceneViewer } from '../heritage/HeritageSceneViewer';

interface ThreeDViewerProps {
  model?: Model3DContract | null;
  placeName?: string;
  fallbackImageUrl?: string;
  className?: string;
  autoRotateDefault?: boolean;
  heightClass?: string;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  model,
  placeName = 'Odisha Heritage Site',
  className = '',
  autoRotateDefault = true,
  heightClass = 'h-[420px] md:h-[500px]',
}) => {
  const matchedScene: HeritageScene = useMemo(() => {
    const pName = (placeName || '').toLowerCase();
    const pType = (model?.procedural_type || '').toLowerCase();

    if (pName.includes('konark') || pType.includes('konark')) {
      return FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'konark-sun-temple') || FALLBACK_HERITAGE_SCENES[0];
    }
    if (pName.includes('puri') || pName.includes('jagannath') || pType.includes('jagannath')) {
      return FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'puri-jagannath-temple') || FALLBACK_HERITAGE_SCENES[1];
    }
    if (pName.includes('lingaraj') || pType.includes('lingaraj')) {
      return FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'lingaraj-temple') || FALLBACK_HERITAGE_SCENES[2];
    }
    if (pName.includes('brahmeswara') || pName.includes('bhrameshwar') || pName.includes('brahmeshwar') || pType.includes('brahmeswara') || pType.includes('bhrameshwar')) {
      return FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'brahmeswara-temple') || FALLBACK_HERITAGE_SCENES[3];
    }

    return FALLBACK_HERITAGE_SCENES[0];
  }, [placeName, model]);

  return (
    <HeritageSceneViewer
      scene={matchedScene}
      availableScenes={FALLBACK_HERITAGE_SCENES}
      className={className}
      heightClass={heightClass}
      autoRotateDefault={autoRotateDefault}
    />
  );
};
