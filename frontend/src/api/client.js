import axios from 'axios';
import { useDebugStore } from '../store/debugStore';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
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
