'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<any>('/notifications')
      .then((d) => setNotifications(d.data || []))
      .catch((err) => setError(err.message || 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>
      </div>
      {loading && <p className="text-center text-muted-foreground py-8">Loading...</p>}
      {error && <p className="text-center text-destructive py-8">{error}</p>}
      {!loading && !error && (
        <div className="space-y-1">
          {notifications.map((n) => <NotificationItem key={n.id} notification={n} onMarkRead={markRead} />)}
          {notifications.length === 0 && <p className="text-muted-foreground py-4">No notifications yet.</p>}
        </div>
      )}
    </div>
  );
}
