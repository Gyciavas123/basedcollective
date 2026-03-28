import { prisma } from '../config/database';
import { calculatePostScore } from '../utils/feedScoring';

export async function runFeedScoreRecalc() {
  const now = new Date();

  // Get feed config
  const [halfLifeConfig, multiplierConfig] = await Promise.all([
    prisma.platformConfig.findUnique({ where: { key: 'feed.timeDecayHalfLife' } }),
    prisma.platformConfig.findUnique({ where: { key: 'feed.posterMultiplier' } }),
  ]);

  const halfLife = (halfLifeConfig?.value as number) ?? 21600;
  const multipliers = (multiplierConfig?.value as number[]) ?? [1.0, 1.25, 1.5, 1.75, 2.0];

  // Recalculate scores for approved posts from the last 7 days
  const posts = await prisma.post.findMany({
    where: {
      status: 'APPROVED',
      approvedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    },
    include: {
      author: { select: { starRank: true } },
    },
  });

  for (const post of posts) {
    if (!post.approvedAt) continue;
    const newScore = calculatePostScore(
      post.upvoteCount,
      post.downvoteCount,
      post.replyCount,
      post.author.starRank,
      post.approvedAt,
      now,
      halfLife,
      multipliers
    );

    if (Math.abs(newScore - post.score) > 0.001) {
      await prisma.post.update({
        where: { id: post.id },
        data: { score: newScore },
      });
    }
  }

  console.log(`Recalculated scores for ${posts.length} posts`);
}
