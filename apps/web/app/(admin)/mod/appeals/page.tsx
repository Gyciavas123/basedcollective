'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ModAppealsPage() {
  const [appeals, setAppeals] = useState<any[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const refresh = () => api.get<any[]>('/mod/appeals').then(setAppeals).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await api.patch(`/mod/appeals/${id}`, { status, reviewNote: notes[id] || '' });
    refresh();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Appeals Queue</h1>
      <div className="space-y-3">
        {appeals.map((a) => (
          <Card key={a.id}>
            <CardHeader><CardTitle className="text-base">Appeal from {a.user.displayName}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{a.reason}</p>
              <Textarea placeholder="Review note" value={notes[a.id] || ''} onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })} />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleAction(a.id, 'APPROVED')}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => handleAction(a.id, 'REJECTED')}>Reject</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {appeals.length === 0 && <p className="text-muted-foreground">No pending appeals.</p>}
      </div>
    </div>
  );
}
