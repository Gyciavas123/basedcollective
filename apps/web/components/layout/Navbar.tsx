'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Search, User, LogOut, Settings, Shield, LayoutDashboard, Menu, X, Home, TrendingUp, Globe, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const mobileNavItems = [
  { href: '/feed', label: 'Home', icon: Home },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/all', label: 'All', icon: Globe },
  { href: '/saved', label: 'Saved', icon: Bookmark },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button className="md:hidden p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/feed" className="text-xl font-bold">
              BasedCollective
            </Link>
          </div>

          <form className="flex-1 max-w-md mx-4 hidden sm:block" onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) router.push(`/all?q=${encodeURIComponent(searchQuery.trim())}`); }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            {user && (
              <>
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>

                <div className="relative" ref={menuRef}>
                  <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>{user.displayName[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md border bg-background shadow-lg z-50">
                      <div className="p-2">
                        <p className="px-2 py-1 text-sm font-medium">{user.displayName}</p>
                        <p className="px-2 py-1 text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="border-t">
                        <Link href={`/u/${user.slug}`} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent" onClick={() => setMenuOpen(false)}>
                          <User className="h-4 w-4" /> Profile
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent" onClick={() => setMenuOpen(false)}>
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Link>
                        <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent" onClick={() => setMenuOpen(false)}>
                          <Settings className="h-4 w-4" /> Settings
                        </Link>
                        {(user.role === 'MODERATOR' || user.role === 'ADMIN') && (
                          <Link href="/mod" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent" onClick={() => setMenuOpen(false)}>
                            <Shield className="h-4 w-4" /> Moderation
                          </Link>
                        )}
                      </div>
                      <div className="border-t">
                        <button onClick={() => { logout(); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent">
                          <LogOut className="h-4 w-4" /> Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-40 bg-background border-t">
          <div className="p-4 space-y-1">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent ${pathname === item.href ? 'bg-accent text-accent-foreground' : ''}`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            <div className="border-t my-2" />
            <Link href="/c" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium hover:bg-accent">
              Browse Channels
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
