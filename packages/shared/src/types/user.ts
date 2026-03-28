export type UserStatus = 'PENDING_APPROVAL' | 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export interface PublicUser {
  id: string;
  displayName: string;
  slug: string;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  starRank: number;
  worldcoinVerifiedAt: string | null;
  createdAt: string;
}

export interface PrivateUser extends PublicUser {
  email: string;
  status: UserStatus;
  reputationScore: number;
  googleId: string | null;
}

export interface UserDashboard {
  user: PrivateUser;
  reputationBreakdown: {
    postUpvotes: number;
    commentUpvotes: number;
    repliesReceived: number;
    referrals: number;
    penalties: number;
  };
  referralCodes: ReferralCodeInfo[];
  todayGain: number;
  dailyCap: number;
}

export interface ReferralCodeInfo {
  id: string;
  code: string;
  usedBy: string | null;
  usedAt: string | null;
  expiresAt: string;
  createdAt: string;
}
