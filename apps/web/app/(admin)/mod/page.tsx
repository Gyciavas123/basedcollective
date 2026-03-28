'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { FileText, Users, Hash, Flag, MessageSquare, Settings } from 'lucide-react';

export default function ModDashboardPage() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => { api.get('/mod/dashboard').then(setSummary).catch(() => {}); }, []);

  const cards = [
    { href: '/mod/applications', label: 'Applications', count: summary?.pendingApplications, icon: Users },
    { href: '/mod/posts', label: 'Post Queue', count: summary?.pendingPosts, icon: FileText },
    { href: '/mod/channels', label: 'Channel Requests', count: summary?.pendingChannels, icon: Hash },
    { href: '/mod/reports', label: 'Reports', count: summary?.openReports, icon: Flag },
    { href: '/mod/appeals', label: 'Appeals', count: summary?.pendingAppeals, icon: MessageSquare },
    { href: '/mod/settings', label: 'Settings', count: null, icon: Settings },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Moderation Dashboard</h1>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <card.icon className="h-8 w-8 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">{card.label}</CardTitle>
                  {card.count !== null && <p className="text-2xl font-bold">{card.count ?? '...'}</p>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
