/**
 * Returns specific Tailwind style classes depending on the event action type.
 */
export const getEventBadgeColor = (type) => {
  switch (type) {
    case 'product_view': 
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    case 'add_to_cart': 
      return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    case 'purchase': 
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'cart_abandon': 
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default: 
      return 'bg-dark-800 text-dark-300 border-dark-700';
  }
};
