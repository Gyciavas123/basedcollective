import 'dotenv/config';
import express from 'express';
import { corsMiddleware } from './config/cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { authRoutes } from './routes/auth.routes';
import { usersRoutes } from './routes/users.routes';
import { channelsRoutes } from './routes/channels.routes';
import { postsRoutes } from './routes/posts.routes';
import { repliesRoutes } from './routes/replies.routes';
import { votesRoutes } from './routes/votes.routes';
import { moderationRoutes } from './routes/moderation.routes';
import { notificationsRoutes } from './routes/notifications.routes';
import { referralsRoutes } from './routes/referrals.routes';
import { adminRoutes } from './routes/admin.routes';
import { complianceRoutes } from './routes/compliance.routes';
import { uploadsRoutes } from './routes/uploads.routes';
import { startCronJobs } from './jobs';

const app = express();

// Global middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
if (process.env.NODE_ENV === 'production') {
  app.use(generalLimiter);
}

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/channels', channelsRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/v1/replies', repliesRoutes);
app.use('/api/v1/votes', votesRoutes);
app.use('/api/v1/mod', moderationRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/referrals', referralsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/compliance', complianceRoutes);
app.use('/api/v1/uploads', uploadsRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`API server running on port ${env.PORT}`);
  startCronJobs();
});

export default app;
