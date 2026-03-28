import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarBadge } from './StarBadge';
import { VerifiedBadge } from './VerifiedBadge';
import Link from 'next/link';

interface ProfileCardProps {
  user: {
    displayName: string;
    slug: string;
    avatar: string | null;
    starRank: number;
    worldcoinVerifiedAt: string | null;
    bio?: string | null;
  };
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Link href={`/u/${user.slug}`} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar || undefined} />
        <AvatarFallback>{user.displayName[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{user.displayName}</span>
          <StarBadge rank={user.starRank} />
          <VerifiedBadge verified={!!user.worldcoinVerifiedAt} />
        </div>
        {user.bio && <p className="text-xs text-muted-foreground line-clamp-1">{user.bio}</p>}
      </div>
    </Link>
  );
}
