'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarBadge } from '@/components/users/StarBadge';
import { VoteButtons } from './VoteButtons';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';

interface Reply {
  id: string;
  author: { displayName: string; slug: string; avatar: string | null; starRank: number };
  body: string;
  parentId: string | null;
  upvoteCount: number;
  downvoteCount: number;
  userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
  children: Reply[];
  createdAt: string;
}

export function ReplyThread({ replies, postId, depth = 0 }: { replies: Reply[]; postId: string; depth?: number }) {
  return (
    <div className={depth > 0 ? 'ml-6 border-l pl-4' : ''}>
      {replies.map((reply) => (
        <ReplyItem key={reply.id} reply={reply} postId={postId} depth={depth} />
      ))}
    </div>
  );
}

function ReplyItem({ reply, postId, depth }: { reply: Reply; postId: string; depth: number }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [children, setChildren] = useState(reply.children);

  const handleReply = async () => {
    setSubmitting(true);
    try {
      const newReply = await api.post<Reply>(`/replies/posts/${postId}/replies`, { body: replyBody, parentId: reply.id });
      setChildren([...children, { ...newReply, children: [], userVote: null }]);
      setReplyBody('');
      setShowReplyForm(false);
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="py-2">
      <div className="flex gap-2">
        <VoteButtons targetType="reply" targetId={reply.id} upvoteCount={reply.upvoteCount} downvoteCount={reply.downvoteCount} userVote={reply.userVote ?? null} />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href={`/u/${reply.author.slug}`} className="flex items-center gap-1 hover:underline font-medium text-foreground">
              <Avatar className="h-4 w-4"><AvatarImage src={reply.author.avatar || undefined} /><AvatarFallback className="text-[8px]">{reply.author.displayName[0]}</AvatarFallback></Avatar>
              {reply.author.displayName}
            </Link>
            <StarBadge rank={reply.author.starRank} />
            <span>{timeAgo(reply.createdAt)}</span>
          </div>
          <p className="text-sm mb-1">{reply.body}</p>
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-xs text-muted-foreground hover:text-foreground">Reply</button>

          {showReplyForm && (
            <div className="mt-2 space-y-2">
              <Textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Write a reply..." rows={3} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply} disabled={submitting || !replyBody.trim()}>
                  {submitting ? 'Posting...' : 'Reply'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReplyForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {children.length > 0 && <ReplyThread replies={children} postId={postId} depth={depth + 1} />}
    </div>
  );
}
