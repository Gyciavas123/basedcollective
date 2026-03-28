import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimiter';
import { mediaService } from '../services/media.service';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

export const uploadsRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max (videos)
});

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

const s3 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ACCOUNT_ID ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined,
  credentials: env.R2_ACCESS_KEY_ID ? {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
  } : undefined,
});

// Upload media for posts (images/videos)
uploadsRoutes.post('/media', authMiddleware, uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const media = await mediaService.upload(req.file, req.user!.userId);
    res.status(201).json(media);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Upload avatar
uploadsRoutes.post('/avatar', authMiddleware, uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    if (!ALLOWED_AVATAR_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported image type. Use JPEG, PNG, GIF, or WebP.' });
    }
    if (req.file.size > MAX_AVATAR_SIZE) {
      return res.status(400).json({ error: 'Avatar too large (max 5MB)' });
    }

    const ext = req.file.originalname.split('.').pop() || 'jpg';
    const key = `avatars/${req.user!.userId}/${crypto.randomBytes(16).toString('hex')}.${ext}`;

    if (env.R2_ACCOUNT_ID) {
      await s3.send(new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }));
    }

    const url = env.R2_PUBLIC_URL ? `${env.R2_PUBLIC_URL}/${key}` : `/uploads/${key}`;

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { avatar: url },
    });

    res.status(200).json({ url });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
