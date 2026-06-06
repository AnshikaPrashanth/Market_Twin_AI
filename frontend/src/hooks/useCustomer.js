import { useTwinStore } from '../store/twinStore';

/**
 * Custom hook to select and read active customer profiles context.
 */
export const useCustomer = () => {
  const { customerProfile, selectedCustomerId, selectCustomer, customerList } = useTwinStore();
  return { customerProfile, selectedCustomerId, selectCustomer, customerList };
};
