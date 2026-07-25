import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('localhost')
    ? 'http://localhost:3000'
    : 'https://prepbot-api-gateway.onrender.com');

const api = axios.create({
  baseURL: GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const jobPrepApi = axios.create({
  baseURL: `${GATEWAY_URL}/api/v1/jobprep`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const sessionApi = axios.create({
  baseURL: `${GATEWAY_URL}/api/v1/session`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

jobPrepApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

sessionApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

jobPrepApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

sessionApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post('/api/v1/auth/register', { username, email, password }),
  
  login: (email: string, password: string) =>
    api.post('/api/v1/auth/login', { email, password }),
  
  logout: () =>
    api.get('/api/v1/auth/logout'),
  
  getMe: () =>
    api.get('/api/v1/auth/getMe'),
};

export const jobPrepAPI = {
  generateReport: (formData: FormData) =>
    jobPrepApi.post('/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  getAllReports: () =>
    jobPrepApi.get('/reports'),
  
  getReport: (id: string) =>
    jobPrepApi.get(`/reports/${id}`),

  deleteReport: (id: string) =>
    jobPrepApi.delete(`/reports/${id}`),
};

export const sessionAPI = {
  startSession: (reportId: string) =>
    sessionApi.post('/start', { reportId }),
  
  submitAnswer: (sessionId: string, answer: string) =>
    sessionApi.post('/answer', { sessionId, answer }),
  
  getResults: (sessionId: string) =>
    sessionApi.get(`/${sessionId}/results`),

  getSessionByReport: (reportId: string) =>
    sessionApi.get(`/report/${reportId}`),

  deleteSessionByReport: (reportId: string) =>
    sessionApi.delete(`/report/${reportId}`),
};

export default api;
