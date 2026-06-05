import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const JOBPREP_API_BASE_URL = import.meta.env.VITE_JOBPREP_API_BASE_URL || 'http://localhost:8081';
const SESSION_API_BASE_URL = import.meta.env.VITE_SESSION_API_BASE_URL || 'http://localhost:8082';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const jobPrepApi = axios.create({
  baseURL: JOBPREP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const sessionApi = axios.create({
  baseURL: SESSION_API_BASE_URL,
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
    jobPrepApi.post('/api/v1/interview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  getAllReports: () =>
    jobPrepApi.get('/api/v1/interview/reports'),
  
  getReport: (id: string) =>
    jobPrepApi.get(`/api/v1/interview/reports/${id}`),
};

export const sessionAPI = {
  startSession: (reportId: string) =>
    sessionApi.post('/api/v1/session/start', { reportId }),
  
  submitAnswer: (sessionId: string, answer: string) =>
    sessionApi.post('/api/v1/session/answer', { sessionId, answer }),
  
  getResults: (sessionId: string) =>
    sessionApi.get(`/api/v1/session/${sessionId}/results`),
};

export default api;
