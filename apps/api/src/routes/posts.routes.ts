import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { postService } from '../services/post.service';
import { feedService } from '../services/feed.service';
import { validate } from '../utils/validation';
import { createPostSchema, editPostSchema, reportSchema } from '@basedcollective/shared';
import { prisma } from '../config/database';

export const postsRoutes = Router();

// Create post in channel
postsRoutes.post('/channels/:slug/posts', authMiddleware, validate(createPostSchema), async (req, res) => {
  try {
    const post = await postService.create(req.user!.userId, req.params.slug as string, req.body.title, req.body.body, req.body.mediaIds);
    res.status(201).json(post);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Get post by ID
postsRoutes.get('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await postService.getById(req.params.id as string, req.user?.userId);
    res.json(post);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

// Edit post
postsRoutes.patch('/:id', authMiddleware, validate(editPostSchema), async (req, res) => {
  try {
    const post = await postService.edit(req.params.id as string, req.user!.userId, req.body);
    res.json(post);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Delete post
postsRoutes.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await postService.delete(req.params.id as string, req.user!.userId);
    res.json({ message: 'Post deleted' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Report post
postsRoutes.post('/:id/report', authMiddleware, validate(reportSchema), async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id as string } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await prisma.report.create({
      data: { reporterId: req.user!.userId, postId: req.params.id as string, targetUserId: post.authorId, reason: req.body.reason },
    });
    res.json({ message: 'Report submitted' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Save/bookmark
postsRoutes.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    await prisma.savedPost.create({ data: { userId: req.user!.userId, postId: req.params.id as string } });
    res.json({ message: 'Post saved' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

postsRoutes.delete('/:id/save', authMiddleware, async (req, res) => {
  try {
    await prisma.savedPost.deleteMany({ where: { userId: req.user!.userId, postId: req.params.id as string } });
    res.json({ message: 'Bookmark removed' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Saved posts list
postsRoutes.get('/saved/list', authMiddleware, async (req, res) => {
  try {
    const saved = await prisma.savedPost.findMany({
      where: { userId: req.user!.userId },
      include: {
        post: {
          include: {
            author: { select: { id: true, displayName: true, slug: true, avatar: true, starRank: true } },
            channel: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });
    res.json(saved);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Enrich posts with user-specific data (vote, saved)
async function enrichPostsForUser(posts: any[], userId?: string) {
  if (!userId || posts.length === 0) return posts;
  const postIds = posts.map((p) => p.id);
  const [votes, saved] = await Promise.all([
    prisma.vote.findMany({ where: { userId, postId: { in: postIds } }, select: { postId: true, type: true } }),
    prisma.savedPost.findMany({ where: { userId, postId: { in: postIds } }, select: { postId: true } }),
  ]);
  const voteMap = new Map(votes.map((v) => [v.postId, v.type]));
  const savedSet = new Set(saved.map((s) => s.postId));
  return posts.map((p) => ({ ...p, userVote: voteMap.get(p.id) || null, isSaved: savedSet.has(p.id) }));
}

// Feeds
postsRoutes.get('/feed/personalised', authMiddleware, async (req, res) => {
  try {
    const result = await feedService.personalised(req.user!.userId, req.query.cursor as string, Number(req.query.limit) || 20);
    result.data = await enrichPostsForUser(result.data, req.user?.userId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

postsRoutes.get('/feed/trending', authMiddleware, async (req, res) => {
  try {
    const result = await feedService.trending(req.query.cursor as string, Number(req.query.limit) || 20);
    result.data = await enrichPostsForUser(result.data, req.user?.userId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

postsRoutes.get('/feed/all', authMiddleware, async (req, res) => {
  try {
    const result = await feedService.global(req.query.cursor as string, Number(req.query.limit) || 20);
    result.data = await enrichPostsForUser(result.data, req.user?.userId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

postsRoutes.get('/channels/:slug/hot', authMiddleware, async (req, res) => {
  try {
    const result = await feedService.channelHot(req.params.slug as string, req.query.cursor as string, Number(req.query.limit) || 20);
    result.data = await enrichPostsForUser(result.data, req.user?.userId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

postsRoutes.get('/channels/:slug/new', authMiddleware, async (req, res) => {
  try {
    const result = await feedService.channelNew(req.params.slug as string, req.query.cursor as string, Number(req.query.limit) || 20);
    result.data = await enrichPostsForUser(result.data, req.user?.userId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
