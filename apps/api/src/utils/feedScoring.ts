/**
 * Feed scoring formula:
 * S = (Up - Down + (Replies × 0.5)) × PosterMultiplier × TimeDecay(t)
 *
 * TimeDecay(t) = 2^(-t/halfLife)  where t = seconds since post approval
 */

const DEFAULT_HALF_LIFE = 21600; // 6 hours in seconds
const DEFAULT_POSTER_MULTIPLIERS = [1.0, 1.25, 1.5, 1.75, 2.0];

export function calculatePostScore(
  upvotes: number,
  downvotes: number,
  replyCount: number,
  posterStarRank: number,
  approvedAt: Date,
  now: Date = new Date(),
  halfLife: number = DEFAULT_HALF_LIFE,
  posterMultipliers: number[] = DEFAULT_POSTER_MULTIPLIERS
): number {
  const rawScore = upvotes - downvotes + replyCount * 0.5;
  const multiplier = posterMultipliers[Math.min(posterStarRank - 1, posterMultipliers.length - 1)] ?? 1.0;
  const ageSeconds = (now.getTime() - approvedAt.getTime()) / 1000;
  const decay = Math.pow(2, -ageSeconds / halfLife);
  return rawScore * multiplier * decay;
}

export function calculateHotScore(
  upvotes: number,
  downvotes: number,
  replyCount: number,
  approvedAt: Date,
  now: Date = new Date(),
  hotWindow: number = DEFAULT_HALF_LIFE
): number {
  const ageSeconds = (now.getTime() - approvedAt.getTime()) / 1000;
  if (ageSeconds > hotWindow) return 0;
  const velocity = (upvotes - downvotes + replyCount * 0.5) / Math.max(ageSeconds / 3600, 0.1);
  return velocity;
}
