<template>
  <div class="fit column full-width card"
       :class="$q.screen.lt.md ? 'custom-rounded-borders q-pa-lg' : 'card custom-rounded-borders-right q-px-xl q-py-lg'"
       style="display: flex">
    <div class="relative-position text-h5 text-bold">
      <span class="text-system-green section-title text-bold">{{ t("about") }}</span> {{ t("me") }}
    </div>
    <hr class="full-width q-mt-lg q-mb-xl block title-hr"/>

  </div>
</template>

<script>
import {defineComponent} from 'vue'
import {useI18n} from "vue-i18n";

export default defineComponent({
  name: 'AboutPage',
  setup() {
    const {t} = useI18n({ useScope: "global" });
    return {
      t,
    }
  }
})
</script>
