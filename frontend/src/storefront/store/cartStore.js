import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  addItem: (product) => {
    const { items } = get();
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      set({ items: items.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i)) });
    } else {
      set({ items: [...items, { ...product, qty: 1 }] });
    }
  },
  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.id !== productId) });
  },
  clearCart: () => {
    set({ items: [] });
  },
  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.qty, 0);
  }
}));
