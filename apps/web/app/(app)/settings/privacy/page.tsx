'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function PrivacySettingsPage() {
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const requestExport = async () => {
    setExportLoading(true);
    setMessage(null);
    try {
      await api.post('/compliance/export');
      setMessage({ text: 'Data export requested. You will be notified when ready.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Export request failed.', type: 'error' });
    }
    setExportLoading(false);
  };

  const requestDeletion = async () => {
    if (!confirm('Are you sure? This action is irreversible. Your account and all data will be permanently deleted.')) return;
    setDeleteLoading(true);
    setMessage(null);
    try {
      await api.post('/compliance/delete');
      setMessage({ text: 'Account deletion requested. Your data will be removed.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Deletion request failed.', type: 'error' });
    }
    setDeleteLoading(false);
  };

  return (
    <div className="space-y-4 max-w-lg">
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
          {message.text}
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>Download a copy of all your data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={requestExport} disabled={exportLoading}>{exportLoading ? 'Requesting...' : 'Request Data Export'}</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
          <CardDescription>Permanently delete your account and anonymize your data. This cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={requestDeletion} disabled={deleteLoading}>{deleteLoading ? 'Requesting...' : 'Delete My Account'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
