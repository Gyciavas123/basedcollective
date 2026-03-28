import { prisma } from '../config/database';
import { reputationService } from '../services/reputation.service';

export async function runLowEffortPenalty() {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
  const posts = await prisma.post.findMany({
    where: {
      status: 'APPROVED',
      approvedAt: { lte: cutoff },
      upvoteCount: { lt: 2 },
      // Only check posts that haven't been penalized yet
      reputationContributed: { gte: 0 },
    },
    select: { id: true, authorId: true },
  });

  for (const post of posts) {
    await reputationService.addEvent(post.authorId, 'LOW_EFFORT_POST', -1, post.id);
    // Mark as penalized by setting negative contribution
    await prisma.post.update({
      where: { id: post.id },
      data: { reputationContributed: -1 },
    });
  }

  if (posts.length > 0) {
    console.log(`Low-effort penalty applied to ${posts.length} posts`);
  }
}
