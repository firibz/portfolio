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
                  :class="$q.screen.lt.md ? 'full-width row justify-center items-center card custom-rounded-borders-bottom q-pb-sm q-px-xs' : 'column items-center card menu-borders'"
                  style="display: flex">
                  <q-btn-toggle
                    v-model="utilState.language"
                    :class="$q.screen.lt.md ? 'q-mr-xs': 'q-mb-sm'"
                    :flat="$q.dark.isActive"
                    :options="[
                      { label: 'En', value: 'en-US' },
                      { label: 'Fa', value: 'fa-IR' },
                    ]"
                    class="text-bold"
                    color="section"
                    dense
                    glossy
                    no-caps
                    padding="4px 13px"
                    rounded
                    style="height: 32px;"
                    text-color="system-text"
                    toggle-color="green-11"
                    toggle-text-color="system-green"
                    @update:model-value="changeLanguage"
                  />
                  <q-list :class="$q.screen.lt.md ? '': 'full-width'">
                    <menu-item
                      v-for="item in menuList"
                      :key="item.title"
                      :icon="item.icon"
                      :link="item.link"
                      :title="item.title"
                    />
                  </q-list>
                  <q-toggle
                    v-model="utilState.appTheme"
                    :class="$q.screen.lt.md ? 'q-ml-xs': 'q-my-sm'"
                    :color="utilState.appTheme ? 'amber' : 'indigo-11'"
                    aria-label="switch-theme-btn"
                    checked-icon="mdi-brightness-7"
                    class="text-blue"
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
                <div class="column full-width text-center justify-between">
                  <span class="text-h4 q-mt-sm">Fariborz Korevli</span>
                  <span style="letter-spacing: 1px" class="text-h6 text-system-green q-mt-sm">Front-end developer</span>
                  <div class="text-center q-mt-md">
                    <q-btn v-for="socialItem in SocialMediaItems" :key="socialItem.name"
                           class="q-pa-xs team-btn relative-position q-mx-sm"
                           dense
                           flat
                           glossy
                           :icon="socialItem.icon"
                           target="_blank"
                           :href="socialItem.link"/>
                  </div>
                  <hr class="q-mt-xl full-width section-hr"/>
                  <q-btn label="Download Resume" icon="mdi-cloud-download" class="download-btn" flat/>
                  <hr v-if="$q.screen.lt.md" class="q-mb-lg full-width section-hr"/>
                </div>

              </div>
              <div class="column col-xs-11 col-md-6 overflow-hidden q-py-md">
                <router-view v-slot="{ Component }">
                  <transition
                    :enter-active-class="
                      $q.screen.lt.md ? 'animated slideInDown':
                      (utilState.language === 'en-US'
                        ? 'animated slideInLeft'
                        : 'animated slideInRight')
                    "
                    :leave-active-class="
                      $q.screen.lt.md ? 'animated slideOutUp':
                      (utilState.language === 'en-US'
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
import {defineComponent, computed} from 'vue'
import {useI18n} from "vue-i18n";
import {useLanguage} from "src/composables/language";
import {useTheme} from "src/composables/theme";
import {useUtilStore} from "stores/util-store";
import MenuItem from 'components/MenuItem.vue'

const SocialMediaItems = [
  {
    name: 'Linkedin',
    link: 'https://www.linkedin.com/in/firibz',
    icon: 'mdi-linkedin',
  },
  {
    name: 'Telegram',
    link: 'https://t.me/Firibz',
    icon: 'mdi-telegram',
  },
  {
    name: 'Skype',
    link: 'https://join.skype.com/invite/y2tGW8Op16dm',
    icon: 'mdi-skype',
  },
  {
    name: 'StackOverflow',
    link: 'https://stackoverflow.com/users/8755786/fariborz-korevli',
    icon: 'mdi-stack-overflow',
  },
  {
    name: 'Github',
    link: 'https://github.com/firibz',
    icon: 'mdi-github',
  },
]
export default defineComponent({
  name: 'MainLayout',
  components: {
    MenuItem
  },

  setup() {
    const utilStore = useUtilStore();
    const {t} = useI18n({ useScope: "global" });
    const menuList = computed(() => {
      return [
        {
          title: t("about"),
          icon: 'mdi-badge-account-horizontal',
          link: '/'
        },
        {
          title: t('works'),
          icon: 'mdi-code-tags',
          link: '/works'
        },
        // {
        //   title: 'Resume',
        //   icon: 'article',
        //   link: '/'
        // },
      ];
    });
    const {changeLanguage} = useLanguage();
    const {toggleTheme} = useTheme();

    return {
      SocialMediaItems,
      menuList,
      utilState: utilStore.$state,
      t,
      changeLanguage,
      toggleTheme,
    }
  }
})
</script>
