import { prisma } from '../config/database';
import { notificationService } from './notification.service';
import { reputationService } from './reputation.service';

export const moderationService = {
  async getDashboard() {
    const [pendingApplications, pendingPosts, pendingChannels, openReports, pendingAppeals] = await Promise.all([
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.post.count({ where: { status: 'STAGING' } }),
      prisma.channel.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { resolved: false } }),
      prisma.appeal.count({ where: { status: 'PENDING' } }),
    ]);
    return { pendingApplications, pendingPosts, pendingChannels, openReports, pendingAppeals };
  },

  async approvePost(postId: string, actorId: string, reason: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.status !== 'STAGING') throw new Error('Post not found or not in staging');

    await prisma.$transaction([
      prisma.post.update({ where: { id: postId }, data: { status: 'APPROVED', approvedAt: new Date() } }),
      prisma.channel.update({ where: { id: post.channelId }, data: { postCount: { increment: 1 } } }),
      prisma.moderationLog.create({ data: { actionType: 'POST_APPROVED', actorId, targetPostId: postId, reason } }),
    ]);

    await notificationService.create(post.authorId, 'POST_APPROVED', 'Post approved', 'Your post has been approved and is now live', { postId });
  },

  async rejectPost(postId: string, actorId: string, reason: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.status !== 'STAGING') throw new Error('Post not found or not in staging');

    await prisma.$transaction([
      prisma.post.update({ where: { id: postId }, data: { status: 'REJECTED', rejectionReason: reason } }),
      prisma.moderationLog.create({ data: { actionType: 'POST_REJECTED', actorId, targetPostId: postId, reason } }),
    ]);

    await notificationService.create(post.authorId, 'POST_REJECTED', 'Post rejected', `Your post was rejected: ${reason}`, { postId });
  },

  async removePost(postId: string, actorId: string, reason: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    await prisma.$transaction([
      prisma.post.update({ where: { id: postId }, data: { status: 'REMOVED' } }),
      prisma.channel.update({ where: { id: post.channelId }, data: { postCount: { decrement: 1 } } }),
      prisma.moderationLog.create({ data: { actionType: 'POST_REMOVED', actorId, targetUserId: post.authorId, targetPostId: postId, reason } }),
    ]);

    await reputationService.addEvent(post.authorId, 'POST_REMOVED_BY_MOD', -5, postId);
  },

  async removeReply(replyId: string, actorId: string, reason: string) {
    const reply = await prisma.reply.findUnique({ where: { id: replyId } });
    if (!reply) throw new Error('Reply not found');

    await prisma.$transaction([
      prisma.reply.delete({ where: { id: replyId } }),
      prisma.post.update({ where: { id: reply.postId }, data: { replyCount: { decrement: 1 } } }),
      prisma.moderationLog.create({ data: { actionType: 'REPLY_REMOVED', actorId, targetUserId: reply.authorId, targetReplyId: replyId, reason } }),
    ]);
  },

  async approveChannel(channelId: string, actorId: string, reason: string) {
    await prisma.$transaction([
      prisma.channel.update({ where: { id: channelId }, data: { status: 'ACTIVE' } }),
      prisma.moderationLog.create({ data: { actionType: 'CHANNEL_APPROVED', actorId, targetChannelId: channelId, reason } }),
    ]);
  },

  async rejectChannel(channelId: string, actorId: string, reason: string) {
    await prisma.$transaction([
      prisma.channel.update({ where: { id: channelId }, data: { status: 'DISABLED' } }),
      prisma.moderationLog.create({ data: { actionType: 'CHANNEL_REJECTED', actorId, targetChannelId: channelId, reason } }),
    ]);
  },

  async suspendUser(targetUserId: string, actorId: string, reason: string, durationHours: number) {
    const suspendedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.user.update({ where: { id: targetUserId }, data: { status: 'SUSPENDED', suspendedUntil } }),
      prisma.moderationLog.create({ data: { actionType: 'USER_SUSPENDED', actorId, targetUserId, reason, metadata: { durationHours, suspendedUntil } } }),
    ]);

    await notificationService.create(targetUserId, 'ACCOUNT_SUSPENDED', 'Account suspended', `Your account has been suspended: ${reason}`, { suspendedUntil: suspendedUntil.toISOString() });
  },

  async unsuspendUser(targetUserId: string, actorId: string) {
    await prisma.$transaction([
      prisma.user.update({ where: { id: targetUserId }, data: { status: 'ACTIVE', suspendedUntil: null } }),
      prisma.moderationLog.create({ data: { actionType: 'USER_UNSUSPENDED', actorId, targetUserId, reason: 'Unsuspended by moderator' } }),
    ]);
  },

  async banUser(targetUserId: string, actorId: string, reason: string) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new Error('User not found');

    await prisma.$transaction([
      prisma.user.update({ where: { id: targetUserId }, data: { status: 'BANNED', bannedAt: new Date() } }),
      prisma.moderationLog.create({ data: { actionType: 'USER_BANNED', actorId, targetUserId, reason } }),
      // Store Worldcoin hash if present
      ...(user.worldcoinHash
        ? [prisma.bannedWorldcoinHash.create({ data: { worldcoinHash: user.worldcoinHash, reason } })]
        : []),
      // Invalidate all sessions
      prisma.session.deleteMany({ where: { userId: targetUserId } }),
    ]);
  },

  async approveApplication(applicationId: string, actorId: string) {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app || app.status !== 'PENDING') throw new Error('Application not found or already processed');

    await prisma.$transaction([
      prisma.application.update({ where: { id: applicationId }, data: { status: 'APPROVED', reviewedBy: actorId, reviewedAt: new Date() } }),
      prisma.user.update({ where: { id: app.userId }, data: { status: 'PENDING_VERIFICATION' } }),
      prisma.moderationLog.create({ data: { actionType: 'APPLICATION_APPROVED', actorId, targetUserId: app.userId, reason: 'Application approved' } }),
    ]);
  },

  async rejectApplication(applicationId: string, actorId: string, reason: string) {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app || app.status !== 'PENDING') throw new Error('Application not found or already processed');

    await prisma.$transaction([
      prisma.application.update({ where: { id: applicationId }, data: { status: 'REJECTED', reviewedBy: actorId, reviewedAt: new Date(), rejectionReason: reason } }),
      prisma.moderationLog.create({ data: { actionType: 'APPLICATION_REJECTED', actorId, targetUserId: app.userId, reason } }),
    ]);
  },

  async getAppeals(status?: string) {
    return prisma.appeal.findMany({
      where: status ? { status: status as any } : undefined,
      include: { user: { select: { id: true, displayName: true, slug: true } } },
      orderBy: { createdAt: 'asc' },
    });
  },

  async resolveAppeal(appealId: string, actorId: string, status: 'APPROVED' | 'REJECTED', reviewNote?: string) {
    const appeal = await prisma.appeal.findUnique({ where: { id: appealId } });
    if (!appeal || appeal.status !== 'PENDING') throw new Error('Appeal not found or already resolved');

    // Ensure different reviewer
    const originalAction = await prisma.moderationLog.findUnique({ where: { id: appeal.moderationLogId } });
    if (originalAction?.actorId === actorId) throw new Error('Appeal must be reviewed by a different moderator');

    await prisma.$transaction([
      prisma.appeal.update({ where: { id: appealId }, data: { status, reviewedBy: actorId, reviewedAt: new Date(), reviewNote } }),
      prisma.moderationLog.create({ data: { actionType: status === 'APPROVED' ? 'APPEAL_APPROVED' : 'APPEAL_REJECTED', actorId, targetUserId: appeal.userId, reason: reviewNote ?? `Appeal ${status.toLowerCase()}` } }),
    ]);

    if (status === 'APPROVED') {
      // Reverse the original action (unsuspend/unban)
      await prisma.user.update({ where: { id: appeal.userId }, data: { status: 'ACTIVE', suspendedUntil: null, bannedAt: null } });
    }

    await notificationService.create(appeal.userId, 'APPEAL_OUTCOME', 'Appeal decision', `Your appeal has been ${status.toLowerCase()}`, { appealId });
  },

  async getLog(cursor?: string, limit = 50) {
    return prisma.moderationLog.findMany({
      include: {
        actor: { select: { id: true, displayName: true } },
        targetUser: { select: { id: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  },

  async getReports(resolved = false) {
    return prisma.report.findMany({
      where: { resolved },
      include: {
        reporter: { select: { id: true, displayName: true } },
        targetUser: { select: { id: true, displayName: true } },
        post: { select: { id: true, title: true } },
        reply: { select: { id: true, body: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  async resolveReport(reportId: string, resolvedBy: string) {
    await prisma.report.update({
      where: { id: reportId },
      data: { resolved: true, resolvedBy, resolvedAt: new Date() },
    });
  },

  async getPendingPosts() {
    return prisma.post.findMany({
      where: { status: 'STAGING' },
      include: {
        author: { select: { id: true, displayName: true, slug: true, starRank: true } },
        channel: { select: { name: true, slug: true } },
        media: { select: { id: true, url: true, type: true, mimeType: true, isValid: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  async getPendingChannels() {
    return prisma.channel.findMany({
      where: { status: 'PENDING' },
      include: { owner: { select: { id: true, displayName: true, slug: true } } },
      orderBy: { createdAt: 'asc' },
    });
  },

  async getPendingApplications() {
    return prisma.application.findMany({
      where: { status: 'PENDING' },
      include: { referralCode: { select: { code: true, owner: { select: { displayName: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
  },
};
