'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, TrendingUp, Globe, Hash, Plus, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Channel {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
}

const navItems = [
  { href: '/feed', label: 'Home', icon: Home },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/all', label: 'All', icon: Globe },
  { href: '/saved', label: 'Saved', icon: Bookmark },
];

export function Sidebar() {
  const pathname = usePathname();
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    api.get<Channel[]>('/channels').then(setChannels).catch(() => {});
  }, []);

  return (
    <aside className="w-64 shrink-0 border-r bg-background hidden md:block">
      <div className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
              pathname === item.href && 'bg-accent text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="border-t px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Channels</h3>
          <Link href="/c/new">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="flex flex-col gap-0.5">
          <Link href="/c" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-accent text-muted-foreground">
            Browse all
          </Link>
          {channels.map((channel) => (
            <Link
              key={channel.id}
              href={`/c/${channel.slug}`}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-accent',
                pathname === `/c/${channel.slug}` && 'bg-accent'
              )}
            >
              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
              {channel.name}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
