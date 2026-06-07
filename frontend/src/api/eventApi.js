import apiClient from './client';

/**
 * Fires a customer event payload to the FastAPI backend ingestion endpoint.
 * @param {Object} payload 
 * @returns {Promise<Object>}
 */
export const sendEvent = async (payload) => {
  const customerId = payload.customer_id || (payload.identifiers && payload.identifiers.device_id) || "unknown";
  const response = await apiClient.post(`/api/nba/${customerId}/event`, payload);
  return response.data;
};
