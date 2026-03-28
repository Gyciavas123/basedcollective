import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { replyService } from '../services/reply.service';
import { validate } from '../utils/validation';
import { createReplySchema, editReplySchema, reportSchema } from '@basedcollective/shared';
import { prisma } from '../config/database';

export const repliesRoutes = Router();

repliesRoutes.post('/posts/:id/replies', authMiddleware, validate(createReplySchema), async (req, res) => {
  try {
    const reply = await replyService.create(req.params.id as string, req.user!.userId, req.body.body, req.body.parentId);
    res.status(201).json(reply);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

repliesRoutes.patch('/:id', authMiddleware, validate(editReplySchema), async (req, res) => {
  try {
    const reply = await replyService.edit(req.params.id as string, req.user!.userId, req.body.body);
    res.json(reply);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

repliesRoutes.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await replyService.delete(req.params.id as string, req.user!.userId);
    res.json({ message: 'Reply deleted' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

repliesRoutes.post('/:id/report', authMiddleware, validate(reportSchema), async (req, res) => {
  try {
    const reply = await prisma.reply.findUnique({ where: { id: req.params.id as string } });
    if (!reply) return res.status(404).json({ error: 'Reply not found' });
    await prisma.report.create({
      data: { reporterId: req.user!.userId, replyId: req.params.id as string, targetUserId: reply.authorId, reason: req.body.reason },
    });
    res.json({ message: 'Report submitted' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
