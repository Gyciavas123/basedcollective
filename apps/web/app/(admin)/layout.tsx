'use client';

import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Hash,
  Flag,
  MessageSquare,
  Settings,
  UserCog,
  ArrowLeft,
  ClipboardList,
} from 'lucide-react';

const modNavItems = [
  { href: '/mod', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mod/applications', label: 'Applications', icon: Users },
  { href: '/mod/posts', label: 'Post Queue', icon: FileText },
  { href: '/mod/channels', label: 'Channels', icon: Hash },
  { href: '/mod/reports', label: 'Reports', icon: Flag },
  { href: '/mod/appeals', label: 'Appeals', icon: MessageSquare },
  { href: '/mod/users', label: 'Users', icon: UserCog },
  { href: '/mod/log', label: 'Action Log', icon: ClipboardList },
  { href: '/mod/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (!loading && user && user.role !== 'MODERATOR' && user.role !== 'ADMIN') {
      router.push('/feed');
    }
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user || (user.role !== 'MODERATOR' && user.role !== 'ADMIN')) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <aside className="w-64 shrink-0 border-r bg-background hidden md:block">
          <div className="p-4">
            <Link
              href="/feed"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to platform
            </Link>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Moderation
            </h2>
            <div className="flex flex-col gap-1">
              {modNavItems.map((item) => (
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
          </div>
        </aside>
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
