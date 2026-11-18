import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import gsap from "gsap";

import { sculptureVertex, sculptureFragment } from "./glsl/sculpture";
import {
  backdropVertex,
  backdropFragment,
  dustVertex,
  dustFragment,
  lensShader,
} from "./glsl/atmosphere";
import { CHAPTER_KEYS, PALETTES, COLOR_KEYS, NUMBER_KEYS } from "./chapters";

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smooth = (t) => t * t * (3 - 2 * t);
const smoothstep = (e0, e1, x) => smooth(clamp((x - e0) / (e1 - e0), 0, 1));

const RING_SPECS = [
  { radius: 1.75, rx: 0.25, rz: 0.9, speed: 0.07, beadSpeed: 0.45 },
  { radius: 2.25, rx: -0.55, rz: 0.3, speed: -0.05, beadSpeed: -0.32 },
  { radius: 2.95, rx: 1.15, rz: -0.4, speed: 0.035, beadSpeed: 0.22 },
];

/**
 * SculptureStage — the single WebGL scene behind the whole portfolio.
 * Framework-agnostic: the Vue layer only feeds it scroll, pointer & theme.
 */
export class SculptureStage {
  constructor(canvas, { dark = true, rtl = false, reducedMotion = false } = {}) {
    this.canvas = canvas;
    this.rtl = rtl;
    this.reducedMotion = reducedMotion;
    this.mobile =
      window.matchMedia("(pointer: coarse)").matches ||
      Math.min(window.innerWidth, window.innerHeight) < 600;

    this.chapterTarget = 0;
    this.chapter = 0;
    this.state = { ...CHAPTER_KEYS[0] };
    this.time = 0;
    this.pulseValue = 0;
    this.highlight = 0;
    this.highlightTarget = 0;
    this.pointer = new THREE.Vector2();
    this.pointerSmooth = new THREE.Vector2();
    this.pointerActive = 0;
    this.leanStrength = 0;
    this.qualityScale = 1;
    this.frameCount = 0;
    this.frameTimeAvg = 1 / 60;
    this.qualityLocked = false;

    this._tmpV3 = new THREE.Vector3();
    this._tmpV3b = new THREE.Vector3();
    this._tmpQ = new THREE.Quaternion();
    this.clock = new THREE.Clock();

    this.ready = new Promise((resolve) => (this._resolveReady = resolve));
    this._frame = this._frame.bind(this);

    this._initRenderer();
    this._initPalette(dark);
    this._initScene();
    this._initPost();
    this._pushPalette();
    this.resize(true);

    this._onResize = () => {
      cancelAnimationFrame(this._resizeRaf);
      this._resizeRaf = requestAnimationFrame(() => this.resize());
    };
    this._onContextLost = (e) => {
      e.preventDefault();
      cancelAnimationFrame(this.raf);
    };
    window.addEventListener("resize", this._onResize, { passive: true });
    canvas.addEventListener("webglcontextlost", this._onContextLost);
  }

  /* ----------------------------------------------------------- setup */

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  _initPalette(dark) {
    this.dark = dark;
    const src = dark ? PALETTES.dark : PALETTES.light;
    this.colors = {};
    COLOR_KEYS.forEach((key) => (this.colors[key] = new THREE.Color(src[key])));
    this.numbers = {};
    NUMBER_KEYS.forEach((key) => (this.numbers[key] = src[key]));
  }

  _initScene() {
    const c = this.colors;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 0, 7);

    // Backdrop
    this.backdropUniforms = {
      uBgTop: { value: c.bgTop },
      uBgBottom: { value: c.bgBottom },
      uGlowA: { value: c.glowA },
      uGlowB: { value: c.glowB },
      uGrid: { value: c.grid },
      uGridAlpha: { value: 0 },
      uGlowStrength: { value: 0 },
      uFocus: { value: new THREE.Vector2(0.5, 0.5) },
      uAspect: { value: 1 },
      uTime: { value: 0 },
      uDpr: { value: 1 },
    };
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: backdropVertex,
        fragmentShader: backdropFragment,
        uniforms: this.backdropUniforms,
        depthTest: false,
        depthWrite: false,
      })
    );
    backdrop.frustumCulled = false;
    backdrop.renderOrder = -10;
    this.scene.add(backdrop);

    // The form
    this.form = new THREE.Group();
    this.scene.add(this.form);

    this.sculptUniforms = {
      uTime: { value: 0 },
      uNoiseAmp: { value: 0.16 },
      uNoiseFreq: { value: 1.15 },
      uCrystal: { value: 0 },
      uTorus: { value: 0 },
      uTwist: { value: 0 },
      uFacet: { value: 0 },
      uPulse: { value: 0 },
      uPulseDir: { value: new THREE.Vector3(0, 0, 1) },
      uPointerDir: { value: new THREE.Vector3(0, 0, 1) },
      uPointerStrength: { value: 0 },
      uHighlight: { value: 0 },
      uDark: { value: 1 },
      uDeep: { value: c.deep },
      uMain: { value: c.main },
      uGlow: { value: c.glow },
      uAccent: { value: c.accent },
      uSheen: { value: c.sheen },
    };
    const [ws, hs] = this.mobile ? [160, 120] : [288, 216];
    this.sculpture = new THREE.Mesh(
      new THREE.SphereGeometry(1, ws, hs),
      new THREE.ShaderMaterial({
        vertexShader: sculptureVertex,
        fragmentShader: sculptureFragment,
        uniforms: this.sculptUniforms,
        side: THREE.DoubleSide,
      })
    );
    this.sculpture.frustumCulled = false;
    this.form.add(this.sculpture);

    // Dust shell
    const count = this.mobile ? 900 : 2200;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1;
      const theta = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const r = 1.7 + Math.pow(Math.random(), 1.6) * 2.8;
      positions[i * 3] = s * Math.cos(theta) * r;
      positions[i * 3 + 1] = u * r * 0.7;
      positions[i * 3 + 2] = s * Math.sin(theta) * r;
      seeds[i] = Math.random();
      sizes[i] = 0.45 + Math.random() * 1.15;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    dustGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    this.dustUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uSize: { value: 18 },
      uPulse: { value: 0 },
      uSpread: { value: 1 },
      uColorA: { value: c.dustA },
      uColorB: { value: c.dustB },
      uOpacity: { value: 0.8 },
    };
    this.dust = new THREE.Points(
      dustGeo,
      new THREE.ShaderMaterial({
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        uniforms: this.dustUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    this.dust.frustumCulled = false;
    this.form.add(this.dust);

    // Hairline orbital rings with travelling beads
    this.rings = RING_SPECS.map((spec) => {
      const pts = [];
      for (let i = 0; i < 256; i++) {
        const a = (i / 256) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * spec.radius, Math.sin(a) * spec.radius, 0));
      }
      const group = new THREE.Group();
      group.rotation.set(spec.rx, 0, spec.rz);
      const line = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ transparent: true, depthWrite: false })
      );
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 12, 12),
        new THREE.MeshBasicMaterial({ transparent: true })
      );
      group.add(line, bead);
      this.form.add(group);
      return { ...spec, group, line, bead };
    });
  }

  _initPost() {
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const target = new THREE.WebGLRenderTarget(size.x || 1, size.y || 1, {
      type: THREE.HalfFloatType,
      samples: this.mobile ? 0 : 4,
    });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.8, 0.5, 0.6);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.lens = new ShaderPass(lensShader);
    this.lens.uniforms.uResolution.value = new THREE.Vector2(1, 1);
    this.lens.uniforms.uAberration.value = this.mobile ? 0 : 0.012;
    this.composer.addPass(this.lens);
  }

  /* ------------------------------------------------------ public API */

  start() {
    try {
      this.renderer.compile(this.scene, this.camera);
    } catch (e) {
      // compile() is an optimisation only
    }
    this.clock.start();
    this._frame();
    return this.ready;
  }

  setChapter(value) {
    this.chapterTarget = clamp(value, 0, CHAPTER_KEYS.length - 1);
  }

  setDirection(rtl) {
    this.rtl = rtl;
  }

  setPointer(x, y) {
    this.pointer.set(x, y);
    this.pointerActive = 1;
  }

  releasePointer() {
    this.pointerActive = 0;
  }

  setHighlight(on) {
    this.highlightTarget = on ? 1 : 0;
  }

  pulse() {
    this.sculptUniforms.uPulseDir.value.copy(this.sculptUniforms.uPointerDir.value);
    this.pulseValue = 1;
  }

  setTheme(dark, immediate = false) {
    if (dark === this.dark && !immediate) return;
    this.dark = dark;
    const target = dark ? PALETTES.dark : PALETTES.light;
    if (this._themeTween) this._themeTween.kill();

    if (immediate) {
      COLOR_KEYS.forEach((k) => this.colors[k].set(target[k]));
      NUMBER_KEYS.forEach((k) => (this.numbers[k] = target[k]));
      this._pushPalette();
      return;
    }

    const fromColors = {};
    const toColors = {};
    COLOR_KEYS.forEach((k) => {
      fromColors[k] = this.colors[k].clone();
      toColors[k] = new THREE.Color(target[k]);
    });
    const fromNumbers = { ...this.numbers };
    const progress = { t: 0 };

    this._themeTween = gsap.to(progress, {
      t: 1,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => {
        COLOR_KEYS.forEach((k) =>
          this.colors[k].lerpColors(fromColors[k], toColors[k], progress.t)
        );
        NUMBER_KEYS.forEach((k) => {
          this.numbers[k] = lerp(fromNumbers[k], target[k], progress.t);
        });
        this._pushPalette();
      },
    });
  }

  resize(force = false) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Mobile URL bars resize the viewport while scrolling — ignore small jumps
    if (!force && this.mobile && this._lastW === w && Math.abs(this._lastH - h) < 120) {
      return;
    }
    this._lastW = w;
    this._lastH = h;

    const cap = this.mobile ? 1.5 : 1.75;
    this.pixelRatio = Math.max(0.75, Math.min(window.devicePixelRatio || 1, cap) * this.qualityScale);

    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(this.pixelRatio);
    this.composer.setSize(w, h);

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.halfH = this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    this.halfW = this.halfH * this.camera.aspect;
    this.portrait = w / h < 0.9;

    this.backdropUniforms.uAspect.value = w / h;
    this.backdropUniforms.uDpr.value = this.pixelRatio;
    this.dustUniforms.uPixelRatio.value = this.pixelRatio;
    this.lens.uniforms.uResolution.value.set(w * this.pixelRatio, h * this.pixelRatio);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this._resizeRaf);
    if (this._themeTween) this._themeTween.kill();
    window.removeEventListener("resize", this._onResize);
    this.canvas.removeEventListener("webglcontextlost", this._onContextLost);
    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    this.composer.dispose();
    this.renderer.dispose();
  }

  /* --------------------------------------------------------- internals */

  _pushPalette() {
    const n = this.numbers;
    this.backdropUniforms.uGridAlpha.value = n.gridAlpha;
    this.sculptUniforms.uDark.value = n.dark;
    this.bloom.strength = n.bloomStrength;
    this.bloom.radius = n.bloomRadius;
    this.bloom.threshold = n.bloomThreshold;
    this.lens.uniforms.uGrain.value = n.grain;
    this.lens.uniforms.uVignette.value = n.vignette;

    const additive = n.dark > 0.5;
    const blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    if (this.dust.material.blending !== blending) {
      this.dust.material.blending = blending;
      this.dust.material.needsUpdate = true;
    }
    this.rings.forEach((ring) => {
      ring.line.material.color.copy(this.colors.ring);
      ring.bead.material.color.copy(this.colors.accent);
    });
  }

  _updateState(dt) {
    const keys = CHAPTER_KEYS;
    const k = 1 - Math.exp(-dt * (this.reducedMotion ? 8 : 3.2));
    this.chapter += (this.chapterTarget - this.chapter) * k;

    const f = clamp(this.chapter, 0, keys.length - 1);
    const i = Math.floor(f);
    const j = Math.min(i + 1, keys.length - 1);
    const t = smooth(f - i);
    const A = keys[i];
    const B = keys[j];
    Object.keys(A).forEach((key) => {
      this.state[key] = lerp(A[key], B[key], t);
    });
  }

  _updateLean(dt, formX, formY, scale) {
    const k = 1 - Math.exp(-dt * 4);
    this.pointerSmooth.lerp(this.pointer, k);

    // Cursor ray -> plane through the form (z = 0)
    const ray = this._tmpV3.set(this.pointerSmooth.x, this.pointerSmooth.y, 0.5).unproject(this.camera);
    ray.sub(this.camera.position).normalize();
    const t = -this.camera.position.z / ray.z;
    const px = this.camera.position.x + ray.x * t;
    const py = this.camera.position.y + ray.y * t;
    const dx = px - formX;
    const dy = py - formY;
    const dist = Math.hypot(dx, dy);

    const dir = this._tmpV3b.set(dx, dy, 1.4 * scale).normalize();
    this.sculpture.getWorldQuaternion(this._tmpQ).invert();
    dir.applyQuaternion(this._tmpQ);
    this.sculptUniforms.uPointerDir.value.lerp(dir, k).normalize();

    const near = smoothstep(3.2 * scale, 0.5 * scale, dist);
    const target = this.reducedMotion ? 0 : this.pointerActive * (0.05 + 0.17 * near);
    this.leanStrength += (target - this.leanStrength) * k;
    this.sculptUniforms.uPointerStrength.value = this.leanStrength;
  }

  _adaptQuality(dt) {
    if (this.qualityLocked) return;
    this.frameCount += 1;
    if (this.frameCount < 30) return; // skip warm-up frames
    this.frameTimeAvg = lerp(this.frameTimeAvg, dt, 0.05);
    if (this.frameCount % 90 === 0) {
      if (this.frameTimeAvg > 1 / 40 && this.qualityScale > 0.6) {
        this.qualityScale -= 0.15;
        this.resize(true);
      }
      if (this.frameCount > 420) this.qualityLocked = true;
    }
  }

  _frame() {
    this.raf = requestAnimationFrame(this._frame);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt * (this.reducedMotion ? 0.35 : 1);

    this._updateState(dt);
    const s = this.state;

    // Composition (mirrored in RTL, centred on portrait screens)
    let x = s.xFrac * this.halfW * (this.rtl ? -1 : 1);
    let y = s.y;
    let scale = s.scale * Math.min(1, this.halfH / 2.05);
    if (this.portrait) {
      x = 0;
      scale *= 0.78;
      y *= 0.75;
    }

    this.pulseValue = Math.max(0, this.pulseValue - dt / 1.7);
    this.highlight += (this.highlightTarget - this.highlight) * (1 - Math.exp(-dt * 5));

    this._updateLean(dt, x, y, scale);

    const p = this.pointerSmooth;
    this.form.position.set(x + p.x * 0.1, y + p.y * 0.07, 0);
    this.form.scale.setScalar(scale * (1 + this.pulseValue * 0.035));
    this.form.rotation.x = s.rotX - p.y * 0.22;
    this.form.rotation.z = -p.x * 0.08;
    this.sculpture.rotation.y += dt * s.spin * (this.reducedMotion ? 0.3 : 1);

    const u = this.sculptUniforms;
    u.uTime.value = this.time;
    u.uNoiseAmp.value = s.noiseAmp;
    u.uNoiseFreq.value = s.noiseFreq;
    u.uCrystal.value = s.crystal;
    u.uTorus.value = s.torus;
    u.uTwist.value = s.twist;
    u.uFacet.value = s.facet;
    u.uPulse.value = this.pulseValue;
    u.uHighlight.value = this.highlight;

    this.dustUniforms.uTime.value = this.time;
    this.dustUniforms.uPulse.value = this.pulseValue;
    this.dustUniforms.uSpread.value = s.dust;
    this.dustUniforms.uOpacity.value = this.numbers.dustOpacity;

    const ringAlpha = this.numbers.ringOpacity * s.rings;
    this.rings.forEach((ring) => {
      ring.group.rotation.z += dt * ring.speed;
      const a = this.time * ring.beadSpeed;
      ring.bead.position.set(Math.cos(a) * ring.radius, Math.sin(a) * ring.radius, 0);
      ring.line.material.opacity = ringAlpha;
      ring.bead.material.opacity = Math.min(1, ringAlpha * 3);
      ring.group.visible = ringAlpha > 0.005;
    });

    // Backdrop halo follows the form on screen
    const screen = this._tmpV3.copy(this.form.position).project(this.camera);
    this.backdropUniforms.uFocus.value.set(screen.x * 0.5 + 0.5, screen.y * 0.5 + 0.5);
    this.backdropUniforms.uGlowStrength.value = this.numbers.glowStrength * s.glow;
    this.backdropUniforms.uTime.value = this.time;

    this.lens.uniforms.uTime.value = this.time;

    this.composer.render(dt);
    this._adaptQuality(dt);

    this.renderedFrames = (this.renderedFrames || 0) + 1;
    if (this.renderedFrames === 2 && this._resolveReady) {
      this._resolveReady();
      this._resolveReady = null;
    }
  }
}
