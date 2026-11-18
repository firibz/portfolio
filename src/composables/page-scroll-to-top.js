import { onMounted } from "vue";
import { scroll } from "quasar";

const { setVerticalScrollPosition } = scroll;

export function smoothScrollSectionToTop(scrollWindowOnMobile = false) {
  const sectionEl = document.getElementById("top-of-page");
  if (!sectionEl) return;

  // Smoothly scroll the desktop inner section container to top
  if (sectionEl.scrollTop > 0) {
    setVerticalScrollPosition(sectionEl, 0, 420);
  }

  // On mobile/tablet (< 1024px), smoothly bring the top of the section into view on route navigation
  if (scrollWindowOnMobile && window.innerWidth < 1024) {
    const targetTop = Math.max(
      0,
      sectionEl.getBoundingClientRect().top + window.scrollY - 14
    );
    setVerticalScrollPosition(window, targetTop, 450);
  }
}

export function usePageScrollToTop() {
  onMounted(() => {
    smoothScrollSectionToTop(false);
  });
}
