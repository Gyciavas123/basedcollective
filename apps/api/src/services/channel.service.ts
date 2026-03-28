import { prisma } from '../config/database';

export const channelService = {
  async create(userId: string, name: string, description: string, rules?: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await prisma.channel.findUnique({ where: { slug } });
    if (existing) throw new Error('Channel name already taken');

    return prisma.channel.create({
      data: { name, slug, description, rules, ownerId: userId, status: 'PENDING' },
    });
  },

  async list(status = 'ACTIVE') {
    return prisma.channel.findMany({
      where: { status: status as any },
      orderBy: { memberCount: 'desc' },
      select: {
        id: true, name: true, slug: true, description: true, status: true,
        postCount: true, memberCount: true, createdAt: true,
      },
    });
  },

  async getBySlug(slug: string) {
    const channel = await prisma.channel.findUnique({
      where: { slug },
      include: {
        owner: { select: { id: true, displayName: true, slug: true } },
      },
    });
    if (!channel) throw new Error('Channel not found');
    return channel;
  },

  async join(userId: string, channelSlug: string) {
    const channel = await prisma.channel.findUnique({ where: { slug: channelSlug } });
    if (!channel || channel.status !== 'ACTIVE') throw new Error('Channel not found');

    const existing = await prisma.channelMember.findUnique({
      where: { userId_channelId: { userId, channelId: channel.id } },
    });
    if (existing) throw new Error('Already a member');

    await prisma.$transaction([
      prisma.channelMember.create({ data: { userId, channelId: channel.id } }),
      prisma.channel.update({ where: { id: channel.id }, data: { memberCount: { increment: 1 } } }),
    ]);
  },

  async leave(userId: string, channelSlug: string) {
    const channel = await prisma.channel.findUnique({ where: { slug: channelSlug } });
    if (!channel) throw new Error('Channel not found');

    const membership = await prisma.channelMember.findUnique({
      where: { userId_channelId: { userId, channelId: channel.id } },
    });
    if (!membership) throw new Error('Not a member');

    await prisma.$transaction([
      prisma.channelMember.delete({ where: { id: membership.id } }),
      prisma.channel.update({ where: { id: channel.id }, data: { memberCount: { decrement: 1 } } }),
    ]);
  },

  async update(userId: string, channelSlug: string, data: { description?: string; rules?: string }) {
    const channel = await prisma.channel.findUnique({ where: { slug: channelSlug } });
    if (!channel) throw new Error('Channel not found');
    if (channel.ownerId !== userId) throw new Error('Only the channel owner can update');
    return prisma.channel.update({ where: { id: channel.id }, data });
  },

  async isMember(userId: string, channelId: string): Promise<boolean> {
    const member = await prisma.channelMember.findUnique({
      where: { userId_channelId: { userId, channelId } },
    });
    return !!member;
  },
};
