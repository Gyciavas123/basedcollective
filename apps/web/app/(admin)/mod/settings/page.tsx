'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';

// Human-readable metadata for each config key and its fields
const CONFIG_META: Record<string, {
  title: string;
  description: string;
  fields?: Record<string, { label: string; description: string; suffix?: string }>;
  arrayLabels?: string[];
  arrayDescription?: string;
  arraySuffix?: string;
  type?: 'number';
}> = {
  'reputation.weights': {
    title: 'Reputation Points',
    description: 'How many points users earn or lose for each action.',
    fields: {
      postUpvote: { label: 'Post Upvote', description: 'Points earned when your post is upvoted', suffix: 'pts' },
      postDownvote: { label: 'Post Downvote', description: 'Points lost when your post is downvoted', suffix: 'pts' },
      commentUpvote: { label: 'Comment Upvote', description: 'Points earned when your comment is upvoted', suffix: 'pts' },
      commentDownvote: { label: 'Comment Downvote', description: 'Points lost when your comment is downvoted', suffix: 'pts' },
      replyReceived: { label: 'Reply Received', description: 'Points earned when someone replies to your post', suffix: 'pts' },
      lowEffortPost: { label: 'Low Effort Penalty', description: 'Points lost for posts with fewer than 2 upvotes after 48 hours', suffix: 'pts' },
      postRemovedByMod: { label: 'Post Removed by Mod', description: 'Points lost when a moderator removes your post', suffix: 'pts' },
      referralAccepted: { label: 'Referral Accepted', description: 'Points earned when someone you referred is accepted', suffix: 'pts' },
    },
  },
  'reputation.caps': {
    title: 'Reputation Limits',
    description: 'Caps to prevent users from gaming the reputation system.',
    fields: {
      perPost: { label: 'Max Points per Post', description: 'Maximum reputation a single post can contribute', suffix: 'pts' },
      perComment: { label: 'Max Points per Comment', description: 'Maximum reputation a single comment can contribute', suffix: 'pts' },
      dailyGain: { label: 'Daily Gain Cap', description: 'Maximum reputation a user can gain in one day', suffix: 'pts' },
    },
  },
  'reputation.thresholds': {
    title: 'Star Rank Thresholds',
    description: 'Minimum reputation points required for each star rank.',
    arrayLabels: ['Rank 1 (Newcomer)', 'Rank 2 (Contributor)', 'Rank 3 (Trusted)', 'Rank 4 (Veteran)', 'Rank 5 (Legend)'],
    arraySuffix: 'pts',
  },
  'reputation.referralAllocation': {
    title: 'Referral Codes per Month',
    description: 'How many invite codes each star rank can generate per month. Use -1 for unlimited.',
    arrayLabels: ['Rank 1 (Newcomer)', 'Rank 2 (Contributor)', 'Rank 3 (Trusted)', 'Rank 4 (Veteran)', 'Rank 5 (Legend)'],
    arraySuffix: 'codes',
  },
  'feed.timeDecayHalfLife': {
    title: 'Feed Time Decay',
    description: 'How quickly posts lose visibility in feeds. A post loses half its score after this many seconds.',
    type: 'number',
  },
  'feed.posterMultiplier': {
    title: 'Feed Score Multiplier by Rank',
    description: 'Higher-ranked users get a score boost in feeds. 1.0 = no boost, 2.0 = double score.',
    arrayLabels: ['Rank 1 (Newcomer)', 'Rank 2 (Contributor)', 'Rank 3 (Trusted)', 'Rank 4 (Veteran)', 'Rank 5 (Legend)'],
    arraySuffix: 'x',
  },
  'feed.hotWindow': {
    title: 'Hot Feed Window',
    description: 'Time window in seconds used for scoring posts in the "Hot" feed.',
    type: 'number',
  },
  'feed.trendingRefreshInterval': {
    title: 'Score Refresh Interval',
    description: 'How often feed scores are recalculated (in seconds).',
    type: 'number',
  },
  'session.expiryHours': {
    title: 'Session Duration',
    description: 'How long a user stays logged in before needing to sign in again.',
    type: 'number',
  },
};

function formatDuration(seconds: number): string {
  if (seconds >= 86400) return `${(seconds / 86400).toFixed(1)} days`;
  if (seconds >= 3600) return `${(seconds / 3600).toFixed(1)} hours`;
  if (seconds >= 60) return `${(seconds / 60).toFixed(0)} minutes`;
  return `${seconds} seconds`;
}

function formatHours(hours: number): string {
  if (hours >= 24) return `${(hours / 24).toFixed(1)} days`;
  return `${hours} hours`;
}

export default function ModSettingsPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.get<any[]>('/admin/config').then((data) => {
      setConfigs(data);
      const initial: Record<string, any> = {};
      data.forEach((c) => { initial[c.key] = c.value; });
      setValues(initial);
    }).catch(() => {});
  }, []);

  const save = async (key: string) => {
    setSaving((s) => ({ ...s, [key]: true }));
    try {
      await api.patch(`/admin/config/${key}`, { value: values[key] });
      setSaved((s) => ({ ...s, [key]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 2000);
    } catch {
      alert('Failed to save');
    }
    setSaving((s) => ({ ...s, [key]: false }));
  };

  const updateObjectField = (key: string, field: string, val: string) => {
    const num = Number(val);
    if (isNaN(num)) return;
    setValues((v) => ({ ...v, [key]: { ...v[key], [field]: num } }));
  };

  const updateArrayIndex = (key: string, index: number, val: string) => {
    const num = Number(val);
    if (isNaN(num)) return;
    const arr = [...values[key]];
    arr[index] = num;
    setValues((v) => ({ ...v, [key]: arr }));
  };

  const updateNumber = (key: string, val: string) => {
    const num = Number(val);
    if (isNaN(num)) return;
    setValues((v) => ({ ...v, [key]: num }));
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Platform Configuration</h1>
      <p className="text-muted-foreground mb-6">Adjust how the platform behaves. Changes take effect immediately.</p>

      <div className="space-y-6">
        {configs.map((c) => {
          const meta = CONFIG_META[c.key];
          if (!meta) return null;
          const value = values[c.key];
          if (value === undefined) return null;

          return (
            <Card key={c.key}>
              <CardHeader>
                <CardTitle>{meta.title}</CardTitle>
                <CardDescription>{meta.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Object fields (reputation.weights, reputation.caps) */}
                {meta.fields && typeof value === 'object' && !Array.isArray(value) && (
                  <div className="grid gap-4">
                    {Object.entries(meta.fields).map(([field, fieldMeta]) => (
                      <div key={field} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <label className="text-sm font-medium">{fieldMeta.label}</label>
                          <p className="text-xs text-muted-foreground">{fieldMeta.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Input
                            type="number"
                            value={value[field] ?? ''}
                            onChange={(e) => updateObjectField(c.key, field, e.target.value)}
                            className="w-20 text-right"
                          />
                          {fieldMeta.suffix && <span className="text-xs text-muted-foreground w-6">{fieldMeta.suffix}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Array fields (thresholds, allocations, multipliers) */}
                {meta.arrayLabels && Array.isArray(value) && (
                  <div className="grid gap-3">
                    {meta.arrayLabels.map((label, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="flex-1 text-sm">{label}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Input
                            type="number"
                            value={value[i] ?? ''}
                            onChange={(e) => updateArrayIndex(c.key, i, e.target.value)}
                            className="w-20 text-right"
                            step={c.key === 'feed.posterMultiplier' ? '0.05' : '1'}
                          />
                          {meta.arraySuffix && <span className="text-xs text-muted-foreground w-10">{meta.arraySuffix}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Single number fields */}
                {meta.type === 'number' && typeof value === 'number' && (
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => updateNumber(c.key, e.target.value)}
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">
                      {c.key === 'session.expiryHours'
                        ? formatHours(value)
                        : `${formatDuration(value)}`}
                    </span>
                  </div>
                )}

                <Button
                  size="sm"
                  onClick={() => save(c.key)}
                  disabled={saving[c.key]}
                >
                  {saved[c.key] ? (
                    <><Check className="h-4 w-4 mr-1" /> Saved</>
                  ) : saving[c.key] ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
