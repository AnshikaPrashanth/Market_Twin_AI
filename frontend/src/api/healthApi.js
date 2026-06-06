import apiClient from './client';

/**
 * Checks system server and SQLite DB status.
 * @returns {Promise<Object>}
 */
export const getHealth = async () => {
  const response = await apiClient.get('/api/health');
  return response.data;
};
