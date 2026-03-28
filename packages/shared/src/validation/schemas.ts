import { z } from 'zod';

// Auth
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Application
export const applicationSchema = z.object({
  email: z.string().email('Invalid email address'),
  displayName: z.string().min(2).max(50),
  reasonForJoining: z.string().min(20, 'Please provide at least 20 characters').max(2000),
  socialLinks: z.string().optional(),
  referralCode: z.string().optional(),
});

// Profile
export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

// Channel
export const createChannelSchema = z.object({
  name: z.string().min(2, 'Channel name must be at least 2 characters').max(50),
  description: z.string().min(10).max(1000),
  rules: z.string().max(5000).optional(),
});

export const updateChannelSchema = z.object({
  description: z.string().min(10).max(1000).optional(),
  rules: z.string().max(5000).optional(),
});

// Post
export const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(300),
  body: z.string().min(1, 'Post body is required').max(40000),
  mediaIds: z.array(z.string()).max(10).optional(),
});

export const editPostSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  body: z.string().min(1).max(40000).optional(),
});

// Reply
export const createReplySchema = z.object({
  body: z.string().min(1, 'Reply cannot be empty').max(10000),
  parentId: z.string().optional(),
});

export const editReplySchema = z.object({
  body: z.string().min(1).max(10000),
});

// Vote
export const voteSchema = z.object({
  type: z.enum(['UPVOTE', 'DOWNVOTE']),
});

// Report
export const reportSchema = z.object({
  reason: z.string().min(10, 'Please provide at least 10 characters').max(2000),
});

// Appeal
export const appealSchema = z.object({
  moderationLogId: z.string(),
  reason: z.string().min(20).max(5000),
});

// Moderation
export const modActionSchema = z.object({
  action: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().min(1, 'Reason is required').max(2000),
});

export const suspendUserSchema = z.object({
  reason: z.string().min(1).max(2000),
  durationHours: z.number().min(1).max(8760), // max 1 year
});

export const banUserSchema = z.object({
  reason: z.string().min(1).max(2000),
});

// Notification preferences
export const notificationPreferenceSchema = z.object({
  eventType: z.string(),
  inApp: z.boolean(),
  email: z.boolean(),
});

// Admin config
export const updateConfigSchema = z.object({
  value: z.unknown(),
});

// Pagination
export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});
