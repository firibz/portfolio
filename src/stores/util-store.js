import { defineStore } from 'pinia';

export const useUtilStore = defineStore('util', {
  state: () => ({
    // counter: 0,
    appTheme: true,
  }),
  getters: {
    // doubleCount: (state) => state.counter * 2,
  },
  actions: {
    // increment() {
    //   this.counter++;
    // },
  },
});
