import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { userService } from '../services/user.service';
import { validate } from '../utils/validation';
import { updateProfileSchema } from '@basedcollective/shared';
import { worldcoinService } from '../services/worldcoin.service';

export const usersRoutes = Router();

usersRoutes.get('/me/dashboard', authMiddleware, async (req, res) => {
  try {
    const dashboard = await userService.getDashboard(req.user!.userId);
    res.json(dashboard);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

usersRoutes.patch('/me', authMiddleware, validate(updateProfileSchema), async (req, res) => {
  try {
    const user = await userService.updateProfile(req.user!.userId, req.body);
    res.json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

usersRoutes.get('/:slug', authMiddleware, async (req, res) => {
  try {
    const user = await userService.getBySlug(req.params.slug as string);
    res.json(user);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

usersRoutes.get('/:slug/posts', authMiddleware, async (req, res) => {
  try {
    const posts = await userService.getUserPosts(req.params.slug as string, req.query.cursor as string, Number(req.query.limit) || 20);
    res.json(posts);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

// Worldcoin verification
usersRoutes.post('/verify/worldcoin', authMiddleware, async (req, res) => {
  try {
    const result = await worldcoinService.verify(req.user!.userId, req.body);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

usersRoutes.get('/verify/status', authMiddleware, async (req, res) => {
  try {
    const status = await worldcoinService.getStatus(req.user!.userId);
    res.json(status);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
