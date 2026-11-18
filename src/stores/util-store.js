import { defineStore } from "pinia";

export const useUtilStore = defineStore("util", {
  state: () => ({
    appTheme: true,
    language: "en-US",
    chapterProgress: 0,
    activeChapter: 0,
    highlightSculpture: false,
    pulseTrigger: 0,
    jumpTarget: -1,
  }),
  actions: {
    setChapterProgress(val) {
      this.chapterProgress = val;
      this.activeChapter = Math.min(4, Math.max(0, Math.round(val)));
    },
    requestChapterJump(index) {
      this.jumpTarget = index;
      this.pulseTrigger = Date.now();
    },
    clearChapterJump() {
      this.jumpTarget = -1;
    },
    triggerPulse() {
      this.pulseTrigger = Date.now();
    },
    setHighlight(on) {
      this.highlightSculpture = Boolean(on);
    },
  },
});
