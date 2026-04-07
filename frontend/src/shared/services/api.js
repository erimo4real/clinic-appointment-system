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
    // Get all cookies
    const allCookies = document.cookie;
    console.log('All cookies:', allCookies);
    
    const cookies = allCookies.split(';');
    for (const cookie of cookies) {
      const parts = cookie.trim().split('=');
      const name = parts[0];
      const value = parts.slice(1).join('='); // Handle values with = in them
      
      if (name === 'token') {
        const tokenValue = decodeURIComponent(value);
        console.log('Found token:', tokenValue ? 'Yes' : 'No');
        config.headers.Authorization = `Bearer ${tokenValue}`;
        break;
      }
    }
    return config;
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
