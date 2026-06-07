import sys
with open('frontend/src/api/client.js', 'a') as f:
    f.write("""
export const ingestEvent = async (payload) => {
  const customerId = payload.customer_id || (payload.identifiers && payload.identifiers.device_id) || 'unknown';
  const response = await apiClient.post(`/api/nba/${customerId}/event`, payload);
  return response.data;
};

export const getCustomer = async (customerId) => {
  const response = await apiClient.get(`/api/customer/${customerId}`);
  return response.data;
};

export const getNBA = async (customerId) => {
  const response = await apiClient.get(`/api/nba/${customerId}`);
  return response.data;
};

export const getPredictiveTwin = async (customerId) => {
  const response = await apiClient.get(`/api/predictive/${customerId}`);
  return response.data;
};

export const getSegments = async () => {
  const response = await apiClient.get("/api/audience/segments");
  return response.data;
};

export const getFatigueHeatmap = async () => {
  const response = await apiClient.get("/api/audience/fatigue-heatmap");
  return response.data;
};

export const getMetricsSummary = async () => {
  const response = await apiClient.get("/api/metrics/summary");
  return response.data;
};

export const getCohortDrift = async () => {
  const response = await apiClient.get("/api/metrics/cohort-drift");
  return response.data;
};

export const generateCreative = async (payload) => {
  const response = await apiClient.post("/api/creative/generate", payload);
  return response.data;
};
""")
