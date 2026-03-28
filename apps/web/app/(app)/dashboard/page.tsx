'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarBadge } from '@/components/users/StarBadge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

const REP_LABELS: Record<string, string> = {
  postUpvotes: 'Post Upvotes',
  commentUpvotes: 'Comment Upvotes',
  repliesReceived: 'Replies Received',
  referrals: 'Referrals',
  penalties: 'Penalties',
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/users/me/dashboard')
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const generateCode = async () => {
    try {
      await api.post('/referrals/codes/generate');
      const updated = await api.get('/users/me/dashboard');
      setData(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to generate code');
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  if (error) return <div className="text-center py-8 text-destructive">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{data.user.reputationScore} points</span>
          <StarBadge rank={data.user.starRank} showLabel />
        </div>
        <p className="text-sm text-muted-foreground">Today: +{data.todayGain} / {data.dailyCap} daily cap</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(data.reputationBreakdown).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{REP_LABELS[key] || key}</p>
              <p className="text-2xl font-bold">{value as number}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Referral Codes</CardTitle>
            <Button size="sm" onClick={generateCode}>Generate Code</Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.referralCodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active referral codes.</p>
          ) : (
            <div className="space-y-2">
              {data.referralCodes.map((code: any) => (
                <div key={code.id} className="flex items-center justify-between p-2 border rounded">
                  <code className="text-sm font-mono">{code.code}</code>
                  <Button variant="ghost" size="icon" onClick={() => copyCode(code.code, code.id)}>
                    {copiedId === code.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
