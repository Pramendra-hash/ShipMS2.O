/**
 * ShipMS - High Detail 3D Holographic Container Ship Model Builder
 * Procedurally generates an ultra-detailed modern container vessel.
 */

class ShipBuilder {
  constructor(shaders) {
    this.shaders = shaders || window.HologramShaders;
    this.shipGroup = new THREE.Group();
    this.radarRotators = [];
    this.animatedMaterials = [];
  }

  build() {
    const ship = new THREE.Group();

    // 1. Hull Structure
    const hullGroup = this.createHull();
    ship.add(hullGroup);

    // 2. Cargo Stacks & Containers
    const cargoGroup = this.createCargoSection();
    ship.add(cargoGroup);

    // 3. Superstructure & Bridge
    const bridgeGroup = this.createSuperstructure();
    ship.add(bridgeGroup);

    // 4. Forecastle & Mooring Gear
    const forecastleGroup = this.createForecastleEquipment();
    ship.add(forecastleGroup);

    // 5. Deck Equipment & Lifeboats
    const safetyGroup = this.createDeckEquipment();
    ship.add(safetyGroup);

    // 6. Hull Typography & Waterline
    const graphicsGroup = this.createHullGraphics();
    ship.add(graphicsGroup);

    // Positioning
    ship.position.set(0, 0.5, 0);
    this.shipGroup.add(ship);

    return {
      group: this.shipGroup,
      radarRotators: this.radarRotators,
      animatedMaterials: this.animatedMaterials,
      materials: this.animatedMaterials,
      update: (delta, time) => this.update(delta, time)
    };
  }

  createHoloMesh(geometry, bodyMatOptions, edgeColor, edgeOpacity) {
    bodyMatOptions = bodyMatOptions || {};
    edgeColor = edgeColor !== undefined ? edgeColor : 0x00f0ff;
    edgeOpacity = edgeOpacity !== undefined ? edgeOpacity : 0.9;

    const group = new THREE.Group();

    const bodyMat = this.shaders.createHologramMaterial(bodyMatOptions);
    this.animatedMaterials.push(bodyMat);
    const mesh = new THREE.Mesh(geometry, bodyMat);
    group.add(mesh);

    const edges = new THREE.EdgesGeometry(geometry, 20);
    const lineMat = this.shaders.createWireframeEdgeMaterial(edgeColor, edgeOpacity);
    const line = new THREE.LineSegments(edges, lineMat);
    group.add(line);

    return group;
  }

  createHull() {
    const hullGroup = new THREE.Group();
    const hullLength = 54;
    const beam = 9.2;
    const depth = 5.2;
    const halfL = hullLength / 2;

    // Custom Lofted Hull Geometry
    const hullGeom = new THREE.BufferGeometry();
    const lengthSegs = 36;
    const heightSegs = 14;
    const vertices = [];
    const indices = [];
    const uvs = [];

    // Right (Starboard) side
    for (let j = 0; j <= heightSegs; j++) {
      const v = j / heightSegs;
      const y = -depth / 2 + v * depth;

      for (let i = 0; i <= lengthSegs; i++) {
        const u = i / lengthSegs;
        const z = -halfL + u * hullLength;
        const zn = z / halfL;

        let widthFactor = 1.0;
        if (zn > 0.25) {
          const bowT = (zn - 0.25) / 0.75;
          widthFactor = Math.cos(bowT * Math.PI * 0.46);
          const flare = Math.pow(v, 2.0) * 0.4 * bowT;
          widthFactor = Math.max(0.05, widthFactor + flare);
        } else if (zn < -0.55) {
          const sternT = (-0.55 - zn) / 0.45;
          widthFactor = 1.0 - sternT * 0.38;
          if (v < 0.3) {
            widthFactor *= (0.2 + 0.8 * (v / 0.3));
          }
        }

        let x = (beam / 2) * widthFactor * (v === 0 ? 0.08 : 1.0);
        let yOffset = 0;
        if (zn > 0.45) {
          const sheerT = (zn - 0.45) / 0.55;
          yOffset = Math.pow(sheerT, 2.0) * 1.5 * v;
        }

        vertices.push(x, y + yOffset, z);
        uvs.push(u, v);
      }
    }

    const stride = lengthSegs + 1;
    const vertexCountHalf = (heightSegs + 1) * stride;

    // Left (Port) side
    for (let j = 0; j <= heightSegs; j++) {
      const v = j / heightSegs;
      const y = -depth / 2 + v * depth;

      for (let i = 0; i <= lengthSegs; i++) {
        const u = i / lengthSegs;
        const z = -halfL + u * hullLength;
        const zn = z / halfL;

        let widthFactor = 1.0;
        if (zn > 0.25) {
          const bowT = (zn - 0.25) / 0.75;
          widthFactor = Math.cos(bowT * Math.PI * 0.46);
          const flare = Math.pow(v, 2.0) * 0.4 * bowT;
          widthFactor = Math.max(0.05, widthFactor + flare);
        } else if (zn < -0.55) {
          const sternT = (-0.55 - zn) / 0.45;
          widthFactor = 1.0 - sternT * 0.38;
          if (v < 0.3) {
            widthFactor *= (0.2 + 0.8 * (v / 0.3));
          }
        }

        let x = -(beam / 2) * widthFactor * (v === 0 ? 0.08 : 1.0);
        let yOffset = 0;
        if (zn > 0.45) {
          const sheerT = (zn - 0.45) / 0.55;
          yOffset = Math.pow(sheerT, 2.0) * 1.5 * v;
        }

        vertices.push(x, y + yOffset, z);
        uvs.push(u, v);
      }
    }

    // Indices Starboard
    for (let j = 0; j < heightSegs; j++) {
      for (let i = 0; i < lengthSegs; i++) {
        const a = j * stride + i;
        const b = a + 1;
        const c = a + stride;
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    // Indices Port
    const offset = vertexCountHalf;
    for (let j = 0; j < heightSegs; j++) {
      for (let i = 0; i < lengthSegs; i++) {
        const a = offset + j * stride + i;
        const b = a + 1;
        const c = a + stride;
        const d = c + 1;
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    // Transom Stern
    const sternA_R = heightSegs * stride;
    const sternB_R = 0;
    const sternA_L = offset + heightSegs * stride;
    const sternB_L = offset;
    indices.push(sternA_R, sternB_R, sternA_L);
    indices.push(sternB_R, sternB_L, sternA_L);

    // Deck Floor Cap
    for (let i = 0; i < lengthSegs; i++) {
      const topR1 = heightSegs * stride + i;
      const topR2 = topR1 + 1;
      const topL1 = offset + heightSegs * stride + i;
      const topL2 = topL1 + 1;
      indices.push(topR1, topR2, topL1);
      indices.push(topR2, topL2, topL1);
    }

    hullGeom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    hullGeom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    hullGeom.setIndex(indices);
    hullGeom.computeVertexNormals();

    const mainHull = this.createHoloMesh(hullGeom, { opacity: 0.45, fresnelIntensity: 2.2 }, 0x00f0ff, 0.95);
    hullGroup.add(mainHull);

    // Bulbous Bow
    const bulbGeom = new THREE.SphereGeometry(1.3, 16, 12);
    bulbGeom.scale(0.85, 1.05, 2.6);
    const bulbMesh = this.createHoloMesh(bulbGeom, { opacity: 0.55 }, 0x7df9ff, 0.95);
    bulbMesh.position.set(0, -depth / 2 + 0.4, halfL - 0.2);
    hullGroup.add(bulbMesh);

    // Bow Prow Knife Edge
    const prowLinePoints = [
      new THREE.Vector3(0, -depth / 2 + 0.4, halfL + 1.8),
      new THREE.Vector3(0, -depth / 2 + 1.3, halfL + 0.8),
      new THREE.Vector3(0, depth / 2 + 1.5, halfL - 0.1)
    ];
    const prowGeom = new THREE.BufferGeometry().setFromPoints(prowLinePoints);
    const prowLine = new THREE.Line(prowGeom, this.shaders.createWireframeEdgeMaterial(0x7df9ff, 1.0));
    hullGroup.add(prowLine);

    // Rudder and Propeller Hub
    const rudderGeom = new THREE.BoxGeometry(0.25, 2.4, 2.0);
    const rudder = this.createHoloMesh(rudderGeom, { opacity: 0.5 }, 0x00f0ff, 0.85);
    rudder.position.set(0, -depth / 2 + 1.1, -halfL + 1.2);
    hullGroup.add(rudder);

    const propHubGeom = new THREE.CylinderGeometry(0.45, 0.45, 1.3, 12);
    propHubGeom.rotateX(Math.PI / 2);
    const propHub = this.createHoloMesh(propHubGeom, { opacity: 0.65 }, 0x7df9ff, 0.95);
    propHub.position.set(0, -depth / 2 + 1.0, -halfL + 2.6);
    hullGroup.add(propHub);

    return hullGroup;
  }

  createCargoSection() {
    const cargoGroup = new THREE.Group();
    const contW = 1.1;
    const contH = 1.12;
    const contL = 3.8;

    const numBays = 8;
    const maxRows = 7;
    const maxTiers = 4;
    const deckY = 2.6;

    const containerGeom = new THREE.BoxGeometry(contW * 0.94, contH * 0.94, contL * 0.94);
    const startZ = -9.0;
    const baySpacing = contL + 0.5;

    for (let b = 0; b < numBays; b++) {
      const bayZ = startZ + b * baySpacing;
      let availableRows = maxRows;
      let availableTiers = maxTiers;

      if (b >= numBays - 2) {
        availableRows = 5;
        availableTiers = 3;
      } else if (b === numBays - 1) {
        availableRows = 3;
        availableTiers = 2;
      }

      const bayGroup = new THREE.Group();

      for (let r = 0; r < availableRows; r++) {
        const x = (r - (availableRows - 1) / 2) * contW;

        for (let t = 0; t < availableTiers; t++) {
          const y = deckY + (t + 0.5) * contH;
          const tint = (b * 3 + r * 5 + t * 7) % 3;
          let col = 0x00e1ff;
          if (tint === 1) col = 0x00bfff;
          if (tint === 2) col = 0x38bdf8;

          const container = this.createHoloMesh(
            containerGeom,
            { color: new THREE.Color(col), opacity: 0.42, innerGlow: 0.3 },
            0x00f0ff,
            0.85
          );
          container.position.set(x, y, bayZ);
          bayGroup.add(container);
        }
      }

      // Lashing Towers
      if (b < numBays - 1) {
        const lashingZ = bayZ + baySpacing / 2;
        const lashingGeom = new THREE.BoxGeometry(availableRows * contW + 0.4, maxTiers * contH * 0.9, 0.15);
        const lashingMesh = this.createHoloMesh(lashingGeom, { opacity: 0.25 }, 0x00a8ff, 0.7);
        lashingMesh.position.set(0, deckY + (maxTiers * contH * 0.9) / 2, lashingZ);
        bayGroup.add(lashingMesh);
      }

      cargoGroup.add(bayGroup);
    }

    return cargoGroup;
  }

  createSuperstructure() {
    const bridgeGroup = new THREE.Group();
    const bridgeZ = -16.5;
    const deckY = 2.6;

    const blockWidth = 7.8;
    const blockLength = 6.4;
    const floorHeight = 1.15;

    // Lower Floors
    const lowerBlockGeom = new THREE.BoxGeometry(blockWidth, floorHeight * 3, blockLength);
    const lowerBlock = this.createHoloMesh(lowerBlockGeom, { opacity: 0.48 }, 0x00f0ff, 0.9);
    lowerBlock.position.set(0, deckY + (floorHeight * 3) / 2, bridgeZ);
    bridgeGroup.add(lowerBlock);

    // Officers Deck
    const midBlockGeom = new THREE.BoxGeometry(blockWidth - 0.6, floorHeight, blockLength - 0.6);
    const midBlock = this.createHoloMesh(midBlockGeom, { opacity: 0.5 }, 0x00f0ff, 0.9);
    midBlock.position.set(0, deckY + floorHeight * 3.5, bridgeZ);
    bridgeGroup.add(midBlock);

    // Bridge Deck & Wings
    const bridgeWingsWidth = 11.4;
    const bridgeCabinGeom = new THREE.BoxGeometry(bridgeWingsWidth, floorHeight * 1.1, 3.4);
    const bridgeCabin = this.createHoloMesh(bridgeCabinGeom, { opacity: 0.55 }, 0x7df9ff, 1.0);
    const bridgeCabinY = deckY + floorHeight * 4.55;
    bridgeCabin.position.set(0, bridgeCabinY, bridgeZ + 0.8);
    bridgeGroup.add(bridgeCabin);

    // Glowing Panoramic Window Strip
    const windowGeom = new THREE.BoxGeometry(bridgeWingsWidth * 0.95, 0.5, 3.5);
    const windowMat = this.shaders.createHologramMaterial({
      color: new THREE.Color(0x7df9ff),
      opacity: 0.9,
      innerGlow: 0.85
    });
    this.animatedMaterials.push(windowMat);
    const windowMesh = new THREE.Mesh(windowGeom, windowMat);
    windowMesh.position.set(0, bridgeCabinY + 0.1, bridgeZ + 0.8);
    bridgeGroup.add(windowMesh);

    // Radar Mast & Rotating Scanners
    const roofY = bridgeCabinY + floorHeight * 0.55;
    const mastHeight = 4.8;
    const mastGeom = new THREE.CylinderGeometry(0.12, 0.3, mastHeight, 8);
    const mainMast = this.createHoloMesh(mastGeom, { opacity: 0.65 }, 0x00f0ff, 0.95);
    mainMast.position.set(0, roofY + mastHeight / 2, bridgeZ + 0.5);
    bridgeGroup.add(mainMast);

    const yardArm1Geom = new THREE.BoxGeometry(3.4, 0.08, 0.08);
    const yardArm1 = this.createHoloMesh(yardArm1Geom, { opacity: 0.75 }, 0x7df9ff, 1.0);
    yardArm1.position.set(0, roofY + mastHeight * 0.7, bridgeZ + 0.5);
    bridgeGroup.add(yardArm1);

    // Primary Rotating Radar Scanner
    const radarBar1Geom = new THREE.BoxGeometry(2.4, 0.16, 0.22);
    const radarBar1 = this.createHoloMesh(radarBar1Geom, { opacity: 0.9 }, 0x7df9ff, 1.0);
    radarBar1.position.set(0, roofY + mastHeight + 0.2, bridgeZ + 0.5);
    bridgeGroup.add(radarBar1);
    this.radarRotators.push({ mesh: radarBar1, speed: 2.8 });

    // Secondary Rotating Radar Scanner
    const radarBar2Geom = new THREE.BoxGeometry(1.5, 0.14, 0.18);
    const radarBar2 = this.createHoloMesh(radarBar2Geom, { opacity: 0.9 }, 0x00f0ff, 1.0);
    radarBar2.position.set(0, roofY + mastHeight * 0.78, bridgeZ + 0.9);
    bridgeGroup.add(radarBar2);
    this.radarRotators.push({ mesh: radarBar2, speed: -3.8 });

    // SATCOM Radomes
    for (let side of [-1.8, 1.8]) {
      const domeGeom = new THREE.SphereGeometry(0.48, 12, 12);
      const dome = this.createHoloMesh(domeGeom, { opacity: 0.7, innerGlow: 0.6 }, 0x7df9ff, 0.95);
      dome.position.set(side, roofY + 0.8, bridgeZ + 1.2);
      bridgeGroup.add(dome);
    }

    // Exhaust Funnels
    const funnelZ = bridgeZ - 2.2;
    const funnelHeight = 3.8;
    for (let side of [-1.6, 1.6]) {
      const funnelGeom = new THREE.CylinderGeometry(0.55, 0.75, funnelHeight, 8);
      funnelGeom.rotateX(-0.15);
      const funnel = this.createHoloMesh(funnelGeom, { opacity: 0.52 }, 0x00f0ff, 0.9);
      funnel.position.set(side, deckY + floorHeight * 3 + funnelHeight / 2 - 0.5, funnelZ);
      bridgeGroup.add(funnel);
    }

    return bridgeGroup;
  }

  createForecastleEquipment() {
    const forecastleGroup = new THREE.Group();
    const bowDeckZ = 22.0;
    const deckY = 3.4;

    // Breakwater
    const bwShape = new THREE.Shape();
    bwShape.moveTo(-3.2, 0);
    bwShape.lineTo(0, 1.2);
    bwShape.lineTo(3.2, 0);
    bwShape.lineTo(2.9, -0.2);
    bwShape.lineTo(0, 0.9);
    bwShape.lineTo(-2.9, -0.2);
    bwShape.closePath();

    const bwGeom = new THREE.ExtrudeGeometry(bwShape, { depth: 0.2, bevelEnabled: false });
    bwGeom.rotateX(Math.PI / 2);
    const breakwater = this.createHoloMesh(bwGeom, { opacity: 0.6 }, 0x00f0ff, 0.95);
    breakwater.position.set(0, deckY + 0.1, bowDeckZ - 1.8);
    forecastleGroup.add(breakwater);

    // Forward Signal Mast
    const fwdMastHeight = 5.4;
    const fwdMastGeom = new THREE.CylinderGeometry(0.08, 0.18, fwdMastHeight, 8);
    fwdMastGeom.rotateX(-0.08);
    const fwdMast = this.createHoloMesh(fwdMastGeom, { opacity: 0.7 }, 0x7df9ff, 1.0);
    fwdMast.position.set(0, deckY + fwdMastHeight / 2, bowDeckZ + 1.2);
    forecastleGroup.add(fwdMast);

    return forecastleGroup;
  }

  createDeckEquipment() {
    const group = new THREE.Group();
    const bridgeZ = -16.5;
    const deckY = 2.6;

    const lifeboatGeom = new THREE.CylinderGeometry(0.45, 0.4, 2.2, 8);
    lifeboatGeom.scale(0.8, 0.9, 1.0);
    lifeboatGeom.rotateX(Math.PI / 2);

    for (let side of [-4.3, 4.3]) {
      const davitGeom = new THREE.BoxGeometry(0.12, 1.6, 2.4);
      const davit = this.createHoloMesh(davitGeom, { opacity: 0.45 }, 0x00a8ff, 0.75);
      davit.position.set(side, deckY + 3.2, bridgeZ + 0.2);
      group.add(davit);

      const lifeboat = this.createHoloMesh(lifeboatGeom, { opacity: 0.75, innerGlow: 0.6 }, 0x7df9ff, 1.0);
      lifeboat.position.set(side + (side > 0 ? 0.35 : -0.35), deckY + 3.0, bridgeZ + 0.2);
      group.add(lifeboat);
    }

    return group;
  }

  createHullGraphics() {
    const group = new THREE.Group();

    const createTextTexture = (text, subtitle) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.95)';
      ctx.font = 'bold 64px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 512, 110);

      if (subtitle) {
        ctx.font = '32px monospace';
        ctx.fillStyle = 'rgba(125, 249, 255, 0.85)';
        ctx.fillText(subtitle, 512, 180);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const textTexture = createTextTexture('OCEAN EXPLORER', 'IMO 9839246 // SHIPMS');
    const textMat = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const textGeom = new THREE.PlaneGeometry(8.5, 2.1);

    const textMeshR = new THREE.Mesh(textGeom, textMat);
    textMeshR.position.set(3.5, 1.2, 14.5);
    textMeshR.rotation.y = Math.PI / 2 - 0.22;
    group.add(textMeshR);

    const textMeshL = new THREE.Mesh(textGeom, textMat);
    textMeshL.position.set(-3.5, 1.2, 14.5);
    textMeshL.rotation.y = -Math.PI / 2 + 0.22;
    textMeshL.rotation.y += Math.PI;
    group.add(textMeshL);

    return group;
  }

  update(delta, time) {
    if (this.radarRotators) {
      for (let i = 0; i < this.radarRotators.length; i++) {
        const item = this.radarRotators[i];
        if (item && item.mesh) {
          item.mesh.rotation.y += item.speed * delta;
        }
      }
    }

    const flicker = 0.96 + Math.random() * 0.08;
    if (this.animatedMaterials) {
      for (let i = 0; i < this.animatedMaterials.length; i++) {
        const mat = this.animatedMaterials[i];
        if (mat && mat.uniforms) {
          if (mat.uniforms.uTime) mat.uniforms.uTime.value = time;
          if (mat.uniforms.uFlicker) mat.uniforms.uFlicker.value = flicker;
        }
      }
    }
  }
}

if (typeof window !== 'undefined') window.ShipBuilder = ShipBuilder;
if (typeof module !== 'undefined') module.exports = ShipBuilder;
