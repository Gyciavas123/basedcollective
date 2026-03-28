'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function LandingPage() {
  const [referralCode, setReferralCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [codeValid, setCodeValid] = useState<boolean | null>(null);

  const handleValidate = async () => {
    if (!referralCode.trim()) return;
    setValidating(true);
    try {
      const result = await api.post<{ valid: boolean }>('/auth/referral-codes/validate', { code: referralCode });
      setCodeValid(result.valid);
    } catch {
      setCodeValid(false);
    }
    setValidating(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">BasedCollective</h1>
          <p className="text-lg text-muted-foreground">An invite-only community for high-quality discussion. Verified humans only.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Have a referral code?</CardTitle>
            <CardDescription>Enter your code to apply for membership.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Enter referral code" value={referralCode} onChange={(e) => { setReferralCode(e.target.value); setCodeValid(null); }} />
              <Button onClick={handleValidate} disabled={validating || !referralCode.trim()}>
                {validating ? 'Checking...' : 'Validate'}
              </Button>
            </div>
            {codeValid === true && (
              <div className="text-sm text-green-600">
                Code is valid! <Link href={`/apply?code=${referralCode}`} className="underline font-medium">Apply now</Link>
              </div>
            )}
            {codeValid === false && <p className="text-sm text-destructive">Invalid or expired code.</p>}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Link href="/auth/login"><Button variant="outline">Log In</Button></Link>
          <Link href="/auth/register"><Button variant="outline">Register</Button></Link>
        </div>
      </div>
    </div>
  );
}
