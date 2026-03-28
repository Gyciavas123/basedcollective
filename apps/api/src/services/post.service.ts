import { prisma } from '../config/database';

export const postService = {
  async create(authorId: string, channelSlug: string, title: string, body: string, mediaIds?: string[]) {
    const channel = await prisma.channel.findUnique({ where: { slug: channelSlug } });
    if (!channel || channel.status !== 'ACTIVE') throw new Error('Channel not found');

    const post = await prisma.post.create({
      data: {
        channelId: channel.id,
        authorId,
        title,
        body,
        status: mediaIds?.length ? 'PROCESSING' : 'STAGING',
      },
    });

    if (mediaIds?.length) {
      await prisma.postMedia.updateMany({
        where: { id: { in: mediaIds } },
        data: { postId: post.id },
      });
      // Check if all media is already valid
      const invalidMedia = await prisma.postMedia.count({
        where: { postId: post.id, isValid: false },
      });
      if (invalidMedia === 0) {
        await prisma.post.update({ where: { id: post.id }, data: { status: 'STAGING' } });
      }
    }

    return post;
  },

  async getById(postId: string, userId?: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, displayName: true, slug: true, avatar: true, starRank: true, worldcoinVerifiedAt: true, role: true, createdAt: true, bio: true } },
        channel: { select: { name: true, slug: true } },
        media: { where: { isValid: true }, select: { id: true, url: true, type: true, mimeType: true } },
        replies: {
          include: {
            author: { select: { id: true, displayName: true, slug: true, avatar: true, starRank: true, worldcoinVerifiedAt: true, role: true, createdAt: true, bio: true } },
            votes: userId ? { where: { userId }, select: { type: true } } : false,
          },
          orderBy: { createdAt: 'asc' },
        },
        votes: userId ? { where: { userId }, select: { type: true } } : false,
        savedBy: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });

    if (!post) throw new Error('Post not found');
    return post;
  },

  async edit(postId: string, userId: string, data: { title?: string; body?: string }) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');
    if (post.authorId !== userId) throw new Error('Not the author');

    const updateData: any = { ...data };
    if (post.status === 'APPROVED') {
      updateData.editedAfterApproval = true;
    }

    return prisma.post.update({ where: { id: postId }, data: updateData });
  },

  async delete(postId: string, userId: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');
    if (post.authorId !== userId) throw new Error('Not the author');

    await prisma.$transaction([
      prisma.post.delete({ where: { id: postId } }),
      prisma.channel.update({ where: { id: post.channelId }, data: { postCount: { decrement: 1 } } }),
    ]);
  },
};
