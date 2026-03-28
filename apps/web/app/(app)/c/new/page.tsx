'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function NewChannelPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', rules: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/channels', form);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
          <h2 className="text-xl font-semibold">Channel Request Submitted</h2>
          <p className="text-muted-foreground">Your channel request is now awaiting moderator approval. You'll be notified once it's reviewed.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => router.push('/c')}>Browse Channels</Button>
            <Button onClick={() => { setSubmitted(false); setForm({ name: '', description: '', rules: '' }); }}>Request Another</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader><CardTitle>Request New Channel</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Input placeholder="Channel name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea placeholder="Description (min 10 chars)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required minLength={10} />
          <Textarea placeholder="Rules (optional)" value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} />
          <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
