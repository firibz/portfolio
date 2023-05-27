<template>
  <div class="fit column full-width card"
       :class="$q.screen.lt.md ? 'custom-rounded-borders q-pa-lg' : 'card custom-rounded-borders-right q-px-xl q-py-lg'"
       style="display: flex">
    <div v-if="utilState.language === 'fa-IR'" class="relative-position text-h5 text-bold">
      <span class="text-system-green section-title text-bold">{{ t("sample") }}</span> {{ t("myWorks") }}
    </div>
    <div v-else class="relative-position text-h5 text-bold">
      <span class="text-system-green section-title text-bold">{{ t("my") }}</span> {{ t("works") }}
    </div>
    <hr class="full-width q-mt-lg q-mb-xl block title-hr"/>

  </div>
</template>

<script>
import {defineComponent} from 'vue'
import {useI18n} from "vue-i18n";
import {useUtilStore} from "stores/util-store";
export default defineComponent({
  name: 'WorksPage',
  setup() {
    const {t} = useI18n({ useScope: "global" });
    const utilStore = useUtilStore();
    return {
      t,
      utilState: utilStore.$state,
    }
  }
})
</script>
