import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

const LABELS = ['Newcomer', 'Contributor', 'Trusted', 'Veteran', 'Legend'];
const COLORS = ['text-gray-400', 'text-green-500', 'text-blue-500', 'text-purple-500', 'text-yellow-500'];

export function StarBadge({ rank, showLabel = false }: { rank: number; showLabel?: boolean }) {
  const label = LABELS[rank - 1] || 'Newcomer';
  const color = COLORS[rank - 1] || COLORS[0];
  return (
    <span className="inline-flex items-center gap-1">
      {Array.from({ length: rank }).map((_, i) => (
        <Star key={i} className={cn('h-3.5 w-3.5 fill-current', color)} />
      ))}
      {showLabel && <span className={cn('text-xs font-medium', color)}>{label}</span>}
    </span>
  );
}
