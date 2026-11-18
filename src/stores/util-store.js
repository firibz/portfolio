import { defineStore } from "pinia";

const VALID_SCENE_MODES = ["orbital", "matrix", "nebula"];

function getSavedSceneMode() {
  try {
    const saved = localStorage.getItem("sceneMode");
    if (saved && VALID_SCENE_MODES.includes(saved)) {
      return saved;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return "matrix";
}

export const useUtilStore = defineStore("util", {
  state: () => ({
    appTheme: true,
    language: "en-US",
    sceneMode: getSavedSceneMode(), // 'orbital' | 'matrix' | 'nebula'
    activeSection: "about", // 'about' | 'works'
    hoveredWorkIndex: -1,
    selectedWorkImage: "images/works/0 Staking and NFT landing sample/0.webp",
    selectedWorkTitle: "stakingAndNFTLandingWeb3Website",
    pulseTrigger: 0,
  }),
  actions: {
    setSceneMode(mode) {
      if (!VALID_SCENE_MODES.includes(mode)) return;
      this.sceneMode = mode;
      this.pulseTrigger = Date.now();
      try {
        localStorage.setItem("sceneMode", mode);
      } catch (e) {
        // Ignore storage errors
      }
    },
    triggerPulse() {
      this.pulseTrigger = Date.now();
    },
    setHoveredWork(index, image, title) {
      this.hoveredWorkIndex = index;
      if (image) this.selectedWorkImage = image;
      if (title) this.selectedWorkTitle = title;
    },
  },
});
