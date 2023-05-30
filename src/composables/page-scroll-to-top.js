// event.js
import { onMounted } from 'vue'
import { scroll } from 'quasar'
const { getScrollTarget, setVerticalScrollPosition } = scroll
function scrollToElement (el) {
  const target = getScrollTarget(el)
  const offset = 0
  const duration = 1
  setVerticalScrollPosition(target, offset, duration)
}
export function usePageScrollToTop() {
  onMounted(() => {
    const element = document.getElementById("top-of-page")
    scrollToElement(element)
  })
}
