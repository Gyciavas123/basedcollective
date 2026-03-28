import { prisma } from '../config/database';

export const userService = {
  async getBySlug(slug: string) {
    const user = await prisma.user.findUnique({
      where: { slug },
      select: {
        id: true, displayName: true, slug: true, avatar: true, bio: true,
        role: true, starRank: true, worldcoinVerifiedAt: true, createdAt: true,
        reputationScore: true,
        _count: { select: { posts: { where: { status: 'APPROVED' } }, referralCodesOwned: { where: { usedById: { not: null } } } } },
      },
    });
    if (!user) throw new Error('User not found');
    return user;
  },

  async getUserPosts(slug: string, cursor?: string, limit = 20) {
    const user = await prisma.user.findUnique({ where: { slug }, select: { id: true } });
    if (!user) throw new Error('User not found');

    return prisma.post.findMany({
      where: { authorId: user.id, status: 'APPROVED' },
      include: {
        author: { select: { id: true, displayName: true, slug: true, avatar: true, starRank: true, worldcoinVerifiedAt: true, role: true, createdAt: true, bio: true } },
        channel: { select: { name: true, slug: true } },
        media: { where: { isValid: true }, select: { id: true, url: true, type: true, mimeType: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  },

  async updateProfile(userId: string, data: { displayName?: string; bio?: string; avatar?: string }) {
    return prisma.user.update({ where: { id: userId }, data });
  },

  async getDashboard(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, displayName: true, slug: true, avatar: true, bio: true,
        role: true, status: true, starRank: true, reputationScore: true,
        worldcoinVerifiedAt: true, googleId: true, createdAt: true,
      },
    });
    if (!user) throw new Error('User not found');

    const [postUpvotes, commentUpvotes, repliesReceived, referrals, penalties] = await Promise.all([
      prisma.reputationEvent.aggregate({ where: { userId, eventType: 'POST_UPVOTE' }, _sum: { points: true } }),
      prisma.reputationEvent.aggregate({ where: { userId, eventType: 'COMMENT_UPVOTE' }, _sum: { points: true } }),
      prisma.reputationEvent.aggregate({ where: { userId, eventType: 'REPLY_RECEIVED' }, _sum: { points: true } }),
      prisma.reputationEvent.aggregate({ where: { userId, eventType: 'REFERRAL_ACCEPTED' }, _sum: { points: true } }),
      prisma.reputationEvent.aggregate({ where: { userId, eventType: { in: ['POST_DOWNVOTE', 'COMMENT_DOWNVOTE', 'LOW_EFFORT_POST', 'POST_REMOVED_BY_MOD'] } }, _sum: { points: true } }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyLog = await prisma.dailyReputationLog.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    const referralCodes = await prisma.referralCode.findMany({
      where: { ownerId: userId, expiresAt: { gt: new Date() }, usedById: null },
      orderBy: { createdAt: 'desc' },
    });

    return {
      user,
      reputationBreakdown: {
        postUpvotes: postUpvotes._sum.points ?? 0,
        commentUpvotes: commentUpvotes._sum.points ?? 0,
        repliesReceived: repliesReceived._sum.points ?? 0,
        referrals: referrals._sum.points ?? 0,
        penalties: penalties._sum.points ?? 0,
      },
      referralCodes,
      todayGain: dailyLog?.gainedToday ?? 0,
      dailyCap: 150,
    };
  },
};
