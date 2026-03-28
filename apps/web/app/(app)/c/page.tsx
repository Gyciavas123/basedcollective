'use client';

import { useEffect, useState } from 'react';
import { ChannelCard } from '@/components/channels/ChannelCard';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ChannelsPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<any[]>('/channels')
      .then(setChannels)
      .catch((err) => setError(err.message || 'Failed to load channels'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Channels</h1>
        <Link href="/c/new"><Button><Plus className="h-4 w-4 mr-2" /> Request Channel</Button></Link>
      </div>
      {loading && <p className="text-center text-muted-foreground py-8">Loading...</p>}
      {error && <p className="text-center text-destructive py-8">{error}</p>}
      {!loading && !error && (
        <div className="grid gap-3 md:grid-cols-2">
          {channels.map((ch) => <ChannelCard key={ch.id} channel={ch} />)}
          {channels.length === 0 && <p className="text-muted-foreground">No channels yet.</p>}
        </div>
      )}
    </div>
  );
}
