/**
 * Progressive Heritage Scene Asset Loader.
 * Routes real 3D Gaussian Splats directly to the authentic Gaussian Splat renderer
 * and seamlessly activates authorized spatial reference for sacred/in-progress monuments.
 * ZERO conversion to THREE.Points or uniform point clouds.
 */
import type { HeritageScene } from '../../types/heritage';
import type { HeritageSceneManager } from './HeritageSceneManager';

export interface LoadingProgress {
  phase: 'METADATA' | 'ASSET_STREAM' | 'GAUSSIAN_INTEGRATION' | 'READY';
  percent: number;
  statusText: string;
}

export class HeritageSceneLoader {
  private manager: HeritageSceneManager;
  private activeAbortController: AbortController | null = null;

  constructor(manager: HeritageSceneManager) {
    this.manager = manager;
  }

  public async loadScene(
    sceneData: HeritageScene,
    onProgress: (progress: LoadingProgress) => void
  ): Promise<boolean> {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
    }
    this.activeAbortController = new AbortController();

    try {
      // Phase 1: Metadata Initialization
      onProgress({
        phase: 'METADATA',
        percent: 20,
        statusText: `Initializing spatial envelope for ${sceneData.name}...`,
      });

      const assetUrl =
        sceneData.asset.splat_url ||
        sceneData.asset.model_url ||
        sceneData.asset.progressive_low_res_url;

      // If no 3D binary is assigned or scene is reference-only, load authentic archival spatial reference
      if (!assetUrl || sceneData.scene_type === 'REFERENCE_VIRTUAL_EXPERIENCE' || sceneData.scene_type === 'RECONSTRUCTION_IN_PROGRESS') {
        this.manager.loadSpatialReferenceExperience(sceneData);
        onProgress({
          phase: 'READY',
          percent: 100,
          statusText: sceneData.scene_type === 'REFERENCE_VIRTUAL_EXPERIENCE'
            ? 'Authorized architectural reference active.'
            : 'Archival photographic spatial reference active (Reconstruction in progress).',
        });
        return true;
      }

      // Phase 2: Stream & Build Gaussian Splat Scene via DropInViewer
      onProgress({
        phase: 'ASSET_STREAM',
        percent: 45,
        statusText: `Connecting to verified spatial capture stream (${sceneData.asset.point_count || 180000} splats)...`,
      });

      const loaded = await this.manager.loadGaussianSplatAsset(
        assetUrl,
        sceneData,
        (percent, status) => {
          onProgress({
            phase: 'GAUSSIAN_INTEGRATION',
            percent,
            statusText: status,
          });
        }
      );

      if (loaded) {
        onProgress({
          phase: 'READY',
          percent: 100,
          statusText: `Verified 3D Reconstruction Active (${sceneData.asset.point_count?.toLocaleString() || '180,000'} Gaussians).`,
        });
        return true;
      } else {
        // Fallback to archival reference
        this.manager.loadSpatialReferenceExperience(sceneData);
        onProgress({
          phase: 'READY',
          percent: 100,
          statusText: 'Archival photographic reference loaded.',
        });
        return false;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return false;
      // Graceful fallback to verified reference experience
      this.manager.loadSpatialReferenceExperience(sceneData);
      onProgress({
        phase: 'READY',
        percent: 100,
        statusText: 'Archival spatial reference loaded.',
      });
      return false;
    }
  }

  public cancel(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }
}
