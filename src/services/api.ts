import axios from 'axios';

// Create central Axios instance with a base URL
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token dynamically from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('research_pilot_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for intercepting auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we receive a 401 Unauthorized, automatically log out by clearing token
    if (error.response && error.response.status === 401) {
      console.warn('[API Interceptor] Received 401. Logging out...');
      localStorage.removeItem('research_pilot_token');
      // Only reload if we are inside a protected session to avoid login/signup loops
      const path = window.location.pathname;
      if (path !== '/' && path !== '/login' && path !== '/signup') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);
