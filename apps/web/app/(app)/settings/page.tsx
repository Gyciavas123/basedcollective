'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { User, Bell, Monitor, Lock } from 'lucide-react';

const settingsLinks = [
  { href: '/settings/profile', label: 'Profile', icon: User, description: 'Update your display name, avatar, and bio' },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell, description: 'Configure notification preferences' },
  { href: '/settings/sessions', label: 'Sessions', icon: Monitor, description: 'Manage active sessions' },
  { href: '/settings/privacy', label: 'Privacy', icon: Lock, description: 'Data export and account deletion' },
];

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="grid gap-3">
        {settingsLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <link.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{link.label}</p>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
