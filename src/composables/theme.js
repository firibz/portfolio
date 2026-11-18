import { useQuasar } from "quasar";
import { useUtilStore } from "stores/util-store";

export function useTheme() {
  const $q = useQuasar();
  const utilStore = useUtilStore();

  const initTheme = () => {
    let savedDark = null;
    try {
      const raw = localStorage.getItem("dark");
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "boolean") {
          savedDark = parsed;
        }
      }
    } catch (e) {
      savedDark = null;
    }

    const isDark =
      typeof savedDark === "boolean" ? savedDark : Boolean($q.dark.isActive);
    utilStore.appTheme = !isDark;
    $q.dark.set(isDark);
  };

  const toggleTheme = (value) => {
    const isLight = Boolean(value);
    const isDark = !isLight;
    utilStore.appTheme = isLight;
    $q.dark.set(isDark);
    try {
      localStorage.setItem("dark", JSON.stringify(isDark));
    } catch (e) {
      // Ignore storage quota / privacy mode errors
    }
  };

  return { initTheme, toggleTheme };
}
