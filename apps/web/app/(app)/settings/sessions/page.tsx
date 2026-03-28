'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

function parseUserAgent(ua: string | null): { device: string; isMobile: boolean } {
  if (!ua) return { device: 'Unknown device', isMobile: false };
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);

  let browser = 'Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  let os = '';
  if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { device: `${browser}${os ? ` on ${os}` : ''}`, isMobile };
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    api.get<any[]>('/auth/sessions')
      .then(setSessions)
      .catch((err) => setError(err.message || 'Failed to load sessions'))
      .finally(() => setLoading(false));
  }, []);

  const revoke = async (id: string) => {
    try {
      await api.delete(`/auth/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to revoke session');
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Active Sessions</CardTitle></CardHeader>
      <CardContent>
        {loading && <p className="text-center text-muted-foreground py-4">Loading...</p>}
        {error && <p className="text-sm text-destructive mb-3">{error}</p>}
        <div className="space-y-3">
          {sessions.map((s, i) => {
            const { device, isMobile } = parseUserAgent(s.userAgent);
            const isCurrentSession = i === 0; // Most recent session is typically current
            const DeviceIcon = isMobile ? Smartphone : Monitor;
            return (
              <div key={s.id} className={`flex items-center justify-between p-3 border rounded-md ${isCurrentSession ? 'border-primary/50 bg-primary/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {device}
                      {isCurrentSession && <span className="ml-2 text-xs text-primary font-normal">Current session</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.ipAddress && <span>{s.ipAddress} &middot; </span>}
                      Created {formatDate(s.createdAt)}
                    </p>
                  </div>
                </div>
                {!isCurrentSession && (
                  <Button variant="ghost" size="icon" onClick={() => revoke(s.id)}><X className="h-4 w-4" /></Button>
                )}
              </div>
            );
          })}
          {!loading && sessions.length === 0 && <p className="text-muted-foreground">No active sessions.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
