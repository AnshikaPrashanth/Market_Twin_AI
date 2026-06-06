import { useTwinStore } from '../store/twinStore';

/**
 * Custom hook to interact with selected digital twin values and loading states.
 */
export const useTwin = () => {
  const { twinState, isLoading, error, fetchTwinData } = useTwinStore();
  return { twinState, isLoading, error, fetchTwinData };
};
