'use client';

import { useState } from 'react';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface VoteButtonsProps {
  targetType: 'post' | 'reply';
  targetId: string;
  upvoteCount: number;
  downvoteCount: number;
  userVote: 'UPVOTE' | 'DOWNVOTE' | null;
}

export function VoteButtons({ targetType, targetId, upvoteCount, downvoteCount, userVote: initialVote }: VoteButtonsProps) {
  const [vote, setVote] = useState(initialVote);
  const [upvotes, setUpvotes] = useState(upvoteCount);
  const [downvotes, setDownvotes] = useState(downvoteCount);

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    const endpoint = targetType === 'post' ? `/votes/posts/${targetId}/vote` : `/votes/replies/${targetId}/vote`;
    const prevVote = vote;
    const prevUpvotes = upvotes;
    const prevDownvotes = downvotes;

    // Optimistic update
    if (vote === type) {
      setVote(null);
      if (type === 'UPVOTE') setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else {
      if (vote) {
        if (vote === 'UPVOTE') setUpvotes((v) => v - 1);
        else setDownvotes((v) => v - 1);
      }
      setVote(type);
      if (type === 'UPVOTE') setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
    }

    try {
      if (prevVote === type) {
        await api.delete(endpoint);
      } else {
        await api.post(endpoint, { type });
      }
    } catch (err) {
      // Revert on failure
      setVote(prevVote);
      setUpvotes(prevUpvotes);
      setDownvotes(prevDownvotes);
    }
  };

  const score = upvotes - downvotes;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button onClick={() => handleVote('UPVOTE')} className={cn('p-1 rounded hover:bg-accent', vote === 'UPVOTE' && 'text-orange-500')}>
        <ArrowBigUp className={cn('h-5 w-5', vote === 'UPVOTE' && 'fill-current')} />
      </button>
      <span className={cn('text-xs font-bold', score > 0 ? 'text-orange-500' : score < 0 ? 'text-blue-500' : 'text-muted-foreground')}>{score}</span>
      <button onClick={() => handleVote('DOWNVOTE')} className={cn('p-1 rounded hover:bg-accent', vote === 'DOWNVOTE' && 'text-blue-500')}>
        <ArrowBigDown className={cn('h-5 w-5', vote === 'DOWNVOTE' && 'fill-current')} />
      </button>
    </div>
  );
}
