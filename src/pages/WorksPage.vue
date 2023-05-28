<template>
      <div class="column col-xs-12 justify-start">
        <div v-if="utilState.language === 'fa-IR'" class="relative-position text-h5 text-bold">
          <span class="text-system-primary section-title text-bold">{{ t("sample") }}</span> {{ t("myWorks") }}
        </div>
        <div v-else class="relative-position text-h5 text-bold">
          <span class="text-system-primary section-title text-bold">{{ t("my") }}</span> {{ t("works") }}
        </div>
        <hr class="full-width q-mt-md q-mb-xl block title-hr"/>
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
