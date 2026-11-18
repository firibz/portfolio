<template>
  <q-layout view="lHh Lpr lFf" class="sculpture-layout">
    <!-- Top Floating Editorial HUD -->
    <header class="sculpture-hud-top">
      <div class="hud-top-inner">
        <!-- Brand & Live 3D Form Telemetry -->
        <div class="hud-brand-group">
          <button
            type="button"
            class="brand-monogram"
            @click="jumpToChapter(0)"
          >
            <span class="monogram-dot"></span>
            <span class="monogram-text">FK</span>
          </button>

          <div class="form-telemetry-pill" @click="triggerRipple">
            <span class="telemetry-index">0{{ activeChapter }}</span>
            <span class="telemetry-divider">/</span>
            <span class="telemetry-form">{{
              t(currentFormMeta.formKey)
            }}</span>
            <span class="telemetry-note gt-sm">
              — {{ t(currentFormMeta.noteKey) }}
            </span>
          </div>
        </div>

        <!-- Center Chapter Navigation Capsule (Desktop) -->
        <nav class="hud-chapter-nav gt-sm" aria-label="Chapters">
          <button
            v-for="(ch, idx) in chapters"
            :key="ch.id"
            type="button"
            class="hud-nav-btn"
            :class="{ 'hud-nav-btn--active': activeChapter === idx }"
            @click="jumpToChapter(idx)"
          >
            <span class="nav-num">0{{ idx }}</span>
            <span class="nav-label">{{ t(ch.labelKey) }}</span>
          </button>
        </nav>

        <!-- Right Interactive Controls: Ripple, Language, Theme, Resume -->
        <div class="hud-controls-group">
          <!-- Tactile Sculpture Ripple Trigger -->
          <button
            type="button"
            class="hud-icon-btn hud-ripple-btn"
            :class="{ 'hud-ripple-btn--firing': isPulsing }"
            :aria-label="t('touchHint')"
            @click="triggerRipple"
          >
            <span class="ripple-halo"></span>
            <q-icon name="mdi-access-point" size="18px" />
            <q-tooltip
              class="bg-system-primary text-section text-caption"
              :offset="[0, 8]"
            >
              {{ t("touchHint") }}
            </q-tooltip>
          </button>

          <!-- Language Switcher (EN / FA) -->
          <button
            type="button"
            class="hud-lang-btn"
            :aria-label="t('switchLanguage')"
            @click="toggleLanguage"
          >
            <span :class="{ 'lang-active': utilState.language === 'en-US' }"
              >EN</span
            >
            <span class="lang-sep">/</span>
            <span :class="{ 'lang-active': utilState.language === 'fa-IR' }"
              >فا</span
            >
          </button>

          <!-- Dark / Light Theme Button -->
          <button
            type="button"
            class="hud-icon-btn"
            :aria-label="t('toggleTheme')"
            @click="onThemeClick"
          >
            <q-icon
              :name="
                $q.dark.isActive ? 'mdi-weather-sunny' : 'mdi-weather-night'
              "
              size="18px"
            />
            <q-tooltip
              class="bg-system-primary text-section text-caption"
              :offset="[0, 8]"
            >
              {{ t("toggleTheme") }}
            </q-tooltip>
          </button>

          <!-- Direct Resume Download Pill -->
          <a
            :href="RESUME_URL"
            download
            class="hud-resume-pill gt-xs"
            @mouseenter="utilStore.setHighlight(true)"
            @mouseleave="utilStore.setHighlight(false)"
          >
            <q-icon name="mdi-arrow-down-circle-outline" size="17px" />
            <span>{{ t("downloadResume") }}</span>
          </a>
        </div>
      </div>
    </header>

    <!-- Vertical Chapter Progress Rail (Desktop) -->
    <aside class="sculpture-side-rail gt-sm" aria-label="Scroll progress">
      <div class="rail-track">
        <div
          class="rail-fill"
          :style="{ transform: `scaleY(${normalizedProgress})` }"
        ></div>
      </div>
      <div class="rail-dots">
        <button
          v-for="(ch, idx) in chapters"
          :key="ch.id"
          type="button"
          class="rail-dot-btn"
          :class="{ 'rail-dot-btn--active': activeChapter === idx }"
          :aria-label="t(ch.labelKey)"
          @click="jumpToChapter(idx)"
        >
          <span class="rail-dot"></span>
          <span class="rail-tooltip">{{ t(ch.labelKey) }}</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Bottom Chapter Dock -->
    <nav class="sculpture-hud-bottom lt-md" aria-label="Mobile chapters">
      <button
        v-for="(ch, idx) in chapters"
        :key="ch.id"
        type="button"
        class="mobile-nav-btn"
        :class="{ 'mobile-nav-btn--active': activeChapter === idx }"
        @click="jumpToChapter(idx)"
      >
        <span class="mobile-nav-num">0{{ idx }}</span>
        <span class="mobile-nav-label">{{ t(ch.labelKey) }}</span>
      </button>
    </nav>

    <!-- Scrollable Chapter Journey Container -->
    <q-page-container class="sculpture-page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useLanguage } from "src/composables/language";
import { useTheme } from "src/composables/theme";
import { useUtilStore } from "stores/util-store";
import { RESUME_URL } from "src/data/profile";

const CHAPTERS = [
  { id: "intro", labelKey: "navIntro", formKey: "formSeed", noteKey: "noteSeed" },
  {
    id: "about",
    labelKey: "navAbout",
    formKey: "formLiquid",
    noteKey: "noteLiquid",
  },
  {
    id: "craft",
    labelKey: "navCraft",
    formKey: "formCrystal",
    noteKey: "noteCrystal",
  },
  {
    id: "works",
    labelKey: "navWorks",
    formKey: "formPortal",
    noteKey: "notePortal",
  },
  {
    id: "contact",
    labelKey: "navContact",
    formKey: "formReturn",
    noteKey: "noteReturn",
  },
];

export default defineComponent({
  name: "MainLayout",
  setup() {
    const $q = useQuasar();
    const { t } = useI18n({ useScope: "global" });
    const utilStore = useUtilStore();
    const { changeLanguage } = useLanguage();
    const { toggleTheme } = useTheme();

    const isPulsing = ref(false);

    const activeChapter = computed(() => utilStore.activeChapter);
    const currentFormMeta = computed(
      () => CHAPTERS[activeChapter.value] || CHAPTERS[0]
    );
    const normalizedProgress = computed(() =>
      Math.min(1, Math.max(0, utilStore.chapterProgress / (CHAPTERS.length - 1)))
    );

    const jumpToChapter = (index) => {
      utilStore.requestChapterJump(index);
    };

    const triggerRipple = () => {
      utilStore.triggerPulse();
      isPulsing.value = false;
      requestAnimationFrame(() => {
        isPulsing.value = true;
      });
      setTimeout(() => {
        isPulsing.value = false;
      }, 650);
    };

    const toggleLanguage = () => {
      const next = utilStore.language === "en-US" ? "fa-IR" : "en-US";
      changeLanguage(next);
      utilStore.triggerPulse();
    };

    const onThemeClick = () => {
      utilStore.appTheme = !utilStore.appTheme;
      toggleTheme(utilStore.appTheme);
      utilStore.triggerPulse();
    };

    return {
      chapters: CHAPTERS,
      RESUME_URL,
      utilStore,
      utilState: utilStore.$state,
      activeChapter,
      currentFormMeta,
      normalizedProgress,
      isPulsing,
      t,
      jumpToChapter,
      triggerRipple,
      toggleLanguage,
      onThemeClick,
    };
  },
});
</script>
