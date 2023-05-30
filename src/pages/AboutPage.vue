<template>
      <div class="column col-xs-12 justify-start">
        <div class="relative-position text-h5 text-bold">
          <span class="text-system-primary section-title text-bold">{{ t("about") }}</span> {{ t("me") }}
        </div>
        <hr class="full-width q-mt-md q-mb-lg block title-hr"/>
        <div class="q-mb-xl text-body1">
          <span class="text-bold q-mr-xs">{{ t("greeting") }}</span>
          <span>{{ t("aboutMeSection1") }}</span>
          <br/>
          <span class="q-mr-xs">{{ t("aboutMeSection2") }}</span>
          <span class="q-mr-xs">{{ t("aboutMeSection3") }}</span>
          <span>{{ t("aboutMeSection4") }}</span>
          <br>
          <span>{{ t("aboutMeSection5") }}</span>
          <br>
          <br>
          <span>{{ t("aboutMeSection6") }}</span>
          <q-icon name="mdi-emoticon-excited-outline" size="sm"/>
        </div>
        <div v-if="utilState.language === 'fa-IR'" class="relative-position text-h5 text-bold">
          <span class="text-system-primary section-title text-bold">{{ t("interests") }}</span> {{ t("my") }}
        </div>
        <div v-else class="relative-position text-h5 text-bold">
          <span class="text-system-primary section-title text-bold">{{ t("my") }}</span> {{ t("interests") }}
        </div>
        <hr class="full-width q-mt-md q-mb-lg block title-hr"/>
        <div class="row justify-between">
          <div v-for="interest in interestsList" :key="interest.value" class="column col-xs-6 col-md-4 q-pa-md text-center items-center">
            <q-btn
              :icon="interest.icon"
              class="q-pa-sm relative-position q-mb-xs no-pointer-events custom-rounded-borders"
              size="lg"
              flat
              :aria-label="interest.name + ' icon'"
              glossy/>
            <span class="text-caption text-bold">{{ interest.title }}</span>
            <span class="text-caption">{{ interest.value }}</span>
          </div>
        </div>
      </div>
</template>

<script>
import {computed, defineComponent} from 'vue'
import {useI18n} from "vue-i18n";
import {useUtilStore} from "stores/util-store";
import {usePageScrollToTop} from "src/composables/page-scroll-to-top";

export default defineComponent({
  name: 'AboutPage',
  setup() {
    const {t} = useI18n({useScope: "global"});
    const utilStore = useUtilStore();
    const interestsList = computed(() => {
      return [
        {
          name: "Best Movie",
          title: t("bestMovie"),
          value: 'Inception',
          icon: 'mdi-movie-open-star',
        },
        {
          name: "Best Anime",
          title: t("bestAnime"),
          value: 'Death Note',
          icon: 'mdi-movie-filter',
        },
        {
          name: "Best Series",
          title: t("bestSeries"),
          value: 'WestWorld, Severance and The big bang theory',
          icon: 'mdi-filmstrip',
        },
        {
          name: "Best Book",
          title: t("bestBook"),
          value: 'Harry Potter collection',
          icon: 'mdi-book',
        },
        {
          name: "Other Interests",
          title: '',
          value: t("otherInterests"),
          icon: 'mdi-gamepad-variant',
        },
        {
          name: "See My Works",
          title: '',
          value: t("seeMyWorks"),
          icon: 'mdi-emoticon-cool',
        },
      ];
    });
    usePageScrollToTop();
    return {
      t,
      utilState: utilStore.$state,
      interestsList,
    }
  }
})
</script>
