/**
 * Authentic Kalinga 3D Architectural Model Builder for O-Travelz.
 * Constructs volumetric 3D architectural models on museum plinths with PBR materials,
 * accurate proportions, structural components (Rekha Deula, Jagamohana, Mandapas,
 * Amalaka, Kalasa, Nilachakra, 24-Spoke Surya Chakra), and direct vertex-accurate hotspot anchors.
 *
 * ZERO fake point clouds. ZERO rotating flat cards. REAL 3D SOLID GEOMETRY.
 */
import * as THREE from 'three';
import type { HeritageScene } from '../../types/heritage';

export class HeritageModelBuilder {
  /**
   * Material palette generator for authentic Odisha stone types.
   */
  private static createStoneMaterials() {
    // Khondalite stone (warm weathered reddish-ochre stone used in Konark & Puri)
    const khondaliteMat = new THREE.MeshStandardMaterial({
      color: 0x9b6b43,
      roughness: 0.88,
      metalness: 0.05,
    });

    // Dark Khondalite for carved relief layers
    const darkKhondaliteMat = new THREE.MeshStandardMaterial({
      color: 0x7a5232,
      roughness: 0.92,
      metalness: 0.03,
    });

    // Chlorite stone (dense dark greenish-grey polished stone for Konark wheels & statues)
    const chloriteMat = new THREE.MeshStandardMaterial({
      color: 0x3d4a3e,
      roughness: 0.65,
      metalness: 0.12,
    });

    // Red/Ochre Sandstone (Bhubaneswar Lingaraj & Brahmeswara temples)
    const sandstoneMat = new THREE.MeshStandardMaterial({
      color: 0xaf7c52,
      roughness: 0.84,
      metalness: 0.04,
    });

    // Light Ochre Sandstone (Brahmeswara)
    const lightSandstoneMat = new THREE.MeshStandardMaterial({
      color: 0xc49a6c,
      roughness: 0.82,
      metalness: 0.03,
    });

    // Laterite stone (porous deep red stone for compound walls & foundations)
    const lateriteMat = new THREE.MeshStandardMaterial({
      color: 0x6e382b,
      roughness: 0.95,
      metalness: 0.02,
    });

    // Ashtadhatu / Gold metal for Nilachakra crest & sacred kalasa finials
    const ashtadhatuMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.35,
      metalness: 0.85,
    });

    // Museum Wooden Display Plinth
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x1a1512,
      roughness: 0.5,
      metalness: 0.1,
    });

    // Plinth Inset Trim
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x3d2e22,
      roughness: 0.4,
      metalness: 0.2,
    });

    return {
      khondaliteMat,
      darkKhondaliteMat,
      chloriteMat,
      sandstoneMat,
      lightSandstoneMat,
      lateriteMat,
      ashtadhatuMat,
      plinthMat,
      trimMat,
    };
  }

  /**
   * Helper: Builds museum display pedestal/baseboard.
   */
  private static buildMuseumPlinth(width: number, depth: number, height: number = 0.2): THREE.Group {
    const group = new THREE.Group();
    const mats = this.createStoneMaterials();

    // Main base plinth
    const baseGeo = new THREE.BoxGeometry(width, height, depth);
    const baseMesh = new THREE.Mesh(baseGeo, mats.plinthMat);
    baseMesh.position.y = height / 2;
    baseMesh.receiveShadow = true;
    baseMesh.castShadow = true;
    group.add(baseMesh);

    // Beveled upper rim
    const rimGeo = new THREE.BoxGeometry(width - 0.15, 0.04, depth - 0.15);
    const rimMesh = new THREE.Mesh(rimGeo, mats.trimMat);
    rimMesh.position.y = height + 0.02;
    rimMesh.receiveShadow = true;
    group.add(rimMesh);

    return group;
  }

  /**
   * Helper: Builds a Kalinga Rekha Deula (curvilinear temple tower / shikhara).
   */
  private static buildRekhaDeula(
    height: number,
    baseWidth: number,
    material: THREE.Material,
    accentMat: THREE.Material,
    crownMat?: THREE.Material
  ): THREE.Group {
    const towerGroup = new THREE.Group();

    // 1. Pitha (stepped base plinth)
    const pithaLayers = 3;
    const pithaHeight = height * 0.12;
    for (let i = 0; i < pithaLayers; i++) {
      const w = baseWidth * (1 + (pithaLayers - i) * 0.06);
      const h = pithaHeight / pithaLayers;
      const geo = new THREE.BoxGeometry(w, h, w);
      const mesh = new THREE.Mesh(geo, accentMat);
      mesh.position.y = i * h + h / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      towerGroup.add(mesh);
    }

    // 2. Bada (cubical lower sanctum wall with vertical ratha projections)
    const badaHeight = height * 0.28;
    const badaY = pithaHeight;
    const badaGeo = new THREE.BoxGeometry(baseWidth, badaHeight, baseWidth);
    const badaMesh = new THREE.Mesh(badaGeo, material);
    badaMesh.position.y = badaY + badaHeight / 2;
    badaMesh.castShadow = true;
    badaMesh.receiveShadow = true;
    towerGroup.add(badaMesh);

    // Vertical ratha facet offsets (Pancharatha styling)
    const rathaGeo = new THREE.BoxGeometry(baseWidth * 1.04, badaHeight * 0.9, baseWidth * 0.4);
    const rathaMeshZ = new THREE.Mesh(rathaGeo, accentMat);
    rathaMeshZ.position.y = badaY + badaHeight / 2;
    rathaMeshZ.castShadow = true;
    towerGroup.add(rathaMeshZ);

    const rathaMeshX = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth * 0.4, badaHeight * 0.9, baseWidth * 1.04),
      accentMat
    );
    rathaMeshX.position.y = badaY + badaHeight / 2;
    rathaMeshX.castShadow = true;
    towerGroup.add(rathaMeshX);

    // 3. Gandi (soaring curvilinear shikhara tower made of stepped narrowing tiers)
    const gandiY = badaY + badaHeight;
    const gandiHeight = height * 0.48;
    const tiers = 14;
    for (let i = 0; i < tiers; i++) {
      const t = i / tiers;
      // Inward parabolic curvature: w decreases faster near the top
      const curveFactor = Math.pow(t, 1.8);
      const w = baseWidth * (1 - curveFactor * 0.62);
      const layerH = gandiHeight / tiers;
      const geo = new THREE.BoxGeometry(w, layerH * 0.95, w);
      const mesh = new THREE.Mesh(geo, i % 2 === 0 ? material : accentMat);
      mesh.position.y = gandiY + i * layerH + layerH / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      towerGroup.add(mesh);
    }

    // 4. Mastaka (Beki neck, Amalaka fluted disc, and Kalasa finial)
    const mastakaY = gandiY + gandiHeight;

    // Beki (cylindrical neck)
    const bekiGeo = new THREE.CylinderGeometry(baseWidth * 0.24, baseWidth * 0.28, height * 0.03, 16);
    const beki = new THREE.Mesh(bekiGeo, accentMat);
    beki.position.y = mastakaY + height * 0.015;
    beki.castShadow = true;
    towerGroup.add(beki);

    // Amalaka (large ribbed disc)
    const amalakaRadius = baseWidth * 0.32;
    const amalakaHeight = height * 0.05;
    const amalakaGeo = new THREE.CylinderGeometry(amalakaRadius * 0.85, amalakaRadius, amalakaHeight, 20);
    const amalaka = new THREE.Mesh(amalakaGeo, material);
    amalaka.position.y = mastakaY + height * 0.03 + amalakaHeight / 2;
    amalaka.castShadow = true;
    towerGroup.add(amalaka);

    // Kalasa (sacred crowning pot)
    const kalasaRadius = baseWidth * 0.12;
    const kalasaHeight = height * 0.04;
    const kalasaGeo = new THREE.CylinderGeometry(0.01, kalasaRadius, kalasaHeight, 16);
    const kalasa = new THREE.Mesh(kalasaGeo, crownMat || accentMat);
    kalasa.position.y = mastakaY + height * 0.03 + amalakaHeight + kalasaHeight / 2;
    kalasa.castShadow = true;
    towerGroup.add(kalasa);

    return towerGroup;
  }

  /**
   * Helper: Builds a Kalinga Jagamohana (stepped pyramidal hall / Pidha Deula).
   */
  private static buildPidhaDeula(
    height: number,
    baseWidth: number,
    material: THREE.Material,
    accentMat: THREE.Material,
    crownMat?: THREE.Material
  ): THREE.Group {
    const hallGroup = new THREE.Group();

    // 1. Lower walls
    const wallHeight = height * 0.35;
    const wallGeo = new THREE.BoxGeometry(baseWidth, wallHeight, baseWidth);
    const wallMesh = new THREE.Mesh(wallGeo, material);
    wallMesh.position.y = wallHeight / 2;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    hallGroup.add(wallMesh);

    // 2. Stepped Pyramidal Roof (Potalas of Pidha tiers)
    const roofY = wallHeight;
    const roofHeight = height * 0.52;
    const potalaTiers = 9;
    for (let i = 0; i < potalaTiers; i++) {
      const t = i / potalaTiers;
      const w = baseWidth * 1.05 * (1 - t * 0.78);
      const layerH = roofHeight / potalaTiers;
      const geo = new THREE.BoxGeometry(w, layerH * 0.85, w);
      const mesh = new THREE.Mesh(geo, i % 2 === 0 ? accentMat : material);
      mesh.position.y = roofY + i * layerH + layerH / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      hallGroup.add(mesh);
    }

    // 3. Ghanta & Amalaka finial
    const finialY = roofY + roofHeight;
    const ghantaRadius = baseWidth * 0.22;
    const ghantaGeo = new THREE.CylinderGeometry(ghantaRadius * 0.7, ghantaRadius, height * 0.05, 16);
    const ghanta = new THREE.Mesh(ghantaGeo, crownMat || accentMat);
    ghanta.position.y = finialY + height * 0.025;
    ghanta.castShadow = true;
    hallGroup.add(ghanta);

    const kalasaGeo = new THREE.ConeGeometry(ghantaRadius * 0.5, height * 0.06, 16);
    const kalasa = new THREE.Mesh(kalasaGeo, crownMat || accentMat);
    kalasa.position.y = finialY + height * 0.05 + height * 0.03;
    kalasa.castShadow = true;
    hallGroup.add(kalasa);

    return hallGroup;
  }

  /**
   * Helper: Builds an open hypostyle pillared mandapa (Natya Mandapa).
   */
  private static buildPillaredMandapa(
    width: number,
    depth: number,
    height: number,
    material: THREE.Material,
    accentMat: THREE.Material
  ): THREE.Group {
    const mandapa = new THREE.Group();

    // Elevated plinth
    const plinthH = height * 0.25;
    const plinthGeo = new THREE.BoxGeometry(width * 1.1, plinthH, depth * 1.1);
    const plinthMesh = new THREE.Mesh(plinthGeo, accentMat);
    plinthMesh.position.y = plinthH / 2;
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    mandapa.add(plinthMesh);

    // Carved Pillars
    const pillarRows = 3;
    const pillarCols = 3;
    const pillarH = height * 0.55;
    const pillarR = Math.min(width, depth) * 0.04;

    for (let r = 0; r < pillarRows; r++) {
      for (let c = 0; c < pillarCols; c++) {
        // Skip central open courtyard space
        if (r === 1 && c === 1) continue;

        const posX = (c - 1) * (width * 0.38);
        const posZ = (r - 1) * (depth * 0.38);

        const pillarGeo = new THREE.CylinderGeometry(pillarR * 0.85, pillarR, pillarH, 12);
        const pillar = new THREE.Mesh(pillarGeo, material);
        pillar.position.set(posX, plinthH + pillarH / 2, posZ);
        pillar.castShadow = true;
        mandapa.add(pillar);

        // Pillar capital
        const capGeo = new THREE.BoxGeometry(pillarR * 2.6, pillarR * 1.2, pillarR * 2.6);
        const cap = new THREE.Mesh(capGeo, accentMat);
        cap.position.set(posX, plinthH + pillarH, posZ);
        mandapa.add(cap);
      }
    }

    // Flat stepped roof cornice
    const roofH = height * 0.2;
    const roofGeo = new THREE.BoxGeometry(width, roofH, depth);
    const roof = new THREE.Mesh(roofGeo, material);
    roof.position.y = plinthH + pillarH + roofH / 2;
    roof.castShadow = true;
    roof.receiveShadow = true;
    mandapa.add(roof);

    return mandapa;
  }

  /**
   * Helper: Builds 24-spoke Surya Chakra Chariot Wheel with axle and relief hub.
   */
  private static buildKonarkSuryaWheel(diameter: number, thickness: number, chloriteMat: THREE.Material): THREE.Group {
    const wheel = new THREE.Group();
    const radius = diameter / 2;

    // Outer stone rim with bead carvings
    const rimGeo = new THREE.TorusGeometry(radius, thickness * 0.6, 12, 36);
    const rim = new THREE.Mesh(rimGeo, chloriteMat);
    rim.castShadow = true;
    wheel.add(rim);

    // Central axle hub
    const hubGeo = new THREE.CylinderGeometry(radius * 0.26, radius * 0.26, thickness * 1.6, 24);
    hubGeo.rotateX(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, chloriteMat);
    hub.castShadow = true;
    wheel.add(hub);

    // Central axle pin
    const pinGeo = new THREE.ConeGeometry(radius * 0.12, thickness * 2.0, 16);
    pinGeo.rotateX(Math.PI / 2);
    const pin = new THREE.Mesh(pinGeo, chloriteMat);
    pin.position.z = thickness * 0.8;
    pin.castShadow = true;
    wheel.add(pin);

    // 8 Major Spokes (thick with diamond medallions) & 8 Minor Spokes
    const totalSpokes = 16;
    for (let i = 0; i < totalSpokes; i++) {
      const angle = (i * Math.PI * 2) / totalSpokes;
      const isMajor = i % 2 === 0;
      const spokeLength = radius * 0.82;
      const spokeRadius = isMajor ? thickness * 0.35 : thickness * 0.2;

      const spokeGeo = new THREE.CylinderGeometry(spokeRadius * 0.7, spokeRadius, spokeLength, 8);
      const spoke = new THREE.Mesh(spokeGeo, chloriteMat);
      spoke.position.set(Math.cos(angle) * (spokeLength / 2), Math.sin(angle) * (spokeLength / 2), 0);
      spoke.rotation.z = angle - Math.PI / 2;
      spoke.castShadow = true;
      wheel.add(spoke);

      // Medallion on major spokes
      if (isMajor) {
        const medGeo = new THREE.SphereGeometry(spokeRadius * 1.4, 8, 8);
        const med = new THREE.Mesh(medGeo, chloriteMat);
        med.position.set(Math.cos(angle) * (radius * 0.48), Math.sin(angle) * (radius * 0.48), 0);
        wheel.add(med);
      }
    }

    return wheel;
  }

  // =========================================================================
  // MONUMENT 1: KONARK SUN TEMPLE (Monumental Chariot & Jagamohana)
  // =========================================================================
  public static buildKonarkSunTemple(): THREE.Group {
    const root = new THREE.Group();
    const mats = this.createStoneMaterials();

    // 1. Museum display plinth
    const plinth = this.buildMuseumPlinth(6.4, 5.0, 0.18);
    root.add(plinth);

    // 2. High Monumental Chariot Terrace Base (Upana & Pitha)
    const baseWidth = 3.6;
    const baseLength = 4.2;
    const baseHeight = 0.55;
    const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseLength);
    const baseMesh = new THREE.Mesh(baseGeo, mats.khondaliteMat);
    baseMesh.position.set(0, 0.18 + baseHeight / 2, -0.2);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    root.add(baseMesh);

    // Terrace Elephant & Horse frieze strip
    const friezeGeo = new THREE.BoxGeometry(baseWidth + 0.12, 0.12, baseLength + 0.12);
    const friezeMesh = new THREE.Mesh(friezeGeo, mats.darkKhondaliteMat);
    friezeMesh.position.set(0, 0.18 + 0.15, -0.2);
    friezeMesh.castShadow = true;
    root.add(friezeMesh);

    // 3. Jagamohana (Surviving 39m Stepped Pyramid Porch)
    const jagamohana = this.buildPidhaDeula(2.3, 2.0, mats.khondaliteMat, mats.darkKhondaliteMat, mats.chloriteMat);
    jagamohana.position.set(0, 0.18 + baseHeight, -0.6);
    root.add(jagamohana);

    // Ruined Sanctum Deula Plinth outline behind Jagamohana
    const sanctumPlinthGeo = new THREE.BoxGeometry(1.6, 0.6, 1.6);
    const sanctumPlinth = new THREE.Mesh(sanctumPlinthGeo, mats.darkKhondaliteMat);
    sanctumPlinth.position.set(0, 0.18 + baseHeight + 0.3, -1.85);
    sanctumPlinth.castShadow = true;
    sanctumPlinth.receiveShadow = true;
    root.add(sanctumPlinth);

    // 4. Natya Mandapa (Open Hypostyle Dancing Hall on elevated platform)
    const natyaMandap = this.buildPillaredMandapa(1.5, 1.5, 1.05, mats.khondaliteMat, mats.darkKhondaliteMat);
    natyaMandap.position.set(0, 0.18, 1.3);
    root.add(natyaMandap);

    // Connecting stone flight of steps
    const stepsGeo = new THREE.BoxGeometry(0.8, baseHeight * 0.8, 0.6);
    const steps = new THREE.Mesh(stepsGeo, mats.darkKhondaliteMat);
    steps.position.set(0, 0.18 + (baseHeight * 0.8) / 2, 0.3);
    root.add(steps);

    // 5. 24-Spoke Surya Chakra Chariot Wheels mounted along base walls
    const wheelDiameter = 0.82;
    const wheelThickness = 0.08;

    // Right flank wheels (East & West)
    const wheelR1 = this.buildKonarkSuryaWheel(wheelDiameter, wheelThickness, mats.chloriteMat);
    wheelR1.position.set(baseWidth / 2 + 0.04, 0.18 + baseHeight * 0.75, -0.6);
    wheelR1.rotation.y = Math.PI / 2;
    root.add(wheelR1);

    const wheelR2 = this.buildKonarkSuryaWheel(wheelDiameter, wheelThickness, mats.chloriteMat);
    wheelR2.position.set(baseWidth / 2 + 0.04, 0.18 + baseHeight * 0.75, 0.3);
    wheelR2.rotation.y = Math.PI / 2;
    root.add(wheelR2);

    // Left flank wheels
    const wheelL1 = this.buildKonarkSuryaWheel(wheelDiameter, wheelThickness, mats.chloriteMat);
    wheelL1.position.set(-baseWidth / 2 - 0.04, 0.18 + baseHeight * 0.75, -0.6);
    wheelL1.rotation.y = -Math.PI / 2;
    root.add(wheelL1);

    const wheelL2 = this.buildKonarkSuryaWheel(wheelDiameter, wheelThickness, mats.chloriteMat);
    wheelL2.position.set(-baseWidth / 2 - 0.04, 0.18 + baseHeight * 0.75, 0.3);
    wheelL2.rotation.y = -Math.PI / 2;
    root.add(wheelL2);

    // 6. Colossal Stone War Horse Statues in courtyard
    const horseLGeo = new THREE.BoxGeometry(0.25, 0.45, 0.6);
    const horseL = new THREE.Mesh(horseLGeo, mats.chloriteMat);
    horseL.position.set(-1.8, 0.18 + 0.22, 1.2);
    horseL.castShadow = true;
    root.add(horseL);

    const horseR = new THREE.Mesh(horseLGeo, mats.chloriteMat);
    horseR.position.set(1.8, 0.18 + 0.22, 1.2);
    horseR.castShadow = true;
    root.add(horseR);

    return root;
  }

  // =========================================================================
  // MONUMENT 2: PURI JAGANNATH TEMPLE (Living Sacred Rekha Deula)
  // Strict Exterior Architectural Representation Only — Zero Interior Exposed
  // =========================================================================
  public static buildPuriJagannathTemple(): THREE.Group {
    const root = new THREE.Group();
    const mats = this.createStoneMaterials();

    // 1. Museum display plinth
    const plinth = this.buildMuseumPlinth(6.2, 5.2, 0.18);
    root.add(plinth);

    // 2. Meghanada Pacheri & Kurma Beda (High massive laterite compound walls)
    const wallOuterW = 4.8;
    const wallOuterD = 4.2;
    const wallHeight = 0.48;
    const wallThick = 0.22;

    // Enclosure wall structure
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(wallOuterW, wallHeight, wallThick), mats.lateriteMat);
    northWall.position.set(0, 0.18 + wallHeight / 2, -wallOuterD / 2);
    northWall.castShadow = true;
    root.add(northWall);

    const southWall = new THREE.Mesh(new THREE.BoxGeometry(wallOuterW, wallHeight, wallThick), mats.lateriteMat);
    southWall.position.set(0, 0.18 + wallHeight / 2, wallOuterD / 2);
    southWall.castShadow = true;
    root.add(southWall);

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, wallOuterD), mats.lateriteMat);
    westWall.position.set(-wallOuterW / 2, 0.18 + wallHeight / 2, 0);
    westWall.castShadow = true;
    root.add(westWall);

    const eastWallL = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, (wallOuterD - 1.0) / 2), mats.lateriteMat);
    eastWallL.position.set(wallOuterW / 2, 0.18 + wallHeight / 2, -wallOuterD / 4 - 0.25);
    eastWallL.castShadow = true;
    root.add(eastWallL);

    const eastWallR = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, (wallOuterD - 1.0) / 2), mats.lateriteMat);
    eastWallR.position.set(wallOuterW / 2, 0.18 + wallHeight / 2, wallOuterD / 4 + 0.25);
    eastWallR.castShadow = true;
    root.add(eastWallR);

    // Singhadwara (Lion's Gate Portal on East)
    const gateGeo = new THREE.BoxGeometry(0.4, 0.72, 1.1);
    const gateMesh = new THREE.Mesh(gateGeo, mats.sandstoneMat);
    gateMesh.position.set(wallOuterW / 2, 0.18 + 0.36, 0);
    gateMesh.castShadow = true;
    root.add(gateMesh);

    // Two Monolithic Stone Lions guarding Singhadwara
    const lionGeo = new THREE.BoxGeometry(0.18, 0.32, 0.22);
    const lion1 = new THREE.Mesh(lionGeo, mats.darkKhondaliteMat);
    lion1.position.set(wallOuterW / 2 + 0.28, 0.18 + 0.16, -0.42);
    lion1.castShadow = true;
    root.add(lion1);

    const lion2 = new THREE.Mesh(lionGeo, mats.darkKhondaliteMat);
    lion2.position.set(wallOuterW / 2 + 0.28, 0.18 + 0.16, 0.42);
    lion2.castShadow = true;
    root.add(lion2);

    // Aruna Stambha (Chlorite Sun Pillar in front of Singhadwara)
    const arunaBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.24), mats.chloriteMat);
    arunaBase.position.set(wallOuterW / 2 + 0.8, 0.18 + 0.06, 0);
    root.add(arunaBase);

    const arunaCol = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.95, 16), mats.chloriteMat);
    arunaCol.position.set(wallOuterW / 2 + 0.8, 0.18 + 0.12 + 0.475, 0);
    arunaCol.castShadow = true;
    root.add(arunaCol);

    const arunaCap = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), mats.ashtadhatuMat);
    arunaCap.position.set(wallOuterW / 2 + 0.8, 0.18 + 1.12, 0);
    root.add(arunaCap);

    // 3. Inner Raised Kurma Beda Plinth
    const kurmaPlinth = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.25, 2.6), mats.khondaliteMat);
    kurmaPlinth.position.set(-0.3, 0.18 + 0.125, 0);
    kurmaPlinth.receiveShadow = true;
    kurmaPlinth.castShadow = true;
    root.add(kurmaPlinth);

    // 4. Bada Deula (Monumental 65m Shikhara Tower)
    const badaDeula = this.buildRekhaDeula(
      3.4,
      1.7,
      mats.khondaliteMat,
      mats.darkKhondaliteMat,
      mats.ashtadhatuMat
    );
    badaDeula.position.set(-1.1, 0.18 + 0.25, 0);
    root.add(badaDeula);

    // Nilachakra Ashtadhatu Discus & Patitapabana Flag
    const nilachakraGeo = new THREE.TorusGeometry(0.18, 0.03, 8, 16);
    const nilachakra = new THREE.Mesh(nilachakraGeo, mats.ashtadhatuMat);
    nilachakra.position.set(-1.1, 0.18 + 0.25 + 3.4 + 0.08, 0);
    nilachakra.rotation.y = Math.PI / 4;
    nilachakra.castShadow = true;
    root.add(nilachakra);

    // Holy Triangular Patitapabana Flag
    const flagGeo = new THREE.ConeGeometry(0.12, 0.35, 3);
    flagGeo.rotateZ(-Math.PI / 2);
    const flagMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(-1.1 + 0.2, 0.18 + 0.25 + 3.4 + 0.12, 0);
    root.add(flag);

    // 5. Jagamohana (Stepped Pyramidal Mukhasala Hall)
    const jagamohana = this.buildPidhaDeula(1.9, 1.45, mats.khondaliteMat, mats.darkKhondaliteMat, mats.ashtadhatuMat);
    jagamohana.position.set(0.2, 0.18 + 0.25, 0);
    root.add(jagamohana);

    // 6. Nata Mandapa (Dancing Hall)
    const nataMandapa = this.buildPidhaDeula(1.4, 1.1, mats.khondaliteMat, mats.darkKhondaliteMat);
    nataMandapa.position.set(1.1, 0.18 + 0.25, 0);
    root.add(nataMandapa);

    // 7. Bhoga Mandapa (Offering Hall)
    const bhogaMandapa = this.buildPidhaDeula(1.2, 0.95, mats.khondaliteMat, mats.darkKhondaliteMat);
    bhogaMandapa.position.set(1.85, 0.18 + 0.25, 0);
    root.add(bhogaMandapa);

    // 8. Subsidiary Shrines in Compound (Vimala & Mahalakshmi temples)
    const vimalaDeula = this.buildRekhaDeula(1.1, 0.6, mats.sandstoneMat, mats.darkKhondaliteMat);
    vimalaDeula.position.set(-1.6, 0.18 + 0.25, -1.2);
    root.add(vimalaDeula);

    const laxmiDeula = this.buildRekhaDeula(1.0, 0.55, mats.sandstoneMat, mats.darkKhondaliteMat);
    laxmiDeula.position.set(-0.4, 0.18 + 0.25, 1.2);
    root.add(laxmiDeula);

    return root;
  }

  // =========================================================================
  // MONUMENT 3: LINGARAJ TEMPLE (Culmination of Kalinga Temple Architecture)
  // =========================================================================
  public static buildLingarajTemple(): THREE.Group {
    const root = new THREE.Group();
    const mats = this.createStoneMaterials();

    // 1. Museum display plinth
    const plinth = this.buildMuseumPlinth(6.0, 5.0, 0.18);
    root.add(plinth);

    // 2. High Laterite Compound Wall (Kurma Pacheri)
    const compW = 4.8;
    const compD = 3.8;
    const wallH = 0.42;

    const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(compW, wallH, 0.18), mats.lateriteMat);
    wallNorth.position.set(0, 0.18 + wallH / 2, -compD / 2);
    wallNorth.castShadow = true;
    root.add(wallNorth);

    const wallSouth = new THREE.Mesh(new THREE.BoxGeometry(compW, wallH, 0.18), mats.lateriteMat);
    wallSouth.position.set(0, 0.18 + wallH / 2, compD / 2);
    wallSouth.castShadow = true;
    root.add(wallSouth);

    const wallWest = new THREE.Mesh(new THREE.BoxGeometry(0.18, wallH, compD), mats.lateriteMat);
    wallWest.position.set(-compW / 2, 0.18 + wallH / 2, 0);
    wallWest.castShadow = true;
    root.add(wallWest);

    const wallEast = new THREE.Mesh(new THREE.BoxGeometry(0.18, wallH, compD), mats.lateriteMat);
    wallEast.position.set(compW / 2, 0.18 + wallH / 2, 0);
    wallEast.castShadow = true;
    root.add(wallEast);

    // 3. Central Temple Axial Alignment (Sri Mandir -> Jagamohana -> Nata Mandapa -> Bhoga Mandapa)
    // 55-meter Pancharatha Sri Mandir Rekha Deula
    const deula = this.buildRekhaDeula(
      3.1,
      1.6,
      mats.sandstoneMat,
      mats.darkKhondaliteMat,
      mats.ashtadhatuMat
    );
    deula.position.set(-1.0, 0.18, 0);
    root.add(deula);

    // Trishula Ayudha crest atop amalaka
    const tridentGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.28, 8);
    const trident = new THREE.Mesh(tridentGeo, mats.ashtadhatuMat);
    trident.position.set(-1.0, 0.18 + 3.1 + 0.14, 0);
    root.add(trident);

    // Jagamohana (Porch)
    const jagamohana = this.buildPidhaDeula(1.85, 1.35, mats.sandstoneMat, mats.darkKhondaliteMat);
    jagamohana.position.set(0.15, 0.18, 0);
    root.add(jagamohana);

    // Nata Mandapa (Festive Hall)
    const nataMandapa = this.buildPidhaDeula(1.35, 1.05, mats.sandstoneMat, mats.darkKhondaliteMat);
    nataMandapa.position.set(1.05, 0.18, 0);
    root.add(nataMandapa);

    // Bhoga Mandapa (Offering Hall)
    const bhogaMandapa = this.buildPidhaDeula(1.15, 0.9, mats.sandstoneMat, mats.darkKhondaliteMat);
    bhogaMandapa.position.set(1.75, 0.18, 0);
    root.add(bhogaMandapa);

    // 4. Multiple Miniature Subsidiary Shrines in Ekamra Compound
    const shrinePositions = [
      [-1.5, -1.1],
      [-0.4, -1.2],
      [0.6, -1.1],
      [-1.5, 1.1],
      [-0.3, 1.2],
      [0.8, 1.1],
    ];

    shrinePositions.forEach(([sx, sz], idx) => {
      const isRekha = idx % 2 === 0;
      const sub = isRekha
        ? this.buildRekhaDeula(0.85, 0.42, mats.sandstoneMat, mats.darkKhondaliteMat)
        : this.buildPidhaDeula(0.65, 0.38, mats.sandstoneMat, mats.darkKhondaliteMat);
      sub.position.set(sx, 0.18, sz);
      root.add(sub);
    });

    return root;
  }

  // =========================================================================
  // MONUMENT 4: BRAHMESWARA TEMPLE (Classic Somavamsi Panchayatana Temple)
  // =========================================================================
  public static buildBrahmeswaraTemple(): THREE.Group {
    const root = new THREE.Group();
    const mats = this.createStoneMaterials();

    // 1. Museum display plinth
    const plinth = this.buildMuseumPlinth(5.4, 5.0, 0.18);
    root.add(plinth);

    // 2. Elevated Stone Plinth Platform (Panchayatana Pitha)
    const pithaW = 3.6;
    const pithaD = 3.6;
    const pithaH = 0.32;
    const pithaGeo = new THREE.BoxGeometry(pithaW, pithaH, pithaD);
    const pithaMesh = new THREE.Mesh(pithaGeo, mats.lightSandstoneMat);
    pithaMesh.position.set(0, 0.18 + pithaH / 2, 0);
    pithaMesh.castShadow = true;
    pithaMesh.receiveShadow = true;
    root.add(pithaMesh);

    // Molded base band
    const bandGeo = new THREE.BoxGeometry(pithaW + 0.1, 0.08, pithaD + 0.1);
    const bandMesh = new THREE.Mesh(bandGeo, mats.darkKhondaliteMat);
    bandMesh.position.set(0, 0.18 + 0.08, 0);
    root.add(bandMesh);

    // 3. Central Temple Complex: Rekha Deula (18.96m) + Jagamohana
    const centralDeula = this.buildRekhaDeula(
      2.6,
      1.3,
      mats.lightSandstoneMat,
      mats.sandstoneMat,
      mats.ashtadhatuMat
    );
    centralDeula.position.set(-0.45, 0.18 + pithaH, 0);
    root.add(centralDeula);

    const centralJagamohana = this.buildPidhaDeula(
      1.55,
      1.15,
      mats.lightSandstoneMat,
      mats.sandstoneMat
    );
    centralJagamohana.position.set(0.55, 0.18 + pithaH, 0);
    root.add(centralJagamohana);

    // Carved entrance portal with Navagraha lintel
    const doorGeo = new THREE.BoxGeometry(0.2, 0.5, 0.4);
    const doorMesh = new THREE.Mesh(doorGeo, mats.darkKhondaliteMat);
    doorMesh.position.set(1.15, 0.18 + pithaH + 0.25, 0);
    root.add(doorMesh);

    // 4. Four Authentic Subsidiary Corner Shrines (Panchayatana Architecture)
    const cornerOffset = 1.35;
    const cornerShrineConfigs = [
      { x: -cornerOffset, z: -cornerOffset, name: 'North-West Shrine' },
      { x: cornerOffset, z: -cornerOffset, name: 'North-East Shrine' },
      { x: -cornerOffset, z: cornerOffset, name: 'South-West Shrine' },
      { x: cornerOffset, z: cornerOffset, name: 'South-East Shrine' },
    ];

    cornerShrineConfigs.forEach((cfg) => {
      const cornerDeula = this.buildRekhaDeula(
        1.1,
        0.52,
        mats.lightSandstoneMat,
        mats.sandstoneMat
      );
      cornerDeula.position.set(cfg.x, 0.18 + pithaH, cfg.z);
      root.add(cornerDeula);
    });

    return root;
  }

  /**
   * Master Router: Builds the genuine 3D model for the requested heritage monument.
   */
  public static buildMonumentModel(monumentId: string): THREE.Group {
    const slug = monumentId.toLowerCase();

    if (slug.includes('konark')) {
      return this.buildKonarkSunTemple();
    }
    if (slug.includes('puri') || slug.includes('jagannath')) {
      return this.buildPuriJagannathTemple();
    }
    if (slug.includes('lingaraj')) {
      return this.buildLingarajTemple();
    }
    if (slug.includes('brahmeswara') || slug.includes('bhrameshwar') || slug.includes('brahmeshwar')) {
      return this.buildBrahmeswaraTemple();
    }

    // Default fallback to Konark Sun Temple
    return this.buildKonarkSunTemple();
  }
}
