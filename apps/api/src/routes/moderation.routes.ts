import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { moderationService } from '../services/moderation.service';
import { validate } from '../utils/validation';
import { modActionSchema, suspendUserSchema, banUserSchema } from '@basedcollective/shared';

export const moderationRoutes = Router();

moderationRoutes.use(authMiddleware, requireRole('MODERATOR', 'ADMIN'));

moderationRoutes.get('/dashboard', async (_req, res) => {
  try {
    const summary = await moderationService.getDashboard();
    res.json(summary);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Applications
moderationRoutes.get('/applications', async (_req, res) => {
  try {
    const apps = await moderationService.getPendingApplications();
    res.json(apps);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

moderationRoutes.patch('/applications/:id', async (req, res) => {
  try {
    if (req.body.action === 'APPROVED') {
      await moderationService.approveApplication(req.params.id as string, req.user!.userId);
    } else {
      await moderationService.rejectApplication(req.params.id as string, req.user!.userId, req.body.reason || 'Rejected');
    }
    res.json({ message: 'Application processed' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Posts
moderationRoutes.get('/posts', async (_req, res) => {
  try {
    const posts = await moderationService.getPendingPosts();
    res.json(posts);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

moderationRoutes.patch('/posts/:id', validate(modActionSchema), async (req, res) => {
  try {
    if (req.body.action === 'APPROVED') {
      await moderationService.approvePost(req.params.id as string, req.user!.userId, req.body.reason);
    } else {
      await moderationService.rejectPost(req.params.id as string, req.user!.userId, req.body.reason);
    }
    res.json({ message: 'Post processed' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

moderationRoutes.delete('/posts/:id', async (req, res) => {
  try {
    await moderationService.removePost(req.params.id as string, req.user!.userId, req.body.reason || 'Removed by moderator');
    res.json({ message: 'Post removed' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

moderationRoutes.delete('/replies/:id', async (req, res) => {
  try {
    await moderationService.removeReply(req.params.id as string, req.user!.userId, req.body.reason || 'Removed by moderator');
    res.json({ message: 'Reply removed' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Channels
moderationRoutes.get('/channels', async (_req, res) => {
  try {
    const channels = await moderationService.getPendingChannels();
    res.json(channels);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

moderationRoutes.patch('/channels/:id', async (req, res) => {
  try {
    if (req.body.action === 'APPROVED') {
      await moderationService.approveChannel(req.params.id as string, req.user!.userId, req.body.reason || 'Approved');
    } else {
      await moderationService.rejectChannel(req.params.id as string, req.user!.userId, req.body.reason || 'Rejected');
    }
    res.json({ message: 'Channel processed' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Reports
moderationRoutes.get('/reports', async (_req, res) => {
  try {
    const reports = await moderationService.getReports();
    res.json(reports);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

moderationRoutes.patch('/reports/:id', async (req, res) => {
  try {
    await moderationService.resolveReport(req.params.id as string, req.user!.userId);
    res.json({ message: 'Report resolved' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Users
moderationRoutes.post('/users/:id/suspend', validate(suspendUserSchema), async (req, res) => {
  try {
    await moderationService.suspendUser(req.params.id as string, req.user!.userId, req.body.reason, req.body.durationHours);
    res.json({ message: 'User suspended' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

moderationRoutes.post('/users/:id/unsuspend', async (req, res) => {
  try {
    await moderationService.unsuspendUser(req.params.id as string, req.user!.userId);
    res.json({ message: 'User unsuspended' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

moderationRoutes.post('/users/:id/ban', requireRole('ADMIN'), validate(banUserSchema), async (req, res) => {
  try {
    await moderationService.banUser(req.params.id as string, req.user!.userId, req.body.reason);
    res.json({ message: 'User banned' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Appeals
moderationRoutes.get('/appeals', async (_req, res) => {
  try {
    const appeals = await moderationService.getAppeals('PENDING');
    res.json(appeals);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

moderationRoutes.patch('/appeals/:id', async (req, res) => {
  try {
    await moderationService.resolveAppeal(req.params.id as string, req.user!.userId, req.body.status, req.body.reviewNote);
    res.json({ message: 'Appeal processed' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Log
moderationRoutes.get('/log', async (req, res) => {
  try {
    const log = await moderationService.getLog(req.query.cursor as string);
    res.json(log);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
