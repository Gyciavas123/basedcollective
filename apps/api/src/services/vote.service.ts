import { prisma } from '../config/database';
import { reputationService } from './reputation.service';
import { notificationService } from './notification.service';

export const voteService = {
  async voteOnPost(userId: string, postId: string, type: 'UPVOTE' | 'DOWNVOTE') {
    const post = await prisma.post.findUnique({ where: { id: postId }, include: { author: { select: { id: true } } } });
    if (!post || post.status !== 'APPROVED') throw new Error('Post not found');
    if (post.authorId === userId) throw new Error('Cannot vote on your own post');

    const existing = await prisma.vote.findUnique({ where: { userId_postId: { userId, postId } } });

    if (existing) {
      if (existing.type === type) throw new Error('Already voted');
      // Change vote
      await prisma.$transaction([
        prisma.vote.update({ where: { id: existing.id }, data: { type } }),
        prisma.post.update({
          where: { id: postId },
          data: {
            upvoteCount: type === 'UPVOTE' ? { increment: 1 } : { decrement: 1 },
            downvoteCount: type === 'DOWNVOTE' ? { increment: 1 } : { decrement: 1 },
          },
        }),
      ]);
      // Reverse old rep, apply new
      const oldPoints = existing.type === 'UPVOTE' ? -4 : 2;
      const newPoints = type === 'UPVOTE' ? 4 : -2;
      await reputationService.addEvent(post.authorId, type === 'UPVOTE' ? 'POST_UPVOTE' : 'POST_DOWNVOTE', oldPoints + newPoints, postId, undefined, userId);
    } else {
      await prisma.$transaction([
        prisma.vote.create({ data: { userId, postId, type, target: 'POST' } }),
        prisma.post.update({
          where: { id: postId },
          data: {
            upvoteCount: type === 'UPVOTE' ? { increment: 1 } : undefined,
            downvoteCount: type === 'DOWNVOTE' ? { increment: 1 } : undefined,
          },
        }),
      ]);
      const points = type === 'UPVOTE' ? 4 : -2;
      await reputationService.addEvent(post.authorId, type === 'UPVOTE' ? 'POST_UPVOTE' : 'POST_DOWNVOTE', points, postId, undefined, userId);

      if (type === 'UPVOTE') {
        await notificationService.create(post.authorId, 'UPVOTE_ON_POST', 'Your post was upvoted', 'Someone upvoted your post', { postId });
      }
    }
  },

  async voteOnReply(userId: string, replyId: string, type: 'UPVOTE' | 'DOWNVOTE') {
    const reply = await prisma.reply.findUnique({ where: { id: replyId } });
    if (!reply) throw new Error('Reply not found');
    if (reply.authorId === userId) throw new Error('Cannot vote on your own reply');

    const existing = await prisma.vote.findUnique({ where: { userId_replyId: { userId, replyId } } });

    if (existing) {
      if (existing.type === type) throw new Error('Already voted');
      await prisma.$transaction([
        prisma.vote.update({ where: { id: existing.id }, data: { type } }),
        prisma.reply.update({
          where: { id: replyId },
          data: {
            upvoteCount: type === 'UPVOTE' ? { increment: 1 } : { decrement: 1 },
            downvoteCount: type === 'DOWNVOTE' ? { increment: 1 } : { decrement: 1 },
          },
        }),
      ]);
      const oldPoints = existing.type === 'UPVOTE' ? -3 : 1;
      const newPoints = type === 'UPVOTE' ? 3 : -1;
      await reputationService.addEvent(reply.authorId, type === 'UPVOTE' ? 'COMMENT_UPVOTE' : 'COMMENT_DOWNVOTE', oldPoints + newPoints, undefined, replyId, userId);
    } else {
      await prisma.$transaction([
        prisma.vote.create({ data: { userId, replyId, type, target: 'REPLY' } }),
        prisma.reply.update({
          where: { id: replyId },
          data: {
            upvoteCount: type === 'UPVOTE' ? { increment: 1 } : undefined,
            downvoteCount: type === 'DOWNVOTE' ? { increment: 1 } : undefined,
          },
        }),
      ]);
      const points = type === 'UPVOTE' ? 3 : -1;
      await reputationService.addEvent(reply.authorId, type === 'UPVOTE' ? 'COMMENT_UPVOTE' : 'COMMENT_DOWNVOTE', points, undefined, replyId, userId);

      if (type === 'UPVOTE') {
        await notificationService.create(reply.authorId, 'UPVOTE_ON_COMMENT', 'Your comment was upvoted', 'Someone upvoted your comment', { postId: reply.postId, replyId });
      }
    }
  },

  async removeVoteOnPost(userId: string, postId: string) {
    const existing = await prisma.vote.findUnique({ where: { userId_postId: { userId, postId } } });
    if (!existing) throw new Error('No vote found');

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    await prisma.$transaction([
      prisma.vote.delete({ where: { id: existing.id } }),
      prisma.post.update({
        where: { id: postId },
        data: {
          upvoteCount: existing.type === 'UPVOTE' ? { decrement: 1 } : undefined,
          downvoteCount: existing.type === 'DOWNVOTE' ? { decrement: 1 } : undefined,
        },
      }),
    ]);

    const reversePoints = existing.type === 'UPVOTE' ? -4 : 2;
    await reputationService.addEvent(post.authorId, existing.type === 'UPVOTE' ? 'POST_UPVOTE' : 'POST_DOWNVOTE', reversePoints, postId, undefined, userId);
  },

  async removeVoteOnReply(userId: string, replyId: string) {
    const existing = await prisma.vote.findUnique({ where: { userId_replyId: { userId, replyId } } });
    if (!existing) throw new Error('No vote found');

    const reply = await prisma.reply.findUnique({ where: { id: replyId } });
    if (!reply) throw new Error('Reply not found');

    await prisma.$transaction([
      prisma.vote.delete({ where: { id: existing.id } }),
      prisma.reply.update({
        where: { id: replyId },
        data: {
          upvoteCount: existing.type === 'UPVOTE' ? { decrement: 1 } : undefined,
          downvoteCount: existing.type === 'DOWNVOTE' ? { decrement: 1 } : undefined,
        },
      }),
    ]);

    const reversePoints = existing.type === 'UPVOTE' ? -3 : 1;
    await reputationService.addEvent(reply.authorId, existing.type === 'UPVOTE' ? 'COMMENT_UPVOTE' : 'COMMENT_DOWNVOTE', reversePoints, undefined, replyId, userId);
  },
};
