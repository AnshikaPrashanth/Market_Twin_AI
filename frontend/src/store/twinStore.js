import { create } from 'zustand';
import { getCustomer, getCustomerTwin, getCustomerEvents, getCustomers } from '../api/customerApi';
import { useDebugStore } from './debugStore';

export const useTwinStore = create((set, get) => {
  let pollingTimer = null;

  return {
    selectedCustomerId: 'CUST_001',
    customerProfile: null,
    twinState: null,
    eventsList: [],
    customerList: [], // Dynamically loaded list of customer IDs
    dashboardMetrics: null,
    isLoading: false,
    error: null,

    /**
     * Fetches dashboard metrics
     */
    fetchMetricsData: async () => {
      try {
        const { getMetricsSummary } = await import('../api/client');
        const metrics = await getMetricsSummary();
        set({ dashboardMetrics: metrics });
      } catch (err) {
        console.error('Failed to fetch metrics', err);
      }
    },

    /**
     * Retrieves all customer profiles to populate lists.
     */
    fetchCustomersList: async () => {
      try {
        const data = await getCustomers();
        const ids = data.map((c) => c.customer_id);
        set({ customerList: ids });
      } catch (err) {
        console.error('Failed to fetch customers list', err);
      }
    },

    /**
     * Swaps the active customer context and fetches details immediately.
     */
    selectCustomer: (customerId) => {
      set({ selectedCustomerId: customerId, error: null });
      get().fetchTwinData(customerId);
    },

    /**
     * Triggers concurrent profile, digital twin, and event log requests.
     */
    fetchTwinData: async (customerId) => {
      const targetId = customerId || get().selectedCustomerId;
      if (!targetId) return;

      // Prevent loading spinner flashes during background updates
      const isInitial = !get().twinState;
      if (isInitial) {
        set({ isLoading: true });
      }

      // Fetch the full customer list in parallel to keep it updated dynamically
      get().fetchCustomersList();

      try {
        const [profile, twin, events] = await Promise.all([
          getCustomer(targetId),
          getCustomerTwin(targetId),
          getCustomerEvents(targetId)
        ]);

        set({
          customerProfile: profile,
          twinState: twin,
          eventsList: events,
          isLoading: false,
          error: null
        });
      } catch (err) {
        const errorMsg = err.response?.data?.detail || err.message;
        set({
          error: `Error syncing customer data: ${errorMsg}`,
          isLoading: false
        });
      }
    },

    /**
     * Periodically updates customer twin parameters in the background to simulate real-time metrics.
     */
    startPolling: () => {
      if (pollingTimer) return;
      console.log("Polling started: 60s interval");
      pollingTimer = setInterval(() => {
        get().fetchTwinData();
      }, 60000);
      useDebugStore.getState().addLog('[Sync Engine] Background polling sync active.');
    },

    /**
     * Halts background polling timer.
     */
    stopPolling: () => {
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
        useDebugStore.getState().addLog('[Sync Engine] Background polling sync suspended.');
      }
    }
  };
});
