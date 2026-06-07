import { create } from "zustand";

export const useDemoStore = create((set) => ({
  latestTwin: null,
  latestProcessingResult: null,
  generatedMessage: null,
  liveEvents: [],
  demoRunning: false,
  setLatestTwin: (twin) => set({ latestTwin: twin }),
  setLatestProcessingResult: (result) => set({ latestProcessingResult: result }),
  setGeneratedMessage: (message) => set({ generatedMessage: message }),
  addLiveEvent: (event) =>
    set((state) => ({ liveEvents: [event, ...state.liveEvents].slice(0, 50) })),
  setDemoRunning: (isRunning) => set({ demoRunning: isRunning }),
  resetDemo: () =>
    set({
      latestTwin: null,
      latestProcessingResult: null,
      generatedMessage: null,
      liveEvents: [],
      demoRunning: false,
    }),
}));
