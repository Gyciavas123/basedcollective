import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

export function VerifiedBadge({ verified, className }: { verified: boolean; className?: string }) {
  if (!verified) return null;
  return (
    <span className={cn('inline-flex items-center gap-1 text-green-600', className)} title="Verified Human">
      <ShieldCheck className="h-4 w-4" />
      <span className="text-xs font-medium">Verified</span>
    </span>
  );
}
