import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL.replace(/\/$/, '') + '/api'
  : 'https://clinic-appointment-system-88np.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const parts = cookie.trim().split('=');
      const name = parts[0];
      const value = parts.slice(1).join('=');
      
      if (name === 'token') {
        config.headers.Authorization = `Bearer ${decodeURIComponent(value)}`;
        break;
      }
    }
    return config;
  }
);

export default api;
