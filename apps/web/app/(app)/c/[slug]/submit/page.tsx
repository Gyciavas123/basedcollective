'use client';

import { useParams } from 'next/navigation';
import { PostForm } from '@/components/posts/PostForm';

export default function SubmitPostPage() {
  const { slug } = useParams<{ slug: string }>();
  return <PostForm channelSlug={slug} />;
}
