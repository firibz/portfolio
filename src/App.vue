<template>
  <background-pattern/>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'
import {useTheme} from "src/composables/theme";
import BackgroundPattern from "components/BackgroundPattern.vue";
export default defineComponent({
  name: 'App',
  components: {
    BackgroundPattern
  },
  setup(){
    const { initTheme } = useTheme();
    initTheme();
  }
})
</script>
