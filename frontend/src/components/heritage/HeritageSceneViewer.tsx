/**
 * Museum-Grade Digital Heritage 3D Scene Viewer.
 * Integrates Three.js WebGL rendering, genuine 3D Gaussian Splatting engine,
 * honest reconstruction status badges, dynamic solar presets,
 * interactive architectural hotspots, and verified archival provenance.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Sun,
  Sunset,
  Flame,
  Moon,
  RotateCcw,
  Maximize2,
  Minimize2,
  Info,
  ShieldCheck,
  Play,
  Pause,
  Clock,
  ExternalLink,
} from 'lucide-react';
import type { HeritageScene, HeritageHotspot } from '../../types/heritage';
import { HeritageSceneManager, type LightingPreset } from './HeritageSceneManager';
import { HeritageCameraController } from './HeritageCameraController';
import { HeritageSceneLoader, type LoadingProgress } from './HeritageSceneLoader';
import { HeritageQualityController, type QualityPreset } from './HeritageQualityController';
import { HeritageHotspots } from './HeritageHotspots';

interface HeritageSceneViewerProps {
  scene: HeritageScene;
  availableScenes?: HeritageScene[];
  onSelectScene?: (sceneId: string) => void;
  className?: string;
  heightClass?: string;
  autoRotateDefault?: boolean;
}

export const HeritageSceneViewer: React.FC<HeritageSceneViewerProps> = ({
  scene,
  availableScenes = [],
  onSelectScene,
  className = '',
  heightClass = 'h-[500px] md:h-[620px]',
  autoRotateDefault = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [lighting, setLighting] = useState<LightingPreset>(
    (scene.lighting_preset as LightingPreset) || 'golden_hour'
  );
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>('AUTO');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(autoRotateDefault);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedHotspot, setSelectedHotspot] = useState<HeritageHotspot | null>(null);
  const [showProvenanceDrawer, setShowProvenanceDrawer] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    phase: 'METADATA',
    percent: 10,
    statusText: 'Initializing...',
  });
  const [isReady, setIsReady] = useState<boolean>(false);
  const [activeCamera, setActiveCamera] = useState<THREE.PerspectiveCamera | null>(null);

  // References for Three.js lifecycle
  const sceneManagerRef = useRef<HeritageSceneManager | null>(null);
  const cameraControllerRef = useRef<HeritageCameraController | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize WebGL Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    setActiveCamera(camera);

    // 2. Renderer
    const quality = HeritageQualityController.getSettings(qualityPreset);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: quality.antialias,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(quality.pixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = quality.toneMappingExposure;
    renderer.shadowMap.enabled = quality.shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 3. Scene Manager
    const sceneManager = new HeritageSceneManager();
    sceneManagerRef.current = sceneManager;
    sceneManager.setLighting(lighting);
    sceneManager.applyQuality(quality);

    // 4. Camera Controller
    const cameraController = new HeritageCameraController(camera, containerRef.current);
    cameraControllerRef.current = cameraController;
    cameraController.applyPreset(scene.camera_preset);
    cameraController.autoRotate = isAutoRotating;

    // 5. Load Scene
    const loader = new HeritageSceneLoader(sceneManager);
    setIsReady(false);
    loader.loadScene(scene, (progress) => {
      setLoadingProgress(progress);
      if (progress.percent === 100) {
        setIsReady(true);
      }
    });

    // 6. Render Loop with Gaussian Splat update
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      cameraController.update(delta);
      sceneManager.update(delta);
      renderer.render(sceneManager.scene, camera);

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // 7. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      cameraController.dispose();
      sceneManager.dispose();
      renderer.dispose();
    };
  }, []);

  // Update scene when monument changes
  useEffect(() => {
    if (!sceneManagerRef.current || !cameraControllerRef.current) return;

    setSelectedHotspot(null);
    setIsReady(false);

    cameraControllerRef.current.applyPreset(scene.camera_preset);
    const loader = new HeritageSceneLoader(sceneManagerRef.current);
    loader.loadScene(scene, (progress) => {
      setLoadingProgress(progress);
      if (progress.percent === 100) {
        setIsReady(true);
      }
    });
  }, [scene.id]);

  // Lighting change
  const handleLightingChange = useCallback((preset: LightingPreset) => {
    setLighting(preset);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setLighting(preset);
    }
  }, []);

  // Auto rotate toggle
  const handleAutoRotateToggle = useCallback(() => {
    const next = !isAutoRotating;
    setIsAutoRotating(next);
    if (cameraControllerRef.current) {
      cameraControllerRef.current.autoRotate = next;
    }
  }, [isAutoRotating]);

  // Camera Reset
  const handleCameraReset = useCallback(() => {
    if (cameraControllerRef.current) {
      cameraControllerRef.current.applyPreset(scene.camera_preset);
      setSelectedHotspot(null);
    }
  }, [scene.camera_preset]);

  // Hotspot selection
  const handleSelectHotspot = useCallback((hotspot: HeritageHotspot) => {
    setSelectedHotspot(hotspot);
    if (cameraControllerRef.current) {
      cameraControllerRef.current.focusOnHotspot(hotspot.position, hotspot.camera_offset);
    }
  }, []);

  // Fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const getStatusBadge = () => {
    switch (scene.scene_type) {
      case 'REAL_3D_RECONSTRUCTION':
        return {
          label: 'REAL 3D RECONSTRUCTION',
          sub: 'Source-backed spatial capture',
          badgeClass: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
        };
      case 'REFERENCE_VIRTUAL_EXPERIENCE':
        return {
          label: 'VERIFIED VISUAL REFERENCE',
          sub: 'Authorized External Reference',
          badgeClass: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300',
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
        };
      case 'RECONSTRUCTION_IN_PROGRESS':
      default:
        return {
          label: '3D RECONSTRUCTION IN PROGRESS',
          sub: 'Archival Reference Active',
          badgeClass: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl group select-none ${heightClass} ${className}`}
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Interactive 3D Hotspots Overlay */}
      <HeritageHotspots
        hotspots={scene.hotspots}
        camera={activeCamera}
        containerRef={containerRef}
        selectedHotspot={selectedHotspot}
        onSelectHotspot={handleSelectHotspot}
        onCloseHotspot={() => setSelectedHotspot(null)}
      />

      {/* Top Left: Monument Identity & Audited State Pill */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 max-w-[70%] md:max-w-md pointer-events-auto">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border ${statusBadge.badgeClass}`}
          >
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
          </span>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900/80 text-slate-300 border border-slate-700/60 backdrop-blur-sm">
            {scene.century.split('(')[0].trim()}
          </span>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md rounded-xl p-2.5 border border-slate-800">
          <h3 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>{scene.name}</span>
            <span className="text-xs font-serif text-amber-400/80 font-normal">
              {scene.odia_name}
            </span>
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1">{scene.district} · {scene.category}</p>
        </div>
      </div>

      {/* Top Right: Monument Switcher (If available) */}
      {availableScenes.length > 1 && onSelectScene && (
        <div className="absolute top-4 right-4 z-20 pointer-events-auto">
          <select
            value={scene.id}
            onChange={(e) => onSelectScene(e.target.value)}
            className="bg-slate-900/90 text-amber-300 text-xs font-semibold px-3 py-2 rounded-xl border border-amber-500/30 backdrop-blur-md shadow-lg outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
          >
            {availableScenes.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                {s.name} ({s.scene_type === 'REFERENCE_VIRTUAL_EXPERIENCE' ? 'Ref' : 'In Progress'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bottom Center / Right: Interactive Controls Strip */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 flex-wrap pointer-events-auto">
        {/* Lighting Selector */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-xl p-1 shadow-lg">
          <button
            type="button"
            onClick={() => handleLightingChange('golden_hour')}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              lighting === 'golden_hour'
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Golden Hour Lighting"
          >
            <Sunset className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleLightingChange('daylight')}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              lighting === 'daylight'
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Daylight Sun"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleLightingChange('temple_glow')}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              lighting === 'temple_glow'
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Temple Diya Glow"
          >
            <Flame className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleLightingChange('twilight')}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              lighting === 'twilight'
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Moonlit Twilight"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Rotation Toggle */}
        <button
          type="button"
          onClick={handleAutoRotateToggle}
          className={`p-2 rounded-xl backdrop-blur-md border shadow-lg transition-colors cursor-pointer ${
            isAutoRotating
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
          title={isAutoRotating ? 'Pause Auto-Rotation' : 'Start Auto-Rotation'}
        >
          {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Reset Camera */}
        <button
          type="button"
          onClick={handleCameraReset}
          className="p-2 rounded-xl bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800 backdrop-blur-md shadow-lg transition-colors cursor-pointer"
          title="Reset Viewpoint"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Provenance & Sources Drawer Toggle */}
        <button
          type="button"
          onClick={() => setShowProvenanceDrawer((v) => !v)}
          className={`p-2 rounded-xl backdrop-blur-md border shadow-lg transition-colors cursor-pointer ${
            showProvenanceDrawer
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
              : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
          title="View Archival Sources & Provenance"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={handleFullscreenToggle}
          className="p-2 rounded-xl bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800 backdrop-blur-md shadow-lg transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Provenance & Sources Drawer */}
      {showProvenanceDrawer && (
        <div
          className="absolute inset-y-0 right-0 w-full sm:w-96 bg-slate-950/95 border-l border-amber-500/30 backdrop-blur-2xl p-6 overflow-y-auto z-40 animate-in slide-in-from-right duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-100">Heritage Provenance</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowProvenanceDrawer(false)}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                Spatial Reference Status
              </span>
              <p className="text-slate-300 mt-1 leading-relaxed">
                {scene.reconstruction_notes}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                Asset Specification
              </span>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Format</div>
                  <div className="text-slate-200 font-mono text-[11px] truncate">
                    {scene.asset.format}
                  </div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Quality Mode</div>
                  <div className="text-slate-200 font-mono text-[11px] truncate">
                    {scene.asset.mesh_quality}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                Archival Data Sources & Licenses
              </span>
              <div className="space-y-2 mt-2">
                {scene.sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1"
                  >
                    <div className="font-semibold text-slate-200">{src.title}</div>
                    <div className="text-slate-400 text-[11px]">{src.source}</div>
                    <div className="text-emerald-400 text-[10px] font-mono">{src.license}</div>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:underline pt-1"
                      >
                        <span>Official Archive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progressive Loading Progress Banner */}
      {!isReady && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin mb-4" />
          <div className="text-sm font-bold text-slate-100 mb-1">
            Loading Spatial Experience
          </div>
          <div className="text-xs text-amber-300 font-mono mb-3">
            {loadingProgress.statusText}
          </div>
          <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
              style={{ width: `${loadingProgress.percent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
