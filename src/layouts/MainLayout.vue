<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center portfolio-3d-stage">
        <div class="row full-width justify-center">
          <div
            class="column full-height col-xs-12 col-sm-10 col-md-12 col-xl-10"
          >
            <div class="row full-width justify-center container items-stretch">
              <!-- 1. Floating 3D Navigation & Scene Dock -->
              <div
                :class="$q.screen.lt.md ? 'q-mb-sm' : 'q-pr-sm'"
                class="column full-height col-xs-11 col-md-1 items-end justify-between"
              >
                <div
                  :class="
                    $q.screen.lt.md
                      ? 'full-width row justify-between items-center card custom-rounded-borders q-py-xs q-px-sm'
                      : 'column items-center justify-between full-height card menu-borders q-py-md q-px-xs'
                  "
                  style="display: flex"
                >
                  <!-- Language Switcher -->
                  <q-btn-toggle
                    v-model="utilState.language"
                    :class="$q.screen.lt.md ? 'q-mr-xs' : 'q-mb-sm'"
                    :flat="$q.dark.isActive"
                    :options="[
                      { label: 'En', value: 'en-US' },
                      { label: 'Fa', value: 'fa-IR' },
                    ]"
                    class="text-bold lang-toggle-3d"
                    color="section"
                    dense
                    glossy
                    no-caps
                    padding="4px 11px"
                    rounded
                    style="height: 32px"
                    text-color="system-text"
                    toggle-color="green-11"
                    toggle-text-color="system-primary"
                    @update:model-value="changeLanguage"
                  />

                  <!-- Route Navigation Items (Well-spaced on desktop) -->
                  <q-list
                    :class="
                      $q.screen.lt.md ? 'row no-wrap' : 'full-width q-my-xs'
                    "
                  >
                    <menu-item
                      v-for="item in menuList"
                      :key="item.title"
                      :icon="item.icon"
                      :link="item.link"
                      :title="item.title"
                    />
                  </q-list>

                  <!-- 3D Camera Mode Segmented Switch + Distinct Pulse Action Button -->
                  <div
                    v-if="!$q.screen.lt.md"
                    class="column items-center q-my-xs"
                  >
                    <!-- 3-Way Camera Mode Capsule -->
                    <div
                      class="scene-mode-capsule column items-center q-gutter-y-xs q-pa-xs"
                    >
                      <q-btn
                        v-for="mode in sceneModes"
                        :key="mode.id"
                        dense
                        flat
                        round
                        size="sm"
                        :icon="mode.icon"
                        :aria-label="mode.label"
                        :class="
                          utilState.sceneMode === mode.id
                            ? 'text-system-primary scene-btn--active'
                            : 'opacity-70 system-primary-hover'
                        "
                        @click="setSceneMode(mode.id)"
                      >
                        <q-tooltip
                          class="bg-system-primary text-section text-caption"
                          anchor="center left"
                          self="center right"
                        >
                          3D Mode: {{ mode.label }}
                        </q-tooltip>
                      </q-btn>
                    </div>

                    <!-- Distinct Tactile Wave Action Trigger Button -->
                    <button
                      type="button"
                      class="shockwave-trigger-btn q-mt-sm"
                      :class="{ 'shockwave-trigger-btn--firing': isPulsing }"
                      aria-label="Trigger energy pulse"
                      @click="handlePulseClick"
                    >
                      <span class="shockwave-ring"></span>
                      <q-icon name="mdi-access-point" size="18px" />
                      <q-tooltip
                        class="bg-system-primary text-section text-caption"
                        anchor="center left"
                        self="center right"
                      >
                        Trigger {{ t("pulseEnergy") }}
                      </q-tooltip>
                    </button>
                  </div>

                  <!-- Dark / Light Theme Switcher -->
                  <q-toggle
                    v-model="utilState.appTheme"
                    :class="$q.screen.lt.md ? 'q-ml-xs' : 'q-mt-xs'"
                    :color="utilState.appTheme ? 'amber' : 'indigo-11'"
                    aria-label="switch-theme-btn"
                    checked-icon="mdi-brightness-7"
                    class="text-blue"
                    keep-color
                    unchecked-icon="mdi-weather-night"
                    @update:model-value="toggleTheme"
                  />
                </div>
              </div>

              <!-- 2. Profile Hero Card (Preserving Original Curve & Light Shape + Clean Background) -->
              <div
                ref="profileCardRef"
                :class="
                  $q.screen.lt.md
                    ? 'order-first custom-rounded-borders-top q-mb-md'
                    : 'card custom-rounded-borders'
                "
                class="column full-height col-xs-11 col-md-4 items-center justify-between card card-shadow-left"
              >
                <!-- Profile Picture with Original Dark Curve / Light V-Shape -->
                <div class="relative-position profile-image-size full-width">
                  <q-img
                    v-if="$q.dark.isActive"
                    alt="profile picture of Fariborz"
                    class="custom-rounded-borders-top fit profile-image profile-image-size"
                    fit="cover"
                    src="~assets/images/profile-dark-2.jpg"
                  />
                  <q-img
                    v-else
                    alt="profile picture of Fariborz"
                    class="custom-rounded-borders-top fit profile-image profile-image-size"
                    fit="cover"
                    src="~assets/images/profile-light.jpg"
                  />

                  <!-- Floating +Years Experience Tag -->
                  <div class="experience-3d-badge">
                    <span class="exp-num">+{{ animatedYears }}</span>
                    <span class="exp-label">{{ t("experienceYears") }}</span>
                  </div>
                </div>

                <!-- Identity & Role -->
                <div class="column items-center text-center q-px-md z-top">
                  <span class="text-h4 text-bold hero-name-3d q-mt-xs">
                    {{ t("fullName") }}
                  </span>
                  <span
                    class="text-subtitle1 text-system-primary text-bold q-mt-xs"
                  >
                    {{ t("job") }}
                  </span>

                  <!-- 3D Tech Stack Micro Badges -->
                  <div class="row justify-center q-gutter-xs q-mt-sm">
                    <span
                      v-for="badge in heroTechBadges"
                      :key="badge"
                      class="hero-tech-pill"
                    >
                      {{ badge }}
                    </span>
                  </div>
                </div>

                <!-- Social Media Magnetic 3D Buttons -->
                <div class="text-center q-mt-sm z-top">
                  <q-btn
                    v-for="socialItem in SocialMediaItems"
                    :key="socialItem.name"
                    :href="socialItem.link"
                    :icon="socialItem.icon"
                    :aria-label="socialItem.name + ' link'"
                    class="q-pa-xs team-btn social-3d-btn relative-position q-mx-xs"
                    dense
                    flat
                    glossy
                    :target="socialItem.target"
                    @mousemove="onMagneticMove($event, 0.3)"
                    @mouseleave="onMagneticLeave"
                  >
                    <q-tooltip
                      v-if="socialItem.hover"
                      class="bg-system-primary text-section text-body2 ltr"
                      :offset="[10, 10]"
                    >
                      {{ socialItem.hover }}
                    </q-tooltip>
                  </q-btn>
                </div>

                <!-- Redesigned 3D Download Resume CTA Button -->
                <div class="full-width q-px-lg q-pb-md q-pt-xs z-top">
                  <a
                    href="fariborz_korevli_03_2026.pdf"
                    download
                    class="resume-3d-btn row items-center justify-center no-wrap full-width"
                  >
                    <span class="resume-icon-circle flex flex-center q-mr-sm">
                      <q-icon name="mdi-file-download-outline" size="20px" />
                    </span>
                    <span class="resume-btn-label">{{
                      t("downloadResume")
                    }}</span>
                    <q-icon
                      name="mdi-arrow-top-right"
                      size="16px"
                      class="q-ml-xs resume-arrow-icon"
                    />
                  </a>
                </div>
              </div>

              <!-- 3. Main Content Viewport (Restored Top/Bottom Scroll Masks & Padding) -->
              <div
                class="column col-xs-11 col-md-6 full-height page-section relative-position overflow-hidden q-py-md"
              >
                <div
                  id="top-of-page"
                  :class="
                    $q.screen.lt.md
                      ? 'custom-rounded-borders q-pa-md'
                      : $q.screen.gt.md
                      ? 'card custom-rounded-borders-right q-px-xl q-py-lg'
                      : 'card custom-rounded-borders-right q-px-lg q-py-lg'
                  "
                  class="row full-width card section-container full-height"
                  style="display: flex"
                >
                  <router-view v-slot="{ Component }">
                    <transition
                      :enter-active-class="
                        $q.screen.lt.md
                          ? 'animated slideInDown'
                          : utilState.language === 'en-US'
                          ? 'animated slideInLeft'
                          : 'animated slideInRight'
                      "
                      :leave-active-class="
                        $q.screen.lt.md
                          ? 'animated slideOutUp'
                          : utilState.language === 'en-US'
                          ? 'animated slideOutLeft'
                          : 'animated slideOutRight'
                      "
                      mode="out-in"
                    >
                      <component :is="Component" />
                    </transition>
                  </router-view>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import {
  defineComponent,
  computed,
  ref,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useI18n } from "vue-i18n";
import { useLanguage } from "src/composables/language";
import { useTheme } from "src/composables/theme";
import { useGsap3D } from "src/composables/gsap-3d";
import { useUtilStore } from "stores/util-store";
import MenuItem from "components/MenuItem.vue";

const SocialMediaItems = [
  {
    name: "email",
    link: "mailto:fariborzkorevli@gmail.com",
    icon: "mdi-gmail",
    target: "_self",
    hover: "fariborzkorevli@gmail.com",
  },
  {
    name: "phone",
    link: "tel:+989981372920",
    icon: "mdi-phone",
    target: "_self",
    hover: "+989981372920",
  },
  {
    name: "Linkedin",
    link: "https://www.linkedin.com/in/firibz",
    icon: "mdi-linkedin",
    target: "_blank",
  },
  {
    name: "Telegram",
    link: "https://t.me/Firibz",
    icon: "mdi-telegram",
    target: "_blank",
  },
  {
    name: "StackOverflow",
    link: "https://stackoverflow.com/users/8755786/fariborz-korevli",
    icon: "mdi-stack-overflow",
    target: "_blank",
  },
  {
    name: "Github",
    link: "https://github.com/firibz",
    icon: "mdi-github",
    target: "_blank",
  },
];

const heroTechBadges = [
  "Vue 2 & 3",
  "Quasar",
  "Three.js",
  "Babylon.js",
  "WebGL",
  "GSAP",
  "Ruby on Rails",
  "Web3.js",
];

export default defineComponent({
  name: "MainLayout",
  components: {
    MenuItem,
  },

  setup() {
    const utilStore = useUtilStore();
    const { t } = useI18n({ useScope: "global" });
    const currentYear = new Date().getFullYear();
    const startWorkYear = 2017;
    const experienceYears = currentYear - startWorkYear;
    const animatedYears = ref(experienceYears);
    const profileCardRef = ref(null);
    const isPulsing = ref(false);

    const {
      onCardMouseMove,
      onCardMouseLeave,
      onMagneticMove,
      onMagneticLeave,
      animateCounter,
    } = useGsap3D();

    const menuList = computed(() => [
      {
        title: t("aboutMe"),
        icon: "mdi-badge-account-horizontal",
        link: "/",
      },
      {
        title: t("works"),
        icon: "mdi-code-tags",
        link: "/works",
      },
    ]);

    const sceneModes = computed(() => [
      {
        id: "orbital",
        label: t("sceneModeOrbital"),
        icon: "mdi-orbit",
      },
      {
        id: "matrix",
        label: t("sceneModeMatrix"),
        icon: "mdi-sine-wave",
      },
      {
        id: "nebula",
        label: t("sceneModeNebula"),
        icon: "mdi-creation",
      },
    ]);

    const handlePulseClick = () => {
      utilStore.triggerPulse();
      isPulsing.value = false;
      requestAnimationFrame(() => {
        isPulsing.value = true;
      });
      setTimeout(() => {
        isPulsing.value = false;
      }, 700);
    };

    const { changeLanguage } = useLanguage();
    const { toggleTheme } = useTheme();

    const handleWindowResize = () => {
      if (window.innerWidth >= 1024 && window.scrollY > 0) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    };

    onMounted(() => {
      animateCounter(animatedYears, experienceYears, 1.6);
      window.addEventListener("resize", handleWindowResize, { passive: true });
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", handleWindowResize);
    });

    return {
      SocialMediaItems,
      heroTechBadges,
      experienceYears,
      animatedYears,
      profileCardRef,
      isPulsing,
      menuList,
      sceneModes,
      utilState: utilStore.$state,
      setSceneMode: (m) => utilStore.setSceneMode(m),
      handlePulseClick,
      t,
      changeLanguage,
      toggleTheme,
      onCardMouseMove,
      onCardMouseLeave,
      onMagneticMove,
      onMagneticLeave,
    };
  },
});
</script>
