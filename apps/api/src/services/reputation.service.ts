import { prisma } from '../config/database';
import { DEFAULT_STAR_THRESHOLDS } from '@basedcollective/shared';

export const reputationService = {
  async addEvent(
    userId: string,
    eventType: 'POST_UPVOTE' | 'POST_DOWNVOTE' | 'COMMENT_UPVOTE' | 'COMMENT_DOWNVOTE' | 'REPLY_RECEIVED' | 'LOW_EFFORT_POST' | 'POST_REMOVED_BY_MOD' | 'REFERRAL_ACCEPTED',
    basePoints: number,
    sourcePostId?: string,
    sourceReplyId?: string,
    sourceUserId?: string
  ) {
    // Load config
    const capsConfig = await prisma.platformConfig.findUnique({ where: { key: 'reputation.caps' } });
    const caps = (capsConfig?.value as any) ?? { perPost: 60, perComment: 30, dailyGain: 150 };

    let points = basePoints;

    // Per-content cap check
    if (sourcePostId && (eventType === 'POST_UPVOTE' || eventType === 'POST_DOWNVOTE')) {
      const post = await prisma.post.findUnique({ where: { id: sourcePostId } });
      if (post && points > 0 && post.reputationContributed + points > caps.perPost) {
        points = Math.max(0, caps.perPost - post.reputationContributed);
      }
      if (points > 0 && post) {
        await prisma.post.update({ where: { id: sourcePostId }, data: { reputationContributed: { increment: points } } });
      }
    }

    if (sourceReplyId && (eventType === 'COMMENT_UPVOTE' || eventType === 'COMMENT_DOWNVOTE')) {
      const reply = await prisma.reply.findUnique({ where: { id: sourceReplyId } });
      if (reply && points > 0 && reply.reputationContributed + points > caps.perComment) {
        points = Math.max(0, caps.perComment - reply.reputationContributed);
      }
      if (points > 0 && reply) {
        await prisma.reply.update({ where: { id: sourceReplyId }, data: { reputationContributed: { increment: points } } });
      }
    }

    // Daily gain cap (only for positive points)
    if (points > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyLog = await prisma.dailyReputationLog.upsert({
        where: { userId_date: { userId, date: today } },
        create: { userId, date: today, gainedToday: 0 },
        update: {},
      });

      if (dailyLog.gainedToday + points > caps.dailyGain) {
        points = Math.max(0, caps.dailyGain - dailyLog.gainedToday);
      }

      if (points > 0) {
        await prisma.dailyReputationLog.update({
          where: { userId_date: { userId, date: today } },
          data: { gainedToday: { increment: points } },
        });
      }
    }

    if (points === 0) return;

    // Create event
    await prisma.reputationEvent.create({
      data: { userId, eventType, points, sourcePostId, sourceReplyId, sourceUserId },
    });

    // Update user score and rank
    const user = await prisma.user.update({
      where: { id: userId },
      data: { reputationScore: { increment: points } },
    });

    // Recalculate star rank
    const newScore = user.reputationScore;
    const thresholdsConfig = await prisma.platformConfig.findUnique({ where: { key: 'reputation.thresholds' } });
    const thresholds = (thresholdsConfig?.value as number[]) ?? [...DEFAULT_STAR_THRESHOLDS];

    let newRank = 1;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (newScore >= thresholds[i]) {
        newRank = i + 1;
        break;
      }
    }

    if (newRank !== user.starRank) {
      await prisma.user.update({ where: { id: userId }, data: { starRank: newRank } });
    }
  },
};
