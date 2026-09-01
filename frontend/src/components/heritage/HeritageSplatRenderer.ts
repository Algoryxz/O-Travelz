/**
 * Authentic Three.js 3D Gaussian Splatting Engine.
 * Powered by @mkkellogg/gaussian-splats-3d DropInViewer.
 * Preserves covariance matrices, 3D rotations, scales, spherical harmonics/color,
 * screen-space 2D Gaussian projection, and back-to-front depth sorting.
 * ZERO conversion to THREE.Points or uniform point clouds.
 */
import * as THREE from 'three';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

export interface SplatRenderOptions {
  splatAlphaRemovalThreshold?: number;
  progressiveLoad?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number, number];
  scale?: [number, number, number];
  onProgress?: (percent: number, status: string) => void;
}

export class HeritageSplatRenderer {
  private dropInViewer: GaussianSplats3D.DropInViewer | null = null;
  private parentGroup: THREE.Group | null = null;
  private isLoaded = false;

  /**
   * Initializes and attaches the real Gaussian Splats DropInViewer into a Three.js group.
   */
  public async loadSplatScene(
    assetUrl: string,
    parentGroup: THREE.Group,
    options: SplatRenderOptions = {}
  ): Promise<boolean> {
    this.dispose();
    this.parentGroup = parentGroup;

    try {
      if (typeof window === 'undefined') {
        return false;
      }

      // Initialize DropInViewer with WebGL / Worker configuration
      const viewer = new GaussianSplats3D.DropInViewer({
        gpuAcceleratedSort: false,
        sharedMemoryForWorkers: false,
        dynamicScene: false,
        selfDrivenMode: false,
        useBuiltInControls: false,
        ignoreDevicePixelRatio: false,
        antialiased: true,
      });

      this.dropInViewer = viewer;
      this.parentGroup.add(viewer);

      if (options.onProgress) {
        options.onProgress(30, 'Streaming 3D Gaussian Splatting parameters...');
      }

      await viewer.addSplatScene(assetUrl, {
        splatAlphaRemovalThreshold: options.splatAlphaRemovalThreshold ?? 5,
        progressiveLoad: options.progressiveLoad ?? false,
        position: options.position ?? [0, 0, 0],
        rotation: options.rotation ?? [0, 0, 0, 1],
        scale: options.scale ?? [1, 1, 1],
        onProgress: (percent: number, status: string) => {
          if (options.onProgress) {
            options.onProgress(Math.min(95, Math.max(30, percent)), status);
          }
        },
      });

      this.isLoaded = true;
      if (options.onProgress) {
        options.onProgress(100, '3D Gaussian Splat scene active');
      }
      return true;
    } catch (err) {
      console.warn('[HeritageSplatRenderer] Gaussian splat load failed, falling back to archival reference:', err);
      this.dispose();
      return false;
    }
  }

  /**
   * Updates camera-dependent depth sorting and Gaussian transforms in the animation loop.
   */
  public update(): void {
    if (this.dropInViewer && this.isLoaded) {
      try {
        this.dropInViewer.update();
      } catch {
        // Suppress frame update errors if scene is transitioning
      }
    }
  }

  public getViewer(): GaussianSplats3D.DropInViewer | null {
    return this.dropInViewer;
  }

  public isSceneLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Releases GPU buffers, workers, and scene references.
   */
  public dispose(): void {
    if (this.dropInViewer) {
      if (this.parentGroup) {
        this.parentGroup.remove(this.dropInViewer);
      }
      try {
        this.dropInViewer.dispose();
      } catch {
        // Safe disposal
      }
      this.dropInViewer = null;
    }
    this.parentGroup = null;
    this.isLoaded = false;
  }
}
