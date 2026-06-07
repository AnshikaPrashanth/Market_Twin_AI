import { create } from 'zustand';
import { sendEvent } from '../api/eventApi';
import { useTwinStore } from './twinStore';

export const useEventStore = create((set) => ({
  isSending: false,
  lastSentPayload: null,
  lastReceivedResponse: null,
  responseTime: null,
  error: null,

  /**
   * Fires a simulated customer event, captures duration, and tells the TwinStore to sync metrics.
   */
  triggerEvent: async (payload) => {
    set({ isSending: true, error: null });
    const startTime = Date.now();
    try {
      const response = await sendEvent(payload);
      const duration = Date.now() - startTime;

      set({
        isSending: false,
        lastSentPayload: payload,
        lastReceivedResponse: response,
        responseTime: duration
      });

      // Retrieve customer ID and force trigger metrics refresh in twinStore
      const resolvedCustomerId = response.customer_id;
      if (resolvedCustomerId) {
        useTwinStore.getState().fetchTwinData(resolvedCustomerId);
      }
      return response;
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMsg = err.response?.data?.detail || err.message;
      set({
        isSending: false,
        lastSentPayload: payload,
        error: errorMsg,
        responseTime: duration
      });
      throw err;
    }
  }
}));
