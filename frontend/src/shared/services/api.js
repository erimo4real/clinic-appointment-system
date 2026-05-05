import axios from 'axios';

const base = process.env.REACT_APP_API_URL || 'https://clinic-appointment-system-88np.onrender.com';
const API_URL = base.replace(/\/$/, '') + (base.includes('/api') ? '' : '/api');

const getToken = () => {
  const cookies = document.cookie.split(';');
  let token = null;
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if ((name === 'token' || name === 'auth_token') && value) {
      token = value;
      break;
    }
  }
  return token;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && token.length > 0) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      const url = error.config?.url || '';
      if (url !== '/auth/me' && url !== '/auth/refresh-token') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
