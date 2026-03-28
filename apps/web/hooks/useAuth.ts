'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { AuthUser } from '@/lib/auth';

export function useAuthProvider() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      api.get<{ user: AuthUser }>('/users/me/dashboard', { token: storedToken })
        .then((data) => setUser(data.user as any))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    await api.post('/auth/register', { email, password, displayName });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return { user, token, loading, login, register, logout, setUser };
}
