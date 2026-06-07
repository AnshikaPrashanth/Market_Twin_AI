import sys
content = open('frontend/src/api/client.js', 'r').read()
content = content.replace(
'''export const ingestEvent = async (payload) => {
  const response = await apiClient.post("/api/event", payload);
  return response.data;
};''',
'''export const ingestEvent = async (payload) => {
  const customerId = payload.customer_id || (payload.identifiers && payload.identifiers.device_id) || "unknown";
  const response = await apiClient.post(`/api/nba/${customerId}/event`, payload);
  return response.data;
};'''
)
open('frontend/src/api/client.js', 'w').write(content)
