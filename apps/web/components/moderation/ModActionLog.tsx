import { timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ModActionLogProps {
  entries: {
    id: string;
    actionType: string;
    actor: { displayName: string };
    targetUser: { displayName: string } | null;
    reason: string;
    createdAt: string;
  }[];
}

const ACTION_COLORS: Record<string, string> = {
  APPLICATION_APPROVED: 'bg-green-100 text-green-800',
  APPLICATION_REJECTED: 'bg-red-100 text-red-800',
  POST_APPROVED: 'bg-green-100 text-green-800',
  POST_REJECTED: 'bg-red-100 text-red-800',
  POST_REMOVED: 'bg-red-100 text-red-800',
  USER_SUSPENDED: 'bg-yellow-100 text-yellow-800',
  USER_BANNED: 'bg-red-100 text-red-800',
};

export function ModActionLog({ entries }: ModActionLogProps) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3 p-3 rounded-md border">
          <Badge className={ACTION_COLORS[entry.actionType] || 'bg-gray-100 text-gray-800'} variant="secondary">
            {entry.actionType.replace(/_/g, ' ')}
          </Badge>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <strong>{entry.actor.displayName}</strong>
              {entry.targetUser && <> &rarr; <strong>{entry.targetUser.displayName}</strong></>}
            </p>
            <p className="text-xs text-muted-foreground">{entry.reason}</p>
            <p className="text-xs text-muted-foreground mt-1">{timeAgo(entry.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
