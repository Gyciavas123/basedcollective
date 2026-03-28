import { prisma } from '../config/database';
import { notificationService } from '../services/notification.service';

export async function runWorldcoinLapseCheck() {
  // Find users whose Worldcoin verification has lapsed
  // In production, this would check against Worldcoin's API
  // For now, we check users who were notified 7+ days ago

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Suspend users who were warned 7+ days ago and still haven't re-verified
  const toSuspend = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      worldcoinLapseNotifiedAt: { lte: sevenDaysAgo },
    },
  });

  for (const user of toSuspend) {
    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'SUSPENDED' },
    });
    await notificationService.create(
      user.id,
      'WORLDCOIN_LAPSE_WARNING',
      'Account suspended',
      'Your account has been suspended due to lapsed Worldcoin verification. Please re-verify to restore access.'
    );
  }

  if (toSuspend.length > 0) {
    console.log(`Suspended ${toSuspend.length} users for Worldcoin lapse`);
  }
}
