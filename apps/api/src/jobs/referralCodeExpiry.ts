import { prisma } from '../config/database';
import { referralService } from '../services/referral.service';

export async function runReferralCodeExpiry() {
  // Delete expired unused codes
  const deleted = await prisma.referralCode.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
      usedById: null,
    },
  });

  console.log(`Cleaned up ${deleted.count} expired referral codes`);

  // Generate new codes for active users based on their rank
  const activeUsers = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, starRank: true },
  });

  const allocConfig = await prisma.platformConfig.findUnique({
    where: { key: 'reputation.referralAllocation' },
  });
  const allocation = (allocConfig?.value as number[]) ?? [1, 3, 7, 15, -1];

  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  for (const user of activeUsers) {
    const maxCodes = allocation[Math.min(user.starRank - 1, allocation.length - 1)];
    if (maxCodes === 0) continue;

    const existingCount = await prisma.referralCode.count({
      where: { ownerId: user.id, monthYear },
    });

    const toGenerate = maxCodes === -1 ? 0 : Math.max(0, maxCodes - existingCount);
    for (let i = 0; i < toGenerate; i++) {
      try {
        await referralService.generateCode(user.id);
      } catch {
        // Skip if limit reached
      }
    }
  }

  console.log('Monthly referral code refresh complete');
}
