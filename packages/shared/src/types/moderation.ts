export type ModActionType =
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_REJECTED'
  | 'POST_APPROVED'
  | 'POST_REJECTED'
  | 'POST_REMOVED'
  | 'REPLY_REMOVED'
  | 'CHANNEL_APPROVED'
  | 'CHANNEL_REJECTED'
  | 'CHANNEL_ARCHIVED'
  | 'USER_SUSPENDED'
  | 'USER_UNSUSPENDED'
  | 'USER_BANNED'
  | 'USER_UNBANNED'
  | 'ROLE_ASSIGNED'
  | 'ROLE_REVOKED'
  | 'APPEAL_APPROVED'
  | 'APPEAL_REJECTED';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AppealStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type DataRequestType = 'EXPORT' | 'DELETION';
export type DataRequestStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED';

export interface ApplicationItem {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  reasonForJoining: string;
  socialLinks: string | null;
  referralCode: string | null;
  status: ApplicationStatus;
  createdAt: string;
}

export interface ModerationLogItem {
  id: string;
  actionType: ModActionType;
  actor: { id: string; displayName: string };
  targetUser: { id: string; displayName: string } | null;
  reason: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AppealItem {
  id: string;
  user: { id: string; displayName: string };
  reason: string;
  status: AppealStatus;
  moderationLogId: string;
  createdAt: string;
}

export interface ModDashboardSummary {
  pendingApplications: number;
  pendingPosts: number;
  pendingChannels: number;
  openReports: number;
  pendingAppeals: number;
}
