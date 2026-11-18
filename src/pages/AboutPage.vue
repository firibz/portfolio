<template>
  <div ref="pageRef" class="column col-xs-12 justify-start q-py-md">
    <!-- 1. About Me Section Header -->
    <div class="relative-position text-h5 text-bold gsap-reveal row items-center justify-between">
      <div>
        <span class="text-system-primary section-title text-bold">{{ t("about") }}</span>
        {{ t("me") }}
      </div>
      <q-btn
        dense
        no-caps
        flat
        to="/works"
        icon-right="mdi-arrow-right-circle-outline"
        :label="t('exploreWorksCta')"
        class="text-system-primary text-bold text-caption"
      />
    </div>
    <hr class="full-width q-mt-sm q-mb-md block title-hr gsap-reveal" />

    <!-- Hero Greeting & Core Bio 3D Glass Card -->
    <div
      class="glass-3d-subcard q-pa-md q-mb-md relative-position overflow-hidden gsap-reveal"
      @mousemove="onCardMouseMove($event, 5, 5)"
      @mouseleave="onCardMouseLeave"
    >
      <div class="card-3d-glare"></div>
      <div class="row items-center q-mb-sm">
        <div class="bio-icon-badge q-mr-sm flex flex-center">
          <q-icon name="mdi-code-braces-box" size="22px" class="text-system-primary" />
        </div>
        <span class="text-subtitle1 text-bold text-system-primary">
          {{ t("greeting") }}
        </span>
      </div>
      <p class="text-body2 q-mb-sm leading-relaxed">
        {{ t("aboutMeSection1") }}
      </p>
      <p class="text-body2 q-mb-none leading-relaxed opacity-90">
        {{ t("aboutMeSection2") }}
      </p>
    </div>

    <!-- 2-Column 3D Tilt Highlight Cards for Sections 3, 4, 5 -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6 flex">
        <div
          class="glass-3d-subcard q-pa-md full-width relative-position overflow-hidden gsap-reveal"
          @mousemove="onCardMouseMove($event, 7, 6)"
          @mouseleave="onCardMouseLeave"
        >
          <div class="card-3d-glare"></div>
          <div class="row items-center q-mb-xs">
            <q-icon
              name="mdi-server-network"
              size="20px"
              class="text-system-primary q-mr-xs"
            />
            <span class="text-subtitle2 text-bold">{{ t("backendAndAi") }}</span>
          </div>
          <p class="text-caption q-mb-none leading-relaxed opacity-90">
            {{ t("aboutMeSection4") }}
          </p>
        </div>
      </div>

      <div class="col-12 col-md-6 flex">
        <div
          class="glass-3d-subcard q-pa-md full-width relative-position overflow-hidden gsap-reveal"
          @mousemove="onCardMouseMove($event, 7, 6)"
          @mouseleave="onCardMouseLeave"
        >
          <div class="card-3d-glare"></div>
          <div class="row items-center q-mb-xs">
            <q-icon
              name="mdi-account-group-outline"
              size="20px"
              class="text-system-primary q-mr-xs"
            />
            <span class="text-subtitle2 text-bold">{{ t("qaAndMentorship") }}</span>
          </div>
          <p class="text-caption q-mb-xs leading-relaxed opacity-90">
            {{ t("aboutMeSection3") }}
          </p>
          <p class="text-caption q-mb-none leading-relaxed opacity-90">
            {{ t("aboutMeSection5") }}
          </p>
        </div>
      </div>
    </div>

    <!-- Detail Craftsmanship Quote Banner (Section 6) -->
    <div
      class="craft-quote-banner q-pa-md q-mb-xl row items-center justify-between no-wrap gsap-reveal"
    >
      <div class="row items-center no-wrap">
        <q-icon
          name="mdi-sparkles"
          size="24px"
          class="text-system-primary q-mr-sm"
        />
        <span class="text-body2 text-italic">
          "{{ t("aboutMeSection6") }}"
        </span>
      </div>
      <q-icon
        name="mdi-emoticon-excited-outline"
        size="24px"
        class="text-system-primary q-ml-sm"
      />
    </div>

    <!-- 2. Interactive Babylon.js 3D Tech Constellation Section -->
    <div class="relative-position text-h5 text-bold gsap-reveal">
      <span class="text-system-primary section-title text-bold">
        {{ t("techConstellation") }}
      </span>
      {{ t("constellationSub") }}
    </div>
    <hr class="full-width q-mt-sm q-mb-md block title-hr gsap-reveal" />

    <div class="gsap-reveal">
      <babylon-tech-core />
    </div>

    <!-- 3. My Interests Section -->
    <div
      v-if="utilState.language === 'fa-IR'"
      class="relative-position text-h5 text-bold gsap-reveal"
    >
      <span class="text-system-primary section-title text-bold">{{
        t("interests")
      }}</span>
      {{ t("my") }}
    </div>
    <div v-else class="relative-position text-h5 text-bold gsap-reveal">
      <span class="text-system-primary section-title text-bold">{{
        t("my")
      }}</span>
      {{ t("interests") }}
    </div>
    <hr class="full-width q-mt-sm q-mb-md block title-hr gsap-reveal" />

    <div class="row q-col-gutter-md justify-between">
      <div
        v-for="interest in interestsList"
        :key="interest.name"
        class="col-xs-12 col-sm-6 col-md-4 flex gsap-reveal"
      >
        <div
          class="column full-width glass-3d-subcard interest-3d-card q-pa-md text-center items-center justify-center relative-position overflow-hidden"
          :class="{ 'cursor-pointer': interest.isAction }"
          @mousemove="onCardMouseMove($event, 10, 8)"
          @mouseleave="onCardMouseLeave"
          @click="interest.isAction ? goToWorks() : null"
        >
          <div class="card-3d-glare"></div>
          <div class="interest-icon-orb flex flex-center q-mb-sm">
            <q-icon
              :name="interest.icon"
              size="28px"
              class="text-system-primary"
            />
          </div>
          <span v-if="interest.title" class="text-caption text-bold text-system-primary q-mb-xs">
            {{ interest.title }}
          </span>
          <span class="text-caption text-weight-medium">
            {{ interest.value }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useUtilStore } from "stores/util-store";
import { usePageScrollToTop } from "src/composables/page-scroll-to-top";
import { useGsap3D } from "src/composables/gsap-3d";
import BabylonTechCore from "components/BabylonTechCore.vue";

export default defineComponent({
  name: "AboutPage",
  components: {
    BabylonTechCore,
  },
  setup() {
    const pageRef = ref(null);
    const { t } = useI18n({ useScope: "global" });
    const router = useRouter();
    const utilStore = useUtilStore();
    const { onCardMouseMove, onCardMouseLeave, animateStaggerReveal } =
      useGsap3D();

    const interestsList = computed(() => [
      {
        name: "Best Movie",
        title: t("bestMovie"),
        value: "Inception",
        icon: "mdi-movie-open-star",
      },
      {
        name: "Best Anime",
        title: t("bestAnime"),
        value: "Death Note",
        icon: "mdi-movie-filter",
      },
      {
        name: "Best Series",
        title: t("bestSeries"),
        value: "WestWorld, Severance and The big bang theory",
        icon: "mdi-filmstrip",
      },
      {
        name: "Best Book",
        title: t("bestBook"),
        value: "Harry Potter collection",
        icon: "mdi-book",
      },
      {
        name: "Other Interests",
        title: "",
        value: t("otherInterests"),
        icon: "mdi-gamepad-variant",
      },
      {
        name: "See My Works",
        title: "",
        value: t("seeMyWorks"),
        icon: "mdi-emoticon-cool",
        isAction: true,
      },
    ]);

    const goToWorks = () => {
      router.push("/works");
    };

    usePageScrollToTop();

    onMounted(() => {
      animateStaggerReveal(pageRef.value);
    });

    return {
      pageRef,
      t,
      utilState: utilStore.$state,
      interestsList,
      goToWorks,
      onCardMouseMove,
      onCardMouseLeave,
    };
  },
});
</script>
