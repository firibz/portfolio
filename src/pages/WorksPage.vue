<template>
  <div class="column col-xs-12 justify-start">
    <div v-if="utilState.language === 'fa-IR'" class="relative-position text-h5 text-bold">
      <span class="text-system-primary section-title text-bold">{{ t("sample") }}</span> {{ t("myWorks") }}
    </div>
    <div v-else class="relative-position text-h5 text-bold">
      <span class="text-system-primary section-title text-bold">{{ t("my") }}</span> {{ t("works") }}
    </div>
    <hr class="full-width q-mt-md q-mb-lg block title-hr"/>
    <div class="row full-width justify-center">
      <q-btn class="text-center q-mt-sm no-hover"
             flat
             href="https://drive.google.com/drive/folders/1aIF8Tk2fmADzgg3k4h8_iPKdtHtAGAEL?usp=sharing"
             target="_blank"
             unelevated>
        View all on Google drive
      </q-btn>
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
            class="cursor-pointer"
            @click="galleryItem.fullscreen = !galleryItem.fullscreen"/>
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
        <div class="text-caption text-center q-mt-sm">{{ galleryItem.name }}</div>
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
        name: 'Staking and NFT landing sample',
        images: [
          'src/assets/images/works/0 Staking and NFT landing sample/0.webp',
          'src/assets/images/works/0 Staking and NFT landing sample/1.webp',
          'src/assets/images/works/0 Staking and NFT landing sample/2.webp',
          'src/assets/images/works/0 Staking and NFT landing sample/3.webp',
        ],
        slide: 0,
        fullscreen: false,
        link: '',
      },
      {
        name: 'SSP labels',
        images: [
          'src/assets/images/works/1 SSP labels/0.webp',
          'src/assets/images/works/1 SSP labels/1.webp',
          'src/assets/images/works/1 SSP labels/2.webp',
          'src/assets/images/works/1 SSP labels/3.webp',
          'src/assets/images/works/1 SSP labels/4.webp',
        ],
        slide: 0,
        fullscreen: false,
      },
      {
        name: 'Registration system of the Eghtesaad-e Bidaar brokerage',
        images: [
          'src/assets/images/works/2 Registration system of the Eghtesaad-e Bidaar brokerage/0.webp',
          'src/assets/images/works/2 Registration system of the Eghtesaad-e Bidaar brokerage/1.webp',
          'src/assets/images/works/2 Registration system of the Eghtesaad-e Bidaar brokerage/2.webp',
          'src/assets/images/works/2 Registration system of the Eghtesaad-e Bidaar brokerage/3.webp',
          'src/assets/images/works/2 Registration system of the Eghtesaad-e Bidaar brokerage/4.webp',
          'src/assets/images/works/2 Registration system of the Eghtesaad-e Bidaar brokerage/5.webp',
        ],
        slide: 0,
        fullscreen: false,
      },
      {
        name: 'Sabad gardan landing page for Eghtesaad-e Bidaar brokerage',
        images: [
          'src/assets/images/works/3 Sabad gardan landing page for Eghtesaad-e Bidaar brokerage/0.webp',
          'src/assets/images/works/3 Sabad gardan landing page for Eghtesaad-e Bidaar brokerage/1.webp',
        ],
        slide: 0,
        fullscreen: false,
      },
      {
        name: 'Iran Food and Drug Administration(IRFDA)ADR reporter system',
        images: [
          'src/assets/images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/0.webp',
          'src/assets/images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/1.webp',
          'src/assets/images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/2.webp',
          'src/assets/images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/3.webp',
          'src/assets/images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/4.webp',
          'src/assets/images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/5.webp',
          'src/assets/images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/6.webp',
          'src/assets/images/works/4 Iran Food and Drug Administration(IRFDA)ADR reporter system/7.webp',
        ],
        slide: 0,
        fullscreen: false,
      },
      {
        name: 'Iran Food and Drug Administration(IRFDA), Supply chain management (drag store subsystem)',
        images: [
          'src/assets/images/works/5 Supply chain management (drag store subsystem)/0.webp',
          'src/assets/images/works/5 Supply chain management (drag store subsystem)/1.webp',
          'src/assets/images/works/5 Supply chain management (drag store subsystem)/2.webp',
          'src/assets/images/works/5 Supply chain management (drag store subsystem)/3.webp',
          'src/assets/images/works/5 Supply chain management (drag store subsystem)/4.webp',
          'src/assets/images/works/5 Supply chain management (drag store subsystem)/5.webp',
          'src/assets/images/works/5 Supply chain management (drag store subsystem)/6.webp',
          'src/assets/images/works/5 Supply chain management (drag store subsystem)/7.webp',
        ],
        slide: 0,
        fullscreen: false,
      },
      {
        name: 'Web3js minting sample',
        images: [
          'src/assets/images/works/6 Web3js minting sample/0.webp',
          'src/assets/images/works/6 Web3js minting sample/1.webp',
          'src/assets/images/works/6 Web3js minting sample/2.webp',
          'src/assets/images/works/6 Web3js minting sample/3.webp',
          'src/assets/images/works/6 Web3js minting sample/4.webp',
        ],
        slide: 0,
        fullscreen: false,
      },
      {
        name: 'Chat app',
        images: [
          'src/assets/images/works/7 Chat app/0.webp',
          'src/assets/images/works/7 Chat app/1.webp',
          'src/assets/images/works/7 Chat app/2.webp',
          'src/assets/images/works/7 Chat app/3.webp',
          'src/assets/images/works/7 Chat app/4.webp',
          'src/assets/images/works/7 Chat app/5.webp',
        ],
        slide: 0,
        fullscreen: false,
      },
      {
        name: 'Others',
        images: [
          'src/assets/images/works/8 Others/0.webp',
          'src/assets/images/works/8 Others/1.webp',
        ],
        slide: 0,
        fullscreen: false,
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
