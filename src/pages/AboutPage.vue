<template>
      <div class="column col-xs-12 justify-start">
        <div class="relative-position text-h5 text-bold">
          <span class="text-system-green section-title text-bold">{{ t("about") }}</span> {{ t("me") }}
        </div>
        <hr class="full-width q-mt-lg q-mb-lg block title-hr"/>
        <div class="q-mb-xl">
          <span class="text-bold q-mr-xs">{{ t("greeting") }}</span>
          <span>{{ t("aboutMeSection1") }}</span>
          <br/>
          <span class="q-mr-xs">{{ t("aboutMeSection2") }}</span>
          <span class="q-mr-xs">{{ t("aboutMeSection3") }}</span>
          <span>{{ t("aboutMeSection4") }}</span>
          <br>
          <span>{{ t("aboutMeSection5") }}</span>
        </div>
        <div v-if="utilState.language === 'fa-IR'" class="relative-position text-h5 text-bold">
          <span class="text-system-green section-title text-bold">{{ t("interests") }}</span> {{ t("my") }}
        </div>
        <div v-else class="relative-position text-h5 text-bold">
          <span class="text-system-green section-title text-bold">{{ t("my") }}</span> {{ t("interests") }}
        </div>
        <hr class="full-width q-mt-lg q-mb-lg block title-hr"/>
        <div class="row">
          <div v-for="interest in interestsList" :key="interest.title" class="col-xs-12">
            <q-icon :name="interest.icon"></q-icon>
            {{ interest.title }} {{ interest.value }}
          </div>
        </div>
      </div>
</template>

<script>
import {computed, defineComponent} from 'vue'
import {useI18n} from "vue-i18n";
import {useUtilStore} from "stores/util-store";

export default defineComponent({
  name: 'AboutPage',
  setup() {
    const {t} = useI18n({useScope: "global"});
    const utilStore = useUtilStore();
    const interestsList = computed(() => {
      return [
        {
          title: t("bestBook"),
          value: 'Harry Potter collection',
          icon: 'mdi-book',
        },
        {
          title: t("bestMovie"),
          value: 'Inception',
          icon: 'mdi-movie-open-star',
        },
        {
          title: t("bestAnime"),
          value: 'Death Note',
          icon: 'mdi-movie-filter',
        },
        {
          title: t("bestSeries"),
          value: 'WestWorld, Severance and The big bang theory',
          icon: 'mdi-filmstrip',
        },
        {
          title: t("otherInterests"),
          value: '',
          icon: 'mdi-emoticon-cool',
        },
      ];
    });
    return {
      t,
      utilState: utilStore.$state,
      interestsList,
    }
  }
})
</script>
