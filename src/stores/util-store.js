import { defineStore } from "pinia";

export const useUtilStore = defineStore("util", {
  state: () => ({
    appTheme: true,
    language: "en-US",
    sceneMode: "matrix", // 'orbital' | 'matrix' | 'nebula'
    activeSection: "about", // 'about' | 'works'
    hoveredWorkIndex: -1,
    selectedWorkImage: "images/works/0 Staking and NFT landing sample/0.webp",
    selectedWorkTitle: "stakingAndNFTLandingWeb3Website",
    pulseTrigger: 0,
  }),
  actions: {
    setSceneMode(mode) {
      this.sceneMode = mode;
      this.pulseTrigger = Date.now();
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
