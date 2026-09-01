declare module '@mkkellogg/gaussian-splats-3d' {
  import * as THREE from 'three';

  export interface DropInViewerOptions {
    gpuAcceleratedSort?: boolean;
    sharedMemoryForWorkers?: boolean;
    dynamicScene?: boolean;
    selfDrivenMode?: boolean;
    useBuiltInControls?: boolean;
    ignoreDevicePixelRatio?: boolean;
    halfPrecisionCovariancesOnGPU?: boolean;
    antialiased?: boolean;
    sphericalHarmonicsDegree?: number;
    logLevel?: number;
  }

  export interface SplatSceneOptions {
    splatAlphaRemovalThreshold?: number;
    progressiveLoad?: boolean;
    position?: [number, number, number];
    rotation?: [number, number, number, number];
    scale?: [number, number, number];
    format?: number;
    onProgress?: (percent: number, status: string) => void;
  }

  export class DropInViewer extends THREE.Group {
    constructor(options?: DropInViewerOptions);
    addSplatScene(path: string, options?: SplatSceneOptions): Promise<void>;
    addSplatScenes(scenes: Array<{ path: string } & SplatSceneOptions>): Promise<void>;
    removeSplatScene(index: number): void;
    getSceneCount(): number;
    update(): void;
    dispose(): void;
  }

  export class Viewer {
    constructor(options?: any);
    init(): Promise<void>;
    addSplatScene(path: string, options?: any): Promise<void>;
    start(): void;
    stop(): void;
    dispose(): void;
    update(): void;
  }
}
