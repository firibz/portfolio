<template>
  <q-layout view="lHh Lpr lFf">

    <q-page-container>
      <q-page class="flex flex-center">
        <div class="dynamic-background">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
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
                    v-model="appTheme"
                    :color="appTheme ? 'amber' : 'indigo-11'"
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
                <div class="relative-position" style="width: 100%; height: 60%; max-height: 400px">
                  <q-img
                    v-if="$q.dark.isActive"
                    alt="Quasar logo"
                    class="custom-rounded-borders-top fit profile-image"
                    fit="cover"
                    src="~assets/images/profile-dark-2.jpg"
                    style="width: 100%; height: 60%; max-height: 400px"
                  />
                  <q-img
                    v-else
                    alt="Quasar logo"
                    class="custom-rounded-borders-top fit profile-image"
                    fit="cover"
                    src="~assets/images/profile-light.jpg"
                    style="width: 100%; height: 60%; max-height: 400px"
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
    let language = ref("en-US");
    const $q = useQuasar();
    let appTheme = ref(true);

    let dark = JSON.parse(localStorage.getItem("dark"));
    dark = typeof dark === "boolean" ? dark : $q.dark.isActive;

    if (dark !== undefined && dark !== null) {
      appTheme.value = !dark;
      $q.dark.set(dark);
    } else {
      appTheme.value = true;
      $q.dark.set(false);
    }
    const toggleTheme = (value) => {
      $q.dark.set(!value);
      localStorage.setItem("dark", JSON.stringify(!value));
    };
    return {
      menuList,
      language,
      appTheme,
      toggleTheme,
      $q,
    }
  }
})
</script>
