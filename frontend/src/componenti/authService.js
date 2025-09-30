import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth';

// Interceptor per aggiungere il token alle richieste
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => 
    axios.post(`${API_URL}/login`, { email, password }),

  register: (userData) => 
    axios.post(`${API_URL}/register`, userData),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};