'use client';

import { PostCard } from '@/components/posts/PostCard';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { api } from '@/lib/api';

export default function AllPage() {
  const { items, loading, initialLoading, lastElementRef } = useInfiniteScroll({
    fetchFn: (cursor) => api.get(`/posts/feed/all${cursor ? `?cursor=${cursor}` : ''}`),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Posts</h1>
      <div className="space-y-3">
        {items.map((post: any, i: number) => (
          <div key={post.id} ref={i === items.length - 1 ? lastElementRef : undefined}>
            <PostCard post={post} />
          </div>
        ))}
        {loading && !initialLoading && <p className="text-center text-muted-foreground py-4">Loading more...</p>}
        {initialLoading && <p className="text-center text-muted-foreground py-8">Loading...</p>}
        {!loading && !initialLoading && items.length === 0 && <p className="text-center text-muted-foreground py-8">No posts yet. Be the first to post!</p>}
      </div>
    </div>
  );
}
