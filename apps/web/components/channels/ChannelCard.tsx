import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Hash, Users } from 'lucide-react';

interface ChannelCardProps {
  channel: {
    name: string;
    slug: string;
    description: string;
    memberCount: number;
    postCount: number;
  };
}

export function ChannelCard({ channel }: ChannelCardProps) {
  return (
    <Link href={`/c/${channel.slug}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">{channel.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{channel.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {channel.memberCount} members</span>
            <span>{channel.postCount} posts</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
