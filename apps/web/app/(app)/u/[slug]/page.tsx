'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { StarBadge } from '@/components/users/StarBadge';
import { VerifiedBadge } from '@/components/users/VerifiedBadge';
import { PostCard } from '@/components/posts/PostCard';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function UserProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get(`/users/${slug}`).then(setProfile),
      api.get(`/users/${slug}/posts`).then((data: any) => setPosts(Array.isArray(data) ? data : [])),
    ])
      .catch((err) => setError(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  if (error) return <div className="text-center py-8 text-destructive">{error}</div>;
  if (!profile) return null;

  const isOwnProfile = currentUser?.slug === slug;

  return (
    <div>
      <Card className="mb-6">
        <CardContent className="p-6 flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar || undefined} />
            <AvatarFallback className="text-2xl">{profile.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{profile.displayName}</h1>
              <StarBadge rank={profile.starRank} showLabel />
              <VerifiedBadge verified={!!profile.worldcoinVerifiedAt} />
            </div>
            {profile.bio && <p className="text-muted-foreground mt-1">{profile.bio}</p>}
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>{profile._count?.posts ?? 0} posts</span>
              <span>{profile._count?.referralCodesOwned ?? 0} referrals</span>
              <span>Joined {formatDate(profile.createdAt)}</span>
            </div>
            {isOwnProfile && (
              <Link href="/settings/profile" className="text-sm text-primary hover:underline mt-2 inline-block">Edit profile</Link>
            )}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold mb-3">Posts</h2>
      <div className="space-y-3">
        {posts.map((post: any) => <PostCard key={post.id} post={post} />)}
        {posts.length === 0 && <p className="text-muted-foreground">No posts yet.</p>}
      </div>
    </div>
  );
}
