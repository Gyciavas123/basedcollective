export const DEFAULT_REPUTATION_WEIGHTS = {
  postUpvote: 4,
  postDownvote: -2,
  commentUpvote: 3,
  commentDownvote: -1,
  replyReceived: 2,
  lowEffortPost: -1,
  postRemovedByMod: -5,
  referralAccepted: 20,
} as const;

export const DEFAULT_REPUTATION_CAPS = {
  perPost: 60,
  perComment: 30,
  dailyGain: 150,
} as const;

export const DEFAULT_STAR_THRESHOLDS = [0, 100, 300, 700, 1500] as const;

export const DEFAULT_REFERRAL_ALLOCATION = [1, 3, 7, 15, -1] as const; // -1 = unlimited

export const STAR_RANK_LABELS = ['Newcomer', 'Contributor', 'Trusted', 'Veteran', 'Legend'] as const;

export const DEFAULT_FEED_CONFIG = {
  timeDecayHalfLife: 21600, // 6 hours in seconds
  posterMultiplier: [1.0, 1.25, 1.5, 1.75, 2.0],
  hotWindow: 21600, // 6 hours
  trendingRefreshInterval: 300, // 5 minutes
} as const;
