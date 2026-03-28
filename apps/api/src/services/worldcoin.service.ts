import { prisma } from '../config/database';
import { env } from '../config/env';

export const worldcoinService = {
  async verify(userId: string, proof: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.worldcoinVerifiedAt) throw new Error('Already verified');

    let worldcoinHash: string;

    if (env.WORLDCOIN_MOCK === 'true') {
      // Mock mode for development
      worldcoinHash = `mock_${userId}_${Date.now()}`;
    } else {
      // Real verification with World ID
      const response = await fetch('https://developer.worldcoin.org/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: env.WORLDCOIN_ACTION,
          signal: userId,
          ...proof,
        }),
      });

      if (!response.ok) throw new Error('Worldcoin verification failed');
      const result = await response.json() as { nullifier_hash: string };
      worldcoinHash = result.nullifier_hash;
    }

    // Check if hash is banned
    const banned = await prisma.bannedWorldcoinHash.findUnique({ where: { worldcoinHash } });
    if (banned) throw new Error('This identity has been banned');

    // Check uniqueness
    const existing = await prisma.user.findUnique({ where: { worldcoinHash } });
    if (existing) throw new Error('This identity is already registered');

    await prisma.user.update({
      where: { id: userId },
      data: {
        worldcoinHash,
        worldcoinVerifiedAt: new Date(),
        status: 'ACTIVE',
      },
    });

    return { verified: true };
  },

  async getStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { worldcoinVerifiedAt: true, status: true },
    });
    if (!user) throw new Error('User not found');
    return {
      verified: !!user.worldcoinVerifiedAt,
      verifiedAt: user.worldcoinVerifiedAt,
      status: user.status,
    };
  },
};
