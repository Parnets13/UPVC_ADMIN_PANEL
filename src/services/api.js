import axios from 'axios';
import { API_CONFIG } from '../config/config';

const API_BASE_URL = API_CONFIG.BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Normalize URL to avoid double /api (e.g., BASE_URL ends with /api and path starts with /api)
    if (typeof config.url === 'string') {
      const baseEndsWithApi = (api.defaults.baseURL || '').endsWith('/api');
      const pathStartsWithApi = config.url.startsWith('/api/');
      if (baseEndsWithApi && pathStartsWithApi) {
        config.url = config.url.replace(/^\/api\//, '/');
      }
    }

    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, let the browser set the Content-Type with boundary
    if (config.data instanceof FormData) {
      if (config.headers && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    } else {
      // Default JSON for non-FormData requests
      config.headers = config.headers || {};
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

