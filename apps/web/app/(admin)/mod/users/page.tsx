'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { StarBadge } from '@/components/users/StarBadge';

export default function ModUsersPage() {
  const [slug, setSlug] = useState('');
  const [user, setUser] = useState<any>(null);
  const [searchError, setSearchError] = useState('');

  // Action form state
  const [action, setAction] = useState<'suspend' | 'ban' | null>(null);
  const [reason, setReason] = useState('');
  const [hours, setHours] = useState('24');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const search = async () => {
    setSearchError('');
    setUser(null);
    setAction(null);
    setActionSuccess('');
    try {
      const u = await api.get(`/users/${slug}`);
      setUser(u);
    } catch {
      setSearchError('User not found');
    }
  };

  const handleAction = async () => {
    if (!reason.trim()) return;
    setActionLoading(true);
    try {
      if (action === 'suspend') {
        await api.post(`/mod/users/${user.id}/suspend`, { reason, durationHours: Number(hours) });
        setActionSuccess(`User suspended for ${hours} hours`);
      } else if (action === 'ban') {
        await api.post(`/mod/users/${user.id}/ban`, { reason });
        setActionSuccess('User banned permanently');
      }
      setAction(null);
      setReason('');
    } catch (err: any) {
      setActionSuccess('');
      setSearchError(err.message || 'Action failed');
    }
    setActionLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex gap-2 mb-4">
        <Input placeholder="Search by user slug (e.g. sarah-chen)" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <Button type="submit">Search</Button>
      </form>
      {searchError && <p className="text-sm text-destructive mb-4">{searchError}</p>}
      {actionSuccess && <p className="text-sm text-green-600 mb-4">{actionSuccess}</p>}
      {user && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{user.displayName}</span>
              <StarBadge rank={user.starRank} />
              <span className="text-sm text-muted-foreground">Score: {user.reputationScore}</span>
              <span className="text-xs text-muted-foreground">({user.slug})</span>
            </div>

            {!action && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setAction('suspend')}>Suspend</Button>
                <Button size="sm" variant="destructive" onClick={() => setAction('ban')}>Ban</Button>
              </div>
            )}

            {action && (
              <div className="space-y-3 border-t pt-3">
                <h3 className="font-medium">{action === 'suspend' ? 'Suspend User' : 'Ban User'}</h3>
                <Textarea placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
                {action === 'suspend' && (
                  <div className="flex items-center gap-2">
                    <Input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="w-24" min={1} />
                    <span className="text-sm text-muted-foreground">hours</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant={action === 'ban' ? 'destructive' : 'default'} onClick={handleAction} disabled={actionLoading || !reason.trim()}>
                    {actionLoading ? 'Processing...' : action === 'suspend' ? 'Confirm Suspend' : 'Confirm Ban'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setAction(null); setReason(''); }}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
