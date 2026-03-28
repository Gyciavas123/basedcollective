import { nanoid } from 'nanoid';
import { prisma } from '../config/database';

export const referralService = {
  async validateCode(code: string) {
    const referralCode = await prisma.referralCode.findUnique({ where: { code } });
    if (!referralCode) return { valid: false, reason: 'Code not found' };
    if (referralCode.usedById) return { valid: false, reason: 'Code already used' };
    if (referralCode.expiresAt < new Date()) return { valid: false, reason: 'Code expired' };
    return { valid: true };
  },

  async generateCode(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Check monthly allocation
    const allocConfig = await prisma.platformConfig.findUnique({ where: { key: 'reputation.referralAllocation' } });
    const allocation = (allocConfig?.value as number[]) ?? [1, 3, 7, 15, -1];
    const maxCodes = allocation[Math.min(user.starRank - 1, allocation.length - 1)];

    if (maxCodes !== -1) {
      const usedThisMonth = await prisma.referralCode.count({
        where: { ownerId: userId, monthYear },
      });
      if (usedThisMonth >= maxCodes) throw new Error('Monthly referral code limit reached');
    }

    const code = nanoid(10).toUpperCase();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    return prisma.referralCode.create({
      data: { code, ownerId: userId, expiresAt, monthYear },
    });
  },

  async getActiveCodes(userId: string) {
    return prisma.referralCode.findMany({
      where: { ownerId: userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async useCode(code: string, userId: string) {
    const referralCode = await prisma.referralCode.findUnique({ where: { code } });
    if (!referralCode || referralCode.usedById || referralCode.expiresAt < new Date()) {
      throw new Error('Invalid referral code');
    }

    await prisma.referralCode.update({
      where: { id: referralCode.id },
      data: { usedById: userId, usedAt: new Date() },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { referralCodeUsedId: referralCode.id },
    });

    return referralCode;
  },
};
