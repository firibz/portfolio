<template>
  <div ref="worksPageRef" class="works-page-root col-xs-12 q-py-md">
    <!-- 1. Section Header & View Layout Switcher -->
    <div
      class="row items-center justify-between q-gutter-y-xs q-mb-xs gsap-reveal"
    >
      <div class="relative-position text-h5 text-bold">
        <span class="text-system-primary section-title text-bold">{{
          t("some")
        }}</span>
        {{ t("ofMyWorks") }} *
      </div>

      <!-- View Mode Segmented Toggle (Showcase vs Compact Grid) -->
      <div class="row items-center q-gutter-x-sm">
        <span class="works-total-pill">
          {{ filteredGalleryItems.length }} {{ t("projectCount") }}
        </span>
        <div
          class="view-mode-capsule row items-center no-wrap"
          role="group"
          aria-label="Gallery layout switcher"
        >
          <button
            type="button"
            class="view-mode-btn"
            :class="{ 'view-mode-btn--active': viewMode === 'showcase' }"
            :aria-label="t('viewShowcase')"
            @click="switchViewMode('showcase')"
          >
            <q-icon name="mdi-view-agenda-outline" size="16px" />
            <q-tooltip
              class="bg-system-primary text-section text-caption"
              :offset="[0, 8]"
            >
              {{ t("viewShowcase") }}
            </q-tooltip>
          </button>
          <button
            type="button"
            class="view-mode-btn"
            :class="{ 'view-mode-btn--active': viewMode === 'grid' }"
            :aria-label="t('viewGrid')"
            @click="switchViewMode('grid')"
          >
            <q-icon name="mdi-view-grid-outline" size="16px" />
            <q-tooltip
              class="bg-system-primary text-section text-caption"
              :offset="[0, 8]"
            >
              {{ t("viewGrid") }}
            </q-tooltip>
          </button>
        </div>
      </div>
    </div>

    <hr class="full-width q-mt-sm q-mb-md block title-hr gsap-reveal" />

    <!-- Category Filter Bar with Live Counts -->
    <div class="row items-center q-gutter-xs q-mb-lg gsap-reveal">
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        class="work-cat-btn row items-center no-wrap"
        :class="{ 'work-cat-btn--active': activeCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        <span>{{ cat.label }}</span>
        <span class="cat-count-chip">{{ cat.count }}</span>
      </button>
    </div>

    <!-- 2A. SHOWCASE GALLERY VIEW (Crisp 16:9 Stage + Dedicated Image List Rail) -->
    <div
      v-if="viewMode === 'showcase'"
      ref="galleryListRef"
      class="works-showcase-list"
    >
      <div
        v-for="(galleryItem, idx) in filteredGalleryItems"
        :key="galleryItem.name"
        class="works-grid-cell gsap-reveal"
      >
        <div
          class="glass-3d-subcard work-gallery-card relative-position overflow-hidden"
          @mouseenter="onWorkCardEnter(galleryItem, idx)"
          @mousemove="onCardMouseMove($event, 3.5, 4)"
          @mouseleave="onWorkCardLeave"
        >
          <div class="card-3d-glare"></div>

          <!-- Card Top Meta Header -->
          <div
            class="work-card-header row items-start justify-between q-gutter-y-xs q-mb-sm relative-position z-top"
          >
            <div class="work-header-main row items-start no-wrap">
              <span class="project-index-badge q-mr-sm shrink-0">
                {{ formatIndex(idx + 1) }}
              </span>
              <div class="column work-title-wrap">
                <span class="text-subtitle1 text-bold work-card-title">
                  {{ t(galleryItem.name) }}
                </span>
                <span class="work-cat-mini q-mt-xs">
                  {{ getCategoryLabel(galleryItem.category) }}
                </span>
              </div>
            </div>

            <!-- Right Header Quick Actions -->
            <div class="row items-center no-wrap q-gutter-x-xs shrink-0">
              <a
                v-if="galleryItem.link"
                :href="galleryItem.link"
                target="_blank"
                rel="noopener noreferrer"
                class="work-demo-cta system-primary-link"
                @click.stop
              >
                <q-icon name="mdi-open-in-new" size="14px" class="q-mr-xs" />
                <span>{{ t("liveDemo") }}</span>
              </a>
              <button
                type="button"
                class="work-icon-btn"
                :aria-label="
                  'Open fullscreen gallery for ' + t(galleryItem.name)
                "
                @click.stop="openLightbox(galleryItem, galleryItem.slide)"
              >
                <q-icon name="mdi-fullscreen" size="17px" />
                <q-tooltip
                  class="bg-system-primary text-section text-caption"
                  :offset="[0, 6]"
                >
                  {{ t("openLightbox") }}
                </q-tooltip>
              </button>
            </div>
          </div>

          <!-- Crisp 16:9 Framed Stage Viewport (Zero Stretching / Zero Overflow) -->
          <div
            class="work-stage-viewport relative-position overflow-hidden"
            @touchstart.passive="onTouchStart($event, galleryItem.name)"
            @touchend.passive="onTouchEnd($event, galleryItem)"
          >
            <Transition name="work-img-fade" mode="out-in">
              <img
                :key="galleryItem.images[galleryItem.slide]"
                :src="galleryItem.images[galleryItem.slide]"
                :alt="`${t(galleryItem.name)} - ${galleryItem.slide + 1}`"
                class="work-stage-img cursor-pointer"
                loading="lazy"
                @click="openLightbox(galleryItem, galleryItem.slide)"
              />
            </Transition>

            <!-- Top-Left Screen Counter & Click-to-Zoom Pill -->
            <div class="stage-overlay-top row items-center justify-between">
              <span class="stage-slide-counter">
                {{ formatIndex(galleryItem.slide + 1) }} /
                {{ formatIndex(galleryItem.images.length) }}
              </span>
              <span
                class="stage-zoom-hint cursor-pointer"
                @click.stop="openLightbox(galleryItem, galleryItem.slide)"
              >
                <q-icon name="mdi-magnify-plus-outline" size="15px" />
              </span>
            </div>

            <!-- Floating Glass Prev / Next Controls -->
            <template v-if="galleryItem.images.length > 1">
              <button
                type="button"
                class="stage-arrow-btn stage-arrow-btn--prev"
                aria-label="Previous screenshot"
                @click.stop="stepProjectSlide(galleryItem, -1)"
              >
                <q-icon name="mdi-chevron-left" size="20px" />
              </button>
              <button
                type="button"
                class="stage-arrow-btn stage-arrow-btn--next"
                aria-label="Next screenshot"
                @click.stop="stepProjectSlide(galleryItem, 1)"
              >
                <q-icon name="mdi-chevron-right" size="20px" />
              </button>
            </template>
          </div>

          <!-- Dedicated Glassmorphic Image List / Filmstrip Rail (Internally Scrollable) -->
          <div
            v-if="galleryItem.images.length > 1"
            class="work-thumb-rail q-mt-sm relative-position z-top"
          >
            <div
              :ref="(el) => setThumbStripRef(galleryItem.name, el)"
              class="work-thumb-strip row no-wrap items-center"
            >
              <button
                v-for="(thumbImg, thumbIdx) in galleryItem.images"
                :key="galleryItem.name + '-thumb-' + thumbIdx"
                type="button"
                class="work-thumb-item relative-position overflow-hidden"
                :class="{
                  'work-thumb-item--active': galleryItem.slide === thumbIdx,
                }"
                :aria-label="`View screen ${thumbIdx + 1} of ${t(
                  galleryItem.name
                )}`"
                @click.stop="selectProjectSlide(galleryItem, thumbIdx)"
              >
                <img
                  :src="thumbImg"
                  :alt="`${t(galleryItem.name)} thumbnail ${thumbIdx + 1}`"
                  class="work-thumb-img"
                  loading="lazy"
                />
                <span class="work-thumb-num">{{
                  formatIndex(thumbIdx + 1)
                }}</span>
                <span class="work-thumb-bar"></span>
              </button>
            </div>
          </div>

          <!-- Card Footer: Tech Stack Tags + Inspect Gallery Trigger -->
          <div
            class="row items-center justify-between q-gutter-y-xs q-mt-sm work-card-footer relative-position z-top"
          >
            <div class="row q-gutter-xs items-center">
              <span
                v-for="tag in galleryItem.tags"
                :key="tag"
                class="work-tech-tag"
              >
                {{ tag }}
              </span>
            </div>

            <button
              type="button"
              class="work-inspect-btn row items-center no-wrap shrink-0"
              @click.stop="openLightbox(galleryItem, galleryItem.slide)"
            >
              <q-icon
                name="mdi-image-multiple-outline"
                size="14px"
                class="q-mr-xs"
              />
              <span>{{ galleryItem.images.length }} {{ t("slidesCount") }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2B. COMPACT 2-COLUMN VISUAL GRID VIEW -->
    <div v-else ref="galleryListRef" class="works-compact-grid">
      <div
        v-for="(galleryItem, idx) in filteredGalleryItems"
        :key="galleryItem.name"
        class="works-grid-cell flex gsap-reveal"
      >
        <div
          class="glass-3d-subcard work-grid-card column justify-between full-width q-pa-sm relative-position overflow-hidden"
          @mouseenter="onWorkCardEnter(galleryItem, idx)"
          @mousemove="onCardMouseMove($event, 5, 5)"
          @mouseleave="onWorkCardLeave"
        >
          <div class="card-3d-glare"></div>

          <div class="column relative-position z-top">
            <!-- Compact 16:9 Cover -->
            <div
              class="work-grid-media relative-position overflow-hidden cursor-pointer"
              @click="openLightbox(galleryItem, galleryItem.slide)"
            >
              <img
                :src="galleryItem.images[galleryItem.slide]"
                :alt="t(galleryItem.name)"
                class="work-grid-cover"
                loading="lazy"
              />
              <div class="work-grid-scrim"></div>

              <div class="work-grid-top-badges row items-center justify-between">
                <span class="project-index-badge">
                  {{ formatIndex(idx + 1) }}
                </span>
                <span class="stage-slide-counter">
                  <q-icon
                    name="mdi-image-multiple-outline"
                    size="12px"
                    class="q-mr-xs"
                  />
                  {{ galleryItem.images.length }}
                </span>
              </div>

              <!-- Quick Hover Bar -->
              <div
                class="work-grid-hover-bar row items-center justify-end q-gutter-x-xs"
              >
                <a
                  v-if="galleryItem.link"
                  :href="galleryItem.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="work-icon-btn work-icon-btn--glass"
                  aria-label="Open live demo"
                  @click.stop
                >
                  <q-icon name="mdi-open-in-new" size="15px" />
                </a>
                <button
                  type="button"
                  class="work-icon-btn work-icon-btn--glass"
                  aria-label="Inspect full gallery"
                  @click.stop="openLightbox(galleryItem, galleryItem.slide)"
                >
                  <q-icon name="mdi-fullscreen" size="16px" />
                </button>
              </div>
            </div>

            <!-- Interactive Mini Thumbnail Preview Strip (up to 4 + overflow) -->
            <div
              v-if="galleryItem.images.length > 1"
              class="work-grid-mini-strip row no-wrap q-mt-xs"
            >
              <button
                v-for="(miniImg, miniIdx) in galleryItem.images.slice(0, 4)"
                :key="galleryItem.name + '-mini-' + miniIdx"
                type="button"
                class="work-grid-mini-thumb relative-position overflow-hidden"
                :class="{
                  'work-grid-mini-thumb--active':
                    galleryItem.slide === miniIdx,
                }"
                @click.stop="selectProjectSlide(galleryItem, miniIdx)"
              >
                <img
                  :src="miniImg"
                  alt=""
                  class="work-thumb-img"
                  loading="lazy"
                />
              </button>
              <button
                v-if="galleryItem.images.length > 4"
                type="button"
                class="work-grid-more-btn flex flex-center"
                @click.stop="openLightbox(galleryItem, 4)"
              >
                +{{ galleryItem.images.length - 4 }}
              </button>
            </div>

            <!-- Title -->
            <div class="q-px-xs q-pt-sm">
              <div class="text-subtitle2 text-bold work-grid-title">
                {{ t(galleryItem.name) }}
              </div>
            </div>
          </div>

          <!-- Compact Footer Tags -->
          <div
            class="row items-center justify-between q-gutter-y-xs q-px-xs q-pt-sm q-pb-xs relative-position z-top"
          >
            <div class="row q-gutter-xs">
              <span
                v-for="tag in galleryItem.tags.slice(0, 2)"
                :key="tag"
                class="work-tech-tag work-tech-tag--sm"
              >
                {{ tag }}
              </span>
            </div>
            <span
              v-if="galleryItem.link"
              class="text-caption text-system-primary text-bold row items-center"
            >
              <q-icon
                name="mdi-check-decagram-outline"
                size="13px"
                class="q-mr-xs"
              />
              {{ t("liveDemo") }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Redesigned Google Drive Archive Banner -->
    <div
      class="glass-3d-subcard drive-archive-card q-pa-md q-mt-xl q-mb-md relative-position overflow-hidden gsap-reveal"
      @mousemove="onCardMouseMove($event, 4, 4)"
      @mouseleave="onCardMouseLeave"
    >
      <div class="card-3d-glare"></div>
      <div class="drive-archive-inner relative-position z-top">
        <div class="row items-center no-wrap" style="min-width: 0">
          <div class="drive-orb-badge flex flex-center q-mr-md shrink-0">
            <q-icon
              name="mdi-google-drive"
              size="26px"
              class="text-system-primary"
            />
          </div>
          <div class="column" style="min-width: 0">
            <span class="text-subtitle1 text-bold">
              {{ t("viewAllOnGoogleDrive") }}
            </span>
            <span class="text-caption opacity-80 leading-relaxed">
              {{ t("archiveSubtitle") }}
            </span>
          </div>
        </div>

        <a
          href="https://drive.google.com/drive/folders/1aIF8Tk2fmADzgg3k4h8_iPKdtHtAGAEL?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          class="resume-3d-btn drive-cta-btn row items-center justify-center no-wrap q-px-md shrink-0"
        >
          <span class="resume-icon-circle flex flex-center q-mr-sm">
            <q-icon name="mdi-folder-image" size="18px" />
          </span>
          <span>Google Drive</span>
          <q-icon
            name="mdi-arrow-top-right"
            size="15px"
            class="q-ml-xs resume-arrow-icon"
          />
        </a>
      </div>
    </div>

    <!-- 4. Footnote Notice -->
    <div class="q-mb-md gsap-reveal">
      <hr class="q-mb-md full-width section-hr" />
      <span class="text-body2 opacity-85">* {{ t("projectsAccessNotice") }}</span>
    </div>

    <!-- 5. Custom 3D Glassmorphic Fullscreen Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div
          v-if="lightbox.open && lightbox.item"
          class="works-lightbox-overlay column justify-between"
          role="dialog"
          aria-modal="true"
          :aria-label="t(lightbox.item.name)"
          @click.self="closeLightbox"
        >
          <!-- Lightbox Top Chrome -->
          <div
            class="works-lightbox-header row items-center justify-between q-px-lg q-py-md"
          >
            <div class="row items-center no-wrap" style="min-width: 0">
              <span class="project-index-badge q-mr-sm shrink-0">
                {{ formatIndex(lightbox.slide + 1) }} /
                {{ formatIndex(lightbox.item.images.length) }}
              </span>
              <span class="text-subtitle1 text-bold ellipsis">
                {{ t(lightbox.item.name) }}
              </span>
            </div>

            <div class="row items-center q-gutter-x-sm shrink-0">
              <a
                v-if="lightbox.item.link"
                :href="lightbox.item.link"
                target="_blank"
                rel="noopener noreferrer"
                class="works-lightbox-demo-btn system-primary-link"
              >
                <q-icon name="mdi-open-in-new" size="14px" class="q-mr-xs" />
                <span>{{ t("liveDemo") }}</span>
              </a>
              <button
                type="button"
                class="works-lightbox-close"
                aria-label="Close gallery"
                @click="closeLightbox"
              >
                <q-icon name="mdi-close" size="20px" />
              </button>
            </div>
          </div>

          <!-- Lightbox Center Image Stage -->
          <div
            class="works-lightbox-stage col relative-position flex flex-center q-px-xl"
            @click.self="closeLightbox"
            @touchstart.passive="onLightboxTouchStart"
            @touchend.passive="onLightboxTouchEnd"
          >
            <button
              v-if="lightbox.item.images.length > 1"
              type="button"
              class="works-lightbox-nav works-lightbox-nav--prev"
              aria-label="Previous image"
              @click.stop="stepLightbox(-1)"
            >
              <q-icon name="mdi-chevron-left" size="28px" />
            </button>

            <Transition name="work-img-fade" mode="out-in">
              <img
                :key="lightbox.item.images[lightbox.slide]"
                :src="lightbox.item.images[lightbox.slide]"
                :alt="`${t(lightbox.item.name)} - ${lightbox.slide + 1}`"
                class="works-lightbox-img"
              />
            </Transition>

            <button
              v-if="lightbox.item.images.length > 1"
              type="button"
              class="works-lightbox-nav works-lightbox-nav--next"
              aria-label="Next image"
              @click.stop="stepLightbox(1)"
            >
              <q-icon name="mdi-chevron-right" size="28px" />
            </button>
          </div>

          <!-- Lightbox Bottom Thumbnail Filmstrip -->
          <div
            class="works-lightbox-footer column items-center q-px-md q-py-md"
          >
            <div class="works-lightbox-strip row no-wrap items-center">
              <button
                v-for="(img, lIdx) in lightbox.item.images"
                :key="'lb-thumb-' + lIdx"
                type="button"
                class="works-lightbox-thumb relative-position overflow-hidden"
                :class="{
                  'works-lightbox-thumb--active': lightbox.slide === lIdx,
                }"
                :aria-label="`Jump to screen ${lIdx + 1}`"
                @click="jumpLightbox(lIdx)"
              >
                <img :src="img" alt="" class="work-thumb-img" />
                <span class="work-thumb-num">{{ formatIndex(lIdx + 1) }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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
  nextTick,
} from "vue";
import { useI18n } from "vue-i18n";
import { useUtilStore } from "stores/util-store";
import { usePageScrollToTop } from "src/composables/page-scroll-to-top";
import { useGsap3D } from "src/composables/gsap-3d";

export default defineComponent({
  name: "WorksPage",
  setup() {
    const worksPageRef = ref(null);
    const galleryListRef = ref(null);
    const activeCategory = ref("all");
    const viewMode = ref("showcase"); // 'showcase' | 'grid'

    const { t } = useI18n({ useScope: "global" });
    const utilStore = useUtilStore();
    const { onCardMouseMove, onCardMouseLeave, animateStaggerReveal } =
      useGsap3D();

    const thumbStripRefs = {};
    const setThumbStripRef = (name, el) => {
      if (el) {
        thumbStripRefs[name] = el;
      } else {
        delete thumbStripRefs[name];
      }
    };

    const scrollActiveThumbIntoView = (name, slideIdx) => {
      const stripEl = thumbStripRefs[name];
      if (!stripEl) return;
      const thumbBtn = stripEl.children[slideIdx];
      if (thumbBtn && typeof thumbBtn.scrollIntoView === "function") {
        thumbBtn.scrollIntoView({
          behavior: "smooth",
          inline: "nearest",
          block: "nearest",
        });
      }
    };

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
        link: "",
      },
    ]);

    const getCategoryCount = (catId) => {
      if (catId === "all") return imageGalleryItems.value.length;
      return imageGalleryItems.value.filter((item) => item.category === catId)
        .length;
    };

    const categories = computed(() => [
      { id: "all", label: t("catAll"), count: getCategoryCount("all") },
      { id: "web3", label: t("catWeb3"), count: getCategoryCount("web3") },
      { id: "gov", label: t("catGov"), count: getCategoryCount("gov") },
      {
        id: "fintech",
        label: t("catFintech"),
        count: getCategoryCount("fintech"),
      },
      { id: "apps", label: t("catApps"), count: getCategoryCount("apps") },
    ]);

    const getCategoryLabel = (catId) => {
      const found = categories.value.find((c) => c.id === catId);
      return found ? found.label : catId;
    };

    const filteredGalleryItems = computed(() => {
      if (activeCategory.value === "all") return imageGalleryItems.value;
      return imageGalleryItems.value.filter(
        (item) => item.category === activeCategory.value
      );
    });

    const formatIndex = (num) => (num < 10 ? `0${num}` : `${num}`);

    const onWorkCardEnter = (item, idx) => {
      utilStore.setHoveredWork(idx, item.images[item.slide || 0], item.name);
    };

    const onWorkCardLeave = (event) => {
      onCardMouseLeave(event);
      utilStore.setHoveredWork(-1);
    };

    const selectProjectSlide = (item, slideIdx) => {
      item.slide = slideIdx;
      scrollActiveThumbIntoView(item.name, slideIdx);
    };

    const stepProjectSlide = (item, delta) => {
      const total = item.images.length;
      item.slide = (item.slide + delta + total) % total;
      scrollActiveThumbIntoView(item.name, item.slide);
    };

    const selectCategory = async (catId) => {
      activeCategory.value = catId;
      utilStore.triggerPulse();
      await nextTick();
      animateStaggerReveal(galleryListRef.value);
    };

    const switchViewMode = async (mode) => {
      if (viewMode.value === mode) return;
      viewMode.value = mode;
      await nextTick();
      animateStaggerReveal(galleryListRef.value);
    };

    // Touch swipe state for inline cards
    const touchStarts = {};
    const onTouchStart = (e, key) => {
      if (e.touches && e.touches[0]) {
        touchStarts[key] = e.touches[0].clientX;
      }
    };
    const onTouchEnd = (e, item) => {
      const startX = touchStarts[item.name];
      if (startX === undefined || !e.changedTouches || !e.changedTouches[0]) {
        return;
      }
      const deltaX = e.changedTouches[0].clientX - startX;
      delete touchStarts[item.name];
      if (Math.abs(deltaX) > 40) {
        stepProjectSlide(item, deltaX < 0 ? 1 : -1);
      }
    };

    // Custom Glassmorphic Fullscreen Lightbox
    const lightbox = reactive({
      open: false,
      item: null,
      slide: 0,
    });
    let lightboxTouchStartX = 0;

    const openLightbox = (item, startSlide = 0) => {
      lightbox.item = item;
      lightbox.slide = startSlide;
      lightbox.open = true;
    };

    const closeLightbox = () => {
      lightbox.open = false;
    };

    const stepLightbox = (delta) => {
      if (!lightbox.item) return;
      const total = lightbox.item.images.length;
      lightbox.slide = (lightbox.slide + delta + total) % total;
      lightbox.item.slide = lightbox.slide;
      scrollActiveThumbIntoView(lightbox.item.name, lightbox.slide);
    };

    const jumpLightbox = (idx) => {
      if (!lightbox.item) return;
      lightbox.slide = idx;
      lightbox.item.slide = idx;
      scrollActiveThumbIntoView(lightbox.item.name, idx);
    };

    const onLightboxTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        lightboxTouchStartX = e.touches[0].clientX;
      }
    };

    const onLightboxTouchEnd = (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const deltaX = e.changedTouches[0].clientX - lightboxTouchStartX;
      if (Math.abs(deltaX) > 45) {
        stepLightbox(deltaX < 0 ? 1 : -1);
      }
    };

    const onKeyDown = (e) => {
      if (!lightbox.open) return;
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        stepLightbox(1);
      } else if (e.key === "ArrowLeft") {
        stepLightbox(-1);
      }
    };

    usePageScrollToTop();

    onMounted(() => {
      animateStaggerReveal(worksPageRef.value);
      window.addEventListener("keydown", onKeyDown);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", onKeyDown);
    });

    return {
      worksPageRef,
      galleryListRef,
      t,
      categories,
      activeCategory,
      viewMode,
      imageGalleryItems,
      filteredGalleryItems,
      formatIndex,
      getCategoryLabel,
      setThumbStripRef,
      onWorkCardEnter,
      onWorkCardLeave,
      selectProjectSlide,
      stepProjectSlide,
      selectCategory,
      switchViewMode,
      onTouchStart,
      onTouchEnd,
      lightbox,
      openLightbox,
      closeLightbox,
      stepLightbox,
      jumpLightbox,
      onLightboxTouchStart,
      onLightboxTouchEnd,
      onCardMouseMove,
      onCardMouseLeave,
    };
  },
});
</script>

<style lang="scss" scoped>
/* ==========================================================================
   STRICT HORIZONTAL CONTAINMENT (Prevents flex min-width:auto overflow)
   ========================================================================== */
.works-page-root {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
}

.works-showcase-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  width: 100%;
  min-width: 0;
}

.works-compact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
  min-width: 0;
}

@media (max-width: 599px) {
  .works-compact-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.works-grid-cell {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

/* ==========================================================================
   HEADER CONTROLS, VIEW SWITCHER & CATEGORY CHIPS
   ========================================================================== */
.works-total-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 99px;
  background: rgba(164, 255, 145, 0.1);
  border: 1px solid rgba(164, 255, 145, 0.22);
  color: var(--q-color-system-primary-in-dark);
}

.body--light .works-total-pill {
  background: rgba(76, 119, 83, 0.1);
  border-color: rgba(76, 119, 83, 0.24);
  color: var(--q-color-system-primary-in-light);
}

.view-mode-capsule {
  padding: 3px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(164, 255, 145, 0.18);
  gap: 2px;
}

.body--light .view-mode-capsule {
  background: rgba(76, 119, 83, 0.07);
  border-color: rgba(76, 119, 83, 0.22);
}

.view-mode-btn {
  appearance: none;
  border: none;
  width: 28px;
  height: 26px;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  opacity: 0.65;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.22s ease;

  &:hover {
    opacity: 1;
    color: var(--q-color-system-primary-in-dark);
  }

  &--active {
    opacity: 1;
    background: linear-gradient(135deg, #52d379, #a4ff91);
    color: #121212 !important;
    box-shadow: 0 2px 10px rgba(82, 211, 121, 0.35);
  }
}

.body--light .view-mode-btn {
  &:hover {
    color: var(--q-color-system-primary-in-light);
  }
  &--active {
    background: linear-gradient(135deg, #4c7753, #52d379);
    color: #fff !important;
    box-shadow: 0 2px 10px rgba(76, 119, 83, 0.3);
  }
}

.cat-count-chip {
  font-size: 10px;
  font-weight: 800;
  margin-left: 6px;
  padding: 0 6px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.1);
  line-height: 1.5;
}

.work-cat-btn--active .cat-count-chip {
  background: rgba(18, 18, 18, 0.2);
}

.body--light .cat-count-chip {
  background: rgba(76, 119, 83, 0.14);
}

.body--light .work-cat-btn--active .cat-count-chip {
  background: rgba(255, 255, 255, 0.22);
}

/* ==========================================================================
   SHOWCASE GALLERY CARD & 16:9 MEDIA STAGE
   ========================================================================== */
.work-gallery-card {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 16px;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

@media (max-width: 599px) {
  .work-gallery-card {
    padding: 12px;
  }
}

.shrink-0 {
  flex-shrink: 0;
}

.work-card-header {
  width: 100%;
  min-width: 0;
  gap: 8px;
}

.work-header-main {
  flex: 1 1 200px;
  min-width: 0;
}

.work-title-wrap {
  min-width: 0;
  flex: 1 1 auto;
}

.work-card-title {
  line-height: 1.3;
  word-break: break-word;
}

.work-cat-mini {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.7;
}

.work-demo-cta {
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 8px;
  background: rgba(82, 211, 121, 0.14);
  border: 1px solid rgba(164, 255, 145, 0.34);
  color: #a4ff91 !important;
  display: inline-flex;
  align-items: center;
  transition: all 0.25s ease;

  &:hover {
    background: linear-gradient(135deg, #52d379, #a4ff91);
    color: #121212 !important;
    border-color: #a4ff91;
    box-shadow: 0 4px 14px rgba(82, 211, 121, 0.35);
  }
}

.body--light .work-demo-cta {
  background: rgba(76, 119, 83, 0.12);
  border-color: rgba(76, 119, 83, 0.35);
  color: #2f5235 !important;

  &:hover {
    background: linear-gradient(135deg, #4c7753, #52d379);
    color: #fff !important;
    border-color: #4c7753;
  }
}

.work-icon-btn {
  appearance: none;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(164, 255, 145, 0.22);
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.22s ease;

  &:hover {
    border-color: #a4ff91;
    color: #a4ff91;
    background: rgba(164, 255, 145, 0.12);
  }

  &--glass {
    background: rgba(14, 18, 15, 0.72);
    border-color: rgba(164, 255, 145, 0.35);
    color: #fff;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
}

.body--light .work-icon-btn {
  border-color: rgba(76, 119, 83, 0.26);
  background: rgba(76, 119, 83, 0.06);

  &:hover {
    border-color: #4c7753;
    color: #4c7753;
    background: rgba(76, 119, 83, 0.14);
  }

  &--glass {
    background: rgba(255, 255, 255, 0.88);
    color: #2c4a32;
    border-color: rgba(76, 119, 83, 0.35);
  }
}

/* Crisp 16:9 Stage Frame (Matches native 1.8:1 WebP screenshots) */
.work-stage-viewport {
  width: 100%;
  max-width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  background: #0f1310;
  border: 1px solid rgba(164, 255, 145, 0.16);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);

  &:hover {
    .work-stage-img {
      transform: scale(1.018);
    }
    .stage-arrow-btn,
    .stage-zoom-hint {
      opacity: 1;
    }
  }
}

.body--light .work-stage-viewport {
  background: #e5ede8;
  border-color: rgba(76, 119, 83, 0.22);
}

.work-stage-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.work-img-fade-enter-active,
.work-img-fade-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}
.work-img-fade-enter-from {
  opacity: 0;
  transform: scale(1.015);
}
.work-img-fade-leave-to {
  opacity: 0;
  transform: scale(0.99);
}

.stage-overlay-top {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 3;
  pointer-events: none;
}

.stage-slide-counter {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 3px 9px;
  border-radius: 99px;
  background: rgba(14, 18, 15, 0.74);
  color: #e9f5ec;
  border: 1px solid rgba(164, 255, 145, 0.26);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: inline-flex;
  align-items: center;
}

.stage-zoom-hint {
  pointer-events: auto;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(14, 18, 15, 0.72);
  color: #a4ff91;
  border: 1px solid rgba(164, 255, 145, 0.32);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease;

  &:hover {
    transform: scale(1.08);
    background: #52d379;
    color: #121212;
  }
}

.stage-arrow-btn {
  appearance: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(164, 255, 145, 0.34);
  background: rgba(14, 18, 15, 0.74);
  color: #fff;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.24s ease;

  &--prev {
    /* rtl:ignore */
    left: 10px;
  }
  &--next {
    /* rtl:ignore */
    right: 10px;
  }

  &:hover {
    background: linear-gradient(135deg, #52d379, #a4ff91);
    color: #121212;
    border-color: #a4ff91;
    box-shadow: 0 4px 14px rgba(82, 211, 121, 0.4);
  }
}

@media (hover: none) {
  .stage-arrow-btn,
  .stage-zoom-hint {
    opacity: 0.92;
  }
}

/* ==========================================================================
   DEDICATED IMAGE LIST / FILMSTRIP RAIL (Strictly clamped & internally scrollable)
   ========================================================================== */
.work-thumb-rail {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 6px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.24);
  border: 1px solid rgba(164, 255, 145, 0.1);
  overflow: hidden;
  box-sizing: border-box;
}

.body--light .work-thumb-rail {
  background: rgba(76, 119, 83, 0.06);
  border-color: rgba(76, 119, 83, 0.14);
}

.work-thumb-strip {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 99px;
  }
}

.work-thumb-item {
  appearance: none;
  padding: 0;
  flex: 0 0 74px;
  width: 74px;
  height: 43px;
  border-radius: 7px;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  background: #101411;
  cursor: pointer;
  opacity: 0.58;
  transition: all 0.24s cubic-bezier(0.22, 1, 0.36, 1);

  &:hover {
    opacity: 0.92;
    transform: translateY(-2px);
    border-color: rgba(164, 255, 145, 0.5);
  }

  &--active {
    opacity: 1;
    border-color: #a4ff91;
    box-shadow: 0 0 12px rgba(82, 211, 121, 0.38);

    .work-thumb-bar {
      opacity: 1;
      transform: scaleX(1);
    }

    .work-thumb-num {
      background: #a4ff91;
      color: #121212;
    }
  }
}

@media (max-width: 599px) {
  .work-thumb-item {
    flex: 0 0 60px;
    width: 60px;
    height: 36px;
  }
}

.body--light .work-thumb-item {
  border-color: rgba(76, 119, 83, 0.2);
  background: #dce5df;

  &:hover {
    border-color: rgba(76, 119, 83, 0.55);
  }

  &--active {
    border-color: #4c7753;
    box-shadow: 0 3px 10px rgba(76, 119, 83, 0.28);

    .work-thumb-num {
      background: #4c7753;
      color: #fff;
    }
  }
}

.work-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}

.work-thumb-num {
  position: absolute;
  bottom: 3px;
  left: 3px;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 4px;
  background: rgba(12, 16, 13, 0.78);
  color: #e5ece7;
  transition: all 0.2s ease;
}

.work-thumb-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #52d379, #a4ff91);
  opacity: 0;
  transform: scaleX(0);
  transition: all 0.25s ease;
}

/* ==========================================================================
   CARD FOOTER: TECH TAGS & INSPECT TRIGGER
   ========================================================================== */
.work-card-footer {
  border-top: 1px solid rgba(164, 255, 145, 0.08);
  padding-top: 10px;
  gap: 8px;
}

.body--light .work-card-footer {
  border-top-color: rgba(76, 119, 83, 0.12);
}

.work-tech-tag {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 99px;
  background: rgba(164, 255, 145, 0.09);
  border: 1px solid rgba(164, 255, 145, 0.2);
  color: #d6f5d0;

  &--sm {
    font-size: 10px;
    padding: 1px 7px;
  }
}

.body--light .work-tech-tag {
  background: rgba(76, 119, 83, 0.09);
  border-color: rgba(76, 119, 83, 0.22);
  color: #2c4e32;
}

.work-inspect-btn {
  appearance: none;
  border: 1px solid rgba(164, 255, 145, 0.18);
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.22s ease;

  &:hover {
    border-color: #a4ff91;
    color: #a4ff91;
    background: rgba(164, 255, 145, 0.1);
  }
}

.body--light .work-inspect-btn {
  border-color: rgba(76, 119, 83, 0.24);
  background: rgba(76, 119, 83, 0.05);

  &:hover {
    border-color: #4c7753;
    color: #4c7753;
    background: rgba(76, 119, 83, 0.14);
  }
}

/* ==========================================================================
   COMPACT 2-COLUMN VISUAL GRID VIEW
   ========================================================================== */
.work-grid-card {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.work-grid-media {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  background: #0f1310;
  border: 1px solid rgba(164, 255, 145, 0.14);

  &:hover {
    .work-grid-cover {
      transform: scale(1.04);
    }
    .work-grid-hover-bar {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.work-grid-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.work-grid-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(10, 14, 11, 0.45) 0%,
    transparent 45%,
    rgba(10, 14, 11, 0.65) 100%
  );
  pointer-events: none;
}

.work-grid-top-badges {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  z-index: 2;
  pointer-events: none;
}

.work-grid-hover-bar {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 3;
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.24s ease;
}

.work-grid-mini-strip {
  width: 100%;
  min-width: 0;
  gap: 5px;
}

.work-grid-mini-thumb {
  appearance: none;
  padding: 0;
  flex: 1 1 0;
  min-width: 0;
  height: 30px;
  border-radius: 6px;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  background: #101411;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.95;
  }

  &--active {
    opacity: 1;
    border-color: #a4ff91;
    box-shadow: 0 0 8px rgba(82, 211, 121, 0.35);
  }
}

.body--light .work-grid-mini-thumb {
  border-color: rgba(76, 119, 83, 0.2);

  &--active {
    border-color: #4c7753;
  }
}

.work-grid-more-btn {
  appearance: none;
  flex: 0 0 34px;
  height: 30px;
  border-radius: 6px;
  border: 1px dashed rgba(164, 255, 145, 0.35);
  background: rgba(164, 255, 145, 0.08);
  color: #a4ff91;
  font-size: 10.5px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #52d379;
    color: #121212;
    border-style: solid;
  }
}

.body--light .work-grid-more-btn {
  border-color: rgba(76, 119, 83, 0.4);
  background: rgba(76, 119, 83, 0.1);
  color: #4c7753;

  &:hover {
    background: #4c7753;
    color: #fff;
  }
}

.work-grid-title {
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ==========================================================================
   REDESIGNED GOOGLE DRIVE ARCHIVE BANNER
   ========================================================================== */
.drive-archive-card {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.drive-archive-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.drive-orb-badge {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(164, 255, 145, 0.1);
  border: 1px solid rgba(164, 255, 145, 0.26);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}

.body--light .drive-orb-badge {
  background: rgba(76, 119, 83, 0.1);
  border-color: rgba(76, 119, 83, 0.26);
}

.drive-cta-btn {
  height: 42px;
  min-width: 160px;
}

@media (max-width: 599px) {
  .drive-cta-btn {
    width: 100%;
  }
}
</style>

<style lang="scss">
/* ==========================================================================
   CUSTOM 3D GLASSMORPHIC FULLSCREEN LIGHTBOX (Teleported to body)
   ========================================================================== */
.works-lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(10, 14, 11, 0.92);
  color: #fff;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.body--light .works-lightbox-overlay {
  background: rgba(235, 242, 238, 0.94);
  color: #1f2b22;
}

.works-lightbox-header {
  border-bottom: 1px solid rgba(164, 255, 145, 0.14);
  background: rgba(18, 22, 19, 0.55);
}

.body--light .works-lightbox-header {
  border-bottom-color: rgba(76, 119, 83, 0.18);
  background: rgba(255, 255, 255, 0.7);
}

.works-lightbox-demo-btn {
  font-size: 11.5px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 8px;
  background: rgba(82, 211, 121, 0.16);
  border: 1px solid rgba(164, 255, 145, 0.36);
  color: #a4ff91 !important;
  display: inline-flex;
  align-items: center;
  transition: all 0.25s ease;

  &:hover {
    background: linear-gradient(135deg, #52d379, #a4ff91);
    color: #121212 !important;
    border-color: #a4ff91;
    box-shadow: 0 4px 14px rgba(82, 211, 121, 0.35);
  }
}

.body--light .works-lightbox-demo-btn {
  background: rgba(76, 119, 83, 0.12);
  border-color: rgba(76, 119, 83, 0.35);
  color: #2f5235 !important;

  &:hover {
    background: linear-gradient(135deg, #4c7753, #52d379);
    color: #fff !important;
    border-color: #4c7753;
  }
}

.works-lightbox-close {
  appearance: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(164, 255, 145, 0.28);
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.22s ease;

  &:hover {
    background: #52d379;
    color: #121212;
    border-color: #a4ff91;
  }
}

.body--light .works-lightbox-close {
  border-color: rgba(76, 119, 83, 0.3);
  background: rgba(76, 119, 83, 0.08);

  &:hover {
    background: #4c7753;
    color: #fff;
  }
}

.works-lightbox-stage {
  min-height: 0;
  overflow: hidden;
  padding-top: 16px;
  padding-bottom: 16px;
}

.works-lightbox-img {
  max-width: 90vw;
  max-height: 70vh;
  border-radius: 14px;
  object-fit: contain;
  border: 1px solid rgba(164, 255, 145, 0.22);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.65);
}

.body--light .works-lightbox-img {
  border-color: rgba(76, 119, 83, 0.28);
  box-shadow: 0 24px 55px rgba(35, 55, 40, 0.22);
}

.works-lightbox-nav {
  appearance: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid rgba(164, 255, 145, 0.34);
  background: rgba(16, 20, 17, 0.78);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.24s ease;
  z-index: 5;

  &--prev {
    /* rtl:ignore */
    left: 20px;
  }
  &--next {
    /* rtl:ignore */
    right: 20px;
  }

  &:hover {
    background: linear-gradient(135deg, #52d379, #a4ff91);
    color: #121212;
    border-color: #a4ff91;
    box-shadow: 0 0 22px rgba(82, 211, 121, 0.45);
  }
}

.body--light .works-lightbox-nav {
  background: rgba(255, 255, 255, 0.88);
  color: #264a2d;
  border-color: rgba(76, 119, 83, 0.35);

  &:hover {
    background: linear-gradient(135deg, #4c7753, #52d379);
    color: #fff;
  }
}

.works-lightbox-footer {
  border-top: 1px solid rgba(164, 255, 145, 0.14);
  background: rgba(18, 22, 19, 0.6);
}

.body--light .works-lightbox-footer {
  border-top-color: rgba(76, 119, 83, 0.16);
  background: rgba(255, 255, 255, 0.72);
}

.works-lightbox-strip {
  max-width: 92vw;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 2px;
}

.works-lightbox-thumb {
  appearance: none;
  padding: 0;
  flex: 0 0 88px;
  height: 52px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.14);
  background: #101411;
  cursor: pointer;
  opacity: 0.55;
  transition: all 0.22s ease;

  &:hover {
    opacity: 0.92;
    transform: translateY(-2px);
  }

  &--active {
    opacity: 1;
    border-color: #a4ff91;
    box-shadow: 0 0 16px rgba(82, 211, 121, 0.45);
  }

  .work-thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
  }

  .work-thumb-num {
    position: absolute;
    bottom: 3px;
    left: 4px;
    font-size: 9px;
    font-weight: 800;
    padding: 1px 4px;
    border-radius: 4px;
    background: rgba(12, 16, 13, 0.8);
    color: #e9f5ec;
  }
}

.body--light .works-lightbox-thumb {
  border-color: rgba(76, 119, 83, 0.24);
  &--active {
    border-color: #4c7753;
    box-shadow: 0 4px 12px rgba(76, 119, 83, 0.35);
  }
}

.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .works-lightbox-stage {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
  .works-lightbox-nav {
    width: 38px;
    height: 38px;
    &--prev {
      /* rtl:ignore */
      left: 8px;
    }
    &--next {
      /* rtl:ignore */
      right: 8px;
    }
  }
  .works-lightbox-img {
    max-width: 96vw;
    max-height: 62vh;
  }
}
</style>
