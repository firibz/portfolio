<template>
  <div
    class="dynamic-background-container"
    :class="[
      isDark ? 'theme--dark' : 'theme--light',
      { 'work-hovered': utilStore.hoveredWorkIndex >= 0 },
    ]"
    aria-hidden="true"
  >
    <!-- Smooth 3D Perspective Plane with Pointer Parallax -->
    <div ref="parallaxStageRef" class="parallax-3d-stage">
      <!-- Overlapping Crossfade Between Distinct Pattern Layers -->
      <Transition name="pattern-crossfade">
        <!-- PATTERN 1: ORBITAL CORE (Circular Orbiting Blurred Bokeh) -->
        <div
          v-if="activeMode === 'orbital'"
          key="orbital"
          class="pattern-layer pattern-orbital"
        >
          <span v-for="n in 20" :key="`orb-${n}`"></span>
        </div>

        <!-- PATTERN 2: CYBER WAVE (Flowing Vertical Blurred Pillars) -->
        <div
          v-else-if="activeMode === 'matrix'"
          key="matrix"
          class="pattern-layer pattern-matrix"
        >
          <span v-for="n in 20" :key="`mat-${n}`"></span>
        </div>

        <!-- PATTERN 3: QUANTUM NEBULA (Drifting Cosmic Clouds & Breathing Halos) -->
        <div v-else key="nebula" class="pattern-layer pattern-nebula">
          <span v-for="n in 14" :key="`neb-${n}`"></span>
        </div>
      </Transition>
    </div>

    <!-- Soft Ambient Vignette for contrast & glassmorphic depth -->
    <div class="background-vignette"></div>

    <!-- One-Shot Soft Energy Pulse Ring (No snap-back or flash) -->
    <div v-if="pulseKey > 0" :key="pulseKey" class="pulse-energy-wave"></div>
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

export default defineComponent({
  name: "BackgroundPattern",
  setup() {
    const $q = useQuasar();
    const utilStore = useUtilStore();

    const isDark = computed(() => $q.dark.isActive);
    const activeMode = computed(() => utilStore.sceneMode || "matrix");
    const parallaxStageRef = ref(null);
    const pulseKey = ref(0);

    // Smooth 3D Parallax Pointer Tracking (direct DOM transform for 0 Vue reactivity overhead)
    const pointer = {
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
    };
    let animFrameId = null;

    const updateParallax = () => {
      const dx = pointer.targetX - pointer.currentX;
      const dy = pointer.targetY - pointer.currentY;

      if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
        pointer.currentX += dx * 0.05;
        pointer.currentY += dy * 0.05;

        if (parallaxStageRef.value) {
          const rotX = (-pointer.currentY * 3.0).toFixed(2);
          const rotY = (pointer.currentX * 3.0).toFixed(2);
          const transX = (pointer.currentX * 14).toFixed(1);
          const transY = (pointer.currentY * 14).toFixed(1);
          parallaxStageRef.value.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate3d(${transX}px, ${transY}px, 0)`;
        }
      }

      animFrameId = requestAnimationFrame(updateParallax);
    };

    const onPointerMove = (e) => {
      if (!window.innerWidth || !window.innerHeight) return;
      pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    // Trigger subtle expanding ring on explicit pulse / interactions
    watch(
      () => utilStore.pulseTrigger,
      (val) => {
        if (val) {
          pulseKey.value += 1;
        }
      }
    );

    onMounted(() => {
      window.addEventListener("mousemove", onPointerMove, { passive: true });
      animFrameId = requestAnimationFrame(updateParallax);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("mousemove", onPointerMove);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    });

    return {
      isDark,
      activeMode,
      utilStore,
      parallaxStageRef,
      pulseKey,
    };
  },
});
</script>

<style lang="scss" scoped>
/* ==========================================================================
   DYNAMIC BACKGROUND CONTAINER & UNIFIED BRAND PALETTE
   Same brand colors across all 3 modes; only the motion/shape pattern changes.
   ========================================================================== */
.dynamic-background-container {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: var(--bg-canvas);
  transition: background 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.theme--dark {
  --bg-canvas: #121212;
  --color-green-solid: var(--q-color-lemon-green, #52d379);
  --color-dark-solid: #282828;
  --color-yellow-solid: var(--q-color-lemon-yellow, #edff20);

  --grad-green-strong: rgba(82, 211, 121, 0.36);
  --grad-green-mid: rgba(82, 211, 121, 0.14);
  --grad-yellow-strong: rgba(237, 255, 32, 0.24);
  --grad-yellow-mid: rgba(237, 255, 32, 0.08);
  --grad-dark-strong: rgba(26, 30, 28, 0.65);
  --grad-halo-green: rgba(164, 255, 145, 0.16);
  --grad-halo-yellow: rgba(237, 255, 32, 0.12);

  --pulse-ring-color: rgba(164, 255, 145, 0.24);
  --vignette-edge: rgba(0, 0, 0, 0.38);
}

.theme--light {
  --bg-canvas: linear-gradient(135deg, #edf3ef 0%, #dfe9e2 50%, #e9f1ec 100%);
  --color-green-solid: rgba(56, 168, 88, 0.42);
  --color-dark-solid: rgba(112, 142, 124, 0.26);
  --color-yellow-solid: rgba(232, 184, 24, 0.44);

  --grad-green-strong: rgba(56, 168, 88, 0.4);
  --grad-green-mid: rgba(56, 168, 88, 0.16);
  --grad-yellow-strong: rgba(232, 184, 24, 0.38);
  --grad-yellow-mid: rgba(232, 184, 24, 0.14);
  --grad-dark-strong: rgba(102, 134, 114, 0.26);
  --grad-halo-green: rgba(56, 168, 88, 0.24);
  --grad-halo-yellow: rgba(232, 184, 24, 0.2);

  --pulse-ring-color: rgba(76, 119, 83, 0.26);
  --vignette-edge: rgba(205, 218, 210, 0.32);
}

/* 3D Parallax Stage with Overhang to hide edges during subtle tilt */
.parallax-3d-stage {
  position: absolute;
  inset: -6vh -6vw;
  width: 112vw;
  height: 112vh;
  will-change: transform;
  transform-style: preserve-3d;
}

/* Shared Pattern Layer Base */
.pattern-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: filter 0.6s ease;
}

.work-hovered .pattern-layer {
  filter: brightness(1.08);
}

/* ==========================================================================
   SILKY CROSSFADE TRANSITION BETWEEN PATTERNS
   Both entering & leaving layers overlap smoothly with zero jump/snap.
   ========================================================================== */
.pattern-crossfade-enter-active,
.pattern-crossfade-leave-active {
  transition: opacity 0.85s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.85s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}

.pattern-crossfade-enter-from {
  opacity: 0;
  transform: scale(1.03);
}

.pattern-crossfade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

/* ==========================================================================
   PATTERN 1: ORBITAL CORE (Classic 20-node blurred orbital bokeh)
   ========================================================================== */
@keyframes blured_move {
  100% {
    transform: translate3d(0, 0, 1px) rotate(360deg);
  }
}

.pattern-orbital {
  span {
    width: 20vmin;
    height: 20vmin;
    border-radius: 20vmin;
    backface-visibility: hidden;
    position: absolute;
    animation-name: blured_move;
    animation-duration: 6s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    will-change: transform;
  }

  span:nth-child(1),
  span:nth-child(3),
  span:nth-child(5),
  span:nth-child(8),
  span:nth-child(11),
  span:nth-child(12),
  span:nth-child(15),
  span:nth-child(20) {
    color: var(--color-green-solid);
  }

  span:nth-child(2),
  span:nth-child(6),
  span:nth-child(7),
  span:nth-child(9),
  span:nth-child(10),
  span:nth-child(13),
  span:nth-child(16),
  span:nth-child(17),
  span:nth-child(19) {
    color: var(--color-dark-solid);
  }

  span:nth-child(4),
  span:nth-child(14),
  span:nth-child(18) {
    color: var(--color-yellow-solid);
  }

  span:nth-child(1) {
    top: 56%;
    left: 9%;
    animation-duration: 11s;
    animation-delay: -8.1s;
    transform-origin: 6vw -10vh;
    box-shadow: 40vmin 0 13.0166555866vmin currentColor;
  }
  span:nth-child(2) {
    top: 72%;
    left: 75%;
    animation-duration: 11.1s;
    animation-delay: -3.8s;
    transform-origin: -12vw 9vh;
    box-shadow: 40vmin 0 6.1961466709vmin currentColor;
  }
  span:nth-child(3) {
    top: 9%;
    left: 81%;
    animation-duration: 11.9s;
    animation-delay: -7.1s;
    transform-origin: 23vw 2vh;
    box-shadow: -40vmin 0 7.4502495452vmin currentColor;
  }
  span:nth-child(4) {
    top: 2%;
    left: 17%;
    animation-duration: 12s;
    animation-delay: -2.8s;
    transform-origin: -16vw 8vh;
    box-shadow: -40vmin 0 12.533787847vmin currentColor;
  }
  span:nth-child(5) {
    top: 25%;
    left: 4%;
    animation-duration: 15.6s;
    animation-delay: -8s;
    transform-origin: -20vw -22vh;
    box-shadow: -40vmin 0 5.4723418582vmin currentColor;
  }
  span:nth-child(6) {
    top: 25%;
    left: 11%;
    animation-duration: 12.4s;
    animation-delay: -7.2s;
    transform-origin: 6vw -17vh;
    box-shadow: 40vmin 0 10.0276258235vmin currentColor;
  }
  span:nth-child(7) {
    top: 5%;
    left: 29%;
    animation-duration: 10.4s;
    animation-delay: -8.4s;
    transform-origin: 20vw 5vh;
    box-shadow: -40vmin 0 6.0912947411vmin currentColor;
  }
  span:nth-child(8) {
    top: 38%;
    left: 18%;
    animation-duration: 14s;
    animation-delay: -13.9s;
    transform-origin: 5vw -1vh;
    box-shadow: -40vmin 0 7.4727724313vmin currentColor;
  }
  span:nth-child(9) {
    top: 63%;
    left: 83%;
    animation-duration: 11.6s;
    animation-delay: -10.9s;
    transform-origin: -2vw -11vh;
    box-shadow: -40vmin 0 7.1376872218vmin currentColor;
  }
  span:nth-child(10) {
    top: 44%;
    left: 64%;
    animation-duration: 12s;
    animation-delay: -4.7s;
    transform-origin: -24vw 17vh;
    box-shadow: 40vmin 0 7.4094127515vmin currentColor;
  }
  span:nth-child(11) {
    top: 73%;
    left: 76%;
    animation-duration: 15.8s;
    animation-delay: -6.2s;
    transform-origin: -9vw -24vh;
    box-shadow: 40vmin 0 14.0899880498vmin currentColor;
  }
  span:nth-child(12) {
    top: 4%;
    left: 96%;
    animation-duration: 12.1s;
    animation-delay: -7.9s;
    transform-origin: -7vw 11vh;
    box-shadow: 40vmin 0 12.0679060615vmin currentColor;
  }
  span:nth-child(13) {
    top: 80%;
    left: 89%;
    animation-duration: 10.7s;
    animation-delay: -9.6s;
    transform-origin: -23vw 8vh;
    box-shadow: -40vmin 0 13.4227817909vmin currentColor;
  }
  span:nth-child(14) {
    top: 10%;
    left: 84%;
    animation-duration: 11.7s;
    animation-delay: -13.7s;
    transform-origin: 23vw -9vh;
    box-shadow: 40vmin 0 13.0652683419vmin currentColor;
  }
  span:nth-child(15) {
    top: 31%;
    left: 52%;
    animation-duration: 12s;
    animation-delay: -4.5s;
    transform-origin: 1vw -5vh;
    box-shadow: 40vmin 0 14.569884619vmin currentColor;
  }
  span:nth-child(16) {
    top: 6%;
    left: 98%;
    animation-duration: 12.7s;
    animation-delay: -7.5s;
    transform-origin: 15vw -9vh;
    box-shadow: -40vmin 0 7.281992007vmin currentColor;
  }
  span:nth-child(17) {
    top: 18%;
    left: 96%;
    animation-duration: 12.7s;
    animation-delay: -7.6s;
    transform-origin: -11vw 23vh;
    box-shadow: 40vmin 0 11.8428291366vmin currentColor;
  }
  span:nth-child(18) {
    top: 47%;
    left: 65%;
    animation-duration: 13.3s;
    animation-delay: -12.4s;
    transform-origin: 14vw -13vh;
    box-shadow: -40vmin 0 5.1686799201vmin currentColor;
  }
  span:nth-child(19) {
    top: 51%;
    left: 61%;
    animation-duration: 13.5s;
    animation-delay: -15.1s;
    transform-origin: -11vw 16vh;
    box-shadow: -40vmin 0 9.0171705711vmin currentColor;
  }
  span:nth-child(20) {
    top: 64%;
    left: 96%;
    animation-duration: 14.9s;
    animation-delay: -4.7s;
    transform-origin: 8vw 7vh;
    box-shadow: 40vmin 0 5.1015424987vmin currentColor;
  }
}

/* ==========================================================================
   PATTERN 2: CYBER WAVE / MATRIX STREAM
   Elongated vertical streams & harmonic wave pillars flowing across columns
   ========================================================================== */
@keyframes matrix_stream_down {
  0% {
    transform: translate3d(0, -18vh, 1px) scaleX(0.7) scaleY(1.35);
  }
  50% {
    transform: translate3d(2vw, 10vh, 1px) scaleX(0.95) scaleY(1);
  }
  100% {
    transform: translate3d(0, 38vh, 1px) scaleX(0.7) scaleY(1.35);
  }
}

@keyframes matrix_stream_up {
  0% {
    transform: translate3d(0, 18vh, 1px) scaleX(0.7) scaleY(1.35);
  }
  50% {
    transform: translate3d(-2vw, -10vh, 1px) scaleX(0.95) scaleY(1);
  }
  100% {
    transform: translate3d(0, -38vh, 1px) scaleX(0.7) scaleY(1.35);
  }
}

.pattern-matrix {
  span {
    position: absolute;
    backface-visibility: hidden;
    will-change: transform;
    width: 8vmin;
    height: 38vmin;
    border-radius: 20vmin;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }

  span:nth-child(1),
  span:nth-child(3),
  span:nth-child(5),
  span:nth-child(8),
  span:nth-child(11),
  span:nth-child(12),
  span:nth-child(15),
  span:nth-child(20) {
    color: var(--color-green-solid);
  }

  span:nth-child(2),
  span:nth-child(6),
  span:nth-child(7),
  span:nth-child(9),
  span:nth-child(10),
  span:nth-child(13),
  span:nth-child(16),
  span:nth-child(17),
  span:nth-child(19) {
    color: var(--color-dark-solid);
  }

  span:nth-child(4),
  span:nth-child(14),
  span:nth-child(18) {
    color: var(--color-yellow-solid);
  }

  /* Columns distributed across the viewport */
  span:nth-child(1) {
    left: 5%;
    top: 15%;
    animation-name: matrix_stream_down;
    animation-duration: 8.5s;
    animation-delay: -1.2s;
    box-shadow: 0 0 14vmin currentColor, 0 16vmin 12vmin currentColor;
  }
  span:nth-child(2) {
    left: 11%;
    top: 45%;
    animation-name: matrix_stream_up;
    animation-duration: 11s;
    animation-delay: -3.5s;
    box-shadow: 0 0 12vmin currentColor;
  }
  span:nth-child(3) {
    left: 17%;
    top: 2%;
    animation-name: matrix_stream_down;
    animation-duration: 9.5s;
    animation-delay: -5s;
    box-shadow: 0 0 14vmin currentColor;
  }
  span:nth-child(4) {
    left: 23%;
    top: 30%;
    animation-name: matrix_stream_up;
    animation-duration: 12s;
    animation-delay: -2.1s;
    box-shadow: 0 0 15vmin currentColor;
  }
  span:nth-child(5) {
    left: 29%;
    top: 60%;
    animation-name: matrix_stream_down;
    animation-duration: 10s;
    animation-delay: -6.4s;
    box-shadow: 0 0 13vmin currentColor;
  }
  span:nth-child(6) {
    left: 35%;
    top: 12%;
    animation-name: matrix_stream_up;
    animation-duration: 13s;
    animation-delay: -4.3s;
    box-shadow: 0 0 14vmin currentColor;
  }
  span:nth-child(7) {
    left: 41%;
    top: 50%;
    animation-name: matrix_stream_down;
    animation-duration: 8.8s;
    animation-delay: -7.2s;
    box-shadow: 0 0 12vmin currentColor;
  }
  span:nth-child(8) {
    left: 47%;
    top: 8%;
    animation-name: matrix_stream_up;
    animation-duration: 11.5s;
    animation-delay: -1.5s;
    box-shadow: 0 0 14vmin currentColor;
  }
  span:nth-child(9) {
    left: 53%;
    top: 42%;
    animation-name: matrix_stream_down;
    animation-duration: 9.2s;
    animation-delay: -5.8s;
    box-shadow: 0 0 13vmin currentColor;
  }
  span:nth-child(10) {
    left: 59%;
    top: 65%;
    animation-name: matrix_stream_up;
    animation-duration: 12.8s;
    animation-delay: -3.1s;
    box-shadow: 0 0 12vmin currentColor;
  }
  span:nth-child(11) {
    left: 65%;
    top: 18%;
    animation-name: matrix_stream_down;
    animation-duration: 10.2s;
    animation-delay: -8.5s;
    box-shadow: 0 0 15vmin currentColor;
  }
  span:nth-child(12) {
    left: 71%;
    top: 55%;
    animation-name: matrix_stream_up;
    animation-duration: 8.2s;
    animation-delay: -2.7s;
    box-shadow: 0 0 13vmin currentColor;
  }
  span:nth-child(13) {
    left: 77%;
    top: 4%;
    animation-name: matrix_stream_down;
    animation-duration: 11.2s;
    animation-delay: -6.1s;
    box-shadow: 0 0 14vmin currentColor;
  }
  span:nth-child(14) {
    left: 83%;
    top: 36%;
    animation-name: matrix_stream_up;
    animation-duration: 13.5s;
    animation-delay: -4.8s;
    box-shadow: 0 0 15vmin currentColor;
  }
  span:nth-child(15) {
    left: 89%;
    top: 68%;
    animation-name: matrix_stream_down;
    animation-duration: 9.4s;
    animation-delay: -7.5s;
    box-shadow: 0 0 14vmin currentColor;
  }
  span:nth-child(16) {
    left: 94%;
    top: 16%;
    animation-name: matrix_stream_up;
    animation-duration: 10.6s;
    animation-delay: -1.9s;
    box-shadow: 0 0 12vmin currentColor;
  }
  span:nth-child(17) {
    left: 8%;
    top: 75%;
    animation-name: matrix_stream_down;
    animation-duration: 11.8s;
    animation-delay: -5.3s;
    box-shadow: 0 0 13vmin currentColor;
  }
  span:nth-child(18) {
    left: 38%;
    top: -5%;
    animation-name: matrix_stream_up;
    animation-duration: 9.8s;
    animation-delay: -3.7s;
    box-shadow: 0 0 14vmin currentColor;
  }
  span:nth-child(19) {
    left: 68%;
    top: 80%;
    animation-name: matrix_stream_down;
    animation-duration: 12.2s;
    animation-delay: -6.9s;
    box-shadow: 0 0 13vmin currentColor;
  }
  span:nth-child(20) {
    left: 86%;
    top: -8%;
    animation-name: matrix_stream_up;
    animation-duration: 10.4s;
    animation-delay: -2.3s;
    box-shadow: 0 0 14vmin currentColor;
  }
}

/* ==========================================================================
   PATTERN 3: QUANTUM NEBULA (Drifting Cosmic Clouds & Breathing Soft Halos)
   Pure GPU-composited radial gradients (NO border-radius animation, NO heavy
   box-shadows, NO filter blur) -> 100% flicker-free at 120 FPS.
   ========================================================================== */
@keyframes nebula_cloud_drift_a {
  0% {
    transform: translate3d(-4vw, -3vh, 0) rotate(0deg) scale(0.92);
  }
  50% {
    transform: translate3d(5vw, 4vh, 0) rotate(22deg) scale(1.16);
  }
  100% {
    transform: translate3d(-4vw, -3vh, 0) rotate(0deg) scale(0.92);
  }
}

@keyframes nebula_cloud_drift_b {
  0% {
    transform: translate3d(4vw, 3vh, 0) rotate(0deg) scale(1.12);
  }
  50% {
    transform: translate3d(-5vw, -4vh, 0) rotate(-20deg) scale(0.88);
  }
  100% {
    transform: translate3d(4vw, 3vh, 0) rotate(0deg) scale(1.12);
  }
}

@keyframes nebula_halo_breathe {
  0% {
    transform: translate3d(-3vw, 2vh, 0) scale(0.88);
    opacity: 0.72;
  }
  50% {
    transform: translate3d(3vw, -2vh, 0) scale(1.18);
    opacity: 1;
  }
  100% {
    transform: translate3d(-3vw, 2vh, 0) scale(0.88);
    opacity: 0.72;
  }
}

.pattern-nebula {
  span {
    position: absolute;
    border-radius: 50%;
    backface-visibility: hidden;
    will-change: transform, opacity;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  /* Soft Emerald Cosmic Clouds */
  span:nth-child(1),
  span:nth-child(3),
  span:nth-child(5),
  span:nth-child(7),
  span:nth-child(9),
  span:nth-child(11) {
    background: radial-gradient(
      ellipse at center,
      var(--grad-green-strong) 0%,
      var(--grad-green-mid) 38%,
      transparent 70%
    );
  }

  /* Subtle Warm Lemon-Yellow Solar Clouds */
  span:nth-child(4),
  span:nth-child(8),
  span:nth-child(12) {
    background: radial-gradient(
      ellipse at center,
      var(--grad-yellow-strong) 0%,
      var(--grad-yellow-mid) 36%,
      transparent 68%
    );
  }

  /* Deep Shadow Nebula Pockets (maintains moody contrast) */
  span:nth-child(2),
  span:nth-child(6),
  span:nth-child(10) {
    background: radial-gradient(
      ellipse at center,
      var(--grad-dark-strong) 0%,
      transparent 70%
    );
  }

  /* 2 Expansive Soft Breathing Nebular Halo Rings */
  span:nth-child(13) {
    background: radial-gradient(
      circle at center,
      transparent 38%,
      var(--grad-halo-green) 54%,
      transparent 72%
    );
  }

  span:nth-child(14) {
    background: radial-gradient(
      circle at center,
      transparent 40%,
      var(--grad-halo-yellow) 55%,
      transparent 72%
    );
  }

  /* Balanced spread across all parts of the screen */
  span:nth-child(1) {
    top: -8%;
    left: -5%;
    width: 58vmin;
    height: 44vmin;
    animation-name: nebula_cloud_drift_a;
    animation-duration: 20s;
    animation-delay: -3s;
  }
  span:nth-child(2) {
    top: 12%;
    left: 22%;
    width: 50vmin;
    height: 42vmin;
    animation-name: nebula_cloud_drift_b;
    animation-duration: 22s;
    animation-delay: -8s;
  }
  span:nth-child(3) {
    top: -4%;
    left: 58%;
    width: 62vmin;
    height: 46vmin;
    animation-name: nebula_cloud_drift_a;
    animation-duration: 18s;
    animation-delay: -11s;
  }
  span:nth-child(4) {
    top: 18%;
    left: 72%;
    width: 48vmin;
    height: 38vmin;
    animation-name: nebula_cloud_drift_b;
    animation-duration: 24s;
    animation-delay: -5s;
  }
  span:nth-child(5) {
    top: 42%;
    left: -6%;
    width: 56vmin;
    height: 44vmin;
    animation-name: nebula_cloud_drift_b;
    animation-duration: 19s;
    animation-delay: -14s;
  }
  span:nth-child(6) {
    top: 34%;
    left: 36%;
    width: 54vmin;
    height: 46vmin;
    animation-name: nebula_cloud_drift_a;
    animation-duration: 25s;
    animation-delay: -2s;
  }
  span:nth-child(7) {
    top: 48%;
    left: 64%;
    width: 60vmin;
    height: 48vmin;
    animation-name: nebula_cloud_drift_a;
    animation-duration: 21s;
    animation-delay: -9s;
  }
  span:nth-child(8) {
    top: 66%;
    left: 8%;
    width: 50vmin;
    height: 40vmin;
    animation-name: nebula_cloud_drift_a;
    animation-duration: 23s;
    animation-delay: -15s;
  }
  span:nth-child(9) {
    top: 68%;
    left: 42%;
    width: 58vmin;
    height: 44vmin;
    animation-name: nebula_cloud_drift_b;
    animation-duration: 17s;
    animation-delay: -6s;
  }
  span:nth-child(10) {
    top: 56%;
    left: 22%;
    width: 48vmin;
    height: 42vmin;
    animation-name: nebula_cloud_drift_b;
    animation-duration: 22s;
    animation-delay: -12s;
  }
  span:nth-child(11) {
    top: 64%;
    left: 74%;
    width: 56vmin;
    height: 44vmin;
    animation-name: nebula_cloud_drift_a;
    animation-duration: 20s;
    animation-delay: -4s;
  }
  span:nth-child(12) {
    top: 10%;
    left: 38%;
    width: 44vmin;
    height: 36vmin;
    animation-name: nebula_cloud_drift_b;
    animation-duration: 26s;
    animation-delay: -17s;
  }
  span:nth-child(13) {
    top: 4%;
    left: 4%;
    width: 78vmin;
    height: 78vmin;
    animation-name: nebula_halo_breathe;
    animation-duration: 16s;
    animation-delay: -2s;
  }
  span:nth-child(14) {
    top: 32%;
    left: 50%;
    width: 72vmin;
    height: 72vmin;
    animation-name: nebula_halo_breathe;
    animation-duration: 19s;
    animation-delay: -9s;
  }
}

/* ==========================================================================
   ONE-SHOT SUBTLE ENERGY PULSE RING
   ========================================================================== */
@keyframes energy_pulse_ripple {
  0% {
    opacity: 0;
    transform: scale(0.28);
  }
  22% {
    opacity: 0.85;
  }
  100% {
    opacity: 0;
    transform: scale(1.55);
  }
}

.pulse-energy-wave {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 110vmax;
  height: 110vmax;
  margin-top: -55vmax;
  margin-left: -55vmax;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    transparent 36%,
    var(--pulse-ring-color) 52%,
    transparent 68%
  );
  opacity: 0;
  pointer-events: none;
  z-index: 1;
  animation: energy_pulse_ripple 1.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity;
}

/* ==========================================================================
   SOFT VIGNETTE & CONTRAST GUARD
   ========================================================================== */
.background-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 50%,
    transparent 45%,
    var(--vignette-edge) 100%
  );
  pointer-events: none;
  z-index: 2;
}
</style>
