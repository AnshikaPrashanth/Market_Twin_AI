import apiClient from './client';

export const getCustomers = async () => {
  const response = await apiClient.get('/api/customers');
  return response.data;
};

/**
 * Retrieves profile demographics details for a specific customer ID.
 */
export const getCustomer = async (customerId) => {
  const response = await apiClient.get(`/api/customer/${customerId}`);
  return response.data;
};

/**
 * Retrieves the live digital twin state details for a customer ID.
 */
export const getCustomerTwin = async (customerId) => {
  const response = await apiClient.get(`/api/customer/${customerId}/twin`);
  return response.data;
};

/**
 * Retrieves all historically ingested events associated with a customer ID.
 */
export const getCustomerEvents = async (customerId) => {
  const response = await apiClient.get(`/api/customer/${customerId}/events`);
  return response.data;
};
