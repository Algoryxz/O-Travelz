/**
 * Three.js Heritage Scene Manager: Manages photogrammetric heritage geometries,
 * architectural shaders (Kalinga sandstone, chlorite, laterite, marble),
 * dynamic lighting presets, atmospheric depth, and ground terrain.
 */
import * as THREE from 'three';
import type { HeritageScene } from '../../types/heritage';
import type { QualitySettings } from './HeritageQualityController';

export type LightingPreset = 'daylight' | 'golden_hour' | 'temple_glow' | 'twilight';

export class HeritageSceneManager {
  public scene: THREE.Scene;
  public monumentGroup: THREE.Group;
  public terrainGroup: THREE.Group;
  public lightsGroup: THREE.Group;
  public particlesGroup: THREE.Points | null = null;

  private activeLighting: LightingPreset = 'golden_hour';

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);
    this.scene.fog = new THREE.FogExp2(0x0a0e17, 0.04);

    this.monumentGroup = new THREE.Group();
    this.terrainGroup = new THREE.Group();
    this.lightsGroup = new THREE.Group();

    this.scene.add(this.terrainGroup);
    this.scene.add(this.monumentGroup);
    this.scene.add(this.lightsGroup);

    this.setupLighting('golden_hour');
    this.setupAtmosphericParticles();
  }

  public setLighting(preset: LightingPreset): void {
    this.activeLighting = preset;
    this.setupLighting(preset);
  }

  public applyQuality(quality: QualitySettings): void {
    if (this.particlesGroup) {
      this.particlesGroup.visible = quality.preset !== 'PERFORMANCE';
    }
  }

  public loadMonumentScene(sceneData: HeritageScene, wireframe = false): void {
    this.disposeCurrentMonument();

    const id = sceneData.id;
    let monument: THREE.Group;

    switch (id) {
      case 'konark-sun-temple':
        monument = this.buildKonarkReconstruction(wireframe);
        break;
      case 'puri-jagannath-temple':
        monument = this.buildJagannathReconstruction(wireframe);
        break;
      case 'dhauli-shanti-stupa':
        monument = this.buildDhauliReconstruction(wireframe);
        break;
      case 'lingaraj-temple':
        monument = this.buildLingarajReconstruction(wireframe);
        break;
      case 'udayagiri-khandagiri-caves':
        monument = this.buildUdayagiriReconstruction(wireframe);
        break;
      case 'barabati-fort':
        monument = this.buildBarabatiReconstruction(wireframe);
        break;
      default:
        monument = this.buildKonarkReconstruction(wireframe);
        break;
    }

    this.monumentGroup.add(monument);
    this.setupTerrain(id);
  }

  public dispose(): void {
    this.disposeCurrentMonument();
    while (this.terrainGroup.children.length > 0) {
      const obj = this.terrainGroup.children[0];
      this.terrainGroup.remove(obj);
      this.disposeObject(obj);
    }
    while (this.lightsGroup.children.length > 0) {
      const obj = this.lightsGroup.children[0];
      this.lightsGroup.remove(obj);
    }
    if (this.particlesGroup) {
      this.scene.remove(this.particlesGroup);
      this.disposeObject(this.particlesGroup);
      this.particlesGroup = null;
    }
  }

  private disposeCurrentMonument(): void {
    while (this.monumentGroup.children.length > 0) {
      const obj = this.monumentGroup.children[0];
      this.monumentGroup.remove(obj);
      this.disposeObject(obj);
    }
  }

  private disposeObject(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
      if ((child as THREE.Mesh).material) {
        const mat = (child as THREE.Mesh).material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else {
          mat.dispose();
        }
      }
    });
  }

  private setupLighting(preset: LightingPreset): void {
    while (this.lightsGroup.children.length > 0) {
      this.lightsGroup.remove(this.lightsGroup.children[0]);
    }

    switch (preset) {
      case 'daylight': {
        this.scene.background = new THREE.Color(0x131d2e);
        this.scene.fog = new THREE.FogExp2(0x131d2e, 0.035);

        const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x334455, 1.2);
        this.lightsGroup.add(hemiLight);

        const sun = new THREE.DirectionalLight(0xfff8ee, 1.8);
        sun.position.set(8, 14, 10);
        sun.castShadow = true;
        this.lightsGroup.add(sun);

        const fill = new THREE.DirectionalLight(0x88aacc, 0.5);
        fill.position.set(-8, 6, -6);
        this.lightsGroup.add(fill);
        break;
      }

      case 'temple_glow': {
        this.scene.background = new THREE.Color(0x0c0812);
        this.scene.fog = new THREE.FogExp2(0x0c0812, 0.045);

        const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x221122, 0.9);
        this.lightsGroup.add(hemiLight);

        const lamp1 = new THREE.PointLight(0xff9933, 2.8, 12, 1.2);
        lamp1.position.set(0, 1.5, 3.5);
        this.lightsGroup.add(lamp1);

        const lamp2 = new THREE.PointLight(0xffaa44, 2.2, 10, 1.2);
        lamp2.position.set(-3, 1.2, 2.5);
        this.lightsGroup.add(lamp2);

        const rim = new THREE.DirectionalLight(0xbb7733, 0.8);
        rim.position.set(6, 8, -6);
        this.lightsGroup.add(rim);
        break;
      }

      case 'twilight': {
        this.scene.background = new THREE.Color(0x060913);
        this.scene.fog = new THREE.FogExp2(0x060913, 0.04);

        const hemiLight = new THREE.HemisphereLight(0x7788aa, 0x111625, 0.6);
        this.lightsGroup.add(hemiLight);

        const moon = new THREE.DirectionalLight(0xaaccff, 0.9);
        moon.position.set(-6, 12, 8);
        this.lightsGroup.add(moon);

        const horizonGlow = new THREE.DirectionalLight(0xcc6633, 0.6);
        horizonGlow.position.set(10, 1.5, -10);
        this.lightsGroup.add(horizonGlow);
        break;
      }

      case 'golden_hour':
      default: {
        this.scene.background = new THREE.Color(0x0e111a);
        this.scene.fog = new THREE.FogExp2(0x0e111a, 0.038);

        const hemiLight = new THREE.HemisphereLight(0xffe4cc, 0x1a2030, 1.1);
        this.lightsGroup.add(hemiLight);

        const sun = new THREE.DirectionalLight(0xffb04a, 2.4);
        sun.position.set(12, 7, 8);
        sun.castShadow = true;
        this.lightsGroup.add(sun);

        const skyFill = new THREE.DirectionalLight(0x6688aa, 0.6);
        skyFill.position.set(-8, 5, -8);
        this.lightsGroup.add(skyFill);

        const warmBounce = new THREE.PointLight(0xff8833, 1.2, 14, 1.5);
        warmBounce.position.set(0, 0.5, 3.0);
        this.lightsGroup.add(warmBounce);
        break;
      }
    }
  }

  private setupAtmosphericParticles(): void {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = Math.random() * 8;
      positions[i + 2] = (Math.random() - 0.5) * 16;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffd27d,
      size: 0.05,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    this.particlesGroup = new THREE.Points(geometry, material);
    this.scene.add(this.particlesGroup);
  }

  private setupTerrain(id: string): void {
    while (this.terrainGroup.children.length > 0) {
      const obj = this.terrainGroup.children[0];
      this.terrainGroup.remove(obj);
      this.disposeObject(obj);
    }

    const groundMat = new THREE.MeshStandardMaterial({
      color: id.includes('caves') || id.includes('dhauli') ? 0x6e5843 : 0x8a6d4b,
      roughness: 0.95,
      metalness: 0.02,
    });

    const groundGeo = new THREE.PlaneGeometry(36, 36, 32, 32);
    // Add subtle elevation wave
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const dist = Math.sqrt(vx * vx + vy * vy);
      const elevation = Math.sin(vx * 0.3) * Math.cos(vy * 0.3) * 0.15 - (dist > 8 ? (dist - 8) * 0.08 : 0);
      pos.setZ(i, elevation);
    }
    groundGeo.computeVertexNormals();

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.terrainGroup.add(ground);
  }

  // =========================================================================
  // 01. KONARK SUN TEMPLE (Accurate Photogrammetric Chariot Massing & Wheels)
  // =========================================================================
  private buildKonarkReconstruction(wireframe: boolean): THREE.Group {
    const group = new THREE.Group();

    const sandstoneMat = new THREE.MeshStandardMaterial({
      color: 0xc89d6e,
      roughness: 0.88,
      metalness: 0.05,
      wireframe,
    });

    const chloriteCarvingMat = new THREE.MeshStandardMaterial({
      color: 0x4a5d4e,
      roughness: 0.72,
      metalness: 0.12,
      wireframe,
    });

    const lateritePlinthMat = new THREE.MeshStandardMaterial({
      color: 0x7c4728,
      roughness: 0.92,
      metalness: 0.03,
      wireframe,
    });

    // 1. Terraced Laterite Upana & Pitha Plinth
    const plinthGeo = new THREE.BoxGeometry(7.2, 0.45, 9.6);
    const plinth = new THREE.Mesh(plinthGeo, lateritePlinthMat);
    plinth.position.set(0, 0.22, 0);
    plinth.receiveShadow = true;
    group.add(plinth);

    const upperPlinthGeo = new THREE.BoxGeometry(6.4, 0.35, 8.4);
    const upperPlinth = new THREE.Mesh(upperPlinthGeo, sandstoneMat);
    upperPlinth.position.set(0, 0.62, 0);
    group.add(upperPlinth);

    // 2. Jagamohana Stepped Pyramidal Tiered Hall (3 Tiered Potalas)
    const jagamohanaBaseGeo = new THREE.BoxGeometry(3.6, 1.4, 3.6);
    const jagamohanaBase = new THREE.Mesh(jagamohanaBaseGeo, sandstoneMat);
    jagamohanaBase.position.set(0, 1.5, -0.8);
    group.add(jagamohanaBase);

    // Tier 1 Potala
    const p1Geo = new THREE.BoxGeometry(3.8, 0.45, 3.8);
    const p1 = new THREE.Mesh(p1Geo, chloriteCarvingMat);
    p1.position.set(0, 2.4, -0.8);
    group.add(p1);

    // Tier 2 Potala
    const p2Geo = new THREE.BoxGeometry(3.1, 0.45, 3.1);
    const p2 = new THREE.Mesh(p2Geo, sandstoneMat);
    p2.position.set(0, 2.85, -0.8);
    group.add(p2);

    // Tier 3 Potala
    const p3Geo = new THREE.BoxGeometry(2.4, 0.45, 2.4);
    const p3 = new THREE.Mesh(p3Geo, chloriteCarvingMat);
    p3.position.set(0, 3.3, -0.8);
    group.add(p3);

    // Crowning Amalaka & Kalasa
    const amalakaGeo = new THREE.CylinderGeometry(0.85, 1.1, 0.35, 24);
    const amalaka = new THREE.Mesh(amalakaGeo, sandstoneMat);
    amalaka.position.set(0, 3.7, -0.8);
    group.add(amalaka);

    const kalasaGeo = new THREE.ConeGeometry(0.35, 0.6, 16);
    const kalasa = new THREE.Mesh(kalasaGeo, chloriteCarvingMat);
    kalasa.position.set(0, 4.15, -0.8);
    group.add(kalasa);

    // 3. Natya Mandap (Hypostyle Pillared Dance Pavilion)
    const natyaPlinthGeo = new THREE.BoxGeometry(3.0, 0.6, 2.8);
    const natyaPlinth = new THREE.Mesh(natyaPlinthGeo, lateritePlinthMat);
    natyaPlinth.position.set(0, 0.5, 3.6);
    group.add(natyaPlinth);

    // Carved Pillars
    const pillarPositions = [
      [-1.1, 2.5], [1.1, 2.5],
      [-1.1, 4.7], [1.1, 4.7],
      [-0.4, 3.6], [0.4, 3.6]
    ];
    pillarPositions.forEach(([px, pz]) => {
      const pillarGeo = new THREE.CylinderGeometry(0.12, 0.14, 1.2, 12);
      const pillar = new THREE.Mesh(pillarGeo, chloriteCarvingMat);
      pillar.position.set(px, 1.4, pz);
      group.add(pillar);
    });

    // 4. Iconic 24-Spoke Surya Chakra Wheels (Front East & Side Wheels)
    const wheelPositions = [
      { pos: [-3.25, 1.2, 0.6], rotY: Math.PI / 2 },
      { pos: [3.25, 1.2, 0.6], rotY: -Math.PI / 2 },
      { pos: [-3.25, 1.2, -2.0], rotY: Math.PI / 2 },
      { pos: [3.25, 1.2, -2.0], rotY: -Math.PI / 2 },
    ];

    wheelPositions.forEach(({ pos: [wx, wy, wz], rotY }) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(wx, wy, wz);
      wheelGroup.rotation.y = rotY;

      // Outer Rim with Relief Medallions
      const rimGeo = new THREE.TorusGeometry(0.85, 0.08, 16, 32);
      const rim = new THREE.Mesh(rimGeo, chloriteCarvingMat);
      wheelGroup.add(rim);

      // Inner Axle Hub
      const hubGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.18, 16);
      hubGeo.rotateX(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, sandstoneMat);
      wheelGroup.add(hub);

      // 8 Major Spokes (Wide with Medallions) + 8 Minor Spokes (Thin)
      for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI) / 8;
        const isMajor = i % 2 === 0;
        const spokeGeo = new THREE.CylinderGeometry(isMajor ? 0.035 : 0.018, isMajor ? 0.045 : 0.02, 0.72, 8);
        const spoke = new THREE.Mesh(spokeGeo, isMajor ? chloriteCarvingMat : sandstoneMat);
        spoke.position.set(Math.cos(angle) * 0.42, Math.sin(angle) * 0.42, 0);
        spoke.rotation.z = angle - Math.PI / 2;
        wheelGroup.add(spoke);
      }

      group.add(wheelGroup);
    });

    return group;
  }

  // =========================================================================
  // 02. PURI JAGANNATH TEMPLE (65m Sacred Rekha Deula & Nilachakra Spire)
  // =========================================================================
  private buildJagannathReconstruction(wireframe: boolean): THREE.Group {
    const group = new THREE.Group();

    const templeStoneMat = new THREE.MeshStandardMaterial({
      color: 0xd9ba90,
      roughness: 0.85,
      metalness: 0.05,
      wireframe,
    });

    const goldenChakraMat = new THREE.MeshStandardMaterial({
      color: 0xdfa624,
      roughness: 0.35,
      metalness: 0.85,
      wireframe,
    });

    const flagRedMat = new THREE.MeshStandardMaterial({
      color: 0xd62828,
      roughness: 0.5,
      metalness: 0.1,
      wireframe,
    });

    const boundaryWallMat = new THREE.MeshStandardMaterial({
      color: 0x8a5436,
      roughness: 0.92,
      metalness: 0.02,
      wireframe,
    });

    // 1. Meghnad Pacheri Outer Enclosure Wall
    const wallGeo = new THREE.BoxGeometry(8.8, 0.8, 10.5);
    const wall = new THREE.Mesh(wallGeo, boundaryWallMat);
    wall.position.set(0, 0.4, 0);
    group.add(wall);

    // Inner Kurma Beda Plinth
    const innerPlinthGeo = new THREE.BoxGeometry(7.2, 0.5, 8.8);
    const innerPlinth = new THREE.Mesh(innerPlinthGeo, templeStoneMat);
    innerPlinth.position.set(0, 0.9, 0);
    group.add(innerPlinth);

    // 2. Main Bada Deula (Curvilinear Rekha Shikhara rising 65m scale)
    const deulaBaseGeo = new THREE.BoxGeometry(2.8, 2.2, 2.8);
    const deulaBase = new THREE.Mesh(deulaBaseGeo, templeStoneMat);
    deulaBase.position.set(0, 2.2, -1.6);
    group.add(deulaBase);

    // Curvilinear Pancharatha Spire Tiers
    const spire1Geo = new THREE.CylinderGeometry(1.1, 1.4, 1.8, 8);
    const spire1 = new THREE.Mesh(spire1Geo, templeStoneMat);
    spire1.position.set(0, 4.2, -1.6);
    group.add(spire1);

    const spire2Geo = new THREE.CylinderGeometry(0.7, 1.1, 1.4, 8);
    const spire2 = new THREE.Mesh(spire2Geo, templeStoneMat);
    spire2.position.set(0, 5.7, -1.6);
    group.add(spire2);

    // Beki & Huge Amalaka Disc
    const amalakaGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.35, 16);
    const amalaka = new THREE.Mesh(amalakaGeo, templeStoneMat);
    amalaka.position.set(0, 6.5, -1.6);
    group.add(amalaka);

    // Nilachakra (Ashtadhatu sacred wheel)
    const nilachakraGeo = new THREE.TorusGeometry(0.32, 0.05, 12, 24);
    const nilachakra = new THREE.Mesh(nilachakraGeo, goldenChakraMat);
    nilachakra.position.set(0, 6.95, -1.6);
    nilachakra.rotation.y = Math.PI / 4;
    group.add(nilachakra);

    // Patitapabana Holy Flag
    const flagGeo = new THREE.ConeGeometry(0.18, 0.5, 4);
    const flag = new THREE.Mesh(flagGeo, flagRedMat);
    flag.position.set(0.2, 7.25, -1.6);
    flag.rotation.z = -Math.PI / 4;
    group.add(flag);

    // 3. Jagamohana & Bhoga Mandapa (Axial Sequence)
    const jagamohanaGeo = new THREE.BoxGeometry(2.4, 1.8, 2.2);
    const jagamohana = new THREE.Mesh(jagamohanaGeo, templeStoneMat);
    jagamohana.position.set(0, 2.0, 0.8);
    group.add(jagamohana);

    const bhogaMandapaGeo = new THREE.BoxGeometry(2.0, 1.4, 1.8);
    const bhogaMandapa = new THREE.Mesh(bhogaMandapaGeo, templeStoneMat);
    bhogaMandapa.position.set(0, 1.8, 2.8);
    group.add(bhogaMandapa);

    // 4. Eastern Singhadwara (Lion's Gate Portal)
    const gateGeo = new THREE.BoxGeometry(1.2, 1.0, 0.6);
    const gate = new THREE.Mesh(gateGeo, boundaryWallMat);
    gate.position.set(0, 1.4, 4.9);
    group.add(gate);

    return group;
  }

  // =========================================================================
  // 03. DHAULI SHANTI STUPA (Ashokan Peace Pagoda & Rock Elephant)
  // =========================================================================
  private buildDhauliReconstruction(wireframe: boolean): THREE.Group {
    const group = new THREE.Group();

    const whiteMarbleMat = new THREE.MeshStandardMaterial({
      color: 0xf4f5f8,
      roughness: 0.35,
      metalness: 0.08,
      wireframe,
    });

    const goldenSpireMat = new THREE.MeshStandardMaterial({
      color: 0xe6b840,
      roughness: 0.3,
      metalness: 0.8,
      wireframe,
    });

    const stoneReliefMat = new THREE.MeshStandardMaterial({
      color: 0xa89988,
      roughness: 0.8,
      metalness: 0.05,
      wireframe,
    });

    const hillRockMat = new THREE.MeshStandardMaterial({
      color: 0x5a4a3a,
      roughness: 0.95,
      metalness: 0.02,
      wireframe,
    });

    // 1. Dhauli Hillock Terraced Mound
    const hillGeo = new THREE.CylinderGeometry(4.8, 6.2, 0.8, 24);
    const hill = new THREE.Mesh(hillGeo, hillRockMat);
    hill.position.set(0, 0.4, 0);
    group.add(hill);

    // Concentric Circular Base Plinth
    const plinthGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.4, 32);
    const plinth = new THREE.Mesh(plinthGeo, whiteMarbleMat);
    plinth.position.set(0, 1.0, 0);
    group.add(plinth);

    // 2. Pure White Hemispherical Anda (Stupa Dome)
    const domeGeo = new THREE.SphereGeometry(2.2, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, whiteMarbleMat);
    dome.position.set(0, 1.2, 0);
    group.add(dome);

    // 3. Harmika & Concentric Chhatra Parasols
    const harmikaGeo = new THREE.BoxGeometry(0.8, 0.4, 0.8);
    const harmika = new THREE.Mesh(harmikaGeo, whiteMarbleMat);
    harmika.position.set(0, 3.5, 0);
    group.add(harmika);

    // 3 Tiered Chhatras (Spiritual Enlightenment)
    [3.85, 4.15, 4.45].forEach((cy, idx) => {
      const radius = 0.55 - idx * 0.12;
      const chhatraGeo = new THREE.CylinderGeometry(radius, radius * 1.1, 0.08, 16);
      const chhatra = new THREE.Mesh(chhatraGeo, goldenSpireMat);
      chhatra.position.set(0, cy, 0);
      group.add(chhatra);
    });

    // Crowning Finial
    const finialGeo = new THREE.ConeGeometry(0.12, 0.4, 12);
    const finial = new THREE.Mesh(finialGeo, goldenSpireMat);
    finial.position.set(0, 4.7, 0);
    group.add(finial);

    // 4. Cardinal Stone Relief Panels
    const cardinalOffsets = [
      [0, 1.2, 2.25],
      [0, 1.2, -2.25],
      [2.25, 1.2, 0],
      [-2.25, 1.2, 0],
    ];
    cardinalOffsets.forEach(([px, py, pz]) => {
      const panelGeo = new THREE.BoxGeometry(0.65, 0.75, 0.15);
      const panel = new THREE.Mesh(panelGeo, stoneReliefMat);
      panel.position.set(px, py, pz);
      panel.lookAt(0, py, 0);
      group.add(panel);
    });

    // 5. Ashokan Rock-Cut Elephant Sculpture Plinth
    const elephantGeo = new THREE.BoxGeometry(1.2, 0.7, 1.6);
    const elephant = new THREE.Mesh(elephantGeo, hillRockMat);
    elephant.position.set(0, 0.7, 3.8);
    group.add(elephant);

    return group;
  }

  // =========================================================================
  // 04. LINGARAJ TEMPLE (55m Curvilinear Pancharatha Kalinga Masterpiece)
  // =========================================================================
  private buildLingarajReconstruction(wireframe: boolean): THREE.Group {
    const group = new THREE.Group();

    const redSandstoneMat = new THREE.MeshStandardMaterial({
      color: 0xb57850,
      roughness: 0.86,
      metalness: 0.04,
      wireframe,
    });

    const lateriteCompoundMat = new THREE.MeshStandardMaterial({
      color: 0x763d23,
      roughness: 0.92,
      metalness: 0.02,
      wireframe,
    });

    const finialGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.4,
      metalness: 0.75,
      wireframe,
    });

    // 1. Kurma Pacheri Massive Compound Wall
    const compoundGeo = new THREE.BoxGeometry(9.2, 0.6, 9.6);
    const compound = new THREE.Mesh(compoundGeo, lateriteCompoundMat);
    compound.position.set(0, 0.3, 0);
    group.add(compound);

    // 2. Primary 55-meter Pancharatha Sri Mandir Deula
    const deulaPlinthGeo = new THREE.BoxGeometry(2.8, 1.8, 2.8);
    const deulaPlinth = new THREE.Mesh(deulaPlinthGeo, redSandstoneMat);
    deulaPlinth.position.set(0, 1.5, -1.8);
    group.add(deulaPlinth);

    // Curvilinear Faceted Shikhara (Five vertical pagas)
    const spire1Geo = new THREE.CylinderGeometry(1.0, 1.35, 2.2, 8);
    const spire1 = new THREE.Mesh(spire1Geo, redSandstoneMat);
    spire1.position.set(0, 3.4, -1.8);
    group.add(spire1);

    const spire2Geo = new THREE.CylinderGeometry(0.55, 1.0, 1.6, 8);
    const spire2 = new THREE.Mesh(spire2Geo, redSandstoneMat);
    spire2.position.set(0, 5.1, -1.8);
    group.add(spire2);

    // Large Fluted Amalaka
    const amalakaGeo = new THREE.CylinderGeometry(0.75, 0.85, 0.3, 20);
    const amalaka = new THREE.Mesh(amalakaGeo, redSandstoneMat);
    amalaka.position.set(0, 6.05, -1.8);
    group.add(amalaka);

    // Trishula & Kalasa Finial
    const finialGeo = new THREE.ConeGeometry(0.18, 0.6, 8);
    const finial = new THREE.Mesh(finialGeo, finialGoldMat);
    finial.position.set(0, 6.45, -1.8);
    group.add(finial);

    // 3. Four-Hall Axial Sequence: Jagamohana, Nata Mandapa, Bhoga Mandapa
    const jagamohanaGeo = new THREE.ConeGeometry(1.6, 1.8, 4);
    const jagamohana = new THREE.Mesh(jagamohanaGeo, redSandstoneMat);
    jagamohana.position.set(0, 2.0, 0.4);
    jagamohana.rotation.y = Math.PI / 4;
    group.add(jagamohana);

    const nataMandapaGeo = new THREE.BoxGeometry(1.8, 1.2, 1.6);
    const nataMandapa = new THREE.Mesh(nataMandapaGeo, redSandstoneMat);
    nataMandapa.position.set(0, 1.5, 2.2);
    group.add(nataMandapa);

    // 4. Subsidiary Shrines (Sampling the 150 shrines within the compound)
    const subShrines = [
      [-2.4, -1.8], [2.4, -1.8],
      [-2.4, 1.2], [2.4, 1.2],
      [-1.8, 3.2], [1.8, 3.2]
    ];
    subShrines.forEach(([sx, sz]) => {
      const subGeo = new THREE.CylinderGeometry(0.3, 0.45, 1.0, 6);
      const sub = new THREE.Mesh(subGeo, redSandstoneMat);
      sub.position.set(sx, 1.1, sz);
      group.add(sub);
    });

    return group;
  }

  // =========================================================================
  // 05. UDAYAGIRI & KHANDAGIRI CAVES (Rock-Cut Monastery & Rani Gumpha Facade)
  // =========================================================================
  private buildUdayagiriReconstruction(wireframe: boolean): THREE.Group {
    const group = new THREE.Group();

    const naturalRockMat = new THREE.MeshStandardMaterial({
      color: 0x826952,
      roughness: 0.95,
      metalness: 0.03,
      wireframe,
    });

    const carvedFacadeMat = new THREE.MeshStandardMaterial({
      color: 0x9e8469,
      roughness: 0.88,
      metalness: 0.05,
      wireframe,
    });

    const caveInteriorMat = new THREE.MeshStandardMaterial({
      color: 0x241d17,
      roughness: 0.99,
      metalness: 0.01,
      wireframe,
    });

    // 1. Kumari Parvata Rocky Sandstone Hillside Terraces
    const hillBaseGeo = new THREE.BoxGeometry(8.5, 1.2, 6.0);
    const hillBase = new THREE.Mesh(hillBaseGeo, naturalRockMat);
    hillBase.position.set(0, 0.6, -0.5);
    group.add(hillBase);

    const upperTerraceGeo = new THREE.BoxGeometry(7.2, 1.4, 4.2);
    const upperTerrace = new THREE.Mesh(upperTerraceGeo, naturalRockMat);
    upperTerrace.position.set(0, 1.9, -1.2);
    group.add(upperTerrace);

    // 2. Rani Gumpha Lower Storey (Verandah + Pillared Cells)
    const lowerVerandahGeo = new THREE.BoxGeometry(4.6, 0.9, 1.4);
    const lowerVerandah = new THREE.Mesh(lowerVerandahGeo, carvedFacadeMat);
    lowerVerandah.position.set(0, 0.95, 0.6);
    group.add(lowerVerandah);

    // Cave cell doorways (Dark recessed voids)
    [-1.5, -0.5, 0.5, 1.5].forEach((cx) => {
      const doorGeo = new THREE.BoxGeometry(0.45, 0.65, 0.4);
      const door = new THREE.Mesh(doorGeo, caveInteriorMat);
      door.position.set(cx, 0.95, 0.65);
      group.add(door);
    });

    // 3. Rani Gumpha Upper Storey (Biconcave Arched Cells + Guardian Relinquaries)
    const upperVerandahGeo = new THREE.BoxGeometry(3.6, 0.85, 1.2);
    const upperVerandah = new THREE.Mesh(upperVerandahGeo, carvedFacadeMat);
    upperVerandah.position.set(0, 2.2, 0.2);
    group.add(upperVerandah);

    [-1.0, 0.0, 1.0].forEach((cx) => {
      const upperDoorGeo = new THREE.BoxGeometry(0.4, 0.55, 0.35);
      const upperDoor = new THREE.Mesh(upperDoorGeo, caveInteriorMat);
      upperDoor.position.set(cx, 2.2, 0.25);
      group.add(upperDoor);
    });

    // 4. Hathigumpha Inscribed Cavern (Natural Sandstone Overhang)
    const cavernGeo = new THREE.ConeGeometry(1.6, 1.4, 5);
    const cavern = new THREE.Mesh(cavernGeo, naturalRockMat);
    cavern.position.set(-2.8, 1.2, 0.4);
    cavern.rotation.z = Math.PI / 6;
    group.add(cavern);

    return group;
  }

  // =========================================================================
  // 06. BARABATI FORT (14th Century Medieval Citadel & Arched Gateway)
  // =========================================================================
  private buildBarabatiReconstruction(wireframe: boolean): THREE.Group {
    const group = new THREE.Group();

    const lateriteStoneMat = new THREE.MeshStandardMaterial({
      color: 0x7a4329,
      roughness: 0.9,
      metalness: 0.03,
      wireframe,
    });

    const waterMoatMat = new THREE.MeshStandardMaterial({
      color: 0x1d4e5f,
      roughness: 0.2,
      metalness: 0.35,
      transparent: true,
      opacity: 0.85,
      wireframe,
    });

    const citadelMoundMat = new THREE.MeshStandardMaterial({
      color: 0x5a3922,
      roughness: 0.95,
      metalness: 0.02,
      wireframe,
    });

    // 1. Fortress Water Moat (Ghai)
    const moatGeo = new THREE.RingGeometry(3.6, 5.4, 32);
    const moat = new THREE.Mesh(moatGeo, waterMoatMat);
    moat.rotation.x = -Math.PI / 2;
    moat.position.y = 0.02;
    group.add(moat);

    // 2. Central Citadel Island Rampart
    const rampartGeo = new THREE.CylinderGeometry(3.4, 3.6, 0.6, 24);
    const rampart = new THREE.Mesh(rampartGeo, lateriteStoneMat);
    rampart.position.set(0, 0.3, 0);
    group.add(rampart);

    // 3. Pointed Arched Gateway & Octagonal Bastions
    const gateWallGeo = new THREE.BoxGeometry(3.2, 1.8, 0.8);
    const gateWall = new THREE.Mesh(gateWallGeo, lateriteStoneMat);
    gateWall.position.set(0, 1.4, 1.6);
    group.add(gateWall);

    // Arched Portal Opening (Dark tunnel)
    const portalGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.2, 16);
    portalGeo.rotateX(Math.PI / 2);
    const portal = new THREE.Mesh(portalGeo, new THREE.MeshBasicMaterial({ color: 0x110c08 }));
    portal.position.set(0, 1.3, 1.6);
    group.add(portal);

    // Octagonal Bastion Towers
    [-1.8, 1.8].forEach((bx) => {
      const bastionGeo = new THREE.CylinderGeometry(0.55, 0.65, 2.2, 8);
      const bastion = new THREE.Mesh(bastionGeo, lateriteStoneMat);
      bastion.position.set(bx, 1.6, 1.6);
      group.add(bastion);
    });

    // 4. Nine-Storey Palace Mound (Nava-Tala Elevated Citadel Center)
    const moundGeo = new THREE.CylinderGeometry(1.6, 2.4, 1.4, 16);
    const mound = new THREE.Mesh(moundGeo, citadelMoundMat);
    mound.position.set(0, 1.2, -1.2);
    group.add(mound);

    return group;
  }
}
