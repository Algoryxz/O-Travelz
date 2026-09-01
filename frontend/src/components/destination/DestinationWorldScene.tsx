/**
 * DestinationWorldScene: Multi-layered visual rendering stage with genuine depth,
 * atmospheric lighting, subtle parallax, and zero generic AI slop.
 */
import React, { useState, useEffect } from 'react';
import type { DestinationWorldAsset } from '../../data/destinationWorldAssets';
import type { ParallaxOffset } from './DestinationWorldMotion';

interface DestinationWorldSceneProps {
  world: DestinationWorldAsset;
  parallax: ParallaxOffset;
  isReducedMotion: boolean;
  isActive: boolean;
}

export const DestinationWorldScene: React.FC<DestinationWorldSceneProps> = ({
  world,
  parallax,
  isReducedMotion,
  isActive,
}) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.src = world.poster_url;
    img.onload = () => setImageLoaded(true);
  }, [world.poster_url]);

  const getAmbientAtmosphere = () => {
    switch (world.ambient_lighting) {
      case 'golden_coastal':
        return 'from-amber-950/40 via-transparent to-slate-950/80';
      case 'morning_mist':
        return 'from-sky-950/50 via-slate-900/30 to-slate-950/90';
      case 'sunset_amber':
        return 'from-orange-950/45 via-rose-950/20 to-slate-950/85';
      case 'emerald_canopy':
        return 'from-emerald-950/45 via-slate-900/25 to-slate-950/90';
      case 'ocean_breeze':
      default:
        return 'from-cyan-950/40 via-transparent to-slate-950/85';
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
      {/* 1. Background Layer: Full Photographic Destination Canvas with Depth Scale */}
      <div
        className="absolute -inset-8 transition-transform duration-700 ease-out will-change-transform"
        style={{
          transform: `translate3d(${parallax.bgX}px, ${parallax.bgY}px, 0) scale(${
            isActive && !isReducedMotion ? 1.04 : 1.0
          })`,
          transition: isReducedMotion
            ? 'none'
            : 'transform 8000ms cubic-bezier(0.25, 1, 0.5, 1), opacity 800ms ease-in-out',
        }}
      >
        <img
          src={world.poster_url}
          alt={world.name}
          className={`w-full h-full object-cover object-center transition-opacity duration-1000 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="eager"
        />
      </div>

      {/* 2. Atmospheric Mood & Natural Sun/Mist Lighting Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${getAmbientAtmosphere()} transition-opacity duration-1000`}
      />

      {/* 3. Subtle Horizontal Vignette for Cinematic Portal Framing */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/40" />

      {/* 4. Foreground / Midground Organic Depth Layer */}
      <div
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent transition-transform duration-500 will-change-transform"
        style={{
          transform: `translate3d(${parallax.fgX}px, ${parallax.fgY}px, 0)`,
        }}
      />

      {/* 5. Minimal Environmental Dust / Mist Drifts (Restrained & Purposeful) */}
      {!isReducedMotion && world.category === 'HILL_STATION' && (
        <div className="absolute inset-0 opacity-20 mix-blend-screen bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse duration-1000" />
      )}
    </div>
  );
};
