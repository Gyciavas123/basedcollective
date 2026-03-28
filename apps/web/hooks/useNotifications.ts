'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const data = await api.get<{ count: number }>('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch {}
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { unreadCount, refreshCount: fetchCount };
}
