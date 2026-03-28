import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { env } from '../config/env';

const s3 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ACCOUNT_ID ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined,
  credentials: env.R2_ACCESS_KEY_ID ? {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
  } : undefined,
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export const mediaService = {
  async upload(file: Express.Multer.File, userId: string) {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
    if (!isImage && !isVideo) throw new Error('Unsupported file type');
    if (isImage && file.size > MAX_IMAGE_SIZE) throw new Error('Image too large (max 10MB)');
    if (isVideo && file.size > MAX_VIDEO_SIZE) throw new Error('Video too large (max 100MB)');

    const ext = file.originalname.split('.').pop() || 'bin';
    const key = `uploads/${userId}/${crypto.randomBytes(16).toString('hex')}.${ext}`;

    if (env.R2_ACCOUNT_ID) {
      await s3.send(new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }));
    }

    const url = env.R2_PUBLIC_URL ? `${env.R2_PUBLIC_URL}/${key}` : `/uploads/${key}`;

    const media = await prisma.postMedia.create({
      data: {
        postId: 'temp', // Will be updated when attached to a post
        url,
        type: isImage ? 'image' : 'video',
        mimeType: file.mimetype,
        sizeBytes: file.size,
        isValid: true,
      },
    });

    return media;
  },
};
