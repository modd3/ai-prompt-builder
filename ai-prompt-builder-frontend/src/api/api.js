import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });

// Track if we're currently refreshing the token to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const token = localStorage.getItem('token');
      
      if (!token) {
        // No token available, clear auth and reject
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/auth/refresh`,
          { token }
        );

        const { token: newToken, user } = response.data;
        
        // Update stored token and user
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update authorization header
        API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        processQueue(null, newToken);
        isRefreshing = false;
        
        // Retry the original request
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Fetch prompts with optional filtering and sorting
export const fetchPrompts = (params = {}) => API.get('/prompts', { params });

// Create a new prompt
export const createPrompt = (newPrompt) => API.post('/prompts', newPrompt);

export default API;
