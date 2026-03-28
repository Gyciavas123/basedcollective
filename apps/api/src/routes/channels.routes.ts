import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { channelService } from '../services/channel.service';
import { validate } from '../utils/validation';
import { createChannelSchema, updateChannelSchema } from '@basedcollective/shared';

export const channelsRoutes = Router();

channelsRoutes.get('/', authMiddleware, async (_req, res) => {
  try {
    const channels = await channelService.list();
    res.json(channels);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

channelsRoutes.get('/:slug', authMiddleware, async (req, res) => {
  try {
    const channel = await channelService.getBySlug(req.params.slug as string);
    const isMember = req.user ? await channelService.isMember(req.user.userId, channel.id) : false;
    res.json({ ...channel, isMember });
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

channelsRoutes.post('/', authMiddleware, validate(createChannelSchema), async (req, res) => {
  try {
    const channel = await channelService.create(req.user!.userId, req.body.name, req.body.description, req.body.rules);
    res.status(201).json(channel);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

channelsRoutes.post('/:slug/join', authMiddleware, async (req, res) => {
  try {
    await channelService.join(req.user!.userId, req.params.slug as string);
    res.json({ message: 'Joined channel' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

channelsRoutes.delete('/:slug/join', authMiddleware, async (req, res) => {
  try {
    await channelService.leave(req.user!.userId, req.params.slug as string);
    res.json({ message: 'Left channel' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

channelsRoutes.patch('/:slug', authMiddleware, validate(updateChannelSchema), async (req, res) => {
  try {
    const channel = await channelService.update(req.user!.userId, req.params.slug as string, req.body);
    res.json(channel);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
