import axios from 'axios';

const baseURL = import.meta?.env?.VITE_API_BASE_URL || '';

const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo global de errores (opcional)
    return Promise.reject(error);
  }
);

export default http;
