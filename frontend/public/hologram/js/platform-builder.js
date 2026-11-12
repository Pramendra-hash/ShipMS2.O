/**
 * ShipMS - Futuristic Hologram Emitter Platform & Particle System
 */

class PlatformBuilder {
  constructor(shaders) {
    this.shaders = shaders || window.HologramShaders;
    this.platformGroup = new THREE.Group();
    this.rotators = [];
    this.animatedMaterials = [];
    this.particles = null;
    this.particlePositions = [];
    this.particleVelocities = [];
  }

  build() {
    const baseGroup = new THREE.Group();
    const baseY = -3.8;

    // 1. Concentric Base Rings
    const ringsGroup = this.createConcentricRings(baseY);
    baseGroup.add(ringsGroup);

    // 2. Hologram Radial Grid Disc
    const gridDisc = this.createGridDisc(baseY);
    baseGroup.add(gridDisc);

    // 3. Upward Curved Projection Funnel
    const funnelMesh = this.createProjectionFunnel(baseY);
    baseGroup.add(funnelMesh);

    // 4. Central Core Emitter
    const coreGlow = this.createCoreEmitter(baseY);
    baseGroup.add(coreGlow);

    // 5. Rising Holographic Photon Particles
    const particleSystem = this.createParticleSystem(baseY);
    baseGroup.add(particleSystem);

    this.platformGroup.add(baseGroup);

    return {
      group: this.platformGroup,
      update: (delta, time) => this.update(delta, time)
    };
  }

  createConcentricRings(baseY) {
    const group = new THREE.Group();

    const ringConfigs = [
      { r: 24, tube: 0.12, speed: 0.15, color: 0x00f0ff, opacity: 0.95, hasTicks: true },
      { r: 21, tube: 0.08, speed: -0.22, color: 0x0088ff, opacity: 0.7, hasTicks: false },
      { r: 17, tube: 0.1, speed: 0.3, color: 0x00f0ff, opacity: 0.85, hasTicks: true },
      { r: 13, tube: 0.06, speed: -0.4, color: 0x7df9ff, opacity: 0.75, hasTicks: false },
      { r: 8, tube: 0.08, speed: 0.5, color: 0x00f0ff, opacity: 0.9, hasTicks: true },
      { r: 4, tube: 0.05, speed: -0.7, color: 0x7df9ff, opacity: 0.95, hasTicks: false }
    ];

    ringConfigs.forEach((cfg) => {
      const ringSubGroup = new THREE.Group();
      ringSubGroup.position.y = baseY;

      const torusGeom = new THREE.TorusGeometry(cfg.r, cfg.tube, 8, 80);
      torusGeom.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
        blending: THREE.AdditiveBlending
      });
      const ringMesh = new THREE.Mesh(torusGeom, ringMat);
      ringSubGroup.add(ringMesh);

      if (cfg.hasTicks) {
        const tickCount = 64;
        const tickPoints = [];
        for (let i = 0; i < tickCount; i++) {
          const theta = (i / tickCount) * Math.PI * 2;
          const isMajor = (i % 8 === 0);
          const innerR = cfg.r - (isMajor ? 0.9 : 0.4);
          const outerR = cfg.r + (isMajor ? 0.9 : 0.4);

          const x1 = Math.cos(theta) * innerR;
          const z1 = Math.sin(theta) * innerR;
          const x2 = Math.cos(theta) * outerR;
          const z2 = Math.sin(theta) * outerR;

          tickPoints.push(new THREE.Vector3(x1, 0.02, z1));
          tickPoints.push(new THREE.Vector3(x2, 0.02, z2));
        }

        const tickGeom = new THREE.BufferGeometry().setFromPoints(tickPoints);
        const tickMat = new THREE.LineBasicMaterial({
          color: cfg.color,
          transparent: true,
          opacity: cfg.opacity * 0.75,
          blending: THREE.AdditiveBlending
        });
        const tickLines = new THREE.LineSegments(tickGeom, tickMat);
        ringSubGroup.add(tickLines);
      }

      group.add(ringSubGroup);
      this.rotators.push({ group: ringSubGroup, speed: cfg.speed });
    });

    const haloGeom = new THREE.RingGeometry(23.5, 25.5, 64);
    haloGeom.rotateX(-Math.PI / 2);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const haloMesh = new THREE.Mesh(haloGeom, haloMat);
    haloMesh.position.y = baseY + 0.01;
    group.add(haloMesh);

    return group;
  }

  createGridDisc(baseY) {
    const group = new THREE.Group();
    group.position.y = baseY;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const center = 512;

    ctx.clearRect(0, 0, 1024, 1024);

    const bgGrad = ctx.createRadialGradient(center, center, 40, center, center, 500);
    bgGrad.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
    bgGrad.addColorStop(0.5, 'rgba(0, 136, 255, 0.06)');
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 2;
    for (let r = 50; r <= 480; r += 35) {
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let deg = 0; deg < 360; deg += 15) {
      const rad = (deg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(center + Math.cos(rad) * 60, center + Math.sin(rad) * 60);
      ctx.lineTo(center + Math.cos(rad) * 480, center + Math.sin(rad) * 480);
      ctx.strokeStyle = (deg % 45 === 0) ? 'rgba(0, 240, 255, 0.6)' : 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = (deg % 90 === 0) ? 2.5 : 1;
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let deg = 0; deg < 360; deg += 45) {
      const rad = (deg * Math.PI) / 180;
      const x = center + Math.cos(rad) * 380;
      const y = center + Math.sin(rad) * 380;
      ctx.fillText(`${deg}°`, x, y);
    }

    const gridTexture = new THREE.CanvasTexture(canvas);
    gridTexture.needsUpdate = true;

    const discGeom = new THREE.PlaneGeometry(54, 54);
    discGeom.rotateX(-Math.PI / 2);
    const discMat = new THREE.MeshBasicMaterial({
      map: gridTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const discMesh = new THREE.Mesh(discGeom, discMat);
    group.add(discMesh);

    return group;
  }

  createProjectionFunnel(baseY) {
    const funnelGroup = new THREE.Group();

    const radialSegs = 48;
    const heightSegs = 24;
    const funnelHeight = 5.2;

    const vertices = [];
    const indices = [];
    const uvs = [];

    for (let j = 0; j <= heightSegs; j++) {
      const v = j / heightSegs;
      const y = baseY + v * funnelHeight;

      const radiusExpansion = Math.pow(v, 1.6);
      const rX = 2.5 + radiusExpansion * 12.0;
      const rZ = 2.5 + radiusExpansion * 24.0;

      for (let i = 0; i <= radialSegs; i++) {
        const u = i / radialSegs;
        const theta = u * Math.PI * 2;

        const x = Math.cos(theta) * rX;
        const z = Math.sin(theta) * rZ;

        vertices.push(x, y, z);
        uvs.push(u, v);
      }
    }

    const stride = radialSegs + 1;
    for (let j = 0; j < heightSegs; j++) {
      for (let i = 0; i < radialSegs; i++) {
        const a = j * stride + i;
        const b = a + 1;
        const c = a + stride;
        const d = c + 1;

        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    const funnelGeom = new THREE.BufferGeometry();
    funnelGeom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    funnelGeom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    funnelGeom.setIndex(indices);
    funnelGeom.computeVertexNormals();

    const beamMat = this.shaders.createProjectionBeamMaterial();
    this.animatedMaterials.push(beamMat);
    const funnelMesh = new THREE.Mesh(funnelGeom, beamMat);
    funnelGroup.add(funnelMesh);

    const wireGeom = new THREE.WireframeGeometry(funnelGeom);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
    funnelGroup.add(wireMesh);

    return funnelGroup;
  }

  createCoreEmitter(baseY) {
    const group = new THREE.Group();
    group.position.y = baseY + 0.05;

    const coreGeom = new THREE.SphereGeometry(1.8, 24, 16);
    coreGeom.scale(1.2, 0.4, 1.2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x7df9ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    group.add(coreMesh);

    const beamCylinder = new THREE.CylinderGeometry(0.6, 2.2, 5.0, 16, 1, true);
    beamCylinder.translate(0, 2.5, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const beamMesh = new THREE.Mesh(beamCylinder, beamMat);
    group.add(beamMesh);

    return group;
  }

  createParticleSystem(baseY) {
    const particleCount = 450;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    this.particlePositions = [];
    this.particleVelocities = [];

    const baseCol1 = new THREE.Color(0x00f0ff);
    const baseCol2 = new THREE.Color(0x7df9ff);
    const baseCol3 = new THREE.Color(0x0088ff);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.0 + Math.random() * 22.0;
      const x = Math.cos(angle) * radius;
      const y = baseY + Math.random() * 16.0;
      const z = (Math.random() - 0.5) * 55.0;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      this.particlePositions.push({ x, y, z, baseAngle: angle, baseR: radius });
      this.particleVelocities.push({
        vy: 0.8 + Math.random() * 1.5,
        vRot: (Math.random() - 0.5) * 0.4
      });

      const randColor = Math.random();
      const col = randColor > 0.6 ? baseCol1 : randColor > 0.3 ? baseCol2 : baseCol3;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = 2.0 + Math.random() * 3.5;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(0, 240, 255, 0.8)');
    grad.addColorStop(0.7, 'rgba(0, 136, 255, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    const particleTexture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.6,
      map: particleTexture,
      transparent: true,
      opacity: 0.75,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geom, mat);
    return this.particles;
  }

  update(delta, time) {
    if (this.rotators) {
      for (let i = 0; i < this.rotators.length; i++) {
        const rot = this.rotators[i];
        if (rot && rot.group) {
          rot.group.rotation.y += rot.speed * delta;
        }
      }
    }

    if (this.animatedMaterials) {
      for (let i = 0; i < this.animatedMaterials.length; i++) {
        const mat = this.animatedMaterials[i];
        if (mat && mat.uniforms && mat.uniforms.uTime) {
          mat.uniforms.uTime.value = time;
        }
      }
    }

    if (this.particles && this.particles.geometry) {
      const posAttr = this.particles.geometry.attributes.position;
      if (posAttr) {
        const positions = posAttr.array;
        const count = this.particlePositions.length;
        const baseY = -3.8;
        const maxY = 14.0;

        for (let i = 0; i < count; i++) {
          const p = this.particlePositions[i];
          const v = this.particleVelocities[i];

          p.y += v.vy * delta;
          p.baseAngle += v.vRot * delta;
          p.x = Math.cos(p.baseAngle) * p.baseR;

          if (p.y > maxY) {
            p.y = baseY + Math.random() * 0.8;
          }

          positions[i * 3] = p.x;
          positions[i * 3 + 1] = p.y;
          positions[i * 3 + 2] = p.z;
        }

        posAttr.needsUpdate = true;
      }
    }
  }
}

if (typeof window !== 'undefined') window.PlatformBuilder = PlatformBuilder;
if (typeof module !== 'undefined') module.exports = PlatformBuilder;
