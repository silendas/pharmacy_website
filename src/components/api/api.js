import axios from 'axios';

// Membuat instance axios
const api = axios.create({
  baseURL: 'https://api-pharmacy.silendas.my.id/api', // Sesuaikan dengan URL API Anda
  headers: {
    'Content-Type': 'application/json', // Header untuk JSON
  },
  withCredentials: true, // Jika API membutuhkan credentials
});

// Interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && typeof token === 'string') {
      config.headers['Authorization'] = `Bearer ${token}`; // Menambahkan token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
