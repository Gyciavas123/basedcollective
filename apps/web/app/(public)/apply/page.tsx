'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function ApplyPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ApplyForm /></Suspense>;
}

function ApplyForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    email: '', password: '', displayName: '', reasonForJoining: '', socialLinks: '',
    referralCode: searchParams.get('code') || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/applications', form);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-4">We'll review your application and get back to you via email.</p>
            <a href="/auth/login" className="text-sm text-primary hover:underline">Back to login</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Apply to BasedCollective</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
            <Input placeholder="Display name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required />
            <Textarea placeholder="Why do you want to join? (min 20 chars)" value={form.reasonForJoining} onChange={(e) => setForm({ ...form, reasonForJoining: e.target.value })} required rows={4} />
            <Input placeholder="Social links (optional)" value={form.socialLinks} onChange={(e) => setForm({ ...form, socialLinks: e.target.value })} />
            <Input placeholder="Referral code" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })} />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
