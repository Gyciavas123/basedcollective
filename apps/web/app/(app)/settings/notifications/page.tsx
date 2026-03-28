'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EVENT_TYPES = [
  'REPLY_TO_POST', 'REPLY_TO_COMMENT', 'UPVOTE_ON_POST', 'UPVOTE_ON_COMMENT',
  'POST_APPROVED', 'POST_REJECTED', 'ACCOUNT_SUSPENDED', 'APPEAL_OUTCOME',
  'REFERRAL_CODE_USED', 'REFERRED_USER_ACCEPTED', 'WORLDCOIN_LAPSE_WARNING', 'SYSTEM_ANNOUNCEMENT',
];

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<Record<string, { inApp: boolean; email: boolean }>>({});

  useEffect(() => {
    api.get<any[]>('/notifications/preferences').then((data) => {
      const map: any = {};
      data.forEach((p) => { map[p.eventType] = { inApp: p.inApp, email: p.email }; });
      setPrefs(map);
    }).catch(() => {});
  }, []);

  const toggle = async (eventType: string, field: 'inApp' | 'email') => {
    const current = prefs[eventType] || { inApp: true, email: true };
    const updated = { ...current, [field]: !current[field] };
    setPrefs({ ...prefs, [eventType]: updated });
    await api.patch('/notifications/preferences', { eventType, ...updated });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {EVENT_TYPES.map((type) => {
            const pref = prefs[type] || { inApp: true, email: true };
            return (
              <div key={type} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{type.replace(/_/g, ' ').toLowerCase()}</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={pref.inApp} onChange={() => toggle(type, 'inApp')} /> In-app
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={pref.email} onChange={() => toggle(type, 'email')} /> Email
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
