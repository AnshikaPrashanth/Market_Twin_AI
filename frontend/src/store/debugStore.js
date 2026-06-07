import { create } from 'zustand';

export const useDebugStore = create((set) => ({
  logs: [`[Console] System monitor initialized at ${new Date().toLocaleTimeString()}`],
  rawResponses: {},

  /**
   * Appends a log line to the scrolling monitoring console.
   */
  addLog: (log) => set((state) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${log}`;
    // Cap at 100 entries to maintain high performance
    const nextLogs = [...state.logs, formatted].slice(-100);
    return { logs: nextLogs };
  }),

  /**
   * Saves the raw JSON response payload corresponding to an API endpoint URL.
   */
  setRawResponse: (url, data) => set((state) => ({
    rawResponses: {
      ...state.rawResponses,
      [url]: data
    }
  })),

  /**
   * Resets all logs.
   */
  clearLogs: () => set({ logs: [] })
}));
