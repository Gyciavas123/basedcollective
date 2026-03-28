'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';

interface ApplicationReviewProps {
  application: {
    id: string;
    email: string;
    displayName: string;
    reasonForJoining: string;
    socialLinks: string | null;
    createdAt: string;
    referralCode?: { code: string; owner: { displayName: string } } | null;
  };
  onProcessed: () => void;
}

export function ApplicationReview({ application, onProcessed }: ApplicationReviewProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    try {
      await api.patch(`/mod/applications/${application.id}`, { action, reason: reason || 'Approved' });
      onProcessed();
    } catch {}
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{application.displayName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm"><strong>Email:</strong> {application.email}</p>
        <p className="text-sm"><strong>Reason:</strong> {application.reasonForJoining}</p>
        {application.socialLinks && <p className="text-sm"><strong>Links:</strong> {application.socialLinks}</p>}
        {application.referralCode && (
          <p className="text-sm"><strong>Referred by:</strong> {application.referralCode.owner.displayName} (code: {application.referralCode.code})</p>
        )}
        <p className="text-xs text-muted-foreground">{timeAgo(application.createdAt)}</p>
        <Textarea placeholder="Reason (required for rejection)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="flex gap-2">
          <Button onClick={() => handleAction('APPROVED')} disabled={loading}>Approve</Button>
          <Button variant="destructive" onClick={() => handleAction('REJECTED')} disabled={loading || !reason}>Reject</Button>
        </div>
      </CardContent>
    </Card>
  );
}
