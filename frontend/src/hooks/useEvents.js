import { useTwinStore } from '../store/twinStore';

/**
 * Custom hook to retrieve the current active customer event history.
 */
export const useEvents = () => {
  const { eventsList } = useTwinStore();
  return { eventsList };
};
