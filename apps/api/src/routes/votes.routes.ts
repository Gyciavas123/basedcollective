import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { voteService } from '../services/vote.service';
import { validate } from '../utils/validation';
import { voteSchema } from '@basedcollective/shared';

export const votesRoutes = Router();

votesRoutes.post('/posts/:id/vote', authMiddleware, validate(voteSchema), async (req, res) => {
  try {
    await voteService.voteOnPost(req.user!.userId, req.params.id as string, req.body.type);
    res.json({ message: 'Vote recorded' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

votesRoutes.post('/replies/:id/vote', authMiddleware, validate(voteSchema), async (req, res) => {
  try {
    await voteService.voteOnReply(req.user!.userId, req.params.id as string, req.body.type);
    res.json({ message: 'Vote recorded' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

votesRoutes.delete('/posts/:id/vote', authMiddleware, async (req, res) => {
  try {
    await voteService.removeVoteOnPost(req.user!.userId, req.params.id as string);
    res.json({ message: 'Vote removed' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

votesRoutes.delete('/replies/:id/vote', authMiddleware, async (req, res) => {
  try {
    await voteService.removeVoteOnReply(req.user!.userId, req.params.id as string);
    res.json({ message: 'Vote removed' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
