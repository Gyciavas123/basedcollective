import { prisma } from '../config/database';
import { reputationService } from './reputation.service';
import { notificationService } from './notification.service';

export const replyService = {
  async create(postId: string, authorId: string, body: string, parentId?: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.status !== 'APPROVED') throw new Error('Post not found');

    if (parentId) {
      const parent = await prisma.reply.findUnique({ where: { id: parentId } });
      if (!parent || parent.postId !== postId) throw new Error('Parent reply not found');
    }

    const reply = await prisma.reply.create({
      data: { postId, authorId, body, parentId },
      include: {
        author: { select: { id: true, displayName: true, slug: true, avatar: true, starRank: true, worldcoinVerifiedAt: true, role: true, createdAt: true, bio: true } },
      },
    });

    // Update denormalized reply count
    await prisma.post.update({ where: { id: postId }, data: { replyCount: { increment: 1 } } });

    // Reputation: +2 to post author for reply received
    if (post.authorId !== authorId) {
      await reputationService.addEvent(post.authorId, 'REPLY_RECEIVED', 2, postId, undefined, authorId);
      await notificationService.create(post.authorId, 'REPLY_TO_POST', 'New reply on your post', `${reply.author.displayName} replied to your post`, { postId, replyId: reply.id });
    }

    // Notify parent reply author
    if (parentId) {
      const parent = await prisma.reply.findUnique({ where: { id: parentId }, select: { authorId: true } });
      if (parent && parent.authorId !== authorId) {
        await notificationService.create(parent.authorId, 'REPLY_TO_COMMENT', 'New reply to your comment', `${reply.author.displayName} replied to your comment`, { postId, replyId: reply.id });
      }
    }

    return reply;
  },

  async edit(replyId: string, userId: string, body: string) {
    const reply = await prisma.reply.findUnique({ where: { id: replyId } });
    if (!reply) throw new Error('Reply not found');
    if (reply.authorId !== userId) throw new Error('Not the author');
    return prisma.reply.update({ where: { id: replyId }, data: { body } });
  },

  async delete(replyId: string, userId: string) {
    const reply = await prisma.reply.findUnique({ where: { id: replyId } });
    if (!reply) throw new Error('Reply not found');
    if (reply.authorId !== userId) throw new Error('Not the author');

    await prisma.$transaction([
      prisma.reply.delete({ where: { id: replyId } }),
      prisma.post.update({ where: { id: reply.postId }, data: { replyCount: { decrement: 1 } } }),
    ]);
  },
};
