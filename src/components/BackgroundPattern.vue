<template>
  <div class="webgl-universe-wrapper" :class="isDark ? 'universe--dark' : 'universe--light'">
    <canvas ref="canvasRef" class="webgl-canvas"></canvas>
    <div class="universe-vignette"></div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";
import { useUtilStore } from "stores/util-store";
import * as THREE from "three";
import gsap from "gsap";

// Custom WebGL GLSL Vertex Shader for Holographic Quantum Core
const coreVertexShader = `
  uniform float uTime;
  uniform float uPulse;
  uniform float uMorph;
  uniform vec2 uMouse;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  float waveNoise(vec3 p) {
    return sin(p.x * 2.4 + uTime * 1.5) * cos(p.y * 2.4 - uTime * 1.2) * sin(p.z * 2.4 + uTime * 1.7);
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    float n = waveNoise(position + vec3(uMouse.x * 0.6, uMouse.y * 0.6, 0.0));
    float disp = n * (0.22 + uMorph * 0.18 + uPulse * 0.35);
    vDisplacement = disp;
    vec3 newPos = position + normal * disp;
    vPosition = (modelViewMatrix * vec4(newPos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

// Custom WebGL GLSL Fragment Shader for Holographic Quantum Core
const coreFragmentShader = `
  uniform float uTime;
  uniform float uPulse;
  uniform float uOpacity;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  uniform vec3 uColorAccent;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormal))), 2.2);
    float bands = sin(vPosition.y * 6.0 - uTime * 2.5 + vDisplacement * 10.0) * 0.5 + 0.5;

    vec3 baseColor = mix(uColorSecondary, uColorPrimary, fresnel);
    baseColor = mix(baseColor, uColorAccent, pow(bands, 3.0) * (0.45 + uPulse * 0.5));

    float alpha = clamp((fresnel * 0.78 + 0.18 + uPulse * 0.25) * uOpacity, 0.0, 0.92);
    gl_FragColor = vec4(baseColor, alpha);
  }
`;

// Custom WebGL GLSL Vertex Shader for Cyber-Emerald Topographic Wave Field
const waveVertexShader = `
  uniform float uTime;
  uniform float uWaveIntensity;
  uniform float uPulse;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vElev;
  varying float vDist;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float dMouse = length(pos.xy * 0.06 - uMouse);
    float mouseRipple = sin(dMouse * 8.0 - uTime * 3.5) * exp(-dMouse * 1.8) * 1.25;

    float w1 = sin(pos.x * 0.28 + uTime * 0.9) * cos(pos.y * 0.24 + uTime * 0.65);
    float w2 = sin((pos.x * 0.45 - pos.y * 0.35) + uTime * 1.3) * 0.5;
    float pulseWave = sin(length(pos.xy) * 0.6 - uTime * 5.0) * uPulse * 1.4;

    float elevation = (w1 + w2) * uWaveIntensity + mouseRipple + pulseWave;
    pos.z += elevation;

    vElev = elevation;
    vDist = length(pos.xy);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Custom WebGL GLSL Fragment Shader for Cyber-Emerald Topographic Wave Field
const waveFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  uniform vec3 uColorAccent;
  varying vec2 vUv;
  varying float vElev;
  varying float vDist;

  void main() {
    float gridX = abs(fract(vUv.x * 46.0 - 0.5) - 0.5) / fwidth(vUv.x * 46.0);
    float gridY = abs(fract(vUv.y * 30.0 - 0.5) - 0.5) / fwidth(vUv.y * 30.0);
    float gridLine = 1.0 - min(min(gridX, gridY), 1.0);

    float contour = abs(fract(vElev * 1.6 - uTime * 0.2) - 0.5);
    float contourLine = smoothstep(0.08, 0.0, contour);

    float mixFactor = clamp((vElev + 1.5) * 0.35, 0.0, 1.0);
    vec3 col = mix(uColorSecondary, uColorPrimary, mixFactor);
    col = mix(col, uColorAccent, contourLine * 0.65);

    float radialFade = 1.0 - smoothstep(8.0, 26.0, vDist);
    float alpha = (gridLine * 0.36 + contourLine * 0.38) * radialFade * uOpacity;

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.75));
  }
`;

// Custom WebGL GLSL Shaders for Quantum Particle Nebula
const particleVertexShader = `
  uniform float uTime;
  uniform float uPulse;
  attribute float aScale;
  attribute float aPhase;
  attribute float aColorMix;
  varying float vColorMix;
  varying float vAlpha;

  void main() {
    vColorMix = aColorMix;
    vec3 pos = position;
    pos.y += sin(uTime * 0.8 + aPhase * 6.28) * 0.45;
    pos.x += cos(uTime * 0.65 + aPhase * 6.28) * 0.35;
    pos *= 1.0 + uPulse * 0.14 * sin(aPhase * 12.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aScale * (210.0 / -mvPosition.z);
    vAlpha = clamp(1.25 - (-mvPosition.z / 38.0), 0.15, 0.95);
  }
`;

const particleFragmentShader = `
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  uniform vec3 uColorAccent;
  uniform float uOpacity;
  varying float vColorMix;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float glow = pow(1.0 - d * 2.0, 1.8);

    vec3 col = mix(uColorPrimary, uColorSecondary, vColorMix);
    if (vColorMix > 0.72) {
      col = mix(col, uColorAccent, (vColorMix - 0.72) * 3.5);
    }

    gl_FragColor = vec4(col, glow * vAlpha * uOpacity);
  }
`;

export default defineComponent({
  name: "BackgroundPattern",
  setup() {
    const canvasRef = ref(null);
    const $q = useQuasar();
    const route = useRoute();
    const utilStore = useUtilStore();

    const isDark = computed(() => $q.dark.isActive);

    let renderer = null;
    let scene = null;
    let camera = null;
    let clock = null;
    let animFrameId = null;

    let coreGroup = null;
    let coreUniforms = null;
    let waveUniforms = null;
    let particleUniforms = null;
    let wireCageMat = null;
    let knotMat = null;
    let ringMats = [];
    let crystalMeshes = [];
    let crystalMat = null;

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const cameraTarget = new THREE.Vector3(0, 0, 0);

    const getPalette = (dark) => {
      if (dark) {
        return {
          bg: new THREE.Color("#121212"),
          primary: new THREE.Color("#a4ff91"), // --q-color-system-primary-in-dark
          secondary: new THREE.Color("#52d379"), // --q-color-lemon-green
          accent: new THREE.Color("#edff20"), // --q-color-lemon-yellow
          coreOpacity: 0.78,
          waveOpacity: 0.62,
          particleOpacity: 0.85,
        };
      }
      return {
        bg: new THREE.Color("#d8dfdc"),
        primary: new THREE.Color("#4c7753"), // --q-color-system-primary-in-light
        secondary: new THREE.Color("#52d379"), // --q-color-lemon-green
        accent: new THREE.Color("#2d5a36"),
        coreOpacity: 0.62,
        waveOpacity: 0.52,
        particleOpacity: 0.72,
      };
    };

    const initThreeUniverse = () => {
      const canvas = canvasRef.value;
      if (!canvas) return;

      const palette = getPalette(isDark.value);

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(palette.bg.getHex(), 0.028);

      camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        120
      );
      camera.position.set(0, 1.8, 13.5);

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Lights for crystal polyhedra
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xa4ff91, 1.8);
      dirLight1.position.set(8, 12, 10);
      scene.add(dirLight1);

      const dirLight2 = new THREE.PointLight(0xedff20, 1.4, 35);
      dirLight2.position.set(-8, -5, 6);
      scene.add(dirLight2);

      // 1. Central Holographic Core Group
      coreGroup = new THREE.Group();
      coreGroup.position.set(3.2, 0.6, -2.5);
      scene.add(coreGroup);

      coreUniforms = {
        uTime: { value: 0 },
        uPulse: { value: 0 },
        uMorph: { value: 0.2 },
        uOpacity: { value: palette.coreOpacity },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColorPrimary: { value: palette.primary.clone() },
        uColorSecondary: { value: palette.secondary.clone() },
        uColorAccent: { value: palette.accent.clone() },
      };

      const coreGeo = new THREE.IcosahedronGeometry(2.05, 5);
      const coreMat = new THREE.ShaderMaterial({
        vertexShader: coreVertexShader,
        fragmentShader: coreFragmentShader,
        uniforms: coreUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreGroup.add(coreMesh);

      // Outer geodesic wireframe cage
      const wireGeo = new THREE.IcosahedronGeometry(2.48, 2);
      wireCageMat = new THREE.MeshBasicMaterial({
        color: palette.primary,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      });
      const wireCageMesh = new THREE.Mesh(wireGeo, wireCageMat);
      coreGroup.add(wireCageMesh);

      // Torus Knot Quantum Ribbon
      const knotGeo = new THREE.TorusKnotGeometry(3.15, 0.032, 140, 16, 2, 3);
      knotMat = new THREE.MeshBasicMaterial({
        color: palette.secondary,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const knotMesh = new THREE.Mesh(knotGeo, knotMat);
      coreGroup.add(knotMesh);

      // 3 Orbital Gyroscope Rings
      ringMats = [];
      const ringRadii = [3.65, 4.35, 5.1];
      const ringColors = [palette.primary, palette.secondary, palette.accent];
      ringRadii.forEach((radius, idx) => {
        const rGeo = new THREE.TorusGeometry(radius, 0.018, 12, 110);
        const rMat = new THREE.MeshBasicMaterial({
          color: ringColors[idx],
          transparent: true,
          opacity: idx === 2 ? 0.32 : 0.42,
        });
        ringMats.push(rMat);
        const rMesh = new THREE.Mesh(rGeo, rMat);
        rMesh.rotation.x = Math.PI * (0.28 + idx * 0.22);
        rMesh.rotation.y = Math.PI * (0.15 * idx);
        rMesh.userData = { speedX: 0.18 + idx * 0.07, speedY: 0.24 - idx * 0.05 };
        coreGroup.add(rMesh);
      });

      // 2. Cyber-Emerald Topographic Wave Shader Plane
      waveUniforms = {
        uTime: { value: 0 },
        uWaveIntensity: { value: 0.95 },
        uPulse: { value: 0 },
        uOpacity: { value: palette.waveOpacity },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColorPrimary: { value: palette.primary.clone() },
        uColorSecondary: { value: palette.secondary.clone() },
        uColorAccent: { value: palette.accent.clone() },
      };

      const waveGeo = new THREE.PlaneGeometry(54, 34, 96, 64);
      const waveMat = new THREE.ShaderMaterial({
        vertexShader: waveVertexShader,
        fragmentShader: waveFragmentShader,
        uniforms: waveUniforms,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const waveMesh = new THREE.Mesh(waveGeo, waveMat);
      waveMesh.rotation.x = -Math.PI * 0.43;
      waveMesh.position.set(0, -4.8, -5.5);
      scene.add(waveMesh);

      // 3. Quantum Particle Nebula
      const particleCount = 1400;
      const positions = new Float32Array(particleCount * 3);
      const scales = new Float32Array(particleCount);
      const phases = new Float32Array(particleCount);
      const colorMixes = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 44;
        positions[i3 + 1] = (Math.random() - 0.5) * 26;
        positions[i3 + 2] = (Math.random() - 0.5) * 28 - 4;
        scales[i] = Math.random() * 1.9 + 0.5;
        phases[i] = Math.random();
        colorMixes[i] = Math.random();
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      particleGeo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
      particleGeo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
      particleGeo.setAttribute("aColorMix", new THREE.BufferAttribute(colorMixes, 1));

      particleUniforms = {
        uTime: { value: 0 },
        uPulse: { value: 0 },
        uOpacity: { value: palette.particleOpacity },
        uColorPrimary: { value: palette.primary.clone() },
        uColorSecondary: { value: palette.secondary.clone() },
        uColorAccent: { value: palette.accent.clone() },
      };

      const particleMat = new THREE.ShaderMaterial({
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        uniforms: particleUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // 4. Floating 3D Geometric Data Shards (Octahedra)
      crystalMat = new THREE.MeshPhysicalMaterial({
        color: palette.primary,
        emissive: palette.secondary,
        emissiveIntensity: 0.35,
        metalness: 0.3,
        roughness: 0.2,
        wireframe: false,
        transparent: true,
        opacity: 0.65,
      });

      const shardGeo = new THREE.OctahedronGeometry(0.28, 0);
      crystalMeshes = [];
      for (let i = 0; i < 16; i++) {
        const mesh = new THREE.Mesh(shardGeo, crystalMat);
        const angle = (i / 16) * Math.PI * 2;
        const radius = 6.5 + (i % 3) * 3.2;
        mesh.position.set(
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 11,
          Math.sin(angle) * radius - 5
        );
        mesh.scale.setScalar(0.6 + (i % 4) * 0.35);
        mesh.userData = {
          baseY: mesh.position.y,
          angle,
          radius,
          speed: 0.12 + (i % 5) * 0.04,
          rotSpeed: 0.6 + (i % 3) * 0.4,
        };
        scene.add(mesh);
        crystalMeshes.push(mesh);
      }

      clock = new THREE.Clock();

      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        // Smooth pointer interpolation
        pointer.x += (pointer.targetX - pointer.x) * 0.06;
        pointer.y += (pointer.targetY - pointer.y) * 0.06;

        if (coreUniforms) {
          coreUniforms.uTime.value = elapsed;
          coreUniforms.uMouse.value.set(pointer.x, pointer.y);
        }
        if (waveUniforms) {
          waveUniforms.uTime.value = elapsed;
          waveUniforms.uMouse.value.set(pointer.x, pointer.y);
        }
        if (particleUniforms) {
          particleUniforms.uTime.value = elapsed;
        }

        // Rotate Core & Rings
        if (coreGroup) {
          coreGroup.rotation.y = elapsed * 0.22 + pointer.x * 0.35;
          coreGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.15 - pointer.y * 0.25;
          coreGroup.children.forEach((child) => {
            if (child.userData && child.userData.speedX) {
              child.rotation.x += 0.004 * child.userData.speedX;
              child.rotation.z += 0.005 * child.userData.speedY;
            }
          });
        }

        // Orbit floating crystal shards
        crystalMeshes.forEach((shard, idx) => {
          const ud = shard.userData;
          const curAngle = ud.angle + elapsed * ud.speed;
          shard.position.x = Math.cos(curAngle) * ud.radius;
          shard.position.z = Math.sin(curAngle) * ud.radius - 5;
          shard.position.y = ud.baseY + Math.sin(elapsed * 1.4 + idx) * 0.65;
          shard.rotation.x = elapsed * ud.rotSpeed;
          shard.rotation.y = elapsed * ud.rotSpeed * 0.8;
        });

        // Subtle camera parallax with mouse
        camera.position.x += (pointer.x * 1.35 - camera.position.x) * 0.03;
        camera.lookAt(cameraTarget);

        renderer.render(scene, camera);
      };

      animate();
    };

    // GSAP Theme Transition
    const transitionThemeColors = (dark) => {
      if (!coreUniforms || !waveUniforms || !particleUniforms) return;
      const palette = getPalette(dark);

      if (scene && scene.fog) {
        scene.fog.color.copy(palette.bg);
      }

      const uniformSets = [coreUniforms, waveUniforms, particleUniforms];
      uniformSets.forEach((u) => {
        gsap.to(u.uColorPrimary.value, {
          r: palette.primary.r,
          g: palette.primary.g,
          b: palette.primary.b,
          duration: 1.1,
          ease: "power2.inOut",
        });
        gsap.to(u.uColorSecondary.value, {
          r: palette.secondary.r,
          g: palette.secondary.g,
          b: palette.secondary.b,
          duration: 1.1,
          ease: "power2.inOut",
        });
        gsap.to(u.uColorAccent.value, {
          r: palette.accent.r,
          g: palette.accent.g,
          b: palette.accent.b,
          duration: 1.1,
          ease: "power2.inOut",
        });
      });

      gsap.to(coreUniforms.uOpacity, { value: palette.coreOpacity, duration: 0.9 });
      gsap.to(waveUniforms.uOpacity, { value: palette.waveOpacity, duration: 0.9 });
      gsap.to(particleUniforms.uOpacity, { value: palette.particleOpacity, duration: 0.9 });

      if (wireCageMat) wireCageMat.color.copy(palette.primary);
      if (knotMat) knotMat.color.copy(palette.secondary);
      if (crystalMat) {
        crystalMat.color.copy(palette.primary);
        crystalMat.emissive.copy(palette.secondary);
      }
      if (ringMats.length === 3) {
        ringMats[0].color.copy(palette.primary);
        ringMats[1].color.copy(palette.secondary);
        ringMats[2].color.copy(palette.accent);
      }
    };

    // GSAP Camera & Scene Choreography based on Route & Scene Mode
    const applyCameraChoreography = () => {
      if (!camera || !coreGroup || !waveUniforms || !coreUniforms) return;

      const mode = utilStore.sceneMode;
      const isWorks = route.path.includes("works");

      let camPos = { y: 1.8, z: 13.5 };
      let corePos = { x: isWorks ? -3.6 : 3.2, y: isWorks ? 1.2 : 0.6, z: -2.5 };
      let coreScale = 1.0;
      let waveInt = 0.95;
      let morphVal = 0.22;

      if (mode === "matrix") {
        camPos = { y: 4.2, z: 11.2 };
        corePos = { x: 0, y: 2.0, z: -4.2 };
        coreScale = 0.82;
        waveInt = 1.65;
        morphVal = 0.45;
      } else if (mode === "nebula") {
        camPos = { y: 0.2, z: 9.2 };
        corePos = { x: isWorks ? -2.2 : 2.2, y: 0.1, z: -1.2 };
        coreScale = 1.32;
        waveInt = 0.45;
        morphVal = 0.65;
      }

      gsap.to(camera.position, {
        y: camPos.y,
        z: camPos.z,
        duration: 1.5,
        ease: "power3.inOut",
      });

      gsap.to(coreGroup.position, {
        x: corePos.x,
        y: corePos.y,
        z: corePos.z,
        duration: 1.5,
        ease: "expo.out",
      });

      gsap.to(coreGroup.scale, {
        x: coreScale,
        y: coreScale,
        z: coreScale,
        duration: 1.4,
        ease: "back.out(1.4)",
      });

      gsap.to(waveUniforms.uWaveIntensity, {
        value: waveInt,
        duration: 1.3,
        ease: "power2.out",
      });

      gsap.to(coreUniforms.uMorph, {
        value: morphVal,
        duration: 1.3,
        ease: "power2.out",
      });
    };

    // GSAP Shockwave Pulse
    const triggerShockwave = () => {
      if (!coreUniforms || !waveUniforms || !particleUniforms) return;
      const targets = [
        coreUniforms.uPulse,
        waveUniforms.uPulse,
        particleUniforms.uPulse,
      ];
      gsap.killTweensOf(targets);
      gsap.fromTo(
        targets,
        { value: 0.95 },
        {
          value: 0,
          duration: 1.45,
          ease: "expo.out",
        }
      );
    };

    const onPointerMove = (e) => {
      pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onWindowResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    watch(isDark, (darkVal) => {
      transitionThemeColors(darkVal);
    });

    watch(
      () => [route.path, utilStore.sceneMode],
      () => {
        applyCameraChoreography();
        triggerShockwave();
      }
    );

    watch(
      () => utilStore.pulseTrigger,
      () => {
        triggerShockwave();
      }
    );

    watch(
      () => utilStore.hoveredWorkIndex,
      (idx) => {
        if (!coreGroup || !coreUniforms) return;
        if (idx >= 0) {
          gsap.to(coreUniforms.uMorph, {
            value: 0.55 + (idx % 3) * 0.15,
            duration: 0.6,
            ease: "power2.out",
          });
          gsap.to(coreGroup.scale, {
            x: 1.15,
            y: 1.15,
            z: 1.15,
            duration: 0.6,
            ease: "back.out(1.7)",
          });
        } else {
          applyCameraChoreography();
        }
      }
    );

    onMounted(() => {
      initThreeUniverse();
      window.addEventListener("mousemove", onPointerMove, { passive: true });
      window.addEventListener("resize", onWindowResize, { passive: true });
    });

    onBeforeUnmount(() => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("resize", onWindowResize);
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (renderer) renderer.dispose();
    });

    return {
      canvasRef,
      isDark,
    };
  },
});
</script>

<style lang="scss" scoped>
.webgl-universe-wrapper {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  transition: background 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.universe--dark {
  background: radial-gradient(
      circle at 75% 22%,
      rgba(82, 211, 121, 0.14) 0%,
      rgba(164, 255, 145, 0.05) 32%,
      transparent 65%
    ),
    radial-gradient(
      circle at 18% 80%,
      rgba(237, 255, 32, 0.08) 0%,
      transparent 50%
    ),
    linear-gradient(145deg, #0d110e 0%, #121212 52%, #171d18 100%);
}

.universe--light {
  background: radial-gradient(
      circle at 75% 22%,
      rgba(82, 211, 121, 0.22) 0%,
      rgba(76, 119, 83, 0.12) 38%,
      transparent 68%
    ),
    linear-gradient(
      135deg,
      var(--q-color-page-bg-in-light) 0%,
      var(--q-color-page-bg-in-light-secondary) 100%
    );
}

.webgl-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.universe-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 50%,
    transparent 45%,
    rgba(0, 0, 0, 0.36) 100%
  );
  pointer-events: none;
}
</style>
