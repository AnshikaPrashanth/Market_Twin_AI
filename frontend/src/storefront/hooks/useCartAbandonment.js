import { useEffect, useRef } from 'react';
import { useTrackEvent } from './useTrackEvent';
import { useCartStore } from '../store/cartStore';

export const useCartAbandonment = (timeoutMs = 30000) => {
  const { trackEvent } = useTrackEvent();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());
  const timerRef = useRef(null);

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Reset timer on any mouse movement, keyboard interaction, or scroll
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      // Only set timer if cart has items
      if (items.length > 0) {
        timerRef.current = setTimeout(() => {
          trackEvent('cart_abandon', {
            cart_size: items.length,
            cart_value: total,
            items: items.map(i => i.id)
          });
          console.log('[Storefront] Cart abandoned event triggered automatically');
        }, timeoutMs);
      }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);

    // Initial trigger
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [items, trackEvent, timeoutMs, total]);
};
