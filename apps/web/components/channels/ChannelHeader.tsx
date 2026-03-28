'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Hash, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface ChannelHeaderProps {
  channel: {
    name: string;
    slug: string;
    description: string;
    rules: string | null;
    memberCount: number;
    postCount: number;
    owner: { displayName: string; slug: string };
  };
  isMember: boolean;
}

export function ChannelHeader({ channel, isMember: initialMember }: ChannelHeaderProps) {
  const [isMember, setIsMember] = useState(initialMember);
  const [loading, setLoading] = useState(false);

  const toggleMembership = async () => {
    setLoading(true);
    try {
      if (isMember) {
        await api.delete(`/channels/${channel.slug}/join`);
        setIsMember(false);
      } else {
        await api.post(`/channels/${channel.slug}/join`);
        setIsMember(true);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="border-b pb-6 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Hash className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{channel.name}</h1>
        </div>
        <Button onClick={toggleMembership} variant={isMember ? 'outline' : 'default'} disabled={loading} className="shrink-0">
          {isMember ? 'Leave' : 'Join'}
        </Button>
      </div>
      <p className="text-muted-foreground mt-3">{channel.description}</p>
      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {channel.memberCount} members</span>
        <span>{channel.postCount} posts</span>
      </div>
      {channel.rules && (
        <details className="mt-4">
          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">Channel Rules</summary>
          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{channel.rules}</p>
        </details>
      )}
    </div>
  );
}
