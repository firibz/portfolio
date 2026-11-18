<template>
  <q-page class="sculpture-journey-page">
    <!-- ============================================================
         CHAPTER 00 — THE SEED (HERO INTRO)
         Sculpture sits centered (xFrac: 0) as a breathing emerald seed
    ============================================================= -->
    <section
      id="chapter-0"
      :ref="(el) => setChapterRef(el, 0)"
      data-chapter="0"
      class="journey-chapter chapter--intro"
    >
      <div class="chapter-container intro-layout">
        <!-- Top Eyebrow Telemetry -->
        <div class="eyebrow-badge">
          <span class="eyebrow-num">00 // {{ t("formSeed") }}</span>
          <span class="eyebrow-dot"></span>
          <span>{{ t("heroEyebrow") }}</span>
        </div>

        <!-- Monumental Editorial Title Framing the Central 3D Seed -->
        <h1 class="hero-monument-title" @click="triggerSculptureRipple">
          <span class="title-first">{{ t("firstName") }}</span>
          <span class="title-last">{{ t("lastName") }}</span>
        </h1>

        <p class="hero-role-lead">
          {{ t("heroRole") }}
        </p>

        <!-- Primary Interactive CTA Row -->
        <div class="hero-cta-row">
          <button
            type="button"
            class="btn-sculpture-primary"
            @mouseenter="utilStore.setHighlight(true)"
            @mouseleave="utilStore.setHighlight(false)"
            @click="scrollToChapter(3)"
          >
            <span>{{ t("exploreWorksCta") }}</span>
            <q-icon name="mdi-arrow-down-right" size="18px" />
          </button>

          <a
            :href="RESUME_URL"
            download
            class="btn-sculpture-glass"
            @mouseenter="utilStore.setHighlight(true)"
            @mouseleave="utilStore.setHighlight(false)"
          >
            <q-icon name="mdi-file-download-outline" size="18px" />
            <span>{{ t("downloadResume") }}</span>
          </a>

          <button
            type="button"
            class="btn-ripple-hint"
            @click="triggerSculptureRipple"
          >
            <span class="pulse-indicator"></span>
            <span>{{ $q.screen.lt.md ? t("touchHint") : t("cursorHint") }}</span>
          </button>
        </div>

        <!-- Scroll Cue Filament -->
        <button
          type="button"
          class="scroll-cue-btn"
          @click="scrollToChapter(1)"
        >
          <span class="scroll-cue-label">{{ t("scrollHint") }}</span>
          <span class="scroll-cue-line"></span>
        </button>
      </div>
    </section>

    <!-- ============================================================
         CHAPTER 01 — THE LIQUID (ABOUT & PHILOSOPHY)
         Sculpture glides to the side (xFrac: +0.48) as twisted liquid mercury
    ============================================================= -->
    <section
      id="chapter-1"
      :ref="(el) => setChapterRef(el, 1)"
      data-chapter="1"
      class="journey-chapter chapter--side-start"
    >
      <div class="chapter-container">
        <div class="chapter-content-column">
          <!-- Chapter Header -->
          <div class="chapter-kicker-row">
            <span class="chapter-idx">01 / {{ t("formLiquid") }}</span>
            <span class="chapter-line"></span>
            <span class="chapter-kicker">{{ t("aboutKicker") }}</span>
          </div>

          <h2 class="chapter-heading">
            <span>{{ t("about") }}</span>
            <em class="serif-accent">{{ t("me") }}</em>
          </h2>

          <p class="chapter-note-quote">{{ t("noteLiquid") }}</p>

          <!-- Profile Portrait & Key Metrics Card (Preserving Signature Curved Photo Cutout) -->
          <div class="about-profile-showcase">
            <div class="portrait-card card">
              <div class="relative-position profile-image-size full-width">
                <q-img
                  v-if="$q.dark.isActive"
                  alt="Fariborz Korevli"
                  class="custom-rounded-borders-top fit profile-image profile-image-size"
                  fit="cover"
                  src="~assets/images/profile-dark-2.jpg"
                />
                <q-img
                  v-else
                  alt="Fariborz Korevli"
                  class="custom-rounded-borders-top fit profile-image profile-image-size"
                  fit="cover"
                  src="~assets/images/profile-light.jpg"
                />

                <div class="experience-3d-badge">
                  <span class="exp-num">+{{ experienceYears }}</span>
                  <span class="exp-label">{{ t("experienceYears") }}</span>
                </div>
              </div>

              <div class="portrait-card-footer q-pa-md text-center z-top">
                <div class="text-h6 text-bold">{{ t("fullName") }}</div>
                <div class="text-caption text-system-primary text-bold q-mt-xs">
                  {{ t("job") }}
                </div>

                <!-- Metrics Triad -->
                <div class="metrics-triad q-mt-md">
                  <div class="metric-box">
                    <span class="metric-val">+{{ experienceYears }}</span>
                    <span class="metric-lbl">{{ t("experienceYears") }}</span>
                  </div>
                  <div class="metric-box">
                    <span class="metric-val">{{ works.length }}</span>
                    <span class="metric-lbl">{{ t("aboutStatProjects") }}</span>
                  </div>
                  <div class="metric-box">
                    <span class="metric-val metric-val--sm">{{
                      t("aboutStatStack")
                    }}</span>
                    <span class="metric-lbl">{{
                      t("aboutStatStackLabel")
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bio Narrative Stack (High-Contrast Readable Cards) -->
            <div class="bio-narrative-stack">
              <article
                class="editorial-read-card relative-position overflow-hidden"
                @mousemove="onCardMouseMove($event, 4, 4)"
                @mouseleave="onCardMouseLeave"
              >
                <div class="card-3d-glare"></div>
                <div class="row items-center q-mb-sm">
                  <div class="card-icon-chip q-mr-sm">
                    <q-icon name="mdi-code-braces-box" size="20px" />
                  </div>
                  <h3 class="card-title-sm">{{ t("greeting") }}</h3>
                </div>
                <p class="card-body-text q-mb-sm">{{ t("aboutMeSection1") }}</p>
                <p class="card-body-text q-mb-none opacity-85">
                  {{ t("aboutMeSection2") }}
                </p>
              </article>

              <div class="bio-duo-grid">
                <article
                  class="editorial-read-card relative-position overflow-hidden"
                  @mousemove="onCardMouseMove($event, 5, 5)"
                  @mouseleave="onCardMouseLeave"
                >
                  <div class="card-3d-glare"></div>
                  <div class="row items-center q-mb-xs">
                    <div class="card-icon-chip q-mr-sm">
                      <q-icon name="mdi-server-network" size="18px" />
                    </div>
                    <h3 class="card-title-sm">{{ t("backendAndAi") }}</h3>
                  </div>
                  <p class="card-body-text q-mb-none">
                    {{ t("aboutMeSection4") }}
                  </p>
                </article>

                <article
                  class="editorial-read-card relative-position overflow-hidden"
                  @mousemove="onCardMouseMove($event, 5, 5)"
                  @mouseleave="onCardMouseLeave"
                >
                  <div class="card-3d-glare"></div>
                  <div class="row items-center q-mb-xs">
                    <div class="card-icon-chip q-mr-sm">
                      <q-icon name="mdi-account-group-outline" size="18px" />
                    </div>
                    <h3 class="card-title-sm">{{ t("qaAndMentorship") }}</h3>
                  </div>
                  <p class="card-body-text q-mb-xs">
                    {{ t("aboutMeSection3") }}
                  </p>
                  <p class="card-body-text q-mb-none opacity-85">
                    {{ t("aboutMeSection5") }}
                  </p>
                </article>
              </div>
            </div>
          </div>

          <!-- Craftsmanship Philosophy Quote Banner (Glassmorphic) -->
          <div class="philosophy-glass-banner q-mt-md">
            <q-icon
              name="mdi-sparkles"
              size="22px"
              class="text-system-primary"
            />
            <blockquote class="philosophy-quote">
              “{{ t("aboutMeSection6") }}”
            </blockquote>
          </div>

          <!-- Off The Clock / Cultural Favorites Strip (Glassmorphic) -->
          <div class="interests-strip q-mt-lg">
            <div class="interests-header">
              <q-icon
                name="mdi-compass-outline"
                size="18px"
                class="text-system-primary"
              />
              <span>{{ t("interestsTitle") }}</span>
            </div>
            <div class="interests-pills-grid">
              <div
                v-for="item in interests"
                :key="item.key"
                class="interest-glass-pill"
              >
                <q-icon
                  :name="item.icon"
                  size="18px"
                  class="text-system-primary"
                />
                <div class="interest-pill-copy">
                  <span class="interest-pill-label">{{ t(item.key) }}</span>
                  <span class="interest-pill-val">{{ item.value }}</span>
                </div>
              </div>
              <div class="interest-glass-pill interest-glass-pill--wide">
                <q-icon
                  name="mdi-gamepad-variant-outline"
                  size="18px"
                  class="text-system-primary"
                />
                <span class="interest-pill-val">{{ t("otherInterests") }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         CHAPTER 02 — THE CRYSTAL (CRAFT & TECH ARCHITECTURE)
         Sculpture glides to opposite flank (xFrac: -0.50) as a faceted crystal gem
    ============================================================= -->
    <section
      id="chapter-2"
      :ref="(el) => setChapterRef(el, 2)"
      data-chapter="2"
      class="journey-chapter chapter--side-end"
    >
      <div class="chapter-container">
        <div class="chapter-content-column">
          <div class="chapter-kicker-row">
            <span class="chapter-idx">02 / {{ t("formCrystal") }}</span>
            <span class="chapter-line"></span>
            <span class="chapter-kicker">{{ t("craftKicker") }}</span>
          </div>

          <h2 class="chapter-heading">
            <span>{{ t("craftTitle") }}</span>
          </h2>
          <p class="chapter-note-quote">{{ t("craftLead") }}</p>

          <!-- Active Crystal Facet Inspector Card (Fixed Min-Height, High Readability) -->
          <div
            ref="inspectorCardRef"
            class="crystal-inspector-card editorial-read-card q-mt-md"
          >
            <div class="inspector-top-row">
              <div class="row items-center no-wrap">
                <div class="inspector-glyph flex flex-center">
                  <q-icon :name="activeSkill.icon" size="26px" />
                </div>
                <div class="q-mx-md">
                  <div class="inspector-facet-num">
                    FACET 0{{ selectedSkillIndex + 1 }} / 0{{ skills.length }}
                  </div>
                  <h3 class="inspector-skill-title">
                    {{ isFa ? activeSkill.nameFa : activeSkill.name }}
                  </h3>
                </div>
              </div>

              <div class="inspector-nav-arrows">
                <button
                  type="button"
                  class="facet-arrow-btn"
                  :aria-label="t('previous')"
                  @click="cycleSkill(-1)"
                >
                  <q-icon name="mdi-chevron-left" size="18px" />
                </button>
                <button
                  type="button"
                  class="facet-arrow-btn"
                  :aria-label="t('next')"
                  @click="cycleSkill(1)"
                >
                  <q-icon name="mdi-chevron-right" size="18px" />
                </button>
              </div>
            </div>

            <p class="inspector-desc">
              {{ isFa ? activeSkill.descFa : activeSkill.descEn }}
            </p>

            <div class="inspector-tags-row">
              <span
                v-for="tag in activeSkill.tags"
                :key="tag"
                class="crystal-tech-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 8-Discipline Facet Matrix (3-Column Grid with Centered Bottom Row) -->
          <div class="crystal-facet-grid q-mt-md">
            <button
              v-for="(node, idx) in skills"
              :key="node.id"
              type="button"
              class="crystal-facet-btn"
              :class="{
                'crystal-facet-btn--active': selectedSkillIndex === idx,
              }"
              :title="isFa ? node.nameFa : node.name"
              @mouseenter="utilStore.setHighlight(true)"
              @mouseleave="utilStore.setHighlight(false)"
              @click="selectSkill(idx)"
            >
              <div class="facet-btn-inner">
                <div class="facet-btn-icon flex flex-center">
                  <q-icon :name="node.icon" size="16px" />
                </div>
                <span class="facet-btn-label">{{ node.shortName }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         CHAPTER 03 — THE PORTAL (SELECTED WORKS SHOWCASE)
         Sculpture centers and opens into a luminous 3D toroidal portal
    ============================================================= -->
    <section
      id="chapter-3"
      :ref="(el) => setChapterRef(el, 3)"
      data-chapter="3"
      class="journey-chapter chapter--portal"
    >
      <div class="chapter-container">
        <div class="portal-header-block">
          <div>
            <div class="chapter-kicker-row">
              <span class="chapter-idx">03 / {{ t("formPortal") }}</span>
              <span class="chapter-line"></span>
              <span class="chapter-kicker">{{ t("worksKicker") }}</span>
            </div>
            <h2 class="chapter-heading">{{ t("worksTitle") }}</h2>
            <p class="chapter-note-quote q-mb-none">{{ t("worksLead") }}</p>
          </div>

          <!-- Category Filter Pills -->
          <div class="portal-filter-bar">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              class="portal-filter-pill"
              :class="{
                'portal-filter-pill--active': activeCategory === cat.id,
              }"
              @click="setCategory(cat.id)"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- 3D Project Cards Grid Framing the Portal -->
        <div class="portal-works-grid q-mt-lg">
          <article
            v-for="(work, idx) in filteredWorks"
            :key="work.name"
            class="portal-work-card relative-position overflow-hidden"
            @mouseenter="utilStore.setHighlight(true)"
            @mouseleave="
              onCardMouseLeave($event);
              utilStore.setHighlight(false);
            "
            @mousemove="onCardMouseMove($event, 5, 5)"
          >
            <div class="card-3d-glare"></div>

            <!-- Interactive Screen Preview Viewport -->
            <div
              class="work-preview-frame"
              @click="openLightbox(work, activeSlideMap[work.name] || 0)"
            >
              <img
                :src="'/' + work.images[activeSlideMap[work.name] || 0]"
                :alt="t(work.name)"
                loading="lazy"
                class="work-preview-img"
              />
              <div class="work-preview-overlay">
                <span class="work-index-badge">
                  0{{ idx + 1 }}
                </span>
                <span class="work-screens-badge">
                  <q-icon name="mdi-image-multiple-outline" size="13px" />
                  <span>{{ work.images.length }} {{ t("slidesCount") }}</span>
                </span>
              </div>

              <div class="work-expand-prompt">
                <q-icon name="mdi-arrow-expand-all" size="18px" />
                <span>{{ t("viewScreens") }}</span>
              </div>
            </div>

            <!-- Inline Screen Scrubber Dots -->
            <div v-if="work.images.length > 1" class="work-scrubber-dots">
              <button
                v-for="(imgPath, sIdx) in work.images"
                :key="imgPath"
                type="button"
                class="scrubber-dot"
                :class="{
                  'scrubber-dot--active':
                    (activeSlideMap[work.name] || 0) === sIdx,
                }"
                :aria-label="`Screen ${sIdx + 1}`"
                @click.stop="setWorkSlide(work.name, sIdx)"
              ></button>
            </div>

            <!-- Project Metadata & Actions -->
            <div class="work-card-body">
              <h3 class="work-card-title">{{ t(work.name) }}</h3>

              <div class="work-tags-row">
                <span
                  v-for="tag in work.tags"
                  :key="tag"
                  class="work-tech-pill"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="work-actions-row">
                <button
                  type="button"
                  class="work-btn-gallery"
                  @click="openLightbox(work, activeSlideMap[work.name] || 0)"
                >
                  <q-icon name="mdi-fullscreen" size="16px" />
                  <span>{{ t("viewScreens") }}</span>
                </button>

                <a
                  v-if="work.link"
                  :href="work.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="work-btn-demo"
                >
                  <span>{{ t("liveDemo") }}</span>
                  <q-icon name="mdi-arrow-top-right" size="15px" />
                </a>
              </div>
            </div>
          </article>
        </div>

        <!-- Archive Access Notice & Google Drive Banner -->
        <div class="works-archive-banner editorial-read-card q-mt-xl">
          <div class="archive-copy">
            <q-icon
              name="mdi-shield-lock-outline"
              size="22px"
              class="text-system-primary q-mr-sm"
            />
            <p class="q-mb-none">{{ t("projectsAccessNotice") }}</p>
          </div>
          <a
            href="https://drive.google.com/drive/folders/1aIF8Tk2fmADzgg3k4h8_iPKdtHtAGAEL?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-sculpture-glass archive-drive-btn"
          >
            <q-icon name="mdi-google-drive" size="18px" />
            <span>{{ t("viewAllOnGoogleDrive") }}</span>
            <q-icon name="mdi-arrow-top-right" size="15px" />
          </a>
        </div>
      </div>
    </section>

    <!-- ============================================================
         CHAPTER 04 — THE RETURN (CONTACT & FINALE)
         Sculpture rises into a glowing horizon seed above (y: 0.95)
    ============================================================= -->
    <section
      id="chapter-4"
      :ref="(el) => setChapterRef(el, 4)"
      data-chapter="4"
      class="journey-chapter chapter--contact"
    >
      <div class="chapter-container contact-layout">
        <div class="chapter-kicker-row justify-center">
          <span class="chapter-idx">04 / {{ t("formReturn") }}</span>
          <span class="chapter-line"></span>
          <span class="chapter-kicker">{{ t("contactKicker") }}</span>
        </div>

        <h2 class="contact-monument-heading">
          <span>{{ t("contactTitleA") }}</span>
          <em class="serif-accent">{{ t("contactTitleB") }}</em>
        </h2>

        <p class="contact-lead">{{ t("contactLead") }}</p>

        <!-- Primary Contact Actions: Copy Email + Download Resume -->
        <div class="contact-primary-actions">
          <button
            type="button"
            class="btn-sculpture-primary"
            @mouseenter="utilStore.setHighlight(true)"
            @mouseleave="utilStore.setHighlight(false)"
            @click="copyEmailToClipboard"
          >
            <q-icon
              :name="emailCopied ? 'mdi-check-circle' : 'mdi-content-copy'"
              size="18px"
            />
            <span>{{ emailCopied ? t("copied") : EMAIL }}</span>
          </button>

          <a
            :href="RESUME_URL"
            download
            class="btn-sculpture-glass"
            @mouseenter="utilStore.setHighlight(true)"
            @mouseleave="utilStore.setHighlight(false)"
          >
            <q-icon name="mdi-file-download-outline" size="18px" />
            <span>{{ t("downloadResume") }}</span>
          </a>
        </div>

        <!-- 6 Magnetic Social & Direct Communication Channels -->
        <div class="contact-socials-grid">
          <a
            v-for="item in socialLinks"
            :key="item.name"
            :href="item.link"
            :target="item.target"
            rel="noopener noreferrer"
            class="social-channel-card"
            @mousemove="onMagneticMove($event, 0.22)"
            @mouseleave="onMagneticLeave"
          >
            <div class="social-channel-icon">
              <q-icon :name="item.icon" size="22px" />
            </div>
            <div class="social-channel-meta">
              <span class="social-channel-name">{{ item.name }}</span>
              <span class="social-channel-hint ltr">{{ item.hint }}</span>
            </div>
            <q-icon
              name="mdi-arrow-top-right"
              size="16px"
              class="social-arrow"
            />
          </a>
        </div>

        <!-- Finale Footer -->
        <footer class="journey-footer">
          <span class="footer-credit">{{ t("footerCraft") }}</span>
          <button
            type="button"
            class="footer-top-btn"
            @click="scrollToChapter(0)"
          >
            <span>{{ t("backToTop") }}</span>
            <q-icon name="mdi-arrow-up" size="16px" />
          </button>
        </footer>
      </div>
    </section>

    <!-- ============================================================
         FULLSCREEN PROJECT LIGHTBOX GALLERY MODAL
    ============================================================= -->
    <q-dialog
      v-model="lightbox.open"
      maximized
      transition-show="fade"
      transition-hide="fade"
    >
      <div
        v-if="lightbox.work"
        class="sculpture-lightbox"
        @click.self="lightbox.open = false"
      >
        <header class="lightbox-header">
          <div class="lightbox-title-group">
            <span class="lightbox-counter">
              {{ lightbox.slide + 1 }} / {{ lightbox.work.images.length }}
            </span>
            <h3 class="lightbox-title">{{ t(lightbox.work.name) }}</h3>
          </div>

          <div class="lightbox-actions">
            <a
              v-if="lightbox.work.link"
              :href="lightbox.work.link"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-sculpture-glass q-mr-sm"
            >
              <span>{{ t("liveDemo") }}</span>
              <q-icon name="mdi-arrow-top-right" size="16px" />
            </a>
            <button
              type="button"
              class="lightbox-close-btn"
              :aria-label="t('close')"
              @click="lightbox.open = false"
            >
              <q-icon name="mdi-close" size="22px" />
            </button>
          </div>
        </header>

        <div class="lightbox-stage" @click.self="lightbox.open = false">
          <button
            v-if="lightbox.work.images.length > 1"
            type="button"
            class="lightbox-nav-btn lightbox-nav-btn--prev"
            :aria-label="t('previous')"
            @click="stepLightbox(-1)"
          >
            <q-icon name="mdi-chevron-left" size="28px" />
          </button>

          <img
            :src="'/' + lightbox.work.images[lightbox.slide]"
            :alt="t(lightbox.work.name)"
            class="lightbox-main-img"
          />

          <button
            v-if="lightbox.work.images.length > 1"
            type="button"
            class="lightbox-nav-btn lightbox-nav-btn--next"
            :aria-label="t('next')"
            @click="stepLightbox(1)"
          >
            <q-icon name="mdi-chevron-right" size="28px" />
          </button>
        </div>

        <footer
          v-if="lightbox.work.images.length > 1"
          class="lightbox-thumbs"
        >
          <button
            v-for="(img, idx) in lightbox.work.images"
            :key="img"
            type="button"
            class="lightbox-thumb-btn"
            :class="{ 'lightbox-thumb-btn--active': lightbox.slide === idx }"
            @click="lightbox.slide = idx"
          >
            <img :src="'/' + img" :alt="`Screen ${idx + 1}`" />
          </button>
        </footer>
      </div>
    </q-dialog>
  </q-page>
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
  nextTick,
} from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useUtilStore } from "stores/util-store";
import { useGsap3D } from "src/composables/gsap-3d";
import { works } from "src/data/works";
import { skills } from "src/data/skills";
import {
  START_WORK_YEAR,
  RESUME_URL,
  EMAIL,
  socialLinks,
  interests,
} from "src/data/profile";
import gsap from "gsap";

export default defineComponent({
  name: "AboutPage",
  setup() {
    const { t } = useI18n({ useScope: "global" });
    const route = useRoute();
    const utilStore = useUtilStore();
    const {
      onCardMouseMove,
      onCardMouseLeave,
      onMagneticMove,
      onMagneticLeave,
    } = useGsap3D();

    const chapterEls = ref([]);
    const inspectorCardRef = ref(null);
    const selectedSkillIndex = ref(0);
    const activeCategory = ref("all");
    const activeSlideMap = reactive({});
    const emailCopied = ref(false);

    const lightbox = reactive({
      open: false,
      work: null,
      slide: 0,
    });

    const experienceYears = new Date().getFullYear() - START_WORK_YEAR;
    const isFa = computed(() => utilStore.language === "fa-IR");
    const activeSkill = computed(() => skills[selectedSkillIndex.value]);

    const categories = computed(() => [
      { id: "all", label: t("catAll") },
      { id: "web3", label: t("catWeb3") },
      { id: "gov", label: t("catGov") },
      { id: "fintech", label: t("catFintech") },
      { id: "apps", label: t("catApps") },
    ]);

    const filteredWorks = computed(() => {
      if (activeCategory.value === "all") return works;
      return works.filter((w) => w.category === activeCategory.value);
    });

    const setChapterRef = (el, index) => {
      if (el) chapterEls.value[index] = el;
    };

    // Compute continuous scroll progress [0..4] across the 5 chapters
    const updateScrollChoreography = () => {
      const els = chapterEls.value;
      if (!els.length) return;

      const currentScroll =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        window.scrollY ||
        0;
      const probeY = currentScroll + window.innerHeight * 0.42;
      const tops = els.map((el) =>
        el ? el.getBoundingClientRect().top + currentScroll : 0
      );

      if (probeY <= tops[0]) {
        utilStore.setChapterProgress(0);
        return;
      }

      for (let i = 0; i < tops.length - 1; i++) {
        const start = tops[i];
        const end = tops[i + 1];
        if (probeY >= start && probeY <= end) {
          const span = Math.max(1, end - start);
          const frac = (probeY - start) / span;
          utilStore.setChapterProgress(i + frac);
          return;
        }
      }

      utilStore.setChapterProgress(tops.length - 1);
    };

    const scrollToChapter = (index) => {
      const targetEl = chapterEls.value[index];
      if (!targetEl) return;
      utilStore.triggerPulse();
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const triggerSculptureRipple = () => {
      utilStore.triggerPulse();
    };

    const selectSkill = (idx) => {
      selectedSkillIndex.value = idx;
      utilStore.triggerPulse();
      if (inspectorCardRef.value) {
        gsap.fromTo(
          inspectorCardRef.value,
          { opacity: 0.45, y: 6 },
          { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }
        );
      }
    };

    const cycleSkill = (dir) => {
      const next =
        (selectedSkillIndex.value + dir + skills.length) % skills.length;
      selectSkill(next);
    };

    const setCategory = (catId) => {
      activeCategory.value = catId;
      utilStore.triggerPulse();
    };

    const setWorkSlide = (workName, slideIdx) => {
      activeSlideMap[workName] = slideIdx;
    };

    const openLightbox = (work, slideIdx = 0) => {
      lightbox.work = work;
      lightbox.slide = slideIdx;
      lightbox.open = true;
      utilStore.triggerPulse();
    };

    const stepLightbox = (dir) => {
      if (!lightbox.work) return;
      const len = lightbox.work.images.length;
      lightbox.slide = (lightbox.slide + dir + len) % len;
    };

    const onKeydown = (e) => {
      if (!lightbox.open) return;
      if (e.key === "ArrowRight") stepLightbox(1);
      else if (e.key === "ArrowLeft") stepLightbox(-1);
    };

    const copyEmailToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(EMAIL);
      } catch (err) {
        // Fallback if clipboard permission denied
      }
      emailCopied.value = true;
      utilStore.triggerPulse();
      setTimeout(() => {
        emailCopied.value = false;
      }, 2200);
    };

    watch(
      () => utilStore.jumpTarget,
      (targetIdx) => {
        if (targetIdx >= 0) {
          scrollToChapter(targetIdx);
          utilStore.clearChapterJump();
        }
      }
    );

    onMounted(() => {
      window.addEventListener("scroll", updateScrollChoreography, {
        passive: true,
      });
      window.addEventListener("resize", updateScrollChoreography, {
        passive: true,
      });
      window.addEventListener("keydown", onKeydown);

      nextTick(() => {
        updateScrollChoreography();
        if (route.path.includes("works")) {
          setTimeout(() => scrollToChapter(3), 120);
        }
      });
    });

    onBeforeUnmount(() => {
      window.removeEventListener("scroll", updateScrollChoreography);
      window.removeEventListener("resize", updateScrollChoreography);
      window.removeEventListener("keydown", onKeydown);
    });

    return {
      t,
      utilStore,
      works,
      skills,
      interests,
      socialLinks,
      RESUME_URL,
      EMAIL,
      experienceYears,
      isFa,
      selectedSkillIndex,
      activeSkill,
      inspectorCardRef,
      categories,
      activeCategory,
      filteredWorks,
      activeSlideMap,
      lightbox,
      emailCopied,
      setChapterRef,
      scrollToChapter,
      triggerSculptureRipple,
      selectSkill,
      cycleSkill,
      setCategory,
      setWorkSlide,
      openLightbox,
      stepLightbox,
      copyEmailToClipboard,
      onCardMouseMove,
      onCardMouseLeave,
      onMagneticMove,
      onMagneticLeave,
    };
  },
});
</script>
