import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: { username: string; password: string }) => {
    // Create URLSearchParams for form data
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);

    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// API Keys API
export const apiKeys = {
  create: async (data: { name: string }) => {
    const response = await api.post('/api-keys', data);
    return response.data;
  },
  list: async () => {
    const response = await api.get('/api-keys');
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api-keys/${id}`);
    return response.data;
  },
};

// Wallet API
export const wallet = {
  get: async () => {
    const response = await api.get('/wallets');
    return response.data;
  },
  createTransaction: async (data: {
    type: 'credit' | 'debit';
    amount: number;
    description: string;
  }) => {
    const response = await api.post('/wallets/transactions', data);
    return response.data;
  },
  getTransactions: async () => {
    const response = await api.get('/wallets/transactions');
    return response.data;
  },
};

export default api; 