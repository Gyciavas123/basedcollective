'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PostReview } from '@/components/moderation/PostReview';

export default function ModPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);

  const refresh = () => api.get<any[]>('/mod/posts').then(setPosts).catch(() => {});
  useEffect(() => { refresh(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Post Staging Queue</h1>
      <div className="space-y-3">
        {posts.map((post) => <PostReview key={post.id} post={post} onProcessed={refresh} />)}
        {posts.length === 0 && <p className="text-muted-foreground">No posts awaiting review.</p>}
      </div>
    </div>
  );
}
