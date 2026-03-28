'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ApplicationReview } from '@/components/moderation/ApplicationReview';

export default function ModApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);

  const refresh = () => api.get<any[]>('/mod/applications').then(setApps).catch(() => {});
  useEffect(() => { refresh(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pending Applications</h1>
      <div className="space-y-3">
        {apps.map((app) => <ApplicationReview key={app.id} application={app} onProcessed={refresh} />)}
        {apps.length === 0 && <p className="text-muted-foreground">No pending applications.</p>}
      </div>
    </div>
  );
}
