import { useI18n } from "vue-i18n";
import {useQuasar} from "quasar";
import {useUtilStore} from "stores/util-store";
const langList = import.meta.glob(
  "../../node_modules/quasar/lang/(en-US|fa-IR).mjs"
);

export function useLanguage() {
  const { locale } = useI18n({ useScope: "global" });
  const $q = useQuasar();
  const utilStore = useUtilStore();

  const initLanguage = () => {
    let lang = JSON.parse(localStorage.getItem("lang"));
    if (lang) {
      changeLanguage(lang);
    }
  };
  const changeLanguage = (value) => {
    locale.value = value;
    //also handling quasar language pack
    try {
      console.log("quasar try")
      langList[`../../node_modules/quasar/lang/${value}.mjs`]().then(
        (lang) => {
          $q.lang.set(lang.default);
        }
      );
    } catch (err) {

      console.log("quasar error")
      console.log(err)
      // Requested Quasar Language Pack does not exist,
      // let's not break the app, so catching error
    } finally {
      console.log("quasar finally")
      localStorage.setItem("lang", JSON.stringify(value));
      utilStore.language = value;
    }
  };

  return { initLanguage, changeLanguage }
}
