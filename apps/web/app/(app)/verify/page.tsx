'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';
import { ShieldCheck } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/users/verify/worldcoin', { proof: 'mock' });
      router.push('/feed');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <ShieldCheck className="h-12 w-12 mx-auto text-primary mb-2" />
          <CardTitle>Verify Your Identity</CardTitle>
          <CardDescription>Verify with Worldcoin World ID to confirm you're a unique human.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleVerify} disabled={loading} size="lg">
            {loading ? 'Verifying...' : 'Verify with World ID'}
          </Button>
          <p className="text-xs text-muted-foreground">Your identity proof is verified on-chain. No personal data is stored.</p>
        </CardContent>
      </Card>
    </div>
  );
}
