import { authAPI } from './api';
import type { User, AuthResponse } from '../types';

export const authService = {
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await authAPI.register(username, email, password);
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await authAPI.login(email, password);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('auth-change'));
    }
    return response.data;
  },

  async logout(): Promise<void> {
    await authAPI.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
  },

  async getCurrentUser(): Promise<User> {
    const response = await authAPI.getMe();
    return response.data.user;
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },
};
