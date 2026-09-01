/**
 * Quality mode controller for Heritage 3D Viewer.
 * Adapts render resolution, shadow maps, and particle densities to device capabilities.
 */

export type QualityPreset = 'AUTO' | 'HIGH' | 'BALANCED' | 'PERFORMANCE';

export interface QualitySettings {
  preset: QualityPreset;
  pixelRatio: number;
  shadowsEnabled: boolean;
  antialias: boolean;
  pointBudget: number;
  textureAnisotropy: number;
  toneMappingExposure: number;
}

export class HeritageQualityController {
  public static getSettings(preset: QualityPreset): QualitySettings {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const deviceDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    switch (preset) {
      case 'HIGH':
        return {
          preset: 'HIGH',
          pixelRatio: Math.min(deviceDpr, 2.0),
          shadowsEnabled: true,
          antialias: true,
          pointBudget: 400000,
          textureAnisotropy: 8,
          toneMappingExposure: 1.15,
        };

      case 'PERFORMANCE':
        return {
          preset: 'PERFORMANCE',
          pixelRatio: 1.0,
          shadowsEnabled: false,
          antialias: false,
          pointBudget: 120000,
          textureAnisotropy: 1,
          toneMappingExposure: 1.0,
        };

      case 'BALANCED':
        return {
          preset: 'BALANCED',
          pixelRatio: Math.min(deviceDpr, 1.5),
          shadowsEnabled: true,
          antialias: true,
          pointBudget: 220000,
          textureAnisotropy: 4,
          toneMappingExposure: 1.1,
        };

      case 'AUTO':
      default:
        if (isMobile) {
          return {
            preset: 'AUTO',
            pixelRatio: 1.0,
            shadowsEnabled: false,
            antialias: true,
            pointBudget: 150000,
            textureAnisotropy: 2,
            toneMappingExposure: 1.05,
          };
        }
        return {
          preset: 'AUTO',
          pixelRatio: Math.min(deviceDpr, 1.75),
          shadowsEnabled: true,
          antialias: true,
          pointBudget: 300000,
          textureAnisotropy: 4,
          toneMappingExposure: 1.1,
        };
    }
  }
}
