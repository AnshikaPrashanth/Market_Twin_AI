import apiClient from './client';

/**
 * Fires a customer event payload to the FastAPI backend ingestion endpoint.
 * @param {Object} payload 
 * @returns {Promise<Object>}
 */
export const sendEvent = async (payload) => {
  const response = await apiClient.post('/api/event', payload);
  return response.data;
};
