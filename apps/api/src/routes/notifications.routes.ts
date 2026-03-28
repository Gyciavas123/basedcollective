import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { notificationService } from '../services/notification.service';

export const notificationsRoutes = Router();

notificationsRoutes.use(authMiddleware);

notificationsRoutes.get('/', async (req, res) => {
  try {
    const result = await notificationService.list(req.user!.userId, req.query.cursor as string, Number(req.query.limit) || 20);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

notificationsRoutes.get('/unread-count', async (req, res) => {
  try {
    const count = await notificationService.unreadCount(req.user!.userId);
    res.json({ count });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

notificationsRoutes.patch('/:id/read', async (req, res) => {
  try {
    await notificationService.markRead(req.params.id as string, req.user!.userId);
    res.json({ message: 'Marked as read' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

notificationsRoutes.post('/read-all', async (req, res) => {
  try {
    await notificationService.markAllRead(req.user!.userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

notificationsRoutes.get('/preferences', async (req, res) => {
  try {
    const prefs = await notificationService.getPreferences(req.user!.userId);
    res.json(prefs);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

notificationsRoutes.patch('/preferences', async (req, res) => {
  try {
    await notificationService.updatePreference(req.user!.userId, req.body.eventType, req.body.inApp, req.body.email);
    res.json({ message: 'Preference updated' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
