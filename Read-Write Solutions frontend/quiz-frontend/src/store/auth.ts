import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (payload: { token: string; user: User }) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: ({ token, user }) => {
    localStorage.setItem('jwt', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
  hydrate: () => {
    const token = localStorage.getItem('jwt');
    const userRaw = localStorage.getItem('user');
    set({
      token: token || null,
      user: userRaw ? JSON.parse(userRaw) : null,
    });
  },
}));
