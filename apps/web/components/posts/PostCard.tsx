'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarBadge } from '@/components/users/StarBadge';
import { VoteButtons } from './VoteButtons';
import { MessageSquare, Bookmark, Flag, Check, X } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    body: string;
    upvoteCount: number;
    downvoteCount: number;
    replyCount: number;
    userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
    isSaved?: boolean;
    createdAt: string;
    author: {
      displayName: string;
      slug: string;
      avatar: string | null;
      starRank: number;
    };
    channel?: { name: string; slug: string };
    media?: { id: string; url: string; type: string }[];
  };
}

export function PostCard({ post }: PostCardProps) {
  const [saved, setSaved] = useState(post.isSaved ?? false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reported, setReported] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const handleSave = async () => {
    try {
      if (saved) {
        await api.delete(`/posts/${post.id}/save`);
        setSaved(false);
      } else {
        await api.post(`/posts/${post.id}/save`);
        setSaved(true);
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    setReportSubmitting(true);
    try {
      await api.post(`/posts/${post.id}/report`, { reason: reportReason.trim() });
      setReported(true);
      setShowReportForm(false);
      setReportReason('');
    } catch (err) {
      console.error('Report failed:', err);
    }
    setReportSubmitting(false);
  };

  return (
    <Card className="flex gap-0 overflow-hidden">
      <div className="flex flex-col items-center py-3 px-2 bg-muted/30">
        <VoteButtons targetType="post" targetId={post.id} upvoteCount={post.upvoteCount} downvoteCount={post.downvoteCount} userVote={post.userVote ?? null} />
      </div>
      <div className="flex-1 p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          {post.channel && (
            <>
              <Link href={`/c/${post.channel.slug}`} className="font-semibold text-foreground hover:underline">
                c/{post.channel.slug}
              </Link>
              <span>&middot;</span>
            </>
          )}
          <Link href={`/u/${post.author.slug}`} className="flex items-center gap-1 hover:underline">
            <Avatar className="h-4 w-4">
              <AvatarImage src={post.author.avatar || undefined} />
              <AvatarFallback className="text-[8px]">{post.author.displayName[0]}</AvatarFallback>
            </Avatar>
            {post.author.displayName}
          </Link>
          <StarBadge rank={post.author.starRank} />
          <span>{timeAgo(post.createdAt)}</span>
        </div>

        <Link href={`/post/${post.id}`}>
          <h3 className="text-lg font-semibold hover:underline mb-1">{post.title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{post.body}</p>

        {post.media && post.media.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto">
            {post.media.map((m) => (
              <div key={m.id} className="shrink-0">
                {m.type === 'image' ? (
                  <img src={m.url} alt="" className="h-32 rounded-md object-cover" />
                ) : (
                  <video src={m.url} className="h-32 rounded-md" controls />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link href={`/post/${post.id}`} className="flex items-center gap-1 hover:text-foreground">
            <MessageSquare className="h-4 w-4" /> {post.replyCount} replies
          </Link>
          <button onClick={handleSave} className="flex items-center gap-1 hover:text-foreground">
            <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} /> {saved ? 'Saved' : 'Save'}
          </button>
          {reported ? (
            <span className="flex items-center gap-1 text-muted-foreground"><Check className="h-4 w-4" /> Reported</span>
          ) : (
            <button onClick={() => setShowReportForm(!showReportForm)} className="flex items-center gap-1 hover:text-foreground">
              <Flag className="h-4 w-4" /> Report
            </button>
          )}
        </div>

        {showReportForm && (
          <div className="mt-2 space-y-2">
            <Textarea
              placeholder="Why are you reporting this post?"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleReport} disabled={reportSubmitting || !reportReason.trim()}>
                {reportSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowReportForm(false); setReportReason(''); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
