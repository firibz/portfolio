<template>
  <q-item
    v-ripple
    class="q-my-sm drawer-item"
    :class="$q.screen.lt.md ? 'inline-block q-mx-xs' : 'q-my-sm'"
    :to="link"
    active-class="text-system-green"
    clickable
    exact
  >
    <q-item-section class="text-center">
      <q-item-label>
        <q-icon :name="icon" size="md"/>
      </q-item-label>
      <q-item-label class="text-caption text-bold">{{ title }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MenuItem',
  props: {
    title: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: '#'
    },
    icon: {
      type: String,
      default: ''
    }
  }
})
</script>
