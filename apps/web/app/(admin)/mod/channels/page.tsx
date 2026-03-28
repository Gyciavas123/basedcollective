'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ModChannelsPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const refresh = () => api.get<any[]>('/mod/channels').then(setChannels).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    await api.patch(`/mod/channels/${id}`, { action, reason: action === 'APPROVED' ? 'Approved' : 'Rejected' });
    refresh();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Channel Requests</h1>
      <div className="space-y-3">
        {channels.map((ch) => (
          <Card key={ch.id}>
            <CardHeader><CardTitle className="text-base">{ch.name}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm mb-2">{ch.description}</p>
              <p className="text-xs text-muted-foreground mb-3">Requested by {ch.owner.displayName}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleAction(ch.id, 'APPROVED')}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => handleAction(ch.id, 'REJECTED')}>Reject</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {channels.length === 0 && <p className="text-muted-foreground">No pending channel requests.</p>}
      </div>
    </div>
  );
}
