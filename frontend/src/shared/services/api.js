import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL.replace(/\/$/, '') + '/api'
  : 'https://clinic-appointment-system-88np.onrender.com/api';

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
    const url = error.config?.url || '';
    if (error.response?.status === 401) {
      return Promise.resolve({ data: null, __authError: true });
    }
    return Promise.reject(error);
  }
);

export default api;
