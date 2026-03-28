'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ModActionLog } from '@/components/moderation/ModActionLog';

export default function ModLogPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<any>('/mod/log')
      .then((data) => setEntries(Array.isArray(data) ? data : data.data || []))
      .catch((err) => setError(err.message || 'Failed to load action log'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Moderation Log</h1>
      {loading && <p className="text-center text-muted-foreground py-8">Loading...</p>}
      {error && <p className="text-center text-destructive py-8">{error}</p>}
      {!loading && !error && (
        <>
          <ModActionLog entries={entries} />
          {entries.length === 0 && <p className="text-muted-foreground py-4">No moderation actions yet.</p>}
        </>
      )}
    </div>
  );
}
