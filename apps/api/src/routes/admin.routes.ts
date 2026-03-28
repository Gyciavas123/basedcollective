import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { prisma } from '../config/database';

export const adminRoutes = Router();

adminRoutes.use(authMiddleware, requireRole('ADMIN'));

adminRoutes.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    await prisma.moderationLog.create({
      data: {
        actionType: role === 'USER' ? 'ROLE_REVOKED' : 'ROLE_ASSIGNED',
        actorId: req.user!.userId,
        targetUserId: req.params.id,
        reason: `Role changed to ${role}`,
      },
    });
    res.json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

adminRoutes.get('/config', async (_req, res) => {
  try {
    const configs = await prisma.platformConfig.findMany();
    res.json(configs);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

adminRoutes.patch('/config/:key', async (req, res) => {
  try {
    const config = await prisma.platformConfig.upsert({
      where: { key: req.params.key },
      update: { value: req.body.value },
      create: { key: req.params.key, value: req.body.value },
    });
    res.json(config);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

adminRoutes.post('/channels/:id/archive', async (req, res) => {
  try {
    await prisma.$transaction([
      prisma.channel.update({ where: { id: req.params.id }, data: { status: 'ARCHIVED' } }),
      prisma.moderationLog.create({
        data: { actionType: 'CHANNEL_ARCHIVED', actorId: req.user!.userId, targetChannelId: req.params.id, reason: req.body.reason || 'Archived by admin' },
      }),
    ]);
    res.json({ message: 'Channel archived' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
