'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarBadge } from '@/components/users/StarBadge';
import { VerifiedBadge } from '@/components/users/VerifiedBadge';
import { VoteButtons } from '@/components/posts/VoteButtons';
import { ReplyThread } from '@/components/posts/ReplyThread';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/posts/${id}`)
      .then(setPost)
      .catch((err) => setError(err.message || 'Failed to load post'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReply = async () => {
    setSubmitting(true);
    setReplyError('');
    try {
      await api.post(`/replies/posts/${id}/replies`, { body: replyBody });
      setReplyBody('');
      const updated = await api.get(`/posts/${id}`);
      setPost(updated);
    } catch (err: any) {
      setReplyError(err.message || 'Failed to post reply');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  if (error) return <div className="text-center py-8 text-destructive">{error}</div>;
  if (!post) return null;

  // Build reply tree
  const replyMap = new Map<string, any>();
  const rootReplies: any[] = [];
  (post.replies || []).forEach((r: any) => { replyMap.set(r.id, { ...r, children: [] }); });
  replyMap.forEach((r) => {
    if (r.parentId && replyMap.has(r.parentId)) {
      replyMap.get(r.parentId).children.push(r);
    } else {
      rootReplies.push(r);
    }
  });

  return (
    <div>
      <Link href={`/c/${post.channel.slug}`} className="text-sm text-muted-foreground hover:text-foreground mb-3 inline-block">&larr; Back to c/{post.channel.slug}</Link>
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <VoteButtons targetType="post" targetId={post.id} upvoteCount={post.upvoteCount} downvoteCount={post.downvoteCount} userVote={post.votes?.[0]?.type || null} />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link href={`/c/${post.channel.slug}`} className="font-semibold text-foreground hover:underline">c/{post.channel.slug}</Link>
                <span>&middot;</span>
                <Link href={`/u/${post.author.slug}`} className="flex items-center gap-1 hover:underline">
                  <Avatar className="h-5 w-5"><AvatarImage src={post.author.avatar || undefined} /><AvatarFallback className="text-[10px]">{post.author.displayName[0]}</AvatarFallback></Avatar>
                  {post.author.displayName}
                </Link>
                <StarBadge rank={post.author.starRank} />
                <VerifiedBadge verified={!!post.author.worldcoinVerifiedAt} />
                <span>{timeAgo(post.createdAt)}</span>
              </div>
              <h1 className="text-xl font-bold mb-2">{post.title}</h1>
              <p className="whitespace-pre-wrap mb-4">{post.body}</p>
              {post.media?.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {post.media.map((m: any) => m.type === 'image' ? <img key={m.id} src={m.url} alt="" className="max-h-96 rounded" /> : <video key={m.id} src={m.url} className="max-h-96 rounded" controls />)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">{post.replyCount} Replies</h2>
        <div className="mb-4 space-y-2">
          {replyError && <p className="text-sm text-destructive">{replyError}</p>}
          <Textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Write a reply..." rows={3} />
          <Button onClick={handleReply} disabled={submitting || !replyBody.trim()}>{submitting ? 'Posting...' : 'Reply'}</Button>
        </div>
        <ReplyThread replies={rootReplies} postId={post.id} />
      </div>
    </div>
  );
}
