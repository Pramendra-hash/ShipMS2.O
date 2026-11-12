/**
 * ShipMS Futuristic Hologram Shaders & Material Generators
 */

var HologramShaders = {
  // Primary Hologram Body Shader
  bodyVertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  bodyFragmentShader: `
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uScanlineFreq;
    uniform float uScanlineSpeed;
    uniform float uFresnelPower;
    uniform float uFresnelIntensity;
    uniform float uInnerGlow;
    uniform float uFlicker;
    uniform float uOpacity;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel rim lighting
      float NdotV = max(dot(normal, viewDir), 0.0);
      float fresnel = pow(1.0 - NdotV, uFresnelPower) * uFresnelIntensity;

      // Vertical animated scanline ripples
      float scanline = sin(vWorldPosition.y * uScanlineFreq - uTime * uScanlineSpeed) * 0.5 + 0.5;
      scanline = pow(scanline, 2.0) * 0.3;

      // Upward sweeping radar scanner wave
      float sweepWave = sin(vWorldPosition.y * 0.25 - uTime * 1.8);
      float sweep = smoothstep(0.7, 1.0, sweepWave) * 0.4;

      // Color compilation
      vec3 col = uColor * (fresnel + uInnerGlow + scanline + sweep + 0.15);
      col *= uFlicker;

      // Alpha
      float alpha = (fresnel * 0.7 + uInnerGlow * 0.5 + scanline * 0.15 + sweep * 0.25 + 0.1) * uOpacity;
      alpha = clamp(alpha, 0.15, 0.95);

      gl_FragColor = vec4(col, alpha);
    }
  `,

  // Projection Funnel / Beam Shader
  projectionVertexShader: `
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  projectionFragmentShader: `
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uOpacity;

    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      // Grid pattern across UV
      float gridU = abs(sin(vUv.x * 60.0));
      float gridV = abs(sin(vUv.y * 30.0 - uTime * 2.0));
      float grid = pow(gridU * gridV, 6.0) * 1.8;

      float heightFade = smoothstep(1.0, 0.0, vUv.y);
      float baseGlow = smoothstep(0.3, 0.0, vUv.y) * 1.5;

      float pulse = sin(vUv.y * 20.0 - uTime * 4.0) * 0.5 + 0.5;
      pulse = pow(pulse, 3.0) * 0.4;

      vec3 col = uColor * (0.35 + grid * 1.2 + baseGlow + pulse);
      float alpha = (heightFade * 0.4 + grid * 0.6 + baseGlow * 0.5 + pulse * 0.3) * uOpacity;

      gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.85));
    }
  `,

  // Factory methods to create materials
  createHologramMaterial: function(options) {
    options = options || {};
    var color = options.color || new THREE.Color(0x00f0ff);
    var opacity = options.opacity !== undefined ? options.opacity : 0.5;
    var innerGlow = options.innerGlow !== undefined ? options.innerGlow : 0.4;
    var fresnelIntensity = options.fresnelIntensity !== undefined ? options.fresnelIntensity : 1.8;

    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: color },
        uTime: { value: 0.0 },
        uScanlineFreq: { value: 12.0 },
        uScanlineSpeed: { value: 2.0 },
        uFresnelPower: { value: 2.0 },
        uFresnelIntensity: { value: fresnelIntensity },
        uInnerGlow: { value: innerGlow },
        uFlicker: { value: 1.0 },
        uOpacity: { value: opacity }
      },
      vertexShader: this.bodyVertexShader,
      fragmentShader: this.bodyFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
  },

  createWireframeEdgeMaterial: function(color, opacity) {
    color = color !== undefined ? color : 0x00f0ff;
    opacity = opacity !== undefined ? opacity : 0.9;

    return new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
      blending: THREE.AdditiveBlending,
      linewidth: 1.5
    });
  },

  createProjectionBeamMaterial: function(options) {
    options = options || {};
    var color = options.color || new THREE.Color(0x00d8ff);

    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: color },
        uTime: { value: 0.0 },
        uOpacity: { value: 0.55 }
      },
      vertexShader: this.projectionVertexShader,
      fragmentShader: this.projectionFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
  }
};

if (typeof window !== 'undefined') window.HologramShaders = HologramShaders;
if (typeof module !== 'undefined') module.exports = HologramShaders;
