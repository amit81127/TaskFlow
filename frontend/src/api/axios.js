import axios from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from '../utils/token';

// ─── Create Axios instance ────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://taskflow-jwib.onrender.com/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request Interceptor — attach access token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Track if we're already refreshing (prevents infinite loops) ──────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ─── Response Interceptor — handle 401 and auto-refresh ──────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry once on 401 (access token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip retry for auth endpoints to avoid loops
      if (originalRequest.url?.includes('/auth/')) {
        clearTokens();
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until refresh is done
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }

      try {
        // Use the shared api instance (goes through Vite proxy, same baseURL)
        const { data } = await api.post('/auth/refresh-token', { refreshToken });

        const { accessToken, refreshToken: newRefresh } = data.data;
        storeTokens({ accessToken, refreshToken: newRefresh });

        api.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
