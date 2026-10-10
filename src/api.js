import axios from 'axios';

// One axios instance for the whole app. Change VITE_API_URL in .env to point
// at a deployed backend (Render) instead of localhost.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const TOKEN_KEY = 'medibot-token';
export const USER_KEY = 'medibot-user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
};
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
};

const api = axios.create({ baseURL: API_URL });

// Every request carries the login token.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired/invalid token sends the user back to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
