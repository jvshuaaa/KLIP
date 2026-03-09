import axios from 'axios';

// The backend API root. Set VITE_API_URL in your .env (e.g http://localhost:8000)
// When empty, fall back to the default development port where artisan serve runs.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json',
  },
});

// Use Bearer token auth for API requests (no cookie-based session required)
api.defaults.withCredentials = false;

// Add bearer token to every request if it exists in localStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Avoid stale browser/proxy cache for dynamic API reads (user/profile/lists).
  if ((config.method || 'get').toLowerCase() === 'get') {
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers.Pragma = 'no-cache';
    config.headers.Expires = '0';
    config.params = {
      ...(config.params || {}),
      _t: Date.now(),
    };
  }

  return config;
});

// Intercept responses to handle authentication errors
api.interceptors.response.use(
  response => response,
  error => {
    // For 401 errors, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user_role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
