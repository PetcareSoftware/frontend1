import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      const networkError = new Error(
        'Error de red: no se pudo conectar con el servidor. Verifique su conexión.'
      );
      networkError.isNetworkError = true;
      networkError.cause = error;
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;
    const detail =
      data?.detail ||
      data?.message ||
      (typeof data === 'string' ? data : null) ||
      error.message;

    const apiError = new Error(`Error ${status}: ${detail}`);
    apiError.status = status;
    apiError.data = data;
    apiError.isNetworkError = false;
    return Promise.reject(apiError);
  }
);

export default api;
