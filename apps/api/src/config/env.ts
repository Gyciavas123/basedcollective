import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRY: z.string().default('7d'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  WORLDCOIN_APP_ID: z.string().optional(),
  WORLDCOIN_ACTION: z.string().default('verify-human'),
  WORLDCOIN_MOCK: z.string().default('true'),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default('basedcollective-media'),
  R2_PUBLIC_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default('noreply@basedcollective.com'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  PORT: z.coerce.number().default(4000),
});

export const env = envSchema.parse(process.env);
