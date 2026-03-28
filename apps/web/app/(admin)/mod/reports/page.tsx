'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/utils';

export default function ModReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const refresh = () => api.get<any[]>('/mod/reports').then(setReports).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const resolve = async (id: string) => { await api.patch(`/mod/reports/${id}`); refresh(); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Flagged Content</h1>
      <div className="space-y-3">
        {reports.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <p className="text-sm"><strong>Reporter:</strong> {r.reporter.displayName}</p>
              {r.post && <p className="text-sm"><strong>Post:</strong> {r.post.title}</p>}
              {r.reply && <p className="text-sm"><strong>Reply:</strong> {r.reply.body.slice(0, 100)}...</p>}
              <p className="text-sm mt-1"><strong>Reason:</strong> {r.reason}</p>
              <p className="text-xs text-muted-foreground mt-1">{timeAgo(r.createdAt)}</p>
              <Button size="sm" className="mt-2" onClick={() => resolve(r.id)}>Resolve</Button>
            </CardContent>
          </Card>
        ))}
        {reports.length === 0 && <p className="text-muted-foreground">No open reports.</p>}
      </div>
    </div>
  );
}
