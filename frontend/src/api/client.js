import axios from 'axios';
import { useDebugStore } from '../store/debugStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor: attach timestamp to calculate response duration
apiClient.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };
    const logMsg = `[API Request] ${config.method.toUpperCase()} ${config.url}`;
    useDebugStore.getState().addLog(logMsg);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: evaluate duration and save raw logs / JSON responses
apiClient.interceptors.response.use(
  (response) => {
    const startTime = response.config.metadata.startTime;
    const duration = Date.now() - startTime;
    response.duration = duration; // Save duration on response

    const method = response.config.method.toUpperCase();
    const url = response.config.url;
    const status = response.status;

    // Log event in debug store
    const logMsg = `[API Response] ${method} ${url} | Status: ${status} | Latency: ${duration}ms`;
    useDebugStore.getState().addLog(logMsg);
    useDebugStore.getState().setRawResponse(url, response.data);

    return response;
  },
  (error) => {
    const config = error.config || {};
    const startTime = config.metadata ? config.metadata.startTime : null;
    const duration = startTime ? Date.now() - startTime : 0;
    
    const method = config.method ? config.method.toUpperCase() : 'REQ';
    const url = config.url || '';
    const status = error.response ? error.response.status : 'Network Fail';

    const logMsg = `[API Failure] ${method} ${url} | Status: ${status} | Latency: ${duration}ms`;
    useDebugStore.getState().addLog(logMsg);
    
    if (error.response) {
      useDebugStore.getState().setRawResponse(url, error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

const handleApiError = (error, path) => {
  const status = error.response ? error.response.status : 'Network Fail';
  const message = error.response?.data?.detail || error.message || 'Unknown error';
  throw new Error(`API error ${status} at ${path}: ${message}`);
};

export const resetDemo = async () => {
  try {
    const res = await apiClient.post('/api/demo/reset');
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/demo/reset');
  }
};

export const getAllCustomers = async () => {
  try {
    const res = await apiClient.get('/api/customers');
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/customers');
  }
};

export const getCustomerProfile = async (customerId) => {
  try {
    const res = await apiClient.get(`/api/customer/${customerId}`);
    return res.data;
  } catch (error) {
    handleApiError(error, `/api/customer/${customerId}`);
  }
};

export const getCustomerTwin = async (customerId) => {
  try {
    const res = await apiClient.get(`/api/customer/${customerId}/twin`);
    return res.data;
  } catch (error) {
    handleApiError(error, `/api/customer/${customerId}/twin`);
  }
};

export const getCustomerEvents = async (customerId) => {
  try {
    const res = await apiClient.get(`/api/customer/${customerId}/events`);
    return res.data;
  } catch (error) {
    handleApiError(error, `/api/customer/${customerId}/events`);
  }
};

export const registerCustomer = async (payload) => {
  try {
    const res = await apiClient.post('/api/auth/register', payload);
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/auth/register');
  }
};

export const loginCustomer = async (payload) => {
  try {
    const res = await apiClient.post('/api/auth/login', payload);
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/auth/login');
  }
};

export const getProducts = async () => {
  try {
    const res = await apiClient.get('/api/products');
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/products');
  }
};

export const getCart = async (customerId) => {
  try {
    const res = await apiClient.get(`/api/cart/${customerId}`);
    return res.data;
  } catch (error) {
    handleApiError(error, `/api/cart/${customerId}`);
  }
};

export const addToCart = async (customerId, productId) => {
  try {
    const res = await apiClient.post('/api/cart/add', { customer_id: customerId, product_id: productId });
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/cart/add');
  }
};

export const removeFromCart = async (customerId, productId) => {
  try {
    const res = await apiClient.post('/api/cart/remove', { customer_id: customerId, product_id: productId });
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/cart/remove');
  }
};

export const abandonCart = async (customerId) => {
  try {
    const res = await apiClient.post('/api/cart/abandon', { customer_id: customerId });
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/cart/abandon');
  }
};

export const purchaseCart = async (customerId) => {
  try {
    const res = await apiClient.post('/api/cart/purchase', { customer_id: customerId });
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/cart/purchase');
  }
};

export const ingestEvent = async (payload) => {
  try {
    const res = await apiClient.post('/api/event', payload);
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/event');
  }
};

export const getLatestMessage = async (customerId) => {
  try {
    const res = await apiClient.get(`/api/messages/latest/${customerId}`);
    return res.data;
  } catch (error) {
    handleApiError(error, `/api/messages/latest/${customerId}`);
  }
};

export const reactToMessage = async (customerId, reaction) => {
  try {
    const res = await apiClient.post('/api/messages/react', { customer_id: customerId, reaction });
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/messages/react');
  }
};

export const getMetricsSummary = async () => {
  try {
    const res = await apiClient.get('/api/metrics/summary');
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/metrics/summary');
  }
};

export const getAudienceSegments = async () => {
  try {
    const res = await apiClient.get('/api/audience/segments');
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/audience/segments');
  }
};

export const getFatigueHeatmap = async () => {
  try {
    const res = await apiClient.get('/api/audience/fatigue-heatmap');
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/audience/fatigue-heatmap');
  }
};

export const getCohortDrift = async () => {
  try {
    const res = await apiClient.get('/api/metrics/cohort-drift');
    return res.data;
  } catch (error) {
    handleApiError(error, '/api/metrics/cohort-drift');
  }
};

export const getPredictiveTwin = async (customerId) => {
  try {
    const res = await apiClient.get(`/api/predictive/${customerId}`);
    return res.data;
  } catch (error) {
    handleApiError(error, `/api/predictive/${customerId}`);
  }
};
