'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { Camera } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ displayName: user?.displayName || '', bio: (user as any)?.bio || '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>((user as any)?.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError('');
    try {
      const result = await api.upload<{ url: string }>('/uploads/avatar', file);
      setAvatarUrl(result.url);
      setUser({ ...user!, avatar: result.url } as any);
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    }
    setUploadingAvatar(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const updated = await api.patch<any>('/users/me', form);
      setUser({ ...user!, ...updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    }
    setLoading(false);
  };

  return (
    <Card className="max-w-lg">
      <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-2xl">{(user?.displayName || '?')[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="text-sm">
              <p className="font-medium">Profile Picture</p>
              <p className="text-muted-foreground">
                {uploadingAvatar ? 'Uploading...' : 'Click to change (max 5MB)'}
              </p>
            </div>
          </div>

          <Input placeholder="Display name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          <Textarea placeholder="Bio (max 500 chars)" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={500} />
          <Button type="submit" disabled={loading}>{saved ? 'Saved!' : loading ? 'Saving...' : 'Save Changes'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
