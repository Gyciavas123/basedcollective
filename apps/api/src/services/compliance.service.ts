import { prisma } from '../config/database';

export const complianceService = {
  async requestExport(userId: string) {
    const existing = await prisma.dataRequest.findFirst({
      where: { userId, type: 'EXPORT', status: { in: ['PENDING', 'PROCESSING'] } },
    });
    if (existing) throw new Error('Export request already in progress');

    return prisma.dataRequest.create({
      data: { userId, type: 'EXPORT' },
    });
  },

  async requestDeletion(userId: string) {
    const existing = await prisma.dataRequest.findFirst({
      where: { userId, type: 'DELETION', status: { in: ['PENDING', 'PROCESSING'] } },
    });
    if (existing) throw new Error('Deletion request already in progress');

    return prisma.dataRequest.create({
      data: { userId, type: 'DELETION' },
    });
  },

  async getRequests(userId: string) {
    return prisma.dataRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async processExport(requestId: string) {
    const request = await prisma.dataRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== 'PENDING') return;

    await prisma.dataRequest.update({ where: { id: requestId }, data: { status: 'PROCESSING' } });

    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      include: {
        posts: true,
        replies: true,
        votesGiven: true,
        reputationEvents: true,
        notifications: true,
      },
    });

    // In production, upload to R2 and generate signed URL
    const downloadUrl = `/api/v1/compliance/download/${requestId}`;

    await prisma.dataRequest.update({
      where: { id: requestId },
      data: { status: 'COMPLETED', completedAt: new Date(), downloadUrl },
    });
  },

  async processDeletion(requestId: string) {
    const request = await prisma.dataRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== 'PENDING') return;

    await prisma.dataRequest.update({ where: { id: requestId }, data: { status: 'PROCESSING' } });

    // Anonymize user data
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        displayName: 'Deleted User',
        email: `deleted_${request.userId}@basedcollective.local`,
        passwordHash: null,
        avatar: null,
        bio: null,
        googleId: null,
        worldcoinHash: null, // Remove unless banned
        slug: `deleted-${request.userId}`,
        status: 'BANNED',
      },
    });

    // Delete sessions
    await prisma.session.deleteMany({ where: { userId: request.userId } });

    await prisma.dataRequest.update({
      where: { id: requestId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  },
};
