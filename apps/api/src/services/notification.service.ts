import { prisma } from '../config/database';
import { emailService } from './email.service';

type NotifType = 'REPLY_TO_POST' | 'REPLY_TO_COMMENT' | 'UPVOTE_ON_POST' | 'UPVOTE_ON_COMMENT' | 'POST_APPROVED' | 'POST_REJECTED' | 'ACCOUNT_SUSPENDED' | 'APPEAL_OUTCOME' | 'REFERRAL_CODE_USED' | 'REFERRED_USER_ACCEPTED' | 'WORLDCOIN_LAPSE_WARNING' | 'SYSTEM_ANNOUNCEMENT';

export const notificationService = {
  async create(userId: string, type: NotifType, title: string, body: string, data?: Record<string, unknown>) {
    // Check preferences
    const pref = await prisma.notificationPreference.findUnique({
      where: { userId_eventType: { userId, eventType: type } },
    });

    const sendInApp = pref?.inApp ?? true;
    const sendEmail = pref?.email ?? true;

    if (sendInApp) {
      await prisma.notification.create({
        data: { userId, type, title, body, data: data as any, emailSent: sendEmail },
      });
    }

    if (sendEmail) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, displayName: true } });
      if (user) {
        await emailService.sendNotification(user.email, user.displayName, title, body).catch(console.error);
      }
    }
  },

  async list(userId: string, cursor?: string, limit = 20) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = notifications.length > limit;
    const data = hasMore ? notifications.slice(0, limit) : notifications;
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  },

  async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  },

  async markRead(notificationId: string, userId: string) {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  },

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  async getPreferences(userId: string) {
    return prisma.notificationPreference.findMany({ where: { userId } });
  },

  async updatePreference(userId: string, eventType: string, inApp: boolean, email: boolean) {
    await prisma.notificationPreference.upsert({
      where: { userId_eventType: { userId, eventType: eventType as any } },
      create: { userId, eventType: eventType as any, inApp, email },
      update: { inApp, email },
    });
  },
};
