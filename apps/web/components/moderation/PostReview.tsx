'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { StarBadge } from '@/components/users/StarBadge';

interface PostReviewProps {
  post: {
    id: string;
    title: string;
    body: string;
    author: { displayName: string; slug: string; starRank: number };
    channel: { name: string; slug: string };
    media: { url: string; type: string }[];
  };
  onProcessed: () => void;
}

export function PostReview({ post, onProcessed }: PostReviewProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    try {
      await api.patch(`/mod/posts/${post.id}`, { action, reason: reason || 'Approved' });
      onProcessed();
    } catch {}
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{post.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{post.author.displayName}</span>
          <StarBadge rank={post.author.starRank} />
          <span>in c/{post.channel.slug}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm whitespace-pre-wrap">{post.body}</p>
        {post.media.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {post.media.map((m, i) => (
              m.type === 'image' ? <img key={i} src={m.url} alt="" className="h-24 rounded" /> : <video key={i} src={m.url} className="h-24 rounded" controls />
            ))}
          </div>
        )}
        <Textarea placeholder="Reason (required for rejection)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="flex gap-2">
          <Button onClick={() => handleAction('APPROVED')} disabled={loading}>Approve</Button>
          <Button variant="destructive" onClick={() => handleAction('REJECTED')} disabled={loading || !reason}>Reject</Button>
        </div>
      </CardContent>
    </Card>
  );
}
