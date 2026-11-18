<template>
  <div class="babylon-holo-stage glass-3d-subcard q-pa-md q-mb-lg">
    <!-- Clean Redesigned Stage Header -->
    <div class="row items-center justify-between q-mb-sm stage-header q-pb-xs">
      <div class="row items-center no-wrap">
        <div class="stage-orb-icon flex flex-center q-mr-sm">
          <q-icon name="mdi-monitor-dashboard" size="20px" class="text-system-primary" />
        </div>
        <div class="column">
          <div class="row items-center q-gutter-x-sm">
            <span class="text-subtitle2 text-bold">{{ t("holoStageTitle") }}</span>
            <span class="live-3d-pill">3D PREVIEW</span>
          </div>
          <span class="text-caption opacity-70">{{ t("holoStageHint") }}</span>
        </div>
      </div>

      <!-- Project Switcher Controls -->
      <div class="row items-center q-gutter-x-xs">
        <button
          type="button"
          class="stage-nav-btn"
          aria-label="Previous project"
          @click="$emit('prev')"
        >
          <q-icon name="mdi-chevron-left" size="18px" />
        </button>
        <span class="stage-counter-pill">
          {{ activeIndex + 1 }} / {{ totalCount }}
        </span>
        <button
          type="button"
          class="stage-nav-btn"
          aria-label="Next project"
          @click="$emit('next')"
        >
          <q-icon name="mdi-chevron-right" size="18px" />
        </button>
      </div>
    </div>

    <!-- 3D Babylon.js Hologram Monitor Viewport -->
    <div class="holo-canvas-wrap relative-position">
      <canvas ref="holoCanvas" class="holo-canvas"></canvas>

      <!-- Bottom HUD Bar with Project Title, Slide Switcher & Actions -->
      <div
        class="holo-overlay-bottom row items-center justify-between full-width q-px-md q-py-xs"
      >
        <div class="row items-center q-gutter-x-sm ellipsis" style="max-width: 65%">
          <q-icon
            name="mdi-cube-outline"
            class="text-system-primary"
            size="18px"
          />
          <span class="text-subtitle2 text-bold ellipsis">{{
            projectTitle
          }}</span>
        </div>
        <div class="row items-center q-gutter-x-sm">
          <q-btn
            v-if="projectLink"
            dense
            no-caps
            unelevated
            size="sm"
            icon="mdi-open-in-new"
            :label="t('liveDemo')"
            :href="projectLink"
            target="_blank"
            class="holo-action-btn q-px-sm"
          />
          <button
            type="button"
            class="stage-nav-btn"
            title="Fullscreen Gallery"
            aria-label="Open fullscreen preview"
            @click="$emit('open-fullscreen')"
          >
            <q-icon name="mdi-fullscreen" size="18px" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { Engine } from "@babylonjs/core/Engines/engine.js";
import { Scene } from "@babylonjs/core/scene.js";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import gsap from "gsap";

export default defineComponent({
  name: "BabylonHoloStage",
  props: {
    imageSrc: {
      type: String,
      required: true,
    },
    projectTitle: {
      type: String,
      default: "",
    },
    projectLink: {
      type: String,
      default: "",
    },
    activeIndex: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 9,
    },
  },
  emits: ["prev", "next", "open-fullscreen"],
  setup(props) {
    const holoCanvas = ref(null);
    const $q = useQuasar();
    const { t } = useI18n({ useScope: "global" });
    const isDark = computed(() => $q.dark.isActive);

    let engine = null;
    let scene = null;
    let camera = null;
    let screenGroup = null;
    let screenDynTex = null;
    let frameMat = null;
    let baseRings = [];
    let elapsed = 0;

    // Draw project WebP image onto the 3D screen DynamicTexture cleanly without bloom washout
    const drawImageTo3DScreen = (srcUrl) => {
      if (!screenDynTex || !srcUrl) return;
      const ctx = screenDynTex.getContext();
      const W = 1024;
      const H = 576;

      const img = new Image();
      img.onload = () => {
        if (!screenDynTex) return;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#101612";
        ctx.fillRect(0, 0, W, H);

        // Cover/contain fit inside the 16:9 3D monitor canvas
        const imgRatio = img.width / img.height;
        const canvasRatio = W / H;
        let drawW = W;
        let drawH = H;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > canvasRatio) {
          drawH = W / imgRatio;
          offsetY = (H - drawH) / 2;
        } else {
          drawW = H * imgRatio;
          offsetX = (W - drawW) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

        // Subtle neon border frame around the 3D screen
        ctx.strokeStyle = isDark.value ? "#a4ff91" : "#52d379";
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, W - 8, H - 8);

        screenDynTex.update();
      };
      img.onerror = () => {
        console.warn("Could not load holo stage image:", srcUrl);
      };
      img.src = "/" + srcUrl.replace(/^\/+/, "");
    };

    const initHoloStage = () => {
      const canvas = holoCanvas.value;
      if (!canvas) return;

      engine = new Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
      });

      scene = new Scene(engine);
      scene.clearColor = new Color4(0, 0, 0, 0);

      camera = new ArcRotateCamera(
        "holoCam",
        -Math.PI / 2,
        Math.PI / 2.15,
        6.6,
        new Vector3(0, 0.15, 0),
        scene
      );
      camera.attachControl(canvas, true);
      camera.lowerRadiusLimit = 4.8;
      camera.upperRadiusLimit = 9.5;
      camera.wheelPrecision = 45;
      camera.panningSensibility = 0;

      const light = new HemisphericLight("hemi", new Vector3(0, 1, -1), scene);
      light.intensity = 1.0;

      const glow = new GlowLayer("holoGlow", scene);
      glow.intensity = isDark.value ? 0.5 : 0.25;

      const primaryCol = Color3.FromHexString(
        isDark.value ? "#a4ff91" : "#4c7753"
      );
      const secondaryCol = Color3.FromHexString("#52d379");

      screenGroup = new Mesh("screenGroup", scene);

      // 3D Widescreen Display Plane (Excluded from GlowLayer so screenshot is 100% crisp!)
      const screenPlane = MeshBuilder.CreatePlane(
        "screenPlane",
        { width: 5.2, height: 2.92 },
        scene
      );
      screenPlane.parent = screenGroup;
      screenPlane.position.y = 0.28;
      glow.addExcludedMesh(screenPlane);

      screenDynTex = new DynamicTexture(
        "screenDynTex",
        { width: 1024, height: 576 },
        scene,
        true
      );
      const initCtx = screenDynTex.getContext();
      initCtx.fillStyle = "#101612";
      initCtx.fillRect(0, 0, 1024, 576);
      initCtx.strokeStyle = isDark.value ? "#a4ff91" : "#52d379";
      initCtx.lineWidth = 8;
      initCtx.strokeRect(4, 4, 1016, 568);
      screenDynTex.update();

      const screenMat = new StandardMaterial("screenMat", scene);
      screenMat.diffuseTexture = screenDynTex;
      screenMat.emissiveTexture = screenDynTex;
      screenMat.emissiveColor = new Color3(1, 1, 1);
      screenMat.disableLighting = true;
      screenMat.backFaceCulling = false;
      screenPlane.material = screenMat;

      drawImageTo3DScreen(props.imageSrc);

      // Glowing Hologram Wireframe Bezel behind the screen
      const framePlane = MeshBuilder.CreatePlane(
        "framePlane",
        { width: 5.46, height: 3.16 },
        scene
      );
      framePlane.parent = screenGroup;
      framePlane.position.y = 0.28;
      framePlane.position.z = 0.05;

      frameMat = new StandardMaterial("frameMat", scene);
      frameMat.diffuseColor = primaryCol;
      frameMat.emissiveColor = primaryCol.scale(0.5);
      frameMat.wireframe = true;
      framePlane.material = frameMat;

      // Hologram Projector Base Rings
      baseRings = [];
      [3.5, 2.4, 1.3].forEach((diam, idx) => {
        const ring = MeshBuilder.CreateTorus(
          `holoBase_${idx}`,
          { diameter: diam, thickness: 0.028, tessellation: 64 },
          scene
        );
        ring.position.y = -1.48 - idx * 0.09;
        const rMat = new StandardMaterial(`hbMat_${idx}`, scene);
        rMat.emissiveColor = (idx % 2 === 0 ? primaryCol : secondaryCol).scale(
          0.5
        );
        rMat.alpha = 0.5;
        ring.material = rMat;
        baseRings.push(ring);
      });

      scene.registerBeforeRender(() => {
        const dt = engine.getDeltaTime() * 0.001;
        elapsed += dt;
        if (screenGroup) {
          screenGroup.position.y = Math.sin(elapsed * 1.8) * 0.07;
        }
        baseRings.forEach((r, idx) => {
          r.rotation.y += dt * (0.5 + idx * 0.25) * (idx % 2 === 0 ? 1 : -1);
        });
      });

      engine.runRenderLoop(() => {
        if (scene) scene.render();
      });
    };

    watch(
      () => props.imageSrc,
      (newSrc) => {
        if (!newSrc) return;
        drawImageTo3DScreen(newSrc);

        if (screenGroup) {
          gsap.fromTo(
            screenGroup.rotation,
            { y: -0.32, x: 0.08 },
            {
              y: 0,
              x: 0,
              duration: 0.7,
              ease: "back.out(1.6)",
            }
          );
          gsap.fromTo(
            screenGroup.scaling,
            { x: 0.93, y: 0.93, z: 0.93 },
            {
              x: 1,
              y: 1,
              z: 1,
              duration: 0.6,
              ease: "power3.out",
            }
          );
        }
      }
    );

    watch(isDark, (dark) => {
      if (!frameMat) return;
      const c = Color3.FromHexString(dark ? "#a4ff91" : "#4c7753");
      frameMat.diffuseColor = c;
      frameMat.emissiveColor = c.scale(0.5);
      drawImageTo3DScreen(props.imageSrc);
    });

    const onResize = () => {
      if (engine) engine.resize();
    };

    onMounted(() => {
      initHoloStage();
      window.addEventListener("resize", onResize, { passive: true });
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", onResize);
      if (screenDynTex) screenDynTex.dispose();
      if (scene) scene.dispose();
      if (engine) engine.dispose();
    });

    return {
      holoCanvas,
      t,
    };
  },
});
</script>

<style lang="scss" scoped>
.stage-header {
  border-bottom: 1px solid rgba(164, 255, 145, 0.14);
}
.body--light .stage-header {
  border-bottom-color: rgba(76, 119, 83, 0.18);
}

.stage-orb-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(164, 255, 145, 0.1);
  border: 1px solid rgba(164, 255, 145, 0.25);
}
.body--light .stage-orb-icon {
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

.stage-nav-btn {
  appearance: none;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(164, 255, 145, 0.24);
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: #a4ff91;
    color: #a4ff91;
    background: rgba(164, 255, 145, 0.1);
  }
}
.body--light .stage-nav-btn {
  border-color: rgba(76, 119, 83, 0.28);
  &:hover {
    border-color: #4c7753;
    color: #4c7753;
  }
}

.stage-counter-pill {
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 8px;
  background: rgba(164, 255, 145, 0.08);
  border: 1px solid rgba(164, 255, 145, 0.18);
}

.holo-canvas-wrap {
  width: 100%;
  height: 245px;
  border-radius: 12px;
  overflow: hidden;
  background: radial-gradient(
    circle at 50% 45%,
    rgba(82, 211, 121, 0.15) 0%,
    rgba(14, 17, 15, 0.78) 100%
  );
  border: 1px solid rgba(164, 255, 145, 0.2);
}

.body--light .holo-canvas-wrap {
  background: radial-gradient(
    circle at 50% 45%,
    rgba(76, 119, 83, 0.16) 0%,
    rgba(225, 232, 227, 0.85) 100%
  );
  border: 1px solid rgba(76, 119, 83, 0.26);
}

.holo-canvas {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}

.holo-overlay-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(14, 18, 15, 0.92) 0%,
    rgba(14, 18, 15, 0.55) 75%,
    transparent 100%
  );
  color: #fff;
}

.holo-action-btn {
  background: linear-gradient(135deg, #52d379, #a4ff91);
  color: #121212 !important;
  font-weight: 700;
  border-radius: 8px;
}
</style>
