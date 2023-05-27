<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'
import {useTheme} from "src/composables/theme";

export default defineComponent({
  name: 'App',
  setup(){
    const { initTheme } = useTheme();
    initTheme();
  }
})
</script>
