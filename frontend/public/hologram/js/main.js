/**
 * ShipMS - Main Holographic Application Controller
 * Handles Three.js Scene, Camera, OrbitControls, Post-Processing (Bloom),
 * Organic Floating Physics, and Interactive HUD Controls.
 */

class ShipMSApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.composer = null;
    this.bloomPass = null;

    this.shipBuilder = null;
    this.platformBuilder = null;
    this.shipData = null;
    this.platformData = null;
    this.shipGroup = null;

    this.clock = new THREE.Clock();
    this.isAutoRotating = false;
    this.isWireframeOnly = false;
    this.currentColorIndex = 0;

    // Color themes: Cyan, Emerald, Amber, Plasma
    this.themes = [
      { name: 'CYAN', primary: 0x00f0ff, accent: 0x0088ff, bright: 0x7df9ff },
      { name: 'EMERALD', primary: 0x00ff88, accent: 0x00b359, bright: 0x88ffcc },
      { name: 'AMBER', primary: 0xffaa00, accent: 0xd97706, bright: 0xffdd66 },
      { name: 'PLASMA', primary: 0xbf5af2, accent: 0x7b2cbf, bright: 0xe0aaff }
    ];

    // Default iconic camera viewpoint (matches reference image 3/4 isometric perspective)
    this.defaultCamPos = new THREE.Vector3(34, 18, 38);
    this.defaultTarget = new THREE.Vector3(0, 1.8, 0);

    // Web Audio SFX
    this.audioCtx = null;
    this.soundEnabled = false;

    this.init();
  }

  init() {
    console.log('[ShipMS] Initializing 3D Hologram Scene...');

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020813, 0.006);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.5, 1000);
    this.camera.position.copy(this.defaultCamPos);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls setup
    if (THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.minDistance = 14;
      this.controls.maxDistance = 120;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
      this.controls.target.copy(this.defaultTarget);
      this.controls.update();
    }

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a2040, 1.8);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    keyLight.position.set(20, 30, 20);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x0088ff, 3.0);
    rimLight.position.set(-20, -10, -20);
    this.scene.add(rimLight);

    // 6. Post-Processing Pipeline
    this.setupPostProcessing();

    // 7. Build Hologram Objects
    this.buildWorld();

    // 8. Event Listeners & UI Binding
    this.setupEvents();
    this.setupUI();
    this.setHologramBrightness(0.40);
    this.initSectionLabels();

    console.log('[ShipMS] Hologram Matrix Active and Ready!');

    // 9. Start Render Loop
    this.animate();
  }

  setupPostProcessing() {
    try {
      if (THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass) {
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        // Tuned default bloom parameters for crisp, high-detail visibility
        this.bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(this.width, this.height),
          0.65, // Default balanced bloom strength
          0.35, // Bloom radius
          0.28  // Bloom threshold (prevents washing out 3D details)
        );

        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderPass);
        this.composer.addPass(this.bloomPass);
        console.log('[ShipMS] UnrealBloom Pass enabled');
      } else {
        this.composer = null;
      }
    } catch (e) {
      console.warn('[ShipMS] Post-processing fallback to direct WebGLRenderer:', e);
      this.composer = null;
    }
  }

  buildWorld() {
    // 1. Build Holographic Platform Base
    this.platformBuilder = new PlatformBuilder(HologramShaders);
    this.platformData = this.platformBuilder.build();
    this.scene.add(this.platformData.group);

    // 2. Build 3D Container Ship
    this.shipBuilder = new ShipBuilder(HologramShaders);
    this.shipData = this.shipBuilder.build();
    this.shipGroup = this.shipData.group;
    this.scene.add(this.shipGroup);
  }

  setupEvents() {
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('pointerdown', () => this.initAudio(), { once: true });
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
  }

  playSfx(type) {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'scan') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.35);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'reset') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {}
  }

  setupUI() {
    // 1. Rotate Button
    const btnRotate = document.getElementById('btn-rotate');
    if (btnRotate) {
      btnRotate.addEventListener('click', () => {
        this.isAutoRotating = !this.isAutoRotating;
        if (this.controls) {
          this.controls.autoRotate = this.isAutoRotating;
          this.controls.autoRotateSpeed = 1.4;
        }
        btnRotate.classList.toggle('active', this.isAutoRotating);
        this.playSfx('click');
      });
    }

    // 2. Zoom Button
    const btnZoom = document.getElementById('btn-zoom');
    if (btnZoom) {
      let isZoomedIn = false;
      btnZoom.addEventListener('click', () => {
        isZoomedIn = !isZoomedIn;
        const targetDist = isZoomedIn ? 26 : 52;
        this.smoothZoom(targetDist);
        btnZoom.classList.toggle('active', isZoomedIn);
        this.playSfx('click');
      });
    }

    // 3. Pan / Focus Points Button
    const btnPan = document.getElementById('btn-pan');
    if (btnPan) {
      const panTargets = [
        { name: 'BOW', pos: new THREE.Vector3(18, 10, 24), target: new THREE.Vector3(0, 3, 16) },
        { name: 'SUPERSTRUCTURE', pos: new THREE.Vector3(22, 14, -20), target: new THREE.Vector3(0, 7, -15) },
        { name: 'CARGO', pos: new THREE.Vector3(30, 16, 6), target: new THREE.Vector3(0, 4, 0) },
        { name: 'FULL VIEW', pos: this.defaultCamPos.clone(), target: this.defaultTarget.clone() }
      ];
      let panIndex = 0;

      btnPan.addEventListener('click', () => {
        panIndex = (panIndex + 1) % panTargets.length;
        const pt = panTargets[panIndex];
        this.smoothMoveCamera(pt.pos, pt.target);
        this.playSfx('click');
      });
    }

    // 4. Reset Button
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.isAutoRotating = false;
        if (this.controls) this.controls.autoRotate = false;
        if (btnRotate) btnRotate.classList.remove('active');
        this.smoothMoveCamera(this.defaultCamPos, this.defaultTarget);
        this.playSfx('reset');
      });
    }

    // 5. Scan Pulse Wave
    const btnScan = document.getElementById('btn-scan');
    if (btnScan) {
      btnScan.addEventListener('click', () => {
        this.triggerScanPulse();
        this.playSfx('scan');
      });
    }

    // 6. Wireframe / X-Ray Mode
    const btnWireframe = document.getElementById('btn-wireframe');
    if (btnWireframe) {
      btnWireframe.addEventListener('click', () => {
        this.isWireframeOnly = !this.isWireframeOnly;
        this.setWireframeMode(this.isWireframeOnly);
        btnWireframe.classList.toggle('active', this.isWireframeOnly);
        this.playSfx('click');
      });
    }

    // 7. Color Theme Cycle
    const btnColor = document.getElementById('btn-color');
    if (btnColor) {
      btnColor.addEventListener('click', () => {
        this.currentColorIndex = (this.currentColorIndex + 1) % this.themes.length;
        const currentTheme = this.themes[this.currentColorIndex];
        this.applyTheme(currentTheme);
        btnColor.textContent = `THEME: ${currentTheme.name}`;
        this.playSfx('click');
      });
    }

    // 8. Audio Toggle
    const btnAudio = document.getElementById('btn-audio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        if (this.soundEnabled && !this.audioCtx) this.initAudio();
        btnAudio.textContent = `AUDIO: ${this.soundEnabled ? 'ON' : 'OFF'}`;
        btnAudio.classList.toggle('active', this.soundEnabled);
        this.playSfx('click');
      });
    }

    // 9. Hologram Brightness Volume Slider
    const brightnessSlider = document.getElementById('brightness-slider');
    const brightnessValBadge = document.getElementById('brightness-value');
    if (brightnessSlider) {
      brightnessSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (brightnessValBadge) {
          brightnessValBadge.textContent = `${val}%`;
        }
        this.setHologramBrightness(val / 100);
      });
    }

    // 10. Hotspots Toggle Button
    const btnLabels = document.getElementById('btn-labels');
    if (btnLabels) {
      btnLabels.addEventListener('click', () => {
        this.toggleSectionLabels();
        btnLabels.textContent = `HOTSPOTS: ${this.labelsVisible ? 'ON' : 'OFF'}`;
        btnLabels.classList.toggle('active', this.labelsVisible);
        this.playSfx('click');
      });
    }
  }

  setHologramBrightness(normVal) {
    this.brightness = normVal; // 0.0 (subtle/crisp) to 1.0 (intense neon laser)

    // 1. Smoothly scale Post-Processing Bloom Strength & Threshold
    if (this.bloomPass) {
      // At low brightness: subtle bloom (~0.05) keeps every 3D edge razor sharp
      // At high brightness: bloom increases up to ~2.2 for radiant neon look
      this.bloomPass.strength = 0.05 + Math.pow(normVal, 1.3) * 2.15;
      this.bloomPass.threshold = 0.42 - normVal * 0.30;
    }

    // 2. Adjust Ship Shaders (Fresnel edge intensity, inner translucency, and opacity)
    if (this.shipBuilder && this.shipBuilder.animatedMaterials) {
      for (let i = 0; i < this.shipBuilder.animatedMaterials.length; i++) {
        const mat = this.shipBuilder.animatedMaterials[i];
        if (mat && mat.uniforms) {
          if (mat.uniforms.uFresnelIntensity) {
            mat.uniforms.uFresnelIntensity.value = 0.35 + normVal * 2.5;
          }
          if (mat.uniforms.uInnerGlow) {
            mat.uniforms.uInnerGlow.value = 0.05 + normVal * 0.55;
          }
          if (mat.uniforms.uOpacity) {
            mat.uniforms.uOpacity.value = 0.22 + normVal * 0.45;
          }
        }
      }
    }

    // 3. Adjust Platform Projection Funnel & Emitter Glow
    if (this.platformBuilder && this.platformBuilder.animatedMaterials) {
      for (let i = 0; i < this.platformBuilder.animatedMaterials.length; i++) {
        const mat = this.platformBuilder.animatedMaterials[i];
        if (mat && mat.uniforms && mat.uniforms.uOpacity) {
          mat.uniforms.uOpacity.value = 0.15 + normVal * 0.65;
        }
      }
    }

    // 4. Adjust Background Ambient Fog & Floor Glow
    const ambientGlow = document.querySelector('.holo-ambient-glow');
    if (ambientGlow) {
      ambientGlow.style.opacity = (0.2 + normVal * 0.8).toFixed(2);
    }
  }

  smoothMoveCamera(toPos, toTarget, duration) {
    duration = duration || 1.2;
    const startPos = this.camera.position.clone();
    const startTarget = this.controls ? this.controls.target.clone() : this.defaultTarget.clone();
    let elapsed = 0;

    const animateCam = () => {
      elapsed += 0.02;
      const t = Math.min(elapsed / duration, 1.0);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      this.camera.position.lerpVectors(startPos, toPos, ease);
      if (this.controls) {
        this.controls.target.lerpVectors(startTarget, toTarget, ease);
        this.controls.update();
      }

      if (t < 1.0) {
        requestAnimationFrame(animateCam);
      }
    };
    animateCam();
  }

  smoothZoom(targetDistance, duration) {
    duration = duration || 0.8;
    const target = this.controls ? this.controls.target : this.defaultTarget;
    const dir = new THREE.Vector3().subVectors(this.camera.position, target).normalize();
    const newPos = new THREE.Vector3().addVectors(target, dir.multiplyScalar(targetDistance));
    this.smoothMoveCamera(newPos, target, duration);
  }

  triggerScanPulse() {
    if (this.shipBuilder && this.shipBuilder.animatedMaterials) {
      for (let i = 0; i < this.shipBuilder.animatedMaterials.length; i++) {
        const mat = this.shipBuilder.animatedMaterials[i];
        if (mat && mat.uniforms && mat.uniforms.uFresnelIntensity) {
          const orig = mat.uniforms.uFresnelIntensity.value;
          mat.uniforms.uFresnelIntensity.value = 4.0;
          setTimeout(() => {
            mat.uniforms.uFresnelIntensity.value = orig;
          }, 350);
        }
      }
    }
  }

  setWireframeMode(enabled) {
    if (this.shipBuilder && this.shipBuilder.animatedMaterials) {
      for (let i = 0; i < this.shipBuilder.animatedMaterials.length; i++) {
        const mat = this.shipBuilder.animatedMaterials[i];
        if (mat && mat.uniforms && mat.uniforms.uOpacity) {
          mat.uniforms.uOpacity.value = enabled ? 0.05 : 0.5;
        }
      }
    }
  }

  applyTheme(theme) {
    const primaryCol = new THREE.Color(theme.primary);
    const brightCol = new THREE.Color(theme.bright);

    if (this.shipBuilder && this.shipBuilder.animatedMaterials) {
      for (let i = 0; i < this.shipBuilder.animatedMaterials.length; i++) {
        const mat = this.shipBuilder.animatedMaterials[i];
        if (mat && mat.uniforms && mat.uniforms.uColor) {
          mat.uniforms.uColor.value = primaryCol;
        }
      }
    }

    if (this.platformData && this.platformData.group) {
      this.platformData.group.traverse((obj) => {
        if (obj.material) {
          if (obj.material.color) {
            obj.material.color.setHex(theme.primary);
          }
          if (obj.material.uniforms && obj.material.uniforms.uColor) {
            obj.material.uniforms.uColor.value = brightCol;
          }
        }
      });
    }

    document.documentElement.style.setProperty('--holo-cyan', `#${theme.primary.toString(16).padStart(6, '0')}`);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (this.composer) {
      this.composer.setSize(this.width, this.height);
    }

    if (this.labelsVisible) {
      this.updateSectionLabels();
    }
  }

  /* ==========================================================================
     3D Hologram Interactive Dotted Hotspots & Click-to-View Callouts
     ========================================================================== */
  initSectionLabels() {
    this.labelsContainer = document.getElementById('section-labels-container');
    this.labelsSvg = document.getElementById('labels-svg-overlay');
    this.labelsVisible = true;
    this.activeSectionId = null;

    if (!this.labelsContainer || !this.labelsSvg) return;

    // Define all major ship and hologram platform sections
    this.sections = [
      {
        id: 'sec-radar',
        code: 'SEC-01',
        title: 'RADAR ARRAYS',
        desc: 'Dual X/S-Band Rotary Scanners',
        group: this.shipGroup,
        pos: new THREE.Vector3(0, 13.8, -16.0),
        offset: { x: 50, y: -75 },
        camPos: new THREE.Vector3(14, 18, -8),
        camTarget: new THREE.Vector3(0, 13, -16)
      },
      {
        id: 'sec-bridge',
        code: 'SEC-02',
        title: 'NAVIGATION BRIDGE',
        desc: '5-Tier Superstructure & Extended Wings',
        group: this.shipGroup,
        pos: new THREE.Vector3(5.8, 8.2, -15.5),
        offset: { x: 105, y: -30 },
        camPos: new THREE.Vector3(22, 14, -14),
        camTarget: new THREE.Vector3(0, 7.5, -16)
      },
      {
        id: 'sec-funnels',
        code: 'SEC-03',
        title: 'EXHAUST FUNNELS',
        desc: 'Twin Raked Engine Stacks',
        group: this.shipGroup,
        pos: new THREE.Vector3(1.6, 7.5, -19.5),
        offset: { x: 95, y: 35 },
        camPos: new THREE.Vector3(16, 12, -26),
        camTarget: new THREE.Vector3(0, 6, -19)
      },
      {
        id: 'sec-lifeboats',
        code: 'SEC-04',
        title: 'LIFEBOAT STATIONS',
        desc: 'Port/Starboard Gravity Davit Pods',
        group: this.shipGroup,
        pos: new THREE.Vector3(-4.8, 5.2, -16.3),
        offset: { x: -115, y: -70 },
        camPos: new THREE.Vector3(-18, 10, -14),
        camTarget: new THREE.Vector3(-4, 5, -16)
      },
      {
        id: 'sec-cargo-mid',
        code: 'SEC-05',
        title: 'MIDSHIP CARGO HOLD',
        desc: '24,000 TEU High-Density Container Bays',
        group: this.shipGroup,
        pos: new THREE.Vector3(-4.5, 5.5, -1.0),
        offset: { x: -125, y: 10 },
        camPos: new THREE.Vector3(-24, 15, 6),
        camTarget: new THREE.Vector3(0, 4.5, 0)
      },
      {
        id: 'sec-cargo-fwd',
        code: 'SEC-06',
        title: 'FORWARD CARGO BAYS',
        desc: 'Cell Guides & Structural Lashing Towers',
        group: this.shipGroup,
        pos: new THREE.Vector3(4.5, 5.2, 10.5),
        offset: { x: 105, y: -50 },
        camPos: new THREE.Vector3(22, 14, 18),
        camTarget: new THREE.Vector3(0, 4, 10)
      },
      {
        id: 'sec-forecastle',
        code: 'SEC-07',
        title: 'FORECASTLE DECK',
        desc: 'V-Breakwater & Anchor Windlasses',
        group: this.shipGroup,
        pos: new THREE.Vector3(0, 4.0, 21.0),
        offset: { x: -110, y: -55 },
        camPos: new THREE.Vector3(-14, 10, 26),
        camTarget: new THREE.Vector3(0, 3.5, 20)
      },
      {
        id: 'sec-bow',
        code: 'SEC-08',
        title: 'BULBOUS BOW & PROW',
        desc: 'Hydrodynamic Keel Bulb & Knife Cutwater',
        group: this.shipGroup,
        pos: new THREE.Vector3(0, -1.8, 26.0),
        offset: { x: 95, y: 50 },
        camPos: new THREE.Vector3(18, 5, 32),
        camTarget: new THREE.Vector3(0, 0, 24)
      },
      {
        id: 'sec-stern',
        code: 'SEC-09',
        title: 'TRANSOM STERN & RUDDER',
        desc: 'Steering Skeg & Propeller Housing',
        group: this.shipGroup,
        pos: new THREE.Vector3(0, -1.2, -26.0),
        offset: { x: -125, y: -25 },
        camPos: new THREE.Vector3(-18, 5, -30),
        camTarget: new THREE.Vector3(0, 0, -25)
      },
      {
        id: 'sec-platform',
        code: 'SEC-10',
        title: 'HOLO-EMITTER BASE',
        desc: 'Concentric Laser Projector Rings & Grid',
        group: this.platformData ? this.platformData.group : null,
        pos: new THREE.Vector3(16.0, -3.8, 10.0),
        offset: { x: 75, y: 55 },
        camPos: new THREE.Vector3(30, 8, 22),
        camTarget: new THREE.Vector3(0, -3, 0)
      },
      {
        id: 'sec-cradle',
        code: 'SEC-11',
        title: 'PROJECTION GRID CRADLE',
        desc: 'Hyperbolic Upward Beam Funnel',
        group: this.platformData ? this.platformData.group : null,
        pos: new THREE.Vector3(-12.0, -1.0, 3.0),
        offset: { x: -110, y: 60 },
        camPos: new THREE.Vector3(-26, 7, 16),
        camTarget: new THREE.Vector3(0, -1, 0)
      }
    ];

    this.sectionElements = [];
    this.labelsContainer.innerHTML = '';
    this.labelsSvg.innerHTML = '';

    const ns = 'http://www.w3.org/2000/svg';

    this.sections.forEach((sec) => {
      // 1. Dotted Hotspot Pin (Always visible on 3D ship)
      const hotspot = document.createElement('div');
      hotspot.className = 'section-hotspot';
      hotspot.id = `hotspot-${sec.id}`;
      hotspot.title = `Click to inspect: ${sec.title}`;
      hotspot.innerHTML = `
        <div class="hotspot-ring"></div>
        <div class="hotspot-dot"></div>
      `;

      // 2. Section Callout Card (Visible ONLY on click)
      const card = document.createElement('div');
      card.className = 'section-label-card';
      card.id = `label-${sec.id}`;
      card.innerHTML = `
        <button class="sec-close-btn" title="Close">✕</button>
        <div class="sec-header">
          <span class="sec-code">${sec.code}</span>
          <span class="sec-dot"></span>
        </div>
        <div class="sec-title">${sec.title}</div>
        <div class="sec-desc">${sec.desc}</div>
      `;

      // Close button inside card
      const closeBtn = card.querySelector('.sec-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeActiveSection();
        });
      }

      // Hotspot click handler
      hotspot.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.activeSectionId === sec.id) {
          this.closeActiveSection();
        } else {
          this.selectSection(sec);
        }
      });

      this.labelsContainer.appendChild(hotspot);
      this.labelsContainer.appendChild(card);

      // 3. SVG Leader Line (Visible ONLY for active section)
      const line = document.createElementNS(ns, 'polyline');
      line.setAttribute('class', 'sec-leader-line');
      line.id = `line-${sec.id}`;
      this.labelsSvg.appendChild(line);

      this.sectionElements.push({
        sec: sec,
        hotspot: hotspot,
        card: card,
        line: line
      });
    });

    // Dismiss active card on clicking background canvas
    let downPos = { x: 0, y: 0 };
    window.addEventListener('pointerdown', (e) => {
      downPos = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointerup', (e) => {
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (dist < 6) {
        if (!e.target.closest('.section-hotspot') && !e.target.closest('.section-label-card') && !e.target.closest('.ui-layer')) {
          this.closeActiveSection();
        }
      }
    });
  }

  updateSectionLabels() {
    if (!this.labelsVisible || !this.sectionElements) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const tempVec = new THREE.Vector3();
    const camDir = new THREE.Vector3();
    this.camera.getWorldDirection(camDir);

    for (let i = 0; i < this.sectionElements.length; i++) {
      const item = this.sectionElements[i];
      const sec = item.sec;

      // Calculate world position taking object transformations into account
      tempVec.copy(sec.pos);
      if (sec.group) {
        sec.group.localToWorld(tempVec);
      }

      // Check if in front of camera
      const toPoint = new THREE.Vector3().subVectors(tempVec, this.camera.position);
      const isFront = toPoint.dot(camDir) > 0;

      // Project to NDC coordinates
      tempVec.project(this.camera);

      const isVisible = isFront && tempVec.z < 1.0 && tempVec.z > -1.0;

      if (!isVisible) {
        item.hotspot.style.display = 'none';
        item.card.style.display = 'none';
        item.line.style.display = 'none';
        continue;
      }

      // 2D Screen position
      const sx = (tempVec.x * 0.5 + 0.5) * w;
      const sy = (-tempVec.y * 0.5 + 0.5) * h;

      // Hotspot is ALWAYS positioned at the 3D point
      item.hotspot.style.display = 'flex';
      item.hotspot.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;

      // Is this section active (clicked)?
      const isActive = this.activeSectionId === sec.id;

      if (isActive) {
        item.hotspot.classList.add('active');
        item.card.style.display = 'block';
        item.line.style.display = 'block';

        // Card dimensions & clamping
        const cardW = item.card.offsetWidth || 150;
        const cardH = item.card.offsetHeight || 50;

        let badgeX = sx + sec.offset.x;
        let badgeY = sy + sec.offset.y;

        badgeX = Math.max(12, Math.min(w - cardW - 12, badgeX));
        badgeY = Math.max(75, Math.min(h - cardH - 110, badgeY));

        item.card.style.transform = `translate3d(${badgeX.toFixed(1)}px, ${badgeY.toFixed(1)}px, 0)`;

        // Leader line connection points
        let connX, connY, elbowX, elbowY;
        if (badgeX > sx) {
          connX = badgeX;
          connY = badgeY + cardH * 0.5;
          elbowX = Math.max(sx + 15, badgeX - 22);
          elbowY = connY;
        } else {
          connX = badgeX + cardW;
          connY = badgeY + cardH * 0.5;
          elbowX = Math.min(sx - 15, connX + 22);
          elbowY = connY;
        }

        item.line.setAttribute('points', `${sx.toFixed(1)},${sy.toFixed(1)} ${elbowX.toFixed(1)},${elbowY.toFixed(1)} ${connX.toFixed(1)},${connY.toFixed(1)}`);
      } else {
        item.hotspot.classList.remove('active');
        item.card.style.display = 'none';
        item.line.style.display = 'none';
      }
    }
  }

  selectSection(sec) {
    if (!sec) return;
    this.activeSectionId = sec.id;

    // Smoothly focus camera on section
    if (sec.camPos && sec.camTarget) {
      this.isAutoRotating = false;
      if (this.controls) this.controls.autoRotate = false;
      const btnRotate = document.getElementById('btn-rotate');
      if (btnRotate) btnRotate.classList.remove('active');

      this.smoothMoveCamera(sec.camPos, sec.camTarget, 1.1);
    }

    this.playSfx('scan');
    this.updateSectionLabels();
  }

  closeActiveSection() {
    if (this.activeSectionId !== null) {
      this.activeSectionId = null;
      this.playSfx('click');
      this.updateSectionLabels();
    }
  }

  toggleSectionLabels(force) {
    this.labelsVisible = force !== undefined ? force : !this.labelsVisible;
    if (this.labelsContainer) {
      this.labelsContainer.style.display = this.labelsVisible ? 'block' : 'none';
    }
    if (this.labelsSvg) {
      this.labelsSvg.style.display = this.labelsVisible ? 'block' : 'none';
    }
    if (!this.labelsVisible) {
      this.activeSectionId = null;
    } else {
      this.updateSectionLabels();
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // 1. Organic Ocean Floating Physics
    if (this.shipGroup) {
      const heave = Math.sin(time * 1.3) * 0.28;
      const pitch = Math.cos(time * 0.9) * 0.012;
      const roll = Math.sin(time * 0.7) * 0.016;

      this.shipGroup.position.y = heave;
      this.shipGroup.rotation.x = pitch;
      this.shipGroup.rotation.z = roll;
    }

    // 2. Update Ship Builder
    if (this.shipBuilder) {
      this.shipBuilder.update(delta, time);
    }

    // 3. Update Platform Builder
    if (this.platformBuilder) {
      this.platformBuilder.update(delta, time);
    }

    // 4. Update Orbit Controls
    if (this.controls) {
      this.controls.update();
    }

    // 5. Update Holographic 3D Section Labels
    this.updateSectionLabels();

    // 6. Render Scene
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

if (typeof window !== 'undefined') {
  window.ShipMSApp = ShipMSApp;
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new ShipMSApp();
  });
}
