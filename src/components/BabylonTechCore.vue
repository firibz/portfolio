<template>
  <div class="babylon-constellation-card glass-3d-subcard q-pa-md q-mb-xl">
    <!-- Redesigned Clean Toolbar Header -->
    <div class="row items-center justify-between q-mb-md constellation-header q-pb-sm">
      <div class="row items-center no-wrap">
        <div class="header-orb-icon flex flex-center q-mr-sm">
          <q-icon name="mdi-rotate-3d-variant" size="20px" class="text-system-primary" />
        </div>
        <div class="column">
          <div class="row items-center q-gutter-x-sm">
            <span class="text-subtitle2 text-bold">Babylon.js 3D Skill Orbit</span>
            <span class="live-3d-pill">WEBGL 2</span>
          </div>
          <span class="text-caption opacity-70">
            {{ t("babylonInteractiveHint") }}
          </span>
        </div>
      </div>

      <div class="row items-center q-gutter-x-xs">
        <button
          type="button"
          class="orbit-ctrl-btn"
          :class="{ 'orbit-ctrl-btn--active': autoRotate }"
          @click="autoRotate = !autoRotate"
        >
          <q-icon :name="autoRotate ? 'mdi-pause' : 'mdi-play'" size="15px" />
          <span>{{ autoRotate ? "Orbiting" : "Paused" }}</span>
        </button>
        <button
          type="button"
          class="orbit-ctrl-btn"
          title="Reset 3D Camera"
          @click="resetCamera"
        >
          <q-icon name="mdi-refresh" size="15px" />
          <span>Reset</span>
        </button>
      </div>
    </div>

    <!-- Top Section: Babylon.js 3D Interactive Canvas + Crisp 3D-Projected HTML Labels -->
    <div class="canvas-section-wrap full-width relative-position">
      <div ref="canvasWrapRef" class="babylon-canvas-container relative-position full-width">
        <canvas ref="babylonCanvas" class="babylon-canvas"></canvas>

        <!-- Crisp 3D-Projected Interactive Node Badges (never blurred by WebGL bloom) -->
        <div class="projected-labels-layer">
          <button
            v-for="(proj, idx) in projectedNodes"
            :key="skillNodes[idx].id"
            type="button"
            class="orbit-projected-tag"
            :class="{
              'orbit-projected-tag--active': selectedIndex === idx,
              'orbit-projected-tag--back': proj.behind,
            }"
            :style="{
              transform: `translate3d(${proj.x}px, ${proj.y}px, 0) translate(-50%, -50%) scale(${proj.scale})`,
              zIndex: proj.zIndex,
              opacity: proj.opacity,
            }"
            @click="selectSkillNode(idx)"
          >
            <q-icon :name="skillNodes[idx].icon" size="14px" class="tag-icon" />
            <span>{{ skillNodes[idx].shortName }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Middle Section: Selected Skill Inspector Card (Full-width, Rock-solid Fixed Min-Height to Prevent Page Resizing) -->
    <div
      ref="inspectorRef"
      class="skill-inspector-box full-width column justify-between q-pa-md q-mt-md"
    >
      <div>
        <div class="row items-center justify-between q-mb-xs">
          <div class="row items-center no-wrap">
            <div class="inspector-icon-box flex flex-center q-mr-sm">
              <q-icon
                :name="activeSkill.icon"
                size="24px"
                class="text-system-primary"
              />
            </div>
            <div>
              <div class="text-subtitle1 text-bold leading-tight">
                {{ activeSkill.name }}
              </div>
              <div class="text-caption opacity-70 q-mt-xs">
                Node 0{{ selectedIndex + 1 }} / 0{{ skillNodes.length }}
              </div>
            </div>
          </div>
        </div>

        <p
          class="text-body2 q-mt-sm q-mb-sm opacity-90 skill-desc-text"
          style="line-height: 1.6"
        >
          {{ isFa ? activeSkill.descFa : activeSkill.descEn }}
        </p>
      </div>

      <div>
        <div class="text-caption text-bold opacity-70 q-mb-xs">
          KEY TECHNOLOGIES
        </div>
        <div class="row q-gutter-xs skill-tags-wrap">
          <span
            v-for="tag in activeSkill.tags"
            :key="tag"
            class="tech-mini-tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- Bottom 3-Column Skill Selector Grid with Centered Last Line (3 + 3 + 2) -->
    <div class="skill-grid-fullwidth q-mt-md">
      <button
        v-for="(node, idx) in skillNodes"
        :key="node.id"
        type="button"
        class="skill-node-btn"
        :class="{ 'skill-node-btn--active': selectedIndex === idx }"
        :title="node.name"
        @click="selectSkillNode(idx)"
      >
        <div class="skill-btn-inner">
          <div class="node-btn-icon flex flex-center">
            <q-icon :name="node.icon" size="15px" />
          </div>
          <span class="skill-btn-label">{{ node.shortName }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useUtilStore } from "stores/util-store";
import { Engine } from "@babylonjs/core/Engines/engine.js";
import { Scene } from "@babylonjs/core/scene.js";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { PointLight } from "@babylonjs/core/Lights/pointLight.js";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color.js";
import { Vector3, Matrix } from "@babylonjs/core/Maths/math.vector.js";
import "@babylonjs/core/Culling/ray.js";
import gsap from "gsap";

const skillNodes = [
  {
    id: "vue",
    name: "Vue.js (Vue 2 & 3) & Quasar",
    shortName: "Vue / Quasar",
    icon: "mdi-vuejs",
    level: 98,
    colorHex: "#a4ff91",
    descEn:
      "Architecting scalable SPA, SSR, and PWA applications with Vue 2/3, Quasar, Vuetify, Pinia, and Vuex with pixel-perfect responsiveness.",
    descFa:
      "طراحی و معماری برنامه‌های وب مقیاس‌پذیر SPA، SSR و PWA با Vue 2/3، Quasar، Vuetify، Pinia و Vuex با دقت بالا در جزئیات.",
    tags: ["Vue 3", "Quasar", "Pinia", "Vuex", "Vuetify", "SSR/PWA"],
  },
  {
    id: "three",
    name: "Three.js & WebGL Shaders",
    shortName: "Three.js / WebGL",
    icon: "mdi-cube-outline",
    level: 92,
    colorHex: "#52d379",
    descEn:
      "Building immersive 3D web experiences, custom GLSL vertex/fragment shaders, procedural particle fields, and reactive geometries.",
    descFa:
      "ساخت تجربه‌های وب سه‌بعدی تعاملی، شیدرهای سفارشی GLSL، سیستم‌های ذرات روی GPU و هندسه‌های واکنش‌گرا.",
    tags: ["Three.js", "WebGL 2.0", "GLSL Shaders", "3D Math", "Particles"],
  },
  {
    id: "babylon",
    name: "Babylon.js 3D Engine",
    shortName: "Babylon.js",
    icon: "mdi-rotate-3d-variant",
    level: 90,
    colorHex: "#edff20",
    descEn:
      "Creating interactive 3D constellations, holographic materials, GlowLayer post-processing, and orbital camera systems.",
    descFa:
      "ایجاد صحنه‌های سه‌بعدی تعاملی، متریال‌های هولوگرافیک، پردازش تصویر GlowLayer و دوربین‌های مداری.",
    tags: ["Babylon.js", "GlowLayer", "ArcRotateCamera", "3D Picking"],
  },
  {
    id: "gsap",
    name: "GSAP Motion & Choreography",
    shortName: "GSAP Motion",
    icon: "mdi-animation-play",
    level: 95,
    colorHex: "#a4ff91",
    descEn:
      "Choreographing 60fps timelines, 3D perspective card tilts, magnetic micro-interactions, and smooth camera transitions.",
    descFa:
      "طراحی انیمیشن‌های ۶۰ فریم بر ثانیه، افکت‌های پرسپکتیو سه‌بعدی، تعاملات مغناطیسی و حرکت نرم دوربین.",
    tags: ["GSAP 3", "Timelines", "3D Perspective", "QuickTo", "Easing"],
  },
  {
    id: "rails",
    name: "Ruby on Rails & Backend APIs",
    shortName: "Ruby on Rails",
    icon: "mdi-language-ruby-on-rails",
    level: 88,
    colorHex: "#52d379",
    descEn:
      "Developing backend APIs, services, conversation workflows, reporting features, and complex data operations.",
    descFa:
      "توسعه سرویس‌ها و APIهای بک‌اند با Ruby on Rails، جریان‌های گفت‌وگو، گزارش‌گیری و عملیات داده.",
    tags: ["Ruby on Rails", "REST APIs", "Data Workflows", "Reporting"],
  },
  {
    id: "web3",
    name: "Web3.js & DApp Frontends",
    shortName: "Web3 / Blockchain",
    icon: "mdi-ethereum",
    level: 90,
    colorHex: "#edff20",
    descEn:
      "Integrating smart contracts, NFT minting portals, token staking dashboards, and wallet connections with Web3.js.",
    descFa:
      "پیاده‌سازی پورتال‌های ضرب NFT، داشبوردهای Staking و اتصال کیف‌پول‌های بلاکچین با Web3.js.",
    tags: ["Web3.js", "NFT Minting", "Staking", "Smart Contracts"],
  },
  {
    id: "widgets",
    name: "Chatbots & AI Workflows",
    shortName: "Chatbots & AI",
    icon: "mdi-robot",
    level: 94,
    colorHex: "#a4ff91",
    descEn:
      "Building real-time chatbot systems, embeddable web widgets, and leveraging AI tools like Antigravity & Codex for rapid delivery.",
    descFa:
      "توسعه سامانه‌های چت‌بات بلادرنگ، ویجت‌های وب تولیدی و بهره‌گیری از ابزارهای هوش مصنوعی مانند Antigravity و Codex.",
    tags: ["Chatbots", "Web Widgets", "Antigravity", "Codex", "Firebase"],
  },
  {
    id: "qa",
    name: "Test Automation & Mentorship",
    shortName: "QA & Mentoring",
    icon: "mdi-shield-check",
    level: 93,
    colorHex: "#52d379",
    descEn:
      "Manual & automated testing, technical interviewing for frontend/QA roles, and mentoring aspiring frontend developers.",
    descFa:
      "تست دستی و اتوماسیون، مصاحبه فنی برای موقعیت‌های فرانت‌اند و تست، و آموزش علاقه‌مندان به برنامه‌نویسی.",
    tags: ["Automation QA", "Mentorship", "Technical Interviews", "Agile"],
  },
];

export default defineComponent({
  name: "BabylonTechCore",
  setup() {
    const canvasWrapRef = ref(null);
    const babylonCanvas = ref(null);
    const inspectorRef = ref(null);
    const selectedIndex = ref(0);
    const autoRotate = ref(true);

    const projectedNodes = reactive(
      skillNodes.map(() => ({
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        zIndex: 2,
        behind: false,
      }))
    );

    const $q = useQuasar();
    const { t } = useI18n({ useScope: "global" });
    const utilStore = useUtilStore();

    const isDark = computed(() => $q.dark.isActive);
    const isFa = computed(() => utilStore.language === "fa-IR");
    const activeSkill = computed(() => skillNodes[selectedIndex.value]);

    let engine = null;
    let scene = null;
    let camera = null;
    let coreMesh = null;
    let innerCrystal = null;
    let coreMat = null;
    let ringMeshes = [];
    let satelliteGroups = [];
    let angleTime = 0;

    const createBabylonScene = () => {
      const canvas = babylonCanvas.value;
      if (!canvas) return;

      engine = new Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
      });

      scene = new Scene(engine);
      scene.clearColor = new Color4(0, 0, 0, 0);

      camera = new ArcRotateCamera(
        "constellationCam",
        -Math.PI / 3,
        Math.PI / 2.5,
        9.5,
        Vector3.Zero(),
        scene
      );
      camera.attachControl(canvas, true);
      camera.lowerRadiusLimit = 6.0;
      camera.upperRadiusLimit = 14;
      camera.wheelPrecision = 40;
      camera.panningSensibility = 0;

      const hemiLight = new HemisphericLight(
        "hemi",
        new Vector3(0, 1, 0),
        scene
      );
      hemiLight.intensity = 0.9;

      const pointLight = new PointLight("coreLight", Vector3.Zero(), scene);
      pointLight.intensity = 1.4;
      pointLight.diffuse = Color3.FromHexString("#a4ff91");

      const glow = new GlowLayer("glow", scene);
      glow.intensity = isDark.value ? 0.55 : 0.3;

      const primaryColor = Color3.FromHexString(
        isDark.value ? "#a4ff91" : "#4c7753"
      );
      const secondaryColor = Color3.FromHexString("#52d379");
      const accentColor = Color3.FromHexString(
        isDark.value ? "#edff20" : "#2f5e39"
      );

      // Central Geodesic Core
      coreMesh = MeshBuilder.CreatePolyhedron(
        "corePoly",
        { type: 2, size: 1.15 },
        scene
      );
      coreMat = new StandardMaterial("coreMat", scene);
      coreMat.diffuseColor = primaryColor;
      coreMat.emissiveColor = primaryColor.scale(0.5);
      coreMat.wireframe = true;
      coreMesh.material = coreMat;

      innerCrystal = MeshBuilder.CreatePolyhedron(
        "innerCrystal",
        { type: 1, size: 0.72 },
        scene
      );
      const innerMat = new StandardMaterial("innerMat", scene);
      innerMat.diffuseColor = secondaryColor;
      innerMat.emissiveColor = secondaryColor.scale(0.45);
      innerMat.alpha = 0.88;
      innerCrystal.material = innerMat;

      // 3 Orbital Gyro Rings
      ringMeshes = [];
      [2.5, 3.5, 4.3].forEach((diameter, idx) => {
        const torus = MeshBuilder.CreateTorus(
          `ring_${idx}`,
          { diameter: diameter * 1.45, thickness: 0.028, tessellation: 72 },
          scene
        );
        const rMat = new StandardMaterial(`rMat_${idx}`, scene);
        const c =
          idx === 0 ? primaryColor : idx === 1 ? secondaryColor : accentColor;
        rMat.emissiveColor = c.scale(0.45);
        rMat.diffuseColor = c;
        rMat.alpha = 0.42;
        torus.material = rMat;
        torus.rotation.x = Math.PI * (0.2 + idx * 0.14);
        torus.rotation.z = Math.PI * (0.1 * idx);
        ringMeshes.push(torus);
      });

      // Create 8 Orbiting Skill Satellites
      satelliteGroups = [];
      skillNodes.forEach((node, index) => {
        const angle = (index / skillNodes.length) * Math.PI * 2;
        const orbitRadius = index % 2 === 0 ? 3.2 : 3.95;
        const yOffset = ((index % 3) - 1) * 0.82;

        const satSphere = MeshBuilder.CreatePolyhedron(
          `sat_${index}`,
          { type: index % 2 === 0 ? 1 : 2, size: 0.28 },
          scene
        );

        const satColor = Color3.FromHexString(
          isDark.value
            ? node.colorHex
            : node.colorHex === "#edff20"
            ? "#4c7753"
            : "#3b6e47"
        );
        const satMat = new StandardMaterial(`satMat_${index}`, scene);
        satMat.diffuseColor = satColor;
        satMat.emissiveColor = satColor.scale(0.45);
        satSphere.material = satMat;

        const halo = MeshBuilder.CreateTorus(
          `halo_${index}`,
          { diameter: 0.78, thickness: 0.02, tessellation: 32 },
          scene
        );
        halo.parent = satSphere;
        halo.material = satMat;

        satelliteGroups.push({
          mesh: satSphere,
          halo,
          mat: satMat,
          baseAngle: angle,
          orbitRadius,
          yOffset,
          index,
        });
      });

      // Click / Pick handler on 3D Canvas
      scene.onPointerDown = (evt, pickResult) => {
        if (pickResult && pickResult.hit && pickResult.pickedMesh) {
          const pickedName = pickResult.pickedMesh.name || "";
          if (pickedName.startsWith("sat_")) {
            const idx = parseInt(pickedName.split("_")[1], 10);
            if (!Number.isNaN(idx)) {
              selectSkillNode(idx);
            }
          } else if (
            pickedName === "corePoly" ||
            pickedName === "innerCrystal"
          ) {
            utilStore.triggerPulse();
            pulseCore();
          }
        }
      };

      scene.registerBeforeRender(() => {
        const dt = engine.getDeltaTime() * 0.001;
        if (autoRotate.value) {
          angleTime += dt * 0.32;
        }

        if (coreMesh && innerCrystal) {
          coreMesh.rotation.y += dt * 0.45;
          coreMesh.rotation.x += dt * 0.25;
          innerCrystal.rotation.y -= dt * 0.75;
          innerCrystal.rotation.z += dt * 0.35;
        }

        ringMeshes.forEach((ring, rIdx) => {
          ring.rotation.y += dt * (0.22 - rIdx * 0.05);
          ring.rotation.z += dt * (0.12 + rIdx * 0.04);
        });

        const wrapEl = canvasWrapRef.value;
        const width = wrapEl ? wrapEl.clientWidth : 400;
        const height = wrapEl ? wrapEl.clientHeight : 260;
        const transformMatrix = scene.getTransformMatrix();
        const viewport = camera.viewport.toGlobal(width, height);

        satelliteGroups.forEach((sat, sIdx) => {
          const curAngle = sat.baseAngle + angleTime;
          sat.mesh.position.x = Math.cos(curAngle) * sat.orbitRadius;
          sat.mesh.position.z = Math.sin(curAngle) * sat.orbitRadius;
          sat.mesh.position.y =
            sat.yOffset + Math.sin(angleTime * 2.0 + sat.index) * 0.2;
          sat.mesh.rotation.y += dt * 1.1;
          sat.halo.rotation.x += dt * 1.6;

          // Project 3D position to crisp 2D HTML coordinates
          const labelWorldPos = sat.mesh.position.add(new Vector3(0, 0.48, 0));
          const screenPos = Vector3.Project(
            labelWorldPos,
            Matrix.Identity(),
            transformMatrix,
            viewport
          );

          const isSelected = selectedIndex.value === sIdx;
          const depthNorm = Math.max(0, Math.min(1, (1 - screenPos.z) * 18));
          const isBehind = screenPos.z > 0.928;

          projectedNodes[sIdx].x = screenPos.x;
          projectedNodes[sIdx].y = screenPos.y;
          projectedNodes[sIdx].scale = isSelected
            ? 1.08
            : isBehind
            ? 0.82
            : 0.94;
          projectedNodes[sIdx].opacity = isSelected
            ? 1
            : isBehind
            ? 0.45
            : 0.88;
          projectedNodes[sIdx].zIndex = isSelected
            ? 20
            : Math.round(depthNorm * 10);
          projectedNodes[sIdx].behind = isBehind;
        });
      });

      engine.runRenderLoop(() => {
        if (scene) {
          scene.render();
        }
      });
    };

    const pulseCore = () => {
      if (!coreMesh) return;
      gsap.fromTo(
        coreMesh.scaling,
        { x: 1.35, y: 1.35, z: 1.35 },
        { x: 1, y: 1, z: 1, duration: 0.75, ease: "elastic.out(1, 0.4)" }
      );
    };

    const selectSkillNode = (idx) => {
      selectedIndex.value = idx;
      utilStore.triggerPulse();

      const sat = satelliteGroups[idx];
      if (sat && camera) {
        const curAngle = sat.baseAngle + angleTime;
        gsap.to(camera, {
          alpha: -curAngle - Math.PI / 2,
          beta: Math.PI / 2.35,
          radius: 9.0,
          duration: 0.9,
          ease: "power3.out",
        });

        satelliteGroups.forEach((s, sIdx) => {
          const isSel = sIdx === idx;
          const targetScale = isSel ? 1.45 : 1.0;
          gsap.to(s.mesh.scaling, {
            x: targetScale,
            y: targetScale,
            z: targetScale,
            duration: 0.5,
            ease: "back.out(1.7)",
          });
        });
      }

      if (inspectorRef.value) {
        gsap.fromTo(
          inspectorRef.value,
          { opacity: 0.4, y: 8 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
        );
      }
    };

    const resetCamera = () => {
      if (!camera) return;
      gsap.to(camera, {
        alpha: -Math.PI / 3,
        beta: Math.PI / 2.5,
        radius: 9.5,
        duration: 0.9,
        ease: "power3.out",
      });
    };

    const onResize = () => {
      if (engine) engine.resize();
    };

    watch(isDark, (dark) => {
      if (!coreMat) return;
      const pCol = Color3.FromHexString(dark ? "#a4ff91" : "#4c7753");
      coreMat.diffuseColor = pCol;
      coreMat.emissiveColor = pCol.scale(0.5);
    });

    onMounted(() => {
      createBabylonScene();
      window.addEventListener("resize", onResize, { passive: true });
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", onResize);
      if (scene) scene.dispose();
      if (engine) engine.dispose();
    });

    return {
      canvasWrapRef,
      babylonCanvas,
      inspectorRef,
      skillNodes,
      projectedNodes,
      selectedIndex,
      activeSkill,
      autoRotate,
      isFa,
      t,
      selectSkillNode,
      resetCamera,
    };
  },
});
</script>

<style lang="scss" scoped>
.constellation-header {
  border-bottom: 1px solid rgba(164, 255, 145, 0.14);
}
.body--light .constellation-header {
  border-bottom-color: rgba(76, 119, 83, 0.18);
}

.header-orb-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(164, 255, 145, 0.1);
  border: 1px solid rgba(164, 255, 145, 0.25);
}
.body--light .header-orb-icon {
  background: rgba(76, 119, 83, 0.1);
  border-color: rgba(76, 119, 83, 0.25);
}

.live-3d-pill {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 2px 7px;
  border-radius: 99px;
  background: rgba(82, 211, 121, 0.16);
  color: var(--q-color-system-primary-in-dark);
  border: 1px solid rgba(164, 255, 145, 0.3);
}
.body--light .live-3d-pill {
  background: rgba(76, 119, 83, 0.14);
  color: var(--q-color-system-primary-in-light);
  border-color: rgba(76, 119, 83, 0.3);
}

.orbit-ctrl-btn {
  appearance: none;
  border: 1px solid rgba(164, 255, 145, 0.22);
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.25s ease;

  &:hover {
    border-color: var(--q-color-lemon-green);
    background: rgba(164, 255, 145, 0.08);
  }
  &--active {
    border-color: rgba(164, 255, 145, 0.45);
    color: var(--q-color-system-primary-in-dark);
    background: rgba(164, 255, 145, 0.12);
  }
}
.body--light .orbit-ctrl-btn {
  border-color: rgba(76, 119, 83, 0.25);
  &--active {
    border-color: #4c7753;
    color: #2f5436;
    background: rgba(76, 119, 83, 0.14);
  }
}

.canvas-section-wrap {
  width: 100%;
  height: 260px;
  min-height: 260px;
  max-height: 260px;
  overflow: hidden;
}

.babylon-canvas-container {
  width: 100%;
  height: 260px;
  min-height: 260px;
  max-height: 260px;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(82, 211, 121, 0.14) 0%,
    rgba(14, 17, 15, 0.78) 100%
  );
  border: 1px solid rgba(164, 255, 145, 0.2);
}

.body--light .babylon-canvas-container {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(76, 119, 83, 0.16) 0%,
    rgba(225, 232, 227, 0.85) 100%
  );
  border: 1px solid rgba(76, 119, 83, 0.26);
}

.babylon-canvas {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}

/* Crisp 3D-Projected Overlay Badges */
.projected-labels-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.orbit-projected-tag {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: auto;
  appearance: none;
  border: 1px solid rgba(164, 255, 145, 0.32);
  background: rgba(16, 22, 18, 0.85);
  backdrop-filter: blur(6px);
  color: #e8f5eb;
  border-radius: 99px;
  padding: 3px 9px;
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  transition: border-color 0.2s ease, background 0.2s ease;

  .tag-icon {
    color: #a4ff91;
  }

  &:hover {
    border-color: #a4ff91;
    background: rgba(26, 40, 30, 0.95);
  }

  &--active {
    background: linear-gradient(135deg, #52d379, #a4ff91);
    color: #121212;
    border-color: #edff20;
    font-weight: 700;
    box-shadow: 0 0 16px rgba(164, 255, 145, 0.5);

    .tag-icon {
      color: #121212;
    }
  }
}

.body--light .orbit-projected-tag {
  background: rgba(255, 255, 255, 0.9);
  color: #243b28;
  border-color: rgba(76, 119, 83, 0.4);
  .tag-icon {
    color: #4c7753;
  }
  &--active {
    background: #4c7753;
    color: #fff;
    .tag-icon {
      color: #fff;
    }
  }
}

.skill-inspector-box {
  border-radius: 14px;
  min-height: 160px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(164, 255, 145, 0.18);
  transition: border-color 0.3s ease;
}

.skill-desc-text {
  min-height: 52px;
}

.skill-tags-wrap {
  min-height: 28px;
  align-content: flex-start;
}

.body--light .skill-inspector-box {
  background: rgba(76, 119, 83, 0.06);
  border: 1px solid rgba(76, 119, 83, 0.22);
}

.inspector-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: rgba(164, 255, 145, 0.12);
  border: 1px solid rgba(164, 255, 145, 0.28);
}
.body--light .inspector-icon-box {
  background: rgba(76, 119, 83, 0.12);
  border-color: rgba(76, 119, 83, 0.28);
}

.leading-tight {
  line-height: 1.25;
}

.skill-level-pill {
  font-size: 12px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(164, 255, 145, 0.16);
  color: var(--q-color-system-primary-in-dark);
}

.body--light .skill-level-pill {
  background: rgba(76, 119, 83, 0.16);
  color: var(--q-color-system-primary-in-light);
}

.skill-progress-track {
  width: 100%;
  height: 6px;
  border-radius: 99px;
  background: rgba(128, 128, 128, 0.2);
  overflow: hidden;
}

.skill-progress-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #52d379, #a4ff91, #edff20);
  transition: width 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.body--light .skill-progress-fill {
  background: linear-gradient(90deg, #4c7753, #52d379);
}

.tech-mini-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 6px;
  background: rgba(82, 211, 121, 0.12);
  border: 1px solid rgba(82, 211, 121, 0.28);
}

/* 3-Column Grid with Centered Last Line (3 + 3 + 2 centered = 8 items) */
.skill-grid-fullwidth {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  width: 100%;
}

.skill-node-btn {
  grid-column: span 2;
  appearance: none;
  border: 1px solid rgba(164, 255, 145, 0.18);
  background: rgba(255, 255, 255, 0.025);
  color: inherit;
  border-radius: 10px;
  padding: 7px 8px;
  cursor: pointer;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  transition: all 0.25s ease;

  // Center the 2 items in the last (3rd) row:
  // Item 7 (1st item of 3rd row) spans cols 2-3 (leaving col 1 empty on left)
  &:nth-child(7) {
    grid-column: 2 / span 2;
  }
  // Item 8 (2nd item of 3rd row) spans cols 4-5 (leaving col 6 empty on right)
  &:nth-child(8) {
    grid-column: 4 / span 2;
  }

  .skill-btn-inner {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    gap: 6px;
  }

  .node-btn-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: rgba(164, 255, 145, 0.1);
    color: var(--q-color-system-primary-in-dark);
    flex-shrink: 0;
  }

  .skill-btn-label {
    font-size: 11.5px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    flex: 1;
    text-align: start;
    letter-spacing: -0.15px;
  }

  &:hover {
    border-color: var(--q-color-lemon-green);
    transform: translateY(-2px);
    background: rgba(164, 255, 145, 0.06);
  }

  &--active {
    background: linear-gradient(
      135deg,
      rgba(164, 255, 145, 0.22),
      rgba(82, 211, 121, 0.12)
    );
    border-color: #a4ff91;
    box-shadow: 0 4px 14px rgba(82, 211, 121, 0.18);

    .node-btn-icon {
      background: #a4ff91;
      color: #121212;
    }
    .skill-btn-label {
      color: #a4ff91;
      font-weight: 700;
    }
  }
}

.body--light .skill-node-btn {
  border-color: rgba(76, 119, 83, 0.22);
  background: rgba(76, 119, 83, 0.04);
  .node-btn-icon {
    background: rgba(76, 119, 83, 0.12);
    color: #4c7753;
  }
  &--active {
    background: rgba(76, 119, 83, 0.18);
    border-color: #4c7753;
    color: #203b25;
    .node-btn-icon {
      background: #4c7753;
      color: #fff;
    }
    .skill-btn-label {
      color: #203b25;
    }
  }
}

@media (max-width: 440px) {
  .skill-grid-fullwidth {
    grid-template-columns: repeat(2, 1fr);
  }
  .skill-node-btn {
    grid-column: span 1 !important;
  }
}
</style>
