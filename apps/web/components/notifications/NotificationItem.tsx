'use client';

import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/utils';
import { Bell, MessageSquare, ArrowBigUp, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ICONS: Record<string, React.ElementType> = {
  REPLY_TO_POST: MessageSquare,
  REPLY_TO_COMMENT: MessageSquare,
  UPVOTE_ON_POST: ArrowBigUp,
  UPVOTE_ON_COMMENT: ArrowBigUp,
  POST_APPROVED: CheckCircle,
  POST_REJECTED: XCircle,
  ACCOUNT_SUSPENDED: AlertTriangle,
  APPEAL_OUTCOME: CheckCircle,
};

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
    data?: { postId?: string; replyId?: string } | null;
  };
  onMarkRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const Icon = ICONS[notification.type] || Bell;
  const router = useRouter();

  const handleClick = () => {
    if (!notification.read) onMarkRead(notification.id);

    // Navigate to relevant content
    const postId = notification.data?.postId;
    if (postId) {
      router.push(`/post/${postId}`);
    }
  };

  return (
    <div
      className={cn('flex items-start gap-3 p-3 rounded-md cursor-pointer hover:bg-accent', !notification.read && 'bg-accent/50')}
      onClick={handleClick}
    >
      <Icon className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', !notification.read && 'font-medium')}>{notification.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{notification.body}</p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
      {!notification.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
    </div>
  );
}
