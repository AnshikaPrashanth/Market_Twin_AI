import sys
content = open('frontend/src/api/eventApi.js', 'r').read()
content = content.replace(
'''export const sendEvent = async (payload) => {
  const response = await apiClient.post('/api/event', payload);
  return response.data;
};''',
'''export const sendEvent = async (payload) => {
  const customerId = payload.customer_id || (payload.identifiers && payload.identifiers.device_id) || "unknown";
  const response = await apiClient.post(`/api/nba/${customerId}/event`, payload);
  return response.data;
};'''
)
open('frontend/src/api/eventApi.js', 'w').write(content)
