import axios from 'axios';

import { STORAGE_KEYS } from '../utils/constants.js';

// Auth uses the Authorization header instead of cookies, so there is no CSRF surface.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
  timeout: 15_000,
});

// Read the token on every request so a logout in another tab takes effect right away.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      // Skip the redirect on /login itself, otherwise a failed login would loop.
      const onLoginPage = window.location.pathname.startsWith('/login');
      if (!onLoginPage) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
