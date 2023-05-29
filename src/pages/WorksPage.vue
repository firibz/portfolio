<template>
  <div class="column col-xs-12 justify-start">
    <div v-if="utilState.language === 'fa-IR'" class="relative-position text-h5 text-bold">
      <span class="text-system-primary section-title text-bold">{{ t("sample") }}</span> {{ t("myWorks") }}
    </div>
    <div v-else class="relative-position text-h5 text-bold">
      <span class="text-system-primary section-title text-bold">{{ t("my") }}</span> {{ t("works") }}
    </div>
    <hr class="full-width q-mt-md q-mb-lg block title-hr"/>
    <div class="row full-width justify-center text-body1 q-py-xs">
      <a class="system-primary-link"
         href="https://drive.google.com/drive/folders/1aIF8Tk2fmADzgg3k4h8_iPKdtHtAGAEL?usp=sharing"
         target="_blank">
        <q-icon name="mdi-google-drive"/>
        View all on Google drive
        <q-icon name="mdi-open-in-new"/>
      </a>
      <hr class="q-mb-md full-width section-hr"/>
    </div>
    <div class="row full-width">
      <div v-for="(galleryItem, index) in imageGalleryItems" :key="galleryItem.name"
           class="column q-px-sm q-py-md col-xs-12">
        <q-carousel
          v-model="galleryItem.slide"
          v-model:fullscreen="galleryItem.fullscreen"
          :aria-label="index"
          animated
          class="work-gallery"
          infinite
          swipeable
          thumbnails
        >
          <q-carousel-slide
            v-for="(galleryImage, imageIndex) in galleryItem.images"
            :key="galleryItem.name + imageIndex"
            :aria-label="imageIndex"
            :img-src="galleryImage"
            :name="imageIndex"
            class="cursor-pointer fix-border-in-images"
            @click="$q.screen.lt.md ? '' : galleryItem.fullscreen = !galleryItem.fullscreen"/>
          <template v-slot:control>
            <q-carousel-control
              :offset="[18, 18]"
              position="top-right"
            >
              <q-btn
                :icon="galleryItem.fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'" color="section" dense push round
                text-color="system-primary"
                @click="galleryItem.fullscreen = !galleryItem.fullscreen"
              />
            </q-carousel-control>
          </template>
        </q-carousel>
        <div class="text-subtitle2 text-center q-mt-sm">
          <div v-if="galleryItem.link">
            <a class="system-primary-link" :href="galleryItem.link" target="_blank">
              <q-icon name="mdi-link-variant"/>
              {{ galleryItem.name }}
              <q-icon name="mdi-open-in-new"/>
            </a>
          </div>
          <span v-else>{{ galleryItem.name }}</span>
        </div>
        <hr class="q-mb-md full-width section-hr"/>
      </div>
    </div>
  </div>
</template>

<script>

import {defineComponent, ref} from 'vue'
import {useI18n} from "vue-i18n";
import {useUtilStore} from "stores/util-store";

export default defineComponent({
  name: 'WorksPage',
  setup() {
    const {t} = useI18n({useScope: "global"});
    const utilStore = useUtilStore();
    const imageGalleryItems = ref([
      {
        name: 'Staking and NFT landing web3 website',
        images: [
          'images/works/0 Staking and NFT landing sample/0.webp',
          'images/works/0 Staking and NFT landing sample/1.webp',
          'images/works/0 Staking and NFT landing sample/2.webp',
          'images/works/0 Staking and NFT landing sample/3.webp',
          'images/works/0 Staking and NFT landing sample/4.webp',
          'images/works/0 Staking and NFT landing sample/5.webp',
        ],
        slide: 0,
        fullscreen: false,
        link: 'https://ascendants-sample.web.app/',
      },
      {
        name: 'Saman Salamat Pajoh labeling system',
        images: [
          'images/works/1 SSP labels/0.webp',
          'images/works/1 SSP labels/1.webp',
          'images/works/1 SSP labels/2.webp',
          'images/works/1 SSP labels/3.webp',
          'images/works/1 SSP labels/4.webp',
        ],
        slide: 0,
        fullscreen: false,
        link: '',
      },
      {
        name: 'ADR reporter system of Iran Food and Drug Administration(IRFDA)',
        images: [
          'images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/0.webp',
          'images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/1.webp',
          'images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/2.webp',
          'images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/3.webp',
          'images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/4.webp',
          'images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/5.webp',
          'images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/6.webp',
          'images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/7.webp',
          'images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/8.webp',
        ],
        slide: 0,
        fullscreen: false,
        link: 'https://adr-reporter.ttac.ir/',
      },
      {
        name: 'Supply chain management system of Iran Food and Drug Administration(IRFDA)',
        images: [
          'images/works/5 Supply chain management (drag store subsystem)/0.webp',
          'images/works/5 Supply chain management (drag store subsystem)/1.webp',
          'images/works/5 Supply chain management (drag store subsystem)/2.webp',
          'images/works/5 Supply chain management (drag store subsystem)/3.webp',
          'images/works/5 Supply chain management (drag store subsystem)/4.webp',
          'images/works/5 Supply chain management (drag store subsystem)/5.webp',
          'images/works/5 Supply chain management (drag store subsystem)/6.webp',
          'images/works/5 Supply chain management (drag store subsystem)/7.webp',
        ],
        slide: 0,
        fullscreen: false,
        link: 'https://statisticsreports.ttac.ir/',
      },
      {
        name: 'Registration system of the Eghtesaad-e Bidaar brokerage',
        images: [
          'images/works/2 Eghtesaad Bidaar brokerage registration system/0.webp',
          'images/works/2 Eghtesaad Bidaar brokerage registration system/1.webp',
          'images/works/2 Eghtesaad Bidaar brokerage registration system/2.webp',
          'images/works/2 Eghtesaad Bidaar brokerage registration system/3.webp',
          'images/works/2 Eghtesaad Bidaar brokerage registration system/4.webp',
          'images/works/2 Eghtesaad Bidaar brokerage registration system/5.webp',
        ],
        slide: 0,
        fullscreen: false,
        link: '',
      },
      {
        name: 'Sabad gardan landing page of the Eghtesaad-e Bidaar brokerage',
        images: [
          'images/works/3 Sabad gardan landing page for Eghtesaad-e Bidaar brokerage/0.webp',
          'images/works/3 Sabad gardan landing page for Eghtesaad-e Bidaar brokerage/1.webp',
        ],
        slide: 0,
        fullscreen: false,
        link: '',
      },
      {
        name: 'Web3js minting sample',
        images: [
          'images/works/6 Web3js minting sample/0.webp',
          'images/works/6 Web3js minting sample/1.webp',
          'images/works/6 Web3js minting sample/2.webp',
          'images/works/6 Web3js minting sample/3.webp',
          'images/works/6 Web3js minting sample/4.webp',
        ],
        slide: 0,
        fullscreen: false,
        link: 'https://web3-sample-test.web.app/',
      },
      {
        name: 'Chat app Vue Firebase sample',
        images: [
          'images/works/7 Chat app/0.webp',
          'images/works/7 Chat app/1.webp',
          'images/works/7 Chat app/2.webp',
          'images/works/7 Chat app/3.webp',
          'images/works/7 Chat app/4.webp',
          'images/works/7 Chat app/5.webp',
        ],
        slide: 0,
        fullscreen: false,
        link: 'https://firibz-chat.web.app/',
      },
      {
        name: 'Others',
        images: [
          'images/works/8 Others/0.webp',
          'images/works/8 Others/1.webp',
          'images/works/8 Others/2.webp',
          'images/works/8 Others/3.webp',
          'images/works/8 Others/4.webp',
        ],
        slide: 0,
        fullscreen: false,
        link: '',
      },
    ])

    return {
      t,
      utilState: utilStore.$state,
      imageGalleryItems,
    }
  }
})
</script>
