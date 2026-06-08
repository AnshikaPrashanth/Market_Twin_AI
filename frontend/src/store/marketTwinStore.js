import { create } from 'zustand';
import * as api from '../api/client';

export const useMarketTwinStore = create((set, get) => ({
  // State Fields
  customer: null,
  currentCustomerId: null,
  demoDeviceId: "D88",

  products: [],
  cart: null,

  latestTwin: null,
  latestProcessingResult: null,
  latestGeneratedMessage: null,

  liveEvents: [],
  metricsSummary: null,

  demoRunning: false,
  loading: false,
  error: null,

  // Actions
  setError: (error) => set({ error: typeof error === 'string' ? error : (error?.message || null) }),
  
  clearError: () => set({ error: null }),
  
  setDemoRunning: (value) => set({ demoRunning: value }),
  
  clearLiveEvents: () => set({ liveEvents: [] }),
  
  resetDemoState: () => set({
    customer: null,
    currentCustomerId: null,
    products: [],
    cart: null,
    latestTwin: null,
    latestProcessingResult: null,
    latestGeneratedMessage: null,
    liveEvents: [],
    metricsSummary: null,
    error: null,
    demoRunning: false
  }),

  hydrateFromReset: (resetResponse) => {
    if (!resetResponse) return;
    set({
      customer: resetResponse.customer,
      currentCustomerId: resetResponse.customer?.customer_id || null,
      latestTwin: resetResponse.twin || null,
      cart: resetResponse.cart || { status: 'empty', items: [], cart_value: 0 },
      latestGeneratedMessage: resetResponse.latest_message || null,
      liveEvents: [],
      latestProcessingResult: null,
    });
  },

  setProducts: (productsResponse) => {
    if (!productsResponse) return;
    const products = Array.isArray(productsResponse) ? productsResponse : productsResponse.products || [];
    set({ products });
  },

  setCart: (cart) => set({ cart }),

  setLatestMessage: (messageResponse) => {
    if (!messageResponse) {
      set({ latestGeneratedMessage: null });
      return;
    }
    const msg = messageResponse.generated_message !== undefined ? messageResponse.generated_message : messageResponse;
    set({ latestGeneratedMessage: msg });
  },

  normalizeEventResult: (result) => {
    if (!result) return null;
    return result.event_result || result;
  },

  setProcessingResult: (result, originalPayload = null) => {
    if (!result) return;
    
    const store = get();
    let currentCustomerId = store.currentCustomerId;

    if (result.cart) {
      set({ cart: result.cart });
    }

    const eventResult = get().normalizeEventResult(result);
    if (!eventResult) return;

    const latestTwin = eventResult.updated_twin || eventResult.twin || null;
    currentCustomerId = eventResult.customer_id || latestTwin?.customer_id || currentCustomerId;

    let newLatestGeneratedMessage = store.latestGeneratedMessage;
    
    if ('generated_message' in eventResult) {
      newLatestGeneratedMessage = eventResult.generated_message;
    } else if (result.latest_message !== undefined) {
      newLatestGeneratedMessage = result.latest_message?.generated_message || result.latest_message;
    }

    const newEvent = {
      id: eventResult.event_id || crypto.randomUUID(),
      event_type: eventResult.event_type || originalPayload?.event_type || "event_processed",
      source: eventResult.source || originalPayload?.source || "unknown",
      customer_id: eventResult.customer_id || currentCustomerId || "unknown_customer",
      product_id: originalPayload?.properties?.product_id || originalPayload?.product_id || null,
      product_name: originalPayload?.properties?.product_name || originalPayload?.product_name || null,
      final_action: eventResult.final_action || null,
      final_channel: eventResult.final_channel || null,
      nba_action: eventResult.nba_decision?.action || null,
      timestamp: eventResult.timestamp || new Date().toISOString()
    };

    set((state) => {
      let nextEvents = state.liveEvents;
      // Only append if the event belongs to the currently active customer
      if (currentCustomerId && newEvent.customer_id === currentCustomerId) {
        nextEvents = [newEvent, ...state.liveEvents];
      }
      return {
        latestTwin,
        latestProcessingResult: eventResult,
        currentCustomerId,
        latestGeneratedMessage: newLatestGeneratedMessage,
        liveEvents: nextEvents
      };
    });
  },

  initializeDemo: async () => {
    set({ loading: true, error: null });
    try {
      const resetResponse = await api.resetDemo();
      get().hydrateFromReset(resetResponse);
      
      const currentCustomerId = get().currentCustomerId;
      if (!currentCustomerId) throw new Error("Initialization failed: no customer_id returned from reset.");

      await get().loadProductsIfNeeded();

      const cartRes = await api.getCart(currentCustomerId);
      get().setCart(cartRes);

      const latestMsgRes = await api.getLatestMessage(currentCustomerId);
      get().setLatestMessage(latestMsgRes);

    } catch (err) {
      get().setError(err);
    } finally {
      set({ loading: false });
    }
  },

  loadProductsIfNeeded: async () => {
    if (get().products.length > 0) return;
    try {
      const productsRes = await api.getProducts();
      get().setProducts(productsRes);
    } catch (err) {
      get().setError(err);
    }
  },

  loginAsCustomer: async (customerId) => {
    set({ loading: true, error: null });
    try {
      const profile = await api.getCustomerProfile(customerId);
      const twin = await api.getCustomerTwin(customerId);
      const events = await api.getCustomerEvents(customerId);
      const cart = await api.getCart(customerId);
      const latestMsg = await api.getLatestMessage(customerId);

      set({
        currentCustomerId: customerId,
        customer: profile,
        latestTwin: twin,
        liveEvents: events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)), // reverse chronological
        cart: cart || { status: 'empty', items: [], cart_value: 0 },
        latestGeneratedMessage: latestMsg?.generated_message || latestMsg || null,
        latestProcessingResult: null
      });
    } catch (err) {
      get().setError(err);
    } finally {
      set({ loading: false });
    }
  },

  refreshCart: async () => {
    const currentCustomerId = get().currentCustomerId;
    if (!currentCustomerId) return;
    try {
      const cartRes = await api.getCart(currentCustomerId);
      get().setCart(cartRes);
    } catch (err) {
      console.error(err);
    }
  },

  refreshLatestMessage: async () => {
    const currentCustomerId = get().currentCustomerId;
    if (!currentCustomerId) return;
    try {
      const msgRes = await api.getLatestMessage(currentCustomerId);
      get().setLatestMessage(msgRes);
    } catch (err) {
      console.error(err);
    }
  },

  refreshMetrics: async () => {
    try {
      const metricsSummary = await api.getMetricsSummary();
      set({ metricsSummary });
    } catch (err) {
      console.error(err);
    }
  }

}));
