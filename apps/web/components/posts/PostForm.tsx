'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ImagePlus, X, Loader2 } from 'lucide-react';

interface UploadedMedia {
  id: string;
  url: string;
  type: string;
}

export function PostForm({ channelSlug }: { channelSlug: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 10 - media.length;
    if (remaining <= 0) {
      setError('Maximum 10 media files per post');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    setError('');

    for (const file of filesToUpload) {
      try {
        const result = await api.upload<UploadedMedia>('/uploads/media', file);
        setMedia((prev) => [...prev, result]);
      } catch (err: any) {
        setError(err.message || `Failed to upload ${file.name}`);
        break;
      }
    }

    setUploading(false);
    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const mediaIds = media.map((m) => m.id);
      await api.post(`/posts/channels/${channelSlug}/posts`, { title, body, ...(mediaIds.length ? { mediaIds } : {}) });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
          <h2 className="text-xl font-semibold">Post Submitted</h2>
          <p className="text-muted-foreground">Your post has been submitted and is awaiting moderator approval. You'll be notified once it's reviewed.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => router.push(`/c/${channelSlug}`)}>Back to Channel</Button>
            <Button onClick={() => { setSubmitted(false); setTitle(''); setBody(''); setMedia([]); }}>Create Another</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Post in c/{channelSlug}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={300} />
          <Textarea placeholder="Write your post..." value={body} onChange={(e) => setBody(e.target.value)} required rows={8} />

          {/* Media preview */}
          {media.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {media.map((m) => (
                <div key={m.id} className="relative group">
                  {m.type === 'image' ? (
                    <img src={m.url} alt="" className="h-24 w-24 rounded-md object-cover" />
                  ) : (
                    <video src={m.url} className="h-24 w-24 rounded-md object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(m.id)}
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading || media.length >= 10}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Uploading...</>
              ) : (
                <><ImagePlus className="h-4 w-4 mr-1" /> Add Media</>
              )}
            </Button>
            {media.length > 0 && (
              <span className="text-xs text-muted-foreground">{media.length}/10 files</span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <Button type="submit" disabled={loading || uploading}>{loading ? 'Submitting...' : 'Submit Post'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
