<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center">
        <div class="row full-width justify-center container">
          <div class="column full-height col-xs-12 col-sm-9 col-md-12 col-xl-10">
            <div class="row full-height full-width justify-center">
              <div :class="$q.screen.lt.md ? '' : 'q-pr-sm'"
                   class="column full-height col-xs-11 col-md-1 items-end">
                <div
                  :class="$q.screen.lt.md ? 'full-width row justify-center card custom-rounded-borders-bottom' : 'column items-center card custom-rounded-borders'"
                  style="display: flex">
                  <q-list padding>
                    <MenuItem
                      v-for="item in menuList"
                      :key="item.title"
                      :title="item.title"
                      :icon="item.icon"
                      :link="item.link"
                    />
                  </q-list>
                  <q-toggle
                    v-model="utilState.appTheme"
                    :color="utilState.appTheme ? 'amber' : 'indigo-11'"
                    aria-label="switch-theme-btn"
                    checked-icon="mdi-brightness-7"
                    class="text-blue q-mb-sm"
                    keep-color
                    unchecked-icon="mdi-weather-night"
                    @update:model-value="toggleTheme"
                  />
                </div>
              </div>
              <div :class="$q.screen.lt.md ? 'order-first custom-rounded-borders-top' : 'card custom-rounded-borders'"
                   class="column full-height col-xs-11 col-md-4 items-center card card-shadow-left">
                <div class="relative-position profile-image-size">
                  <q-img
                    v-if="$q.dark.isActive"
                    alt="Quasar logo"
                    class="custom-rounded-borders-top fit profile-image profile-image-size"
                    fit="cover"
                    src="~assets/images/profile-dark-2.jpg"
                  />
                  <q-img
                    v-else
                    alt="Quasar logo"
                    class="custom-rounded-borders-top fit profile-image profile-image-size"
                    fit="cover"
                    src="~assets/images/profile-light.jpg"
                  />
                </div>

              </div>
              <div class="column full-height col-xs-11 col-md-6 overflow-hidden q-py-md">
                <router-view v-slot="{ Component }">
                  <transition
                    :enter-active-class="
                      $q.screen.lt.md ? 'animated slideInDown':
                      (language === 'en-US'
                        ? 'animated slideInLeft'
                        : 'animated slideInRight')
                    "
                    :leave-active-class="
                      $q.screen.lt.md ? 'animated slideOutUp':
                      (language === 'en-US'
                        ? 'animated slideOutLeft'
                        : 'animated slideOutRight')
                    "
                    mode="out-in"
                  >
                    <component :is="Component"/>
                  </transition>
                </router-view>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import {defineComponent, ref} from 'vue'
import {useQuasar} from "quasar";
import {useTheme} from "src/composables/theme";
import {useUtilStore} from "stores/util-store";
import MenuItem from 'components/MenuItem.vue'

const menuList = [
  {
    title: 'About',
    icon: 'mdi-badge-account-horizontal',
    link: '/about'
  },
  {
    title: 'Works',
    icon: 'mdi-code-tags',
    link: '/works'
  },
  // {
  //   title: 'Resume',
  //   icon: 'article',
  //   link: '/'
  // },
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    MenuItem
  },

  setup() {
    const $q = useQuasar();
    const { toggleTheme } = useTheme();
    const utilStore = useUtilStore();
    let language = ref("en-US");

    return {
      menuList,
      $q,
      language,
      utilState: utilStore.$state,
      toggleTheme,
    }
  }
})
</script>
