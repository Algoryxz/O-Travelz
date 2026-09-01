import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  RotateCcw,
  Sun,
  Sunset,
  Flame,
  Moon,
  Maximize2,
  Minimize2,
  Sparkles,
  Info,
  Layers,
  Play,
  Pause,
  Compass,
  AlertCircle,
} from "lucide-react";
import type { Model3DContract, HotspotAnnotation } from "../../types/api";

export type LightingPreset = "daylight" | "golden_hour" | "temple_glow" | "moonlit_night";

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
  placeName = "Odisha Heritage Site",
  fallbackImageUrl,
  className = "",
  autoRotateDefault = true,
  heightClass = "h-[420px] md:h-[500px]",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [lighting, setLighting] = useState<LightingPreset>(
    (model?.recommended_lighting as LightingPreset) || "golden_hour"
  );
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(autoRotateDefault);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotAnnotation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [webglError, setWebglError] = useState<string | null>(null);

  // References for Three.js lifecycle
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Orbit state
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({ radius: 5.0, theta: 0.8, phi: 1.2 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0.8, 0));

  // Determine subject type
  const subjectType = model?.procedural_type || "konark_wheel";

  // Build Procedural Heritage 3D Models
  const buildHeritageModel = useCallback(
    (type: string, wireframe: boolean): THREE.Group => {
      const group = new THREE.Group();

      // Stone & architectural materials with warm Odisha tones
      const sandstoneMat = new THREE.MeshStandardMaterial({
        color: 0xc49a6c,
        roughness: 0.85,
        metalness: 0.05,
        wireframe,
      });

      const darkLateriteMat = new THREE.MeshStandardMaterial({
        color: 0x8b5a2b,
        roughness: 0.9,
        metalness: 0.05,
        wireframe,
      });

      const goldenOrnamentMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.35,
        metalness: 0.7,
        wireframe,
      });

      const whiteMarbleMat = new THREE.MeshStandardMaterial({
        color: 0xf5f5f0,
        roughness: 0.4,
        metalness: 0.05,
        wireframe,
      });

      const waterLagoonMat = new THREE.MeshStandardMaterial({
        color: 0x207890,
        roughness: 0.2,
        metalness: 0.3,
        transparent: true,
        opacity: 0.85,
        wireframe,
      });

      const woodBoatMat = new THREE.MeshStandardMaterial({
        color: 0x6e472a,
        roughness: 0.75,
        metalness: 0.1,
        wireframe,
      });

      const flagRedMat = new THREE.MeshStandardMaterial({
        color: 0xd9381e,
        roughness: 0.5,
        metalness: 0.1,
        wireframe,
      });

      if (type === "konark_wheel") {
        // --- KONARK SUN TEMPLE SURYA CHAKRA (24 Spokes + Vimana) ---
        // 1. Base Plinth Platform
        const plinthGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.4, 32);
        const plinth = new THREE.Mesh(plinthGeo, darkLateriteMat);
        plinth.position.y = -0.2;
        plinth.receiveShadow = true;
        group.add(plinth);

        // 2. Outer Rim with relief beadings
        const rimGeo = new THREE.TorusGeometry(1.6, 0.14, 16, 48);
        const rim = new THREE.Mesh(rimGeo, sandstoneMat);
        rim.position.y = 1.6;
        rim.castShadow = true;
        group.add(rim);

        const innerRimGeo = new THREE.TorusGeometry(1.35, 0.06, 16, 48);
        const innerRim = new THREE.Mesh(innerRimGeo, goldenOrnamentMat);
        innerRim.position.y = 1.6;
        group.add(innerRim);

        // 3. Central Hub & Axle Pin
        const hubGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 24);
        hubGeo.rotateX(Math.PI / 2);
        const hub = new THREE.Mesh(hubGeo, goldenOrnamentMat);
        hub.position.y = 1.6;
        hub.castShadow = true;
        group.add(hub);

        const axlePinGeo = new THREE.SphereGeometry(0.18, 16, 16);
        const axlePinMesh = new THREE.Mesh(axlePinGeo, goldenOrnamentMat);
        axlePinMesh.position.set(0, 1.6, 0.18);
        group.add(axlePinMesh);

        // 4. 24 Astronomical Spokes (8 Major carved + 16 Minor)
        for (let i = 0; i < 24; i++) {
          const angle = (i * Math.PI * 2) / 24;
          const isMajor = i % 3 === 0;

          const spokeLength = 1.25;
          const spokeGeo = new THREE.CylinderGeometry(
            isMajor ? 0.055 : 0.025,
            isMajor ? 0.075 : 0.035,
            spokeLength,
            8
          );
          const spoke = new THREE.Mesh(spokeGeo, isMajor ? goldenOrnamentMat : sandstoneMat);

          spoke.position.set(
            Math.sin(angle) * (spokeLength / 2 + 0.3),
            1.6 + Math.cos(angle) * (spokeLength / 2 + 0.3),
            0
          );
          spoke.rotation.z = -angle;
          spoke.castShadow = true;
          group.add(spoke);

          // Medallion on major spokes (Sundial Hour Markers)
          if (isMajor) {
            const medalGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
            medalGeo.rotateX(Math.PI / 2);
            const medal = new THREE.Mesh(medalGeo, sandstoneMat);
            medal.position.set(Math.sin(angle) * 0.95, 1.6 + Math.cos(angle) * 0.95, 0);
            group.add(medal);
          }
        }

        // 5. Background Sanctuary Vimana Tower
        const vimanaBaseGeo = new THREE.BoxGeometry(1.6, 1.8, 1.6);
        const vimanaBase = new THREE.Mesh(vimanaBaseGeo, darkLateriteMat);
        vimanaBase.position.set(0, 0.9, -1.2);
        group.add(vimanaBase);

        const spireGeo = new THREE.ConeGeometry(1.2, 2.2, 4);
        spireGeo.rotateY(Math.PI / 4);
        const spire = new THREE.Mesh(spireGeo, sandstoneMat);
        spire.position.set(0, 2.9, -1.2);
        spire.castShadow = true;
        group.add(spire);

        const amalakaGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 16);
        const amalaka = new THREE.Mesh(amalakaGeo, goldenOrnamentMat);
        amalaka.position.set(0, 4.05, -1.2);
        group.add(amalaka);
      } else if (type === "jagannath_temple") {
        // --- PURI JAGANNATH SACRED SHIKHARA ---
        // 1. Massive Plinth (Meghanada Pacheri)
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 3.6), darkLateriteMat);
        plinth.position.y = -0.2;
        group.add(plinth);

        // 2. Sanctum Deula Tower Base (Bada)
        const bada = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.6, 2.0), sandstoneMat);
        bada.position.y = 0.8;
        bada.castShadow = true;
        group.add(bada);

        // 3. Rekha Deula Curvilinear Spire (Gandi)
        const gandiGeo = new THREE.CylinderGeometry(0.8, 1.8, 2.8, 8);
        const gandi = new THREE.Mesh(gandiGeo, sandstoneMat);
        gandi.position.y = 3.0;
        gandi.castShadow = true;
        group.add(gandi);

        // 4. Amalaka Stone Disk
        const amalaka = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.35, 24), darkLateriteMat);
        amalaka.position.y = 4.55;
        group.add(amalaka);

        // 5. Kalasha Pot & Nilachakra (Golden Wheel)
        const kalasha = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), goldenOrnamentMat);
        kalasha.position.y = 4.95;
        group.add(kalasha);

        const nilachakra = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 8, 16), goldenOrnamentMat);
        nilachakra.position.set(0, 5.35, 0);
        group.add(nilachakra);

        // 6. Fluttering Patitapabana Flag
        const flagStaff = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8), goldenOrnamentMat);
        flagStaff.position.set(0, 5.65, 0);
        group.add(flagStaff);

        const flagGeo = new THREE.BufferGeometry();
        const flagVertices = new Float32Array([
          0, 5.9, 0,
          0.6, 5.75, 0.1,
          0, 5.5, 0,
        ]);
        flagGeo.setAttribute("position", new THREE.BufferAttribute(flagVertices, 3));
        flagGeo.computeVertexNormals();
        const flag = new THREE.Mesh(flagGeo, flagRedMat);
        group.add(flag);

        // 7. Attached Jagamohana Pyramidal Hall
        const jaga = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.8, 4), sandstoneMat);
        jaga.rotateY(Math.PI / 4);
        jaga.position.set(0, 1.1, 1.4);
        jaga.castShadow = true;
        group.add(jaga);
      } else if (type === "dhauli_stupa") {
        // --- DHAULI SHANTI STUPA (Peace Pagoda) ---
        // 1. Circular Rock Terrace
        const terrace1 = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.0, 0.3, 32), darkLateriteMat);
        terrace1.position.y = -0.15;
        group.add(terrace1);

        const terrace2 = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.35, 32), whiteMarbleMat);
        terrace2.position.y = 0.18;
        group.add(terrace2);

        // 2. Pure White Hemispherical Anda Dome
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(1.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
          whiteMarbleMat
        );
        dome.position.y = 0.35;
        dome.castShadow = true;
        group.add(dome);

        // 3. Square Harmika Balustrade
        const harmika = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), whiteMarbleMat);
        harmika.position.y = 2.15;
        group.add(harmika);

        // 4. Tiered Chhatra Spire (Buddhism Umbrellas)
        for (let i = 0; i < 4; i++) {
          const chhatra = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1 + i * 0.08, 0.35 - i * 0.06, 0.1, 16),
            goldenOrnamentMat
          );
          chhatra.position.y = 2.45 + i * 0.22;
          group.add(chhatra);
        }

        // 5. Ashokan Rock Elephant Sculpture
        const elephant = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.9), darkLateriteMat);
        elephant.position.set(0, 0.3, 1.9);
        group.add(elephant);
      } else if (type === "barabati_fort") {
        // --- BARABATI FORT GATEWAY & RAMPARTS ---
        // 1. Moat Water Base
        const moat = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.2, 0.2, 32), waterLagoonMat);
        moat.position.y = -0.2;
        group.add(moat);

        // 2. Gateway Flanking Bastions
        const towerLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 2.2, 16), darkLateriteMat);
        towerLeft.position.set(-1.2, 0.9, 0);
        towerLeft.castShadow = true;
        group.add(towerLeft);

        const towerRight = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 2.2, 16), darkLateriteMat);
        towerRight.position.set(1.2, 0.9, 0);
        towerRight.castShadow = true;
        group.add(towerRight);

        // 3. Central Arched Portal Rampart
        const portalWall = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.0, 0.6), sandstoneMat);
        portalWall.position.set(0, 1.0, 0);
        group.add(portalWall);

        const archPillars = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.7), darkLateriteMat);
        archPillars.position.set(0, 0.6, 0);
        group.add(archPillars);

        // 4. Battlements / Merlons atop
        for (let i = -3; i <= 3; i++) {
          const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.2), sandstoneMat);
          merlon.position.set(i * 0.45, 2.15, 0);
          group.add(merlon);
        }
      } else if (type === "mukteshwar_torana") {
        // --- MUKTESHWAR TORANA (Gem of Kalinga Architecture) ---
        // 1. Ornate Step Plinth
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.3, 2.2), darkLateriteMat);
        plinth.position.y = -0.15;
        group.add(plinth);

        // 2. Dual Classical Torana Columns
        const colLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.0, 16), sandstoneMat);
        colLeft.position.set(-0.9, 0.9, 0);
        colLeft.castShadow = true;
        group.add(colLeft);

        const colRight = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.0, 16), sandstoneMat);
        colRight.position.set(0.9, 0.9, 0);
        colRight.castShadow = true;
        group.add(colRight);

        // 3. Famous Semicircular Carved Torana Archway
        const toranaArch = new THREE.Mesh(
          new THREE.TorusGeometry(0.9, 0.15, 16, 32, Math.PI),
          goldenOrnamentMat
        );
        toranaArch.position.set(0, 1.9, 0);
        toranaArch.castShadow = true;
        group.add(toranaArch);

        // 4. Lotus Makara Finials
        const finialL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), goldenOrnamentMat);
        finialL.position.set(-0.9, 1.9, 0);
        group.add(finialL);

        const finialR = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), goldenOrnamentMat);
        finialR.position.set(0.9, 1.9, 0);
        group.add(finialR);

        // 5. Background Rekha Temple
        const bgTemple = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.4, 4), sandstoneMat);
        bgTemple.rotateY(Math.PI / 4);
        bgTemple.position.set(0, 1.2, -1.4);
        group.add(bgTemple);
      } else {
        // --- CHILIKA TRADITIONAL WOODEN COUNTRY BOAT ---
        // 1. Water Ripple Disc
        const water = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.15, 32), waterLagoonMat);
        water.position.y = -0.1;
        group.add(water);

        // 2. Wooden Boat Hull
        const hullGeo = new THREE.CylinderGeometry(0.4, 0.7, 2.8, 8);
        hullGeo.rotateZ(Math.PI / 2);
        const hull = new THREE.Mesh(hullGeo, woodBoatMat);
        hull.position.set(0, 0.2, 0);
        hull.castShadow = true;
        group.add(hull);

        // 3. Bamboo Thatched Canopy
        const canopy = new THREE.Mesh(
          new THREE.CylinderGeometry(0.55, 0.55, 1.2, 8, 1, false, 0, Math.PI),
          sandstoneMat
        );
        canopy.rotateZ(Math.PI / 2);
        canopy.position.set(0, 0.55, 0);
        group.add(canopy);

        // 4. Oar / Steering Pole
        const oar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 8), woodBoatMat);
        oar.rotateX(Math.PI / 4);
        oar.position.set(0.6, 0.3, 0.8);
        group.add(oar);
      }

      return group;
    },
    []
  );

  // Configure Scene Lights according to Lighting Preset
  const updateLighting = useCallback((preset: LightingPreset) => {
    if (!lightsGroupRef.current) return;
    const group = lightsGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (preset === "golden_hour") {
      // Warm Odisha sunset glow
      const ambient = new THREE.AmbientLight(0x4a3220, 1.8);
      const sun = new THREE.DirectionalLight(0xffaa44, 3.2);
      sun.position.set(6, 4, 5);
      sun.castShadow = true;

      const fill = new THREE.DirectionalLight(0xff6633, 1.4);
      fill.position.set(-5, 2, -3);

      group.add(ambient, sun, fill);
    } else if (preset === "temple_glow") {
      // Sacred diya / lamp sanctum illumination
      const ambient = new THREE.AmbientLight(0x331a00, 2.0);
      const lamp = new THREE.PointLight(0xff8800, 4.5, 15);
      lamp.position.set(0, 2.5, 3);
      lamp.castShadow = true;

      const diyaR = new THREE.PointLight(0xffaa22, 2.5, 10);
      diyaR.position.set(3, 1, -2);

      group.add(ambient, lamp, diyaR);
    } else if (preset === "moonlit_night") {
      // Cool silver Odisha coast moonlight
      const ambient = new THREE.AmbientLight(0x0c1b2a, 2.0);
      const moon = new THREE.DirectionalLight(0xb0d4e3, 2.2);
      moon.position.set(-5, 7, 4);
      moon.castShadow = true;

      const rim = new THREE.DirectionalLight(0x4a7c99, 1.0);
      rim.position.set(4, 1, -4);

      group.add(ambient, moon, rim);
    } else {
      // Daylight tropical sun
      const ambient = new THREE.AmbientLight(0xe8e8e0, 1.6);
      const sun = new THREE.DirectionalLight(0xffffff, 2.8);
      sun.position.set(5, 8, 5);
      sun.castShadow = true;

      const sky = new THREE.HemisphereLight(0x87ceeb, 0x555544, 1.0);
      group.add(ambient, sun, sky);
    }
  }, []);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      rendererRef.current = renderer;
    } catch (err) {
      setWebglError("WebGL is not supported or disabled on this device.");
      setIsLoading(false);
      return;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const initCamPos = model?.initial_camera_position || [0.0, 1.8, 5.0];
    camera.position.set(initCamPos[0], initCamPos[1], initCamPos[2]);
    camera.lookAt(cameraTargetRef.current);
    cameraRef.current = camera;

    // Lights
    const lightsGroup = new THREE.Group();
    lightsGroupRef.current = lightsGroup;
    scene.add(lightsGroup);
    updateLighting(lighting);

    // Build Model
    const modelGroup = buildHeritageModel(subjectType, isWireframe);
    const scale = model?.scale_factor || 1.0;
    modelGroup.scale.set(scale, scale, scale);
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // Grid Floor
    const grid = new THREE.GridHelper(8, 16, 0xb87b22, 0x444444);
    grid.position.y = -0.22;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.15;
    scene.add(grid);

    setIsLoading(false);

    // Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (isAutoRotating && modelGroupRef.current && !isDraggingRef.current) {
        modelGroupRef.current.rotation.y += 0.005;
      }

      if (cameraRef.current) {
        // Orbit camera update
        const { radius, theta, phi } = cameraSphericalRef.current;
        const x = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.cos(theta);

        cameraRef.current.position.set(
          cameraTargetRef.current.x + x,
          cameraTargetRef.current.y + y,
          cameraTargetRef.current.z + z
        );
        cameraRef.current.lookAt(cameraTargetRef.current);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Resize Observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [buildHeritageModel, isWireframe, lighting, model, subjectType, updateLighting]);

  // Update lighting when preset changes
  useEffect(() => {
    updateLighting(lighting);
  }, [lighting, updateLighting]);

  // Handle Mouse / Touch Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.button === 2) {
      isRightDraggingRef.current = true;
    } else {
      isDraggingRef.current = true;
    }
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current) {
      cameraSphericalRef.current.theta -= deltaX * 0.008;
      cameraSphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 + 0.3, cameraSphericalRef.current.phi - deltaY * 0.008)
      );
    } else if (isRightDraggingRef.current) {
      cameraTargetRef.current.y += deltaY * 0.005;
      cameraTargetRef.current.x -= deltaX * 0.005;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isRightDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraSphericalRef.current.radius = Math.max(
      2.0,
      Math.min(12.0, cameraSphericalRef.current.radius + e.deltaY * 0.004)
    );
  };

  const resetCamera = () => {
    cameraSphericalRef.current = { radius: 5.0, theta: 0.8, phi: 1.2 };
    cameraTargetRef.current = new THREE.Vector3(0, 0.8, 0);
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.y = 0;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (webglError) {
    return (
      <div className={`relative w-full ${heightClass} bg-[#12161E] rounded-2xl flex flex-col items-center justify-center p-6 text-center text-white border border-[#E5DFD5]/20 ${className}`}>
        {fallbackImageUrl && (
          <img
            src={fallbackImageUrl}
            alt={placeName}
            className="absolute inset-0 w-full h-full object-cover opacity-30 rounded-2xl"
          />
        )}
        <div className="relative z-10 max-w-md space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#B87B22]/20 text-[#B87B22] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="font-display font-bold text-lg">{placeName}</h4>
          <p className="text-xs text-[#E5DFD5] leading-relaxed">
            {webglError} Showing verified high-resolution photograph instead.
          </p>
          <button
            onClick={() => setWebglError(null)}
            className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A472C] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Retry 3D Viewer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${heightClass} bg-gradient-to-b from-[#161B26] via-[#12161E] to-[#0A0D14] rounded-2xl overflow-hidden select-none border border-white/10 shadow-2xl ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#12161E]/90 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-30">
          <div className="w-10 h-10 border-3 border-[#B87B22] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-[#E5DFD5] tracking-wider uppercase">
            Initializing 3D Kalinga Geometry...
          </p>
        </div>
      )}

      {/* Top Bar: Subject Badge, Transparency Label, Fullscreen */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3 pointer-events-none z-20">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#0D5C3A]/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-semibold border border-white/20 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#C69214]" />
            <span>{model?.badge_label || "3D Heritage Model"}</span>
          </div>

          {/* Transparency Disclaimer Pill */}
          <div
            className="group relative inline-flex items-center gap-1 bg-black/50 text-[#E5DFD5] backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-body border border-white/10 cursor-help"
            title={model?.transparency_notice || "AI-generated impression — not a survey-accurate scan."}
          >
            <Info className="w-3 h-3 text-[#C69214]" />
            <span className="hidden sm:inline truncate max-w-[200px]">
              AI impression
            </span>
            <div className="absolute left-0 top-8 w-64 bg-[#12161E] border border-white/20 text-white text-[11px] p-2.5 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {model?.transparency_notice ||
                "AI-generated architectural impression — not a survey-accurate archaeological scan."}
            </div>
          </div>
        </div>

        {/* Right Top Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={resetCamera}
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all shadow-md cursor-pointer"
            title="Reset Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all shadow-md cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Hotspots / Architectural Annotation Overlays */}
      {model?.annotations && model.annotations.length > 0 && (\n        <div className="absolute top-16 left-4 max-w-xs space-y-1.5 pointer-events-auto z-20 hidden md:block">\n          <div className="text-[10px] font-mono text-[#C69214] uppercase tracking-widest font-semibold flex items-center gap-1">\n            <Compass className="w-3 h-3" />\n            <span>Interactive Hotspots</span>\n          </div>\n          <div className="flex flex-col gap-1.5">\n            {model.annotations.map((ann, idx) => (\n              <button\n                key={idx}\n                onClick={() =>\n                  setSelectedHotspot((prev) => (prev?.label === ann.label ? null : ann))\n                }\n                className={`text-left p-2 rounded-xl text-xs backdrop-blur-md border transition-all cursor-pointer ${\n                  selectedHotspot?.label === ann.label\n                    ? "bg-[#0D5C3A] text-white border-white/40 shadow-lg scale-[1.02]"\n                    : "bg-black/50 text-[#E5DFD5] hover:bg-black/70 border-white/15"\n                }`}\n              >\n                <div className="font-semibold">{ann.label}</div>\n                {selectedHotspot?.label === ann.label && (\n                  <p className="text-[11px] text-[#E5DFD5] mt-1 leading-tight font-light">\n                    {ann.description}\n                  </p>\n                )}\n              </button>\n            ))}\n          </div>\n        </div>\n      )}\n\n      {/* Bottom Controls Bar: Lighting Presets & Toggles */}\n      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2.5 z-20">\n        {/* Lighting Selector */}\n        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-xl border border-white/20 p-1 rounded-2xl shadow-xl">\n          <button\n            onClick={() => setLighting("golden_hour")}\n            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${\n              lighting === "golden_hour"\n                ? "bg-[#C69214] text-white shadow-md"\n                : "text-[#E5DFD5]/80 hover:text-white hover:bg-white/10"\n            }`}\n            title="Golden Hour Sunset Light"\n          >\n            <Sunset className="w-3.5 h-3.5" />\n            <span className="hidden sm:inline">Golden Hour</span>\n          </button>\n\n          <button\n            onClick={() => setLighting("daylight")}\n            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${\n              lighting === "daylight"\n                ? "bg-[#0D5C3A] text-white shadow-md"\n                : "text-[#E5DFD5]/80 hover:text-white hover:bg-white/10"\n            }`}\n            title="Tropical Daylight"\n          >\n            <Sun className="w-3.5 h-3.5" />\n            <span className="hidden sm:inline">Daylight</span>\n          </button>\n\n          <button\n            onClick={() => setLighting("temple_glow")}\n            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${\n              lighting === "temple_glow"\n                ? "bg-[#D9381E] text-white shadow-md"\n                : "text-[#E5DFD5]/80 hover:text-white hover:bg-white/10"\n            }`}\n            title="Sacred Diya Temple Glow"\n          >\n            <Flame className="w-3.5 h-3.5" />\n            <span className="hidden sm:inline">Temple Glow</span>\n          </button>\n\n          <button\n            onClick={() => setLighting("moonlit_night")}\n            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${\n              lighting === "moonlit_night"\n                ? "bg-[#1E3A8A] text-white shadow-md"\n                : "text-[#E5DFD5]/80 hover:text-white hover:bg-white/10"\n            }`}\n            title="Moonlit Coastal Night"\n          >\n            <Moon className="w-3.5 h-3.5" />\n            <span className="hidden sm:inline">Moonlight</span>\n          </button>\n        </div>\n\n        {/* Rotation & Wireframe Toggles */}\n        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-xl border border-white/20 p-1 rounded-2xl shadow-xl">\n          <button\n            onClick={() => setIsAutoRotating((prev) => !prev)}\n            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${\n              isAutoRotating\n                ? "bg-white/20 text-white"\n                : "text-[#E5DFD5]/70 hover:text-white"\n            }`}\n            title={isAutoRotating ? "Pause Auto-Rotate" : "Auto-Rotate 3D View"}\n          >\n            {isAutoRotating ? <Pause className="w-3.5 h-3.5 text-[#C69214]" /> : <Play className="w-3.5 h-3.5" />}\n            <span className="hidden md:inline">Rotate</span>\n          </button>\n\n          <button\n            onClick={() => setIsWireframe((prev) => !prev)}\n            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${\n              isWireframe\n                ? "bg-[#0D5C3A] text-white"\n                : "text-[#E5DFD5]/70 hover:text-white"\n            }`}\n            title="Toggle Wireframe Geometry"\n          >\n            <Layers className="w-3.5 h-3.5" />\n            <span className="hidden md:inline">Mesh</span>\n          </button>\n        </div>\n      </div>\n\n      {/* Bottom Hint */}\n      <div className="absolute bottom-1 right-4 text-[9px] font-mono text-white/40 pointer-events-none hidden lg:block">\n        Drag to Orbit • Scroll to Zoom • Right-click to Pan\n      </div>\n    </div>\n  );\n};\n