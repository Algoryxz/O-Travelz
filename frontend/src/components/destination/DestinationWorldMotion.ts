/**
 * Motion and parallax utilities for Cinematic Destination Worlds.
 * Implements smooth depth translation, slow camera drift, and atmospheric effects.
 */

export interface ParallaxOffset {
  bgX: number;
  bgY: number;
  midX: number;
  midY: number;
  fgX: number;
  fgY: number;
}

export function computeParallaxOffsets(
  mouseXNorm: number, // -1.0 to 1.0
  mouseYNorm: number, // -1.0 to 1.0
  isReducedMotion: boolean = false
): ParallaxOffset {
  if (isReducedMotion) {
    return { bgX: 0, bgY: 0, midX: 0, midY: 0, fgX: 0, fgY: 0 };
  }

  // Background moves subtly (slow depth)
  const bgX = mouseXNorm * -8;
  const bgY = mouseYNorm * -5;

  // Midground moves moderately
  const midX = mouseXNorm * -16;
  const midY = mouseYNorm * -10;

  // Foreground moves more (closest layer)
  const fgX = mouseXNorm * -28;
  const fgY = mouseYNorm * -18;

  return { bgX, bgY, midX, midY, fgX, fgY };
}
