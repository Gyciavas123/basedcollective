import { prisma } from '../config/database';

const postSelect = {
  id: true, title: true, body: true, status: true,
  upvoteCount: true, downvoteCount: true, replyCount: true, score: true,
  createdAt: true, approvedAt: true,
  author: { select: { id: true, displayName: true, slug: true, avatar: true, starRank: true, worldcoinVerifiedAt: true, role: true, createdAt: true, bio: true } },
  channel: { select: { name: true, slug: true } },
  media: { where: { isValid: true }, select: { id: true, url: true, type: true, mimeType: true } },
} as const;

export const feedService = {
  async personalised(userId: string, cursor?: string, limit = 20) {
    const memberships = await prisma.channelMember.findMany({
      where: { userId },
      select: { channelId: true },
    });
    const channelIds = memberships.map((m) => m.channelId);

    if (channelIds.length === 0) return { data: [], nextCursor: null, hasMore: false };

    const posts = await prisma.post.findMany({
      where: { channelId: { in: channelIds }, status: 'APPROVED' },
      select: postSelect,
      orderBy: { score: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  },

  async trending(cursor?: string, limit = 20) {
    const posts = await prisma.post.findMany({
      where: {
        status: 'APPROVED',
        approvedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: postSelect,
      orderBy: { score: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  },

  async global(cursor?: string, limit = 20) {
    const posts = await prisma.post.findMany({
      where: { status: 'APPROVED' },
      select: postSelect,
      orderBy: { score: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  },

  async channelHot(channelSlug: string, cursor?: string, limit = 20) {
    const channel = await prisma.channel.findUnique({ where: { slug: channelSlug } });
    if (!channel) throw new Error('Channel not found');

    const posts = await prisma.post.findMany({
      where: { channelId: channel.id, status: 'APPROVED' },
      select: postSelect,
      orderBy: { score: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  },

  async channelNew(channelSlug: string, cursor?: string, limit = 20) {
    const channel = await prisma.channel.findUnique({ where: { slug: channelSlug } });
    if (!channel) throw new Error('Channel not found');

    const posts = await prisma.post.findMany({
      where: { channelId: channel.id, status: 'APPROVED' },
      select: postSelect,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  },
};
