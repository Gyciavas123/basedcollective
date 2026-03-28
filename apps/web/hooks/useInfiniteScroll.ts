'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchFn: (cursor?: string) => Promise<{ data: T[]; nextCursor: string | null; hasMore: boolean }>;
}

export function useInfiniteScroll<T>({ fetchFn }: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const cursorRef = useRef<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFnRef.current(cursorRef.current || undefined);
      setItems((prev) => [...prev, ...result.data]);
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasMore);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
      console.error('Failed to load more:', err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );

  return { items, loading, initialLoading, hasMore, error, lastElementRef, setItems };
}
