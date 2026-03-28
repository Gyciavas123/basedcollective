'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PostCard } from '@/components/posts/PostCard';

export default function SavedPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<any[]>('/posts/saved/list')
      .then(setSaved)
      .catch((err) => setError(err.message || 'Failed to load saved posts'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Saved Posts</h1>
      {loading && <p className="text-center text-muted-foreground py-8">Loading...</p>}
      {error && <p className="text-center text-destructive py-8">{error}</p>}
      {!loading && !error && (
        <div className="space-y-3">
          {saved.map((s: any) => s.post && <PostCard key={s.post.id} post={{ ...s.post, isSaved: true }} />)}
          {saved.length === 0 && <p className="text-muted-foreground">No saved posts yet.</p>}
        </div>
      )}
    </div>
  );
}
