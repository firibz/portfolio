<template>
  <div ref="worksPageRef" class="column col-xs-12 justify-start q-py-md">
    <!-- Section Title & Category Filters -->
    <div class="row items-center justify-between q-mb-xs gsap-reveal">
      <div class="relative-position text-h5 text-bold">
        <span class="text-system-primary section-title text-bold">{{
          t("some")
        }}</span>
        {{ t("ofMyWorks") }} *
      </div>
      <div class="row q-gutter-xs q-mt-xs">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="work-cat-btn"
          :class="{ 'work-cat-btn--active': activeCategory === cat.id }"
          @click="selectCategory(cat.id)"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>
    <hr class="full-width q-mt-sm q-mb-md block title-hr gsap-reveal" />

    <!-- Interactive Babylon.js 3D Hologram Monitor Stage -->
    <div class="gsap-reveal">
      <babylon-holo-stage
        :image-src="activeStageItem.images[activeStageItem.slide || 0]"
        :project-title="t(activeStageItem.name)"
        :project-link="activeStageItem.link"
        :active-index="stageIndex"
        :total-count="imageGalleryItems.length"
        @prev="cycleStage(-1)"
        @next="cycleStage(1)"
        @open-fullscreen="activeStageItem.fullscreen = true"
      />
    </div>

    <!-- 3D Project Gallery Cards -->
    <div ref="galleryListRef" class="row full-width q-col-gutter-y-lg">
      <div
        v-for="(galleryItem, idx) in filteredGalleryItems"
        :key="galleryItem.name"
        class="column col-xs-12 gsap-reveal"
      >
        <div
          class="glass-3d-subcard work-3d-card q-pa-md relative-position overflow-hidden"
          :class="{
            'work-3d-card--selected':
              activeStageItem.name === galleryItem.name,
          }"
          @mouseenter="focusProjectOnStage(galleryItem)"
          @mousemove="onCardMouseMove($event, 4, 4)"
          @mouseleave="onWorkCardLeave"
        >
          <div class="card-3d-glare"></div>

          <!-- Card Top Meta Header -->
          <div class="row items-center justify-between q-mb-sm">
            <div class="row items-center q-gutter-x-sm">
              <span class="project-index-badge">
                0{{ idx + 1 }}
              </span>
              <span class="text-subtitle1 text-bold">
                {{ t(galleryItem.name) }}
              </span>
            </div>

            <div class="row items-center q-gutter-x-xs">
              <span class="slides-count-pill">
                <q-icon name="mdi-image-multiple-outline" size="13px" class="q-mr-xs" />
                {{ galleryItem.images.length }} {{ t("slidesCount") }}
              </span>
              <a
                v-if="galleryItem.link"
                :href="galleryItem.link"
                target="_blank"
                class="live-demo-pill system-primary-link"
              >
                <q-icon name="mdi-launch" size="14px" class="q-mr-xs" />
                {{ t("liveDemo") }}
              </a>
            </div>
          </div>

          <!-- Quasar Carousel with Fullscreen & Thumbnails -->
          <q-carousel
            v-model="galleryItem.slide"
            v-model:fullscreen="galleryItem.fullscreen"
            animated
            class="work-gallery"
            infinite
            swipeable
            thumbnails
            @update:model-value="focusProjectOnStage(galleryItem)"
          >
            <q-carousel-slide
              v-for="(galleryImage, imageIndex) in galleryItem.images"
              :key="galleryItem.name + imageIndex"
              :img-src="galleryImage"
              :name="imageIndex"
              class="cursor-pointer fix-border-in-images"
              @click="
                $q.screen.lt.md
                  ? ''
                  : (galleryItem.fullscreen = !galleryItem.fullscreen)
              "
            />
            <template v-slot:control>
              <q-carousel-control :offset="[18, 18]" position="top-right">
                <q-btn
                  :aria-label="
                    'gallery item fullscreen button for ' + t(galleryItem.name)
                  "
                  :icon="
                    galleryItem.fullscreen
                      ? 'mdi-fullscreen-exit'
                      : 'mdi-fullscreen'
                  "
                  color="section"
                  dense
                  push
                  round
                  text-color="system-primary"
                  @click="galleryItem.fullscreen = !galleryItem.fullscreen"
                />
              </q-carousel-control>
            </template>
          </q-carousel>

          <!-- Card Footer: Tech Tags + External Link -->
          <div class="row items-center justify-between q-mt-sm">
            <div class="row q-gutter-xs">
              <span
                v-for="tag in galleryItem.tags"
                :key="tag"
                class="tech-mini-tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="text-subtitle2">
              <a
                v-if="galleryItem.link"
                class="system-primary-link text-bold row items-center"
                :href="galleryItem.link"
                target="_blank"
              >
                <q-icon name="mdi-link-variant" class="q-mr-xs" />
                <span>{{ t(galleryItem.name) }}</span>
                <q-icon name="mdi-open-in-new" class="q-ml-xs" />
              </a>
              <span v-else class="text-caption opacity-80">{{
                t(galleryItem.name)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Google Drive Full Archive 3D Banner -->
    <div
      class="glass-3d-subcard q-pa-lg q-mt-xl q-mb-md text-center relative-position overflow-hidden gsap-reveal"
      @mousemove="onCardMouseMove($event, 5, 5)"
      @mouseleave="onCardMouseLeave"
    >
      <div class="card-3d-glare"></div>
      <div class="full-width text-center q-mb-xs">
        <q-btn
          icon="mdi-google-drive"
          class="q-pa-sm relative-position system-primary-hover custom-rounded-borders drive-3d-btn"
          size="lg"
          flat
          aria-label="Google drive icon"
          glossy
          href="https://drive.google.com/drive/folders/1aIF8Tk2fmADzgg3k4h8_iPKdtHtAGAEL?usp=sharing"
          target="_blank"
        />
      </div>
      <a
        class="system-primary-link text-subtitle1 text-bold"
        href="https://drive.google.com/drive/folders/1aIF8Tk2fmADzgg3k4h8_iPKdtHtAGAEL?usp=sharing"
        target="_blank"
      >
        {{ t("viewAllOnGoogleDrive") }}
        <q-icon name="mdi-open-in-new" />
      </a>
    </div>

    <!-- Footnote Notice -->
    <div class="q-mb-md gsap-reveal">
      <hr class="q-mb-md full-width section-hr" />
      <span class="text-body2 opacity-85">* {{ t("projectsAccessNotice") }}</span>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useUtilStore } from "stores/util-store";
import { usePageScrollToTop } from "src/composables/page-scroll-to-top";
import { useGsap3D } from "src/composables/gsap-3d";
import BabylonHoloStage from "components/BabylonHoloStage.vue";

export default defineComponent({
  name: "WorksPage",
  components: {
    BabylonHoloStage,
  },
  setup() {
    const worksPageRef = ref(null);
    const galleryListRef = ref(null);
    const activeCategory = ref("all");
    const stageIndex = ref(0);

    const { t } = useI18n({ useScope: "global" });
    const utilStore = useUtilStore();
    const { onCardMouseMove, onCardMouseLeave, animateStaggerReveal } =
      useGsap3D();

    const imageGalleryItems = ref([
      {
        name: "stakingAndNFTLandingWeb3Website",
        category: "web3",
        tags: ["Vue.js", "Web3.js", "NFT Staking", "Quasar"],
        images: [
          "images/works/0 Staking and NFT landing sample/0.webp",
          "images/works/0 Staking and NFT landing sample/1.webp",
          "images/works/0 Staking and NFT landing sample/2.webp",
          "images/works/0 Staking and NFT landing sample/3.webp",
          "images/works/0 Staking and NFT landing sample/4.webp",
          "images/works/0 Staking and NFT landing sample/5.webp",
        ],
        slide: 0,
        fullscreen: false,
        link: "https://ascendants-sample.web.app/",
      },
      {
        name: "sspLabelingSystem",
        category: "gov",
        tags: ["Vue.js", "Enterprise SPA", "Labeling", "REST API"],
        images: [
          "images/works/1 SSP labels/0.webp",
          "images/works/1 SSP labels/1.webp",
          "images/works/1 SSP labels/2.webp",
          "images/works/1 SSP labels/3.webp",
          "images/works/1 SSP labels/4.webp",
        ],
        slide: 0,
        fullscreen: false,
        link: "",
      },
      {
        name: "ADRReporterSystemOfIRFDA",
        category: "gov",
        tags: ["Vue.js", "IRFDA", "Healthcare System", "PWA"],
        images: [
          "images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/0.webp",
          "images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/1.webp",
          "images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/2.webp",
          "images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/3.webp",
          "images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/4.webp",
          "images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/5.webp",
          "images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/6.webp",
          "images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/7.webp",
          "images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/8.webp",
        ],
        slide: 0,
        fullscreen: false,
        link: "https://adr-reporter.ttac.ir/",
      },
      {
        name: "supplyChainManagementSystemOfIRFDA",
        category: "gov",
        tags: ["Vue.js", "Supply Chain", "Data Dashboards", "IRFDA"],
        images: [
          "images/works/5 Supply chain management (drag store subsystem)/0.webp",
          "images/works/5 Supply chain management (drag store subsystem)/1.webp",
          "images/works/5 Supply chain management (drag store subsystem)/2.webp",
          "images/works/5 Supply chain management (drag store subsystem)/3.webp",
          "images/works/5 Supply chain management (drag store subsystem)/4.webp",
          "images/works/5 Supply chain management (drag store subsystem)/5.webp",
          "images/works/5 Supply chain management (drag store subsystem)/6.webp",
          "images/works/5 Supply chain management (drag store subsystem)/7.webp",
        ],
        slide: 0,
        fullscreen: false,
        link: "https://statisticsreports.ttac.ir/",
      },
      {
        name: "registrationSystemOfEBBBrokerage",
        category: "fintech",
        tags: ["Vue.js", "FinTech", "KYC Onboarding", "Brokerage"],
        images: [
          "images/works/2 Eghtesaad Bidaar brokerage registration system/0.webp",
          "images/works/2 Eghtesaad Bidaar brokerage registration system/1.webp",
          "images/works/2 Eghtesaad Bidaar brokerage registration system/2.webp",
          "images/works/2 Eghtesaad Bidaar brokerage registration system/3.webp",
          "images/works/2 Eghtesaad Bidaar brokerage registration system/4.webp",
          "images/works/2 Eghtesaad Bidaar brokerage registration system/5.webp",
        ],
        slide: 0,
        fullscreen: false,
        link: "",
      },
      {
        name: "sabadGardanOfEBBBrokerage",
        category: "fintech",
        tags: ["Vue.js", "Portfolio Management", "Landing", "FinTech"],
        images: [
          "images/works/3 Sabad gardan landing page for Eghtesaad-e Bidaar brokerage/0.webp",
          "images/works/3 Sabad gardan landing page for Eghtesaad-e Bidaar brokerage/1.webp",
        ],
        slide: 0,
        fullscreen: false,
        link: "",
      },
      {
        name: "Web3jsMintingSample",
        category: "web3",
        tags: ["Web3.js", "NFT Minting", "Smart Contracts", "Vue"],
        images: [
          "images/works/6 Web3js minting sample/0.webp",
          "images/works/6 Web3js minting sample/1.webp",
          "images/works/6 Web3js minting sample/2.webp",
          "images/works/6 Web3js minting sample/3.webp",
          "images/works/6 Web3js minting sample/4.webp",
        ],
        slide: 0,
        fullscreen: false,
        link: "https://web3-sample-test.web.app/",
      },
      {
        name: "chatAppVueFirebaseSample",
        category: "apps",
        tags: ["Vue.js", "Firebase", "Realtime Chat", "PWA"],
        images: [
          "images/works/7 Chat app/0.webp",
          "images/works/7 Chat app/1.webp",
          "images/works/7 Chat app/2.webp",
          "images/works/7 Chat app/3.webp",
          "images/works/7 Chat app/4.webp",
          "images/works/7 Chat app/5.webp",
        ],
        slide: 0,
        fullscreen: false,
        link: "https://firibz-chat.web.app/",
      },
      {
        name: "others",
        category: "apps",
        tags: ["Vue.js", "Quasar", "Vuetify", "UI/UX"],
        images: [
          "images/works/8 Others/0.webp",
          "images/works/8 Others/1.webp",
          "images/works/8 Others/2.webp",
          "images/works/8 Others/3.webp",
          "images/works/8 Others/4.webp",
        ],
        slide: 0,
        fullscreen: false,
        link: "",
      },
    ]);

    const categories = computed(() => [
      { id: "all", label: t("catAll") },
      { id: "web3", label: t("catWeb3") },
      { id: "gov", label: t("catGov") },
      { id: "fintech", label: t("catFintech") },
      { id: "apps", label: t("catApps") },
    ]);

    const filteredGalleryItems = computed(() => {
      if (activeCategory.value === "all") return imageGalleryItems.value;
      return imageGalleryItems.value.filter(
        (item) => item.category === activeCategory.value
      );
    });

    const activeStageItem = computed(() => {
      return (
        imageGalleryItems.value[stageIndex.value] || imageGalleryItems.value[0]
      );
    });

    const focusProjectOnStage = (item) => {
      const idx = imageGalleryItems.value.findIndex(
        (g) => g.name === item.name
      );
      if (idx !== -1) {
        stageIndex.value = idx;
        utilStore.setHoveredWork(
          idx,
          item.images[item.slide || 0],
          item.name
        );
      }
    };

    const onWorkCardLeave = (event) => {
      onCardMouseLeave(event);
      utilStore.setHoveredWork(-1);
    };

    const cycleStage = (delta) => {
      const total = imageGalleryItems.value.length;
      stageIndex.value = (stageIndex.value + delta + total) % total;
      utilStore.triggerPulse();
    };

    const selectCategory = async (catId) => {
      activeCategory.value = catId;
      utilStore.triggerPulse();
      await nextTick();
      animateStaggerReveal(galleryListRef.value);
    };

    usePageScrollToTop();

    onMounted(() => {
      animateStaggerReveal(worksPageRef.value);
    });

    return {
      worksPageRef,
      galleryListRef,
      t,
      categories,
      activeCategory,
      imageGalleryItems,
      filteredGalleryItems,
      stageIndex,
      activeStageItem,
      focusProjectOnStage,
      onWorkCardLeave,
      cycleStage,
      selectCategory,
      onCardMouseMove,
      onCardMouseLeave,
    };
  },
});
</script>
