'use client';

import { createContext, useContext } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  slug: string;
  avatar: string | null;
  role: string;
  status: string;
  starRank: number;
  worldcoinVerifiedAt: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);
