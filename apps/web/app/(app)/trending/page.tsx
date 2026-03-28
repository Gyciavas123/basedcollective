'use client';

import { PostCard } from '@/components/posts/PostCard';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { api } from '@/lib/api';

export default function TrendingPage() {
  const { items, loading, initialLoading, lastElementRef } = useInfiniteScroll({
    fetchFn: (cursor) => api.get(`/posts/feed/trending${cursor ? `?cursor=${cursor}` : ''}`),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Trending</h1>
      <div className="space-y-3">
        {items.map((post: any, i: number) => (
          <div key={post.id} ref={i === items.length - 1 ? lastElementRef : undefined}>
            <PostCard post={post} />
          </div>
        ))}
        {loading && !initialLoading && <p className="text-center text-muted-foreground py-4">Loading more...</p>}
        {initialLoading && <p className="text-center text-muted-foreground py-8">Loading...</p>}
        {!loading && !initialLoading && items.length === 0 && <p className="text-center text-muted-foreground py-8">No trending posts yet.</p>}
      </div>
    </div>
  );
}
