'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ChannelHeader } from '@/components/channels/ChannelHeader';
import { PostCard } from '@/components/posts/PostCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Link from 'next/link';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function ChannelPage() {
  const { slug } = useParams<{ slug: string }>();
  const [channel, setChannel] = useState<any>(null);
  const [channelLoading, setChannelLoading] = useState(true);
  const [channelError, setChannelError] = useState('');

  useEffect(() => {
    setChannelLoading(true);
    setChannelError('');
    api.get(`/channels/${slug}`)
      .then(setChannel)
      .catch((err) => setChannelError(err.message || 'Channel not found'))
      .finally(() => setChannelLoading(false));
  }, [slug]);

  const hotFeed = useInfiniteScroll<any>({ fetchFn: (cursor) => api.get(`/posts/channels/${slug}/hot${cursor ? `?cursor=${cursor}` : ''}`) });
  const newFeed = useInfiniteScroll<any>({ fetchFn: (cursor) => api.get(`/posts/channels/${slug}/new${cursor ? `?cursor=${cursor}` : ''}`) });

  if (channelLoading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  if (channelError) return <div className="text-center py-8 text-destructive">{channelError}</div>;
  if (!channel) return null;

  const renderFeed = (feed: typeof hotFeed) => (
    <div className="space-y-3">
      {feed.items.map((post: any, i: number) => (
        <div key={post.id} ref={i === feed.items.length - 1 ? feed.lastElementRef : undefined}><PostCard post={post} /></div>
      ))}
      {feed.loading && !feed.initialLoading && <p className="text-center text-muted-foreground py-4">Loading more...</p>}
      {feed.initialLoading && <p className="text-center text-muted-foreground py-8">Loading...</p>}
      {feed.error && <p className="text-center text-destructive py-4">{feed.error}</p>}
      {!feed.loading && !feed.initialLoading && !feed.error && feed.items.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No posts yet. Be the first to post in this channel!</p>
      )}
    </div>
  );

  return (
    <div>
      <ChannelHeader channel={channel} isMember={channel.isMember ?? false} />
      <div className="flex justify-end mb-4">
        <Link href={`/c/${slug}/submit`}><Button>Create Post</Button></Link>
      </div>
      <Tabs defaultValue="hot">
        <TabsList><TabsTrigger value="hot">Hot</TabsTrigger><TabsTrigger value="new">New</TabsTrigger></TabsList>
        <TabsContent value="hot">{renderFeed(hotFeed)}</TabsContent>
        <TabsContent value="new">{renderFeed(newFeed)}</TabsContent>
      </Tabs>
    </div>
  );
}
