<template>
  <div
    class="sculpture-stage-wrap"
    :class="isDark ? 'stage--dark' : 'stage--light'"
  >
    <canvas ref="canvasRef" class="sculpture-canvas"></canvas>
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
import { useUtilStore } from "stores/util-store";
import { SculptureStage } from "src/three/SculptureStage";

export default defineComponent({
  name: "BackgroundPattern",
  setup() {
    const canvasRef = ref(null);
    const $q = useQuasar();
    const utilStore = useUtilStore();

    const isDark = computed(() => $q.dark.isActive);
    const isRtl = computed(() => utilStore.language === "fa-IR");

    let stage = null;

    const onPointerMove = (e) => {
      if (!stage) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      stage.setPointer(x, y);
    };

    const onPointerLeave = () => {
      if (stage) stage.releasePointer();
    };

    onMounted(() => {
      if (!canvasRef.value) return;
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      stage = new SculptureStage(canvasRef.value, {
        dark: isDark.value,
        rtl: isRtl.value,
        reducedMotion,
      });
      stage.setChapter(utilStore.chapterProgress);
      stage.start();

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    });

    onBeforeUnmount(() => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      if (stage) {
        stage.dispose();
        stage = null;
      }
    });

    watch(isDark, (darkVal) => {
      if (stage) stage.setTheme(darkVal);
    });

    watch(isRtl, (rtlVal) => {
      if (stage) stage.setDirection(rtlVal);
    });

    watch(
      () => utilStore.chapterProgress,
      (val) => {
        if (stage) stage.setChapter(val);
      }
    );

    watch(
      () => utilStore.pulseTrigger,
      () => {
        if (stage) stage.pulse();
      }
    );

    watch(
      () => utilStore.highlightSculpture,
      (on) => {
        if (stage) stage.setHighlight(on);
      }
    );

    return {
      canvasRef,
      isDark,
    };
  },
});
</script>

<style lang="scss" scoped>
.sculpture-stage-wrap {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.sculpture-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
